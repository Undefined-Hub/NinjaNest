import React, { useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import axios from 'axios';

// Fix default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const { BaseLayer } = LayersControl;

const CLOUD_NAME = 'dan454ywo';
const UPLOAD_PRESET = 'NinjaNest';

// Cloudinary upload function
const handleImageUpload = async (event, setValue, watch, mainImage) => {
  const files = Array.from(event.target.files);
  const uploadedImages = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'propertyImages'); // Optional: specify folder name

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
      uploadedImages.push(res.data.secure_url);
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
    }
  }

  const currentImages = watch('images') || [];
  const allImages = [...currentImages, ...uploadedImages];

  setValue('images', allImages, { shouldValidate: true });
  if (!mainImage && uploadedImages.length > 0) {
    setValue('mainImage', uploadedImages[0]);
  }
};

// Delete image
const handleDeleteImage = (imageUrl, images, setValue, mainImage) => {
  const filtered = images.filter(img => img !== imageUrl);
  setValue('images', filtered, { shouldValidate: true });
  if (mainImage === imageUrl) {
    setValue('mainImage', filtered[0] || null);
  }
};

const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect({ lat, lng });
    },
  });
  return null;
};

const SearchControl = ({ onSelect }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoClose: true,
      keepResult: true,
      showMarker: true,
      showPopup: false,
      animateZoom: true,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      const { location } = result;
      onSelect({ lat: location.y, lng: location.x });
    });

    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

const Step4MediaLocation = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const images = watch('images') || [];
  const mainImage = watch('mainImage');
  const latitude = parseFloat(watch('latitude')) || 18.5204; // Default Pune
  const longitude = parseFloat(watch('longitude')) || 73.8567;

  const fileInputRef = useRef();

  // Handle Image Upload
  const handleImageUploadWrapper = (event) => handleImageUpload(event, setValue, watch, mainImage);

  const handleSelectMainImage = (image) => {
    setValue('mainImage', image);
  };

  const handleMapClick = ({ lat, lng }) => {
    setValue('latitude', lat.toFixed(6), { shouldValidate: true });
    setValue('longitude', lng.toFixed(6), { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Image Upload */}
      <div>
        <label className="text-sm text-secondary-text">Upload Images</label>
        <div
          className="bg-cards-bg border-2 border-dashed border-main-purple rounded-xl p-6 text-center text-primary-text cursor-pointer mt-2"
          onClick={() => fileInputRef.current.click()}
        >
          <p className="text-sm">Drag & drop images here or click to upload</p>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleImageUploadWrapper}
            className="hidden"
          />
        </div>

        {/* Preview Images */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`uploaded-${index}`}
                className={`w-24 h-24 rounded object-cover border cursor-pointer ${
                  img === mainImage ? 'border-4 border-main-purple' : 'border-gray-300'
                }`}
                onClick={() => handleSelectMainImage(img)}
              />
              {img === mainImage && (
                <div className="absolute top-0 left-0 w-full h-full bg-main-purple bg-opacity-50 flex items-center justify-center text-white text-sm rounded">
                  Main
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDeleteImage(img, images, setValue, mainImage)}
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs hidden group-hover:block"
                title="Delete image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {errors.images && (
          <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>
        )}
      </div>

      {/* Map Location Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-secondary-text">Select Property Location</label>
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '300px', width: '100%', borderRadius: '1rem' }}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Street View">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </BaseLayer>
            <BaseLayer name="Satellite View">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, etc.'
              />
            </BaseLayer>
          </LayersControl>

          <Marker position={[latitude, longitude]} />
          <LocationPicker onSelect={handleMapClick} />
          <SearchControl onSelect={handleMapClick} />
        </MapContainer>
      </div>

      {/* Coordinates */}
      <div className="flex gap-4 mt-2">
        <div className="w-1/2">
          <label className="text-sm text-secondary-text">Latitude</label>
          <input
            type="text"
            {...register('latitude', { required: 'Latitude is required' })}
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text mt-1 w-full"
          />
          {errors.latitude && (
            <span className="text-red-500 text-xs">{errors.latitude.message}</span>
          )}
        </div>
        <div className="w-1/2">
          <label className="text-sm text-secondary-text">Longitude</label>
          <input
            type="text"
            {...register('longitude', { required: 'Longitude is required' })}
            className="bg-cards-bg px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-main-purple text-primary-text mt-1 w-full"
          />
          {errors.longitude && (
            <span className="text-red-500 text-xs">{errors.longitude.message}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4MediaLocation;
