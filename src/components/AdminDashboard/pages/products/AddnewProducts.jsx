import React, { useState, useEffect } from "react";
import axios from "axios";

const AddnewProducts = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedNestedId, setSelectedNestedId] = useState("");
  const [filterOptions, setFilterOptions] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset filter options when category selection changes
  useEffect(() => {
    updateFilterOptions();
    setFilterValues({});
  }, [selectedCategoryId, selectedSubCategoryId, selectedNestedId]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Helper function to get the ID from a subcategory
  const getSubCategoryId = (sub) => {
    return sub.id || sub._id;
  };

  // Helper function to get string ID for comparison
  const getSubCategoryIdString = (sub) => {
    const id = getSubCategoryId(sub);
    return id ? id.toString() : "";
  };

  // Helper to find the actual subcategory object with full hierarchy
  const findCategoryHierarchy = () => {
    if (!selectedCategoryId) return null;

    const mainCategory = categories.find((cat) => cat._id === selectedCategoryId);
    if (!mainCategory) return null;

    let subCategory = null;
    let nestedSubCategory = null;

    // Find subcategory
    if (selectedSubCategoryId && mainCategory.subcategories) {
      subCategory = mainCategory.subcategories.find(
        (sub) => getSubCategoryIdString(sub) === selectedSubCategoryId
      );

      // Find nested subcategory
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

    // Get the final category level that has filterOptions
    let finalCategory = null;
    
    // Check nested subcategory first
    if (hierarchy.nested && hierarchy.nested.filterOptions) {
      finalCategory = hierarchy.nested;
    } 
    // Then check subcategory
    else if (hierarchy.sub && hierarchy.sub.filterOptions) {
      finalCategory = hierarchy.sub;
    } 
    // Finally check main category
    else if (hierarchy.main && hierarchy.main.filterOptions) {
      finalCategory = hierarchy.main;
    }

    if (finalCategory && finalCategory.filterOptions) {
      setFilterOptions(finalCategory.filterOptions);
    } else {
      setFilterOptions([]);
    }
  };

  // Handle filter value changes
  const handleFilterChange = (filterId, value, type, filterName) => {
    setFilterValues(prev => {
      const newValues = { ...prev };
      
      if (type === 'checkbox') {
        // For checkboxes, toggle the value in array
        const currentValues = newValues[filterId] || [];
        if (currentValues.includes(value)) {
          newValues[filterId] = currentValues.filter(v => v !== value);
        } else {
          newValues[filterId] = [...currentValues, value];
        }
      } else {
        // For radio buttons, set single value
        newValues[filterId] = [value]; // Store as array for consistency
      }
      
      return newValues;
    });
  };

  // Prepare specification data for submission - simplified structure
  const prepareSpecificationData = () => {
    return filterOptions
      .map(filter => {
        const values = filterValues[filter._id];
        // Only include specifications that have values
        if (values && values.length > 0) {
          return {
            name: filter.name,
            values: values
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const hierarchy = findCategoryHierarchy();
    if (!hierarchy || !hierarchy.main) {
      alert("Please select a main category");
      return;
    }

    // Determine the final category level
    const finalCategory = hierarchy.nested || hierarchy.sub || hierarchy.main;
    
    if (!finalCategory) {
      alert("Invalid category selection");
      return;
    }

    // Build category path - array of category IDs in hierarchy
    const categoryPath = [
      hierarchy.main._id,
      hierarchy.sub ? getSubCategoryId(hierarchy.sub) : null,
      hierarchy.nested ? getSubCategoryId(hierarchy.nested).toString() : null
    ].filter(Boolean);

    const productData = {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description,
      category: hierarchy.main._id.toString(),
      subcategory: hierarchy.sub ? getSubCategoryId(hierarchy.sub).toString() : null,
      nestedSubcategory: hierarchy.nested ? getSubCategoryId(hierarchy.nested).toString() : null,
      categoryPath: categoryPath,
      finalCategorySlug: finalCategory.slug || '',
      specification: prepareSpecificationData(), // Changed from filterValues to specification
    };

    console.log("Submitting Product:", productData);

    try {
      const { data } = await axios.post("http://localhost:8000/products", productData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Product created successfully!");
      console.log("Server Response:", data);

      // Reset form
      setFormData({ name: "", price: "", description: "", stock: "" });
      setSelectedCategoryId("");
      setSelectedSubCategoryId("");
      setSelectedNestedId("");
      setFilterValues({});
    } catch (error) {
      console.error("❌ Error creating product:", error.response?.data || error.message);
      alert("Error creating product! Check console for details.");
    }
  };

  // Helper function to find nested subcategories
  const getNestedSubcategories = () => {
    if (!selectedCategoryId || !selectedSubCategoryId) return [];

    const mainCategory = categories.find((cat) => cat._id === selectedCategoryId);
    if (!mainCategory || !mainCategory.subcategories) return [];

    const subCategory = mainCategory.subcategories.find(
      (sub) => getSubCategoryIdString(sub) === selectedSubCategoryId
    );
    
    return subCategory?.subcategories || [];
  };

  // Get available subcategories for selected main category
  const getSubcategories = () => {
    if (!selectedCategoryId) return [];
    const mainCategory = categories.find((cat) => cat._id === selectedCategoryId);
    return mainCategory?.subcategories || [];
  };

  // Check if a filter option is selected
  const isFilterSelected = (filterId, value, type) => {
    if (type === 'checkbox') {
      return (filterValues[filterId] || []).includes(value);
    } else {
      return filterValues[filterId]?.[0] === value;
    }
  };

  // Render filter options based on type
  const renderFilterOptions = () => {
    if (filterOptions.length === 0) return null;

    return (
      <div className="space-y-6 mt-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-700">Specifications</h3>
        {filterOptions.map((filter) => (
          <div key={filter._id} className="space-y-2">
            <label className="block font-medium text-gray-600">
              {filter.name}
              {filter.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {filter.type === 'checkbox' && (
              <div className="space-y-2">
                {filter.options.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isFilterSelected(filter._id, option, 'checkbox')}
                      onChange={() => handleFilterChange(filter._id, option, 'checkbox', filter.name)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700">{option}</span>
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
                      name={filter._id}
                      checked={isFilterSelected(filter._id, option, 'radio')}
                      onChange={() => handleFilterChange(filter._id, option, 'radio', filter.name)}
                      className="rounded-full border-gray-300"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create Product</h2>

      {/* Product Info */}
      <div className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2"
          required
          min="0"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          value={formData.stock}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2"
          required
          min="0"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2"
          rows={3}
          required
        />
      </div>

      {/* Category Selectors */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-600">Main Category *</label>
        <select
          value={selectedCategoryId}
          onChange={(e) => {
            setSelectedCategoryId(e.target.value);
            setSelectedSubCategoryId("");
            setSelectedNestedId("");
          }}
          className="w-full border rounded-md px-3 py-2"
          required
        >
          <option value="">-- Select Main Category --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {selectedCategoryId && (
          <>
            <label className="block font-medium text-gray-600">Sub Category</label>
            <select
              value={selectedSubCategoryId}
              onChange={(e) => {
                setSelectedSubCategoryId(e.target.value);
                setSelectedNestedId("");
              }}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">-- Select Sub Category --</option>
              {getSubcategories().map((sub) => (
                <option key={getSubCategoryIdString(sub)} value={getSubCategoryIdString(sub)}>
                  {sub.name}
                </option>
              ))}
            </select>
          </>
        )}

        {selectedSubCategoryId && getNestedSubcategories().length > 0 && (
          <>
            <label className="block font-medium text-gray-600">Nested Sub Category</label>
            <select
              value={selectedNestedId}
              onChange={(e) => setSelectedNestedId(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">-- Select Nested Sub Category --</option>
              {getNestedSubcategories().map((nested) => (
                <option key={getSubCategoryIdString(nested)} value={getSubCategoryIdString(nested)}>
                  {nested.name}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Show selected category hierarchy */}
        {selectedCategoryId && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Selected Category:</strong> {
                categories.find(c => c._id === selectedCategoryId)?.name
              }
              {selectedSubCategoryId && ` → ${
                getSubcategories().find(s => getSubCategoryIdString(s) === selectedSubCategoryId)?.name
              }`}
              {selectedNestedId && ` → ${
                getNestedSubcategories().find(n => getSubCategoryIdString(n) === selectedNestedId)?.name
              }`}
            </p>
          </div>
        )}
      </div>

      {/* Filter Options */}
      {renderFilterOptions()}

      <button
        onClick={handleCreate}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        disabled={!selectedCategoryId || !formData.name || !formData.price}
      >
        Create Product
      </button>
    </div>
  );
};

export default AddnewProducts;