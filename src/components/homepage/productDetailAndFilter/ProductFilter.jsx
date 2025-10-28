import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const ProductFilter = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedNestedId, setSelectedNestedId] = useState("");
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation()

  console.log(location.state.categoryData.selectedCategory.name,'asssss')

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    updateFilterOptions();
    setSelectedFilters({});
  }, [selectedCategoryId, selectedSubCategoryId, selectedNestedId]);

  useEffect(() => {
    applyFilters();
  }, [selectedFilters, products]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/products");
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Helper function to get string ID for comparison
  const getSubCategoryIdString = (sub) => {
    const id = sub.id || sub._id;
    return id ? id.toString() : "";
  };

  // Find category hierarchy
  const findCategoryHierarchy = () => {
    if (!selectedCategoryId) return null;

    const mainCategory = categories.find((cat) => cat._id === selectedCategoryId);
    if (!mainCategory) return null;

    let subCategory = null;
    let nestedSubCategory = null;

    if (selectedSubCategoryId && mainCategory.subcategories) {
      subCategory = mainCategory.subcategories.find(
        (sub) => getSubCategoryIdString(sub) === selectedSubCategoryId
      );

      if (subCategory && selectedNestedId && subCategory.subcategories) {
        nestedSubCategory = subCategory.subcategories.find(
          (nested) => getSubCategoryIdString(nested) === selectedNestedId
        );
      }
    }

    return {
      main: mainCategory,
      sub: subCategory,
      nested: nestedSubCategory
    };
  };

  // Update filter options based on selected category hierarchy
  const updateFilterOptions = () => {
    const hierarchy = findCategoryHierarchy();
    
    if (!hierarchy) {
      setFilterOptions([]);
      return;
    }

    let finalCategory = null;
    
    if (hierarchy.nested && hierarchy.nested.filterOptions) {
      finalCategory = hierarchy.nested;
    } else if (hierarchy.sub && hierarchy.sub.filterOptions) {
      finalCategory = hierarchy.sub;
    } else if (hierarchy.main && hierarchy.main.filterOptions) {
      finalCategory = hierarchy.main;
    }

    if (finalCategory && finalCategory.filterOptions) {
      setFilterOptions(finalCategory.filterOptions);
    } else {
      setFilterOptions([]);
    }
  };

  // Handle filter selection
  const handleFilterChange = (filterName, value, type) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'checkbox') {
        const currentValues = newFilters[filterName] || [];
        if (currentValues.includes(value)) {
          newFilters[filterName] = currentValues.filter(v => v !== value);
        } else {
          newFilters[filterName] = [...currentValues, value];
        }
      } else {
        newFilters[filterName] = value;
      }
      
      // Remove empty filter entries
      Object.keys(newFilters).forEach(key => {
        if (!newFilters[key] || (Array.isArray(newFilters[key]) && newFilters[key].length === 0)) {
          delete newFilters[key];
        }
      });
      
      return newFilters;
    });
  };

  // Check if a filter option is selected
  const isFilterSelected = (filterName, value, type) => {
    if (type === 'checkbox') {
      return (selectedFilters[filterName] || []).includes(value);
    } else {
      return selectedFilters[filterName] === value;
    }
  };

  // Apply filters to products
  const applyFilters = () => {
    if (Object.keys(selectedFilters).length === 0) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => {
      // Check if product belongs to selected category hierarchy
      const matchesCategory = 
        product.category === selectedCategoryId &&
        (!selectedSubCategoryId || product.subcategory === selectedSubCategoryId) &&
        (!selectedNestedId || product.nestedSubcategory === selectedNestedId);

      if (!matchesCategory) return false;

      // Check if product matches all selected filters
      return Object.entries(selectedFilters).every(([filterName, filterValue]) => {
        const productSpec = product.specification?.find(spec => spec.name === filterName);
        
        if (!productSpec) return false;

        if (Array.isArray(filterValue)) {
          // Checkbox filter - product must have at least one of the selected values
          return filterValue.some(value => 
            productSpec.values.includes(value)
          );
        } else {
          // Radio filter - product must have the exact value
          return productSpec.values.includes(filterValue);
        }
      });
    });

    setFilteredProducts(filtered);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  // Get available subcategories
  const getSubcategories = () => {
    if (!selectedCategoryId) return [];
    const mainCategory = categories.find((cat) => cat._id === selectedCategoryId);
    return mainCategory?.subcategories || [];
  };

  // Get nested subcategories
  const getNestedSubcategories = () => {
    if (!selectedCategoryId || !selectedSubCategoryId) return [];

    const mainCategory = categories.find((cat) => cat._id === selectedCategoryId);
    if (!mainCategory || !mainCategory.subcategories) return [];

    const subCategory = mainCategory.subcategories.find(
      (sub) => getSubCategoryIdString(sub) === selectedSubCategoryId
    );
    
    return subCategory?.subcategories || [];
  };

  // Render filter options
  const renderFilterOptions = () => {
    if (filterOptions.length === 0) return null;

    return (
      <div className="space-y-6 p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        </div>
        
        {filterOptions.map((filter) => (
          <div key={filter._id} className="space-y-3">
            <label className="block font-medium text-gray-700">
              {filter.name}
            </label>
            
            {filter.type === 'checkbox' && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isFilterSelected(filter.name, option, 'checkbox')}
                      onChange={() => handleFilterChange(filter.name, option, 'checkbox')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {filter.type === 'radio' && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={filter.name}
                      checked={isFilterSelected(filter.name, option, 'radio')}
                      onChange={() => handleFilterChange(filter.name, option, 'radio')}
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render selected filters
  const renderSelectedFilters = () => {
    if (Object.keys(selectedFilters).length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Active Filters:</span>
        {Object.entries(selectedFilters).map(([filterName, filterValue]) => {
          const values = Array.isArray(filterValue) ? filterValue : [filterValue];
          return values.map(value => (
            <span
              key={`${filterName}-${value}`}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {filterName}: {value}
              <button
                onClick={() => {
                  if (Array.isArray(filterValue)) {
                    handleFilterChange(filterName, value, 'checkbox');
                  } else {
                    setSelectedFilters(prev => {
                      const newFilters = { ...prev };
                      delete newFilters[filterName];
                      return newFilters;
                    });
                  }
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ));
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Filter</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Category Selection & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Selection */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
              
              <div className="space-y-3">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedSubCategoryId("");
                    setSelectedNestedId("");
                  }}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select Main Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {selectedCategoryId && (
                  <select
                    value={selectedSubCategoryId}
                    onChange={(e) => {
                      setSelectedSubCategoryId(e.target.value);
                      setSelectedNestedId("");
                    }}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select Sub Category</option>
                    {getSubcategories().map((sub) => (
                      <option key={getSubCategoryIdString(sub)} value={getSubCategoryIdString(sub)}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                )}

                {selectedSubCategoryId && getNestedSubcategories().length > 0 && (
                  <select
                    value={selectedNestedId}
                    onChange={(e) => setSelectedNestedId(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select Nested Category</option>
                    {getNestedSubcategories().map((nested) => (
                      <option key={getSubCategoryIdString(nested)} value={getSubCategoryIdString(nested)}>
                        {nested.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Filter Options */}
            {renderFilterOptions()}
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-3 space-y-6">
            {/* Selected Filters */}
            {renderSelectedFilters()}

            {/* Results Count */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
                {selectedCategoryId && ` in selected category`}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    {/* Product Specifications */}
                    {product.specification && product.specification.length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications:</h4>
                        <div className="space-y-1">
                          {product.specification.map((spec, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-600">{spec.name}:</span>
                              <span className="text-gray-900 font-medium">
                                {Array.isArray(spec.values) ? spec.values.join(', ') : spec.values}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;