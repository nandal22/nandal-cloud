import React, { createContext, useContext, useState, useCallback } from 'react'

// ─── Demo seed data ────────────────────────────────────────────────────────────
const DEMO_FILES = [
  // Root files
  { id: 'f1', name: 'README.md',        type: 'doc',   size: 4200,    folderId: null, createdAt: '2024-01-10', tags: ['readme', 'docs'], content: '# Nandal Cloud\nWelcome to your personal cloud storage.' },
  { id: 'f2', name: 'todo.txt',         type: 'doc',   size: 820,     folderId: null, createdAt: '2024-02-01', tags: ['todo', 'personal'], content: '- Buy groceries\n- Finish project\n- Call mom' },

  // Documents folder
  { id: 'f3', name: 'Project Plan.docx', type: 'doc',  size: 38000,   folderId: 'd1', createdAt: '2024-03-05', tags: ['work', 'plan'], content: 'Project Plan\n\n1. Discovery\n2. Design\n3. Development\n4. Deployment' },
  { id: 'f4', name: 'Resume.pdf',        type: 'pdf',  size: 124000,  folderId: 'd1', createdAt: '2024-02-14', tags: ['career', 'cv'], content: 'Resume - Nandal\nSoftware Engineer' },
  { id: 'f5', name: 'Notes.txt',         type: 'doc',  size: 2100,    folderId: 'd1', createdAt: '2024-03-18', tags: ['notes'], content: 'Meeting Notes\n\nDiscussed roadmap for Q2...' },
  { id: 'f6', name: 'Contract.pdf',      type: 'pdf',  size: 210000,  folderId: 'd1', createdAt: '2024-01-22', tags: ['legal', 'contract'], content: 'Service Agreement\n\nThis contract is between...' },

  // Images folder
  { id: 'f7', name: 'profile.png',       type: 'image', size: 540000, folderId: 'd2', createdAt: '2024-03-01', tags: ['photo', 'profile'], content: null },
  { id: 'f8', name: 'banner.jpg',        type: 'image', size: 890000, folderId: 'd2', createdAt: '2024-02-20', tags: ['design'], content: null },
  { id: 'f9', name: 'screenshot.png',    type: 'image', size: 320000, folderId: 'd2', createdAt: '2024-03-10', tags: ['screenshot'], content: null },

  // Code folder
  { id: 'f10', name: 'index.js',         type: 'code', size: 5600,    folderId: 'd3', createdAt: '2024-03-12', tags: ['javascript', 'frontend'], content: 'const app = express();\napp.listen(3000);' },
  { id: 'f11', name: 'styles.css',       type: 'code', size: 3200,    folderId: 'd3', createdAt: '2024-03-12', tags: ['css', 'frontend'], content: 'body { margin: 0; }' },
  { id: 'f12', name: 'server.py',        type: 'code', size: 8100,    folderId: 'd3', createdAt: '2024-03-15', tags: ['python', 'backend'], content: 'from flask import Flask\napp = Flask(__name__)' },

  // Videos folder
  { id: 'f13', name: 'demo.mp4',         type: 'video', size: 84000000, folderId: 'd4', createdAt: '2024-02-28', tags: ['demo', 'presentation'], content: null },

  // Work > Reports subfolder
  { id: 'f14', name: 'Q1 Report.docx',   type: 'doc',  size: 62000,   folderId: 'd5', createdAt: '2024-03-31', tags: ['report', 'q1', 'work'], content: 'Q1 Financial Report\n\nRevenue: $1.2M\nGrowth: 18%' },
  { id: 'f15', name: 'Q2 Forecast.xlsx', type: 'spreadsheet', size: 44000, folderId: 'd5', createdAt: '2024-04-01', tags: ['report', 'q2', 'forecast'], content: 'Q2 2024 Forecast\n\nProjected: $1.5M' },

  // Work folder
  { id: 'f16', name: 'meeting-notes.md', type: 'doc',  size: 3800,    folderId: 'd6', createdAt: '2024-03-20', tags: ['meeting', 'work'], content: '# Meeting Notes\n\n## 2024-03-20\n- Reviewed sprint goals\n- Assigned tasks' },

  // Archives
  { id: 'f17', name: 'backup-2023.zip',  type: 'archive', size: 420000000, folderId: 'd7', createdAt: '2024-01-01', tags: ['backup', 'archive'], content: null },
]

const DEMO_FOLDERS = [
  { id: 'd1', name: 'Documents', parentId: null, color: '#6366f1', createdAt: '2024-01-01' },
  { id: 'd2', name: 'Images',    parentId: null, color: '#ec4899', createdAt: '2024-01-01' },
  { id: 'd3', name: 'Code',      parentId: null, color: '#22c55e', createdAt: '2024-01-01' },
  { id: 'd4', name: 'Videos',    parentId: null, color: '#f59e0b', createdAt: '2024-01-01' },
  { id: 'd6', name: 'Work',      parentId: null, color: '#0ea5e9', createdAt: '2024-01-01' },
  { id: 'd7', name: 'Archives',  parentId: null, color: '#78716c', createdAt: '2024-01-01' },
  { id: 'd5', name: 'Reports',   parentId: 'd6', color: '#0ea5e9', createdAt: '2024-01-15' },
]

const StorageContext = createContext(null)

export function StorageProvider({ children }) {
  const [folders, setFolders]           = useState(DEMO_FOLDERS)
  const [files, setFiles]               = useState(DEMO_FILES)
  const [currentFolderId, setCurrentFolderId] = useState(null)
  const [selectedIds, setSelectedIds]   = useState(new Set())
  const [searchQuery, setSearchQuery]   = useState('')
  const [viewMode, setViewMode]         = useState('grid') // 'grid' | 'list'
  const [sortBy, setSortBy]             = useState('name') // 'name' | 'date' | 'size'
  const [sortDir, setSortDir]           = useState('asc')
  const [uploadProgress, setUploadProgress] = useState(null)
  const [previewFile, setPreviewFile]   = useState(null)
  const [notification, setNotification] = useState(null)

  const notify = useCallback((msg, type = 'success') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // ── Folder helpers ─────────────────────────────────────────────
  const createFolder = useCallback((name, parentId = currentFolderId) => {
    const colors = ['#6366f1','#ec4899','#22c55e','#f59e0b','#0ea5e9','#a855f7','#ef4444']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const folder = { id: `d${Date.now()}`, name, parentId, color, createdAt: new Date().toISOString().split('T')[0] }
    setFolders(prev => [...prev, folder])
    notify(`Folder "${name}" created`)
    return folder
  }, [currentFolderId, notify])

  const deleteFolder = useCallback((folderId) => {
    const toDelete = new Set()
    const collect = (id) => {
      toDelete.add(id)
      folders.filter(f => f.parentId === id).forEach(f => collect(f.id))
    }
    collect(folderId)
    setFolders(prev => prev.filter(f => !toDelete.has(f.id)))
    setFiles(prev => prev.filter(f => !toDelete.has(f.folderId)))
    if (toDelete.has(currentFolderId)) setCurrentFolderId(null)
    notify('Folder deleted')
  }, [folders, currentFolderId, notify])

  const renameFolder = useCallback((folderId, newName) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f))
    notify(`Renamed to "${newName}"`)
  }, [notify])

  // ── File helpers ───────────────────────────────────────────────
  const uploadFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: `f${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type: getFileType(file.name),
      size: file.size,
      folderId: currentFolderId,
      createdAt: new Date().toISOString().split('T')[0],
      tags: [],
      content: null,
      file,
    }))
    // Simulate upload progress
    setUploadProgress(0)
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setFiles(prev => [...prev, ...newFiles])
        setUploadProgress(null)
        notify(`${newFiles.length} file(s) uploaded`)
      }
    }, 200)
  }, [currentFolderId, notify])

  const deleteFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setSelectedIds(prev => { const s = new Set(prev); s.delete(fileId); return s })
    notify('File deleted')
  }, [notify])

  const deleteSelected = useCallback(() => {
    setFiles(prev => prev.filter(f => !selectedIds.has(f.id)))
    setFolders(prev => prev.filter(f => !selectedIds.has(f.id)))
    notify(`${selectedIds.size} item(s) deleted`)
    setSelectedIds(new Set())
  }, [selectedIds, notify])

  const renameFile = useCallback((fileId, newName) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName } : f))
    notify(`Renamed to "${newName}"`)
  }, [notify])

  const moveFile = useCallback((fileId, targetFolderId) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, folderId: targetFolderId } : f))
    notify('File moved')
  }, [notify])

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }, [])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  // ── Derived data ───────────────────────────────────────────────
  const currentFolderFiles = searchQuery
    ? files.filter(f => {
        const q = searchQuery.toLowerCase()
        return (
          f.name.toLowerCase().includes(q) ||
          (f.tags && f.tags.some(t => t.toLowerCase().includes(q))) ||
          (f.content && f.content.toLowerCase().includes(q))
        )
      })
    : files.filter(f => f.folderId === currentFolderId)

  const sorted = [...currentFolderFiles].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
    else if (sortBy === 'date') cmp = a.createdAt.localeCompare(b.createdAt)
    else if (sortBy === 'size') cmp = a.size - b.size
    return sortDir === 'asc' ? cmp : -cmp
  })

  const currentSubFolders = searchQuery
    ? []
    : folders.filter(f => f.parentId === currentFolderId)

  const getBreadcrumb = () => {
    const crumbs = []
    let id = currentFolderId
    while (id) {
      const folder = folders.find(f => f.id === id)
      if (!folder) break
      crumbs.unshift(folder)
      id = folder.parentId
    }
    return crumbs
  }

  const getStorageStats = () => {
    const total = 5 * 1024 * 1024 * 1024 // 5 GB
    const used = files.reduce((acc, f) => acc + f.size, 0)
    return { total, used, free: total - used }
  }

  return (
    <StorageContext.Provider value={{
      folders, files, currentFolderId, setCurrentFolderId,
      selectedIds, toggleSelect, clearSelection,
      searchQuery, setSearchQuery,
      viewMode, setViewMode,
      sortBy, setSortBy, sortDir, setSortDir,
      uploadProgress,
      previewFile, setPreviewFile,
      notification,
      currentFolderFiles: sorted,
      currentSubFolders,
      getBreadcrumb,
      getStorageStats,
      createFolder, deleteFolder, renameFolder,
      uploadFiles, deleteFile, deleteSelected, renameFile, moveFile,
    }}>
      {children}
    </StorageContext.Provider>
  )
}

export const useStorage = () => useContext(StorageContext)

// ── Utility ────────────────────────────────────────────────────────────────────
export function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const map = {
    doc: ['txt', 'md', 'docx', 'doc', 'rtf'],
    pdf: ['pdf'],
    image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'],
    video: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
    code: ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'rs', 'java', 'cpp', 'c', 'html', 'css', 'json', 'yaml', 'yml', 'sh'],
    spreadsheet: ['xlsx', 'xls', 'csv'],
    archive: ['zip', 'tar', 'gz', 'rar', '7z'],
  }
  for (const [type, exts] of Object.entries(map)) {
    if (exts.includes(ext)) return type
  }
  return 'other'
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}
