import { readFileSync, writeFileSync } from 'node:fs';

const path = 'README.md';
let text = readFileSync(path, 'utf8');

const replacements = new Map([
  ['U[Usuário] --> R[Reversa Orchestrator]', 'U["Usuário"] --> R["Reversa Orchestrator"]'],
  ['R --> S[Scout]', 'R --> S["Scout"]'],
  ['S --> A[Archaeologist]', 'S --> A["Archaeologist"]'],
  ['A --> D[Detective]', 'A --> D["Detective"]'],
  ['A --> AR[Architect]', 'A --> AR["Architect"]'],
  ['D --> W[Writer]', 'D --> W["Writer"]'],
  ['W --> RV[Reviewer]', 'W --> RV["Reviewer"]'],
  ['RV --> SDD[_reversa_sdd]', 'RV --> SDD["_reversa_sdd"]'],
  ['SDD --> F[/reversa-forward]', 'SDD --> F["/reversa-forward"]'],
  ['SDD --> M[/reversa-migrate]', 'SDD --> M["/reversa-migrate"]'],
  ['SDD --> DOC[/reversa-docs]', 'SDD --> DOC["/reversa-docs"]'],
  ['IDEA[Feature / mudança] --> REQ[Requirements]', 'IDEA["Feature / mudança"] --> REQ["Requirements"]'],
  ['REQ --> CL[Clarify]', 'REQ --> CL["Clarify"]'],
  ['CL --> Q[Quality]', 'CL --> Q["Quality"]'],
  ['Q --> P[Plan]', 'Q --> P["Plan"]'],
  ['P --> TD[To-Do]', 'P --> TD["To-Do"]'],
  ['TD --> AU[Audit]', 'TD --> AU["Audit"]'],
  ['AU --> C[Coding]', 'AU --> C["Coding"]'],
  ['C --> SY[Sync]', 'C --> SY["Sync"]'],
  ['SY --> ADD[_reversa_sdd/addenda]', 'SY --> ADD["_reversa_sdd/addenda"]'],
  ['U[Usuário] --> E[Pontos de entrada / orquestradores]', 'U["Usuário"] --> E["Pontos de entrada / orquestradores"]'],
  ['subgraph INV[Invocation Governance]', 'subgraph INV["Invocation Governance"]'],
  ['E --> POL[Invocation Policy]', 'E --> POL["Invocation Policy"]'],
  ['POL --> META{Skill protegida?}', 'POL --> META{"Skill protegida?"}'],
  ['META -->|não| NATIVE[Invocação nativa permitida]', 'META -->|não| NATIVE["Invocação nativa permitida"]'],
  ['META -->|sim| READ[Read SKILL.md + execute no contexto atual]', 'META -->|sim| READ["Read SKILL.md + execute no contexto atual"]'],
  ['NATIVE --> PIPE[Pipelines Reversa]', 'NATIVE --> PIPE["Pipelines Reversa"]'],
  ['subgraph CORE[Pipelines herdados]', 'subgraph CORE["Pipelines herdados"]'],
  ['PIPE --> DISC[Discovery]', 'PIPE --> DISC["Discovery"]'],
  ['PIPE --> NEW[Greenfield]', 'PIPE --> NEW["Greenfield"]'],
  ['PIPE --> FWD[Forward]', 'PIPE --> FWD["Forward"]'],
  ['PIPE --> MIG[Migration]', 'PIPE --> MIG["Migration"]'],
  ['PIPE --> BUG[Bugs]', 'PIPE --> BUG["Bugs"]'],
  ['PIPE --> REF[Refactor]', 'PIPE --> REF["Refactor"]'],
  ['PIPE --> DOC[Docs]', 'PIPE --> DOC["Docs"]'],
  ['PIPE --> PRICE[Pricing]', 'PIPE --> PRICE["Pricing"]'],
  ['CORE --> ART[Artefatos / Specs / Código / Auditorias]', 'CORE --> ART["Artefatos / Specs / Código / Auditorias"]'],
  ['subgraph FE[Evidence & Understanding Layer]', 'subgraph FE["Evidence & Understanding Layer"]'],
  ['ART --> FY[/reversa-feynman]', 'ART --> FY["/reversa-feynman"]'],
  ['FY --> G1[FEG-01..06]', 'FY --> G1["FEG-01..06"]'],
  ['FY --> G7{FEG-07 candidate?}', 'FY --> G7{"FEG-07 candidate?"}'],
  ['G7 -->|não| REPORT[feynman-audit.md]', 'G7 -->|não| REPORT["feynman-audit.md"]'],
  ['G7 -->|sim| TB[/reversa-teachback]', 'G7 -->|sim| TB["/reversa-teachback"]'],
  ['TB --> HS[HUMAN-VALIDATED / PARTIAL / CONFLICT]', 'TB --> HS["HUMAN-VALIDATED / PARTIAL / CONFLICT"]'],
  ['HS --> CR[Clarify / Reviewer]', 'HS --> CR["Clarify / Reviewer"]'],
  ['C[Usuário: CONTINUAR] --> R[Reavaliar estágio físico]', 'C["Usuário: CONTINUAR"] --> R["Reavaliar estágio físico"]'],
  ['R --> S[Resolver próxima skill]', 'R --> S["Resolver próxima skill"]'],
  ['S --> M[Ler SKILL.md + openai.yaml]', 'S --> M["Ler SKILL.md + openai.yaml"]'],
  ['M --> P{Invocação implícita proibida?}', 'M --> P{"Invocação implícita proibida?"}'],
  ['P -->|sim| X[Read-and-execute no contexto atual]', 'P -->|sim| X["Read-and-execute no contexto atual"]'],
  ['P -->|não| N[Invocação nativa / fallback compatível]', 'P -->|não| N["Invocação nativa / fallback compatível"]'],
  ['X --> D[Executar fase]', 'X --> D["Executar fase"]'],
  ['D --> R2[Reavaliar estágio]', 'D --> R2["Reavaliar estágio"]'],
]);

for (const [from, to] of replacements) {
  text = text.split(from).join(to);
}

writeFileSync(path, text, 'utf8');
