import React, { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { Link, redirect, useLocation } from "react-router-dom";
import Breadcrumb from "../others/Breadcrumb";
import ConfirmOrder from "./ConfirmOrder";
import {


  useCreateCheckoutMutation,
  useCreateOrderFromCartMutation,
  useGetAddressQuery,
} from "../../redux/slices/Apis/customersApi";
import Swal from "sweetalert2";

const Checkout1 = () => {
  const location = useLocation();
  const { data: address, isLoading: addressLoading } = useGetAddressQuery();
const [createOrderFromCart] = useCreateOrderFromCartMutation()
const [createCheckout] = useCreateCheckoutMutation()
const isLoading = false
  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);

  console.log(location.state)
  // Extract cart data from location
  const {
    data: cartData = [],
    subtotal = 0,
    deliveryFee = 0,
    total = 0,
  } = location.state || {};

  // Total items
  const totalItems = cartData.reduce((acc, item) => acc + item.quantity, 0);


const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    Swal.fire({
      title: "Address Required",
      text: "Please select an address before placing the order!",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  if (!selectedMethod) {
    Swal.fire({
      title: "Payment Method Required",
      text: "Please select a payment method before placing the order!",
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    // Extract vendor IDs from cart
    const vendo = [...new Set(cartData.map(item => item.product.vendor_id))]; // unique vendors

    const orderData = {
      cart: cartData,
      subtotal,
      deliveryType: location.state.deliveryType,
      deliveryFee,
      total,
      address: selectedAddress,
      payment_method: selectedMethod,
      vendors: vendo,
    };

    // 1. Create order from cart
    const res = await createOrderFromCart(orderData).unwrap();
    console.log("Order Response:", res[0].order_id);

    // 2. If order is created, create checkout
    if (res[0].order_id) {
      const checkoutRes = await createCheckout({
        order_id: res[0].order_id, // ensure it's a string
      }).unwrap();

      console.log("Checkout Response:", checkoutRes.checkout_url);

      if (checkoutRes.checkout_url) {
        Swal.fire({
          title: "Redirecting...",
          text: "You are being redirected to the payment page.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          willClose: () => {
            window.location.href = checkoutRes.checkout_url;
          },
        });
      }
    }
  } catch (error) {
    console.error("Error placing order:", error);
    Swal.fire({
      title: "Order Failed",
      text: "Something went wrong while placing your order. Please try again.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};



  return (
    <div className="bg-[#FAF8F2] min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-8 pt-6 space-y-4">
          <Breadcrumb />
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Checkout</h3>
          <p className="text-gray-600 text-lg">Almost there! Confirm your details to complete your order</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section: Address + Payment */}
          <div className="flex-1 space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Delivery Address</h4>
              
              {addressLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl"></div>
                  ))}
                </div>
              ) : address?.results?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {address.results.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAddress(item)}
                      className={`cursor-pointer transition-all duration-300 p-5 rounded-xl flex flex-col justify-between h-full border-2 ${
                        selectedAddress?.id === item.id
                          ? "border-[#CBA135] bg-amber-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-amber-200 hover:shadow-sm"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item?.full_name}
                          </h3>
                          <div className="flex gap-3">
                            <button className="text-amber-600 hover:text-amber-800 transition-colors">
                              <AiOutlineEdit size={18} />
                            </button>
                            <button className="text-red-400 hover:text-red-600 transition-colors">
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="text-gray-700">
                          <p className="text-md">
                            {item.street_address}, {item.city}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.landmark || "No landmark specified"}
                          </p>
                        </div>
                      </div>
                      
                      {selectedAddress?.id === item.id && (
                        <div className="mt-3 flex items-center text-amber-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">No saved addresses found.</p>
                </div>
              )}

              {/* Add Address Button */}
              <div className="mt-6">
                <Link to="/checkout">
                  <button className="w-full py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors duration-300 shadow-md hover:shadow-lg">
                    Add New Address
                  </button>
                </Link>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <ConfirmOrder setSelectedMathod={setSelectedMethod} />
            </div>
          </div>

          {/* Right Section: Order Summary */}
          <div className="lg:w-96">
            <div className="sticky top-6 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">Order Summary</h3>

              {/* Cart Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6">
                {cartData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4 py-2">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.product.images?.[0]?.image || "/placeholder.png"
                          }
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      $
                      {(
                        parseFloat(item.price_snapshot) * item.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="space-y-3 text-gray-700 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-4" />

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-gray-900">Total</h4>
                <h4 className="text-2xl font-bold text-amber-600">
                  ${total.toFixed(2)}
                </h4>
              </div>

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700 shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                By clicking Place Order, you accept WRIKXO's <br />
                <a href="#" className="text-amber-600 hover:text-amber-700 underline transition-colors">
                  return & shipping policies
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout1;