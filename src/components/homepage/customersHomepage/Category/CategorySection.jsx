// CategoryDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Category.css';
import { FaArrowLeft } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';

const CategoryDropdown = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [closing, setClosing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const dropdownRef = useRef(null);
  const navRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Recursive function to transform nested subcategories (only names, no filter options)
  const transformSubcategories = (subcategories) => {
    return subcategories.map(subcat => {
      const transformedSubcat = {
        name: subcat.name,
        slug: subcat.slug,
        description: subcat.description,
        subcategories: subcat.subcategories && subcat.subcategories.length > 0 
          ? transformSubcategories(subcat.subcategories)
          : []
      };

      return transformedSubcat;
    });
  };

  // Transform API data to match component structure
  const transformCategories = (apiCategories) => {
    return apiCategories.map(category => {
      const subcategories = transformSubcategories(category.subcategories || []);

      const promo = {
        title: `${category.name} Collection`,
        description: category.description || `Explore our ${category.name} collection`,
        imageText: category.name
      };

      return {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        subcategories: subcategories,
        promo: promo,
        imagePreview: category.imagePreview
      };
    });
  };

  // Component to render nested subcategories
  const SubcategoryColumn = ({ subcategory, level = 0, parentCategory = null }) => {
    const hasNestedSubcategories = subcategory.subcategories && subcategory.subcategories.length > 0;

    const handleSubcategoryClick = () => {
      // Prepare the category data to pass to filter page
      const categoryData = {
        selectedCategory: parentCategory || activeCategory,
        selectedSubcategory: subcategory,
        level: level
      };

      // Navigate to filter page with state
      navigate('/filter', { 
        state: { 
          categoryData,
          categoryHierarchy: {
            main: activeCategory,
            sub: level === 0 ? subcategory : null,
            nested: level === 1 ? subcategory : null
          }
        }
      });
    };

    return (
      <div className={`subcategory-column level-${level}`}>
        <h4 
          onClick={handleSubcategoryClick} 
          className="subcategory-name hover:cursor-pointer flex gap-3 items-center popmed"
        >
          {subcategory.name}
          {level === 1 && <FaArrowRight />}
        </h4>
        
        {/* Display nested subcategories if they exist */}
        {hasNestedSubcategories && (
          <div className="text-[40px]">
            {subcategory.subcategories.map((nestedSubcat, nestedIndex) => (
              <SubcategoryColumn 
                key={nestedIndex} 
                subcategory={nestedSubcat} 
                level={level + 1}
                parentCategory={activeCategory} // Pass the main category as parent
              />
            ))}
          </div>
        )}
      </div>
    );
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

  if (loading) {
    return <div className="enhanced-category-dropdown">Loading categories...</div>;
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
                    key={index} 
                    subcategory={subcategory} 
                    level={0}
                    parentCategory={activeCategory}
                  />
                ))}
              </div>
            </div>
            
            <div className="promotional-section">
              <div className="promo-card">
                <img className='w-full h-60' src={activeCategory?.imagePreview} alt="" />
                <div className="promo-image">
                  <div className="placeholder-image">
                  </div>
                </div>
                <div className="promo-content">
                  <h4 className="promo-title">{activeCategory.promo.title}</h4>
                  <p className="promo-description">
                    {activeCategory.promo.description}
                  </p>
                  <button className="promo-button">Shop Now</button>
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