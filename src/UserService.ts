import { User } from './models';

const USER_KEY = 'homedash_user';

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
        console.log('Setting', userObj);
        localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      },
      error => {
        console.log('Failed to get position', error);
      }
    );
  }
  return userObj || null;
};
