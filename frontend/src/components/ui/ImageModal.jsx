import { motion } from 'framer-motion'
import { FiX, FiDownload, FiZoomIn } from 'react-icons/fi'

export default function ImageModal({ src, onClose }) {
  const handleDownload = async () => {
    try {
      const res  = await fetch(src)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'nexchat-image.jpg'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(src, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handleDownload}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
        >
          <FiDownload size={18} />
        </button>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Image */}
      <motion.img
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        exit={{ scale: 0.8,    opacity: 0 }}
        transition={{ duration: 0.25, ease: 'backOut' }}
        src={src}
        alt="Preview"
        className="max-w-full max-h-[90vh] rounded-2xl object-contain"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}
      />
    </motion.div>
  )
}
