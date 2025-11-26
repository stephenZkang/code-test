# LearnEnglish - 快速开始指南

## 🚀 5分钟快速上手

### 方式一：使用启动脚本 (推荐)

```bash
# 双击运行
start.bat

# 或在命令行中运行
.\start.bat
```

选择选项 1 进行完整启动，脚本将自动：
- 启动后端服务
- 启动前端服务
- 打开浏览器访问应用

### 方式二：手动启动

#### 步骤 1: 数据库设置

```bash
# 运行数据库设置脚本
.\setup-database.bat

# 或手动执行 SQL
mysql -u root -proot < database/schema.sql
mysql -u root -proot < database/seed.sql
```

#### 步骤 2: 启动后端

```bash
cd learn-english-backend
mvn spring-boot:run
```

等待看到 "LearnEnglish Backend Started Successfully!" 消息

#### 步骤 3: 启动前端

```bash
# 新开一个终端
cd learn-english-frontend
npm install  # 首次运行需要
npm run dev
```

#### 步骤 4: 访问应用

打开浏览器访问: **http://localhost:3000**

### 方式三：Docker 部署

```bash
# 一键启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps

# 访问应用
# 后端: http://localhost:8080
# 前端: http://localhost:3000 (如果配置了前端容器)
```

---

## 🎯 功能快速体验

### 1. 学习单词 (首页)
- 点击卡片翻转查看中文
- 向左滑动跳过单词
- 向右滑动标记为已学习
- 点击扬声器图标听发音
- 点击书签图标收藏单词

### 2. 练习测试 (练习页)
- 选择题型：选择题/填空题/听力题
- 点击"开始练习"生成10道题
- 提交答案查看实时反馈
- 完成后查看成绩统计

### 3. 查看进度 (进度页)
- 查看连续学习天数
- 查看已学习和已掌握单词数
- 查看练习统计和正确率
- 解锁成就徽章

### 4. 设置 (设置页)
- 切换深色/浅色主题
- 配置学习提醒
- 查看应用信息

---

## 📌 常用操作

### 添加新单词

通过 API:
```bash
curl -X POST http://localhost:8080/api/words \
  -H "Content-Type: application/json" \
  -d '{
    "english": "study",
    "chinese": "学习",
    "pronunciation": "/ˈstʌdi/",
    "category": "education",
    "difficulty": 1,
    "exampleSentence": "I study English every day."
  }'
```

或直接在数据库中插入：
```sql
INSERT INTO words (english, chinese, pronunciation, category, difficulty, example_sentence)
VALUES ('study', '学习', '/ˈstʌdi/', 'education', 1, 'I study English every day.');
```

### 查看API文档

访问后端 API 端点:
- 获取单词列表: http://localhost:8080/api/words
- 获取随机单词: http://localhost:8080/api/words/random?limit=10
- 获取学习进度: http://localhost:8080/api/progress
- 获取成就列表: http://localhost:8080/api/achievements

### 重置学习进度

```sql
-- 清除所有进度数据
TRUNCATE TABLE progress;
TRUNCATE TABLE exercises;
TRUNCATE TABLE learning_sessions;
TRUNCATE TABLE user_achievements;
```

---

## 🔧 故障排除

### 后端无法启动
```bash
# 检查 Java 版本
java -version  # 应该是 17 或更高

# 检查 Maven
mvn -version

# 检查 MySQL
mysql -u root -proot -e "SHOW DATABASES;"
```

### 前端无法访问后端
```bash
# 确认后端正在运行
curl http://localhost:8080/api/words

# 检查 .env 文件
cat learn-english-frontend/.env
# 应该包含: VITE_API_BASE_URL=http://localhost:8080
```

### 数据库连接错误
```bash
# 检查 MySQL 是否运行
# Windows: 任务管理器 > 服务 > MySQL
# 或运行: sc query MySQL80 (替换为你的 MySQL 服务名)

# 检查连接
mysql -h 127.0.0.1 -u root -proot -e "SELECT 1;"
```

---

## 📱 移动端使用

### 方法 1: PWA (最简单)
1. 在手机浏览器中访问应用 URL
2. iOS: Safari > 分享 > 添加到主屏幕
3. Android: Chrome > 菜单 > 添加到主屏幕

### 方法 2: 打包 APK
详见 [DEPLOYMENT.md](./DEPLOYMENT.md#移动应用打包)

---

## 📚 更多资源

- 完整文档: [README.md](./README.md)
- 部署指南: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 项目地址: `d:\Antigravity\code-test`

---

## 💡 使用技巧

1. **每日坚持**: 每天至少学习10个新单词
2. **及时复习**: 关注"待复习"标签，及时复习到期单词
3. **多做练习**: 通过不同题型巩固记忆
4. **收藏重点**: 标记难记的单词，重点复习
5. **查看进度**: 定期查看学习统计，保持动力

---

## 🎉 开始学习

现在你已经准备好了！打开应用开始你的英语学习之旅吧！

**Good luck with your English learning!** 🚀

