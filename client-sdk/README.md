# app-documents-client

[![npm version](https://img.shields.io/npm/v/app-documents-client.svg)](https://www.npmjs.com/package/app-documents-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/mehmetraufoguz/app-documents)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

Type-safe SDK for fetching documents from [app-documents](https://github.com/mehmetraufoguz/app-documents) server.

## Installation

```bash
npm install app-documents-client
```

or with pnpm:

```bash
pnpm add app-documents-client
```

## Usage

### Fetch Document with HTML Content

Get document metadata along with rendered HTML content:

```ts
import { fetchDocument } from 'app-documents-client';

const doc = await fetchDocument({
  baseUrl: 'https://example.com',
  documentId: 'my-document',
  version: 'main' // or a commit hash
});

console.log(doc.content); // Rendered HTML
console.log(doc.title); // Document title
console.log(doc.versions); // Array of version info
```

### Fetch Raw Markdown Content

```ts
import { fetchDocumentRaw } from 'app-documents-client';

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
import { fetchDocumentMetadata } from 'app-documents-client';

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
} from 'app-documents-client';

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
import { fetchDocumentRaw, DocumentNotFoundError } from 'app-documents-client';

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
import { fetchDocumentRaw } from 'app-documents-client';

const doc = await fetchDocumentRaw({
  baseUrl: 'https://example.com',
  documentId: 'readme',
  version: 'main'
});

console.log(doc.content);
console.log('Last updated:', doc.metadata.updatedAt);
```

## API Reference

### `fetchDocument(options): Promise<Document>`

Fetches document with HTML content and metadata.

**Parameters:**
- `options.baseUrl` (string, required) - Server base URL
- `options.documentId` (string, required) - Document identifier
- `options.version` (string, optional, default: 'main') - Version to fetch ('main' or commit hash)

**Returns:** Promise resolving to `Document` object with:
- `content` (string) - Rendered HTML
- `id` (string) - Document ID
- `slug` (string) - URL-friendly identifier
- `title` (string) - Document title
- `description` (string) - Document description
- `updatedAt` (string) - Last update timestamp (ISO)
- `versions` (array) - Version history

**Throws:**
- `ValidationError` - Invalid input options or malformed server response
- `DocumentNotFoundError` - Document not found (404)
- `NetworkError` - Network request failed

---

### `fetchDocumentRaw(options): Promise<RawDocument>`

Fetches raw markdown content with metadata.

**Parameters:**
- `options.baseUrl` (string, required) - Server base URL
- `options.documentId` (string, required) - Document identifier
- `options.version` (string, optional, default: 'main') - Version to fetch

**Returns:** Promise resolving to `RawDocument` object with:
- `content` (string) - Raw markdown text
- `metadata` (DocumentMetadata) - Same structure as `fetchDocumentMetadata`

**Throws:** Same as `fetchDocument`

---

### `fetchDocumentMetadata(options): Promise<DocumentMetadata>`

Fetches only document metadata (no content).

**Parameters:**
- `options.baseUrl` (string, required) - Server base URL
- `options.documentId` (string, required) - Document identifier

**Returns:** Promise resolving to `DocumentMetadata` object with:
- `id` (string) - Document ID
- `slug` (string) - URL-friendly identifier
- `title` (string) - Document title
- `description` (string) - Document description
- `updatedAt` (string) - Last update timestamp (ISO)
- `versions` (array) - Version history with hash, message, author, date

**Throws:** Same as `fetchDocument`

---

## Error Classes

### `ValidationError`

Thrown when input validation fails or server response is malformed.

**Properties:**
- `message` (string) - Error message
- `issues` (array, optional) - Zod validation issues

### `DocumentNotFoundError`

Thrown when document is not found (HTTP 404).

**Properties:**
- `message` (string) - Error message with document ID

### `NetworkError`

Thrown when network request fails.

**Properties:**
- `message` (string) - Error message
- `statusCode` (number, optional) - HTTP status code

### `DocumentsClientError`

Base error class for all SDK errors.

## License

MIT

## Repository

[app-documents](https://github.com/mehmetraufoguz/app-documents)
