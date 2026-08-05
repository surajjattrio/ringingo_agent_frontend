import { useEffect, useState, useLayoutEffect } from "react";
import Legacy from "next/legacy/image";
import { format } from "date-fns";
// PROJECT IMPORTS
import {
  createNewLead,
  editLead,
  getAllLeadList,
  getLeadGroups,
  getLeadList,
  getLeadStatus,
  useLeadGroupList,
  useLeadStatusList,
  getSingleLeadCustomFields,
} from "@/redux/slice/leadListSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Success } from "@/redux/services/toasterService";
import {
  changeLeadDetails,
  getSingleChatLead,
  getSingleLead,
} from "@/redux/slice/callCenter/callCenterPhoneSlice";
import { getCountryList, useCountryList } from "@/redux/slice/countrySlice";
import { Select, Input, Button, Textarea } from "../../forms";
import { DatePicker } from "../../pickers";
import MultiSelect, { Option } from "../../forms/MultiSelect";
import Checkbox from "@/components/forms/CheckboxV2";
import Radio from "@/components/forms/Radio";
// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";

// ASSETS
const backIcon = "/assets/icons/back-icon.svg";
const closeIcon = "/assets/icons/close.svg";
const closeWhiteIcon = "/assets/icons/close-white.svg";

// TYPES
import { FilterTypes } from "@/types/filterTypes";
import { createLeadTypes } from "@/types/createLeadTypes";
import { useAuth } from "@/contexts/hooks/useAuth";
import { getCallStatistic } from "@/redux/slice/phoneSlice";
import { useCampaignMode, useNumberMasking } from "@/redux/slice/commonSlice";
import { useActiveConversation } from "@/redux/slice/chatSlice";

interface CreateLeadProps {
  setIsCreateLead: any;
  fromList?: boolean;
  editData?: any;
  setEditData?: any;
  leadEdit?: boolean;
  setEditLead?: any;
  fromCallCenter?: boolean;
  sectionName?: string;
}

const genderOption = [
  { value: "0", label: "Male" },
  { value: "1", label: "Female" },
];

/* ============================== CREATE LEAD ============================== */
const CreateLead = (props: CreateLeadProps) => {
  const {
    setIsCreateLead,
    fromList = false,
    editData = null,
    leadEdit = false,
    setEditLead,
    setEditData,
    fromCallCenter = false,
    sectionName,
  } = props;
  const dispatch = useAppDispatch();
  const countryList = useCountryList();
  const leadStatusList = useLeadStatusList();
  const leadGroupList = useLeadGroupList();
  const campaignMode = useCampaignMode();
  const numberMasking = useNumberMasking();
  const { user } = useAuth();
  const activeConversation = useActiveConversation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customFieldData, setCustomFieldData] = useState<any>({});
  const [filter, setFilter] = useState<FilterTypes>({
    page: 1,
    limit: 10,
    search: "",
  });

  // GET LEAD LIST
  const onGetLeadList = async () => {
    try {
      const params = { ...filter };
      await dispatch(getLeadList(params)).unwrap();
    } catch (error: any) {
      console.log("Get lead list error ---->", error?.message);
    }
  };

  // GET ALL LEAD LIST
  const onGetAllLeadList = async () => {
    try {
      await dispatch(getAllLeadList({ list: "all" })).unwrap();
    } catch (error: any) {
      console.log("Get lead list error ---->", error?.message);
    }
  };

  const initialValues: createLeadTypes = {
    lead_group_uuid: "",
    lead_status: "",
    first_name: "",
    last_name: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country_uuid: "",
    province: "",
    postal_code: "",
    dob: "",
    email: "",
    phone_code: "",
    phone_number: "",
    alternate_phone_number: "",
    description: "",
    pbx_lead_status_uuid: "",
    custom_fields: {},
  };

  const validationSchema = Yup.object<createLeadTypes>({
    first_name: Yup.string().required("Please enter first name"),
    //gender: Yup.string().required("Please select gender"),
    phone_number: Yup.string()
      .min(4, "Please enter valid phone number")
      .required("Please enter phone number"),
    alternate_phone_number: Yup.string().min(
      4,
      "Please enter valid phone number"
    ),
  });

  // GET LEAD INFORMATUON
  const onGetLeadInfo = async (lead_uuid: string) => {
    try {
      if (activeConversation?.user_uuid) {
        console.log("et single chat lead detailssss")
        await dispatch(getSingleChatLead(lead_uuid)).unwrap();
      } else {
        await dispatch(getSingleLead(lead_uuid)).unwrap();
      }
    } catch (error: any) {
      console.log("Get lead Info Err--->", error?.message);
    }
  };

  // ON SUBMIT LEAD DETAILS
  const onSubmit = async (values: any) => {
    if (leadEdit) {
      try {
        setIsLoading(true);
        const payload = { ...values };
        payload["status"] = editData?.status || "0";
        if (!user?.isPbx) {
          payload["lead_group_uuid"] = editData?.lead_group_uuid || "";
        }
        payload["lead_management_uuid"] = editData?.lead_management_uuid || "";
        const res: any = await dispatch(editLead(payload)).unwrap();
        let data: any = [];
        payload["dob"] = values.dob ? values.dob.toString() : "";
        data.push(payload);
        if (res) {
          console.log(res,'ress');     
          Success(res?.data);
          if (fromCallCenter || activeConversation?.user_uuid) {
            if (editData?.lead_management_uuid) {
              onGetLeadInfo(editData.lead_management_uuid);
            }
            dispatch(changeLeadDetails(data));
          } else {
            dispatch(changeLeadDetails(data));
          }
          onGetAllLeadList();
          fromList && onGetLeadList();
          setIsCreateLead(false);
          onGetCallStatistic();
          resetForm();
          setEditData(null);
          setEditLead(false);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.log("Edit Lead err --->", error);
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        const payload = { ...values };
        payload["status"] = "0";
        const res: any = await dispatch(createNewLead(payload)).unwrap();
        if (res) {
          Success(res?.data);
          onGetAllLeadList();
          fromList && onGetLeadList();
          setIsCreateLead(false);
          onGetCallStatistic();
          resetForm();
          setIsLoading(false);
        }
      } catch (error: any) {
        console.log("Create Lead err --->", error);
        setIsLoading(false);
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
    setValues,
    resetForm,
  } = useFormik<any>({
    initialValues,
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    if (leadEdit) {
      if (editData) {
        setValues({
          lead_group_uuid: editData.lead_group_uuid
            ? editData.lead_group_uuid
            : "",
          lead_status: editData.lead_status ? editData.lead_status : "",
          first_name: editData.first_name ? editData.first_name : "",
          last_name: editData.last_name ? editData.last_name : "",
          gender: editData?.gender
            ? editData?.gender?.toLowerCase() === "male"
              ? "0"
              : editData?.gender?.toLowerCase() === "female"
                ? "1"
                : editData?.gender === "1"
                  ? "1"
                  : editData?.gender === "0"
                    ? "0"
                    : ""
            : "",
          address: editData.address ? editData.address : "",
          city: editData.city ? editData.city : "",
          state: editData.state ? editData.state : "",
          country_uuid: editData.country_uuid ? editData.country_uuid : "",
          province: editData.province ? editData.province : "",
          postal_code: editData.postal_code ? editData.postal_code : "",
          dob: editData.dob ? new Date(editData.dob) : "",
          email: editData.email ? editData.email : "",
          phone_code: editData.phone_code ? editData.phone_code : "",
          phone_number: editData.phone_number ? editData.phone_number : "",
          alternate_phone_number: editData.alternate_phone_number
            ? editData.alternate_phone_number
            : "",
          description: editData.description ? editData.description : "",
          custom_fields: editData?.custom_fields || {},
        });
      }
    } else {
      setValues({
        ...values,
        first_name: "",
        last_name: "",
        gender: "",
        address: "",
        city: "",
        state: "",
        country_uuid: "",
        province: "",
        postal_code: "",
        dob: "",
        email: "",
        phone_code: "",
        phone_number: "",
        alternate_phone_number: "",
        description: "",
        custom_fields: {},
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadEdit, editData]);

  const getAllCountryList = async () => {
    try {
      await dispatch(getCountryList({ list: "all" })).unwrap();
    } catch (error: any) {
      console.log("Get country list error -->", error?.message);
    }
  };

  useEffect(() => {
    getAllCountryList();
    user?.isPbx && onGetLeadStatus();
    user?.isPbx && onGetLeadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LEAD STATUS LIST GET
  const onGetLeadStatus = async () => {
    try {
      await dispatch(getLeadStatus()).unwrap();
    } catch (error: any) {
      console.log("Get lead status list error -->", error?.message);
    }
  };

  // LEAD GROUP LIST GET
  const onGetLeadGroups = async () => {
    try {
      await dispatch(getLeadGroups()).unwrap();
    } catch (error: any) {
      console.log("Get lead groups list error -->", error?.message);
    }
  };

  // GET CALL STATISTIC
  const onGetCallStatistic = async () => {
    try {
      await dispatch(getCallStatistic()).unwrap();
    } catch (error: any) {
      console.log("Get statistics error ---->", error?.message);
    }
  };

  useLayoutEffect(() => {
    getSingleLeadCustomFieldsDetail();
  }, [values?.lead_group_uuid]);

  const getSingleLeadCustomFieldsDetail = async () => {
    if (values?.lead_group_uuid) {
      try {
        const res: any = await dispatch(
          getSingleLeadCustomFields(values?.lead_group_uuid)
        ).unwrap();
        if (res?.statusCode === 200) {
          setCustomFieldData(sortFieldsByPriority(res?.data));
        }
      } catch (err) {
        console.error("Get Custom Field Data Err =-=>", err);
      }
    }
  };

  const handleOptionChange = (selected: Option[], name: string) => {
    setFieldValue(`custom_fields.${name}`, selected);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;

    const currentValues = values?.custom_fields[name] || [];

    let updatedCheckboxOptions;

    if (currentValues && currentValues.length > 0) {
      if (currentValues?.includes(value)) {
        updatedCheckboxOptions = currentValues.filter(
          (option: string) => option !== value
        );
      } else {
        updatedCheckboxOptions = [...currentValues, value];
      }
    } else {
      updatedCheckboxOptions = [...currentValues, value];
    }

    setFieldValue(`custom_fields.${name}`, updatedCheckboxOptions);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFieldValue(`custom_fields.${name}`, value);
  };

  // Trigger When - Time Picker Value Change
  const handleTimeChange = (
    key: string,
    secondKey: string,
    hour: string,
    minute: string
  ) => {
    var time = {
      [key]: hour,
      [secondKey]: minute,
    };
    setFieldValue(`custom_fields.time`, time);
  };

  const createOptionsFromString = (optionsString: any) => {
    const options = optionsString.split(", ").map((item: any) => ({
      value: item,
      label: item.charAt(0).toUpperCase() + item.slice(1), // Capitalize the first letter
    }));

    return options;
  };

  const sortFieldsByPriority = (customFieldData: any) => {
    if (customFieldData && customFieldData.length > 0) {
      return customFieldData?.sort(
        (a: any, b: any) => parseInt(a.field_rank) - parseInt(b.field_rank)
      );
    }
  };

  return (
    <>
      <div
        className={
          fromList
            ? "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            : "w-full bg-gray-50"
        }
        onClick={
          fromList
            ? () => {
                setIsCreateLead(false);
                resetForm();
                setEditData && setEditData(null);
                setEditLead && setEditLead(false);
              }
            : undefined
        }
      >
        <div
          className={
            fromList
              ? "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden relative"
              : `${
                  sectionName === "dashboard"
                    ? ""
                    : "rounded-lg border max-h-[70vh] overflow-y-auto scrollbar-hide"
                }`
          }
          onClick={fromList ? (e) => e.stopPropagation() : undefined}
        >
          <div
            className={`py-3.5 px-6 bg-white flex items-center justify-between sticky top-0 z-[9999] border-b flex-shrink-0 ${
              sectionName === "dashboard" ? "" : "rounded-t-lg"
            }`}
          >
            {fromCallCenter ? (
              <span className="text-lg text-gray-800 font-semibold">
                Lead Information
              </span>
            ) : (
              <div className="w-full flex items-center justify-center relative">
                <span className="text-[#322996] font-semibold text-lg">
                  {leadEdit ? "Edit Lead" : "Create Lead"}
                </span>
                <div
                  className="absolute right-0 h-[16px] w-[16px] cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setIsCreateLead(false);
                    resetForm();
                    setEditData && setEditData(null);
                    setEditLead && setEditLead(false);
                  }}
                >
                  <Legacy
                    src={fromList ? closeIcon : backIcon}
                    alt={fromList ? "close" : "back"}
                    layout="fill"
                  />
                </div>
              </div>
            )}
          </div>
          <div
            className={`bg-white rounded-b-lg ${
              fromList
                ? "flex-1 overflow-y-auto p-4 pt-3"
                : sectionName === "dashboard"
                ? "h-[36.2vh] overflow-y-auto scrollbar-hide pt-3"
                : "pt-3"
            }`}
          >
            <div
              className={`${
                sectionName === "dashboard" || fromList
                  ? ""
                  : "min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)]"
              }`}
            >
              <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-3">
                <div
                  className={`${fromCallCenter
                      ? `grid-cols-1 ${sectionName === "dashboard"
                        ? ""
                        : "h-[calc(100vh-220px)] 3xl:h-[calc(100vh-240px)] overflow-y-auto scrollbar-hide"
                      }`
                      : "grid-cols-2"
                    } grid gap-3 pb-4`}
                >
                  {user?.isPbx && (
                    <div className="relative z-[20] transition-all duration-200 hover:shadow-sm">
                      <div className="w-full">
                        <Select
                          label="Lead Group"
                          // icon="leadGroup"

                          name="lead_group_uuid"
                          // placeholder="Select Lead Group"
                          options={leadGroupList}
                          value={values.lead_group_uuid}
                          touched={touched}
                          errors={errors}
                          onChange={(e: any) => {
                            setFieldValue("lead_group_uuid", e.target.value);
                          }}
                          onBlur={handleBlur}
                          isInfo={false}
                          className="rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                   {user?.isPbx && (
                    <div className="w-full">
                      <Select
                        label="Lead Status"
                        name="lead_status"
                        // placeholder="Select Lead Status"
                        options={leadStatusList}
                        value={values.pbx_lead_status_uuid}
                        touched={touched}
                        errors={errors}
                        onChange={(e: any) => {
                          setFieldValue("lead_status", e.target.value);
                          setFieldValue("pbx_lead_status_uuid", e.target.value);
                        }}
                        onBlur={handleBlur}
                        isInfo={false}
                      />
                    </div>
                  )}
                  <div className="w-full">
                    <Input
                      icon="firstName"
                      label="First Name"
                      name="first_name"
                      value={values.first_name}
                      //   placeholder="Enter First Name"

                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="firstName"
                      label="Last Name"
                      name="last_name"
                      value={values.last_name}
                      //   placeholder="Enter last name"

                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="callicon"
                      type="number"
                      name="phone_code"
                      label="Phone Code"
                      //   placeholder="Enter Phone Code"
                      value={values.phone_code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="callicon"
                      disabled={leadEdit ? true : false}
                      label="Phone No."
                      name="phone_number"
                      value={
                        numberMasking && leadEdit && !user?.isPbx
                          ? Array.from(values.phone_number).length > 4
                            ? Array.from(values.phone_number)
                              .fill("X", 2, -2)
                              .join("")
                            : Array.from(values.phone_number)
                              .fill("X", 1, -1)
                              .join("")
                          : user?.isNumberMasking && leadEdit
                            ? Array.from(values.phone_number).length > 4
                              ? Array.from(values.phone_number)
                                .fill("X", 2, -2)
                                .join("")
                              : Array.from(values.phone_number)
                                .fill("X", 1, -1)
                                .join("")
                            : values.phone_number
                      }
                      //   placeholder="Enter Phone No."

                      onChange={(e: any) => {
                        let value = e.target.value;
                        let val = value.replace(/[^0-9*#+]+/g, "");
                        if (val?.length <= 15)
                          setFieldValue("phone_number", val);
                      }}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>                
                  <div className="w-full">
                    <Select
                      label="Gender"
                      name="gender"
                      //   placeholder="Select Gender"
                      options={genderOption}
                      value={values.gender}
                      touched={touched}
                      errors={errors}
                      onChange={(e: any) => {
                        setFieldValue("gender", e.target.value);
                      }}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="provinence"
                      label="Address"
                      name="address"
                      value={values.address}
                      //   placeholder="Enter Your Address"

                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="provinence"
                      label="City"
                      name="city"
                      value={values.city}
                      //   placeholder="Enter City"

                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="provinence"
                      label="State"
                      name="state"
                      value={values.state}
                      //   placeholder="Enter State"

                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Select
                      label="Country"
                      name="country_uuid"
                      //   placeholder="Select Country"
                      options={countryList}
                      value={values.country_uuid}
                      touched={touched}
                      errors={errors}
                      onChange={(e: any) => {
                        setFieldValue("country_uuid", e.target.value);
                      }}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="provinence"
                      label="Province"
                      name="province"
                      value={values.province}
                      //   placeholder="Enter Province"

                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="postalcode"
                      label="Postal code"
                      name="postal_code"
                      value={values.postal_code}
                      //   placeholder="Enter Postal code"

                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <DatePicker
                      // isIcon="calendar"

                      name="dob"
                      //   placeholder="MM/DD/YYYY"
                      label="Dateofbirth"
                      value={values.dob}
                      touched={touched}
                      errors={errors}
                      onChange={(e: any) => {
                        setFieldValue("dob", e);
                      }}
                      isInfo={false}
                      maxDate={new Date()}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="Mail"
                      label="Your Email"
                      name="email"
                      type="email"
                      value={values.email}
                      //   placeholder="Enter Email"

                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      icon="callicon"
                      label="AltPhoneNo."
                      name="alternate_phone_number"
                      type="number"
                      value={values.alternate_phone_number}
                      //   placeholder="Enter Phone No."

                      onChange={(e: any) => {
                        let value = e.target.value;
                        let val = value.replace(/[^0-9*#+]+/g, "");
                        if (val?.length <= 15)
                          setFieldValue("alternate_phone_number", val);
                      }}
                      onBlur={handleBlur}
                      isInfo={false}
                    />
                  </div>
                  <div className="w-full col-span-2">
                    <Textarea
                      isInfo={false}
                      icon="textarea"
                      label={
                        <>
                          Enter Notes..{" "}
                          {/* <span className="text-red-500">*</span> */}
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
                </div>
                {customFieldData && customFieldData.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm mb-4 border border-gray-100">
                    <div className="py-4 px-6 mb-4 rounded-t-lg flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50">
                      <span className="text-emerald-700 text-base font-semibold">
                        Custom Fields
                      </span>
                    </div>
                    <div
                      className={`${fromCallCenter
                          ? "grid-cols-2 h-[calc(100vh-220px)] 3xl:h-[calc(100vh-240px)] overflow-y-auto scrollbar-hide"
                          : "grid-cols-2"
                        } grid gap-6 px-6 pb-8`}
                    >
                      {customFieldData?.map((item: any) => {
                        switch (item?.field_type) {
                          case "0":
                            return (
                              <Input
                                // placeholder={`Enter ${item?.field_label}`}
                                name={item?.field_name}
                                label={item?.field_label}
                                value={
                                  values?.custom_fields?.[item?.field_name]
                                }
                                onChange={handleCustomChange}
                              />
                            );
                          case "1":
                            return (
                              <Textarea
                                placeholder={`Enter ${item?.field_label}`}
                                name={item?.field_name}
                                label={item?.field_label}
                                value={
                                  values?.custom_fields?.[item?.field_name]
                                }
                                onChange={handleCustomChange}
                              />
                            );
                          case "2":
                            return (
                              <Select
                                name={item?.field_name}
                                label={item?.field_label}
                                value={
                                  values?.custom_fields?.[item?.field_name]
                                }
                                options={createOptionsFromString(
                                  item?.field_options
                                )}
                                onChange={handleCustomChange}
                              />
                            );
                          case "3":
                            return (
                              <MultiSelect
                                name={item?.field_name}
                                label={item?.field_label}
                                options={createOptionsFromString(
                                  item?.field_options
                                )}
                                onChange={handleOptionChange}
                                value={
                                  values?.custom_fields?.[item?.field_name]
                                }
                                isSelectAll={true}
                                menuPlacement={"bottom"}
                              />
                            );
                          case "4":
                            return (
                              <Radio
                                name={item?.field_name}
                                label={item?.field_label}
                                selected={
                                  values?.custom_fields?.[item?.field_name]
                                }
                                options={createOptionsFromString(
                                  item?.field_options
                                )}
                                onChange={handleCustomChange}
                              />
                            );
                          case "5":
                            return (
                              <Checkbox
                                name={item?.field_name}
                                label={item?.field_label}
                                selectedValues={
                                  values?.custom_fields?.[item?.field_name]
                                }
                                options={createOptionsFromString(
                                  item?.field_options
                                )}
                                onChange={(e: any) => {
                                  handleCheckboxChange(e);
                                }}
                              />
                            );
                          case "6":
                            return (
                              <DatePicker
                                name={item?.field_name}
                                label={item?.field_label}
                                value={
                                  values?.custom_fields?.[item?.field_name]
                                    ? new Date(
                                      values?.custom_fields?.[
                                      item?.field_name
                                      ]
                                    )
                                    : ""
                                }
                                touched={touched}
                                errors={errors}
                                // placeholder={`Select ${item?.field_label}`}
                                dateFormat="yyyy-MM-dd HH:mm:ss"
                                onChange={(date: any) => {
                                  setFieldValue(
                                    `custom_fields.${item?.field_name}`,
                                    format(
                                      new Date(date),
                                      "yyyy-MM-dd HH:mm:ss"
                                    )
                                  );
                                }}
                                showTimeSelect
                                isInfo
                              />
                            );
                          default:
                        }
                      })}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <div className="flex justify-center gap-4 px-6 pb-4 border-gray-100  rounded-b-lg">
                  {/* <Button
                    disabled={isLoading}
                    text="Cancel"
                    style="dark-outline"
                    className="py-2 px-6 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => {
                      setIsCreateLead(false);
                      resetForm();
                      leadEdit && setEditData(null);
                    }}
                  /> */}
                  <Button
                    icon="SaveBtn"
                    isLoading={isLoading}
                    disabled={isLoading}
                    text={leadEdit ? "Save" : "Save"}
                    style={fromCallCenter ? "save" : "save"}
                    className="py-2 px-4 bg-[#322996] hover:bg-opacity-60 text-white transition-colors duration-200"
                    type="submit"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateLead;
