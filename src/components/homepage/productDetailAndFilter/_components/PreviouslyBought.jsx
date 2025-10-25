import React, { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const PreviouslyBought = ({ filteredProducts,setSelectedProduct }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const navigate = useNavigate()
  

  const totalPages = Math.ceil((filteredProducts?.length || 0) / productsPerPage);
  

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts?.slice(indexOfFirstProduct, indexOfLastProduct) || [];
  

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

 
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
  
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
 
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
     
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };


    const handleSelect = (product) => {
  setSelectedProduct(product);
  navigate(`/details?id=${product.id}`, { replace: false, state: { product } });
};

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-9 gap-6 py-5">
        {currentProducts.map((item) => {
    
     const newPrice = item?.new_price || item?.price1;
      const discount = item?.promotion_discount_value;
      const hasDiscount = discount && discount > 0;
          return (
            <div
              key={item.id}
               onClick={() => {
          
            handleSelect(item)
          }}
              className="w-full hover:cursor-pointer  rounded-xl shadow-md transition-transform hover:scale-105 hover:shadow-lg relative"
            >

          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
              -{discount}{item?.promotion_type === 'percentage' ? '%' : 'XAF'}
            </div>
          )}

              <img
                src={item.images?.[0]?.image || '/image/placeholder.png'}
                alt={item.name}
                className="h-48 w-full object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h2 className="text-[16px] popreg mb-1 truncate">{item.name}</h2>


         <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-gray-400 line-through text-sm">
                  XAF {item.price1}
                </span>
              )}
              <span className="text-[#CBA135] text-[16px] popbold">XAF {newPrice}</span>
            </div>
              </div>
            </div>
          );
        })}
      </div>

     
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-slate-300 text-gray-700 hover:bg-[#CBA135] hover:text-white border border-gray-300'
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
                  : 'bg-slate-300 text-gray-700 hover:bg-gray-100 border border-gray-300'
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
      : 'bg-slate-300 text-gray-700 hover:bg-[#CBA135] hover:text-white border border-gray-300'
  }`}
>
  <RightOutlined />
</button>

        </div>
      )}
    </div>
  );
};

export default PreviouslyBought;