import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export interface WorkflowInfo {
  readonly slug: string
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly color: string
}

type WorkflowMetadata = Omit<WorkflowInfo, 'slug'>

// Define workflow metadata - in a real app this could come from file headers or a config
const WORKFLOW_METADATA: Record<string, WorkflowMetadata> = {
  path: {
    name: 'Path',
    description: 'Basic path-based workflow execution',
    icon: 'route',
    color: 'blue',
  },
  sleep: {
    name: 'Sleep',
    description: 'Demonstrates workflow sleep functionality',
    icon: 'clock',
    color: 'green',
  },
  sleepWithoutAwait: {
    name: 'Sleep Without Await',
    description: 'Sleep functionality without await pattern',
    icon: 'clock-play',
    color: 'yellow',
  },
  northStarSimple: {
    name: 'North Star Simple',
    description: 'Simple north star pattern implementation',
    icon: 'star',
    color: 'orange',
  },
  northStar: {
    name: 'North Star',
    description: 'Advanced north star workflow pattern',
    icon: 'star-filled',
    color: 'red',
  },
  auth: {
    name: 'Auth',
    description: 'Simple two-step workflow example',
    icon: 'settings',
    color: 'violet',
  },
  'vercel-ai-sdk': {
    name: 'Vercel AI SDK',
    description: 'AI-powered workflow with Vercel SDK',
    icon: 'brain',
    color: 'pink',
  },
  'serve-many': {
    name: 'Serve Many',
    description: 'Multiple workflow serving pattern',
    icon: 'server',
    color: 'teal',
  },
} as const

// Files and directories to skip when scanning for workflows
const SKIP_ENTRIES = new Set([
  'globals.css',
  'layout.tsx',
  'page.tsx',
  'theme.css',
  'theme.ts',
  'favicon-32x32.png',
])

const createFallbackWorkflow = (slug: string): WorkflowInfo => ({
  slug,
  name: slug.charAt(0).toUpperCase() + slug.slice(1),
  description: `${slug} workflow`,
  icon: 'code',
  color: 'gray',
})

export async function getWorkflows(): Promise<WorkflowInfo[]> {
  try {
    const appDir = join(process.cwd(), 'app')
    const entries = await readdir(appDir, { withFileTypes: true })

    const workflows: WorkflowInfo[] = entries
      .filter(
        (entry) =>
          entry.isDirectory() &&
          !entry.name.startsWith('api') &&
          !entry.name.startsWith('(') &&
          !SKIP_ENTRIES.has(entry.name),
      )
      .map((entry) => {
        const slug = entry.name
        const metadata = WORKFLOW_METADATA[slug]

        return metadata ? { slug, ...metadata } : createFallbackWorkflow(slug)
      })

    return workflows.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error reading workflows:', error)
    return []
  }
}
