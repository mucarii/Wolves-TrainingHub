import { apiClient } from './apiClient'

type LoginResponse = {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

export const authService = {
  async login(email: string, password: string) {
    const data = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    })
    return data
  },
}
