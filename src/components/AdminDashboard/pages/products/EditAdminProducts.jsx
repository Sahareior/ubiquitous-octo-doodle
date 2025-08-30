import React, { useState, useEffect } from "react";
import { Button, Checkbox, Select, Switch, message } from "antd";
import { Upload, X } from "lucide-react";

import { useLocation } from "react-router-dom";
import { useVendorEditProductMutation } from "../../../../redux/slices/Apis/vendorsApi";
import ProductSpecificationFormEdit from "../../../VendorDashboard/Pages/Vendorproducts/shared/ProductSpecificationFormEdit";


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

const EditAdminProducts = () => {
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const productData = location.state?.productData?.originalData;
  const [vendorEditProduct] = useVendorEditProductMutation()

  // console.log(productData,'adadad')



  // 🔹 State for all form data
  const [formData, setFormData] = useState({
    name: "",
    category: [],
    shortDescription: "",
    fullDescription: "",
    price1: "",
    price2: "",
    price3: "",
    sku: "",
    stockQuantity: "",
    colors: [],
    sizes: [],
    inStock: false,
    homeDeliveryEnabled: false,
    option1: "",
    pickUpEnabled: false,
    option2: "",
    partnerDeliveryEnabled: false,
    option3: "",
    deliveryTime: "",
    seoTitle: "",
    metaDescription: "",
    tag: [],
    images: []
  });

  // Initialize form data when productData is available
useEffect(() => {
  if (productData) {
    setFormData({
      name: productData.name || "",
      category: productData.categories || [],
      shortDescription: productData.short_description || "",
      fullDescription: productData.full_description || "",
      price1: productData.price1 || "",
      price2: productData.price2 || "",
      price3: productData.price3 || "",
      sku: productData.sku || "",
      stockQuantity: productData.stock_quantity || "",
      colors: [],
      sizes: [],
      inStock: productData.is_stock || false,
      homeDeliveryEnabled: productData.home_delivery || false,
      option1: productData.option1 || "",
      pickUpEnabled: productData.pickup || false,
      option2: productData.option2 || "",
      partnerDeliveryEnabled: productData.partner_delivery || false,
      option3: productData.option3 || "",
      deliveryTime: productData.estimated_delivery_days || "",
      seoTitle: productData.seo?.title || "",
      metaDescription: productData.seo?.meta_description || "",
      tag: productData.tags || [],
      images: productData.images?.map(img => ({
        id: img.id,
        url: img.image,
        createdAt: img.created_at
      })) || [],

      // ✅ specifications
      dimensions: productData.specifications?.dimensions || "",
      material: productData.specifications?.material || "",
      color: productData.specifications?.color || "",
      weight: productData.specifications?.weight || "",
      assembly_required: productData.specifications?.assembly_required ?? false,
      warranty: productData.specifications?.warranty || "",
      care_instructions: productData.specifications?.care_instructions || "",
      country_of_origin: productData.specifications?.country_of_origin || "",
    });
  }
}, [productData]);


  const handleImageUpload = (files) => {
    const uploadedImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setNewImages([...newImages, ...uploadedImages]);
  };

  const handleImageRemove = (index, isNew) => {
    if (isNew) {
      // Remove from new images
      const updatedNewImages = [...newImages];
      URL.revokeObjectURL(updatedNewImages[index].preview);
      updatedNewImages.splice(index, 1);
      setNewImages(updatedNewImages);
    } else {
      // Remove from existing images
      const updatedImages = [...formData.images];
      updatedImages.splice(index, 1);
      setFormData(prev => ({ ...prev, images: updatedImages }));
    }
  };

  // 🔹 Handle generic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (formData.images.length === 0 && newImages.length === 0) {
      message.error("Please upload at least one product image");
      return;
    }

    setLoading(true);
    
    // Create FormData object
    const formDataToSend = new FormData();
    
    // Add product ID for update
    formDataToSend.append('id', productData.id);
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'images') return; // Skip images as they're handled separately
      
      if (Array.isArray(formData[key])) {
        // Stringify array fields
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (typeof formData[key] === 'boolean') {
        // Convert boolean to string
        formDataToSend.append(key, formData[key].toString());
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // Append new image files
    newImages.forEach(image => {
      formDataToSend.append('uploaded_images', image.file);
    });
    
    // Append existing image IDs to keep
    const existingImageIds = formData.images.map(img => img.id);
    formDataToSend.append('existing_images', JSON.stringify(existingImageIds));
    
    try {
      // Use update mutation instead of create
    const res = await vendorEditProduct({id:productData.id, formDataToSend})
      
  
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to update product", error);
      message.error("Failed to update product");
      setLoading(false);
    }
  };

  // Combine existing and new images for display
  const allImages = [
    ...formData.images.map(img => ({ ...img, isNew: false })),
    ...newImages
  ];

  console.log(allImages,'asa')

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
          <div className="flex flex-col gap-1">
            <label className="popbold text-[14px] text-gray-700">Category</label>
            <Select
              mode="multiple"
              placeholder="Select categories"
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              options={[
                { value: 'electronics', label: 'Electronics' },
                { value: 'clothing', label: 'Clothing' },
                { value: 'home', label: 'Home & Kitchen' },
              ]}
            />
          </div>
        </div>
        <TextareaField 
          label="Short Description" 
          name="shortDescription" 
          value={formData.shortDescription} 
          onChange={handleChange} 
          placeholder="Enter a brief description"
        />
        <TextareaField 
          label="Full Description" 
          name="fullDescription" 
          value={formData.fullDescription} 
          onChange={handleChange} 
          placeholder="Enter a detailed description"
        />
      </Section>

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

          {allImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {allImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.isNew ? image.preview : image.url}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageRemove(index, image.isNew)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
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
            name="stockQuantity" 
            value={formData.stockQuantity} 
            onChange={handleChange} 
            type="number" 
            placeholder="0" 
          />

          <div className="flex flex-col gap-1">
            <label className="popbold text-[14px] text-gray-700">Colors</label>
            <Select
              mode="multiple"
              placeholder="Select colors"
              value={formData.colors}
              onChange={(value) => setFormData(prev => ({ ...prev, colors: value }))}
              options={[
                { value: 'red', label: 'Red' },
                { value: 'blue', label: 'Blue' },
                { value: 'green', label: 'Green' },
                { value: 'black', label: 'Black' },
                { value: 'white', label: 'White' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="popbold text-[14px] text-gray-700">Sizes</label>
            <Select
              mode="multiple"
              placeholder="Select sizes"
              value={formData.sizes}
              onChange={(value) => setFormData(prev => ({ ...prev, sizes: value }))}
              options={[
                { value: 's', label: 'S' },
                { value: 'm', label: 'M' },
                { value: 'l', label: 'L' },
                { value: 'xl', label: 'XL' },
                { value: 'xxl', label: 'XXL' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Active Status:</span>
          <Switch 
            checked={formData.inStock} 
            onChange={(checked) => setFormData((prev) => ({ ...prev, inStock: checked }))} 
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
          name="deliveryTime" 
          value={formData.deliveryTime} 
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

<ProductSpecificationFormEdit setFormData={setFormData} formData={formData} />
        <div className="flex justify-end gap-4 mt-6">
          <Button className="bg-white border px-8 py-5 border-gray-400">Save as Draft</Button>
          <Button 
            className="bg-[#CBA135] px-8 py-5 text-white" 
            onClick={handleSubmit}
            loading={loading}
          >
            Update Product
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default EditAdminProducts;