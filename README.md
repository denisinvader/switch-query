# Switch Query

An utility component for [@tanstack/react-query](https://tanstack.com/query/latest/docs/framework/react/overview) that simplifies types and query state narrowing inside [nested] JSX.

## Installation

```sh
npm install switch-query
# or
yarn add switch-query
```

Supported React Query versions are `v5` and `v4`.

Supported React versions: `^19`,  `^18`, `^17`, `^16.8`.

## Usage

Basic example:

```tsx
import { useQuery } from '@tanstack/react-query';
import { SwitchQuery } from 'switch-query';

const Example = function Example() {
  const query = useQuery({
    queryKey: ['foo'],
    queryFn: () => Promise.resolve({ value: 42 }),
  });

  return (
    <SwitchQuery
      query={query}
      pending={<div>loading...</div>}
      success={({ data }) => (
        <div>
          Value is:
          {' '}
          {data.value}
        </div>
      )}
      error={({ refetch }) => (
        <div>
          <div>An error occurred</div>
          <button type="button" onClick={() => refetch()}>
            retry
          </button>
        </div>
      )}
    />
  );
};
```

With `error` prop you can use typed defined error in render:


```tsx
import { useQuery } from '@tanstack/react-query';
import { SwitchQuery } from 'switch-query';

const Example = function Example() {
  // or explicit error typing useQuery<unknown, CustomErrorClass>(...)
  const query = useQuery({
    queryKey: ['foo'],
    queryFn: () => Promise.reject(new Error('Test error')),
  });

  return (
    <SwitchQuery
      query={query}
      error={({ error }) => (
        <div>
          <h2>An error occurred</h2>
          <div>{error.message}</div>
        </div>
      )}
    />
  );
};
```

Using `checkIsEmpty` prop you can separate empty state from successful state:

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SwitchQuery } from 'switch-query';

const Example = function Example() {
  const [search, setSearch] = useState('');
  const query = useQuery({
    queryKey: ['foo', search],
    queryFn: () => Promise.resolve({
      fruits: (['apple', 'banana', 'orange']).filter((fruit) => fruit.includes(search))
    }),
  });

  return (
    <div>
      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {query.isFetching && <span>fetching...</span>}
      </div>
      <div>
        <SwitchQuery
          query={query}
          checkIsEmpty={(data) => !Array.isArray(data) || !data.length}
          pending={<div>Loading</div>}
          success={({ data }) => (
            <ul>
              {data.fruits.map((fruit) => (
                <li key={fruit}>
                  {fruit}
                </li>
              ))}
            </ul>
          )}
          empty={<div>Nothing found</div>}
        />
      </div>
    </div>
  );
};
```

### Props

- `query` – React Query object returned from `useQuery`.
- `success` – Success state render function or node. `query.data` is defined.
- `pending` – Pending state render function or node. Renders when `query.status === "pending"` or `query.isPending === true` but not on every `query.isFetching === true`.
- `error` – Error state render function or node. `query.error` is defined and not null.
- `checkIsEmpty` – Optional function to check that defined data in success state is empty to render `empty` prop.
- `empty` – Empty state render function or node. Renders when `checkIsEmpty` returns `true`. `query.data` is defined (but empty).
