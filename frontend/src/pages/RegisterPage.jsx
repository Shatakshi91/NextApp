import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi'

export default function RegisterPage() {
  const [form,   setForm]   = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const { register, loading } = useAuthStore()
  const navigate              = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    const res = await register(form)
    if (res.success) navigate('/')
  }

  const fields = [
    { key: 'name',     label: 'Full Name',      type: 'text',  icon: FiUser,  ph: 'Your name' },
    { key: 'email',    label: 'Email',           type: 'email', icon: FiMail,  ph: 'you@example.com' },
    { key: 'password', label: 'Password',        type: 'password', icon: FiLock, ph: 'Min 6 characters' },
  ]

  return (
    <div className="min-h-screen grid place-items-center px-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="grid-bg absolute inset-0 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: 'var(--accent-1)', boxShadow: '0 0 30px var(--accent-glow)' }}>
            <FiZap size={28} color="white" />
          </div>
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Join NexChat
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Create your free account
          </p>
        </div>

        <div className="glass rounded-3xl p-8"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <form onSubmit={submit} className="space-y-5">
            {fields.map(({ key, label, type, icon: Icon, ph }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}>{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={key === 'password' && showPw ? 'text' : type}
                    required
                    minLength={key === 'password' ? 6 : undefined}
                    className="input-field pl-11 pr-11"
                    placeholder={ph}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}>
                      {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Get Started ⚡'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login"
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--accent-1)' }}>
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
