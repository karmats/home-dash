export enum WeatherSymbol {
  CLEAR_SKY = 'day',
  NEARLY_CLEAR_SKY = 'nearly-clear-sky',
  VARIABLE_CLOUDINESS = 'variable-cloudiness',
  HALFCLEAR_SKY = 'halfclear-sky',
  CLOUDY_SKY = 'cloudy-sky',
  OVERCAST = 'overcast',
  FOG = 'fog',
  LIGHT_RAIN_SHOWERS = 'light-rain-showers',
  MODERATE_RAIN_SHOWERS = 'moderate-rain-showers',
  HEAVY_RAIN_SHOWERS = 'heavy-rain-showers',
  THUNDERSTORM = 'thunderstorm',
  LIGHT_SLEET_SHOWERS = 'light-sleet-showers',
  MODERATE_SLEET_SHOWERS = 'moderate-sleet-showers',
  HEAVY_SLEET_SHOWERS = 'heavy-sleet-showers',
  LIGHT_SNOW_SHOWERS = 'light-snow-showers',
  MODERATE_SNOW_SHOWERS = 'moderate-snow-showers',
  HEAVY_SNOW_SHOWERS = 'heavy-snow-showers',
  LIGHT_RAIN = 'light-rain',
  MODERATE_RAIN = 'moderate-rain',
  HEAVY_RAIN = 'heavy-rain',
  THUNDER = 'thunder',
  LIGHT_SLEET = 'light-sleet',
  MODERATE_SLEET = 'moderate-sleet',
  HEAVY_SLEET = 'heavy-sleet',
  LIGHT_SNOWFALL = 'light-snowfall',
  MODERATE_SNOWFALL = 'moderate-snowfall',
  HEAVY_SNOWFALL = 'snowy-1'
}

export interface Forecast {
  symbol: WeatherSymbol;
  degrees: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  time: Date;
}
