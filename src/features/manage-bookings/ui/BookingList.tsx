import React, { useState, useEffect } from 'react'
import { bookingApi } from '@shared/api'

interface Booking {
  id: number
  movieId: number
  movieTitle: string
  showtime: string
  seats: number
  customerName: string
  customerEmail: string
  totalPrice: number
  bookingDate: string
  status: string
}

export const BookingList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await bookingApi.getBookings()
      setBookings(response.data.data || [])
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Вы уверены, что хотите отменить бронирование?')) return

    try {
      await bookingApi.cancelBooking(bookingId)
      alert('✅ Бронирование отменено!')
      loadBookings() // Обновляем данные
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка отмены бронирования')
    }
  }

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status)
  }

  const filteredBookings = selectedStatus 
    ? bookings.filter(booking => booking.status === selectedStatus)
    : bookings

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Загрузка бронирований...</div>

  return (
    <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>📋 Мои бронирования</h3>
      
      {/* Фильтр по статусу */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>Фильтр по статусу:</span>
        <select 
          value={selectedStatus}
          onChange={(e) => handleStatusFilter(e.target.value)}
          style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">Все</option>
          <option value="confirmed">Подтвержденные</option>
          <option value="cancelled">Отмененные</option>
        </select>
        <button 
          onClick={loadBookings}
          style={{ 
            padding: '5px 10px', 
            background: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          🔄 Обновить
        </button>
      </div>

      {/* Список бронирований */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredBookings.map(booking => (
          <div 
            key={booking.id}
            style={{ 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              background: booking.status === 'cancelled' ? '#f8f9fa' : 'white',
              opacity: booking.status === 'cancelled' ? 0.7 : 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{booking.movieTitle}</h4>
                <p style={{ margin: '2px 0', fontSize: '14px', color: '#666' }}>
                  🕒 {booking.showtime} | 👥 {booking.seats} мест | 👤 {booking.customerName}
                </p>
                <p style={{ margin: '2px 0', fontSize: '14px', color: '#666' }}>
                  📧 {booking.customerEmail} | 💰 {booking.totalPrice} руб.
                </p>
                <p style={{ margin: '2px 0', fontSize: '14px', color: '#666' }}>
                  📅 {new Date(booking.bookingDate).toLocaleString('ru-RU')} | 📊 Статус: 
                  <span style={{ 
                    color: booking.status === 'confirmed' ? '#28a745' : 
                           booking.status === 'cancelled' ? '#dc3545' : '#ffc107',
                    fontWeight: 'bold',
                    marginLeft: '5px'
                  }}>
                    {booking.status === 'confirmed' ? 'Подтверждено' : 
                     booking.status === 'cancelled' ? 'Отменено' : 'Ожидание'}
                  </span>
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    style={{ 
                      padding: '8px 16px', 
                      background: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredBookings.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6c757d',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {selectedStatus 
              ? 'Бронирования с выбранным статусом не найдены' 
              : 'Бронирования отсутствуют. Забронируйте билеты на вкладке "Фильмы"'
            }
          </div>
        )}
      </div>
    </div>
  )
}