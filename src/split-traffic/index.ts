import { useState, useEffect } from 'react';

interface ConfProps {
  [key: string]: {
    [key: string]: number;
  };
}

const printLogs = (...args: any[]) => {
  if (!['stage', 'development', 'dev'].includes(process.env.REACT_APP_ENV)) return;
  console.log(...args);
}

const useConf = () => {
  const [conf, setConf] = useState<null | ConfProps>(null);

  useEffect(() => {
    fetch('./config.json')
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
        console.log('conf: ', data);
        setConf(data);
      })
      .catch((error) => {
        console.log('Unable to load the config file', error);
        setConf({});
      })
  }, []);

  return conf;
};

export const useLandingType = (landingParam: string, landingTypesList: string[]) => {
  const defaultValue = landingParam.length ? landingParam : 'fullPrice';
  const [landingType, setLandingType] = useState<null | string>(null);
  const [paywallType, setPaywallType] = useState<null | string>(null);
  const conf = useConf();

  const getLimits = (arr: number[]) =>
    arr.reduce<{ min: number, max: number }[]>((arr, v) => {
      const prevMax = (arr[arr.length - 1] || { max: null }).max;
      const min = (prevMax || -1) + 1;
      const max = +v + (prevMax || 0);
      return arr.concat([{ min, max }]);
    }, []);

  useEffect(() => {
    if (!conf) return;
    if (conf[defaultValue]) {
      const randomVal = Math.round(Math.random() * 100);
      const splittingLanding = conf[defaultValue];
      const limits = getLimits(Object.values(splittingLanding));
      const lt = Object.keys(splittingLanding).find((k, i) => {
        const { min, max } = limits[i];
        return (
          landingTypesList.includes(`/${k}`) &&
          randomVal >= min &&
          randomVal <= max
        );
      });

      console.log('random value :', randomVal);
      console.log('result type: ', lt || `landing type does not exist. set default value: ${defaultValue}`);

      if (lt) {
        setLandingType(`split_${lt}`);
        setPaywallType(lt);
      } else {
        setLandingType(defaultValue);
        setPaywallType(defaultValue);
      }
    } else {
      setLandingType(defaultValue);
      setPaywallType(defaultValue);
    }
  }, [defaultValue, conf, landingTypesList]);

  return {landingType, paywallType};
};
