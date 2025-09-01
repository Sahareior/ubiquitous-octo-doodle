import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDeletePromotionsMutation, useGetPromotionQuery } from "../../../../redux/slices/Apis/vendorsApi";
import Swal from "sweetalert2";

const PromotionsList = () => {
  const { data, refetch } = useGetPromotionQuery();
  const [deletePromotions, { isLoading }] = useDeletePromotionsMutation();

  // Check if data exists
  const promotions = data?.results || [];

  // Local states
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(6); // Show 6 promotions initially

  // Handle delete
  const handelDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#CBA135",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deletePromotions(id).unwrap();
        refetch();
        Swal.fire({
          title: "Deleted!",
          text: "Promotion has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#CBA135",
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error!",
          text: "Something went wrong while deleting.",
          icon: "error",
          confirmButtonColor: "#CBA135",
        });
      }
    }
  };

  // Filter promotions by search text
  const filteredPromotions = promotions.filter((promo) =>
    promo.name.toLowerCase().includes(search.toLowerCase())
  );

  // Paginate visible promotions
  const visiblePromotions = filteredPromotions.slice(0, visibleCount);

  return (
    <div className="p-6 bg-[#FAF8F2] min-h-screen">
      <div className="flex justify-between py-6 items-center mb-4">
        <h2 className="text-lg popreg text-gray-700">
          Manage your promotional campaigns and boost sales
        </h2>
        <Link to="/vendor-dashboard/create-promotion">
          <button className="bg-yellow-600 popmed text-[16px] text-white font-medium px-4 py-2 rounded-md hover:bg-yellow-700">
            + Create New Promotion
          </button>
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap bg-white p-5 py-6 rounded-sm shadow-sm items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search promotions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-4 py-2 rounded-md max-w-sm"
        />
        <p className="text-sm text-gray-500">
          Showing {visiblePromotions.length} of {filteredPromotions.length} promotions
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visiblePromotions.map((promo) => {
          const start = new Date(promo.start_datetime).toLocaleDateString();
          const end = new Date(promo.end_datetime).toLocaleDateString();

          const productCount = promo.products.length;
          const firstProduct = productCount > 0 ? `Product ID: ${promo.products[0]}` : "No products";
          const extraProducts = productCount > 1 ? `+${productCount - 1} more products` : "";

          const badgeColor = promo.is_active ? "text-green-600" : "text-gray-500";
          const statusColor = promo.status === "Expired" ? "text-gray-500" : "text-green-600";

          const discountText =
            promo.discount_type === "percentage"
              ? `${promo.discount_value}% OFF`
              : `৳${promo.discount_value} OFF`;

          return (
            <div key={promo.id} className="bg-[#EAE7E1] p-5 rounded-xl shadow-sm border">
              <h3 className="text-[18px] mb-1 popbold text-gray-800">{promo.name}</h3>
              <p className={`font-medium text-center popmed text-xs rounded-full px-3 w-24 py-1 bg-[#DCFCE7] ${badgeColor}`}>
                {promo.status}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <img
                  src="https://plus.unsplash.com/premium_photo-1661964014750-963a28aeddea?q=80&w=1170&auto=format&fit=crop"
                  alt="product"
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div></div>
              </div>

              <div className="mt-4 px-3 space-y-1">
                <p className="text-sm flex text-[#CBA135] popbold justify-between ">
                  <span className="font-medium popreg text-[#666666]">Discount:</span> {discountText}
                </p>
                <p className="text-sm flex popreg justify-between ">
                  <span className="font-medium popreg text-[#666666]">Duration:</span> {start} – {end}
                </p>
                <p className={`text-sm flex justify-between popmed text-[#666666] ${statusColor}`}>
                  Status: <span>{promo.status}</span>
                </p>
              </div>

              <div className="mt-5 flex gap-3">
                <Link
                  to="/vendor-dashboard/create-promotion"
                  state={promo}
                  className="flex items-center justify-center gap-2 flex-1 bg-yellow-600 text-white py-2.5 rounded-lg hover:bg-yellow-700 transition-all duration-200 text-sm font-medium"
                >
                  <FaEdit className="text-base" />
                  Edit
                </Link>
                <button
                  onClick={() => handelDelete(promo?.id)}
                  className="flex items-center justify-center gap-2 flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-medium"
                >
                  <FaTrash className="text-base" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More button */}
      {visibleCount < filteredPromotions.length && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="px-6 py-2 border border-[#D1D5DB] bg-white rounded-md hover:bg-gray-100"
          >
            Load More Promotions
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionsList;
