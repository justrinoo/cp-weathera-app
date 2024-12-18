import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');

  const fetchWeather = async (location = null) => {
    try {
      setError('');
      const apiKey = '90621323a40ac00af36db783b26d8772';
      let weatherRes, forecastRes;

      if (location) {
        weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`
        );
        forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`
        );
      } else {
        // Fetch weather using city name
        weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
      }

      setWeather(weatherRes.data);
      setForecast(forecastRes.data.list.slice(0, 12));
    } catch (err) {
      setError('Kota tidak ditemukan atau input tidak valid');
      setWeather(null);
      setForecast(null);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          fetchWeather(location);
        },
        () => {
          setError('Gagal mendeteksi lokasi. Harap izinkan akses lokasi.');
        }
      );
    } else {
      setError('Geolocation tidak didukung oleh browser Anda.');
    }
  };

  const forecastChart = forecast && {
    labels: forecast.map((item) =>
      new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Suhu (°C)',
        data: forecast.map((item) => item.main.temp),
        borderColor: '#60A5FA',
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className='min-h-screen bg-gradient-to-r from-blue-100 to-blue-50 flex flex-col items-center p-6'>
      <h1 className='text-5xl font-bold text-blue-700 mb-8'>Weather App</h1>
      <div className='flex flex-col sm:flex-row items-center gap-4 mb-6 w-full max-w-md'>
        <input
          type='text'
          className='w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300'
          value={city}
          placeholder='Masukkan nama kota'
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          className='bg-blue-500 text-white px-4 py-2 whitespace-nowrap rounded hover:bg-blue-600 transition w-full sm:w-auto'
          onClick={() => fetchWeather()}
        >
          Cari Cuaca
        </button>
        <button
          className='bg-blue-500 text-white px-4 py-2 whitespace-nowrap rounded hover:bg-blue-600 transition w-full sm:w-auto'
          onClick={() => getLocation()}
        >
          Lokasi Sekarang
        </button>
      </div>
      {error && (
        <motion.p
          className='text-red-500 mb-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.p>
      )}
      {weather && (
        <motion.div
          className='bg-white shadow-lg rounded-lg p-6 mb-6 text-center w-full max-w-lg'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className='text-2xl font-bold mb-2'>
            {weather.name}, {weather.sys.country}
          </h2>
          <p className='text-gray-700 text-lg'>Suhu: {weather.main.temp}°C</p>
          <p className='text-gray-700 text-lg'>
            Cuaca: {weather.weather[0].description}
          </p>
          <p className='text-gray-700 text-lg'>
            Kelembapan: {weather.main.humidity}%
          </p>
        </motion.div>
      )}
      {forecast && (
        <motion.div
          className='bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className='text-xl font-bold mb-4 text-center'>
            Prakiraan Cuaca (12 Jam Berikutnya)
          </h3>
          <Line data={forecastChart} options={{ maintainAspectRatio: true }} />
        </motion.div>
      )}
    </div>
  );
};

export default App;
