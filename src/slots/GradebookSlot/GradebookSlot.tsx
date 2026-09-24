import { Slot } from '@openedx/frontend-base';
import { studentGradesSlotId } from '@src/constants';

const GradebookSlot = ({ courseId, onBack }: { courseId: string; onBack: () => void }) => {
  return (
    <Slot id={studentGradesSlotId} courseId={courseId} onBack={onBack} />
  );
};

export default GradebookSlot;
