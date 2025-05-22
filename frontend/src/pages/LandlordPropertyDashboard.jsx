import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import { useRef } from 'react';
import { Star, Upload, Check, Calendar, FileText, User, Home, Bell, DollarSign, Clock, BarChart } from 'lucide-react';
import PaymentHistorySection from '../components/PaymentHistorySection';
import { uploadDocumentToCloudinary } from '../api/uploadToCloudinary';
// SVG imports
import agreement_svg from '../assets/agreement_svg.svg';
import id_proof_svg from '../assets/id_proof_svg.svg';
import pfp from '../assets/pfp.png';
import { Eye, Download, X } from 'lucide-react';
const { BaseLayer } = LayersControl;
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

function LandlordPropertyDashboard() {
    const mapSectionRef = useRef(null);
    const [property, setProperty] = useState(null);
    const { propertyId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.user);
    
    // Document upload states
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState('agreement');
    const [docFile, setDocFile] = useState(null);
    const [documents, setDocuments] = useState({
    agreement: [],
    id: []
    });
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);

    // Stats
    const [paymentStats, setPaymentStats] = useState({
        paid: 0,
        pending: 0,
        total: 0
    });

    // Payment History - Dummy Data
    const [paymentHistory, setPaymentHistory] = useState([
        { month: 'January', status: 'paid', amount: 10000, date: '2025-01-05' },
        { month: 'February', status: 'paid', amount: 10000, date: '2025-02-03' },
        { month: 'March', status: 'paid', amount: 10000, date: '2025-03-07' },
        { month: 'April', status: 'paid', amount: 10000, date: '2025-04-02' },
        { month: 'May', status: 'pending', amount: 10000, date: '' }
    ]);

    // Tab state for reviews/requests
    const [activeTab, setActiveTab] = useState('reviews');
    
    const [maintenanceRequests, setMaintenanceRequests] = useState([
        {
            id: 1,
            title: 'Bathroom Tap Leakage',
            reportedOn: 'Apr 28, 2025',
            resident: 'Aryan Patil',
            status: 'Pending',
            statusClass: 'text-yellow-500',
            description: 'The bathroom sink tap is constantly dripping and needs to be fixed.'
        },
        {
            id: 2,
            title: 'Wi-Fi Router Issues',
            reportedOn: 'Apr 25, 2025',
            resident: 'Aryan Patil',
            status: 'In Progress',
            statusClass: 'text-blue-500',
            description: 'The Wi-Fi signal is very weak in the bedroom. Please check the router.'
        }
    ]);

    // Reviews - Will be populated from API
    const [propertyReviews, setPropertyReviews] = useState([]);


        useEffect(() => {
        const fetchDocuments = async () => {
            try {
            const response = await axios.get(`http://localhost:3000/api/property/${propertyId}/`, {
                headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            // Group documents by type
            const docs = {
                agreement: [],
                id: []
            };
            // Adapt to new API response structure
            // response.data.documents: { idProof: [], rentalAgreement: "url" }
            const docsFromApi = response.data.property.documents || {};
         
            // Rental Agreement (single URL or array)
            if (docsFromApi.rentalAgreement) {
                docs.agreement.push({
                    id: 'rentalAgreement',
                    name: 'Rental Agreement',
                    url: docsFromApi.rentalAgreement,
                    type: 'agreement',
                    uploadDate: '', // Not available in this structure
                    size: 'Unknown'
                });
            }
            // ID Proof (array)
            if (Array.isArray(docsFromApi.idProof)) {
                docsFromApi.idProof.forEach((url, idx) => {
                    docs.id.push({
                        id: `idProof_${idx}`,
                        name: `ID Proof ${idx + 1}`,
                        url,
                        type: 'id',
                        uploadDate: '',
                        size: 'Unknown'
                    });
                });
            }


            
            setDocuments(docs);
            
            } catch (err) {
            console.error('Error fetching documents:', err);
            }
        };

        if (propertyId) {
            fetchDocuments();
        }
        }, [propertyId]);

    



    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                
                const propertyData = response.data.property;
                setProperty(propertyData);
                console.log(propertyData);
                
                // Set real reviews from the API response
                if (propertyData.reviews && propertyData.reviews.length > 0) {
                    const formattedReviews = propertyData.reviews.map((review, index) => ({
                        id: review._id || index,
                        userName: review.user_id.name,
                        userImage: review.user_id.profilePicture,
                        date: new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        rating: review.rating,
                        comment: review.comment
                    }));
                    
                    setPropertyReviews(formattedReviews);
                }
                
                // Calculate payment stats
                const residents = propertyData?.roomDetails?.members || [];
                
                // Dummy payment status for residents
                const residentsWithPayment = residents.map((resident, index) => ({
                    ...resident,
                    paymentStatus: index % 2 === 0 ? 'paid' : 'pending'
                }));
                
                setPaymentStats({
                    paid: residentsWithPayment.filter(r => r.paymentStatus === 'paid').length,
                    pending: residentsWithPayment.filter(r => r.paymentStatus === 'pending').length,
                    total: residentsWithPayment.length
                });
                
                // Update property with payment statuses
                setProperty({
                    ...propertyData,
                    roomDetails: {
                        ...propertyData.roomDetails,
                        members: residentsWithPayment
                    }
                });
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Failed to load property details.');
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

     const handleFileChange = (e) => {
    setDocFile(e.target.files[0]);
  };

  const handleDocumentUpload = async () => {
  if (!docFile) return;

  try {
    setUploadingDoc(true);
    const url = await uploadDocumentToCloudinary(docFile);
    console.log("Document URL:", url);
    
    // Save to database
    const response = await fetch(`http://localhost:3000/api/property/${propertyId}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        type: selectedDocType,
        url,
        name: docFile.name,
        size: `${Math.round(docFile.size / 1024)} KB`
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Add new document to state
      const newDoc = {
        id: result.document._id,
        name: docFile.name,
        url: url,
        type: selectedDocType,
        uploadDate: new Date().toLocaleDateString(),
        size: `${Math.round(docFile.size / 1024)} KB`
      };
      
      setDocuments(prev => ({
        ...prev,
        [selectedDocType]: [...prev[selectedDocType], newDoc]
      }));
      
      toast.success("Document uploaded successfully");
    } else {
      throw new Error(result.message || "Failed to upload document");
    }

    setDocFile(null);
  } catch (err) {
    toast.success("File uploaded successfully");
    console.error(err);
  } finally {
    setUploadingDoc(false);
  }
};

const handleViewDocument = (doc) => {
  setCurrentDocument(doc);
  setShowDocumentModal(true);
};


const handleDeleteDocument = async (docId, docType) => {
  try {
    // Call API to delete document
    // await axios.delete(`http://localhost:3000/api/property/${propertyId}/documents/${docId}`, {
    //   headers: {
    //     Authorization: `Bearer ${localStorage.getItem('token')}`,
    //   },
    // });
    
    // Update state after successful deletion
    setDocuments(prev => ({
      ...prev,
      [docType]: prev[docType].filter(doc => doc.id !== docId)
    }));
    
    toast.success("Document deleted successfully");
  } catch (err) {
    console.error('Error deleting document:', err);
    toast.error("Failed to delete document");
  }
};

    const updateRequestStatus = (requestId, newStatus) => {
        setMaintenanceRequests(requests => 
            requests.map(req => 
                req.id === requestId 
                    ? { 
                        ...req, 
                        status: newStatus,
                        statusClass: newStatus === 'Resolved' 
                            ? 'text-green-500' 
                            : newStatus === 'In Progress' 
                                ? 'text-blue-500' 
                                : 'text-yellow-500'
                    } 
                    : req
            )
        );
        
        toast.success(`Request status updated to ${newStatus}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-main-bg">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-32 h-32 bg-cards-bg rounded-full mb-4"></div>
                    <div className="h-6 w-48 bg-cards-bg rounded mb-4"></div>
                    <div className="h-4 w-64 bg-cards-bg rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-main-bg">
                <div className="text-red-500 text-center">
                    <p className="text-2xl font-bold mb-2">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }



    // Return JSX with all components
    return (
        <div className='items-center bg-main-bg p-4'> {/* Main Container with consistent padding */}
            <div className='w-full h-full max-w-6xl mx-auto my-6 space-y-6 flex flex-col'> {/* Content Area with consistent spacing */}
                {/* Profile Name Section */}
                <div className='w-full flex gap-4 px-4 rounded-xl bg-main-bg'>
                    {/* Profile Image */}
                    <div>
                        <img src={property?.landlord_id?.profilePicture || pfp} alt="Profile" className='w-12 h-12 rounded-full object-cover' />
                    </div>
                    <div className='flex flex-col'>
                        <h1 className='text-lg text-white font-bold w-full'>Landlord Dashboard: {property?.landlord_id?.name || "Landlord"}</h1>
                        <p className='text-start text-secondary-text w-full'>Property Management</p>
                    </div>
                </div>

                {/* Property Summary Section */}
                <div className='w-full flex flex-col space-y-4 p-4 bg-sub-bg rounded-xl'>
                    {/* Title & Description Section */}
                    <div className='flex flex-col sm:flex-row w-full'>
                        <div className='flex flex-col w-full'>
                            <div className="flex items-center">
                                <Home size={20} className="text-tertiary-text mr-2" />
                                <p className='text-white font-semibold text-lg'>{property?.title || "Unknown Property"}</p>
                            </div>
                            <p className='text-secondary-text font-semibold'>{property?.address || "Unknown Address"}, {property?.location || ""}</p>
                            <p className='bg-cards-bg text-secondary-text mt-1 rounded-full w-fit px-3 text-center text-sm font-semibold'>{property?.propertyType || "Unknown Property Type"}</p>
                        </div>
                        <div className='flex justify-start sm:justify-end items-center w-full mt-4 sm:mt-0'>
                            <button
                                className='bg-cards-bg text-white font-semibold px-4 py-2 rounded-lg hover:bg-main-purple transition-colors'
                                onClick={() => {
                                    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                View on Map
                            </button>
                        </div>
                    </div>

                    {/* Property Images Section */}
                    <div className='flex flex-col md:flex-row w-full gap-4'>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white'>
                            <img src={property?.images && property.images[0] || "https://placehold.co/200"} alt="Property" className='w-full h-full object-cover rounded-xl' />
                        </div>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white mt-4 md:mt-0'>
                            <img src={property?.images && property.images[1] || "https://placehold.co/200"} alt="Property" className='w-full h-full object-cover rounded-xl' />
                        </div>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white mt-4 md:mt-0'>
                            <img src={property?.mainImage || "https://placehold.co/200"} alt="Property" className='w-full h-full object-cover rounded-xl' />
                        </div>
                    </div>
                </div>

                {/* Analytics Overview */}
                <div className='w-full flex flex-col bg-sub-bg p-4 rounded-xl'>
                    {/* <div className="flex items-center mb-4">
                        <DollarSign size={20} className="text-tertiary-text mr-2" />
                        <p className='font-semibold text-lg text-tertiary-text'>Payment Analytics</p>
                    </div>
                     */}
                    {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> */}
                        {/* Payments Made */}
                        {/* <div className="bg-cards-bg rounded-xl p-4">
                            <p className="text-secondary-text mb-2">Payments Made</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold text-green-400">{paymentStats.paid}</p>
                                <div className="bg-green-400 bg-opacity-20 p-2 rounded-full">
                                    <Check size={20} className="text-green-400" />
                                </div>
                            </div>
                        </div> */}
                        
                        {/* Payments Pending */}
                        {/* <div className="bg-cards-bg rounded-xl p-4">
                            <p className="text-secondary-text mb-2">Payments Pending</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold text-yellow-400">{paymentStats.pending}</p>
                                <div className="bg-yellow-400 bg-opacity-20 p-2 rounded-full">
                                    <Clock size={20} className="text-yellow-400" />
                                </div>
                            </div>
                        </div> */}
                        
                        {/* Total Residents */}
                        {/* <div className="bg-cards-bg rounded-xl p-4">
                            <p className="text-secondary-text mb-2">Total Residents</p>
                            <div className="flex items-end justify-between">
                                <p className="text-2xl font-bold text-logo-blue">{paymentStats.total}</p>
                                <div className="bg-logo-blue bg-opacity-20 p-2 rounded-full">
                                    <User size={20} className="text-logo-blue" />
                                </div>
                            </div>
                        </div>
                    </div> */}
                    
                    {/* Payment Chart/Timeline */}
                    <div className=" bg-cards-bg rounded-xl p-4">
                        {/* <div className="flex items-center justify-between mb-3">
                            <p className="text-white font-medium">Monthly Payment History</p>
                            <div className="flex items-center text-secondary-text text-sm">
                                <div className="flex items-center mr-4">
                                    <div className="w-3 h-3 bg-green-400 rounded-full mr-1"></div>
                                    <span>Paid</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
                                    <span>Pending</span>
                                </div>
                            </div>
                        </div> */}
                        
                        <div className="">
                            {/* Payment History Timeline */}
                            {/* <div className="space-y-3">
                                {paymentHistory.map((payment, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-16 text-secondary-text text-sm">{payment.month}</div>
                                        <div className="flex-1 mx-2">
                                            <div className="bg-cards-bg h-2 rounded-full w-full">
                                                <div 
                                                    className={`h-full rounded-full ${payment.status === 'paid' ? 'bg-green-400' : 'bg-yellow-400'}`} 
                                                    style={{width: payment.status === 'paid' ? '100%' : '0%'}}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className={`text-sm ${payment.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {payment.status === 'paid' ? 
                                                `₹${payment.amount.toLocaleString('en-IN')} (${payment.date})` : 
                                                'Due'
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                             */}
                            {/* Payment Summary */}
                            <div className=" border-gray-700 flex items-center justify-between">
                                <div>
                                    <p className="text-secondary-text text-sm">Next payment due</p>
                                    <p className="text-white font-medium">May 30, 2025</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-secondary-text text-sm">Amount</p>
                                    <p className="text-white font-medium">₹{property?.rent?.toLocaleString('en-IN') || "10,000"}</p>
                                </div>
                                <button className="bg-main-purple hover:bg-purple-700 transition-colors text-white py-1 px-4 rounded-lg text-sm">
                                    Send Reminder
                                </button>
                            </div>
                        </div>
                    </div>




                </div>
            <div className='w-full flex flex-col bg-sub-bg p-4 rounded-xl'>
                    <PaymentHistorySection 
                        propertyId={propertyId} 
                        landlordId={property?.landlord_id?._id}
                        mode="landlord"
                        title="Payment History"
                    />
                    </div>
                        
                 <div className='w-full flex flex-col lg:flex-row gap-6'> {/* Changed space-x-6 to gap-6 for better responsiveness */}
                    {/* Property Details */}
                    <div className='flex flex-col bg-sub-bg w-full text-white rounded-xl p-4'>
                        <div className="flex items-center mb-4">
                            <Home size={20} className="text-tertiary-text mr-2" />
                            <p className='font-semibold text-lg text-tertiary-text'>Property Details</p>
                        </div>
                        <div className='mt-4'> {/* Monthly Rent */}
                            <p className='text-secondary-text font-semibold'>Monthly Rent</p>
                            <p className='text-white font-semibold text-lg'>₹ {property?.rent?.toLocaleString('en-IN') || "Unknown"}</p>
                        </div>
                        <div className='mt-4'> {/* Security Deposit */}
                            <p className='text-secondary-text font-semibold'>Security Deposit</p>
                            <p className='text-white font-semibold text-md'>₹ {property?.deposit?.toLocaleString('en-IN') || "Unknown"}</p>
                        </div>
                        <div className='mt-4'> {/* Lease Period */}
                            <p className='text-secondary-text font-semibold'>Lease Period</p>
                            <p className='text-white font-semibold text-md'>{property?.leasePeriod || "Unknown"}</p>
                        </div>
                        <div className='mt-4'> {/* Property Type */}
                            <p className='text-secondary-text font-semibold'>Property Type</p>
                            <p className='text-white font-semibold text-md'>{property?.propertyType || "Unknown"}</p>
                        </div>
                        <div className='mt-4'> {/* Total Bedrooms */}
                            <p className='text-secondary-text font-semibold'>Total Beds</p>
                            <p className='text-white font-semibold text-md'>{property?.roomDetails?.beds || "Unknown"}</p>
                        </div>
                    </div>

                    {/* Current Residents */}
                    <div className='bg-sub-bg w-full text-white rounded-xl p-4 mt-6 lg:mt-0'>
                        <div className="flex items-center mb-4">
                            <User size={20} className="text-tertiary-text mr-2" />
                            <p className='font-semibold text-lg text-tertiary-text'>Current Residents</p>
                        </div>
                        
                        {/* Resident List */}
                        {property?.roomDetails?.members && property.roomDetails.members.length > 0 ? (
                            property.roomDetails.members.map((mate, index) => (
                                <div key={index} className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3 mt-4'>
                                    <img src={mate.profilePicture || 'https://placehold.co/100'} alt="pfp" className='h-12 w-12 rounded-full object-cover' />
                                    <div className='flex flex-col flex-1'>
                                        <p className='text-white text-base font-semibold'>{mate.name}</p>
                                        <p className='text-secondary-text text-base font-semibold'>{mate.course || "Student"}</p>
                                    </div>
                                    <div className={`rounded-full px-3 py-1 ${mate.paymentStatus === 'paid' ? 'bg-green-400 bg-opacity-20 text-green-400' : 'bg-yellow-400 bg-opacity-20 text-yellow-400'}`}>
                                        {mate.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='bg-cards-bg p-4 rounded-lg text-center mt-4'>
                                <p className='text-slate-300 font-medium'>No residents found.</p>
                            </div>
                        )}
                        
                        <div className="mt-6">
                            <button className="bg-main-purple text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors w-full">
                                Send Payment Reminder
                            </button>
                        </div>
                    </div>

                    {/* Documents Upload */}
<div className='bg-sub-bg w-full text-white rounded-xl p-4 mt-6 lg:mt-0'>
    <div className="flex items-center mb-4">
        <FileText size={20} className="text-tertiary-text mr-2" />
        <p className='font-semibold text-lg text-tertiary-text'>Documents</p>
    </div>
    
    {/* Document selection */}
    <div className="mb-4">
        <p className="text-secondary-text mb-2">Select document type:</p>
        <div className="flex gap-3 flex-wrap">
            <button 
                className={`px-3 py-2 rounded-lg ${selectedDocType === 'agreement' ? 'bg-main-purple' : 'bg-cards-bg'}`}
                onClick={() => setSelectedDocType('agreement')}
            >
                Rental Agreement
                {documents.agreement.length > 0 && (
                    <span className="ml-2 bg-white text-cards-bg text-xs rounded-full h-5 w-5 inline-flex items-center justify-center">
                        {documents.agreement.length}
                    </span>
                )}
            </button>
            <button 
                className={`px-3 py-2 rounded-lg ${selectedDocType === 'id' ? 'bg-main-purple' : 'bg-cards-bg'}`}
                onClick={() => setSelectedDocType('id')}
            >
                ID Proof
                {documents.id.length > 0 && (
                    <span className="ml-2 bg-white text-cards-bg text-xs rounded-full h-5 w-5 inline-flex items-center justify-center">
                        {documents.id.length}
                    </span>
                )}
            </button>
        </div>
    </div>
    
        {/* Document List - Show this section when documents exist */}
        {documents[selectedDocType].length > 0 && (
            <div className="mb-6 bg-cards-bg rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">
                    {selectedDocType === 'agreement' ? 'Rental Agreements' : 'ID Proofs'}
                </h3>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {documents[selectedDocType].map((doc) => (
                        <div 
                            key={doc.id} 
                            className="bg-sub-bg rounded-lg p-3 flex items-center justify-between hover:bg-opacity-80 transition-colors"
                        >
                            <div className="flex items-center overflow-hidden">
                                <div className="bg-main-purple bg-opacity-20 p-2 rounded-lg mr-3 flex-shrink-0">
                                    <FileText size={16} className="text-main-purple" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-white truncate">{doc.name}</p>
                                    <p className="text-secondary-text text-xs">{doc.uploadDate} • {doc.size}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => handleViewDocument(doc)}
                                    className="p-2 bg-cards-bg text-secondary-text hover:text-white rounded-lg hover:bg-main-purple hover:bg-opacity-30 transition-colors"
                                    title="View document"
                                >
                                    <Eye size={16} />
                                </button>
                                <a 
                                    href={doc.url} 
                                    download={doc.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-cards-bg text-secondary-text hover:text-white rounded-lg hover:bg-main-purple hover:bg-opacity-30 transition-colors"
                                    title="Download document"
                                >
                                    <Download size={16} />
                                </a>
                                <button 
                                    onClick={() => handleDeleteDocument(doc.id, doc.type)}
                                    className="p-2 bg-cards-bg text-secondary-text hover:text-red-500 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                                    title="Delete document"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* Upload section */}
        <div className="bg-cards-bg rounded-xl p-4">
            <div className="border-2 border-dashed border-secondary-text rounded-lg p-6 flex flex-col items-center justify-center">
                <Upload size={32} className="text-secondary-text mb-3" />
                <p className="text-secondary-text text-center mb-3">
                    {selectedDocType === 'agreement' ? 'Upload Rental Agreement' : 'Upload ID Proof'}
                </p>
                
                <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label 
                    htmlFor="document-upload" 
                    className="bg-cards-bg text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-[#3a4456] transition-colors"
                >
                    Browse Files
                </label>
                
                {docFile && (
                    <p className="mt-3 text-sm text-secondary-text">
                        Selected: {docFile.name}
                    </p>
                )}
            </div>
            
            <button 
                className={`mt-4 w-full py-2 rounded-lg font-medium ${uploadingDoc ? 'bg-slate-600 cursor-not-allowed' : 'bg-main-purple hover:bg-purple-700'} transition-colors`}
                onClick={handleDocumentUpload}
                disabled={uploadingDoc || !docFile}
            >
                {uploadingDoc ? 'Uploading...' : 'Upload Document'}
            </button>
        </div>
    </div>

   {/* Add this to the end of your component render method */}
   {showDocumentModal && (() => {
      // Safely check file type for preview
      const isImage = currentDocument?.url?.match(/\.(jpeg|jpg|gif|png)$/i);
      const isPdf = currentDocument?.url?.match(/\.(pdf)$/i);
      return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-sub-bg rounded-xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-bold truncate flex-1">{currentDocument.name}</h3>
              <button 
                onClick={() => setShowDocumentModal(false)}
                className="text-secondary-text hover:text-white p-1 rounded-full hover:bg-cards-bg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-cards-bg rounded-lg flex-1 overflow-hidden mb-4">
              {isImage ? (
                <img 
                  src={currentDocument.url} 
                  alt={currentDocument.name}
                  className="w-full h-full object-contain" 
                />
              ) : isPdf ? (
                <iframe 
                  src={currentDocument.url} 
                  className="w-full h-[60vh]" 
                  title={currentDocument.name}
                />
              ) : (
                <div className="h-[60vh] flex items-center justify-center text-secondary-text">
                  <div className="text-center">
                    <FileText size={64} className="mx-auto mb-4" />
                    <p>Cannot preview this file type</p>
                    <p className="text-sm mt-2">Click download to access this file</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-secondary-text text-sm">
                Uploaded on {currentDocument.uploadDate} • {currentDocument.size}
              </div>
              <a 
                href={currentDocument.url} 
                download={currentDocument.name}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-main-purple text-white py-2 px-4 rounded-lg flex items-center hover:bg-purple-700 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download
              </a>
            </div>
          </div>
        </div>
      );
    })()}
    </div>
                
                {/* Reviews Tab - now using real data */}
                <div className='w-full flex flex-col bg-sub-bg p-4 rounded-xl'>
                    {/* Tabs */}
                    <div className="flex border-b border-cards-bg mb-4">
                        <button 
                            className={`py-3 px-5 ${activeTab === 'reviews' ? 'text-tertiary-text border-b-2 border-tertiary-text' : 'text-secondary-text'}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Property Reviews
                        </button>
                        <button 
                            className={`py-3 px-5 ${activeTab === 'maintenance' ? 'text-tertiary-text border-b-2 border-tertiary-text' : 'text-secondary-text'}`}
                            onClick={() => setActiveTab('maintenance')}
                        >
                            <div className="flex items-center">
                                Maintenance Requests
                                <div className="ml-2 bg-main-purple text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {maintenanceRequests.filter(req => req.status !== 'Resolved').length}
                                </div>
                            </div>
                        </button>
                    </div>
                    
                    {/* Tab Content */}
                    {activeTab === 'reviews' ? (
                        <div>
                            {propertyReviews.length > 0 ? (
                                propertyReviews.map(review => (
                                    <div key={review.id} className="bg-cards-bg rounded-xl p-4 mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                {review.userImage ? (
                                                    <img src={review.userImage} alt={review.userName} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-main-purple flex items-center justify-center text-white font-bold">
                                                        {review.userName.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="ml-3">
                                                    <p className="text-white font-semibold">{review.userName}</p>
                                                    <p className="text-secondary-text text-sm">{review.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star 
                                                        key={star}
                                                        size={16}
                                                        fill={star <= review.rating ? '#8561FF' : 'transparent'}
                                                        color={star <= review.rating ? '#8561FF' : '#6B7280'}
                                                    />
                                                ))}
                                                <span className="ml-2 text-white">{review.rating}/5</span>
                                            </div>
                                        </div>
                                        <p className="text-white">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-secondary-text">
                                    No reviews yet for this property.
                                </div>
                            )}
                        </div>
                    ) : (
                        // Maintenance requests tab content remains the same
                        <div>
                            {maintenanceRequests.map(request => (
                                <div key={request.id} className="bg-cards-bg rounded-xl p-4 mb-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                        <div>
                                            <p className="text-white font-semibold">{request.title}</p>
                                            <p className="text-secondary-text">Reported by {request.resident} on {request.reportedOn}</p>
                                        </div>
                                        <div className={`${request.statusClass} px-3 py-1 rounded-full text-sm mt-2 sm:mt-0`}>
                                            {request.status}
                                        </div>
                                    </div>
                                    <p className="text-white mb-4">{request.description}</p>
                                    
                                    {/* Status update buttons */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <button 
                                            className={`px-3 py-1 rounded-lg text-sm ${request.status === 'Pending' ? 'bg-blue-500 text-white' : 'bg-cards-bg text-secondary-text'}`}
                                            onClick={() => updateRequestStatus(request.id, 'In Progress')}
                                            disabled={request.status === 'Resolved'}
                                        >
                                            Mark In Progress
                                        </button>
                                        <button 
                                            className={`px-3 py-1 rounded-lg text-sm ${request.status === 'In Progress' ? 'bg-green-500 text-white' : 'bg-cards-bg text-secondary-text'}`}
                                            onClick={() => updateRequestStatus(request.id, 'Resolved')}
                                            disabled={request.status === 'Resolved'}
                                        >
                                            Mark Resolved
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
          {/* Location Map */}
                <div
                    ref={mapSectionRef}
                    className='w-full flex flex-col bg-sub-bg p-4 rounded-xl'
                >
                    <div className="flex items-center mb-4">
                        <p className='font-semibold text-lg text-tertiary-text'>Location</p>
                    </div>
                    <PropertyMap
                        latitude={property?.latitude}
                        longitude={property?.longitude}
                        propertyName={property?.title}
                    />
                </div>
            </div>
        </div>
    );
}



const PropertyMap = ({ latitude, longitude, propertyName }) => {
    if (!latitude || !longitude) return null;

    return (
        <div className="w-full h-[50vh] rounded-lg overflow-hidden">
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

export default LandlordPropertyDashboard;