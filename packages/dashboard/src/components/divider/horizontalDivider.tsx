import React from 'react';

import { colorBorderDividerDefault } from '@cloudscape-design/design-tokens';

import './horizontalDivider.css';

export const HorizontalDivider = ({ styles }: { styles?: React.CSSProperties }) => (
  <div className='horizontal-divider' style={{ backgroundColor: colorBorderDividerDefault, ...styles }}></div>
);
