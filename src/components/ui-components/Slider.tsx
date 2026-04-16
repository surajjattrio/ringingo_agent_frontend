"use client";
import Legacy from "next/legacy/image";
import React from "react";

// ASSETS
const VolumeUp = "/assets/icons/speaker-plus.svg";
const VolumeDown = "/assets/icons/speaker-minus.svg";

// TYPES
interface SlideProps {
    className?: string;
    value?: any;
    onChange?: any;
    vertical?: boolean;
}

const Slider = (props: SlideProps) => {
    const { className = "", value, onChange, vertical = false } = props;
    return (
        <>
            <div
                className={`${className} ${vertical ? "-rotate-90" : ""
                    } flex items-center bg-white 3xl:py-2 py-1 border-2 border-dark-700 drop-shadow-sm rounded-lg w-[90px] absolute`}
            >
                <div className="relative rotate-90 3xl:w-[20px] 3xl:h-[20px] w-[18px] h-[18px]">
                    <Legacy src={VolumeUp} alt="speaker_down" layout="fill" />
                </div>
                <input
                    className="bg-dark-800 3xl:w-full w-[70%] h-1 focus:outline-none outline-none accent-primary hover:accent-primary"
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={value}
                    onMouseUp={onChange}
                    onChange={onChange}
                />
                <div className="relative rotate-90 3xl:w-[20px] 3px:h-[20px] w-[18px] h-[18px]">
                    <Legacy src={VolumeDown} alt="speaker_up" layout="fill" />
                </div>
            </div>
        </>
    );
};

export default Slider;
