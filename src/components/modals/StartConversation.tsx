import { useEffect, useState } from "react";

// PROJECT IMPORTS
import { Select } from "../forms";
import Modal from "./Modal";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/redux/hooks";
import {
  channelList,
  queueList,
  updateChannel,
  useChannelList,
  useQueueList,
} from "@/redux/slice/chatSlice";

interface StartConversationProps {
  id: string;
  visible: boolean;
  onCancleClick: any;
  onDoneClick?: any;
  loading?: boolean;
}

/* ============================== START CONVERSATION MODEL ============================== */

const StartConversation = (props: StartConversationProps) => {
  const { visible = false, onCancleClick, onDoneClick, loading, id } = props;
  const dispatch = useAppDispatch();
  const queueListData = useQueueList();
  const channelListData = useChannelList();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialValues: any = {
    queue: "",
    type: "WhatsApp",
    channel: "",
  };

  const validationSchema = Yup.object<any>({
    queue: Yup.string().required("Please select queue"),
    type: Yup.string(),
    channel: Yup.string().required("Please select channel"),
  });

  useEffect(() => {
    dispatch(queueList()).unwrap();
  }, []);

  // ON SUBMIT START CONVERSATION
  const onSubmit = async (values: any) => {
    setIsLoading(true);
    const data = {
      type: values.type,
      messaging_channel_uuid: values.channel,
    };
    await dispatch(updateChannel(data));
    setIsLoading(false);
    resetForm();
    onDoneClick();
  };

  const {
    values,
    touched,
    errors,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
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
        title="Update Messaging Channel"
        doneText={"Update Channel"}
        onCancleClick={() => {
          onCancleClick();
          resetForm();
        }}
        form={id}
        type="submit"
        contentClassName="max-w-[320px] top-[calc(50%-140px)]"
      >
        <form onSubmit={handleSubmit} id={id}>
          <div className="px-4 py-2">
            <Select
              height="32px"
              label="Select Queue"
              value={values.queue}
              maxMenuHeight={150}
              name="queue"
              placeholder="Select Queue"
              options={queueListData?.length ? queueListData : []}
              onChange={(e: any) => {
                if (e.target.value)
                  dispatch(
                    channelList({ messaging_queue_uuid: e.target.value })
                  ).unwrap();
                setFieldValue("queue", e.target.value);
              }}
              touched={touched}
              errors={errors}
              onBlur={handleBlur}
            />
          </div>
          {/* <div className="px-4 py-2">
            <Select
              height="32px"
              label="Select Platform"
              value={values.platform}
              maxMenuHeight={150}
              name="platform"
              placeholder="Select Platform"
              options={platformOptions}
              onChange={(e: any) => {
                setFieldValue("platform", e.target.value);
              }}
              touched={touched}
              errors={errors}
              onBlur={handleBlur}
            />
          </div> */}
          <div className="px-4">
            <Select
              height="32px"
              label="Select Channel"
              value={values.channel}
              maxMenuHeight={150}
              name="channel"
              placeholder="Select Channel"
              options={channelListData}
              onChange={(e: any) => {
                setFieldValue("channel", e.target.value);
              }}
              touched={touched}
              errors={errors}
              onBlur={handleBlur}
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default StartConversation;
