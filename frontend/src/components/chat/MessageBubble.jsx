import { motion } from 'framer-motion'
import { format }  from 'timeago.js'
import { FiCheck } from 'react-icons/fi'
import { MdDoneAll } from 'react-icons/md'

export default function MessageBubble({ message, isMine, showAvatar, sender, onImageClick }) {
  const isSystem = message.type === 'system'
  const isPending = message.pending

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs px-3 py-1 rounded-full"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          {message.text}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar (group messages) */}
      {!isMine && showAvatar && (
        <div className="shrink-0 mb-1">
          {sender?.profilePic
            ? <img src={sender.profilePic} alt="" className="w-7 h-7 rounded-lg object-cover" />
            : <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'var(--accent-1)' }}>
                {sender?.name?.[0]?.toUpperCase() || '?'}
              </div>
          }
        </div>
      )}

      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-xs md:max-w-md lg:max-w-lg`}>
        {/* Sender name (group) */}
        {!isMine && showAvatar && sender?.name && (
          <span className="text-[11px] font-semibold mb-1 ml-1"
            style={{ color: 'var(--accent-2)' }}>
            {sender.name}
          </span>
        )}

        <div className={isMine ? 'message-bubble-sent' : 'message-bubble-recv'}
          style={{ opacity: isPending ? 0.6 : 1 }}>

          {/* Image */}
          {message.image && (
            <button onClick={() => onImageClick?.(message.image)} className="block mb-2">
              <img
                src={message.image} alt="shared"
                className="rounded-xl max-w-full max-h-64 object-cover hover:opacity-90 transition-opacity"
                style={{ border: '1px solid var(--border)' }}
              />
            </button>
          )}

          {/* Text */}
          {message.text && (
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.text}
            </p>
          )}

          {/* Meta */}
          <div className={`flex items-center gap-1 mt-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] opacity-60 font-mono">
              {message.createdAt ? format(message.createdAt) : '…'}
            </span>
            {isMine && (
              isPending ? (
                <span className="text-[10px] opacity-40">sending</span>
              ) : message.seen ? (
                <MdDoneAll size={11} style={{ color: 'var(--accent-2)' }} className="shrink-0" />
              ) : message.delivered ? (
                <MdDoneAll size={11} className="opacity-50 shrink-0" />
              ) : (
                <FiCheck size={11} className="opacity-40 shrink-0" />
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}