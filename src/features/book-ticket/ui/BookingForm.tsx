import React, { useState } from 'react'
import { bookingApi } from '@shared/api'
import { validateBookingData } from '@shared/lib/validation'
import type { Movie } from '@entities/movie/types'

interface BookingFormProps {
  onSuccess: () => void
  movies: Movie[]
}

export const BookingForm: React.FC<BookingFormProps> = ({ onSuccess, movies }) => {
  const [form, setForm] = useState({
    movieId: '',
    showtime: '',
    seats: '',
    customerName: '',
    customerEmail: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const validation = validateBookingData({
      movieId: parseInt(form.movieId),
      showtime: form.showtime,
      seats: parseInt(form.seats),
      customerName: form.customerName,
      customerEmail: form.customerEmail
    }, movies)

    if (!validation.isValid) {
      setErrors(validation.errors)
      setLoading(false)
      return
    }

    try {
      await bookingApi.createBooking({
        movieId: parseInt(form.movieId),
        showtime: form.showtime,
        seats: parseInt(form.seats),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail
      })
      
      setForm({ movieId: '', showtime: '', seats: '', customerName: '', customerEmail: '' })
      setErrors([])
      setTouched({})
      onSuccess()
      alert('✅ Бронирование успешно создано!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка бронирования'
      setErrors([errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Сбрасываем ошибки при изменении
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const getAvailableShowtimes = () => {
    if (!form.movieId) return []
    const movie = movies.find(m => m.id === parseInt(form.movieId))
    return movie ? movie.showtimes : []
  }

  return (
    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>🎫 Новое бронирование</h3>
      
      {errors.length > 0 && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Ошибки:</strong>
          <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Выбор фильма */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Фильм *
          </label>
          <select
            name="movieId"
            value={form.movieId}
            onChange={handleChange}
            onBlur={() => handleBlur('movieId')}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: `1px solid ${touched.movieId && !form.movieId ? '#dc3545' : '#ddd'}`, 
              borderRadius: '4px' 
            }}
          >
            <option value="">Выберите фильм</option>
            {movies.map(movie => (
              <option key={movie.id} value={movie.id}>
                {movie.title} ({movie.genre}) - {movie.price} руб.
              </option>
            ))}
          </select>
        </div>

        {/* Выбор времени сеанса */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Время сеанса *
          </label>
          <select
            name="showtime"
            value={form.showtime}
            onChange={handleChange}
            onBlur={() => handleBlur('showtime')}
            required
            disabled={!form.movieId}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: `1px solid ${touched.showtime && !form.showtime ? '#dc3545' : '#ddd'}`, 
              borderRadius: '4px',
              opacity: !form.movieId ? 0.6 : 1
            }}
          >
            <option value="">Выберите время</option>
            {getAvailableShowtimes().map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          {!form.movieId && (
            <small style={{ color: '#6c757d' }}>Сначала выберите фильм</small>
          )}
        </div>

        {/* Количество мест */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Количество мест *
          </label>
          <input
            type="number"
            name="seats"
            placeholder="От 1 до 10"
            min="1"
            max="10"
            value={form.seats}
            onChange={handleChange}
            onBlur={() => handleBlur('seats')}
            required
            style={{ 
              width: '98%', 
              padding: '10px', 
              border: `1px solid ${touched.seats && (!form.seats || parseInt(form.seats) < 1) ? '#dc3545' : '#ddd'}`, 
              borderRadius: '4px' 
            }}
          />
        </div>

        {/* Имя */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Ваше имя *
          </label>
          <input
            type="text"
            name="customerName"
            placeholder="Введите ваше имя"
            value={form.customerName}
            onChange={handleChange}
            onBlur={() => handleBlur('customerName')}
            required
            style={{ 
              width: '98%', 
              padding: '10px', 
              border: `1px solid ${touched.customerName && !form.customerName.trim() ? '#dc3545' : '#ddd'}`, 
              borderRadius: '4px' 
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            name="customerEmail"
            placeholder="example@mail.com"
            value={form.customerEmail}
            onChange={handleChange}
            onBlur={() => handleBlur('customerEmail')}
            required
            style={{ 
              width: '98%', 
              padding: '10px', 
              border: `1px solid ${touched.customerEmail && !form.customerEmail ? '#dc3545' : '#ddd'}`, 
              borderRadius: '4px' 
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            background: loading ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Бронируем...' : '🎫 Забронировать'}
        </button>
      </form>
    </div>
  )
}