import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradebookSlot from './GradebookSlot';
import { studentGradesSlotId } from '@src/constants';

// Encode the props received by Slot into an accessible name so the test can
// assert prop forwarding via getByRole instead of test ids.
jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  Slot: ({ id, courseId, onBack }: { id: string; courseId: string; onBack: () => void }) => (
    <section aria-label={`Slot ${id} for ${courseId}`}>
      <button type="button" onClick={onBack}>Back</button>
    </section>
  ),
}));

describe('GradebookSlot', () => {
  it('forwards courseId and onBack to the student grades Slot', async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    render(<GradebookSlot courseId="test-course-id" onBack={onBack} />);

    const slot = screen.getByRole('region', {
      name: `Slot ${studentGradesSlotId} for test-course-id`,
    });

    await user.click(within(slot).getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
