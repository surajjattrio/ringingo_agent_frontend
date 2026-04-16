"use client";
import Image from "next/image";
import { useEffect } from "react";

// PROJECT IMPORTS
import { getCountryList, useCountryList } from "@/redux/slice/countrySlice";
import { useAppDispatch } from "@/redux/hooks";
import { Button, Input, Select } from "../../forms";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";

// TYPES
import { profileFormTypes } from "@/types/profileFormTypes";

// ASSETS
const avatar = "/assets/images/avatar.svg";

/* ============================== EDIT PROFILE DETAILS PAGE ============================== */

const EditProfileDetails = () => {
    const dispatch = useAppDispatch();
    const countryList = useCountryList();
    const initialValues: profileFormTypes = {
        first_name: "",
        last_name: "",
        email: "",
        address: "",
        state: "",
        country: "",
        pincode: "",
    };

    const validationSchema = Yup.object<profileFormTypes>({
        first_name: Yup.string().required("Please enter first name"),
        last_name: Yup.string().required("Please enter last name"),
        email: Yup.string().required("Please enter email"),
        address: Yup.string().required("Please enter address"),
        state: Yup.string().required("Please select state"),
        country: Yup.string().required("Please select country"),
        pincode: Yup.string().required("Please enter pincode"),
    });

    // ON SUBMIT PROFILE DETAILS
    const onSubmit = async (values: any) => { };

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

    // ALL COUNTRY GET
    const getAllCountryList = async () => {
        try {
            await dispatch(getCountryList({ list: "all" })).unwrap();
        } catch (error: any) {
            console.log("Get country list error -->", error?.message);
        }
    };

    useEffect(() => {
        getAllCountryList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="pb-4 px-9">
                <form onSubmit={handleSubmit}>
                    <div className="sticky top-[36px] bg-white pt-4 z-[3] grid grid-cols-2 pb-3 items-center border-b border-dark-800 sm:grid-cols-1">
                        <div className="flex items-center gap-3">
                            <div>
                                <Image src={avatar} height={70} width={70} alt="avatar" />
                            </div>
                            <div className="flex justify-start flex-col">
                                <span className="text-xs text-heading">Upload Photo</span>
                                <span className="text-[9px] text-txt-primary pt-1">
                                    300x300 and max 2 MB
                                </span>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                className="py-2 px-3 rounded-lg"
                                text="Save Changes"
                                style="primary-green"
                                type="submit"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 pt-2">
                        <div className="col-span-2">
                            <span className="text-[15px] text-heading font-bold">
                                Personal Information
                            </span>
                            <div className="grid grid-cols-2 gap-3 py-3">
                                <Input
                                    label="First Name"
                                    name="first_name"
                                    icon="user"
                                    value={values.first_name}
                                    placeholder="Enter First Name"
                                    touched={touched}
                                    errors={errors}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <Input
                                    label="Last Name"
                                    name="last_name"
                                    value={values.last_name}
                                    placeholder="Enter Last Name"
                                    touched={touched}
                                    errors={errors}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <Input
                                    label="Your Email"
                                    name="email"
                                    type="email"
                                    icon="email"
                                    value={values.email}
                                    placeholder="Enter Your Email"
                                    touched={touched}
                                    errors={errors}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>
                            <span className="text-[15px] text-heading font-bold">
                                Personal Address
                            </span>
                            <div className="grid grid-cols-2 gap-3 py-3">
                                <Input
                                    label="Address"
                                    name="address"
                                    icon="locationGray"
                                    value={values.address}
                                    placeholder="Enter Address"
                                    touched={touched}
                                    errors={errors}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <Select
                                    label="Country"
                                    name="country"
                                    icon="map-gray"
                                    placeholder="Select State"
                                    options={countryList}
                                    value={values.country}
                                    touched={touched}
                                    errors={errors}
                                    onChange={(e: any) => {
                                        setFieldValue("country", e.target.value);
                                    }}
                                    onBlur={handleBlur}
                                />
                                <Input
                                    label="State"
                                    name="state"
                                    value={values.state}
                                    placeholder="Enter State"
                                    touched={touched}
                                    errors={errors}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <Input
                                    label="Pincode"
                                    name="pincode"
                                    value={values.pincode}
                                    placeholder="Enter Pincode"
                                    touched={touched}
                                    errors={errors}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditProfileDetails;
