/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"Outfit"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Dark theme (default)
        dark: {
          900: '#050508', 800: '#0d0d14', 700: '#13131e',
          600: '#1a1a28', 500: '#22223a', 400: '#2d2d4a',
        },
        // Accent colors
        violet: { 400:'#a78bfa', 500:'#8b5cf6', 600:'#7c3aed' },
        cyan:   { 400:'#22d3ee', 500:'#06b6d4' },
        neon:   { green:'#39ff14', pink:'#ff2d78', blue:'#00f5ff', yellow:'#fff01f' },
      },
      backgroundImage: {
        'glass':          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'glow-violet':    'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)',
        'glow-cyan':      'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.15) 0%, transparent 70%)',
        'mesh':           'linear-gradient(135deg, #050508 0%, #0d0d14 50%, #13131e 100%)',
        'sent-bubble':    'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        'received-bubble':'linear-gradient(135deg, #1a1a28 0%, #22223a 100%)',
      },
      boxShadow: {
        'glow-sm':     '0 0 10px rgba(139,92,246,0.3)',
        'glow-md':     '0 0 25px rgba(139,92,246,0.4)',
        'glow-cyan':   '0 0 20px rgba(6,182,212,0.3)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'message':     '0 2px 12px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'slide-up':      'slideUp 0.35s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-glow':    'pulseGlow 2s ease-in-out infinite',
        'typing-dot':    'typingDot 1.4s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'shimmer':       'shimmer 1.5s infinite',
        'scale-in':      'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:        { from:{opacity:0},              to:{opacity:1} },
        slideUp:       { from:{opacity:0,transform:'translateY(16px)'}, to:{opacity:1,transform:'translateY(0)'} },
        slideInRight:  { from:{opacity:0,transform:'translateX(20px)'}, to:{opacity:1,transform:'translateX(0)'} },
        slideInLeft:   { from:{opacity:0,transform:'translateX(-20px)'},to:{opacity:1,transform:'translateX(0)'} },
        pulseGlow:     { '0%,100%':{boxShadow:'0 0 10px rgba(139,92,246,0.2)'}, '50%':{boxShadow:'0 0 30px rgba(139,92,246,0.5)'} },
        typingDot:     { '0%,80%,100%':{transform:'scale(0.6)',opacity:0.4}, '40%':{transform:'scale(1)',opacity:1} },
        float:         { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-8px)'} },
        shimmer:       { '0%':{backgroundPosition:'-200% 0'}, '100%':{backgroundPosition:'200% 0'} },
        scaleIn:       { from:{opacity:0,transform:'scale(0.9)'}, to:{opacity:1,transform:'scale(1)'} },
      },
      backdropBlur: { xs:'2px' },
    },
  },
  plugins: [],
}
