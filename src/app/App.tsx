import React from 'react'
import { ThemeProvider } from 'styled-components'
import { CinemaBooking } from '@pages/cinema-booking'

const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545'
  }
}

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CinemaBooking />
    </ThemeProvider>
  )
}