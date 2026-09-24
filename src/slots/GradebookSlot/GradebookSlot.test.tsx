import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import GradebookSlot from './GradebookSlot';
import { studentGradesSlotId } from '@src/constants';

// Capture the props the underlying Slot receives so we can assert forwarding.
jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  Slot: ({ id, courseId, onBack }: { id: string; courseId: string; onBack: () => void }) => (
    <div data-testid="slot" data-id={id} data-course-id={courseId} onClick={onBack} />
  ),
}));

describe('GradebookSlot', () => {
  it('forwards courseId and onBack to the student grades Slot', () => {
    const onBack = jest.fn();
    render(<GradebookSlot courseId="test-course-id" onBack={onBack} />);

    const slot = screen.getByTestId('slot');
    expect(slot).toHaveAttribute('data-id', studentGradesSlotId);
    expect(slot).toHaveAttribute('data-course-id', 'test-course-id');

    slot.click();
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
