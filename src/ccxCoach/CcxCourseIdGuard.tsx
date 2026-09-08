import {
  Navigate, Outlet, useLocation, useParams,
} from 'react-router-dom';
import type { TabProps } from '@src/instructorNav/InstructorNav';
import { useCcxCoachInfo } from './data/apiHook';

const pickLowestSortOrderTabId = (tabs?: TabProps[]): string | undefined => {
  if (!tabs?.length) return undefined;
  return [...tabs].sort(
    (a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity),
  )[0]?.tabId;
};

// Enforces the canonical ccx-coach URL:
//   - When no ccxCourseId exists, `new` is the only valid tab.
//   - When a ccxCourseId exists, `new` is blocked and the URL must use the
//     canonical ccxCourseId; other tabIds are preserved.
const CcxCourseIdGuard = () => {
  const { courseId = '', tabId } = useParams<{ courseId: string; tabId?: string }>();
  const { search, hash } = useLocation();
  const { data, isSuccess } = useCcxCoachInfo(courseId);

  if (!isSuccess) return <Outlet />;

  const target = data?.ccxCourseId;
  const isNewTab = tabId === 'new';

  if (!target) {
    if (isNewTab) return <Outlet />;
    return <Navigate to={`/ccx-coach/${courseId}/new${search}${hash}`} replace />;
  }

  const urlNeedsCanonicalization = target !== courseId;
  if (!isNewTab && !urlNeedsCanonicalization) return <Outlet />;

  const preservedTab = tabId && !isNewTab ? tabId : undefined;
  const nextTab = preservedTab ?? pickLowestSortOrderTabId(data.tabs);
  if (!nextTab) return <Outlet />;

  return <Navigate to={`/ccx-coach/${target}/${nextTab}${search}${hash}`} replace />;
};

export default CcxCourseIdGuard;
