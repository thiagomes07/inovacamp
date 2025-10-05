"""
Módulo de KYC (Know Your Customer).
"""

from .controller import router
from .service import KYCService
from .repository import KYCRepository

__all__ = ["router", "KYCService", "KYCRepository"]
