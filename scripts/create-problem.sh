#!/usr/bin/env bash
set -euo pipefail

usage() {
    cat <<'USAGE'
Usage: $0 [-l language] [-h] <problem-title>

Create a new problem folder by fetching metadata directly from LeetCode.

Arguments:
  problem-title    Full LeetCode problem title in quotes (e.g., "Two Sum").

Options:
  -l language      Solution language template to copy (default: ts).
  -h               Show this help message.

Examples:
  $0 "Two Sum"
  $0 -l py "Binary Tree Level Order Traversal"
USAGE
}

die() {
    echo "Error: $*" >&2
    exit 1
}

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
TEMPLATES_DIR="$REPO_ROOT/.templates/problem-template"
LANG_TEMPLATE="solution"
DEFAULT_LANG="ts"
TS_HELPER="$REPO_ROOT/scripts/fetch-leetcode-problem.ts"

available_languages=()
for template in "$TEMPLATES_DIR"/${LANG_TEMPLATE}.*; do
    [[ -f "$template" ]] || continue
    lang_ext="${template##*.}"
    available_languages+=("$lang_ext")
done

if [[ ${#available_languages[@]} -eq 0 ]]; then
    die "No solution templates found in $TEMPLATES_DIR"
fi

language=""

while getopts ":l:h" opt; do
    case "$opt" in
        l)
            language="${OPTARG,,}"
            ;;
        h)
            usage
            exit 0
            ;;
        :)
            die "Option -$OPTARG requires an argument."
            ;;
        \?)
            die "Invalid option: -$OPTARG"
            ;;
    esac
done
shift $((OPTIND - 1))

if [[ $# -lt 1 ]]; then
    usage
    exit 1
fi

if [[ -z "$language" ]]; then
    if [[ -t 0 ]]; then
        echo "Available languages: ${available_languages[*]}"
        read -r -p "Choose language [${DEFAULT_LANG}]: " language_input || language_input=""
        language="${language_input,,}"
    fi
    if [[ -z "$language" ]]; then
        language="$DEFAULT_LANG"
    fi
fi

language_template_path="$TEMPLATES_DIR/${LANG_TEMPLATE}.${language}"
if [[ ! -f "$language_template_path" ]]; then
    die "Template not found for language '$language': $language_template_path"
fi

if [[ ! -f "$TS_HELPER" ]]; then
    die "Helper script not found: $TS_HELPER"
fi

if ! command -v bun >/dev/null 2>&1; then
    die "bun is required to run the TypeScript helper script."
fi

title="$*"

problem_json=""
if ! problem_json="$(PROBLEM_LANG="$language" bun "$TS_HELPER" "$title")"; then
    die "Failed to fetch problem data for: $title"
fi

export PROBLEM_JSON="$problem_json"

metadata=$(python3 - <<'PY'
import json
import os

data = json.loads(os.environ["PROBLEM_JSON"])

fields = {
    "title": data["title"],
    "slug": data["slug"],
    "frontend_id": data["frontendId"],
    "padded_frontend_id": data["paddedFrontendId"],
    "difficulty_label": data["difficulty"]["label"],
    "difficulty_lower": data["difficulty"]["lower"],
    "topics_line": data.get("topicsLine", ""),
    "url": data["url"],
    "target_dir_name": data["targetFolderName"],
}

for key, value in fields.items():
    print(f"{key}={value}")
PY
)

declare fetched_title slug frontend_id padded_frontend_id difficulty_label difficulty_lower topics_line url target_dir_name
while IFS='=' read -r key value; do
    case "$key" in
        title) fetched_title="$value" ;;
        slug) slug="$value" ;;
        frontend_id) frontend_id="$value" ;;
        padded_frontend_id) padded_frontend_id="$value" ;;
        difficulty_label) difficulty_label="$value" ;;
        difficulty_lower) difficulty_lower="$value" ;;
        topics_line) topics_line="$value" ;;
        url) url="$value" ;;
        target_dir_name) target_dir_name="$value" ;;
    esac
done <<< "$metadata"

if [[ -z "${fetched_title:-}" || -z "${target_dir_name:-}" ]]; then
    die "Failed to parse problem metadata. Raw metadata: $metadata"
fi

target_dir_rel="problems/$difficulty_lower/$target_dir_name"
target_dir="$REPO_ROOT/$target_dir_rel"

if [[ -d "$target_dir" ]]; then
    die "Target directory already exists: $target_dir_rel"
fi

mkdir -p "$(dirname "$target_dir")"
mkdir "$target_dir"

python3 - "$target_dir/README.md" <<'PY'
import json
import os
import sys
from pathlib import Path

data = json.loads(os.environ["PROBLEM_JSON"])
readme_content = data.get("readmeContent")

if not isinstance(readme_content, str) or not readme_content.strip():
    raise SystemExit("readmeContent missing from helper output")

Path(sys.argv[1]).write_text(readme_content, encoding="utf-8")
PY

export TARGET_DIR="$target_dir"

python3 - <<'PY'
import json
import os
import subprocess
from pathlib import Path

data = json.loads(os.environ["PROBLEM_JSON"])
images = data.get("images") or []

if not images:
    exit(0)

target = Path(os.environ.get("TARGET_DIR", ""))
images_dir = target / "images"
images_dir.mkdir(parents=True, exist_ok=True)

for img in images:
    url = img.get("url", "")
    filename = img.get("filename", "")
    if url and filename:
        dest = images_dir / filename
        subprocess.run(["curl", "-sL", "-o", str(dest), url], check=False)
PY

solution_target="$target_dir/${LANG_TEMPLATE}.${language}"
export SOLUTION_TARGET="$solution_target"

starter_source=$(SOLUTION_LANGUAGE="$language" python3 - "$solution_target" "$language_template_path" <<'PY'
import json
import os
import sys
from pathlib import Path

data = json.loads(os.environ["PROBLEM_JSON"])
target_path = Path(sys.argv[1])
template_path = Path(sys.argv[2])

starter = data.get("starterCode")
code = None
starter_lang_slug = ""
starter_lang_name = ""
if isinstance(starter, dict):
    code = starter.get("code")
    starter_lang_slug = str(starter.get("langSlug") or "").lower()
    starter_lang_name = str(starter.get("lang") or "").lower()

if isinstance(code, str) and code.strip():
    normalized = code.replace("\r\n", "\n")
    if not normalized.endswith("\n"):
        normalized += "\n"
    target_path.write_text(normalized, encoding="utf-8")
    result = "snippet"
else:
    target_path.write_text(template_path.read_text(encoding="utf-8"), encoding="utf-8")
    result = "template"

print(result, end="")
PY
)

python3 - <<'PY'
import json
import os
from pathlib import Path

data = json.loads(os.environ["PROBLEM_JSON"])
target_path = Path(os.environ["SOLUTION_TARGET"])
harness = data.get("testHarness") or {}
code = harness.get("code")

if isinstance(code, str) and code.strip():
    existing = target_path.read_text(encoding="utf-8") if target_path.exists() else ""
    if not existing.endswith("\n"):
        existing += "\n"
    updated = existing + "\n" + code.rstrip() + "\n"
    target_path.write_text(updated, encoding="utf-8")
PY

echo "Created $target_dir_rel"
echo "Problem: $frontend_id. $fetched_title ($difficulty_label)"
if [[ -n "${topics_line:-}" ]]; then
    echo "Topics: $topics_line"
fi
echo "Link: $url"
if [[ "$starter_source" == "snippet" ]]; then
    echo "Starter code: Imported from LeetCode (${language})"
else
    echo "Starter code: Copied template ${LANG_TEMPLATE}.${language}"
fi
echo "Next steps:"
echo "  - Review and refine $target_dir_rel/README.md"
echo "  - Implement the solution in $target_dir_rel/${LANG_TEMPLATE}.${language}"
echo "  - Add tests within the solution file"
