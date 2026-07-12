from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.dependencies import require_parent
from backend.models import (
    AuditLog,
    BadBehavior,
    Notification,
    NotificationType,
    PointTransaction,
    PointType,
    User,
    UserRole,
)
from backend.schemas import (
    BadBehaviorCreate,
    BadBehaviorPreviewResponse,
    BadBehaviorResponse,
    BadBehaviorSummaryResponse,
)
from backend.services.bad_behavior import (
    BAD_BEHAVIOR_MAX_BONUS_PERCENT,
    BAD_BEHAVIOR_MIN_BONUS_PERCENT,
    calculate_bad_behavior_penalty,
    get_bad_behavior_penalty_preview,
    normalize_behavior_title,
)
from backend.websocket_manager import ws_manager


router = APIRouter(prefix="/api/bad-behaviors", tags=["bad-behaviors"])

async def _get_kid(db: AsyncSession, user_id: int) -> User:
    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.role == UserRole.kid,
            User.is_active == True,
        )
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="Kid not found")
    return user


async def _count_previous(db: AsyncSession, user_id: int, title_normalized: str) -> int:
    result = await db.execute(
        select(func.count())
        .select_from(BadBehavior)
        .where(
            BadBehavior.user_id == user_id,
            BadBehavior.title_normalized == title_normalized,
        )
    )
    return int(result.scalar() or 0)


def _behavior_response(
    behavior: BadBehavior,
    *,
    user_name: str | None = None,
    created_by_name: str | None = None,
    new_balance: int | None = None,
) -> BadBehaviorResponse:
    preview = get_bad_behavior_penalty_preview(
        previous_count=behavior.occurrence_count,
        base_penalty=behavior.base_penalty,
    )
    return BadBehaviorResponse(
        id=behavior.id,
        user_id=behavior.user_id,
        user_name=user_name,
        title=behavior.title,
        title_normalized=behavior.title_normalized,
        note=behavior.note,
        base_penalty=behavior.base_penalty,
        bonus_penalty=behavior.bonus_penalty,
        bonus_multiplier_percent=behavior.bonus_multiplier_percent,
        total_penalty=behavior.total_penalty,
        occurrence_count=behavior.occurrence_count,
        repetitions_until_next_bonus=preview.repetitions_until_bonus,
        next_bonus_at=preview.next_occurrence_count + preview.repetitions_until_bonus - 1,
        bonus_min_percent=BAD_BEHAVIOR_MIN_BONUS_PERCENT,
        bonus_max_percent=BAD_BEHAVIOR_MAX_BONUS_PERCENT,
        bonus_min_penalty=preview.bonus_min_penalty,
        bonus_max_penalty=preview.bonus_max_penalty,
        new_balance=new_balance,
        created_by=behavior.created_by,
        created_by_name=created_by_name,
        created_at=behavior.created_at,
    )


@router.get("", response_model=list[BadBehaviorResponse])
async def list_bad_behaviors(
    user_id: int | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    stmt = select(BadBehavior).order_by(BadBehavior.created_at.desc()).limit(limit)
    if user_id is not None:
        stmt = stmt.where(BadBehavior.user_id == user_id)

    result = await db.execute(stmt)
    behaviors = result.scalars().all()
    user_ids = {b.user_id for b in behaviors} | {b.created_by for b in behaviors}
    names = {}
    if user_ids:
        users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
        for user in users_result.scalars().all():
            names[user.id] = user.display_name or user.username

    return [
        _behavior_response(
            behavior,
            user_name=names.get(behavior.user_id),
            created_by_name=names.get(behavior.created_by),
        )
        for behavior in behaviors
    ]


@router.get("/suggestions", response_model=list[BadBehaviorSummaryResponse])
async def list_bad_behavior_suggestions(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    await _get_kid(db, user_id)
    result = await db.execute(
        select(BadBehavior)
        .where(BadBehavior.user_id == user_id)
        .order_by(BadBehavior.created_at.desc())
    )
    behaviors = result.scalars().all()

    summaries = {}
    for behavior in behaviors:
        summary = summaries.get(behavior.title_normalized)
        if summary is None:
            summary = {
                "title": behavior.title,
                "title_normalized": behavior.title_normalized,
                "count": 0,
                "last_base_penalty": behavior.base_penalty,
                "last_total_penalty": behavior.total_penalty,
                "last_created_at": behavior.created_at,
            }
            summaries[behavior.title_normalized] = summary
        summary["count"] += 1

    response = []
    for summary in summaries.values():
        preview = get_bad_behavior_penalty_preview(
            previous_count=summary["count"],
            base_penalty=summary["last_base_penalty"],
        )
        response.append(
            BadBehaviorSummaryResponse(
                **summary,
                repetitions_until_bonus=preview.repetitions_until_bonus,
                next_bonus_at=preview.next_occurrence_count + preview.repetitions_until_bonus - 1,
                bonus_min_percent=BAD_BEHAVIOR_MIN_BONUS_PERCENT,
                bonus_max_percent=BAD_BEHAVIOR_MAX_BONUS_PERCENT,
            )
        )

    return response[:50]


@router.get("/preview", response_model=BadBehaviorPreviewResponse)
async def preview_bad_behavior_penalty(
    user_id: int,
    title: str = Query(min_length=1, max_length=200),
    base_penalty: int = Query(gt=0, le=10000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    await _get_kid(db, user_id)
    title_normalized = normalize_behavior_title(title)
    if not title_normalized:
        raise HTTPException(status_code=400, detail="Title is required")
    previous_count = await _count_previous(db, user_id, title_normalized)
    preview = get_bad_behavior_penalty_preview(previous_count, base_penalty)

    return BadBehaviorPreviewResponse(
        user_id=user_id,
        title=title.strip(),
        title_normalized=title_normalized,
        previous_count=previous_count,
        next_occurrence_count=preview.next_occurrence_count,
        bonus_will_trigger=preview.bonus_will_trigger,
        repetitions_until_bonus=preview.repetitions_until_bonus,
        bonus_min_percent=preview.bonus_min_percent,
        bonus_max_percent=preview.bonus_max_percent,
        bonus_min_penalty=preview.bonus_min_penalty,
        bonus_max_penalty=preview.bonus_max_penalty,
    )


@router.post("", response_model=BadBehaviorResponse, status_code=201)
async def create_bad_behavior(
    body: BadBehaviorCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent),
):
    kid = await _get_kid(db, body.user_id)
    title = body.title.strip()
    title_normalized = normalize_behavior_title(title)
    if not title_normalized:
        raise HTTPException(status_code=400, detail="Title is required")

    previous_count = await _count_previous(db, kid.id, title_normalized)
    penalty = calculate_bad_behavior_penalty(previous_count, body.base_penalty)

    old_balance = kid.points_balance or 0
    kid.points_balance = max(0, old_balance - penalty.total_penalty)

    behavior = BadBehavior(
        user_id=kid.id,
        title=title,
        title_normalized=title_normalized,
        note=body.note.strip() if body.note else None,
        base_penalty=penalty.base_penalty,
        bonus_penalty=penalty.bonus_penalty,
        bonus_multiplier_percent=penalty.bonus_multiplier_percent,
        total_penalty=penalty.total_penalty,
        occurrence_count=penalty.occurrence_count,
        created_by=current_user.id,
    )
    db.add(behavior)
    await db.flush()

    description = f"Z\u0142e zachowanie: {title}"
    if penalty.bonus_triggered:
        description += (
            f" (powt\u00f3rzenie {penalty.occurrence_count}, "
            f"losowa dodatkowa kara {penalty.bonus_multiplier_percent}% = "
            f"{penalty.bonus_penalty} XP)"
        )

    tx = PointTransaction(
        user_id=kid.id,
        amount=-penalty.total_penalty,
        type=PointType.bad_behavior,
        description=description,
        reference_id=behavior.id,
        created_by=current_user.id,
    )
    db.add(tx)
    await db.flush()

    notification_message = f"Odj\u0119to {penalty.total_penalty} XP za: {title}."
    if penalty.bonus_triggered:
        notification_message += (
            f" To {penalty.occurrence_count}. powt\u00f3rzenie; dodatkowa kara "
            f"zosta\u0142a wylosowana: {penalty.bonus_multiplier_percent}% "
            f"z {penalty.base_penalty} XP = {penalty.bonus_penalty} XP."
        )
    else:
        notification_message += (
            f" Do losowej dodatkowej kary zosta\u0142o "
            f"{penalty.repetitions_until_next_bonus} powt\u00f3rze\u0144."
        )

    db.add(
        Notification(
            user_id=kid.id,
            type=NotificationType.bad_behavior,
            title="Z\u0142e zachowanie",
            message=notification_message,
            reference_type="point_transaction",
            reference_id=tx.id,
        )
    )

    db.add(
        AuditLog(
            user_id=current_user.id,
            action="bad_behavior_created",
            details={
                "target_user_id": kid.id,
                "title": title,
                "base_penalty": penalty.base_penalty,
                "bonus_penalty": penalty.bonus_penalty,
                "bonus_multiplier_percent": penalty.bonus_multiplier_percent,
                "total_penalty": penalty.total_penalty,
                "occurrence_count": penalty.occurrence_count,
                "old_balance": old_balance,
                "new_balance": kid.points_balance,
            },
            ip_address=request.client.host if request.client else None,
        )
    )

    await db.commit()
    await db.refresh(behavior)

    await ws_manager.send_to_user(
        kid.id,
        {
            "type": "bad_behavior",
            "data": {
                "title": title,
                "total_penalty": penalty.total_penalty,
                "new_balance": kid.points_balance,
            },
        },
    )
    await ws_manager.broadcast(
        {
            "type": "bad_behavior",
            "data": {
                "user_id": kid.id,
                "title": title,
                "total_penalty": penalty.total_penalty,
                "new_balance": kid.points_balance,
            },
        }
    )

    return _behavior_response(
        behavior,
        user_name=kid.display_name or kid.username,
        created_by_name=current_user.display_name or current_user.username,
        new_balance=kid.points_balance,
    )
