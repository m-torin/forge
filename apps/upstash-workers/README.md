[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fworkflow-js%2Ftree%2Fmain%2Fworkflow%2Fnextjs&env=QSTASH_TOKEN&envDescription=You%20can%20access%20this%20variable%20from%20Upstash%20Console%2C%20under%20QStash%20page.%20&project-name=workflow-nextjs&repository-name=workflow-nextjs&demo-title=Upstash%20Workflow%20Example&demo-description=A%20Next.js%20application%20utilizing%20Upstash%20Workflow)

# Upstash Workflow Nextjs Example

This project has some routes showcasing how Upstash Workflow can be used in a nextjs project. You can learn more in [Workflow documentation for Nextjs](https://upstash.com/docs/qstash/workflow/quickstarts/vercel-nextjs).

Under the app directory, you will find 7 folders, each corresponding to a workflow API except the `-call-qstash`. In each of these folders, you will find the `route.ts` file which defines the endpoint.

The user calls `-call-qstash` with information about which endpoint is to be called in the body. `-call-qstash` publishes a message to QStash. QStash then calls the specified endpoint.

![flow-diagram](../imgs/flow-diagram.png)

## Deploying the Project at Vercel

To deploy the project, you can simply use the `Deploy with Vercel` button at the top of this README. If you want to edit the project and deploy it, you can read the rest of this section.

To deploy the project at vercel and try the endpoints, you should start with setting up the project by running:

```
vercel
```

Next, you shoud go to vercel.com, find your project and add `QSTASH_TOKEN`, to the project as environment variables. You can find this env variables from the [Upstash Console](https://console.upstash.com/workflow). To learn more about other env variables and their use in the context of Upstash Workflow, you can read [the Secure your Endpoint in our documentation](https://upstash.com/docs/qstash/workflow/howto/security#using-qstashs-built-in-request-verification-recommended).

Once you add the env variables, you can deploy the project with:

```
vercel --prod
```

Note that the project won't work in preview. It should be deployed to production like above. This is because preview requires authentication.

Once you have the app deployed, you can go to the deployment and call the endpoints using the form on the page.

You can observe the logs at [Upstash console under the Worfklow tab](https://console.upstash.com/workflow) or vercel.com to see your workflow operate.

## Local Development

This project is configured for local development with the QStash CLI. Follow these steps:

### Prerequisites

1. **Start QStash CLI server** (required for local development):
   ```bash
   pnpm qstash:dev
   ```
   This starts the QStash CLI server on `http://localhost:8080`

2. **Start the Next.js development server** (in another terminal):
   ```bash
   pnpm dev
   ```

### One-Command Setup

Alternatively, you can start both servers at once:
```bash
pnpm dev:full
```

### Environment Configuration

The app is pre-configured for local development with these settings in `.env.local`:

- ✅ **Local QStash CLI**: `QSTASH_URL="http://localhost:8080"`
- ✅ **Local signing keys**: Pre-configured for development
- ✅ **Feature flag**: `NEXT_PUBLIC_USE_LOCAL_QSTASH="true"`

### How It Works

1. **Local Mode**: The app automatically detects development mode and uses local QStash CLI
2. **Workflow Execution**: Workflows run locally without external dependencies
3. **Debugging**: All logs appear in your terminal

### Troubleshooting

- **500 Errors**: Make sure QStash CLI is running (`pnpm qstash:dev`)
- **Connection Refused**: Check that port 8080 is available
- **Missing Dependencies**: Run `pnpm install`

For more details, see the [Local Development documentation](https://upstash.com/docs/qstash/workflow/howto/local-development).
