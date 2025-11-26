# LearnEnglish - 部署指南

本文档提供详细的部署说明，包括本地开发环境、Docker 容器部署和移动应用打包。

## 📑 目录

- [环境准备](#环境准备)
- [本地开发部署](#本地开发部署)
- [Docker 生产部署](#docker-生产部署)
- [移动应用打包](#移动应用打包)
- [生产环境配置](#生产环境配置)

---

## 🔧 环境准备

### 系统要求

- **操作系统**: Windows 10/11, macOS, Linux
- **内存**: 最低 4GB，推荐 8GB+
- **磁盘空间**: 最低 2GB

### 必需软件

1. **Node.js** (v16.0.0+)
   - 下载: https://nodejs.org/
   - 验证安装: `node --version`

2. **Java JDK** (17+)
   - 下载: https://adoptium.net/
   - 验证安装: `java --version`

3. **Maven** (3.6+)
   - 下载: https://maven.apache.org/download.cgi
   - 验证安装: `mvn --version`

4. **MySQL** (8.0+)
   - 下载: https://dev.mysql.com/downloads/mysql/
   - 或使用 Docker: `docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0`

5. **Docker & Docker Compose** (可选，用于容器化部署)
   - 下载: https://www.docker.com/products/docker-desktop

---

## 💻 本地开发部署

### 步骤 1: 数据库初始化

#### 方法 A: 使用 MySQL 命令行

```bash
# Windows PowerShell
# 注意：需要将 mysql 添加到环境变量PATH中
# 例如: C:\Program Files\MySQL\MySQL Server 8.0\bin

# 1. 登录 MySQL
mysql -u root -p

# 2. 执行以下 SQL（或者执行脚本文件）
source d:/Antigravity/code-test/database/schema.sql
source d:/Antigravity/code-test/database/seed.sql

# 3. 退出
exit
```

#### 方法 B: 使用 MySQL Workbench

1. 打开 MySQL Workbench
2. 连接到本地 MySQL 服务器
3. 打开 `database/schema.sql` 文件
4. 点击执行 (⚡ 图标)
5. 打开 `database/seed.sql` 文件
6. 点击执行

#### 方法 C: 使用 Docker

```bash
# 仅启动 MySQL 容器
docker-compose up mysql -d

# 数据库会自动初始化
```

### 步骤 2: 启动后端服务

```bash
# 进入后端目录
cd d:\Antigravity\code-test\learn-english-backend

# 清理并安装依赖
mvn clean install -DskipTests

# 启动 Spring Boot 应用
mvn spring-boot:run

# 或者使用 JAR 文件运行
# mvn package -DskipTests
# java -jar target/learn-english-backend-1.0.0.jar
```

**验证**: 访问 http://localhost:8080/api/words 应该返回单词列表

### 步骤 3: 启动前端服务

```bash
# 新建终端窗口
# 进入前端目录
cd d:\Antigravity\code-test\learn-english-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**访问应用**: 打开浏览器访问 http://localhost:3000

---

## 🐳 Docker 生产部署

### 前提条件

确保已安装 Docker 和 Docker Compose。

### 完整部署流程

#### 1. 准备环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 根据需要编辑 .env 文件
```

#### 2. 构建并启动服务

```bash
# 在项目根目录执行
cd d:\Antigravity\code-test

# 构建并启动所有服务
docker-compose up --build -d
```

#### 3. 查看服务状态

```bash
# 查看所有容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
```

#### 4. 验证部署

```bash
# 检查 MySQL
docker-compose exec mysql mysql -u root -proot -e "SHOW DATABASES;"

# 检查后端 API
curl http://localhost:8080/api/words

# 访问前端 (如果部署了前端容器)
# http://localhost:80
```

### 服务管理命令

```bash
# 停止所有服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器及数据卷
docker-compose down -v

# 重启服务
docker-compose restart

# 重启特定服务
docker-compose restart backend

# 查看资源使用情况
docker stats
```

### 数据备份与恢复

#### 备份数据库

```bash
# 备份数据库到文件
docker-compose exec mysql mysqldump -u root -proot learn_english > backup.sql

# 或使用 Docker 命令
docker exec learnenglish-mysql mysqldump -u root -proot learn_english > backup.sql
```

#### 恢复数据库

```bash
# 从备份文件恢复
docker-compose exec -T mysql mysql -u root -proot learn_english < backup.sql
```

---

## 📱 移动应用打包

### Android APK 打包

#### 前提条件

- Android Studio (最新版本)
- Android SDK
- JDK 17+

#### 打包步骤

```bash
# 1. 进入前端目录
cd d:\Antigravity\code-test\learn-english-frontend

#2. 安装 Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. 初始化 Capacitor
npx cap init LearnEnglish com.learnenglish.app --web-dir=dist

# 4. 构建生产版本
npm run build

# 5. 添加 Android 平台
npx cap add android

# 6. 配置 API 地址（编辑 .env.production）
echo "VITE_API_BASE_URL=http://your-server-ip:8080" > .env.production

# 7. 重新构建并同步
npm run build
npx cap sync android

# 8. 打开 Android Studio
npx cap open android
```

#### 在 Android Studio 中:

1. 等待 Gradle 构建完成
2. 配置签名密钥 (Build > Generate Signed Bundle / APK)
3. 选择 `Build > Build Bundle(s) / APK(s) > Build APK(s)`
4. APK 文件位置: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 发布版 APK

```bash
# 在 Android Studio 中
# 1. Build > Generate Signed Bundle / APK
# 2. 选择 APK
# 3. 创建或选择密钥库
# 4. 选择 release 构建变体
# 5. 生成 APK
```

### iOS 打包 (需要 macOS)

#### 前提条件

- macOS
- Xcode (最新版本)
- Apple Developer 账号

#### 打包步骤

```bash
# 1. 安装 Capacitor iOS
npm install @capacitor/ios

# 2. 添加 iOS 平台
npx cap add ios

# 3. 构建并同步
npm run build
npx cap sync ios

# 4. 打开 Xcode
npx cap open ios
```

#### 在 Xcode 中:

1. 配置团队和Bundle ID
2. 配置签名证书
3. 选择目标设备或模拟器
4. Product > Archive
5. Distribute App > App Store Connect
6. 上传到 App Store

### PWA (推荐)

应用已配置为 PWA，用户可以直接在手机浏览器中访问并"添加到主屏幕"，无需打包：

1. 在手机浏览器中访问应用 URL
2. iOS Safari: 点击"分享" > "添加到主屏幕"
3. Android Chrome: 点击"菜单" > "添加到主屏幕"

---

## 🌐 生产环境配置

### 后端生产配置

#### 创建生产配置文件

`learn-english-backend/src/main/resources/application-prod.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://production-db-host:3306/learn_english?useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

server:
  port: 8080
  compression:
    enabled: true

logging:
  level:
    com.learnenglish: INFO
  file:
    name: /var/log/learnenglish/application.log
```

#### 使用生产配置启动

```bash
java -jar -Dspring.profiles.active=prod target/learn-english-backend-1.0.0.jar
```

### 前端生产配置

#### 构建生产版本

```bash
cd learn-english-frontend

# 设置生产环境 API 地址
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production

# 构建
npm run build

# dist 目录包含可部署的静态文件
```

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/learnenglish/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/HTTPS 配置

使用 Let's Encrypt 获取免费 SSL 证书:

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 性能优化

1. **后端优化**
   - 启用数据库连接池
   - 配置适当的 JVM 参数: `-Xms512m -Xmx2g`
   - 启用 HTTP 压缩

2. **前端优化**
   - 启用 Gzip 压缩
   - 配置CDN
   - 启用浏览器缓存

3. **数据库优化**
   - 创建必要的索引
   - 定期备份数据
   - 监控查询性能

### 监控和日志

#### 应用健康检查

```bash
# 检查后端状态
curl http://localhost:8080/actuator/health
```

#### 日志收集

```bash
# 查看应用日志
docker-compose logs -f backend

# 持久化日志
docker-compose logs backend > logs/backend-$(date +%Y%m%d).log
```

---

## 🔒 安全建议

1. **修改默认密码**: 不要在生产环境使用 root/root
2. **启用 HTTPS**: 使用 SSL/TLS 加密通信
3. **配置防火墙**: 只开放必要的端口
4. **定期更新**: 保持依赖包和系统更新
5. **备份数据**: 定期备份数据库

---

## ❓ 常见问题

### Q: 数据库连接失败怎么办？
A: 检查 MySQL 是否运行，用户名密码是否正确，3306 端口是否开放。

### Q: Docker 构建失败？
A: 确保 Docker 有足够磁盘空间，检查网络连接，尝试清理 Docker 缓存: `docker system prune -a`

### Q: 移动端无法连接后端？
A: 确保后端 API 地址使用服务器的公网 IP 或域名，而不是 localhost。

### Q: 如何扩展单词库？
A: 可以通过 SQL 脚本批量导入，或使用后端 API 逐个添加。

---

## 📞 技术支持

如有问题，请提交 Issue 或联系开发团队。

---

*最后更新: 2024-11-25*
