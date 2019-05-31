export enum WeatherSymbol {
  CLEAR_SKY = 'clear-sky',
  CLEAR_SKY_NIGHT = 'clear-sky-night',
  NEARLY_CLEAR_SKY = 'nearly-clear-sky',
  NEARLY_CLEAR_SKY_NIGHT = 'nearly-clear-sky-night',
  HALFCLEAR_SKY = 'halfclear-sky',
  HALFCLEAR_SKY_NIGHT = 'halfclear-sky-night',
  CLOUDY_SKY = 'cloudy-sky',
  CLOUDY_SKY_NIGHT = 'cloudy-sky-night',
  OVERCAST = 'overcast',
  LIGHT_RAIN_SHOWERS = 'light-rain-showers',
  MODERATE_RAIN_SHOWERS = 'moderate-rain-showers',
  HEAVY_RAIN_SHOWERS = 'heavy-rain-showers',
  LIGHT_SNOW_SHOWERS = 'light-snow-showers',
  MODERATE_SNOW_SHOWERS = 'moderate-snow-showers',
  HEAVY_SNOW_SHOWERS = 'heavy-snow-showers',
  LIGHT_RAIN = 'light-rain',
  MODERATE_RAIN = 'moderate-rain',
  HEAVY_RAIN = 'heavy-rain',
  THUNDER = 'thunder',
  LIGHT_SNOWFALL = 'light-snowfall',
  MODERATE_SNOWFALL = 'moderate-snowfall',
  HEAVY_SNOWFALL = 'heavy-snowfall'
}

export interface Forecast {
  symbol: WeatherSymbol;
  degrees: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  time: Date;
}

export interface SunriseSunset {
  sunrise: Date;
  sunset: Date;
}
