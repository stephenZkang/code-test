# LawRAG 本地启动指南

完整的本地环境搭建和启动步骤。

## 一、环境准备

### 1.1 安装基础软件

#### MySQL 8.0+
1. 下载MySQL安装包: https://dev.mysql.com/downloads/mysql/
2. 安装并设置root密码为 `root` (或自定义)
3. 启动MySQL服务

#### Redis
1. 下载Redis: https://redis.io/download
2. Windows用户推荐使用: https://github.com/tporadowski/redis/releases
3. 配置密码为 `123456`:
   ```bash
   # redis.conf 或windows配置
   requirepass 123456
   ```
4. 启动Redis服务

#### Milvus
1. 使用Docker启动Milvus (推荐):
   ```bash
   # 下载docker-compose.yml
   wget https://github.com/milvus-io/milvus/releases/download/v2.3.4/milvus-standalone-docker-compose.yml -O docker-compose.yml
   
   # 启动
   docker-compose up -d
   ```
2. 或使用Milvus Standalone安装包

### 1.2 安装开发工具

- **Java 17**: https://www.oracle.com/java/technologies/downloads/#java17
- **Maven 3.6+**: https://maven.apache.org/download.cgi
- **Node.js 18+**: https://nodejs.org/
- **Python 3.9+**: https://www.python.org/downloads/

### 1.3 获取 API Key
#### Google AI (推荐)
1. 访问 https://aistudio.google.com/app/apikey
2. 创建新的 API 密钥
3. 保存密钥备用

#### OpenAI (可选)
1. 访问 https://platform.openai.com/api-keys
2. 创建新的 API 密钥
3. 保存密钥备用

## 二、数据库初始化

### 2.1 创建数据库
```bash
# 登录MySQL
mysql -u root -p

# 输入密码: root

# 创建数据库
CREATE DATABASE lawrag CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 导入表结构
```bash
# 使用数据库
USE lawrag;

# 导入schema.sql
source D:/Antigravity/code-test/lawrag/database/schema.sql;

# 或在MySQL Workbench中打开并执行schema.sql
```

### 2.3 验证表创建
```sql
SHOW TABLES;
-- 应该看到: documents, chat_sessions, chat_messages, document_references
```

## 三、后端启动 (SpringBoot)

### 3.1 配置环境
```bash
cd backend

# 复制环境变量模板
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac

# 编辑.env文件,确认配置项
# 特别注意数据库和Redis密码
```

### 3.2 创建上传目录
```bash
mkdir uploads
```

### 3.3 编译和启动
```bash
# 安装依赖
mvn clean install

# 启动服务
mvn spring-boot:run

# 或使用IDE（IntelliJ IDEA/Eclipse）直接运行LawRagApplication.java
```

### 3.4 验证启动
```bash
# 访问Swagger文档
浏览器打开: http://localhost:8080/swagger-ui.html

# 检查日志
# 应该看到: "Started LawRagApplication in X seconds"
```

## 四、Python AI服务启动

### 4.1 创建虚拟环境 (推荐)
```bash
cd python-service

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate
```

### 4.2 安装依赖
```bash
# 升级pip
python -m pip install --upgrade pip

# 安装依赖包
pip install -r requirements.txt

# 如果下载慢,使用国内源:
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 4.3 配置环境变量
```bash
# 复制模板
copy .env.example .env   # Windows
cp .env.example .env     # Linux/Mac

# 编辑.env文件
notepad .env  # Windows
vim .env      # Linux/Mac

# 重要: 配置 AI 提供商和密钥
AI_PROVIDER=google
GOOGLE_API_KEY=your_actual_google_key_here
GEMINI_MODEL=gemini-pro
GEMINI_EMBEDDING_MODEL=models/embedding-001
```

### 4.4 安装OCR支持 (可选,用于图片识别)
```bash
# Windows: 下载Tesseract
https://github.com/UB-Mannheim/tesseract/wiki

# Linux:
sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim

# Mac:
brew install tesseract tesseract-lang
```

### 4.5 启动服务
```bash
python main.py

# 或使用uvicorn直接启动:
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4.6 验证启动
```bash
# 访问API文档
浏览器打开: http://localhost:8000/docs

# 检查Milvus连接
curl http://localhost:8000/stats
```

## 五、前端启动 (React)

### 5.1 安装依赖
```bash
cd frontend

# 安装npm包
npm install

# 如果安装慢,使用淘宝镜像:
npm install --registry=https://registry.npmmirror.com
```

### 5.2 启动开发服务器
```bash
npm run dev

# 应该看到:
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

### 5.3 访问应用
```bash
浏览器打开: http://localhost:3000
```

## 六、完整启动顺序

**重要: 必须按以下顺序启动所有服务**

1. ✅ **MySQL** (端口3306)
2. ✅ **Redis** (端口6379)
3. ✅ **Milvus** (端口19530)
4. ✅ **SpringBoot后端** (端口8080)
5. ✅ **Python AI服务** (端口8000)
6. ✅ **React前端** (端口3000)

## 七、功能测试

### 7.1 测试文档上传
1. 访问 http://localhost:3000/knowledge
2. 点击"上传文档"
3. 选择分类和PDF文件
4. 观察解析进度

### 7.2 测试智能问答
1. 访问 http://localhost:3000/qa
2. 输入问题: "什么是合同?"
3. 观察流式输出
4. 查看引用来源

### 7.3 测试智能搜索
1. 访问 http://localhost:3000/search
2. 搜索: "民法"
3. 查看混合搜索结果

## 八、常见问题排查

### 问题1: 后端启动失败 - "连接MySQL失败"
**原因**: MySQL未启动或密码错误
**解决**:
```bash
# 检查MySQL状态
mysql -u root -p

# 修改配置
编辑 backend/src/main/resources/application.yml
确认用户名密码正确
```

### 问题2: Python服务启动失败 - "Milvus连接失败"
**原因**: Milvus未启动
**解决**:
```bash
# 检查Milvus状态
docker ps | grep milvus

# 重启Milvus
docker-compose restart
```

### 问题3: 文档上传后一直PENDING
**原因**: Python服务未启动或后端无法连接Python服务
**解决**:
```bash
# 检查Python服务
curl http://localhost:8000/

# 检查后端日志
查看是否有"Failed to trigger parsing"错误
```

### 问题4: 前端页面空白
**原因**: API请求失败
**解决**:
```bash
# 打开浏览器开发者工具 (F12)
# 查看Console和Network标签
# 确认后端是否正常运行在8080端口
```

### 问题5: OpenAI API调用失败
**原因**: API密钥错误或网络问题
**解决**:
```bash
# 检查.env文件中的OPENAI_API_KEY
# 如果在中国大陆,可能需要配置代理

# Python服务中配置代理:
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

## 九、开发技巧

### 9.1 热重载
- **后端**: 添加spring-boot-devtools依赖,自动重启
- **前端**: Vite自带热更新
- **Python**: 使用 `uvicorn main:app --reload`

### 9.2 查看日志
```bash
# 后端日志
tail -f backend/logs/lawrag-backend.log

# Python服务日志
# 直接在终端查看输出

# 前端
# 浏览器开发者工具Console
```

### 9.3 清理数据重新开始
```bash
# 清空数据库
mysql -u root -p
USE lawrag;
TRUNCATE TABLE documents;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE chat_sessions;
TRUNCATE TABLE document_references;

# 清空Milvus
# 在Python服务中调用collection.drop()

# 清空Redis
redis-cli
AUTH 123456
FLUSHDB
```

## 十、生产部署建议

1. **反向代理**: 使用Nginx代理前端和API
2. **HTTPS**: 配置SSL证书
3. **环境变量**: 使用生产环境配置
4. **日志**: 配置日志轮转
5. **监控**: 添加Prometheus + Grafana
6. **备份**: 定期备份MySQL和Milvus数据

---

**祝您使用愉快! 🎉**

如有问题,请查看 README.md 或提交Issue。
