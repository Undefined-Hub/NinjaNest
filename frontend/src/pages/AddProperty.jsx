import React, { useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { FaFileAlt, FaDollarSign, FaCogs, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';  // Icons for steps
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Pricing from './steps/Step2Pricing';
import Step3Features from './steps/Step3Features';
import Step4MediaLocation from './steps/Step4MediaLocation';
import { toast } from 'react-hot-toast';

const AddProperty = () => {
  const [step, setStep] = useState(0);
  const methods = useForm({
    defaultValues: {
      landlord_name: '',
      title: '',
      location: '',
      address: '',
      rent: '',
      deposit: '',
      isAvailable: false,
      description: '',
      amenities: [],
      images: [],
      mainImage: '',
      latitude: '',
      longitude: '',
      propertyType: '',
      flatType: '',
      roomDetails: { beds: '', occupiedBeds: '' },
      area: '',
      isVerified: false,
      averageRating: '',
    },
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const userState = localStorage.getItem('userState');
      const parsedState = JSON.parse(userState);
      const name = parsedState.user.user.name;
  
      const preparedData = {
        ...data,
        rent: Number(data.rent),
        deposit: Number(data.deposit),
        averageRating: Number(data.averageRating),
        roomDetails: {
          beds: Number(data.roomDetails.beds),
          occupiedBeds: Number(data.roomDetails.occupiedBeds),
        },
        landlord_name: name,
      };
  
      const loadingToast = toast.loading('Listing property...');
  
      const response = await fetch('http://localhost:3000/api/property/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(preparedData),
      });
  
      toast.dismiss(loadingToast);
  
      if (response.ok) {
        toast.success('Property listed successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error('Failed to list the property. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please check the console.');
    }
  };

  // Check if current step is completed
  const isStepCompleted = () => {
    if (step === 0) {
      return methods.formState.isValid && methods.formState.isDirty;
    }
    if (step === 1) {
      return methods.formState.isValid && methods.formState.isDirty;
    }
    if (step === 2) {
      return methods.formState.isValid && methods.formState.isDirty;
    }
    if (step === 3) {
      return methods.formState.isValid && methods.formState.isDirty;
    }
    if (step === 4) {
      return true; // Always enable next for review step
    }
    return false;
  };

  const getStepClass = (index) => {
    if (index < step) return 'text-main-purple';
    if (index === step) return 'text-white bg-main-purple';
    return 'text-gray-500';
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-main-bg text-primary-text py-10 px-6 sm:px-20">
        <div className="max-w-4xl mx-auto bg-sub-bg p-8 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold mb-6">Add New Property</h1>

          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex flex-col items-center justify-center relative">
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${getStepClass(
                    index
                  )} ${index < step ? 'bg-main-purple border-main-purple' : 'border-main-purple'}`}
                >
                  {index < step ? (
                    <FaCheckCircle className="text-white w-6 h-6" />
                  ) : index === step ? (
                    index === 0 ? (
                      <FaFileAlt className="w-6 h-6 text-white" />
                    ) : index === 1 ? (
                      <FaDollarSign className="w-6 h-6 text-white" />
                    ) : index === 2 ? (
                      <FaCogs className="w-6 h-6 text-white" />
                    ) : index === 3 ? (
                      <FaMapMarkerAlt className="w-6 h-6 text-white" />
                    ) : (
                      <FaCheckCircle className="w-6 h-6 text-white" />
                    )
                  ) : index === 0 ? (
                    <FaFileAlt className="w-6 h-6 text-gray-500" />
                  ) : index === 1 ? (
                    <FaDollarSign className="w-6 h-6 text-gray-500" />
                  ) : index === 2 ? (
                    <FaCogs className="w-6 h-6 text-gray-500" />
                  ) : index === 3 ? (
                    <FaMapMarkerAlt className="w-6 h-6 text-gray-500" />
                  ) : (
                    <FaCheckCircle className="w-6 h-6 text-gray-500" />
                  )}
                </div>

                {/* Connecting Line */}
                {index < 4 && (
                  <div className="absolute top-5 left-16 w-[120px] -z-1 h-1 bg-main-purple"></div>
                )}

                {/* Step Label */}
                <div className="mt-2 text-center text-sm">
                  {index === 0 && 'Basic Info'}
                  {index === 1 && 'Pricing'}
                  {index === 2 && 'Features'}
                  {index === 3 && 'Media'}
                  {index === 4 && 'Review'}
                </div>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {step === 0 && <Step1BasicInfo />}
            {step === 1 && <Step2Pricing />}
            {step === 2 && <Step3Features />}
            {step === 3 && <Step4MediaLocation />}
            {step === 4 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold mb-4">Review Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Display all the form data here */}
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Title:</strong> <span className="text-gray-300">{methods.getValues('title')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Location:</strong> <span className="text-gray-300">{methods.getValues('location')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Address:</strong> <span className="text-gray-300">{methods.getValues('address')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Rent:</strong> <span className="text-gray-300">{methods.getValues('rent')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Deposit:</strong> <span className="text-gray-300">{methods.getValues('deposit')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Amenities:</strong> <span className="text-gray-300">{methods.getValues('amenities').join(', ')}</span>
                  </div>

                  {/* Images Section - Spans full row and larger images */}
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text col-span-2">
                    <strong>Images:</strong>
                    <div className="flex flex-wrap gap-4 mt-2 justify-center">
                      {methods.getValues('images').map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`img-${index}`}
                          className="h-40 w-40 object-cover rounded-lg shadow-lg"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Latitude:</strong> <span className="text-gray-300">{methods.getValues('latitude')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Longitude:</strong> <span className="text-gray-300">{methods.getValues('longitude')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Property Type:</strong> <span className="text-gray-300">{methods.getValues('propertyType')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Flat Type:</strong> <span className="text-gray-300">{methods.getValues('flatType')}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Room Details:</strong>
                    <div className="text-gray-300">Beds: {methods.getValues('roomDetails.beds')}</div>
                    <div className="text-gray-300">Occupied: {methods.getValues('roomDetails.occupiedBeds')}</div>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Area:</strong> <span className="text-gray-300">{methods.getValues('area')} sq ft</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Verified:</strong> <span className="text-gray-300">{methods.getValues('isVerified') ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="bg-cards-bg px-6 py-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text">
                    <strong>Average Rating:</strong> <span className="text-gray-300">{methods.getValues('averageRating')}</span>
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <div>
              {step > 0 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-2 rounded bg-logout-red text-logout-text"
                >
                  Back
                </button>
              )}
            </div>

            <div>
              {step < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepCompleted()}
                  className={`ml-auto px-6 py-2 rounded ${!isStepCompleted() ? 'bg-gray-300' : 'bg-main-purple'} text-white`}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={methods.handleSubmit(handleSubmit)}
                  className="ml-auto px-6 py-2 rounded bg-logo-blue text-white"
                >
                  Final Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default AddProperty;
