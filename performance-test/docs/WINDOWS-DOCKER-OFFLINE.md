# Windows离线Docker构建与部署指南

## 🎯 概述

本指南提供在Windows环境下构建和部署Docker离线镜像的完整解决方案，支持完全脱机环境下的Docker镜像构建和部署。

## 📋 功能特性

✅ **完全离线构建** - 无需互联网连接即可构建Docker镜像
✅ **自动依赖下载** - 一次性下载所有Maven依赖和Docker基础镜像
✅ **Windows原生支持** - 批处理脚本专为Windows优化
✅ **完整监控栈** - 包含Prometheus + Grafana监控系统
✅ **一键部署** - 自动化构建、部署和健康检查

## 🛠️ 环境要求

### Windows环境要求
- Windows 10/11 Pro或Enterprise版本
- Docker Desktop for Windows (最新版本)
- 至少8GB可用内存
- 至少20GB可用磁盘空间
- PowerShell 5.0+ (Windows 10/11内置)

### 开发环境要求
- Java 21+ (用于离线镜像)
- Maven 3.6+ (用于下载依赖)
- Git (可选，用于版本控制)

## 🚀 快速开始

### 步骤1: 下载离线依赖
```cmd
# 在有网络的环境中运行
scripts\download-offline-dependencies.bat
```

此脚本将：
- 下载所有Maven依赖到 `offline-build/maven-repo`
- 下载Docker基础镜像并保存为tar文件
- 创建离线构建配置

### 步骤2: 传输到离线环境
```cmd
# 将整个 offline-build 目录复制到离线机器
# 包含以下内容：
# - maven-repo/ (Maven依赖库)
# - docker-images/ (Docker基础镜像)
# - Dockerfile.offline (离线Dockerfile)
# - build-offline.bat (离线构建脚本)
# - docker-compose.offline.yml (离线部署文件)
```

### 步骤3: 在离线环境中构建
```cmd
# 在离线机器上运行
build-offline.bat
```

### 步骤4: 部署应用
```cmd
# 启动完整应用栈
deploy-offline.bat
```

## 📁 文件结构

```
spring-boot-performance-test/
├── scripts/
│   ├── download-offline-dependencies.bat  # 下载离线依赖
│   ├── build-offline.bat                 # 离线构建
│   ├── deploy-offline.bat               # 离线部署
│   └── cleanup-offline.bat             # 清理脚本
├── Dockerfile.offline                  # 离线Dockerfile
├── docker-compose.offline.yml          # 离线Docker Compose
├── offline-build/                     # 离线构建目录(运行时生成)
│   ├── maven-repo/                   # Maven依赖库
│   ├── docker-images/                 # Docker基础镜像
│   ├── Dockerfile.offline             # 复制的离线Dockerfile
│   ├── build-offline.bat             # 复制的构建脚本
│   └── docker-compose.offline.yml   # 复制的部署文件
└── monitoring/                       # 监控配置
    ├── prometheus.yml
    └── grafana/
```

## 🔧 详细使用说明

### 1. 下载离线依赖 (online-environment.bat)

在有网络连接的环境中运行：

```cmd
cd scripts
download-offline-dependencies.bat
```

**执行内容：**
- ✅ 下载所有Maven项目依赖
- ✅ 下载Docker基础镜像 (openjdk:21-jdk-slim, prom/prometheus, grafana/grafana)
- ✅ 创建离线构建配置
- ✅ 生成部署包脚本

**生成的文件：**
```
offline-build/
├── maven-repo/                    # ~500MB+ Maven依赖
├── docker-images/                  # ~2GB+ Docker镜像
│   ├── openjdk.tar
│   ├── prom.tar
│   └── grafana.tar
├── Dockerfile.offline            # 离线Dockerfile
├── build-offline.bat           # 构建脚本
├── docker-compose.offline.yml # 部署配置
└── README-OFFLINE.txt          # 离线部署说明
```

### 2. 离线环境构建 (build-offline.bat)

在离线环境中：

```cmd
# 确保Docker Desktop正在运行
build-offline.bat
```

**构建过程：**
1. 检查Docker环境
2. 加载本地Docker镜像
3. 使用离线Maven仓库构建应用镜像
4. 验证构建结果
5. 创建Docker网络

### 3. 离线环境部署 (deploy-offline.bat)

```cmd
deploy-offline.bat
```

**部署过程：**
1. 停止现有容器
2. 加载监控镜像
3. 启动完整应用栈
4. 等待服务就绪
5. 显示服务URL

### 4. 清理环境 (cleanup-offline.bat)

```cmd
cleanup-offline.bat
```

**清理内容：**
- 停止并删除所有离线容器
- 删除离线镜像
- 清理Docker网络
- 删除未使用的Docker资源

## 🌐 服务访问

部署完成后，可通过以下地址访问服务：

| 服务 | 地址 | 说明 |
|------|------|------|
| **应用主页** | http://localhost:8080 | Spring Boot应用 |
| **健康检查** | http://localhost:8080/actuator/health | 应用健康状态 |
| **应用指标** | http://localhost:8080/actuator/prometheus | Prometheus格式指标 |
| **Prometheus** | http://localhost:9090 | 监控数据收集 |
| **Grafana** | http://localhost:3000 | 监控仪表板 |
| **Nginx** | http://localhost:80 | 负载均衡器 (可选) |

**登录信息：**
- Grafana: admin/admin123
- Prometheus: 无需认证

## 📊 性能测试

离线部署后，可使用内置的压测脚本：

```cmd
# 快速测试
scripts\quick-test.bat

# Apache Bench测试 (3000 QPS)
scripts\load-test.bat 3000

# WRK高级测试
scripts\wrk-test.bat --compare 10000
```

## 🔍 故障排除

### 常见问题

#### 1. Docker Desktop未启动
```cmd
# 症状
Error: Docker is not installed or not running

# 解决方案
# 启动Docker Desktop并等待完全就绪
```

#### 2. 端口被占用
```cmd
# 症状
Error: Port 8080 is already in use

# 解决方案
netstat -ano | findstr :8080
taskkill /PID <PID> /F
# 或修改docker-compose.offline.yml中的端口映射
```

#### 3. 内存不足
```cmd
# 症状
docker: Error response from daemon: Container failed to start

# 解决方案
# 1. 增加Docker Desktop内存限制到8GB+
# 2. 减少docker-compose.offline.yml中的mem_limit
# 3. 关闭不必要的应用程序
```

#### 4. Maven依赖不完整
```cmd
# 症状
Failed to execute goal on project: Could not resolve dependencies

# 解决方案
# 重新运行下载脚本
scripts\download-offline-dependencies.bat
# 确保网络连接稳定
```

#### 5. 镜像构建失败
```cmd
# 症状
Error: Docker build failed

# 解决方案
# 1. 检查Dockerfile.offline语法
# 2. 验证maven-repo目录完整性
# 3. 查看详细构建日志
docker build -f Dockerfile.offline -t performance-test-app:offline . --progress=plain
```

### 调试命令

```cmd
# 查看容器日志
docker-compose -f docker-compose.offline.yml logs -f

# 进入容器调试
docker exec -it performance-test-offline bash

# 检查镜像
docker images

# 检查网络
docker network ls

# 检查容器状态
docker-compose -f docker-compose.offline.yml ps
```

## 📦 自定义配置

### 修改JVM参数
编辑 `docker-compose.offline.yml`:
```yaml
environment:
  - JAVA_OPTS=-Xms4g -Xmx8g -XX:+UseG1GC -XX:+UseStringDeduplication
```

### 修改端口映射
```yaml
ports:
  - "9080:8080"  # 将8080映射到主机9080端口
```

### 修改资源限制
```yaml
mem_limit: 8g    # 内存限制
cpus: 4.0       # CPU限制
```

## 🔄 升级和维护

### 更新依赖
```cmd
# 在有网络的环境中
cd scripts
download-offline-dependencies.bat
# 重新传输offline-build目录到离线环境
```

### 备份配置
```cmd
# 备份当前离线配置
xcopy /E /I /Y offline-build backup\offline-build-$(date:~-4,4)$(date:~-7,2)$(date:~-10,2)
```

### 版本管理
```cmd
# 为不同版本创建不同的离线包
set VERSION=1.2.0
set OFFLINE_DIR=offline-build-v%VERSION%
```

## 📈 性能优化建议

### 构建优化
1. **SSD存储**: 将离线包放在SSD上提高IO性能
2. **内存设置**: Docker Desktop分配8GB+内存
3. **并行构建**: 启用Docker BuildKit并行构建

### 运行优化
1. **资源限制**: 根据硬件调整内存和CPU限制
2. **网络配置**: 使用专用Docker网络提高性能
3. **日志配置**: 减少日志输出提高性能

## 🎯 最佳实践

1. **定期更新**: 定期在有网络环境下更新离线依赖
2. **版本控制**: 为不同版本保存独立的离线包
3. **监控告警**: 配置Grafana告警规则
4. **备份恢复**: 定期备份配置和监控数据
5. **安全考虑**: 修改默认密码和安全配置

## 📞 技术支持

### 日志文件位置
- 应用日志: `logs/` 目录
- Docker日志: `docker logs` 命令
- 构建日志: 构建过程中的控制台输出

### 配置文件说明
- `Dockerfile.offline`: 离线构建配置
- `docker-compose.offline.yml`: 离线部署配置
- `offline-build/README-OFFLINE.txt`: 离线部署详细说明

通过这套完整的离线Docker解决方案，您可以在完全断网的环境中成功构建和部署Spring Boot性能测试应用！