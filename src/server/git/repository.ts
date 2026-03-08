import path from 'node:path'
import fs from 'node:fs/promises'
import simpleGit, { type SimpleGit } from 'simple-git'
import { env } from '#/env.server'

let git: SimpleGit | null = null

async function getGit(): Promise<SimpleGit> {
  if (git) return git

  const repoPath = path.resolve(env.DOCS_REPO_PATH)
  await fs.mkdir(repoPath, { recursive: true })

  const g = simpleGit(repoPath)

  let isRepo = false
  try {
    await g.status()
    isRepo = true
  } catch {
    isRepo = false
  }

  if (!isRepo) {
    await g.init()
    await g.addConfig('user.name', 'App Documents')
    await g.addConfig('user.email', 'admin@app-documents.local')
  }

  git = g
  return git
}

export async function readDocumentAtVersion(
  filePath: string,
  version: string,
): Promise<string> {
  const g = await getGit()
  const ref = version === 'main' ? 'HEAD' : version
  return g.show([`${ref}:${filePath}`])
}

export async function writeAndCommit(
  filePath: string,
  content: string,
  message: string,
): Promise<string> {
  const g = await getGit()
  const repoPath = path.resolve(env.DOCS_REPO_PATH)
  const fullPath = path.join(repoPath, filePath)

  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, content, 'utf-8')

  await g.add(filePath)
  const result = await g.commit(message)
  return result.commit
}

export async function getDocumentHistory(
  filePath: string,
  limit = 5,
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
    const log = await g.log({ file: filePath, maxCount: limit })
    return log.all.map((entry) => ({
      commit: entry.hash,
      shortHash: entry.hash.slice(0, 7),
      message: entry.message,
      author: entry.author_name,
      date: entry.date,
    }))
  } catch {
    return []
  }
}
