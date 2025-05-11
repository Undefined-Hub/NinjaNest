import React, { useEffect, useState } from 'react'
import agreement_svg from '../assets/agreement_svg.svg'
import id_proof_svg from '../assets/id_proof_svg.svg'
import pfp from '../assets/pfp.png'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'

const CurrentPropertyDashboard = () => {
    const [property, setProperty] = useState(null);
    const { propertyId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.user);
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/property/${propertyId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setProperty(response.data.property);
                console.log(response.data.property);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching property:', err);
                setError('Failed to load property details.');
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);
    return (
        <div className='items-center bg-main-bg p-4'> {/* Main Container with consistent padding */}
            <div className='w-full h-full max-w-6xl mx-auto my-6 space-y-6 flex flex-col'> {/* Content Area with consistent spacing */}
                {/* Profile Name Section */}
                <div className='w-full flex gap-4 px-4 rounded-xl bg-main-bg'>
                    {/* Profile Image */}
                    <div>
                        <img src={pfp} alt="Profile" className='w-12 h-12 rounded-full object-cover' />
                    </div>
                    <div className='flex flex-col'>
                        <h1 className='text-lg text-white font-bold w-full'>Welcome back, {user?.user?.name || "Guest"}</h1>
                        <p className='text-start text-secondary-text w-full'>Your NinjaNest Dashboard</p>
                    </div>
                </div>

                {/* Property Summary Section */}
                <div className='w-full flex flex-col space-y-4 p-4 bg-sub-bg rounded-xl'>
                    {/* Title & Description Section */}
                    <div className='flex flex-col sm:flex-row w-full'>
                        <div className='flex flex-col w-full'>
                            <p className='text-white font-semibold text-lg'>{property?.title || "Unknown Property"}</p>
                            <p className='text-secondary-text font-semibold'>{property?.address || "Unknown Address"}</p>
                            <p className='bg-cards-bg text-secondary-text mt-1 rounded-full w-fit px-3 text-center text-sm font-semibold'>{property?.flatType || "Unknown Flat Type"}</p>
                        </div>
                        <div className='flex justify-start sm:justify-end items-center w-full mt-4 sm:mt-0'>
                            <button className='bg-cards-bg text-white font-semibold px-4 py-2 rounded-lg hover:bg-main-purple'>View on Map</button>
                        </div>
                    </div>

                    {/* Property Images Section */}
                    <div className='flex flex-col md:flex-row w-full gap-4'>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white'>Property 1</div>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white mt-4 md:mt-0'>Property 2</div>
                        <div className='bg-cards-bg w-full h-[200px] rounded-xl flex justify-center items-center text-white mt-4 md:mt-0'>Property 3</div>
                    </div>
                </div>

                {/* Rent Details / Your Roommates / Documents */}
                <div className='w-full flex flex-col lg:flex-row gap-6'> {/* Changed space-x-6 to gap-6 for better responsiveness */}
                    {/* Rent Details */}
                    <div className='flex flex-col bg-sub-bg w-full text-white rounded-xl p-4'>
                        <p className='font-semibold text-lg text-tertiary-text'>Rent & Lease Details</p>
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
                        <div className='mt-4'> {/* Next Payment */}
                            <p className='text-secondary-text font-semibold'>Next Payment</p>
                            <p className='text-white font-semibold text-md'>{property?.nextPayment || "Unknown"}</p>
                        </div>
                        <div className='mt-4 flex'> {/* Pay Now */}
                            <button className='bg-white text-black w-full py-2 rounded-xl font-semibold hover:cursor-pointer hover:bg-slate-100'>Pay Now</button>
                        </div>
                    </div>

                    {/* Your Roommates */}
                    {/* TODO: Implement Roommate List in Property Schema */}
                    <div className='bg-sub-bg w-full text-white rounded-xl p-4 mt-6 lg:mt-0'>
                        <p className='font-semibold text-lg text-tertiary-text'>Your Roomates</p>
                        {/* Roommate List */}
                        {[{ name: 'Aryan Patil', course: 'Computer Science & Engg.' }, { name: 'Harshwardhan Patil', course: 'Computer Science & Engg.' }].map((mate, index) => (
                            <div key={index} className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3 mt-4'> {/* Increased padding for consistency */}
                                <img src='https://placehold.co/100' alt="pfp" className='h-12 w-12 rounded-full' />
                                <div className='flex flex-col'>
                                    <p className='text-white text-base font-semibold'>{mate.name}</p>
                                    <p className='text-secondary-text text-base font-semibold'>{mate.course}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Documents */}
                    <div className='bg-sub-bg w-full text-white rounded-xl p-4 mt-6 lg:mt-0'>
                        <p className='font-semibold text-lg text-tertiary-text'>Documents</p>
                        <div className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3 mt-4'> {/* Increased padding for consistency */}
                            <img src={agreement_svg} alt="agreement" className='h-6 w-6 rounded-full' />
                            <div className='flex flex-col'>
                                <p className='text-white text-base py-2 text-center'>Rental Agreement</p>
                            </div>
                        </div>
                        <div className='flex items-center bg-cards-bg rounded-xl p-3 space-x-3 mt-4'> {/* Increased padding for consistency */}
                            <img src={id_proof_svg} alt="id proof" className='h-6 w-6 rounded-full' />
                            <div className='flex flex-col'>
                                <p className='text-white text-base py-2 text-center'>ID Proof</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Maintenance Requests */}
                <div className='w-full flex flex-col bg-sub-bg space-y-4 p-4 rounded-xl'>
                    <div className='flex flex-wrap items-center justify-between w-full'> {/* Flex container for title and button */}
                        <p className='font-semibold text-lg text-tertiary-text'>Maintenance Requests</p>
                        <button className='bg-white text-black py-2 px-3 rounded-xl font-semibold hover:cursor-pointer hover:bg-slate-100 mt-2 sm:mt-0'>New Request</button>
                    </div>
                    {[
                        {
                            title: 'Bathroom Tap Leakage',
                            reportedOn: 'Apr 28, 2025',
                            status: 'In Progress',
                            statusClass: 'text-yellow-500',
                        },
                        {
                            title: 'Wi-Fi Router Issues',
                            reportedOn: 'Apr 25, 2025',
                            status: 'Resolved',
                            statusClass: 'text-green-500',
                        },
                    ].map((request, index) => (
                        <div
                            key={index}
                            className='flex flex-col sm:flex-row items-start sm:items-center bg-cards-bg rounded-xl py-3 px-4 mt-4'
                        >
                            <div className='flex flex-col w-full'> {/* Request Content */}
                                <p className='text-white font-semibold'>{request.title}</p>
                                <p className='text-secondary-text font-semibold'>Reported on {request.reportedOn}</p>
                            </div>
                            <div className='flex justify-start sm:justify-end w-full mt-2 sm:mt-0'> {/* Request Status */}
                                <p className={`${request.statusClass} rounded-full px-3 text-sm py-1 font-semibold`}>
                                    {request.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CurrentPropertyDashboard