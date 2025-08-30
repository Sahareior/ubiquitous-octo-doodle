import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const dashboardApis = createApi({
  reducerPath: "dashboardApis",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.10.13.16:15000/api/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
     
      return headers;
    },
  }),

  endpoints: (build) => ({
    getPokemonByName: build.query({
      query: (name) => `pokemon/${name}`,
    }),
    getAllProducts: build.query({
      query: () => "products/",
    }),

    vendorAcceptProduct: build.mutation({
      query: (id) => ({
        url: `products/${id}/accept/`,
        method: "POST",
      }),
    }),

    getAllVendors: build.query({
      query: () => "vendors/",
    }),

    getAllCustomers: build.query({
      query: () => "customers/",
    }),

    deleteCustomers: build.mutation({
      query: (deleteUrl) => ({
        url: `${deleteUrl}/`,
        method: "DELETE",
      }),
    }),

    deleteUser: build.mutation({
      query:(id) =>({
        url: `users/${id}/`,
        method:"DELETE"
      })
    }),



    getAllOrders: build.query({
      query: () => "orders/",
    }),

    getAllSellerApplication: build.query({
      query: () => "seller/applications/",
    }),

    acceptSeller: build.mutation({
      query: ({ id, payload }) =>
        // console.log(id)
        ({
          url: `seller/applications/${id}/approve/`,
          method: "POST",
          body: payload,
        }),
    }),
    acceptProducts: build.mutation({
      query: ({ id, data }) => {
        console.log(data);
        return {
          url: `products/${id}/accept/`,
          method: "POST",
          body: data,
        };
      },
    }),

    bannerUpload: build.mutation({
      query: (data) => {
        return {
          url: "admin/banners/",
          method: "POST",
          body: data,
        };
      },
    }),

    getAllBanners: build.query({
      query: () => "admin/banners",
    }),

    deleteBanner: build.mutation({
      query: (id) => ({
        url: `admin/banners/${id}/`,
        method: "DELETE",
      }),
    }),

    updateBanner: build.mutation({
      query: ({ data, id }) => ({
        url: `admin/banners/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),

    deleteOrdersById: build.mutation({
      query: (id) => ({
        url: `orders/${id}/`,
        method: "DELETE",
      }),
    }),

    viewVendors: build.query({
      query: (uri) => uri, // just return the full URI
    }),

    getLowStacks: build.query({
      query: () => "admin/alerts/low-stock/",
    }),

    getCategorySells: build.query({
      query: () => "admin/category-sales/",
    }),

    getFurnitureSells: build.query({
      query: () => "/admin/furniture-sales-comparison/",
    }),

    getLatestOrders: build.query({
      query: () => "admin/latest-orders/",
    }),

    getOrdersById: build.query({
      query: (id) => `orders/${id}/`,
    }),

    getTopSells: build.query({
      query: () => "top/sell/products/",
    }),

    adminOverView: build.query({
      query: () => "admin/stats/",
    }),

    adminVendorPerfomence: build.query({
      query: () => "admin/vendor-performance/",
    }),

    getAllUsers: build.query({
      query: () => "/users",
    }),

    deleteUsers: build.mutation({
      query: (id) => ({
        url: `/users/${id}/`,
        method: "DELETE",
      }),
    }),

    getAllPayouts: build.query({
      query: () => "payouts/",
    }),
    payoutApprove: build.mutation({
      query:({id,data}) => {
        return{
          url:`payouts/${id}/approve/`,
          method:"POST",
          body:data
        }
      }
    }),

    getRequestReturns: build.query({
      query: ()=> '/returns/product/'
    }),

    getAllNotification: build.query({
      query: () => 'notification/list/'
    }),

    // Chats.....................

    getAllConversationsid: build.query({
      query:() => 'chats/'
    }),

    returnApprove: build.mutation({
      query: ({id,data}) => ({
        url: `returns/product/${id}/approve/`,
        method:"POST",
        body:data
      })
    }),

    vendorOrderNameDetails: build.query({
      query: () => "vendor/order/list/",
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetPokemonByNameQuery,
  useReturnApproveMutation,
  useGetAllNotificationQuery,
  useGetRequestReturnsQuery,
  useGetAllConversationsidQuery,
  usePayoutApproveMutation,
  useAdminOverViewQuery,
  useGetTopSellsQuery,
  useAdminVendorPerfomenceQuery,
  useGetFurnitureSellsQuery,
  useGetLatestOrdersQuery,
  useGetAllPayoutsQuery,
  useGetAllProductsQuery,
  useVendorAcceptProductMutation,
  useAcceptSellerMutation,
  useAcceptProductsMutation,
  useGetAllVendorsQuery,
  useGetOrdersByIdQuery,
  useGetAllUsersQuery,
  useGetAllCustomersQuery,
  useViewVendorsQuery,
  useGetLowStacksQuery,
  useGetCategorySellsQuery,
  useDeleteCustomersMutation,
  useGetAllBannersQuery,
  useUpdateBannerMutation,
  useDeleteOrdersByIdMutation,
  useDeleteUsersMutation,
  useGetAllOrdersQuery,
  useGetAllSellerApplicationQuery,
  useBannerUploadMutation,
  useDeleteBannerMutation,
  useVendorOrderNameDetailsQuery,
} = dashboardApis;
