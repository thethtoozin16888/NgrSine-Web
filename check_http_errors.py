import subprocess
import re

logs = subprocess.check_output(['sudo', 'docker', 'logs', 'ngrsine-shop'], stderr=subprocess.STDOUT).decode('utf-8', errors='ignore')

errors = []
for line in logs.splitlines():
    match = re.search(r'"[A-Z]+ ([^"]+) HTTP/[0-9.]+" ([0-9]{3})', line)
    if match:
        url, status = match.groups()
        if status not in ['200', '304']:
            errors.append((status, url, line))

print(f"Total non-200/304 requests in docker logs: {len(errors)}")
for s, u, l in errors[-30:]:
    print(f"[{s}] {u}")
