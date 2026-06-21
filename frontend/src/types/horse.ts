export interface Horse {
  id: string
  name: string
  breed: string | null
  date_of_birth: string | null
  sex: 'mare' | 'stallion' | 'gelding' | 'filly' | 'colt' | null
  color: string | null
  weight_kg: number | null
  avatar_url: string | null
  stable_id: string | null
  owner_id: string
  microchip_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type HorseStatus = 'ok' | 'warning' | 'urgent' | 'unknown'
