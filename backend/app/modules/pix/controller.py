from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import PIXService

router = APIRouter(prefix="/pix", tags=["PIX"])


@router.post("/send")
def send_pix(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Envia PIX de um usuário para outro.
    
    **Body JSON:**
    ```json
    {
        "pixCode": "u1000000-0000-0000-0000-000000000002",  // ID do destinatário (do QR Code)
        "amount": 100.50,
        "userId": "u1000000-0000-0000-0000-000000000001"  // ID do remetente
    }
    ```
    
    **Validações:**
    - Verifica saldo suficiente do remetente
    - Valida existência de remetente e destinatário
    - Não permite envio para si mesmo
    - Cria carteira BRL para destinatário se não existir
    
    **Retorna:**
    - Detalhes da transação completada
    - Saldos são atualizados imediatamente
    - Transação registrada no histórico
    """
    service = PIXService(db)
    result = service.send_pix(data)
    return result


@router.post("/receive")
def receive_pix(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Recebe PIX.
    
    **Ainda não implementado - Placeholder**
    """
    service = PIXService(db)
    result = service.receive_pix(data)
    return result


@router.post("/withdraw")
def withdraw_pix(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Saque via PIX para chave externa.
    
    **Body JSON:**
    ```json
    {
        "userId": "i1000000-0000-0000-0000-000000000001",
        "amount": 100.50,
        "pixKey": "email@exemplo.com",  // Chave PIX externa
        "pixKeyType": "EMAIL"  // CPF, CNPJ, EMAIL, PHONE, RANDOM
    }
    ```
    
    **Validações:**
    - Verifica saldo suficiente
    - Debita da carteira do usuário
    - Registra como transação PIX_SEND
    
    **Nota:** Em produção, seria integrado com API de banco real.
    Por ora, apenas debita o valor da conta (simula envio externo).
    """
    service = PIXService(db)
    result = service.withdraw_pix(data)
    return result
