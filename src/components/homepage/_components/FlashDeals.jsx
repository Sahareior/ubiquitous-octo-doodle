import React, { useEffect, useState, useCallback } from "react";
import { FaStar, FaRegHeart, FaFire, FaShoppingCart, FaEye, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import { useAllFlashDealsQuery } from "../../../redux/slices/Apis/dashboardApis";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useAddProductToCartMutation, useGetAllWishListQuery, useGetAppCartQuery, useSavetoWishListMutation } from "../../../redux/slices/Apis/customersApi";
import { useWebSocketContext } from "../../../context/WebSocketContext";
import { useLocation, useNavigate } from "react-router-dom";


const MySwal = withReactContent(Swal);

const FlashDeals = () => {
  const [isHovered, setIsHovered] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
    const [addProductToCart] = useAddProductToCartMutation();
    const [savetoWishList] = useSavetoWishListMutation();
      const { data: cartData, refetch } = useGetAppCartQuery();
        const { add, setAdd } = useWebSocketContext();
          const { data: wishLists, refetch: wishListRefetch } =
    useGetAllWishListQuery();
  const { data: flashDealsData, isLoading, error } = useAllFlashDealsQuery();
    const location = useLocation();
    const navigate = useNavigate();
  const [productsPerPage] = useState(4);


  const getGuestCart = useCallback(() => {
    return JSON.parse(localStorage.getItem('guest_cart')) || [];
  }, []);

  // Transform API data to match component structure
  const transformFlashDeals = useCallback((apiData) => {
    if (!apiData?.results) return [];
    
    return apiData.results.map(deal => {
      const product = deal.product;
      const originalPrice = parseFloat(product.price1) || 0;
      const offerPrice = parseFloat(deal.offer_price) || originalPrice;
      const discount = originalPrice > 0 ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100) : 0;
      
      return {
        id: deal.id,
        name: product.name,
        price: offerPrice,
        oldPrice: originalPrice,
        discount: discount,
        rating: product.average_rating || 0,
        reviews: product.reviews?.length || 0,
        image: deal.upload_image || (product.images?.[0]?.image || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"),
        sold: deal.sold_count || 0,
        total: deal.stock_count || 100,
        availableStock: deal.available_stock || 0,
        productData: product,
        flashDealData: deal,
        startDate: deal.start_date,
        endDate: deal.end_date
      };
    });
  }, []);

  const products = transformFlashDeals(flashDealsData);

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);


  console.log(currentProducts,'flashdeals')

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const ProgressBar = ({ sold, total }) => {
    const percentage = total > 0 ? (sold / total) * 100 : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-[#CBA135] h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  // Individual Product Timer Component
  const ProductTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
      let timer;
      
      const updateTimer = () => {
        if (endDate) {
          const end = new Date(endDate);
          const now = new Date();
          const difference = end - now;

          if (difference > 0) {
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            setTimeLeft({ hours, minutes, seconds });
          } else {
            // Timer expired
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          }
        }
      };

      // Initial call
      updateTimer();
      
      // Set up interval
      timer = setInterval(updateTimer, 1000);

      return () => {
        if (timer) {
          clearInterval(timer);
        }
      };
    }, [endDate]);

    const TimeUnit = ({ value, label }) => (
      <div className="flex flex-col items-center">
        <div className="bg-[#CBA135] rounded px-1 flex justify-center items-center py-1 min-w-[30px]">
          <span className="text-white text-xs font-bold">
            {String(value).padStart(2, "0")}
          </span>
        </div>
        <span className="text-gray-600 text-[10px] mt-1">{label}</span>
      </div>
    );

    return (
      <div className="mt-2">
        <div className="flex items-center gap-1 mb-1">
          <FaFire className="text-[#CBA135] text-xs" />
          <p className="text-gray-600 text-xs font-medium">Ends in</p>
        </div>
        <div className="flex gap-1 justify-center items-center">
          <TimeUnit value={timeLeft.hours} label="H" />
          <span className="text-[#CBA135] text-xs font-bold mt-1">:</span>
          <TimeUnit value={timeLeft.minutes} label="M" />
          <span className="text-[#CBA135] text-xs font-bold mt-1">:</span>
          <TimeUnit value={timeLeft.seconds} label="S" />
        </div>
      </div>
    );
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Handle add to cart
  // const handleAddToCart = (product) => {
  //   console.log('Adding to cart:', product);
  //   // Add your cart logic here
  // };

    const handleAddToCart = useCallback(
      async (data) => {
        const payload = {
          ...data,
          id: data.flashDealData.product.id,
          quantity: 1,
          product_id: data.flashDealData.product.id,
        };
        delete payload.prod_id;

        console.log(data,"this is data")
  
        const token = localStorage.getItem("access_token");
  
        if (!token) {
          // 🛒 Handle guest cart (store in localStorage)
          const existingCart = getGuestCart();
  
          // Check if product already exists in guest cart
          const existingItemIndex = existingCart.findIndex(
            (item) => item.id === payload.id
          );
  
          if (existingItemIndex !== -1) {
            // Update quantity if it already exists
            existingCart[existingItemIndex].quantity += 1;
          } else {
            existingCart.push(payload);
          }
  
          localStorage.setItem("guest_cart", JSON.stringify(existingCart));
  
          MySwal.fire({
            position: "top-end",
            icon: "success",
            title: "Item added to cart!",
            showConfirmButton: false,
            timer: 1800,
            toast: true,
          });
  
          setAdd((items) => !items);
  
          return; // Exit function since user is not logged in
        }
  
        // 🧾 Handle logged-in cart
        await addProductToCart(payload);
        refetch();
  
        MySwal.fire({
          position: "top-end",
          icon: "success",
          title: "Item added to cart!",
          showConfirmButton: false,
          timer: 1800,
          toast: true,
        });
      },
      [addProductToCart, refetch, getGuestCart, setAdd]
    );


    const handleAddToWishlist = async (item) => {
      const token = localStorage.getItem("access_token");
  
      if (!token) {
        Swal.fire({
          title: "Please Sign In Your Account!",
          text: "You need to log in to access this page.",
          icon: "warning",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#3085d6",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login");
          }
        });
  
        return null; // prevent rendering children until after Swal closes
      }
  
      const payload = {
        item,
        product_id: item.id,
      };
  
      try {
        await savetoWishList(payload).unwrap();
        wishListRefetch();
        MySwal.fire({
          position: "top-end",
          icon: "success",
          title: "Item added to wishlist!",
          showConfirmButton: false,
          timer: 1800,
          toast: true,
        });
      } catch (error) {
        console.error("Wishlist error:", error);
        MySwal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to add to wishlist",
          showConfirmButton: false,
          timer: 1800,
          toast: true,
        });
      }
    };

  // Handle quick view
  const handleQuickView = (product) => {
    console.log('Quick view:', product);

    navigate(`/details?id=${product.productData.id}`, { state: { productData: product } });
    
    // Add your quick view logic here
  };

  if (isLoading) {
    return (
      <section className="bg-gradient-to-br bg-[#a87f15c3] py-12 px-4 md:px-8 lg:px-6">
        <div className="max-w-8xl mx-auto text-center">
          <div className="text-white text-lg">Loading flash deals...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br bg-[#a87f15c3] py-12 px-4 md:px-8 lg:px-6">
        <div className="max-w-8xl mx-auto text-center">
          <div className="text-white text-lg">Error loading flash deals</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br bg-[#a87f15c3] py-12 px-4 md:px-8 lg:px-6">
      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <div className="bg-white/20 p-2 rounded-full">
                <IoFlash className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Flash Deals
              </h2>
            </div>
            <p className="text-white/90 text-lg">
              {products.length > 0 
                ? `Limited time offers · Up to ${Math.max(...products.map(p => p.discount))}% OFF` 
                : 'Limited time offers · Amazing discounts'
              }
            </p>
          </div>

          {/* Removed Timer Section from Header */}
        </div>

        {/* Product Cards */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <IoFlash className="text-white text-4xl mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">No Flash Deals Available</h3>
              <p className="text-white/80">Check back later for amazing offers!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {currentProducts?.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
                  onMouseEnter={() => setIsHovered(item.id)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{item.discount}% OFF
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
                      isHovered === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}>
 
                      <button 
                        onClick={() => handleQuickView(item)}
                        className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                      >
                        <FaEye className="text-gray-700" size={16} />
                      </button>
                    </div>

                    {/* Quick Add to Cart */}
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-orange-500 px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 ${
                        isHovered === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      } hover:bg-orange-500 hover:text-white hover:scale-105 flex items-center gap-2`}
                    >
                      <FaShoppingCart size={14} />
                      Add to Cart
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {item.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            size={14}
                            className={i < Math.floor(item.rating) 
                              ? "text-yellow-400" 
                              : i === Math.floor(item.rating) && item.rating % 1 !== 0
                              ? "text-yellow-400 opacity-50"
                              : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({item.reviews})</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Sold: {item.sold}</span>
                        <span>Available: {item.availableStock}</span>
                      </div>
                      <ProgressBar sold={item.sold} total={item.total} />
                    </div>

                    {/* Price and Timer */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">${item.price}</span>
                        {item.oldPrice > item.price && (
                          <span className="text-lg text-gray-500 line-through">
                            ${item.oldPrice}
                          </span>
                        )}
                      </div>
                      {item.oldPrice > item.price && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                          Save ${(item.oldPrice - item.price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Individual Product Timer */}
                    <ProductTimer endDate={item.endDate} />

                    {/* Mobile Add to Cart Button */}
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 lg:hidden"
                    >
                      <FaShoppingCart size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - Only show if there are multiple pages */}
            {totalPages > 1 && (
              <>
                <div className="flex justify-center items-center space-x-2 mt-8">
                  {/* Previous Button */}
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-white/20 text-white/40 cursor-not-allowed'
                        : 'bg-white text-orange-500 hover:bg-orange-500 hover:text-white shadow-lg'
                    }`}
                  >
                    <FaChevronLeft size={14} />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-200 ${
                        currentPage === number
                          ? 'bg-white text-orange-500 shadow-lg scale-110'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'bg-white/20 text-white/40 cursor-not-allowed'
                        : 'bg-white text-orange-500 hover:bg-orange-500 hover:text-white shadow-lg'
                    }`}
                  >
                    <FaChevronRight size={14} />
                  </button>
                </div>

                {/* Page Info */}
                <div className="text-center mt-4">
                  <p className="text-white/80 text-sm">
                    Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} of {products.length} products
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FlashDeals;