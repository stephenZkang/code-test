# 生产环境部署快速指南

## 🚀 三步部署到生产环境

### 步骤 1: 部署前端到 Vercel

```bash
# 1. 推送代码到 GitHub
git add .
git commit -m "Production ready"
git push origin main

# 2. 在 Vercel 中导入项目
# - 访问 https://vercel.com
# - 点击 "New Project"
# - 导入 GitHub 仓库
# - Root Directory: frontend
# - 点击 Deploy

# 3. 设置环境变量（Vercel Dashboard）
REACT_APP_SUPABASE_URL=https://hxfpkgogadyggqqiedte.supabase.co
REACT_APP_SUPABASE_ANON_KEY=你的anon_key
REACT_APP_API_URL=https://你的后端域名.railway.app
```

### 步骤 2: 部署后端到 Railway

```bash
# 1. 在 Railway 中创建项目
# - 访问 https://railway.app
# - 使用 GitHub 登录
# - 点击 "New Project"
# - 选择 GitHub 仓库

# 2. 设置环境变量（Railway Dashboard）
SUPABASE_URL=https://hxfpkgogadyggqqiedte.supabase.co
SUPABASE_SERVICE_KEY=你的service_role_key
PORT=3001
NODE_ENV=production

# 3. 获取部署 URL
# Railway Dashboard → Settings → Domains
```

### 步骤 3: 配置 Supabase 生产环境

```sql
-- 1. 启用备份（Dashboard → Database → Backups）

-- 2. 添加索引优化
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_word_id ON user_progress(word_id);

-- 3. 验证 RLS 策略
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## ✅ 部署验证

### 测试前端
```
访问: https://你的项目.vercel.app
- 注册账号
- 学习单词
- 完成练习
```

### 测试后端
```bash
curl https://你的后端.railway.app/health
# 应返回: {"status":"ok","message":"LingoLearn API is running"}
```

---

## 🔐 安全检查

- [ ] 前端只使用 anon key
- [ ] 后端使用 service_role key
- [ ] HTTPS 已启用
- [ ] CORS 已配置
- [ ] 环境变量未提交到 Git

---

## 📊 成本估算

- Vercel (前端): **$0/月** (Hobby)
- Railway (后端): **$0-5/月** (Starter)
- Supabase: **$0/月** (Free)

**总计**: $0-5/月

---

## 🎯 完整文档

查看详细部署文档: [production_deployment.md](file:///C:/Users/qiaok/.gemini/antigravity/brain/9c7abe20-8e37-4642-8961-1f56770457a6/production_deployment.md)
