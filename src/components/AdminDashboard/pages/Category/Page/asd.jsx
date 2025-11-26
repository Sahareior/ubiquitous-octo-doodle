import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Steps, 
  Alert, 
  Tag, 
  Space,
  Row,
  Col,
  Typography,
  Progress,
  Modal,
  List,
  Select,
  Collapse,
  Tabs,
  Form
} from 'antd';
import { 
  CheckCircleOutlined, 
  PlusOutlined,
  ArrowRightOutlined,
  CrownOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  StarOutlined,
  RocketOutlined,
  DeleteOutlined,
  FilterOutlined,
  SettingOutlined,
  EditOutlined,
  EyeOutlined,
  SaveOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaGear, FaTrash } from 'react-icons/fa6';
import { 
  useCategoryUpdateApiMutation,
  useCreateCategoryMutation, 
  useCreateFilterNameNTypeMutation, 
  useCreateFilterOptionsMutation, 
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useOptionsTypeDeleteMutation,
  useOptionsTypeUpdateMutation,
} from '../../../../../redux/slices/Apis/vendorsApi';
import { Trash } from 'lucide-react';
import { useDeleteCategoriesMutation } from '../../../../../redux/slices/Apis/customersApi';

const { Step } = Steps;
const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // RTK Query hooks
  const [createCategory] = useCreateCategoryMutation();
  const [createFilterNameNType] = useCreateFilterNameNTypeMutation();
  const [createFilterOptions] = useCreateFilterOptionsMutation();
  const [categoryUpdateApi] = useCategoryUpdateApiMutation()
  const [optionsTypeDelete] = useOptionsTypeDeleteMutation();
  
  const { data: cateGoryData, isLoading: categoriesLoading, refetch } = useGetCategoriesQuery();
  const { data: categoryByIdData, isLoading: categoryLoading, refetch: refetchCategory } = useGetCategoryByIdQuery(id);
  const [deleteCategorys] = useDeleteCategoriesMutation()
  const [optionsTypeUpdate] = useOptionsTypeUpdateMutation();
  // State for existing data
  const [existingCategories, setExistingCategories] = useState({
    parent: null,
    subcategories: [],
    childCategories: []
  });

  const [existingFilters, setExistingFilters] = useState([]);

  // State for new creations
  const [createdCategories, setCreatedCategories] = useState({
    parent: id ? parseInt(id) : null,
    parentName: '',
    subcategoryId: null,
    subcategoryName: '',
    childSubcategoryId: null,
    childSubcategoryName: ''
  });

  const [categoryData, setCategoryData] = useState({
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
  const [currentStep, setCurrentStep] = useState(1);
  const [activeFilterTab, setActiveFilterTab] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingFilter, setEditingFilter] = useState(null);
  const [selectedCategoryForFilters, setSelectedCategoryForFilters] = useState(null);

  // Load existing data when category data is fetched
  useEffect(() => {
    if (categoryByIdData) {
      // Set parent category info
      setCreatedCategories(prev => ({
        ...prev,
        parentName: categoryByIdData.name
      }));

      // Extract existing categories
      const subcategories = categoryByIdData.children || [];
      const childCategories = subcategories.flatMap(sub => sub.children || []);
      
      setExistingCategories({
        parent: categoryByIdData,
        subcategories: subcategories,
        childCategories: childCategories
      });

      // Extract existing filters from all levels
      const allFilters = [];
      
      // Filters from child categories
      childCategories.forEach(child => {
        if (child.filter_data && child.filter_data.length > 0) {
          child.filter_data.forEach(filter => {
            allFilters.push({
              ...filter,
              categoryLevel: 'child',
              categoryId: child.id,
              categoryName: child.name
            });
          });
        }
      });

      // Filters from subcategories
      subcategories.forEach(sub => {
        if (sub.filter_data && sub.filter_data.length > 0) {
          sub.filter_data.forEach(filter => {
            allFilters.push({
              ...filter,
              categoryLevel: 'subcategory',
              categoryId: sub.id,
              categoryName: sub.name
            });
          });
        }
      });

      // Filters from parent
      if (categoryByIdData.filter_data && categoryByIdData.filter_data.length > 0) {
        categoryByIdData.filter_data.forEach(filter => {
          allFilters.push({
            ...filter,
            categoryLevel: 'parent',
            categoryId: categoryByIdData.id,
            categoryName: categoryByIdData.name
          });
        });
      }

      setExistingFilters(allFilters);
    }
  }, [categoryByIdData]);

  // Set default selected category for filters
  useEffect(() => {
    if (existingCategories.childCategories.length > 0) {
      setSelectedCategoryForFilters(existingCategories.childCategories[0].id);
    } else if (existingCategories.subcategories.length > 0) {
      setSelectedCategoryForFilters(existingCategories.subcategories[0].id);
    } else if (existingCategories.parent) {
      setSelectedCategoryForFilters(existingCategories.parent.id);
    }
  }, [existingCategories]);

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
      createdFilterId: null,
      targetCategoryId: selectedCategoryForFilters
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

  // Edit existing category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    
  
  };

const handleSaveCategory = async () => {
  if (!editingCategory?.name?.trim()) {
    setError('Category name is required');
    return;
  }

 

  setLoading(true);
  try {
    const payload = {
      id: editingCategory.id,
      name: { name: editingCategory.name.trim() } // 👈 body should be an object
    };

    

    await categoryUpdateApi(payload);

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Category updated successfully!',
      showConfirmButton: false,
      timer: 1500,
      toast: true
    });

    setEditingCategory(null);
    refetchCategory();
    setError(null);
  } catch (err) {
    console.error('Error updating category:', err);
    setError(err?.response?.data?.message || 'Failed to update category');
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: 'Failed to update category',
      text: err?.response?.data?.message || 'Something went wrong!',
      showConfirmButton: false,
      timer: 2000,
      toast: true
    });
  } finally {
    setLoading(false);
  }
};



  // Delete existing category
  const handleDeleteCategory = async (category) => {
    await deleteCategorys(category.id)
    refetchCategory()
  };

  // Edit existing filter
  const handleEditFilter = (filter) => {
    setEditingFilter(filter);
  };

  const handleSaveFilter = async () => {
    if (!editingFilter?.filter_by_type?.name?.trim()) {
      setError('Filter name is required');
      return;
    }

    setLoading(true);
    try {
      // Add your update filter API call here
   



      await optionsTypeUpdate({id: editingFilter.filter_by_type.id, data: {name: editingFilter.filter_by_type.name.trim()}});

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Filter updated successfully!',
        showConfirmButton: false,
        timer: 1500,
        toast: true
      });

      setEditingFilter(null);
      refetchCategory();
    } catch (err) {
      setError('Failed to update filter');
      console.error('Error updating filter:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete existing filter
  const handleDeleteFilter = (filter) => {
  
      optionsTypeDelete(filter.filter_by_type.id)
      refetchCategory()
  };

  // Edit filter option
  const handleEditFilterOption = async (optionId, newValue) => {
    if (!newValue.trim()) {
      setError('Option value is required');
      return;
    }

    setLoading(true);
    try {
      // Add your update filter option API call here
      

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Filter option updated!',
        showConfirmButton: false,
        timer: 1200,
        toast: true
      });

      refetchCategory();
    } catch (err) {
      setError('Failed to update filter option');
      console.error('Error updating filter option:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete filter option
  const handleDeleteFilterOption = (optionId) => {

  };

  // Create new subcategory
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

      refetchCategory();
      
    } catch (err) {
      setError('Failed to create subcategory');
      console.error('Error creating subcategory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new child subcategory
  const createChildSubcategory = async () => {
    if (!categoryData.childSubcategoryName.trim()) {
      setError('Child subcategory name is required');
      return;
    }

    const parentId = createdCategories.subcategoryId || createdCategories.parent;
    
    if (!parentId) {
      setError('Please select a parent category first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createCategory({
        name: categoryData.childSubcategoryName,
        parent: parentId
      }).unwrap();

      setCreatedCategories(prev => ({
        ...prev,
        childSubcategoryId: response.id,
        childSubcategoryName: categoryData.childSubcategoryName
      }));

      setCurrentStep(3);
      
      Swal.fire({
        title: '🎉 Category Created Successfully!',
        text: 'Category has been successfully created. You can now add multiple filters.',
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
        }
      });

      refetchCategory();
      
    } catch (err) {
      setError('Failed to create child subcategory');
      console.error('Error creating child subcategory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new filter
  const createFilter = async () => {
    if (!currentFilter.name.trim()) {
      setError('Filter name is required');
      return;
    }

    const targetCategoryId = selectedCategoryForFilters;

    if (!targetCategoryId) {
      setError('Please select a category for the filter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createFilterNameNType({
        name: currentFilter.name,
        filter_type: currentFilter.filter_type,
        category_ids: [targetCategoryId]
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
      
      refetch();
      refetchCategory();

    } catch (err) {
      setError('Failed to create filter');
      console.error('Error creating filter:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create filter options
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
      
      refetch();
      refetchCategory();

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

  };

  const resetForm = () => {
    setCategoryData({
      subcategoryName: '',
      childSubcategoryName: ''
    });
    setCreatedCategories(prev => ({
      ...prev,
      subcategoryId: null,
      subcategoryName: '',
      childSubcategoryId: null,
      childSubcategoryName: ''
    }));
    setFilters([]);
    setCurrentFilter({
      name: '',
      filter_type: 'checkbox',
      options: [''],
      createdFilterId: null
    });
    setCurrentFilterIndex(0);
    setError('');
    setCurrentStep(1);
    setActiveFilterTab('');
    setEditingCategory(null);
    setEditingFilter(null);
  };

  const resetAll = () => {
    resetForm();
    navigate('/admin-dashboard/category');
  };

  const steps = [
    {
      title: 'Parent',
      description: 'Existing Category',
      icon: <CrownOutlined />
    },
    {
      title: 'Subcategory',
      description: 'Add/Edit Categories',
      icon: <FolderOutlined />
    },
    {
      title: 'Child',
      description: 'Add/Edit Categories',
      icon: <FolderOpenOutlined />
    },
    {
      title: 'Filters',
      description: 'Add/Edit Filters',
      icon: <FilterOutlined />
    }
  ];

  const getProgressPercent = () => {
    return (currentStep / (steps.length - 1)) * 100;
  };

  const getFilterTypeColor = (type) => {
    switch (type) {
      case 'checkbox': return 'blue';
      case 'radio': return 'green';
      case 'select': return 'purple';
      default: return 'default';
    }
  };

  // Get all available categories for filter assignment
  const getAllAvailableCategories = () => {
    const categories = [];
    
    // if (existingCategories.parent) {
    //   categories.push({
    //     id: existingCategories.parent.id,
    //     name: `${existingCategories.parent.name} (Parent)`,
    //     level: 'parent'
    //   });
    // }
    
    // existingCategories.subcategories.forEach(sub => {
    //   categories.push({
    //     id: sub.id,
    //     name: `${sub.name} (Subcategory)`,
    //     level: 'subcategory'
    //   });
    // });
    
    existingCategories.childCategories.forEach(child => {
      categories.push({
        id: child.id,
        name: `${child.name} `,
        level: 'child'
      });
    });

    return categories;
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <Text className="text-gray-600 mt-4">Loading category data...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Card 
          className="shadow-2xl border-0 rounded-2xl overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={12}>
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <EditOutlined className="text-2xl" />
                  </div>
                  <div>
                 <h3 className='text-2xl popmed'>Edit Category & Content</h3>
                    <Text className="text-blue-100">
                      {createdCategories.parentName} (ID: {id})
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12} className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  {(existingFilters.length > 0 || filters.length > 0) && (
                    <Tag color="orange" className="text-white border-white">
                      {existingFilters.length + filters.length} Filter{(existingFilters.length + filters.length) > 1 ? 's' : ''}
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
                  defaultActiveKey={['1', '2', '3', '4']}
                  className="mb-6"
                >
                  {/* Edit Existing Categories Panel */}
                  <Panel 
                    header={
                      <div className="flex items-center space-x-2">
                        <EditOutlined className="text-purple-500" />
                        <Text strong>Edit Existing Categories</Text>
                        <Tag color="blue">{existingCategories.subcategories.length + existingCategories.childCategories.length + 1} Categories</Tag>
                      </div>
                    } 
                    key="1"
                  >
                    <div className="space-y-6">
                      {/* Edit Parent Category */}
                      <Card 
                        className="border-l-4 border-l-purple-500 shadow-md"
                        title={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-purple-100">
                                <CrownOutlined className="text-lg text-purple-600" />
                              </div>
                              <div>
                                <Text strong>Parent Category</Text>
                                <div>
                                  <Text type="secondary" className="text-xs">
                                    Main category - Edit name
                                  </Text>
                                </div>
                              </div>
                            </div>
                            <Tag color="purple">Level 1</Tag>
                          </div>
                        }
                      >
                        <Space direction="vertical" className="w-full" size="middle">
                          {editingCategory?.id === existingCategories?.parent?.id ? (
                            <div className="flex space-x-2">
                              <Input
                                value={editingCategory?.name}
                                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                size="large"
                                className="flex-1"
                              />
                              <Button
                                icon={<SaveOutlined />}
                                onClick={handleSaveCategory}
                                loading={loading}
                                type="primary"
                                size="large"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() => setEditingCategory(null)}
                                size="large"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <Text strong>{existingCategories.parent?.name}</Text>
                              <div className="flex space-x-2">
                                <Button
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditCategory(existingCategories.parent)}
                                  size="small"
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <Text type="secondary">ID: {existingCategories.parent?.id}</Text>
                            <Text type="secondary">Slug: {existingCategories.parent?.slug}</Text>
                          </div>
                        </Space>
                      </Card>

                      {/* Edit Subcategories */}
                      {existingCategories.subcategories.map((subcategory, index) => (
                        <Card 
                          key={subcategory.id}
                          className="border-l-4 border-l-blue-500 shadow-md"
                          title={
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-blue-100">
                                  <FolderOutlined className="text-lg text-blue-600" />
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
                              <div className="flex space-x-2">
                                <Button
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditCategory(subcategory)}
                                  size="small"
                                >
                                  Edit
                                </Button>
                                <Button
                                  icon={<FaTrash />}
                                  onClick={() => handleDeleteCategory(subcategory)}
                                  loading={loading}
                                  danger
                                  size="small"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          }
                        >
                          <Space direction="vertical" className="w-full" size="middle">
                            {editingCategory?.id === subcategory.id ? (
                              <div className="flex space-x-2">
                                <Input
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                  size="large"
                                  className="flex-1"
                                />
                                <Button
                                  icon={<SaveOutlined />}
                                  onClick={handleSaveCategory}
                                  loading={loading}
                                  type="primary"
                                  size="large"
                                >
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingCategory(null)}
                                  size="large"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center">
                                <Text strong>{subcategory.name}</Text>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <Text type="secondary">ID: {subcategory.id}</Text>
                              <Text type="secondary">Slug: {subcategory.slug}</Text>
                            </div>
                            <Text type="secondary" className="text-xs">
                              Child categories: {subcategory.children?.length || 0}
                            </Text>
                          </Space>
                        </Card>
                      ))}

                      {/* Edit Child Categories */}
                      {existingCategories.childCategories.map((childCategory, index) => (
                        <Card 
                          key={childCategory.id}
                          className="border-l-4 border-l-green-500 shadow-md"
                          title={
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-green-100">
                                  <FolderOpenOutlined className="text-lg text-green-600" />
                                </div>
                                <div>
                                  <Text strong>Child Category</Text>
                                  <div>
                                    <Text type="secondary" className="text-xs">
                                      Third level category
                                    </Text>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditCategory(childCategory)}
                                  size="small"
                                >
                                  Edit
                                </Button>
                                <Button
                                  icon={<FaTrash />}
                                  onClick={() => handleDeleteCategory(childCategory)}
                                  loading={loading}
                                  danger
                                  size="small"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          }
                        >
                          <Space direction="vertical" className="w-full" size="middle">
                            {editingCategory?.id === childCategory.id ? (
                              <div className="flex space-x-2">
                                <Input
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                  size="large"
                                  className="flex-1"
                                />
                                <Button
                                  icon={<SaveOutlined />}
                                  onClick={handleSaveCategory}
                                  loading={loading}
                                  type="primary"
                                  size="large"
                                >
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingCategory(null)}
                                  size="large"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center">
                                <Text strong>{childCategory.name}</Text>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <Text type="secondary">ID: {childCategory.id}</Text>
                              <Text type="secondary">Slug: {childCategory.slug}</Text>
                            </div>
                            <Text type="secondary" className="text-xs">
                              Filters: {childCategory.filter_data?.length || 0}
                            </Text>
                          </Space>
                        </Card>
                      ))}
                    </div>
                  </Panel>

                  {/* Create New Categories Panel */}


                  {/* Edit Existing Filters Panel */}
                  <Panel 
                    header={
                      <div className="flex items-center space-x-2">
                        <FilterOutlined className="text-orange-500" />
                        <Text strong>Edit Existing Filters</Text>
                        {existingFilters.length > 0 && (
                          <Tag color="orange" className="ml-2">
                            {existingFilters.length} Filter{existingFilters.length > 1 ? 's' : ''}
                          </Tag>
                        )}
                      </div>
                    } 
                    key="3"
                  >
                    <div className="space-y-6">
                      {existingFilters.length === 0 ? (
                        <div className="text-center py-8">
                          <Text type="secondary">No existing filters found for this category hierarchy.</Text>
                        </div>
                      ) : (
                        existingFilters.map((filter, index) => (
                          <Card 
                            key={filter.filter_by_type.id}
                            className="border-l-4 border-l-orange-500 shadow-md"
                            title={
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <SettingOutlined className="text-orange-600" />
                                  <div>
                                    <Text strong>{filter.filter_by_type.name}</Text>
                                    <div>
                                      <Text type="secondary" className="text-xs">
                                        Category: {filter.categoryName} ({filter.categoryLevel})
                                      </Text>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Tag color={getFilterTypeColor(filter.filter_by_type.filter_type)}>
                                    {filter.filter_by_type.filter_type}
                                  </Tag>
                                  <Button
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditFilter(filter)}
                                    size="small"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteFilter(filter)}
                                    danger
                                    size="small"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            }
                          >
                            {editingFilter?.filter_by_type?.id === filter.filter_by_type.id ? (
                              <div className="space-y-4">
                                <div className="flex space-x-2">
                                  <Input
                                    value={editingFilter.filter_by_type.name}
                                    onChange={(e) => setEditingFilter({
                                      ...editingFilter,
                                      filter_by_type: {
                                        ...editingFilter.filter_by_type,
                                        name: e.target.value
                                      }
                                    })}
                                    placeholder="Filter name"
                                    size="large"
                                    className="flex-1"
                                  />
                                  <Select
                                    value={editingFilter.filter_by_type.filter_type}
                                    onChange={(value) => setEditingFilter({
                                      ...editingFilter,
                                      filter_by_type: {
                                        ...editingFilter.filter_by_type,
                                        filter_type: value
                                      }
                                    })}
                                    size="large"
                                    style={{ width: 150 }}
                                  >
                                    <Option value="checkbox">Checkbox</Option>
                                    <Option value="radio">Radio</Option>
                                  </Select>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    icon={<SaveOutlined />}
                                    onClick={handleSaveFilter}
                                    loading={loading}
                                    type="primary"
                                  >
                                    Save Filter
                                  </Button>
                                  <Button
                                    onClick={() => setEditingFilter(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : null}

                            {/* Filter Options */}
                            <div className="mt-4">
                              <Text strong className="block mb-3">Filter Options</Text>
                              <div className="space-y-2">
                                {filter.filter_options.map((option, optIndex) => (
                                  <div key={option.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                    <Input
                                      defaultValue={option.value}
                                      onBlur={(e) => handleEditFilterOption(option.id, e.target.value)}
                                      size="middle"
                                      className="flex-1"
                                    />
                                    <Button
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleDeleteFilterOption(option.id)}
                                      danger
                                      size="small"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </Panel>
<p className="text-base pl-10 font-medium text-gray-600 flex justify-center gap-3 items-center border-b py-10 border-gray-200 ">
 <FaGear /> Category Workshop
</p>



                                    <Panel 
                    header={
                      <div className="flex items-center space-x-2">
                        <PlusOutlined className="text-green-500" />
                        <Text strong>Create New Categories</Text>
                        {(createdCategories.subcategoryId || createdCategories.childSubcategoryId) && (
                          <Tag color="green" className="ml-2">
                            New Content
                          </Tag>
                        )}
                      </div>
                    } 
                    key="2"
                  >
                    <div className="space-y-6">
                      {/* Existing Parent Category Info */}
                      <Card 
                        className="border-l-4 border-l-purple-500 shadow-md"
                        title={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-purple-100">
                                <CrownOutlined className="text-lg text-purple-600" />
                              </div>
                              <div>
                                <Text strong>Existing Parent Category</Text>
                                <div>
                                  <Text type="secondary" className="text-xs">
                                    You are adding content under this category
                                  </Text>
                                </div>
                              </div>
                            </div>
                            <Tag icon={<CheckCircleOutlined />} color="success" className="ml-2">
                              Existing
                            </Tag>
                          </div>
                        }
                      >
                        <Space direction="vertical" className="w-full" size="middle">
                          <Input
                            value={`${createdCategories.parentName} (ID: ${createdCategories.parent})`}
                            disabled
                            size="large"
                            className="w-full"
                            prefix={<CrownOutlined className="text-gray-400" />}
                          />
                          <div className="flex items-center justify-between">
                            <Text type="secondary" className="text-sm">
                              All new content will be created under this parent category
                            </Text>
                            <Tag color="green" className="text-sm font-mono">
                              ID: {createdCategories.parent}
                            </Tag>
                          </div>
                        </Space>
                      </Card>

                      {/* Subcategory Creation */}
                      <Card 
                        className={`transition-all duration-300 ${
                          createdCategories.subcategoryId 
                            ? 'border-l-4 border-l-green-500 shadow-md' 
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
                                    Create a second level category
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
                            disabled={createdCategories.subcategoryId || loading}
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
                                createdCategories.subcategoryId || 
                                loading
                              }
                              loading={loading && !createdCategories.subcategoryId}
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

                      {/* Child Subcategory Creation */}
                      <Card 
                        className={`transition-all duration-300 ${
                          createdCategories.childSubcategoryId 
                            ? 'border-l-4 border-l-green-500 shadow-md' 
                            : (existingCategories.subcategories.length === 0 && !createdCategories.subcategoryId)
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
                                    Create a third level category (optional)
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
                            disabled={
                              (existingCategories.subcategories.length === 0 && !createdCategories.subcategoryId) || 
                              createdCategories.childSubcategoryId || 
                              loading
                            }
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
                                (existingCategories.subcategories.length === 0 && !createdCategories.subcategoryId) || 
                                createdCategories.childSubcategoryId || 
                                loading
                              }
                              loading={loading && !createdCategories.childSubcategoryId}
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
                        
                  {/* Create New Filters Panel */}
                  <Panel 
                    header={
                      <div className="flex items-center space-x-2">
                        <PlusOutlined className="text-blue-500" />
                        <Text strong>Create New Filters</Text>
                        {filters.length > 0 && (
                          <Tag color="orange" className="ml-2">
                            {filters.length} New Filter{filters.length > 1 ? 's' : ''}
                          </Tag>
                        )}
                      </div>
                    } 
                    key="4"
                  >
                    {/* Category Selection for Filters */}
                    <Card className="mb-4 border-l-4 border-l-purple-500">
                      <Text strong className="block mb-2">Select Category for Filters</Text>
                      <Select
                        value={selectedCategoryForFilters}
                        onChange={setSelectedCategoryForFilters}
                        size="large"
                        className="w-full"
                        placeholder="Select a category to attach filters"
                      >
                        {getAllAvailableCategories().map(category => (
                          <Option key={category.id} value={category.id}>
                            {category.name}
                          </Option>
                        ))}
                      </Select>
                      <Text type="secondary" className="text-xs mt-2">
                        Choose which category these filters will be attached to
                      </Text>
                    </Card>

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
                                        Target Category: {getAllAvailableCategories().find(cat => cat.id === selectedCategoryForFilters)?.name || 'Not selected'}
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
                                </Select>

                                <div className="flex items-center justify-between">
                                  <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={createFilter}
                                    disabled={
                                      !currentFilter.name.trim() || 
                                      !selectedCategoryForFilters || 
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

              {/* Overview Column */}
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
                    <Tag color="blue">
                      {existingCategories.subcategories.length + existingCategories.childCategories.length + 1} Total Categories
                    </Tag>
                  }
                >
                  {/* Category Hierarchy Summary */}
                  <div className="mb-6">
                    <Text strong className="block mb-3">Category Hierarchy</Text>
                    <div className="space-y-3">
                      {/* Parent Category */}
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <CrownOutlined className="text-green-600" />
                          <div className="flex-1">
                            <Text strong>{existingCategories.parent?.name}</Text>
                            <div>
                              <Text type="secondary" className="text-xs">
                                Parent Category • ID: {existingCategories.parent?.id}
                              </Text>
                            </div>
                          </div>
                          <Tag color="green">Level 1</Tag>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {existingCategories.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200 ml-4">
                          <div className="flex items-center space-x-3">
                            <FolderOutlined className="text-blue-600" />
                            <div className="flex-1">
                              <Text strong>{subcategory.name}</Text>
                              <div>
                                <Text type="secondary" className="text-xs">
                                  Subcategory • ID: {subcategory.id} • {subcategory.children?.length || 0} children
                                </Text>
                              </div>
                            </div>
                            <Tag color="blue">Level 2</Tag>
                          </div>
                        </div>
                      ))}

                      {/* Child Categories */}
                      {existingCategories.childCategories.map((childCategory) => (
                        <div key={childCategory.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200 ml-8">
                          <div className="flex items-center space-x-3">
                            <FolderOpenOutlined className="text-purple-600" />
                            <div className="flex-1">
                              <Text strong>{childCategory.name}</Text>
                              <div>
                                <Text type="secondary" className="text-xs">
                                  Child Category • ID: {childCategory.id} • {childCategory.filter_data?.length || 0} filters
                                </Text>
                              </div>
                            </div>
                            <Tag color="purple">Level 3</Tag>
                          </div>
                        </div>
                      ))}

                      {/* Newly Created Categories */}
                      {createdCategories.subcategoryId && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 ml-4">
                          <div className="flex items-center space-x-3">
                            <FolderOutlined className="text-orange-600" />
                            <div className="flex-1">
                              <Text strong>{createdCategories.subcategoryName}</Text>
                              <div>
                                <Text type="secondary" className="text-xs">
                                  New Subcategory • ID: {createdCategories.subcategoryId}
                                </Text>
                              </div>
                            </div>
                            <Tag color="orange">New</Tag>
                          </div>
                        </div>
                      )}

                      {createdCategories.childSubcategoryId && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 ml-8">
                          <div className="flex items-center space-x-3">
                            <FolderOpenOutlined className="text-orange-600" />
                            <div className="flex-1">
                              <Text strong>{createdCategories.childSubcategoryName}</Text>
                              <div>
                                <Text type="secondary" className="text-xs">
                                  New Child Category • ID: {createdCategories.childSubcategoryId}
                                </Text>
                              </div>
                            </div>
                            <Tag color="orange">New</Tag>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Filters Summary */}
                  <div className="mt-6">
                    <Text strong className="block mb-3">Filters Summary</Text>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Text>Existing Filters:</Text>
                        <Tag color="blue">{existingFilters.length}</Tag>
                      </div>
                      <div className="flex justify-between">
                        <Text>New Filters:</Text>
                        <Tag color="orange">{filters.length}</Tag>
                      </div>
                      <div className="flex justify-between">
                        <Text strong>Total Filters:</Text>
                        <Tag color="green">{existingFilters.length + filters.length}</Tag>
                      </div>
                    </div>
                  </div>

                  {/* Success Alert */}
                  {(createdCategories.childSubcategoryId || createdCategories.subcategoryId || filters.length > 0) && (
                    <Alert
                      message="Changes Applied Successfully!"
                      description="Your edits and new content have been saved."
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

export default EditCategory;