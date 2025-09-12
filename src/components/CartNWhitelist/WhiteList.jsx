import { Button, Rate } from 'antd';
import React, { useCallback } from 'react';
import Breadcrumb from '../others/Breadcrumb';
import { useDispatch } from 'react-redux';
import withReactContent from 'sweetalert2-react-content';
import { addToCart } from '../../redux/slices/customerSlice';
import Swal from 'sweetalert2';
import { 
  useAddProductToCartMutation, 
  useDeleteWishListMutation, 
  useGetAllWishListQuery, 
  useGetAppCartQuery
} from '../../redux/slices/Apis/customersApi';
import { Trash2 } from "lucide-react"; // icon for delete
import { Link } from 'react-router-dom';

const MySwal = withReactContent(Swal);

const WhiteList = () => {
  const dispatch = useDispatch();
  const { data: wishLists, isLoading, isError, refetch } = useGetAllWishListQuery();
  const [addProductToCart] = useAddProductToCartMutation();
  const [deleteWishList] = useDeleteWishListMutation();
   const {data:cartData, refetch:cartRefetch } = useGetAppCartQuery();


      const checkCartData = useCallback((id) => {
     
        return cartData.results.some(items => items.product.id === id)
      },[cartData])

  const handleCart = async (data) => {
    const payload = { ...data, quantity: 1, product_id: data.id };
    dispatch(addToCart(payload));
    await addProductToCart(payload);
    cartRefetch()
    MySwal.fire({
      position: 'top-end',
      icon: 'success',
      title: '<span style="font-family: Poppins, sans-serif;">Item added to cart!</span>',
      background: '#FFFFFF',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-lg text-gray-800',
        icon: 'text-green-500'
      },
      showConfirmButton: false,
      timer: 1800,
      toast: true,
    });
  };

  const handleDelete = async (wishlistId) => {
    try {
      await deleteWishList(wishlistId).unwrap();
      MySwal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Removed from wishlist',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
      });
      refetch(); // refresh wishlist after deletion
    } catch (error) {
      console.error("Delete error:", error);
      MySwal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Failed to remove',
        showConfirmButton: false,
        timer: 1500,
        toast: true,
      });
    }
  };

  if (isLoading) return <p className="p-10 text-center">Loading wishlist...</p>;
  if (isError) return <p className="p-10 text-center text-red-500">Failed to load wishlist</p>;

  return (
    <div className="md:mx-40 p-3 min-h-screen pb-9">
      <Breadcrumb />

      <div className="py-4">
        <p className="text-[30px] font-bold">My Wishlist</p>
        <p className="text-[16px]">Your saved favorites, all in one place.</p>
      </div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {wishLists?.results?.map((wishlist) => {
    const product = wishlist.product;

    // Check if product has a discount
    const hasDiscount =
      product.promotion_discount_value && product.promotion_discount_value > 0;

    return (
      <div
        key={wishlist.id}
        className="bg-white rounded-2xl shadow-md relative"
      >
        {/* Delete button (top-right) */}
        <button
          onClick={() => handleDelete(wishlist.id)}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
            -{product.promotion_discount_value}{" "}
            {product.promotion_discount_type === "percentage" ? "%" : "XAF"}
          </div>
        )}

        {/* Image */}
         <Link to={`/details?id=${product.id}`} state={product}>
          <img
            src={product?.images?.[0]?.image || "https://via.placeholder.com/300x200"}
            alt={product.name}
            className="w-full h-[192px] object-cover rounded-md mb-4"
            loading="lazy"
          />
        </Link>


        {/* Info */}
        <div className="px-4 space-y-3 p-3">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-1">{product.sku}</p>

          {/* Rating */}
          <div className="flex gap-2 items-center">
            <Rate
              disabled
              defaultValue={product.average_rating || 0}
              className="text-yellow-500 text-sm mb-1"
            />
          </div>

          {/* Price Section */}
          <div className="flex justify-between items-center gap-10">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-gray-400 line-through text-sm">
                  XAF {product.old_price}
                </span>
              )}
              <span className="text-lg font-bold text-[#CBA135]">
                XAF {product.new_price || product.price1}
              </span>
            </div>

            <button
              onClick={() => handleCart(product)}
              className={`rounded-md popbold text-white border-none px-4 py-1 
                ${
                  checkCartData(product.id)
                    ? "bg-green-500"
                    : "bg-[#CBA135] hover:bg-yellow-700"
                }`}
            >
              {checkCartData(product.id) ? "Added" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    );
  })}
</div>

    </div>
  );
};

export default WhiteList;
