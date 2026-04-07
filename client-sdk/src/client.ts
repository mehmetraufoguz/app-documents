/**
 * Core client implementation for app-documents-client SDK
 */

import {
  FetchDocumentOptions,
  FetchDocumentRawOptions,
  Document,
  RawDocument,
  DocumentMetadata,
} from './types.js';
import {
  DocumentNotFoundError,
  NetworkError,
  ValidationError,
} from './errors.js';
import {
  fetchOptionsSchema,
  documentMetadataSchema,
} from './schemas.js';
import type { z } from 'zod';

/**
 * Builds the API URL based on options and version
 */
function buildApiUrl(
  baseUrl: string,
  documentId: string,
  version?: string,
  raw: boolean = false
): string {
  const url = new URL(baseUrl);
  const versionPath = version && version !== 'main' ? `/commit/${version}` : '';
  const segment = version && version !== 'main' ? versionPath : '/main';
  const rawSuffix = raw ? '/raw' : '';

  url.pathname = url.pathname.replace(/\/$/, ''); // Remove trailing slash
  url.pathname += `/document/${documentId}${segment}${rawSuffix}`;

  return url.toString();
}

/**
 * Builds the metadata API URL (always /document/{id}/ regardless of version)
 */
function buildMetadataUrl(
  baseUrl: string,
  documentId: string
): string {
  const url = new URL(baseUrl);
  url.pathname = url.pathname.replace(/\/$/, ''); // Remove trailing slash
  url.pathname += `/document/${documentId}/`;

  return url.toString();
}

/**
 * Handles HTTP response and throws appropriate errors
 */
async function handleResponse<T>(
  response: Response,
  schema: z.ZodType<T>
): Promise<T> {
  if (response.status === 404) {
    const documentId = response.url.split('/').slice(-1)[0];
    throw new DocumentNotFoundError(documentId);
  }

  if (!response.ok) {
    throw new NetworkError(
      `Request failed with status ${response.status}`,
      response.status
    );
  }

  try {
    const data = await response.json();
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(
        'Invalid response from server',
        result.error.issues
      );
    }
    return result.data as T;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new NetworkError('Failed to parse response');
  }
}

/**
 * Handles text response for raw content
 */
async function handleTextResponse(response: Response): Promise<string> {
  if (response.status === 404) {
    throw new DocumentNotFoundError('document');
  }

  if (!response.ok) {
    throw new NetworkError(
      `Request failed with status ${response.status}`,
      response.status
    );
  }

  return response.text();
}

/**
 * Fetch structured document with metadata and rendered HTML content
 * 
 * @param options - Configuration for the fetch
 * @returns Promise resolving to the document with metadata and HTML content
 * @throws ValidationError if options are invalid
 * @throws DocumentNotFoundError if document is not found
 * @throws NetworkError if the request fails
 * 
 * @example
 * ```ts
 * const doc = await fetchDocument({
 *   baseUrl: 'https://example.com',
 *   documentId: 'my-doc',
 *   version: 'main' // or a commit hash
 * });
 * console.log(doc.content); // HTML content
 * console.log(doc.versions); // Version history
 * ```
 */
export async function fetchDocument(
  options: FetchDocumentOptions
): Promise<Document> {
  // Validate input options
  const validationResult = fetchOptionsSchema.safeParse(options);
  if (!validationResult.success) {
    throw new ValidationError('Invalid options provided', validationResult.error.issues);
  }

  const { baseUrl, documentId, version } = validationResult.data;

  try {
    // Fetch HTML content
    const contentUrl = buildApiUrl(baseUrl, documentId, version, false);
    const contentResponse = await fetch(contentUrl);
    
    if (contentResponse.status === 404) {
      throw new DocumentNotFoundError(documentId, version);
    }
    if (!contentResponse.ok) {
      throw new NetworkError(
        `Request failed with status ${contentResponse.status}`,
        contentResponse.status
      );
    }
    const content = await contentResponse.text();

    // Fetch metadata from the base endpoint
    const metadataUrl = buildMetadataUrl(baseUrl, documentId);
    const metadataResponse = await fetch(metadataUrl);
    const metadata: DocumentMetadata = await handleResponse(metadataResponse, documentMetadataSchema);

    return { ...metadata, content };
  } catch (error) {
    if (error instanceof DocumentNotFoundError || 
        error instanceof NetworkError ||
        error instanceof ValidationError) {
      throw error;
    }
    throw new NetworkError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Fetch raw markdown content of a document
 * 
 * @param options - Configuration for the fetch
 * @returns Promise resolving to raw markdown content and metadata
 * @throws ValidationError if options are invalid
 * @throws DocumentNotFoundError if document is not found
 * @throws NetworkError if the request fails
 * 
 * @example
 * ```ts
 * const raw = await fetchDocumentRaw({
 *   baseUrl: 'https://example.com',
 *   documentId: 'my-doc',
 *   version: 'main'
 * });
 * console.log(raw.content); // Raw markdown
 * console.log(raw.metadata.history); // Commit history
 * ```
 */
export async function fetchDocumentRaw(
  options: FetchDocumentRawOptions
): Promise<RawDocument> {
  // Validate input options
  const validationResult = fetchOptionsSchema.safeParse(options);
  if (!validationResult.success) {
    throw new ValidationError('Invalid options provided', validationResult.error.issues);
  }

  const { baseUrl, documentId, version } = validationResult.data;

  try {
    // Fetch raw content
    const contentUrl = buildApiUrl(baseUrl, documentId, version, true);
    const contentResponse = await fetch(contentUrl);
    const content = await handleTextResponse(contentResponse);

    // Fetch metadata from the metadata endpoint
    const metadataUrl = buildMetadataUrl(baseUrl, documentId);
    const metadataResponse = await fetch(metadataUrl);
    const metadata: DocumentMetadata = await handleResponse(metadataResponse, documentMetadataSchema);

    return { content, metadata };
  } catch (error) {
    if (error instanceof DocumentNotFoundError || 
        error instanceof NetworkError ||
        error instanceof ValidationError) {
      throw error;
    }
    throw new NetworkError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Get the document history (commit history) without fetching full content
 * 
 * @param options - Configuration for the fetch (version is ignored for history)
 * @returns Promise resolving to document metadata with commit history
 * @throws ValidationError if options are invalid
 * @throws DocumentNotFoundError if document is not found
 * @throws NetworkError if the request fails
 * 
 * @example
 * ```ts
 * const metadata = await fetchDocumentMetadata({
 *   baseUrl: 'https://example.com',
 *   documentId: 'my-doc'
 * });
 * console.log(metadata.history); // Array of commits
 * ```
 */
export async function fetchDocumentMetadata(
  options: Omit<FetchDocumentOptions, 'version'>
): Promise<DocumentMetadata> {
  // Validate input options
  const validationResult = fetchOptionsSchema.safeParse({
    ...options,
    version: 'main',
  });
  if (!validationResult.success) {
    throw new ValidationError('Invalid options provided', validationResult.error.issues);
  }

  const { baseUrl, documentId } = validationResult.data;

  try {
    const url = buildMetadataUrl(baseUrl, documentId);
    const response = await fetch(url);
    return handleResponse(response, documentMetadataSchema);
  } catch (error) {
    if (error instanceof DocumentNotFoundError || 
        error instanceof NetworkError ||
        error instanceof ValidationError) {
      throw error;
    }
    throw new NetworkError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
