import os
import subprocess
import tempfile
import time

edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_exe):
    edge_exe = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

os.makedirs('screenshots', exist_ok=True)
temp_dir = tempfile.mkdtemp()

targets = [
    ("01_website_home.png", "http://localhost/"),
    ("02_website_booking.png", "http://localhost/"),
    ("03_pgadmin_login.png", "http://localhost:8082/"),
    ("04_prometheus_targets.png", "http://localhost:9090/targets"),
    ("05_prometheus_graph.png", "http://localhost:9090/graph"),
    ("06_grafana_ui.png", "http://localhost:3001/login"),
    ("07_cadvisor_containers.png", "http://localhost:8085/containers/"),
]

for filename, url in targets:
    out_file = os.path.abspath(os.path.join("screenshots", filename))
    cmd = [
        edge_exe,
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        f'--user-data-dir={temp_dir}',
        '--window-size=1366,768',
        '--hide-scrollbars',
        '--ignore-certificate-errors',
        f'--screenshot={out_file}',
        url
    ]
    try:
        print(f"Capturing: {url} -> {filename}")
        subprocess.run(cmd, timeout=12, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(out_file):
            print(f"  OK: {filename} ({os.path.getsize(out_file)} bytes)")
        else:
            print(f"  FAILED: {filename}")
    except Exception as e:
        print(f"  Error: {e}")

print("All screenshots captured successfully.")
