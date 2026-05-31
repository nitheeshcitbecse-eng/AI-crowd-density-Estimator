from app.config.database import get_collection
from datetime import datetime, timedelta
from bson import ObjectId
from typing import List, Optional
import statistics
from statistics import mean, median, stdev


class AnalyticsService:
    """Comprehensive analytics service"""

    @staticmethod
    async def get_system_analytics(period_hours: int = 24):
        """Get system-wide analytics"""
        try:
            detections_col = await get_collection("density_logs")
            alerts_col = await get_collection("alerts")
            cameras_col = await get_collection("cameras")

            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            # Get all active cameras
            all_cameras = await cameras_col.find({"status": "active"}).to_list(None)
            total_cameras = len(all_cameras)

            # Get detections in period
            detections = await detections_col.find({
                "timestamp": {"$gte": time_threshold}
            }).to_list(None)

            total_detections = len(detections)

            # Get alerts in period
            alerts = await alerts_col.find({
                "created_at": {"$gte": time_threshold}
            }).to_list(None)

            total_alerts = len(alerts)

            # Calculate density metrics
            if detections:
                densities = [d.get("density_percentage", 0) for d in detections]
                avg_density = mean(densities)
                peak_density = max(densities)
                min_density = min(densities)
            else:
                avg_density = 0
                peak_density = 0
                min_density = 0

            # Count critical and high events
            critical_events = len([d for d in detections if d.get("density_level") == "critical"])
            high_events = len([d for d in detections if d.get("density_level") == "high"])

            # Get active cameras
            pipeline = [
                {"$match": {"timestamp": {"$gte": time_threshold}}},
                {"$group": {"_id": "$camera_id"}},
                {"$count": "active_cameras"}
            ]
            result = await detections_col.aggregate(pipeline).to_list(None)
            active_cameras = result[0].get("active_cameras", 0) if result else 0

            return {
                "success": True,
                "analytics": {
                    "period_hours": period_hours,
                    "total_cameras": total_cameras,
                    "active_cameras": active_cameras,
                    "total_detections": total_detections,
                    "total_alerts": total_alerts,
                    "average_system_density": round(avg_density, 2),
                    "peak_system_density": round(peak_density, 2),
                    "critical_events": critical_events,
                    "high_events": high_events,
                    "generated_at": datetime.utcnow()
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_camera_analytics(camera_id: str, period_hours: int = 24):
        """Get detailed analytics for specific camera"""
        try:
            detections_col = await get_collection("density_logs")
            cameras_col = await get_collection("cameras")
            alerts_col = await get_collection("alerts")

            if not ObjectId.is_valid(camera_id):
                return {"success": False, "message": "Invalid camera ID"}

            camera = await cameras_col.find_one({"_id": ObjectId(camera_id)})
            if not camera:
                return {"success": False, "message": "Camera not found"}

            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            # Get detections for camera
            detections = await detections_col.find({
                "camera_id": ObjectId(camera_id),
                "timestamp": {"$gte": time_threshold}
            }).to_list(None)

            if not detections:
                return {"success": False, "message": "No detection data"}

            # Calculate metrics
            densities = [d.get("density_percentage", 0) for d in detections]
            avg_density = mean(densities)
            peak_density = max(densities)
            min_density = min(densities)
            median_density = median(densities)
            std_dev = stdev(densities) if len(densities) > 1 else 0

            # Get peak hours
            peak_hours = await AnalyticsService._get_peak_hours(
                camera_id, time_threshold
            )

            # Determine trend
            if len(densities) > 1:
                recent_avg = mean(densities[-5:]) if len(densities) >= 5 else mean(densities[-2:])
                old_avg = mean(densities[:5]) if len(densities) >= 5 else mean(densities[:2])
                if recent_avg > old_avg:
                    trend = "increasing"
                elif recent_avg < old_avg:
                    trend = "decreasing"
                else:
                    trend = "stable"
            else:
                trend = "stable"

            # Determine risk level
            if avg_density >= 85:
                risk_level = "critical"
            elif avg_density >= 70:
                risk_level = "high"
            elif avg_density >= 50:
                risk_level = "medium"
            else:
                risk_level = "low"

            return {
                "success": True,
                "analytics": {
                    "camera_id": camera_id,
                    "camera_name": camera.get("name"),
                    "location": camera.get("location"),
                    "capacity": camera.get("capacity"),
                    "density_metrics": {
                        "average_density": round(avg_density, 2),
                        "peak_density": round(peak_density, 2),
                        "min_density": round(min_density, 2),
                        "median_density": round(median_density, 2),
                        "std_deviation": round(std_dev, 2),
                        "total_readings": len(densities)
                    },
                    "peak_hours": peak_hours,
                    "trend": trend,
                    "risk_level": risk_level
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def _get_peak_hours(camera_id: str, time_threshold: datetime):
        """Get peak hours for a camera"""
        try:
            detections_col = await get_collection("density_logs")

            pipeline = [
                {
                    "$match": {
                        "camera_id": ObjectId(camera_id),
                        "timestamp": {"$gte": time_threshold}
                    }
                },
                {
                    "$group": {
                        "_id": {"hour": {"$hour": "$timestamp"}, "day": {"$dayOfWeek": "$timestamp"}},
                        "avg_density": {"$avg": "$density_percentage"},
                        "peak_density": {"$max": "$density_percentage"},
                        "alert_count": {"$sum": {"$cond": [{"$in": ["$density_level", ["high", "critical"]]}, 1, 0]}}
                    }
                },
                {"$sort": {"avg_density": -1}},
                {"$limit": 5}
            ]

            results = await detections_col.aggregate(pipeline).to_list(None)
            
            days = {1: "Sunday", 2: "Monday", 3: "Tuesday", 4: "Wednesday", 5: "Thursday", 6: "Friday", 7: "Saturday"}
            
            peak_hours = []
            for result in results:
                peak_hours.append({
                    "hour": result["_id"]["hour"],
                    "day_of_week": days.get(result["_id"]["day"], "Unknown"),
                    "average_density": round(result["avg_density"], 2),
                    "peak_density": round(result["peak_density"], 2),
                    "alert_count": result["alert_count"]
                })

            return peak_hours
        except Exception as e:
            return []

    @staticmethod
    async def get_temporal_analysis(camera_id: Optional[str] = None, period_hours: int = 24, granularity: str = "hourly"):
        """Get temporal analysis with configurable granularity"""
        try:
            detections_col = await get_collection("density_logs")

            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            match_stage = {"timestamp": {"$gte": time_threshold}}
            if camera_id and ObjectId.is_valid(camera_id):
                match_stage["camera_id"] = ObjectId(camera_id)

            # Determine grouping interval
            if granularity == "daily":
                group_id = {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}}
            elif granularity == "weekly":
                group_id = {"$dateToString": {"format": "%Y-W%V", "date": "$timestamp"}}
            elif granularity == "monthly":
                group_id = {"$dateToString": {"format": "%Y-%m", "date": "$timestamp"}}
            elif granularity == "minute":
                group_id = {"$dateToString": {"format": "%Y-%m-%d %H:%M","date": "$timestamp"}}
            else:  # hourly
                group_id = {"$dateToString": {"format": "%Y-%m-%d %H:00", "date": "$timestamp"}}

            pipeline = [
                {"$match": match_stage},
                {
                    "$group": {
                        "_id": group_id,
                        "avg_density": {"$avg": "$density_percentage"},
                        "max_density": {"$max": "$density_percentage"},
                        "min_density": {"$min": "$density_percentage"},
                        "total_count": {"$sum": 1},
                        "critical_count": {"$sum": {"$cond": [{"$eq": ["$density_level", "critical"]}, 1, 0]}},
                        "high_count": {"$sum": {"$cond": [{"$eq": ["$density_level", "high"]}, 1, 0]}}
                    }
                },
                {"$sort": {"_id": 1}}
            ]

            results = await detections_col.aggregate(pipeline).to_list(None)

            temporal_data = []
            for result in results:
                temporal_data.append({
                    "timestamp": result["_id"],
                    "avg_density": round(result["avg_density"], 2),
                    "max_density": round(result["max_density"], 2),
                    "min_density": round(result["min_density"], 2),
                    "total_count": result["total_count"],
                    "critical_count": result["critical_count"],
                    "high_count": result["high_count"]
                })

            return {
                "success": True,
                "data": {
                    "granularity": granularity,
                    "period_hours": period_hours,
                    "total_periods": len(temporal_data),
                    "temporal_data": temporal_data
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_comparison_analysis(camera_id1: str, camera_id2: str, period_hours: int = 24):
        """Compare analytics between two cameras"""
        try:
            result1 = await AnalyticsService.get_camera_analytics(camera_id1, period_hours)
            result2 = await AnalyticsService.get_camera_analytics(camera_id2, period_hours)

            if not result1.get("success") or not result2.get("success"):
                return {"success": False, "message": "Could not fetch analytics for one or both cameras"}

            analytics1 = result1.get("analytics")
            analytics2 = result2.get("analytics")

            comparison = {
                "camera_1": {
                    "camera_id": camera_id1,
                    "camera_name": analytics1.get("camera_name"),
                    "average_density": analytics1.get("density_metrics", {}).get("average_density"),
                    "peak_density": analytics1.get("density_metrics", {}).get("peak_density"),
                    "risk_level": analytics1.get("risk_level")
                },
                "camera_2": {
                    "camera_id": camera_id2,
                    "camera_name": analytics2.get("camera_name"),
                    "average_density": analytics2.get("density_metrics", {}).get("average_density"),
                    "peak_density": analytics2.get("density_metrics", {}).get("peak_density"),
                    "risk_level": analytics2.get("risk_level")
                },
                "differences": {
                    "avg_density_diff": round(
                        analytics1.get("density_metrics", {}).get("average_density", 0) -
                        analytics2.get("density_metrics", {}).get("average_density", 0),
                        2
                    ),
                    "peak_density_diff": round(
                        analytics1.get("density_metrics", {}).get("peak_density", 0) -
                        analytics2.get("density_metrics", {}).get("peak_density", 0),
                        2
                    )
                }
            }

            return {"success": True, "comparison": comparison}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    async def get_alerts_analytics(period_hours: int = 24):
        """Get comprehensive alert analytics"""
        try:
            alerts_col = await get_collection("alerts")

            time_threshold = datetime.utcnow() - timedelta(hours=period_hours)

            # Total alerts by status
            pipeline = [
                {"$match": {"created_at": {"$gte": time_threshold}}},
                {"$group": {"_id": "$status", "count": {"$sum": 1}}}
            ]
            status_distribution = await alerts_col.aggregate(pipeline).to_list(None)

            # Total alerts by severity
            pipeline = [
                {"$match": {"created_at": {"$gte": time_threshold}}},
                {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
            ]
            severity_distribution = await alerts_col.aggregate(pipeline).to_list(None)

            # Total alerts by type
            pipeline = [
                {"$match": {"created_at": {"$gte": time_threshold}}},
                {"$group": {"_id": "$type", "count": {"$sum": 1}}}
            ]
            type_distribution = await alerts_col.aggregate(pipeline).to_list(None)

            # Resolution time analysis
            resolved_alerts = await alerts_col.find({
                "created_at": {"$gte": time_threshold},
                "status": "resolved",
                "resolved_at": {"$exists": True}
            }).to_list(None)

            resolution_times = []
            for alert in resolved_alerts:
                time_diff = (alert.get("resolved_at") - alert.get("created_at")).total_seconds() / 3600
                resolution_times.append(time_diff)

            avg_resolution_time = mean(resolution_times) if resolution_times else 0

            return {
                "success": True,
                "analytics": {
                    "period_hours": period_hours,
                    "status_distribution": {item["_id"]: item["count"] for item in status_distribution},
                    "severity_distribution": {item["_id"]: item["count"] for item in severity_distribution},
                    "type_distribution": {item["_id"]: item["count"] for item in type_distribution},
                    "average_resolution_time_hours": round(avg_resolution_time, 2),
                    "total_alerts": len(resolved_alerts) + await alerts_col.count_documents({
                        "created_at": {"$gte": time_threshold},
                        "status": {"$ne": "resolved"}
                    })
                }
            }
        except Exception as e:
            return {"success": False, "message": str(e)}
