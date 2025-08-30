import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vendorsApi = createApi({
  reducerPath: "vendorsApi",
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

    vendorProductCreate: build.mutation({
      query: (data) => {
        console.log(data);
        return {
          url: "products/",
          method: "POST",
          body: data,
        };
      },
    }),

    vendorEditProduct: build.mutation({
      query: ({id,formDataToSend}) =>({
        url: `products/${id}/`,
        method: "PATCH",
        body: formDataToSend
      })
    }),

    deleteProduct: build.mutation({
      query: (id) => ({
        url: `products/${id}/`,
        method: "DELETE",
      }),
    }),

    vendorDashboard: build.query({
      query: () => "vendor/dashboard/",
    }),

    vendorOverview: build.query({
      query: () => "vendor/sales-overview/",
    }),

    vendorSellsPerfomence: build.query({
      query: () => "vendor/sales-performance/",
    }),

    getTopSells: build.query({
      query: () => "top-sell-products/",
    }),

    getVendorOrders: build.query({
      query: () => "vendor/order/list/",
    }),

    createPromotion: build.mutation({
      query: (data) => {
        console.log(data);
        return {
          url: "promotions/",
          method: "POST",
          body: data,
        };
      },
    }),
    editPromotion: build.mutation({
      query: ({ id, payload }) => {
        console.log({ id, payload });
        return {
          url: `promotions/${id}/`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    deletePromotions: build.mutation({
      query: (id) => ({
        url: `promotions/${id}/`,
        method: "DELETE",
      }),
    }),

    getVendorPayout: build.query({
      query: () => "payouts/",
    }),

    getPromotion: build.query({
      query: () => "promotions/",
    }),

    getVendorProductById: build.query({
      query: () => `vendor/products/`,
    }),

    getAllProducts: build.query({
      query: () => "products/",
    }),

    getVendorPaymentStat: build.query({
      query: () => "vendor/payments-stats/",
    }),

    getTotalEarnings: build.query({
      query: () => "payouts/total_earnings/",
    }),
    getCategories: build.query({
      query: () => "categories/",
    }),

    getTags: build.query({
      query: () => "tags/",
    }),

    postPayouts: build.mutation({
      query: (data) => ({
        url:'payouts/',
        method: 'POST',
        body:data
      })
    })

    // deleteProduct: build.mutation({
    //   query: (id) => ({
    //     url: `products/${id}/`,
    //     method: "DELETE",
    //   }),
    // }),
    // /payouts/total_earnings/
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetPokemonByNameQuery,
  useVendorEditProductMutation,
  useVendorProductCreateMutation,
  usePostPayoutsMutation,
  useDeleteProductMutation,
  useGetVendorProductByIdQuery,
  useGetAllProductsQuery,
  useGetVendorPaymentStatQuery,
  useEditPromotionMutation,
  useGetVendorPayoutQuery,
  useGetTotalEarningsQuery,
  useGetCategoriesQuery,
  useGetTagsQuery,
  useDeletePromotionsMutation,
  useVendorDashboardQuery,
  useVendorOverviewQuery,
  useGetTopSellsQuery,
  useGetVendorOrdersQuery,
  useCreatePromotionMutation,
  useGetPromotionQuery,
  useVendorSellsPerfomenceQuery,
} = vendorsApi;
