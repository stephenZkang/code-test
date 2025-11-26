@echo off
chcp 65001 >nul
title LearnEnglish - Quick Start

:MENU
cls
echo.
echo ╔════════════════════════════════════════╗
echo ║   LearnEnglish - 快速启动脚本          ║
echo ╚════════════════════════════════════════╝
echo.
echo [1] 完整启动 (数据库 + 后端 + 前端)
echo [2] 仅启动后端
echo [3] 仅启动前端
echo [4] Docker 部署
echo [5] 数据库设置
echo [6] 退出
echo.
set /p choice="请选择 (1-6): "

if "%choice%"=="1" goto FULL_START
if "%choice%"=="2" goto START_BACKEND
if "%choice%"=="3" goto START_FRONTEND
if "%choice%"=="4" goto DOCKER_DEPLOY
if "%choice%"=="5" goto SETUP_DB
if "%choice%"=="6" goto END
goto MENU

:FULL_START
echo.
echo [启动中] 完整启动服务...
echo.
start "MySQL Check" cmd /k "echo 请确保 MySQL 正在运行... && pause"
timeout /t 3 >nul
start "Backend Server" cmd /k "cd learn-english-backend && echo [后端] 启动中... && mvn spring-boot:run"
timeout /t 10 >nul
start "Frontend Server" cmd /k "cd learn-english-frontend && echo [前端] 启动中... && npm run dev"
echo.
echo [完成] 所有服务已启动
echo.
echo 访问地址:
echo - 前端: http://localhost:3000
echo - 后端API: http://localhost:8080/api/words
echo.
pause
goto MENU

:START_BACKEND
echo.
echo [启动中] 后端服务...
cd learn-english-backend
start "Backend Server" cmd /k "mvn spring-boot:run"
echo.
echo [完成] 后端服务已启动
echo 访问: http://localhost:8080/api/words
echo.
pause
goto MENU

:START_FRONTEND
echo.
echo [启动中] 前端服务...
cd learn-english-frontend
start "Frontend Server" cmd /k "npm run dev"
echo.
echo [完成] 前端服务已启动
echo 访问: http://localhost:3000
echo.
pause
goto MENU

:DOCKER_DEPLOY
echo.
echo [部署] Docker 容器化部署...
echo.
docker-compose up --build -d
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [成功] Docker 服务已启动
    echo.
    docker-compose ps
    echo.
    echo 访问地址:
    echo - MySQL: localhost:3306
    echo - 后端API: http://localhost:8080
    echo.
    echo 管理命令:
    echo - 查看日志: docker-compose logs -f
    echo - 停止服务: docker-compose down
) else (
    echo.
    echo [错误] Docker 部署失败
    echo 请确保 Docker 已安装并正在运行
)
echo.
pause
goto MENU

:SETUP_DB
echo.
echo [设置] 数据库初始化...
call setup-database.bat
pause
goto MENU

:END
echo.
echo 感谢使用 LearnEnglish!
echo.
timeout /t 2 >nul
exit

