'use client';

import { createContext, useContext, useMemo, ReactNode, Suspense } from 'react';
import { usePathname, useParams, useSearchParams } from 'next/navigation';

/**
 * Defines the shape of the context for managing path and navigation-related data.
 */
interface PathContextType {
  display: {
    navbar: boolean;
    aside: boolean;
    footer: boolean;
    isFlow: boolean;
  };
  pathName: string; // Current window pathname.
  lastSegment: string; // Last segment of the pathname.
  allSegments: string[]; // Array of all segments in the pathname.
  params: ReturnType<typeof useParams>; // Dynamic route parameters.
  searchParams: { [key: string]: string }; // Search (query) parameters as an object.
}

// Default values for the context, used before any real data is provided.
const defaultContextValue: PathContextType = {
  display: {
    navbar: true,
    aside: false,
    footer: false,
    isFlow: true,
  },
  pathName: '',
  lastSegment: '',
  allSegments: [],
  params: {},
  searchParams: {},
};

// Create the context with default values.
const PathContext = createContext<PathContextType>(defaultContextValue);

/**
 * Custom hook for consuming path context.
 * @returns The path context value.
 */
export const usePath = () => useContext(PathContext);

/**
 * Custom hook for selecting specific data from the path context using a selector function.
 * This helps avoid unnecessary re-renders by subscribing only to the relevant parts of the context.
 * @param selector - Function that selects specific data from the path context.
 * @returns The selected data.
 * @example
 * const lastSegment = usePathSelector(state => state.lastSegment);
 */
export function usePathSelector<T>(
  selector: (context: PathContextType) => T,
): T {
  const context = useContext(PathContext);
  return useMemo(() => selector(context), [context, selector]);
}

interface PathProviderProps {
  children: ReactNode; // The children components that will have access to the context.
}

function PathProviderContent({ children }: PathProviderProps) {
  const pathName = usePathname() ?? '';
  const rawParams = useParams();
  const rawSearchParams = useSearchParams();
  
  const params = useMemo(() => rawParams ?? {}, [rawParams]);
  const searchParams = useMemo(() => rawSearchParams ?? new URLSearchParams(), [rawSearchParams]);

  const allSegments = useMemo(
    () => pathName.split('/').filter(Boolean),
    [pathName],
  );
  const lastSegment = useMemo(() => allSegments.at(-1) ?? '', [allSegments]);

  const searchParamsObject = useMemo(() => {
    const paramsObj: { [key: string]: string } = {};
    searchParams.forEach((value, key) => {
      paramsObj[key] = value;
    });
    return paramsObj;
  }, [searchParams]);

  const isFlow = useMemo(() => pathName.startsWith('/flow/'), [pathName]);
  const isFlowAside = useMemo(
    () =>
      isFlow &&
      !pathName.endsWith('/validate') &&
      !pathName.endsWith('/settings'),
    [isFlow, pathName],
  );

  const display = useMemo(
    () => ({
      navbar: isFlow ? false : false,
      aside: isFlowAside ? false : true,
      footer: isFlow ? false : true,
      isFlow,
    }),
    [isFlow, isFlowAside],
  );

  const contextValue = useMemo(
    () => ({
      display,
      pathName,
      lastSegment,
      allSegments,
      params,
      searchParams: searchParamsObject,
    }),
    [display, pathName, lastSegment, allSegments, params, searchParamsObject],
  );

  return (
    <PathContext.Provider value={contextValue}>{children}</PathContext.Provider>
  );
}

/**
 * Provider component that manages and provides the path context to its children.
 * @param children - Child components that consume the provided context.
 */
export const PathProvider: React.FC<PathProviderProps> = ({ children }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PathProviderContent>{children}</PathProviderContent>
    </Suspense>
  );
};

/**
 * Example usage of the PathProvider and usePath hook in a component.
 * @example
 * const MyComponent = () => {
 *   const { pathName, lastSegment, allSegments, params, searchParams } = usePath();
 *   return (
 *     <div>
 *       <p>Pathname: {pathName}</p>
 *       <p>Last Segment: {lastSegment}</p>
 *       <p>All Segments: {allSegments.join('/')}</p>
 *       <p>Params: {JSON.stringify(params)}</p>
 *       <p>Search Params: {JSON.stringify(searchParams)}</p>
 *     </div>
 *   );
 * };
 */
