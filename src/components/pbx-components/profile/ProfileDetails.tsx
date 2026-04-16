"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

// PROJECT IMPORTS
import { Button } from "../../forms";

// ASSETS
const avatar = "/assets/images/avatar.svg";

/* ============================== PROFILE DETAILS PAGE ============================== */

const ProfileDetails = () => {
    const router = useRouter()
    return (
        <>
            <div className="py-4 px-9">
                <div className="grid grid-cols-2 pb-3 items-center border-b border-dark-800 sm:grid-cols-1">
                    <div className="flex items-center gap-3">
                        <div>
                            <Image src={avatar} height={70} width={70} alt="avatar" />
                        </div>
                        <div className="flex justify-start flex-col">
                            <span className="text-sm text-heading font-bold">
                                Adison Jack
                            </span>
                            <span className="text-xs text-txt-primary font-semibold pt-1">
                                Lorem Ipsum
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            className="py-2 px-3 rounded-lg"
                            text="Edit Profile"
                            icon="edit-white"
                            style="primary-green"
                            onClick={()=>{router.push('/profile/edit')}}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-1 pt-3">
                    <div className="">
                        <span className="text-[15px] text-heading font-bold">
                            Personal Information
                        </span>
                        <div className="grid grid-cols-3">
                            <div className="col-span-2 pb-2 pt-3 flex flex-col">
                                <span className="text-sm text-txt-primary">First Name:</span>
                                <span className="text-sm text-heading font-semibold">
                                    Adison
                                </span>
                            </div>
                            <div className="col-span-1 py-2 flex flex-col">
                                <span className="text-sm text-txt-primary">Last Name:</span>
                                <span className="text-sm text-heading font-semibold">Jack</span>
                            </div>
                            <div className="col-span-2 pt-2 pb-3 flex flex-col">
                                <span className="text-sm text-txt-primary">Email:</span>
                                <span className="text-sm text-heading font-semibold">
                                    adison.jack@xyz.com
                                </span>
                            </div>
                        </div>
                        <span className="text-[15px] text-heading font-bold">
                            Personal Address
                        </span>
                        <div className="grid grid-cols-3">
                            <div className="col-span-2 pb-2 pt-3 flex flex-col">
                                <span className="text-sm text-txt-primary">Address:</span>
                                <span className="text-sm text-heading font-semibold max-w-[80%]">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                                    do eiusmod tempor incididun
                                </span>
                            </div>
                            <div className="col-span-1 py-2 flex flex-col">
                                <span className="text-sm text-txt-primary">Country:</span>
                                <span className="text-sm text-heading font-semibold">
                                    India
                                </span>
                            </div>
                            <div className="col-span-2 py-2 flex flex-col">
                                <span className="text-sm text-txt-primary">State:</span>
                                <span className="text-sm text-heading font-semibold">
                                    Gujarat
                                </span>
                            </div>
                            <div className="col-span-1 py-2 flex flex-col">
                                <span className="text-sm text-txt-primary">Pincode:</span>
                                <span className="text-sm text-heading font-semibold">
                                    380001
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileDetails;
