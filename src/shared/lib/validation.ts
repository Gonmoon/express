export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export const validateBookingData = (data: {
  movieId: number
  showtime: string
  seats: number
  customerName: string
  customerEmail: string
}, availableMovies: any[]): ValidationResult => {
  const errors: string[] = []

  // Проверка movieId
  if (!data.movieId || data.movieId <= 0) {
    errors.push('ID фильма обязателен')
  } else {
    const movieExists = availableMovies.find(m => m.id === data.movieId)
    if (!movieExists) {
      errors.push('Фильм с указанным ID не найден')
    }
  }

  // Проверка showtime
  if (!data.showtime) {
    errors.push('Время сеанса обязательно')
  } else {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(data.showtime)) {
      errors.push('Неверный формат времени (используйте HH:MM)')
    } else if (data.movieId) {
      const movie = availableMovies.find(m => m.id === data.movieId)
      if (movie && !movie.showtimes.includes(data.showtime)) {
        errors.push(`Сеанс на ${data.showtime} недоступен для этого фильма`)
      }
    }
  }

  // Проверка seats
  if (!data.seats || data.seats <= 0) {
    errors.push('Количество мест должно быть больше 0')
  } else if (data.seats > 10) {
    errors.push('Максимальное количество мест - 10')
  }

  // Проверка customerName
  if (!data.customerName.trim()) {
    errors.push('Имя обязательно')
  } else if (data.customerName.trim().length < 2) {
    errors.push('Имя должно содержать минимум 2 символа')
  } else if (data.customerName.trim().length > 50) {
    errors.push('Имя слишком длинное')
  }

  // Проверка customerEmail
  if (!data.customerEmail) {
    errors.push('Email обязателен')
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.customerEmail)) {
      errors.push('Неверный формат email')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateSearchData = (genre: string): ValidationResult => {
  const errors: string[] = []

  if (genre && genre.length > 30) {
    errors.push('Название жанра слишком длинное')
  }

  if (genre && !/^[a-zA-Zа-яА-Я\s]+$/.test(genre)) {
    errors.push('Название жанра может содержать только буквы и пробелы')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}