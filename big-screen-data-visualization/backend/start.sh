# 后端启动脚本
echo "启动态势大屏后端服务..."

# 检查Python是否安装
if ! command -v python &> /dev/null; then
    echo "错误: 未找到Python，请先安装Python 3.8+"
    exit 1
fi

# 创建虚拟环境（可选）
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate 2>/dev/null || venv\Scripts\activate 2>/dev/null || echo "虚拟环境激活失败，使用系统Python"

# 安装依赖
echo "安装Python依赖..."
pip install -r requirements.txt

# 启动服务
echo "启动FastAPI服务..."
python main.py