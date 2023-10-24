import React, { FC, useMemo } from 'react';
import { LineChart as LineChartAppKit, WebglContext } from '@iot-app-kit/react-components';
//import '@iot-app-kit/react-components/styles.css';

import { dataSource } from '../dataSource';
import { sceneId, componentTypeQueries, entityQueries, dataBindingTemplate } from '../configs';

import './LineChart.scss';

interface LineChartProps {
  entityId: string,
}

const LineChart: FC<LineChartProps> = ({ entityId }) => {
  const queries = useMemo(() =>{
    const entityQuery = {
      entityId: 'Mixer_0_cd81d9fd-3f74-437a-802b-9747ff240837', //entityId,
      componentName: 'MixerComponent',
      properties: [{ propertyName: 'RPM' }],
    }
    return [dataSource.query.timeSeriesData(entityQuery)];
  }, [entityId, dataSource]);

  return (
    <div className='LineChart'>
      <LineChartAppKit queries={queries} viewport={{duration: '1d'}} yMin={0} axis={{yAxisLabel: 'RPM'}}/>
      <WebglContext />
    </div>
  )
};

export default LineChart;