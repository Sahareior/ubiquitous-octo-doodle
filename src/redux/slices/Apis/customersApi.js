import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://311796b16064.ngrok-free.app/api/",
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

    getAppCart: build.query({
      query: () => "cart/",
    }),

    deleteFromCart: build.mutation({
      query: (id) => ({
        url: `cart/${id}/`,
        method: 'DELETE'
      })
    }),



    getReviews: build.query({
      query: () => "product-reviews/",
    }),

    postReviews: build.mutation({
      query: (data) => {
        console.log(data)
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
        url: `category/${id}/`,
        method: "PATCH",
        body: data
      })
    }),

    cartQuantityIncrease: build.mutation({
      query: ({id, cartData}) => {
        console.log(id,cartData)
        return {
          url: `cart/${id}/increment/`,
          method: "POST",
          body:cartData
        }
      }
    }),
    cartQuantityDecrement: build.mutation({
      query: ({id, cartData}) => {
        console.log(id,cartData)
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

    getAddress: build.query({
      query: () => 'shipping-addresses/'
    })
  }),
  
  
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetPokemonByNameQuery,
  useDeleteFromCartMutation,
  usePostAddressMutation,
  useEditCategoryMutation,
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
  usePostCategoriesMutation
} = customersApi;
