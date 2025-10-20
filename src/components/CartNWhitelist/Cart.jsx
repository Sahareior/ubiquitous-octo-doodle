import { Button, Radio } from "antd";
import React, { useState } from "react";
import { AiOutlineMinus, AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { IoChatbubblesOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../others/Breadcrumb";
import {
  useCartQuantityDecrementMutation,
  useCartQuantityIncreaseMutation,
  useDeleteFromCartMutation,
  useGetAppCartQuery,
} from "../../redux/slices/Apis/customersApi";
import { useGetAllProductsQuery } from "../../redux/slices/Apis/vendorsApi";
import Similar from "../homepage/productDetailAndFilter/_components/Similier";
import { ShoppingCart } from "lucide-react";


const CartItem = ({ item, onIncrease, onDecrease, onRemove, formatXAF }) => {
  const hasPromotion = item.promotion_discount_type && item.promotion_discount_value;
  
  return (
    <div className="bg-white rounded-xl mt-6 p-2 md:flex items-center gap-6 shadow-sm">
      <img
        src={item.images?.[0]?.url || "https://via.placeholder.com/150"}
        alt={item.name}
        className="h-32 w-32 object-cover rounded-lg"
      />

      <div className="flex-1">
        <h2 className="text-lg font-semibold">{item.name}</h2>
        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
        
        {hasPromotion ? (
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xl font-bold text-[#CBA135]">
              {formatXAF(parseFloat(item.new_price))}
            </p>
            <p className="text-md text-gray-500 line-through">
              {formatXAF(parseFloat(item.old_price))}
            </p>
            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
              {item.promotion_discount_type === 'flat' 
                ? `Save ${formatXAF(parseFloat(item.promotion_discount_value))}`
                : `Save ${item.promotion_discount_value}%`
              }
            </span>
          </div>
        ) : (
          <p className="text-xl font-bold text-[#CBA135] mt-2">
            {formatXAF(parseFloat(item.active_price))}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end  gap-2">
        <button
          onClick={() => onDecrease(item.id)}
          className="w-8 h-8 border rounded-full hover:bg-gray-100 flex justify-center items-center"
        >
          <AiOutlineMinus size={16} />
        </button>
        <span className="px-2 font-medium">{item.quantity}</span>
        <button
          onClick={() => onIncrease(item.id)}
          className="w-8 h-8 border rounded-full hover:bg-gray-100 flex justify-center items-center"
        >
          <AiOutlinePlus size={16} />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="ml-3 text-gray-400 hover:text-red-500"
        >
          <AiOutlineClose size={20} />
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const [deliveryType, setDeliveryType] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartQuantityDecrement] = useCartQuantityDecrementMutation();
  const [cartQuantityIncrease] = useCartQuantityIncreaseMutation();
  const { data: cartData, refetch } = useGetAppCartQuery();
  const [deleteFromCart] = useDeleteFromCartMutation()
  const { data: productsData } = useGetAllProductsQuery();
    const navigate = useNavigate();
  // Map API cart data to local state
  const [cartItems, setCartItems] = useState([]);

  React.useEffect(() => {
    if (cartData?.results) {
      const items = cartData?.results.map((cartItem) => {
        const product = cartItem.product;
        const hasPromotion = product.promotion_discount_type && product.promotion_discount_value;
        
        return {
          id: cartItem.id, // keep cart item id for remove/update
          productId: product.id,
          name: product.name,
          sku: product.sku,
          quantity: cartItem.quantity,
          active_price: hasPromotion ? product.new_price : (cartItem.price_snapshot || product.price1),
          old_price: hasPromotion ? product.old_price : null,
          new_price: hasPromotion ? product.new_price : null,
          promotion_discount_type: product.promotion_discount_type,
          promotion_discount_value: product.promotion_discount_value,
          images: product.images.map((img) => ({
            id: img.id,
            url: img.image,
          })),
        };
      });
      setCartItems(items);
    }
  }, [cartData]);


if (!cartData?.results || cartData?.results?.length === 0) {
  return (
    <div className="flex flex-col items-center h-screen justify-center py-10 px-6 bg-gray-50 rounded-2xl shadow-md border border-gray-200">
      <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Your Cart is empty!
      </h2>
      <p className="text-gray-500 text-center mb-4">
        Looks like you haven’t added any products yet.
      </p>

      <Link to='/'>
      <button className="px-5 py-2 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition">
        Shop Now
      </button>
       </Link>
      
    </div>
  );
}

  const formatXAF = (amount) => `XAF ${Number(amount).toLocaleString()}`;

  const calculateItemPrice = (item) => {
    if (item.promotion_discount_type && item.promotion_discount_value) {
      return parseFloat(item.new_price);
    }
    return parseFloat(item.active_price || 0);
  };

  const increaseQuantity = async (id) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    try {
      // call backend to increase quantity
      const res = await cartQuantityIncrease({ id, quantity: item.quantity + 1 }).unwrap();

      // update local state after success
      setCartItems(prev =>
        prev.map(it => it.id === id ? { ...it, quantity: it.quantity + 1 } : it)
      );
    } catch (error) {
      console.error("Failed to increase quantity:", error);
    }
  };

  const decreaseQuantity = async (id) => {
    const item = cartItems.find(i => i.id === id);
    if (!item || item.quantity <= 1) return;

    try {
      const res = await cartQuantityDecrement({ id, quantity: item.quantity - 1 }).unwrap();

      setCartItems(prev =>
        prev.map(it => it.id === id ? { ...it, quantity: it.quantity - 1 } : it)
      );
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
    }
  };

  const removeItem = async (id) => {
    const res = await deleteFromCart(id)
    refetch()
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + calculateItemPrice(item) * item.quantity,
    0
  );

  const originalSubtotal = cartItems.reduce(
    (acc, item) => {
      const originalPrice = item.old_price ? parseFloat(item.old_price) : parseFloat(item.active_price || 0);
      return acc + originalPrice * item.quantity;
    },
    0
  );

  const totalDiscountFromPromotions = originalSubtotal - subtotal;

  const deliveryFee =
    deliveryType === "express" ? 100 : deliveryType === "pickup" ? 0 : 50;
  const tax = Math.round(subtotal * 0.05);
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = subtotal + deliveryFee + tax - couponDiscount;

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const payLoad= {
    total, subtotal, deliveryFee, data: cartData?.results, deliveryType, delivery_instructions:deliveryInstructions
  }


  
  const handleCheckout = async () => {
    try {
      const data = await refetch(); // Wait for refetch to finish
      navigate("checkout1", { state: payLoad }); // Then navigate
    } catch (err) {
      console.error("Refetch failed:", err);
    }
  };


  return (
    <div className="bg-[#FAF8F2] min-h-screen p-3 pb-10">
      <div className="m"></div>
      <div className="mx-auto pt-2 md:px-40">
        <Breadcrumb />
        <h2 className="text-3xl font-bold mb-6">My Cart</h2>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items */}
          <div className="flex-1 p-2 bg-[#EAE7E1]">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeItem}
                formatXAF={formatXAF}
              />
            ))}

            {cartData?.results?.length > 0 && (
              <div className="bg-white rounded-2xl mt-6 p-6 shadow-sm">
                <h4 className="text-base font-medium text-gray-800 mb-2">
                  Delivery Instructions{" "}
                  <span className="text-sm text-gray-500">(optional)</span>
                </h4>
                <textarea
                  className="w-full border border-[#CBA135] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CBA135] resize-none"
                  rows={4}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Add any specific delivery notes here..."
                />
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="flex flex-col gap-12">
            <div className="w-full lg:w-[350px] bg-white p-6 rounded-xl shadow-sm h-fit">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}
                    )
                  </span>
                  <span>{formatXAF(subtotal)}</span>
                </div>
                
                {totalDiscountFromPromotions > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promotional Discount</span>
                    <span>-{formatXAF(totalDiscountFromPromotions)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatXAF(deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatXAF(tax)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-{formatXAF(couponDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-lg font-semibold mt-6">
                <h3>Total</h3>
                <h3 className="text-[#CBA135]">{formatXAF(total)}</h3>
              </div>

              {/* Checkout Buttons */}
              <div className="mt-6 flex flex-col gap-3">
              
                  <button onClick={()=> handleCheckout()} className="h-[56px] rounded-md w-full bg-[#CBA135] text-white font-semibold hover:bg-yellow-600">
                    Proceed to Checkout
                  </button>
              
              </div>
            </div>

            <div className="bg-white p-4 py-8 rounded-lg shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Delivery Type
              </h3>
              <Radio.Group
                className="flex flex-col gap-4 custom-radio"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
              >
                <Radio value="standard">Standard ({formatXAF(50)})</Radio>
                <Radio value="express">Express ({formatXAF(100)})</Radio>
                <Radio value="pickup">Pickup (Free)</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>

        {/* The rest of your component remains the same */}
              <div className="flex py-9 justify-between ">
            <h4 className="popmed text-[30px]">You may also need</h4>
            <h5 className="popbold text-[16px] text-[#CBA135]">View All</h5>
          </div>
      <Similar component='cart' randomProducts={productsData?.results || []} title="You may also like" />
      </div>

      <div className="flex flex-col md:flex-col lg:flex-row justify-between items-center gap-10 bg-[#E6E3DD] px-5 sm:px-10 md:px-10 lg:px-20 xl:px-60 py-12 w-full">
        {/* Left Block */}
        <div className="flex flex-col gap-4 w-full lg:max-w-md text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <img src="/image/hand.png" alt="hand" className="w-10 h-10" />
            <h2 className="text-[22px] sm:text-[24px] md:text-[26px] lg:text-[28px] popmed">
              Shopping Assistance
            </h2>
          </div>
          <p className="text-[14px] sm:text-[15px] md:text-[16px] popmed">
            Have a question before you checkout? We're here to help!
          </p>
          <button className="flex items-center justify-center lg:justify-start gap-2 text-[#CBA135] text-[15px] sm:text-[16px] hover:underline">
            <IoChatbubblesOutline className="text-xl" /> Chat Now
          </button>
        </div>

        {/* Right Block */}
        <div className="flex flex-col gap-4 w-full lg:max-w-md text-center lg:text-right">
          <div className="flex items-center justify-center lg:justify-end gap-3">
            <img src="/image/hand.png" alt="hand" className="w-10 h-10" />
            <h2 className="text-[22px] sm:text-[24px] md:text-[26px] lg:text-[28px] popmed">
              30- Day Returns
            </h2>
          </div>
          <p className="text-[14px] text-start sm:text-[15px] md:text-[16px] popmed">
            Not loving it? We offer return for most item within 30 Days delivery
            for a refund or store credit.
          </p>
          <button className="flex items-center justify-center lg:justify-end gap-2 text-[#CBA135] text-[15px] sm:text-[16px] hover:underline">
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;