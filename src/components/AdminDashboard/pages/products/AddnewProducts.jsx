import React, { useState, useEffect } from "react";
import { Button, Checkbox, Select, Spin, Switch, } from "antd";
import imageCompression from 'browser-image-compression';
import { Upload, X } from "lucide-react";
import Swal from "sweetalert2";
import {  useGetCategoriesQuery, useVendorProductCreateMutation } from "../../../../redux/slices/Apis/vendorsApi";
import ProductSpecificationForm from "../../../VendorDashboard/Pages/Vendorproducts/shared/ProductSpecificationForm";
import { useGetAllProductsQuery } from "../../../../redux/slices/Apis/dashboardApis";
import axios from "axios";

// ✅ Reusable Input
const InputField = ({ label, name, placeholder, type = "text", value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="popbold text-[14px] text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 bg-[#F9FAFB] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
    />
  </div>
);

// ✅ Reusable Textarea
const TextareaField = ({ label, name, placeholder, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="popbold text-[14px] text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-gray-300 w-full bg-[#F9FAFB] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
      rows={3}
    />
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <hr className="border-gray-300" />
    <div className="space-y-4">{children}</div>
  </div>
);

const AddnewProducts = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Category states from first component
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedNestedId, setSelectedNestedId] = useState("");
  const [filterOptions, setFilterOptions] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  const { data: rtkCategories } = useGetCategoriesQuery();
  const { data: products, refetch } = useGetAllProductsQuery();
  const [vendorProductCreate] = useVendorProductCreateMutation();

  const compressionOptions = {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  // 🔹 State for all form data
  const [formData, setFormData] = useState({
    name: "",
    categories: [], // This will remain empty for the second API
    short_description: "",
    full_description: "",
    price1: "",
    price2: "",
    price3: "",
    sku: "",
    stock_quantity: "",
    colors: [],
    sizes: [],
    is_stock: true,
    home_delivery: false,
    pickup: false,
    partner_delivery: false,
    option1: "",
    option2: "",
    option3: "",
    estimated_delivery_days: "",
    seo_title: "",
    meta_description: "",
    tags: [],
    // 🔹 specs
    dimensions: "",
    material: "",
    color: "",
    weight: "",
    assembly_required: "",
    warranty: "",
    care_instructions: "",
    country_of_origin: "",
  });

  // Fetch categories from first component's API
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

  // Get available subcategories for selected main category
  const getSubcategories = () => {
    if (!selectedCategoryId) return [];
    const mainCategory = categories.find((cat) => cat._id === selectedCategoryId);
    return mainCategory?.subcategories || [];
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

  const handleImageUpload = async (files) => {
    if (images.length + files.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "You can't upload more than 5 images",
        text: `You can only add ${5 - images.length} more image(s).`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setLoading(true);
    
    try {
      const compressedImages = [];
      
      for (const file of files) {
        // Get file extension from original file
        const fileExtension = file.name.split('.').pop();
        const fileNameWithoutExt = file.name.slice(0, file.name.lastIndexOf('.'));
        
        // Compress each image
        const compressedFile = await imageCompression(file, compressionOptions);
        
        // Create a new File object with proper name and extension
        const compressedFileWithName = new File(
          [compressedFile], 
          `${fileNameWithoutExt}_compressed.${fileExtension}`, 
          { type: compressedFile.type }
        );
        
        // Create object URL for preview
        const preview = URL.createObjectURL(compressedFile);
        
        compressedImages.push({
          file: compressedFileWithName,
          preview: preview,
          originalName: file.name
        });
      }
      
      setImages([...images, ...compressedImages]);
    } catch (error) {
      console.error('Error compressing images:', error);
      Swal.fire({
        icon: "error",
        title: "Compression Failed",
        text: "Failed to compress images. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const initialFormData = {
    name: "",
    categories: [],
    short_description: "",
    full_description: "",
    price1: "",
    care_instructions: "",
    assembly_required: "",
    price2: "",
    price3: "",
    sku: "",
    stock_quantity: "",
    colors: [],
    sizes: [],
    is_stock: true,
    homeDeliveryEnabled: false,
    option1: "",
    pickUpEnabled: false,
    option2: "",
    partnerDeliveryEnabled: false,
    option3: "",
    estimated_delivery_days: "",
    seoTitle: "",
    metaDescription: "",
    tag: [],
    dimensions: "",
    material: "",
    color: "",
    weight: "",
    warranty: "",
    country_of_origin: "",
  };

  // Modified handleSubmit to use both APIs
  const handleSubmit = async () => {
    if (images.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Image Uploaded",
        text: "Please upload at least one product image.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Validate category selection
    const hierarchy = findCategoryHierarchy();
    if (!hierarchy || !hierarchy.main) {
      alert("Please select a main category");
      return;
    }

    setLoading(true);

    try {
      // Prepare data for first API (with category)
      const finalCategory = hierarchy.nested || hierarchy.sub || hierarchy.main;
      const categoryPath = [
        hierarchy.main._id,
        hierarchy.sub ? getSubCategoryId(hierarchy.sub) : null,
        hierarchy.nested ? getSubCategoryId(hierarchy.nested) : null
      ].filter(Boolean);



      // Prepare data for second API (with empty categories array)
      const formDataToSend = new FormData();

      const {
        dimensions,
        material,
        warranty,
        color,
        assembly_required,
        weight,
        country_of_origin,
        care_instructions,
        ...restFormData
      } = formData;

      const specifications = {
        dimensions: dimensions || "",
        material: material || "",
        color: color || "",
        weight: weight || "",
        assembly_required: assembly_required || "",
        warranty: warranty || "",
        care_instructions: care_instructions || "",
        country_of_origin: country_of_origin || "",
      };

      formDataToSend.append("specifications", JSON.stringify(specifications));

      Object.keys(restFormData).forEach((key) => {
        if (Array.isArray(restFormData[key])) {
          restFormData[key].forEach((value) => {
            formDataToSend.append(key, value);
          });
        } else if (typeof restFormData[key] === "boolean") {
          formDataToSend.append(key, restFormData[key].toString());
        } else {
          formDataToSend.append(key, restFormData[key]);
        }
      });

      images.forEach((image) => {
        formDataToSend.append("uploaded_images", image.file);
      });

      // Call second API
      const secondAPIResponse = await vendorProductCreate(formDataToSend).unwrap();

      //   const firstAPIResponse = await axios.post("http://localhost:8000/products", productDataForFirstAPI, {
      //   headers: { "Content-Type": "application/json" },
      // });

            const productDataForFirstAPI = {
        name: formData.name,
        price: Number(formData.price1),
        stock: Number(formData.stock_quantity),
        description: formData.short_description,
        category: hierarchy.main._id,
        subcategory: hierarchy.sub ? getSubCategoryId(hierarchy.sub) : null,
        nestedSubcategory: hierarchy.nested ? getSubCategoryId(hierarchy.nested) : null,
        categoryPath: categoryPath,
        finalCategorySlug: finalCategory.slug || '',
        specification: prepareSpecificationData(),
        Responsed_products: secondAPIResponse
      };

      console.log("Submitting to first API:", productDataForFirstAPI);

      // Call first API
      const firstAPIResponse = await axios.post("http://localhost:8000/products", productDataForFirstAPI, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("First API Response:", firstAPIResponse.data);


      if (secondAPIResponse?.id) {
        Swal.fire({
          title: "Success! 🎉",
          text: "Product created successfully in both systems!",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        refetch();
        setFormData(initialFormData);
        setImages([]);
        // Reset category selections
        setSelectedCategoryId("");
        setSelectedSubCategoryId("");
        setSelectedNestedId("");
        setFilterValues({});
      }
    } catch (err) {
      console.log(err);

      if (err?.data?.short_description?.[0]) {
        Swal.fire({
          title: "Submission Failed",
          text: 'Short description cannot exceed 500 words',
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Server error occurred. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg space-y-8">
      {/* 🔹 Basic Info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField 
            label="Product Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Enter product name" 
          />
          
          {/* Category Selection from First Component */}
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
        </div>

        <TextareaField 
          label="Short Description" 
          name="short_description" 
          value={formData.short_description} 
          onChange={handleChange} 
          placeholder="Enter a brief description"
        />
        <TextareaField 
          label="Full Description" 
          name="full_description" 
          value={formData.full_description} 
          onChange={handleChange} 
          placeholder="Enter a detailed description"
        />
      </Section>

      {/* 🔹 Filter Options from First Component */}
      {renderFilterOptions()}

      {/* 🔹 Product Image */}
      <Section title="Product Image">
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 5MB each)</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                multiple
                onChange={(e) => handleImageUpload(Array.from(e.target.files))}
              />
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center popmed text-red-500 gap-2 items-center">
              Compressing image ......<Spin />
            </div>
          ) : (
            images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageRemove(index)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </Section>

      {/* 🔹 Pricing */}
      <Section title="Pricing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <InputField 
            label="Product Price" 
            name="price1" 
            value={formData.price1} 
            onChange={handleChange} 
            type="number" 
            placeholder="0.00" 
          />
          <InputField 
            label="Discount Price" 
            name="price2" 
            value={formData.price2} 
            onChange={handleChange} 
            type="number" 
            placeholder="0.00" 
          />
          <InputField 
            label="Commission Price" 
            name="price3" 
            value={formData.price3} 
            onChange={handleChange} 
            type="number" 
            placeholder="0.00" 
          />
        </div>
      </Section>

      {/* 🔹 Inventory */}
      <Section title="Inventory & Variants">
        <div className="grid grid-cols-1 md:grid-cols-4 items-center justify-center gap-5">
          <InputField 
            label="SKU" 
            name="sku" 
            value={formData.sku} 
            onChange={handleChange} 
            placeholder="Product SKU" 
          />
          <InputField 
            label="Stock Quantity" 
            name="stock_quantity" 
            value={formData.stock_quantity} 
            onChange={handleChange} 
            type="number" 
            placeholder="0" 
          />
        </div>

        {/* ✅ Toggle for is_stock */}
        <div className="flex items-center gap-2 mt-4">
          <span className="font-medium">In Stock:</span>
          <Switch 
            checked={formData.is_stock} 
            onChange={(checked) => setFormData((prev) => ({ ...prev, is_stock: checked }))} 
          />
        </div>
      </Section>

      {/* 🔹 Delivery */}
      <Section title="Delivery Options">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              name="homeDeliveryEnabled"
              checked={formData.homeDeliveryEnabled}
              onChange={(e) => setFormData(prev => ({ ...prev, homeDeliveryEnabled: e.target.checked }))}
            >
              Home Delivery
            </Checkbox>
            <input
              type="number"
              name="option1"
              placeholder="Fee"
              value={formData.option1}
              onChange={handleChange}
              className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Checkbox
              name="pickUpEnabled"
              checked={formData.pickUpEnabled}
              onChange={(e) => setFormData(prev => ({ ...prev, pickUpEnabled: e.target.checked }))}
            >
              PickUp
            </Checkbox>
            <input
              type="number"
              name="option2"
              placeholder="Fee"
              value={formData.option2}
              onChange={handleChange}
              className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Checkbox
              name="partnerDeliveryEnabled"
              checked={formData.partnerDeliveryEnabled}
              onChange={(e) => setFormData(prev => ({ ...prev, partnerDeliveryEnabled: e.target.checked }))}
            >
              Partner Delivery
            </Checkbox>
            <input
              type="number"
              name="option3"
              placeholder="Fee"
              value={formData.option3}
              onChange={handleChange}
              className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
        <InputField 
          label="Estimated Delivery Time" 
          name="estimated_delivery_days" 
          value={formData.estimated_delivery_days} 
          onChange={handleChange} 
          placeholder="e.g., 3-5 business days" 
        />
      </Section>

      {/* 🔹 SEO */}
      <Section title="SEO & Tags">
        <InputField 
          label="SEO Title" 
          name="seoTitle" 
          value={formData.seoTitle} 
          onChange={handleChange} 
          placeholder="SEO title" 
        />
        <TextareaField 
          label="Meta Description" 
          name="metaDescription" 
          value={formData.metaDescription} 
          onChange={handleChange} 
          placeholder="Meta description for search engines" 
        />
        
        <div className="flex flex-col gap-1">
          <label className="popbold text-[14px] text-gray-700">Tags</label>
          <Select
            mode="multiple"
            placeholder="Select tags"
            value={formData.tag}
            onChange={(value) => setFormData(prev => ({ ...prev, tag: value }))}
            options={[
              { value: 'new', label: 'New' },
              { value: 'sale', label: 'Sale' },
              { value: 'featured', label: 'Featured' },
              { value: 'bestseller', label: 'Bestseller' },
            ]}
          />
        </div>

        <ProductSpecificationForm setFormData={setFormData} formData={formData} />
        
        <div className="flex justify-end gap-4 mt-6">
          <Button className="bg-white border px-8 py-5 border-gray-400">Save as Draft</Button>
          <Button 
            className="bg-[#CBA135] px-8 py-5 text-white" 
            onClick={handleSubmit}
            loading={loading}
            disabled={!selectedCategoryId || !formData.name || !formData.price1}
          >
            Submit Product
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default AddnewProducts;