const axios = require('axios')

const GH_BASE = 'https://api.github.com'
const OWNER   = process.env.GITHUB_OWNER
const REPO    = process.env.GITHUB_REPO
const BRANCH  = process.env.GITHUB_BRANCH || 'main'

const gh = axios.create({
  baseURL: GH_BASE,
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
})

/**
 * Upload (or update) a file in the GitHub repo.
 * @param {string} path   - e.g. "users/user-id/files/abc123.enc"
 * @param {Buffer} buffer - File content
 * @param {string} message - Commit message
 */
async function uploadFile(path, buffer, message = 'Upload file') {
  const content = buffer.toString('base64')

  // Check if file exists to get its SHA (required for updates)
  let sha
  try {
    const { data } = await gh.get(`/repos/${OWNER}/${REPO}/contents/${path}`, {
      params: { ref: BRANCH },
    })
    sha = data.sha
  } catch {
    // File doesn't exist yet — no SHA needed
  }

  const { data } = await gh.put(`/repos/${OWNER}/${REPO}/contents/${path}`, {
    message,
    content,
    branch: BRANCH,
    ...(sha && { sha }),
  })

  return {
    sha: data.content.sha,
    downloadUrl: data.content.download_url,
    htmlUrl: data.content.html_url,
    path: data.content.path,
  }
}

/**
 * Download a file from GitHub, returns a Buffer.
 */
async function downloadFile(path) {
  const { data } = await gh.get(`/repos/${OWNER}/${REPO}/contents/${path}`, {
    params: { ref: BRANCH },
  })
  return Buffer.from(data.content, 'base64')
}

/**
 * Delete a file from GitHub.
 */
async function deleteFile(path, sha, message = 'Delete file') {
  await gh.delete(`/repos/${OWNER}/${REPO}/contents/${path}`, {
    data: { message, sha, branch: BRANCH },
  })
}

/**
 * Get the SHA of an existing file (needed to delete or update).
 */
async function getFileSha(path) {
  try {
    const { data } = await gh.get(`/repos/${OWNER}/${REPO}/contents/${path}`, {
      params: { ref: BRANCH },
    })
    return data.sha
  } catch {
    return null
  }
}

module.exports = { uploadFile, downloadFile, deleteFile, getFileSha }
