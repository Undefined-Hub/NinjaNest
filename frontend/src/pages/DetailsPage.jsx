import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoShieldCheckmark } from "react-icons/io5";
import { toast } from 'react-hot-toast';
import house from '../assets/house.jpg';
import house1 from '../assets/house1.jpg';
import parking_svg from '../assets/parking.svg';
import wifi_svg from '../assets/wifi.svg';
import water_supply_svg from '../assets/water_supply.svg';
import garden_svg from '../assets/garden.svg';
import review_star_full from '../assets/review_star_full.svg';
import robot from '../assets/robot.svg';
import { useSelector } from 'react-redux';
import { FiEdit3 } from 'react-icons/fi';
import { BsBarChartLine } from 'react-icons/bs'
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';

const { BaseLayer } = LayersControl;
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from "../api/axiosInstance";
// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const DetailsPage = () => {
    const { user } = useSelector((state) => state.user);
    // console.log("User Details:", user.user);
    const navigate = useNavigate();
    const { propertyId } = useParams();
    const [propertyData, setPropertyData] = useState(null);
    // const [reviews, setReviewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState('ownerPrice');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleSendRentRequest = () => {
        if (selectedOption === 'customRange' && (!minPrice || !maxPrice)) {
            toast.error('Please enter a valid price range.');
            return;
        }

        const requestData = {
            propertyId,
            requestedPrice: selectedOption === 'customRange'
                ? { min: parseFloat(minPrice), max: parseFloat(maxPrice) }
                : { fixed: propertyData?.rent },
            requestorName: user.user?.name,
            ownerName: propertyData?.landlord_id.name,
            ownerId: propertyData?.landlord_id._id,
            requestorId: user.user?._id,
            status: 'Pending',
            message: `${user.user?.name} is interested to rent this property`,
        };

        // console.log('Sending Rent Request:', requestData);

        const loadingToast = toast.loading('Sending rent request...');

        axios.post('http://localhost:3000/api/request', requestData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((response) => {
                toast.dismiss(loadingToast);
                toast.success('Rent request sent successfully!');
                // console.log('Rent request response:', response.data);
                setShowModal(false);
            })
            .catch((error) => {
                toast.dismiss(loadingToast);
                toast.error('Failed to send rent request. Please try again.');
                console.error('Error sending rent request:', error);
            });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProperty = async () => {
            try {
                const response = await api.get(`/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log("Response Data:", response.data);

                setPropertyData(response.data?.property);
                // console.log(propertyData?.property?.landlord_id?.profilePicture);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Failed to load property');
            } finally {
                setLoading(false);
            }
        };

        // const fetchReviews = async () => {
        //     try {
        //         const response = await axios.get(`http://localhost:3000/api/review/${propertyId}`, {
        //             headers: {
        //                 Authorization: `Bearer ${localStorage.getItem('token')}`
        //             }
        //         });

        //         // Transform the reviews to match your expected structure
        //         const formattedReviews = response.data.reviews.map(review => ({
        //             name: review.user_id?.name || "Anonymous",
        //             rating: review.rating,
        //             feedback: review.comment
        //         }));

        //         setReviewsData(formattedReviews);
        //         console.log("Fetched Reviews:", formattedReviews);
        //         console.log("Type of Reviews:", Array.isArray(formattedReviews));
        //     } catch (err) {
        //         console.error('Error fetching reviews:', err);
        //         setError('Failed to load reviews');
        //     }
        // };

        // fetchReviews();
        fetchProperty();
    }, [propertyId]);

    const [isLandlord, setIsLandlord] = useState(false);
    useEffect(() => {
        console.log("User ID:", user.user?._id);
        console.log("Landlord ID:", propertyData?.landlord_id._id);
        if (user.user?._id === propertyData?.landlord_id._id) {
            setIsLandlord(true);
        } else {
            setIsLandlord(false);
        }
    }, [user, propertyData]);


    // console.log("Property Data:", propertyData);

    const [zoomedIndex, setZoomedIndex] = useState(null);

    return (
        <>
            {zoomedIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 ">
                    <button
                        className="absolute top-5 right-5 text-white text-3xl font-bold"
                        onClick={() => setZoomedIndex(null)}
                    >
                        &times;
                    </button>

                    <button
                        className="absolute left-5 text-white text-4xl font-bold hover:scale-110 transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            setZoomedIndex((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={zoomedIndex === 0}
                    >
                        &#8592;
                    </button>

                    <img
                        src={propertyData?.images[zoomedIndex]}
                        alt="Zoomed"
                        className="max-w-full max-h-[90%] p-3 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="absolute right-5 text-white text-4xl font-bold hover:scale-110 transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            setZoomedIndex((prev) => Math.min(propertyData?.images.length - 1, prev + 1));
                        }}
                        disabled={zoomedIndex === propertyData?.images.length - 1}
                    >
                        &#8594;
                    </button>
                </div>
            )}
            <div className='flex justify-center items-center bg-main-bg p-3'>
                <div className='mx-3 md:mx-8 lg:max-w-6xl w-full my-6 flex flex-col lg:flex-row space-y-4 lg:space-x-5 lg:space-y-0'>
                    <div className='flex flex-col w-full lg:w-2/3 space-y-4'>
                        <div className='flex p-3 bg-sub-bg rounded-xl'>
                            <div className='w-full rounded-xl flex flex-col space-y-3'>
                                <div className='h-56 sm:min-h-[320px] md:h-[400px] lg:h-[480px]' onClick={() => setZoomedIndex(0)}>
                                    <img
                                        src={propertyData?.mainImage}
                                        alt='Property'
                                        className='w-full h-full object-cover rounded-xl hover:cursor-pointer'
                                    />
                                </div>

                                <div>
                                    <div className='grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 relative'>
                                        {propertyData?.images?.slice(0, 4).map((nth_image, index) => (
                                            <div
                                                key={index}
                                                className='w-full h-14 sm:h-20 rounded-xl overflow-hidden'
                                                onClick={() => setZoomedIndex(index)}
                                            >
                                                <img
                                                    src={nth_image}
                                                    alt='Property Thumbnail'
                                                    className='w-full h-full object-cover hover:cursor-pointer'
                                                />
                                            </div>
                                        ))}

                                        {propertyData?.images?.length > 4 && (
                                            <div
                                                className='w-full h-14 sm:h-20 rounded-xl overflow-hidden relative'
                                                onClick={() => setZoomedIndex(4)} // opens the 5th image when clicked
                                            >
                                                <img
                                                    src={propertyData?.images[4]}
                                                    alt='Property Thumbnail'
                                                    className='w-full h-full object-cover opacity-50'
                                                />
                                                <div className='absolute inset-0 bg-black bg-opacity-50 hover:cursor-pointer flex justify-center items-center'>
                                                    <p className='text-white font-semibold text-sm sm:text-base'>
                                                        +{propertyData?.images.length - 4} images
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className='flex flex-col bg-sub-bg w-full rounded-xl p-6'> {/* Property Details Section */}
                            <div className='flex flex-col md:flex-row justify-between items-start w-full space-y-3 md:space-y-0'> {/* Contain the title & the rent of the house */}
                                <div className='flex flex-col space-y-1 md:w-2/3'> {/* Title Section */}
                                    <p className='text-white font-semibold text-xl md:text-3xl'>{propertyData?.title || 'Property Title Not Available'}</p>
                                    <p className='text-secondary-text font-medium md:font-semibold text-base'>1.2 Kilometers away from D. Y. Patil College of Engineering & Technology</p>
                                </div>
                                <div className='flex flex-col space-y-1 md:w-1/3 md:items-end text-right'> {/* Rent Section */}
                                    <p className='text-tertiary-text font-bold text-xl md:text-3xl'>₹{propertyData?.rent?.toLocaleString('en-IN')}</p>
                                    <p className='text-secondary-text font-semibold text-base'>per month</p>
                                </div>
                            </div>
                            <div className='flex flex-wrap w-full gap-2 sm:gap-3 mt-5'> {/* Responsive wrapper */}
                                {
                                    [
                                        { icon: wifi_svg, text: 'Wifi' },
                                        { icon: parking_svg, text: 'Parking' },
                                        { icon: water_supply_svg, text: 'Water Supply' },
                                        { icon: garden_svg, text: 'Garden' }
                                    ].map((amenity, index) => (
                                        <div key={index} className='flex bg-cards-bg px-2 py-2 rounded-xl items-center w-[45%] sm:w-auto'> {/* Keep shape, adjust size */}
                                            <div className='w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0'> {/* Adjust icon size */}
                                                <img src={amenity.icon} alt={amenity.text} className='w-full h-full object-contain' />
                                            </div>
                                            <div className='flex-grow flex items-center justify-center px-1 sm:px-3'> {/* Adjust padding for text */}
                                                <p className='text-white font-medium text-xs sm:text-base text-center'>{amenity.text}</p> {/* Responsive text size */}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <div className='flex flex-col space-y-3 mt-8'> {/* Description Section */}
                                <div className='flex w-full'> {/* Description Title */}
                                    <p className='text-white text-xl font-semibold'>About this property</p>
                                </div>
                                <div className='flex w-full'> {/* Description Text */}
                                    <p className='text-slate-300 text-base text-justify'>
                                        {propertyData?.description}
                                    </p>
                                </div>
                                <div className='flex w-full justify-end'> {/* Last updated - Right aligned */}
                                    <p className='text-secondary-text text-base font-semibold'>Last updated: {propertyData?.updatedAt?.split('T')[0]}</p>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col bg-sub-bg w-full rounded-xl p-6'>
                            <div className='flex flex-col space-y-5'> {/* Additional Property Details */}
                                <div className='flex w-full'>
                                    <p className='text-white text-xl font-semibold'>Property Details</p>
                                </div>
                                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'> {/* Grid layout for details */}
                                    {[
                                        { label: 'Property Type', value: 'Flat' },
                                        { label: 'Type', value: propertyData?.flatType },
                                        { label: 'Area', value: '1250 sq. ft' },
                                        { label: 'Address', value: propertyData?.address },
                                        { label: 'Initial Deposit', value: '₹' + propertyData?.deposit?.toLocaleString('en-IN') },
                                        { label: 'Furnishing', value: 'Semi-Furnished' },
                                    ].map((item, index) => (
                                        <div key={index} className='bg-cards-bg p-3 rounded-lg flex flex-col space-y-1'>
                                            <p className='text-tertiary-text font-semibold'>{item.label}</p>
                                            <p className='text-white font-semibold text-base'>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col bg-sub-bg w-full rounded-xl p-6'>
                            <div className='flex flex-col space-y-5'>
                                <div className='flex w-full'>
                                    <p className='text-white text-xl font-semibold'>Reviews & Feedback</p>
                                </div>
                                <div className='flex flex-col space-y-3'>
                                    {propertyData?.reviews && propertyData.reviews.length > 0 ? (
                                        propertyData.reviews.map((review, index) => (
                                            <div key={index} className='bg-cards-bg p-4 rounded-lg flex items-start gap-4 shadow hover:shadow-lg transition-shadow duration-200'>
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={review.user_id?.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(review.user_id?.name || 'User')}
                                                        alt={review.user_id?.name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-main-purple"
                                                    />
                                                </div>
                                                <div className="flex flex-col flex-grow">
                                                    <div className="flex items-center justify-between">
                                                        <p className='text-primary-text text-base font-semibold'>{review.user_id?.name || 'Anonymous'}</p>
                                                        <span className='flex items-center gap-1 text-yellow-400 font-bold text-base'>
                                                            ★
                                                            {review.rating}.0
                                                        </span>
                                                    </div>
                                                    <p className='text-secondary-text text-sm mt-1 font-medium'>{review.comment}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='bg-cards-bg p-4 rounded-lg text-center'>
                                            <p className='text-slate-300 font-medium'>No reviews yet. Be the first to leave feedback!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col w-full lg:w-1/3 rounded-xl gap-5'> {/* Right Section - Contact Info */}
                        <div className='bg-sub-bg w-full  p-5 rounded-xl flex flex-col space-y-6 self-start'> {/* Right Section - Contact Info */}
                            <div className='flex flex-col w-full rounded-lg p-4 bg-menu-active-bg space-y-4'> {/* AI Price Analysis Card*/}
                                <div className='flex items-center space-x-3'> {/* Centering both icon and text */}
                                    <img src={robot} alt='' className='w-6 h-6 object-contain' />
                                    <p className='text-white text-lg font-semibold flex items-center h-full'>AI Price Analysis</p>
                                </div>
                                <div className='flex w-full space-x-3 justify-between'> {/* AI Price Analysis Content */}
                                    <p className='text-green-400 font-semibold text-base'>• Fair Price</p>
                                    <p className='text-slate-300 text-base font-medium'>Market Avg.: ₹15,500</p>
                                </div>
                            </div>
                            {/* Contact details here */}
                            <div className='flex flex-col w-full rounded-lg space-y-3'> {/* Contact Card */}
                                <div className='flex items-center w-full space-x-3 border-b border-secondary-text pb-4'> {/* Contain profile picture and name of landlord */}
                                    <div className='w-14 h-14 flex items-center justify-center'> {/* Profile Picture */}
                                        <img src={propertyData?.landlord_id?.profilePicture} alt='Profile' className='w-14 h-14 object-cover rounded-full' />
                                    </div>
                                    <div className='flex flex-col justify-center'> {/* Name Section */}
                                        <p className='text-white font-semibold text-base'>{propertyData?.landlord_id?.name}</p>
                                        <div className='flex w-full items-center space-x-2'> {/* Rating Section */}
                                            {/* <img src={review_star_full} alt='Rating' className='w-4 h-4 object-contain' /> */}
                                            {/* <p className='text-slate-400 font-semibold text-base'><span className='text-yellow-400'>★ {propertyData?.landlord_id?.trustScore}</span>  • <span className='text-tertiary-text'>Verified Landlord</span></p> */}
                                            <p className='text-slate-400 font-semibold text-base flex items-center gap-1'>
                                                <span className="text-green-500">
                                                    <IoShieldCheckmark />
                                                </span>
                                                <p className='text-green-500 font-bold'>
                                                    {propertyData?.landlord_id?.trustScore !== undefined ? Number(propertyData.landlord_id.trustScore).toFixed(1) : "0.0"}
                                                </p>
                                                • <span className='text-tertiary-text'>Verified Landlord</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col w-full space-y-3'> {/* Availability details */}
                                <div className='flex w-full justify-between'> {/* Availability */}
                                    <p className='text-base text-secondary-text font-semibold'>Available from</p>
                                    <p className='text-base text-white font-semibold'>March 1, 2025</p>
                                </div>
                                <div className='flex w-full justify-between'> {/* Minimum Stay */}
                                    <p className='text-base text-secondary-text font-semibold'>Minimum Stay</p>
                                    <p className='text-base text-white font-semibold'>12 Months</p>
                                </div>
                            </div>
                            <div className='flex flex-col space-y-3'> {/* Contact Button */}
                                <button
                                    className='flex w-full bg-main-purple p-3 rounded-lg justify-center items-center hover:bg-violet-700'
                                    onClick={() => setShowModal(true)}
                                >
                                    <p className='text-white font-bold text-base'>Book Now</p>
                                </button>

                                {/* Modal */}
                                {showModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
                                        <div className="bg-sub-bg p-6 rounded-lg w-11/12 max-w-md">
                                            <h2 className="text-white text-lg font-semibold mb-4">Send Rent Request</h2>
                                            <div className="flex flex-col space-y-3">
                                                <div>
                                                    <p className="text-white font-medium mb-2">Choose Rent Option:</p>
                                                    <div className="flex flex-col space-y-2">
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                name="rentOption"
                                                                value="ownerPrice"
                                                                onChange={() => setSelectedOption('ownerPrice')}
                                                                className="form-radio text-main-purple"
                                                            />
                                                            <span className="text-white">Owner's Rent Price: ₹{propertyData?.rent?.toLocaleString('en-IN')}</span>
                                                        </label>
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                name="rentOption"
                                                                value="customRange"
                                                                onChange={() => setSelectedOption('customRange')}
                                                                className="form-radio text-main-purple"
                                                            />
                                                            <span className="text-white">Custom Price Range</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                {selectedOption === 'customRange' && (
                                                    <div>
                                                        <p className="text-white font-medium mb-2">Enter Your Price Range:</p>
                                                        <input
                                                            type="number"
                                                            placeholder="Min Price"
                                                            value={minPrice}
                                                            onChange={(e) => setMinPrice(e.target.value)}
                                                            className="w-full p-2 rounded-lg bg-cards-bg text-white mb-2"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Max Price"
                                                            value={maxPrice}
                                                            onChange={(e) => setMaxPrice(e.target.value)}
                                                            className="w-full p-2 rounded-lg bg-cards-bg text-white"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end space-x-3 mt-4">
                                                <button
                                                    className="bg-slate-600 px-4 py-2 rounded-lg text-white hover:bg-slate-700"
                                                    onClick={() => setShowModal(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="bg-main-purple px-4 py-2 rounded-lg text-white hover:bg-violet-700"
                                                    onClick={handleSendRentRequest}
                                                >
                                                    Send Rent Request
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button className='flex w-full bg-slate-600 p-3 rounded-lg justify-center items-center hover:bg-slate-700'> {/* Contact Button */}
                                    <p className='text-white font-bold text-base'>Contact Landlord</p>
                                </button>
                            </div>

                        </div>
                        {isLandlord && (
                            <div className="bg-sub-bg w-full p-5 rounded-xl self-start">
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-tertiary-text">Welcome back, Landlord!</h2>
                                    <p className="text-sm text-gray-300 mt-1">
                                        This is how your property appears to tenants. You can update details or view performance anytime.
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/edit-property/${propertyId}`)}
                                        className="text-white font-bold text-base flex w-1/2 bg-main-purple rounded-lg justify-center gap-2  items-center hover:bg-violet-700"
                                    >
                                        <FiEdit3 className="text-lg" />
                                        Edit Property
                                    </button>
                                    <button
                                        onClick={() => navigate(`/property-stats/${propertyId}`)}
                                        className="bg-white text-black w-1/2 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:cursor-pointer hover:bg-slate-100"
                                    >
                                        <BsBarChartLine className="text-lg" />
                                        View Stats
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* custom map */}
                        <PropertyMap
                            latitude={propertyData?.latitude}
                            longitude={propertyData?.longitude}
                            propertyName={propertyData?.title}

                        />

                        {/* google map */}
                        {/* <div className="relative w-full h-[80vh] rounded-lg overflow-hidden">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${propertyData.latitude},${propertyData.longitude}&z=15&output=embed`}
                        allowFullScreen
                    ></iframe>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded shadow">
                        🏠 Listed Property
                    </div>
                    </div> */}


                    </div>
                </div>
            </div>
        </>
    )
}


const PropertyMap = ({ latitude, longitude, propertyName }) => {
    if (!latitude || !longitude) return null;

    return (
        <div className="w-full h-[80vh] rounded-lg overflow-hidden">
            <MapContainer center={[latitude, longitude]} zoom={16} scrollWheelZoom={false} className="w-full h-full z-0">
                <LayersControl position="topright">
                    {/* Default OSM Layer */}
                    <BaseLayer checked name="Street View">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </BaseLayer>

                    {/* Satellite Layer (Esri) */}
                    <BaseLayer name="Satellite View">
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, etc.'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </BaseLayer>
                </LayersControl>

                <Marker position={[latitude, longitude]}>
                    <Popup>{propertyName || "This property is located here!"}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default DetailsPage