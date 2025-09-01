import React, { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const Similar = ({ randomProducts }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;
  
  // Calculate total pages
  const totalPages = Math.ceil((randomProducts?.length || 0) / productsPerPage);
  
  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = randomProducts?.slice(indexOfFirstProduct, indexOfLastProduct) || [];
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-9 gap-6 py-5">
        {currentProducts.map((item) => (
          <div
            key={item.id}
            className="w-full bg-white rounded-xl shadow-md transition-transform hover:scale-105 hover:shadow-lg"
          >
            <img
              src={item.images?.[0]?.image || '/image/placeholder.png'}
              alt={item.name}
              className="h-48 w-full object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h2 className="text-[16px] popreg mb-1 truncate">{item.name}</h2>
              <p className="text-[#CBA135] text-[16px] popreg">${item.price1}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentPage === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-[#CBA135] hover:text-white border border-gray-300'
            }`}
          >
            <LeftOutlined />
          </button>
          
          {getPageNumbers().map((pageNumber, index) => (
            <button
              key={index}
              onClick={() => typeof pageNumber === 'number' ? paginate(pageNumber) : null}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                pageNumber === currentPage
                  ? 'bg-[#CBA135] text-white font-medium'
                  : pageNumber === '...'
                  ? 'bg-transparent text-gray-500 cursor-default'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-[#CBA135] hover:text-white border border-gray-300'
            }`}
          >
            <RightOutlined />
          </button>
        </div>
      )}
    </div>
  );
};

export default Similar;