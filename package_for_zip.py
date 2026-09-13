#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
打包脚本：把当前汇知道 Demo 版本打包成可分发 zip。
不包含 node_modules、构建产物、日志、缓存等可恢复文件。
"""
import os
import zipfile
from datetime import datetime

# 项目根目录（当前脚本所在目录）
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
# 输出 zip 文件名
ZIP_NAME = "huizhidao-v2-release.zip"
ZIP_PATH = os.path.join(PROJECT_ROOT, ZIP_NAME)

# 需要打包的文件（相对于项目根目录）
INCLUDE_FILES = [
    "start_huizhidao.py",
    "generate_qrcode.py",
    "add_firewall_rules.bat",
    "start-huizhidao.bat",
    "huizhidao-v2-prd.md",
    "index.html",
    "package.json",
    "package-lock.json",
    "postcss.config.js",
    "tailwind.config.js",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "vite.config.ts",
]

# 需要打包的目录（会递归打包，但会按 EXCLUDE_PATTERNS 过滤）
INCLUDE_DIRS = [
    "src",
    "server",
    "docs",
]

# 排除规则（路径中出现这些关键字即排除）
EXCLUDE_PATTERNS = [
    "node_modules",
    "dist",
    ".git",
    ".workbuddy",
    "__pycache__",
    ".vite",
    ".tsbuildinfo",
    "huizhidao.log",
    "qrcode.png",
    "qrcode-public.png",
    "huizhidao-demo",
]


def should_exclude(rel_path: str) -> bool:
    """根据排除规则决定是否跳过该路径。"""
    parts = rel_path.replace("\\", "/").split("/")
    for part in parts:
        if part in EXCLUDE_PATTERNS:
            return True
    # 额外排除根目录下的图片、日志、旧 demo 等
    filename = os.path.basename(rel_path)
    if filename.startswith("微信图片_"):
        return True
    if filename in ("huizhidao.log", "start-huizhidao.bat"):
        return True
    return False


def create_zip():
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)

    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        # 添加单个文件
        for file_path in INCLUDE_FILES:
            full_path = os.path.join(PROJECT_ROOT, file_path)
            if os.path.exists(full_path):
                zf.write(full_path, arcname=file_path)
                print(f"  + {file_path}")
            else:
                print(f"  ! 文件不存在，已跳过: {file_path}")

        # 添加目录
        for dir_name in INCLUDE_DIRS:
            full_dir = os.path.join(PROJECT_ROOT, dir_name)
            if not os.path.exists(full_dir):
                print(f"  ! 目录不存在，已跳过: {dir_name}")
                continue

            for root, dirs, files in os.walk(full_dir):
                # 过滤掉不需要进入的子目录（比如 node_modules）
                dirs[:] = [d for d in dirs if d not in EXCLUDE_PATTERNS]

                for file in files:
                    full_file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_file_path, PROJECT_ROOT)
                    if should_exclude(rel_path):
                        continue
                    zf.write(full_file_path, arcname=rel_path)
                    print(f"  + {rel_path}")

    size_mb = os.path.getsize(ZIP_PATH) / 1024 / 1024
    print("\n" + "=" * 60)
    print(f"打包完成: {ZIP_PATH}")
    print(f"文件大小: {size_mb:.2f} MB")
    print(f"打包时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print("\n说明：")
    print("- 解压后运行 start_huizhidao.py 即可启动")
    print("- 首次运行前请在 server/ 下执行 npm install")
    print("- 防火墙批处理请以管理员身份运行")


if __name__ == "__main__":
    create_zip()
