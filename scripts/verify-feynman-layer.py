#!/usr/bin/env python3
"""Gate estrutural da Feynman Evidence & Understanding Layer."""
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


def read(rel: str) -> str:
    path = ROOT / rel
    if not path.is_file():
        raise AssertionError(f"arquivo ausente: {rel}")
    return path.read_text(encoding="utf-8", errors="replace")


def require(text: str, needle: str, label: str, errors: list[str]) -> None:
    if needle not in text:
        errors.append(f"{label}: ausente {needle!r}")


def main() -> int:
    errors: list[str] = []

    skill_rel = "agents/reversa-feynman/SKILL.md"
    yaml_rel = "agents/reversa-feynman/agents/openai.yaml"
    protocol_rel = "agents/reversa-feynman/references/feynman-gates.md"
    reviewer_rel = "agents/reversa-reviewer/SKILL.md"
    quality_rel = "agents/reversa-quality/SKILL.md"
    audit_rel = "agents/reversa-audit/SKILL.md"
    challenger_rel = "agents/reversa-challenger/SKILL.md"

    try:
        skill = read(skill_rel)
        yaml = read(yaml_rel)
        protocol = read(protocol_rel)
        reviewer = read(reviewer_rel)
        quality = read(quality_rel)
        audit = read(audit_rel)
        challenger = read(challenger_rel)
    except AssertionError as exc:
        print(f"✗ {exc}")
        return 1

    gates = [f"FEG-0{i}" for i in range(1, 7)]
    for gate in gates:
        require(skill, gate, skill_rel, errors)
        require(protocol, gate, protocol_rel, errors)
        require(reviewer, gate, reviewer_rel, errors)

    for gate in ("FEG-01", "FEG-04"):
        require(quality, gate, quality_rel, errors)
    for gate in ("FEG-02", "FEG-03"):
        require(audit, gate, audit_rel, errors)
    for gate in ("FEG-03", "FEG-05", "FEG-06"):
        require(challenger, gate, challenger_rel, errors)

    if not re.search(r"^disable-model-invocation:\s*true\s*$", skill, re.M):
        errors.append(f"{skill_rel}: falta disable-model-invocation: true")
    if not re.search(r"^\s*allow_implicit_invocation:\s*false\s*$", yaml, re.M):
        errors.append(f"{yaml_rel}: falta allow_implicit_invocation: false")
    if not re.search(r"^\s*display_name:", yaml, re.M):
        errors.append(f"{yaml_rel}: falta interface.display_name")
    if not re.search(r"^\s*short_description:", yaml, re.M):
        errors.append(f"{yaml_rel}: falta interface.short_description")

    anti_overclaim_terms = ("Não fabrique", "proveniência", "UNVERIFIED", "BLOCKED")
    for term in anti_overclaim_terms:
        require(skill, term, skill_rel, errors)

    package = read("package.json")
    require(package, "scripts/verify-feynman-layer.py", "package.json", errors)

    if errors:
        print(f"✗ Feynman Layer: {len(errors)} violação(ões)")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("✓ Feynman Evidence & Understanding Layer íntegra")
    print("  gates:", ", ".join(gates))
    return 0


if __name__ == "__main__":
    sys.exit(main())
