export type UserRole = 'owner' | 'rider' | 'trainer' | 'vet' | 'stable_manager'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: string
}
