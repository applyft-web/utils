export const queryParser = (str: string): {[key: string]: string} => {
  const cutStr = str.slice(1);
  const coupleStr = cutStr.split('&').map(item => item.split('='));

  return coupleStr.reduce((acc, [key, value]) => {
    return {
      ...acc,
      [decodeURIComponent(key).replace(/[ +]/g,'_')]: decodeURIComponent(value),
    };
  }, {});
};
