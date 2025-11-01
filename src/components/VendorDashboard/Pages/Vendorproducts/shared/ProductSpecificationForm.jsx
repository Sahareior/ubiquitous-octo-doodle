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

const ProductSpecificationForm = ({ formData, setFormData }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle dimensions change
  const handleDimensionsChange = (field, value) => {
    setFormData((prev) => {
      const dimensions = prev.dimensions ? prev.dimensions.split(' × ') : ['', '', ''];
      
      if (field === 'width') dimensions[0] = value;
      if (field === 'height') dimensions[1] = value;
      if (field === 'depth') dimensions[2] = value;
      
      return {
        ...prev,
        dimensions: dimensions.join(' × ')
      };
    });
  };

  // Parse existing dimensions
  const parseDimensions = () => {
    if (!formData.dimensions) return { width: '', height: '', depth: '' };
    
    const dimensions = formData.dimensions.split(' × ');
    return {
      width: dimensions[0] || '',
      height: dimensions[1] || '',
      depth: dimensions[2] || ''
    };
  };

  const dimensions = parseDimensions();

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
      <h2 className="text-lg font-bold mb-4">Product Specifications</h2>
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Dimensions - 3 separate input fields */}
        <div className="flex flex-col gap-1">
          <label className="popbold text-[14px] text-gray-700">Dimensions (W×H×D)</label>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder='Enter product width"'
                value={dimensions.width}
                onChange={(e) => handleDimensionsChange('width', e.target.value)}
                className="w-full border border-gray-300 bg-[#F9FAFB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder='Enter product height"'
                value={dimensions.height}
                onChange={(e) => handleDimensionsChange('height', e.target.value)}
                className="w-full border border-gray-300 bg-[#F9FAFB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder='Enter product depth"'
                value={dimensions.depth}
                onChange={(e) => handleDimensionsChange('depth', e.target.value)}
                className="w-full border border-gray-300 bg-[#F9FAFB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Combined: {formData.dimensions || 'Not set'}
          </div>
        </div>

        {/* Assembly Required - Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="popbold text-[14px] text-gray-700">Assembly Required</label>
          <Select
            placeholder="Select option"
            value={formData.assembly_required}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                assembly_required: value,
              }))
            }
            options={[
              { label: 'Yes', value: 'Yes' },
              { label: 'No', value: 'No' }
            ]}
            style={{ width: "100%" }}
            allowClear
          />
        </div>

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

export default ProductSpecificationForm;