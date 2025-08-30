import { Button, Rate } from 'antd';
import React from 'react';
import Breadcrumb from '../others/Breadcrumb';
import { useDispatch } from 'react-redux';
import withReactContent from 'sweetalert2-react-content';
import { addToCart } from '../../redux/slices/customerSlice';
import Swal from 'sweetalert2';
import { 
  useAddProductToCartMutation, 
  useDeleteWishListMutation, 
  useGetAllWishListQuery 
} from '../../redux/slices/Apis/customersApi';
import { Trash2 } from "lucide-react"; // icon for delete

const MySwal = withReactContent(Swal);

const WhiteList = () => {
  const dispatch = useDispatch();
  const { data: wishLists, isLoading, isError, refetch } = useGetAllWishListQuery();
  const [addProductToCart] = useAddProductToCartMutation();
  const [deleteWishList] = useDeleteWishListMutation();

  const handleCart = async (data) => {
    const payload = { ...data, quantity: 1, product_id: data.id };
    dispatch(addToCart(payload));
    await addProductToCart(payload);

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
    <div className="mx-40 min-h-screen pb-9">
      <Breadcrumb />

      <div className="py-4">
        <p className="text-[30px] font-bold">My Wishlist</p>
        <p className="text-[16px]">Your saved favorites, all in one place.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishLists?.results?.map((wishlist) => {
          const product = wishlist.product;
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

              <img
                src={product?.images?.[0]?.image || 'https://via.placeholder.com/300x200'}
                alt={product.name}
                className="w-full rounded-t-2xl h-64 object-cover mb-4"
              />

              <div className="px-4 space-y-3 p-3">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{product.sku}</p>

                <div className="flex gap-2 items-center">
                  <Rate disabled defaultValue={4} className="text-yellow-500 text-sm mb-1" />
                  <p>(123)</p>
                </div>

                <div className="flex justify-between items-center gap-10">
                  <p className="text-lg font-bold">XAF {product.price1}</p>
                  <button
                    onClick={() => handleCart(product)}
                    className="bg-yellow-600 text-white px-5 py-1 rounded-lg hover:bg-yellow-700"
                  >
                    Add to Cart
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
