from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.dependencies import get_current_user, require_parent
from backend.models import AppSetting, User
from backend.services.family_theme import SPECIAL_THEME_KEY, normalize_special_theme
from backend.websocket_manager import ws_manager


router = APIRouter(prefix="/api/theme", tags=["theme"])


class SpecialThemeUpdate(BaseModel):
    special_theme: str


async def _read_special_theme(db: AsyncSession) -> str:
    result = await db.execute(
        select(AppSetting).where(AppSetting.key == SPECIAL_THEME_KEY)
    )
    setting = result.scalar_one_or_none()
    try:
        return normalize_special_theme(setting.value if setting else "none")
    except ValueError:
        return "none"


@router.get("/special")
async def get_special_theme(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    return {"special_theme": await _read_special_theme(db)}


@router.put("/special")
async def update_special_theme(
    body: SpecialThemeUpdate,
    db: AsyncSession = Depends(get_db),
    _parent: User = Depends(require_parent),
):
    try:
        special_theme = normalize_special_theme(body.special_theme)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    result = await db.execute(
        select(AppSetting).where(AppSetting.key == SPECIAL_THEME_KEY)
    )
    setting = result.scalar_one_or_none()
    if setting:
        setting.value = special_theme
    else:
        db.add(AppSetting(key=SPECIAL_THEME_KEY, value=special_theme))

    await db.commit()
    await ws_manager.broadcast(
        {
            "type": "data_changed",
            "data": {
                "entity": "special_theme",
                "special_theme": special_theme,
            },
        }
    )
    return {"special_theme": special_theme}
