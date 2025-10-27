import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductFilter from "./ProductFilter";
// import ProductFilter from "./ProductFilter";

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/products");
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleFilterChange = (filteredProducts) => {
    setFilteredProducts(filteredProducts);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilter
            products={products}
            categories={categories}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;