import { Button, DatePicker, Select, Steps, message } from 'antd';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CgProfile } from 'react-icons/cg';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaCar, FaCloudUploadAlt } from 'react-icons/fa';
import { FaHandshakeSimple } from 'react-icons/fa6';
import { FiChevronDown } from 'react-icons/fi';
import { usePostSellerMutation } from '../../../../redux/slices/apiSlice';
import { useNavigate } from 'react-router-dom';
import { useAdminVendorCreateMutation, useGetAllSellerApplicationQuery } from '../../../../redux/slices/Apis/dashboardApis';
import { useGetProfileQuery } from '../../../../redux/slices/Apis/customersApi';

const { Option } = Select;
const MySwal = withReactContent(Swal);


const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <p className='p-2 rounded-full bg-[#CBA135]'>{icon}</p>
    <div>
      <p className="text-[20px] font-bold">{title}</p>
      <p className="text-[14px] text-gray-600">{subtitle}</p>
    </div>
  </div>
);

const FileUploader = ({ title, name, onChange, multiple = false, value }) => {
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileChange = useCallback((e) => {
    const files = multiple ? Array.from(e.target.files) : e.target.files[0];
    

    if (files) {
      if (multiple) {
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
      } else {
        setPreviewUrls([URL.createObjectURL(files)]);
      }
    }
    
    onChange(name, files);
  }, [name, multiple, onChange]);

  const clearFileInput = useCallback(() => {
    const input = document.getElementById(name);
    if (input) input.value = '';
    setPreviewUrls([]);
    onChange(name, multiple ? [] : null);
  }, [name, multiple, onChange]);

  return (
    <div className="space-y-3 mt-7">
      <h2 className="popbold text-[18px] text-gray-800">{title}</h2>
      <div className="bg-[#EAE7E1] rounded-xl border border-dashed border-gray-400 p-6 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-all">
        <FaCloudUploadAlt className="text-4xl text-[#CBA135]" />
        <p className="popmed text-[16px] text-gray-700">Drag & drop images here</p>
        <p className="popreg text-[14px] text-gray-600 text-center">
          or click to browse {multiple ? '(Min 1, Max 6 images)' : ''}
        </p>
        <input
          type="file"
          id={name}
          className="hidden"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
        />
        

        {previewUrls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 mt-3">
          <label
            htmlFor={name}
            className="bg-[#CBA135] hover:bg-[#b8962e] text-white px-6 py-2 rounded-md shadow-sm transition-all cursor-pointer"
          >
            {previewUrls.length > 0 ? 'Change Files' : 'Browse Files'}
          </label>
          
          {previewUrls.length > 0 && (
            <button
              type="button"
              onClick={clearFileInput}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md shadow-sm transition-all cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SellerReg = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { data: applicants, isLoading, refetch } = useGetAllSellerApplicationQuery();
    const { data: profileData, error } = useGetProfileQuery();
  const [postSeller] = usePostSellerMutation();
  const [adminVendorCreate] = useAdminVendorCreateMutation();
  const navigate = useNavigate();
  const storedRole = localStorage.getItem('user_role');
  const isAdmin = storedRole === 'admin';

  const [formData, setFormData] = useState({
   
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',

   
    businessName: '',
    businessAddress: '',
    country: '',
    city: '',
    state: '',
    postalCode: '',
    date: '',
    businessType: '',
    taxpayerNumber: '',
    tradeRegisterNumber: '',

   
    frontId: null,
    backId: null,
    businessOwner: null,
    homeLocalizationPlan: '',
    businessLocalizationPlan: '',
    taxFile: null,
    tradeFile: null,
    
 
    captcha: ''
  });

  const steps = useMemo(() => [
    {
      title: 'Contact Info',
      content: <ContactInfoStep formData={formData} setFormData={setFormData} isAdmin={isAdmin} />,
    },
    {
      title: 'Business Info',
      content: <BusinessInfoStep formData={formData} setFormData={setFormData} isAdmin={isAdmin} />,
    },
    {
      title: 'Verify',
      content: <VerifyInfoStep formData={formData} setFormData={setFormData} isAdmin={isAdmin} />,
    },
  ], [formData, isAdmin]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, formData]);

  const prevStep = useCallback(() => {
    setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const validateStep = useCallback((step) => {
    switch (step) {
      case 0:
        if (!formData.firstName || !formData.lastName || !formData.jobTitle || !formData.phone) {
          message.error('Please fill all required fields in Contact Information');
          return false;
        }
        
        if (isAdmin && !formData.email) {
          message.error('Vendor Email is required for admin');
          return false;
        }
      
        if (!isAdmin && !formData.email) {
          message.error('Email is required');
          return false;
        }
        return true;
      case 1: 
        if (!formData.businessName || !formData.businessAddress || !formData.country || 
            !formData.city || !formData.state || !formData.postalCode || !formData.date || 
            !formData.businessType || !formData.taxpayerNumber || !formData.tradeRegisterNumber) {
          message.error('Please fill all required fields in Business Information');
          return false;
        }
        return true;
      case 2: // Verify
        if (!formData.frontId || !formData.backId || !formData.businessOwner || 
            !formData.homeLocalizationPlan || !formData.businessLocalizationPlan || 
            !formData.taxFile || !formData.tradeFile) {
          message.error('Please fill all required fields in Verification');
          return false;
        }
        return true;
      default:
        return true;
    }
  }, [formData, isAdmin]);

  const handleApply = useCallback(async () => {
    try {
 
      MySwal.fire({
        title: 'Uploading...',
        text: 'Please wait while your application is being submitted',
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading();
        }
      });

      if (isAdmin) {
      
        const formPayload = new FormData();
        
     
        formPayload.append("email", formData.email );
        formPayload.append("first_name", formData.firstName);
        formPayload.append("last_name", formData.lastName);
        formPayload.append("job_title", formData.jobTitle);
        formPayload.append("phone_number", formData.phone);
        formPayload.append("legal_business_name", formData.businessName);
        formPayload.append("business_address", formData.businessAddress);
        formPayload.append("country", formData.country);
        formPayload.append("city_town", formData.city);
        formPayload.append("state_province", formData.state);
        formPayload.append("postal_code", formData.postalCode);
        formPayload.append("established_date", formData.date);
        formPayload.append("business_type", formData.businessType);
        formPayload.append("taxpayer_number", formData.taxpayerNumber);
        formPayload.append("trade_register_number", formData.tradeRegisterNumber);
        formPayload.append("status", "approved");
        formPayload.append("home_localization_plan", formData.homeLocalizationPlan);
        formPayload.append("business_localization_plan", formData.businessLocalizationPlan);

        if (formData.frontId) formPayload.append("nid_front", formData.frontId);
        if (formData.backId) formPayload.append("nid_back", formData.backId);
        if (formData.businessOwner) formPayload.append("business_owner", formData.businessOwner);
        if (formData.taxFile) formPayload.append("taxpayer_doc", formData.taxFile);
        if (formData.tradeFile) formPayload.append("trade_register_doc", formData.tradeFile);

        await adminVendorCreate(formPayload).unwrap();

        MySwal.close();

        MySwal.fire({
          icon: 'success',
          title: 'Vendor Created Successfully!',
          text: 'The vendor has been created and approved automatically.',
          confirmButtonColor: '#CBA135'
        });

      } else {
     
        const formPayload = new FormData();
     
        formPayload.append("first_name", formData.firstName);
        formPayload.append("last_name", formData.lastName);
        formPayload.append("email", formData.email);
        formPayload.append("job_title", formData.jobTitle);
        formPayload.append("phone_number", formData.phone);
        formPayload.append("legal_business_name", formData.businessName);
        formPayload.append("business_address", formData.businessAddress);
        formPayload.append("country", formData.country);
        formPayload.append("city_town", formData.city);
        formPayload.append("state_province", formData.state);
        formPayload.append("postal_code", formData.postalCode);
        formPayload.append("established_date", formData.date);
        formPayload.append("business_type", formData.businessType);
        formPayload.append("taxpayer_number", formData.taxpayerNumber);
        formPayload.append("trade_register_number", formData.tradeRegisterNumber);
        formPayload.append("status", "pending");
        formPayload.append("home_localization_plan", formData.homeLocalizationPlan);
        formPayload.append("business_localization_plan", formData.businessLocalizationPlan);
        formPayload.append("user", 9);

        if (formData.frontId) formPayload.append("nid_front", formData.frontId);
        if (formData.backId) formPayload.append("nid_back", formData.backId);
        if (formData.businessOwner) formPayload.append("business_owner", formData.businessOwner);
        if (formData.taxFile) formPayload.append("taxpayer_doc", formData.taxFile);
        if (formData.tradeFile) formPayload.append("trade_register_doc", formData.tradeFile);

        await postSeller(formPayload).unwrap();

        MySwal.close();

        MySwal.fire({
          icon: 'success',
          title: 'Application Submitted!',
          text: 'Please wait, Admin is reviewing your application.',
          confirmButtonColor: '#CBA135'
        });
      }


      setFormData({
        firstName: '',
        lastName: '',
        jobTitle: '',
        email: '',
        phone: '',
        businessName: '',
        businessAddress: '',
        country: '',
        city: '',
        state: '',
        postalCode: '',
        date: '',
        businessType: '',
        taxpayerNumber: '',
        tradeRegisterNumber: '',
        frontId: null,
        backId: null,
        businessOwner: null,
        homeLocalizationPlan: '',
        businessLocalizationPlan: '',
        taxFile: null,
        tradeFile: null,
        captcha: ''
      });
      
      refetch();
     if(isAdmin){
       navigate('/admin-dashboard/vendors');
     }
     else{
       navigate('/');
     }

    } catch (error) {
      console.error(error);
      MySwal.close();

      MySwal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#CBA135'
      });
    }
  }, [formData, postSeller, adminVendorCreate, navigate, isAdmin, refetch]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAF8F2] px-4 md:px-20 py-20 pb-28">
      {isAdmin && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">Admin Mode:</span>
              <span className="text-blue-700">Creating vendor directly</span>
            </div>
          </div>
        </div>
      )}
    
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="flex justify-center text-[#CBA135] mb-3">
          <FaHandshakeSimple size={48} />
        </div>
        <h2 className="text-[32px] md:text-[48px] popbold mb-3">
          {isAdmin ? '🛍️ Create Vendor Account' : '🛍️ Partner with WIROKO'}
        </h2>
        <p className="text-[18px] md:text-[20px] text-gray-700">
          {isAdmin 
            ? 'Create a new vendor account directly in the system'
            : 'Join our curated network of premium furniture vendors and reach customers worldwide'
          }
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <Steps current={currentStep}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        {steps[currentStep].content}
      </div>

      <div className="flex justify-between max-w-3xl mx-auto mt-6">
        {currentStep > 0 && (
          <Button onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 py-4 px-8">
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} className="bg-[#CBA135] hover:bg-[#b8962e] text-white py-4 px-8 ml-auto">
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleApply}
            className="bg-[#CBA135] hover:bg-[#b8962e] text-white py-4 px-8 ml-auto"
          >
            {isAdmin ? 'Create Vendor' : 'Apply Now'}
          </Button>
        )}
      </div>
    </div>
  );
};

const ContactInfoStep = ({ formData, setFormData, isAdmin }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleSelect = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  return (
    <>
      <SectionHeader
        icon={<CgProfile size={20} className="text-white" />}
        title="Contact Information"
        subtitle="Tell us how to reach you"
      />

      {/* Admin Only - Vendor Email Field */}
      {isAdmin && (
        <div className='mt-2 mb-4'>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Vendor Email *</label>
          <input 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter vendor email address" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
          <p className="text-xs text-gray-500 mt-1">This email will be used for vendor account creation</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* First Name - For both admin and regular users */}
        <div className='mt-2'>
          <label className="block mb-1 popbold text-[14px] text-gray-700">First Name *</label>
          <input 
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter First Name" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>

        {/* Last Name - For both admin and regular users */}
        <div className='mt-2'>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Last Name *</label>
          <input 
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter Last Name" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>

        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Job Title *</label>
          <Select
            placeholder="Select Your Role"
            className="w-full h-[44px]"
            suffixIcon={<FiChevronDown className="text-gray-500" />}
            onChange={(value) => handleSelect('jobTitle', value)}
            value={formData.jobTitle || "Select One"} 
          >
            <Option value="owner">Owner</Option>
            <Option value="manager">Manager</Option>
            <Option value="designer">Designer</Option>
          </Select>
        </div>

        {/* Email - For regular users only (admin has separate vendor email field) */}
        {!isAdmin && (
          <div className='mt-2'>
            <label className="block mb-1 popbold text-[14px] text-gray-700">Email Address *</label>
            <input 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email Address" 
              className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
            />
          </div>
        )}
      </div>
      
      <div className='mt-2'>
        <label className="block mb-1 popbold text-[14px] text-gray-700">Phone Number *</label>
        <input 
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter Phone Number" 
          className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
        />
      </div>
    </>
  );
};

const BusinessInfoStep = ({ formData, setFormData, isAdmin }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleSelect = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleDate = useCallback((date, dateString) => {
    setFormData(prev => ({ ...prev, date: dateString }));
  }, [setFormData]);

  return (
    <>
      <SectionHeader
        icon={<CgProfile size={20} className="text-white" />}
        title="Business Information"
        subtitle="Details about your company"
      />

      <div className='mt-2'>
        <label className="block mb-1 popbold text-[14px] text-gray-700">Legal Business Name *</label>
        <input 
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          placeholder="Enter Business Name" 
          className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
        />
      </div>

      <div className='mt-2'>
        <label className="block mb-1 popbold text-[14px] text-gray-700">Business Address *</label>
        <input 
          name="businessAddress"
          value={formData.businessAddress}
          onChange={handleChange}
          placeholder="Enter Business Address" 
          className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
        />
      </div>
      
      <div className="grid md:grid-cols-2 mt-3 gap-4">
        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Country *</label>
          <input 
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter Country Name" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>
        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">City/Town *</label>
          <input 
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter City/Town Name" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>
        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">State/Province *</label>
          <input 
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter State/Province" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>
        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Postal Code *</label>
          <input 
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Enter Postal Code" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 mt-3 gap-4">
        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Year*</label>
          <DatePicker
            className="w-full h-[44px] border border-[#D1D5DB] rounded-md px-4 py-2 text-gray-700"
            placeholder="Enter Date"
            style={{ width: '100%' }}
            popupClassName="custom-datepicker-popup"
            onChange={handleDate}
          />
        </div>
        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Business Type *</label>
          <input 
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            placeholder="Enter Business Type" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>
        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Tax payer Number*</label>
          <input 
            name="taxpayerNumber"
            value={formData.taxpayerNumber}
            onChange={handleChange}
            placeholder="Enter Taxpayer Number" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>
        <div>
          <label className="block mb-1 popbold text-[14px] text-gray-700">Trade register number*</label>
          <input 
            name="tradeRegisterNumber"
            value={formData.tradeRegisterNumber}
            onChange={handleChange}
            placeholder="Enter register number" 
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]" 
          />
        </div>
      </div>
    </>
  );
};

const VerifyInfoStep = ({ formData, setFormData, isAdmin }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [setFormData]);

  const handleFileChange = useCallback((name, files) => {
    setFormData(prev => ({ ...prev, [name]: files }));
  }, [setFormData]);

  return (
    <>
      <div className='flex items-center gap-3'>
        <p className='bg-[#CBA135] h-10 w-10 rounded-full flex justify-center items-center text-white'>
          <FaCar />
        </p>
        <div>
          <h3 className='popbold text-[24px]'>Verify Information</h3>
          <h4 className='text-sm popreg'>Your shipping and fulfillment capabilities</h4>
        </div>
      </div>

      <FileUploader 
        title="Front of National ID"
        name="frontId"
        onChange={handleFileChange}
        multiple={false}
        value={formData.frontId}
      />

      <FileUploader 
        title="Back of national ID"
        name="backId"
        onChange={handleFileChange}
        multiple={false}
        value={formData.backId}
      />

      <FileUploader 
        title="Business owner"
        name="businessOwner"
        onChange={handleFileChange}
        multiple={false}
        value={formData.businessOwner}
      />

      <div className="flex flex-col sm:flex-row mt-6 gap-4">
        <div className="flex-1 mt-2">
          <label className="block mb-1 popbold text-[14px] text-gray-700">
            Home localization plan *
          </label>
          <input
            name="homeLocalizationPlan"
            value={formData.homeLocalizationPlan}
            onChange={handleChange}
            placeholder="Enter Home localization plan"
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]"
          />
        </div>

        <div className="flex-1 mt-2">
          <label className="block mb-1 popbold text-[14px] text-gray-700">
            Business Localization plan *
          </label>
          <input
            name="businessLocalizationPlan"
            value={formData.businessLocalizationPlan}
            onChange={handleChange}
            placeholder="Enter Business Localization plan "
            className="w-full border border-[#D1D5DB] rounded-md px-4 py-2 placeholder:pl-1 focus:outline-none focus:ring-0 focus:border-[#D1D5DB]"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row mt-6 gap-4">
        <div className="flex-1">
          <FileUploader 
            title="Taxpayer Document"
            name="taxFile"
            onChange={handleFileChange}
            multiple={false}
            value={formData.taxFile}
          />
        </div>

        <div className="flex-1">
          <FileUploader 
            title="Trade Register Document"
            name="tradeFile"
            onChange={handleFileChange}
            multiple={false}
            value={formData.tradeFile}
          />
        </div>
      </div>
    </>
  );
};

export default SellerReg;