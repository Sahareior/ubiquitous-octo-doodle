import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import { FaCloudUploadAlt, FaTrashAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useBannerUploadMutation, useDeleteBannerMutation, useGetAllBannersQuery } from '../../../../redux/slices/Apis/dashboardApis';
import { Link } from 'react-router-dom';

const Content = () => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bannerUpload] = useBannerUploadMutation()
  const {data: bannaers, refetch} = useGetAllBannersQuery()
  const [deleteBanner] = useDeleteBannerMutation()

  console.log(bannaers,'this is banners')

  const [activeBanners, setActiveBanners] = useState([
    {
      id: 1,
      title: "Summer Sale Banner",
      endDate: "2024-08-31",
      image: "https://311796b16064.ngrok-free.app/media/uploads/common/2676eeb5-b053-4318-a16f-68f97cb898d5.png"
    }
  ]);

  // Initialize form with dbData
  const formik = useFormik({
    initialValues: {
      bannerTitle: "Just Check",
      subheading: "Just Check",
      ctaLink: "http://10.10.13.16:2500/api/admin/banners/",
      startDate: "",
      endDate: "",
      showBanner: false,
      image: null // This will store the File object
    },
    
onSubmit: async (values) => {
  const formData = new FormData();

  formData.append("id", 1);
  formData.append("title", values.bannerTitle);
  formData.append("subtitle", values.subheading);
  formData.append("link", values.ctaLink);
  formData.append("startDate", values.startDate);
  formData.append("endDate", values.endDate);
  formData.append("is_active", values.showBanner);
  formData.append("position", 1);
  formData.append("alt_text", "Nothing");
  formData.append("created_at", new Date().toISOString());
  formData.append("updated_at", new Date().toISOString());

  // ✅ attach real file
  if (values.image instanceof File) {
    formData.append("image", values.image);
  }

  console.log("📌 Sending FormData:", [...formData]);

  // 🚀 send as multipart/form-data
  const res = await bannerUpload(formData);

  console.log(res);

  if (values.showBanner) {
    setActiveBanners([...activeBanners, {
      id: Date.now(),
      title: values.bannerTitle,
      endDate: values.endDate,
      image: previewUrl
    }]);
  }
}


  });




  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Update formik value with the File object
      formik.setFieldValue('image', file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please drop an image file');
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      formik.setFieldValue('image', file);
      e.dataTransfer.clearData();
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Remove image
  const removeImage = () => {
    setPreviewUrl(null);
    formik.setFieldValue('image', null);
  };

  // Remove banner
  const removeBanner = (id) => {
    setActiveBanners(activeBanners.filter(banner => banner.id !== id));
  };

  const handleDelete= async (id)=>{
    console.log(id)
    const res = await deleteBanner(id)
    refetch()
  }

  return (
    <div className="p-6 bg-[#fefcf7] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-[20px] font-bold">Homepage Banner Manager</h2>
        <button 
          type="button"
          onClick={formik.handleSubmit}
          className="bg-[#CBA135] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaSave /> Save Changes
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow space-y-4">
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed bg-[#CBA1351A] border-yellow-400 rounded-lg p-12 text-center text-sm text-gray-600 cursor-pointer"
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="mx-auto max-h-48 object-contain rounded-md"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ) : (
              <>
                <FaCloudUploadAlt size={32} className="mx-auto text-yellow-500" />
                <p className="mt-2">
                  Drag & drop banner image or{" "}
                  <span className="text-yellow-500 cursor-pointer">browse files</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 1920x600px, JPG/PNG
                </p>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div>
            <h5 className="text-[16px] font-medium py-1">Banner Title</h5>
            <input
              type="text"
              name="bannerTitle"
              placeholder="Enter banner title"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formik.values.bannerTitle}
              onChange={formik.handleChange}
            />
          </div>
          
          <div>
            <h5 className="text-[16px] font-medium py-1">Subheading (Optional)</h5>
            <input
              type="text"
              name="subheading"
              placeholder="Enter subheading"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formik.values.subheading}
              onChange={formik.handleChange}
            />
          </div>
          
          <div>
            <h5 className="text-[16px] font-medium py-1">CTA Link/URL</h5>
            <input
              type="text"
              name="ctaLink"
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={formik.values.ctaLink}
              onChange={formik.handleChange}
            />
          </div>

          {/* Date Pickers */}
          <div className="flex gap-4">
            <div className="w-full">
              <h5 className="text-[16px] font-medium py-1">Start Date</h5>
              <input
                type="date"
                name="startDate"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formik.values.startDate}
                onChange={formik.handleChange}
              />
            </div>
            <div className="w-full">
              <h5 className="text-[16px] font-medium py-1">End Date</h5>
              <input
                type="date"
                name="endDate"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={formik.values.endDate}
                onChange={formik.handleChange}
              />
            </div>
          </div>

          {/* Show Banner + Button */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[16px]">
              <input
                type="checkbox"
                name="showBanner"
                checked={formik.values.showBanner}
                onChange={formik.handleChange}
              />
              Show Banner
            </label>
            <button 
              type="button"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              + Add Banner
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-sm font-semibold mb-3">Preview</h3>
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Banner preview" 
                  className="w-full h-48 object-cover rounded-md"
                />
                <div className="mt-2">
                  <h4 className="font-medium">{formik.values.bannerTitle || "Banner Title"}</h4>
                  <p className="text-sm text-gray-600">{formik.values.subheading || "Subheading text"}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-300 h-48 rounded flex flex-col items-center justify-center">
                <FaCloudUploadAlt className="text-gray-500 text-2xl" />
                <p className="text-gray-500 mt-2">No image uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Banners */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-sm font-semibold mb-2">Active Banners</h3>
        
        {bannaers?.results?.length > 0 ? (
          bannaers?.results?.map(banner => (
            <div key={banner.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-md mb-2">
              <div className="flex items-center">
                <img 
                  src={banner.image} 
                  alt="Banner" 
                  className="w-16 h-12 object-cover rounded mr-4"
                />
                <div>
                  <p className="font-medium">{banner.title}</p>
                  <p className="text-sm text-gray-500">Active until {banner.endDate}</p>
                </div>
              </div>
              <div className="flex gap-3 text-gray-600">
                <Link to="/admin-dashboard/edit-banner" >
                <FaEdit className="cursor-pointer text-[#CBA135] hover:text-blue-500" />
                
                </Link>
                <FaTrashAlt 
                  size={16} 
                  className="cursor-pointer text-[#EF4444] hover:text-red-500" 
                  onClick={() => handleDelete(banner.id)}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-4 text-gray-500">No active banners</p>
        )}
      </div>
    </div>
  );
};

export default Content;