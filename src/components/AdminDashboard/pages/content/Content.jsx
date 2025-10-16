import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import { FaCloudUploadAlt, FaTrashAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useBannerUploadMutation, useDeleteBannerMutation, useGetAllBannersQuery, useUpdateBannerMutation } from '../../../../redux/slices/Apis/dashboardApis';
import Swal from 'sweetalert2';
import imageCompression from 'browser-image-compression';

const Content = () => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bannerUpload] = useBannerUploadMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const { data: banners, refetch } = useGetAllBannersQuery();
  const [deleteBanner] = useDeleteBannerMutation();
  const [editingBanner, setEditingBanner] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // New state for compression loading

  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  const formik = useFormik({
    initialValues: {
      bannerTitle: "",
      subheading: "",
      ctaLink: "",
      startDate: "",
      endDate: "",
      showBanner: false,
      image: null
    },
    onSubmit: async (values) => {
      const formData = new FormData();

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

      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      try {
        let res;
        if (editingBanner) {
          res = await updateBanner({ id: editingBanner.id, data: formData });
        } else {
          res = await bannerUpload(formData);
        }

        if (res.data) {
          Swal.fire({
            icon: "success",
            title: editingBanner ? "Banner Updated!" : "Banner Uploaded!",
            text: editingBanner 
              ? "Your banner has been updated successfully." 
              : "Your banner has been uploaded successfully.",
            timer: 2000,
            showConfirmButton: false,
          });

          resetForm();
          refetch();
        } else {
          Swal.fire({
            icon: "error",
            title: "Operation Failed",
            text: res.error?.data?.message || "Something went wrong!",
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Could not complete the operation. Please try again later.",
        });
      }
    }
  });

  const resetForm = () => {
    formik.resetForm();
    setPreviewUrl(null);
    setEditingBanner(null);
    setIsEditing(false);
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setIsEditing(true);

    formik.setValues({
      bannerTitle: banner.title || "",
      subheading: banner.subtitle || "",
      ctaLink: banner.link || "",
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
      showBanner: banner.is_active || false,
      image: null
    });

    setPreviewUrl(banner.image || null);
  };

  const handleCancelEdit = () => resetForm();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setIsCompressing(true); // Start loading
      
      // Compress the image
      const compressedFile = await imageCompression(file, {
        ...compressionOptions,
        fileType: file.type, // Use original file type
      });

      // Create a new File object with original name
      const finalFile = new File(
        [compressedFile], 
        file.name, // Keep original filename
        { type: file.type } // Keep original type
      );

      const objectUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(objectUrl);
      formik.setFieldValue('image', finalFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Failed to compress image. Please try again.');
    } finally {
      setIsCompressing(false); // End loading
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert('Please drop an image file');
        return;
      }

      try {
        setIsCompressing(true); // Start loading
        
        // Compress the dropped image
        const compressedFile = await imageCompression(file, {
          ...compressionOptions,
          fileType: file.type,
        });

        // Create a new File object with original name
        const finalFile = new File(
          [compressedFile], 
          file.name,
          { type: file.type }
        );

        const objectUrl = URL.createObjectURL(compressedFile);
        setPreviewUrl(objectUrl);
        formik.setFieldValue('image', finalFile);
        e.dataTransfer.clearData();
      } catch (error) {
        console.error('Error compressing dropped image:', error);
        alert('Failed to compress image. Please try again.');
      } finally {
        setIsCompressing(false); // End loading
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = () => {
    setPreviewUrl(null);
    formik.setFieldValue('image', null);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteBanner(id).unwrap(); // unwrap throws if error
        Swal.fire('Deleted!', 'Your banner has been deleted.', 'success');
        refetch();
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire('Error!', 'Failed to delete banner.', 'error');
      }
    }
  };

  const handleUploadClick = () => {
    if (!isCompressing) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-6 bg-[#fefcf7] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-[20px] font-bold">Homepage Banner Manager</h2>
        <div className="flex gap-2">
          {isEditing && (
            <button 
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
          )}
          <button 
            type="button"
            onClick={formik.handleSubmit}
            className="bg-[#CBA135] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaSave /> {isEditing ? 'Update Banner' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow space-y-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? 'Edit Banner' : 'Add New Banner'}
          </h3>
          
          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed bg-[#CBA1351A] rounded-lg p-12 text-center text-sm text-gray-600 cursor-pointer transition-all ${
              isCompressing 
                ? 'border-blue-500 bg-blue-50' 
                : previewUrl 
                  ? 'border-green-500' 
                  : 'border-yellow-400 hover:border-yellow-500'
            } ${isCompressing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            onClick={handleUploadClick}
            onDrop={isCompressing ? undefined : handleDrop}
            onDragOver={isCompressing ? undefined : handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
              disabled={isCompressing}
            />
            
            {isCompressing ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-blue-600 font-medium">Compressing image...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait</p>
              </div>
            ) : previewUrl ? (
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
              disabled={isCompressing}
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
              disabled={isCompressing}
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
              disabled={isCompressing}
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
                disabled={isCompressing}
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
                disabled={isCompressing}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-sm font-semibold mb-3">Preview</h3>
          <div className="space-y-4">
            {isCompressing ? (
              <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-md">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-blue-600 text-sm">Compressing image...</p>
              </div>
            ) : previewUrl ? (
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
        
        {banners?.results?.length > 0 ? (
          banners.results.map(banner => (
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
                <FaEdit 
                  size={16}
                  className="cursor-pointer text-[#CBA135] hover:text-blue-500" 
                  onClick={() => !isCompressing && handleEditBanner(banner)}
                  style={{ opacity: isCompressing ? 0.5 : 1 }}
                />
                <FaTrashAlt 
                  size={16} 
                  className="cursor-pointer text-[#EF4444] hover:text-red-500" 
                  onClick={() => !isCompressing && handleDelete(banner.id)}
                  style={{ opacity: isCompressing ? 0.5 : 1 }}
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