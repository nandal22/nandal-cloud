import React, { useState, useEffect } from 'react'
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
import { Menu, Upload, HardDrive, FolderPlus, Search } from 'lucide-react'
import { useStorage } from './context/StorageContext'

function CloudApp() {
  const [showUpload, setShowUpload]       = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [showSearch, setShowSearch]       = useState(false)
  const { currentFolderId, setCurrentFolderId, searchQuery, setSearchQuery } = useStorage()

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [currentFolderId])

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const bottomNavItems = [
    { id: 'home',   icon: HardDrive, label: 'Files',  action: () => setCurrentFolderId(null) },
    { id: 'search', icon: Search,    label: 'Search',  action: () => setShowSearch(s => !s) },
    { id: 'upload', icon: Upload,    label: 'Upload',  action: () => setShowUpload(true), isFab: true },
    { id: 'folder', icon: FolderPlus,label: 'Folder',  action: () => setShowNewFolder(true) },
    { id: 'menu',   icon: Menu,      label: 'Menu',    action: () => setSidebarOpen(true) },
  ]

  return (
    <div className="app-shell">
      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar
        className={`sidebar${sidebarOpen ? ' open' : ''}`}
        onCreateFolder={() => setShowNewFolder(true)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="main-area">
        {/* Header */}
        <header className="app-header">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="hamburger-btn"
            style={{
              display: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
            }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Search bar */}
          <SearchBar mobileVisible={showSearch} onMobileClose={() => setShowSearch(false)} />

          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white',
            cursor: 'pointer', flexShrink: 0,
          }}>
            N
          </div>
        </header>

        {/* Content */}
        <main className="app-main">
          <Breadcrumb />
          <Toolbar
            onUploadClick={() => setShowUpload(true)}
            onCreateFolder={() => setShowNewFolder(true)}
          />
          <FileGrid />
        </main>
      </div>

      {/* Bottom nav (mobile only) */}
      <nav className="bottom-nav">
        {bottomNavItems.map(item =>
          item.isFab ? (
            <div key={item.id} className="bottom-nav-fab">
              <button
                onClick={item.action}
                className="bottom-nav-fab-inner"
                aria-label={item.label}
                style={{ minHeight: 'unset' }}
              >
                <item.icon size={22} color="white" />
              </button>
            </div>
          ) : (
            <button
              key={item.id}
              onClick={item.action}
              className="bottom-nav-item"
              aria-label={item.label}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        )}
      </nav>

      {/* Modals */}
      {showUpload    && <UploadModal    onClose={() => setShowUpload(false)} />}
      {showNewFolder && <NewFolderModal onClose={() => setShowNewFolder(false)} />}
      <PreviewModal />
      <Notification />

      {/* Inline style for hamburger visibility */}
      <style>{`
        @media (max-width: 767px) {
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
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
