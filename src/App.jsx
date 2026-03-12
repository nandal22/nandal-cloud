import React, { useState } from 'react'
import { StorageProvider } from './context/StorageContext'
import Sidebar from './components/Sidebar'
import SearchBar from './components/SearchBar'
import Toolbar from './components/Toolbar'
import Breadcrumb from './components/Breadcrumb'
import FileGrid from './components/FileGrid'
import UploadModal from './components/UploadModal'
import PreviewModal from './components/PreviewModal'
import NewFolderModal from './components/NewFolderModal'
import Notification from './components/Notification'

function CloudApp() {
  const [showUpload, setShowUpload]     = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar onCreateFolder={() => setShowNewFolder(true)} />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
        }}>
          <SearchBar />

          {/* Right-side header actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            {/* User avatar placeholder */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white',
              cursor: 'pointer', flexShrink: 0,
            }}>
              N
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{
          flex: 1, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          padding: '16px 20px',
          gap: 12,
        }}>
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Toolbar */}
          <Toolbar
            onUploadClick={() => setShowUpload(true)}
            onCreateFolder={() => setShowNewFolder(true)}
          />

          {/* File grid */}
          <FileGrid />
        </main>
      </div>

      {/* Modals */}
      {showUpload    && <UploadModal    onClose={() => setShowUpload(false)} />}
      {showNewFolder && <NewFolderModal onClose={() => setShowNewFolder(false)} />}
      <PreviewModal />
      <Notification />
    </div>
  )
}

export default function App() {
  return (
    <StorageProvider>
      <CloudApp />
    </StorageProvider>
  )
}
