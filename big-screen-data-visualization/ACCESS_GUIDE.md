## 🌐 界面访问指南

### ✅ 当前服务状态
- **后端服务**: ✅ 运行正常 (http://localhost:8000)
- **前端服务**: 🔄 正在编译中 (http://localhost:3000)

### 📱 访问地址

#### 1. 主要界面 (推荐)
```
http://localhost:3000
```
- 态势大屏系统主界面
- 包含数据源、数据集、大屏管理功能

#### 2. API文档
```
http://localhost:8000/docs
```
- 后端API交互式文档
- 可直接测试所有API接口

#### 3. 系统测试页面
```
file:///D:/Antigravity/test/test.html
```
- 系统功能测试页面
- 验证API连接和数据操作

### 🚀 启动步骤 (如果服务未运行)

#### 启动后端服务
```bash
cd backend
pip install -r requirements.txt
python main.py
```

#### 启动前端服务
```bash
cd frontend
npm install
npm run serve
```

### 📋 系统功能导航

启动成功后，您将看到以下页面：

1. **大屏管理** (`/dashboards`)
   - 创建和管理态势大屏
   - 配置可视化布局

2. **数据源** (`/datasources`) 
   - 添加数据库、API、文件数据源
   - 测试连接配置

3. **数据集** (`/datasets`)
   - 配置查询和数据转换
   - 设置刷新间隔

4. **大屏展示** (`/dashboard-view`)
   - 全屏模式展示
   - 实时数据更新

### 🔧 故障排除

#### 如果前端无法访问 (localhost:3000)
1. 检查Node.js是否安装: `node --version`
2. 重新安装依赖: `cd frontend && npm install`
3. 重启服务: `npm run serve`

#### 如果后端无法访问 (localhost:8000)
1. 检查Python是否安装: `python --version`
2. 安装依赖: `cd backend && pip install -r requirements.txt`
3. 重启服务: `python main.py`

#### 使用Docker (推荐)
```bash
# 修复网络问题后使用
docker-compose up --build -d
```

### 🎯 快速体验

1. 访问 **http://localhost:3000**
2. 点击"数据源"创建测试数据源
3. 配置数据集并预览数据
4. 创建大屏并添加可视化组件
5. 进入"大屏展示"查看效果

---
**当前状态**: 后端 ✅ 就绪 | 前端 🔄 编译中
**访问地址**: http://localhost:3000