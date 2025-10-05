"""
Módulo de Carteira (Wallet).
"""

from .controller import router
from .service import WalletService
from .repository import WalletRepository

__all__ = ["router", "WalletService", "WalletRepository"]
