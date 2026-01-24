from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import text
from typing import Any

from app.core import security
from app.db.session import engine
from app.schemas.token import Token

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Query data_user table directly
    # Note: 'username' in form_data is treated as 'email'
    
    try:
        with engine.connect() as conn:
            # We fetch all columns or specific ones. 
            # We assume 'password' column exists in data_user.
            result = conn.execute(
                text("SELECT id, email, password FROM data_user WHERE email = :email"),
                {"email": form_data.username}
            ).mappings().fetchone()
    except Exception as e:
        # Table might not exist yet or column missing
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    user = result
    
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not security.verify_password(form_data.password, user['password']):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = security.timedelta(minutes=security.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user['id'], expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
