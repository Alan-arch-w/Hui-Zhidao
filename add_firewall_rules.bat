@echo off
chcp 65001 >nul
echo ========================================================
echo  汇知道 (Hui Zhidao) 局域网访问防火墙放行工具
echo ========================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请以管理员身份运行此脚本！
    echo 操作步骤：右键点击本文件 -> 选择"以管理员身份运行"。
    pause
    exit /b 1
)

echo 正在添加防火墙规则，放行端口 5174（前端）和 3001（后端）...

netsh advfirewall firewall delete rule name="HuiZhidao Frontend 5174" >nul 2>&1
netsh advfirewall firewall delete rule name="HuiZhidao Backend 3001" >nul 2>&1

netsh advfirewall firewall add rule name="HuiZhidao Frontend 5174" dir=in action=allow protocol=tcp localport=5174 profile=any >nul 2>&1
if %errorLevel% neq 0 (
    echo [失败] 无法添加 5174 端口规则
    pause
    exit /b 1
)
echo [成功] 已放行 5174 端口

netsh advfirewall firewall add rule name="HuiZhidao Backend 3001" dir=in action=allow protocol=tcp localport=3001 profile=any >nul 2>&1
if %errorLevel% neq 0 (
    echo [失败] 无法添加 3001 端口规则
    pause
    exit /b 1
)
echo [成功] 已放行 3001 端口

echo.
echo ========================================================
echo  防火墙规则添加完成！
echo  现在手机可以访问电脑局域网地址了。
echo ========================================================
pause
