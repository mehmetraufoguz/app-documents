/**
 * documents-client SDK
 * Type-safe SDK for fetching documents from app-documents server
 */

// Export client functions
export { fetchDocument, fetchDocumentRaw, fetchDocumentMetadata } from './client.js';

// Export types
export type {
  DocumentVersion,
  FetchDocumentOptions,
  FetchDocumentRawOptions,
  Document,
  RawDocument,
  DocumentMetadata,
  VersionInfo,
} from './types.js';

// Export error classes
export {
  DocumentsClientError,
  DocumentNotFoundError,
  NetworkError,
  ValidationError,
} from './errors.js';
