"use client";
import { useState } from "react";

// PROJECT IMPORTS
import { useAppDispatch } from "@/redux/hooks";
import { passwordChange } from "@/redux/slice/settingSlice";
import { Danger, Success } from "@/redux/services/toasterService";
import { Button, Input } from "../../forms";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";
import { changePasswordTypes } from "@/types/changePasswordTypes";

/* ============================== CHNAGE PASSWORD ============================== */

const ChangePassword = () => {
    const dispatch = useAppDispatch();

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showCPassword, setShowCPassword] = useState<boolean>(false);

    const initialValues: changePasswordTypes = {
        current_password: "",
        password: "",
        confirm_password: "",
    };

    const validationSchema = Yup.object<changePasswordTypes>({
        current_password: Yup.string().required(
            "Please enter your current password"
        ),
        password: Yup.string().required("Please enter your new password"),
        confirm_password: Yup.string()
            .required("Please enter your confirm password")
            .oneOf([Yup.ref("password")], "Passwords must match"),
    });

    // ON SUBMIT NEW PASSWORD
    const onSubmit = async (values: changePasswordTypes) => {
        try {
            let payload = { ...values };
            delete payload["confirm_password"];
            const res: any = await dispatch(passwordChange(payload)).unwrap();
            if (res && res?.statusCode === 200) {
                Success(res?.data);
                resetForm();
            } else {
                Danger(res?.data);
            }
        } catch (error) { }
    };

    const {
        values,
        touched,
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        resetForm,
    } = useFormik({
        initialValues,
        validationSchema,
        onSubmit,
    });

    return (
        <>
            <div className="grid grid-cols-4 tmd:grid-cols-3 2md:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
                <form onSubmit={handleSubmit}>
                    <div className="px-6 pt-3">
                        <div className="py-2">
                            <Input
                                label="Current Password"
                                name="current_password"
                                value={values.current_password}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Current Password"
                                icon="lockGray"
                                rightIcon={showPassword ? "Eye" : "EyeCloseGray"}
                                touched={touched}
                                errors={errors}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onRightIconClick={() => {
                                    setShowPassword(!showPassword);
                                }}
                            />
                        </div>
                        <div className="py-2">
                            <Input
                                label="New Password"
                                name="password"
                                value={values.password}
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter New Password"
                                icon="lockGray"
                                rightIcon={showNewPassword ? "Eye" : "EyeCloseGray"}
                                touched={touched}
                                errors={errors}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onRightIconClick={() => {
                                    setShowNewPassword(!showNewPassword);
                                }}
                            />
                        </div>
                        <div className="py-2">
                            <Input
                                label="Confirm Password"
                                name="confirm_password"
                                value={values.confirm_password}
                                type={showCPassword ? "text" : "password"}
                                placeholder="Re-enter New Password"
                                icon="lockGray"
                                rightIcon={showCPassword ? "Eye" : "EyeCloseGray"}
                                touched={touched}
                                errors={errors}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                onRightIconClick={() => {
                                    setShowCPassword(!showCPassword);
                                }}
                            />
                        </div>
                        <div className="py-2">
                            <Button
                                text="Update Password"
                                className="py-1.5 px-2"
                                type="submit"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChangePassword;
