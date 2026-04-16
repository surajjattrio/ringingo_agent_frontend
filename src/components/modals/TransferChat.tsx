import { useState } from "react";

// PROJECT IMPORTS
import { Select } from "../forms";
import Modal from "./Modal";
import { useAppDispatch } from "@/redux/hooks";
import { transferChat, useActiveConversation } from "@/redux/slice/chatSlice";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";
import { getMessageFromNumber } from "../helperFunctions";

interface TransferChatProps {
  visible: boolean;
  onCancleClick: any;
  onDoneClick?: any;
  loading?: boolean;
  extensionList: Array<any>;
}

/* ============================== TRANSFER CHAT MODEL ============================== */

const TransferChat = (props: TransferChatProps) => {
  const { visible = false, onCancleClick, onDoneClick, loading, extensionList = [] } = props;
  const dispatch = useAppDispatch();
  const activeConversation = useActiveConversation();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialValues: any = {
    user_uuid: "",
  };

  const validationSchema = Yup.object<any>({
    user_uuid: Yup.string().required("Please select agent"),
  });

  // ON SUBMIT TRANSFER CHAT
  const onSubmit = async (values: any) => {
    setIsLoading(true);
    const data = {
      phone_number_id: activeConversation?.phone_number_id,
      from_number: activeConversation?.[getMessageFromNumber(activeConversation)],
      user_uuid:values.user_uuid
    };
    await dispatch(transferChat(data)).unwrap();
    setIsLoading(false);
    resetForm();
    onDoneClick();
  };

  const {
    values,
    touched,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
    setValues,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return (
    <>
      <Modal
        isLoading={isLoading}
        visible={visible}
        title="Transfer Chat"
        doneText={"Transfer"}
        onCancleClick={() => {
          onCancleClick();
          resetForm();
        }}
        form="transferChat"
        type="submit"
        contentClassName="max-w-[280px] top-[calc(50%-88px)]"
      >
        <form onSubmit={handleSubmit} id="transferChat">
          <div className="px-4">
            <div className="px-4">
              <Select
                height="32px"
                label="Select Agent"
                value={values.user_uuid}
                maxMenuHeight={150}
                name="user_uuid"
                placeholder="Select agent"
                options={extensionList}
                onChange={(e: any) => {
                  setFieldValue("user_uuid", e.target.value);
                }}
                touched={touched}
                errors={errors}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TransferChat;
