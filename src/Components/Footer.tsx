// components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-center text-gray-500 text-sm">
          InstaVote - Create instant polls and get real-time results
        </p>
      </div>
    </footer>
  );
};

export default Footer;