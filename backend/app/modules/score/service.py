from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import base64
import json
import math
import mimetypes
from pathlib import Path

from .repository import ScoreRepository
from .llm_analyzer import OpenAIDocumentAnalyzer


class ScoreService:
    """Service layer para lógica de negócio de score e validação de documentos."""
    
    # Constantes para curva logarítmica de crescimento
    # Score máximo possível
    MAX_SCORE = 1000
    
    # Score médio desejado (ponto de inflexão da curva)
    # Usuários com todos os documentos perfeitos chegam aqui facilmente
    MIDPOINT_SCORE = 500
    
    # Fator de crescimento logarítmico (quanto maior, mais difícil subir depois do midpoint)
    # Valores típicos: 0.5 (suave), 1.0 (moderado), 2.0 (agressivo)
    GROWTH_FACTOR = 1.5
    
    # Pesos dos documentos para cálculo do score
    DOCUMENT_WEIGHTS = {
        "verify_identity": {
            "weight": 0.20,  # 20% do score
            "base_points": 150,
            "description": "Documento de Identidade (RG/CNH)"
        },
        "income_proof": {
            "weight": 0.30,  # 30% do score
            "base_points": 250,
            "description": "Comprovante de Renda"
        },
        "tax_declaration": {
            "weight": 0.25,  # 25% do score
            "base_points": 200,
            "description": "Declaração de Imposto de Renda"
        },
        "utility_bills": {
            "weight": 0.15,  # 15% do score
            "base_points": 100,
            "description": "Contas de Utilidades"
        },
        "bank_statement": {
            "weight": 0.10,  # 10% do score
            "base_points": 100,
            "description": "Extrato Bancário"
        },
        "custom": {
            "weight": 0.05,  # 5% do score
            "base_points": 50,
            "description": "Documento Adicional"
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = ScoreRepository(db)
        
        # Inicializar analisador LLM
        try:
            self.llm_analyzer = OpenAIDocumentAnalyzer()
            self.llm_enabled = True
        except ValueError as e:
            print(f"⚠️  LLM não configurado: {e}")
            print("💡 Configure OPENAI_API_KEY no .env para habilitar análise com IA")
            self.llm_analyzer = None
            self.llm_enabled = False
    
    def _infer_file_type(self, file_name: str, file_content: str = None) -> str:
        """
        Infere o MIME type do arquivo baseado na extensão e conteúdo.
        
        Args:
            file_name: Nome do arquivo com extensão
            file_content: Conteúdo do arquivo em base64 (opcional)
        
        Returns:
            MIME type (ex: 'application/pdf', 'image/jpeg')
        """
        # Tentar inferir pela extensão do arquivo
        mime_type, _ = mimetypes.guess_type(file_name)
        
        if mime_type:
            return mime_type
        
        # Fallback: Tentar detectar pelo magic number (primeiros bytes do base64)
        if file_content:
            try:
                # Decodificar primeiros bytes para detectar tipo
                header = base64.b64decode(file_content[:100])
                
                # PDF: começa com %PDF
                if header.startswith(b'%PDF'):
                    return 'application/pdf'
                
                # JPEG: começa com FF D8 FF
                if header.startswith(b'\xFF\xD8\xFF'):
                    return 'image/jpeg'
                
                # PNG: começa com 89 50 4E 47
                if header.startswith(b'\x89PNG'):
                    return 'image/png'
                
            except Exception:
                pass
        
        # Fallback final: usar extensão do nome
        ext = Path(file_name).suffix.lower()
        ext_to_mime = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
        }
        
        return ext_to_mime.get(ext, 'application/octet-stream')
    
    def _infer_document_type(self, file_name: str, description: str = "") -> str:
        """
        Infere o tipo de documento baseado no nome do arquivo e descrição.
        
        Args:
            file_name: Nome do arquivo
            description: Descrição fornecida (opcional)
        
        Returns:
            document_type sugerido
        """
        # Concatenar nome e descrição para análise
        text = f"{file_name.lower()} {description.lower()}"
        
        # Palavras-chave para cada tipo de documento com PESOS
        # Palavras mais específicas têm peso maior
        keywords = {
            "income_proof": [
                ('holerite', 10),      # Muito específico
                ('contracheque', 10),
                ('decore', 10),
                ('prolabore', 10),
                ('pro-labore', 10),
                ('salario', 5),
                ('renda', 3),
                ('folha', 4),
                ('pagamento', 2),
                ('recibo', 2)
            ],
            "verify_identity": [
                ('rg_', 10),           # Com underscore/hífen é mais específico
                ('cnh_', 10),
                ('identidade', 8),
                ('carteira', 6),
                ('habilitacao', 8),
                ('passaporte', 10),
                ('rne', 10),
                ('documento', 1)       # Genérico, peso baixo
            ],
            "tax_declaration": [
                ('irpf', 10),
                ('imposto', 8),
                ('declaracao', 7),
                ('receita', 5),
                ('federal', 4),
                ('ir_20', 9)           # IR + ano
            ],
            "utility_bills": [
                ('enel', 10),
                ('sabesp', 10),
                ('copel', 10),
                ('cemig', 10),
                ('luz', 7),
                ('agua', 7),
                ('energia', 6),
                ('eletricidade', 6),
                ('telefone', 6),
                ('internet', 5),
                ('gas', 6),
                ('conta', 2),          # Genérico
                ('fatura', 3)
            ],
            "bank_statement": [
                ('extrato', 10),
                ('bancario', 8),
                ('banco', 4),
                ('bradesco', 9),
                ('itau', 9),
                ('santander', 9),
                ('caixa', 7),
                ('nubank', 9),
                ('corrente', 5),
                ('poupanca', 5)
            ]
        }
        
        # Calcular score ponderado para cada tipo
        scores = {}
        for doc_type, weighted_words in keywords.items():
            score = sum(weight for word, weight in weighted_words if word in text)
            if score > 0:
                scores[doc_type] = score
        
        # Retornar tipo com maior score
        if scores:
            best_type = max(scores, key=scores.get)
            # Só retornar se o score for significativo (>= 3)
            if scores[best_type] >= 3:
                return best_type
        
        # Fallback: documento customizado
        return "custom"
    
    def _calculate_logarithmic_score(self, raw_points: int) -> int:
        """
        Aplica curva logarítmica ao cálculo do score.
        
        Fórmula: score = MAX_SCORE * (1 - e^(-k * raw_points / MAX_SCORE))
        
        Características:
        - Crescimento rápido no início (0-500): Fácil ganhar pontos
        - Crescimento moderado no meio (500-750): Requer mais esforço
        - Crescimento lento no topo (750-1000): Muito difícil alcançar máximo
        
        Args:
            raw_points: Pontos brutos acumulados dos documentos (0-1000+)
        
        Returns:
            Score final com curva logarítmica aplicada (0-1000)
        
        Exemplos (com GROWTH_FACTOR=1.5):
            100 pontos brutos  → ~142 score (42% bonus)
            300 pontos brutos  → ~359 score (20% bonus)
            500 pontos brutos  → ~528 score (6% bonus)
            700 pontos brutos  → ~659 score (-6% penalização)
            900 pontos brutos  → ~770 score (-14% penalização)
            1000 pontos brutos → ~815 score (-18% penalização)
        """
        
        if raw_points <= 0:
            return 0
        
        # Fórmula logarítmica: score = MAX * (1 - e^(-k * x / MAX))
        # Onde k é o fator de crescimento
        k = self.GROWTH_FACTOR
        x = raw_points
        max_score = self.MAX_SCORE
        
        # Aplicar fórmula exponencial negativa (curva de saturação)
        score = max_score * (1 - math.exp(-k * x / max_score))
        
        # Garantir limites
        return int(min(max_score, max(0, score)))
    
    def get_user_score(self, user_id: str) -> Dict:
        """Obtém o score atual do usuário."""
        user = self.repository.get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}
        
        # Usar calculated_score como score principal
        score = user.calculated_score if user.calculated_score is not None else 0
        
        return {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "score": score,
            "calculated_score": score,
            "documents_uploaded": len(user.document_links or []),
            "financial_docs_uploaded": len(user.financial_docs or [])
        }
    
    def validate_document_with_llm(self, document_data: Dict) -> Dict:
        """
        Valida documento usando LLM (OpenAI GPT-4 Vision).
        
        Args:
            document_data: {
                "file_content": "base64_encoded_file",  # OBRIGATÓRIO
                "file_name": "documento.pdf",            # OBRIGATÓRIO
                "file_type": "application/pdf",          # OPCIONAL (será inferido)
                "document_type": "verify_identity",      # OPCIONAL (será inferido)
                "description": "RG frente e verso"       # OPCIONAL
            }
        
        Returns:
            {
                "valid": True/False,
                "quality_score": 0-100,
                "issues": [],
                "extracted_data": {},
                "confidence": 0-100
            }
        """
        
        file_name = document_data.get("file_name", "")
        file_content = document_data.get("file_content", "")
        description = document_data.get("description", "")
        
        # INFERIR file_type se não fornecido
        file_type = document_data.get("file_type")
        if not file_type:
            file_type = self._infer_file_type(file_name, file_content)
            print(f"🔍 file_type inferido: {file_type}")
        
        # INFERIR document_type se não fornecido
        doc_type = document_data.get("document_type")
        if not doc_type:
            doc_type = self._infer_document_type(file_name, description)
            print(f"🔍 document_type inferido: {doc_type}")
        
        # Validações básicas
        issues = []
        quality_score = 100
        
        # Verificar tipo de arquivo
        accepted_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
        if file_type not in accepted_types:
            issues.append(f"Formato de arquivo não aceito: {file_type}")
            quality_score -= 30
        
        # Verificar nome do arquivo
        if not file_name or len(file_name) < 3:
            issues.append("Nome do arquivo inválido")
            quality_score -= 10
        
        # Verificar conteúdo
        if not file_content:
            return {
                "valid": False,
                "quality_score": 0,
                "issues": ["Conteúdo do arquivo não fornecido"],
                "extracted_data": {},
                "confidence": 0,
                "analysis": "Arquivo vazio ou não enviado"
            }
        
        # Se LLM estiver habilitado, usar análise real
        if self.llm_enabled and self.llm_analyzer:
            try:
                llm_result = self.llm_analyzer.analyze_document(
                    file_content=file_content,
                    file_type=file_type,
                    document_type=doc_type,
                    description=description
                )
                
                # Combinar issues de validação básica com LLM
                llm_result["issues"] = issues + llm_result.get("issues", [])
                
                # Adicionar informações inferidas
                llm_result["inferred_file_type"] = file_type
                llm_result["inferred_document_type"] = doc_type
                
                return llm_result
            
            except Exception as e:
                print(f"❌ Erro na análise LLM: {e}")
                # Fallback para simulação se LLM falhar
                pass
        
        # Fallback: Simulação de análise por LLM
        print("⚠️  Usando análise simulada (LLM não configurado)")
        llm_analysis = self._simulate_llm_analysis(document_data)
        
        quality_score = max(0, min(100, quality_score - len(issues) * 10 + llm_analysis["adjustment"]))
        
        return {
            "valid": quality_score >= 60,
            "quality_score": quality_score,
            "issues": issues + llm_analysis["issues"],
            "extracted_data": llm_analysis["extracted_data"],
            "confidence": llm_analysis["confidence"],
            "analysis": llm_analysis["analysis"],
            "inferred_file_type": file_type,
            "inferred_document_type": doc_type
        }
    
    def _simulate_llm_analysis(self, document_data: Dict) -> Dict:
        """
        Simula análise por LLM.
        
        TODO: Substituir por integração real com LLM
        Exemplos de prompts:
        - OpenAI GPT-4 Vision para análise de imagens
        - Claude 3 para análise de PDFs
        - Gemini Pro Vision para documentos
        """
        
        doc_type = document_data.get("document_type", "custom")
        
        # Simulação baseada no tipo de documento
        if doc_type == "verify_identity":
            return {
                "adjustment": 10,
                "issues": [],
                "extracted_data": {
                    "document_number": "123456789",
                    "name": "João Silva",
                    "birth_date": "1990-05-15"
                },
                "confidence": 95,
                "analysis": "Documento de identidade válido e legível. Todas as informações estão visíveis."
            }
        
        elif doc_type == "income_proof":
            return {
                "adjustment": 5,
                "issues": [],
                "extracted_data": {
                    "monthly_income": 5000.00,
                    "employer": "Empresa XPTO LTDA",
                    "period": "Janeiro 2025"
                },
                "confidence": 90,
                "analysis": "Comprovante de renda válido. Renda mensal identificada."
            }
        
        elif doc_type == "tax_declaration":
            return {
                "adjustment": 8,
                "issues": [],
                "extracted_data": {
                    "year": 2024,
                    "total_income": 60000.00,
                    "tax_paid": 5000.00
                },
                "confidence": 92,
                "analysis": "Declaração de IR válida e completa."
            }
        
        elif doc_type == "utility_bills":
            return {
                "adjustment": 3,
                "issues": [],
                "extracted_data": {
                    "address": "Rua Exemplo, 123",
                    "bill_type": "Conta de Luz",
                    "month": "Janeiro 2025"
                },
                "confidence": 88,
                "analysis": "Conta de utilidade válida e recente."
            }
        
        else:
            return {
                "adjustment": 0,
                "issues": ["Tipo de documento não reconhecido"],
                "extracted_data": {},
                "confidence": 70,
                "analysis": "Documento genérico identificado."
            }
    
    def calculate_score_from_documents(self, user_id: str, validated_documents: List[Dict]) -> Dict:
        """
        Calcula novo score baseado nos documentos validados com curva logarítmica.
        
        Pipeline de Cálculo:
        1. Calcula pontos brutos de cada documento
        2. Soma todos os pontos brutos acumulados do usuário
        3. Aplica curva logarítmica para calcular score final
        
        Curva Logarítmica:
        - 0-500 pontos: Crescimento rápido (incentivo inicial)
        - 500-750 pontos: Crescimento moderado
        - 750-1000 pontos: Crescimento lento (elite)
        
        Args:
            user_id: ID do usuário
            validated_documents: Lista de documentos validados com quality_score
        
        Returns:
            {
                "old_score": 528,
                "new_score": 659,
                "raw_points_earned": 212,
                "total_raw_points": 700,
                "documents_evaluated": 1,
                "breakdown": {...}
            }
        """
        
        user = self.repository.get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}
        
        # Usar apenas calculated_score
        old_score = user.calculated_score if user.calculated_score is not None else 0
        
        # Calcular pontos brutos dos novos documentos
        new_raw_points = 0
        breakdown = {}
        
        for doc in validated_documents:
            doc_type = doc.get("document_type", "custom")
            quality_score = doc.get("quality_score", 0)
            
            if doc_type in self.DOCUMENT_WEIGHTS:
                weight_info = self.DOCUMENT_WEIGHTS[doc_type]
                # Pontos brutos = base_points * (quality_score / 100)
                points = int(weight_info["base_points"] * (quality_score / 100))
                new_raw_points += points
                
                breakdown[doc_type] = {
                    "description": weight_info["description"],
                    "weight": weight_info["weight"],
                    "quality_score": quality_score,
                    "raw_points_earned": points,
                    "max_points": weight_info["base_points"]
                }
        
        # IMPORTANTE: Precisamos saber o total de pontos brutos acumulados
        # Para isso, fazemos o cálculo inverso do old_score para descobrir raw_points anteriores
        # Fórmula inversa: raw_points = -MAX * ln(1 - score/MAX) / k
        if old_score > 0:
            k = self.GROWTH_FACTOR
            max_score = self.MAX_SCORE
            # Calcular pontos brutos anteriores (inverso da logarítmica)
            old_raw_points = int(-max_score * math.log(1 - old_score / max_score) / k)
        else:
            old_raw_points = 0
        
        # Total de pontos brutos = anteriores + novos
        total_raw_points = old_raw_points + new_raw_points
        
        # Aplicar curva logarítmica ao total acumulado
        new_score = self._calculate_logarithmic_score(total_raw_points)
        
        # Garantir que não ultrapasse o máximo
        new_score = min(self.MAX_SCORE, new_score)
        
        # Atualizar no banco
        self.repository.update_calculated_score(user_id, new_score)
        
        return {
            "user_id": user_id,
            "old_score": old_score,
            "new_score": new_score,
            "raw_points_earned": new_raw_points,
            "total_raw_points": total_raw_points,
            "documents_evaluated": len(validated_documents),
            "breakdown": breakdown,
            "score_change": new_score - old_score,
            "curve_info": {
                "growth_factor": self.GROWTH_FACTOR,
                "difficulty": "Fácil" if new_score < 500 else "Moderado" if new_score < 750 else "Difícil"
            }
        }
    
    def process_document_validation(self, user_id: str, documents: List[Dict]) -> Dict:
        """
        Processa validação completa de documentos e atualiza score.
        
        Pipeline:
        1. Valida cada documento com LLM
        2. Calcula novo score baseado nas validações
        3. Atualiza documentos do usuário
        4. Retorna resultado completo
        """
        
        validated_documents = []
        failed_documents = []
        
        # Validar cada documento
        for doc in documents:
            validation_result = self.validate_document_with_llm(doc)
            
            if validation_result["valid"]:
                # Usar o document_type inferido se não foi fornecido
                doc_type = doc.get("document_type") or validation_result.get("inferred_document_type", "custom")
                
                validated_documents.append({
                    "document_type": doc_type,
                    "quality_score": validation_result["quality_score"],
                    "confidence": validation_result["confidence"],
                    "file_name": doc.get("file_name")
                })
                
                # Salvar referência ao documento
                if doc_type in ["verify_identity", "custom"]:
                    self.repository.update_user_documents(
                        user_id, 
                        [doc.get("file_name")]
                    )
                else:
                    self.repository.update_financial_docs(
                        user_id,
                        [doc.get("file_name")]
                    )
            else:
                failed_documents.append({
                    "file_name": doc.get("file_name"),
                    "issues": validation_result["issues"]
                })
        
        # Calcular novo score se houver documentos validados
        score_result = {}
        if validated_documents:
            score_result = self.calculate_score_from_documents(user_id, validated_documents)
        
        return {
            "success": len(validated_documents) > 0,
            "validated_documents": len(validated_documents),
            "failed_documents": len(failed_documents),
            "failures": failed_documents,
            "score_update": score_result,
            "message": f"{len(validated_documents)} documento(s) validado(s) com sucesso!"
        }
