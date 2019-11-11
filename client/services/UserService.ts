import { Location } from '../models';

const DEFAULT_LOCATION = {
  lat: 57.740614,
  lon: 11.930191
};

const getLocation = async (): Promise<Location> => {
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      position =>
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }),
      error => {
        console.error('Failed to get position', error);
        resolve(DEFAULT_LOCATION);
      }
    );
  });
};

export default { getLocation }
