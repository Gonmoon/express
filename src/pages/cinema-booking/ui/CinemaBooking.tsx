import React, { useEffect, useState } from 'react'
import { MovieCard } from '@entities/movie'
import { BookingForm } from '@features/book-ticket'
import { BookingList } from '@features/manage-bookings'
import { movieApi, bookingApi } from '@shared/api'
import type { Movie } from '@entities/movie/types'

export const CinemaBooking: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchGenre, setSearchGenre] = useState('')
  const [searchError, setSearchError] = useState('')
  const [activeTab, setActiveTab] = useState('movies')

  useEffect(() => {
    loadMovies()
  }, [])

  const loadMovies = async () => {
    try {
      const response = await movieApi.getMovies()
      setMovies(response.data.data)
      setAllMovies(response.data.data)
      setSearchGenre('')
      setSearchError('')
    } catch (error) {
      console.error('Ошибка загрузки фильмов:', error)
      setSearchError('Ошибка загрузки фильмов')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchByGenre = async () => {
    if (!searchGenre.trim()) {
      loadMovies()
      return
    }

    try {
      const response = await movieApi.searchMovies(searchGenre.trim())
      setMovies(response.data.data)
      setSearchError('')
    } catch (error: any) {
      setSearchError(error.response?.data?.error || 'Ошибка поиска')
    }
  }

  const handleBookingSuccess = () => {
    loadMovies() // Обновляем данные после бронирования
  }

  const downloadData = async (format: 'json' | 'xml' | 'html') => {
    try {
      const headers = {
        'json': 'application/json',
        'xml': 'application/xml', 
        'html': 'text/html'
      }

      const response = await fetch('/api/cinema/info', {
        headers: { 'Accept': headers[format] }
      })
      
      if (!response.ok) throw new Error('Ошибка загрузки')
      
      const data = await response.text()
      const blob = new Blob([data], { type: headers[format] })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cinema-data.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      setSearchError('Ошибка скачивания файла')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Загрузка фильмов...</div>

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        🎬 Кинотеатр - Бронирование билетов
      </h1>

      {/* Навигация */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setActiveTab('movies')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'movies' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          🎥 Фильмы
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'bookings' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          📋 Мои бронирования
        </button>
      </div>

      {activeTab === 'movies' && (
        <>
          {/* Поиск по жанру */}
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px' }}>🔍 Поиск фильмов по жанру</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Введите жанр (Фантастика, Комедия...)"
                  value={searchGenre}
                  onChange={(e) => setSearchGenre(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchByGenre()}
                  style={{ 
                    width: '98%', 
                    padding: '10px', 
                    border: `1px solid ${searchError ? '#dc3545' : '#ddd'}`, 
                    borderRadius: '4px' 
                  }}
                />
                {searchError && (
                  <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                    {searchError}
                  </div>
                )}
                <small style={{ color: '#6c757d' }}>
                  Доступные жанры: {Array.from(new Set(allMovies.map(m => m.genre))).join(', ')}
                </small>
              </div>
              <button 
                onClick={handleSearchByGenre}
                style={{ 
                  padding: '10px 20px', 
                  background: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                Найти
              </button>
              <button 
                onClick={loadMovies}
                style={{ 
                  padding: '10px 20px', 
                  background: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                Сбросить
              </button>
            </div>
          </div>

          {/* Кнопки скачивания */}
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h3>📥 Экспорт данных кинотеатра</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => downloadData('json')}
                style={{ 
                  padding: '10px 20px', 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px' 
                }}
              >
                📄 Скачать JSON
              </button>
              <button 
                onClick={() => downloadData('xml')}
                style={{ 
                  padding: '10px 20px', 
                  background: '#fd7e14', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px' 
                }}
              >
                📊 Скачать XML
              </button>
              <button 
                onClick={() => downloadData('html')}
                style={{ 
                  padding: '10px 20px', 
                  background: '#17a2b8', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px' 
                }}
              >
                🌐 Скачать HTML
              </button>
            </div>
          </div>

          {/* Форма бронирования */}
          <BookingForm onSuccess={handleBookingSuccess} movies={allMovies} />

          {/* Список фильмов */}
          <div>
            <h3 style={{ marginBottom: '20px' }}>
              🎥 Доступные фильмы {searchGenre && `по жанру "${searchGenre}"`} 
              <span style={{ color: '#6c757d', fontSize: '16px', marginLeft: '10px' }}>
                ({movies.length} из {allMovies.length})
              </span>
            </h3>
            
            {movies.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                color: '#6c757d'
              }}>
                Фильмы не найдены
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {movies.map(movie => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onBookingSuccess={handleBookingSuccess}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'bookings' && (
        <BookingList />
      )}
    </div>
  )
}