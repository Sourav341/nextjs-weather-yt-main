import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { BsSearch } from 'react-icons/bs';
import Weather from '../components/Weather';
import Spinner from '../components/Spinner';

const Home = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!city.trim()) {
      setError('Please enter a valid city name');
      setLoading(false);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);

      if (!response.data || response.data.cod === '404') {
        throw new Error('City not found');
      }

      setWeather(response.data);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error.message);
      setLoading(false);
    }

    setCity('');
  };

  return (
    <div className="bg-black"> {/* Changed the background color to black */}
      {/* Your existing JSX code for background image */}
      {/* Search */}
      <div className='relative flex justify-between items-center max-w-[500px] w-full m-auto pt-4 px-4 text-white z-10'>
        <form
          onSubmit={fetchWeather}
          className='flex justify-between items-center w-full m-auto p-3 bg-transparent border border-gray-300 text-white rounded-2xl'
        >
          <div>
            <input
              onChange={(e) => setCity(e.target.value)}
              className='bg-transparent border-none text-white focus:outline-none text-2xl'
              type='text'
              placeholder='Search city'
            />
          </div>
          <button onClick={fetchWeather}>
            <BsSearch size={20} />
          </button>
        </form>
      </div>

      {/* Weather component or Spinner */}
      {loading ? <Spinner /> : (error ? <p className="text-red-500 mt-2">{error}</p> : (weather.main && <Weather data={weather} />))}
    </div>
  );
};

export default Home;
