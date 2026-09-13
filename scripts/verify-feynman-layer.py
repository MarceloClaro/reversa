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


def check_user_invoked(skill: str, yaml: str, skill_rel: str, yaml_rel: str, errors: list[str]) -> None:
    if not re.search(r"^disable-model-invocation:\s*true\s*$", skill, re.M):
        errors.append(f"{skill_rel}: falta disable-model-invocation: true")
    if not re.search(r"^\s*allow_implicit_invocation:\s*false\s*$", yaml, re.M):
        errors.append(f"{yaml_rel}: falta allow_implicit_invocation: false")
    if not re.search(r"^\s*display_name:", yaml, re.M):
        errors.append(f"{yaml_rel}: falta interface.display_name")
    if not re.search(r"^\s*short_description:", yaml, re.M):
        errors.append(f"{yaml_rel}: falta interface.short_description")


def main() -> int:
    errors: list[str] = []

    skill_rel = "agents/reversa-feynman/SKILL.md"
    yaml_rel = "agents/reversa-feynman/agents/openai.yaml"
    protocol_rel = "agents/reversa-feynman/references/feynman-gates.md"
    teachback_rel = "agents/reversa-teachback/SKILL.md"
    teachback_yaml_rel = "agents/reversa-teachback/agents/openai.yaml"
    teachback_protocol_rel = "agents/reversa-teachback/references/teachback-protocol.md"
    reviewer_rel = "agents/reversa-reviewer/SKILL.md"
    clarify_rel = "agents/reversa-clarify/SKILL.md"
    quality_rel = "agents/reversa-quality/SKILL.md"
    audit_rel = "agents/reversa-audit/SKILL.md"
    challenger_rel = "agents/reversa-challenger/SKILL.md"
    spec_rel = "specs/SPEC-FEYNMAN-EVIDENCE-UNDERSTANDING-LAYER.md"

    try:
        skill = read(skill_rel)
        yaml = read(yaml_rel)
        protocol = read(protocol_rel)
        teachback = read(teachback_rel)
        teachback_yaml = read(teachback_yaml_rel)
        teachback_protocol = read(teachback_protocol_rel)
        reviewer = read(reviewer_rel)
        clarify = read(clarify_rel)
        quality = read(quality_rel)
        audit = read(audit_rel)
        challenger = read(challenger_rel)
        spec = read(spec_rel)
    except AssertionError as exc:
        print(f"✗ {exc}")
        return 1

    gates = [f"FEG-0{i}" for i in range(1, 8)]
    for gate in gates:
        require(skill, gate, skill_rel, errors)
        require(protocol, gate, protocol_rel, errors)
        require(reviewer, gate, reviewer_rel, errors)
        require(spec, gate, spec_rel, errors)

    for gate in ("FEG-01", "FEG-04"):
        require(quality, gate, quality_rel, errors)
    for gate in ("FEG-02", "FEG-03"):
        require(audit, gate, audit_rel, errors)
    for gate in ("FEG-03", "FEG-05", "FEG-06"):
        require(challenger, gate, challenger_rel, errors)

    require(clarify, "FEG-07", clarify_rel, errors)
    require(clarify, "TEACHBACK_GREEN", clarify_rel, errors)
    require(clarify, "TEACHBACK_YELLOW", clarify_rel, errors)
    require(clarify, "TEACHBACK_RED", clarify_rel, errors)
    require(clarify, "HUMAN-VALIDATED", clarify_rel, errors)

    require(teachback, "FEG-07", teachback_rel, errors)
    for term in (
        "TEACHBACK_GREEN",
        "TEACHBACK_YELLOW",
        "TEACHBACK_RED",
        "HUMAN-VALIDATED",
        "HUMAN-PARTIAL",
        "HUMAN-CONFLICT",
        "OBSERVED",
        "UNVERIFIED",
        "BLOCKED",
    ):
        require(teachback, term, teachback_rel, errors)
        require(teachback_protocol, term, teachback_protocol_rel, errors)

    check_user_invoked(skill, yaml, skill_rel, yaml_rel, errors)
    check_user_invoked(teachback, teachback_yaml, teachback_rel, teachback_yaml_rel, errors)

    anti_overclaim_terms = ("Não fabrique", "proveniência", "UNVERIFIED", "BLOCKED")
    for term in anti_overclaim_terms:
        require(skill, term, skill_rel, errors)

    require(skill, "0..12", skill_rel, errors)
    require(reviewer, "0..12", reviewer_rel, errors)
    require(spec, "0..12", spec_rel, errors)
    require(spec, "FEG-07 NÃO altera o score-base", spec_rel, errors)
    require(teachback, "não produz esse estado sozinha", teachback_rel, errors)
    require(teachback, "Registrar este diagnóstico", teachback_rel, errors)

    package = read("package.json")
    require(package, "scripts/verify-feynman-layer.py", "package.json", errors)

    if errors:
        print(f"✗ Feynman Layer: {len(errors)} violação(ões)")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("✓ Feynman Evidence & Understanding Layer íntegra")
    print("  gates:", ", ".join(gates))
    print("  score-base: FEG-01..FEG-06 = 0..12")
    print("  FEG-07: teach-back complementar, fora do score-base")
    return 0


if __name__ == "__main__":
    sys.exit(main())
