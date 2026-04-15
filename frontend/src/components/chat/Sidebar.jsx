import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useChatStore  from '../../store/chatStore'
import useGroupStore from '../../store/groupStore'
import useAuthStore  from '../../store/authStore'
import CreateGroupModal from '../group/CreateGroupModal'
import JoinGroupModal   from '../group/JoinGroupModal'
import { FiSearch, FiUsers, FiMessageCircle, FiPlus, FiLink } from 'react-icons/fi'
import { format } from 'timeago.js'

export default function Sidebar({ activeTab, setActiveTab }) {
  const { users, selectedUser, selectUser, unreadCounts, typingUsers, loadingUsers } = useChatStore()
  const { groups, selectedGroup, selectGroup, unreadGroupCounts }                    = useGroupStore()
  const { user: me }                                                                  = useAuthStore()

  const [search,          setSearch]          = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showJoinGroup,   setShowJoinGroup]   = useState(false)

  const filteredUsers  = users.filter(u => u?.name?.toLowerCase().includes(search.toLowerCase()))
  const filteredGroups = groups.filter(g => g?.name?.toLowerCase().includes(search.toLowerCase()))

  const totalDMUnread    = Object.values(unreadCounts).reduce((a, b) => a + b, 0)
  const totalGroupUnread = Object.values(unreadGroupCounts).reduce((a, b) => a + b, 0)

  return (
    <>
      <aside className="w-72 xl:w-80 flex flex-col border-r shrink-0"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          {[
            { id:'chats',  icon: FiMessageCircle, label:'Chats',  badge: totalDMUnread    },
            { id:'groups', icon: FiUsers,          label:'Groups', badge: totalGroupUnread },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all relative"
              style={{
                background: activeTab === tab.id ? 'var(--bg-hover)' : 'transparent',
                color:      activeTab === tab.id ? 'var(--accent-1)' : 'var(--text-secondary)',
                border:     activeTab === tab.id ? '1px solid var(--border-accent)' : '1px solid transparent',
              }}>
              <tab.icon size={15} />
              {tab.label}
              {tab.badge > 0 && (
                <span className="badge text-[9px]">{tab.badge > 99 ? '99+' : tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 shrink-0">
          <div className="relative">
            <FiSearch size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder={activeTab === 'chats' ? 'Search people…' : 'Search groups…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Group actions (only in groups tab) */}
        {activeTab === 'groups' && (
          <div className="flex gap-2 px-3 pb-2 shrink-0">
            <button onClick={() => setShowCreateGroup(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'var(--accent-1)', color: 'white', boxShadow: '0 0 12px var(--accent-glow)' }}>
              <FiPlus size={13} /> New Group
            </button>
            <button onClick={() => setShowJoinGroup(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              <FiLink size={13} /> Join
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          {activeTab === 'chats' ? (
            loadingUsers ? (
              <UsersSkeleton />
            ) : filteredUsers.length === 0 ? (
              <EmptyState msg="No users found" />
            ) : filteredUsers.map((u, i) => (
              <motion.button
                key={u._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { selectUser(u); selectGroup(null) }}
                className={`sidebar-item w-full text-left ${selectedUser?._id === u._id ? 'active' : ''}`}
              >
                <div className="relative shrink-0">
                  {u.profilePic
                    ? <img src={u.profilePic} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    : <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: 'var(--accent-1)' }}>
                        {u.name[0].toUpperCase()}
                      </div>
                  }
                  {u.isOnline
                    ? <span className="online-dot  absolute -bottom-0.5 -right-0.5" />
                    : <span className="offline-dot absolute -bottom-0.5 -right-0.5" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {u.name}
                    </span>
                    {unreadCounts[u._id] > 0 && (
                      <span className="badge shrink-0 ml-1">{unreadCounts[u._id]}</span>
                    )}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {typingUsers[u._id]
                      ? <span style={{ color: 'var(--accent-2)' }}>typing...</span>
                      : u.isOnline ? 'Online' : u.lastSeen ? `${format(u.lastSeen)}` : 'Offline'
                    }
                  </p>
                </div>
              </motion.button>
            ))
          ) : (
            filteredGroups.length === 0 ? (
              <EmptyState msg="No groups yet. Create one!" />
            ) : filteredGroups.map((g, i) => (
              <motion.button
                key={g._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { selectGroup(g); selectUser(null) }}
                className={`sidebar-item w-full text-left ${selectedGroup?._id === g._id ? 'active' : ''}`}
              >
                <div className="shrink-0">
                  {g.avatar
                    ? <img src={g.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    : <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                        👥
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {g.name}
                    </span>
                    {unreadGroupCounts[g._id] > 0 && (
                      <span className="badge shrink-0 ml-1">{unreadGroupCounts[g._id]}</span>
                    )}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {g.lastMessage?.text
                      ? `${g.lastMessage.sender}: ${g.lastMessage.text}`
                      : `${g.members?.length || 0} members`
                    }
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </aside>

      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
      {showJoinGroup   && <JoinGroupModal   onClose={() => setShowJoinGroup(false)}   />}
    </>
  )
}

function UsersSkeleton() {
  return Array(6).fill(0).map((_, i) => (
    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
      <div className="w-10 h-10 rounded-xl skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 rounded skeleton" />
        <div className="h-2 w-1/3 rounded skeleton" />
      </div>
    </div>
  ))
}

function EmptyState({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-3xl">💬</p>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{msg}</p>
    </div>
  )
}
