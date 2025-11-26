import React, { useState, useMemo, useEffect } from "react";
import ProductsTable from "./ProductsTable";
import { Select, Spin } from "antd";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";

import { 
  useGetAllProductsQuery, 
  useGetCategoriesQuery, 
  useGetProductsByCategoryQuery, 
  useLazyGetProductsByCategoryQuery 
} from "../../../../redux/slices/Apis/vendorsApi";

const { Option } = Select;

const ProductsList = ({path}) => {
  const { data: products, isLoading } = useGetAllProductsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const [getProductsByCategory, { data: categoryProducts, isLoading: categoryLoading }] = 
    useLazyGetProductsByCategoryQuery();

  // --- states for filters ---
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOption, setSortOption] = useState("newest");

  // Function to extract all products from category response (including subcategories)
  const extractAllProducts = (categoryData) => {
    if (!categoryData) return [];
    
    const allProducts = [];
    
    const extractFromNode = (node) => {
      // Add products from current node
      if (node.products && node.products.length > 0) {
        allProducts.push(...node.products);
      }
      
      // Recursively extract from children
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => extractFromNode(child));
      }
    };
    
    // If it's a root category with children array
    if (categoryData.children && Array.isArray(categoryData.children)) {
      categoryData.children.forEach(child => extractFromNode(child));
    } else {
      // If it's directly the node structure
      extractFromNode(categoryData);
    }
    
    return allProducts;
  };

  // Fetch category products when category changes
  useEffect(() => {
    if (selectedCategory !== "All") {
      getProductsByCategory(selectedCategory);
    }
  }, [selectedCategory, getProductsByCategory]);

  // --- filter & sort logic ---
  const filteredProducts = useMemo(() => {
    let filtered = [];

    // Determine which data source to use
    if (selectedCategory !== "All" && categoryProducts) {
      // Use category products (including subcategories)
      filtered = extractAllProducts(categoryProducts);
    } else {
      // Use all products
      filtered = products?.results || [];
    }

   

    // 🔍 search filter
    if (searchText.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 📂 category filter (by id) - only needed when using all products
    if (selectedCategory !== "All" && !categoryProducts) {
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
  }, [products, categoryProducts, selectedCategory, searchText, selectedStatus, sortOption]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const isLoadingState = isLoading || (selectedCategory !== "All" && categoryLoading);

  if(isLoadingState){
    return(
      <div className="flex h-screen justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center pt-4">
        <p className="text-[34px] popbold">Products List</p>
        <div className="flex gap-4">
          <Link to={path === '/vendor-dashboard/vendor-products' ? '/vendor-dashboard/addproducts' : '/admin-dashboard/add-product'}>
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
            className="w-full border popreg border-[#D1D5DB] rounded-md px-4 pl-10 h-[45px] placeholder:text-sm focus:outline-none focus:ring-0 focus:border-[#CBA135]"
          />
        </div>

        {/* Category Filter */}
        <div>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full"
            size="large"
            loading={isLoading}
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
        <ProductsTable 
          path={path} 
          products={filteredProducts} 
          isLoading={selectedCategory !== "All" && categoryLoading}
        />
      </div>
    </div>
  );
};

export default ProductsList;