import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


// Get token from localStorage

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: fetchBaseQuery({
     baseUrl: import.meta.env.VITE_API_URL ,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    //  headers.set("ngrok-skip-browser-warning", "true");
      return headers;
    },
  }),

  endpoints: (build) => ({
    customerSignup: build.mutation({
      query: (customerData) => ({
        url: "signup/customer/",
        method: "POST",
        body: customerData,
      }),
    }),
    customerLogin: build.mutation({
      query: (customerLogin) => ({
        url: "login/",
        method: "POST",
        body: customerLogin,
      }),
    }),
    getCustomerProfile: build.query({
      query: (id) => `customer/profile/${id}`, // token will be sent automatically
    }),

postSeller: build.mutation({
  query: (data) => ({
    url: "seller/apply/",
    method: "POST",
    body: data,           // this should be FormData
    // Important: fetchBaseQuery sets headers automatically for FormData
  })
}),

vendorApprove: build.query({
  query: () => 'seller/applications/'
}),

topCategory: build.query({
  query: ()=> '/top-sell-category-vendor/'
}),

sellerApprove: build.mutation({
  query: (id) => {
    return{
      url: `seller/applications/${id}/approve/`,
      method: "POST",
      body: id
    }
  }
}),

allOrders: build.query({
  query:()=> '/orders/'
}),

rejectReturn: build.mutation({
  query:({id,data}) => ({
    url: `/returns/product/${id}/reject/`,
    method: "POST",
    body: data
  })
})

// seller/applications/2/approve/

  }),
});

export const {
  useRejectReturnMutation,
  useCustomerSignupMutation,
  useTopCategoryQuery,
  useCustomerLoginMutation,
  useGetCustomerProfileQuery,
  usePostSellerMutation,
  useVendorApproveQuery,
  useSellerApproveMutation,
  useAllOrdersQuery
} = apiSlice;
