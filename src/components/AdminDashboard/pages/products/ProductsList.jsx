import React, { useState, useMemo } from "react";
import ProductsTable from "./ProductsTable";
import { Select } from "antd";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import {
  useGetAllProductsQuery,
  useVendorAcceptProductMutation,
} from "../../../../redux/slices/Apis/dashboardApis";
import { useGetCategoriesQuery } from "../../../../redux/slices/Apis/vendorsApi";

const { Option } = Select;

const ProductsList = () => {
  const { data: products } = useGetAllProductsQuery();
  const { data: categories } = useGetCategoriesQuery();

  // --- states for filters ---
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOption, setSortOption] = useState("newest");

  // --- filter & sort logic ---
  const filteredProducts = useMemo(() => {
    let filtered = products?.results || [];

    // 🔍 search filter
    if (searchText.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 📂 category filter (by id)
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) =>
        item.categories.includes(Number(selectedCategory))
      );
    }

    // 📌 status filter
    if (selectedStatus !== "All") {
      if (selectedStatus === "In Stock") {
        filtered = filtered.filter((item) => item.is_stock === true);
      } else if (selectedStatus === "Out of stock") {
        filtered = filtered.filter((item) => item.is_stock === false);
      } else {
        filtered = filtered.filter(
          (item) => item.status.toLowerCase() === selectedStatus.toLowerCase()
        );
      }
    }

    // ⬇️ sorting
    if (sortOption === "newest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (sortOption === "oldest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (sortOption === "priceLowHigh") {
      filtered = [...filtered].sort((a, b) => parseFloat(a.price1) - parseFloat(b.price1));
    } else if (sortOption === "priceHighLow") {
      filtered = [...filtered].sort((a, b) => parseFloat(b.price1) - parseFloat(a.price1));
    }

    return filtered;
  }, [products, searchText, selectedCategory, selectedStatus, sortOption]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pt-4">
        <p className="text-[34px] popbold">Products List</p>
        <div className="flex gap-4">
          <Link to="/admin-dashboard/add-product">
            <button className="bg-[#CBA135] popmed flex justify-end py-3 px-5 rounded-md text-end items-center gap-3 text-white">
              <FaPlus /> Add New Products
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 p-6 bg-white items-center rounded-md md:grid-cols-4 gap-5">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search Product Name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <Select
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            className="w-full"
            size="large"
          >
            <Option value="All">All Categories</Option>
            {categories?.results?.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            className="w-full"
            size="large"
          >
            <Option value="All">All</Option>
            <Option value="In Stock">In Stock</Option>
            <Option value="Out of stock">Out of Stock</Option>
            <Option value="approved">Approved</Option>
            <Option value="pending">Pending</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </div>

        {/* Sort */}
        <div>
          <Select
            value={sortOption}
            onChange={(val) => setSortOption(val)}
            className="w-full"
            size="large"
          >
            <Option value="newest">Newest</Option>
            <Option value="oldest">Oldest</Option>
            <Option value="priceLowHigh">Price: Low to High</Option>
            <Option value="priceHighLow">Price: High to Low</Option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div>
        <ProductsTable products={filteredProducts} />
      </div>
    </div>
  );
};

export default ProductsList;
