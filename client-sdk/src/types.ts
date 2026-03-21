/**
 * Type definitions for documents-client SDK
 */

/**
 * Document version identifier - either 'main' or a commit hash
 */
export type DocumentVersion = 'main' | string;

/**
 * Base options for document fetch operations
 */
export interface FetchOptionsBase {
  /** The base server URL (e.g., https://example.com) */
  baseUrl: string;
  /** The document ID */
  documentId: string;
  /** The document version ('main' or commit hash) */
  version?: DocumentVersion;
}

/**
 * Options for fetching structured document with metadata
 */
export interface FetchDocumentOptions extends FetchOptionsBase {}

/**
 * Options for fetching raw document content
 */
export interface FetchDocumentRawOptions extends FetchOptionsBase {}

/**
 * Single version (commit) information in history
 */
export interface VersionInfo {
  [key: string]: any; // Flexible structure to match server response
}

/**
 * Document metadata
 */
export interface DocumentMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  updatedAt: string; // ISO date string
  versions: VersionInfo[]; // Array of version/commit info
}

/**
 * Structured document response with HTML content
 */
export interface Document extends DocumentMetadata {
  content: string; // Rendered HTML content
}

/**
 * Raw document response with markdown content
 */
export interface RawDocument {
  content: string; // Raw markdown content
  metadata: DocumentMetadata;
}
