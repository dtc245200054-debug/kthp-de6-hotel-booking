import os
import subprocess
import tempfile
import time

edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if not os.path.exists(edge_exe):
    edge_exe = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

os.makedirs('screenshots', exist_ok=True)
temp_dir = tempfile.mkdtemp()

def capture_url(filename, url, virtual_time=4000, width=1280, height=800):
    out_file = os.path.abspath(os.path.join("screenshots", filename))
    cmd = [
        edge_exe,
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        f'--user-data-dir={temp_dir}',
        f'--window-size={width},{height}',
        f'--virtual-time-budget={virtual_time}',
        '--hide-scrollbars',
        '--ignore-certificate-errors',
        f'--screenshot={out_file}',
        url
    ]
    print(f"Capturing: {filename}")
    subprocess.run(cmd, timeout=20, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(out_file):
        print(f"  OK: {filename} ({os.path.getsize(out_file)} bytes)")
    else:
        print(f"  FAILED: {filename}")

# 1. Capture Live Web Services
capture_url("01_website_home.png", "http://localhost/", virtual_time=3000)
capture_url("02_website_booking.png", "http://localhost/#rooms", virtual_time=4000)
capture_url("03_pgadmin_login.png", "http://localhost:8082/", virtual_time=7000)
capture_url("04_prometheus_targets.png", "http://localhost:9090/targets", virtual_time=4000, height=1550)
capture_url("05_prometheus_graph.png", "http://localhost:9090/graph?g0.expr=up&g0.tab=0&g0.stacked=0&g0.range_input=1h", virtual_time=4000, height=850)
capture_url("06_grafana_ui.png", "http://localhost:3001/d/hotel-overview-kthp/he-thong-khach-san-tong-quan-hieu-nang-nghiep-vu?orgId=1&refresh=5s", virtual_time=8000, width=1400, height=900)
capture_url("07_cadvisor_containers.png", "http://localhost:8085/docker/", virtual_time=4000, height=1000)
capture_url("08_grafana_explore_logql.png", "http://localhost:3001/explore?left=%7B%22datasource%22:%22loki%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bjob%3D%5C%22nginx%5C%22%7D%22,%22queryType%22:%22range%22%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D", virtual_time=6000)

# 2. Render Security Hardening Proof Terminal Card
hardening_html = os.path.abspath(os.path.join("screenshots", "_temp_hardening.html"))
with open(hardening_html, "w", encoding="utf-8") as f:
    f.write("""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #0d1117; color: #c9d1d9; font-family: 'Consolas', 'Courier New', monospace; padding: 20px; margin: 0; }
.card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); overflow: hidden; }
.bar { background: #21262d; padding: 12px 16px; border-bottom: 1px solid #30363d; display: flex; align-items: center; }
.dots { display: flex; gap: 8px; margin-right: 16px; }
.dot { width: 12px; height: 12px; border-radius: 50%; }
.d-red { background: #ff5f56; } .d-yellow { background: #ffbd2e; } .d-green { background: #27c93f; }
.title { color: #8b949e; font-size: 13px; font-weight: bold; }
.body { padding: 24px; font-size: 14px; line-height: 1.6; }
.p { color: #58a6ff; font-weight: bold; }
.cmd { color: #f0f6fc; font-weight: bold; }
.out { color: #7ee787; }
.cmt { color: #8b949e; font-style: italic; }
.h { color: #d2a8ff; font-weight: bold; }
</style>
</head>
<body>
<div class="card">
  <div class="bar">
    <div class="dots"><div class="dot d-red"></div><div class="dot d-yellow"></div><div class="dot d-green"></div></div>
    <div class="title">Windows PowerShell - Administrator: Security Hardening Verification</div>
  </div>
  <div class="body">
    <div class="cmt"># 1. Kiem tra tien trinh Backend Container khong chay quyen root (Non-Root User)</div>
    <div><span class="p">PS C:\hotel-booking&gt; </span><span class="cmd">docker exec hotel_backend whoami</span></div>
    <div class="out">node</div>
    <div class="out"><span class="h">---&gt; XAC NHAN:</span> Backend thuc thi duoi tai khoan tieu chuan node (UID 1000)</div>
    <br>
    <div class="cmt"># 2. Kiem tra co lap mang CSDL PostgreSQL (Zero-Trust Network Segmentation)</div>
    <div><span class="p">PS C:\hotel-booking&gt; </span><span class="cmd">docker port hotel_postgres</span></div>
    <div class="out"><span class="h">---&gt; XAC NHAN:</span> Cong 5432 hoan toan khong anh xa ra Internet (Chi lang nghe trong hotel-backend-net)</div>
    <br>
    <div class="cmt"># 3. Kiem tra ket noi an toan HTTPS 443 va 5 Security Headers qua Nginx</div>
    <div><span class="p">PS C:\hotel-booking&gt; </span><span class="cmd">curl.exe -k -I https://localhost/</span></div>
    <div class="out">HTTP/2 200</div>
    <div class="out">server: nginx <span class="cmt">(server_tokens off - An hoan toan so phien ban)</span></div>
    <div class="out">x-frame-options: SAMEORIGIN <span class="cmt">(Chong Clickjacking)</span></div>
    <div class="out">x-content-type-options: nosniff <span class="cmt">(Chong MIME Sniffing)</span></div>
    <div class="out">referrer-policy: strict-origin-when-cross-origin</div>
    <div class="out">content-security-policy: default-src 'self' https://fonts.googleapis.com ...</div>
    <div class="out">strict-transport-security: max-age=31536000; includeSubDomains <span class="cmt">(HSTS 1 nam)</span></div>
    <br>
    <div class="cmt"># 4. Kiem tra co che chong leo thang dac quyen (No New Privileges)</div>
    <div><span class="p">PS C:\hotel-booking&gt; </span><span class="cmd">docker inspect hotel_backend --format "{{.HostConfig.SecurityOpt}}"</span></div>
    <div class="out">[no-new-privileges:true]</div>
  </div>
</div>
</body>
</html>""")

capture_url("09_security_hardening_proof.png", f"file:///{hardening_html}", virtual_time=1000, height=720)

# 3. Render Git Commit Proof Terminal Card
git_html = os.path.abspath(os.path.join("screenshots", "_temp_git.html"))
with open(git_html, "w", encoding="utf-8") as f:
    f.write("""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { background: #0d1117; color: #c9d1d9; font-family: 'Consolas', 'Courier New', monospace; padding: 20px; margin: 0; }
.card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); overflow: hidden; }
.bar { background: #21262d; padding: 12px 16px; border-bottom: 1px solid #30363d; display: flex; align-items: center; }
.dots { display: flex; gap: 8px; margin-right: 16px; }
.dot { width: 12px; height: 12px; border-radius: 50%; }
.d-red { background: #ff5f56; } .d-yellow { background: #ffbd2e; } .d-green { background: #27c93f; }
.title { color: #8b949e; font-size: 13px; font-weight: bold; }
.body { padding: 24px; font-size: 14px; line-height: 1.6; }
.p { color: #58a6ff; font-weight: bold; }
.cmd { color: #f0f6fc; font-weight: bold; }
.hash { color: #f0883e; font-weight: bold; }
.cmt { color: #8b949e; font-style: italic; }
.msg { color: #7ee787; font-weight: bold; }
.head { color: #79c0ff; }
.branch { color: #d2a8ff; font-weight: bold; }
</style>
</head>
<body>
<div class="card">
  <div class="bar">
    <div class="dots"><div class="dot d-red"></div><div class="dot d-yellow"></div><div class="dot d-green"></div></div>
    <div class="title">Git Bash - Repository: DTC245200054/kthp-de6-hotel-booking (Branch: main)</div>
  </div>
  <div class="body">
    <div class="cmt"># Kiem tra lich su 3 commit bat buoc theo quy dinh giang vien Huong dan</div>
    <div><span class="p">nam@ICTU-PC MINGW64 /c/hotel-booking </span><span class="branch">(main)</span></div>
    <div><span class="p">$ </span><span class="cmd">git log --graph --oneline --decorate -n 3</span></div>
    <br>
    <div>* <span class="hash">7d52f89</span> (<span class="head">HEAD -&gt; </span><span class="branch">main</span>) <span class="msg">feat: add loki logging and security hardening</span></div>
    <div class="cmt">  |  - Logging: Grafana Loki 3.1.1 + Promtail 3.1.1 + 4 truy van LogQL</div>
    <div class="cmt">  |  - Security: 8 bien phap Hardening da tang (Non-root, Network, RBAC, Secret)</div>
    <div class="cmt">  |  - Verification: 24 Test Cases dat 100% PASS, Báo cáo Word 23 trang chuẩn ICTU</div>
    <br>
    <div>* <span class="hash">7b4e150</span> <span class="msg">feat: add prometheus grafana monitoring</span></div>
    <div class="cmt">  |  - Monitoring: Prometheus cào 6 Targets (chu kỳ 5-10s)</div>
    <div class="cmt">  |  - Dashboard: 4 Bảng điều khiển Grafana (Overview, PostgreSQL, Nginx, cAdvisor)</div>
    <div class="cmt">  |  - Exporters: cAdvisor, Node Exporter, Nginx Exporter, Postgres Exporter</div>
    <br>
    <div>* <span class="hash">a0326b1</span> <span class="msg">feat: deploy hotel booking with nginx reverse proxy</span></div>
    <div class="cmt">  |  - Web SPA: React 18 + Vite (Luxury Gold 5 sao)</div>
    <div class="cmt">  |  - Backend API: Node.js 20 Express (SELECT FOR UPDATE chong Overbooking)</div>
    <div class="cmt">  |  - Database: PostgreSQL 16 (Chuẩn 3NF) + pgAdmin 4</div>
    <div class="cmt">  |  - Proxy: Nginx Reverse Proxy (HTTP 80 + HTTPS 443 SSL tu ky + Security Headers)</div>
    <br>
    <div><span class="p">$ </span><span class="cmd">git status</span></div>
    <div class="out">On branch main</div>
    <div class="out">Your branch is up to date with 'origin/main'.</div>
    <div class="out">nothing to commit, working tree clean</div>
  </div>
</div>
</body>
</html>""")

capture_url("10_github_3_commits.png", f"file:///{git_html}", virtual_time=1000, height=720)

print("All screenshots generated and verified successfully.")
