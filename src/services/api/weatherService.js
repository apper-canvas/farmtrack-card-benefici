// Mock weather data - no database table available
const mockWeatherData = {
  current: {
    temperature: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    visibility: 10,
  },
  forecast: [
    { Id: 1, date: new Date().toISOString(), condition: "Sunny", high: 78, low: 58, precipitation: 10 },
    { Id: 2, date: new Date(Date.now() + 86400000).toISOString(), condition: "Cloudy", high: 74, low: 55, precipitation: 30 },
    { Id: 3, date: new Date(Date.now() + 172800000).toISOString(), condition: "Rain", high: 68, low: 52, precipitation: 80 },
    { Id: 4, date: new Date(Date.now() + 259200000).toISOString(), condition: "Sunny", high: 75, low: 56, precipitation: 5 },
    { Id: 5, date: new Date(Date.now() + 345600000).toISOString(), condition: "Partly Cloudy", high: 73, low: 57, precipitation: 20 },
  ],
  alerts: [
    { Id: 1, title: "Heat Advisory", description: "High temperatures expected", validUntil: new Date(Date.now() + 86400000).toISOString() }
  ]
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const weatherService = {
  async getCurrentWeather() {
    await delay(400);
    return { ...mockWeatherData.current };
  },

  async getForecast() {
    await delay(500);
    return [...mockWeatherData.forecast];
  },

  async getWeatherAlerts() {
    await delay(300);
    return [...mockWeatherData.alerts];
  },
};