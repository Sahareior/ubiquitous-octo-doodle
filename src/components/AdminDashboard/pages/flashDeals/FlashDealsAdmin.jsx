import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUpload,
  FaImage,
  FaFire,
  FaClock,
  FaBox,
  FaDollarSign,
  FaPercent
} from 'react-icons/fa';
import { IoFlash } from 'react-icons/io5';
import { useGetAllProductsQuery } from '../../../../redux/slices/Apis/vendorsApi';
import FlashDealModal from './Modal/FlashDealModal';
import { useAllFlashDealsQuery, useDeleteFlashDealsMutation } from '../../../../redux/slices/Apis/dashboardApis';

const FlashDealsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [deleteFlashDeals] = useDeleteFlashDealsMutation();
  const { data: flashDeals, refetch: refetchFlashDeals } = useAllFlashDealsQuery();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [countdowns, setCountdowns] = useState({});

  // Calculate countdowns for each flash deal
  useEffect(() => {
    if (!flashDeals?.results) return;

    const calculateCountdowns = () => {
      const newCountdowns = {};
      
      flashDeals.results.forEach(deal => {
        const now = new Date().getTime();
        const startDate = new Date(deal.start_date).getTime();
        const endDate = new Date(deal.end_date).getTime();

        if (now < startDate) {
          // Deal hasn't started yet
          const distance = startDate - now;
          newCountdowns[deal.id] = {
            status: 'upcoming',
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          };
        } else if (now <= endDate) {
          // Deal is active
          const distance = endDate - now;
          newCountdowns[deal.id] = {
            status: 'active',
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          };
        } else {
          // Deal has ended
          newCountdowns[deal.id] = {
            status: 'ended',
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
          };
        }
      });

      setCountdowns(newCountdowns);
    };

    calculateCountdowns();
    const interval = setInterval(calculateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [flashDeals]);

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
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsAddingNew(false);
  };

  const handleInputChange = (field, value) => {
    setEditingProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this flash deal?')) {
      try {
        await deleteFlashDeals(id).unwrap();
        refetchFlashDeals();
      } catch (error) {
        console.error('Failed to delete flash deal:', error);
      }
    }
  };

  const toggleProductStatus = async (id, currentStatus) => {
    // You might want to implement an API call here to update the status
    console.log(`Toggling status for product ${id} from ${currentStatus}`);
  };

  // Countdown Timer Component for each deal
  const CountdownTimer = ({ dealId }) => {
    const countdown = countdowns[dealId];
    
    if (!countdown) return <div className="text-gray-500">Loading...</div>;

    const getStatusColor = () => {
      switch (countdown.status) {
        case 'active': return 'text-green-600 bg-green-100';
        case 'upcoming': return 'text-blue-600 bg-blue-100';
        case 'ended': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    const getStatusText = () => {
      switch (countdown.status) {
        case 'active': return 'Active';
        case 'upcoming': return 'Upcoming';
        case 'ended': return 'Ended';
        default: return 'Unknown';
      }
    };

    if (countdown.status === 'ended') {
      return (
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            Deal Ended
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        
        <div className="flex gap-1 justify-center">
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg px-2 py-1 min-w-8">
              <span className="text-sm font-bold text-gray-800">{countdown.days}</span>
            </div>
            <span className="text-xs text-gray-500">Days</span>
          </div>
          <div className="text-gray-400 pt-1">:</div>
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg px-2 py-1 min-w-8">
              <span className="text-sm font-bold text-gray-800">{countdown.hours}</span>
            </div>
            <span className="text-xs text-gray-500">Hours</span>
          </div>
          <div className="text-gray-400 pt-1">:</div>
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg px-2 py-1 min-w-8">
              <span className="text-sm font-bold text-gray-800">{countdown.minutes}</span>
            </div>
            <span className="text-xs text-gray-500">Min</span>
          </div>
          <div className="text-gray-400 pt-1">:</div>
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg px-2 py-1 min-w-8">
              <span className="text-sm font-bold text-gray-800">{countdown.seconds}</span>
            </div>
            <span className="text-xs text-gray-500">Sec</span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate statistics from flash deals data
  const calculateStats = () => {
    if (!flashDeals?.results) return { total: 0, active: 0, totalSales: 0, totalStock: 0 };

    const total = flashDeals.results.length;
    const active = flashDeals.results.filter(deal => deal.is_active).length;
    const totalSales = flashDeals.results.reduce((sum, deal) => sum + parseFloat(deal.total_sales || 0), 0);
    const totalStock = flashDeals.results.reduce((sum, deal) => sum + (deal.available_stock || 0), 0);

    return { total, active, totalSales, totalStock };
  };

  const stats = calculateStats();

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
              <h1 className="text-3xl font-bold text-gray-900">Flash Deals</h1>
              <p className="text-gray-600">Manage your flash deals and timer settings</p>
            </div>
          </div>
          
          <button
            onClick={handleAddProduct}
            className="bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-yellow-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <FaPlus size={16} />
            Add New Flash Deal
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 mb-9 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FaFire className="text-orange-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <IoFlash className="text-green-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600">${stats.totalSales.toFixed(2)}</p>
              </div>
              <FaDollarSign className="text-blue-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Stock</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalStock}</p>
              </div>
              <FaBox className="text-purple-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
  {/* Products Grid */}
<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
  <div className="px-6 py-4 border-b border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800">Flash Deal Products</h2>
    <p className="text-gray-600 text-sm">
      {stats.active} active deals out of {stats.total}
    </p>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
            Product Info
          </th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
            Pricing
          </th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
            Timer Status
          </th>
 

          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
            Status
          </th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {flashDeals?.results?.map((deal) => (
          <tr key={deal.id} className="hover:bg-gray-50 transition-all duration-200 group">
            <td className="px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 relative">
                  <img
                    src={deal.upload_image || deal.product.images[0]?.image}
                    alt={deal.product.name}
                    className="h-14 w-14 rounded-xl object-cover border border-gray-200 shadow-sm"
                  />
                  {deal.is_active && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {deal.product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    SKU: {deal.product.sku}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ID: {deal.id}
                  </p>
                </div>
              </div>
            </td>
            
            <td className="px-6 py-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${deal.offer_price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${deal.product.old_price}
                  </span>
                </div>
                {deal.product.new_price !== deal.product.old_price && (
                  <div className="flex items-center space-x-1">
                    <FaPercent className="text-green-600 text-xs" />
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Save ${(deal.product.old_price - deal.product.new_price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </td>
            
            <td className="px-6 py-5">
              <div className="space-y-2">
                <CountdownTimer dealId={deal.id} />
                {/* <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <FaClock className="text-gray-400" />
                  <span>Ends: {new Date(deal.end_date).toLocaleDateString()}</span>
                </div> */}
              </div>
            </td>
            
         
            
            <td className="px-6 py-5">
              <button
                onClick={() => toggleProductStatus(deal.id, deal.is_active)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  deal.is_active
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 shadow-sm'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-sm'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  deal.is_active ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                {deal.is_active ? 'Active' : 'Inactive'}
              </button>
            </td>
            
            <td className="px-6 py-5">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEditProduct(deal)}
                  className="inline-flex items-center p-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 border border-blue-100 group-hover:border-blue-200"
                  title="Edit Deal"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={() => handleDeleteProduct(deal.id)}
                  className="inline-flex items-center p-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200 border border-red-100 group-hover:border-red-200"
                  title="Delete Deal"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    {!flashDeals?.results?.length && (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
          <IoFlash className="mx-auto text-gray-300 text-5xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Flash Deals Found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first flash deal campaign</p>
          <button
            onClick={handleAddProduct}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
          >
            <FaPlus className="inline mr-2" size={14} />
            Create First Flash Deal
          </button>
        </div>
      </div>
    )}
  </div>
</div>
      </div>

      {/* Product Form Modal */}
      <FlashDealModal
        editingProduct={editingProduct}
        isAddingNew={isAddingNew}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        onInputChange={handleInputChange}
      />
    </div>
  );
};

export default FlashDealsAdmin;