"""
Integração com OpenAI GPT-4 Vision para análise de documentos.
"""

from typing import Dict, List, Optional
import base64
import io
from PIL import Image
from openai import OpenAI
from app.core.config import settings


class OpenAIDocumentAnalyzer:
    """Classe para análise de documentos usando OpenAI GPT-4 Vision."""
    
    def __init__(self):
        """Inicializa o cliente OpenAI."""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY não configurada no .env")
        
        # Inicializar cliente OpenAI
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=60.0,  # Aumentado para 60s
            max_retries=2
        )
        self.model_vision = settings.OPENAI_MODEL_VISION  # gpt-4o para imagens
        self.model_text = settings.OPENAI_MODEL_TEXT      # gpt-4o-mini para texto
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        
        print(f"🤖 OpenAI configurado:")
        print(f"   • Modelo Visão (imagens): {self.model_vision}")
        print(f"   • Modelo Texto (PDFs): {self.model_text}")
        print(f"   • Max Tokens: {self.max_tokens}")
    
    def analyze_document(
        self, 
        file_content: str, 
        file_type: str, 
        document_type: str,
        description: str = ""
    ) -> Dict:
        """
        Analisa um documento usando GPT-4 Vision.
        
        Args:
            file_content: Conteúdo do arquivo em base64
            file_type: Tipo MIME do arquivo (image/jpeg, application/pdf, etc.)
            document_type: Tipo de documento (verify_identity, income_proof, etc.)
            description: Descrição adicional do documento
        
        Returns:
            Dict com resultado da análise
        """
        
        # Preparar prompt baseado no tipo de documento
        prompt = self._get_prompt_for_document_type(document_type, description)
        
        try:
            # Para imagens, usar GPT-4 Vision
            if file_type.startswith("image/"):
                return self._analyze_image(file_content, prompt, document_type)
            
            # Para PDFs, extrair texto e analisar
            elif file_type == "application/pdf":
                return self._analyze_pdf(file_content, prompt, document_type)
            
            else:
                return {
                    "valid": False,
                    "quality_score": 0,
                    "issues": ["Tipo de arquivo não suportado"],
                    "confidence": 0,
                    "analysis": "Formato não suportado para análise"
                }
        
        except Exception as e:
            return {
                "valid": False,
                "quality_score": 0,
                "issues": [f"Erro na análise: {str(e)}"],
                "confidence": 0,
                "analysis": "Erro ao processar documento"
            }
    
    def _analyze_image(self, base64_content: str, prompt: str, doc_type: str) -> Dict:
        """Analisa imagem usando GPT-4 Vision."""
        
        try:
            # Preparar mensagem com imagem
            messages = [
                {
                    "role": "system",
                    "content": """Você é um especialista em análise e validação de documentos financeiros e de identidade.
Sua função é avaliar a qualidade, autenticidade e legibilidade de documentos enviados.
Responda SEMPRE em JSON válido com o formato especificado."""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_content}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ]
            
            # Chamar API da OpenAI com modelo de visão (gpt-4o)
            print(f"📸 Analisando imagem com {self.model_vision}...")
            response = self.client.chat.completions.create(
                model=self.model_vision,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=0.2,  # Baixa temperatura para respostas mais consistentes
                response_format={"type": "json_object"}
            )
            
            # Processar resposta
            import json
            result = json.loads(response.choices[0].message.content)
            
            # Normalizar resultado
            return self._normalize_llm_response(result, doc_type)
        
        except Exception as e:
            print(f"Erro ao analisar imagem: {e}")
            return {
                "valid": False,
                "quality_score": 0,
                "issues": [f"Erro na análise: {str(e)}"],
                "confidence": 0,
                "analysis": "Erro ao processar imagem",
                "extracted_data": {}
            }
    
    def _analyze_pdf(self, base64_content: str, prompt: str, doc_type: str) -> Dict:
        """
        Analisa PDF extraindo texto e enviando para GPT-4.
        """
        
        try:
            from PyPDF2 import PdfReader
            import io
            
            # Decodificar PDF
            print(f"📄 Extraindo texto do PDF...")
            pdf_bytes = base64.b64decode(base64_content)
            pdf_file = io.BytesIO(pdf_bytes)
            
            # Extrair texto de todas as páginas
            reader = PdfReader(pdf_file)
            text = ""
            
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                text += f"\n--- Página {i+1} ---\n{page_text}"
            
            if not text.strip():
                print("⚠️  Nenhum texto extraído do PDF")
                return {
                    "valid": False,
                    "quality_score": 0,
                    "issues": ["PDF não contém texto legível ou é apenas imagem"],
                    "confidence": 100,
                    "analysis": "PDF sem texto extraível. Se for imagem escaneada, salve como JPG.",
                    "extracted_data": {}
                }
            
            print(f"✅ Texto extraído: {len(text)} caracteres de {len(reader.pages)} página(s)")
            
            # Limitar tamanho do texto (primeiros 8000 chars para não estourar tokens)
            if len(text) > 8000:
                text = text[:8000] + "\n\n[... texto truncado ...]"
            
            # Preparar mensagens com texto extraído
            messages = [
                {
                    "role": "system",
                    "content": """Você é um analista de crédito experiente e RIGOROSO.
Analise o texto extraído deste documento PDF e retorne um JSON válido com a validação."""
                },
                {
                    "role": "user",
                    "content": f"""{prompt}

TEXTO EXTRAÍDO DO PDF:
{text}

Analise RIGOROSAMENTE o texto acima e retorne o JSON conforme especificado."""
                }
            ]
            
            # Chamar API com modelo de texto (gpt-4o-mini)
            print(f"📝 Analisando texto com {self.model_text}...")
            response = self.client.chat.completions.create(
                model=self.model_text,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            
            return self._normalize_llm_response(result, doc_type)
        
        except ImportError:
            print("❌ PyPDF2 não instalado")
            return {
                "valid": False,
                "quality_score": 0,
                "issues": ["PyPDF2 não instalado - não é possível processar PDFs"],
                "confidence": 100,
                "analysis": "Biblioteca PyPDF2 não encontrada. Execute: pip install pypdf2",
                "extracted_data": {}
            }
        except Exception as e:
            print(f"❌ Erro ao analisar PDF: {e}")
            import traceback
            traceback.print_exc()
            return {
                "valid": False,
                "quality_score": 0,
                "issues": [f"Erro ao processar PDF: {str(e)}"],
                "confidence": 0,
                "analysis": f"Erro técnico ao processar PDF: {str(e)}",
                "extracted_data": {}
            }
    
    def _get_prompt_for_document_type(self, document_type: str, description: str) -> str:
        """Gera prompt específico para cada tipo de documento."""
        
        base_instruction = f"""Você é um analista de crédito experiente e RIGOROSO. Analise este documento com CRITÉRIO CRÍTICO.

⚠️ IMPORTANTE: 
- Seja EXTREMAMENTE rigoroso na validação
- NÃO aceite documentos que não sejam EXATAMENTE do tipo solicitado
- Se não for o documento correto, retorne valid=false e quality_score=0
- Documentos irrelevantes devem receber nota ZERO

Retorne um JSON com os seguintes campos:
{{
    "valid": true/false,
    "quality_score": 0-100,
    "issues": ["lista DETALHADA de problemas"],
    "confidence": 0-100,
    "analysis": "análise crítica e detalhada",
    "extracted_data": {{"dados extraídos"}}
}}

Tipo de documento ESPERADO: {document_type}
Descrição: {description}

"""
        
        if document_type == "verify_identity":
            return base_instruction + """
📋 DOCUMENTO ESPERADO: RG, CNH, RNE ou Passaporte brasileiro

✅ CRITÉRIOS OBRIGATÓRIOS (TODOS devem estar presentes):
1. ✓ Deve ser documento de identidade oficial brasileiro
2. ✓ Deve ter foto do titular visível e nítida
3. ✓ Deve ter número do documento claramente legível
4. ✓ Deve ter nome completo do titular
5. ✓ Deve ter data de nascimento
6. ✓ Deve ter órgão emissor (SSP, DETRAN, etc)
7. ✓ Deve ter data de emissão
8. ✓ Documento não pode estar vencido (CNH)

❌ REJEITAR AUTOMATICAMENTE (valid=false, score=0):
- Documentos que NÃO são RG/CNH/RNE
- Passaportes estrangeiros
- Carteiras profissionais (OAB, CRM, etc)
- Cartões de crédito/débito
- Documentos escolares/universitários
- Fotos de pessoas sem documento oficial
- Documentos cortados ou parciais
- Documentos muito antigos ou deteriorados
- Cópias de má qualidade que impedem leitura

⚠️ PENALIZAÇÕES NO SCORE:
- Foto desfocada: -20 pontos
- Campos ilegíveis: -30 pontos
- Iluminação ruim: -15 pontos
- Documento parcialmente visível: -40 pontos
- Sinais de edição/adulteração: valid=false, score=0

📊 PONTUAÇÃO RIGOROSA:
- 95-100: Documento PERFEITO (raro!) - foto HD, todos os campos cristalinos
- 85-94: Excelente qualidade - mínimos problemas
- 70-84: Boa qualidade - alguns campos não perfeitos
- 50-69: Qualidade aceitável - vários problemas mas identificável
- 30-49: Qualidade ruim - difícil identificação
- 0-29: Inválido/ilegível/documento errado

🔍 EXTRAIR (se válido):
- document_type: "RG" | "CNH" | "RNE"
- document_number: "XX.XXX.XXX-X"
- full_name: "Nome completo"
- birth_date: "DD/MM/AAAA"
- issuer: "SSP-UF" ou "DETRAN-UF"
- issue_date: "DD/MM/AAAA"
"""
        
        elif document_type == "income_proof":
            return base_instruction + """
📋 DOCUMENTO ESPERADO: Holerite, Contracheque, DECORE (contador), Pró-labore, DRE (empresa)

✅ CRITÉRIOS OBRIGATÓRIOS (TODOS devem estar presentes):
1. ✓ Deve ser comprovante de renda OFICIAL
2. ✓ Deve ter valor de renda claramente identificável (salário bruto/líquido)
3. ✓ Deve ter nome do empregador ou fonte pagadora (pode estar no cabeçalho)
4. ✓ Deve ter nome do beneficiário/empregado
5. ✓ Deve ter data/período de referência (mês/ano)
6. ✓ Para holerite: deve ter descontos típicos (INSS, IR, etc)
7. ✓ Para DECORE: deve ter carimbo e assinatura de contador com CRC
8. ✓ Documento deve ter estrutura típica de folha de pagamento

❌ REJEITAR AUTOMATICAMENTE (valid=false, score=0):
- Documentos que NÃO são comprovantes de renda
- Extratos bancários simples (sem identificação de salário)
- Notas fiscais de produtos/serviços
- Notas técnicas, documentos administrativos, artigos
- Print de tela de apps/sites sem validação oficial
- Comprovantes estrangeiros
- Documentos sem valor de renda identificável
- Documentos claramente irrelevantes para análise de renda

⚠️ PENALIZAÇÕES NO SCORE:
- Valores parcialmente ilegíveis: -30 pontos
- Falta carimbo/assinatura (DECORE): -40 pontos
- Qualidade de imagem ruim: -20 pontos
- Documento cortado ou parcial: -25 pontos
- Formatação não profissional: -15 pontos

📊 PONTUAÇÃO RIGOROSA:
- 95-100: Holerite perfeito, todos os campos visíveis e legíveis
- 85-94: Comprovante oficial completo e claro
- 70-84: Comprovante válido mas com pequenas falhas de qualidade
- 50-69: Comprovante com problemas significativos mas identificável
- 30-49: Comprovante duvidoso ou muito problemático
- 0-29: Não é comprovante válido ou ilegível

⚠️ IMPORTANTE SOBRE DATAS:
- NÃO rejeite apenas pela data se o documento for claramente um holerite válido
- A data deve ser usada apenas para avaliar a ATUALIDADE, não a validade
- Um holerite legítimo com todos os campos é válido independente da data
- Penalize pela antiguidade, mas NÃO rejeite automaticamente

🔍 EXTRAIR (se válido):
- document_type: "Holerite" | "DECORE" | "Pró-labore" | "DRE"
- monthly_income: valor numérico (R$)
- annual_income: valor numérico (R$) se disponível
- employer: "Nome da empresa/empregador"
- employee_name: "Nome do beneficiário"
- reference_period: "MM/AAAA"
- issue_date: "DD/MM/AAAA"
- gross_income: valor bruto
- net_income: valor líquido
"""
        
        elif document_type == "tax_declaration":
            return base_instruction + """
📋 DOCUMENTO ESPERADO: Declaração de Imposto de Renda (DIRPF) - Recibo de entrega da Receita Federal

✅ CRITÉRIOS OBRIGATÓRIOS (TODOS devem estar presentes):
1. ✓ Deve ser recibo oficial da Receita Federal do Brasil
2. ✓ Deve ter número do recibo de entrega
3. ✓ Deve ter CPF do declarante
4. ✓ Deve ter nome completo do declarante
5. ✓ Deve ter ano-calendário da declaração
6. ✓ Deve ter data de entrega
7. ✓ Deve ser dos ÚLTIMOS 2 ANOS (ano atual ou anterior)
8. ✓ Deve ter resumo de rendimentos tributáveis

❌ REJEITAR AUTOMATICAMENTE (valid=false, score=0):
- Documentos que NÃO são declaração de IR oficial
- Comprovantes de situação cadastral CPF (não é declaração)
- Extratos de IRRF retido na fonte
- Declarações com mais de 2 anos
- Prints de tela sem recibo oficial
- Declarações em processamento (sem recibo)
- Declarações estrangeiras
- Rascunhos ou declarações não enviadas

⚠️ PENALIZAÇÕES NO SCORE:
- Declaração do ano anterior: -10 pontos
- Declaração de 2 anos atrás: -30 pontos
- Campos importantes ilegíveis: -40 pontos
- Sem número de recibo visível: -50 pontos
- Documento cortado/incompleto: -60 pontos

📊 PONTUAÇÃO RIGOROSA:
- 95-100: Declaração do ano atual, completa, recibo legível
- 85-94: Declaração recente e bem documentada
- 70-84: Declaração válida do ano anterior
- 50-69: Declaração de 2 anos com dados visíveis
- 30-49: Declaração muito antiga ou incompleta
- 0-29: Não é declaração válida

🔍 EXTRAIR (se válido):
- document_type: "DIRPF"
- tax_year: ano-calendário (ex: 2024)
- receipt_number: número do recibo
- cpf: "XXX.XXX.XXX-XX"
- taxpayer_name: "Nome completo"
- submission_date: "DD/MM/AAAA"
- total_income: valor total de rendimentos
- tax_paid: imposto pago/restituído
"""
        
        elif document_type == "utility_bills":
            return base_instruction + """
📋 DOCUMENTO ESPERADO: Conta de Luz, Água, Gás, Telefone fixo/internet (utilidades públicas)

✅ CRITÉRIOS OBRIGATÓRIOS (TODOS devem estar presentes):
1. ✓ Deve ser conta de serviço público/utilidade
2. ✓ Deve ter nome da concessionária (ex: ENEL, SABESP, Oi)
3. ✓ Deve ter endereço completo de instalação
4. ✓ Deve ter nome do titular da conta
5. ✓ Deve ter data de vencimento
6. ✓ Deve ter valor a pagar
7. ✓ Deve ter número de instalação/matrícula

❌ REJEITAR AUTOMATICAMENTE (valid=false, score=0):
- Documentos que NÃO são contas de utilidades
- Boletos de outros serviços (cartão, empréstimos, etc)
- Contas de celular pré-pago (não serve como comprovante)
- Contas em nome de terceiros sem vínculo
- Prints de segunda via sem dados completos
- Faturas de TV por assinatura/streaming

⚠️ PENALIZAÇÕES NO SCORE:
- Conta mais antiga: -10 a -20 pontos conforme idade
- Endereço parcialmente visível: -30 pontos
- Nome do titular ilegível: -40 pontos
- Conta em nome de terceiro: valid=false, score=0
- Sem data de vencimento clara: -20 pontos

📊 PONTUAÇÃO RIGOROSA:
- 95-100: Conta recente, todos os dados legíveis
- 85-94: Conta completa e clara
- 70-84: Conta válida com pequenas falhas
- 50-69: Conta mais antiga ou campos ilegíveis
- 30-49: Conta com dados incompletos
- 0-29: Não é conta válida de utilidade

🔍 EXTRAIR (se válido):
- utility_type: "Luz" | "Água" | "Gás" | "Telefone/Internet"
- provider: "Nome da concessionária"
- holder_name: "Nome do titular"
- address: "Endereço completo de instalação"
- reference_month: "MM/AAAA"
- due_date: "DD/MM/AAAA"
- amount: valor numérico (R$)
- installation_number: "Número da instalação"
"""
        
        elif document_type == "bank_statement":
            return base_instruction + """
📋 DOCUMENTO ESPERADO: Extrato Bancário oficial

✅ CRITÉRIOS OBRIGATÓRIOS (TODOS devem estar presentes):
1. ✓ Deve ser extrato bancário oficial de instituição financeira
2. ✓ Deve ter logo/nome do banco
3. ✓ Deve ter nome do titular da conta
4. ✓ Deve ter número da agência e conta
5. ✓ Deve ter período do extrato
6. ✓ Deve ter movimentações financeiras (entrada/saída)
7. ✓ Deve ter saldo inicial e final

❌ REJEITAR AUTOMATICAMENTE (valid=false, score=0):
- Prints de apps sem validação oficial
- Extratos de contas inativas
- Documentos sem identificação do banco
- Extratos sem movimentações
- Extratos de terceiros

⚠️ PENALIZAÇÕES NO SCORE:
- Extrato mais antigo: -10 a -20 pontos
- Sem movimentações relevantes: -30 pontos
- Dados parcialmente visíveis: -40 pontos
- Sem logo do banco: -20 pontos

📊 PONTUAÇÃO RIGOROSA:
- 95-100: Extrato oficial com movimentações claras
- 85-94: Extrato completo e legível
- 70-84: Extrato válido com pequenas falhas
- 50-69: Extrato mais antigo ou incompleto
- 0-29: Não é extrato válido

🔍 EXTRAIR (se válido):
- bank_name: "Nome do banco"
- holder_name: "Nome do titular"
- account_number: "Agência-Conta"
- period_start: "DD/MM/AAAA"
- period_end: "DD/MM/AAAA"
- opening_balance: valor inicial
- closing_balance: valor final
"""
        
        else:  # custom
            return base_instruction + """
📋 DOCUMENTO ADICIONAL/COMPLEMENTAR

⚠️ ATENÇÃO: Este tipo aceita documentos complementares, mas ainda assim devem ser RELEVANTES para análise de crédito.

✅ ACEITAR SE:
- Contrato de trabalho assinado
- Comprovante de vínculos profissionais
- Certidões negativas (dívidas, protestos)
- Comprovantes de patrimônio
- Documentos societários (empresa)

❌ REJEITAR (valid=false, score=0):
- Documentos completamente irrelevantes (notas técnicas, artigos, manuais)
- Documentos pessoais sem relação com crédito
- Fotos aleatórias
- Documentos de terceiros não relacionados
- Arquivos corrompidos ou ilegíveis

📊 PONTUAÇÃO RIGOROSA:
- 90-100: Documento complementar muito relevante
- 70-89: Documento útil para análise
- 50-69: Documento com relevância limitada
- 30-49: Documento de baixa relevância
- 0-29: Documento irrelevante ou inválido

🔍 EXTRAIR:
- document_description: descrição do que é
- relevance: "Alta" | "Média" | "Baixa"
- key_information: informações principais
"""
    
    def _normalize_llm_response(self, llm_result: Dict, doc_type: str) -> Dict:
        """Normaliza a resposta do LLM para o formato esperado."""
        
        return {
            "valid": llm_result.get("valid", False),
            "quality_score": max(0, min(100, llm_result.get("quality_score", 0))),
            "issues": llm_result.get("issues", []),
            "confidence": max(0, min(100, llm_result.get("confidence", 0))),
            "analysis": llm_result.get("analysis", ""),
            "extracted_data": llm_result.get("extracted_data", {})
        }
