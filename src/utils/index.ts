import { useState, useEffect } from 'react';

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
      [safeDecode(key).replace(/[ +]/g,'_')]: safeDecode(value),
    };
  }, {});
};

export type ConfProps<T = any> = Record<string, T>;

export const printLogs = (...args: any[]) => {
  if (!['stage', 'development', 'dev'].includes(process.env.REACT_APP_ENV)) return;
  console.log(...args);
};

export const useConf = (name: string) => {
  const [conf, setConf] = useState<null | ConfProps<Record<string, number> | string[]>>(null);
  
  useEffect(() => {
    fetch(`./${name}.json`)
      .then((response) => {
        if (!response.ok) throw new Error('failed to load');
        const contentType = response.headers.get('content-type');
        if (
          !contentType ||
          contentType.indexOf('application/json') === -1
        ) {
          throw new Error('not a json');
        }
        return response.json();
      })
      .then((data) => {
        printLogs(`${name}: `, data);
        setConf(data);
      })
      .catch((error) => {
        printLogs('Unable to load the config file', error);
        setConf({});
      })
  }, [name]);
  
  return conf;
};
