import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import cities from "../services/cities.json";
import PropertyCard from "../components/PropertyCard";

function ExplorePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Get all relevant filters from URL
  const initialLocation = params.get("location") || "";
  const initialMinRent = params.get("minRent") || "";
  const initialMaxRent = params.get("maxRent") || "";

  const [properties, setProperties] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 3,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Use URL params as initial filter values
  const [filters, setFilters] = useState({
    location: initialLocation,
    amenities: [],
    minRent: initialMinRent,
    maxRent: initialMaxRent,
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

    const url = `${import.meta.env.VITE_SERVER_URL}/api/property/?${queryParams.toString()}`;
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
        <div className="w-5/6 flex flex-col">
          {/* Active Filters - new component */}
          <ActiveFilters filters={filters} setFilters={setFilters} />

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
            <>
              <div className="text-gray-400 mt-4 pl-4 text-xl">
                Found {properties.length} properties
                {filters.location && ` in ${filters.location}`}
              </div>
              <div className="flex flex-wrap gap-5 items-start justify-start md:p-4 max-h-[110vh] overflow-y-auto" id="propertiesContainer">
                {properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            </>
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
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationRef = useRef(null);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, location: value }));

    if (value.trim()) {
      const filteredCities = cities
        .filter(city => 
          city.District.toLowerCase().includes(value.toLowerCase())
        )
        .map(city => city.District)
        // Remove duplicates
        .filter((city, index, self) => self.indexOf(city) === index)
        .slice(0, 5); // Limit to 5 suggestions
      
      setLocationSuggestions(filteredCities);
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setFilters(prev => ({ ...prev, location: suggestion }));
    setShowLocationSuggestions(false);
  };

  const updateCheckboxList = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const amenities = [
    "Wi-Fi",
    "Bed",
    "Study Table",
    "Wardrobe",
    "Ceiling Fan",
    "Air Conditioning",
    "Attached Bathroom",
    "Geyser",
    "24/7 Water Supply",
    "Washing Machine",
    "Refrigerator",
    "Kitchen Access",
    "Power Backup",
    "Two-Wheeler Parking",
    "CCTV Surveillance",
    "Drinking Water (RO)",
    "Electricity Included"
  ];

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
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-bold">Filters</h1>
        <button className="text-sm bg-[#a98cfc] px-3 py-1 rounded-full font-bold hover:bg-[#9371fc] transition-colors" onClick={resetFilters}>
          Reset
        </button>
      </div>

      {/* Filter sections with consistent spacing */}
      <div className="space-y-6"> {/* Main container with consistent spacing */}
        {/* Location with Autocomplete */}
        <div className="filter-section relative" ref={locationRef}>
          <h2 className="font-bold text-center mb-2">Location</h2>
          <input
            type="text"
            placeholder="e.g. Mumbai"
            className="w-full rounded-lg py-2 px-3 bg-[#111827] focus:outline-none focus:ring-1 focus:ring-[#a98cfc]"
            value={filters.location}
            onChange={handleLocationInputChange}
          />
          {/* Suggestions Dropdown */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-[#111827] border border-gray-700/30 rounded-lg overflow-hidden z-10">
              {locationSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-3 py-2 text-sm text-gray-300 hover:bg-[#1c2739] cursor-pointer transition-colors duration-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Property Type */}
        <div className="filter-section">
          <h2 className="font-bold text-center mb-2">Property Type</h2>
          <div className="flex gap-4 justify-around">
            {["Flat", "Room"].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="w-4 h-4 accent-violet-600"
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
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Flat Type - conditional */}
        {filters.propertyType === "Flat" && (
          <div className="filter-section">
            <h2 className="font-bold text-center mb-2">Flat Type</h2>
            <div className="space-y-2">
              {["1BHK", "2BHK", "3BHK"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-violet-600"
                    checked={filters.flatType.includes(type)}
                    onChange={() => updateCheckboxList("flatType", type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Room Details - conditional */}
        {filters.propertyType === "Room" && (
          <div className="filter-section">
            <h2 className="font-bold text-center mb-2">Room Details</h2>
            <div className="space-y-3">
              <label className="flex flex-col">
                <span className="text-sm mb-1">Total Beds</span>
                <input
                  type="number"
                  className="w-full rounded-lg py-2 px-3 bg-[#111827] focus:outline-none focus:ring-1 focus:ring-[#a98cfc]"
                  placeholder="e.g. 3"
                  value={filters.totalBeds}
                  onChange={(e) => setFilters((prev) => ({ ...prev, totalBeds: e.target.value }))}
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm mb-1">Occupied Beds</span>
                <input
                  type="number"
                  className="w-full rounded-lg py-2 px-3 bg-[#111827] focus:outline-none focus:ring-1 focus:ring-[#a98cfc]"
                  placeholder="e.g. 1"
                  value={filters.occupiedBeds}
                  onChange={(e) => setFilters((prev) => ({ ...prev, occupiedBeds: e.target.value }))}
                />
              </label>
            </div>
          </div>
        )}

        {/* Rent */}
        <div className="filter-section">
          <h2 className="font-bold text-center mb-2">Pricing</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">Min.</label>
              <input
                type="number"
                className="w-32 rounded-lg py-2 px-3 bg-[#111827] text-center focus:outline-none focus:ring-1 focus:ring-[#a98cfc]"
                placeholder="1000"
                value={filters.minRent}
                onChange={(e) => setFilters((prev) => ({ ...prev, minRent: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm">Max.</label>
              <input
                type="number"
                className="w-32 rounded-lg py-2 px-3 bg-[#111827] text-center focus:outline-none focus:ring-1 focus:ring-[#a98cfc]"
                placeholder="5000"
                value={filters.maxRent}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxRent: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Availability & Verification in a row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="filter-section">
            <h2 className="font-bold text-center mb-2">Availability</h2>
            <label className="flex items-center gap-2 cursor-pointer justify-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-violet-600"
                checked={filters.isAvailable === true}
                onChange={() => updateSingleCheckbox("isAvailable", true)}
              />
              <span>Available</span>
            </label>
          </div>

          <div className="filter-section">
            <h2 className="font-bold text-center mb-2">Verification</h2>
            <label className="flex items-center gap-2 cursor-pointer justify-center">
              <input
                type="checkbox"
                className="w-4 h-4 accent-violet-600"
                checked={filters.isVerified === true}
                onChange={() => updateSingleCheckbox("isVerified", true)}
              />
              <span>Verified</span>
            </label>
          </div>
        </div>

        {/* Amenities */}
        <div className="filter-section">
          <h2 className="font-bold text-center mb-2">Amenities</h2>
          <div className="flex flex-col gap-2">
            {amenities.map((a) => (
              <label key={a} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3 h-3 accent-violet-600"
                  checked={filters.amenities.includes(a)}
                  onChange={() => updateCheckboxList("amenities", a)}
                />
                <span>{a}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating & Trust Score */}
        <div className="grid grid-cols-1 gap-4">
          <div className="filter-section">
            <h2 className="font-bold text-center mb-2">Minimum Rating</h2>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="w-full rounded-lg py-2 px-3 bg-[#111827] focus:outline-none focus:ring-1 focus:ring-[#a98cfc]"
              placeholder="e.g. 3.5"
              value={filters.minRating}
              onChange={(e) => setFilters((prev) => ({ ...prev, minRating: e.target.value }))}
            />
          </div>

          <div className="filter-section">
            <h2 className="font-bold text-center mb-2">Minimum Trust Score</h2>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="w-full rounded-lg py-2 px-3 bg-[#111827] focus:outline-none focus:ring-1 focus:ring-[#a98cfc]"
              placeholder="e.g. 2.0"
              value={filters.minTrustScore}
              onChange={(e) => setFilters((prev) => ({ ...prev, minTrustScore: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// New ActiveFilters component
const ActiveFilters = ({ filters, setFilters }) => {
  const removeFilter = (key, value) => {
    if (Array.isArray(filters[key])) {
      setFilters(prev => ({
        ...prev,
        [key]: prev[key].filter(item => item !== value)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: key === 'propertyType' ? '' : null
      }));
    }
  };

  const renderFilterValue = (key, value) => {
    if (key === 'minRent') return `Min Rent: ₹${value}`;
    if (key === 'maxRent') return `Max Rent: ₹${value}`;
    if (key === 'minRating') return `Rating: ≥${value}⭐`;
    if (key === 'minTrustScore') return `Trust Score: ≥${value}`;
    return value;
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value !== null;
    return value && value !== '';
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="bg-[#18212f] p-4 rounded-xl mt-4">
      <div className="flex flex-wrap gap-2">
        {activeFilters.map(([key, value]) => (
          Array.isArray(value) ? 
            value.map(v => (
              <span 
                key={`${key}-${v}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#222b39] text-gray-200"
              >
                {renderFilterValue(key, v)}
                <button
                  onClick={() => removeFilter(key, v)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))
          :
          <span 
            key={key}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-[#222b39] text-gray-200"
          >
            {renderFilterValue(key, value)}
            <button
              onClick={() => removeFilter(key, value)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
