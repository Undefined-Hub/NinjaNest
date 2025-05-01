import React, { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    amenities: [],
    minRent: "",
    maxRent: "",
    roomType: [],
    isVerified: null,
    isAvailable: null,
    minRating: "",
    minTrustScore: "",
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
            roomType,
            isVerified,
            isAvailable,
            minRating,
            minTrustScore,
          } = filters;

          return (
            (!location || p.location.toLowerCase().includes(location.toLowerCase())) &&
            (amenities.length === 0 || amenities.every((a) => p.amenities.includes(a))) &&
            (!minRent || p.rent >= parseInt(minRent)) &&
            (!maxRent || p.rent <= parseInt(maxRent)) &&
            (roomType.length === 0 || roomType.includes(p.roomType)) &&
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
    <div className="w-screen bg-[#111827] p-10 md:py-14 md:px-6 flex flex-col md:flex-row md:justify-center">

      <div className="bg-[#18212f] md:w-64 h-fit rounded-2xl text-white p-4 my-4">
        <Filters filters={filters} setFilters={setFilters} />
      </div>

      <div
        className="md:w-5/6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-4 md:p-4"
        id="propertiesContainer"
      >
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
      roomType: [],
      isVerified: null,
      isAvailable: null,
      minRating: "",
      minTrustScore: "",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Filters</h1>
        <button
          className="text-sm bg-[#a98cfc] px-2 rounded-full font-bold"
          onClick={resetFilters}
        >
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
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, location: e.target.value }))
          }
        />
      </div>

      {/* Room Type */}
      <div className="my-2">
        <h1 className="font-bold">Room Type</h1>
        <div className="flex flex-col gap-2 my-2">
          {["1BHK", "2BHK", "3BHK", "Flat", "Room"].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={filters.roomType.includes(type)}
                onChange={() => updateCheckboxList("roomType", type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Rent */}
      <div className="my-4">
        <h1 className="font-bold">Pricing</h1>
        <div className="flex flex-col gap-2 my-2">
          <div className="flex items-center justify-around gap-2">
            <label>Min.</label>
            <input
              type="number"
              className="w-32 rounded-lg py-1 bg-[#111827] text-center"
              placeholder="1000"
              value={filters.minRent}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minRent: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center justify-around gap-2">
            <label>Max.</label>
            <input
              type="number"
              className="w-32 rounded-lg py-1 bg-[#111827] text-center"
              placeholder="5000"
              value={filters.maxRent}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxRent: e.target.value }))
              }
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
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, minRating: e.target.value }))
          }
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
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, minTrustScore: e.target.value }))
          }
        />
      </div>
    </>
  );
};

export default Properties;
