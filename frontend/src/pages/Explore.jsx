import React, { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";

function Explore() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    amenities: [],
    minRent: "",
    maxRent: "",
    propertyType: "",
    flatType: [],
    isVerified: null,
    isAvailable: null,
    minRating: "",
    minTrustScore: "",
    totalBeds: "",
    occupiedBeds: ""
  });

  useEffect(() => {
    fetch("http://localhost:3000/api/property/")
      .then((res) => res.json())
      .then((data) => {
        let filtered = data.properties;

        filtered = filtered.filter((p) => {
          const {
            location,
            amenities,
            minRent,
            maxRent,
            propertyType,
            flatType,
            isVerified,
            isAvailable,
            minRating,
            minTrustScore,
            totalBeds,
            occupiedBeds,
          } = filters;

          return (
            (!location || p.location.toLowerCase().includes(location.toLowerCase())) &&
            (amenities.length === 0 || amenities.every((a) => p.amenities.includes(a))) &&
            (!minRent || p.rent >= parseInt(minRent)) &&
            (!maxRent || p.rent <= parseInt(maxRent)) &&
            (!propertyType || p.propertyType === propertyType) &&
            (propertyType !== "Flat" || flatType.length === 0 || flatType.includes(p.flatType)) &&
            (propertyType !== "Room" || !totalBeds || p.roomDetails?.beds === parseInt(totalBeds)) &&
            (propertyType !== "Room" || !occupiedBeds || p.roomDetails?.occupiedBeds === parseInt(occupiedBeds)) &&
            (isVerified === null || p.isVerified === isVerified) &&
            (isAvailable === null || p.isAvailable === isAvailable) &&
            (!minRating || p.averageRating >= parseFloat(minRating)) &&
            (!minTrustScore || p.averageTrustScore >= parseFloat(minTrustScore))
          );
        });

        setProperties(filtered);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [filters]);

  return (
    <div className="w-screen bg-[#111827] p-10 md:py-4 md:px-6 md:gap-6 flex flex-col md:flex-row md:justify-center">

      <div className="bg-[#18212f] md:w-1/6 h-fit rounded-2xl text-white p-4 my-4">
        <Filters filters={filters} setFilters={setFilters} />
      </div>

      <div className="w-5/6 flex flex-wrap gap-4 md:p-4 h-[110vh] overflow-y-auto" id="propertiesContainer">
        {properties.map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
    </div>
  );
}

const Filters = ({ filters, setFilters }) => {
  const updateCheckboxList = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const updateSingleCheckbox = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field] === value ? null : value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      location: "",
      amenities: [],
      minRent: "",
      maxRent: "",
      propertyType: "",
      flatType: [],
      isVerified: null,
      isAvailable: null,
      minRating: "",
      minTrustScore: "",
      totalBeds: "",
      occupiedBeds: ""
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Filters</h1>
        <button className="text-sm bg-[#a98cfc] px-2 rounded-full font-bold" onClick={resetFilters}>
          Reset
        </button>
      </div>

      {/* Location */}
      <div className="my-2">
        <h1 className="font-bold">Location</h1>
        <input
          type="text"
          placeholder="e.g. Mumbai"
          className="w-full rounded-lg py-1 px-2 bg-[#111827]"
          value={filters.location}
          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
        />
      </div>

      {/* Property Type */}
      <div className="my-2">
        <h1 className="font-bold">Property Type</h1>
        <div className="flex gap-2 my-2 justify-around">
          {["Flat", "Room"].map((type) => (
            <label key={type} className="flex items-center gap-2 my-1">
              <input
                type="radio"
                className="w-4 h-4"
                checked={filters.propertyType === type}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    propertyType: type,
                    flatType: [],
                    totalBeds: "",
                    occupiedBeds: ""
                  }))
                }
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Flat Type */}
      {filters.propertyType === "Flat" && (
        <div className="my-2">
          <h1 className="font-bold">Flat Type</h1>
          {["1BHK", "2BHK", "3BHK"].map((type) => (
            <label key={type} className="flex items-center gap-2 my-1">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={filters.flatType.includes(type)}
                onChange={() => updateCheckboxList("flatType", type)}
              />
              {type}
            </label>
          ))}
        </div>
      )}

      {/* Room Details */}
      {filters.propertyType === "Room" && (
        <div className="my-2">
          <h1 className="font-bold">Room Details</h1>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col text-sm">
              Total Beds
              <input
                type="number"
                className="w-full rounded-lg py-1 px-2 bg-[#111827] mt-1"
                placeholder="e.g. 3"
                value={filters.totalBeds}
                onChange={(e) => setFilters((prev) => ({ ...prev, totalBeds: e.target.value }))}
              />
            </label>
            <label className="flex flex-col text-sm">
              Occupied Beds
              <input
                type="number"
                className="w-full rounded-lg py-1 px-2 bg-[#111827] mt-1"
                placeholder="e.g. 1"
                value={filters.occupiedBeds}
                onChange={(e) => setFilters((prev) => ({ ...prev, occupiedBeds: e.target.value }))}
              />
            </label>
          </div>
        </div>
      )}

      {/* Rent */}
      <div className="my-4">
        <h1 className="font-bold">Pricing</h1>
        <div className="flex flex-col gap-2 my-2">
          <div className="flex items-center justify-between gap-2">
            <label>Min.</label>
            <input
              type="number"
              className="w-32 rounded-lg py-1 bg-[#111827] text-center"
              placeholder="1000"
              value={filters.minRent}
              onChange={(e) => setFilters((prev) => ({ ...prev, minRent: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <label>Max.</label>
            <input
              type="number"
              className="w-32 rounded-lg py-1 bg-[#111827] text-center"
              placeholder="5000"
              value={filters.maxRent}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxRent: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="my-4">
        <h1 className="font-bold my-2">Availability</h1>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={filters.isAvailable === true}
            onChange={() => updateSingleCheckbox("isAvailable", true)}
          />
          Available
        </label>
      </div>

      {/* Verification */}
      <div className="my-4">
        <h1 className="font-bold my-2">Verification</h1>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={filters.isVerified === true}
            onChange={() => updateSingleCheckbox("isVerified", true)}
          />
          Verified
        </label>
      </div>

      {/* Amenities */}
      <div className="my-4">
        <h1 className="font-bold">Amenities</h1>
        <div className="flex flex-col gap-2 my-2">
          {["WiFi", "Furnished", "Parking"].map((a) => (
            <label key={a} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={filters.amenities.includes(a)}
                onChange={() => updateCheckboxList("amenities", a)}
              />
              {a}
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="my-4">
        <h1 className="font-bold">Minimum Rating</h1>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          className="w-full rounded-lg py-1 px-2 bg-[#111827]"
          placeholder="e.g. 3.5"
          value={filters.minRating}
          onChange={(e) => setFilters((prev) => ({ ...prev, minRating: e.target.value }))}
        />
      </div>

      {/* Trust Score */}
      <div className="my-4">
        <h1 className="font-bold">Minimum Trust Score</h1>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          className="w-full rounded-lg py-1 px-2 bg-[#111827]"
          placeholder="e.g. 2.0"
          value={filters.minTrustScore}
          onChange={(e) => setFilters((prev) => ({ ...prev, minTrustScore: e.target.value }))}
        />
      </div>
    </>
  );
};

export default Explore;
