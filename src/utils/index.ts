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
  const envCRA = typeof process !== 'undefined'
    ? process.env.REACT_APP_ENV
    : undefined;

  const envVite = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_ENV || import.meta.env.MODE)
    : undefined;

  const env = envCRA || envVite || process.env.NODE_ENV;
  if (['production'].includes(env!)) return;

  console.log(...args);
}

export const useConf = (name: string) => {
  const [conf, setConf] = useState<ConfProps<Record<string, number> | string[]> | null>();
  
  useEffect(() => {
    fetch(`./${name}.json`)
      .then((response) => {
        if (!response.ok) throw new Error('failed to load');
        const contentType = response.headers.get('content-type');
        if (
          !contentType ||
          contentType.indexOf('application/json') === -1
        ) {
          throw new Error('not found');
        }
        return response.json();
      })
      .then((data) => {
        printLogs(`${name}: `, data);
        setConf(data);
      })
      .catch((error) => {
        printLogs(`Unable to load the «${name}» config file`, error);
        setConf(null);
      })
  }, [name]);
  
  return conf;
};
