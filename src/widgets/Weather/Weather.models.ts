export enum WeatherType {
  SUNNY = 'day',
  SNOWY = 'snowy-1'
}

export enum WindDirection {
  N,
  NE,
  E,
  SE,
  S,
  SW,
  W,
  NW
}

export interface WeatherData {
  type: WeatherType;
  degrees: number;
  precipitation: number;
  windSpeed: number;
  windDirection: WindDirection;
  time: Date;
}
