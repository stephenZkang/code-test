# 前端启动脚本
echo "启动态势大屏前端服务..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js 16+"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 启动开发服务器
echo "启动Vue开发服务器..."
npm run serve