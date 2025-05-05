import { useState, useEffect } from 'react';
import { useConf, printLogs } from '../utils';

export const useFlow = (flowType: string, flowsList: Record<string, string[]>) => {
  const [flow, setFlow] = useState<string[]>();
  const [customFlow, setCustomFlow] = useState<string[]>();
  const conf = useConf('flows');

  useEffect(() => {
    if (!conf || typeof conf === 'object') return;
    setCustomFlow(conf[flowType]);
  }, [conf, flowType]);

  useEffect(() => {
    if (!flowType) return;
    const localFlow = flowsList[flowType];
    setFlow(customFlow ?? localFlow);
    if (!customFlow && !localFlow) {
      printLogs(`result flow «${flowType}» does not exist. set default default flow`);
    }
  }, [customFlow, flowType, flowsList]);

  return flow;
};
