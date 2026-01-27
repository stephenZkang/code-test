@echo off
REM =================================================================
REM Windows 离线依赖下载器 [中文版]
REM 此脚本下载Docker离线构建所需的所有依赖
REM =================================================================

setlocal enabledelayedexpansion

echo ========================================
echo Windows 离线依赖下载器 [中文版]
echo ========================================
echo.

REM 配置
set OFFLINE_DIR=offline-build
set MAVEN_REPO_DIR=%OFFLINE_DIR%\maven-repo
set DOCKER_IMAGES_DIR=%OFFLINE_DIR%\docker-images
set JAVA_VERSION=21
set BASE_IMAGES=openjdk:21-jdk-slim prom/prometheus:latest grafana/grafana:latest

REM 创建目录
echo 正在创建离线构建目录...
if not exist "%OFFLINE_DIR%" mkdir "%OFFLINE_DIR%"
if not exist "%MAVEN_REPO_DIR%" mkdir "%MAVEN_REPO_DIR%"
if not exist "%DOCKER_IMAGES_DIR%" mkdir "%DOCKER_IMAGES_DIR%"

echo [1/4] 正在下载Maven依赖...
echo ----------------------------------------

REM 下载Maven依赖
echo 正在下载Maven离线依赖...
call mvn dependency:go-offline -Dmaven.repo.local="%MAVEN_REPO_DIR%" -B
if %ERRORLEVEL% neq 0 (
    echo 错误: 下载Maven依赖失败
    exit /b 1
)

REM 下载所有项目依赖
echo 正在复制所有项目依赖...
call mvn dependency:copy-dependencies -Dmaven.repo.local="%MAVEN_REPO_DIR%" -DoutputDirectory="%MAVEN_REPO_DIR%" -B
if %ERRORLEVEL% neq 0 (
    echo 错误: 复制Maven依赖失败
    exit /b 1
)

echo.
echo [2/4] 正在下载Docker基础镜像...
echo ----------------------------------------

REM 检查Docker是否可用
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 警告: Docker未找到。跳过基础镜像下载。
    echo 您需要在目标机器上手动下载基础镜像。
) else (
    REM 拉取基础镜像
    for %%i in (%BASE_IMAGES%) do (
        echo 正在拉取 %%i...
        docker pull %%i
        if %ERRORLEVEL% neq 0 (
            echo 警告: 拉取 %%i 失败
        ) else (
            echo 正在保存 %%i 到tar文件...
            docker save %%i -o "%DOCKER_IMAGES_DIR%\%%~ni.tar"
            if %ERRORLEVEL% neq 0 (
                echo 警告: 保存 %%i 失败
            )
        )
    )
)

echo.
echo [3/4] 正在下载其他工具...
echo ----------------------------------------

REM 下载Windows的curl二进制文件（如果不可用）
curl --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 正在下载Windows版curl...
    powershell -Command "Invoke-WebRequest -Uri 'https://curl.se/windows/dl-7.88.1/curl-7.88.1-win64-mingw.zip' -OutFile '%OFFLINE_DIR%\curl.zip'"
    if %ERRORLEVEL% equ 0 (
        echo 正在解压curl...
        powershell -Command "Expand-Archive -Path '%OFFLINE_DIR%\curl.zip' -DestinationPath '%OFFLINE_DIR%\curl' -Force"
    )
)

echo.
echo [4/4] 正在创建离线构建配置...
echo ----------------------------------------------

REM 创建离线Dockerfile
echo 正在创建离线Dockerfile...
(
echo # 离线Dockerfile - 使用本地Maven仓库
echo FROM openjdk:21-jdk-slim
echo.
echo # 为健康检查安装curl
echo RUN apt-get update ^&^& apt-get install -y curl ^&^& rm -rf /var/lib/apt/lists/*
echo.
echo WORKDIR /app
echo.
echo # 创建非root用户
echo RUN addgroup --system spring ^&^& adduser --system spring --ingroup spring
echo.
echo # 从离线构建上下文复制Maven仓库
echo COPY maven-repo /root/.m2/repository
echo.
echo # 复制源代码
echo COPY src ./src
echo COPY pom.xml ./
echo COPY .mvn ./.mvn
echo.
echo # 使用离线Maven仓库构建应用程序
echo RUN ./mvnw clean package -DskipTests -o
echo.
echo # 复制构建的JAR
echo COPY target/performance-test-app.jar app.jar
echo.
echo # 更改所有权为非root用户
echo RUN chown spring:spring app.jar
echo.
echo # 切换到非root用户
echo USER spring
echo.
echo # 暴露端口
echo EXPOSE 8080
echo.
echo # 设置JVM选项
echo ENV JAVA_OPTS="-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication"
echo.
echo # 健康检查
echo HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
echo     CMD curl -f http://localhost:8080/actuator/health ^|^| exit 1
echo.
echo # 运行应用程序
echo ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
) > "%OFFLINE_DIR%\Dockerfile.offline"

REM 创建离线构建脚本
echo 正在创建离线构建脚本...
(
echo @echo off
echo REM =================================================================
echo REM Windows 离线Docker构建脚本 [中文版]
echo REM =================================================================
echo.
echo echo 正在离线构建Docker镜像...
echo echo.
echo.
echo REM 检查Docker是否可用
echo docker --version ^>nul 2^>^&1
echo if %%ERRORLEVEL%% neq 0 ^(
echo     echo 错误: Docker不可用或未运行
echo     exit /b 1
echo ^)
echo.
echo REM 如果可用则加载基础镜像
echo if exist "docker-images\openjdk.tar" ^(
echo     echo 正在加载OpenJDK基础镜像...
echo     docker load -i "docker-images\openjdk.tar"
echo ^)
echo.
echo if exist "docker-images\prom.tar" ^(
echo     echo 正在加载Prometheus基础镜像...
echo     docker load -i "docker-images\prom.tar"
echo ^)
echo.
echo if exist "docker-images\grafana.tar" ^(
echo     echo 正在加载Grafana基础镜像...
echo     docker load -i "docker-images\grafana.tar"
echo ^)
echo.
echo REM 构建应用程序镜像
echo echo 正在构建performance-test-app镜像...
echo docker build -f Dockerfile.offline -t performance-test-app:offline .
echo.
echo if %%ERRORLEVEL%% equ 0 ^(
echo     echo.
echo     echo ========================================
echo     echo 离线Docker构建成功完成！
echo     echo ========================================
echo     echo.
echo     echo 运行容器:
echo     echo   docker run -p 8080:8080 performance-test-app:offline
echo     echo.
echo     echo 使用docker-compose运行:
echo     echo   docker-compose -f docker-compose.offline.yml up -d
echo ^) else ^(
echo     echo.
echo     echo 错误: Docker构建失败
echo     exit /b 1
echo ^)
) > "%OFFLINE_DIR%\build-offline-cn.bat"

echo.
echo ========================================
echo 离线依赖下载完成！
echo ========================================
echo.
echo 离线构建目录: %OFFLINE_DIR%
echo.
echo 下一步:
echo 1. 将整个'%OFFLINE_DIR%'目录复制到离线机器
echo 2. 在离线机器上运行: build-offline-cn.bat
echo 3. 然后运行: docker-compose -f docker-compose.offline.yml up -d
echo.
echo 离线目录内容:
dir /B "%OFFLINE_DIR%"

pause