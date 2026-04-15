import { useState } from 'react'
import { motion } from 'framer-motion'
import useGroupStore from '../../store/groupStore'
import useAuthStore  from '../../store/authStore'
import AddMembersModal from './AddMembersModal'
import { FiX, FiPlus, FiLink, FiEdit2, FiTrash2, FiShield, FiUser, FiVolume2, FiVolumeX, FiCopy } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ROLE_ICONS = { admin: FiShield, moderator: FiUser, member: FiUser }
const ROLE_COLORS = { admin: 'var(--accent-1)', moderator: 'var(--accent-2)', member: 'var(--text-muted)' }

export default function GroupInfoPanel({ myRole, onClose }) {
  const { user: me }                                                          = useAuthStore()
  const { selectedGroup, removeMember, changeMemberRole, muteMember,
          regenerateInvite, deleteGroup }                                      = useGroupStore()
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [showEditGroup,  setShowEditGroup]  = useState(false)

  if (!selectedGroup) return null

  const isAdmin = myRole === 'admin'
  const isMod   = ['admin','moderator'].includes(myRole)

  const copyInvite = async () => {
    const link = `${window.location.origin}/join/${selectedGroup.inviteCode}`
    await navigator.clipboard.writeText(link)
    toast.success('Invite link copied!')
  }

  const handleRegen = async () => {
    const res = await regenerateInvite(selectedGroup._id)
    if (res.success) toast.success('New invite link generated!')
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}>
        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Group Info</span>
        <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
          <FiX size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Group avatar + name */}
        <div className="flex flex-col items-center py-6 px-4 gap-3">
          {selectedGroup.avatar
            ? <img src={selectedGroup.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            : <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                👥
              </div>
          }
          <div className="text-center">
            <p className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {selectedGroup.name}
            </p>
            {selectedGroup.description && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {selectedGroup.description}
              </p>
            )}
          </div>
        </div>

        {/* Invite link */}
        {isMod && (
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Invite Link
            </p>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl text-xs font-mono truncate"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                /join/{selectedGroup.inviteCode}
              </div>
              <button onClick={copyInvite}
                className="btn-ghost p-2 rounded-xl" title="Copy invite link">
                <FiCopy size={14} />
              </button>
              {isAdmin && (
                <button onClick={handleRegen}
                  className="btn-ghost p-2 rounded-xl" title="Regenerate invite">
                  <FiLink size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Members */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Members ({selectedGroup.members?.length || 0})
            </p>
            {isMod && (
              <button onClick={() => setShowAddMembers(true)}
                className="flex items-center gap-1 text-xs font-medium transition-all"
                style={{ color: 'var(--accent-1)' }}>
                <FiPlus size={12} /> Add
              </button>
            )}
          </div>

          <div className="space-y-1">
            {selectedGroup.members?.map(member => {
              const u       = typeof member.user === 'object' ? member.user : null
              const uid     = u?._id || member.user
              const isSelf  = uid === me?._id
              const RoleIcon = ROLE_ICONS[member.role] || FiUser

              return (
                <motion.div key={uid || member._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-xl group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {u?.profilePic
                    ? <img src={u.profilePic} alt="" className="w-8 h-8 rounded-xl object-cover shrink-0" />
                    : <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: 'var(--accent-1)' }}>
                        {u?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {u?.name || 'Unknown'} {isSelf && <span style={{ color: 'var(--text-muted)' }}>(you)</span>}
                    </p>
                    <div className="flex items-center gap-1">
                      <RoleIcon size={10} style={{ color: ROLE_COLORS[member.role] }} />
                      <span className="text-[10px]" style={{ color: ROLE_COLORS[member.role] }}>
                        {member.role}
                      </span>
                      {member.isMuted && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                          muted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Admin controls */}
                  {isAdmin && !isSelf && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Change role */}
                      <select
                        value={member.role}
                        onChange={e => changeMemberRole(selectedGroup._id, uid, e.target.value)}
                        className="text-[10px] px-1.5 py-1 rounded-lg cursor-pointer"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="member">Member</option>
                        <option value="moderator">Mod</option>
                        <option value="admin">Admin</option>
                      </select>
                      {/* Mute */}
                      <button
                        onClick={() => muteMember(selectedGroup._id, uid)}
                        className="btn-ghost p-1 rounded-lg"
                        title={member.isMuted ? 'Unmute' : 'Mute'}
                        style={{ color: member.isMuted ? 'var(--accent-2)' : 'var(--text-muted)' }}>
                        {member.isMuted ? <FiVolume2 size={12}/> : <FiVolumeX size={12}/>}
                      </button>
                      {/* Remove */}
                      <button
                        onClick={() => removeMember(selectedGroup._id, uid)}
                        className="btn-ghost p-1 rounded-lg"
                        style={{ color: '#f87171' }}>
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Danger zone */}
        <div className="px-4 py-6 mt-4 space-y-2">
          {/* Leave group */}
          <button
            onClick={() => removeMember(selectedGroup._id, me._id)}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            Leave Group
          </button>
          {/* Delete group (creator only) */}
          {selectedGroup.createdBy?._id === me?._id && (
            <button
              onClick={() => { if (window.confirm('Delete this group permanently?')) deleteGroup(selectedGroup._id) }}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              🗑 Delete Group
            </button>
          )}
        </div>
      </div>

      {showAddMembers && <AddMembersModal onClose={() => setShowAddMembers(false)} />}
    </div>
  )
}
