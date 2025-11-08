import React, { useState } from 'react'
import { bookingApi } from '@shared/api'
import type { MovieCardProps } from '../types'

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onBookingSuccess }) => {
  const [quickBooking, setQuickBooking] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [seats, setSeats] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleQuickBooking = async () => {
    if (!selectedTime) {
      alert('Выберите время сеанса')
      return
    }

    const customerName = prompt('Введите ваше имя:')
    const customerEmail = prompt('Введите ваш email:')

    if (!customerName || !customerEmail) {
      alert('Все поля обязательны для заполнения')
      return
    }

    setLoading(true)
    try {
      await bookingApi.createBooking({
        movieId: movie.id,
        showtime: selectedTime,
        seats: seats,
        customerName,
        customerEmail
      })
      
      alert('✅ Быстрое бронирование успешно!')
      setQuickBooking(false)
      setSelectedTime('')
      setSeats(1)
      onBookingSuccess?.()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка бронирования')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px', 
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{movie.title}</h3>
      <p style={{ color: '#666', fontStyle: 'italic', margin: '0 0 10px 0' }}>{movie.genre}</p>
      <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1.2em', margin: '0 0 15px 0' }}>
        {movie.price} руб.
      </p>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Сеансы:</strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          {movie.showtimes.map(time => (
            <button
              key={time}
              onClick={() => {
                setSelectedTime(time)
                setQuickBooking(true)
              }}
              style={{
                background: selectedTime === time ? '#28a745' : '#007bff',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.9em',
                cursor: 'pointer'
              }}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Форма быстрого бронирования */}
      {quickBooking && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          border: '2px solid #007bff',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '300px'
        }}>
          <h4 style={{ margin: '0 0 15px 0' }}>🚀 Быстрое бронирование</h4>
          <p><strong>Фильм:</strong> {movie.title}</p>
          <p><strong>Время:</strong> {selectedTime}</p>
          
          <div style={{ margin: '15px 0' }}>
            <label>Количество мест: </label>
            <select 
              value={seats} 
              onChange={(e) => setSeats(Number(e.target.value))}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              {[1,2,3,4,5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setQuickBooking(false)}
              disabled={loading}
              style={{ 
                padding: '8px 16px', 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleQuickBooking}
              disabled={loading}
              style={{ 
                padding: '8px 16px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              {loading ? 'Бронируем...' : 'Забронировать'}
            </button>
          </div>
        </div>
      )}

      {quickBooking && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => !loading && setQuickBooking(false)}
        />
      )}
    </div>
  )
}