import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoShieldCheckmark } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
const PropertyCard = ({ property }) => {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div
      id=""
      className="flex flex-col w-[21rem] md:w-96 rounded-2xl bg-[#18212f] justify-center h-fit overflow-hidden md:border-[0.1px] md:border-secondary-text/50 hover:border-main-purple ease-in-out duration-300 cursor-pointer shadow-sm hover:shadow-[#a98cfc]" onClick={() => { navigate("property/" + property._id) }}>
      {/* Image Div */}
      <div className="w-[21rem] md:w-full h-40 relative">
        <img
          src={property.mainImage || "https://placehold.co/1000"}
          className="object-cover w-full h-full"
          alt={property.title}
        />
        {property.isVerified && (
          <p className="absolute right-3 top-3 text-white font-bold bg-green-400 rounded-xl text-center w-fit px-2 text-sm">
            Verified
          </p>
        )}
      </div>

      <div className="flex flex-col px-2">
        <div className="flex justify-between text-white py-2">

          {/* Title and Location*/}
          <div className="flex flex-col p-2 gap-1">
            <p className="font-bold text-xl line-clamp-1">{property.title}</p>

            <p className="text-sm flex items-center gap-1 text-[#727986]">
              <FaLocationDot />
              {property.location}
            </p>
          </div>

          {/* Rent per month*/}
          <div className="flex flex-col p-2 gap-1 justify-end items-end w-1/4">
            <h1 className="font-bold text-xl text-right text-[#a98cfc]">
              <span>₹</span>
              {property.rent?.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-[#727986]">per month</p>
          </div>
        </div>

        <hr className="w-72 md:w-80 self-center border-[#727986]" />


        {/*Trust Score and Rating*/}

        <div className="flex justify-between text-white py-2">
          <div className="flex flex-row p-2 items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={property?.landlord_id?.profilePicture || "https://placehold.co/1000"}
                className="object-cover w-full h-full"
                alt="Landlord"
              />
            </div>
            <div>
              <p className="text-md font-bold">{property.landlord_name ? property.landlord_name : "Landlord XYZ"}</p>
              <p className="text-sm flex items-center gap-1 text-[#727986] text-md">
                <span className="text-green-500">
                  <IoShieldCheckmark />
                </span>
                <span className="text-green-500 font-bold">
                  {property?.landlord_id?.trustScore !== undefined
                    ? Number(property.landlord_id.trustScore).toFixed(1)
                    : "0.0"}{" "}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col p-2 justify-center">
            <p className="text-right text-lg text-[#727986] font-bold">
              <span className="text-yellow-400 mx-1">★ {property.averageRating ? property.averageRating.toFixed(1) : "0.0"}{" "}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
