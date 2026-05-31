from fastapi import APIRouter, HTTPException, status, Depends, Query, Path
from app.services.analytics_service import AnalyticsService
from app.middleware.auth_middleware import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/system", response_model=dict)
async def get_system_analytics(
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    current_user: dict = Depends(get_current_user)
):
    """Get system-wide analytics and statistics"""
    result = await AnalyticsService.get_system_analytics(period_hours=period_hours)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return {"success": True, "data": result.get("analytics")}


@router.get("/camera/{camera_id}", response_model=dict)
async def get_camera_analytics(
    camera_id: str = Path(..., description="Camera ID"),
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    current_user: dict = Depends(get_current_user)
):
    """Get detailed analytics for specific camera"""
    result = await AnalyticsService.get_camera_analytics(camera_id, period_hours)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message")
        )
    
    return {"success": True, "data": result.get("analytics")}


@router.get("/temporal", response_model=dict)
async def get_temporal_analysis(
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    granularity: str = Query("hourly", description="Granularity: minute, hourly, daily, weekly, monthly"),
    camera_id: Optional[str] = Query(None, description="Optional camera ID for filtering"),
    current_user: dict = Depends(get_current_user)
):
    """Get temporal analysis with configurable granularity"""
    result = await AnalyticsService.get_temporal_analysis(
        camera_id=camera_id,
        period_hours=period_hours,
        granularity=granularity
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return {"success": True, "data": result.get("data")}


@router.get("/compare", response_model=dict)
async def get_comparison_analysis(
    camera_id1: str = Query(..., description="First camera ID"),
    camera_id2: str = Query(..., description="Second camera ID"),
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    current_user: dict = Depends(get_current_user)
):
    """Compare analytics between two cameras"""
    result = await AnalyticsService.get_comparison_analysis(
        camera_id1, camera_id2, period_hours
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message")
        )
    
    return {"success": True, "data": result.get("comparison")}


@router.get("/alerts", response_model=dict)
async def get_alerts_analytics(
    period_hours: int = Query(24, ge=1, le=720, description="Time period in hours"),
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive alert analytics and distribution"""
    result = await AnalyticsService.get_alerts_analytics(period_hours)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message")
        )
    
    return {"success": True, "data": result.get("analytics")}


@router.get("/health", response_model=dict)
async def analytics_health_check(
    current_user: dict = Depends(get_current_user)
):
    """Health check for analytics service"""
    return {
        "success": True,
        "status": "healthy",
        "service": "analytics"
    }
