#!/usr/bin/env python3
"""Guard estrutural da linha independente MarceloClaro/reversa.

Este teste não proíbe atribuição histórica ao projeto original. Ele proíbe
mecanismos automáticos de sincronização e metadados operacionais que apontem
a distribuição para sandeco/reversa.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
WORKFLOWS = ROOT / ".github" / "workflows"


def read(rel: str) -> str:
    path = ROOT / rel
    if not path.is_file():
        raise AssertionError(f"arquivo ausente: {rel}")
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    errors: list[str] = []

    package = json.loads(read("package.json"))
    if package.get("private") is not True:
        errors.append("package.json: private deve ser true para impedir publicação acidental como pacote upstream")

    repo_url = ((package.get("repository") or {}).get("url") or "").lower()
    homepage = (package.get("homepage") or "").lower()
    bugs_url = ((package.get("bugs") or {}).get("url") or "").lower()
    for label, value in (("repository.url", repo_url), ("homepage", homepage), ("bugs.url", bugs_url)):
        if "marceloclaro/reversa" not in value:
            errors.append(f"package.json: {label} deve apontar para MarceloClaro/reversa")

    update_js = read("lib/commands/update.js")
    forbidden_update = (
        "registry.npmjs.org/reversa",
        "fetchLatestVersion('reversa')",
        'fetchLatestVersion("reversa")',
        "sandeco/reversa",
    )
    for needle in forbidden_update:
        if needle in update_js:
            errors.append(f"lib/commands/update.js: referência operacional proibida {needle!r}")
    if "SOURCE_VERSION" not in update_js or "MarceloClaro/reversa" not in update_js:
        errors.append("lib/commands/update.js: fonte local MarceloClaro não está explicitamente definida")

    workflow_patterns = {
        r"sandeco/reversa": "workflow referencia diretamente sandeco/reversa",
        r"\bgh\s+repo\s+sync\b": "workflow usa gh repo sync",
        r"\bgit\s+remote\s+(?:add|set-url)\s+upstream\b": "workflow configura remote upstream",
        r"\bgit\s+(?:fetch|pull)\s+upstream\b": "workflow busca alterações do upstream",
        r"\bgit\s+merge\s+upstream[/\s]": "workflow mescla upstream",
    }

    if WORKFLOWS.is_dir():
        for path in sorted(WORKFLOWS.glob("*.y*ml")):
            text = path.read_text(encoding="utf-8", errors="replace")
            for pattern, message in workflow_patterns.items():
                if re.search(pattern, text, re.I):
                    errors.append(f"{path.relative_to(ROOT)}: {message}")

    verify_workflow = read(".github/workflows/verify-invocation.yml")
    if "verify-no-upstream-sync.py" not in verify_workflow:
        errors.append("verify-invocation.yml: guard de independência não está conectado ao CI")

    policy = read("INDEPENDENCE.md")
    for marker in ("MarceloClaro/reversa", "não sincroniza", "sandeco/reversa"):
        if marker not in policy:
            errors.append(f"INDEPENDENCE.md: falta marcador {marker!r}")

    if errors:
        print(f"✗ Independent line: {len(errors)} violação(ões)")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("✓ MarceloClaro/reversa opera como linha independente")
    print("  upstream sync: blocked")
    print("  package source: MarceloClaro/reversa")
    print("  npm publication: disabled (private=true)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
