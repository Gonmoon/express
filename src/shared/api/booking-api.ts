import { apiClient } from './client'

export const bookingApi = {
  createBooking: (data: any) => apiClient.post('/bookings', data),
  
  cancelBooking: (id: number) => apiClient.delete(`/bookings/${id}`),
  
  getBookings: () => apiClient.get('/bookings'),
  
  getBooking: (id: number) => apiClient.get(`/bookings/${id}`)
}