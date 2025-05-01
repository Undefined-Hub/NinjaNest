import React, { useState } from 'react';

const steps = ['Basic Info', 'Pricing & Availability', 'Features', 'Media & Location', 'Review'];

const AddProperty = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  const updateFormData = (newData) => setFormData({ ...formData, ...newData });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = () => {
    console.log('Final Form Data:', formData);
  };

  const Input = ({ label, name, type = 'text', placeholder }) => (
    <div className="flex flex-col gap-1">
      <label className="text-secondary-text text-sm">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="bg-cards-bg text-primary-text px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple"
        onChange={(e) => updateFormData({ [name]: e.target.value })}
        value={formData[name] || ''}
      />
    </div>
  );

  const Step1 = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="Title" name="title" placeholder="e.g. Cozy 2BHK in Pune" />
      <Input label="Location" name="location" placeholder="e.g. Pune" />
      <Input label="Address" name="address" placeholder="Street address" />
      <Input label="Room Type" name="roomType" placeholder="e.g. 2BHK" />
      <div className="sm:col-span-2">
        <Input label="Description" name="description" placeholder="Write about your property..." />
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="Rent (₹)" name="rent" type="number" placeholder="e.g. 15000" />
      <Input label="Deposit (₹)" name="deposit" type="number" placeholder="e.g. 30000" />
      <div className="flex items-center gap-2">
        <label className="text-secondary-text">Is Available?</label>
        <input
          type="checkbox"
          checked={formData.isAvailable || false}
          onChange={(e) => updateFormData({ isAvailable: e.target.checked })}
        />
      </div>
    </div>
  );

  const Step3 = () => {
    const amenities = ['WiFi', 'AC', 'Parking', 'Geyser', 'TV'];
    return (
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-secondary-text">Amenities</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {amenities.map((item) => (
              <label
                key={item}
                className="bg-cards-bg text-primary-text px-3 py-1 rounded cursor-pointer hover:bg-main-purple/40"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.amenities?.includes(item) || false}
                  onChange={(e) => {
                    const selected = formData.amenities || [];
                    updateFormData({
                      amenities: e.target.checked
                        ? [...selected, item]
                        : selected.filter((a) => a !== item),
                    });
                  }}
                />
                {item}
              </label>
            ))}
          </div>
        </div>
        <Input label="Average Rating" name="rating" type="number" placeholder="1-5" />
      </div>
    );
  };

  const Step4 = () => (
    <div className="flex flex-col gap-4">
      <Input label="Image URL" name="image" placeholder="e.g. https://imagehost.com/photo.jpg" />
      <Input label="Latitude" name="lat" placeholder="e.g. 18.5204" />
      <Input label="Longitude" name="lng" placeholder="e.g. 73.8567" />
    </div>
  );

  const Review = () => (
    <div className="bg-cards-bg p-4 rounded text-primary-text">
      <pre className="whitespace-pre-wrap break-words">{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return <Step1 />;
      case 1:
        return <Step2 />;
      case 2:
        return <Step3 />;
      case 3:
        return <Step4 />;
      case 4:
        return <Review />;
      default:
        return null;
    }
  };

  const completionPercentage = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-main-bg text-primary-text py-10 px-6 sm:px-20">
      <div className="max-w-4xl mx-auto bg-sub-bg p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6">Add New Property</h1>
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                i === step
                  ? 'bg-main-purple text-white'
                  : formData[steps[i].toLowerCase().replace(/ & /g, '').replace(/ /g, '')]
                  ? 'bg-green-500 text-white'
                  : 'bg-cards-bg text-tertiary-text'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        <div className="mb-6">{renderStep()}</div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary-text">{completionPercentage}% Completed</span>
          <div className="flex gap-4">
            {step > 0 && (
              <button onClick={prevStep} className="px-6 py-2 rounded bg-logout-red text-logout-text">
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button onClick={nextStep} className="ml-auto px-6 py-2 rounded bg-main-purple text-white">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="ml-auto px-6 py-2 rounded bg-logo-blue text-white">
                Submit Property
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;