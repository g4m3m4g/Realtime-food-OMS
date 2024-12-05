import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => console.log("Signed Out"))
      .catch((error) => console.log(error));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/admin" className="flex items-center space-x-2">
          <img
            src="https://img.icons8.com/color/48/ingredients.png"
            alt="Teenoi"
            className="h-8 w-8"
          />
          <span className="text-lg font-semibold">Food OMS Admin Panel</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/admin/product" className="hover:text-gray-300 transition">
            Product
          </Link>
          <Link to="/admin/table" className="hover:text-gray-300 transition">
            Table
          </Link>
          <Link to="/admin/order" className="hover:text-gray-300 transition">
            Order
          </Link>
          <button
            onClick={handleSignOut}
            className="text-left text-red-600 hover:text-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col space-y-1 focus:outline-none"
          >
            <span className="block h-0.5 w-6 bg-white"></span>
            <span className="block h-0.5 w-6 bg-white"></span>
            <span className="block h-0.5 w-6 bg-white"></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-4">
          <Link
            to="/admin/product"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-gray-300 transition"
          >
            Product
          </Link>
          <Link
            to="/admin/table"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-gray-300 transition"
          >
            Table
          </Link>
          <Link
            to="/admin/order"
            onClick={() => setIsMobileMenuOpen(false)}
            className="hover:text-gray-300 transition"
          >
            Order
          </Link>
          <button
            onClick={handleSignOut}
            className="text-left  hover:text-gray-300 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
