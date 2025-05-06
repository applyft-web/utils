import { useState, useEffect } from 'react';

/**
 * Safely decodes a URI component.
 * If decoding fails, logs an error and returns the original string.
 *
 * @param {string} val - The string to decode.
 * @returns {string} - The decoded string or the original string if decoding fails.
 */
const safeDecode = (val: string) => {
  try {
    return decodeURIComponent(val);
  } catch (e) {
    console.error(e);
    console.warn('Failed to decodeURIComponent. This string isn\'t valid: ', val);
    return val;
  }
};

/**
 * Parses a query string into an object.
 * Converts keys and values using `safeDecode` and replaces spaces with underscores in keys.
 *
 * @param {string} str - The query string to parse (e.g., "?key=value").
 * @returns {{[key: string]: string}} - An object representing the parsed query parameters.
 */
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

/**
 * Logs messages to the console in specific environments.
 * Only logs if the environment is 'stage', 'development', or 'dev'.
 *
 * @param {...any[]} args - The messages or data to log.
 */
export const printLogs = (...args: any[]) => {
  if (!['stage', 'development', 'dev'].includes(process.env.REACT_APP_ENV)) return;
  console.log(...args);
};

/**
 * A custom React hook to fetch and manage configuration data from a JSON file.
 *
 * @param {string} name - The name of the configuration file (without extension).
 * @returns {ConfProps<Record<string, number> | string[]> | null} - The configuration data or null if loading fails.
 */
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
          throw new Error('not a json');
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
