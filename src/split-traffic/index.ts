import { useState, useEffect } from 'react';

const printLogs = (text: string, data: any) => {
  if (!['stage', 'development', 'dev'].includes(process.env.REACT_APP_ENV)) return;
  console.log(text, data);
}

const useConf = () => {
  const [conf, setConf] = useState(null);

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
        printLogs('conf: ', data);
        setConf(data);
      })
      .catch((error) => {
        printLogs('Unable to load the config file', error);
        setConf({});
      })
  }, []);

  return conf;
};

export const useLandingType = (landingParam: string, landingTypesList: string[]) => {
  const defaultValue = landingParam.length ? landingParam : 'fullPrice';
  const [landingType, setLandingType] = useState(null);
  const [paywallType, setPaywallType] = useState(null);
  const conf = useConf();

  const getLimits = (arr: string[]) =>
    arr.reduce((arr, v) => {
      const prevMax = (arr[arr.length - 1] || [{ max: null }]).max;
      const min = (prevMax || -1) + 1;
      const max = +v + (prevMax || 0);
      return [].concat(arr, [{ min, max }]);
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

      printLogs('random value :', randomVal);
      printLogs('result type: ', lt || `landing type does not exist. set default value: ${defaultValue}`);

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
  }, [defaultValue, conf]);

  return { landingType, paywallType };
};
