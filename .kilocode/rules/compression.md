# Content Compression Rules

## Model-Specific Compression Policy

- **Expensive models** (Claude 3.7 Sonnet, GPT-4.1): Do NOT perform content compression
- **Budget models** (GPT-4.1-Nano, smaller models): Content compression is allowed for optimization

## Guidelines

When working with premium models:
- Preserve full context and detail
- Maintain original formatting and structure
- Do not compress code comments or documentation
- Keep verbose explanations intact

When working with budget models:
- Compression is acceptable for routine tasks
- Focus on essential information only