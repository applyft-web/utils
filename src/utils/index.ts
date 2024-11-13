const safeDecode = (val: string) => {
  try {
    return decodeURIComponent(val);
  } catch (e) {
    console.error(e);
    console.warn('Failed to decodeURIComponent. This string isn\'t valid: ', val);
    return val;
  }
};

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
