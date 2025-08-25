import React, { useState } from "react";

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

const ProductSpecificationForm = ({formData,setFormData}) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  return (
    <form className="bg-white p-6 rounded-2xl shadow-md space-y-4">
      <h2 className="text-lg font-bold mb-4">Product Specifications</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Dimensions (W×H×D)"
          name="dimensions"
          placeholder='e.g. 88" × 35" × 38"'
          value={formData.dimensions}
          onChange={handleChange}
        />
        <InputField
          label="Assembly Required"
          name="assemblyRequired"
          placeholder="e.g. Minimal (Legs only)"
          value={formData.assemblyRequired}
          onChange={handleChange}
        />
        <InputField
          label="Material"
          name="material"
          placeholder="e.g. Premium Velvet, Hardwood Frame"
          value={formData.material}
          onChange={handleChange}
        />
        <InputField
          label="Warranty"
          name="warranty"
          placeholder="e.g. 2 Years Limited"
          value={formData.warranty}
          onChange={handleChange}
        />
        <InputField
          label="Color"
          name="color"
          placeholder="e.g. Navy Blue"
          value={formData.color}
          onChange={handleChange}
        />
        <InputField
          label="Care Instructions"
          name="careInstructions"
          placeholder="e.g. Professional Cleaning"
          value={formData.careInstructions}
          onChange={handleChange}
        />
        <InputField
          label="Weight"
          name="weight"
          placeholder="e.g. 145 lbs"
          value={formData.weight}
          onChange={handleChange}
        />
        <InputField
          label="Country of Origin"
          name="countryOfOrigin"
          placeholder="e.g. Italy"
          value={formData.countryOfOrigin}
          onChange={handleChange}
        />
      </div>


    </form>
  );
};

export default ProductSpecificationForm;
