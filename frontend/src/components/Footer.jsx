import React from "react";
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
const Footer = () => {
  return (
    <div>
      {/* Footer */}
      <footer className="w-screen bg-[#111827] text-[#727986] flex flex-col mt-32 pt-4">
        <div className="flex justify-between p-10 mx-32">
          <div className="list-none">
            <p className="font-bold text-md mb-4 text-[#fbfbfb]">Company</p>
            <li>About Us</li>
            <li>Careers</li>
            <li>Blogs</li>
          </div>
          <div className="list-none">
            <p className="font-bold text-md mb-4 text-[#fbfbfb]">Support</p>
            <li>Help Center</li>
            <li>Safety Center</li>
            <li>Community</li>
          </div>
          <div className="list-none">
            <p className="font-bold text-md mb-4 text-[#fbfbfb]">Legal</p>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
            <li>Cookie Policy</li>
          </div>
          <div className="">
            <p className="font-bold text-md mb-4 text-[#fbfbfb]">Connect</p>
            <div className="flex gap-4">
              <FaTwitter />
              <FaFacebook />
              <FaInstagram />
              <FaLinkedin />
            </div>
          </div>
        </div>
        <div className="p-4 border-t-2 flex justify-center items-center pt-4">
          &copy; 2025 NinjaNest. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Footer;
