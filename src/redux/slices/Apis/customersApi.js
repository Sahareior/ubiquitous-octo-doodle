import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: fetchBaseQuery({

     baseUrl: import.meta.env.VITE_API_URL ,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
     headers.set("ngrok-skip-browser-warning", "true");
      return headers;
    },
  }),

  endpoints: (build) => ({
    getPokemonByName: build.query({
      query: (name) => `pokemon/${name}`,
    }),

 getCustomerProducts: build.query({
  query: () => ({
    url: "products/",

  }),
}),


    addProductToCart: build.mutation({
      query: (data) => ({
        url: "cart/",
        method: "POST",
        body: data,
      }),
    }),

        createSingleOrder: build.mutation({
      query: (data) => ({
        url: 'orders/create-single/',
        method: "POST",
        body:data
      })
    }),

    getAppCart: build.query({
      query: () => "cart/",
    }),

    deleteFromCart: build.mutation({
      query: (id) => ({
        url: `cart/${id}/`,
        method: 'DELETE'
      })
    }),

    getMessagesById: build.query({
      query:(id) => `messages/${id}`
    }),

    getReviews: build.query({
      query: () => "product-reviews/",
    }),

    postReviews: build.mutation({
      query: (data) => {
        // console.log(data)
        return{
          url:'product-reviews/',
          method:"POST",
          body:data
        }
      }
    }),
    getCategories: build.query({
      query: ()=> 'categories/'
    }),

    postCategories: build.mutation({
      query: (data) =>({
        url: "categories/",
        method:"POST",
        body: data
      })
    }),

    editCategory: build.mutation({
      query: ({id,data}) =>({
        url: `categories/${id}/`,
        method: "PATCH",
        body: data
      })
    }),

    deleteCategories: build.mutation({
      query: (id) => ({
        url: `categories/${id}/`,
        method: "DELETE"
      })
    }),

    cartQuantityIncrease: build.mutation({
      query: ({id, cartData}) => {
        // console.log(id,cartData)
        return {
          url: `cart/${id}/increment/`,
          method: "POST",
          body:cartData
        }
      }
    }),
    
    cartQuantityDecrement: build.mutation({
      query: ({id, cartData}) => {
        // console.log(id,cartData)
        return {
          url: `cart/${id}/decrement/`,
          method: "POST",
          body:cartData
        }
      }
    }),

    postAddress: build.mutation({
      query: (data)=> {
        return{
          url: 'shipping-addresses/',
          method:"POST",
          body:data
        }
      }
    }),

    getAddressById : build.query({
      query: (id) => `shipping-addresses/${id}/`
    }),

    createOrderFromCart: build.mutation({
      query:(data) => ({
        url: 'orders/create-from-cart/',
        method: 'POST',
        body:data
      })
    }),

    createCheckout: build.mutation({
      query: (id) => ({
        url:'checkout/checkout/',
        method:'POST',
        body:id
      })
    }),

    getRecept: build.query({
      query: (orderId)=> `receipt/${orderId}/`
    }),

    returnProduct: build.mutation({
      query:(data) => ({
        url: 'returns/product/',
        method: "POST",
        body:data
      })
    }),

    getUserById: build.query({
      query: (id) => `users/${id}/`
    }),

    getDeleveredOrders: build.query({
      query: () => '/deliverd/item/'
    }),

    getProfile: build.query({
      query: () => 'profile/'
    }),

    customerProfileUpdate: build.mutation({
      query: (data)=> ({
        url: '/profile/update/',
        method: "PATCH",
        body:data
      })
    }),

    savetoWishList : build.mutation({
      query: (data) => ({
        url:'wishlist/',
        method:'POST',
        body: data
      })
    }),

    getAllWishList: build.query({
      query: ()=> 'wishlist/'
    }),

    deleteWishList: build.mutation({
      query: (id)=> ({
        url: `wishlist/${id}/`,
        method: "DELETE"
      })
    }),

    forgetPassRequest: build.mutation({
      query: (data) => ({
        url: 'send-reset-otp/',
        method: "POST",
        body:data
      })
    }),

    verifyOtp: build.mutation({
      query: (data)=> ({
        url:'verify-reset-otp/',
        method: "POST",
        body:data
      })
    }),

    setNewpassword: build.mutation({
      query:(data)=>({
        url: '/set-new-password/',
        method:"POST",
        body:data
      })
    }),

    shippingAddressDelete: build.mutation({
      query: (id) => ({
        url: `shipping-addresses/${id}/`,
        method: "DELETE"
      })
    }),
    
    getProductById: build.query({
      query: (id) =>  `/products/${id}/`
    }),

    getAddress: build.query({
      query: () => 'shipping-addresses/'
    })
  }),
  
  
});


export const {
  useGetPokemonByNameQuery,
  useLazyGetProductByIdQuery,
  useSetNewpasswordMutation,
  useShippingAddressDeleteMutation,
  useVerifyOtpMutation,
  useForgetPassRequestMutation,
  useGetDeleveredOrdersQuery,
  useDeleteWishListMutation,
  useGetAllWishListQuery,
  useSavetoWishListMutation,
  useGetProfileQuery,
useCustomerProfileUpdateMutation,
  useLazyGetUserByIdQuery,
  useLazyGetMessagesByIdQuery,
  useGetUserByIdQuery,
  useGetMessagesByIdQuery,
  useDeleteFromCartMutation,
  useGetAddressByIdQuery,
  usePostAddressMutation,
  useEditCategoryMutation,
  useDeleteCategoriesMutation,
  useGetAddressQuery,
  useGetCustomerProductsQuery,
  useAddProductToCartMutation,
  useGetAppCartQuery,
  useGetReviewsQuery,
  usePostReviewsMutation,
  useGetCategoriesQuery,
  useCartQuantityIncreaseMutation,
  useCartQuantityDecrementMutation,
  useCreateOrderFromCartMutation,
  useCreateCheckoutMutation,
  useGetReceptQuery,
  useCreateSingleOrderMutation,
  useLazyGetReceptQuery,
  usePostCategoriesMutation,
  useReturnProductMutation,
} = customersApi;
