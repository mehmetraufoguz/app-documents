# app-documents

[![Docker Image](https://img.shields.io/badge/Docker-mehmetraufoguz%2Fapp--documents-2496ed.svg?logo=docker)](https://hub.docker.com/r/mehmetraufoguz/app-documents)
[![npm: app-documents-client](https://img.shields.io/npm/v/app-documents-client.svg)](https://www.npmjs.com/package/app-documents-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-Latest-black.svg)](https://tanstack.com/start)

A full-stack document management system with Git-based version control and a type-safe client SDK. Built as a pnpm monorepo containing the server application and a publishable NPM package for document access.

## 📦 Monorepo Structure

This project is organized as a pnpm workspace with two packages:

- **`/server`** - Full-stack document management application
- **`/client-sdk`** - Type-safe SDK (`app-documents-client` npm package) for accessing documents via the public API

## 📋 Project Overview

**app-documents** is a modern web application that enables users to create, edit, and manage documents while maintaining a complete audit trail through Git-based version control. Every change is automatically committed with metadata (author, timestamp, message), allowing teams and individuals to review document evolution, recover from mistakes, and understand the history of their content.

The **app-documents-client SDK** provides a simple, type-safe way for external applications (React, Expo, Node.js) to fetch and display documents from any app-documents server instance.

### Goals & Philosophy

- **Version Control First**: Leverage Git to provide powerful version management without requiring users to understand Git
- **User-Friendly**: Intuitive interface hiding complex Git operations behind simple document workflows
- **Audit Trail**: Complete history of who changed what and when, with soft-delete preservation
- **Permanent Soft-Delete**: Documents marked as deleted remain in Git history for audit purposes
- **Accessibility**: Public API for document sharing and integration
- **Security**: Magic link authentication without passwords

## ✨ Key Features

### Document Management
- **Create Documents**: Support for markdown-based content with rich descriptions
- **Edit with History**: Every edit creates a Git commit with optional commit messages
- **Soft Delete**: Archive documents with permanent deletion (preserved in Git history)
- **Document Metadata**: Track creator, creation date, last update time

### Version Control & History
- **Git-Backed Storage**: Documents stored in Git repository with full commit history
- **Version Browser**: View up to 5 historical versions with commit metadata
- **Time-Travel Viewing**: Load and view any previous version of a document
- **Commit Information**: Each version shows commit hash, message, author, and timestamp

### Authentication & Access Control
- **Magic Link Authentication**: Secure passwordless login via email
- **Session Management**: Persistent user sessions
- **Admin Dashboard**: Protected interface for authenticated users

### Public API
- **JSON Endpoint**: Access document metadata, history, and versions as JSON
- **HTML Endpoint**: Get rendered markdown as HTML
- **Raw Endpoint**: Get raw markdown content
- **Caching Headers**: Optimized for performance with appropriate cache directives

### Client SDK (`app-documents-client` npm package)
- **Type-Safe Fetching**: Zod-validated inputs and responses
- **Three Core Functions**: `fetchDocument`, `fetchDocumentRaw`, `fetchDocumentMetadata`
- **Error Handling**: Specific error classes for different failure scenarios
- **Framework Agnostic**: Works with React, Expo, Node.js, and more
- **TanStack Query Ready**: Examples with React Query integration

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│  ┌──────────────┬────────────────┬──────────────────┐       │
│  │ TanStack     │  React Form    │  React Query     │       │
│  │ Router       │  (Form State)  │  (Data Cache)    │       │
│  └──────────────┴────────────────┴──────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│              Backend (TanStack Start + Nitro)               │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ Better Auth  │  Git ops     │  Markdown    │             │
│  │ (Sessions)   │  (Commits)   │  (Rendering) │             │
│  └──────────────┴──────────────┴──────────────┘             │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                  Database (SQLite)                          │
│  ┌──────────┬────────┬─────────┬──────────────┐            │
│  │ Documents│ Users  │ Sessions│ Accounts     │            │
│  └──────────┴────────┴─────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│              Git Repository (data/docs-repo/)               │
│         Stores all document content and history            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Create/Edit Document:**
```
User Input (Form) 
  → TanStack Form (capture state) 
  → React Query (send request) 
  → Backend (documents.fns.ts) 
  → Git Commit (new version)
  → Database Update (metadata)
  → Response to Frontend
  → Optimistic/Stale-While-Revalidate Cache Updates
```

**View Document:**
```
Route Navigation 
  → React Query (check cache)
  → If stale/missing: Backend API call
  → Backend (fetch from DB + Git)
  → Markdown Renderer (Marked)
  → Display to User
```

**Version History:**
```
Version Selector Click 
  → Query different commit hash
  → Fetch from Git repository
  → Parse markdown content
  → Display with metadata (commit hash, date, author)
```

## 📚 Core Workflows

### 1. Authentication Flow

```
User visits /login
  ↓
Enters email address
  ↓
Better Auth sends magic link
  ↓
User clicks link in email
  ↓
Session created in database
  ↓
User redirected to /dashboard
  ↓
Can now create/edit documents
```

**Key Components:**
- `src/routes/login.tsx` - Login page
- `src/lib/auth-client.ts` - Client-side auth initialization
- `src/lib/auth.ts` - Server-side auth configuration
- Email is magic link (no password stored)

### 2. Document Creation Workflow

```
User at /documents/new
  ↓
Fill form:
  - Title (required)
  - Description (optional)
  - Content (markdown)
  - Commit message
  ↓
Submit form
  ↓
Backend:
  1. Generate document ID (nanoid)
  2. Create file in server/data/docs-repo/
  3. Git commit with message
  4. Insert record in documents table
  ↓
Redirect to /documents/$documentId
  ↓
Display created document
```

**Key Components:**
- `server/src/routes/_admin/documents.new.tsx` - Creation page
- `server/src/components/app/form-components.tsx` - Reusable form fields
- `server/src/server/functions/documents.fns.ts` - Document creation logic
- `server/src/server/git/repository.ts` - Git operations

### 3. Document Editing Workflow

```
User at /documents/$documentId/edit
  ↓
Load current document content
  ↓
Edit markdown content
  ↓
Provide commit message
  ↓
Submit changes
  ↓
Backend:
  1. Update file in server/data/docs-repo/
  2. Git commit with message
  3. Update updatedAt in database
  4. Store lastCommitHash
  ↓
Invalidate cache
  ↓
Redirect to document view
  ↓
Display updated document
```

**Key Components:**
- `server/src/routes/_admin/documents.$documentId.edit.tsx` - Edit page
- `server/src/components/app/document-editor.client.tsx` - Markdown editor
- `server/src/server/functions/documents.fns.ts` - Update logic
- `server/src/server/git/repository.ts` - Git commit

### 4. Version Control & History Workflow

```
User viewing /documents/$documentId
  ↓
Sees document with version selector
  ↓
Version selector shows:
  - Current version (latest commit)
  - Last 4 previous versions
  - Commit hash, date, message
  ↓
Click on previous version
  ↓
URL parameter updated: ?version=commitHash
  ↓
Backend fetches from Git at commit hash
  ↓
Content displayed (read-only)
  ↓
User can:
  - Compare versions visually
  - See who made change and when
  - Choose to revert (re-edit with that content)
```

**Key Components:**
- `server/src/components/app/version-selector.tsx` - Version UI
- `server/src/routes/document/$documentId/main.ts` - Version retrieval logic
- Git history preserved automatically with each commit

### 5. Document Deletion Workflow

```
User authenticates and accesses admin dashboard
  ↓
Document exists in Git repository
  ↓
Documents are managed via soft-delete:
  - deletedAt timestamp marks deletion
  - All Git history preserved
  - lastCommitHash preserved
  ↓
User can visit /deleted-documents
  ↓
View all soft-deleted documents:
  - Title, slug, description
  - Deletion date
  - Last commit hash (can view that version)
  ↓
Behavior of deleted documents:
  - Hidden from main dashboard
  - Content accessible via last commit hash in Git
  - Provides audit trail for deleted content
  - Currently NOT recoverable (permanent soft-delete)
```

**Key Components:**
- `server/src/routes/_admin/deleted-documents.tsx` - View deleted documents (read-only)
- `server/src/server/functions/documents.fns.ts` - Soft-delete backend function
- Deletion is permanent once committed to Git

### 6. Public API Access Workflow

```
External service requests:
  /document/{documentId}/
  ↓
Backend API handler
  ↓
Returns JSON with:
  - Document metadata (title, description, creator)
  - Version history (last 5 commits)
  - All version data
  ↓
Response cached (60s max-age)
  ↓
Stale-While-Revalidate for 300s
  ↓
External service uses for:
  - Displaying document metadata
  - Building document listings
  - Integration with other tools
```

**Public HTML Endpoint:**
```
/document/{documentId}/main
  ↓
Returns rendered HTML (markdown converted)
  ↓
Same cache strategy
  ↓
Safe for embedding in other pages
```

**Key Components:**
- `server/src/routes/document/$documentId/index.ts` - JSON endpoint
- `server/src/routes/document/$documentId/main.ts` - HTML endpoint

## 📁 Directory Structure

```
/ (root)
├── pnpm-workspace.yaml       # pnpm workspace configuration
├── package.json              # Root workspace package.json
├── LICENSE
├── README.md
│
├── server/                   # Document management application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── app/          # Application-specific components
│   │   │       ├── document-card.tsx
│   │   │       ├── document-editor.client.tsx
│   │   │       ├── form-components.tsx
│   │   │       ├── markdown-preview.tsx
│   │   │       ├── nav.tsx
│   │   │       └── version-selector.tsx
│   │   │   └── ui/           # Shadcn UI components (button, input, etc.)
│   │   │
│   │   ├── db/               # Database layer
│   │   │   ├── index.ts      # Database client setup
│   │   │   └── schema.ts     # Drizzle ORM schema
│   │   │
│   │   ├── hooks/            # React hooks
│   │   ├── lib/              # Utilities and helpers
│   │   │   ├── auth-client.ts
│   │   │   ├── auth.ts
│   │   │   ├── markdown.ts
│   │   │   ├── schemas.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── routes/           # File-based routing (TanStack Router)
│   │   │   ├── __root.tsx
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   ├── _admin/       # Protected admin routes
│   │   │   ├── api/          # API routes
│   │   │   └── document/     # Public document endpoints
│   │   │       └── $documentId/
│   │   │           ├── index.ts  # JSON API
│   │   │           ├── main.ts   # HTML endpoint
│   │   │           ├── main/
│   │   │           │   └── raw.ts  # Raw markdown
│   │   │           └── commit/
│   │   │               └── $commitHash/
│   │   │                   ├── index.ts  # Specific version HTML
│   │   │                   └── raw.ts     # Specific version raw
│   │   │
│   │   ├── server/           # Server-side logic
│   │   │   ├── middleware.ts
│   │   │   ├── functions/
│   │   │   │   ├── auth.fns.ts
│   │   │   │   └── documents.fns.ts
│   │   │   └── git/
│   │   │       └── repository.ts
│   │   │
│   │   ├── env.server.ts
│   │   ├── router.tsx
│   │   └── styles.css
│   │
│   ├── public/              # Static assets
│   ├── drizzle/             # Database migrations
│   ├── data/
│   │   └── docs-repo/       # Git repository for documents
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── docker-compose.yml
│   └── Dockerfile
│
└── client-sdk/              # NPM package: app-documents-client
    ├── src/
    │   ├── index.ts          # Main export
    │   ├── client.ts         # Core functions
    │   ├── types.ts          # TypeScript types
    │   ├── errors.ts         # Error classes
    │   └── schemas.ts        # Zod schemas for validation
    ├── dist/                 # Built output (gitignored)
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

## 🛠️ Technology Stack

### Server Application

**Frontend:**
- **React 19** - Modern UI library
- **TypeScript 5.7** - Type-safe JavaScript
- **TanStack Router** - File-based routing with type safety
- **TanStack React Query** - Data fetching, caching, synchronization
- **TanStack React Form** - Performant form state management
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **@uiw/react-md-editor** - Markdown editor component

**Backend:**
- **TanStack Start** - Full-stack TypeScript framework
- **Nitro** - Server runtime
- **Better Auth** - Open-source authentication with magic links
- **Simple Git** - Git operations (commits, history)
- **Marked** - Markdown parser and renderer

**Database:**
- **SQLite** - Lightweight relational database
- **better-sqlite3** - Node.js SQLite driver
- **Drizzle ORM** - Type-safe ORM with database migrations

**Development & Tooling:**
- **Vite** - Fast build tool and dev server
- **Biome** - Unified linter and formatter
- **Vitest** - Unit testing framework

### Client SDK (`app-documents-client`)

- **TypeScript** - Full type safety
- **Zod** - Runtime validation for inputs and responses
- **Native Fetch API** - No external HTTP client dependencies
- **ESM** - Modern module format
- **Framework Agnostic** - Works with React, Expo, Node.js, etc.

### Infrastructure

- **Pnpm Workspaces** - Monorepo package management
- **Git Repository** - Document version control (at `server/data/docs-repo/`)
- **Docker** - Optional containerization (see `server/DOCKER.md`)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (with pnpm)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd app-documents
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```
   This installs dependencies for both `server` and `client-sdk` workspaces.

3. **Set up environment variables (in `/server` directory):**
   ```bash
   cd server
   
   # Generate auth secret
   pnpm dlx @better-auth/cli secret
   
   # Create .env.local file with:
   BETTER_AUTH_SECRET=<generated-secret>
   BETTER_AUTH_URL=http://localhost:3000
   
   # Optional: set when running behind a reverse proxy (see DOCKER.md)
   # TRUSTED_PROXIES=172.16.0.0/12
   
   cd ..
   ```

4. **Initialize database and Git repository:**
   ```bash
   # Drizzle will create the database automatically on first run
   # Git repository is created in server/data/docs-repo/ on first document creation
   ```

5. **Start the development server:**
   ```bash
   # From root - runs server package
   pnpm dev
   
   # Or from server directory
   cd server && pnpm dev
   ```

6. **Open browser:**
   Navigate to `http://localhost:3000`

### Available Scripts (from root)

```bash
# Development
pnpm dev              # Start server dev mode

# Building
pnpm build            # Build both server and client-sdk packages

# Preview
pnpm preview          # Preview server production build
```

### Working with Client SDK

To build the `app-documents-client` SDK:

```bash
# Build the SDK
pnpm -C client-sdk build

# Watch mode (for development)
pnpm -C client-sdk dev
```

The built SDK will be in `client-sdk/dist/` and is ready for publishing to npm.

### Docker Deployment

A pre-built Docker image is available on Docker Hub:

```bash
# Pull the image
docker pull mehmetraufoguz/app-documents

# Run with docker-compose (uses server/docker-compose.yml)
cd server
docker-compose up -d

# Or run with docker directly
docker run -d \
  -p 3000:3000 \
  -e BETTER_AUTH_SECRET=your-secret \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  -v app_data:/app/data \
  mehmetraufoguz/app-documents
```

**Environment Variables:**
- `BETTER_AUTH_SECRET` - Required secret for authentication
- `BETTER_AUTH_URL` - URL where the app is accessible
- `TRUSTED_PROXIES` - IP ranges allowed to be trusted when behind reverse proxy

For detailed Docker setup, see [server/DOCKER.md](server/DOCKER.md).

## 📡 API Documentation

### Public Endpoints

All public endpoints are accessible without authentication and support caching.

#### Get Document Metadata (JSON)
```bash
GET /document/{documentId}/
```

**Response:**
```json
{
  "id": "abc123",
  "slug": "my-document",
  "title": "Document Title",
  "description": "Document description",
  "createdBy": "user@example.com",
  "createdAt": "2026-03-09T10:00:00Z",
  "updatedAt": "2026-03-09T12:00:00Z",
  "versions": [
    {
      "hash": "abc123def456",
      "message": "Initial commit",
      "author": "user@example.com",
      "date": "2026-03-09T10:00:00Z"
    },
    {
      "hash": "xyz789",
      "message": "Updated content",
      "author": "user@example.com",
      "date": "2026-03-09T11:30:00Z"
    }
  ]
}
```

**Cache Headers:**
- `Cache-Control: public, max-age=60, stale-while-revalidate=300`
- Content cached for 60 seconds, stale-while-revalidate for 5 minutes

#### Get Document as HTML
```bash
GET /document/{documentId}/main
GET /document/{documentId}/commit/{commitHash}/
```

**Response:**
HTML-rendered markdown content

**Cache Headers:**
- Main: `Cache-Control: public, max-age=60, stale-while-revalidate=300`
- Specific commit: `Cache-Control: public, max-age=3600, immutable`

#### Get Raw Markdown
```bash
GET /document/{documentId}/main/raw
GET /document/{documentId}/commit/{commitHash}/raw
```

**Response:**
Plain text markdown content

**Cache Headers:**
- Same as HTML endpoints above

### Using the Client SDK

Instead of manually calling these endpoints, use the `documents-client` SDK:

```bash
npm install documents-client
```

**Example:**
```ts
import { fetchDocumentRaw } from 'documents-client';

const doc = await fetchDocumentRaw({
  baseUrl: 'https://your-instance.com',
  documentId: 'my-doc',
  version: 'main'
});

console.log(doc.content); // Raw markdown
console.log(doc.metadata.versions); // Version history
```

See `/client-sdk/README.md` for full SDK documentation.\n\n### Protected Endpoints (Server Functions - TanStack Start)

Document operations are implemented as **TanStack Server Functions**, not REST endpoints. These are automatically handled through the admin interface:

- **Create Document**: `POST /documents/new` (form submission)
- **Update Document**: `POST /documents/$documentId/edit` (form submission)
- **View Documents**: `GET /dashboard` (admin-only page)
- **Soft Delete Document**: Backend function only (no UI currently exposed)
- **View Deleted Documents**: `GET /deleted-documents` (admin-only page)

All protected operations require authentication via magic link.

## 💻 Local Development

### Server Application Workflow

1. **Create new document:**
   - Navigate to admin dashboard
   - Click "New Document"
   - Enter title, description, markdown content
   - Provide commit message
   - Click "Create"

2. **Edit document:**
   - Click document from dashboard
   - Click "Edit" button
   - Modify markdown content
   - Provide commit message explaining change
   - Click "Save Changes"

3. **View history:**
   - Click document
   - Use version selector (top-right)
   - Choose previous version
   - View with full metadata

4. **View deleted documents:**
   - Navigate to /deleted-documents (admin-only)
   - See all soft-deleted documents
   - View the last committed version for context
   - (Note: Recovery/undelete is not currently implemented)

### Client SDK Development

When working on the `app-documents-client` SDK:

```bash
# Build SDK
pnpm -C client-sdk build

# Watch mode for development
pnpm -C client-sdk dev

# Test SDK locally in server
cd server
pnpm add ../client-sdk

# Or link for development
cd client-sdk && pnpm link
cd ../server && pnpm link app-documents-client
```

### Database Migrations

Running Drizzle migrations (in `server` directory):
```bash
cd server

# Generate migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly to DB (dev only)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Git Repository Location
All document files are stored in `server/data/docs-repo/` directory. This is a standard Git repository with full history accessible via Git commands:

```bash
# View document history
cd server/data/docs-repo
git log --oneline

# View specific file
git show <commit-hash>:<file-path>
```

### Code Quality

Maintain code quality with (from `server` directory):
```bash
# Format code before committing
pnpm format

# Check for linting issues
pnpm lint

# Run both check and format
pnpm check
```

## 📊 Database Schema

### documents
- `id` - Unique identifier (nanoid)
- `slug` - URL-friendly identifier (unique)
- `title` - Document title
- `description` - Document description
- `filePath` - Path in Git repository
- `createdBy` - Creator email
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `deletedAt` - Soft delete timestamp (null if active)
- `lastCommitHash` - Hash of last commit when deleted (for viewing deleted document content)

### users (Better Auth)
- `id` - User ID
- `email` - Email address
- `name` - User name (optional)
- `createdAt` - Creation timestamp

### sessions (Better Auth)
- `id` - Session ID
- `userId` - Associated user
- `expiresAt` - Session expiration
- `createdAt` - Creation timestamp

## 🔒 Security Considerations

- **Magic Link Auth**: No passwords stored, uses email-based authentication
- **Session Management**: Secure session tokens managed by Better Auth
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **CSRF Protection**: Better Auth handles CSRF token generation
- **Soft Deletes**: Deleted documents preserved in Git history for audit trail; permanent soft-delete
- **Git History**: Complete audit trail of all changes, including deletions

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

**Author:** Mehmet Rauf Oğuz

## 🤝 Contributing

Contributions are welcome! Please follow the code quality standards:

1. Keep type safety with TypeScript
2. Write meaningful commit messages (conventional commits preferred)
3. Maintain existing code patterns

## 📞 Support

For questions or issues, please open a GitHub issue in the repository.

---

**Built with ❤️ using TanStack Start, React, and Git**
