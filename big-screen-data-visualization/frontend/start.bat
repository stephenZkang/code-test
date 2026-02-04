@echo off
echo 启动态势大屏前端服务...

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js 16+
    pause
    exit /b 1
)

REM 安装依赖
if not exist "node_modules" (
    echo 安装前端依赖...
    npm install
)

REM 启动开发服务器
echo 启动Vue开发服务器...
npm run serve

pause