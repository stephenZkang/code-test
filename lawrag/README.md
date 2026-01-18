# LawRAG - 法律RAG知识库应用

一个全栈法律知识库应用，基于 React + SpringBoot + Python AI 技术栈，提供智能文档管理、语义搜索和 RAG 问答功能。

## 技术栈

### 前端
- **React 18** + **Vite**
- **Chakra UI** - 移动端优先的组件库
- **React Router** - 路由管理
- **Axios** - API 请求
- **PDF.js** - 文档预览

### 后端
- **SpringBoot 3.2** + **Java 17**
- **MyBatis Plus** - ORM框架
- **MySQL 8.0** - 关系型数据库
- **Redis** - 缓存
- **WebSocket** - 实时通信

### AI服务
- **Python 3.9+**
- **FastAPI** - Web框架
- **LangChain** + **LangGraph** - RAG框架
- **Google Gemini** - 大语言模型 (默认)
- **OpenAI** - 大语言模型 (可选)
- **Milvus** - 向量数据库
- **PyPDF2** + **python-docx** - 文档解析

## 功能特性

### 1. 知识库管理
- 📤 多格式文档上传 (PDF, Word, 图片)
- 📊 实时解析进度显示 (WebSocket)
- 🔍 分类筛选和管理
- 📄 在线文档预览 (PDF.js高亮显示)

### 2. 智能问答
- 💬 流式输出 (SSE打字机效果)
- 🔗 引用溯源 (点击查看原文)
- 💾 Redis缓存高频问题
- 📝 会话历史记录

### 3. 智能搜索
- 🔎 混合检索 (MySQL关键词 + Milvus语义)
- 📈 相关度评分
- 🎯 结果聚合去重

### 4. 法律文本智能分段
- ⚖️ 正则识别法律条款 (第N条、第N款)
- 📚 避免法条语义截断
- 🧩 智能chunking策略

## 前置要求

### 数据库和服务
- MySQL 8.0+ (端口: 3306)
- Redis (端口: 6379, 密码: 123456)
- Milvus (端口: 19530)

### 开发环境
- Java 17+
- Node.js 18+
- Python 3.9+
- Maven 3.6+

### API密钥
- OpenAI API Key (用于嵌入和问答)

## 快速开始

### 1. 数据库初始化

```bash
# 连接 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE lawrag CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入表结构
USE lawrag;
source database/schema.sql;
```

### 2. 后端启动 (SpringBoot)

```bash
cd backend

# 配置环境变量 (可选,也可直接修改application.yml)
cp .env.example .env
# 编辑 .env 配置数据库密码等

# 安装依赖并启动
mvn clean install
mvn spring-boot:run

# 服务运行在 http://localhost:8080/api
# Swagger文档: http://localhost:8080/swagger-ui.html
```

### 3. Python AI服务启动

```bash
cd python-service

# 创建虚拟环境 (推荐)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env, 填入 OPENAI_API_KEY

# 启动服务
python main.py

# 服务运行在 http://localhost:8000
# API文档: http://localhost:8000/docs
```

### 4. 前端启动 (React)

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 应用运行在 http://localhost:3000
```

## 环境变量配置

### 后端 (.env)
```env
SPRING_DATASOURCE_URL=jdbc:mysql://127.0.0.1:3306/lawrag
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root
SPRING_REDIS_HOST=127.0.0.1
SPRING_REDIS_PASSWORD=123456
APP_UPLOAD_PATH=./uploads
```

### Python服务 (.env)
```env
# AI Provider (google or openai)
AI_PROVIDER=google

# Google Gemini Configuration
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-pro
GEMINI_EMBEDDING_MODEL=models/embedding-001

# OpenAI Configuration (Optional)
OPENAI_API_KEY=sk-...your_key_here

MILVUS_HOST=127.0.0.1
MILVUS_PORT=19530
BACKEND_URL=http://localhost:8080/api
```

## 项目结构

```
lawrag/
├── backend/                    # SpringBoot后端
│   ├── src/main/java/com/lawrag/
│   │   ├── controller/        # REST控制器
│   │   ├── service/           # 业务逻辑
│   │   ├── mapper/            # MyBatis映射
│   │   ├── entity/            # 实体类
│   │   ├── dto/               # 数据传输对象
│   │   ├── client/            # Python服务客户端
│   │   └── config/            # 配置类
│   └── pom.xml
├── python-service/            # Python AI服务
│   ├── main.py               # FastAPI应用
│   ├── document_processor.py # 文档解析
│   ├── vector_store.py       # Milvus向量存储
│   ├── rag_chain.py          # RAG问答链
│   └── requirements.txt
├── frontend/                  # React前端
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 共享组件
│   │   ├── api/              # API服务
│   │   ├── App.jsx
│   │   └── theme.js          # Chakra主题
│   └── package.json
└── database/
    └── schema.sql            # 数据库表结构
```

## API接口文档

### 文档管理
- `POST /api/docs/upload` - 上传文档
- `GET /api/docs/{id}/parse-status` - 获取解析状态
- `GET /api/docs/list` - 文档列表
- `GET /api/docs/random` - 随机文档
- `DELETE /api/docs/{id}` - 删除文档

### 智能问答
- `POST /api/chat/ask` - 提问 (普通)
- `GET /api/chat/stream` - 提问 (流式)
- `GET /api/chat/reference/{msgId}` - 获取引用

### 智能搜索
- `POST /api/search` - 混合搜索
- `GET /api/search` - 搜索 (GET)

## 使用指南

### 1. 上传法律文档
1. 点击底部导航"知识库"
2. 点击"上传文档"按钮
3. 选择分类和文件
4. 等待解析完成 (进度条显示)

### 2. 智能问答
1. 点击底部导航"智能问答"
2. 输入法律问题
3. 查看流式回答
4. 点击"参考来源"查看原文

### 3. 智能搜索
1. 点击底部导航"智能搜索"
2. 输入关键词或问题
3. 查看混合搜索结果
4. 查看相关度和来源类型

## 特色亮点

### 🎨 移动端优先设计
- 蓝绿色系专业配色
- 底部固定导航栏
- 流畅的滑动和点击交互
- 响应式布局

### ⚡ 实时体验
- WebSocket解析进度推送
- SSE流式问答输出
- 打字机效果

### 🧠 智能RAG
- 法律条款智能分段
- 混合检索 (关键词+语义)
- Redis缓存优化
- 引用溯源

## 常见问题

### Q: Milvus连接失败?
A: 确保Milvus服务正在运行，检查端口19530是否开放。

### Q: OpenAI API调用失败?
A: 检查API密钥是否正确，确保有足够的配额。

### Q: 文档解析一直处于PENDING状态?
A: 检查Python服务是否启动，查看后端日志确认是否成功通知Python服务。

### Q: 前端无法连接后端?
A: 确保after端运行在8080端口，检查Vite代理配置。

## 开发计划

- [ ] 用户认证和权限管理
- [ ] 文档分类自动识别
- [ ] 多轮对话上下文记忆
- [ ] 导出对话记录
- [ ] 移动端APP (React Native)

## License

MIT License

## 作者

LawRAG Team

---

🎉 **享受智能法律助手带来的便利!**
