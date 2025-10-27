import React, { useState, useEffect } from "react";

const ProductFilter = ({ products, categories, onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedNestedCategory, setSelectedNestedCategory] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Get available subcategories for selected category
  const getSubcategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find(cat => cat._id === selectedCategory);
    return category?.subcategories || [];
  };

  // Get available nested subcategories for selected subcategory
  const getNestedSubcategories = () => {
    if (!selectedCategory || !selectedSubCategory) return [];
    const category = categories.find(cat => cat._id === selectedCategory);
    const subCategory = category?.subcategories?.find(sub => sub._id === selectedSubCategory);
    return subCategory?.subcategories || [];
  };

  // Get filter options for the selected category level
  const getFilterOptions = () => {
    let currentCategory = null;

    if (selectedNestedCategory) {
      const category = categories.find(cat => cat._id === selectedCategory);
      const subCategory = category?.subcategories?.find(sub => sub._id === selectedSubCategory);
      currentCategory = subCategory?.subcategories?.find(nested => nested.id === selectedNestedCategory);
    } else if (selectedSubCategory) {
      const category = categories.find(cat => cat._id === selectedCategory);
      currentCategory = category?.subcategories?.find(sub => sub._id === selectedSubCategory);
    } else if (selectedCategory) {
      currentCategory = categories.find(cat => cat._id === selectedCategory);
    }

    return currentCategory?.filterOptions || [];
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
    setSelectedNestedCategory("");
    setSelectedFilters({});
  };

  // Handle subcategory selection
  const handleSubCategoryChange = (subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
    setSelectedNestedCategory("");
    setSelectedFilters({});
  };

  // Handle nested category selection
  const handleNestedCategoryChange = (nestedCategoryId) => {
    setSelectedNestedCategory(nestedCategoryId);
    setSelectedFilters({});
  };

  // Handle filter option changes
  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    const filteredProducts = products.filter(product => {
      // Filter by category path
      if (selectedCategory && !product.categoryPath?.includes(selectedCategory)) {
        return false;
      }

      if (selectedSubCategory) {
        const subCategory = getSubcategories().find(sub => sub._id === selectedSubCategory);
        if (subCategory?.id && !product.categoryPath?.includes(subCategory.id)) {
          return false;
        }
      }

      if (selectedNestedCategory && !product.categoryPath?.includes(parseFloat(selectedNestedCategory))) {
        return false;
      }

      // Filter by price range
      if (priceRange.min && product.price < parseFloat(priceRange.min)) {
        return false;
      }
      if (priceRange.max && product.price > parseFloat(priceRange.max)) {
        return false;
      }

      // Filter by custom filter options
      const filterOptions = getFilterOptions();
      for (const filterOption of filterOptions) {
        const selectedValue = selectedFilters[filterOption.key];
        if (selectedValue && selectedValue !== "") {
          // Here you would need to check against product.customAttributes
          // For now, we'll just return true since we don't have the actual product filter data
          // You'll need to implement this based on your product data structure
        }
      }

      return true;
    });

    onFilterChange(filteredProducts);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedNestedCategory("");
    setSelectedFilters({});
    setPriceRange({ min: "", max: "" });
    onFilterChange(products);
  };

  // Get current category hierarchy name for display
  const getCurrentCategoryName = () => {
    if (selectedNestedCategory) {
      const nestedCategories = getNestedSubcategories();
      const nested = nestedCategories.find(n => n.id === parseFloat(selectedNestedCategory));
      return nested?.name;
    } else if (selectedSubCategory) {
      const subCategories = getSubcategories();
      const sub = subCategories.find(s => s._id === selectedSubCategory);
      return sub?.name;
    } else if (selectedCategory) {
      const category = categories.find(c => c._id === selectedCategory);
      return category?.name;
    }
    return "";
  };

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedSubCategory, selectedNestedCategory, selectedFilters, priceRange]);

  const filterOptions = getFilterOptions();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Reset All
        </button>
      </div>

      {/* Category Hierarchy */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && getSubcategories().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Category
            </label>
            <select
              value={selectedSubCategory}
              onChange={(e) => handleSubCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sub Categories</option>
              {getSubcategories().map(sub => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSubCategory && getNestedSubcategories().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nested Category
            </label>
            <select
              value={selectedNestedCategory}
              onChange={(e) => handleNestedCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Nested Categories</option>
              {getNestedSubcategories().map(nested => (
                <option key={nested.id} value={nested.id}>
                  {nested.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dynamic Filter Options */}
      {filterOptions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Filter Options for {getCurrentCategoryName()}
          </h3>
          <div className="space-y-4">
            {filterOptions.map(filter => (
              <div key={filter._id} className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.name}
                </label>
                {filter.type === 'select' && (
                  <select
                    value={selectedFilters[filter.key] || ""}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All {filter.name}</option>
                    {filter.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                {/* Add other filter types (checkbox, radio, etc.) as needed */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(selectedCategory || priceRange.min || priceRange.max || Object.keys(selectedFilters).length > 0) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Category: {categories.find(c => c._id === selectedCategory)?.name}
              </span>
            )}
            {selectedSubCategory && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Sub: {getSubcategories().find(s => s._id === selectedSubCategory)?.name}
              </span>
            )}
            {selectedNestedCategory && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Nested: {getNestedSubcategories().find(n => n.id === parseFloat(selectedNestedCategory))?.name}
              </span>
            )}
            {(priceRange.min || priceRange.max) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Price: ${priceRange.min || "0"} - ${priceRange.max || "∞"}
              </span>
            )}
            {Object.entries(selectedFilters).map(([key, value]) => {
              if (!value) return null;
              const filter = filterOptions.find(f => f.key === key);
              return (
                <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {filter?.name}: {value}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;