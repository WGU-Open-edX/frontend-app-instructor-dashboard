import { useParams, Navigate } from 'react-router-dom';
import PageNotFound from '@src/components/PageNotFound';
import { useWidgetProps } from './slots/SlotUtils';
import { instructorDashboardRole } from './constants';
import {
  DashboardConfig,
  DashboardConfigProvider,
  DashboardRouteProps,
  useDashboardConfig,
} from './dashboardConfig/DashboardConfigContext';
import { authenticatedLoader } from '@openedx/frontend-base';
import CcxCourseIdGuard from '@src/ccxCoach/CcxCourseIdGuard';

const TabContent = () => {
  const { tabId } = useParams<{ tabId: string }>();
  const { defaultTabs, routesSlotId } = useDashboardConfig();
  const routeWidgets = useWidgetProps(routesSlotId) as DashboardRouteProps[];

  const tabRoutes = [
    ...defaultTabs.filter(
      defaultTab => !routeWidgets.some(slotTab => slotTab.tabId === defaultTab.tabId)
    ),
    ...routeWidgets
  ];

  const foundTab = tabRoutes.find(tab => tab.tabId === tabId);

  return foundTab ? foundTab.content : <PageNotFound />;
};

const DefaultTabRedirect = () => {
  const { defaultLandingTabId } = useDashboardConfig();
  return <Navigate to={defaultLandingTabId} replace />;
};

const buildDashboardComponent = (Main: React.ComponentType, config: DashboardConfig) => {
  const DashboardRoot = () => (
    <DashboardConfigProvider value={config}>
      <Main />
    </DashboardConfigProvider>
  );
  DashboardRoot.displayName = `DashboardRoot(${config.variantId})`;
  return DashboardRoot;
};

type ConfigsModule = typeof import('./dashboardConfig/configs');

const createDashboardRoute = (
  id: string,
  path: string,
  getConfig: (configs: ConfigsModule) => DashboardConfig,
  layoutElement?: React.ReactElement,
) => {
  const tabChildren = [
    { index: true, element: <DefaultTabRedirect /> },
    { path: ':tabId', element: <TabContent /> },
  ];
  return {
    id,
    path,
    loader: authenticatedLoader,
    handle: { roles: [instructorDashboardRole] },
    async lazy() {
      const [{ default: Main }, configs] = await Promise.all([
        import('./Main'),
        import('./dashboardConfig/configs'),
      ]);
      return { Component: buildDashboardComponent(Main, getConfig(configs)) };
    },
    children: layoutElement
      ? [{ element: layoutElement, children: tabChildren }]
      : tabChildren,
  };
};

const routes = [
  createDashboardRoute(
    'org.openedx.frontend.route.instructorDashboard.main',
    'instructor-dashboard/:courseId',
    m => m.instructorDashboardConfig,
  ),
  createDashboardRoute(
    'org.openedx.frontend.route.ccxCoach.main',
    'ccx-coach/:courseId',
    m => m.ccxCoachConfig,
    <CcxCourseIdGuard />,
  ),
];

export default routes;
