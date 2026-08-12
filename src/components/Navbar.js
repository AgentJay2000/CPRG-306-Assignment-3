'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Navbar() {
  // Auth + role state
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  // Dropdown / login popover visibility
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  // Login form fields + status
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const router = useRouter()

  // Refs used to detect outside clicks and close open popovers
  const loginRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    // Load current session + profile role on mount
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setRole(profile?.role ?? 'user')
      }
    }
    loadUser()

    // Keep user/role in sync with auth events (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setRole(null)
      else loadUser()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Close the login/profile popovers when clicking outside of them
  useEffect(() => {
    function handleClickOutside(e) {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setLoginOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Log in with email/password and refresh the page to pick up the new session
  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')

    if (!email || !password) {
      setLoginError('Enter both email and password.')
      return
    }

    setLoggingIn(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoggingIn(false)

    if (error) {
      setLoginError(error.message)
    } else {
      setLoginOpen(false)
      setEmail('')
      setPassword('')
      router.refresh()
    }
  }

  // Sign out and redirect to the home page
  async function handleLogout() {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
  }

  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-border">
      <Link href="/" className="font-display font-semibold text-xl tracking-wide text-foreground">
        IMR MOVIE RENTALS
      </Link>

      {!user ? (
        // Logged-out state: login button + popover form
        <div ref={loginRef} className="relative">
          <button
            onClick={() => setLoginOpen(!loginOpen)}
            className="px-4 py-2 rounded-md border border-border text-foreground hover:bg-surface transition-colors"
          >
            Login
          </button>

          {loginOpen && (
            <div className="absolute right-0 top-12 bg-surface border border-border rounded-lg p-4 min-w-[240px] shadow-lg">
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                />
                {loginError && (
                  <p className="text-danger text-xs">{loginError}</p>
                )}
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="bg-accent hover:bg-accent-hover text-background font-medium rounded-md py-2 text-sm transition-colors disabled:opacity-60"
                >
                  {loggingIn ? 'Logging in...' : 'Log In'}
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        // Logged-in state: profile icon + dropdown with role + logout
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-foreground hover:bg-surface-hover transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 bg-surface border border-border rounded-lg p-4 min-w-[180px] shadow-lg">
              <p className="text-muted text-xs">Signed in as</p>
              <p className="text-foreground font-semibold mb-3">
                {role === 'admin' ? 'Admin' : 'User'}
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-background border border-border rounded-md py-2 text-sm text-foreground hover:bg-surface-hover transition-colors"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}