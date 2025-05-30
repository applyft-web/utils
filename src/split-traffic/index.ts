import { useState, useEffect } from 'react';
import { queryParser, useConf, printLogs } from '../utils';

export const useLandingType = (landingParam: string, landingTypesList?: string[], defaultFlowName = 'fullPrice') => {
  const defaultValue = landingParam.length > 0 ? landingParam : defaultFlowName;
  const { skip_split } = queryParser(window.location.search);
  const [landingType, setLandingType] = useState<string>('');
  const [paywallType, setPaywallType] = useState<string>('');
  const [flowType, setFlowType] = useState<string>('');
  const conf = useConf('config');

  const getLimits = (arr: number[]) =>
    arr.reduce<{ min: number, max: number }[]>((arr, v) => {
      const prevMax = (arr[arr.length - 1] || { max: null }).max;
      const min = (prevMax || -1) + 1;
      const max = +v + (prevMax || 0);
      return arr.concat([{ min, max }]);
    }, []);

  useEffect(() => {
    if (conf === undefined) return;
    if (conf?.[defaultValue]) {
      const randomVal = Math.round(Math.random() * 100);
      const splittingLanding = conf[defaultValue];
      const limits = getLimits(Object.values(splittingLanding));
      const lt = Object.keys(splittingLanding).find((k, i) => {
        const { min, max } = limits[i];
        return (randomVal >= min && randomVal <= max);
      });
      const ltExist = !!lt && landingTypesList?.includes(`/${lt.split('/')[0]}`);

      printLogs('random value :', randomVal);

      if (lt) {
        const [ft, postfix] = lt.split('/');
        const ltRes = `split_${ft}${postfix ? `_${postfix}` : ''}`;
        const ptRes = landingTypesList && !ltExist ? defaultValue : ft;

        if (landingTypesList && !ltExist) printLogs(`result type: landing type «${ft}» does not exist. but will be used as custom type`);
        printLogs('landing type: ', ltRes);
        printLogs('paywall type: ', ptRes);
        printLogs('flow type: ', ft);

        setLandingType(ltRes);
        setPaywallType(ptRes);
        setFlowType(ft);
      } else {
        printLogs('Oops... Something went wrong. Please check the config file.');
        setLandingType(defaultValue);
        setPaywallType(defaultValue);
        setFlowType(defaultValue);
      }
    } else {
      setLandingType(defaultValue);
      setPaywallType(defaultValue);
      setFlowType(defaultValue);
    }
  }, [defaultValue, conf, landingTypesList]);

  if (skip_split === 'true') {
    return {
      landingType: defaultValue,
      paywallType: defaultValue,
      flowType: defaultValue,
    };
  }

  return { landingType, paywallType, flowType };
};

export const useLandingTypeV2 = (landingParam: string, landingTypesList?: string[]) => {
  return useLandingType(landingParam, landingTypesList, 'default');
};
