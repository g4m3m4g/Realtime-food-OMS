import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (<>
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        {/* Custom SVG Image */}
        <img
          src="https://i.ibb.co/jfXTMBM/404.png"  // Replace with your SVG link
          alt="404 Not Found"
          className="w-60 h-60 mx-auto "
        />

        {/* Text */}
        <h1 className="text-8xl font-bold mb-2">404</h1>
        <p className="text-xl font-semibold mb-6">Oops! Page Not Found</p>

        {/* Link */}
        <Link
          to="/"
          className="text-xl font-semibold text-orange-600 hover:text-yellow-400 transition duration-300 ease-in-out"
        >
          Go back !
        </Link>
      </div>
    </div>
          </>
  );
};

export default NotFound;
