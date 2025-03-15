import type { ReactNode } from 'react';
import type {
  QueryObserverSuccessResult,
  QueryObserverPendingResult,
  QueryObserverLoadingResult,
  QueryObserverLoadingErrorResult,
  QueryObserverRefetchErrorResult,
  UseQueryResult,
} from '@tanstack/react-query';

type Defined<T> = T extends undefined ? Exclude<T, undefined> : T;
type QuerySuccess<D, E> = QueryObserverSuccessResult<Defined<D>, E>;
type QueryPending<D, E> = (
  | QueryObserverPendingResult<D, E>
  | QueryObserverLoadingResult<D, E>
);
type QueryError<D, E> = (
  | QueryObserverLoadingErrorResult<D, Defined<E>>
  | QueryObserverRefetchErrorResult<D, Defined<E>>
);
type RenderProp<TQuery> = ReactNode | ((query: TQuery) => ReactNode);

export interface SwitchQueryProps<TData, TError, TQuery extends UseQueryResult<TData, TError>> {
  query: TQuery & UseQueryResult<TData, TError>;
  success?: RenderProp<QuerySuccess<TData, TError>>;
  empty?: RenderProp<QuerySuccess<TData, TError>>;
  pending?: RenderProp<QueryPending<TData, TError>>;
  error?: RenderProp<QueryError<TData, TError>>;
  checkIsEmpty?: (data: Defined<TData>) => boolean;
}

export const SwitchQuery = function SwitchQuery<D, E, Q extends UseQueryResult<D, E>>({
  query,
  success,
  empty,
  pending,
  error,
  checkIsEmpty,
}: SwitchQueryProps<D, E, Q>): ReactNode {
  if (query.isPending) {
    return typeof pending === 'function'
      ? pending(query)
      : pending || null;
  }

  if (query.isError) {
    return typeof error === 'function'
      ? error(query as QueryError<D, E>)
      : error || null;
  }

  if (typeof checkIsEmpty === 'function') {
    if (checkIsEmpty(query.data as Defined<D>)) {
      return typeof empty === 'function'
        ? empty(query as QuerySuccess<D, E>)
        : empty || null;
    }
  }

  return typeof success === 'function'
    ? success(query as QuerySuccess<D, E>)
    : success || null;
};
