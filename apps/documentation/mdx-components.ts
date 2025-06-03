import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import { Pre, withIcons } from 'nextra/components';
import { GitHubIcon } from 'nextra/icons';
import type { MDXComponents } from 'nextra/mdx-components';

const docsComponents = getDocsMDXComponents({
  pre: withIcons(Pre, { js: GitHubIcon }),
});

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...docsComponents,
    ...components,
  };
}
