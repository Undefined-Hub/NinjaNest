import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiX, FiSearch, FiHome } from 'react-icons/fi';

const InvitationDeclinedPage = () => {
    const { invitationId } = useParams();
    return (
        <div className="bg-main-bg min-h-screen flex items-center justify-center p-4">
            <div className="bg-sub-bg rounded-xl p-8 max-w-md w-full text-center">
                <div className="bg-slate-600 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                    <FiX className="h-10 w-10 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">Invitation Declined</h1>

                <p className="text-secondary-text mb-6">
                    You have declined the roommate invitation. No worries, you can always
                    explore other housing options on NinjaNest.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/explore"
                        className="bg-main-purple text-white px-4 py-3 rounded-lg font-bold hover:bg-[#6b2bd2] transition flex items-center justify-center gap-2"
                    >
                        <FiSearch /> Explore Properties
                    </Link>

                    <Link
                        to="/"
                        className="bg-slate-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2"
                    >
                        <FiHome /> Go to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default InvitationDeclinedPage;