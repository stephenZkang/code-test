@echo off
REM =================================================================
REM Windows Offline Docker Cleanup Script
REM This script cleans up offline Docker resources
REM =================================================================

setlocal enabledelayedexpansion

echo ========================================
echo Windows Offline Docker Cleanup
echo ========================================
echo.

echo Stopping offline containers...
docker-compose -f docker-compose.offline.yml down -v

echo.
echo Removing offline images...
docker rmi performance-test-app:offline 2>nul

echo.
echo Removing Docker network...
docker network rm performance-network 2>nul

echo.
echo Removing unused Docker resources...
docker system prune -f

echo.
echo ========================================
echo Offline Docker cleanup completed!
echo ========================================

pause