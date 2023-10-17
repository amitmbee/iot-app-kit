import { useDispatch, useSelector } from 'react-redux';
import { DashboardState } from '~/store/state';
import { QueryConfigWidget, findModelBasedQueryWidgets } from './dashboardModelBasedQuery';
import { onUpdateWidgetsAction } from '~/store/actions';

export const useModelBasedWidgets = () => {
  const dashboardConfiguration = useSelector((dashboardState: DashboardState) => dashboardState.dashboardConfiguration);
  const widgets = findModelBasedQueryWidgets(dashboardConfiguration);

  const dispatch = useDispatch();

  const update = (widgets: QueryConfigWidget[]) =>
    dispatch(
      onUpdateWidgetsAction({
        widgets,
      })
    );

  return {
    widgets,
    update,
  };
};
