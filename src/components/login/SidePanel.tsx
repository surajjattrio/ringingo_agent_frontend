"use client";
import Image from "next/image";
import { useState } from "react";

// THIRD-PARTY IMPORT
import { Carousel } from "react-responsive-carousel";

// ASSETS
const image = "/assets/images/panel_Image.svg";

/* ============================== SIDE PANEL ============================== */

const SidePanel = () => {
  const [showImage, setShowImage] = useState<number>(0);

  return (
    <div className="flex flex-col justify-center h-full px-20 xl:px-10 2lg:px-2 lg:px-0 md:px-2 sm:px-0 select-none">
      <div>
        <div className="flex flex-col">
          <span className="font-bold text-2xl lg:text-xl 2md:text-lg text-heading">
          {process.env.SIDEPANEL_1}
          </span>
          <span className="font-bold text-2xl lg:text-xl 2md:text-lg pt-1 text-heading">
          {process.env.SIDEPANEL_2}
          </span>
        </div>
        <p className="pt-2 text-xs font-normal text-txt-primary">
        {process.env.SIDEPANEL_3}
        </p>
      </div>
      <div className="pt-5">
          <Carousel 
            showArrows={false}
            showStatus={false}
            transitionTime={700}
            selectedItem={showImage}
            showIndicators={false}
          >
            <Image src={image} alt="panel-Image" width={680} height={374} />
            <Image src={image} alt="panel-Image" width={680} height={374} />
            <Image src={image} alt="panel-Image" width={680} height={374} />
            <Image src={image} alt="panel-Image" width={680} height={374} />
          </Carousel>
          <div className="-mt-4 flex list-none justify-center">
            <button
              onClick={() => setShowImage(0)}
              type="button"
              className={`mx-[4px] h-1 xl:w-24 2lg:w-16 lg:w-12 smd:w-14 w-24 rounded-2xl flex-initial cursor-pointer border border-solid border-transparent p-0 -indent-[999px] transition-opacity duration-[600ms] ${
                showImage === 0 ? "bg-secondary" : "bg-dark-600"
              }`}
            ></button>
            <button
              onClick={() => setShowImage(1)}
              type="button"
              className={`mx-[4px] h-1 xl:w-24 2lg:w-16 lg:w-12 smd:w-14 w-24 rounded-2xl flex-initial cursor-pointer border border-solid border-transparent p-0 -indent-[999px] transition-opacity duration-[600ms] ${
                showImage === 1 ? "bg-secondary" : "bg-dark-600"
              }`}
            ></button>
            <button
              onClick={() => setShowImage(2)}
              type="button"
              className={`mx-[4px] h-1 xl:w-24 2lg:w-16 lg:w-12 smd:w-14 w-24 rounded-2xl flex-initial cursor-pointer border border-solid border-transparent p-0 -indent-[999px] transition-opacity duration-[600ms] ${
                showImage === 2 ? "bg-secondary" : "bg-dark-600"
              }`}
            ></button>
            <button
              onClick={() => setShowImage(3)}
              type="button"
              className={`mx-[4px] h-1 xl:w-24 2lg:w-16 lg:w-12 smd:w-14 w-24 rounded-2xl flex-initial cursor-pointer border border-solid border-transparent p-0 -indent-[999px] transition-opacity duration-[600ms] ${
                showImage === 3 ? "bg-secondary" : "bg-dark-600"
              }`}
            ></button>
          </div>
        </div>
      </div>
  );
};

export default SidePanel;
