import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaUpload,
  FaImage,
  FaFire,
  FaClock
} from 'react-icons/fa';
import { IoFlash } from 'react-icons/io5';

const FlashDealsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56
  });

  // Load initial data
  useEffect(() => {
    const initialProducts = [
      {
        id: 1,
        name: "Modern Bedroom Set",
        price: 899.99,
        oldPrice: 1289.99,
        discount: 30,
        rating: 4.5,
        reviews: 234,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        sold: 45,
        total: 100,
        active: true
      },
      {
        id: 2,
        name: "Luxury Sofa Collection",
        price: 1299.99,
        oldPrice: 1899.99,
        discount: 35,
        rating: 4.8,
        reviews: 456,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        sold: 78,
        total: 100,
        active: true
      },
      {
        id: 3,
        name: "Dining Table Set",
        price: 749.99,
        oldPrice: 999.99,
        discount: 25,
        rating: 4.2,
        reviews: 189,
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        sold: 32,
        total: 100,
        active: false
      },
    ];
    setProducts(initialProducts);
  }, []);

  const handleAddProduct = () => {
    setIsAddingNew(true);
    setEditingProduct({
      id: Date.now(),
      name: "",
      price: 0,
      oldPrice: 0,
      discount: 0,
      rating: 0,
      reviews: 0,
      image: "",
      sold: 0,
      total: 100,
      active: true
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setIsAddingNew(false);
  };

  const handleSaveProduct = () => {
    if (isAddingNew) {
      setProducts(prev => [...prev, editingProduct]);
    } else {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    }
    setEditingProduct(null);
    setIsAddingNew(false);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleInputChange = (field, value) => {
    setEditingProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimerChange = (field, value) => {
    setTimerSettings(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const toggleProductStatus = (id) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const ProductForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isAddingNew ? 'Add New Product' : 'Edit Product'}
          </h3>
          <button
            onClick={() => setEditingProduct(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              value={editingProduct.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              value={editingProduct.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter image URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={editingProduct.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={editingProduct.oldPrice}
              onChange={(e) => handleInputChange('oldPrice', parseFloat(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              value={editingProduct.discount}
              onChange={(e) => handleInputChange('discount', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={editingProduct.rating}
              onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reviews Count</label>
            <input
              type="number"
              value={editingProduct.reviews}
              onChange={(e) => handleInputChange('reviews', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sold Items</label>
            <input
              type="number"
              value={editingProduct.sold}
              onChange={(e) => handleInputChange('sold', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Stock</label>
            <input
              type="number"
              value={editingProduct.total}
              onChange={(e) => handleInputChange('total', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editingProduct.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active in Flash Deals</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setEditingProduct(null)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProduct}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaSave size={16} />
            Save Product
          </button>
        </div>
      </div>
    </div>
  );

  const TimerSettings = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex items-center gap-3 mb-4">
        <FaClock className="text-blue-600 text-xl" />
        <h3 className="text-lg font-bold text-gray-800">Timer Settings</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
          <input
            type="number"
            value={timerSettings.hours}
            onChange={(e) => handleTimerChange('hours', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="23"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
          <input
            type="number"
            value={timerSettings.minutes}
            onChange={(e) => handleTimerChange('minutes', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="59"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Seconds</label>
          <input
            type="number"
            value={timerSettings.seconds}
            onChange={(e) => handleTimerChange('seconds', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max="59"
          />
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Current timer display: {String(timerSettings.hours).padStart(2, '0')}:
          {String(timerSettings.minutes).padStart(2, '0')}:
          {String(timerSettings.seconds).padStart(2, '0')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="bg-slate-600 p-3 rounded-2xl">
              <IoFlash className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flash Deals </h1>
              <p className="text-gray-600">Manage your flash deals and timer settings</p>
            </div>
          </div>
          
          <button
            onClick={handleAddProduct}
            className="bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <FaPlus size={16} />
            Add New Flash Deals
          </button>
        </div>

                <div className="grid grid-cols-1 md:grid-cols-4 mb-9 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <FaFire className="text-orange-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.active).length}
                </p>
              </div>
              <IoFlash className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Discount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(products.reduce((acc, p) => acc + p.discount, 0) / products.length)}%
                </p>
              </div>
              <FaUpload className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sold</p>
                <p className="text-2xl font-bold text-purple-600">
                  {products.reduce((acc, p) => acc + p.sold, 0)}
                </p>
              </div>
              <FaImage className="text-purple-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Timer Settings */}
        <TimerSettings />

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Flash Deal Products</h2>
            <p className="text-gray-600 text-sm">
              {products.filter(p => p.active).length} active products
            </p>
          </div>

          <div className="overflow-x-auto">
            
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.rating} ★ ({product.reviews} reviews)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price}</div>
                      <div className="text-sm text-gray-500 line-through">
                        ${product.oldPrice}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        -{product.discount}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sold} / {product.total} sold
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {product.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}

      </div>

      {/* Product Form Modal */}
      {editingProduct && <ProductForm />}
    </div>
  );
};

export default FlashDealsAdmin;