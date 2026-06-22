import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLink } from 'react-icons/fi'
import useGroupStore from '../store/groupStore'

export default function JoinInvitePage() {
  const { inviteCode } = useParams()
  const navigate = useNavigate()
  const { joinViaInvite, selectGroup } = useGroupStore()
  const [status, setStatus] = useState('Joining group...')
  const hasJoined = useRef(false)

  useEffect(() => {
    if (!inviteCode || hasJoined.current) return
    hasJoined.current = true

    const joinGroup = async () => {
      const res = await joinViaInvite(inviteCode)

      if (res.success) {
        setStatus('Group joined. Opening chat...')
        selectGroup(res.group)
        setTimeout(() => navigate('/', { replace: true }), 600)
        return
      }

      setStatus('Invite link is invalid or expired.')
      setTimeout(() => navigate('/', { replace: true }), 1600)
    }

    joinGroup()
  }, [inviteCode, joinViaInvite, navigate, selectGroup])

  return (
    <div className="min-h-screen grid place-items-center px-4"
      style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-sm rounded-3xl p-8 text-center"
      >
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent-1)', boxShadow: '0 0 24px var(--accent-glow)' }}>
          <FiLink size={24} color="white" />
        </div>
        <h1 className="font-display font-bold text-xl mb-2"
          style={{ color: 'var(--text-primary)' }}>
          Group Invite
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {status}
        </p>
      </motion.div>
    </div>
  )
}
