# 态势大屏系统 - 登录与用户管理设计文档

## 1. 概述
本项目在原有的态势感知大屏系统基础上，增加了完整的用户认证与授权体系。支持多用户协作、权限控制以及基础的用户管理功能。

## 2. 技术栈
- **后端**: FastAPI, SQLAlchemy, JWT (python-jose), Passlib (bcrypt)
- **前端**: Vue 3, Vuex, Vue Router, Element Plus

## 3. 功能设计

### 3.1 身份验证 (Authentication)
- **JWT 机制**: 采用 JSON Web Token 进行状态无关的认证。
- **登录流程**: 
  1. 用户提交用户名和密码。
  2. 后端验证密码哈希。
  3. 生成包含 `sub` (用户名) 和 `exp` (过期时间) 的 Token。
  4. 前端将 Token 存储在 `localStorage` 并在后续请求的 `Authorization` 头中携带。

### 3.2 用户管理 (User Management)
- **RBAC 模型**: 基础的角色控制，分为“管理员”和“普通用户”。
- **管理员权限**:
  - 创建新用户
  - 禁用/激活用户
  - 修改用户信息
  - 删除用户（禁止删除自己）
- **普通用户权限**:
  - 查看、编辑大屏
  - 管理数据源与数据集
  - 修改个人密码

### 3.3 数据库模型 (`User`)
- `id`: 唯一标识
- `username`: 登录名 (Unique)
- `email`: 电子邮箱 (Unique)
- `hashed_password`: Bcrypt 加密后的密码
- `full_name`: 用户真实姓名
- `is_active`: 账户状态
- `is_admin`: 权限标识
- `created_at/updated_at`: 时间戳

## 4. 接口说明 (API)
- `POST /api/users/login`: 登录
- `GET /api/users/me`: 获取个人信息
- `POST /api/users/change-password`: 修改密码
- `GET /api/users/`: [Admin] 用户列表
- `POST /api/users/`: [Admin] 创建用户
- `PUT /api/users/{id}`: [Admin] 更新用户
- `DELETE /api/users/{id}`: [Admin] 删除用户
