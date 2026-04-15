// CreateGroupModal.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import useChatStore  from '../../store/chatStore'
import useGroupStore from '../../store/groupStore'
import { FiX, FiCamera, FiCheck } from 'react-icons/fi'

export function CreateGroupModal({ onClose }) {
  const { users }        = useChatStore()
  const { createGroup }  = useGroupStore()
  const [name, setName]  = useState('')
  const [desc, setDesc]  = useState('')
  const [selected, setSelected] = useState([])
  const [avatar,   setAvatar]   = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [creating, setCreating] = useState(false)

  const toggleUser = (uid) => setSelected(s => s.includes(uid) ? s.filter(i => i !== uid) : [...s, uid])

  const handleAvatar = (e) => {
    const f = e.target.files[0]
    if (f) { setAvatar(f); setPreview(URL.createObjectURL(f)) }
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    const res = await createGroup({ name: name.trim(), description: desc, memberIds: selected }, avatar)
    if (res.success) onClose()
    setCreating(false)
  }

  return (
    <ModalWrapper onClose={onClose} title="Create Group">
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <label className="relative cursor-pointer">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{ background: 'var(--bg-elevated)', border: '2px dashed var(--border)' }}>
            {preview
              ? <img src={preview} alt="" className="w-full h-full object-cover" />
              : <span className="text-2xl">👥</span>
            }
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-1)' }}>
            <FiCamera size={11} color="white" />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </label>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Group Name *</label>
          <input className="input-field" placeholder="My Awesome Group"
            value={name} onChange={e => setName(e.target.value)} maxLength={60} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Description</label>
          <textarea className="input-field resize-none" rows={2} placeholder="What's this group about?"
            value={desc} onChange={e => setDesc(e.target.value)} maxLength={200} />
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        Add Members ({selected.length} selected)
      </p>
      <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
        {users.map(u => (
          <button key={u._id} onClick={() => toggleUser(u._id)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all"
            style={{ background: selected.includes(u._id) ? 'var(--bg-hover)' : 'transparent',
                     border: selected.includes(u._id) ? '1px solid var(--border-accent)' : '1px solid transparent' }}>
            {u.profilePic
              ? <img src={u.profilePic} alt="" className="w-8 h-8 rounded-xl object-cover shrink-0" />
              : <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: 'var(--accent-1)' }}>{u.name?.[0]?.toUpperCase() || '?'}</div>
            }
            <span className="flex-1 text-sm text-left truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
            {selected.includes(u._id) && <FiCheck size={14} style={{ color: 'var(--accent-1)', flexShrink: 0 }} />}
          </button>
        ))}
      </div>

      <button onClick={handleCreate} disabled={!name.trim() || creating}
        className="btn-primary w-full py-3 disabled:opacity-50">
        {creating ? 'Creating…' : `Create Group (${selected.length + 1} members)`}
      </button>
    </ModalWrapper>
  )
}

export function AddMembersModal({ onClose }) {
  const { users }        = useChatStore()
  const { selectedGroup, addMembers } = useGroupStore()
  const existingIds = selectedGroup?.members?.map(m => m.user?._id || m.user) || []
  const available   = users.filter(u => !existingIds.includes(u._id))
  const [selected, setSelected] = useState([])
  const [adding,   setAdding]   = useState(false)

  const toggleUser = (uid) => setSelected(s => s.includes(uid) ? s.filter(i => i !== uid) : [...s, uid])

  const handleAdd = async () => {
    if (!selected.length) return
    setAdding(true)
    const res = await addMembers(selectedGroup._id, selected)
    if (res.success) onClose()
    setAdding(false)
  }

  return (
    <ModalWrapper onClose={onClose} title="Add Members">
      {available.length === 0 ? (
        <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
          All users are already members!
        </p>
      ) : (
        <>
          <div className="max-h-72 overflow-y-auto space-y-1 mb-4">
            {available.map(u => (
              <button key={u._id} onClick={() => toggleUser(u._id)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all"
                style={{ background: selected.includes(u._id) ? 'var(--bg-hover)' : 'transparent',
                         border: selected.includes(u._id) ? '1px solid var(--border-accent)' : '1px solid transparent' }}>
                {u.profilePic
                  ? <img src={u.profilePic} alt="" className="w-8 h-8 rounded-xl object-cover shrink-0" />
                  : <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: 'var(--accent-1)' }}>{u.name?.[0]?.toUpperCase() || '?'}</div>
                }
                <span className="flex-1 text-sm text-left" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                {selected.includes(u._id) && <FiCheck size={14} style={{ color: 'var(--accent-1)' }} />}
              </button>
            ))}
          </div>
          <button onClick={handleAdd} disabled={!selected.length || adding}
            className="btn-primary w-full py-3 disabled:opacity-50">
            {adding ? 'Adding…' : `Add ${selected.length} Member${selected.length !== 1 ? 's' : ''}`}
          </button>
        </>
      )}
    </ModalWrapper>
  )
}

export function JoinGroupModal({ onClose }) {
  const [code,    setCode]    = useState('')
  const [joining, setJoining] = useState(false)
  const { joinViaInvite }     = useGroupStore()

  const handleJoin = async () => {
    if (!code.trim()) return
    setJoining(true)
    const res = await joinViaInvite(code.trim())
    if (res.success) onClose()
    setJoining(false)
  }

  return (
    <ModalWrapper onClose={onClose} title="Join a Group">
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Enter an invite code to join a group.
      </p>
      <input className="input-field mb-4 font-mono" placeholder="Invite code (e.g. a1b2c3)"
        value={code} onChange={e => setCode(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleJoin()} />
      <button onClick={handleJoin} disabled={!code.trim() || joining}
        className="btn-primary w-full py-3 disabled:opacity-50">
        {joining ? 'Joining…' : 'Join Group'}
      </button>
    </ModalWrapper>
  )
}

function ModalWrapper({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1,   y: 0  }}
        exit={{ opacity: 0,   scale: 0.9,   y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                 boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-xl"><FiX size={16} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

export default CreateGroupModal
