export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤖 Autonomous Workflow Development System
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Zero-Human-Intervention Code Generation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This system uses Claude CLI to autonomously develop, test, and deploy Upstash Workflow
              functions with self-healing capabilities and continuous learning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  🚀 Rapid Development
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate complete workflows from specifications in minutes
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  🔧 Self-Healing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically fix errors and optimize code through AI-powered repairs
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  🧠 Continuous Learning
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn from each iteration to improve future code generation
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Quick Start
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-mono text-lg mb-2">Run Demo</h3>
                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm">
                  pnpm autonomous:demo
                </code>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-mono text-lg mb-2">Test Workflow</h3>
                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm">
                  pnpm autonomous:test test-workflow-spec.json
                </code>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-mono text-lg mb-2">ZHI Protocol</h3>
                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm">
                  pnpm autonomous:zhi
                </code>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Available Protocols
            </h2>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Standard Workflow Development
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Complete autonomous development from specification to deployment with
                  comprehensive testing
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  Rapid Prototype
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Quick workflow generation with relaxed validation for fast iteration
                </p>
              </div>

              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  High Reliability
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Extensive validation and testing for critical workflows with security scanning
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>
              Research paper: &quot;Autonomous Workflow Development and Repair System Using Claude
              CLI&quot;
            </p>
            <p className="mt-2">Built with Next.js, TypeScript, and Upstash Workflow</p>
          </div>
        </div>
      </main>
    </div>
  );
}
