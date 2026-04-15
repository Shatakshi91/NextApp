import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useChatStore  from '../store/chatStore'
import useGroupStore from '../store/groupStore'
import useAuthStore  from '../store/authStore'
import Sidebar       from '../components/chat/Sidebar'
import ChatWindow    from '../components/chat/ChatWindow'
import GroupWindow   from '../components/group/GroupWindow'
import WelcomeScreen from '../components/chat/WelcomeScreen'
import Navbar        from '../components/common/Navbar'

export default function ChatPage() {
  const { fetchUsers, fetchUnreadCounts, selectedUser } = useChatStore()
  const { fetchGroups, selectedGroup }                  = useGroupStore()
  const { user }                                        = useAuthStore()
  const [activeTab, setActiveTab]                       = useState('chats') // 'chats' | 'groups'

  useEffect(() => {
    fetchUsers()
    fetchGroups()
    fetchUnreadCounts()
  }, [])

  const hasActive = selectedUser || selectedGroup

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main chat area */}
        <main className="flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div key={`dm-${selectedUser._id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex"
              >
                <ChatWindow />
              </motion.div>
            ) : selectedGroup ? (
              <motion.div key={`grp-${selectedGroup._id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex"
              >
                <GroupWindow />
              </motion.div>
            ) : (
              <motion.div key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1"
              >
                <WelcomeScreen />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
