import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const MOVIES_FILE = 'movies.json';
const BOOKINGS_FILE = 'bookings.json';

// Инициализация файлов
async function initFiles() {
    try {
        await fs.access(MOVIES_FILE);
    } catch {
        const movies = [
            { 
                id: 1, 
                title: "Аватар: Путь воды", 
                genre: "Фантастика", 
                showtimes: ["10:00", "14:00", "18:00"], 
                price: 400,
                duration: "192 мин"
            },
            { 
                id: 2, 
                title: "Оппенгеймер", 
                genre: "Драма", 
                showtimes: ["11:00", "15:00", "19:30"], 
                price: 350,
                duration: "180 мин"
            },
            { 
                id: 3, 
                title: "Барби", 
                genre: "Комедия", 
                showtimes: ["12:00", "16:00", "20:00"], 
                price: 300,
                duration: "114 мин"
            }
        ];
        await fs.writeFile(MOVIES_FILE, JSON.stringify(movies, null, 2));
    }

    try {
        await fs.access(BOOKINGS_FILE);
    } catch {
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify([], null, 2));
    }
}

// Чтение JSON файла с обработкой ошибок
async function readJSON(file) {
    try {
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (file === BOOKINGS_FILE) return [];
        throw error;
    }
}

// Запись в JSON файл с обработкой ошибок
async function writeJSON(file, data) {
    try {
        await fs.writeFile(file, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Ошибка записи:', error);
        return false;
    }
}

// 1. GET - Веб-страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. GET - Все фильмы
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await readJSON(MOVIES_FILE);
        res.json({ 
            success: true, 
            data: movies,
            count: movies.length
        });
    } catch (error) {
        console.error('Ошибка получения фильмов:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка при получении списка фильмов' 
        });
    }
});

// 3. GET - Получить бронирования
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await readJSON(BOOKINGS_FILE);
        const movies = await readJSON(MOVIES_FILE);
        
        // Обогащаем бронирования информацией о фильмах
        const enrichedBookings = bookings.map(booking => {
            const movie = movies.find(m => m.id === booking.movieId);
            return {
                ...booking,
                movieTitle: movie?.title || 'Неизвестный фильм',
                movieGenre: movie?.genre || 'Неизвестно',
                totalPrice: movie ? movie.price * booking.seats : 0
            };
        });

        res.json({ 
            success: true, 
            data: enrichedBookings,
            count: enrichedBookings.length
        });
    } catch (error) {
        console.error('Ошибка получения бронирований:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка при получении бронирований' 
        });
    }
});

// 4. POST - Поиск фильмов
app.post('/api/movies/search', async (req, res) => {
    try {
        const { genre, maxPrice } = req.body;
        const movies = await readJSON(MOVIES_FILE);
        
        let filteredMovies = movies;
        
        if (genre && genre.trim()) {
            filteredMovies = filteredMovies.filter(movie => 
                movie.genre.toLowerCase().includes(genre.toLowerCase().trim())
            );
        }
        
        if (maxPrice) {
            filteredMovies = filteredMovies.filter(movie => 
                movie.price <= parseInt(maxPrice)
            );
        }
        
        res.json({
            success: true,
            data: filteredMovies,
            filters: { genre, maxPrice },
            count: filteredMovies.length
        });
    } catch (error) {
        console.error('Ошибка поиска фильмов:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при поиске фильмов'
        });
    }
});

// 5. POST - Создание бронирования
app.post('/api/bookings', async (req, res) => {
    try {
        const { movieId, showtime, seats, customerName, customerEmail } = req.body;
        
        // Валидация
        if (!movieId || !showtime || !seats || !customerName || !customerEmail) {
            return res.status(400).json({
                success: false,
                error: 'Все поля обязательны для заполнения'
            });
        }
        
        const movies = await readJSON(MOVIES_FILE);
        const movie = movies.find(m => m.id === parseInt(movieId));
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                error: 'Фильм не найден'
            });
        }
        
        if (!movie.showtimes.includes(showtime)) {
            return res.status(400).json({
                success: false,
                error: 'Указанное время сеанса недоступно'
            });
        }
        
        if (seats < 1 || seats > 10) {
            return res.status(400).json({
                success: false,
                error: 'Количество мест должно быть от 1 до 10'
            });
        }
        
        const bookings = await readJSON(BOOKINGS_FILE);
        const newBooking = {
            id: Date.now(),
            movieId: parseInt(movieId),
            movieTitle: movie.title,
            showtime,
            seats: parseInt(seats),
            customerName: customerName.trim(),
            customerEmail,
            totalPrice: movie.price * parseInt(seats),
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
        };
        
        bookings.push(newBooking);
        await writeJSON(BOOKINGS_FILE, bookings);
        
        res.status(201).json({
            success: true,
            message: 'Бронирование успешно создано',
            data: newBooking
        });
        
    } catch (error) {
        console.error('Ошибка создания бронирования:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при создании бронирования'
        });
    }
});

// 6. DELETE - Отмена бронирования
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const bookings = await readJSON(BOOKINGS_FILE);
        
        const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
        
        if (bookingIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Бронирование не найдено'
            });
        }
        
        const deletedBooking = bookings.splice(bookingIndex, 1)[0];
        await writeJSON(BOOKINGS_FILE, bookings);
        
        res.json({
            success: true,
            message: 'Бронирование успешно отменено',
            data: deletedBooking
        });
        
    } catch (error) {
        console.error('Ошибка отмены бронирования:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при отмене бронирования'
        });
    }
});

// 7. GET - Получить конкретное бронирование
app.get('/api/bookings/:id', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const bookings = await readJSON(BOOKINGS_FILE);
        const booking = bookings.find(b => b.id === bookingId);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Бронирование не найдено'
            });
        }
        
        res.json({
            success: true,
            data: booking
        });
        
    } catch (error) {
        console.error('Ошибка получения бронирования:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении бронирования'
        });
    }
});

// 8. Сервис для получения данных в разных форматах
app.get('/api/cinema/info', async (req, res) => {
    try {
        const acceptHeader = req.headers.accept || '';
        const movies = await readJSON(MOVIES_FILE);
        const bookings = await readJSON(BOOKINGS_FILE);
        
        const totalRevenue = bookings.reduce((sum, booking) => {
            const movie = movies.find(m => m.id === booking.movieId);
            return sum + (movie ? movie.price * booking.seats : 0);
        }, 0);
        
        const totalSeats = bookings.reduce((sum, booking) => sum + booking.seats, 0);
        const averageTicketPrice = totalSeats > 0 ? Math.round(totalRevenue / totalSeats) : 0;
        
        const cinemaInfo = {
            totalMovies: movies.length,
            totalBookings: bookings.length,
            totalRevenue: totalRevenue,
            totalSeats: totalSeats,
            averageTicketPrice: averageTicketPrice,
            popularGenres: getPopularGenres(movies),
            lastUpdated: new Date().toISOString()
        };
        
        function getPopularGenres(moviesList) {
            const genreCount = {};
            moviesList.forEach(movie => {
                genreCount[movie.genre] = (genreCount[movie.genre] || 0) + 1;
            });
            return Object.entries(genreCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([genre, count]) => ({ genre, count }));
        }
        
        // Определяем формат ответа на основе заголовка Accept
        if (acceptHeader.includes('application/xml')) {
            res.type('application/xml');
            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cinemaInfo>
    <totalMovies>${cinemaInfo.totalMovies}</totalMovies>
    <totalBookings>${cinemaInfo.totalBookings}</totalBookings>
    <totalRevenue>${cinemaInfo.totalRevenue}</totalRevenue>
    <totalSeats>${cinemaInfo.totalSeats}</totalSeats>
    <averageTicketPrice>${cinemaInfo.averageTicketPrice}</averageTicketPrice>
    <popularGenres>
        ${cinemaInfo.popularGenres.map(genre => `
        <genre>
            <name>${genre.genre}</name>
            <count>${genre.count}</count>
        </genre>
        `).join('')}
    </popularGenres>
    <lastUpdated>${cinemaInfo.lastUpdated}</lastUpdated>
</cinemaInfo>`;
            res.send(xml);
        } else if (acceptHeader.includes('text/html')) {
            res.type('text/html');
            const html = `<!DOCTYPE html>
<html>
<head>
    <title>Информация о кинотеатре</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .stat { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        .genre-list { list-style: none; padding: 0; }
        .genre-item { background: #e9ecef; padding: 8px 12px; margin: 5px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 Информация о кинотеатре</h1>
        <div class="stat"><strong>Всего фильмов:</strong> ${cinemaInfo.totalMovies}</div>
        <div class="stat"><strong>Всего бронирований:</strong> ${cinemaInfo.totalBookings}</div>
        <div class="stat"><strong>Общая выручка:</strong> ${cinemaInfo.totalRevenue} руб.</div>
        <div class="stat"><strong>Всего проданных мест:</strong> ${cinemaInfo.totalSeats}</div>
        <div class="stat"><strong>Средняя цена билета:</strong> ${cinemaInfo.averageTicketPrice} руб.</div>
        <div class="stat">
            <strong>Популярные жанры:</strong>
            <ul class="genre-list">
                ${cinemaInfo.popularGenres.map(genre => 
                    `<li class="genre-item">${genre.genre} (${genre.count} фильмов)</li>`
                ).join('')}
            </ul>
        </div>
        <div class="stat"><strong>Последнее обновление:</strong> ${new Date(cinemaInfo.lastUpdated).toLocaleString('ru-RU')}</div>
    </div>
</body>
</html>`;
            res.send(html);
        } else {
            // По умолчанию JSON
            res.json({
                success: true,
                data: cinemaInfo
            });
        }
        
    } catch (error) {
        console.error('Ошибка получения информации о кинотеатре:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении информации о кинотеатре'
        });
    }
});

// 9. Тестовый эндпоинт
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Сервер работает корректно!',
        timestamp: new Date().toISOString()
    });
});

// Обработка несуществующих API маршрутов - ИСПРАВЛЕННЫЙ СИНТАКСИС
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API маршрут не найден',
        path: req.path
    });
});

// Запуск сервера
app.listen(PORT, async () => {
    await initFiles();
    console.log(`🎬 Сервер кинотеатра запущен: http://localhost:${PORT}`);
    console.log(`📊 API доступно по: http://localhost:${PORT}/api`);
    console.log(`🎯 Тестовый эндпоинт: http://localhost:${PORT}/api/test`);
    console.log(`🎥 Фильмы: http://localhost:${PORT}/api/movies`);
    console.log(`📋 Бронирования: http://localhost:${PORT}/api/bookings`);
});