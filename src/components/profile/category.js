// Filter configuration structure
export const filterConfig = {
  // Common filters that apply to all products
  commonFilters: {
    price: {
      type: 'range',
      min: 0,
      max: 5000,
      step: 100,
      label: 'Price Range'
    },
    rating: {
      type: 'rating',
      label: 'Customer Rating'
    },
    availability: {
      type: 'checkbox',
      label: 'Availability'
    }
  },
  
  // Category-specific filters
  categoryFilters: {
    // Lighting category filters
    lighting: {
      color_temperature: {
        type: 'radio',
        options: ['Warm White', 'Cool White', 'Daylight', 'RGB'],
        label: 'Color Temperature'
      },
      bulb_type: {
        type: 'checkbox',
        options: ['LED', 'Incandescent', 'Halogen', 'Fluorescent'],
        label: 'Bulb Type'
      },
      wattage: {
        type: 'range',
        min: 0,
        max: 200,
        step: 10,
        label: 'Wattage'
      },
      lumens: {
        type: 'range',
        min: 0,
        max: 5000,
        step: 100,
        label: 'Brightness (Lumens)'
      }
    },
    
    // Furniture category filters
    furniture: {
      material: {
        type: 'checkbox',
        options: ['Wood', 'Metal', 'Glass', 'Plastic', 'Fabric'],
        label: 'Material'
      },
      style: {
        type: 'checkbox',
        options: ['Modern', 'Traditional', 'Industrial', 'Minimalist'],
        label: 'Style'
      },
      dimensions: {
        type: 'dimension',
        fields: ['length', 'width', 'height'],
        label: 'Dimensions'
      },
      weight_capacity: {
        type: 'range',
        min: 0,
        max: 1000,
        step: 50,
        label: 'Weight Capacity (kg)'
      }
    },
    
    // Electronics category filters
    electronics: {
      brand: {
        type: 'checkbox',
        options: ['Samsung', 'Apple', 'Sony', 'LG'],
        label: 'Brand'
      },
      connectivity: {
        type: 'checkbox',
        options: ['Bluetooth', 'Wi-Fi', 'USB-C', 'HDMI'],
        label: 'Connectivity'
      },
      power_consumption: {
        type: 'range',
        min: 0,
        max: 500,
        step: 10,
        label: 'Power Consumption (W)'
      }
    }
  }
};