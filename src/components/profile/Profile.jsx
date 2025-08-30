import { useEffect, useRef, useState } from "react";
import Breadcrumb from "../others/Breadcrumb";
import { Card, Input, Button, Avatar, message } from "antd";
import { EditOutlined, PhoneOutlined } from "@ant-design/icons";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { FaEdit, FaPhoneAlt } from "react-icons/fa";
import ProfileModal from "./ProfileModal/ProfileModal";
import { useCustomerProfileUpdateMutation, useGetProfileQuery } from "../../redux/slices/Apis/customersApi";

const { Search } = Input;

const SectionHeader = ({ title, icon, color }) => (
  <div className="flex justify-between items-start mb-4">
    <div
      className={`flex items-center gap-2 text-[16px] font-semibold ${
        color || "text-gray-800"
      }`}
    >
      {icon && icon}
      {title}
    </div>
    <EditOutlined className="text-gray-500 cursor-pointer hover:text-[#CBA135]" />
  </div>
);

const Profile = () => {
  const [phoneValue, setPhoneValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [customerProfileUpdate] = useCustomerProfileUpdateMutation()

  const { data: profileData, error, isLoading, refetch } = useGetProfileQuery();
  
  const fileInputRef = useRef(null);

  const handleEditClick = (section) => {
    setActiveSection(section);
    setIsModalOpen(true);
  };

  const updateProfileData = async (updateData) => {
    setIsUpdating(true);
    try {
      await customerProfileUpdate(updateData).unwrap();
      message.success('Profile updated successfully');
      refetch();
    } catch (err) {
      console.error("Error updating profile:", err);
      message.error(err.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type and size
  if (!file.type.startsWith('image/')) {
    message.error('Please upload an image file');
    return;
  }
  if (file.size > 2 * 1024 * 1024) { // 2MB limit
    message.error('Image size should be less than 2MB');
    return;
  }

  try {
    setIsUpdating(true);

    // Prepare FormData
    const formData = new FormData();
    formData.append('profile_image', file);

    // Send file using your mutation
    await customerProfileUpdate(formData).unwrap();

    message.success('Profile image updated successfully');
    refetch();
  } catch (err) {
    console.error("Error uploading photo:", err);
    message.error(err.data?.message || 'Failed to update profile image');
  } finally {
    setIsUpdating(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }
};

  const handleAddPhone = async () => {
    if (!phoneValue) {
      message.warning('Please enter a phone number');
      return;
    }
    await updateProfileData({ phone_number: phoneValue });
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile</div>;

  const formatDate = (dateString) => {
    if (!dateString) return "not provided yet";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-[#FAF8F2] min-h-screen pb-8 px-4">
      <div className="mx-40">
        <Breadcrumb />

        {/* Header */}
        <div className="mb-8 pt-4">
          <h1 className="text-[30px] popbold font-bold">My Profile</h1>
          <p className="text-[16px] mt-2 popreg text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="flex flex-wrap gap-6">
          {/* Profile Photo */}
          <div className="bg-white p-6 rounded-xl shadow-sm w-full md:w-[280px] h-56 flex flex-col items-center text-center">
            <h3 className="text-[18px] popbold mb-4">Profile Photo</h3>
            <Avatar 
              size={100} 
              src={profileData?.profile_image || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1170&auto=format&fit=crop"}
            />
            <label className="text-[#CBA135] popmed mt-3 cursor-pointer">
              {isUpdating ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={isUpdating}
                ref={fileInputRef}
              />
            </label>
          </div>

          {/* Profile Details */}
          <div className="flex-1 space-y-5 w-full">
            {/* Personal Info */}
            <Card className="rounded-xl max-w-lg relative shadow-sm border">
              <h3 className="popbold text-[18px] py-5">Personal Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <p className="popmed text-[#666666]">Full Name</p>
                  <p className="popbold">
                    {profileData?.first_name || profileData?.last_name 
                      ? `${profileData.first_name} ${profileData.last_name}`.trim()
                      : "not provided yet"}
                  </p>
                </div>
                <div>
                  <p className="popmed text-[#666666]">Date of Birth</p>
                  <p className="popreg">{formatDate(profileData?.date_of_birth)}</p>
                </div>
                <div>
                  <p className="popmed text-[#666666]">Gender</p>
                  <p className="popreg">{profileData?.gender || "not provided yet"}</p>
                </div>
                <div>
                  <p className="popmed text-[#666666]">National ID</p>
                  <p className="popreg">{profileData?.national_id || "not provided yet"}</p>
                </div>
              </div>
              <FaEdit
                size={16}
                onClick={() => handleEditClick("personal")}
                className="absolute text-[#CBA135] top-3 right-3 cursor-pointer"
              />
            </Card>

            {/* Contact Info */}
            <Card className="rounded-xl max-w-lg shadow-sm border">
              <h3 className="popbold text-[18px] py-5">Contact Information</h3>
              <div className="space-y-6 text-sm text-gray-700">
                <div className="flex gap-28">
                  <div>
                    <p className="popmed text-[#666666]">Phone Number</p>
                    <p className="popreg">{profileData?.phone_number || "not provided yet"}</p>
                  </div>
                  <div>
                    <p className="popmed text-[#666666]">Email Address</p>
                    <p className="popreg">{profileData?.email}</p>
                  </div>
                </div>
                <div>
                  <p className="popmed text-[#666666]">
                    Another Number / WhatsApp Num (if any)
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 mt-4">
                    <PhoneInput
                      className="w-full sm:w-[250px] h-8 rounded-md px-4 border border-gray-300 focus:ring-0 focus:border-[#E5E7EB] transition-all"
                      placeholder="Enter phone number"
                      value={phoneValue}
                      onChange={setPhoneValue}
                      disabled={isUpdating}
                    />
                    <Button
                      type="primary"
                      className="bg-[#CBA135] hover:bg-[#b8962e] text-white rounded-md shadow-sm transition-all"
                      onClick={handleAddPhone}
                      loading={isUpdating}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Address */}
            <Card className="rounded-xl max-w-lg relative shadow-sm border">
              <h3 className="popbold text-[18px] py-5">Address</h3>
              <div className="text-sm text-gray-700 popreg space-y-1">
                <p>{profileData?.address || "not provided yet"}</p>
              </div>
              <FaEdit
                size={16}
                onClick={() => handleEditClick("address")}
                className="absolute text-[#CBA135] top-3 right-3 cursor-pointer"
              />
            </Card>

            {/* Emergency Contact */}
            <Card className="rounded-xl max-w-lg shadow-sm relative border">
              <h3 className="popbold text-[18px] flex items-center gap-3 py-5">
                Emergency Contact <FaPhoneAlt className="text-red-600" />
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <p className="popmed text-[#666666]">Contact Name</p>
                  <p className="popreg">{profileData?.emergency_contact || "not provided yet"}</p>
                </div>
                <div className="col-span-2">
                  <p className="popmed text-[#666666]">Phone Number</p>
                  <p className="popreg">{profileData?.emergency_contact || "not provided yet"}</p>
                </div>
              </div>
              <FaEdit
                size={16}
                onClick={() => handleEditClick("emergency")}
                className="absolute text-[#CBA135] top-3 right-3 cursor-pointer"
              />
            </Card>
          </div>
        </div>
      </div>
      <ProfileModal
        activeSection={activeSection}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        profileData={profileData}
        updateProfileData={updateProfileData}
      />
    </div>
  );
};

export default Profile;