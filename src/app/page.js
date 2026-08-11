'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import MovieFormModal from '@/components/MovieFormModal'

export default function Home() {
  // Movie List
  const [movies, setMovies] = useState([])
  
  // UI + Data states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Authentication + role states
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  // Modal + editing states
  const [showModal, setShowModal] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    // Load initial data
    fetchMovies()
    checkUser()

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      // Load role when user logs in
      if (session?.user) loadRole(session.user.id)
      else setRole(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Check current session on page load
  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    if (session?.user) loadRole(session.user.id)
  }

  // Fetch user role from "profiles" table
  async function loadRole(userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    setRole(profile?.role ?? 'user')
  }

  // Fetch all movies from database
  async function fetchMovies() {
    setLoading(true)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setMovies(data)
    }
    setLoading(false)
  }

  // Open modal for adding a new movie
  function openAddModal() {
    setEditingMovie(null)
    setShowModal(true)
  }

  // Open modal for editing an existing movie
  function openEditModal(movie) {
    setEditingMovie(movie)
    setShowModal(true)
  }

  // Delete movie by ID
  async function handleDelete(movieId) {
    const { error } = await supabase.from('movies').delete().eq('id', movieId)
    if (!error) {
      fetchMovies()
    }
    setDeletingId(null)
  }

  // Loading + error UI
  if (loading) return <p className="p-8 text-muted">Loading movies...</p>
  if (error) return <p className="p-8 text-danger">Error: {error}</p>

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-wide text-foreground">
          MOVIE CATALOG
        </h1>

        {/* Add movie button only for logged-in users */}
        {user && (
          <button
            onClick={openAddModal}
            className="bg-accent hover:bg-accent-hover text-background font-medium rounded-md px-4 py-2 text-sm transition-colors"
          >
            + Add Movie
          </button>
        )}
      </div>

      {/* Empty state */}
      {movies.length === 0 ? (
        <p className="text-muted">No movies yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex bg-surface border border-border rounded-lg overflow-hidden"
            >
              <div className="flex flex-col justify-center items-center px-3 bg-background">
                <span className="font-display text-accent text-sm tracking-widest [writing-mode:vertical-rl] rotate-180">
                  ADMIT ONE
                </span>
              </div>
              <div className="ticket-edge" />

              {/* Movie content */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-display text-lg font-medium text-foreground">
                      {movie.title}
                    </h2>
                    <p className="text-accent text-sm mb-2">{movie.release_year}</p>
                  </div>

                  {/* Admin-only edit/delete buttons */}
                  {role === 'admin' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(movie)}
                        className="text-muted hover:text-accent text-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(movie.id)}
                        className="text-muted hover:text-danger text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div> 

                {/* Cast list */}
                <p className="text-muted text-sm">
                  {movie.actors && movie.actors.length > 0
                    ? movie.actors.join(', ')
                    : 'No cast listed'}
                </p>

                {/* Delete confirmation UI */}
                {deletingId === movie.id && (
                  <div className="mt-3 bg-background border border-danger rounded-md p-3">
                    <p className="text-foreground text-sm mb-2">
                      Delete "{movie.title}"? This can't be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeletingId(null)}
                        className="flex-1 border border-border rounded-md py-1.5 text-xs text-foreground hover:bg-surface-hover transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
                        className="flex-1 bg-danger hover:bg-danger-hover text-foreground rounded-md py-1.5 text-xs transition-colors"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <MovieFormModal
          onClose={() => { setShowModal(false); setEditingMovie(null) }}
          onMovieAdded={fetchMovies}
          editingMovie={editingMovie}
        />
      )}
    </div>
  )
}
