import type { ReactNode } from 'react';
import { afterEach, expect, test } from 'vitest';
import { cleanup, render, renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { SwitchQuery } from './SwitchQuery';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

afterEach(() => {
  cleanup();
});

test('renders static pending and success props exclusively', async () => {
  const { result } = renderHook(() => useQuery({
    queryKey: ['test-1'],
    queryFn: () => Promise.resolve({ value: 42 }),
  }), { wrapper });

  const ui = (query: typeof result.current) => (
    <SwitchQuery
      query={query}
      success={<div data-testid="success-view">success</div>}
      pending={<div data-testid="pending-view">pending</div>}
      error={<div data-testid="error-view">error</div>}
    />
  );

  expect(result.current.isPending).toBe(true);

  const node = render(ui(result.current));

  expect(node.queryByTestId('pending-view')).toBeInTheDocument();
  expect(node.queryByTestId('success-view')).not.toBeInTheDocument();
  expect(node.queryByTestId('error-view')).not.toBeInTheDocument();

  await waitFor(() => result.current.isSuccess);
  node.rerender(ui(result.current));

  expect(node.queryByTestId('success-view')).toBeInTheDocument();
  expect(node.queryByTestId('pending-view')).not.toBeInTheDocument();
  expect(node.queryByTestId('error-view')).not.toBeInTheDocument();
});

test('renders noting if no render props provided', async () => {
  const { result } = renderHook(() => useQuery({
    queryKey: ['test-2.1'],
    queryFn: () => Promise.resolve({ value: 42 }),
  }), { wrapper });

  const node = render(<SwitchQuery query={result.current} />);

  expect(result.current.isPending).toBe(true);
  expect(node.container.firstChild).toBeNull();

  await waitFor(() => result.current.isSuccess);

  node.rerender(<SwitchQuery query={result.current} />);

  expect(node.container.firstChild).toBeNull();

  const error = renderHook(() => useQuery({
    queryKey: ['test-2.2'],
    queryFn: () => Promise.reject(new Error('An error')),
  }), { wrapper });

  const errorNode = render(<SwitchQuery query={error.result.current} />);

  expect(error.result.current.isPending).toBe(true);
  expect(errorNode.container.firstChild).toBeNull();

  await waitFor(() => error.result.current.isError);

  errorNode.rerender(<SwitchQuery query={error.result.current} />);

  expect(errorNode.container.firstChild).toBeNull();
});

test('renders error function if query has error state', async () => {
  const { result } = renderHook(() => useQuery<null, Error>({
    queryKey: ['test-3'],
    queryFn: () => Promise.reject(new Error('error-message')),
  }), { wrapper });

  const ui = (query: typeof result.current) => (
    <SwitchQuery
      query={query}
      pending={<div data-testid="pending-view">loading...</div>}
      success={<div data-testid="success-view">success</div>}
      error={({ error }) => (
        <div data-testid="error-view">
          {error.message}
        </div>
      )}
    />
  );

  const node = render(ui(result.current));

  expect(result.current.isPending).toBe(true);
  expect(node.queryByTestId('pending-view')).toBeInTheDocument();
  expect(node.queryByTestId('success-view')).not.toBeInTheDocument();
  expect(node.queryByTestId('error-view')).not.toBeInTheDocument();

  await waitFor(() => result.current.isError);
  await waitFor(() => result.current.isError);

  node.rerender(ui(result.current));

  expect(node.queryByTestId('error-view')).toBeInTheDocument();
  expect(node.queryByTestId('error-view')).toHaveTextContent('error-message');
  expect(node.queryByTestId('pending-view')).not.toBeInTheDocument();
  expect(node.queryByTestId('success-view')).not.toBeInTheDocument();
});

test('supports render function for success state', async () => {
  const { result } = renderHook(() => useQuery({
    queryKey: ['test-4'],
    queryFn: () => Promise.resolve({ value: 42 }),
  }), { wrapper });

  const ui = (query: typeof result.current) => (
    <SwitchQuery
      query={query}
      success={({ data }) => (
        <div data-testid="success-view">
          success:
          {data.value}
        </div>
      )}
      pending={<div data-testid="pending-view">pending</div>}
      error={<div data-testid="error-view">error</div>}
    />
  );

  const node = render(ui(result.current));

  expect(result.current.isPending).toBe(true);
  expect(node.queryByTestId('pending-view')).toBeInTheDocument();
  expect(node.queryByTestId('success-view')).not.toBeInTheDocument();
  expect(node.queryByTestId('error-view')).not.toBeInTheDocument();

  await waitFor(() => result.current.isSuccess);

  node.rerender(ui(result.current));

  expect(node.queryByTestId('success-view')).toBeInTheDocument();
  expect(node.queryByTestId('success-view')).toHaveTextContent('success:42');
  expect(node.queryByTestId('pending-view')).not.toBeInTheDocument();
  expect(node.queryByTestId('error-view')).not.toBeInTheDocument();
});
