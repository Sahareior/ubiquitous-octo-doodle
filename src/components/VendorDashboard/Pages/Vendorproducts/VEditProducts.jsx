
import React, { useState, useEffect } from "react";
import { 
  Button, 
  Checkbox, 
  Select, 
  Spin, 
  Switch, 
  Radio, 
  Card, 
  Collapse, 
  Steps, 
  Space,
  Tag,
  Alert,
  Progress,
  Divider,
  Tooltip
} from "antd";
import { 
  Upload, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Save,
  CheckCircle,
  Info,
  Image as ImageIcon,
  Package,
  Search,
  Settings
} from "lucide-react";
import imageCompression from 'browser-image-compression';
import Swal from "sweetalert2";
import { useChildCategoryQuery, useGetAllProductsQuery, useGetCategoriesQuery, useVendorEditProductMutation } from "../../../../redux/slices/Apis/vendorsApi";
import { useLocation } from "react-router-dom";
import { useDeleteImageMutation } from "../../../../redux/slices/Apis/dashboardApis";
import ProductSpecificationForm from "../../../VendorDashboard/Pages/Vendorproducts/shared/ProductSpecificationForm";
;

const { Panel } = Collapse;

// ✅ Enhanced Input Field with Validation
const InputField = ({ 
  label, 
  name, 
  placeholder, 
  type = "text", 
  value, 
  onChange, 
  required = false,
  error = "",
  maxLength
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <label className="popbold text-[14px] text-gray-700">{label}</label>
      {required && <span className="text-red-500 text-sm">*</span>}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} bg-[#F9FAFB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CBA135] transition-all`}
    />
    {error && <span className="text-red-500 text-xs">{error}</span>}
    {maxLength && (
      <div className="flex justify-between text-xs text-gray-500">
        <span>Character limit</span>
        <span>{value?.length || 0}/{maxLength}</span>
      </div>
    )}
  </div>
);

// ✅ Enhanced Textarea Field with Validation
const TextareaField = ({ 
  label, 
  name, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  error = "",
  maxLength,
  rows = 4
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <label className="popbold text-[14px] text-gray-700">{label}</label>
      {required && <span className="text-red-500 text-sm">*</span>}
    </div>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={rows}
      className={`border ${error ? 'border-red-500' : 'border-gray-300'} w-full bg-[#F9FAFB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CBA135] transition-all resize-none`}
    />
    {error && <span className="text-red-500 text-xs">{error}</span>}
    {maxLength && (
      <div className="flex justify-between text-xs text-gray-500">
        <span>Character limit</span>
        <span>{value?.length || 0}/{maxLength}</span>
      </div>
    )}
  </div>
);

// ✅ Step Header Component
const StepHeader = ({ title, description, icon, completed = false }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${completed ? 'bg-green-500' : 'bg-[#CBA135]'} text-white`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    {completed && <CheckCircle className="text-green-500 w-6 h-6" />}
  </div>
);

const FilterDisplay = ({ selectedSubcategory, categories, selectedParent, filterSelections, setFilterSelections }) => {
  const getFilters = () => {
    if (!selectedSubcategory || !selectedParent) return [];
    
    const parentCategories = categories?.results || [];
    const subcategories = parentCategories.find(cat => cat.id === selectedParent)?.children || [];
    const selectedSub = subcategories.find(sub => sub.id === selectedSubcategory);
    
    return selectedSub?.filter_data || [];
  };

  const filters = getFilters();

  const handleFilterChange = (filterId, value, filterType) => {
    setFilterSelections(prev => ({
      ...prev,
      [filterId]: {
        value: value,
        type: filterType
      }
    }));
  };

  const clearFilter = (filterId) => {
    setFilterSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[filterId];
      return newSelections;
    });
  };

  const handleRemoveOption = (filterId, valueId) => {
    setFilterSelections(prev => {
      const selection = prev[filterId];
      if (!selection) return prev;

      let newValue;
      if (Array.isArray(selection.value)) {
        newValue = selection.value.filter(id => id !== valueId);
      } else {
        newValue = null;
      }

      if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
        const newSelections = { ...prev };
        delete newSelections[filterId];
        return newSelections;
      }

      return {
        ...prev,
        [filterId]: {
          ...selection,
          value: newValue
        }
      };
    });
  };

  const clearAllFilters = () => {
    setFilterSelections({});
  };

  if (!selectedSubcategory) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-lg font-medium">Select a subcategory to see available filters</p>
        <p className="text-sm text-gray-500 mt-1">Choose a subcategory from above to view and apply filters</p>
      </div>
    );
  }

  if (filters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-yellow-50 rounded-lg border border-yellow-200">
        <Info className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
        <p className="text-lg font-medium">No filters available</p>
        <p className="text-sm text-yellow-700 mt-1">
          This subcategory doesn't have any predefined filters yet.
        </p>
      </div>
    );
  }

  const totalSelected = Object.values(filterSelections).reduce((acc, sel) => {
    if (Array.isArray(sel.value)) {
      return acc + sel.value.length;
    }
    return acc + (sel.value ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">Product Filters</h4>
          <p className="text-sm text-gray-600">Refine your product with specific attributes</p>
        </div>
        <Space>
          <Tag color="blue" className="px-3 py-1">
            {totalSelected} selected / {filters.length} filter{filters.length !== 1 ? 's' : ''}
          </Tag>
          {Object.keys(filterSelections).length > 0 && (
            <Button type="link" size="small" onClick={clearAllFilters} danger className="font-medium">
              Clear All
            </Button>
          )}
        </Space>
      </div>

      <div className="grid gap-4">
        {filters.map((filter) => {
          const filterId = filter.filter_by_type.id;
          const selection = filterSelections[filterId];
          const selectedValues = Array.isArray(selection?.value) ? selection.value : selection?.value ? [selection.value] : [];
          const selectedCount = selectedValues.length;
          const selectedOptions = selectedValues.map(id => 
            filter.filter_options.find(opt => opt.id === id)
          ).filter(Boolean);

          return (
            <Card
              key={filterId}
              className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
              size="small"
              title={
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-gray-800">
                      {filter.filter_by_type.name}
                    </span>
                    <Tag size="small" color="blue">
                      {filter.filter_by_type.filter_type}
                    </Tag>
                    {selectedCount > 0 && (
                      <Tag size="small" color="green">
                        {selectedCount} selected
                      </Tag>
                    )}
                  </div>
                  {selectedCount > 0 && (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => clearFilter(filterId)}
                      danger
                      className="font-medium"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              }
            >
              {filter.filter_options.length > 0 ? (
                <div className="space-y-4">
                  {filter.filter_by_type.filter_type === 'checkbox' && (
                    <Checkbox.Group
                      value={selection?.value || []}
                      onChange={(values) => handleFilterChange(
                        filterId, 
                        values, 
                        filter.filter_by_type.filter_type
                      )}
                      className="w-full"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {filter.filter_options.map(option => (
                          <Checkbox 
                            key={option.id} 
                            value={option.id}
                            className="flex items-start p-2 hover:bg-gray-50 rounded"
                          >
                            <span className="ml-2 text-sm">{option.value}</span>
                          </Checkbox>
                        ))}
                      </div>
                    </Checkbox.Group>
                  )}

                  {filter.filter_by_type.filter_type === 'radio' && (
                    <Radio.Group
                      value={selection?.value || null}
                      onChange={(e) => handleFilterChange(
                        filterId, 
                        e.target.value, 
                        filter.filter_by_type.filter_type
                      )}
                      className="flex flex-col space-y-2"
                      optionType="button"
                      buttonStyle="solid"
                    >
                      {filter.filter_options.map(option => (
                        <Radio.Button 
                          key={option.id} 
                          value={option.id}
                          className="w-full text-left hover:bg-[#CBA135] hover:text-white transition-colors"
                        >
                          {option.value}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  )}

                  {!['checkbox', 'radio'].includes(filter.filter_by_type.filter_type) && (
                    <Select
                      mode="multiple"
                      placeholder={`Select ${filter.filter_by_type.name.toLowerCase()}`}
                      value={selection?.value || []}
                      onChange={(values) => handleFilterChange(
                        filterId, 
                        values, 
                        filter.filter_by_type.filter_type
                      )}
                      style={{ width: '100%' }}
                      size="middle"
                      tagRender={({ label, closable, onClose }) => (
                        <Tag 
                          closable={closable} 
                          onClose={onClose} 
                          style={{ 
                            marginRight: 3,
                            background: '#CBA135',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          {label}
                        </Tag>
                      )}
                      options={filter.filter_options.map(option => ({
                        value: option.id,
                        label: option.value,
                      }))}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4 text-sm bg-gray-50 rounded">
                  No options available for this filter
                </div>
              )}

              {selectedCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-600 block mb-2">Selected options:</span>
                  <Space wrap size={[4, 8]}>
                    {selectedOptions.map(option => (
                      <Tag
                        key={option.id}
                        closable
                        onClose={() => handleRemoveOption(filterId, option.id)}
                        color="green"
                        size="small"
                        className="cursor-pointer hover:shadow-sm transition-shadow"
                      >
                        {option.value}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const CategorySelector = ({ 
  categories, 
  selectedParent, 
  setSelectedParent, 
  selectedSubcategory, 
  setSelectedSubcategory, 
  selectedChildren, 
  setSelectedChildren 
}) => {
  const parentCategories = categories?.results || [];
  const subcategories = selectedParent 
    ? parentCategories.find(cat => cat.id === selectedParent)?.children || []
    : [];
  const childCategories = selectedSubcategory
    ? subcategories.find(sub => sub.id === selectedSubcategory)?.children || []
    : [];

  const handleParentChange = (value) => {
    setSelectedParent(value);
    setSelectedSubcategory(null);
    setSelectedChildren([]);
  };

  const handleSubcategoryChange = (value) => {
    setSelectedSubcategory(value);
    setSelectedChildren([]);
  };

  const handleChildCategoryChange = (value) => {
    setSelectedChildren(value);
  };

  const resetSelection = () => {
    setSelectedParent(null);
    setSelectedSubcategory(null);
    setSelectedChildren([]);
  };

  return (
    <div className="space-y-6 p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">Category Selection</h4>
          <p className="text-sm text-gray-600">Choose the appropriate categories for your product</p>
        </div>
        <Button 
          type="link" 
          onClick={resetSelection}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Reset All
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Parent Category (Level 1) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="popbold text-[14px] text-gray-700">Main Category</label>
            <span className="text-red-500 text-sm">*</span>
          </div>
          <Select
            placeholder="Select main category"
            value={selectedParent}
            onChange={handleParentChange}
            options={parentCategories.map(cat => ({
              value: cat.id,
              label: cat.name,
            }))}
            style={{ width: '100%' }}
            size="large"
            className="category-selector"
          />
        </div>

        {/* Subcategory (Level 2) */}
        {selectedParent && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="popbold text-[14px] text-gray-700">Subcategory</label>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <Select
              placeholder="Select subcategory"
              value={selectedSubcategory}
              onChange={handleSubcategoryChange}
              options={subcategories.map(sub => ({
                value: sub.id,
                label: sub.name,
              }))}
              style={{ width: '100%' }}
              size="large"
            />
          </div>
        )}

        {/* Child Category (Level 3) */}
        {selectedSubcategory && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="popbold text-[14px] text-gray-700">Child Category</label>
              <span className="text-red-500 text-sm">*</span>
            </div>
            <Select
              mode="multiple"
              placeholder="Select child categories"
              value={selectedChildren}
              onChange={handleChildCategoryChange}
              options={childCategories.map(child => ({
                value: child.id,
                label: child.name,
              }))}
              style={{ width: '100%' }}
              size="large"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 You can select multiple child categories to reach more customers
            </p>
          </div>
        )}
      </div>

      {/* Selected Path Display */}
      {(selectedParent || selectedSubcategory || selectedChildren.length > 0) && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Selected Categories:
          </h5>
          <div className="text-sm text-gray-600 space-y-2">
            {selectedParent && (
              <div className="flex items-center gap-2">
                <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Main:</span>
                <span>{parentCategories.find(cat => cat.id === selectedParent)?.name}</span>
              </div>
            )}
            {selectedSubcategory && (
              <div className="flex items-center gap-2">
                <span className="font-medium bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Subcategory:</span>
                <span>{subcategories.find(sub => sub.id === selectedSubcategory)?.name}</span>
              </div>
            )}
            {selectedChildren.length > 0 && (
              <div>
                <span className="font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Child Categories:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedChildren.map(childId => {
                    const child = childCategories.find(c => c.id === childId);
                    return child ? (
                      <span 
                        key={childId}
                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                      >
                        {child.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const VEditProducts = () => {
  const location = useLocation();
  const productData = location?.state?.productData;
   const [deleteImage] = useDeleteImageMutation()
     const [vendorEditProduct] = useVendorEditProductMutation()
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: categories } = useGetCategoriesQuery();
  const { data: products, refetch } = useGetAllProductsQuery();
  const { data: childCategoriesData, isLoading: loadingChildCategories } = useChildCategoryQuery();
  
  // const [vendorProductUpdate] = useVendorProductUpdateMutation();

  // Lifted category selection state
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedChildren, setSelectedChildren] = useState([]);
  
  // Filter selections state
  const [filterSelections, setFilterSelections] = useState({});

  // Steps state
  const [current, setCurrent] = useState(0);

  // Validation state
  const [errors, setErrors] = useState({});

  const steps = [
    { 
      title: 'Basic Information', 
      description: 'Product name and description',
      icon: <Package className="w-5 h-5" />
    },
    { 
      title: 'Categories & Filters', 
      description: 'Categorization and attributes',
      icon: <Settings className="w-5 h-5" />
    },
    { 
      title: 'Product Images', 
      description: 'Upload product photos',
      icon: <ImageIcon className="w-5 h-5" />
    },
    { 
      title: 'Pricing & Inventory', 
      description: 'Pricing and stock details',
      icon: <Package className="w-5 h-5" />
    },
    { 
      title: 'SEO & Specifications', 
      description: 'SEO and product specs',
      icon: <Search className="w-5 h-5" />
    },
  ];

  const compressionOptions = {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

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
    filter_data: [],
    product_filter: [],
    dimensions: "",
    material: "",
    color: "",
    weight: "",
    assembly_required: "",
    warranty: "",
    care_instructions: "",
    country_of_origin: "",
  });

  // Initialize form with product data
  useEffect(() => {
    if (productData) {
      // Set basic form data
      setFormData(prev => ({
        ...prev,
        name: productData.name || "",
        short_description: productData.short_description || "",
        full_description: productData.full_description || "",
        price1: productData.price1 || "",
        price2: productData.price2 || "",
        price3: productData.price3 || "",
        sku: productData.sku || "",
        stock_quantity: productData.stock_quantity || "",
        is_stock: productData.is_stock ?? true,
        home_delivery: productData.home_delivery || false,
        pickup: productData.pickup || false,
        partner_delivery: productData.partner_delivery || false,
        estimated_delivery_days: productData.estimated_delivery_days || "",
        seo_title: productData.seo?.title || "",
        meta_description: productData.seo?.description || "",
        product_filter: productData.product_filter || [],
        // Specifications
        dimensions: productData.specifications?.dimensions || "",
        material: productData.specifications?.material || "",
        color: productData.specifications?.color || "",
        weight: productData.specifications?.weight || "",
        assembly_required: productData.specifications?.assembly_required || "",
        warranty: productData.specifications?.warranty || "",
        care_instructions: productData.specifications?.care_instructions || "",
        country_of_origin: productData.specifications?.country_of_origin || "",
      }));

      // Set existing images
      if (productData.images && productData.images.length > 0) {
        setExistingImages(productData.images);
      }

      // Set categories
      if (productData.categories && productData.categories.length > 0) {
        setSelectedChildren(productData.categories);
        
        // Find parent and subcategory from the categories data
        if (categories?.results) {
          let foundParent = null;
          let foundSubcategory = null;
          
          // Search through all categories to find the hierarchy
          categories.results.forEach(parentCat => {
            parentCat.children?.forEach(subCat => {
              subCat.children?.forEach(childCat => {
                if (productData.categories.includes(childCat.id)) {
                  foundParent = parentCat.id;
                  foundSubcategory = subCat.id;
                }
              });
            });
          });
          
          if (foundParent) setSelectedParent(foundParent);
          if (foundSubcategory) setSelectedSubcategory(foundSubcategory);
        }
      }
    }
  }, [productData, categories]);

  // Initialize filter selections from product_filter
  useEffect(() => {
    if (productData?.product_filter && productData.product_filter.length > 0 && categories?.results) {
      const newFilterSelections = {};
      
      // Find all filters for the selected subcategory
      if (selectedSubcategory && selectedParent) {
        const parentCategories = categories.results || [];
        const subcategories = parentCategories.find(cat => cat.id === selectedParent)?.children || [];
        const selectedSub = subcategories.find(sub => sub.id === selectedSubcategory);
        const filters = selectedSub?.filter_data || [];
        
        filters.forEach(filter => {
          const filterId = filter.filter_by_type.id;
          const selectedOptions = [];
          
          // Check each option in this filter
          filter.filter_options.forEach(option => {
            if (productData.product_filter.includes(option.id)) {
              selectedOptions.push(option.id);
            }
          });
          
          if (selectedOptions.length > 0) {
            newFilterSelections[filterId] = {
              value: filter.filter_by_type.filter_type === 'checkbox' ? selectedOptions : selectedOptions[0],
              type: filter.filter_by_type.filter_type
            };
          }
        });
        
        setFilterSelections(newFilterSelections);
      }
    }
  }, [productData, categories, selectedParent, selectedSubcategory]);

  // Update formData when categories or filter selections change
  useEffect(() => {
    const selectedOptionIds = [];

    Object.values(filterSelections).forEach(selection => {
      if (Array.isArray(selection.value)) {
        selectedOptionIds.push(...selection.value);
      } else if (selection.value !== undefined && selection.value !== null && selection.value !== "") {
        selectedOptionIds.push(selection.value);
      }
    });

    const normalizedIds = selectedOptionIds
      .map(id => Number(id))
      .filter(id => !isNaN(id));

    setFormData(prev => ({
      ...prev,
      categories: selectedChildren,
      product_filter: normalizedIds
    }));
  }, [selectedChildren, filterSelections]);

  // Validation rules for each step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.name.trim()) newErrors.name = "Product name is required";
        if (!formData.short_description.trim()) newErrors.short_description = "Short description is required";
        if (!formData.full_description.trim()) newErrors.full_description = "Full description is required";
        if (formData.short_description.length > 500) newErrors.short_description = "Short description must be less than 500 characters";
        break;
      
      case 1: // Categories & Filters
        if (!selectedParent) newErrors.selectedParent = "Main category is required";
        if (!selectedSubcategory) newErrors.selectedSubcategory = "Subcategory is required";
        if (selectedChildren.length === 0) newErrors.selectedChildren = "At least one child category is required";
        break;
      
      case 2: // Product Images
        if (images.length === 0 && existingImages.length === 0) newErrors.images = "At least one product image is required";
        break;
      
      case 3: // Pricing & Inventory
        if (!formData.price1 || formData.price1 <= 0) newErrors.price1 = "Valid price is required";
        if (!formData.sku.trim()) newErrors.sku = "SKU is required";
        if (!formData.stock_quantity || formData.stock_quantity < 0) newErrors.stock_quantity = "Valid stock quantity is required";
        break;
      
      case 4: // SEO & Specifications
        if (!formData.seo_title.trim()) newErrors.seo_title = "SEO title is required";
        if (!formData.meta_description.trim()) newErrors.meta_description = "Meta description is required";
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (files) => {
    if (images.length + files.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "Maximum 5 Images",
        text: `You can only add ${5 - images.length} more image(s).`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setLoading(true);
    
    try {
      const compressedImages = [];
      
      for (const file of files) {
        const fileExtension = file.name.split('.').pop();
        const fileNameWithoutExt = file.name.slice(0, file.name.lastIndexOf('.'));
        
        const compressedFile = await imageCompression(file, compressionOptions);
        
        const compressedFileWithName = new File(
          [compressedFile], 
          `${fileNameWithoutExt}_compressed.${fileExtension}`, 
          { type: compressedFile.type }
        );
        
        const preview = URL.createObjectURL(compressedFile);
        
        compressedImages.push({
          file: compressedFileWithName,
          preview: preview,
          originalName: file.name
        });
      }
      
      setImages(prev => [...prev, ...compressedImages]);
      // Clear image error if images are uploaded
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: "" }));
      }
    } catch (error) {
      console.error('Error compressing images:', error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload images. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = (index, isExisting = false) => {
    if (isExisting) {
      const newImages = [...existingImages];
      newImages.splice(index, 1);
      setExistingImages(newImages);
    } else {
      const newImages = [...images];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      setImages(newImages);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const next = () => {
    if (!validateStep(current)) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields before proceeding.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

const handleSubmit = async () => {
  if (!validateStep(current)) {
    Swal.fire({
      icon: "warning",
      title: "Validation Error",
      text: "Please fix all errors before submitting.",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  // Check if at least one image exists
  if (images.length === 0 && existingImages.length === 0) {
    Swal.fire({
      icon: "warning",
      title: "Image Required",
      text: "Please upload at least one product image.",
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  setLoading(true);

  try {
    const formDataToSend = new FormData();

    // Add product ID for update
    formDataToSend.append("id", productData.id);

    // Handle specifications
    const specifications = {
      dimensions: formData.dimensions || "",
      material: formData.material || "",
      color: formData.color || "",
      weight: formData.weight || "",
      assembly_required: formData.assembly_required || "",
      warranty: formData.warranty || "",
      care_instructions: formData.care_instructions || "",
      country_of_origin: formData.country_of_origin || "",
    };

    formDataToSend.append("specifications", JSON.stringify(specifications));

    // Handle product filters
    if (Array.isArray(formData.product_filter) && formData.product_filter.length > 0) {
      formData.product_filter.forEach(id => {
        formDataToSend.append("product_filter", String(id));
      });
    }

    // Handle categories
    if (Array.isArray(selectedChildren) && selectedChildren.length > 0) {
      selectedChildren.forEach(category => {
        formDataToSend.append('categories', category.toString());
      });
    }

    // Append all basic form fields - using the same field names as your working version
    const basicFields = [
      'name', 'short_description', 'full_description', 'price1', 'price2', 'price3',
      'sku', 'stock_quantity', 'estimated_delivery_days', 'seo_title', 'meta_description'
    ];

    basicFields.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== null && formData[field] !== "") {
        formDataToSend.append(field, formData[field].toString());
      }
    });

    // Handle boolean fields separately
    formDataToSend.append("is_stock", formData.is_stock.toString());
    formDataToSend.append("home_delivery", formData.home_delivery.toString());
    formDataToSend.append("pickup", formData.pickup.toString());
    formDataToSend.append("partner_delivery", formData.partner_delivery.toString());

    // Append new image files
    images.forEach((image) => {
      formDataToSend.append("uploaded_images", image.file);
    });

    // Append existing image IDs to keep
    const existingImageIds = existingImages.map((img) => img.id);
    formDataToSend.append("existing_images", JSON.stringify(existingImageIds));

    // Debug: Log what's being sent

    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    // Use the EXACT same API call pattern as your working version
    const res = await vendorEditProduct({ 
      id: productData.id, 
      formDataToSend  // This parameter name must match what your API expects
    });

    if (res?.data?.id) {
      Swal.fire({
        title: "Success! 🎉",
        text: "Product updated successfully!",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      refetch();
    }
  } catch (err) {
    console.error('Update error:', err);
    
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
        text: err?.data?.message || "Server error occurred. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  } finally {
    setLoading(false);
  }
};
  const getStepCompletion = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return formData.name && formData.short_description && formData.full_description;
      case 1:
        return selectedParent && selectedSubcategory && selectedChildren.length > 0;
      case 2:
        return images.length > 0 || existingImages.length > 0;
      case 3:
        return formData.price1 && formData.sku && formData.stock_quantity;
      case 4:
        return formData.seo_title && formData.meta_description;
      default:
        return false;
    }
  };

  const getCurrentContent = () => {
    const stepConfigs = {
      0: {
        title: "Basic Information",
        description: "Enter the fundamental details about your product",
        icon: <Package className="w-5 h-5" />
      },
      1: {
        title: "Categories & Filters",
        description: "Categorize your product and add relevant attributes",
        icon: <Settings className="w-5 h-5" />
      },
      2: {
        title: "Product Images",
        description: "Upload high-quality images of your product",
        icon: <ImageIcon className="w-5 h-5" />
      },
      3: {
        title: "Pricing & Inventory",
        description: "Set pricing, stock, and delivery options",
        icon: <Package className="w-5 h-5" />
      },
      4: {
        title: "SEO & Specifications",
        description: "Optimize for search and add technical details",
        icon: <Search className="w-5 h-5" />
      }
    };

    const currentStep = stepConfigs[current];

    return (
      <div className="space-y-6">
        <StepHeader 
          title={currentStep.title}
          description={currentStep.description}
          icon={currentStep.icon}
          completed={getStepCompletion(current)}
        />

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {current === 0 && (
            <div className="space-y-6">
              <InputField 
                label="Product Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter product name" 
                required
                error={errors.name}
                maxLength={100}
              />
              <TextareaField 
                label="Short Description" 
                name="short_description" 
                value={formData.short_description} 
                onChange={handleChange} 
                placeholder="Enter a brief description (max 500 characters)"
                required
                error={errors.short_description}
                maxLength={500}
                rows={3}
              />
              <TextareaField 
                label="Full Description" 
                name="full_description" 
                value={formData.full_description} 
                onChange={handleChange} 
                placeholder="Enter a detailed description"
                required
                error={errors.full_description}
                rows={6}
              />
            </div>
          )}

          {current === 1 && (
            <div className="space-y-6">
              <CategorySelector 
                categories={categories}
                selectedParent={selectedParent}
                setSelectedParent={setSelectedParent}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                selectedChildren={selectedChildren}
                setSelectedChildren={setSelectedChildren}
              />
              
              {errors.selectedParent || errors.selectedSubcategory || errors.selectedChildren ? (
                <Alert
                  message="Category Selection Required"
                  description="Please complete all category selections to proceed."
                  type="error"
                  showIcon
                />
              ) : null}

              <FilterDisplay 
                selectedSubcategory={selectedSubcategory}
                categories={categories}
                selectedParent={selectedParent}
                filterSelections={filterSelections}
                setFilterSelections={setFilterSelections}
              />
            </div>
          )}

          {current === 2 && (
            <div className="space-y-6">
              {errors.images && (
                <Alert
                  message="Image Required"
                  description="Please upload at least one product image."
                  type="error"
                  showIcon
                />
              )}
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Existing Images ({existingImages.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {existingImages.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.image}
                          alt={`Existing ${index + 1}`}
                          className="h-32 w-full object-cover rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={() => handleImageRemove(index, true)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                          Existing Image
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-gray-400" />
                    <p className="mb-2 text-lg font-semibold text-gray-700">
                      Click to upload new images
                    </p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-1">
                      SVG, PNG, JPG or GIF (MAX. 5MB each) - Max 5 images
                    </p>
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
                <div className="flex justify-center items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Spin />
                  <span className="popmed text-blue-600">Compressing images...</span>
                </div>
              ) : (
                images.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-800">
                        New Images ({images.length}/5)
                      </h4>
                      <Progress 
                        percent={(images.length / 5) * 100} 
                        size="small" 
                        showInfo={false}
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="h-32 w-full object-cover rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => handleImageRemove(index)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {image.originalName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {current === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Product Price ($)" 
                  name="price1" 
                  value={formData.price1} 
                  onChange={handleChange} 
                  type="number" 
                  placeholder="0.00" 
                  required
                  error={errors.price1}
                />
                <InputField 
                  label="SKU" 
                  name="sku" 
                  value={formData.sku} 
                  onChange={handleChange} 
                  placeholder="Product SKU" 
                  required
                  error={errors.sku}
                />
                <InputField 
                  label="Stock Quantity" 
                  name="stock_quantity" 
                  value={formData.stock_quantity} 
                  onChange={handleChange} 
                  type="number" 
                  placeholder="0" 
                  required
                  error={errors.stock_quantity}
                />
                <InputField 
                  label="Estimated Delivery Days" 
                  name="estimated_delivery_days" 
                  value={formData.estimated_delivery_days} 
                  onChange={handleChange} 
                  type="number" 
                  placeholder="0" 
                />
              </div>

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700">In Stock</span>
                    <p className="text-sm text-gray-500">Product availability</p>
                  </div>
                  <Switch 
                    checked={formData.is_stock} 
                    onChange={(checked) => setFormData((prev) => ({ ...prev, is_stock: checked }))} 
                    size="default"
                  />
                </div>

                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700">Delivery Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Home Delivery</span>
                      <Switch 
                        checked={formData.home_delivery} 
                        onChange={(checked) => setFormData((prev) => ({ ...prev, home_delivery: checked }))} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Store Pickup</span>
                      <Switch 
                        checked={formData.pickup} 
                        onChange={(checked) => setFormData((prev) => ({ ...prev, pickup: checked }))} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Partner Delivery</span>
                      <Switch 
                        checked={formData.partner_delivery} 
                        onChange={(checked) => setFormData((prev) => ({ ...prev, partner_delivery: checked }))} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {current === 4 && (
            <div className="space-y-6">
              <InputField 
                label="SEO Title" 
                name="seo_title" 
                value={formData.seo_title} 
                onChange={handleChange} 
                placeholder="SEO title for search engines" 
                required
                error={errors.seo_title}
                maxLength={60}
              />
              <TextareaField 
                label="Meta Description" 
                name="meta_description" 
                value={formData.meta_description} 
                onChange={handleChange} 
                placeholder="Meta description for search engines" 
                required
                error={errors.meta_description}
                maxLength={160}
                rows={3}
              />
              <ProductSpecificationForm setFormData={setFormData} formData={formData} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const progressPercentage = ((current + 1) / steps.length) * 100;

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <Alert
            message="No Product Data"
            description="Please select a product to edit."
            type="warning"
            showIcon
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
          <p className="text-gray-600">Update your product information</p>
          <div className="mt-2">
            <Tag color="blue">Product ID: {productData.prod_id}</Tag>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {current + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-[#CBA135]">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress 
            percent={progressPercentage} 
            strokeColor="#CBA135"
            showInfo={false}
            className="mb-2"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            {getCurrentContent()}
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                {current > 0 && (
                  <Button 
                    onClick={prev}
                    icon={<ArrowLeft className="w-4 h-4" />}
                    size="large"
                    className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                {current === steps.length - 1 ? (
                  <Button 
                    icon={<Save className="w-4 h-4" />}
                    size="large"
                    className="flex items-center gap-2 bg-[#CBA135] hover:bg-[#b8912f] text-white border-none px-8"
                    onClick={handleSubmit}
                    loading={loading}
                  >
                    Update Product
                  </Button>
                ) : (
                  <Button 
                    icon={<ArrowRight className="w-4 h-4" />}
                    size="large"
                    className="flex items-center gap-2 bg-[#CBA135] hover:bg-[#b8912f] text-white border-none px-8"
                    onClick={next}
                  >
                    Next Step
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`text-center p-4 rounded-lg border-2 transition-all ${
                index === current
                  ? 'border-[#CBA135] bg-[#CBA135] bg-opacity-10'
                  : index < current
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                index === current
                  ? 'bg-[#CBA135] text-white'
                  : index < current
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index < current ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              <p className={`text-sm font-medium ${
                index === current ? 'text-[#CBA135]' : 
                index < current ? 'text-green-700' : 'text-gray-600'
              }`}>
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VEditProducts;