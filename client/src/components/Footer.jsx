// client/src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-darkBg text-gray-400 p-4 text-center text-sm mt-auto">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Business Wars. Proyecto Integrado TIHV43.</p>
      </div>
    </footer>
  );
};

export default Footer;