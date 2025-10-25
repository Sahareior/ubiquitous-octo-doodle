import React, { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  useCreatePromotionMutation,
  useEditPromotionMutation,
  useGetAllProductsQuery,
  useGetPromotionQuery,
} from "../../../../redux/slices/Apis/vendorsApi";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const CreatePromotion = () => {
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [description, setDescription] = useState("");
  const [isActive] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const location = useLocation();
  const [createPromotion] = useCreatePromotionMutation();
  const { data, refetch } = useGetPromotionQuery();
  const [editPromotion] = useEditPromotionMutation();
  const { data: productsData, isLoading, error } = useGetAllProductsQuery();

  // Prefill form if location.state exists
  useEffect(() => {
    if (location.state) {
      const promo = location.state;
      setName(promo.name || "");
      setDiscountType(promo.discount_type || "percentage");
      setDiscountValue(promo.discount_value || "");
      
      // Set dates using Date objects
      setStartDateTime(
        promo.start_datetime ? new Date(promo.start_datetime) : null
      );
      setEndDateTime(
        promo.end_datetime ? new Date(promo.end_datetime) : null
      );
      setDescription(promo.description || "");
    }
  }, [location.state]);

  // Set available products and preselect based on promo
  useEffect(() => {
    if (productsData?.results) {
      setAvailableProducts(productsData.results);

      if (location.state?.products) {
        const matchedProducts = productsData.results.filter((p) =>
          location.state.products.includes(p.id)
        );
        setSelectedProducts(matchedProducts);
      }
    }
  }, [productsData, location.state]);

  // Validate form function
  const validateForm = () => {
    const errors = {};

    // Check required fields
    if (!name.trim()) {
      errors.name = "Promotion name is required";
    }

    if (!discountValue) {
      errors.discountValue = "Discount value is required";
    } else if (parseFloat(discountValue) <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    } else if (discountType === "percentage" && parseFloat(discountValue) > 100) {
      errors.discountValue = "Percentage discount cannot exceed 100%";
    }

    // Check products selection
    if (selectedProducts.length === 0) {
      errors.products = "Please select at least one product";
    }

    // Check dates
    if (!startDateTime) {
      errors.startDateTime = "Start date and time is required";
    }

    if (!endDateTime) {
      errors.endDateTime = "End date and time is required";
    } else if (startDateTime && endDateTime && startDateTime >= endDateTime) {
      errors.endDateTime = "End date must be after start date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prod_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product) => {
    if (!selectedProducts.some((p) => p.prod_id === product.prod_id)) {
      setSelectedProducts([...selectedProducts, product]);
      // Clear products error when a product is selected
      if (formErrors.products) {
        setFormErrors(prev => ({ ...prev, products: "" }));
      }
    }
    setSearchQuery("");
    setShowProductDropdown(false);
  };

  const removeProduct = (prodId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.prod_id !== prodId));
    // If removing the last product, set error
    if (selectedProducts.length === 1) {
      setFormErrors(prev => ({ ...prev, products: "Please select at least one product" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      // Show general error message for required fields
      Swal.fire({
        icon: "error",
        title: "Missing Required Fields",
        text: "Please fill in all required fields marked with *",
        confirmButtonColor: "#CBA135",
      });
      return;
    }

    const payload = {
      name,
      discount_type: discountType,
      discount_value: discountValue,
      products: selectedProducts.map((p) => p.id),
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      description,
      is_active: isActive,
    };

    try {
      if (location.state) {
        // Edit promotion
        await editPromotion({ id: location.state.id, payload }).unwrap();
        Swal.fire({
          icon: "success",
          title: "Promotion Updated!",
          text: "The promotion has been successfully updated.",
          confirmButtonColor: "#CBA135",
        });
        refetch();
      } else {
        // Create promotion
        await createPromotion(payload).unwrap();
        Swal.fire({
          icon: "success",
          title: "Promotion Created!",
          text: "Your promotion has been successfully created.",
          confirmButtonColor: "#CBA135",
        });

        // Reset form after creation
        setName("");
        setDiscountType("percentage");
        setDiscountValue("");
        setStartDateTime(null);
        setEndDateTime(null);
        setDescription("");
        setSelectedProducts([]);
        setSearchQuery("");
        setFormErrors({});
        refetch();
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#CBA135",
      });
    }
  };

  // Clear individual field error when user starts typing
  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Custom input component for DatePicker to match your styling
  const CustomInput = React.forwardRef(({ value, onClick, error }, ref) => (
    <div>
      <input
        className={`w-[400px] border rounded-md px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
        onClick={onClick}
        ref={ref}
        value={value}
        readOnly
        placeholder="Select date and time"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ));

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products</p>;

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-md border p-6">
      {/* Header */}
      <div
        className="bg-yellow-600 text-white text-2xl popbold rounded-t-md px-4 py-5"
        style={{
          background: "linear-gradient(90deg, #CBA135 0%, #B8941F 100%)",
        }}
      >
        {location.state ? "Edit Promotion" : "Create New Promotion"}
        <p className="text-[16px] popreg">
          {location.state
            ? "Update the details below to edit your promotion"
            : "Fill in the details below to list your furniture product"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Promotion Name */}
        <div>
          <label className="block popmed text-[14px] mb-1">
            Promotion Name *
          </label>
          <input
            type="text"
            placeholder="Enter promotion name"
            value={name}
            onChange={(e) => handleFieldChange('name', e.target.value, setName)}
            className={`w-full border rounded-md px-3 py-2 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {formErrors.name && (
            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
          )}
        </div>

        {/* Discount Type */}
        <div>
          <label className="block popmed text-[14px] mb-1">
            Discount Type *
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="discountType"
                value="percentage"
                checked={discountType === "percentage"}
                onChange={() => setDiscountType("percentage")}
              />
              Percentage (%)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="discountType"
                value="flat"
                checked={discountType === "flat"}
                onChange={() => setDiscountType("flat")}
              />
              Flat Amount (৳)
            </label>
          </div>
        </div>

        {/* Discount Value */}
        <div>
          <label className="block popmed text-[14px] mb-1">
            Discount Value *
          </label>
          <input
            type="number"
            min="0"
            step={discountType === "percentage" ? "0.01" : "1"}
            value={discountValue}
            onChange={(e) => handleFieldChange('discountValue', e.target.value, setDiscountValue)}
            className={`w-full border rounded-md px-3 py-2 ${formErrors.discountValue ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {formErrors.discountValue && (
            <p className="text-red-500 text-xs mt-1">{formErrors.discountValue}</p>
          )}
        </div>

        {/* Product Selection */}
        <div className="relative">
          <label className="block popmed text-[14px] mb-1">
            Select Products *
          </label>

          {/* Error message for products */}
          {formErrors.products && (
            <p className="text-red-500 text-xs mb-2">{formErrors.products}</p>
          )}

          {/* Selected products */}
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedProducts.map((product) => (
                <div
                  key={product.prod_id}
                  className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
                >
                  {product.name} ({product.prod_id})
                  <button
                    type="button"
                    onClick={() => removeProduct(product.prod_id)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <div className={`flex items-center border rounded-md px-3 py-2 ${formErrors.products ? 'border-red-500' : 'border-gray-300'}`}>
              <FiSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowProductDropdown(true)}
                placeholder="Search your products..."
                className="flex-1 outline-none bg-transparent"
              />
            </div>

            {showProductDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.prod_id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                      onClick={() => handleProductSelect(product)}
                    >
                      {/* Product image */}
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}

                      {/* Product info */}
                      <div className="flex-1 space-y-2">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          SKU: {product.sku} | ID: {product.prod_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          Price: ৳{Number(product.price1).toLocaleString()} | Stock: {product.stock_quantity}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[250px]">
                          {product.short_description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Vendor: {product.vendor_details.first_name} {product.vendor_details.last_name}
                        </p>
                      </div>

                      {/* Selected indicator */}
                      {selectedProducts.some((p) => p.prod_id === product.prod_id) && (
                        <span className="text-green-500 text-sm font-semibold">✓ Selected</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No products found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date pickers */}
        <div className="flex gap-4">
          <div>
            <label className="block popmed text-[14px] mb-1">
              Start Date & Time *
            </label>
            <DatePicker
              selected={startDateTime}
              onChange={(date) => handleFieldChange('startDateTime', date, setStartDateTime)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select start date and time"
              customInput={<CustomInput error={formErrors.startDateTime} />}
              isClearable
              selectsStart
              startDate={startDateTime}
              endDate={endDateTime}
              minDate={new Date()}
            />
          </div>
          <div>
            <label className="block popmed text-[14px] mb-1">
              End Date & Time *
            </label>
            <DatePicker
              selected={endDateTime}
              onChange={(date) => handleFieldChange('endDateTime', date, setEndDateTime)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select end date and time"
              customInput={<CustomInput error={formErrors.endDateTime} />}
              isClearable
              selectsEnd
              startDate={startDateTime}
              endDate={endDateTime}
              minDate={startDateTime || new Date()}
            />
            {formErrors.endDateTime && (
              <p className="text-red-500 text-xs mt-1">{formErrors.endDateTime}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block popmed text-[14px] mb-1">
            Description / Notes (Optional)
          </label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any additional notes about this promotion..."
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md font-medium"
          >
            {location.state ? "Update Promotion" : "Create Promotion"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePromotion;