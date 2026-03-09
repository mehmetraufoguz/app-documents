import path from 'node:path'
import fs from 'node:fs/promises'
import simpleGit, { type SimpleGit } from 'simple-git'
import { env } from '#/env.server'

let git: SimpleGit | null = null
let resolvedRepoPath: string | null = null

function toRepoRelativePath(filePath: string, repoPath: string): string {
  const normalized = path.normalize(filePath)

  // Absolute path: strip repoPath prefix if present
  if (path.isAbsolute(normalized)) {
    return normalized.startsWith(repoPath + path.sep)
      ? path.relative(repoPath, normalized)
      : normalized
  }

  // Relative path via CWD resolution
  const abs = path.resolve(normalized)
  if (abs.startsWith(repoPath + path.sep)) {
    return path.relative(repoPath, abs)
  }

  // Fallback: strip the relative form of repoPath as a string prefix using env directly
  // e.g. DOCS_REPO_PATH='./data/docs-repo' → normalized 'data/docs-repo'
  // filePath='data/docs-repo/foo.md' → 'foo.md'
  const envRepoRel = path.normalize(env.DOCS_REPO_PATH)
  const prefix = envRepoRel + path.sep
  if (normalized.startsWith(prefix)) {
    return normalized.slice(prefix.length)
  }

  return normalized
}

async function getGit(): Promise<SimpleGit> {
  if (git) return git

  const repoPath = path.resolve(env.DOCS_REPO_PATH)
  resolvedRepoPath = repoPath
  await fs.mkdir(repoPath, { recursive: true })

  const g = simpleGit(repoPath)

  // Check for .git directly in repoPath — do NOT use g.status() as it traverses
  // up the directory tree and would find the parent project's git repo.
  const gitDir = path.join(repoPath, '.git')
  let isRepo = false
  try {
    await fs.access(gitDir)
    isRepo = true
  } catch {
    isRepo = false
  }

  if (!isRepo) {
    await g.init()
    await g.addConfig('user.name', 'App Documents')
    await g.addConfig('user.email', 'admin@app-documents.local')

    // Seed any existing files on disk into the first commit
    const status = await g.status()
    if (status.not_added.length > 0) {
      await g.add('.')
      await g.commit('chore: seed existing documents')
    }
  }

  git = g
  return git
}

export async function readDocumentAtVersion(
  filePath: string,
  version: string,
): Promise<string> {
  const g = await getGit()
  const relPath = toRepoRelativePath(filePath, resolvedRepoPath!)
  const ref = version === 'main' ? 'HEAD' : version
  return g.show([`${ref}:${relPath}`])
}

export async function writeAndCommit(
  filePath: string,
  content: string,
  message: string,
): Promise<string> {
  const g = await getGit()
  const repoPath = resolvedRepoPath!
  const relPath = toRepoRelativePath(filePath, repoPath)
  const fullPath = path.join(repoPath, relPath)

  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, content, 'utf-8')

  await g.add(relPath)
  const result = await g.commit(message)
  return result.commit
}

export async function deleteAndCommit(
  filePath: string,
  message: string,
): Promise<{ deletionCommit: string; lastContentCommit: string }> {
  const g = await getGit()
  const repoPath = resolvedRepoPath!
  const relPath = toRepoRelativePath(filePath, repoPath)

  // Capture HEAD before removal — this is the last commit where the file exists
  const log = await g.log({ maxCount: 1 })
  const lastContentCommit = log.latest?.hash ?? 'HEAD'

  await g.rm([relPath])
  const result = await g.commit(message)
  return { deletionCommit: result.commit, lastContentCommit }
}

export async function getDocumentHistory(
  filePath: string,
  limit = 5,
  toRef?: string,
): Promise<
  Array<{
    commit: string
    shortHash: string
    message: string
    author: string
    date: string
  }>
> {
  const g = await getGit()

  try {
    const relPath = toRepoRelativePath(filePath, resolvedRepoPath!)
    const SEP = '|||'
    const FORMAT = `--format=%H${SEP}%s${SEP}%an${SEP}%aI`

    const args = ['log', FORMAT, `--max-count=${limit}`]
    if (toRef) args.push(toRef)
    args.push('--', relPath)

    const raw = await g.raw(args)
    return raw
      .split('\n')
      .filter((line) => line.includes(SEP))
      .map((line) => {
        const [hash, message, author, date] = line.split(SEP)
        return { commit: hash, shortHash: hash.slice(0, 7), message, author, date }
      })
  } catch {
    return []
  }
}
