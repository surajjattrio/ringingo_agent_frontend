import Image from "next/image";
import { useState } from "react";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { addFollowUp } from "@/redux/slice/followUpSlice";
import { Success } from "@/redux/services/toasterService";
import { Button, Select, Textarea } from "@/components/forms";
import { DatePicker } from "@/components/pickers";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";

// ASSETS
const backIcon = "/assets/icons/back-icon.svg";

// TYPES
import { followUpTypes } from "@/types/followUpTypes";
import { format } from "date-fns";
import { followUpTypeOptions } from "@/config/options";
import { useAuth } from "@/contexts/hooks/useAuth";

interface FollowUpProps {
  isFollowUpData: any;
  setIsFollowUpData: any;
}

/* ============================== FOLLOW UP MODEL ============================== */

const FollowUp = (props: FollowUpProps) => {
  const { isFollowUpData, setIsFollowUpData } = props;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const initialValues: followUpTypes = {
    lead_management_uuid: "",
    user_uuid: "",
    type: "",
    date_time: "",
    comment: "",
    is_reschedule: "",
  };

  const validationSchema = Yup.object<followUpTypes>({
    type: Yup.string().required("Please select type"),
    date_time: Yup.string().required("Please select date & Time"),
    comment: Yup.string().required("Please add some comment"),
  });

  // ON SUBMIT PROFILE DETAILS
  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      let payload = { ...values };
      payload["lead_management_uuid"] = isFollowUpData?.lead_management_uuid;
      payload["user_uuid"] = isFollowUpData?.user_uuid;
      payload["date_time"] = format(
        new Date(values?.date_time),
        "yyyy-MM-dd HH:mm:ss"
      );
      const res: any = await dispatch(addFollowUp(payload)).unwrap();
      if (res && res.statusCode === 201) {
        setIsLoading(false);
        Success(res.data);
        setIsFollowUpData("");
        resetForm();
      }
    } catch (error: any) {
      setIsLoading(false);
      console.log("Create follow up err--->", error?.message);
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
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return (
    <>
      <div className="w-full">
        <div className="rounded-lg drop-shadow-lg">
          <div className="bg-layout 3xl:px-4 3xl:py-3 px-4 py-2 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Image
                className="cursor-pointer"
                src={backIcon}
                alt="back"
                width={18}
                height={18}
                onClick={() => {
                  setIsFollowUpData("");
                  resetForm();
                }}
              />
              <span className="3xl:text-sm text-xs text-heading  font-bold">
                Follow Up
              </span>
            </div>
          </div>
          <div className="pt-2 bg-white rounded-b-lg">
            <div
              className={`${
                user?.isPbx
                  ? "min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)]"
                  : "min-h-[calc(100vh-162px)] 3xl:min-h-[calc(100vh-172px)]"
              }`}
            >
              <form
                onSubmit={handleSubmit}
                className={`${
                  user?.isPbx
                    ? "min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)]"
                    : "min-h-[calc(100vh-162px)] 3xl:min-h-[calc(100vh-172px)]"
                } flex justify-between flex-col`}
              >
                <div className="grid grid-cols-2 items-center gap-4 pt-3">
                  <div className="col-span-2 px-4">
                    <Textarea
                      label="Type your Comment"
                      name="comment"
                      placeholder="Type your comment here..."
                      value={values.comment}
                      onChange={handleChange}
                      touched={touched}
                      errors={errors}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className="px-4">
                    <Select
                      height="32px"
                      label="Types"
                      value={values.type}
                      maxMenuHeight={150}
                      name="type"
                      placeholder="Select types"
                      options={followUpTypeOptions}
                      onChange={(e: any) => {
                        setFieldValue("type", e.target.value);
                      }}
                      touched={touched}
                      errors={errors}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className="px-4">
                    <DatePicker
                      timeIntervals={15}
                      name="date_time"
                      label="Date & Time"
                      placeholder="Select date and time"
                      dateFormat="yyyy-MM-dd HH:mm:ss"
                      value={values.date_time}
                      onChange={(e: any) => {
                        setFieldValue("date_time", e);
                      }}
                      showTimeSelect
                      touched={touched}
                      errors={errors}
                      // onBlur={handleBlur}
                    />
                  </div>
                </div>
                <div className="py-3 w-full flex items-center justify-end border-t-2 border-dark-700 px-5">
                  <div className="flex gap-4">
                    <Button
                      className="py-1.5 px-4"
                      text="Cancel"
                      style="dark-outline"
                      onClick={() => {
                        setIsFollowUpData("");
                        resetForm();
                      }}
                    />
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="py-2 px-4"
                      text="save"
                      style="primary"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FollowUp;
