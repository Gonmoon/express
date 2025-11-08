import { useState } from 'react'
import { bookingApi } from '@shared/api'
import type { BookingFormData } from '../book-ticker/types'

export const useBooking = (onSuccess: () => void) => {
  const [form, setForm] = useState<BookingFormData>({
    movieId: 0,
    showtime: '',
    seats: 0,
    customerName: '',
    customerEmail: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name.includes('Id') || name.includes('seats') ? parseInt(value) || 0 : value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await bookingApi.createBooking(form)
      setForm({
        movieId: 0,
        showtime: '',
        seats: 0,
        customerName: '',
        customerEmail: ''
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка бронирования')
    } finally {
      setLoading(false)
    }
  }

  return { form, loading, error, handleChange, handleSubmit }
}