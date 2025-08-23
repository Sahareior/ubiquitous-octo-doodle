import React, { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import {
  useCreatePromotionMutation,
  useEditPromotionMutation,
  useGetAllProductsQuery,
} from "../../../../redux/slices/Apis/vendorsApi";
import { useLocation } from "react-router-dom";

const CreatePromotion = () => {
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [isActive] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const location = useLocation();
  const [createPromotion] = useCreatePromotionMutation();
  const [editPromotion] = useEditPromotionMutation()
  const { data: productsData, isLoading, error } = useGetAllProductsQuery();

  // Prefill form if location.state exists
  useEffect(() => {
    if (location.state) {
      const promo = location.state;
      setName(promo.name || "");
      setDiscountType(promo.discount_type || "percentage");
      setDiscountValue(promo.discount_value || "");
      setStartDateTime(
        promo.start_datetime ? promo.start_datetime.slice(0, 16) : ""
      ); // ✅ format datetime-local
      setEndDateTime(
        promo.end_datetime ? promo.end_datetime.slice(0, 16) : ""
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

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prod_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product) => {
    if (!selectedProducts.some((p) => p.prod_id === product.prod_id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setSearchQuery("");
    setShowProductDropdown(false);
  };

  const removeProduct = (prodId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.prod_id !== prodId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      discount_type: discountType,
      discount_value: discountValue,
      products: selectedProducts.map((p) => p.id),
      start_datetime: new Date(startDateTime).toISOString(),
      end_datetime: new Date(endDateTime).toISOString(),
      description,
      is_active: isActive,
    };

    if(location.state){
      await editPromotion({id:location.state.id,payload})
    }
    const res = await createPromotion(payload);
    console.log("Final Payload:", res);
  };

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
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
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
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        {/* Product Selection */}
        <div className="relative">
          <label className="block popmed text-[14px] mb-1">
            Select Products *
          </label>

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
            <div className="flex items-center border rounded-md px-3 py-2">
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
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {product.prod_id} - ৳
                          {Number(product.price).toLocaleString()}
                        </p>
                      </div>
                      {selectedProducts.some(
                        (p) => p.prod_id === product.prod_id
                      ) && (
                        <span className="text-green-500 text-sm">
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date pickers */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block popmed text-[14px] mb-1">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block popmed text-[14px] mb-1">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
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
