import { render, screen } from '@testing-library/react';
import {
  MemoryRouter, Route, Routes, useLocation,
} from 'react-router-dom';
import CcxCourseIdGuard from './CcxCourseIdGuard';
import { useCcxCoachInfo } from './data/apiHook';

jest.mock('./data/apiHook', () => ({
  useCcxCoachInfo: jest.fn(),
}));

const LocationSpy = () => {
  const { pathname, search, hash } = useLocation();
  return <div data-testid="location">{`${pathname}${search}${hash}`}</div>;
};

const renderAt = (initialEntry: string) => (
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationSpy />
      <Routes>
        <Route path="ccx-coach/:courseId" element={<CcxCourseIdGuard />}>
          <Route index element={<div data-testid="tab">index</div>} />
          <Route path=":tabId" element={<div data-testid="tab">tab-content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
);

describe('CcxCourseIdGuard', () => {
  const useCcxCoachInfoMock = useCcxCoachInfo as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the outlet while the metadata query has not resolved', () => {
    useCcxCoachInfoMock.mockReturnValue({ isSuccess: false, data: undefined });

    renderAt('/ccx-coach/course-v1:X+Y+Z/enrollments');

    expect(screen.getByTestId('tab')).toHaveTextContent('tab-content');
    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/course-v1:X+Y+Z/enrollments');
  });

  it('renders the outlet when metadata has no ccxCourseId and the URL is /new', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: { courseId: 'course-v1:X+Y+Z', ccxCourseId: '' },
    });

    renderAt('/ccx-coach/course-v1:X+Y+Z/new');

    expect(screen.getByTestId('tab')).toHaveTextContent('tab-content');
    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/course-v1:X+Y+Z/new');
  });

  it('redirects to /new when metadata has no ccxCourseId and the URL is a different tab', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: { courseId: 'course-v1:X+Y+Z', ccxCourseId: '' },
    });

    renderAt('/ccx-coach/course-v1:X+Y+Z/enrollments?foo=bar#anchor');

    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/course-v1:X+Y+Z/new?foo=bar#anchor');
  });

  it('redirects the index route to /new when metadata has no ccxCourseId', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: { courseId: 'course-v1:X+Y+Z', ccxCourseId: '' },
    });

    renderAt('/ccx-coach/course-v1:X+Y+Z');

    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/course-v1:X+Y+Z/new');
  });

  it('renders the outlet when ccxCourseId matches the URL courseId and the tab is not /new', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: { courseId: 'ccx-v1:X+Y+Z+ccx@1', ccxCourseId: 'ccx-v1:X+Y+Z+ccx@1' },
    });

    renderAt('/ccx-coach/ccx-v1:X+Y+Z+ccx@1/schedule');

    expect(screen.getByTestId('tab')).toHaveTextContent('tab-content');
    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/ccx-v1:X+Y+Z+ccx@1/schedule');
  });

  it('blocks /new even when already on the canonical ccxCourseId URL', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: {
        courseId: 'ccx-v1:X+Y+Z+ccx@1',
        ccxCourseId: 'ccx-v1:X+Y+Z+ccx@1',
        tabs: [
          { tabId: 'enrollments', url: '', title: '', sortOrder: 10 },
          { tabId: 'schedule', url: '', title: '', sortOrder: 20 },
        ],
      },
    });

    renderAt('/ccx-coach/ccx-v1:X+Y+Z+ccx@1/new');

    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/ccx-v1:X+Y+Z+ccx@1/enrollments');
  });

  it('redirects to the ccxCourseId URL preserving the tabId, search and hash', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: { courseId: 'course-v1:X+Y+Z', ccxCourseId: 'ccx-v1:X+Y+Z+ccx@3' },
    });

    renderAt('/ccx-coach/course-v1:X+Y+Z/schedule?foo=bar#anchor');

    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/ccx-v1:X+Y+Z+ccx@3/schedule?foo=bar#anchor');
  });

  it('redirects from /new to the tab with the lowest sortOrder from metadata', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: {
        courseId: 'course-v1:X+Y+Z',
        ccxCourseId: 'ccx-v1:X+Y+Z+ccx@3',
        tabs: [
          { tabId: 'grading_policy', url: '', title: '', sortOrder: 30 },
          { tabId: 'enrollments', url: '', title: '', sortOrder: 10 },
          { tabId: 'schedule', url: '', title: '', sortOrder: 20 },
        ],
      },
    });

    renderAt('/ccx-coach/course-v1:X+Y+Z/new');

    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/ccx-v1:X+Y+Z+ccx@3/enrollments');
  });

  it('redirects the index route to the tab with the lowest sortOrder from metadata', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: {
        courseId: 'course-v1:X+Y+Z',
        ccxCourseId: 'ccx-v1:X+Y+Z+ccx@3',
        tabs: [
          { tabId: 'schedule', url: '', title: '', sortOrder: 20 },
          { tabId: 'enrollments', url: '', title: '', sortOrder: 10 },
        ],
      },
    });

    renderAt('/ccx-coach/course-v1:X+Y+Z');

    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/ccx-v1:X+Y+Z+ccx@3/enrollments');
  });

  it('treats tabs without sortOrder as coming last when picking the fallback', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: {
        courseId: 'course-v1:X+Y+Z',
        ccxCourseId: 'ccx-v1:X+Y+Z+ccx@3',
        tabs: [
          { tabId: 'schedule', url: '', title: '' },
          { tabId: 'grading_policy', url: '', title: '', sortOrder: 5 },
        ],
      },
    });

    renderAt('/ccx-coach/course-v1:X+Y+Z/new');

    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/ccx-v1:X+Y+Z+ccx@3/grading_policy');
  });

  it('does not redirect from /new when metadata has no tabs to fall back to', () => {
    useCcxCoachInfoMock.mockReturnValue({
      isSuccess: true,
      data: {
        courseId: 'course-v1:X+Y+Z',
        ccxCourseId: 'ccx-v1:X+Y+Z+ccx@3',
        tabs: [],
      },
    });

    renderAt('/ccx-coach/course-v1:X+Y+Z/new');

    expect(screen.getByTestId('tab')).toHaveTextContent('tab-content');
    expect(screen.getByTestId('location')).toHaveTextContent('/ccx-coach/course-v1:X+Y+Z/new');
  });
});
