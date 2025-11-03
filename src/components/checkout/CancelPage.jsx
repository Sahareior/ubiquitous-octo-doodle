import React from 'react';
import { Link } from 'react-router-dom';

const CancelPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center transform hover:scale-[1.02] transition-all duration-300">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-12 h-12 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Payment Cancelled
          </h1>
          
          {/* Message */}
          <p className="text-gray-600 mb-2 text-lg">
            Your payment process was interrupted
          </p>
          <p className="text-gray-500 mb-8">
            Don't worry, you can always try again when you're ready
          </p>

          {/* Back to Home Button */}
          <Link 
            to="/"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mb-6"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Homepage
          </Link>

          {/* Additional Options */}
          <div className="space-y-4">
            <Link 
              to="/cart"
              className="block w-full border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-medium py-3 px-6 rounded-xl transition-all duration-300"
            >
              View Cart
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="block w-full text-gray-600 hover:text-gray-800 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>

        {/* Support Info */}

      </div>
    </div>
  );
};

export default CancelPage;