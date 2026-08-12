'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MovieFormModal({ onClose, onMovieAdded, editingMovie }) {
  // Modal doubles as both the "add" and "edit" form depending on this prop
  const isEditing = Boolean(editingMovie)

  const [title, setTitle] = useState('')
  const [releaseYear, setReleaseYear] = useState('')
  const [actors, setActors] = useState([''])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Pre-fill the form when editing an existing movie
  useEffect(() => {
    if (editingMovie) {
      setTitle(editingMovie.title)
      setReleaseYear(String(editingMovie.release_year))
      setActors(editingMovie.actors && editingMovie.actors.length > 0 ? editingMovie.actors : [''])
    }
  }, [editingMovie])

  // Update a single actor input by index
  function updateActor(index, value) {
    const updated = [...actors]
    updated[index] = value
    setActors(updated)
  }

  // Add a new blank actor input
  function addActorField() {
    setActors([...actors, ''])
  }

  // Remove an actor input by index
  function removeActorField(index) {
    setActors(actors.filter((_, i) => i !== index))
  }

  // Validate the form, then insert or update the movie in Supabase
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const currentYear = new Date().getFullYear()
    const yearNum = parseInt(releaseYear, 10)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!releaseYear || isNaN(yearNum) || yearNum < 1888 || yearNum > currentYear + 1) {
      setError(`Enter a valid release year (1888–${currentYear + 1}).`)
      return
    }

    // Drop empty actor fields before saving
    const cleanedActors = actors.map((a) => a.trim()).filter((a) => a.length > 0)
    if (cleanedActors.length === 0) {
      setError('Add at least one actor.')
      return
    }

    setSaving(true)

    const movieData = {
      title: title.trim(),
      release_year: yearNum,
      actors: cleanedActors,
    }

    // Update the existing row when editing, otherwise insert a new one
    const { error: saveError } = isEditing
      ? await supabase.from('movies').update(movieData).eq('id', editingMovie.id)
      : await supabase.from('movies').insert(movieData)

    setSaving(false)

    if (saveError) {
      setError(saveError.message)
    } else {
      onMovieAdded()
      onClose()
    }
  }

  return (
    // Backdrop closes the modal on click; the panel stops propagation so
    // clicking inside the form doesn't also trigger the backdrop's onClose
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}>
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          {isEditing ? 'Edit Movie' : 'Add Movie'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-muted text-sm block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-muted text-sm block mb-1">Release year</label>
            <input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Dynamic list of actor inputs */}
          <div>
            <label className="text-muted text-sm block mb-1">Actors</label>
            <div className="flex flex-col gap-2">
              {actors.map((actor, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={actor}
                    onChange={(e) => updateActor(index, e.target.value)}
                    placeholder={`Actor ${index + 1}`}
                    className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                  {actors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActorField(index)}
                      className="px-3 text-muted hover:text-danger transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addActorField}
              className="text-accent text-sm mt-2 hover:underline"
            >
              + Add another actor
            </button>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-md py-2 text-sm text-foreground hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent hover:bg-accent-hover text-background font-medium rounded-md py-2 text-sm transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}