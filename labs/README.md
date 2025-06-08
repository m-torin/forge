# Labs

This directory contains experimental projects, prototypes, and research initiatives.

## Purpose

The `labs/` directory is dedicated to:
- 🧪 **Experimental Features** - Test new ideas before integrating into main apps
- 🔬 **Research Projects** - Explore new technologies and patterns
- 🚀 **Prototypes** - Rapid proof-of-concepts
- 📚 **Learning Projects** - Educational examples and tutorials

## Structure

Each lab project should:
- Be a standalone pnpm workspace package
- Include its own README with purpose and findings
- Follow the monorepo's configuration standards where applicable
- Be excluded from production builds

## Creating a New Lab

```bash
# Create a new lab project
mkdir labs/my-experiment
cd labs/my-experiment
pnpm init

# Add to package.json
{
  "name": "@labs/my-experiment",
  "private": true,
  "version": "0.0.1"
}
```

## Guidelines

- Keep experiments isolated and well-documented
- Archive or promote successful experiments
- Remove failed or abandoned experiments periodically
- Use the same tooling as the main monorepo when possible