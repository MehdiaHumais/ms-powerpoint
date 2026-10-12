from __future__ import annotations

import os
from typing import AsyncGenerator

from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine

# Resolve a safe absolute path for the SQLite DB file.
# This works even when the project directory contains spaces.
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "powerpoint.db")

# Ensure the SQLite file exists before creating the engine.
# This prevents OperationalError on first run.
if not os.path.exists(DEFAULT_DB_PATH):
    # Create an empty file (or touch) so SQLite can open it.
    open(DEFAULT_DB_PATH, "a").close()

DATABASE_URL = os.getenv(
    "DATABASE_URL", f"sqlite+aiosqlite:///{DEFAULT_DB_PATH}"
)

# Async engine for SQLModel
engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False, future=True)

async def init_db() -> None:
    """Create database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an async session.
    Yields a session and ensures it is closed after the request.
    """
    async with AsyncSession(engine) as session:
        try:
            yield session
        finally:
            await session.close()