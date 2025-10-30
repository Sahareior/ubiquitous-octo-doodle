import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSearch } from 'react-icons/fa';
import { useGetAllProductsQuery } from '../../../../../redux/slices/Apis/vendorsApi';
import { useAllFlashDealsQuery, useCreateFlashDealsMutation } from '../../../../../redux/slices/Apis/dashboardApis';

const FlashDealModal = ({ 
  editingProduct, 
  isAddingNew, 
  onClose, 
  onSave, 
  onInputChange 
}) => {
  const { data, refetch } = useGetAllProductsQuery();
  const [createFlashDeals, { isLoading }] = useCreateFlashDealsMutation();
   const { data: flashDeals, refetch: refetchFlashDeals } = useAllFlashDealsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_id: null,
    offer_price: null,
    upload_image: null,
    start_date: '',
    end_date: '',
    is_active: false,
    stock_count: null
  });

  // Initialize form when editing or adding new
  useEffect(() => {
    if (isAddingNew) {
      setFormData({
        product_id: null,
        offer_price: null,
        upload_image: null,
        start_date: '',
        end_date: '',
        is_active: false,
        stock_count: null
      });
      setSelectedProduct(null);
    } else if (editingProduct) {
      // If editing existing flash deal, populate the form
      setFormData({
        product_id: editingProduct.product_id,
        offer_price: editingProduct.offer_price,
        upload_image: editingProduct.upload_image,
        start_date: editingProduct.start_date || '',
        end_date: editingProduct.end_date || '',
        is_active: editingProduct.is_active || false,
        stock_count: editingProduct.stock_count
      });
      // Find and set the selected product
      const product = data?.results?.find(p => p.id === editingProduct.product_id);
      setSelectedProduct(product);
    }
  }, [editingProduct, isAddingNew, data]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      product_id: product.id,
      stock_count: product.stock_quantity || 0,
      offer_price: product.price1 || product.old_price || 0
    }));
  };

  const handleInputChangeLocal = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        upload_image: file
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      submitData.append('product_id', formData.product_id);
      submitData.append('offer_price', formData.offer_price);
      submitData.append('start_date', formData.start_date);
      submitData.append('end_date', formData.end_date);
      submitData.append('is_active', formData.is_active);
      submitData.append('stock_count', formData.stock_count);
      
      if (formData.upload_image) {
        submitData.append('upload_image', formData.upload_image);
      }

      const result = await createFlashDeals(submitData).unwrap();
      refetchFlashDeals()
      
      // Call the parent save handler with the result
      onSave(result);
      
      // Reset form
      setFormData({
        product_id: null,
        offer_price: null,
        upload_image: null,
        start_date: '',
        end_date: '',
        is_active: false,
        stock_count: null
      });
      setSelectedProduct(null);
      
    } catch (error) {
      console.error('Error creating flash deal:', error);
      alert('Error creating flash deal. Please try again.');
    }
  };

  // Filter products based on search
  const filteredProducts = data?.results?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!editingProduct && !isAddingNew) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isAddingNew ? 'Create Flash Deal' : 'Edit Flash Deal'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product *
            </label>
            
            {/* Search Input */}
            <div className="relative mb-3">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search products by name or SKU..."
              />
            </div>

            {/* Product List */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedProduct?.id === product.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.images?.[0]?.image || '/placeholder-image.jpg'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Price: ${product.price1 || product.old_price}
                        </span>
                        <span className="text-sm text-gray-600">
                          Stock: {product.stock_quantity}
                        </span>
                        <span className="text-sm text-gray-600">
                          Rating: {product.average_rating || 'No ratings'}
                        </span>
                      </div>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>

          {/* Selected Product Details */}
          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Selected Product</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Original Price:</span>
                  <p className="font-medium">${selectedProduct.price1 || selectedProduct.old_price}</p>
                </div>
                <div>
                  <span className="text-gray-600">Stock:</span>
                  <p className="font-medium">{selectedProduct.stock_quantity}</p>
                </div>
                <div>
                  <span className="text-gray-600">Vendor:</span>
                  <p className="font-medium">
                    {selectedProduct.vendor_details?.first_name} {selectedProduct.vendor_details?.last_name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flash Deal Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.offer_price || ''}
                onChange={(e) => handleInputChangeLocal('offer_price', parseFloat(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter offer price"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Count for Flash Deal
              </label>
              <input
                type="number"
                value={formData.stock_count || ''}
                onChange={(e) => handleInputChangeLocal('stock_count', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter stock count"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChangeLocal('start_date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChangeLocal('end_date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formData.upload_image && (
                <p className="text-sm text-green-600 mt-1">
                  {formData.upload_image.name || 'Image selected'}
                </p>
              )}
            </div>

            <div className="flex items-center md:col-span-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChangeLocal('is_active', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active Flash Deal</span>
            </div>
          </div>

          {/* Price Comparison */}
          {selectedProduct && formData.offer_price && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Price Comparison</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Original Price:</span>
                  <p className="font-medium text-blue-900">
                    ${selectedProduct.price1 || selectedProduct.old_price}
                  </p>
                </div>
                <div>
                  <span className="text-green-700">Offer Price:</span>
                  <p className="font-medium text-green-900">${formData.offer_price}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-purple-700">Discount:</span>
                  <p className="font-medium text-purple-900">
                    {(((selectedProduct.price1 - formData.offer_price) / selectedProduct.price1) * 100).toFixed(1)}% off
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.product_id || !formData.offer_price || !formData.start_date || !formData.end_date || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaSave size={16} />
            {isLoading ? 'Saving...' : 'Save Flash Deal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashDealModal;