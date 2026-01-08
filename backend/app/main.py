from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import meta, auth, data, layout
from app.db.init_db import init_db

# Initialize DB on startup (ensure tables exist)
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}", tags=["auth"])
app.include_router(meta.router, prefix=f"{settings.API_V1_STR}/meta", tags=["meta"])
app.include_router(layout.router, prefix=f"{settings.API_V1_STR}/meta", tags=["layout"])
app.include_router(data.router, prefix=f"{settings.API_V1_STR}/data", tags=["data"])

@app.get("/")
def root():
    return {"message": "Welcome to VibeCRM API"}
