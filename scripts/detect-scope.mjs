#!/usr/bin/env node
const input = process.argv.slice(2).join(' ') || process.env.CLAUDE_FILE_PATHS || '';
if (!input.trim()) {
  console.log('.');
  process.exit(0);
}
const paths = input
  .split(/[,\n]+/)
  .map(p => p.trim())
  .filter(Boolean);
const rules = [
  { match: /apps\/webapp/, scope: 'webapp' },
  { match: /apps\/ciseco-nextjs/, scope: 'ciseco-nextjs' },
  { match: /apps\/ai-chatbot/, scope: 'ai-chatbot' },
  { match: /packages\/uix-system/, scope: '@repo/uix-system' },
  { match: /packages\/ai/, scope: '@repo/ai' },
  { match: /packages\/new-ai-combined/, scope: '@repo/new-ai-combined' },
  { match: /packages\/pkgs-databases/, scope: '@repo/db-prisma' },
  { match: /packages\/config-eslint|scripts\/lint/, scope: 'tooling' },
  { match: /packages\/config-typescript|packages\/types/, scope: 'tooling' },
  { match: /packages\/pkgs-integrations|services\//, scope: 'integrations' },
  { match: /packages\/observability/, scope: 'observability' },
  { match: /apps\/docs/, scope: 'docs' },
  { match: /infra\//, scope: 'infra' },
];
for (const path of paths) {
  const rule = rules.find(r => r.match.test(path));
  if (rule) {
    console.log(rule.scope);
    process.exit(0);
  }
}
console.log('.');
