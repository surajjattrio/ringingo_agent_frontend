import { useEffect, useState } from "react";
import Legacy from "next/legacy/image";

// PROJECT IMPORTS
import {
    createNewLead,
    getLeadGroups,
    getLeadStatus,
    useLeadGroupList,
    useLeadStatusList,
} from "@/redux/slice/leadListSlice";
import { useAppDispatch } from "@/redux/hooks";
import { Success } from "@/redux/services/toasterService";
import { getCountryList, useCountryList } from "@/redux/slice/countrySlice";
import { getCallStatistic } from "@/redux/slice/phoneSlice";
import { onAddNewLead, useIsAddNewLead } from "@/redux/slice/commonSlice";
import { Select, Input, Button } from "../../forms";
import { DatePicker } from "../../pickers";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";

// ASSETS
const backIcon = "/assets/icons/back-icon.svg";

// TYPES
import { createLeadTypes } from "@/types/createLeadTypes";

interface AddLeadProps { }

const genderOption = [
    { value: "0", label: "Male" },
    { value: "1", label: "Female" },
];

/* ============================== CREATE LEAD ============================== */
const AddLead = (props: AddLeadProps) => {
    const { } = props;
    const dispatch = useAppDispatch();
    const countryList = useCountryList();
    const leadStatusList = useLeadStatusList();
    const leadGroupList = useLeadGroupList();
    const isAddNewLead = useIsAddNewLead();

    useEffect(() => {
        setValues({
            ...values,
            phone_number:
                isAddNewLead?.direction === "outbound"
                    ? isAddNewLead?.destination_number
                    : isAddNewLead?.caller_id_number,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAddNewLead]);

    const [isLoading, setIsLoading] = useState<boolean>(false);

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

    // ON SUBMIT LEAD DETAILS
    const onSubmit = async (values: any) => {
        try {
            setIsLoading(true);
            const payload = { ...values };
            payload["status"] = "0";
            payload["from"] = "cdrs";
            payload["cdrs_uuid"] = isAddNewLead?.custom_callid || "";
            const res: any = await dispatch(createNewLead(payload)).unwrap();
            if (res) {
                Success(res?.data);
                dispatch(onAddNewLead(null));
                onGetCallStatistic();
                resetForm();
                setIsLoading(false);
            }
        } catch (error: any) {
            console.log("Create Lead err --->", error);
            setIsLoading(false);
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
    } = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
    });

    const getAllCountryList = async () => {
        try {
            await dispatch(getCountryList({ list: "all" })).unwrap();
        } catch (error: any) {
            console.log("Get country list error -->", error?.message);
        }
    };

    useEffect(() => {
        getAllCountryList();
        onGetLeadStatus();
        onGetLeadGroups();
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

    return (
        <>
            <div className="w-full">
                <div className="rounded-lg drop-shadow-lg">
                    <div className="bg-layout px-4 3xl:py-3 py-2 rounded-t-lg">
                        <div className="flex items-center">
                            <div className="relative h-[14px] w-[14px] 3xl:w-[16px] 3xl:h-[16px] cursor-pointer mr-2">
                                <Legacy
                                    src={backIcon}
                                    alt={"back"}
                                    layout="fill"
                                    onClick={() => {
                                        resetForm();
                                        dispatch(onAddNewLead(null));
                                    }}
                                />
                            </div>
                            <span className="3xl:text-sm text-xs text-heading font-bold">
                                Create Lead
                            </span>
                        </div>
                    </div>
                    <div className="pt-3 bg-white rounded-b-lg">
                        <div className="min-h-[calc(100vh-230px)] 3xl:min-h-[calc(100vh-270px)]">
                            <form onSubmit={handleSubmit}>
                                <div className="grid-cols-2 grid 3xl:gap-4 gap-3 px-4 pb-5">
                                    <div>
                                        <Select
                                            label="Lead Group"
                                            name="lead_group_uuid"
                                            placeholder="Select Lead Group"
                                            options={leadGroupList}
                                            value={values.lead_group_uuid}
                                            touched={touched}
                                            errors={errors}
                                            onChange={(e: any) => {
                                                setFieldValue("lead_group_uuid", e.target.value);
                                            }}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="First Name"
                                            name="first_name"
                                            value={values.first_name}
                                            placeholder="Enter First Name"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Last Name"
                                            name="last_name"
                                            value={values.last_name}
                                            placeholder="Enter last name"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="number"
                                            name="phone_code"
                                            label="Phone Code"
                                            placeholder="Enter Phone Code"
                                            value={values.phone_code}
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            disabled={true}
                                            label="Phone No."
                                            name="phone_number"
                                            value={values.phone_number}
                                            placeholder="Enter Phone No."
                                            touched={touched}
                                            errors={errors}
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
                                    <div>
                                        <Select
                                            label="Lead Status"
                                            name="lead_status"
                                            placeholder="Select Lead Status"
                                            options={leadStatusList}
                                            value={values.lead_status}
                                            touched={touched}
                                            errors={errors}
                                            onChange={(e: any) => {
                                                setFieldValue("lead_status", e.target.value);
                                            }}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Select
                                            label="Gender"
                                            name="gender"
                                            placeholder="Select Gender"
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
                                    <div>
                                        <Input
                                            label="Address"
                                            name="address"
                                            value={values.address}
                                            placeholder="Enter Your Address"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="City"
                                            name="city"
                                            value={values.city}
                                            placeholder="Enter City"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="State"
                                            name="state"
                                            value={values.state}
                                            placeholder="Enter State"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Select
                                            label="Country"
                                            name="country_uuid"
                                            placeholder="Select Country"
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
                                    <div>
                                        <Input
                                            label="Province"
                                            name="province"
                                            value={values.province}
                                            placeholder="Enter Province"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Postal code"
                                            name="postal_code"
                                            value={values.postal_code}
                                            placeholder="Enter Postal code"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <DatePicker
                                            
                                            name="dob"
                                            placeholder="MM/DD/YYYY"
                                            label="Date of birth"
                                            value={values.dob}
                                            touched={touched}
                                            errors={errors}
                                            onChange={(e: any) => {
                                                setFieldValue("dob", e);
                                            }}
                                            // onBlur={handleBlur}
                                            isInfo={false}
                                            // isIcon={false}
                                            maxDate={new Date()}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Your Email"
                                            name="email"
                                            type="email"
                                            value={values.email}
                                            placeholder="Enter Email"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Alternative Phone No."
                                            name="alternate_phone_number"
                                            type="number"
                                            value={values.alternate_phone_number}
                                            placeholder="Enter Phone No."
                                            touched={touched}
                                            errors={errors}
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
                                    <div>
                                        <Input
                                            label="Description"
                                            name="description"
                                            value={values.description}
                                            placeholder="Enter description"
                                            touched={touched}
                                            errors={errors}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            isInfo={false}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-start gap-4 px-4 py-3 border-t-2 border-dark-800">
                                    <div>
                                        <Button
                                            disabled={isLoading}
                                            text="Cancel"
                                            style="dark-outline"
                                            className="py-1.5 px-4"
                                            onClick={() => {
                                                resetForm();
                                                dispatch(onAddNewLead(null));
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Button
                                            isLoading={isLoading}
                                            disabled={isLoading}
                                            text="Save"
                                            style="primary-green"
                                            className="py-2 px-4"
                                            type="submit"
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

export default AddLead;
