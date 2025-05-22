import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheck, FiHome, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const InvitationSuccessPage = () => {
    const { invitationId } = useParams();
    const [invitation, setInvitation] = useState(null);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invitationProcessed, setInvitationProcessed] = useState(false);
    const navigate = useNavigate();

    // Ref to track if rent request has been sent
    const rentRequestSent = useRef(false);

    // Function to send rent request
    const sendRentRequest = async (propertyData, userData) => {
        // Skip if already sent
        if (rentRequestSent.current) return;

        try {
            console.log("Attempting to send rent request with data:", {
                propertyId: propertyData._id,
                userData: userData._id
            });

            const loadingToast = toast.loading('Finalizing your rental...');

            // Make sure we have complete property data with landlord info
            if (!propertyData.landlord_id) {
                console.log("Property data is missing landlord info. Fetching complete property data...");

                try {
                    const propertyResponse = await axios.get(`http://localhost:3000/api/property/${propertyData._id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    console.log("Complete property data:", propertyResponse.data);
                    propertyData = propertyResponse.data.property || propertyResponse.data;
                } catch (propertyError) {
                    console.error("Failed to fetch complete property data:", propertyError);
                    toast.dismiss(loadingToast);
                    toast.error("Couldn't fetch complete property information");
                    return;
                }
            }

            // Check if we have all required data
            if (!propertyData._id || !userData._id) {
                console.error("Missing required data for rent request:", {
                    propertyId: propertyData._id,
                    userId: userData._id
                });
                toast.dismiss(loadingToast);
                toast.error("Couldn't create rental request - missing property or user data");
                return;
            }

            // Make sure we have landlord data
            if (!propertyData.landlord_id) {
                console.error("Missing landlord data:", propertyData);
                toast.dismiss(loadingToast);
                toast.error("Couldn't create rental request - missing landlord information");
                return;
            }

            const requestData = {
                propertyId: propertyData._id,
                requestedPrice: { fixed: propertyData.rent || 0 },
                requestorName: userData.name,
                ownerName: propertyData.landlord_id?.name || 'Property Owner',
                landlord_name: propertyData.landlord_id?.name || 'Property Owner', // Make sure this is included
                ownerId: propertyData.landlord_id?._id || propertyData.landlord_id,
                requestorId: userData._id,
                status: 'Pending',
                message: `${userData.name} has accepted an invitation and wants to join this property`,
            };

            console.log("Sending rent request with data:", requestData);

            const response = await axios.post('http://localhost:3000/api/request', requestData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            // Mark as sent
            rentRequestSent.current = true;
            toast.dismiss(loadingToast);
            toast.success('Your rental request has been sent to the property owner!');
            console.log("Rent request success:", response.data);
        } catch (error) {
            console.error('Error sending rent request:', error);
            console.error('Error details:', error.response?.data);
            toast.error(error.response?.data?.message || 'We processed your invitation, but there was an issue with your rental request.');
        }
    };

    useEffect(() => {
        // Redirect to dashboard if no invitation ID was provided
        if (!invitationId) {
            setError("No invitation ID provided");
            setLoading(false);
            return;
        }

        const fetchInvitation = async () => {
            try {
                console.log("Fetching invitation with ID:", invitationId);
                const response = await axios.get(`http://localhost:3000/api/invitation/details/${invitationId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                console.log('Invitation data:', response.data);

                if (!response.data.invitation) {
                    throw new Error("No invitation data returned");
                }

                const invitationData = response.data.invitation;
                setInvitation(invitationData);

                // Check if the invitation has "accepted" status
                if (invitationData.status === 'accepted') {
                    setInvitationProcessed(true);

                    // Fetch complete property data
                    try {
                        const propertyResponse = await axios.get(`http://localhost:3000/api/property/${invitationData.propertyId._id}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        console.log("Complete property data:", propertyResponse.data);

                        const propertyData = propertyResponse.data.property || propertyResponse.data;
                        setProperty(propertyData);

                        // Send rent request only if invitation is accepted
                        // We need both property and user data from the invitation
                        if (
                            propertyData &&
                            invitationData.inviteeId &&
                            !rentRequestSent.current
                        ) {
                            await sendRentRequest(
                                propertyData,
                                invitationData.inviteeId
                            );
                        }
                    } catch (propertyError) {
                        console.error("Error fetching property details:", propertyError);
                        // Still set the property from invitation, even if it's incomplete
                        setProperty(invitationData.propertyId);
                    }
                } else {
                    setError(`This invitation has status: ${invitationData.status}`);
                }
            } catch (error) {
                console.error('Error fetching invitation:', error);
                const errorMessage = error.response?.data?.message ||
                    "Unable to load invitation details. The invitation may no longer be valid.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [invitationId, navigate]);

    // Loading state
    if (loading) {
        return (
            <div className="bg-main-bg min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-white font-bold text-xl">Loading...</div>
            </div>
        );
    }

    // Error state - completely separate UI for errors
    if (error) {
        return (
            <div className="bg-main-bg min-h-screen flex items-center justify-center p-4">
                <div className="bg-sub-bg rounded-xl p-8 max-w-md w-full text-center">
                    <div className="bg-red-500 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                        <FiAlertTriangle className="h-10 w-10 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-4">Something Went Wrong</h1>

                    <p className="text-secondary-text mb-6">
                        {invitationProcessed
                            ? "Your invitation was accepted, but we couldn't load the property details."
                            : "We couldn't process your invitation."}
                    </p>

                    <div className="bg-cards-bg rounded-xl p-4 mb-6">
                        <p className="text-red-400 mb-2">Error Details:</p>
                        <p className="text-secondary-text">{error}</p>
                    </div>

                    <div className="space-y-3">
                        <Link
                            to="/dashboard"
                            className="bg-slate-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2"
                        >
                            <FiUsers /> Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const displayedProperty = property || invitation?.propertyId;

    // If somehow we got here but don't have property data, show an error
    if (!displayedProperty || !displayedProperty.title) {
        return (
            <div className="bg-main-bg min-h-screen flex items-center justify-center p-4">
                <div className="bg-sub-bg rounded-xl p-8 max-w-md w-full text-center">
                    <div className="bg-yellow-500 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                        <FiAlertTriangle className="h-10 w-10 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-4">Invitation Processed</h1>

                    <p className="text-secondary-text mb-6">
                        Your invitation was accepted, but we couldn't load the property details.
                    </p>

                    <div className="space-y-3">
                        <Link
                            to="/dashboard"
                            className="bg-slate-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2"
                        >
                            <FiUsers /> Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Full success state with property details
    return (
        <div className="bg-main-bg min-h-screen flex items-center justify-center p-4">
            <div className="bg-sub-bg rounded-xl p-8 max-w-md w-full text-center">
                <div className="bg-green-500 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                    <FiCheck className="h-10 w-10 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">Invitation Accepted!</h1>

                <p className="text-secondary-text mb-6">
                    You have successfully joined {displayedProperty.title} as a roommate.
                    {rentRequestSent.current ? ' Your rental request has been sent to the property owner for final approval.' : ''}
                </p>

                <div className="bg-cards-bg rounded-xl p-4 mb-6">
                    {displayedProperty.mainImage || displayedProperty.images?.[0] ? (
                        <img
                            src={displayedProperty.mainImage || displayedProperty.images[0]}
                            alt={displayedProperty.title}
                            className="w-full h-40 object-cover rounded-lg mb-4"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
                        />
                    ) : (
                        <div className="w-full h-40 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                            <p className="text-gray-400">No image available</p>
                        </div>
                    )}
                    <h2 className="text-white text-lg font-bold">{displayedProperty.title}</h2>
                    <p className="text-secondary-text">{displayedProperty.location}</p>
                    {displayedProperty.rent && (
                        <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                            <p className="text-secondary-text text-sm">Rent: <span className="text-white font-bold">₹ {displayedProperty.rent}</span></p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <Link
                        to={`/explore/property/${displayedProperty._id}`}
                        className="bg-main-purple text-white px-4 py-3 rounded-lg font-bold hover:bg-[#6b2bd2] transition flex items-center justify-center gap-2"
                    >
                        <FiHome /> View Property Details
                    </Link>

                    <Link
                        to="/dashboard"
                        className="bg-slate-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2"
                    >
                        <FiUsers /> Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default InvitationSuccessPage;