## 全栈法律RAG知识库应用 - LawRAG

### **技术栈**

前端:React +Chakra UI(移动端优先)
后端: SpringBoot + MyBatis + Redis + MySQL
AI: OpenAI
python: langchain + langgraph + openai + milvus 
向量数据库: Milvus

### **数据库配置**

数据库连接信息:
ip: 127.0.0.1
port: 3306
username: root
password: root
database: lawrag

Redis连接信息:
ip: 127.0.0.1
port: 6379
password: 123456

Milvus连接信息:
ip: 127.0.0.1
port: 19530

### **前端功能**

1. **知识库**: 
   PDF\WORD、图片、视频、文档上传、文档解析、文档存储、文档搜索、文档展示
   支持多格式上传，增加 “解析进度条”（基于 WebSocket 实时反馈解析百分比）。
   在线预览: 集成 PDF.js，支持在预览文档时高亮显示 AI 检索到的原始条款
2. **智能问答**:智能问答
   引用溯源: AI 回答附带“点击查看原文”跳转，确保法律依据可追溯。
   流式输出: 模拟 ChatGPT 的打字机效果。
3. **智能搜索**:智能搜索
4. **底部导航**:首页、知识库、智能搜索、智能问答四个Tab

### **后端功能**

1. **知识库管理**: 知识库增删改查、分类筛选、随机获取、文档解析、文档存储、文档搜索、文档展示
   长文本分段策略: 针对法律条文（如“第N条”、“第N款”）进行正则切分，避免法条语义在中途被截断。
2. **智能问答**:智能问答
   缓存策略: Redis 缓存高频咨询问题的答案，降低 OpenAI Token 消耗。
3.**智能搜索**:智能搜索
   混合检索引擎: Python 端 LangChain 负责语义向量搜索，SpringBoot 端负责 MySQL 全文关键词搜索，最后进行结果聚合

### **核心API接口**

知识库:
   /api/docs/upload 上传文件并存入 MySQL，同时异步通知 Python 端开始切片入库 Milvus
   /api/docs/{id}/parse-status   轮询文档向量化进度

智能问答:
   /api/chat/ask  核心对话接口。Payload: {sessionId, question}
   /api/chat/stream  SSE 协议流式输出回答，提升用户端响应感
   /api/chat/reference/{msgId}   获取特定回答所引用的法律原文片段
智能搜索:
   /api/docs/search  关键词搜索 + 语义搜索。参数: query, category

### **设计要求**

移动端优先响应式设计
蓝绿色系配色
流畅的滑动和点击交互
加载态和错误处理

前端 UI 设计亮点 (Chakra UI)
蓝绿色调: 使用 theme.extend({ colors: { brand: { 500: "#2C7A7B" } } }) 实现专业稳重的法律氛围。

加载态: 在文档解析和 AI 回答时，使用 Chakra UI 的 Skeleton 或 Progress 组件，缓解用户等待焦虑。

移动端: 底部导航栏采用固定定位，使用 Box 的 _active 状态区分当前页面。



### **交付物**

完整前后端代码(含环境变量配置示例)

MySQL数据库表结构SQL

本地启动说明文档  



请创建完整的全栈应用，前端使用React +Chakra UI(移动端优先),后端使用SpringBoot + MyBatis + Redis + MySQL.