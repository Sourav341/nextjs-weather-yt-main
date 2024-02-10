import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';

const Weather = ({ data }) => {
  const [unit, setUnit] = useState('metric'); // Default to Celsius
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [pastWeatherData, setPastWeatherData] = useState(null);

  useEffect(() => {
    setWeatherData(data);
  }, [data]);

  const handleSearch = async () => {
    try {
      if (!city.trim()) {
        throw new Error('Please enter a valid city name');
      }

      const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&exclude={part}&appid=${YOUR_WEATHER_API_KEY}`);
      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();
      setWeatherData(data);
      setError('');
    } catch (error) {
      setError(error.message);
      setWeatherData(null);
    }
  };

  const handleUnitToggle = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  useEffect(() => {
    if (weatherData) {
      if (!recentSearches.includes(weatherData.name)) {
        setRecentSearches([weatherData.name, ...recentSearches.slice(0, 4)]);
      }

      const fetchPastWeatherData = async () => {
        try {
          const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&dt=${Math.floor(Date.now() / 1000)}&appid=${YOUR_WEATHER_API_KEY}`);
          if (!response.ok) {
            throw new Error('Failed to fetch past weather data');
          }
          const data = await response.json();
          setPastWeatherData(data);
        } catch (error) {
          console.error(error);
          setPastWeatherData(null);
        }
      };
      fetchPastWeatherData();
    }
  }, [weatherData]);

  return (
    <div className='relative flex flex-col justify-between max-w-[500px] w-full h-[90vh] m-auto p-4 text-gray-300 z-10'>
      <div className='relative flex justify-between pt-12'>
        <div className='flex flex-col items-center'>
          {weatherData && (
            <Image
              src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
              alt='/'
              width='100'
              height='100'
            />
          )}
          {weatherData && <p className='text-2xl'>{weatherData.weather[0].main}</p>}
        </div>
        <div className="flex items-center">
          {weatherData && (
            <>
              <p className='text-9xl mr-2'>{weatherData.main.temp.toFixed(0)}</p>
              <div className="flex items-center">
                <p className={`mr-2 ${unit === 'metric' ? 'text-gray-500' : ''}`}>&#176;{unit === 'metric' ? 'C' : 'F'}</p>
                <p className={`mr-2 ${unit === 'imperial' ? 'text-gray-500' : ''}`}>&#176;{unit === 'metric' ? 'C' : 'F'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className='bg-black/50 relative p-8 rounded-md'>
        <p className='text-2xl text-center pb-6'>Weather in {weatherData ? weatherData.name : '---'}</p>
        <div className='flex justify-between text-center'>
          <div>
            <p className='font-bold text-2xl'>{weatherData ? weatherData.main.feels_like.toFixed(0) : '--'}°{unit === 'metric' ? 'C' : 'F'}</p>
            <p className='text-xl'>Feels Like</p>
          </div>
          <div>
            <p className='font-bold text-2xl'>{weatherData ? weatherData.main.humidity : '--'}%</p>
            <p className='text-xl'>Humidity</p>
          </div>
          <div>
            <p className='font-bold text-2xl'>{weatherData ? weatherData.wind.speed.toFixed(0) : '--'} {unit === 'metric' ? 'm/s' : 'MPH'}</p>
            <p className='text-xl'>Winds</p>
          </div>
        </div>
      </div>

      <form className="mt-4" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-2 rounded-md mr-2"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">Search</button>
      </form>

      <button onClick={handleUnitToggle} className="mt-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md">
        {unit === 'metric' ? 'Switch to Fahrenheit' : 'Switch to Celsius'}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Recent Searches:</h2>
        <ul>
          {recentSearches.map((search, index) => (
            <li key={index} className="mb-1">{search}</li>
          ))}
        </ul>
      </div>

      <header className="mt-4">
        <nav className="flex justify-between items-center bg-gray-800 text-white p-4">
          <div>
            <h1 className="text-xl font-bold">Weather App</h1>
          </div>
          <div>
            {/* Navigation links can be added here */}
          </div>
        </nav>
      </header>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Past Weather Data</h2>
        {pastWeatherData && (
          <Line
            data={{
              labels: pastWeatherData.hourly.map(hour => new Date(hour.dt * 1000).toLocaleTimeString()),
              datasets: [
                {
                  label: 'Temperature (°C)',
                  data: pastWeatherData.hourly.map(hour => Math.round(hour.temp - 273.15)), // Convert from Kelvin to Celsius
                  fill: false,
                  backgroundColor: 'rgb(75, 192, 192)',
                  borderColor: 'rgba(75, 192, 192, 0.2)',
                },
              ],
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Weather;
