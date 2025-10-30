// CategoryDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Category.css';
import { FaArrowLeft } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../../../redux/slices/Apis/customersApi';

const CategoryDropdown = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [closing, setClosing] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  
  const { data: rtkCategories, isLoading, error } = useGetCategoriesQuery();
  
  const dropdownRef = useRef(null);
  const navRef = useRef(null);
  const timeoutRef = useRef(null);

  console.log(rtkCategories, 'RTK Categories data');

  // Use RTK Query data instead of localhost fetch
  useEffect(() => {
    if (rtkCategories && rtkCategories.results) {
      setCategories(rtkCategories.results);
    }
  }, [rtkCategories]);

  // Recursive function to find category hierarchy
  const findCategoryHierarchy = (subcategoryId, level = 0) => {
    for (const category of categories) {
      // Check if this is the main category
      if (category.id === subcategoryId) {
        return {
          main: category,
          sub: null,
          nested: null
        };
      }
      
      // Check children (subcategories)
      if (category.children && category.children.length > 0) {
        for (const sub of category.children) {
          // Check if this subcategory matches
          if (sub.id === subcategoryId) {
            return {
              main: category,
              sub: sub,
              nested: null
            };
          }
          
          // Check nested children
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
// In CategoryDropdown.jsx - update the handleSubcategoryClick function
const handleSubcategoryClick = (subcategory) => {
  console.log('Clicked subcategory:', subcategory);
  
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

  // Prepare navigation data with full category information
  const navigationData = {
    selectedCategoryId: hierarchy.main?.id,
    selectedSubCategoryId: hierarchy.sub?.id,
    selectedNestedId: hierarchy.nested?.id,
    categoryHierarchy: hierarchy,
    // Add the actual category objects for display
    selectedCategory: hierarchy.main,
    selectedSubCategory: hierarchy.sub,
    selectedNestedCategory: hierarchy.nested,
    // Add text for display
    text: hierarchy.nested?.name || hierarchy.sub?.name || hierarchy.main?.name || "Products"
  };

  console.log('Navigating with data:', navigationData);

  // Navigate to filter page with category data
  navigate('/filter', { 
    state: navigationData
  });

  // Close dropdown
  setIsVisible(false);
  setActiveCategory(null);
};

  // Component to render nested subcategories
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
        
        {/* Display children if they exist */}
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

  // Transform API data to match component structure
  const transformCategories = (apiCategories) => {
    return apiCategories.map(category => {
      // Create transformed category structure
      const transformedCategory = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || `Explore our ${category.name} collection`,
        subcategories: category.children || [], // Map children to subcategories
        imagePreview: category.image
      };

      // Add promo section
      transformedCategory.promo = {
        title: `${category.name} Collection`,
        description: category.description || `Explore our ${category.name} collection`,
        imageText: category.name
      };

      return transformedCategory;
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
      <nav 
        ref={navRef}
        className="category-nav"
        onMouseLeave={handleMouseLeaveNav}
      >
        <ul className="category-list">
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

      <div 
        ref={dropdownRef}
        className={`dropdown-menu ${isVisible ? 'visible' : ''} ${closing ? 'closing' : ''}`}
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
      {isVisible && <div className="dropdown-overlay" />}
    </div>
  );
};

export default CategoryDropdown;