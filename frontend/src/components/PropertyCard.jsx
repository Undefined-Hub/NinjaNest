import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoShieldCheckmark } from "react-icons/io5";
const PropertyCard = () => {
  return (
    <div
      id=""
      className="flex flex-col w-[21rem] md:w-[18rem] rounded-2xl bg-[#18212f] justify-center h-fit overflow-hidden"
    >
      <div className="w-[21rem] md:w-[18rem] h-40">
        <img
          src="https://placehold.co/1000"
          className="object-cover w-full h-full "
          alt=""
        />
        <p className="relative left-[13.2rem] bottom-[9.5rem] text-white font-bold bg-green-400 rounded-xl text-center w-fit px-2 text-sm">
          Verified
        </p>
      </div>

        <div className="flex flex-col px-2">

            <div className="flex justify-between text-white py-2">
                <div className="flex flex-col p-2 gap-1">
                    <p className="font-bold text-xl">Modern Studio</p>
                    <p className="text-sm flex items-center gap-1 text-[#727986]"><FaLocationDot/>0.5 miles from campus</p>
                </div>
                <div className="flex flex-col p-2 gap-1">
                    <h1 className="font-bold text-xl text-right text-[#a98cfc]"><span>₹</span>751</h1>
                    <p className="text-sm text-[#727986]">per month</p>
                </div>
            </div>

            <hr className="w-72 md:w-64 self-center border-[#727986]" />

            <div className="flex justify-between  text-white py-2">
                <div className="flex flex-row p-2 items-center gap-2">
                    <div className="w-10">
                        <img
                            src="https://placehold.co/100"
                            className="object-cover rounded-full"
                            alt=""
                        />
                    </div>
                    <div>
                        <p className="text-md font-bold">John Smith</p>
                        <p className="text-sm flex items-center gap-1 text-[#727986] text-md"><span className="text-green-500"><IoShieldCheckmark/></span>4.8 Trust</p>
                    </div>
                </div>
                <div className="flex flex-col p-2 justify-center">
                    <p className="text-right text-lg text-[#727986] font-bold"><span className="text-yellow-400 mx-1 ">★</span>4.8</p>
{/* <span className="text-[#727986] text-sm self-end"></span> */}
                </div>
            </div>

        </div>
    </div>
  );
};

export default PropertyCard;
