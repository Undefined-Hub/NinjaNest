import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import cities from '../../services/cities.json';

const Step1BasicInfo = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); 

  // Handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setValue('location', value); // Update form value

    if (value.trim()) {
      const filteredCities = cities
        .filter(city => 
          city.District.toLowerCase().includes(value.toLowerCase())
        )
        .map(city => city.District)
        // Remove duplicates
        .filter((city, index, self) => self.indexOf(city) === index)
        .slice(0, 5); // Limit to 5 suggestions
      
      setSuggestions(filteredCities);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setValue('location', suggestion);
    setShowSuggestions(false);
  };

  const propertyType = watch('propertyType');
  const flatType = watch('flatType');

  useEffect(() => {
    if (propertyType === 'Room') {
      setValue('flatType', '');
    } else if (propertyType === 'Flat') {
      setValue('roomDetails', { beds: '', occupiedBeds: '' });
    }
  }, [propertyType, setValue]);

  const flatOptions = ['1BHK', '2BHK', '3BHK'];

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Property Title</label>
        <input
          type="text"
          {...register('title', { required: true })}
          className="w-full p-2 rounded bg-cards-bg border border-gray-700/30 focus:outline-none focus:border-[#7c3bf1]"
          placeholder="Enter property title"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      {/* Location Input with Autocomplete */}
      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <div className="relative">
          <input
            type="text"
            {...register('location', { required: true })}
            className="w-full p-2 rounded bg-cards-bg border border-gray-700/30 focus:outline-none focus:border-[#7c3bf1]"
            placeholder="Enter location"
            onChange={handleLocationInputChange}
            value={watch('location')}
          />
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionRef}
              className="absolute left-0 right-0 mt-1 bg-cards-bg border border-gray-700/30 rounded-lg overflow-hidden z-10"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-sm text-gray-300 hover:bg-[#222b39] cursor-pointer transition-colors duration-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      </div>

      {/* Address Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Complete Address</label>
        <textarea
          {...register('address', { required: true })}
          className="w-full p-2 rounded bg-cards-bg border border-gray-700/30 focus:outline-none focus:border-[#7c3bf1]"
          placeholder="Enter complete address"
          rows={3}
        />
        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
      </div>

      {/* Property Type */}
      <div className="flex flex-col">
        <label className="text-sm text-secondary-text">Room Type</label>
        <select
          {...register('propertyType', { required: 'Room Type is required' })}
          className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
        >
          <option value="" disabled>Select</option>
          <option value="Room">Room</option>
          <option value="Flat">Flat</option>
        </select>
        {errors.propertyType && (
          <p className="text-red-500 text-sm">{errors.propertyType.message}</p>
        )}
      </div>

      {/* Room Details */}
      {propertyType === 'Room' && (
        <>
          <div className="flex flex-col">
            <label className="text-sm text-secondary-text">Total Beds</label>
            <input
              type="number"
              {...register('roomDetails.beds', {
                required: 'Total beds is required',
                min: { value: 1, message: 'At least 1 bed is required' },
              })}
              min={1}
              placeholder="e.g. 3"
              className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
            />
            {errors.roomDetails?.beds && (
              <p className="text-red-500 text-sm">{errors.roomDetails.beds.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-secondary-text">Occupied Beds</label>
            <input
              type="number"
              {...register('roomDetails.occupiedBeds', {
                required: 'Occupied beds is required',
                min: { value: 0, message: 'Cannot be negative' },
              })}
              placeholder="e.g. 1"
              min={0}
              max={watch('roomDetails.beds')}
              disabled={!watch('roomDetails.beds')}
              className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
            />
            {errors.roomDetails?.occupiedBeds && (
              <p className="text-red-500 text-sm">{errors.roomDetails.occupiedBeds.message}</p>
            )}
          </div>
        </>
      )}

      {/* Flat Type */}
      {propertyType === 'Flat' && (
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm text-secondary-text">Flat Type</label>
          <div className="flex gap-2 mt-1">
            {flatOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setValue('flatType', option)}
                className={`px-4 py-1 rounded-full border transition ${
                  flatType === option
                    ? 'bg-main-purple text-white'
                    : 'border-main-purple text-main-purple hover:bg-main-purple hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.flatType && <p className="text-red-500 text-sm mt-1">{errors.flatType.message}</p>}
        </div>
      )}

      {/* Area Input */}
      {/* <div>
        <label className="block text-sm font-medium mb-2">Area (in sq ft)</label>
        <input
          type="number"
          {...register('area', { required: true })}
          className="w-full p-2 rounded bg-cards-bg border border-gray-700/30 focus:outline-none focus:border-[#7c3bf1]"
          placeholder="Enter area in square feet"
        />
        {errors.area && <p className="text-red-500 text-sm">{errors.area.message}</p>}
      </div> */}

       {/* Description */}
      <div className="flex flex-col sm:col-span-2">
        <label className="text-sm text-secondary-text">Description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
          rows={4}
          placeholder="e.g. 'This is a spacious 2BHK flat with all amenities.'"
          maxLength={500}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
};

export default Step1BasicInfo;
