// CategoryNavigation.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CategoryNavigation = ({ categories }) => {
  const categoryStructure = [
    {
      id: 1,
      name: 'Lighting',
      slug: 'lighting',
      subcategories: [
        { id: 11, name: 'Ceiling Lights', slug: 'ceiling-lights' },
        { id: 12, name: 'Table Lamps', slug: 'table-lamps' },
        { id: 13, name: 'Outdoor Lighting', slug: 'outdoor-lighting' },
        { id: 14, name: 'Smart Lighting', slug: 'smart-lighting' }
      ]
    },
    {
      id: 2,
      name: 'Furniture',
      slug: 'furniture',
      subcategories: [
        { id: 21, name: 'Sofas & Couches', slug: 'sofas-couches' },
        { id: 22, name: 'Tables', slug: 'tables' },
        { id: 23, name: 'Chairs', slug: 'chairs' },
        { id: 24, name: 'Storage', slug: 'storage' }
      ]
    },
    {
      id: 3,
      name: 'Electronics',
      slug: 'electronics',
      subcategories: [
        { id: 31, name: 'Smart Home', slug: 'smart-home' },
        { id: 32, name: 'Audio', slug: 'audio' },
        { id: 33, name: 'Gadgets', slug: 'gadgets' }
      ]
    }
  ];

  return (
    <div className="category-navigation bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <div className="space-y-4">
        {categoryStructure.map(category => (
          <div key={category.id} className="category-group">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              {category.name}
            </h3>
            <div className="subcategories grid grid-cols-2 gap-2 ml-4">
              {category.subcategories.map(subcategory => (
                <Link
                  key={subcategory.id}
                  to={`/filter?category=${category.slug}&subcategory=${subcategory.slug}`}
                  state={{ 
                    category: category.name,
                    subcategory: subcategory.name,
                    categorySlug: category.slug
                  }}
                  className="text-gray-600 hover:text-[#CBA135] transition-colors duration-200 py-1 px-2 rounded hover:bg-gray-50"
                >
                  {subcategory.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;