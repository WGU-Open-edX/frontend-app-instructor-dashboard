import { useState } from 'react';
import { useIntl } from '@openedx/frontend-base';
import { Button, FormControl, FormGroup, FormLabel, Stack } from '@openedx/paragon';
import { useDebouncedFilter } from '@src/hooks/useDebouncedFilter';
import messages from './messages';
import { useCreateCcxCoachCourse } from '@src/ccxCoach/data/apiHook';
import { useNavigate, useParams } from 'react-router';
import { useAlert } from '@src/providers/AlertProvider';
import { isAxiosError } from 'axios';

const NewCCXCourse = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { courseId = '' } = useParams<{ courseId: string }>();
  const [newCCXCourseName, setNewCCXCourseName] = useState('');
  const { inputValue, handleChange } = useDebouncedFilter({
    filterValue: newCCXCourseName,
    setFilter: setNewCCXCourseName,
  });
  const { mutate: createCCXCourse } = useCreateCcxCoachCourse(courseId);
  const { showModal } = useAlert();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.target.value);
  };

  const handleNewCCXCourse = () => {
    createCCXCourse(inputValue, {
      onSuccess: (data) => {
        navigate(`/ccx-coach/${data.ccxCourseId}/enrollments`);
      },
      onError: (error) => {
        const errorMessage = (isAxiosError(error) && error?.response?.data?.message) || intl.formatMessage(messages.createError);
        showModal({
          confirmText: intl.formatMessage(messages.closeButton),
          message: errorMessage,
          variant: 'danger',
        });
      },
    });
  };

  return (
    <FormGroup className="pt-2 col-12 col-md-7" size="sm">
      <FormLabel className="text-primary-500">{intl.formatMessage(messages.newCCXCourseLabel)}</FormLabel>
      <Stack direction="horizontal" gap={2} className="align-items-center">
        <FormControl
          name="newCCXCourse"
          placeholder={intl.formatMessage(messages.newCCXCoursePlaceholder)}
          size="md"
          value={inputValue}
          onChange={handleInputChange}
        />
        <Button disabled={!inputValue} onClick={handleNewCCXCourse}>{intl.formatMessage(messages.createCCXCourseButton)}</Button>
      </Stack>
    </FormGroup>
  );
};

export default NewCCXCourse;
