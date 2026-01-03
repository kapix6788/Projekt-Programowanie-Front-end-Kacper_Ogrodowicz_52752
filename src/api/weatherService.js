import axios from 'axios';
const API_KEY = '368cef12d142b79c244941848a9b02b6'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherData = async (city, unit) => {
  try {
    const weatherReq = axios.get(`${BASE_URL}/weather`, {
      params: { q: city, units: unit, appid: API_KEY, lang: 'pl' }
    });
    
    const forecastReq = axios.get(`${BASE_URL}/forecast`, {
      params: { q: city, units: unit, appid: API_KEY, lang: 'pl' }
    });

    const [weatherResp, forecastResp] = await Promise.all([weatherReq, forecastReq]);
    return {
      current: weatherResp.data,
      forecast: forecastResp.data
    };
  } catch (error) {
    console.error("Błąd pobierania danych:", error);
    return null;
  }
};