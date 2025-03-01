import wrapper from '@awsui/components-react/test-utils/dom';
import { act, render } from '@testing-library/react';
import React from 'react';

import { useStore } from '../../../store';
import { KnownSceneProperty } from '../../../interfaces';

import { FogSettingsEditor } from './FogSettingsEditor';

jest.mock('@awsui/components-react', () => ({
  ...jest.requireActual('@awsui/components-react'),
}));

describe('FogSettingsEditor', () => {
  const setScenePropertyMock = jest.fn();
  const getScenePropertyMock = jest.fn();
  const baseState = {
    setSceneProperty: setScenePropertyMock,
    getSceneProperty: getScenePropertyMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should save fogsettings when checked', async () => {
    getScenePropertyMock.mockReturnValue(undefined);
    useStore('default').setState(baseState);
    const { container } = render(<FogSettingsEditor />);
    const polarisWrapper = wrapper(container);
    const checkbox = polarisWrapper.findCheckbox();

    expect(checkbox).toBeDefined();

    // click checkbox should update store
    act(() => {
      checkbox?.findNativeInput().click();
    });
    expect(setScenePropertyMock).toBeCalledTimes(1);
    expect(setScenePropertyMock).toBeCalledWith(KnownSceneProperty.FogSettings, {
      color: '#cccccc',
      near: 1,
      far: 1000,
    });
  });

  it('should clear fogsettings when unchecked', async () => {
    getScenePropertyMock.mockReturnValue({
      color: '#cccccc',
      near: 1,
      far: 1000,
    });
    useStore('default').setState(baseState);
    const { container } = render(<FogSettingsEditor />);
    const polarisWrapper = wrapper(container);
    const checkbox = polarisWrapper.findCheckbox();

    expect(checkbox).toBeDefined();

    // click checkbox should update store
    act(() => {
      checkbox?.findNativeInput().click();
    });
    expect(setScenePropertyMock).toBeCalledTimes(1);
    expect(setScenePropertyMock).toBeCalledWith(KnownSceneProperty.FogSettings, undefined);
  });

  it('should update fog when near changes', async () => {
    getScenePropertyMock.mockReturnValue({
      color: '#cccccc',
      near: 1,
      far: 1000,
    });
    useStore('default').setState(baseState);
    const { container } = render(<FogSettingsEditor />);
    const polarisWrapper = wrapper(container);
    const nearInput = polarisWrapper.findInput('[data-testid="fog-near-input"]');

    expect(nearInput).toBeDefined();

    nearInput!.focus();
    nearInput!.setInputValue('2');
    nearInput!.blur();

    expect(setScenePropertyMock).toBeCalledTimes(1);
    expect(setScenePropertyMock).toBeCalledWith(KnownSceneProperty.FogSettings, {
      color: '#cccccc',
      near: 2,
      far: 1000,
    });
  });

  it('should update fog when far changes', async () => {
    getScenePropertyMock.mockReturnValue({
      color: '#cccccc',
      near: 1,
      far: 1000,
    });
    useStore('default').setState(baseState);
    const { container } = render(<FogSettingsEditor />);
    const polarisWrapper = wrapper(container);
    const farInput = polarisWrapper.findInput('[data-testid="fog-far-input"]');

    expect(farInput).toBeDefined();

    farInput!.focus();
    farInput!.setInputValue('2000');
    farInput!.blur();
    expect(setScenePropertyMock).toBeCalledTimes(1);
    expect(setScenePropertyMock).toBeCalledWith(KnownSceneProperty.FogSettings, {
      color: '#cccccc',
      near: 1,
      far: 2000,
    });
  });

  it('should update fog when colors changes', async () => {
    getScenePropertyMock.mockImplementation((property: string) => {
      if (property === KnownSceneProperty.FogSettings) {
        return {
          color: '#cccccc',
          near: 1,
          far: 1000,
        };
      } else if (property === KnownSceneProperty.TagCustomColors) {
        const customColors: string[] = [];
        return customColors;
      }
    });
    useStore('default').setState(baseState);
    const { container } = render(<FogSettingsEditor />);
    const polarisWrapper = wrapper(container);
    const colorInput = polarisWrapper.findInput('[data-testid="hexcode"]');

    expect(colorInput).toBeDefined();

    // click checkbox should update store
    colorInput!.focus();
    colorInput!.setInputValue('#FFFFFF');
    colorInput!.blur();
    expect(setScenePropertyMock).toBeCalledTimes(2);
    expect(setScenePropertyMock).toBeCalledWith(KnownSceneProperty.FogSettings, {
      color: '#FFFFFF',
      near: 1,
      far: 1000,
    });
  });
});
