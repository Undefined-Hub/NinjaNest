import React, { useEffect, useState, useRef } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import Step4MediaLocation from './steps/Step4MediaLocation';
import { FiEye } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import cities from '../services/cities.json';

import { useNavigate } from 'react-router-dom';
const BasicInfoSection = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationRef = useRef(null);
  const locationValue = watch('location');

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
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setValue('location', value);

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
    setValue('location', suggestion);
    setShowLocationSuggestions(false);
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
    <div className="bg-sub-bg rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="flex flex-col">
          <label className="text-sm text-secondary-text">Title</label>
          <input
            {...register('title')}
            placeholder='e.g. "Spacious Room in Pune"'
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Location with Autocomplete */}
        <div className="flex flex-col relative" ref={locationRef}>
          <label className="text-sm text-secondary-text">Location</label>
          <input
            type="text"
            placeholder="Enter city name"
            value={locationValue || ''}
            onChange={handleLocationChange}
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
          />
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-[100%] mt-1 bg-cards-bg border border-gray-700/30 rounded-lg overflow-hidden z-50">
              {locationSuggestions.map((suggestion, index) => (
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
          {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
        </div>

        {/* Address */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm text-secondary-text">Address</label>
          <input
            {...register('address')}
            placeholder='e.g. "123 Main St, Pune"'
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
        </div>

        {/* Property Type */}
        <div className="flex flex-col">
          <label className="text-sm text-secondary-text">Room Type</label>
          <select
            {...register('propertyType')}
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
          >
            <option value="" disabled >Select</option>
            <option value="Room">Room</option>
            <option value="Flat">Flat</option>
          </select>
          {errors.propertyType && <p className="text-red-500 text-sm">{errors.propertyType.message}</p>}
        </div>

        {/* Room Details */}
        {propertyType === 'Room' && (
          <>
            <div className="flex flex-col">
              <label className="text-sm text-secondary-text">Total Beds</label>
              <input
                type="number"
                {...register('roomDetails.beds')}
                placeholder="e.g. 4"
                min={1}
                className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
              />
              {errors.roomDetails?.beds && <p className="text-red-500 text-sm">{errors.roomDetails.beds.message}</p>}
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-secondary-text">Occupied Beds</label>
              <input
                type="number"
                {...register('roomDetails.occupiedBeds')}
                placeholder="e.g. 2"
                min={0}
                max={watch('roomDetails.beds') || 0}
                className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
              />
              {errors.roomDetails?.occupiedBeds && <p className="text-red-500 text-sm">{errors.roomDetails.occupiedBeds.message}</p>}
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

        {/* Description */}
        <div className="flex flex-col sm:col-span-2">
          <label className="text-sm text-secondary-text">Description</label>
          <textarea
            {...register('description')}
            placeholder='e.g. "This is a spacious room with all amenities."'
            maxLength={500}
            minLength={3}
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
            rows={4}
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
      </div>
    </div>
  );
};




const PricingSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-sub-bg rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Pricing & Availability</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rent */}
        <div className="flex flex-col">
          <label className="text-sm text-secondary-text">Rent (₹)</label>
          <input
            type="number"
            placeholder="e.g. 4500"
            {...register('rent', { required: 'Rent is required' })}
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
          />
          {errors.rent && <span className="text-red-500 text-xs">{errors.rent.message}</span>}
        </div>

        {/* Deposit */}
        <div className="flex flex-col">
          <label className="text-sm text-secondary-text">Deposit (₹)</label>
          <input
            type="number"
            placeholder="e.g. 7000"
            {...register('deposit', { required: 'Deposit is required' })}
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
          />
          {errors.deposit && <span className="text-red-500 text-xs">{errors.deposit.message}</span>}
        </div>

        {/* Availability */}
        <div className="sm:col-span-2 flex items-center gap-3 mt-2">
          <label className="text-sm text-secondary-text">Is Available?</label>
          <input
            type="checkbox"
            {...register('isAvailable')}
            className="h-5 w-5 text-main-purple"
          />
        </div>
      </div>
    </div>
  );
};



const amenitiesList = [
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

const FeaturesSection = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedAmenities = watch('amenities') || [];

  const handleAmenityToggle = (amenity) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setValue('amenities', updated, { shouldValidate: true });
  };

  return (
    <div className="bg-sub-bg rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Features & Amenities</h2>

    {/* Amenities */}
        <div className="mb-6">
          <label className="text-sm text-secondary-text">Amenities (Select all that apply)</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {amenitiesList.map((amenity) => (
            <button
              key={amenity}
              type="button"
              className={`px-4 py-2 rounded-full border transition ${
                selectedAmenities.includes(amenity)
                ? 'bg-main-purple text-white'
                : 'bg-cards-bg text-primary-text'
              }`}
              onClick={() => handleAmenityToggle(amenity)}
            >
              {amenity}
            </button>
            ))}
          </div>
          {errors.amenities && (
            <p className="text-red-500 text-xs mt-1">{errors.amenities.message}</p>
          )}
        </div>

        {/* Area */}
      <div className="mb-6">
        <label className="text-sm text-secondary-text">Area (e.g. 220 sq. ft)</label>
        <input
          type="text"
          placeholder="e.g. 220 sq. ft"
          {...register('area', { required: 'Area is required' })}
          className="mt-1 bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text w-full"
        />
        {errors.area && (
          <span className="text-red-500 text-xs">{errors.area.message}</span>
        )}
      </div>

      {/* Average Rating */}
      {/* <div>
        <label className="text-sm text-secondary-text">Average Rating (1 to 5)</label>
        <input
          type="number"
          step="0.1"
          placeholder="e.g. 4.5"
          min={1}
          max={5}
          {...register('averageRating', {
            min: { value: 1, message: 'Minimum rating is 1' },
            max: { value: 5, message: 'Maximum rating is 5' },
          })}
          className="mt-1 bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text w-full"
        />
        {errors.averageRating && (
          <span className="text-red-500 text-xs">{errors.averageRating.message}</span>
        )}
      </div> */}
    </div>
  );
};


const MediaLocationSection = () => {
  return (
    <div className="bg-sub-bg p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-heading">Media & Location</h2>
      <Step4MediaLocation formType={"edit"} />
    </div>
  );
};

export default function EditProperty() {
  const navigate = useNavigate();
  const methods = useForm({
    defaultValues: {
      title: '',
      location: '',
      address: '',
      propertyType: '',
      roomDetails: {
        beds: '',
        occupiedBeds: '',
      },
      flatType: '',
      description: '',
      rent: '',
      deposit: '',
      isAvailable: false,
      amenities: [],
      area: '',
      averageRating: '',
      images: [],
      mainImage: '',
      latitude: '',
      longitude: '',
    },
  });

  const { handleSubmit } = methods;
const onSubmit = (data) => {
    // Convert roomDetails, rent, and deposit to numbers
    console.log('Form data before formatting:', data);
    const formattedData = {
        ...data,
        landlord_name: data.landlord_id?.name,
        roomDetails: {
            beds: Number(data.roomDetails.beds),
            occupiedBeds: Number(data.roomDetails.occupiedBeds),
        },
        rent: Number(data.rent),
        deposit: Number(data.deposit),
    };

    console.log('Saving property:', formattedData);
    axios.put(`${import.meta.env.VITE_SERVER_URL}/api/property/${propertyId}`, formattedData, {
                    headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
            })
           .then(() => {
                toast.success('Property updated successfully!');
                navigate(`/explore/property/${propertyId}`);
                })
                .catch(() => {
                toast.error('Failed to update property. Please try again.');
                });


    // Add update API call here
};

  const handleDeleteProperty = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this property?");
    if (confirmDelete) {
      console.log('Deleting property...');
      // Add delete API call here
    }
  };

  const handlePreview = () => {
    console.log('Previewing property...');
    // You could open a modal or navigate to a preview route
  };

  const { propertyId } = useParams(); // Assuming you're using react-router-dom for routing
  const { reset } = methods;

  useEffect(() => {
    async function fetchProperty() {
      try {
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/property/${propertyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch property');
        const data = await res.json();
        console.log('Fetched property data:', data);
        // ✅ Ensure nested defaults exist
        if (!data.property.roomDetails) {
          data.property.roomDetails = { beds: '', occupiedBeds: '' };
        }
        reset(data.property); // Populate the form with fetched data
      } catch (err) {
        console.error('Error fetching property:', err);
        // Optionally show a toast or fallback message here
      }
    }

    if (propertyId) fetchProperty();
  }, [propertyId, reset]);


  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-main-bg text-primary-text py-10 px-6 sm:px-20">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 max-w-4xl mx-auto space-y-5"
        >
          {/* Header with Preview Button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Edit Property</h1>
            {/* <button
              type="button"
              onClick={handlePreview}
              className="flex items-center justify-center gap-2  px-6 py-2  bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              <FiEye className="text-lg" />
              Preview
            </button> */}
          </div>

          <BasicInfoSection />
          <PricingSection />
          <FeaturesSection />
          <MediaLocationSection />

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-10">
            <button
              type="button"
              onClick={handleDeleteProperty}
              className="px-6 py-2 rounded bg-logout-red text-logout-text transition"
            >
              Delete Property
            </button>

            <button
              type="submit"
              className="bg-main-purple text-white px-6 py-2 rounded hover:bg-purple-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}