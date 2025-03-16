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
  | QueryObserverLoadingErrorResult<D, Defined<E extends null ? Exclude<E, null> : E>>
  | QueryObserverRefetchErrorResult<D, Defined<E extends null ? Exclude<E, null> : E>>
);
type RenderProp<TQuery> = ReactNode | ((query: TQuery) => ReactNode);

export interface SwitchQueryProps<TData, TError, TQuery extends UseQueryResult<TData, TError>> {
  /**
    * React Query object returned from `useQuery`.
    */
  query: TQuery & UseQueryResult<TData, TError>;
  /**
    * Success state render function or node.
    * `query.data` is defined.
    */
  success?: RenderProp<QuerySuccess<TData, TError>>;
  /**
    * Empty state render function or node.
    * Renders when `checkIsEmpty` returns `true`.
    * `query.data` is defined (but empty).
    */
  empty?: RenderProp<QuerySuccess<TData, TError>>;
  /**
    * Pending state render function or node.
    * `query.status === "pending"` or `query.isPending === true`.
    */
  pending?: RenderProp<QueryPending<TData, TError>>;
  /**
    * Error state render function or node.
    * `query.error` is defined.
    */
  error?: RenderProp<QueryError<TData, TError>>;
  /**
    * Optional function to check that defined data in success state is empty to render `empty` prop.
    */
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
