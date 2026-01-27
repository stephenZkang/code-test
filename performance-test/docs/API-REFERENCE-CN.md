# Spring Boot 性能测试 API 接口参考 [中文版]

## 🎯 接口概述

本文档详细描述了Spring Boot性能测试应用的所有API接口，包括传统Tomcat、虚拟线程和WebFlux三种实现方式。

## 📋 基础信息

- **基础URL**: `http://localhost:8080`
- **支持方法**: GET
- **响应格式**: JSON
- **字符编码**: UTF-8
- **内容类型**: application/json

## 🚀 传统Tomcat接口

### 概述
使用传统Tomcat servlet容器和平台线程处理请求，适合对比传统实现方式的性能。

### 接口列表

#### 1. 延迟50ms接口
```http
GET /api/tomcat/sleep/50ms
```

**说明**: 模拟50毫秒延迟的请求处理

**请求参数**: 无

**响应示例**:
```json
{
  "message": "Request processed successfully",
  "sleepTimeMs": 50,
  "actualSleepTimeMs": 51,
  "requestStart": "2024-01-26T10:30:00.123Z",
  "requestEnd": "2024-01-26T10:30:00.174Z",
  "totalProcessingTimeMs": 51,
  "threadName": "http-nio-8080-exec-1",
  "threadType": "PLATFORM_THREAD",
  "implementation": "TOMCAT"
}
```

#### 2. 延迟100ms接口
```http
GET /api/tomcat/sleep/100ms
```

**说明**: 模拟100毫秒延迟的请求处理

**响应示例**: 同上，sleepTimeMs为100

#### 3. 延迟200ms接口
```http
GET /api/tomcat/sleep/200ms
```

**说明**: 模拟200毫秒延迟的请求处理

**响应示例**: 同上，sleepTimeMs为200

#### 4. 延迟500ms接口
```http
GET /api/tomcat/sleep/500ms
```

**说明**: 模拟500毫秒延迟的请求处理

**响应示例**: 同上，sleepTimeMs为500

#### 5. 延迟1秒接口
```http
GET /api/tomcat/sleep/1s
```

**说明**: 模拟1秒延迟的请求处理

**响应示例**: 同上，sleepTimeMs为1000

## 🧵 虚拟线程接口

### 概述
使用Java 21虚拟线程技术，提供更好的资源利用率和扩展性。

### 接口列表

#### 1. 延迟50ms接口
```http
GET /api/virtual/sleep/50ms
```

**说明**: 使用虚拟线程处理50毫秒延迟请求

**响应示例**:
```json
{
  "message": "Request processed successfully",
  "sleepTimeMs": 50,
  "actualSleepTimeMs": 50,
  "requestStart": "2024-01-26T10:30:00.123Z",
  "requestEnd": "2024-01-26T10:30:00.173Z",
  "totalProcessingTimeMs": 50,
  "threadName": "VirtualThread-1",
  "threadType": "VIRTUAL_THREAD",
  "implementation": "VIRTUAL_THREAD"
}
```

#### 2-5. 其他延迟接口
```http
GET /api/virtual/sleep/100ms
GET /api/virtual/sleep/200ms
GET /api/virtual/sleep/500ms
GET /api/virtual/sleep/1s
```

**响应特点**: threadType显示为"VIRTUAL_THREAD"，threadName以"VirtualThread-"开头

## 🌊 WebFlux响应式接口

### 概述
使用WebFlux非阻塞响应式编程，适合高并发场景。

### 接口列表

#### 1. 延迟50ms接口
```http
GET /api/webflux/sleep/50ms
```

**说明**: 使用响应式编程处理50毫秒延迟请求

**响应示例**:
```json
{
  "message": "Request processed successfully",
  "sleepTimeMs": 50,
  "actualSleepTimeMs": 51,
  "requestStart": "2024-01-26T10:30:00.123Z",
  "requestEnd": "2024-01-26T10:30:00.174Z",
  "totalProcessingTimeMs": 51,
  "threadName": "reactor-http-nio-1",
  "threadType": "PLATFORM_THREAD",
  "implementation": "WEBFLUX_REACTIVE"
}
```

#### 2-5. 其他延迟接口
```http
GET /api/webflux/sleep/100ms
GET /api/webflux/sleep/200ms
GET /api/webflux/sleep/500ms
GET /api/webflux/sleep/1s
```

**响应特点**: implementation显示为"WEBFLUX_REACTIVE"，使用事件循环线程

## 📊 响应数据字段说明

所有接口返回相同的JSON结构，包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| **message** | String | 处理状态消息 |
| **sleepTimeMs** | Integer | 预定睡眠时间（毫秒） |
| **actualSleepTimeMs** | Integer | 实际睡眠时间（毫秒） |
| **requestStart** | String | 请求开始时间（ISO 8601格式） |
| **requestEnd** | String | 请求结束时间（ISO 8601格式） |
| **totalProcessingTimeMs** | Integer | 总处理时间（毫秒） |
| **threadName** | String | 处理请求的线程名称 |
| **threadType** | String | 线程类型：PLATFORM_THREAD或VIRTUAL_THREAD |
| **implementation** | String | 实现方式：TOMCAT、VIRTUAL_THREAD、WEBFLUX_REACTIVE |

## 🏥 健康检查和管理接口

### 健康检查接口
```http
GET /actuator/health
```

**说明**: 检查应用健康状态

**响应示例**:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "H2",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 250685575168,
        "free": 167284318208,
        "threshold": 10485760,
        "path": "/app/."
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

### 应用信息接口
```http
GET /actuator/info
```

**说明**: 获取应用信息

**响应示例**:
```json
{
  "app": {
    "name": "Spring Boot Performance Test",
    "description": "Performance testing project with multiple implementations",
    "version": "1.0.0"
  },
  "build": {
    "time": "2024-01-26T10:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### 应用指标接口
```http
GET /actuator/metrics
```

**说明**: 获取应用性能指标列表

**响应示例**:
```json
{
  "names": [
    "jvm.memory.used",
    "jvm.memory.max",
    "http.server.requests",
    "process.cpu.usage"
  ]
}
```

### Prometheus指标接口
```http
GET /actuator/prometheus
```

**说明**: 获取Prometheus格式的指标数据

**响应示例**:
```
# HELP jvm_memory_used_bytes Used amount of memory
# TYPE jvm_memory_used_bytes gauge
jvm_memory_used_bytes{area="heap",id="PS Eden Space"} 5.4321E8
jvm_memory_used_bytes{area="heap",id="PS Survivor Space"} 1.23456E7

# HELP http_server_requests_seconds Total time for all requests
# TYPE http_server_requests_seconds histogram
http_server_requests_seconds_bucket{uri="/api/tomcat/sleep/100ms",method="GET",status="200",le="0.1"} 0
http_server_requests_seconds_bucket{uri="/api/tomcat/sleep/100ms",method="GET",status="200",le="0.5"} 2
```

## 🔧 环境变量配置

可以通过环境变量调整接口行为：

| 变量名 | 默认值 | 说明 |
|--------|----------|------|
| **SERVER_PORT** | 8080 | 服务器监听端口 |
| **LOGGING_LEVEL** | INFO | 日志级别 |
| **SPRING_PROFILES_ACTIVE** | default | Spring配置文件 |
| **JAVA_OPTS** | -Xms2g -Xmx4g | JVM启动参数 |

## 🚨 错误响应

### 400错误 - 请求参数错误
```json
{
  "timestamp": "2024-01-26T10:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "path": "/api/tomcat/sleep/invalid"
}
```

### 500错误 - 服务器内部错误
```json
{
  "timestamp": "2024-01-26T10:30:00.123Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Request processing failed",
  "path": "/api/tomcat/sleep/100ms"
}
```

### 503错误 - 服务不可用
```json
{
  "timestamp": "2024-01-26T10:30:00.123Z",
  "status": 503,
  "error": "Service Unavailable",
  "message": "Service temporarily unavailable",
  "path": "/api/tomcat/sleep/100ms"
}
```

## 📈 性能特征对比

### Tomcat实现
- **线程模型**: 平台线程，传统线程池
- **并发限制**: 受线程池大小限制（默认200）
- **内存使用**: 每线程约1MB栈空间
- **适合场景**: 低并发、传统应用

### 虚拟线程实现
- **线程模型**: Java 21虚拟线程
- **并发优势**: 可创建更多线程，适合I/O密集
- **内存效率**: 虚拟线程栈内存更小
- **适合场景**: 中高并发、I/O密集应用

### WebFlux实现
- **编程模型**: 响应式非阻塞
- **并发优势**: 事件循环，极少的线程数
- **最佳扩展性**: 适合极高并发场景
- **适合场景**: 高并发、微服务架构

## 🧪 接口测试

### 使用curl测试
```bash
# 测试Tomcat 100ms接口
curl -w "@curl-format.txt" http://localhost:8080/api/tomcat/sleep/100ms

# 测试虚拟线程 500ms接口
curl -w "@curl-format.txt" http://localhost:8080/api/virtual/sleep/500ms

# 测试WebFlux 1s接口
curl -w "@curl-format.txt" http://localhost:8080/api/webflux/sleep/1s
```

### curl输出格式
创建`curl-format.txt`文件：
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
           http_code:  %{http_code}\n
```

## 📋 接口清单速查

| 实现方式 | 50ms | 100ms | 200ms | 500ms | 1s |
|----------|-------|--------|--------|--------|-----|
| **Tomcat** | `/api/tomcat/sleep/50ms` | `/api/tomcat/sleep/100ms` | `/api/tomcat/sleep/200ms` | `/api/tomcat/sleep/500ms` | `/api/tomcat/sleep/1s` |
| **虚拟线程** | `/api/virtual/sleep/50ms` | `/api/virtual/sleep/100ms` | `/api/virtual/sleep/200ms` | `/api/virtual/sleep/500ms` | `/api/virtual/sleep/1s` |
| **WebFlux** | `/api/webflux/sleep/50ms` | `/api/webflux/sleep/100ms` | `/api/webflux/sleep/200ms` | `/api/webflux/sleep/500ms` | `/api/webflux/sleep/1s` |

## 🎯 使用建议

### 选择合适的实现方式
- **传统应用**: 使用Tomcat接口测试基线性能
- **现代Java**: 使用虚拟线程接口测试虚拟线程优势
- **微服务架构**: 使用WebFlux接口测试响应式性能

### 性能测试建议
1. **基线测试**: 先用Tomcat接口建立性能基线
2. **对比测试**: 相同QPS下对比三种实现
3. **压力测试**: 逐步增加QPS找到性能拐点
4. **稳定性测试**: 长时间运行观察内存和CPU使用

### 监控指标重点
- **响应时间**: 关注p95和p99延迟
- **吞吐量**: 监控实际QPS和成功率
- **资源使用**: 观察线程数、内存使用情况
- **错误率**: 跟踪5xx和4xx错误

---

**这份API参考文档提供了完整的接口说明和使用指南！** 📚

---

**提示**：配合性能测试脚本使用效果最佳！