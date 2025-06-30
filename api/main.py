from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json

app = FastAPI(title="TSO Vue Project API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class ApiResponse(BaseModel):
    message: str
    status: str
    data: Optional[Dict[str, Any]] = None

# Hello endpoint
@app.get("/api/hello")
async def hello():
    return {
        "message": "Hello from FastAPI on Vercel!",
        "status": "success",
        "method": "GET"
    }

@app.post("/api/hello")
async def hello_post(data: Optional[Dict[str, Any]] = None):
    return {
        "message": "POST request received!",
        "status": "success",
        "method": "POST",
        "received_data": data
    }

# System status endpoint
@app.get("/api/system")
async def system_status():
    return {
        "status": "success",
        "message": "System is running",
        "data": {
            "initialized": True,
            "version": "1.0.0",
            "environment": "development"
        }
    }

# Auth endpoints
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    # Mock authentication logic
    if request.username == "admin" and request.password == "password":
        return {
            "status": "success",
            "message": "Login successful",
            "data": {
                "token": "mock-jwt-token-12345",
                "user": {
                    "id": 1,
                    "username": request.username,
                    "role": "admin"
                }
            }
        }
    else:
        return {
            "status": "error",
            "message": "Invalid credentials"
        }

@app.post("/api/auth/register")
async def register(request: RegisterRequest):
    # Mock registration logic
    return {
        "status": "success",
        "message": "Registration successful",
        "data": {
            "user": {
                "id": 2,
                "username": request.username,
                "email": request.email,
                "role": "user"
            }
        }
    }

@app.get("/api/auth/profile")
async def get_profile():
    # Mock profile data
    return {
        "status": "success",
        "message": "Profile retrieved",
        "data": {
            "user": {
                "id": 1,
                "username": "admin",
                "email": "admin@example.com",
                "role": "admin",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }
    }

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Root endpoint for API
@app.get("/api")
async def api_root():
    return {
        "message": "TSO Vue Project API",
        "version": "1.0.0",
        "endpoints": [
            "/api/hello",
            "/api/system",
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/profile",
            "/api/health"
        ]
    }
