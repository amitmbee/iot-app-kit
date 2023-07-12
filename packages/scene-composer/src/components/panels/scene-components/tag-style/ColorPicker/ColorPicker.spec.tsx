import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import wrapper from '@awsui/components-react/test-utils/dom';

import { ColorPicker } from './ColorPicker';

jest.mock('@awsui/components-react', () => ({
  ...jest.requireActual('@awsui/components-react'),
}));

describe('ColorPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onSelectColor when color is selected', () => {
    const onSelectColorMock = jest.fn();
    render(<ColorPicker color='#FFFFFF' onSelectColor={onSelectColorMock} label='Colors' />);
    const colorElement = screen.getByTestId('color-preview');
    fireEvent.click(colorElement);
    fireEvent.click(screen.getAllByTitle('#000000')[0]);
    expect(onSelectColorMock).toHaveBeenCalledWith('#000000');
  });

  it('calls handleHexCodeChange when hex code is entered', async () => {
    const onSelectColorMock1 = jest.fn();
    const { container } = render(<ColorPicker color='#FFFFFF' onSelectColor={onSelectColorMock1} label='Colors' />);
    const polarisWrapper = wrapper(container);
    const input = polarisWrapper.findInput();
    expect(input).toBeDefined();

    const newColor = '#FF0000';
    act(() => {
      input?.setInputValue(newColor);
    });
    // Assert that onSelectColor is called with the entered hex code
    expect(onSelectColorMock1).toHaveBeenCalledWith('#FF0000');
  });
});
