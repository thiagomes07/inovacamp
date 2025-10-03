from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.controllers import (
    auth_controller,
    credit_controller,
    loan_controller,
    investment_controller,
    portfolio_controller,
    pool_controller,
    wallet_controller,
    currency_controller,
    pix_controller,
    transaction_controller,
    deposit_controller,
    open_finance_controller,
    kyc_controller
)

# Create FastAPI application
app = FastAPI(
    title="InovaCamp P2P Credit Platform API",
    description="""
    **API para plataforma de crédito P2P global**
    
    Esta API implementa uma plataforma de crédito peer-to-peer que conecta tomadores 
    de crédito a investidores de forma inteligente, transparente e instantânea.
    
    ## Principais Features
    
    * **Autenticação JWT** - Sistema completo de registro, login e gestão de tokens
    * **Solicitações de Crédito** - Tomadores podem solicitar crédito com garantias
    * **Marketplace de Investimentos** - Investidores exploram oportunidades
    * **Pools de Investimento** - Diversificação através de pools coletivos
    * **Carteiras Multi-moeda** - Suporte a BRL, USDT, USDC, EUR
    * **PIX Instantâneo** - Transferências em tempo real
    * **KYC** - Verificação de identidade
    * **Blockchain Integration** - Transparência e imutabilidade
    
    ## Arquitetura
    
    Esta API segue a arquitetura **MVCSR**:
    - **Models**: Mapeamento ORM das entidades do banco de dados
    - **Views**: Controllers (rotas FastAPI)
    - **Controllers**: Lógica de validação e resposta HTTP
    - **Services**: Regras de negócio
    - **Repositories**: Acesso a dados com ORM (proteção contra SQL injection)
    
    ## Segurança
    
    - Senhas hasheadas com bcrypt
    - Autenticação via JWT (Bearer tokens)
    - Validação de CPF/CNPJ
    - CORS configurado
    - Rate limiting (implementar em produção)
    
    ## Stack Tecnológico (PoC)
    
    - **Backend**: Python 3.11 + FastAPI
    - **Banco de Dados**: MySQL 8.0
    - **ORM**: SQLAlchemy
    - **Autenticação**: JWT (python-jose)
    - **Validação**: Pydantic
    """,
    version="1.0.0 (PoC)",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(credit_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(loan_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(investment_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(portfolio_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(pool_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(wallet_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(currency_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(pix_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(transaction_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(deposit_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(open_finance_controller.router, prefix=settings.API_V1_PREFIX)
app.include_router(kyc_controller.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    """Root endpoint - API health check."""
    return {
        "message": "InovaCamp P2P Credit Platform API",
        "version": "1.0.0 (PoC)",
        "status": "operational",
        "docs": "/docs",
        "api_prefix": settings.API_V1_PREFIX
    }


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "environment": settings.APP_ENV
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.APP_DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_DEBUG
    )
