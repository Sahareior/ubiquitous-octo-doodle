import React, { useEffect, useState } from "react";
import { FaStar, FaRegHeart, FaFire, FaShoppingCart, FaEye } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";

const FlashDeals = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer when it reaches zero
          return { hours: 12, minutes: 34, seconds: 56 };
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const products = [
    {
      id: 1,
      name: "Modern Bedroom Set",
      price: 899.99,
      oldPrice: 1289.99,
      discount: 30,
      rating: 4.5,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      sold: 45,
      total: 100,
    },
    {
      id: 2,
      name: "Luxury Sofa Collection",
      price: 1299.99,
      oldPrice: 1899.99,
      discount: 35,
      rating: 4.8,
      reviews: 456,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      sold: 78,
      total: 100,
    },
    {
      id: 3,
      name: "Dining Table Set",
      price: 749.99,
      oldPrice: 999.99,
      discount: 25,
      rating: 4.2,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      sold: 32,
      total: 100,
    },
    {
      id: 4,
      name: "Home Decor Accessories",
      price: 149.99,
      oldPrice: 249.99,
      discount: 40,
      rating: 4.6,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      sold: 89,
      total: 100,
    },
    {
      id: 5,
      name: "Home Decor Accessories",
      price: 149.99,
      oldPrice: 249.99,
      discount: 40,
      rating: 4.6,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      sold: 89,
      total: 100,
    },
  ];

  const ProgressBar = ({ sold, total }) => {
    const percentage = (sold / total) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-[#CBA135] h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px]">
        <span className="text-white text-lg font-bold">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-white/80 text-xs mt-1">{label}</span>
    </div>
  );

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
            <p className="text-white/90 text-lg">Limited time offers · Up to 40% OFF</p>
          </div>

          {/* Timer Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <FaFire className="text-white text-xl" />
              <p className="text-white font-semibold">Hurry Up! Offer ends in</p>
            </div>
            <div className="flex gap-3">
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <span className="text-white text-xl font-bold mt-2">:</span>
              <TimeUnit value={timeLeft.minutes} label="Minutes" />
              <span className="text-white text-xl font-bold mt-2">:</span>
              <TimeUnit value={timeLeft.seconds} label="Seconds" />
            </div>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {products.map((item) => (
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
                  <button className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
                    <FaRegHeart className="text-gray-700" size={16} />
                  </button>
                  <button className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
                    <FaEye className="text-gray-700" size={16} />
                  </button>
                </div>

                {/* Quick Add to Cart */}
                <button className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-orange-500 px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 ${
                  isHovered === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } hover:bg-orange-500 hover:text-white hover:scale-105 flex items-center gap-2`}>
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
                    <span>Available: {item.total - item.sold}</span>
                  </div>
                  <ProgressBar sold={item.sold} total={item.total} />
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">${item.price}</span>
                    <span className="text-lg text-gray-500 line-through">
                      ${item.oldPrice}
                    </span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                    Save ${(item.oldPrice - item.price).toFixed(2)}
                  </span>
                </div>

                {/* Mobile Add to Cart Button */}
                <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 lg:hidden">
                  <FaShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <button className="bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-orange-500">
            View All Deals
          </button>
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;