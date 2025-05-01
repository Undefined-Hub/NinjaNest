// src/components/steps/Step2Pricing.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';

const Step2Pricing = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="sm:col-span-2 flex items-center gap-3 mt-2">
        <label className="text-sm text-secondary-text">Is Available?</label>
        <input
          type="checkbox"
          {...register('isAvailable')}
          className="h-5 w-5 text-main-purple"
        />
      </div>
    </div>
  );
};

export default Step2Pricing;
