import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/store';
import { toggleUnit, toggleFavorite } from './store/weatherSlice';
import { getWeatherData } from './api/weatherService';
import { Wind, Eye, Thermometer, Gauge, Star, ArrowLeft, Cloud, Umbrella, Search } from 'lucide-react';
import './App.css';

const SearchBar = ({ onSearch }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(input.trim()) onSearch(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="search-container">
      <Search className="search-icon" size={20} />
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Wpisz miasto..."
      />
    </form>
  );
};

const CityTile = ({ city, unit }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getWeatherData(city, unit).then(res => setData(res));
  }, [city, unit]);

  if (!data) return <div className="city-tile loading">Ładowanie...</div>;

  return (
    <Link to={`/details/${city}`} className="city-tile glass-panel">
      <h3>{data.current.name}</h3>
      <img 
        src={`https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`} 
        alt="icon" 
      />
      <div className="tile-temp">
        {Math.round(data.current.main.temp)}°
      </div>
    </Link>
  );
};

const Home = () => {
  const cities = ['Warszawa', 'Kraków', 'Gdańsk', 'Wrocław', 'Poznań', 'Londyn', 'Nowy Jork', 'Tokio'];
  const unit = useSelector(state => state.weather.unit);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (city) => {
    setError(null);
    setIsSearching(true);

    const data = await getWeatherData(city, unit);

    setIsSearching(false);

    if (data) {
      navigate(`/details/${city}`);
    } else {
      setError("Nie znaleziono takiego miasta. Sprawdź pisownię.");
    }
  }, [unit, navigate]);

  return (
    <div className="dashboard-wrapper">
      <div className="top-bar center-bar">
        <h1>Wybierz miasto</h1>
        <div className="unit-toggle" onClick={() => dispatch(toggleUnit())}>
           <span className={unit === 'metric' ? 'active' : ''}>°C</span>
           <span className={unit === 'imperial' ? 'active' : ''}>°F</span>
        </div>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px'}}>
        <SearchBar onSearch={handleSearch} />
        {error && <div className="error-msg">{error}</div>}
        {isSearching && <div className="loading-msg">Sprawdzanie miasta...</div>}
      </div>

      <div className="cities-grid">
        {cities.map(city => (
          <CityTile key={city} city={city} unit={unit} />
        ))}
      </div>

      <div style={{marginTop: '40px', textAlign: 'center'}}>
        <Link to="/favorites" className="btn-link">Twoje ulubione miasta</Link>
      </div>
    </div>
  );
};

const CityDetails = () => {
  const { cityName } = useParams();
  const [weather, setWeather] = useState(null);
  
  const unit = useSelector(state => state.weather.unit);
  const favorites = useSelector(state => state.weather.favorites);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cityName) {
      getWeatherData(cityName, unit).then(data => setWeather(data));
    }
  }, [cityName, unit]);

  const dailyForecast = useMemo(() => {
    if (!weather) return [];
    return weather.forecast.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
  }, [weather]);

  const getWindDirection = (deg) => {
    const directions = ['Północny', 'Północno-Wschodni', 'Wschodni', 'Południowo-Wschodni', 'Południowy', 'Południowo-Zachodni', 'Zachodni', 'Północno-Zachodni'];
    return directions[Math.round(deg / 45) % 8];
  }

  if (!weather) return <div className="loading">Pobieranie danych...</div>;

  const { current } = weather;
  const isFav = favorites.includes(current.name);

  const precipProb = Math.round(weather.forecast.list[0].pop * 100);
  let precipType = 'Brak opadów';
  let precipAmount = 0;

  if (current.rain) {
    precipType = 'Deszcz';
    precipAmount = current.rain['1h'] || 0;
  } else if (current.snow) {
    precipType = 'Śnieg';
    precipAmount = current.snow['1h'] || 0;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="top-bar">
        <Link to="/" className="back-btn"><ArrowLeft /> Wróć do listy</Link>
        
        <div className="top-actions">
           <button className="icon-btn" onClick={() => dispatch(toggleFavorite(current.name))}>
              <Star fill={isFav ? "gold" : "transparent"} color={isFav ? "gold" : "white"} size={28} />
           </button>
           <div className="unit-toggle" onClick={() => dispatch(toggleUnit())}>
              <span className={unit === 'metric' ? 'active' : ''}>°C</span>
              <span className={unit === 'imperial' ? 'active' : ''}>°F</span>
           </div>
        </div>
      </div>

      <div className="main-grid">
        <div className="current-card glass-panel">
          <div className="card-header">
            <h3>Aktualna pogoda</h3>
            <h1>{current.name}</h1>
          </div>
          
          <div className="main-temp-display">
            <img 
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`} 
              alt="icon" 
              className="weather-icon-large"
            />
            <div className="temp-value">
              {Math.round(current.main.temp)}
              <span className="degree">°{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
            <p className="weather-desc">{current.weather[0].description}</p>
          </div>
        </div>

        <div className="right-panel">
          <div className="details-grid">
            
            <div className="detail-item glass-panel">
               <div className="detail-label"><Umbrella size={18}/> Opady ({precipType})</div>
               <div className="detail-value" style={{fontSize: '1.1rem'}}>
                 Szansa: {precipProb}%
               </div>
               <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>
                 Ilość: {precipAmount} mm/m²
               </div>
            </div>

            <div className="detail-item glass-panel">
               <div className="detail-label"><Wind size={18}/> Wiatr</div>
               <div className="detail-value">
                 {current.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}
               </div>
               <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)'}}>
                 Kierunek: {getWindDirection(current.wind.deg)}
               </div>
            </div>
            <div className="detail-item glass-panel">
               <div className="detail-label"><Cloud size={18}/> Zachmurzenie</div>
               <div className="detail-value">{current.clouds.all}%</div>
            </div>
            <div className="detail-item glass-panel">
               <div className="detail-label"><Eye size={18}/> Widoczność</div>
               <div className="detail-value">{(current.visibility / 1000).toFixed(1)} km</div>
            </div>
            <div className="detail-item glass-panel">
               <div className="detail-label"><Gauge size={18}/> Ciśnienie</div>
               <div className="detail-value">{current.main.pressure} hPa</div>
            </div>
            <div className="detail-item glass-panel">
               <div className="detail-label"><Thermometer size={18}/> Odczuwalna</div>
               <div className="detail-value">{Math.round(current.main.feels_like)}°</div>
            </div>
          </div>

          <div className="forecast-section glass-panel">
            <h3>Prognoza 5-dniowa</h3>
            <div className="forecast-row">
              {dailyForecast.map(day => (
                <div key={day.dt} className="forecast-day">
                  <span className="day-name">{new Date(day.dt * 1000).toLocaleDateString('pl-PL', {weekday: 'short'})}</span>
                  <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} alt="icon" />
                  <span className="day-temp">{Math.round(day.main.temp)}°</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FavoritesPage = () => {
  const favorites = useSelector(state => state.weather.favorites);
  const unit = useSelector(state => state.weather.unit);
  
  return (
    <div className="dashboard-wrapper">
      <div className="top-bar">
        <Link to="/" className="back-btn"><ArrowLeft /> Wróć na główną</Link>
      </div>
      <h2>Ulubione miasta</h2>
      {favorites.length === 0 ? <p>Brak ulubionych miast.</p> : (
        <div className="cities-grid">
          {favorites.map(city => (
            <CityTile key={city} city={city} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/details/:cityName" element={<CityDetails />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;