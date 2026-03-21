# documents-client

Type-safe SDK for fetching documents from [app-documents](https://github.com/mehmetraufoguz/app-documents) server.

## Installation

```bash
npm install documents-client
```

or with pnpm:

```bash
pnpm add documents-client
```

## Usage

### Fetch Structured Document (with HTML rendering)

```ts
import { fetchDocument } from 'documents-client';

const doc = await fetchDocument({
  baseUrl: 'https://example.com',
  documentId: 'my-document',
  version: 'main' // or a commit hash
});

console.log(doc.content); // Rendered HTML
console.log(doc.history); // Commit history
```

### Fetch Raw Markdown Content

```ts
import { fetchDocumentRaw } from 'documents-client';

const raw = await fetchDocumentRaw({
  baseUrl: 'https://example.com',
  documentId: 'my-document',
  version: 'main'
});

console.log(raw.content); // Raw markdown
console.log(raw.metadata.versions); // Version history
```

### Fetch Document Metadata Only

Get document metadata and version history without fetching the full content:

```ts
import { fetchDocumentMetadata } from 'documents-client';

const metadata = await fetchDocumentMetadata({
  baseUrl: 'https://example.com',
  documentId: 'my-document'
});

console.log(metadata.versions); // Array of version info
```

## Error Handling

The SDK provides specific error classes for different failure scenarios:

```ts
import {
  fetchDocument,
  DocumentNotFoundError,
  NetworkError
} from 'documents-client';

try {
  const doc = await fetchDocument({
    baseUrl: 'https://example.com',
    documentId: 'non-existent'
  });
} catch (error) {
  if (error instanceof DocumentNotFoundError) {
    console.error('Document not found');
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.statusCode);
  }
}
```

## Examples

### React / Expo App (with TanStack Query)

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchDocumentRaw, DocumentNotFoundError } from 'documents-client';

export function DocumentViewer({ docId }: { docId: string }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['document', docId],
    queryFn: () => fetchDocumentRaw({
      baseUrl: 'https://api.example.com',
      documentId: docId,
      version: 'main'
    }),
  });

  if (isLoading) return <div>Loading...</div>;
  
  if (error) {
    if (error instanceof DocumentNotFoundError) {
      return <div>Document not found</div>;
    }
    return <div>Failed to load document</div>;
  }

  return <pre>{data?.content}</pre>;
}
```

### Node.js Script

```js
import { fetchDocumentRaw } from 'documents-client';

const doc = await fetchDocumentRaw({
  baseUrl: 'https://example.com',
  documentId: 'readme',
  version: 'main'
});

console.log(doc.content);
console.log('Last updated:', doc.metadata.updatedAt);
```

## License

MIT

## Repository

[app-documents](https://github.com/mehmetraufoguz/app-documents)
