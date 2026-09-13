#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成汇知道局域网访问二维码。
双击运行后会在项目目录生成 qrcode.png，手机扫码即可打开网页。
"""

import os
import socket
import subprocess
import sys


def get_lan_ip():
    """获取本机局域网 IP，优先排除 127.0.0.1。"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(1)
        # 连接一个公共 DNS，不会真正发送数据，用于获取本机出口 IP
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def main():
    ip = get_lan_ip()
    port = 5174
    url = f"http://{ip}:{port}"

    output_paths = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "qrcode.png"),
    ]

    # 优先使用项目 venv 里的 python
    venv_python = r"C:\Users\Lenovo\.workbuddy\binaries\python\envs\default\Scripts\python.exe"
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    script = (
        "import qrcode\n"
        f"img = qrcode.make({url!r})\n"
        + "\n".join(f'img.save({p!r})' for p in output_paths)
    )

    try:
        result = subprocess.run(
            [venv_python, "-c", script],
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        if result.stdout:
            print(result.stdout, end="")
    except subprocess.CalledProcessError as e:
        print("生成二维码失败：", e.stderr or e.stdout or str(e), file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("未找到 Python 解释器，请检查 venv 路径。", file=sys.stderr)
        sys.exit(1)

    print("二维码已生成：")
    for p in output_paths:
        print(f"  {p}")
    print(f"局域网访问地址：{url}")


if __name__ == "__main__":
    main()
