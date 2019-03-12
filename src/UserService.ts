import { User } from './models';

const DEFAULT_USER = {
  lat: 57.740614,
  lon: 11.930191
};

export const getUser = async (): Promise<User> => {
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      position =>
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }),
      error => {
        console.error('Failed to get position', error);
        resolve(DEFAULT_USER);
      }
    );
  });
};
