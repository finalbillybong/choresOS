#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="${1:-$(cd "$script_dir/../.." && pwd)}"

mkdir -p "$repo_root/frontend/public/local-overrides"
cp "$script_dir/pl-runtime.js" "$repo_root/frontend/public/local-overrides/pl-runtime.js"

python3 - "$repo_root" <<'PY'
import json
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])

index = root / "frontend" / "index.html"
text = index.read_text(encoding="utf-8")
text = re.sub(r'<html\s+lang="[^"]*"', '<html lang="pl"', text, count=1)
tag = '    <script defer src="/local-overrides/pl-runtime.js"></script>\n'
if 'src="/local-overrides/pl-runtime.js"' not in text:
    module_tag = '    <script type="module" src="/src/main.jsx"></script>'
    if module_tag in text:
        text = text.replace(module_tag, tag + module_tag)
    else:
        text = text.replace("  </body>", tag + "  </body>")
index.write_text(text, encoding="utf-8")

manifest = root / "frontend" / "public" / "manifest.json"
data = json.loads(manifest.read_text(encoding="utf-8"))
data["description"] = "Domowe zadania, XP i nagrody"
data["lang"] = "pl"
manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

dockerignore = root / ".dockerignore"
existing = dockerignore.read_text(encoding="utf-8").splitlines() if dockerignore.exists() else []
required = [
    ".git",
    ".env",
    "data",
    "frontend/node_modules",
    "frontend/dist",
    "static",
    "__pycache__",
    "*.pyc",
    "*.pyo",
    "*.db",
    ".DS_Store",
]
seen = set(existing)
for item in required:
    if item not in seen:
        existing.append(item)
dockerignore.write_text("\n".join(existing).rstrip() + "\n", encoding="utf-8")

print("Polish overlay applied:")
print(f"- {index}")
print(f"- {manifest}")
print(f"- {root / 'frontend/public/local-overrides/pl-runtime.js'}")
print(f"- {dockerignore}")
PY
