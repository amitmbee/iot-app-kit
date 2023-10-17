import { StateCreator } from 'zustand/esm';

export type Flags = 'useEcharts' | 'useModelBasedQuery';
export interface ConfigState {
  config: Record<Flags, boolean>;
}
export const createConfigSlice: StateCreator<ConfigState> = () => ({
  config: {
    useEcharts: !!localStorage?.getItem('USE_ECHARTS'),
    useModelBasedQuery: !!localStorage?.getItem('USE_MODEL_BASED_QUERY'),
  },
});
