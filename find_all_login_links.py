import os, re

results = []

for root, _, files in os.walk('.'):
    if 'node_modules' in root or 'Backups' in root or '.git' in root: continue
    for f in files:
        if f.endswith('.html') or f.endswith('.js'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fl:
                for line_no, line in enumerate(fl, 1):
                    if 'login' in line.lower():
                        # filter out pure styling or comment if irrelevant
                        results.append((p, line_no, line.strip()))

print(f"Total lines with login: {len(results)}")
for p, lno, l in results:
    if 'href' in l or 'location' in l or 'redirect' in l or 'window.' in l:
        print(f"{p}:{lno} -> {l[:120]}")
