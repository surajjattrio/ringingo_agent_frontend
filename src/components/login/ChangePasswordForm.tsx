"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

// PROJECT IMPORTS
import { Danger, Success } from "@/redux/services/toasterService";
import { useAuth } from "@/contexts/hooks/useAuth";
import { Button, Input } from "../forms";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";

// TYPES
import { changePasswordFormTypes } from "@/types/changePasswordFormTypes";

/* ============================== CHANGE PASSWORD FORM ============================== */

const ChangePasswordForm = () => {
    const { id } = useParams();
    const { updatePassword } = useAuth();
    const router = useRouter();

    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showCPassword, setShowCPassword] = useState<boolean>(false);

    const initialValues: changePasswordFormTypes = {
        password: "",
        confirm_password: "",
        uuid: id,
        entity: "agent",
    };

    const validationSchema = Yup.object<changePasswordFormTypes>({
        password: Yup.string().required("Please enter your new password"),
        confirm_password: Yup.string()
            .required("Please enter your confirm password")
            .oneOf([Yup.ref("password")], "Passwords must match"),
    });

    // CHNAGE PASSWORD
    const onSubmit = async (values: changePasswordFormTypes) => {
        try {
            const res: any = await updatePassword(
                values.password,
                values.uuid,
                values.entity
            );
            if (res && res.statusCode === 200) {
                router.push("/login");
                Success(res.data);
                resetForm();
            } else {
                Danger(res.data);
            }
        } catch (e: any) {
            console.error("Update Password Error --->", e?.message);
        }
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
            <form onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Input
                        className="!py-2"
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
                        isInfo={false}
                    />
                    <Input
                        className="!py-2"
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
                        isInfo={false}
                    />
                    <div className="w-full pt-6">
                        <Button
                            text="Update Password"
                            className="w-full px-9 py-2.5 3xl:py-3 shadow-lg"
                            type="submit"
                            style="primary"
                        />
                    </div>
                </div>
            </form>
        </>
    );
};

export default ChangePasswordForm;
