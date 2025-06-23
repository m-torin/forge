import { Route } from 'next';

export const getNewParam = ({
  paramName = 'photoId',
  pathname,
  searchParams,
  value,
}: {
  paramName?: string;
  pathname: string;
  searchParams: URLSearchParams;
  value: number | string;
}) => {
  const newSearchParams = new URLSearchParams(searchParams.toString());
  newSearchParams.set(paramName, String(value));
  return `${pathname}?${newSearchParams.toString()}` as Route;
};

export const removeParam = ({
  paramName = 'photoId',
  pathname,
  searchParams,
}: {
  paramName?: string;
  pathname: string;
  searchParams: URLSearchParams;
}) => {
  const newSearchParams = new URLSearchParams(searchParams.toString());
  newSearchParams.delete(paramName);
  return `${pathname}?${newSearchParams.toString()}` as Route;
};
