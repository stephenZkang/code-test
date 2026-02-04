# 态势大屏系统 - 数据库表结构设计文档

## 1. 概述
本项目使用 SQLite 作为默认数据库，通过 SQLAlchemy ORM 进行数据操作。数据库包含用户权限、数据源管理、可视化配置等核心表结构。

## 2. 表结构详细说明

### 2.1 用户表 (`users`)
存储用户信息及权限配置。

| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| id | Integer | 唯一标识 | 主键 |
| username | String(50) | 用户登录名 | 唯一, 索引 |
| email | String(100) | 电子邮箱 | 唯一, 索引 |
| hashed_password | String(100) | 加密后的密码 | 不允许为空 |
| full_name | String(100) | 真实姓名 | - |
| is_active | Boolean | 账号是否激活 | 默认为 True |
| is_admin | Boolean | 是否为管理员 | 默认为 False |
| created_at | DateTime | 创建时间 | 默认为当前时间 |
| updated_at | DateTime | 最后更新时间 | 自动更新 |

### 2.2 数据源表 (`datasources`)
管理外部数据接入配置。

| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| id | Integer | 唯一标识 | 主键 |
| name | String(100) | 数据源名称 | 不允许为空 |
| type | String(50) | 类型 (mysql, postgresql, api, file) | 不允许为空 |
| connection_config | JSON | 连接配置信息 (Host, Port, Token等) | 不允许为空 |
| description | Text | 详细描述 | - |
| created_at | DateTime | 创建时间 | - |
| updated_at | DateTime | 更新时间 | - |

### 2.3 数据集表 (`datasets`)
定义具体的数据查询逻辑。

| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| id | Integer | 唯一标识 | 主键 |
| name | String(100) | 数据集名称 | 不允许为空 |
| datasource_id | Integer | 关联的数据源 ID | 外键 (datasources.id) |
| query_config | JSON | 查询配置 (SQL语句或API路径) | 不允许为空 |
| refresh_interval | Integer | 自动刷新间隔 (秒) | 默认为 300 |
| description | Text | 描述 | - |

### 2.4 大屏主表 (`dashboards`)
存储大屏的基础信息与全局配置。

| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| id | Integer | 唯一标识 | 主键 |
| name | String(100) | 内部识别名称 | 不允许为空 |
| title | String(200) | 大屏展示标题 | 不允许为空 |
| layout_config | JSON | 全局布局配置 | - |
| is_public | Boolean | 是否公开访问 | 默认为 False |

### 2.5 大屏组件表 (`widgets`)
存储大屏上的具体可视化组件配置。

| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| id | Integer | 唯一标识 | 主键 |
| dashboard_id | Integer | 所属大屏 ID | 外键 (dashboards.id) |
| dataset_id | Integer | 绑定的数据集 ID | 外键 (datasets.id) |
| type | String(50) | 组件类型 (chart, table, 3d_city等) | 不允许为空 |
| config | JSON | 组件样式、标题等详细配置 | 不允许为空 |
| position | JSON | 位置与尺寸 (x, y, w, h) | 不允许为空 |

### 2.6 告警记录表 (`alarms`)
存储系统或业务告警信息。

| 字段名 | 类型 | 说明 | 约束 |
| :--- | :--- | :--- | :--- |
| id | Integer | 唯一标识 | 主键 |
| level | String(20) | 告警级别 (critical, warning, info) | - |
| message | Text | 告警内容 | - |
| source | String(100) | 告警来源 | - |
| is_read | Boolean | 是否已读 | 默认为 False |

## 3. 关系映射
- **Dashboard -> Widget**: 一对多。删除大屏时通常应级联删除相关组件。
- **DataSource -> Dataset**: 一对多。
- **Dataset -> Widget**: 一对多。组件通过数据集获取展示内容。
