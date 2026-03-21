/**
 * Custom error classes for documents-client SDK
 */

/**
 * Base error class for SDK errors
 */
export class DocumentsClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentsClientError';
  }
}

/**
 * Thrown when a document is not found (404)
 */
export class DocumentNotFoundError extends DocumentsClientError {
  constructor(documentId: string, version?: string) {
    super(
      `Document not found: ${documentId}${version ? ` (version: ${version})` : ''}`
    );
    this.name = 'DocumentNotFoundError';
  }
}

/**
 * Thrown when a network request fails
 */
export class NetworkError extends DocumentsClientError {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(`Network error: ${message}`);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
  }
}

/**
 * Thrown when input validation fails
 */
export class ValidationError extends DocumentsClientError {
  public readonly issues?: any[];

  constructor(message: string, issues?: any[]) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}
