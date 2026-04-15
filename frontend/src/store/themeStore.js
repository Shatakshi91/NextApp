import { create } from 'zustand'

const THEMES = ['dark', 'neon', 'cyberpunk', 'aurora']

const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem('nexchat_theme') || 'dark',

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('nexchat_theme', theme)
    set({ theme })
  },

  initTheme: () => {
    const saved = localStorage.getItem('nexchat_theme') || 'dark'
    document.documentElement.setAttribute('data-theme', saved)
    set({ theme: saved })
  },

  cycleTheme: () => {
    const curr = get().theme
    const next = THEMES[(THEMES.indexOf(curr) + 1) % THEMES.length]
    get().setTheme(next)
  },

  themes: THEMES,
}))

export default useThemeStore
