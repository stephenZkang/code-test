# 态势大屏系统

一个基于 Vue 3 和 FastAPI 的现代化态势感知大屏系统，支持多种数据源、可视化图表和实时数据展示。

## 功能特性

### 🗄️ 数据源管理
- 支持 MySQL、PostgreSQL 数据库
- REST API 数据源
- 文件数据源
- 连接测试功能

### 📊 数据集管理
- SQL 查询配置
- API 请求配置
- 数据预览功能
- 刷新间隔设置

### 📈 可视化组件
- **地图组件**: 基于 Leaflet 的交互式地图
- **图表组件**: 基于 ECharts 的多种图表（柱状图、折线图、饼图、散点图）
- **表格组件**: 支持搜索、分页的数据表格
- **指标组件**: 大数字展示，支持趋势分析

### 🎛️ 大屏管理
- 拖拽式布局编辑
- 组件配置管理
- 全屏展示模式
- 实时数据刷新

## 技术栈

### 后端
- **FastAPI**: 现代化的 Python Web 框架
- **SQLAlchemy**: ORM 数据库操作
- **SQLite**: 轻量级数据库（可替换为 PostgreSQL/MySQL）
- **Pydantic**: 数据验证和序列化

### 前端
- **Vue 3**: 渐进式 JavaScript 框架
- **Element Plus**: Vue 3 UI 组件库
- **ECharts**: 数据可视化图表库
- **Leaflet**: 开源地图库
- **Vuex**: 状态管理
- **Vue Router**: 路由管理

## 项目结构

```
.
├── backend/                 # 后端 API
│   ├── main.py             # 应用入口
│   ├── database.py         # 数据库配置
│   ├── models.py           # 数据模型
│   ├── schemas.py          # Pydantic 模型
│   ├── requirements.txt    # Python 依赖
│   └── routers/           # API 路由
│       ├── datasources.py  # 数据源管理
│       ├── datasets.py     # 数据集管理
│       └── dashboards.py   # 大屏管理
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── components/     # 可视化组件
│   │   ├── router/         # 路由配置
│   │   ├── store/          # 状态管理
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 应用入口
│   └── package.json        # 前端依赖
└── README.md              # 项目文档
```

## 快速开始

### 1. 启动后端服务

```bash
cd backend
pip install -r requirements.txt
python main.py
```

后端服务将在 `http://localhost:8000` 启动
API 文档可在 `http://localhost:8000/docs` 查看

### 2. 启动前端服务

```bash
cd frontend
npm install
npm run serve
```

前端应用将在 `http://localhost:3000` 启动

## 使用指南

### 1. 配置数据源
1. 进入"数据源"页面
2. 点击"添加数据源"
3. 选择数据源类型（MySQL、PostgreSQL、API、文件）
4. 填写连接配置
5. 测试连接并保存

### 2. 创建数据集
1. 进入"数据集"页面
2. 点击"添加数据集"
3. 选择数据源
4. 配置查询（SQL 或 API 请求）
5. 设置刷新间隔
6. 预览数据并保存

### 3. 设计大屏
1. 进入"大屏管理"页面
2. 创建新大屏
3. 添加可视化组件（地图、图表、表格、指标）
4. 配置组件数据源和样式
5. 调整布局

### 4. 展示大屏
1. 进入"大屏展示"页面
2. 选择要展示的大屏
3. 点击全屏模式进行展示
4. 支持实时数据刷新

## API 文档

### 数据源 API
- `GET /api/datasources` - 获取数据源列表
- `POST /api/datasources` - 创建数据源
- `GET /api/datasources/{id}` - 获取数据源详情
- `PUT /api/datasources/{id}` - 更新数据源
- `DELETE /api/datasources/{id}` - 删除数据源

### 数据集 API
- `GET /api/datasets` - 获取数据集列表
- `POST /api/datasets` - 创建数据集
- `GET /api/datasets/{id}` - 获取数据集详情
- `GET /api/datasets/{id}/data` - 获取数据集数据
- `PUT /api/datasets/{id}` - 更新数据集
- `DELETE /api/datasets/{id}` - 删除数据集

### 大屏 API
- `GET /api/dashboards` - 获取大屏列表
- `POST /api/dashboards` - 创建大屏
- `GET /api/dashboards/{id}` - 获取大屏详情
- `PUT /api/dashboards/{id}` - 更新大屏
- `DELETE /api/dashboards/{id}` - 删除大屏
- `GET /api/dashboards/{id}/widgets` - 获取大屏组件
- `POST /api/dashboards/{id}/widgets` - 创建大屏组件

## 开发说明

### 添加新的可视化组件

1. 在 `frontend/src/components/` 创建新组件
2. 在 `DashboardView.vue` 中注册组件
3. 在 `getWidgetComponent` 方法中添加组件映射
4. 更新组件配置 schema

### 扩展数据源类型

1. 在 `backend/schemas.py` 中更新数据源配置
2. 在 `backend/routers/datasources.py` 中添加连接测试逻辑
3. 在前端添加对应的数据源配置界面

## 部署

### Docker 部署
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 生产环境配置
- 修改数据库连接配置
- 配置跨域设置
- 设置 HTTPS
- 配置反向代理

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License