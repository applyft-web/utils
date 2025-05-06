import { useState, useEffect } from 'react';
import { useConf, printLogs } from '../utils';

/**
 * Custom React hook to retrieve and manage a flow configuration based on the flow type.
 *
 * @param {string} flowType - The type of the flow to retrieve.
 * @param {Record<string, string[]>} flowsList - A record of predefined flows, where keys are flow types and values are arrays of flow steps.
 * @returns {any} - The flow configuration, either from the local `flowsList` or the remote configuration.
 */
export const useFlow = (flowType: string, flowsList: Record<string, string[]>) => {
  const [flow, setFlow] = useState<any>();
  const conf = useConf('flows');

  useEffect(() => {
    if (!flowType) return;
    const localFlow = flowsList[flowType];
    const customFlow = conf?.[flowType];
    setFlow(customFlow ?? localFlow);
    if (conf !== undefined && !customFlow && !localFlow) {
      printLogs(`result flow «${flowType}» does not exist. set default default flow`);
    }
  }, [conf, flowType, flowsList]);

  return flow;
};
