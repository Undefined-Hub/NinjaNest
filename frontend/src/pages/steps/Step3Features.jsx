import React from 'react';
import { useFormContext } from 'react-hook-form';

const amenitiesList = [
  'WiFi',
  'AC',
  'Parking',
  'Geyser',
  'TV',
  'Study Tables',
  'Food Included',
  'Power Backup',
  'Security',
  'Laundry',
];

const Step3Features = () => {
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
    <div className="flex flex-col gap-6">
      {/* Amenities */}
      <div>
        <label className="text-sm text-secondary-text">Select Amenities</label>
        <div className="flex flex-wrap gap-3 mt-2">
          {amenitiesList.map((amenity) => (
            <button
              key={amenity}
              type="button"
              className={`px-4 py-2 rounded-full border ${
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
      <div>
        <label className="text-sm text-secondary-text mx-2">Area (e.g. 220 sq. ft)</label>
        <input
          type="text"
          placeholder="eg. 220 sq. ft"
          {...register('area', { required: 'Area is required' })}
          className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text mt-1"
        />
        {errors.area && (
          <span className="text-red-500 text-xs">{errors.area.message}</span>
        )}
      </div>

      {/* Average Rating (optional or required) */}
      {/* <div>
        <label className="text-sm text-secondary-text">Average Rating (1 to 5)</label>
        <input
          type="number"
          step="0.1"
          min={1}
          max={5}
          {...register('averageRating', {
            // optional — remove this line if you want it required:
            // required: 'Rating is required',
            min: { value: 1, message: 'Minimum rating is 1' },
            max: { value: 5, message: 'Maximum rating is 5' },
          })}
          className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text mt-1"
        />
        {errors.averageRating && (
          <span className="text-red-500 text-xs">{errors.averageRating.message}</span>
        )}
      </div> */}
    </div>
  );
};

export default Step3Features;
