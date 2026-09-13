#!/usr/bin/env python3
import argparse
import csv
import json
from pathlib import Path


def load_row(path: Path, problem_id: str):
    with path.open('r', encoding='utf-8-sig', newline='') as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            candidate = (row.get('Problem ID') or '').strip()
            if candidate == problem_id:
                return row
    raise SystemExit(f'problem not found: {problem_id}')


def main():
    parser = argparse.ArgumentParser(description='Extract one IMO-Bench task into a ReversaFeynman problem JSON.')
    parser.add_argument('--input', required=True)
    parser.add_argument('--problem-id', required=True)
    parser.add_argument('--suite', choices=['answerbench', 'proofbench', 'leanproofbench'], required=True)
    parser.add_argument('--benchmark-commit', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()

    source = Path(args.input)
    row = load_row(source, args.problem_id)

    base = {
        'problem_id': args.problem_id,
        'suite': args.suite,
        'benchmark_repo': 'google-deepmind/superhuman',
        'benchmark_ref': args.benchmark_commit,
        'benchmark_path': f'imobench/{source.name}',
        'benchmark_commit': args.benchmark_commit,
        'statement': (row.get('Problem') or '').strip(),
        'category': (row.get('Category') or '').strip() or None,
        'subcategory': (row.get('Subcategory') or row.get('Level') or '').strip() or None,
        'smoke': False,
        'metadata': {
            'source': (row.get('Source') or '').strip() or None,
            'extracted_from': str(source),
        },
    }

    if args.suite == 'answerbench':
        answer = (row.get('Short Answer') or '').strip()
        if not answer:
            raise SystemExit('selected AnswerBench row has no Short Answer')
        base['reference_answer'] = answer
    else:
        solution = (row.get('Solution') or '').strip()
        rubric = (row.get('Grading guidelines') or '').strip()
        if not solution or not rubric:
            raise SystemExit('selected proof row lacks Solution or Grading guidelines')
        base['reference_solution'] = solution
        base['grading_rubric'] = rubric
        short_answer = (row.get('Short Answer') or '').strip()
        if short_answer:
            base['reference_answer'] = short_answer

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(base, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {args.problem_id} -> {out}')
    print('Reference fields are stored in the problem artifact but are only exposed to judge role by the orchestrator.')


if __name__ == '__main__':
    main()
