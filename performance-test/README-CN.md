# Spring Boot 性能测试应用 [中文版]

一个全面的性能测试应用，用于比较三种不同的Spring Boot实现：
- 传统Tomcat基础HTTP控制器
- 虚拟线程基础HTTP控制器（Java 21+）
- WebFlux响应式控制器

## 🚀 功能特性

- **三种实现类型**：比较传统线程、虚拟线程和响应式编程
- **多种延迟时长**：50ms、100ms、200ms、500ms、1s的接口
- **性能监控**：内置Prometheus指标收集
- **负载测试**：支持多种QPS级别的综合测试脚本
- **容器支持**：Docker和Docker Compose配置
- **生产就绪**：健康检查、日志记录、部署脚本

## 📋 前置条件

### Java环境
- **Java 21+**（虚拟线程所需）
- Maven 3.6+

### 负载测试工具
- **Apache Bench (ab)** 用于基础负载测试
- **WRK** 用于高级负载测试（推荐）
- **Curl** 用于健康检查

### 可选（用于监控）
- Docker和Docker Compose
- Prometheus和Grafana（包含在docker-compose中）

## 🛠️ 快速开始

### 1. 构建应用

```bash
# 克隆并构建
git clone <仓库地址>
cd spring-boot-performance-test
mvn clean package

# 运行应用
java -jar target/performance-test-app.jar
```

### 2. 快速测试

```bash
# 测试所有接口
./scripts/quick-test.sh

# 或在Windows上
scripts\quick-test.bat
```

### 3. 负载测试

```bash
# 使用Apache Bench测试（3000 QPS）
./scripts/load-test.sh 3000

# 测试所有QPS级别
./scripts/load-test.sh --all

# 比较所有实现的性能（10000 QPS）
./scripts/wrk-test.sh --compare 10000
```

## 🏗️ 项目结构

```
├── src/main/java/com/performance/test/
│   ├── PerformanceTestApplication.java     # 主应用类
│   ├── controller/
│   │   ├── TomcatController.java           # 传统servlet接口
│   │   ├── VirtualThreadController.java    # 虚拟线程接口  
│   │   └── WebFluxController.java         # 响应式接口
│   └── config/
│       └── VirtualThreadConfig.java        # 虚拟线程配置
├── src/main/resources/
│   └── application.properties              # 应用配置
├── scripts/                                # 部署和测试脚本
│   ├── run.sh / run.bat                   # 应用运行器
│   ├── build.sh                          # 构建脚本
│   ├── quick-test.sh                     # 接口验证
│   ├── load-test.sh                      # Apache Bench负载测试
│   └── wrk-test.sh                        # 高级WRK测试
├── monitoring/                             # 监控配置
│   └── prometheus.yml                     # Prometheus配置
├── Dockerfile                             # 容器定义
├── docker-compose.yml                     # 完整监控栈
└── pom.xml                                # Maven配置
```

## 📡 API接口

### 传统Tomcat控制器
```
GET /api/tomcat/sleep/50ms
GET /api/tomcat/sleep/100ms
GET /api/tomcat/sleep/200ms
GET /api/tomcat/sleep/500ms
GET /api/tomcat/sleep/1s
```

### 虚拟线程控制器
```
GET /api/virtual/sleep/50ms
GET /api/virtual/sleep/100ms
GET /api/virtual/sleep/200ms
GET /api/virtual/sleep/500ms
GET /api/virtual/sleep/1s
```

### WebFlux响应式控制器
```
GET /api/webflux/sleep/50ms
GET /api/webflux/sleep/100ms
GET /api/webflux/sleep/200ms
GET /api/webflux/sleep/500ms
GET /api/webflux/sleep/1s
```

### 管理接口
```
GET /actuator/health                       # 健康检查
GET /actuator/metrics                      # 应用指标
GET /actuator/prometheus                   # Prometheus指标
```

## 🎯 QPS测试级别

### 可用QPS级别
- **3000 QPS** - 轻负载
- **5000 QPS** - 中等负载  
- **10000 QPS** - 重负载
- **20000 QPS** - 极重负载
- **30000 QPS** - 极限负载
- **50000 QPS** - 最大测试负载

## 🔧 配置

### 应用属性
- **服务器端口**: 8080
- **Tomcat线程**: 最大200，最小10
- **虚拟线程**: 启用（Java 21+）
- **JVM选项**: -Xms2g -Xmx4g -XX:+UseG1GC

### 环境变量
```bash
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=default
JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication"
```

## 🧪 负载测试

### Apache Bench测试

```bash
# 测试指定QPS
./scripts/load-test.sh 3000

# 测试远程服务器
./scripts/load-test.sh -h example.com -p 9090 5000

# 测试所有QPS级别（3000, 5000, 10000, 20000, 30000, 50000）
./scripts/load-test.sh --all

# 测试特定接口
./scripts/load-test.sh -e "/api/virtual/sleep/100ms" 10000
```

### WRK高级测试

```bash
# 使用WRK测试（推荐）
./scripts/wrk-test.sh 3000

# 比较所有实现
./scripts/wrk-test.sh --compare 10000

# 自定义配置
./scripts/wrk-test.sh -t 16 -c 200 -d 120s 5000
```

## 🐳 Docker部署

### 独立容器
```bash
# 构建镜像
docker build -t performance-test-app .

# 运行容器
docker run -p 8080:8080 performance-test-app
```

### 完整监控栈
```bash
# 启动应用和监控
docker-compose up -d

# 访问服务
# - 应用: http://localhost:8080
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3000 (admin/admin)
```

## 📊 监控

### 应用指标
- HTTP请求计数和响应时间
- JVM内存和垃圾回收
- 线程池利用率
- 系统资源使用情况

### 访问指标
```bash
# Prometheus接口
curl http://localhost:8080/actuator/prometheus

# 健康检查
curl http://localhost:8080/actuator/health
```

## 📈 预期性能特征

| 实现方式 | 低QPS (3K-5K) | 中QPS (10K-20K) | 高QPS (30K-50K) |
|------------|----------------|-------------------|-------------------|
| **Tomcat** | 良好 | 受线程池限制 | 差（线程耗尽） |
| **虚拟线程** | 良好 | 比Tomcat更好 | 良好（更好扩展性） |
| **WebFlux** | 良好 | 优秀 | 优秀（最佳扩展性） |

## ⚡ 快速开始命令

```bash
# 1. 构建
./scripts/build.sh

# 2. 运行
./scripts/run.sh

# 3. 测试接口
./scripts/quick-test.sh

# 4. 负载测试 10000 QPS
./scripts/wrk-test.sh 10000

# 5. 在5000 QPS下比较实现
./scripts/wrk-test.sh --compare 5000
```

## 📋 前置条件检查清单

- ✅ Java 21+（虚拟线程需要）
- ✅ Maven 3.6+
- ✅ Apache Bench（ab）用于基础测试
- ✅ WRK用于高级测试（推荐）
- ✅ Docker和Docker Compose（可选）
- ✅ 4GB+可用内存

## 🚨 重要说明

1. **Java版本**：虚拟线程必须使用Java 21+
2. **内存**：默认JVM设置使用2-4GB堆内存
3. **端口8080**：默认端口 - 确保可用
4. **负载测试**：从低QPS开始并逐步增加
5. **监控**：使用docker-compose获取完整监控栈

## 📞 故障排除

**常见问题：**
- **Java版本错误**：安装Java 21+并设置JAVA_HOME
- **端口被占用**：使用`-p 9090`选项更改
- **内存不足**：使用`-Xmx8g`增加堆大小
- **负载测试工具**：安装`ab`和`wrk`包

## 🌐 Windows离线Docker支持

本项目完全支持Windows下的离线Docker构建：

```cmd
# 创建离线部署包
scripts\create-offline-package.bat

# 传输到离线环境并部署
QUICK-START.bat
```

详细说明请参考：`docs\WINDOWS-DOCKER-OFFLINE.md`

## 📞 技术支持

**中英文支持：**
- 📧 完整的中文文档
- 📝 中文化批处理脚本
- 📊 中文错误提示
- 🛠️ 本地化配置选项

项目现在已经准备好进行全面的性能测试！🎉

---

## 🌟 新增功能

- 🔥 **Windows离线支持** - 完全离线Docker构建
- 🇨🇳 **完整中文支持** - 所有文档和脚本中文化
- 🚀 **一键部署** - 简化的部署流程
- 📊 **性能对比** - 三种实现方式的性能对比
- 🔍 **故障排除** - 详细的故障排除指南

---

**使用中文版本文档获得最佳体验！** 🇨🇳