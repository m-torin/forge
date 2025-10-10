# Context Index

## Memory Files

- **Latest quick context**: _(update with filename + timestamp)_
- **Latest full context**: _(update with filename + timestamp)_
- **Recent remediation report**: _(link to remediation-report-YYYY-MM-DD.md)_
- **Active services**: reference `services.json` entries.
- **Pruning history**: list tool call IDs removed during compaction.
- **Judge verdict references**: log LLM-as-judge verdict IDs and summaries.

> Update this file after each session to keep quick lookups synchronized.

---

## Extended Agent Documentation

### Two-Tier Documentation System

**Purpose**: Minimize agent startup time by separating essential (Tier 1) from detailed (Tier 2) documentation.

**Tier 1 - Quick Reference (≤200 lines)**:
- Loaded every time agent starts
- Contains: mission, boundaries, verification, key patterns, links to Tier 2
- Located in: `.claude/agents/*.md`

**Tier 2 - Extended Guides (unlimited)**:
- Read on demand via links from Tier 1
- Contains: detailed patterns, code examples, anti-patterns, troubleshooting
- Located in: `.claude/docs/agents-extended/*-extended.md`

**Results**: 44.8% reduction (7,175 → 3,962 lines), 3,213 lines saved across 18 agents + 1 command

### Available Extended Guides (15 Total)

#### Stack Specialists (5)
1. **`stack-next-react-extended.md`** - Next.js 15.4, React 19.1, App Router, RSC, server actions
2. **`stack-auth-extended.md`** - Better Auth, organizations, social OAuth, API keys
3. **`stack-prisma-extended.md`** - Prisma ORM, schema design, migrations, SafeEnv
4. **`stack-tailwind-mantine-extended.md`** - Mantine v8, Tailwind v4, design tokens, Storybook
5. **`stack-ai-extended.md`** - AI SDK v5, streaming, provider integration, feature flags

#### Shared Specialists (8)
6. **`integrations-extended.md`** - Upstash, Stripe, Hotelbeds, third-party APIs
7. **`security-extended.md`** - Dependency audits, secrets management, vulnerability remediation
8. **`performance-extended.md`** - Web vitals, profiling, build optimization, caching
9. **`testing-extended.md`** - Vitest, Playwright, Storybook regression, coverage enforcement
10. **`infra-extended.md`** - Terraform, CI/CD, hosting, deployments
11. **`foundations-extended.md`** - pnpm, Turborepo, knip, monorepo hygiene

#### Coordination & Documentation (4)
12. **`orchestrator-extended.md`** - Multi-specialist coordination, delegation, handoffs
13. **`reviewer-extended.md`** - Session analysis, blind spot detection, validation
14. **`agentic-extended.md`** - Agent configs, MCP, slash commands
15. **`docs-extended.md`** - Mintlify, AI hints, architecture guides, navigation

### Quick Access Pattern

```markdown
## Resources

- **Extended Guide**: [`.claude/docs/agents-extended/agent-name-extended.md`](../docs/agents-extended/agent-name-extended.md)
  - [Section 1](../docs/agents-extended/agent-name-extended.md#1-section-name)
  - [Section 2](../docs/agents-extended/agent-name-extended.md#2-section-name)
  ...
```

### Documentation Reports

- **Context Reduction Report**: `.claude/docs/context-reduction-report.md` - Phase-by-phase compression metrics
- **Compression Completion Report**: `.claude/docs/compression-completion-report.md` - Final achievement summary
- **Extended Guides README**: `.claude/docs/agents-extended/README.md` - Guide catalog and usage

### Templates

- **Agent File Template**: `.claude/docs/agent-file-template.md` - Optimal structure for Tier 1 agent files (≤200 lines)
- **Extended Guide Template**: `.claude/docs/extended-guide-template.md` - Structure for Tier 2 detailed guides (unlimited)

---

*Last updated: 2025-10-07*
