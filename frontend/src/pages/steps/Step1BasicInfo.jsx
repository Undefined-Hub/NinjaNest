import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

const Step1BasicInfo = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Title */}
      <div className="flex flex-col">
        <label className="text-sm text-secondary-text">Title</label>
        <input
          {...register('title', { required: 'Title is required' })}
          className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      {/* Location */}
      <div className="flex flex-col">
        <label className="text-sm text-secondary-text">Location</label>
        <select
          {...register('location', { required: 'Location is required' })}
          className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
        >
          <option value="">Select</option>
          <option value="Pune">Pune</option>
          <option value="Nagpur">Nagpur</option>
          <option value="Mumbai">Mumbai</option>
        </select>
        {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      </div>

      {/* Address */}
      <div className="flex flex-col sm:col-span-2">
        <label className="text-sm text-secondary-text">Address</label>
        <input
          {...register('address', { required: 'Address is required' })}
          className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
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
          <option value="">Select</option>
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

      {/* Description */}
      <div className="flex flex-col sm:col-span-2">
        <label className="text-sm text-secondary-text">Description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text"
          rows={4}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>
    </div>
  );
};

export default Step1BasicInfo;
    