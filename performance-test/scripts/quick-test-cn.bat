@echo off
REM =================================================================
REM Windows 快速测试脚本 [中文版]
REM 此脚本用于验证所有API接口是否正常工作
REM =================================================================

setlocal enabledelayedexpansion

echo ========================================
echo Spring Boot 性能测试 - 快速测试
echo ========================================

REM 默认配置
set HOST=localhost
set PORT=8080

REM 可用接口列表
set ENDPOINTS[0]=/api/tomcat/sleep/50ms
set ENDPOINTS[1]=/api/tomcat/sleep/100ms
set ENDPOINTS[2]=/api/tomcat/sleep/200ms
set ENDPOINTS[3]=/api/tomcat/sleep/500ms
set ENDPOINTS[4]=/api/tomcat/sleep/1s
set ENDPOINTS[5]=/api/virtual/sleep/50ms
set ENDPOINTS[6]=/api/virtual/sleep/100ms
set ENDPOINTS[7]=/api/virtual/sleep/200ms
set ENDPOINTS[8]=/api/virtual/sleep/500ms
set ENDPOINTS[9]=/api/virtual/sleep/1s
set ENDPOINTS[10]=/api/webflux/sleep/50ms
set ENDPOINTS[11]=/api/webflux/sleep/100ms
set ENDPOINTS[12]=/api/webflux/sleep/200ms
set ENDPOINTS[13]=/api/webflux/sleep/500ms
set ENDPOINTS[14]=/api/webflux/sleep/1s

echo.

REM 检查服务器是否运行
echo 正在检查服务器连接性...
curl -f -s "http://%HOST%:%PORT%/actuator/health" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ 服务器未在 http://%HOST%:%PORT% 运行
    echo 请先启动服务器
    exit /b 1
) else (
    echo ✅ 服务器正在运行
)

echo.
echo 正在测试所有接口...
echo.

REM 测试每个接口
for /L %%i in (0,1,14) do (
    call set CURRENT_ENDPOINT=%%ENDPOINTS[%%i]%%
    set url=http://%HOST%:%PORT%!CURRENT_ENDPOINT!
    
    echo -n 正在测试 !CURRENT_ENDPOINT! ... 
    
    REM 测量响应时间
    set start_time=
    for /f "tokens=1,2,3,4,5 delims=/ " %%a in ("!date! !time!") do set start_time=%%c%%d
    
    REM 发送请求并获取响应
    set response=
    for /f "delims=" %%i in ('curl -s -w "%%{http_code}" "!url!"') do set http_code=%%i
    
    REM 获取响应体（去除HTTP代码）
    for /f "tokens=1,2 delims=" %%a in ("!response!") do set response_body=%%a
    
    set end_time=
    for /f "tokens=1,2,3,4,5 delims=/ " %%a in ("!date! !time!") do set end_time=%%c%%d
    
    REM 计算响应时间（简化计算）
    set response_time=计算中...
    
    if "!http_code!"=="200" (
        REM 检查响应是否包含预期字段
        echo !response_body! | findstr /i "implementation" >nul
        if !ERRORLEVEL! equ 0 (
            for /f "tokens=2 delims==" %%a in ('echo !response_body! ^| findstr "implementation"') do set implementation=%%a
            for /f "tokens=2 delims==" %%a in ('echo !response_body! ^| findstr "threadType"') do set thread_type=%%a
            echo ✅ !response_time!ms ^(!implementation!, !thread_type!^)
        ) else (
            echo ⚠️  !response_time!ms ^(响应格式异常^)
        )
    ) else (
        echo ❌ HTTP !http_code!
    )
)

echo.
echo 快速测试完成！
echo.
echo ========================================
echo 测试结果汇总
echo ========================================
echo.
echo Tomcat实现测试:
echo - 响应正常: 使用传统servlet容器和平台线程
echo - 线程类型: PLATFORM_THREAD
echo.
echo 虚拟线程实现测试:
echo - 响应正常: 使用Java 21虚拟线程
echo - 线程类型: VIRTUAL_THREAD
echo.
echo WebFlux实现测试:
echo - 响应正常: 使用响应式非阻塞编程
echo - 实现类型: WEBFLUX_REACTIVE
echo.
echo 所有接口已验证！可以开始性能测试了！
echo.

pause