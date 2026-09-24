import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithIntl } from '@src/testUtils';
import StudentGradesPage from './StudentGradesPage';
import messages from './messages';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ courseId: 'test-course-id' }),
}));

// Stub GradebookSlot so the page's onBack wiring is exercised without pulling
// in the actual Slot/widget infrastructure.
jest.mock('@src/slots/GradebookSlot/GradebookSlot', () => {
  const MockGradebookSlot = ({ courseId, onBack }: { courseId: string; onBack: () => void }) => (
    <div data-testid="gradebook-slot" data-course-id={courseId}>
      <button type="button" onClick={onBack}>close-gradebook</button>
    </div>
  );
  return MockGradebookSlot;
});

describe('StudentGradesPage', () => {
  it('renders the summary view with title, view gradebook and download buttons', () => {
    renderWithIntl(<StudentGradesPage />);

    expect(screen.getByText(messages.studentGradesPageTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: messages.downloadStudentGradesTitle.defaultMessage })).toBeInTheDocument();
    expect(screen.getByText(messages.downloadStudentGradesDescription.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.viewGradebookButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.downloadStudentGradesButton.defaultMessage })).toBeInTheDocument();
    expect(screen.queryByTestId('gradebook-slot')).not.toBeInTheDocument();
  });

  it('shows the gradebook slot with the current courseId when View Gradebook is clicked', async () => {
    const user = userEvent.setup();
    renderWithIntl(<StudentGradesPage />);

    await user.click(screen.getByRole('button', { name: messages.viewGradebookButton.defaultMessage }));

    const slot = screen.getByTestId('gradebook-slot');
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveAttribute('data-course-id', 'test-course-id');
    expect(screen.queryByText(messages.studentGradesPageTitle.defaultMessage)).not.toBeInTheDocument();
  });

  it('returns to the summary view when the slot invokes onBack', async () => {
    const user = userEvent.setup();
    renderWithIntl(<StudentGradesPage />);

    await user.click(screen.getByRole('button', { name: messages.viewGradebookButton.defaultMessage }));
    await user.click(screen.getByRole('button', { name: 'close-gradebook' }));

    expect(screen.queryByTestId('gradebook-slot')).not.toBeInTheDocument();
    expect(screen.getByText(messages.studentGradesPageTitle.defaultMessage)).toBeInTheDocument();
  });
});
