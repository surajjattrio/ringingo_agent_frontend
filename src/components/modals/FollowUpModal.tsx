import { useEffect, useState } from "react";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { addFollowUp, editFollowUp } from "@/redux/slice/followUpSlice";
import { Success } from "@/redux/services/toasterService";
import { useAddLeadNoteId } from "@/redux/slice/commonSlice";
import { useLeadUuid } from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { followUpTypeOptions } from "@/config/options";
import { useAuth } from "@/contexts/hooks/useAuth";
import { Select, Textarea, CheckBox } from "../forms";
import { DatePicker } from "../pickers";
import Modal from "./Modal";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import { format } from "date-fns";
import * as Yup from "yup";

// TYPES
import { followUpTypes } from "@/types/followUpTypes";

interface FollowUpModalProps {
  visible: boolean;
  onCancleClick: any;
  data?: any;
  isEditId?: string | null;
  onDoneClick?: any;
  fromCallCenter?: boolean;
  onSetReadedFollowUp?: any;
  loading?: boolean;
}

/* ============================== FOLLOW UP MODEL ============================== */

const FollowUpModal = (props: FollowUpModalProps) => {
  const {
    visible = false,
    onCancleClick,
    data,
    isEditId = null,
    onDoneClick,
    fromCallCenter = false,
    onSetReadedFollowUp,
    loading,
  } = props;

  const dispatch = useAppDispatch();
  const addLeadNoteId = useAddLeadNoteId();
  const leadUuid = useLeadUuid();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isEditId) {
      setValues({
        ...values,
        lead_management_uuid: data?.lead_management_uuid
          ? data?.lead_management_uuid
          : "",
        user_uuid: data?.user_uuid ? data?.user_uuid : "",
        type: data?.type ? data?.type : "",
        date_time: data?.date_time ? new Date(data?.date_time) : "",
        comment: data?.comment ? data?.comment : "",
        is_reschedule: "1",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditId]);

  const initialValues: followUpTypes = {
    lead_management_uuid: "",
    user_uuid: "",
    type: "",
    date_time: "",
    comment: "",
    is_reschedule: "1",
  };

  const validationSchema = Yup.object<followUpTypes>({
    type: Yup.string().required("Please select type"),
    date_time: Yup.string().required("Please select date & Time"),
    comment: Yup.string().required("Please add some comment"),
  });

  // ON SUBMIT PROFILE DETAILS
  const onSubmit = async (values: any) => {
    setIsLoading(true);
    if (isEditId) {
      try {
        let payload = { ...values };
        payload["lead_management_uuid"] = data?.lead_management_uuid;
        payload["user_uuid"] = data?.user_uuid;
        payload["date_time"] = format(
          new Date(values?.date_time),
          "yyyy-MM-dd HH:mm:ss"
        );
        payload["id"] = isEditId;
        const res: any = await dispatch(editFollowUp(payload)).unwrap();
        if (res && res.statusCode === 200) {
          setIsLoading(false);
          Success(res.data);
          onDoneClick();
          onCancleClick();
          resetForm();
        }
      } catch (error: any) {
        setIsLoading(false);
        console.log("Create follow up err--->", error?.message);
      }
    } else {
      try {
        let payload = { ...values };
        payload["lead_management_uuid"] = data?.lead_management_uuid
          ? data?.lead_management_uuid
          : fromCallCenter
          ? addLeadNoteId
            ? addLeadNoteId
            : leadUuid
          : "";
        payload["user_uuid"] = data?.user_uuid
          ? data?.user_uuid
          : fromCallCenter
          ? user?.agent_detail?.uuid
          : "";
        payload["date_time"] = format(
          new Date(values?.date_time),
          "yyyy-MM-dd HH:mm:ss"
        );
        const res: any = await dispatch(addFollowUp(payload)).unwrap();
        if (res && res.statusCode === 201) {
          setIsLoading(false);
          Success(res.data);
          onCancleClick();
          resetForm();
        }
      } catch (error: any) {
        setIsLoading(false);
        console.log("Create follow up err--->", error?.message);
      }
    }
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

  //EXTRA BUTTON IN MODAL
  const extraButton = {
    flag: true,
    buttonText: "Complete",
    style: "primary-green",
    onClick: onSetReadedFollowUp,
    form: "",
    loading,
  };

  return (
    <>
      <Modal
        isLoading={isLoading}
        visible={visible}
        title="Follow Up"
        doneText={isEditId ? "Save Changes" : "Save"}
        onDoneClick={handleSubmit}
        onCancleClick={() => {
          onCancleClick();
          resetForm();
        }}
        form="followUp"
        type="submit"
        extraButton={extraButton}
      >
        <form onSubmit={handleSubmit} id="followUp">
          <div className="grid grid-cols-2 gap-4 px-4 mt-[25px]">
            <div className="">
              <DatePicker
                name="date_time"
                label={
                  <>
                    Date & Time<span className="text-red-500">*</span>
                  </>
                }
                // placeholder="Select date and time"
                dateFormat="yyyy-MM-dd HH:mm:ss"
                value={values.date_time}
                onChange={(e: any) => {
                  setFieldValue("date_time", e);
                }}
                showTimeSelect
                touched={touched}
                errors={errors}
                timeIntervals={15}
              />
            </div>
            <div className="">
              <Select
                isInfo={false}
                // height="32px"
                label={
                  <>
                    Select Types <span className="text-red-500">*</span>
                  </>
                }
                value={values.type}
                maxMenuHeight={150}
                name="type"
                // placeholder="Select types"
                options={followUpTypeOptions}
                onChange={(e: any) => {
                  setFieldValue("type", e.target.value);
                }}
                touched={touched}
                errors={errors}
                onBlur={handleBlur}
              />
            </div>
            <div className="col-span-2">
              <Textarea
                isInfo={false}
                icon="textarea"
                label={
                  <>
                    Type Your Comment <span className="text-red-500">*</span>
                  </>
                }
                name="comment"
                // placeholder="Message..."
                value={values.comment}
                onChange={handleChange}
                touched={touched}
                errors={errors}
                onBlur={handleBlur}
              />
            </div>
            <div className="">
              <CheckBox
                label="Re-schedule"
                onChange={() =>
                  setFieldValue(
                    "is_reschedule",
                    values?.is_reschedule === "0" ? "1" : "0"
                  )
                }
                name="is_reschedule"
                checked={values?.is_reschedule === "0"}
              />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default FollowUpModal;
