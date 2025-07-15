import { renderToString } from 'react-dom/server';
import { getServerState as baseGetServerState } from 'react-instantsearch';

interface GetServerStateOptions {
  renderToString?: typeof renderToString;
  [key: string]: any;
}

export async function getServerState(
  Component: React.ComponentType<any>,
  pageProps?: any,
  options: GetServerStateOptions = {},
) {
  const { renderToString: customRenderToString = renderToString, ...restOptions } = options;

  return baseGetServerState(<Component {...pageProps} />, {
    renderToString: customRenderToString,
    ...restOptions,
  });
}
