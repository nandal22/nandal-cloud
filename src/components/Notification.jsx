import React from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useStorage } from '../context/StorageContext'

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
}

const COLORS = {
  success: 'var(--success)',
  error:   'var(--danger)',
  info:    'var(--accent)',
}

export default function Notification() {
  const { notification } = useStorage()
  if (!notification) return null

  const Icon = ICONS[notification.type] || ICONS.info
  const color = COLORS[notification.type] || COLORS.info

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 400,
      background: 'var(--bg-card)',
      border: `1px solid ${color}44`,
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: 'var(--shadow)',
      animation: 'slideIn 0.2s ease',
      maxWidth: 320,
    }}>
      <Icon size={16} style={{ color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{notification.msg}</span>

      <style>{`
        @keyframes slideIn {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
