#!/usr/bin/env python3
import os
import subprocess
import socket
import sys
import threading
import time
import urllib.request
import webbrowser

PROJECT_DIR = r"E:\Hui zhidao"
FRONTEND_PORT = 5174
BACKEND_PORT = 3001
NODE_DIR = r"C:\Users\Lenovo\.workbuddy\binaries\node\versions\22.22.2"
NODE_EXE = os.path.join(NODE_DIR, "node.exe")
NPM_CMD = os.path.join(NODE_DIR, "npm.cmd")
NPX_CMD = os.path.join(NODE_DIR, "npx.cmd")
VENV_PYTHON = r"C:\Users\Lenovo\.workbuddy\binaries\python\envs\default\Scripts\python.exe"
QR_CODE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qrcode.png")
PUBLIC_QR_CODE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qrcode-public.png")
LT_DIR = r"C:\Users\Lenovo\.workbuddy\binaries\node\workspace"
LT_ENTRY = os.path.join(LT_DIR, "node_modules", "localtunnel", "bin", "lt.js")

def ensure_utf8_stdout():
    """Force UTF-8 and line-buffered stdout so logs appear immediately in files too."""
    try:
        sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
    except Exception:
        try:
            import io
            sys.stdout = io.TextIOWrapper(
                sys.stdout.buffer, encoding='utf-8', line_buffering=True
            )
        except Exception:
            pass

def get_env_with_node():
    env = os.environ.copy()
    env["PATH"] = NODE_DIR + os.pathsep + env.get("PATH", "")
    return env

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(2)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = None
    finally:
        s.close()
    if ip and not ip.startswith("127."):
        return ip
    try:
        hostname = socket.gethostname()
        ip = socket.getaddrinfo(hostname, None, socket.AF_INET)[0][4][0]
    except Exception:
        ip = "127.0.0.1"
    return ip

def wait_for_backend(timeout=30):
    url = f"http://localhost:{BACKEND_PORT}/api/health"
    start = time.time()
    while time.time() - start < timeout:
        try:
            with urllib.request.urlopen(url, timeout=2) as res:
                if res.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    return False

def open_browser_later():
    time.sleep(4)
    webbrowser.open(f"http://localhost:{FRONTEND_PORT}")

def generate_qrcode(url, path):
    if not os.path.exists(VENV_PYTHON):
        print("Warning: venv python not found, skipping QR code generation.")
        return False
    try:
        script = f"import qrcode; img = qrcode.make({url!r}); img.save({path!r})"
        result = subprocess.run(
            [VENV_PYTHON, "-c", script],
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=15,
        )
        if result.returncode == 0:
            return True
        print("QR code generation failed:", result.stderr or result.stdout)
        return False
    except Exception as e:
        print("QR code generation error:", e)
        return False

def generate_lan_qrcode(lan_ip):
    return generate_qrcode(f"http://{lan_ip}:{FRONTEND_PORT}", QR_CODE_PATH)

def generate_public_qrcode(public_url):
    return generate_qrcode(public_url, PUBLIC_QR_CODE_PATH)

def install_localtunnel():
    if not os.path.isdir(LT_DIR):
        os.makedirs(LT_DIR, exist_ok=True)
    print("Installing localtunnel (public access tool)...")
    env = get_env_with_node()
    result = subprocess.run(
        [NPM_CMD, "install", "localtunnel"],
        cwd=LT_DIR,
        shell=False,
        env=env,
    )
    return result.returncode == 0

def start_localtunnel():
    if not os.path.isfile(LT_ENTRY):
        return None, None

    env = get_env_with_node()
    env["NODE_PATH"] = os.path.join(LT_DIR, "node_modules")
    proc = subprocess.Popen(
        [NODE_EXE, LT_ENTRY, "--port", str(FRONTEND_PORT)],
        cwd=LT_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        bufsize=1,
    )

    public_url = None
    start = time.time()
    while time.time() - start < 30:
        line = proc.stdout.readline()
        if line:
            print("[localtunnel]", line.strip())
            if "your url is:" in line:
                public_url = line.split("your url is:")[-1].strip()
                break
        if proc.poll() is not None:
            break
        time.sleep(0.1)

    return proc, public_url

def main():
    ensure_utf8_stdout()
    os.chdir(PROJECT_DIR)
    env = get_env_with_node()
    server_dir = os.path.join(PROJECT_DIR, "server")

    print("Project directory:", PROJECT_DIR)
    print("Frontend port:", FRONTEND_PORT)
    print("Backend port: ", BACKEND_PORT)
    print()

    # Install frontend dependencies
    if not os.path.isdir("node_modules"):
        print("Installing frontend dependencies...")
        result = subprocess.run([NPM_CMD, "install"], shell=False, env=env)
        if result.returncode != 0:
            print("Failed to install frontend dependencies.")
            sys.exit(1)
        print()

    # Install backend dependencies
    if not os.path.isdir(os.path.join(server_dir, "node_modules")):
        print("Installing backend dependencies...")
        result = subprocess.run([NPM_CMD, "install"], cwd=server_dir, shell=False, env=env)
        if result.returncode != 0:
            print("Failed to install backend dependencies.")
            sys.exit(1)
        print()

    lan_ip = get_lan_ip()
    print("=" * 60)
    print("Hui Zhidao V2 is starting...")
    print("=" * 60)
    print(f"Frontend local:  http://localhost:{FRONTEND_PORT}")
    print(f"Frontend LAN:    http://{lan_ip}:{FRONTEND_PORT}")
    print(f"Backend API:     http://localhost:{BACKEND_PORT}")
    print("=" * 60)
    print()

    # Generate QR code for LAN access
    if generate_lan_qrcode(lan_ip):
        print(f"LAN QR code:     {QR_CODE_PATH}")
        print("Scan with your phone on the same Wi-Fi.")
        print()

    # Install localtunnel if not present (for public internet access)
    public_tunnel_enabled = os.path.isfile(LT_ENTRY)
    if not public_tunnel_enabled:
        public_tunnel_enabled = install_localtunnel()

    # Start backend server
    print("Starting backend API server...")
    backend_proc = subprocess.Popen(
        [NODE_EXE, os.path.join(server_dir, "server.js")],
        cwd=server_dir,
        env=env,
    )

    # Wait for backend readiness
    if not wait_for_backend():
        print("Backend failed to start. Check server/.env and API key.")
        backend_proc.terminate()
        sys.exit(1)
    print("Backend is ready.")
    print()

    # Build frontend for production-like preview (more stable over public tunnels)
    print("Building frontend for public preview...")
    build_result = subprocess.run(
        [NPM_CMD, "run", "build"],
        cwd=PROJECT_DIR,
        shell=False,
        env=env,
    )
    if build_result.returncode != 0:
        print("Frontend build failed. Please check TypeScript errors above.")
        backend_proc.terminate()
        sys.exit(1)
    print("Frontend build complete.")
    print()

    # Start frontend preview server (static files, no dev HMR, stable for tunnels)
    print("Starting frontend preview server...")
    frontend_proc = subprocess.Popen(
        [NPX_CMD, "vite", "preview", "--host", "0.0.0.0", "--port", str(FRONTEND_PORT)],
        cwd=PROJECT_DIR,
        env=env,
    )

    # Start public tunnel
    tunnel_proc = None
    public_url = None
    if public_tunnel_enabled:
        print()
        print("Starting public tunnel (this may take a few seconds)...")
        tunnel_proc, public_url = start_localtunnel()
        if public_url:
            print()
            print("=" * 60)
            print(f"PUBLIC URL:      {public_url}")
            print("=" * 60)
            if generate_public_qrcode(public_url):
                print(f"Public QR code:  {PUBLIC_QR_CODE_PATH}")
            print("=" * 60)
            print("IMPORTANT: First visit on a new device/browser will show a")
            print("localtunnel verification page. Click 'Click to Continue' to")
            print("enter the app. After that, the page loads normally.")
            print("=" * 60)
            print()
        else:
            print("Public tunnel failed to start. LAN access is still available.")
            print()

    threading.Thread(target=open_browser_later, daemon=True).start()

    try:
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        backend_proc.terminate()
        frontend_proc.terminate()
        if tunnel_proc:
            tunnel_proc.terminate()
        try:
            backend_proc.wait(timeout=5)
        except Exception:
            backend_proc.kill()
        try:
            frontend_proc.wait(timeout=5)
        except Exception:
            frontend_proc.kill()
        if tunnel_proc:
            try:
                tunnel_proc.wait(timeout=5)
            except Exception:
                tunnel_proc.kill()
        print("Servers stopped.")

if __name__ == "__main__":
    main()
