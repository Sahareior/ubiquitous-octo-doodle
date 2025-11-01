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
  Spin,
  Row,
  Col,
  Typography,
  Progress,
  Tooltip,
  Modal,
  List,
  Avatar,
  Select,
  Form,
  Collapse,
  Tabs
} from 'antd';
import { 
  CheckCircleOutlined, 
  PlusOutlined,
  ReloadOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  CrownOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  StarOutlined,
  RocketOutlined,
  DeleteOutlined,
  FilterOutlined,
  SettingOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useCreateCategoryMutation, useCreateFilterNameNTypeMutation, useCreateFilterOptionsMutation, useGetCategoriesQuery } from '../../../../redux/slices/Apis/vendorsApi';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';

const { Step } = Steps;
const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const CreateCategoryWithFilters = () => {
  const [createCategory] = useCreateCategoryMutation();
  const [createFilterNameNType] = useCreateFilterNameNTypeMutation();
  const [createFilterOptions] = useCreateFilterOptionsMutation();
  const navigate = useNavigate()
   const { data: cateGoryData, isLoading, refetch } = useGetCategoriesQuery();

  const [createdCategories, setCreatedCategories] = useState({
    parent: null,
    parentName: '',
    subcategoryId: null,
    subcategoryName: '',
    childSubcategoryId: null,
    childSubcategoryName: ''
  });


  const [categoryData, setCategoryData] = useState({
    parentName: '',
    subcategoryName: '',
    childSubcategoryName: ''
  });


  const [filters, setFilters] = useState([]);
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0);
  

  const [currentFilter, setCurrentFilter] = useState({
    name: '',
    filter_type: 'checkbox',
    options: [''],
    createdFilterId: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [activeFilterTab, setActiveFilterTab] = useState('');


  const handleInputChange = (field, value) => {
    setCategoryData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleCurrentFilterChange = (field, value) => {
    setCurrentFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleCurrentFilterOptionChange = (index, value) => {
    const newOptions = [...currentFilter.options];
    newOptions[index] = value;
    setCurrentFilter(prev => ({
      ...prev,
      options: newOptions
    }));
  };


  const addCurrentFilterOption = () => {
    setCurrentFilter(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };


  const removeCurrentFilterOption = (index) => {
    if (currentFilter.options.length > 1) {
      const newOptions = currentFilter.options.filter((_, i) => i !== index);
      setCurrentFilter(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const createNewFilter = () => {
    const newFilter = {
      name: '',
      filter_type: 'checkbox',
      options: [''],
      createdFilterId: null
    };
    

    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    

    setCurrentFilter(newFilter);
    setCurrentFilterIndex(updatedFilters.length - 1);
  };


  const selectFilter = (index) => {
    if (filters[index]) {
      setCurrentFilter(filters[index]);
      setCurrentFilterIndex(index);
    }
  };


  const removeFilterTab = (targetKey) => {
    const index = parseInt(targetKey);
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
    
    if (newFilters.length === 0) {
   
      createNewFilter();
    } else if (currentFilterIndex === index) {
     
      setCurrentFilter(newFilters[0]);
      setCurrentFilterIndex(0);
    } else if (currentFilterIndex > index) {
 
      setCurrentFilterIndex(currentFilterIndex - 1);
    }
  };


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

      setCreatedCategories(prev => ({
        ...prev,
        parent: response.id,
        parentName: categoryData.parentName
      }));

      setCurrentStep(1);
      
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Parent category created successfully!',
        showConfirmButton: false,
        timer: 1500,
        toast: true
      });
      
    } catch (err) {
      setError('Failed to create parent category');
      console.error('Error creating parent category:', err);
    } finally {
      setLoading(false);
    }
  };


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

      setCreatedCategories(prev => ({
        ...prev,
        subcategoryId: response.id,
        subcategoryName: categoryData.subcategoryName
      }));

      setCurrentStep(2);
      
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Subcategory created successfully!',
        showConfirmButton: false,
        timer: 1500,
        toast: true
      });
      
    } catch (err) {
      setError('Failed to create subcategory');
      console.error('Error creating subcategory:', err);
    } finally {
      setLoading(false);
    }
  };


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

      setCreatedCategories(prev => ({
        ...prev,
        childSubcategoryId: response.id,
        childSubcategoryName: categoryData.childSubcategoryName
      }));

      setCurrentStep(3);
      
      Swal.fire({
        title: '🎉 Category Hierarchy Complete!',
        text: 'All category levels have been successfully created. You can now add multiple filters.',
        icon: 'success',
        confirmButtonText: 'Add Filters',
        confirmButtonColor: '#CBA135',
      
        
        customClass: {
          popup: 'success-swal-popup'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          setActiveFilterTab('filters');
     
          if (filters.length === 0) {
            createNewFilter();
          }
        } else {
          resetForm();
        }
      });
      
    } catch (err) {
      setError('Failed to create child subcategory');
      console.error('Error creating child subcategory:', err);
    } finally {
      setLoading(false);
    }
  };


  const createFilter = async () => {
    if (!currentFilter.name.trim()) {
      setError('Filter name is required');
      return;
    }

    if (!createdCategories.childSubcategoryId) {
      setError('Please create a child subcategory first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createFilterNameNType({
        name: currentFilter.name,
        filter_type: currentFilter.filter_type,
        category_ids: [createdCategories.childSubcategoryId]
      }).unwrap();

   
      const updatedFilter = {
        ...currentFilter,
        createdFilterId: response.id
      };

      setCurrentFilter(updatedFilter);

     
      const newFilters = [...filters];
      newFilters[currentFilterIndex] = updatedFilter;
      setFilters(newFilters);

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Filter created successfully!',
        text: 'You can now add filter options',
        showConfirmButton: false,
        timer: 2000,
        toast: true
      });
      refetch()

    } catch (err) {
      setError('Failed to create filter');
      console.error('Error creating filter:', err);
    } finally {
      setLoading(false);
    }
  };

 
  const createOptions = async () => {
    const validOptions = currentFilter.options.filter(option => option.trim() !== '');
    
    if (validOptions.length === 0) {
      setError('Please add at least one filter option');
      return;
    }

    if (!currentFilter.createdFilterId) {
      setError('Please create a filter first');
      return;
    }

    setLoading(true);
    setError('');

    try {
  
      const promises = validOptions.map(option => 
        createFilterOptions({
          filter_by_type: currentFilter.createdFilterId,
          value: option.trim()
        }).unwrap()
      );

      await Promise.all(promises);
 refetch()
      Swal.fire({
        title: '🎉 Filter Options Created!',
        text: `Successfully created ${validOptions.length} options for "${currentFilter.name}"`,
        icon: 'success',
        confirmButtonText: 'Add Another Filter',
        confirmButtonColor: '#CBA135',
        showCancelButton: true,
       
      }).then((result) => {
        if (result.isConfirmed) {
          createNewFilter();
        }
      });

    } catch (err) {
      setError('Failed to create filter options');
      console.error('Error creating filter options:', err);
    } finally {
      setLoading(false);
    }
  };


  const deleteFilter = (index) => {
    confirm({
      title: 'Delete Filter?',
      content: 'This will remove the filter and all its options. This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        const newFilters = filters.filter((_, i) => i !== index);
        setFilters(newFilters);
        
        if (currentFilterIndex === index) {
          if (newFilters.length > 0) {
            setCurrentFilter(newFilters[0]);
            setCurrentFilterIndex(0);
          } else {
            createNewFilter();
          }
        } else if (currentFilterIndex > index) {
          setCurrentFilterIndex(currentFilterIndex - 1);
        }

        Swal.fire({
          position: 'top-end',
          title: 'Filter deleted!',
          icon: 'success',
          showConfirmButton: false,
          timer: 1200,
          toast: true
        });
      },
    });
  };

  
  const resetForm = () => {
    setCategoryData({
      parentName: '',
      subcategoryName: '',
      childSubcategoryName: ''
    });
    setCreatedCategories({
      parent: null,
      parentName: '',
      subcategoryId: null,
      subcategoryName: '',
      childSubcategoryId: null,
      childSubcategoryName: ''
    });
    setFilters([]);
    setCurrentFilter({
      name: '',
      filter_type: 'checkbox',
      options: [''],
      createdFilterId: null
    });
    setCurrentFilterIndex(0);
    setError('');
    setCurrentStep(0);
    setActiveFilterTab('');
  };

  
  const resetAll = () => {
     resetForm();
     navigate('/admin-dashboard/category')
  };

  const steps = [
    {
      title: 'Parent',
      description: 'Main Category',
      icon: <CrownOutlined />
    },
    {
      title: 'Subcategory',
      description: 'Second Level',
      icon: <FolderOutlined />
    },
    {
      title: 'Child',
      description: 'Third Level',
      icon: <FolderOpenOutlined />
    },
    {
      title: 'Filters',
      description: 'Add Multiple Filters',
      icon: <FilterOutlined />
    }
  ];

  const getProgressPercent = () => {
    return (currentStep / (steps.length - 1)) * 100;
  };

  const hierarchyData = [
    {
      title: createdCategories.parentName || 'Parent Category',
      description: createdCategories.parent ? `ID: ${createdCategories.parent}` : 'Not created yet',
      avatar: <CrownOutlined className="text-yellow-500" />,
      level: 'Level 1'
    },
    {
      title: createdCategories.subcategoryName || 'Subcategory',
      description: createdCategories.subcategoryId ? `ID: ${createdCategories.subcategoryId}` : 'Not created yet',
      avatar: <FolderOutlined className="text-blue-500" />,
      level: 'Level 2'
    },
    {
      title: createdCategories.childSubcategoryName || 'Child Category',
      description: createdCategories.childSubcategoryId ? `ID: ${createdCategories.childSubcategoryId}` : 'Not created yet',
      avatar: <FolderOpenOutlined className="text-green-500" />,
      level: 'Level 3'
    }
  ];

  const getFilterTypeColor = (type) => {
    switch (type) {
      case 'checkbox': return 'blue';
      case 'radio': return 'green';
      case 'select': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card 
          className="shadow-2xl border-0 rounded-2xl overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
           <div className="bg-gradient-to-r from-yellow-600 to-purple-600 p-6 text-white">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <RocketOutlined className="text-2xl" />
                  </div>
                  <div>
                    <Title level={2} className="text-white mb-1">
                      Create Category Hierarchy
                    </Title>
                    <Text className="text-blue-100">
                      Build categories with multiple filters
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12} className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  {filters.length > 0 && (
                    <Tag color="orange" className="text-white border-white">
                      {filters.length} Filter{filters.length > 1 ? 's' : ''}
                    </Tag>
                  )}
                  <Button 
                    icon={<FaArrowLeft />}
                    onClick={resetAll}
                    size="large"
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 border-0 text-white"
                  >
                  Go Back
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

    
          <div className="p-6 bg-white border-b">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Progress</Text>
                <Text className="text-blue-600 font-semibold">
                  {Math.round(getProgressPercent())}% Complete
                </Text>
              </div>
              <Progress 
                percent={getProgressPercent()} 
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#722ed1',
                }}
                showInfo={false}
              />
            </div>
            
            <Steps current={currentStep} className="custom-steps">
              {steps.map((step, index) => (
                <Step 
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  className={index <= currentStep ? 'text-blue-600' : ''}
                />
              ))}
            </Steps>
          </div>


          <div className="p-6">
            <Row gutter={[24, 24]}>
           
              <Col xs={24} lg={14}>
           
                {error && (
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError('')}
                    className="mb-6 rounded-lg"
                  />
                )}

        
                <Collapse 
                  defaultActiveKey={['1']}
                  className="mb-6"
                  onChange={(key) => {
                    if (key.includes('2')) {
                      setActiveFilterTab('filters');
                  
                      if (filters.length === 0) {
                        createNewFilter();
                      }
                    }
                  }}
                >
                  <Panel 
                    header={
                      <div className="flex items-center space-x-2">
                        <CrownOutlined className="text-yellow-500" />
                        <Text strong>Category Creation</Text>
                        {createdCategories.childSubcategoryId && (
                          <Tag color="green" className="ml-2">
                            Complete
                          </Tag>
                        )}
                      </div>
                    } 
                    key="1"
                  >
                    <div className="space-y-6">
       
                      <Card 
                        className={`transition-all duration-300 transform hover:scale-[1.02] ${
                          createdCategories.parent 
                            ? 'border-l-4 border-l-green-500 shadow-md' 
                            : 'border-l-4 border-l-blue-500'
                        }`}
                        title={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                createdCategories.parent ? 'bg-green-100' : 'bg-blue-100'
                              }`}>
                                <CrownOutlined className={`text-lg ${
                                  createdCategories.parent ? 'text-green-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <Text strong>Parent Category</Text>
                                <div>
                                  <Text type="secondary" className="text-xs">
                                    Top-level main category
                                  </Text>
                                </div>
                              </div>
                            </div>
                            {createdCategories.parent && (
                              <Tag icon={<CheckCircleOutlined />} color="success" className="ml-2">
                                Created
                              </Tag>
                            )}
                          </div>
                        }
                      >
                        <Space direction="vertical" className="w-full" size="middle">
                          <Input
                            placeholder="e.g., Electronics, Clothing, Home & Garden..."
                            value={categoryData.parentName}
                            onChange={(e) => handleInputChange('parentName', e.target.value)}
                            disabled={createdCategories.parent || loading}
                            size="large"
                            className="w-full"
                            prefix={<CrownOutlined className="text-gray-400" />}
                          />
                          <div className="flex items-center justify-between">
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={createParentCategory}
                              disabled={!categoryData.parentName.trim() || createdCategories.parent || loading}
                              loading={loading && !createdCategories.parent}
                              size="large"
                              className="min-w-40"
                            >
                              Create Parent
                            </Button>
                            {createdCategories.parent && (
                              <Tag color="blue" className="text-sm font-mono">
                                ID: {createdCategories.parent}
                              </Tag>
                            )}
                          </div>
                        </Space>
                      </Card>

                      <Card 
                        className={`transition-all duration-300 ${
                          createdCategories.subcategoryId 
                            ? 'border-l-4 border-l-green-500 shadow-md' 
                            : !createdCategories.parent 
                            ? 'border-l-4 border-l-gray-300 opacity-50' 
                            : 'border-l-4 border-l-blue-500'
                        }`}
                        title={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                createdCategories.subcategoryId ? 'bg-green-100' : 'bg-blue-100'
                              }`}>
                                <FolderOutlined className={`text-lg ${
                                  createdCategories.subcategoryId ? 'text-green-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <Text strong>Subcategory</Text>
                                <div>
                                  <Text type="secondary" className="text-xs">
                                    Second level category
                                  </Text>
                                </div>
                              </div>
                            </div>
                            {createdCategories.subcategoryId && (
                              <Tag icon={<CheckCircleOutlined />} color="success" className="ml-2">
                                Created
                              </Tag>
                            )}
                          </div>
                        }
                      >
                        <Space direction="vertical" className="w-full" size="middle">
                          <Input
                            placeholder="e.g., Smartphones, Men's Fashion, Furniture..."
                            value={categoryData.subcategoryName}
                            onChange={(e) => handleInputChange('subcategoryName', e.target.value)}
                            disabled={!createdCategories.parent || createdCategories.subcategoryId || loading}
                            size="large"
                            className="w-full"
                            prefix={<FolderOutlined className="text-gray-400" />}
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
                              className="min-w-40"
                            >
                              Create Subcategory
                            </Button>
                            {createdCategories.subcategoryId && (
                              <Tag color="blue" className="text-sm font-mono">
                                ID: {createdCategories.subcategoryId}
                              </Tag>
                            )}
                          </div>
                        </Space>
                      </Card>

                  
                      <Card 
                        className={`transition-all duration-300 ${
                          createdCategories.childSubcategoryId 
                            ? 'border-l-4 border-l-green-500 shadow-md' 
                            : !createdCategories.subcategoryId 
                            ? 'border-l-4 border-l-gray-300 opacity-50' 
                            : 'border-l-4 border-l-blue-500'
                        }`}
                        title={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                createdCategories.childSubcategoryId ? 'bg-green-100' : 'bg-blue-100'
                              }`}>
                                <FolderOpenOutlined className={`text-lg ${
                                  createdCategories.childSubcategoryId ? 'text-green-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <Text strong>Child Category</Text>
                                <div>
                                  <Text type="secondary" className="text-xs">
                                    Most specific category level
                                  </Text>
                                </div>
                              </div>
                            </div>
                            {createdCategories.childSubcategoryId && (
                              <Tag icon={<CheckCircleOutlined />} color="success" className="ml-2">
                                Created
                              </Tag>
                            )}
                          </div>
                        }
                      >
                        <Space direction="vertical" className="w-full" size="middle">
                          <Input
                            placeholder="e.g., iPhone, T-Shirts, Sofas..."
                            value={categoryData.childSubcategoryName}
                            onChange={(e) => handleInputChange('childSubcategoryName', e.target.value)}
                            disabled={!createdCategories.subcategoryId || createdCategories.childSubcategoryId || loading}
                            size="large"
                            className="w-full"
                            prefix={<FolderOpenOutlined className="text-gray-400" />}
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
                              className="min-w-40"
                            >
                              Create Child
                            </Button>
                            {createdCategories.childSubcategoryId && (
                              <Tag color="blue" className="text-sm font-mono">
                                ID: {createdCategories.childSubcategoryId}
                              </Tag>
                            )}
                          </div>
                        </Space>
                      </Card>
                    </div>
                  </Panel>

         
                  <Panel 
                    header={
                      <div className="flex items-center space-x-2">
                        <FilterOutlined className="text-blue-500" />
                        <Text strong>Filter Management</Text>
                        {filters.length > 0 && (
                          <Tag color="orange" className="ml-2">
                            {filters.length} Filter{filters.length > 1 ? 's' : ''}
                          </Tag>
                        )}
                      </div>
                    } 
                    key="2"
                    disabled={!createdCategories.childSubcategoryId}
                  >
                    <Tabs
                      activeKey={currentFilterIndex.toString()}
                      onChange={(key) => selectFilter(parseInt(key))}
                      type="editable-card"
                      onEdit={(targetKey, action) => {
                        if (action === 'add') {
                          createNewFilter();
                        } else {
                          removeFilterTab(targetKey);
                        }
                      }}
                    >
                      {filters.map((filter, index) => (
                        <TabPane 
                          key={index.toString()}
                          tab={
                            <div className="flex items-center space-x-2">
                              <FilterOutlined />
                              <span>{filter.name || `Filter ${index + 1}`}</span>
                              {filter.createdFilterId && (
                                <CheckCircleOutlined className="text-green-500" />
                              )}
                            </div>
                          }
                          closable={filters.length > 1}
                        >
                          <div className="space-y-6">
                            {/* Filter Creation Card */}
                            <Card 
                              className="border-l-4 border-l-blue-500"
                              title={
                                <div className="flex items-center space-x-3">
                                  <SettingOutlined className="text-blue-600" />
                                  <div>
                                    <Text strong>
                                      {currentFilter.createdFilterId ? 'Edit Filter' : 'Create Filter'} 
                                      {currentFilter.name && `: ${currentFilter.name}`}
                                    </Text>
                                    <div>
                                      <Text type="secondary" className="text-xs">
                                        For: {createdCategories.childSubcategoryName}
                                      </Text>
                                    </div>
                                  </div>
                                </div>
                              }
                              extra={
                                <div className="flex space-x-2">
                                  {currentFilter.createdFilterId && (
                                    <Tag color={getFilterTypeColor(currentFilter.filter_type)}>
                                      {currentFilter.filter_type}
                                    </Tag>
                                  )}
                                  <Button
                                    icon={<DeleteOutlined />}
                                    onClick={() => deleteFilter(index)}
                                    danger
                                    size="small"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              }
                            >
                              <Space direction="vertical" className="w-full" size="middle">
                                <Input
                                  placeholder="e.g., Brand, Size, Color, Material..."
                                  value={currentFilter.name}
                                  onChange={(e) => handleCurrentFilterChange('name', e.target.value)}
                                  disabled={loading || currentFilter.createdFilterId}
                                  size="large"
                                  className="w-full"
                                  prefix={<FilterOutlined className="text-gray-400" />}
                                />
                                
                                <Select
                                  value={currentFilter.filter_type}
                                  onChange={(value) => handleCurrentFilterChange('filter_type', value)}
                                  disabled={loading || currentFilter.createdFilterId}
                                  size="large"
                                  className="w-full"
                                >
                                  <Option value="checkbox">Checkbox</Option>
                                  <Option value="radio">Radio Button</Option>
                                  <Option value="select">Dropdown Select</Option>
                                </Select>

                                <div className="flex items-center justify-between">
                                  <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={createFilter}
                                    disabled={
                                      !currentFilter.name.trim() || 
                                      !createdCategories.childSubcategoryId || 
                                      currentFilter.createdFilterId || 
                                      loading
                                    }
                                    loading={loading && !currentFilter.createdFilterId}
                                    size="large"
                                    className="min-w-40"
                                  >
                                    {currentFilter.createdFilterId ? 'Filter Created' : 'Create Filter'}
                                  </Button>
                                  {currentFilter.createdFilterId && (
                                    <Tag color="blue" className="text-sm font-mono">
                                      ID: {currentFilter.createdFilterId}
                                    </Tag>
                                  )}
                                </div>
                              </Space>
                            </Card>

                            {currentFilter.createdFilterId && (
                              <Card 
                                className="border-l-4 border-l-green-500"
                                title={
                                  <div className="flex items-center space-x-3">
                                    <PlusOutlined className="text-green-600" />
                                    <div>
                                      <Text strong>Add Filter Options</Text>
                                      <div>
                                        <Text type="secondary" className="text-xs">
                                          Add values for: {currentFilter.name}
                                        </Text>
                                      </div>
                                    </div>
                                  </div>
                                }
                                extra={
                                  <Button
                                    icon={<PlusOutlined />}
                                    onClick={addCurrentFilterOption}
                                    size="small"
                                  >
                                    Add Option
                                  </Button>
                                }
                              >
                                <Space direction="vertical" className="w-full" size="middle">
                                  {currentFilter.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center space-x-2">
                                      <Input
                                        placeholder={`Option ${optionIndex + 1} (e.g., Apple, Samsung, LG...)`}
                                        value={option}
                                        onChange={(e) => handleCurrentFilterOptionChange(optionIndex, e.target.value)}
                                        disabled={loading}
                                        size="large"
                                        className="flex-1"
                                      />
                                      {currentFilter.options.length > 1 && (
                                        <Button
                                          icon={<DeleteOutlined />}
                                          onClick={() => removeCurrentFilterOption(optionIndex)}
                                          danger
                                          size="large"
                                        />
                                      )}
                                    </div>
                                  ))}
                                  
                                  <div className="flex items-center justify-between pt-4">
                                    <Button
                                      type="primary"
                                      icon={<CheckCircleOutlined />}
                                      onClick={createOptions}
                                      disabled={loading || currentFilter.options.every(opt => !opt.trim())}
                                      loading={loading}
                                      size="large"
                                      className="min-w-40"
                                    >
                                      Create Options
                                    </Button>
                                    <Text type="secondary" className="text-sm">
                                      {currentFilter.options.filter(opt => opt.trim()).length} valid options
                                    </Text>
                                  </div>
                                </Space>
                              </Card>
                            )}
                          </div>
                        </TabPane>
                      ))}
                    </Tabs>

            
                    {filters.length === 0 && (
                      <div className="text-center py-8">
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={createNewFilter}
                          size="large"
                          className="h-20 w-full"
                        >
                          Create Your First Filter
                        </Button>
                      </div>
                    )}
                  </Panel>
                </Collapse>
              </Col>

    
              <Col xs={24} lg={10}>
                <Card 
                  title={
                    <div className="flex items-center space-x-2">
                      <StarOutlined className="text-yellow-500" />
                      <Text strong>Overview</Text>
                    </div>
                  }
                  className="bg-gray-50 border-0"
                  extra={
                    filters.length > 0 && (
                      <Tag color="orange">
                        {filters.length} Filter{filters.length > 1 ? 's' : ''}
                      </Tag>
                    )
                  }
                >
              
                  <div className="mb-6">
                    <Text strong className="block mb-3">Category Hierarchy</Text>
                    <List
                      itemLayout="horizontal"
                      dataSource={hierarchyData}
                      renderItem={(item, index) => (
                        <List.Item 
                          className={`p-3 rounded-lg mb-2 transition-all ${
                            index === 0 && createdCategories.parent ? 'bg-white shadow-sm border' :
                            index === 1 && createdCategories.subcategoryId ? 'bg-white shadow-sm border' :
                            index === 2 && createdCategories.childSubcategoryId ? 'bg-white shadow-sm border' :
                            'bg-gray-100'
                          }`}
                        >
                          <List.Item.Meta
                            avatar={
                              <div className={`p-2 rounded-full ${
                                index === 0 && createdCategories.parent ? 'bg-green-50' :
                                index === 1 && createdCategories.subcategoryId ? 'bg-blue-50' :
                                index === 2 && createdCategories.childSubcategoryId ? 'bg-purple-50' :
                                'bg-gray-200'
                              }`}>
                                {item.avatar}
                              </div>
                            }
                            title={
                              <div>
                                <Text 
                                  strong 
                                  className={
                                    (index === 0 && createdCategories.parent) ||
                                    (index === 1 && createdCategories.subcategoryId) ||
                                    (index === 2 && createdCategories.childSubcategoryId)
                                      ? 'text-gray-800'
                                      : 'text-gray-400'
                                  }
                                >
                                  {item.title}
                                </Text>
                                <Tag color="default" size="small" className="ml-2">
                                  {item.level}
                                </Tag>
                              </div>
                            }
                            description={
                              <Text 
                                type={
                                  (index === 0 && createdCategories.parent) ||
                                  (index === 1 && createdCategories.subcategoryId) ||
                                  (index === 2 && createdCategories.childSubcategoryId)
                                    ? 'secondary'
                                    : 'disabled'
                                }
                                className="text-xs"
                              >
                                {item.description}
                              </Text>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                  
                  {/* Filters Preview */}
                  {filters.length > 0 && (
                    <div className="mt-4">
                      <Text strong className="block mb-3">Created Filters</Text>
                      <div className="space-y-3">
                        {filters.map((filter, index) => (
                          <Card 
                            key={index}
                            size="small"
                            className={`cursor-pointer transition-all ${
                              index === currentFilterIndex ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                            onClick={() => selectFilter(index)}
                            title={
                              <div className="flex items-center justify-between">
                                <Text strong>{filter.name || `Filter ${index + 1}`}</Text>
                                <Tag color={getFilterTypeColor(filter.filter_type)}>
                                  {filter.filter_type}
                                </Tag>
                              </div>
                            }
                            extra={
                              <div className="flex space-x-1">
                                <Button
                                  type="text"
                                  icon={<EyeOutlined />}
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectFilter(index);
                                  }}
                                />
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  danger
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFilter(index);
                                  }}
                                />
                              </div>
                            }
                          >
                            {filter.createdFilterId && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <Text type="secondary">Filter ID:</Text>
                                  <Text code>{filter.createdFilterId}</Text>
                                </div>
                                {filter.options.some(opt => opt.trim()) && (
                                  <div>
                                    <Text type="secondary" className="text-xs">Options:</Text>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {filter.options.filter(opt => opt.trim()).map((option, optIndex) => (
                                        <Tag key={optIndex} color="green" size="small">
                                          {option}
                                        </Tag>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
             
                  {createdCategories.childSubcategoryId && (
                    <Alert
                      message="Category Hierarchy Complete!"
                      description={`You can add multiple filters for "${createdCategories.childSubcategoryName}"`}
                      type="success"
                      showIcon
                      className="mt-4 rounded-lg"
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        </Card>
      </div>


      <style jsx>{`
        .custom-steps .ant-steps-item-title {
          font-weight: 600;
        }
        .success-swal-popup {
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default CreateCategoryWithFilters;