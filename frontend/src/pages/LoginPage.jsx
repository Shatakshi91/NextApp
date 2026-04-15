import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi'

export default function LoginPage() {
  const [form,   setForm]   = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const { login, loading }  = useAuthStore()
  const navigate            = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    const res = await login(form)
    if (res.success) navigate('/')
  }

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
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: 'var(--accent-1)', boxShadow: '0 0 30px var(--accent-glow)' }}
          >
            <FiZap size={28} color="white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to NexChat
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <div className="relative">
                <FiMail size={15} className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email" required
                  className="input-field pl-11"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <FiLock size={15} className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'} required
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

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
                  Signing in...
                </span>
              ) : 'Sign In ⚡'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register"
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--accent-1)' }}>
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
