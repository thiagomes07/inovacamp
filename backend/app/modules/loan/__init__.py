"""
Módulo de Empréstimo (Loan).
"""

from .controller import router
from .service import LoanService
from .repository import LoanRepository

__all__ = ["router", "LoanService", "LoanRepository"]
