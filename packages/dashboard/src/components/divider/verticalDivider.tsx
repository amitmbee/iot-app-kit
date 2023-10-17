import React from 'react';

import { colorBorderDividerDefault } from '@cloudscape-design/design-tokens';

import './verticalDivider.css';

export const VerticalDivider = ({ styles }: { styles?: React.CSSProperties }) => (
  <div className='vertical-divider' style={{ backgroundColor: colorBorderDividerDefault, ...styles }}></div>
);
