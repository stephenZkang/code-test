@echo off
REM =================================================================
REM Windows 离线依赖下载器 [中文版]
REM 此脚本用于构建和打包Spring Boot应用程序
REM =================================================================

setlocal enabledelayedexpansion

echo ========================================
echo Spring Boot 性能测试构建脚本 [中文版]
echo ========================================
echo.

REM 检查Java版本
echo 检查Java版本...
java_version=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$java_version" -lt 21 ]; then
    echo ❌ 错误: 需要Java 21或更高版本！
    echo 当前Java版本: $(java -version 2>&1 | head -1)
    exit 1
else
    echo ✅ Java版本: $(java -version 2>&1 | head -1)
fi

REM 检查Maven
echo 检查Maven...
if ! command -v mvn &> /dev/null; then
    echo ❌ 错误: Maven未安装！
    exit 1
else
    echo ✅ Maven版本: $(mvn -version | head -1)
fi

REM 清理和编译
echo.
echo 正在清理和编译...
mvn clean compile

REM 运行测试（如果存在）
echo.
echo 正在运行测试...
mvn test

REM 打包应用程序
echo.
echo 正在打包应用程序...
mvn package -DskipTests

REM 检查JAR是否创建成功
jar_file="target/performance-test-app.jar"
if [ -f "$jar_file" ]; then
    echo.
    echo ✅ 构建成功完成！
    echo 📦 JAR文件已创建: $jar_file
    echo 📊 JAR大小: $(du -h "$jar_file" | cut -f1)
    echo.
    echo 运行应用程序:
    echo   java -jar $jar_file
    echo.
    echo 或使用运行脚本:
    echo   ./scripts/run-cn.bat
    echo.
else
    echo ❌ 错误: JAR文件创建失败！
    exit 1
fi

echo ========================================
echo 构建成功完成！
echo ========================================