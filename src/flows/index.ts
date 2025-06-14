import { useState, useEffect } from 'react';
import { useConf, printLogs } from '../utils';

export const useFlow = (flowType: string, flowsList: Record<string, string[]>) => {
  const [flow, setFlow] = useState<any>();
  const conf = useConf('flows');

  useEffect(() => {
    if (!flowType || conf === undefined) return;
    const localFlow = flowsList[flowType];
    const customFlow = conf?.[flowType];
    setFlow(customFlow ?? localFlow ?? null);
    if (!customFlow && !localFlow) {
      printLogs(`result flow «${flowType}» does not exist. set default default flow`);
    }
  }, [conf, flowType, flowsList]);

  return flow;
};
