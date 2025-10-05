from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict
from datetime import datetime
import uuid
import logging

from .repository import PIXRepository
from app.modules.wallet.repository import WalletRepository
from app.models.models import (
    Transaction, TransactionType, TransactionStatus,
    Currency, OwnerType, User
)

logger = logging.getLogger(__name__)


class PIXService:
    """Service layer para lógica de negócio de PIX."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = PIXRepository(db)
        self.wallet_repository = WalletRepository(db)
    
    def send_pix(self, data: dict) -> dict:
        """
        Envia PIX de um usuário para outro.
        
        Args:
            data: Dicionário contendo:
                - pixCode: Código PIX ou ID do destinatário (QR Code lido)
                - amount: Valor a ser enviado
                - userId: ID do usuário remetente
        
        Returns:
            Dicionário com detalhes da transação
        """
        pix_code = data.get('pixCode')
        amount = data.get('amount')
        sender_id = data.get('userId')
        
        # Validações
        if not all([pix_code, amount, sender_id]):
            raise HTTPException(
                status_code=400,
                detail="Campos obrigatórios: pixCode, amount, userId"
            )
        
        if amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="O valor deve ser maior que zero"
            )
        
        # Buscar remetente (pode ser USER ou INVESTOR)
        from app.models.models import Investor
        
        sender_user = self.db.query(User).filter(User.user_id == sender_id).first()
        sender_investor = self.db.query(Investor).filter(Investor.investor_id == sender_id).first()
        
        if not sender_user and not sender_investor:
            raise HTTPException(
                status_code=404,
                detail="Remetente não encontrado"
            )
        
        sender = sender_user if sender_user else sender_investor
        sender_type = OwnerType.USER if sender_user else OwnerType.INVESTOR
        sender_name = sender.full_name
        
        # O pixCode é o ID do destinatário (gerado no QR Code)
        receiver_id = pix_code
        
        # Buscar destinatário (pode ser USER ou INVESTOR)
        receiver_user = self.db.query(User).filter(User.user_id == receiver_id).first()
        receiver_investor = self.db.query(Investor).filter(Investor.investor_id == receiver_id).first()
        
        if not receiver_user and not receiver_investor:
            raise HTTPException(
                status_code=404,
                detail="Destinatário não encontrado"
            )
        
        receiver = receiver_user if receiver_user else receiver_investor
        receiver_type = OwnerType.USER if receiver_user else OwnerType.INVESTOR
        receiver_name = receiver.full_name
        
        # Não pode enviar para si mesmo
        if sender_id == receiver_id:
            raise HTTPException(
                status_code=400,
                detail="Não é possível enviar PIX para si mesmo"
            )
        
        # Buscar carteiras BRL (criar se não existir)
        from app.models.models import Wallet
        
        sender_wallets = self.wallet_repository.get_wallet_by_owner(sender_id, sender_type.value.upper())
        sender_wallet = next((w for w in sender_wallets if w.currency == 'BRL'), None)
        
        if not sender_wallet:
            # Criar carteira BRL para o remetente se não existir
            sender_wallet = Wallet(
                wallet_id=str(uuid.uuid4()),
                owner_id=sender_id,
                owner_type=sender_type,
                currency=Currency.BRL,
                balance=0,
                blocked=0
            )
            self.db.add(sender_wallet)
            self.db.flush()
            logger.info(f"[PIX] Carteira BRL criada para {sender_name}")
        
        receiver_wallets = self.wallet_repository.get_wallet_by_owner(receiver_id, receiver_type.value.upper())
        receiver_wallet = next((w for w in receiver_wallets if w.currency == 'BRL'), None)
        
        if not receiver_wallet:
            # Criar carteira BRL para o destinatário se não existir
            receiver_wallet = Wallet(
                wallet_id=str(uuid.uuid4()),
                owner_id=receiver_id,
                owner_type=receiver_type,
                currency=Currency.BRL,
                balance=0,
                blocked=0
            )
            self.db.add(receiver_wallet)
            self.db.flush()
            logger.info(f"[PIX] Carteira BRL criada para {receiver_name}")
        
        # Validar saldo suficiente
        if float(sender_wallet.balance) < amount:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo insuficiente. Disponível: R$ {float(sender_wallet.balance):.2f}"
            )
        
        try:
            # Debitar do remetente
            new_sender_balance = float(sender_wallet.balance) - amount
            self.wallet_repository.update_balance(sender_wallet.wallet_id, new_sender_balance)
            
            # Creditar no destinatário
            new_receiver_balance = float(receiver_wallet.balance) + amount
            self.wallet_repository.update_balance(receiver_wallet.wallet_id, new_receiver_balance)
            
            # Criar transação
            transaction = Transaction(
                transaction_id=str(uuid.uuid4()),
                sender_id=sender_id,
                sender_type=sender_type,
                receiver_id=receiver_id,
                receiver_type=receiver_type,
                wallet_id=receiver_wallet.wallet_id,
                amount=amount,
                currency=Currency.BRL,
                type=TransactionType.PIX_SEND,
                status=TransactionStatus.COMPLETED,
                description=f"PIX enviado para {receiver_name}",
                created_at=datetime.now()
            )
            
            self.db.add(transaction)
            self.db.commit()
            
            logger.info(f"[PIX] Transação concluída: {sender_name} -> {receiver_name} = R$ {amount:.2f}")
            
            return {
                "message": "PIX enviado com sucesso",
                "status": "completed",
                "transaction": {
                    "transaction_id": transaction.transaction_id,
                    "sender": sender_name,
                    "receiver": receiver_name,
                    "amount": amount,
                    "date": transaction.created_at.isoformat()
                }
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"[PIX] Erro ao processar transação: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao processar PIX: {str(e)}"
            )
    
    def receive_pix(self, data: dict) -> dict:
        """
        Webhook para receber notificação de PIX recebido.
        
        Args:
            data: Dados da transação recebida
        
        Returns:
            Confirmação do recebimento
        """
        # TODO: Implementar webhook de recebimento externo
        # Isso seria usado quando integrar com API real de banco
        return {"message": "PIX received", "status": "completed"}
    
    def withdraw_pix(self, data: dict) -> dict:
        """
        Saque via PIX para chave externa (simulado).
        
        Args:
            data: Dicionário contendo:
                - userId: ID do usuário que está sacando
                - amount: Valor a sacar
                - pixKey: Chave PIX de destino (externa)
                - pixKeyType: Tipo da chave (EMAIL, CPF, etc)
        
        Returns:
            Confirmação do saque
        """
        user_id = data.get('userId')
        amount = data.get('amount')
        pix_key = data.get('pixKey')
        pix_key_type = data.get('pixKeyType', 'UNKNOWN')
        
        # Validações
        if not all([user_id, amount, pix_key]):
            raise HTTPException(
                status_code=400,
                detail="Campos obrigatórios: userId, amount, pixKey"
            )
        
        if amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="O valor deve ser maior que zero"
            )
        
        # Buscar usuário (pode ser USER ou INVESTOR)
        from app.models.models import Investor
        
        user = self.db.query(User).filter(User.user_id == user_id).first()
        investor = self.db.query(Investor).filter(Investor.investor_id == user_id).first()
        
        if not user and not investor:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )
        
        entity = user if user else investor
        owner_type = OwnerType.USER if user else OwnerType.INVESTOR
        entity_name = entity.full_name
        
        # Buscar carteira BRL
        wallets = self.wallet_repository.get_wallet_by_owner(user_id, owner_type.value.upper())
        wallet = next((w for w in wallets if w.currency == 'BRL'), None)
        
        if not wallet:
            raise HTTPException(
                status_code=404,
                detail="Carteira BRL não encontrada"
            )
        
        # Validar saldo suficiente
        if float(wallet.balance) < amount:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo insuficiente. Disponível: R$ {float(wallet.balance):.2f}"
            )
        
        try:
            # Debitar da carteira
            new_balance = float(wallet.balance) - amount
            self.wallet_repository.update_balance(wallet.wallet_id, new_balance)
            
            # Criar transação (simulando envio externo)
            transaction = Transaction(
                transaction_id=str(uuid.uuid4()),
                sender_id=user_id,
                sender_type=owner_type,
                receiver_id=None,  # Externo
                receiver_type=None,
                wallet_id=wallet.wallet_id,
                amount=amount,
                currency=Currency.BRL,
                type=TransactionType.PIX_SEND,
                status=TransactionStatus.COMPLETED,
                description=f"PIX enviado para {pix_key} ({pix_key_type})",
                created_at=datetime.now()
            )
            
            self.db.add(transaction)
            self.db.commit()
            
            logger.info(f"[PIX Withdraw] {entity_name} sacou R$ {amount:.2f} para {pix_key}")
            
            return {
                "message": "Saque via PIX processado com sucesso",
                "status": "completed",
                "transaction": {
                    "transaction_id": transaction.transaction_id,
                    "sender": entity_name,
                    "receiver": pix_key,
                    "amount": amount,
                    "date": transaction.created_at.isoformat()
                }
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"[PIX Withdraw] Erro ao processar saque: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao processar saque: {str(e)}"
            )
