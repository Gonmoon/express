export interface BookingFormData {
  movieId: number
  showtime: string
  seats: number
  customerName: string
  customerEmail: string
}

export interface BookingFormProps {
  onSuccess: () => void
}