import { User } from './models';

const USER_KEY = 'homedash_user';
const DEFAULT_USER = {
  lat: 57.740614,
  lon: 11.930191
};

export const getUser = (): User | null => {
  const userString = localStorage.getItem(USER_KEY);
  let userObj;
  if (userString) {
    userObj = JSON.parse(userString);
  } else {
    navigator.geolocation.getCurrentPosition(
      position => {
        userObj = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      },
      error => {
        console.log('Failed to get position', error);
        userObj = DEFAULT_USER;
        localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_USER));
      }
    );
  }
  return userObj || null;
};
