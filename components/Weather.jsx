import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { BsSearch } from 'react-icons/bs';
import Chart from './Charts';

const Weather = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('metric');
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [pastWeatherData, setPastWeatherData] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);

    if (!city.trim()) {
      setError('Please enter a valid city name');
      setLoading(false);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`);

      if (!response.data || response.data.cod === '404') {
        throw new Error('City not found');
      }

      setWeatherData(response.data);
      setLoading(false);
      setError('');
      setCity('');

      // Update recent searches
      if (!recentSearches.includes(city)) {
        setRecentSearches([city, ...recentSearches.slice(0, 4)]);
      }

      // Fetch past weather data
      const pastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${response.data.coord.lat}&lon=${response.data.coord.lon}&dt=${Math.floor(Date.now() / 1000)}&appid=${apiKey}`);
      setPastWeatherData(pastResponse.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleUnitToggle = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
    // When unit is toggled, clear recent searches to avoid inconsistency
    setRecentSearches([]);
  };

  useEffect(() => {
    setWeatherData(null);
    setPastWeatherData(null);
    setError('');
  }, [city]);

  return (
    <div className="dark:bg-gray-800 bg-white relative flex flex-col justify-between max-w-[500px] w-full h-[90vh] m-auto p-4 text-gray-300 z-10">
      {/* Search */}
      <div className="relative flex justify-between items-center max-w-[500px] w-full m-auto pt-4 px-4 text-white z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWeather();
          }}
          className="flex justify-between items-center w-full m-auto p-3 bg-transparent border border-gray-300 text-white rounded-2xl"
        >
          <input
            onChange={(e) => setCity(e.target.value)}
            value={city}
            className="bg-transparent border-none text-white focus:outline-none text-2xl dark:text-gray-900"
            type="text"
            placeholder="Search city"
          />
          <button type="submit">
            <BsSearch size={20} />
          </button>
        </form>
      </div>

      {/* Weather data or spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 mt-2">{error}</p>
      ) : weatherData ? (
        <>
          <div className="flex justify-between pt-12">
            <div className="flex flex-col items-center">
              <Image
                src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                alt="Weather icon"
                width="100"
                height="100"
              />
              <p className="text-2xl">{weatherData.weather[0].main}</p>
            </div>
            <div className="flex items-center">
              <p className="text-9xl mr-2">{weatherData.main.temp.toFixed(0)}</p>
              <div className="flex items-center">
                <p className={`mr-2 ${unit === 'metric' ? 'text-gray-500' : ''}`}>&#176;{unit === 'metric' ? 'C' : 'F'}</p>
              </div>
            </div>
          </div>
          <div className="bg-black/50 relative p-8 rounded-md">
            <p className="text-2xl text-center pb-6">Weather in {weatherData.name}</p>
            <div className="flex justify-between text-center">
              <div>
                <p className="font-bold text-2xl">{weatherData.main.feels_like.toFixed(0)}°{unit === 'metric' ? 'C' : 'F'}</p>
                <p className="text-xl">Feels Like</p>
              </div>
              <div>
                <p className="font-bold text-2xl">{weatherData.main.humidity}%</p>
                <p className="text-xl">Humidity</p>
              </div>
              <div>
                <p className="font-bold text-2xl">{weatherData.wind.speed.toFixed(0)} {unit === 'metric' ? 'm/s' : 'MPH'}</p>
                <p className="text-xl">Winds</p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Recent searches */}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Recent Searches:</h2>
        <ul>
          {recentSearches.map((search, index) => (
            <li key={index} className="mb-1">{search}</li>
          ))}
        </ul>
      </div>

      {/* Unit toggle button */}
      <button onClick={handleUnitToggle} className="mt-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md">
        {unit === 'metric' ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
      </button>

      {/* Past weather data chart */}
      {pastWeatherData && (
        <Chart hourlyData={pastWeatherData.hourly || []} />
      )}
    </div>
  );
};

export default Weather;
