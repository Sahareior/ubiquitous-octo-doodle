// CategoryDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Category.css';
import { FaArrowLeft, FaArrowRight, FaChevronDown, FaChevronUp, FaBars, FaTimes, FaChevronRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../../../redux/slices/Apis/customersApi';

const CategoryDropdown = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [closing, setClosing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null);
  const [mobileActiveSubcategory, setMobileActiveSubcategory] = useState(null);
  const navigate = useNavigate();
  
  const { data: rtkCategories, isLoading, error } = useGetCategoriesQuery();
  
  const dropdownRef = useRef(null);
  const navRef = useRef(null);
  const timeoutRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Use RTK Query data instead of localhost fetch
  useEffect(() => {
    if (rtkCategories && rtkCategories.results) {
      setCategories(rtkCategories.results);
    }
  }, [rtkCategories]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
        setMobileActiveCategory(null);
        setMobileActiveSubcategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Recursive function to find category hierarchy
  const findCategoryHierarchy = (subcategoryId, level = 0) => {
    for (const category of categories) {
      if (category.id === subcategoryId) {
        return {
          main: category,
          sub: null,
          nested: null
        };
      }
      
      if (category.children && category.children.length > 0) {
        for (const sub of category.children) {
          if (sub.id === subcategoryId) {
            return {
              main: category,
              sub: sub,
              nested: null
            };
          }
          
          if (sub.children && sub.children.length > 0) {
            for (const nested of sub.children) {
              if (nested.id === subcategoryId) {
                return {
                  main: category,
                  sub: sub,
                  nested: nested
                };
              }
            }
          }
        }
      }
    }
    return null;
  };

  // Handle subcategory click
// Handle subcategory click — now includes filter_data
const handleSubcategoryClick = (subcategory) => {
  const subcategoryId = subcategory.id;

  if (!subcategoryId) {
    console.error('No ID found for subcategory:', subcategory);
    return;
  }

  const hierarchy = findCategoryHierarchy(subcategoryId);

  if (!hierarchy) {
    console.error('Could not find category hierarchy for:', subcategory);
    return;
  }

  // Extract filter_data from the **clicked subcategory** (leaf node)
const clickedCategory = hierarchy.nested || hierarchy.sub || hierarchy.main;
const filterData = clickedCategory?.filter_data || [];

  const navigationData = {
    selectedCategoryId: hierarchy.main?.id,
    selectedSubCategoryId: hierarchy.sub?.id,
    selectedNestedId: hierarchy.nested?.id,
    categoryHierarchy: hierarchy,
    selectedCategory: hierarchy.main,
    selectedSubCategory: hierarchy.sub,
    selectedNestedCategory: hierarchy.nested,
    text: hierarchy.nested?.name || hierarchy.sub?.name || hierarchy.main?.name || "Products",
    
    // NEW: Pass filter data for the clicked category
    filterData: filterData
  };

  navigate('/filter', { 
    state: navigationData
  });

  // Close all menus
  setIsVisible(false);
  setIsMobileMenuOpen(false);
  setActiveCategory(null);
  setMobileActiveCategory(null);
  setMobileActiveSubcategory(null);
};

  // Mobile menu handlers
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      setMobileActiveCategory(null);
      setMobileActiveSubcategory(null);
    }
  };

  const handleMobileCategoryClick = (category) => {
    if (mobileActiveCategory?.id === category.id) {
      setMobileActiveCategory(null);
    } else {
      setMobileActiveCategory(category);
      setMobileActiveSubcategory(null);
    }
  };

  const handleMobileSubcategoryClick = (subcategory) => {
    if (mobileActiveSubcategory?.id === subcategory.id) {
      setMobileActiveSubcategory(null);
    } else {
      setMobileActiveSubcategory(subcategory);
    }
  };

  // Component to render nested subcategories for desktop
  const SubcategoryColumn = ({ subcategory, level = 0 }) => {
    const hasChildren = subcategory.children && subcategory.children.length > 0;

    return (
      <div className={`subcategory-column level-${level}`}>
        <h4 
          onClick={() => handleSubcategoryClick(subcategory)} 
          className="subcategory-name w-[230px] hover:cursor-pointer flex gap-3 items-center popmed hover:text-blue-600 transition-colors"
        >
          {subcategory.name}
          {hasChildren && <FaArrowRight size={12} />}
        </h4>
        
        {hasChildren && (
          <div className="nested-subcategories ml-4 mt-2 space-y-2">
            {subcategory.children.map((nestedSubcat, nestedIndex) => (
              <SubcategoryColumn 
                key={nestedSubcat.id || nestedIndex} 
                subcategory={nestedSubcat} 
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Component to render mobile subcategories
  const MobileSubcategoryList = ({ subcategories, level = 0, parentCategory }) => {
    return (
      <div className={`mobile-subcategory-list level-${level}`}>
        {level > 0 && (
          <button 
            onClick={() => level === 1 ? setMobileActiveCategory(null) : setMobileActiveSubcategory(null)}
            className="mobile-back-button flex items-center gap-2 text-blue-600 font-medium mb-4 p-2"
          >
            <FaArrowLeft size={14} />
            Back to {level === 1 ? 'Categories' : parentCategory?.name}
          </button>
        )}
        
        {subcategories.map((subcategory, index) => {
          const hasChildren = subcategory.children && subcategory.children.length > 0;
          
          return (
            <div key={subcategory.id || index} className="mobile-subcategory-item">
              <div 
                className={`mobile-subcategory-header ${hasChildren ? 'has-children' : ''}`}
                onClick={() => {
                  if (hasChildren) {
                    handleMobileSubcategoryClick(subcategory);
                  } else {
                    handleSubcategoryClick(subcategory);
                  }
                }}
              >
                <span className="mobile-subcategory-name">{subcategory.name}</span>
                {hasChildren && <FaChevronRight size={14} className="text-gray-400" />}
              </div>
              
              {hasChildren && mobileActiveSubcategory?.id === subcategory.id && (
                <MobileSubcategoryList 
                  subcategories={subcategory.children} 
                  level={level + 1}
                  parentCategory={subcategory}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Transform API data to match component structure
const transformCategories = (apiCategories) => {
  return apiCategories.map(category => {
    const transformNode = (node) => ({
      id: node.id,
      name: node.name,
      slug: node.slug,
      description: node.description || `Explore our ${node.name} collection`,
      image: node.image,
      // Preserve filter_data on leaf nodes
      filter_data: node.filter_data || [],
      // Recursively transform children
      children: node.children ? node.children.map(transformNode) : []
    });

    const transformed = transformNode(category);

    return {
      ...transformed,
      subcategories: transformed.children, // alias for UI
      imagePreview: transformed.image,
      promo: {
        title: `${category.name} Collection`,
        description: category.description || `Explore our ${category.name} collection`,
        imageText: category.name
      }
    };
  });
};

  const transformedCategories = transformCategories(categories);

  const handleMouseEnterNav = (categoryId) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setClosing(false);
    setIsVisible(true);
    setActiveCategory(transformedCategories.find(cat => cat.id === categoryId));
  };

  const handleMouseLeaveNav = () => {
    timeoutRef.current = setTimeout(() => {
      if (!dropdownRef.current?.matches(':hover')) {
        setClosing(true);
        setTimeout(() => {
          setIsVisible(false);
          setActiveCategory(null);
        }, 200);
      }
    }, 150);
  };

  const handleMouseEnterDropdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setClosing(false);
  };

  const handleMouseLeaveDropdown = () => {
    timeoutRef.current = setTimeout(() => {
      if (!navRef.current?.matches(':hover')) {
        setClosing(true);
        setTimeout(() => {
          setIsVisible(false);
          setActiveCategory(null);
        }, 200);
      }
    }, 150);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return <div className="enhanced-category-dropdown">Loading categories...</div>;
  }

  if (error) {
    return <div className="enhanced-category-dropdown">Error loading categories</div>;
  }

  return (
    <div className="enhanced-category-dropdown">
      {/* Desktop Navigation */}
      <nav 
        ref={navRef}
        className="category-nav hidden md:block"
        onMouseLeave={handleMouseLeaveNav}
      >
        <ul className="category-list overflow-x-scroll scrollbar-hide">
          {transformedCategories.map(category => (
            <li 
              key={category.id}
              className={`category-item ${activeCategory?.id === category.id ? 'active' : ''}`}
              onMouseEnter={() => handleMouseEnterNav(category.id)}
            >
              <span className="category-name">{category.name}</span>
              <span className="dropdown-arrow">▼</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Menu Trigger */}
      <div className="mobile-menu-trigger md:hidden">
        <button 
          onClick={toggleMobileMenu}
          className="w-full flex items-center justify-between p-4 bg-white border-b border-gray-200 text-lg font-semibold"
        >
          <span>Browse Categories</span>
          {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="mobile-category-menu md:hidden fixed inset-0 bg-white z-50 overflow-y-auto"
        >
          <div className="mobile-menu-header sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Categories</h2>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="mobile-menu-content p-4">
            {!mobileActiveCategory ? (
              // Main categories list
              <div className="main-categories-list space-y-2">
                {transformedCategories.map(category => (
                  <div 
                    key={category.id}
                    className="mobile-category-item border-b border-gray-100"
                  >
                    <button
                      onClick={() => handleMobileCategoryClick(category)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-800">{category.name}</span>
                      <FaChevronRight size={14} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Subcategories for selected category
              <MobileSubcategoryList 
                subcategories={mobileActiveCategory.subcategories} 
                level={1}
                parentCategory={mobileActiveCategory}
              />
            )}
          </div>
        </div>
      )}

      {/* Desktop Dropdown */}
      <div 
        ref={dropdownRef}
        className={`dropdown-menu hidden md:block ${isVisible ? 'visible' : ''} ${closing ? 'closing' : ''}`}
        onMouseEnter={handleMouseEnterDropdown}
        onMouseLeave={handleMouseLeaveDropdown}
      >
        {activeCategory && (
          <div className="dropdown-content">
            <div className="subcategories-section">
              <h3 className="section-title">{activeCategory.name}</h3>
              <div className="subcategories-grid">
                {activeCategory.subcategories.map((subcategory, index) => (
                  <SubcategoryColumn 
                    key={subcategory.id || index} 
                    subcategory={subcategory} 
                    level={0}
                  />
                ))}
              </div>
            </div>
            
            <div className="promotional-section">
              <div className="promo-card">
                {activeCategory?.imagePreview ? (
                  <img className='w-full h-60 object-cover' src={activeCategory.imagePreview} alt={activeCategory.name} />
                ) : (
                  <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="promo-content">
                  <h4 className="promo-title">{activeCategory.promo.title}</h4>
                  <p className="promo-description">
                    {activeCategory.promo.description}
                  </p>
                </div>
              </div>
              
              <div className="promo-features">
                <div className="feature-item">
                  <span className="feature-icon">🚚</span>
                  <span className="feature-text">Free Shipping</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">↩️</span>
                  <span className="feature-text">30-Day Returns</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🛡️</span>
                  <span className="feature-text">2-Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay to capture clicks when dropdown is open */}
      {isVisible && <div className="dropdown-overlay hidden md:block" />}
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
      )}
    </div>
  );
};

export default CategoryDropdown;