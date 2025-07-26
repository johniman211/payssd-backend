# 📁 southpay/backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, kyc

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(kyc.router, prefix="/kyc", tags=["KYC"])

@app.get("/")
def root():
    return {"message": "Welcome to SouthPay Backend"}
