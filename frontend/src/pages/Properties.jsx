import React from "react";
import PropertyCard from "../components/PropertyCard";

function Properties() {
  return (
    <div className="w-screen bg-[#111827] p-10 md:p-14 flex flex-col md:flex-row gap-4">
      <div className="bg-[#18212f] p-6 md:w-64 h-fit rounded-2xl text-white p-4 my-4">
        <Filters />
      </div>
      <div
        className=" md:w-3/4 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-normal p-4 gap-4 flex-wrap"
        id="propertiesContainer"
      >
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
        <PropertyCard />
      </div>
    </div>
  );
}

const Filters = () => {
  return (<>
    {/* <div className="bg-[#1f2937] text-white p-4 rounded-lg w-64"> */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Filters</h1>
        <button className="text-sm bg-[#a98cfc] px-2 rounded-full font-bold">
          Reset
        </button>
      </div>

      {/* Property Type */}
      <div className="my-2">
        <h1 className="font-bold">Property Type</h1>
        <div className="flex flex-col gap-2 my-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" /> Flat
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" /> Room
          </label>
        </div>
      </div>

      {/* Pricing */}
      <div className="my-4">
        <h1 className="font-bold">Pricing</h1>
        <div className="flex flex-col gap-2 my-2">
          <div className="flex items-center justify-around gap-2">
            <label>Min.</label>
            <input
              type="number"
              className="w-32 rounded-lg py-1 bg-[#111827] text-center"
              placeholder="1000"
            />
          </div>
          <div className="flex items-center justify-around gap-2">
            <label>Max.</label>
            <input
              type="number"
              className="w-32 rounded-lg py-1 bg-[#111827] text-center"
              placeholder="5000"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="my-4">
        <h1 className="font-bold my-2">Availability</h1>
        <select className="w-full p-2 rounded-lg bg-[#111827]">
          <option>Immediate</option>
          <option>Within a month</option>
          <option>Anytime</option>
        </select>
      </div>

      {/* Furnishing */}
      <div className="my-4">
        <h1 className="font-bold">Furnishing</h1>
        <div className="flex flex-col gap-2 my-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" /> Fully Furnished
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" /> Semi-Furnished
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" /> Unfurnished
          </label>
        </div>
      </div>
    {/* </div> */}
    </>
  );
};

export default Properties;
