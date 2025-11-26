# LearnEnglish - 智能英语学习应用

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

一个基于间隔重复算法的全栈英语单词学习应用

[功能特色](#功能特色) • [技术栈](#技术栈) • [快速开始](#快速开始) • [部署](#部署)

</div>

---

## 📖 项目简介

LearnEnglish 是一个现代化的英语单词学习平台，采用科学的间隔重复算法 (Spaced Repetition) 帮助用户高效记忆单词。应用提供了丰富的学习功能，包括单词卡片、多种练习类型、进度跟踪和成就系统。

## ✨ 功能特色

### 前端功能
- **📚 单词学习**
  - 精美的卡片翻转动画
  - 语音发音播放
  - 左右滑动手势控制
  - 单词收藏标记
  
- **✍️ 练习测试**
  - 多选题 (Multiple Choice)
  - 填空题 (Fill in the Blank)
  - 听力题 (Listening)
  - 实时答题反馈
  - 计时答题系统

- **📊 学习进度**
  - 可视化统计图表
  - 连续学习天数追踪
  - 掌握词汇量统计
  - 成就徽章系统

- **⚙️ 设置**
  - 深色/浅色主题切换
  - 学习提醒设置
  - 每日目标配置

### 后端功能
- **📝 单词管理**
  - 单词增删改查
  - 分类筛选
  - 随机获取

- **🎯 进度追踪**
  - 学习数据记录
  - 连续天数计算
  - 掌握度统计

- **🧪 练习系统**
  - 自动生成题目
  - 答案提交与评分
  - 历史记录查询

- **🧠 智能算法**
  - SM-2 间隔重复算法
  - 智能推荐复习单词
  - 动态调整复习间隔

## 🛠️ 技术栈

### 前端
- **框架**: React 18
- **UI 库**: Chakra UI
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **图表**: Recharts
- **构建工具**: Vite
- **手势库**: react-swipeable

### 后端
- **框架**: Spring Boot 3.2
- **ORM**: MyBatis
- **数据库**: MySQL 8.0
- **构建工具**: Maven
- **Java 版本**: 17

### 部署
- **容器化**: Docker & Docker Compose
- **移动端**: Capacitor (Android/iOS)

## 📋 前置要求

### 开发环境
- Node.js >= 16.0.0
- Java JDK >= 17
- Maven >= 3.6
- MySQL >= 8.0
- Docker & Docker Compose (可选，用于容器化部署)

### 生产环境
- Docker & Docker Compose

## 🚀 快速开始

### 1. 克隆项目

```bash
cd d:\Antigravity\code-test
```

### 2. 数据库设置

#### 方式一：手动设置 MySQL

```bash
# 启动 MySQL 服务
# 确保 MySQL 运行在 127.0.0.1:3306

# 创建数据库并导入数据
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

#### 方式二：使用 Docker

```bash
docker-compose up mysql -d
```

### 3. 启动后端服务

```bash
cd learn-english-backend

# 安装依赖并编译
mvn clean install

# 启动服务
mvn spring-boot:run
```

后端服务将运行在 `http://localhost:8080`

### 4. 启动前端服务

```bash
cd learn-english-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将运行在 `http://localhost:3000`

### 5. 访问应用

打开浏览器访问: `http://localhost:3000`

## 🐳 Docker 部署

### 完整部署 (推荐)

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

服务将在以下端口运行:
- MySQL: `3306`
- 后端 API: `8080`
- 前端应用: `3000` (开发模式)

### 仅部署后端

```bash
# 启动 MySQL 和后端
docker-compose up mysql backend -d
```

## 📱 移动端打包

### Android APK

```bash
cd learn-english-frontend

# 安装 Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# 初始化 Capacitor
npx cap init LearnEnglish com.learnenglish.app

# 构建 Web 应用
npm run build

# 添加 Android 平台
npx cap add android

# 同步代码到 Android
npx cap sync android

# 打开 Android Studio 进行构建
npx cap open android
```

在 Android Studio 中:
1. 等待 Gradle 同步完成
2. 选择 `Build > Build Bundle(s) / APK(s) > Build APK(s)`
3. APK 文件将生成在 `android/app/build/outputs/apk/`

### iOS (需要 macOS)

```bash
cd learn-english-frontend

# 安装 Capacitor iOS
npm install @capacitor/ios

# 添加 iOS 平台
npx cap add ios

# 同步代码到 iOS
npx cap sync ios

# 打开 Xcode
npx cap open ios
```

在 Xcode 中:
1. 配置开发者账号
2. 选择目标设备
3. Product > Archive
4. 导出 IPA 文件

### PWA (渐进式 Web 应用)

应用已配置为 PWA，可在移动浏览器中"添加到主屏幕"进行安装，无需打包。

## 📚 API 文档

### 核心 API 端点

#### 单词管理
- `GET /api/words` - 获取所有单词
- `GET /api/words/random?limit=10` - 获取随机单词
- `GET /api/words/{id}` - 获取指定单词
- `POST /api/words` - 创建新单词
- `PUT /api/words/{id}` - 更新单词
- `DELETE /api/words/{id}` - 删除单词

#### 进度追踪
- `GET /api/progress` - 获取学习进度统计
- `POST /api/progress/update` - 更新学习进度
- `GET /api/progress/history` - 获取学习历史
- `GET /api/progress/due` - 获取待复习单词
- `GET /api/progress/bookmarked` - 获取收藏单词

#### 练习系统
- `GET /api/exercises/generate` - 生成练习题
- `POST /api/exercises/submit` - 提交练习答案
- `GET /api/exercises/history` - 获取练习历史
- `GET /api/exercises/stats` - 获取练习统计

#### 成就系统
- `GET /api/achievements` - 获取所有成就
- `GET /api/achievements/user` - 获取用户成就
- `POST /api/achievements/check` - 检查并解锁成就

详细的 API 文档请参考 [API.md](./docs/API.md)

## 🗂️ 项目结构

```
code-test/
├── learn-english-backend/          # Spring Boot 后端
│   ├── src/main/java/
│   │   └── com/learnenglish/
│   │       ├── controller/         # REST 控制器
│   │       ├── service/            # 业务逻辑层
│   │       ├── mapper/             # MyBatis Mapper 接口
│   │       ├── model/              # 数据模型
│   │       ├── dto/                # 数据传输对象
│   │       └── config/             # 配置类
│   ├── src/main/resources/
│   │   ├── mapper/                 # MyBatis XML 映射文件
│   │   └── application.yml         # 应用配置
│   ├── Dockerfile
│   └── pom.xml
│
├── learn-english-frontend/         # React 前端
│   ├── src/
│   │   ├── components/             # React 组件
│   │   ├── pages/                  # 页面组件
│   │   ├── services/               # API 服务
│   │   ├── hooks/                  # 自定义 Hooks
│   │   ├── theme/                  # UI 主题配置
│   │   ├── App.jsx                 # 主应用组件
│   │   └── main.jsx                # 入口文件
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/                       # 数据库脚本
│   ├── schema.sql                  # 表结构
│   └── seed.sql                    # 初始数据
│
├── docker-compose.yml              # Docker Compose 配置
├── .env.example                    # 环境变量示例
└── README.md                       # 项目文档
```

## 🔧 配置说明

### 后端配置

编辑 `learn-english-backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/learn_english
    username: root
    password: root
```

### 前端配置

复制 `.env.example` 为 `.env` 并修改:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🐛 故障排除

### 数据库连接失败
- 确保 MySQL 服务正在运行
- 检查数据库用户名和密码是否正确
- 确认数据库 `learn_english` 已创建

### 后端启动失败
- 检查 Java 版本是否为 17 或更高
- 确认Maven 依赖已正确下载
- 查看日志输出获取详细错误信息

### 前端无法连接后端
- 确认后端服务已启动 (http://localhost:8080)
- 检查 `.env` 文件中的 API 地址配置
- 查看浏览器控制台的网络请求

### Docker 部署问题
- 确保 Docker 和 Docker Compose 已安装
- 检查端口 3306, 8080 是否被占用
- 使用 `docker-compose logs` 查看详细日志

## 📝 开发指南

### 添加新单词

可以通过后端 API 或直接向数据库插入:

```sql
INSERT INTO words (english, chinese, pronunciation, category, difficulty, example_sentence)
VALUES ('example', '例子', '/ɪɡˈzɑːmpl/', 'common', 2, 'This is an example.');
```

### 自定义主题

修改 `learn-english-frontend/src/theme/theme.js` 中的颜色配置。

### 扩展题型

在 `ExerciseService.java` 中添加新的题型生成逻辑。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License

## 👨‍💻 作者

LearnEnglish Team

## 🙏 致谢

感谢所有开源项目的贡献者!

---

<div align="center">
Made with ❤️ by LearnEnglish Team
</div>
