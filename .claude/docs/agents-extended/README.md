# Agent Extended Documentation

> **Tier 2 Reference**: Comprehensive patterns and examples for Forge specialist agents

## Overview

This directory contains **extended documentation** for specialist agents in the Forge monorepo. The documentation follows a **two-tier architecture** designed to optimize agent startup time and context usage:

### Tier 1: Quick Reference
- **Location**: `.claude/agents/*.md`
- **Size limit**: ≤200 lines
- **Content**: Mission, boundaries, essential patterns, common tasks
- **Usage**: Loaded by agents on every startup

### Tier 2: Extended Guides (This Directory)
- **Location**: `.claude/docs/agents-extended/*-extended.md`
- **Size limit**: Unlimited
- **Content**: Detailed patterns, code examples, anti-patterns, troubleshooting
- **Usage**: Referenced on-demand via links from Tier 1 docs

## Why Two Tiers?

**Problem**: Previous agent documentation was verbose (~1,800 lines total), causing slow startup and consuming excessive context before agents could begin work.

**Solution**: Separate essential information (Tier 1) from detailed examples (Tier 2), reducing initial context load by ~50% while maintaining access to comprehensive documentation when needed.

**Results**:
- **Startup context**: Reduced from ~1,800 to ~900 lines
- **Agent performance**: Faster initialization, more context available for work
- **Documentation quality**: Maintained comprehensive examples in Tier 2

## Available Extended Guides

### Core Coordination

#### [orchestrator-extended.md](./orchestrator-extended.md)
**Orchestrator coordination and multi-specialist workflows**

8 sections covering:
- Delegation decision trees
- Session state management patterns
- Specialist handoff protocols
- Parallel execution strategies
- Context compaction workflows
- Common coordination failures
- Reporting templates

**Use when**: Coordinating multi-specialist tasks, managing complex workflows, handling specialist handoffs

---

#### [reviewer-extended.md](./reviewer-extended.md)
**External validation and orchestrator work review**

8 sections covering:
- Session analysis workflows
- Improvement proposal validation
- Blind spot detection patterns
- Counter-proposal generation
- Quality scoring rubrics
- Common orchestrator mistakes
- Review output templates

**Use when**: Validating orchestrator decisions, reviewing session quality, proposing improvements

---

### Stack Specialists

#### [stack-auth-extended.md](./stack-auth-extended.md)
**Better Auth framework: authentication, organizations, OAuth**

8 sections covering:
- Session management patterns (edge + Node.js)
- Organization RBAC implementation
- OAuth provider integration
- Passkey/magic link flows
- Session storage optimization
- Edge runtime compatibility
- Common auth issues and fixes

**Use when**: Implementing authentication, managing organizations, debugging auth issues

---

#### [stack-next-react-extended.md](./stack-next-react-extended.md)
**Next.js 15.4 / React 19.1: App Router, RSC, streaming**

8 sections covering:
- Server actions implementation
- RSC streaming patterns
- Suspense boundary strategies
- Route handler patterns
- Form handling with server actions
- Cache revalidation strategies
- Common Next.js anti-patterns

**Use when**: Building Next.js features, implementing server actions, optimizing RSC

---

#### [stack-prisma-extended.md](./stack-prisma-extended.md)
**Prisma ORM: schema, migrations, query optimization**

8 sections covering:
- Schema design patterns
- Migration strategies
- Query optimization techniques
- Transaction handling
- Edge runtime client usage
- Validator fragment patterns
- Common Prisma pitfalls

**Use when**: Designing schemas, writing complex queries, optimizing database performance

---

#### [stack-tailwind-mantine-extended.md](./stack-tailwind-mantine-extended.md)
**Mantine v8 / Tailwind v4: UI components, design tokens, Storybook**

8 sections covering:
- Component implementation patterns
- Design token management
- Storybook integration and interaction tests
- Accessibility (ARIA, keyboard, focus)
- Dark mode implementation
- Form patterns with Mantine
- Responsive design strategies
- UI anti-patterns and mistakes

**Use when**: Building UI components, managing design tokens, implementing accessibility, writing Storybook stories

---

#### [stack-ai-extended.md](./stack-ai-extended.md)
**AI SDK v5: Streaming, model providers, feature flags**

8 sections covering:
- AI SDK v5 tool patterns (`inputSchema` usage)
- Streaming implementation patterns
- Provider integration (OpenAI, Anthropic, etc.)
- Feature flags and SafeEnv patterns
- Error handling and boundaries
- Latency monitoring and optimization
- Server action patterns
- AI anti-patterns and mistakes

**Use when**: Building AI features, integrating model providers, implementing streaming, optimizing latency

---

### Shared Specialists

#### [agentic-extended.md](./agentic-extended.md)
**Agent tooling: Claude configs, MCP, slash commands**

8 sections covering:
- Agent configuration patterns
- MCP server integration
- Slash command implementation
- Agent coordination protocols
- Permission modes and safety
- Tool development patterns
- Common agent issues

**Use when**: Creating agents, building MCP servers, implementing slash commands

---

#### [foundations-extended.md](./foundations-extended.md)
**Monorepo hygiene: pnpm, Turborepo, knip, dependency management**

8 sections covering:
- pnpm workspace patterns
- Turborepo pipeline optimization
- Dependency catalog strategies
- Cache performance tuning
- knip unused code detection
- Circular dependency resolution
- Common monorepo workflows

**Use when**: Optimizing builds, managing dependencies, debugging monorepo issues

---

#### [infra-extended.md](./infra-extended.md)
**Infrastructure: Terraform, GitHub Actions, deployments**

8 sections covering:
- Terraform module patterns
- GitHub Actions optimization
- Deployment workflows
- Secret management strategies
- Environment configuration
- Rollback procedures
- Common infrastructure issues

**Use when**: Managing infrastructure, optimizing CI/CD, deploying applications

---

#### [integrations-extended.md](./integrations-extended.md)
**External services: Upstash, Stripe, Hotelbeds, third-party APIs**

8 sections covering:
- API client implementation
- Webhook security patterns
- Rate limiting strategies
- Retry with exponential backoff
- Circuit breaker patterns
- Credential management
- Integration workflows

**Use when**: Integrating external services, handling webhooks, implementing resilience patterns

---

#### [performance-extended.md](./performance-extended.md)
**Performance optimization: web vitals, profiling, caching**

8 sections covering:
- Server timing instrumentation
- Profiling techniques
- Bundle analysis workflows
- Web vitals optimization
- Cache optimization strategies
- Performance monitoring
- Common performance issues

**Use when**: Optimizing performance, debugging slowness, improving metrics

---

#### [security-extended.md](./security-extended.md)
**Security and compliance: vulnerability triage, secrets, auth**

8 sections covering:
- Vulnerability triage workflows
- Secret management patterns
- Auth security best practices
- Webhook signature verification
- Renovate PR review process
- Security incident response
- Common security issues

**Use when**: Reviewing security, managing secrets, responding to vulnerabilities

---

#### [testing-extended.md](./testing-extended.md)
**Testing: Vitest, Playwright, Storybook, coverage**

8 sections covering:
- Vitest unit/integration patterns
- Playwright E2E strategies
- Storybook interaction tests
- Coverage enforcement
- Centralized mocks (@repo/qa)
- Flaky test diagnosis
- Common testing anti-patterns

**Use when**: Writing tests, debugging failures, improving coverage

---

### Documentation

#### [docs-extended.md](./docs-extended.md)
**Mintlify documentation, AI hints, architecture guides**

8 sections covering:
- Mintlify configuration patterns
- AI hints authoring guidelines
- Navigation structure patterns
- API reference documentation
- MDX component showcase
- Versioning and changelog
- Search optimization strategies
- Documentation anti-patterns

**Use when**: Writing documentation, creating AI hints, configuring Mintlify, optimizing search

---

## Usage Guidelines

### For Agents

1. **On startup**: Read Tier 1 quick reference (`.claude/agents/<agent>.md`)
2. **When needed**: Follow links to specific sections in Tier 2 extended guides
3. **For examples**: Reference extended guides for detailed code patterns
4. **For troubleshooting**: Check "Common Issues" sections in extended guides

### For Developers

1. **Quick answers**: Check Tier 1 docs first (concise, focused)
2. **Detailed examples**: Refer to Tier 2 extended guides
3. **Best practices**: Extended guides contain comprehensive patterns
4. **Anti-patterns**: Learn what to avoid from Tier 2 sections

### For Documentation Updates

**Update Tier 1** when:
- Mission or boundaries change
- Core patterns evolve
- Common tasks are added/removed

**Update Tier 2** when:
- Adding detailed code examples
- Documenting complex workflows
- Recording troubleshooting procedures
- Expanding anti-patterns section

## Navigation

- **Agent quick references**: `.claude/agents/`
- **Extended guides** (this directory): `.claude/docs/agents-extended/`
- **Master guide**: `.claude/docs/claude-code-agents-guide-v2.md`
- **Memory management**: `.claude/memory/README.md`

## Contributing

When adding new extended documentation:

1. **Use templates**:
   - [Agent File Template](../agent-file-template.md) for Tier 1 (≤200 lines)
   - [Extended Guide Template](../extended-guide-template.md) for Tier 2 (unlimited)
2. **Create extended guide**: `<agent-name>-extended.md` in this directory
3. **Structure**: 8 sections (patterns, workflows, anti-patterns, troubleshooting, etc.)
4. **Link from Tier 1**: Add section links to `.claude/agents/<agent>.md`
5. **Update this README**: Add entry with description and use cases

### Templates Available

- **[Agent File Template](../agent-file-template.md)** - Optimal structure for compressed agent files
- **[Extended Guide Template](../extended-guide-template.md)** - Structure for detailed documentation

---

*Last updated: 2025-10-07*
*Part of the Forge two-tier agent documentation system*
