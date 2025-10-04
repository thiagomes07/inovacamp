"""
Módulo de Score e Validação de Documentos.
"""

from .controller import router
from .service import ScoreService
from .repository import ScoreRepository

__all__ = ["router", "ScoreService", "ScoreRepository"]
