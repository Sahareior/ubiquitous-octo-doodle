import React, { useState } from "react";
import { Button, Checkbox, Select, Switch, message } from "antd";
import { Upload, X } from "lucide-react";
import { useGetCategoriesQuery, useGetTagsQuery, useVendorProductCreateMutation } from "../../../../redux/slices/Apis/vendorsApi";

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

const NewVendorAddProducts = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [vendorProductCreate] = useVendorProductCreateMutation()
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
    inStock: true,
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
  });

  const handleImageUpload = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const handleImageRemove = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // 🔹 Handle generic input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      message.error("Please upload at least one product image");
      return;
    }

    setLoading(true);
    
    // Create FormData object
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
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
    
    // Append each image file with the correct field name
images.forEach(image => {
  formDataToSend.append('uploaded_images', image.file); // must match serializer field
});
    
    try {
      // This would be your actual API call
      const res = await vendorProductCreate(formDataToSend);
      
      // Simulate API call
      setTimeout(() => {
        console.log("FormData contents:");
        for (let [key, value] of formDataToSend.entries()) {
          console.log(key, value);
        }
        
        message.success("Product created successfully!");
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Failed to create product", error);
      message.error("Failed to create product");
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

          {images.length > 0 && (
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

        <div className="flex justify-end gap-4 mt-6">
          <Button className="bg-white border px-8 py-5 border-gray-400">Save as Draft</Button>
          <Button 
            className="bg-[#CBA135] px-8 py-5 text-white" 
            onClick={handleSubmit}
            loading={loading}
          >
            Submit Product
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default NewVendorAddProducts;