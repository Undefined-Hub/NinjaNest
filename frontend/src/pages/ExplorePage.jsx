import React, { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";

function ExplorePage() {
  const [properties, setProperties] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 2,
    hasNextPage: false,
    hasPrevPage: false
  });

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
  const handlePrevious = () => {
    if (pagination.hasPrevPage) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const handleNext = () => {
    if (pagination.hasNextPage) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", pagination.currentPage);
    queryParams.append("limit", pagination.limit);

    if (filters.location) queryParams.append("location", filters.location);
    if (filters.amenities.length > 0) queryParams.append("amenities", filters.amenities.join(","));
    if (filters.minRent) queryParams.append("minRent", filters.minRent);
    if (filters.maxRent) queryParams.append("maxRent", filters.maxRent);
    if (filters.propertyType) queryParams.append("propertyType", filters.propertyType);
    if (filters.propertyType === 'Flat' && filters.flatType.length > 0) queryParams.append('flatType', filters.flatType.join(','));
    if (filters.propertyType === 'Room' && filters.totalBeds) queryParams.append('totalBeds', filters.totalBeds);
    if (filters.propertyType === 'Room' && filters.occupiedBeds) queryParams.append('occupiedBeds', filters.occupiedBeds);
    if (filters.isVerified !== null) queryParams.append("isVerified", filters.isVerified);
    if (filters.isAvailable !== null) queryParams.append("isAvailable", filters.isAvailable);
    if (filters.minRating) queryParams.append("minRating", filters.minRating);
    if (filters.minTrustScore) queryParams.append("minTrustScore", filters.minTrustScore);

    const url = `http://localhost:3000/api/property/?${queryParams.toString()}`;
    setNoResults(false);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.properties.filter((p) => {
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
        setPagination(data.pagination);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setNoResults(true);
        setProperties([]);
      });
  }, [filters, pagination.currentPage]);

  return (
    <div className="w-screen bg-[#111827] flex flex-col">
      <div className="p-10 md:py-4 md:px-5 md:gap-3 flex flex-col items-start md:flex-row md:justify-center">
        {/* Filters sidebar */}
        <div className="bg-[#18212f] md:w-1/6 h-auto rounded-2xl text-white p-4 my-4">
          <Filters filters={filters} setFilters={setFilters} />
        </div>

        {/* Properties section - make it a flex column to add pagination below */}
        {/* Properties section - make it a flex column to add pagination below */}
        <div className="w-5/6 flex flex-col">
          {/* Properties grid or No Results message */}
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-16 bg-[#18212f] rounded-xl text-white">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-xl font-semibold mb-2">No Properties Found</h3>
              <p className="text-gray-400 text-center max-w-md mb-4">
                We couldn't find any properties matching your current filters.
              </p>
              <button
                onClick={() => setFilters({
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
                })}
                className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-5 items-start justify-start md:p-4 max-h-[110vh] overflow-y-auto" id="propertiesContainer">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination controls - only show when there are results */}
          {properties.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-8 mb-4">
              <button
                onClick={handlePrevious}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition"
              >
                Previous
              </button>
              <span className="text-white font-semibold">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
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

export default ExplorePage;
