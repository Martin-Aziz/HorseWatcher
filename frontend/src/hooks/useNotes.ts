'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockStore } from '@/lib/mockData'
import type { HorseNote } from '@/types/note'

export function useNotes(horseId: string) {
  return useQuery<HorseNote[]>({
    queryKey: ['notes', horseId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 50))
      return mockStore().getNotes(horseId)
    },
    enabled: !!horseId,
  })
}

export function useAddNote(horseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (content: string) => {
      const note = mockStore().addNote(horseId, content)
      if (!note) throw new Error('Note content is required.')
      return note
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes', horseId] })
    },
  })
}

export function useDeleteNote(horseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (noteId: string) => {
      const ok = mockStore().deleteNote(horseId, noteId)
      if (!ok) throw new Error('Note not found.')
      return noteId
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes', horseId] })
    },
  })
}
