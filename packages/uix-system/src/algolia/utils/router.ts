import type { SingletonRouter } from 'next/router';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';

interface CreateRouterOptions {
  singletonRouter: SingletonRouter;
  serverUrl?: string;
  routerOptions?: {
    createURL?: (state: any) => string;
    parseURL?: (args: { qsModule: any; location: any }) => any;
    [key: string]: any;
  };
}

export function createRouter({ singletonRouter, serverUrl, routerOptions }: CreateRouterOptions) {
  return createInstantSearchRouterNext({
    singletonRouter,
    serverUrl,
    routerOptions,
  });
}
