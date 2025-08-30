import React, { useEffect } from 'react';
import { Modal, Form, Button, Input, Divider, Select } from "antd";

const ProfileModal = ({ activeSection, isModalOpen, setIsModalOpen, profileData, updateProfileData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (profileData && activeSection) {
      if (activeSection === "personal") {
        form.setFieldsValue({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          date_of_birth: profileData.date_of_birth,
          gender: profileData.gender,
          national_id: profileData.national_id
        });
      } else if (activeSection === "address") {
        form.setFieldsValue({
          address: profileData.address
        });
      } else if (activeSection === "emergency") {
        form.setFieldsValue({
          emergency_contact: profileData.emergency_contact
        });
      }
    }
  }, [profileData, activeSection, form]);

  const getTitle = () => {
    switch (activeSection) {
      case "personal":
        return "Edit Personal Information";
      case "address":
        return "Edit Address";
      case "emergency":
        return "Edit Emergency Contact";
      default:
        return "Edit Details";
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updateProfileData(values);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={<h2 className="text-lg p-5 font-semibold text-[#333]">{getTitle()}</h2>}
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      footer={null}
      className="rounded-xl"
      bodyStyle={{ padding: '4px 6px' }}
    >
      <Form layout="vertical" className="space-y-4 p-6 text-black" form={form}>
        {activeSection === "personal" && (
          <>
            <Divider orientation="left">Basic Info</Divider>
            <Form.Item label="First Name" name="first_name">
              <Input placeholder="Enter first name" />
            </Form.Item>
            <Form.Item label="Last Name" name="last_name">
              <Input placeholder="Enter last name" />
            </Form.Item>
            <Form.Item label="Date of Birth" name="date_of_birth">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="Gender" name="gender">
              <Select placeholder="Select gender">
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="National ID" name="national_id">
              <Input placeholder="Enter National ID" />
            </Form.Item>
          </>
        )}

        {activeSection === "address" && (
          <>
            <Divider orientation="left">Address</Divider>
            <Form.Item label="Address" name="address">
              <Input.TextArea placeholder="Enter your full address" rows={4} />
            </Form.Item>
          </>
        )}

        {activeSection === "emergency" && (
          <>
            <Divider orientation="left">Emergency Contact</Divider>
            <Form.Item label="Emergency Contact Number" name="emergency_contact">
              <Input placeholder="Enter emergency contact number" />
            </Form.Item>
          </>
        )}

        <Form.Item className="text-right mt-6">
          <Button
            type="primary"
            className="bg-[#CBA135] hover:bg-[#b8962e] text-white px-6"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProfileModal;