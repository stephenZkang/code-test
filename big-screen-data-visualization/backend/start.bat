@echo off
echo 启动态势大屏后端服务...

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

REM 创建虚拟环境（可选）
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
echo 激活虚拟环境...
call venv\Scripts\activate

REM 安装依赖
echo 安装Python依赖...
pip install -r requirements.txt

REM 启动服务
echo 启动FastAPI服务...
python main.py

pause