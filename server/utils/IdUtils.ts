export const guid = () => {
  const randomId = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  //return id of format 'xxxxxxx'-'xxxx'-'xxxx'-'xxxx'-'xxxxxxxxxxxx'
  return (
    randomId() +
    randomId() +
    '-' +
    randomId() +
    '-' +
    randomId() +
    '-' +
    randomId() +
    '-' +
    randomId() +
    randomId() +
    randomId()
  );
};
