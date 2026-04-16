// "use client";
// import { useRouter } from "next/navigation";

// // PROJECT IMPORTS
// import { Success } from "@/redux/services/toasterService";
// import { useAuth } from "@/contexts/hooks/useAuth";
// import { Button, Input } from "../forms";
// import getDomain from "@/utils/GetDoamin";

// // THIRD-PARTY IMPORT
// import { useFormik } from "formik";
// import * as Yup from "yup";

// // TYPES
// import { forgotPasswordFormTypes } from "@/types/forgotPasswordFormTypes";

// /* ============================== FORGOT PASSWORD FORM ============================== */

// const ForgotPasswordForm = () => {
//     const { forgotPassword } = useAuth();
//     const router = useRouter();

//     // GET DOMAIN
//     const domain = getDomain();

//     const initialValues: forgotPasswordFormTypes = {
//         username: "",
//         entity: "agent",
//         tenant_domain: domain,
//     };

//     const validationSchema = Yup.object<forgotPasswordFormTypes>({
//         username: Yup.string().required("Please enter your email/username"),
//     });

//     // ON SUBMIT FORM
//     const onSubmit = async (values: forgotPasswordFormTypes) => {
//         try {
//             const res: any = await forgotPassword(
//                 values.username,
//                 values.entity,
//                 values.tenant_domain
//             );
//             if (res && res.statusCode === 200) {
//                 Success(res.data);
//             }
//         } catch (e: any) {
//             console.error("Forgot Password Error --->", e?.message);
//         }
//     };

//     const { values, touched, errors, handleBlur, handleChange, handleSubmit } =
//         useFormik({
//             initialValues,
//             validationSchema,
//             onSubmit,
//         });

//     return (
//         <>
//             <form onSubmit={handleSubmit}>
//                 <div className="space-y-2">
//                     <Input
//                         className="!py-2"
//                         label="Your Email / Username"
//                         name="username"
//                         value={values.username}
//                         placeholder="Enter Your Email/Username"
//                         icon="email"
//                         touched={touched}
//                         errors={errors}
//                         onChange={handleChange}
//                         onBlur={handleBlur}
//                         isInfo={false}
//                     />
//                     <div className="w-full pt-4">
//                         <Button
//                             text="Reset Password"
//                             className="w-full px-9 py-2.5 3xl:py-3 shadow-lg"
//                             type="submit"
//                             style="primary"
//                         />
//                     </div>
//                     <div className="flex justify-center pt-1.5">
//                         <Button
//                             text="Back to Login"
//                             icon="backIcon"
//                             className="px-2 py-1 rounded-md"
//                             style="primary-green-outline"
//                             onClick={() => router.push("/login")}
//                         />
//                     </div>
//                 </div>
//             </form>
//         </>
//     );
// };

// export default ForgotPasswordForm;













"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

// PROJECT IMPORTS
import { Success } from "@/redux/services/toasterService";
import { useAuth } from "@/contexts/hooks/useAuth";
import { Button, Input } from "../forms";
import getDomain from "@/utils/GetDoamin";

// THIRD-PARTY IMPORT
import { useFormik } from "formik";
import * as Yup from "yup";

// TYPES
import { forgotPasswordFormTypes } from "@/types/forgotPasswordFormTypes";

const logo : any = process.env.EXPANDED_LOGO;

/* ============================== FORGOT PASSWORD FORM ============================== */

const ForgotPasswordForm = () => {
    const { forgotPassword } = useAuth();
    const router = useRouter();

    // GET DOMAIN
    const domain = getDomain();

    const initialValues: forgotPasswordFormTypes = {
        username: "",
        entity: "agent",
        tenant_domain: domain,
    };

    const validationSchema = Yup.object<forgotPasswordFormTypes>({
        username: Yup.string().required("Please enter your email/username"),
    });

    // ON SUBMIT FORM
    const onSubmit = async (values: forgotPasswordFormTypes) => {
        try {
            const res: any = await forgotPassword(
                values.username,
                values.entity,
                values.tenant_domain
            );
            if (res && res.statusCode === 200) {
                Success(res.data);
            }
        } catch (e: any) {
            console.error("Forgot Password Error --->", e?.message);
        }
    };

    const { values, touched, errors, handleBlur, handleChange, handleSubmit } =
        useFormik({
            initialValues,
            validationSchema,
            onSubmit,
        });

    return (
        <div className="fixed inset-0 flex h-screen flex-col items-center justify-center bg-gray-50">
            {/* Logo */}
            <div className="mb-6">
                <Image 
                    src={logo} 
                    alt="ByteBran" 
                    height={50} 
                    width={220}
                    priority 
                />
            </div>

            <div className="w-full max-w-[440px] space-y-5 rounded-2xl bg-white p-8 shadow-sm">
                {/* Spiral Design */}
                <div className="relative mx-auto mb-3 flex h-28 w-28 items-center justify-center">
                    <div className="absolute">
                        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M80 80 C80 50 110 50 110 80 C110 110 80 110 80 80" stroke="#FF8A3D" strokeWidth="2" fill="none"/>
                            <rect x="65" y="35" width="16" height="16" fill="#FF8A3D" transform="rotate(-15 65 35)"/>
                            <rect x="110" y="75" width="12" height="12" fill="#FF8A3D"/>
                            <rect x="45" y="95" width="8" height="8" fill="#FF8A3D"/>
                            <circle cx="80" cy="80" r="4" fill="#6B7280"/>
                            <circle cx="100" cy="40" r="3" fill="#93C5FD"/>
                            <circle cx="120" cy="90" r="3" fill="#93C5FD"/>
                            <circle cx="60" cy="110" r="3" fill="#93C5FD"/>
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center">
                    <h2 className="mb-1.5 text-2xl font-semibold text-gray-900">Lost your password?</h2>
                    <p className="text-sm text-gray-600">Enter your details to recover.</p>
                    <p className="mt-1 text-xs text-gray-400">Enter your details to proceed further</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="space-y-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <Input
                                className="w-full rounded-md border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                name="username"
                                value={values.username}
                                placeholder="Start typing ..."
                                touched={touched}
                                errors={errors}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInfo={false}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            text="Recover"
                            className="w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                            type="submit"
                            style="primary"
                        />
                        
                        <Button
                            text="Back to Login"
                            icon="backIcon"
                            className="w-full rounded-md border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            style="primary-green-outline"
                            onClick={() => router.push("/login")}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
