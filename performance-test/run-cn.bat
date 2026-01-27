@echo off
REM =================================================================
REM Spring Boot 性能测试应用运行脚本 [中文版]
REM 此脚本运行性能测试应用，支持不同配置选项
REM =================================================================

setlocal enabledelayedexpansion

REM 默认值设置
set APP_JAR=performance-test-app.jar
set DEFAULT_PORT=8080
set DEFAULT_PROFILE=default
set JVM_OPTS=-Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication

REM 函数：显示使用说明
:print_usage
echo 用法: %0 [选项]
echo 选项:
echo   -p, --port PORT         服务器端口 (默认: 8080)
echo   -j, --jar FILE          JAR文件路径 (默认: performance-test-app.jar)
echo   -f, --profile PROFILE    Spring配置文件 (默认: default)
echo   --jvm-opts OPTIONS      JVM选项 (默认: -Xms2g -Xmx4g -XX:+UseG1GC -XX:+UseStringDeduplication)
echo   -h, --help             显示此帮助信息
echo.
echo 示例:
echo   %0                           # 使用默认设置运行
echo   %0 -p 9090                   # 在端口9090运行
echo   %0 -j target/app.jar         # 运行指定JAR
echo   %0 --jvm-opts "-Xms4g -Xmx8g"  # 使用自定义JVM选项
goto :eof

REM 解析命令行参数
:parse_args
if "%~1"=="" goto args_done
if "%~1"=="-p" (
    set PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--port" (
    set PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="-j" (
    set APP_JAR=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--jar" (
    set APP_JAR=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="-f" (
    set PROFILE=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--profile" (
    set PROFILE=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--jvm-opts" (
    set JVM_OPTS=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="-h" (
    call :print_usage
    exit /b 0
)
if "%~1"=="--help" (
    call :print_usage
    exit /b 0
)
echo 未知选项: %~1
call :print_usage
exit /b 1

:args_done

REM 如果未提供参数则使用默认值
if "%PORT%"=="" set PORT=%DEFAULT_PORT%
if "%PROFILE%"=="" set PROFILE=%DEFAULT_PROFILE%

REM 检查JAR文件是否存在
echo 检查JAR文件: %APP_JAR%
if not exist "%APP_JAR%" (
    echo 错误: 未找到JAR文件 '%APP_JAR%'!
    echo 请先构建应用: mvn clean package
    exit /b 1
)

REM 检查Java版本
echo 检查Java版本...
java -version 2^>^&1 | findstr /I "version" >nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未找到Java或Java版本不兼容!
    echo 需要Java 21或更高版本支持虚拟线程
    exit /b 1
)

REM 提取Java主版本号
for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr "version"') do set JAVA_VERSION_OUTPUT=%%i
set JAVA_VERSION=%JAVA_VERSION_OUTPUT:"=%
for /f "tokens=1 delims=." %%a in ("%JAVA_VERSION%") do set JAVA_MAJOR=%%a

if %JAVA_MAJOR% LSS 21 (
    echo 错误: Java版本过低!
    echo 当前Java版本: %JAVA_VERSION%
    echo 需要Java 21或更高版本以支持虚拟线程
    exit /b 1
) else (
    echo Java版本检查通过: %JAVA_VERSION%
)

REM 显示配置信息
echo.
echo ==========================================
echo Spring Boot 性能测试运行器
echo ==========================================
echo JAR文件:        %APP_JAR%
echo 端口:            %PORT%
echo 配置文件:         %PROFILE%
echo JVM选项:         %JVM_OPTS%
echo Java版本:        %JAVA_VERSION%
echo ==========================================

REM 设置环境变量
set SERVER_PORT=%PORT%
set SPRING_PROFILES_ACTIVE=%PROFILE%

REM 运行应用程序
echo.
echo 正在启动Spring Boot应用程序...
echo 按 Ctrl+C 停止应用程序
echo.
exec java %JVM_OPTS% -jar "%APP_JAR%"

:eof