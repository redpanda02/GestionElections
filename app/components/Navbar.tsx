// components/Navbar.tsx

import React from 'react';
type NavbarProps={
  isConnected:Boolean | null;
}

const Navbar : React.FC<NavbarProps> =({isConnected})=>{

  return (
    <nav className="bg-white  border-gray-200 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto p-4">
        {/* Logo */}
        <a href="/" className="  flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="/logo.jpg"
            className="h-8"
            alt=""
            width={50}
            height={50}
          />
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            Direction Generale des Elections
          </span>
          {isConnected &&
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            User name
          </span>
          }
        </a>

        {/* Boutons Login et Sign Up */}
        <div className="flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">

        { !isConnected && <a
            href="/login"
            className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
          >
            Login
          </a>}
         { !isConnected && <a
            href="/signup"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Sign up
          </a>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;