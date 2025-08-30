import React, { useState } from "react";
import { Button, Checkbox, Select, Switch, message } from "antd";
import { Upload, X } from "lucide-react";

import Swal from "sweetalert2";
import { useGetCategoriesQuery, useVendorProductCreateMutation } from "../../../../redux/slices/Apis/vendorsApi";
import useNotificationSocket from "../../../../Websocket/useNotificationSocket";
import ProductSpecificationForm from "../../../VendorDashboard/Pages/Vendorproducts/shared/ProductSpecificationForm";


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
  const {data:categories} = useGetCategoriesQuery()
  const [vendorProductCreate] = useVendorProductCreateMutation()
  const { sendNotification } = useNotificationSocket();
  // 🔹 State for all form data
const [formData, setFormData] = useState({
  name: "",
  categories: [],
  short_description: "",
  full_description: "",
  price1: "",
  price2: "",
  price3: "",
  sku: "",
  stock_quantity: "",
  colors: [],
  sizes: [],
  in_stock: true,
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
  assembly_required: false,
  warranty: "",
  care_instructions: "",
  country_of_origin: "",
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


const initialFormData = {
  name: "",
  categories: [],
  short_description: "",
  full_description: "",
  price1: "",
  care_instructions: "",
  assembly_required: false,
  price2: "",
  price3: "",
  sku: "",
  stock_quantity: "",
  colors: [],
  sizes: [],
  inStock: true,
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
};

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

  setLoading(true);

  const formDataToSend = new FormData();

  // Extract specifications separately
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
    assembly_required: assembly_required === "true" || assembly_required === true, // Convert to boolean
    warranty: warranty || "",
    care_instructions: care_instructions || "",
    country_of_origin: country_of_origin || "",
  };

 
  formDataToSend.append("specifications", JSON.stringify(specifications));

  // Append other fields
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


  // Append specifications as JSON


  // Append images
  images.forEach((image) => {
    formDataToSend.append("uploaded_images", image.file);
  });

  try {
    const res = await vendorProductCreate(formDataToSend);
    console.log("this is res", res);

    if (res?.data?.id) {
      Swal.fire({
        title: "Success! 🎉",
        text: "Product created successfully!",
        icon: "success",
        confirmButtonColor: "#3085d6",
        customClass: {
          popup: "rounded-2xl shadow-lg",
          confirmButton: "px-4 py-2 rounded-lg",
        },
      });

      // ✅ Reset all fields & images
      setFormData(initialFormData);
      setImages([]);
    } else {
      Swal.fire({
        title: "Failed!",
        text: "Something went wrong while creating the product.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  } catch (error) {
    console.error("Failed to create product", error);
    Swal.fire({
      title: "Error!",
      text: "Server error occurred. Please try again.",
      icon: "error",
      confirmButtonColor: "#d33",
    });
  } finally {
    setLoading(false);
  }
};

console.log(categories?.results,'thsi is categoried')

// const notyfi =()=>{
//    sendNotification();
// }


  return (
    <div className="p-6 bg-white shadow-md rounded-lg space-y-8">
      {/* <Button onClick={()=> notyfi()}>
        Notify
      </Button> */}
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
  <label className="popbold text-[14px] text-gray-700">categories</label>
<Select
  mode="multiple"
  placeholder="Select categories"
  value={formData.categories}
  onChange={(value) =>
    setFormData((prev) => ({ ...prev, categories: value.map(Number) }))
  }
  options={categories?.results?.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))}
/>

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
            name="stock_quantity" 
            value={formData.stock_quantity} 
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
          >
            Submit Product
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default NewVendorAddProducts;