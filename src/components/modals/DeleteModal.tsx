// PROJECT IMPORTS
import ConfirmationModal from "./ConfirmationModal";

// TYPES
interface DeleteProps {
  visible: boolean;
  isLoading?: boolean;
  onCancleClick?: any;
  onDoneClick?: any;
}

/* ============================== DELETE MODEL ============================== */

const DeleteModal = (props: DeleteProps) => {
  const {
    visible = false,
    isLoading = false,
    onCancleClick,
    onDoneClick,
  } = props;

  return (
    <>
      <ConfirmationModal
        isLoading={isLoading}
        visible={visible}
        title="Delete Entry"
        content="Are you sure you want to delete selected entry?"
        doneStyle="error"
        doneText="Delete"
        onCancleClick={onCancleClick}
        onDoneClick={onDoneClick}
      />
    </>
  );
};

export default DeleteModal;
