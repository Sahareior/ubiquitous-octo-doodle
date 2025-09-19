import React, { useState, useEffect } from "react";
import { Button, Checkbox, Select, Switch, message } from "antd";
import { Upload, X } from "lucide-react";

import { useLocation } from "react-router-dom";
import { useGetCategoriesQuery, useVendorEditProductMutation } from "../../../../redux/slices/Apis/vendorsApi";
import ProductSpecificationFormEdit from "../../../VendorDashboard/Pages/Vendorproducts/shared/ProductSpecificationFormEdit";
import Swal from "sweetalert2";
import { useDeleteImageMutation, useGetAllProductsQuery } from "../../../../redux/slices/Apis/dashboardApis";


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
  const { data: products, refetch } = useGetAllProductsQuery();
  const location = useLocation();
  const productData = location.state?.productData;
  const [vendorEditProduct] = useVendorEditProductMutation()
  const {data:categories} = useGetCategoriesQuery()
  const [deleteImage] = useDeleteImageMutation()

  // console.log(productData,'this is productData')

  // // console.log(productData,'adadad')



  // 🔹 State for all form data
  const [formData, setFormData] = useState({
    name: "",
    categories: [],
    shortDescription: "",
    fullDescription: "",
    price1: "",
    price2: "",
    price3: "",
    sku: "",
    stockQuantity: "",
    colors: [],
    sizes: [],
    is_stock: false,
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
    images: []
  });

  // Initialize form data when productData is available
useEffect(() => {
  if (productData) {
    setFormData({
      ...formData,
      name: productData.name || "",
      categories: productData.categories?.map(cat =>
        typeof cat === "object" ? cat.id : cat
      ) || [], // ✅ always IDs
      shortDescription: productData.short_description || "",
      fullDescription: productData.full_description || "",
      price1: productData.price1 || "",
      price2: productData.price2 || "",
      price3: productData.price3 || "",
      sku: productData.sku || "",
      stockQuantity: productData.stock_quantity || "",
      colors: [],
      sizes: [],
      is_stock: productData.is_stock || false,
      homeDeliveryEnabled: productData.home_delivery || false,
      option1: productData.option1 || "",
      pickUpEnabled: productData.pickup || false,
      option2: productData.option2 || "",
      partnerDeliveryEnabled: productData.partner_delivery || false,
      option3: productData.option3 || "",
      estimated_delivery_days: productData.estimated_delivery_days || "",
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
    
 if (newImages.length + files.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "You can’t upload more than 5 newImages",
        text: `You can only add ${5 - newImages.length} more image(s).`,
      confirmButtonColor: "#3085d6",
    });
    return;
  }
    const uploadedImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setNewImages([...newImages, ...uploadedImages]);
  };

const handleImageRemove = async (index, isNew, imageId) => {
  if (isNew) {
    // Remove from new images
    const updatedNewImages = [...newImages];
    URL.revokeObjectURL(updatedNewImages[index].preview);
    updatedNewImages.splice(index, 1);
    setNewImages(updatedNewImages);
  } else {
    try {
      const res = await deleteImage(imageId).unwrap(); // 👈 call API
      refetch()
      Swal.fire({
        icon: "success",
        title: "Image Deleted",
        text: "The image was successfully deleted!",
        timer: 1500,
        showConfirmButton: false,
      });

      // Remove from state only after successful API call
      const updatedImages = formData.images.filter((img) => img.id !== imageId);
      setFormData((prev) => ({ ...prev, images: updatedImages }));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Could not delete the image. Try again.",
      });
    }
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
  formDataToSend.append("id", productData.id);

  // Append all form fields
Object.keys(formData).forEach((key) => {
  if (Array.isArray(formData[key])) {
    formData[key].forEach((value) => {
      formDataToSend.append(key, Number(value)); // 👈 force integer
    });
  } else if (typeof formData[key] === "boolean") {
    formDataToSend.append(key, formData[key].toString());
  } else {
    formDataToSend.append(key, formData[key]);
  }
});

  // Append new image files
  newImages.forEach((image) => {
    formDataToSend.append("uploaded_images", image.file);
  });

  // Append existing image IDs to keep
  const existingImageIds = formData.images.map((img) => img.id);
  formDataToSend.append("existing_images", JSON.stringify(existingImageIds));

  try {
    const res = await vendorEditProduct({ id: productData.id, formDataToSend });
    refetch()
    setLoading(false);

    // ✅ Success Swal
    Swal.fire({
      icon: "success",
      title: "Product Updated",
      text: "Your product has been successfully updated!",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Failed to update product", error);
    setLoading(false);

    // ❌ Error Swal
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: "Something went wrong while updating the product.",
    });
  }
};

  // Combine existing and new images for display
  const allImages = [
    ...formData.images.map(img => ({ ...img, isNew: false })),
    ...newImages
  ];

  // console.log(allImages,'asa')

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
                    onClick={() => handleImageRemove(index, image.isNew, image.id)}
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