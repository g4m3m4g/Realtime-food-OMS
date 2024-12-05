import React from 'react';

const Footer = () => {
  return (
<footer className="bg-white rounded-lg shadow m-4 ">
    <div className="w-full mx-auto max-w-screen-xl p-4 flex md:flex md:items-center ">
        <a href="https://github.com/g4m3m4g" target='_blank' >
            <img src="https://i.ibb.co/ZH43K0g/logoPA.png" alt="logo" className='w-6 h-6 mx-4 invert' />
        </a>
      <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© {new Date().getFullYear()}  <a href="https://github.com/g4m3m4g" target='_blank' className="hover:underline">ptpar™</a>. All Rights Reserved.
    </span>
    </div>
</footer>

  );
};

export default Footer;