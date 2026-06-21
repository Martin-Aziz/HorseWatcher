'use client'

import { useState } from 'react'
import { NotebookPen, Plus, X, Trash2 } from 'lucide-react'
import { useNotes, useAddNote, useDeleteNote } from '@/hooks/useNotes'
import { formatRelative, cn } from '@/lib/utils'

/**
 * Notes panel — P4.1 of the PM artifact.
 *
 * Owners are already capturing observations ad-hoc (phone photos of thermometers,
 * WhatsApp messages, paper notebooks). This panel gives them a place to put the
 * observation with an automatic vitals snapshot attached — so when the vet asks
 * "what was happening when you noticed?" the answer is structured, not a scroll
 * through the camera roll.
 */
export function NotesPanel({ horseId, horseName }: { horseId: string; horseName: string }) {
  const { data: notes, isLoading } = useNotes(horseId)
  const addNote = useAddNote(horseId)
  const deleteNote = useDeleteNote(horseId)
  const [draft, setDraft] = useState('')
  const [composing, setComposing] = useState(false)

  function submit() {
    const trimmed = draft.trim()
    if (!trimmed) return
    addNote.mutate(trimmed, {
      onSuccess: () => {
        setDraft('')
        setComposing(false)
      },
    })
  }

  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-md">
            <NotebookPen className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-base font-bold text-mist-800">Observations</h3>
        </div>
        {!composing && (
          <button
            onClick={() => setComposing(true)}
            aria-label="Add observation"
            className="flex items-center gap-1.5 text-xs font-semibold text-carrot-700 bg-carrot-50 hover:bg-carrot-100 px-3 py-1.5 rounded-xl"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Add
          </button>
        )}
      </div>

      {/* Compose form */}
      {composing && (
        <div className="bg-white/70 rounded-2xl p-3 mb-3 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Anything you noticed about ${horseName}? (eating, mood, gait, anything)`}
            rows={3}
            className="w-full bg-transparent border-none outline-none text-sm text-mist-700 placeholder:text-mist-400 resize-none"
            autoFocus
          />
          <p className="text-[10px] text-mist-400">
            We'll attach the current vitals automatically — so your vet can see what was happening.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setComposing(false); setDraft('') }}
              className="text-xs font-semibold text-mist-500 hover:text-mist-800 px-3 py-1.5 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!draft.trim() || addNote.isPending}
              className="text-xs font-semibold text-white bg-carrot-500 hover:bg-carrot-600 disabled:opacity-40 px-3 py-1.5 rounded-lg shadow-md shadow-carrot-500/30"
            >
              {addNote.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white/50 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-mist-500">No observations yet.</p>
          <p className="text-xs text-mist-400 mt-1">
            Notice something? Jot it down here — it becomes part of {horseName}'s record.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id} className="bg-white/60 rounded-2xl p-3 group">
              <p className="text-sm text-mist-700 leading-snug">{note.content}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-[11px] text-mist-500">
                  <span>{formatRelative(note.recorded_at)}</span>
                  {note.vitals_snapshot && (
                    <span className="text-mist-400">
                      {note.vitals_snapshot.heart_rate_bpm !== null && (
                        <>HR {note.vitals_snapshot.heart_rate_bpm} </>
                      )}
                      {note.vitals_snapshot.skin_temp_c !== null && (
                        <>· {note.vitals_snapshot.skin_temp_c.toFixed(1)}°C</>
                      )}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteNote.mutate(note.id)}
                  aria-label="Delete note"
                  className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-mist-400 hover:text-red-500',
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Defensive imports for tree-shaking — keep referenced
void X
