import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Steps, 
  Alert, 
  Tag, 
  Space,
  Divider,
  Spin
} from 'antd';
import { 
  CheckCircleOutlined, 
  PlusOutlined,
  ReloadOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { useCreateCategoryMutation } from '../../../../redux/slices/Apis/vendorsApi';


const { Step } = Steps;

const CreateCategoryWithFilters = () => {
  const [createCategory] = useCreateCategoryMutation();
  
  // State to store created category IDs
  const [createdCategories, setCreatedCategories] = useState({
    parent: null,
    subcategoryId: null,
    childSubcategoryId: null
  });

  // State for category names
  const [categoryData, setCategoryData] = useState({
    parentName: '',
    subcategoryName: '',
    childSubcategoryName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setCategoryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create parent category
  const createParentCategory = async () => {
    if (!categoryData.parentName.trim()) {
      setError('Parent category name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createCategory({
        name: categoryData.parentName
      }).unwrap();

      // Store the parent category ID
      setCreatedCategories(prev => ({
        ...prev,
        parent: response.id
      }));

      setCurrentStep(1);
      console.log('Parent category created with ID:', response.id);
    } catch (err) {
      setError('Failed to create parent category');
      console.error('Error creating parent category:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create subcategory
  const createSubcategory = async () => {
    if (!categoryData.subcategoryName.trim()) {
      setError('Subcategory name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createCategory({
        name: categoryData.subcategoryName,
        parent: createdCategories.parent
      }).unwrap();

      // Store the subcategory ID
      setCreatedCategories(prev => ({
        ...prev,
        subcategoryId: response.id
      }));

      setCurrentStep(2);
      console.log('Subcategory created with ID:', response.id);
    } catch (err) {
      setError('Failed to create subcategory');
      console.error('Error creating subcategory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create child subcategory
  const createChildSubcategory = async () => {
    if (!categoryData.childSubcategoryName.trim()) {
      setError('Child subcategory name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createCategory({
        name: categoryData.childSubcategoryName,
        parent: createdCategories.subcategoryId
      }).unwrap();

      // Store the child subcategory ID
      setCreatedCategories(prev => ({
        ...prev,
        childSubcategoryId: response.id
      }));

      setCurrentStep(3);
      console.log('Child subcategory created with ID:', response.id);
    } catch (err) {
      setError('Failed to create child subcategory');
      console.error('Error creating child subcategory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset all data
  const resetAll = () => {
    setCategoryData({
      parentName: '',
      subcategoryName: '',
      childSubcategoryName: ''
    });
    setCreatedCategories({
      parent: null,
      subcategoryId: null,
      childSubcategoryId: null
    });
    setError('');
    setCurrentStep(0);
  };

  const steps = [
    {
      title: 'Parent Category',
      description: 'Create main category'
    },
    {
      title: 'Subcategory',
      description: 'Create subcategory'
    },
    {
      title: 'Child Category',
      description: 'Create child category'
    },
    {
      title: 'Complete',
      description: 'Hierarchy created'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card 
          title={
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-800">
                Create Category Hierarchy
              </span>
              <Button 
                icon={<ReloadOutlined />}
                onClick={resetAll}
                className="flex items-center"
              >
                Reset All
              </Button>
            </div>
          }
          className="shadow-lg"
        >
          {/* Progress Steps */}
          <div className="mb-8">
            <Steps current={currentStep} className="w-full">
              {steps.map((step, index) => (
                <Step 
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={
                    index < currentStep ? <CheckCircleOutlined className="text-green-500" /> : null
                  }
                />
              ))}
            </Steps>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              className="mb-6"
            />
          )}

          <div className="space-y-6">
            {/* Parent Category Section */}
            <Card 
              size="small" 
              title={
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">1. Parent Category</span>
                  {createdCategories.parent && (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Created
                    </Tag>
                  )}
                </div>
              }
              className={`border-l-4 ${
                createdCategories.parent 
                  ? 'border-l-green-500' 
                  : 'border-l-blue-500'
              }`}
            >
              <Space direction="vertical" className="w-full" size="middle">
                <Input
                  placeholder="Enter parent category name"
                  value={categoryData.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  disabled={createdCategories.parent || loading}
                  size="large"
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={createParentCategory}
                    disabled={!categoryData.parentName.trim() || createdCategories.parent || loading}
                    loading={loading && !createdCategories.parent}
                    size="large"
                  >
                    Create Parent Category
                  </Button>
                  {createdCategories.parent && (
                    <Tag color="blue" className="text-sm">
                      ID: {createdCategories.parent}
                    </Tag>
                  )}
                </div>
              </Space>
            </Card>

            {/* Subcategory Section */}
            <Card 
              size="small" 
              title={
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">2. Subcategory</span>
                  {createdCategories.subcategoryId && (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Created
                    </Tag>
                  )}
                </div>
              }
              className={`border-l-4 ${
                createdCategories.subcategoryId 
                  ? 'border-l-green-500' 
                  : !createdCategories.parent 
                  ? 'border-l-gray-300 opacity-50' 
                  : 'border-l-blue-500'
              }`}
            >
              <Space direction="vertical" className="w-full" size="middle">
                <Input
                  placeholder="Enter subcategory name"
                  value={categoryData.subcategoryName}
                  onChange={(e) => handleInputChange('subcategoryName', e.target.value)}
                  disabled={!createdCategories.parent || createdCategories.subcategoryId || loading}
                  size="large"
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={createSubcategory}
                    disabled={
                      !categoryData.subcategoryName.trim() || 
                      !createdCategories.parent || 
                      createdCategories.subcategoryId || 
                      loading
                    }
                    loading={loading && !createdCategories.subcategoryId && createdCategories.parent}
                    size="large"
                  >
                    Create Subcategory
                  </Button>
                  {createdCategories.subcategoryId && (
                    <Tag color="blue" className="text-sm">
                      ID: {createdCategories.subcategoryId}
                    </Tag>
                  )}
                </div>
              </Space>
            </Card>

            {/* Child Subcategory Section */}
            <Card 
              size="small" 
              title={
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">3. Child Subcategory</span>
                  {createdCategories.childSubcategoryId && (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Created
                    </Tag>
                  )}
                </div>
              }
              className={`border-l-4 ${
                createdCategories.childSubcategoryId 
                  ? 'border-l-green-500' 
                  : !createdCategories.subcategoryId 
                  ? 'border-l-gray-300 opacity-50' 
                  : 'border-l-blue-500'
              }`}
            >
              <Space direction="vertical" className="w-full" size="middle">
                <Input
                  placeholder="Enter child subcategory name"
                  value={categoryData.childSubcategoryName}
                  onChange={(e) => handleInputChange('childSubcategoryName', e.target.value)}
                  disabled={!createdCategories.subcategoryId || createdCategories.childSubcategoryId || loading}
                  size="large"
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={createChildSubcategory}
                    disabled={
                      !categoryData.childSubcategoryName.trim() || 
                      !createdCategories.subcategoryId || 
                      createdCategories.childSubcategoryId || 
                      loading
                    }
                    loading={loading && !createdCategories.childSubcategoryId && createdCategories.subcategoryId}
                    size="large"
                  >
                    Create Child Subcategory
                  </Button>
                  {createdCategories.childSubcategoryId && (
                    <Tag color="blue" className="text-sm">
                      ID: {createdCategories.childSubcategoryId}
                    </Tag>
                  )}
                </div>
              </Space>
            </Card>
          </div>

          {/* Success Message */}
          {createdCategories.childSubcategoryId && (
            <Alert
              message="Category Hierarchy Created Successfully!"
              description={
                <div className="space-y-2">
                  <div>Parent Category ID: <Tag>{createdCategories.parent}</Tag></div>
                  <div>Subcategory ID: <Tag>{createdCategories.subcategoryId}</Tag></div>
                  <div>Child Subcategory ID: <Tag>{createdCategories.childSubcategoryId}</Tag></div>
                </div>
              }
              type="success"
              showIcon
              className="mt-6"
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateCategoryWithFilters;