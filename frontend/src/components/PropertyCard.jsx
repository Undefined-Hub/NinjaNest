import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoShieldCheckmark } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  return (
    <div
      id=""
      className="flex flex-col w-[21rem] md:w-[22rem] rounded-2xl bg-[#18212f] justify-center h-fit overflow-hidden md:border-[0.1px] md:border-secondary-text hover:border-main-purple ease-in-out duration-300 cursor-pointer shadow-sm hover:shadow-[#a98cfc]" onClick={()=>{navigate("property/"+property._id)}}>
      <div className="w-[21rem] md:w-[22rem] h-40">
        <img
          src={property.images[0] || "https://placehold.co/1000"}
          className="object-cover w-full h-full"
          alt={property.title}
        />
        {property.isVerified && (
          <p className="relative left-[13.2rem] bottom-[9.5rem] text-white font-bold bg-green-400 rounded-xl text-center w-fit px-2 text-sm">
            Verified
          </p>
        )}
      </div>

      <div className="flex flex-col px-2">
        <div className="flex justify-between text-white py-2">
          <div className="flex flex-col p-2 gap-1">
          <p className="font-bold text-xl line-clamp-1">{property.title}</p>

            <p className="text-sm flex items-center gap-1 text-[#727986]">
              <FaLocationDot />
              {property.location}
            </p>
          </div>
          <div className="flex flex-col p-2 gap-1 items-center">
            <h1 className="font-bold text-xl text-right text-[#a98cfc]">
              <span>₹</span>
              {property.rent?.toLocaleString('en-IN')}
            </h1>
            <p className="text-sm text-[#727986]">per month</p>
          </div>
        </div>

        <hr className="w-72 md:w-80 self-center border-[#727986]" />

        <div className="flex justify-between text-white py-2">
          <div className="flex flex-row p-2 items-center gap-2">
            <div className="w-10">
              <img
                src="https://placehold.co/100"
                className="object-cover rounded-full"
                alt="Landlord"
              />
            </div>
            <div>
              <p className="text-md font-bold">Landlord</p>
              <p className="text-sm flex items-center gap-1 text-[#727986] text-md">
                <span className="text-green-500">
                  <IoShieldCheckmark />
                </span>
                {property.averageTrustScore} Trust
              </p>
            </div>
          </div>
          <div className="flex flex-col p-2 justify-center">
            <p className="text-right text-lg text-[#727986] font-bold">
              <span className="text-yellow-400 mx-1">★</span>
              {property.averageRating}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
