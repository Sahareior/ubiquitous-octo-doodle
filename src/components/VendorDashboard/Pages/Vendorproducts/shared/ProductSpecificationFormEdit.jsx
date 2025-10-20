import React from "react";
import { Select } from "antd";

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

const ProductSpecificationFormEdit = ({ formData, setFormData }) => {

  console.log('this is forData', formData)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Full color options same as create component
  const colorOptions = [
    "Navy Blue", "Red", "White", "Black", "Green", "Yellow", "Gray",
    "Blue", "Brown", "Beige", "Ivory", "Cream", "Charcoal", "Slate Gray",
    "Silver", "Gold", "Bronze", "Copper", "Orange", "Pink", "Purple",
    "Lavender", "Teal", "Turquoise", "Maroon", "Burgundy", "Forest Green",
    "Olive Green", "Mustard Yellow", "Royal Blue", "Sky Blue", "Navy",
    "Dark Brown", "Light Brown", "Tan", "Off-White", "Eggshell", "Pearl White",
    "Platinum", "Champagne", "Rose Gold", "Coral", "Salmon", "Magenta",
    "Violet", "Indigo", "Mint Green", "Sage Green", "Khaki", "Taupe",
    "Espresso", "Ebony", "Ash Gray", "Stone", "Sand", "Terracotta"
  ];

  return (
    <form className="bg-white rounded-2xl pt-8 space-y-4">
      <h2 className="text-lg font-bold mb-4">Edit Product Specifications</h2>
      <hr />
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
          name="assembly_required"
          value={formData.assembly_required}
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

        {/* ✅ Multiple Select for Colors (same as create) */}
        <div className="flex flex-col gap-1">
          <label className="popbold text-[14px] text-gray-700">Color(s)</label>
          <Select
            mode="multiple"
            placeholder="Select color(s)"
            value={formData.color ? formData.color.split(', ') : []}
            onChange={(values) =>
              setFormData((prev) => ({
                ...prev,
                color: values.join(', '), // stored as a single comma-separated string
              }))
            }
            options={colorOptions.map((color) => ({ label: color, value: color }))}
            style={{ width: "100%" }}
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            showSearch
            allowClear
          />
        </div>

        <InputField
          label="Care Instructions"
          name="care_instructions"
          value={formData.care_instructions}
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
          name="country_of_origin"
          value={formData.country_of_origin}
          onChange={handleChange}
        />

      </div>
    </form>
  );
};

export default ProductSpecificationFormEdit;
