"""
Módulo de Autenticação (Auth).

Responsável por registro, login, logout e gerenciamento de tokens JWT.
"""

from .controller import router
from .service import AuthService
from .repository import AuthRepository

__all__ = ["router", "AuthService", "AuthRepository"]
