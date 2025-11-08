import { apiClient } from './client'

export const movieApi = {
  getMovies: () => apiClient.get('/movies'),
  searchMovies: (genre: string) => apiClient.post('/movies/search', { genre })
}