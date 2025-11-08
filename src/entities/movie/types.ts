export interface Movie {
  id: number
  title: string
  genre: string
  showtimes: string[]
  price: number
  duration?: string
}

export interface MovieCardProps {
  movie: Movie
  onBookingSuccess?: () => void
}