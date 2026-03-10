# app-documents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-Latest-black.svg)](https://tanstack.com/start)

A full-stack document management system with Git-based version control, built for managing, editing, and tracking changes to documents with complete revision history.

## 📋 Project Overview

**app-documents** is a modern web application that enables users to create, edit, and manage documents while maintaining a complete audit trail through Git-based version control. Every change is automatically committed with metadata (author, timestamp, message), allowing teams and individuals to review document evolution, recover from mistakes, and understand the history of their content.

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
- **Caching Headers**: Optimized for performance with appropriate cache directives

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
  2. Create file in data/docs-repo/
  3. Git commit with message
  4. Insert record in documents table
  ↓
Redirect to /documents/$documentId
  ↓
Display created document
```

**Key Components:**
- `src/routes/_admin/documents.new.tsx` - Creation page
- `src/components/app/form-components.tsx` - Reusable form fields
- `src/server/functions/documents.fns.ts` - Document creation logic
- `src/server/git/repository.ts` - Git operations

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
  1. Update file in data/docs-repo/
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
- `src/routes/_admin/documents.$documentId.edit.tsx` - Edit page
- `src/components/app/document-editor.client.tsx` - Markdown editor
- `src/server/functions/documents.fns.ts` - Update logic
- `src/server/git/repository.ts` - Git commit

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
- `src/components/app/version-selector.tsx` - Version UI
- `src/routes/document/$documentId/main.ts` - Version retrieval logic
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
- `src/routes/_admin/deleted-documents.tsx` - View deleted documents (read-only)
- `src/server/functions/documents.fns.ts` - Soft-delete backend function
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
- `src/routes/document/$documentId/index.ts` - JSON endpoint
- `src/routes/document/$documentId/main.ts` - HTML endpoint

## 📁 Directory Structure

```
src/
├── components/              # React components
│   ├── ThemeToggle.tsx      # Dark/light mode toggle
│   └── app/                 # Application-specific components
│       ├── document-card.tsx         # Document list item
│       ├── document-editor.client.tsx # Markdown editor
│       ├── form-components.tsx       # Reusable form fields
│       ├── markdown-preview.tsx      # Markdown renderer
│       ├── nav.tsx                   # Navigation bar
│       └── version-selector.tsx      # Version history UI
│   └── ui/                  # Shadcn UI components (button, input, etc.)
│
├── db/                      # Database layer
│   ├── index.ts             # Database client setup
│   └── schema.ts            # Drizzle ORM schema (documents, users, sessions)
│
├── hooks/                   # React hooks
│   ├── form-context.ts      # Form state context
│   └── form.ts              # Form composition hooks
│
├── integrations/            # Third-party integrations
│   ├── better-auth/         # Authentication
│   │   └── header-user.tsx   # User menu component
│   └── tanstack-query/      # Data fetching
│       └── root-provider.tsx # Query client setup
│
├── lib/                     # Utilities and helpers
│   ├── auth-client.ts       # Client-side auth
│   ├── auth.ts              # Server-side auth config
│   ├── markdown.ts          # Markdown utilities
│   ├── schemas.ts           # Validation schemas
│   └── utils.ts             # General utilities
│
├── routes/                  # File-based routing (TanStack Router)
│   ├── __root.tsx           # Root layout
│   ├── index.tsx            # Home page
│   ├── login.tsx            # Login page
│   ├── about.tsx            # About page
│   ├── _admin.tsx           # Protected admin layout
│   ├── _admin/
│   │   ├── dashboard.tsx           # Document list (main interface)
│   │   ├── documents.new.tsx        # Create document
│   │   ├── documents.$documentId.tsx # View/manage document
│   │   ├── documents.$documentId.edit.tsx # Edit document
│   │   └── deleted-documents.tsx    # View deleted docs
│   ├── api/
│   │   └── auth/
│   │       └── $.ts                 # Better Auth routes
│   └── document/
│       └── $documentId/
│           ├── index.ts             # JSON API (public)
│           ├── main.ts              # HTML endpoint (public)
│           └── commit/
│               └── $commitHash/     # Specific version access
│
├── server/                  # Server-side logic
│   ├── middleware.ts        # HTTP middleware
│   └── functions/
│       ├── auth.fns.ts      # Auth-related functions
│       └── documents.fns.ts # Document CRUD operations
│   └── git/
│       └── repository.ts    # Git operations (commit, history, etc.)
│
├── env.server.ts            # Server environment variables
├── router.tsx               # TanStack Router configuration
└── styles.css               # Global Tailwind CSS
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript 5.7** - Type-safe JavaScript
- **TanStack Router** - File-based routing with type safety
- **TanStack React Query** - Data fetching, caching, synchronization
- **TanStack React Form** - Performant form state management
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **@uiw/react-md-editor** - Markdown editor component
- **Marked** - Markdown parser and renderer (backend)
- **@uiw/react-md-editor** - Markdown editor (frontend)

### Backend
- **TanStack Start** - Full-stack TypeScript framework
- **Nitro** - Server runtime
- **Better Auth** - Open-source authentication
- **Simple Git** - Git operations (commits, history)

### Database
- **SQLite** - Lightweight relational database
- **better-sqlite3** - Node.js SQLite driver
- **Drizzle ORM** - Type-safe ORM with database migrations

### Development & Tooling
- **Vite** - Fast build tool and dev server
- **Biome** - Unified linter and formatter
- **Vitest** - Unit testing framework
- **TypeScript** - Static type checking

### Infrastructure
- **Git Repository** - Version control (at `data/docs-repo/`)
- **Pnpm** - Fast package manager

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

3. **Set up environment variables:**
   ```bash
   # Generate auth secret
   pnpm dlx @better-auth/cli secret
   
   # Create .env.local file with:
   BETTER_AUTH_SECRET=<generated-secret>
   BETTER_AUTH_URL=http://localhost:3000
   
   # Optional: set when running behind a reverse proxy (see DOCKER.md)
   # TRUSTED_PROXIES=172.16.0.0/12
   ```

4. **Initialize database and Git repository:**
   ```bash
   # Drizzle will create the database automatically
   # Git repository is created on first document creation
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

6. **Open browser:**
   Navigate to `http://localhost:3000`

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload

# Building
pnpm build            # Build for production
pnpm start            # Start production server (after build)

# Code Quality
pnpm lint             # Run Biome linter
pnpm format           # Format code with Biome
pnpm check            # Check linting and formatting

# Testing
pnpm test             # Run Vitest tests
pnpm test:watch       # Watch mode for tests

# Type Checking
pnpm typecheck        # TypeScript type checking
```

## 📡 API Documentation

### Public Endpoints

#### Get Document as JSON
```bash
GET /document/{documentId}/
```

**Response:**
```json
{
  "id": "abc123",
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
- Content cached for 60 seconds, usable for 5 minutes while revalidating

#### Get Document as HTML
```bash
GET /document/{documentId}/main
```

**Response:**
HTML-rendered markdown content with same cache headers

#### Get Specific Version
```bash
GET /document/{documentId}/commit/{commitHash}/
GET /document/{documentId}/commit/{commitHash}/raw
```

Access a specific historical version by commit hash

### Protected Endpoints (Server Functions - TanStack Start)

Document operations are implemented as **TanStack Server Functions**, not REST endpoints. These are automatically handled through the admin interface:

- **Create Document**: `POST /documents/new` (form submission)
- **Update Document**: `POST /documents/$documentId/edit` (form submission)
- **View Documents**: `GET /dashboard` (admin-only page)
- **Soft Delete Document**: Backend function only (no UI currently exposed)
- **View Deleted Documents**: `GET /deleted-documents` (admin-only page)

All protected operations require authentication via magic link.

## 💻 Local Development

### File Editing Workflow

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

### Database Migrations

Running Drizzle migrations:
```bash
# Generate migration from schema changes
pnpm drizzle generate

# Apply migrations
pnpm drizzle migrate
```

### Git Repository Location
All document files are stored in `data/docs-repo/` directory. This is a standard Git repository with full history accessible via Git commands:

```bash
# View document history
cd data/docs-repo
git log --oneline

# View specific file
git show <commit-hash>:<file-path>
```

### Code Quality

Maintain code quality with:
```bash
# Format code before committing
pnpm format

# Check for linting issues
pnpm lint
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
2. Write meaningful commit messages
3. Maintain existing code patterns

## 📞 Support

For questions or issues, please open a GitHub issue in the repository.

---

**Built with ❤️ using TanStack Start, React, and Git**
