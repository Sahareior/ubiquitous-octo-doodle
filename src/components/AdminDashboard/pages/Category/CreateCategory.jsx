import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, FieldArray } from "formik";
import * as Yup from "yup";

/* -----------------------------------
   CONSTANTS & CONFIG
------------------------------------*/
const FILTER_TYPES = [
  // { value: "text", label: "Text Input", icon: "📝" },
  // { value: "number", label: "Number Input", icon: "🔢" },
  // { value: "select", label: "Dropdown", icon: "📋" },
  { value: "checkbox", label: "Checkbox Group", icon: "☑️" },
  { value: "radio", label: "Radio Group", icon: "🔘" },
  // { value: "range", label: "Range Slider", icon: "📊" },
  // { value: "color", label: "Color Picker", icon: "🎨" },
  { value: "boolean", label: "Yes/No Switch", icon: "🔛" },
];

const FILTER_PRESETS = {
  lighting: [
    { name: "Wattage", key: "wattage", type: "number", required: true },
    { name: "Color Temperature", key: "color_temperature", type: "select", options: ["Warm White", "Cool White", "Daylight"] },
    { name: "Bulb Type", key: "bulb_type", type: "checkbox", options: ["LED", "Incandescent", "Halogen"] },
  ],
  furniture: [
    { name: "Material", key: "material", type: "select", options: ["Wood", "Metal", "Glass", "Fabric"] },
    { name: "Dimensions", key: "dimensions", type: "text", required: true },
    { name: "Weight Capacity", key: "weight_capacity", type: "number" },
  ]
};

/* -----------------------------------
   STYLES & THEMING
------------------------------------*/
const styles = {
  // Colors
  primary: "#CBB16B",
  primaryLight: "#e8dbb5",
  secondary: "#667eea",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  
  // Neutrals
  dark: "#1f2937",
  grayDark: "#374151",
  gray: "#6b7280",
  grayLight: "#d1d5db",
  grayLighter: "#f3f4f6",
  white: "#ffffff",
  
  // Spacing
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px"
  },
  
  // Border Radius
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px"
  },
  
  // Shadows
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  }
};

/* -----------------------------------
   REUSABLE COMPONENTS
------------------------------------*/

// Custom Input Component
const CustomInput = ({ 
  label, 
  error, 
  helperText, 
  prefix, 
  suffix,
  containerStyle = {},
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{ marginBottom: styles.spacing.lg, ...containerStyle }}>
      {label && (
        <label style={{
          display: "block",
          marginBottom: styles.spacing.sm,
          fontWeight: "600",
          color: styles.dark,
          fontSize: "20px"
        }}>
          {label}
        </label>
      )}
      
      <div style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        border: `1px solid ${error ? styles.danger : isFocused ? styles.primary : styles.grayLight}`,
        borderRadius: styles.borderRadius.md,
        backgroundColor: styles.white,
        transition: "all 0.2s ease",
        boxShadow: isFocused ? `0 0 0 3px ${styles.primaryLight}40` : styles.shadow.sm,
        overflow: "hidden"
      }}>
        {prefix && (
          <div style={{
            padding: `12px ${styles.spacing.sm}`,
            backgroundColor: styles.grayLighter,
            color: styles.gray,
            fontSize: "14px",
            borderRight: `1px solid ${styles.grayLight}`
          }}>
            {prefix}
          </div>
        )}
        
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "12px 16px",
            fontSize: "19px",
            backgroundColor: "transparent",
            width: "100%",
            color: styles.dark
          }}
        />
        
        {suffix && (
          <div style={{
            padding: `0 ${styles.spacing.sm}`,
            color: styles.gray,
            fontSize: "14px"
          }}>
            {suffix}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div style={{
          marginTop: styles.spacing.xs,
          fontSize: "12px",
          color: error ? styles.danger : styles.gray
        }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

// Custom TextArea Component
const CustomTextArea = ({ label, error, helperText, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{ marginBottom: styles.spacing.lg }}>
      {label && (
        <label style={{
          display: "block",
          marginBottom: styles.spacing.sm,
          fontWeight: "600",
          color: styles.dark,
          fontSize: "20px"
        }}>
          {label}
        </label>
      )}
      
      <div style={{
        border: `1px solid ${error ? styles.danger : isFocused ? styles.primary : styles.grayLight}`,
        borderRadius: styles.borderRadius.md,
        backgroundColor: styles.white,
        transition: "all 0.2s ease",
        boxShadow: isFocused ? `0 0 0 3px ${styles.primaryLight}40` : styles.shadow.sm
      }}>
        <textarea
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            padding: "12px 16px",
            fontSize: "14px",
            backgroundColor: "transparent",
            resize: "vertical",
            minHeight: "80px",
            fontFamily: "inherit",
            color: styles.dark
          }}
        />
      </div>
      
      {(error || helperText) && (
        <div style={{
          marginTop: styles.spacing.xs,
          fontSize: "12px",
          color: error ? styles.danger : styles.gray
        }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

// Custom Select Component
const CustomSelect = ({ label, error, helperText, options = [], ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{ marginBottom: styles.spacing.lg }}>
      {label && (
        <label style={{
          display: "block",
          marginBottom: styles.spacing.sm,
          fontWeight: "600",
          color: styles.dark,
          fontSize: "19px"
        }}>
          {label}
        </label>
      )}
      
      <div style={{
        position: "relative",
        border: `1px solid ${error ? styles.danger : isFocused ? styles.primary : styles.grayLight}`,
        borderRadius: styles.borderRadius.md,
        backgroundColor: styles.white,
        transition: "all 0.2s ease",
        boxShadow: isFocused ? `0 0 0 3px ${styles.primaryLight}40` : styles.shadow.sm
      }}>
        <select
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            padding: "12px 16px",
            fontSize: "17px",
            backgroundColor: "transparent",
            appearance: "none",
            color: styles.dark
          }}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon && <span style={{ marginRight: "8px" }}>{option.icon}</span>}
              {option.label}
            </option>
          ))}
        </select>
        
        <div style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: styles.gray
        }}>
          ▼
        </div>
      </div>
      
      {(error || helperText) && (
        <div style={{
          marginTop: styles.spacing.xs,
          fontSize: "12px",
          color: error ? styles.danger : styles.gray
        }}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

// Custom Button Component
const CustomButton = ({ 
  children, 
  variant = "primary", 
  size = "medium",
  disabled = false,
  loading = false,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: disabled ? styles.grayLight : styles.primary,
          color: styles.white,
          border: `1px solid ${styles.primary}`
        };
      case "secondary":
        return {
          backgroundColor: "transparent",
          color: styles.primary,
          border: `1px solid ${styles.primary}`
        };
      case "danger":
        return {
          backgroundColor: disabled ? styles.grayLight : styles.danger,
          color: styles.white,
          border: `1px solid ${styles.danger}`
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: styles.primary,
          border: "1px solid transparent"
        };
      default:
        return {
          backgroundColor: disabled ? styles.grayLighter : styles.white,
          color: styles.dark,
          border: `1px solid ${styles.grayLight}`
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { padding: "8px 16px", fontSize: "12px" };
      case "large":
        return { padding: "16px 24px", fontSize: "16px" };
      default:
        return { padding: "12px 20px", fontSize: "14px" };
    }
  };

  const buttonStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    borderRadius: styles.borderRadius.md,
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.6 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    textDecoration: "none",
    ...props.style
  };

  const hoverStyles = !disabled ? {
    transform: "translateY(-1px)",
    boxShadow: styles.shadow.md
  } : {};

  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...buttonStyles,
        ...(isHovered && !disabled ? hoverStyles : {}),
        boxShadow: buttonStyles.boxShadow || styles.shadow.sm
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {loading && (
        <div style={{
          width: "16px",
          height: "16px",
          border: `2px solid transparent`,
          borderTop: `2px solid currentColor`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      )}
      {children}
    </button>
  );
};

// Custom Card Component
const CustomCard = ({ title, children, extra, style = {} }) => {
  return (
    <div style={{
      backgroundColor: styles.white,
      borderRadius: styles.borderRadius.lg,
      boxShadow: styles.shadow.md,
      border: `1px solid ${styles.grayLight}`,
      overflow: "hidden",
      marginBottom: styles.spacing.lg,
      ...style
    }}>
      {title && (
        <div style={{
          padding: `${styles.spacing.lg} ${styles.spacing.xl}`,
          borderBottom: `1px solid ${styles.grayLight}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: styles.grayLighter
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: "18px", 
            fontWeight: "700",
            color: styles.dark
          }}>
            {title}
          </h3>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div style={{ padding: styles.spacing.xl }}>
        {children}
      </div>
    </div>
  );
};

// Custom Badge Component
const CustomBadge = ({ count, color = styles.primary, style = {} }) => {
  if (!count && count !== 0) return null;
  
  return (
    <span style={{
      backgroundColor: color,
      color: styles.white,
      borderRadius: "10px",
      padding: "2px 8px",
      fontSize: "11px",
      fontWeight: "600",
      minWidth: "18px",
      textAlign: "center",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      ...style
    }}>
      {count}
    </span>
  );
};

// Enhanced Image Uploader
const ImageUploader = ({ previewUrl, onUpload, label = "Category Image" }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log(file,'jj')
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      <label style={{
        display: "block",
        marginBottom: styles.spacing.sm,
        fontWeight: "600",
        color: styles.dark,
        fontSize: "14px"
      }}>
        {label}
      </label>
      
      <div style={{
        border: `2px dashed ${styles.grayLight}`,
        borderRadius: styles.borderRadius.lg,
        padding: styles.spacing.xl,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backgroundColor: previewUrl ? "transparent" : styles.grayLighter,
        position: "relative",
        overflow: "hidden"
      }}
      onClick={() => document.getElementById('image-upload').click()}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = styles.primary;
        e.currentTarget.style.backgroundColor = styles.primaryLight + "20";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = styles.grayLight;
        e.currentTarget.style.backgroundColor = previewUrl ? "transparent" : styles.grayLighter;
      }}
      >
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        
        {previewUrl ? (
          <div style={{ position: "relative" }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: "100%",
                maxWidth: "200px",
                height: "120px",
                objectFit: "cover",
                borderRadius: styles.borderRadius.md,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "rgba(0,0,0,0.7)",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: styles.white,
                fontSize: "12px"
              }}
            >
              👁️
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: styles.gray,
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📷</div>
            <div style={{ fontWeight: "600" }}>Upload Image</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              Click to browse or drag and drop
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Filter Type Badge
const FilterTypeBadge = ({ type }) => {
  const filterType = FILTER_TYPES.find(ft => ft.value === type);
  return (
    <span style={{ 
      backgroundColor: styles.primaryLight,
      color: styles.dark,
      borderRadius: styles.borderRadius.sm,
      padding: "4px 8px",
      fontSize: "14px",
      fontWeight: "500",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    }}>
      <span>{filterType?.icon}</span>
      {filterType?.label}
    </span>
  );
};

// Enhanced Filter Editor
const FilterEditor = ({
  subIndex, // This now contains the full path like "subcategories.0.subcategories.0"
  filter,
  filterIndex,
  setFieldValue,
  removeFilter,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <CustomCard
      style={{ 
        marginBottom: styles.spacing.lg,
        border: `1px solid ${styles.grayLight}`,
      }}
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: styles.spacing.sm }}>
            <span style={{ fontWeight: "600", color: styles.dark }}>Filter {filterIndex + 1}</span>
            <FilterTypeBadge type={filter.type} />
            {filter.required && (
              <span style={{
                backgroundColor: styles.danger,
                color: styles.white,
                borderRadius: styles.borderRadius.sm,
                padding: "2px 6px",
                fontSize: "10px",
                fontWeight: "600"
              }}>
                Required
              </span>
            )}
            {filter.searchable && (
              <span style={{
                backgroundColor: styles.success,
                color: styles.white,
                borderRadius: styles.borderRadius.sm,
                padding: "2px 6px",
                fontSize: "10px",
                fontWeight: "600"
              }}>
                Searchable
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: styles.spacing.sm }}>
            <CustomButton
              variant="ghost"
              size="small"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              ⚙️ Settings
            </CustomButton>
            <CustomButton
              variant="danger"
              size="small"
              onClick={() => {
                if (window.confirm("Delete this filter? This action cannot be undone.")) {
                  removeFilter(filterIndex);
                }
              }}
            >
              🗑️
            </CustomButton>
          </div>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: styles.spacing.lg }}>
        <Field name={`${subIndex}.filterOptions.${filterIndex}.name`}>
          {({ field, form }) => (
            <CustomInput
              label="Filter Name"
              placeholder="e.g., Color, Size, Material"
              error={form.errors.subcategories?.[subIndex]?.filterOptions?.[filterIndex]?.name}
              {...field}
            />
          )}
        </Field>

        <Field name={`${subIndex}.filterOptions.${filterIndex}.key`}>
          {({ field, form }) => (
            <CustomInput
              label="Filter Key"
              placeholder="e.g., color, size"
              prefix="filter_"
              error={form.errors.subcategories?.[subIndex]?.filterOptions?.[filterIndex]?.key}
              {...field}
            />
          )}
        </Field>

        <Field name={`${subIndex}.filterOptions.${filterIndex}.type`}>
          {({ field }) => (
            <CustomSelect
              label="Filter Type"
              value={field.value}
              onChange={(e) => setFieldValue(
                `${subIndex}.filterOptions.${filterIndex}.type`,
                e.target.value
              )}
              options={FILTER_TYPES.map(type => ({
                value: type.value,
                label: `${type.icon} ${type.label}`,
                icon: type.icon
              }))}
            />
          )}
        </Field>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div style={{ 
          background: styles.grayLighter, 
          padding: styles.spacing.lg, 
          borderRadius: styles.borderRadius.md, 
          marginTop: styles.spacing.lg 
        }}>
          <h4 style={{ margin: `0 0 ${styles.spacing.md} 0`, color: styles.dark }}>Advanced Settings</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: styles.spacing.lg }}>
            <Field name={`${subIndex}.filterOptions.${filterIndex}.placeholder`}>
              {({ field }) => (
                <CustomInput
                  label="Placeholder Text"
                  placeholder="Enter placeholder text..."
                  {...field}
                />
              )}
            </Field>
            <Field name={`${subIndex}.filterOptions.${filterIndex}.defaultValue`}>
              {({ field }) => (
                <CustomInput
                  label="Default Value"
                  placeholder="Default value..."
                  {...field}
                />
              )}
            </Field>
          </div>
        </div>
      )}

      {/* Options for select/checkbox/radio types */}
{/* Options for select/checkbox/radio types */}
{["select", "checkbox", "radio"].includes(filter.type) && (
  <div style={{ marginTop: styles.spacing.lg }}>
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      marginBottom: styles.spacing.lg,
      paddingBottom: styles.spacing.sm,
      borderBottom: `1px solid ${styles.grayLight}`
    }}>
      <h4 style={{ margin: 0, color: styles.dark }}>Options</h4>
      <span style={{ 
        marginLeft: styles.spacing.sm, 
        color: styles.gray, 
        fontSize: "12px" 
      }}>
        {filter.options?.length || 0} options
      </span>
    </div>
    <FieldArray name={`${subIndex}.filterOptions.${filterIndex}.options`}>
      {({ push, remove }) => (
        <div>
          {filter.options?.map((option, optIdx) => (
            <div key={optIdx} style={{ 
              display: "flex", 
              gap: styles.spacing.sm, 
              marginBottom: styles.spacing.sm, 
              alignItems: "center" 
            }}>
              <CustomBadge 
                count={optIdx + 1} 
                style={{ fontSize: "10px", padding: "2px 6px" }} 
              />
              <Field
                name={`${subIndex}.filterOptions.${filterIndex}.options.${optIdx}`}
              >
                {({ field }) => (
                  <CustomInput
                    {...field}
                    placeholder={`Option ${optIdx + 1}`}
                    containerStyle={{ 
                      marginBottom: 0, 
                      flex: 1,
                      maxWidth: "300px" // Add max width
                    }}
                    style={{ 
                      width: "100%",
                      maxWidth: "300px" // Control input width
                    }}
                  />
                )}
              </Field>
              <CustomButton
                variant="danger"
                size="small"
                onClick={() => remove(optIdx)}
              >
                🗑️
              </CustomButton>
            </div>
          ))}
          <CustomButton
            variant="ghost"
            type="button"
            size="medium"
            onClick={() => push("")}
            style={{ marginTop: styles.spacing.sm }}
          >
            ➕ Add Option
          </CustomButton>
        </div>
      )}
    </FieldArray>
  </div>
)}
    </CustomCard>
  );
};
/* -----------------------------------
   MAIN COMPONENT
------------------------------------*/
const CreateCategoryWithFilters = () => {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [applyMode, setApplyMode] = useState("single");

  const steps = [
    { title: "Basic Info", icon: "📋" },
    { title: "Subcategories", icon: "🏷️" },
    { title: "Filters", icon: "⚙️" },
    { title: "Review", icon: "👁️" },
  ];

const handleBeforeUpload = useCallback((file, setFieldValue) => {
  if (!file.type.startsWith("image/")) {
    alert("Only image files are allowed!");
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be smaller than 5MB!");
    return false;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    // Set BOTH the preview URL and the file object in Formik
    setFieldValue('imagePreview', e.target.result); // For displaying preview
    setFieldValue('image', file); // For the actual file data
  };
  reader.readAsDataURL(file);
  
  return false;
}, []);

const initialValues = {
  name: "",
  slug: "",
  description: "",
  image: null,
  subcategories: [
    { 
      id: Date.now(), 
      name: "", 
      slug: "", 
      description: "", 
      filterOptions: [],
      subcategories: [] // Add nested subcategories array
    },
  ],
};

const getAllLevel2Subcategories = (subcategories, basePath = 'subcategories') => {
  let level2Subcategories = [];
  
  subcategories.forEach((sub, index) => {
    const currentPath = `${basePath}.${index}`;
    
    // If this subcategory has children (Level 2), add them
    if (sub.subcategories && sub.subcategories.length > 0) {
      sub.subcategories.forEach((level2Sub, level2Index) => {
        const level2Path = `${currentPath}.subcategories.${level2Index}`;
        level2Subcategories.push({
          ...level2Sub,
          path: level2Path
        });
      });
    }
  });
  
  return level2Subcategories;
};


// Update the validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Category name is required"),
  slug: Yup.string().required("Slug is required"),
  subcategories: Yup.array().min(1, "At least one subcategory is required").of(
    Yup.object().shape({
      name: Yup.string().required("Subcategory name required"),
      slug: Yup.string().required("Slug required"),
      subcategories: Yup.array().of( // Level 2 subcategories
        Yup.object().shape({
          name: Yup.string().required("Subcategory name required"),
          slug: Yup.string().required("Slug required"),
          // No nested subcategories for Level 2 (removed Level 3)
          filterOptions: Yup.array().of(
            Yup.object().shape({
              name: Yup.string().required("Filter name required"),
              key: Yup.string().required("Filter key required"),
              type: Yup.string().required("Filter type required"),
            })
          )
        })
      )
    })
  ),
});

const handleSubmit = async (values, { setSubmitting }) => {
  try {
    console.log("🎯 Final Form Data:", JSON.stringify(values, null, 2));
    const processSubcategories = (subcategories) => {
  return subcategories?.map(sub => ({
    name: sub.name?.trim(),
    slug: sub.slug?.trim().toLowerCase(),
    description: sub.description?.trim() || '',
    filterOptions: sub.filterOptions?.map(filter => ({
      name: filter.name?.trim(),
      key: filter.key?.trim(),
      type: filter.type,
      options: Array.isArray(filter.options) ? filter.options.filter(opt => opt?.trim()).map(opt => opt.trim()) : [],
      required: Boolean(filter.required),
      searchable: Boolean(filter.searchable),
      placeholder: filter.placeholder?.trim() || '',
      defaultValue: filter.defaultValue?.trim() || ''
    })).filter(filter => filter.name && filter.key && filter.type),
    subcategories: processSubcategories(sub.subcategories) // Recursive call for nested
  })).filter(sub => sub.name && sub.slug);
};
    // Clean the data before sending - remove empty arrays and null values
const submissionData = {
  name: values.name?.trim(),
  slug: values.slug?.trim().toLowerCase(),
  description: values.description?.trim() || '',
  image: values.image || null,
  imagePreview: values.imagePreview || '',
  subcategories: processSubcategories(values.subcategories) // Recursive processing
};





    // Validate required fields
    if (!submissionData.name || !submissionData.slug) {
      throw new Error('Category name and slug are required');
    }

    console.log("📤 Sending data to server:", JSON.stringify(submissionData, null, 2));

    // Send data to your backend API
    const response = await fetch('http://localhost:8000/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || `HTTP error! status: ${response.status}`);
    }

    console.log("✅ Category created successfully:", responseData);
    console.log("📊 Category Details:", {
      name: submissionData.name,
      slug: submissionData.slug,
      subcategoriesCount: submissionData.subcategories.length,
      totalFilters: submissionData.subcategories.reduce((acc, sub) => acc + sub.filterOptions.length, 0)
    });
    
    // Log each subcategory with its filters
    submissionData.subcategories.forEach((sub, index) => {
      console.log(`🏷️ Subcategory ${index + 1}:`, {
        name: sub.name,
        filtersCount: sub.filterOptions.length,
        filters: sub.filterOptions.map(f => ({
          name: f.name,
          type: f.type,
          required: f.required
        }))
      });
    });
    
    alert("Category created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating category:", error);
    alert(`Failed to create category: ${error.message}`);
  } finally {
    setSubmitting(false);
  }
};


const renderCategoryTree = (subcategories, level = 0) => {
  return subcategories.map((sub, index) => (
    <div key={sub.id} style={{ 
      marginLeft: level * styles.spacing.xl,
      padding: styles.spacing.sm,
      borderLeft: level > 0 ? `2px solid ${styles.primaryLight}` : "none"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: styles.spacing.sm,
        padding: styles.spacing.sm,
        backgroundColor: level === 0 ? styles.grayLighter : "transparent",
        borderRadius: styles.borderRadius.md
      }}>
        <span style={{ fontWeight: "600" }}>{sub.name}</span>
        <CustomBadge count={sub.filterOptions.length} />
        {sub.subcategories && sub.subcategories.length > 0 && (
          <CustomBadge 
            count={sub.subcategories.length} 
            color={styles.info}
          />
        )}
      </div>
      {sub.subcategories && sub.subcategories.length > 0 && (
        <div style={{ marginTop: styles.spacing.sm }}>
          {renderCategoryTree(sub.subcategories, level + 1)}
        </div>
      )}
    </div>
  ));
};

const RecursiveSubcategory = ({ 
  subcategory, 
  path, 
  setFieldValue, 
  removeSubcategory,
  level = 0 
}) => {
  const hasChildren = subcategory.subcategories && subcategory.subcategories.length > 0;
  const maxDepth = 2; // Limit nesting depth to prevent infinite recursion
  
  if (level >= maxDepth) return null;

  return (
    <CustomCard
      style={{ 
        marginBottom: styles.spacing.lg,
        marginLeft: level > 0 ? styles.spacing.xl : 0,
        borderLeft: level > 0 ? `3px solid ${styles.primaryLight}` : "none"
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: styles.spacing.sm }}>
          <span style={{ fontWeight: "600" }}>
            {subcategory.name || `Subcategory Level ${level + 1}`}
          </span>
            {level === 1 && (
              <CustomBadge count={subcategory.filterOptions.length} />
            )}
          {hasChildren && (
            <CustomBadge 
              count={subcategory.subcategories.length} 
              color={styles.info}
              style={{ marginLeft: styles.spacing.xs }}
            />
          )}
          <span style={{
            backgroundColor: level === 0 ? styles.primary : 
                           level === 1 ? styles.secondary : styles.success,
            color: styles.white,
            padding: "2px 8px",
            borderRadius: styles.borderRadius.sm,
            fontSize: "10px",
            fontWeight: "600"
          }}>
            Level {level + 1}
          </span>
        </div>
      }
      extra={
        <div style={{ display: "flex", gap: styles.spacing.sm }}>
          {level < maxDepth - 1 && (
            <CustomButton
              size="medium"
              type="button"
              variant="ghost"
              onClick={() => {
                const newSubcategory = {
                  id: Date.now(),
                  name: "",
                  slug: "",
                  description: "",
                  filterOptions: [],
                  subcategories: []
                };
                setFieldValue(
                  `${path}.subcategories`,
                  [...(subcategory.subcategories || []), newSubcategory]
                );
              }}
            >
              ➕ Add Child
            </CustomButton>
          )}
          <CustomButton
            variant="danger"
            size="small"
            onClick={() => {
              if (window.confirm("Delete this subcategory? All child categories and filters will be lost.")) {
                removeSubcategory();
              }
            }}
          >
            🗑️ Delete
          </CustomButton>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: styles.spacing.lg }}>
        <Field name={`${path}.name`}>
          {({ field, form }) => (
            <CustomInput
              label="Subcategory Name"
              placeholder={`e.g., ${level === 0 ? 'Dining Chairs' : level === 1 ? 'Wooden Chairs' : 'Oak Chairs'}`}
              error={form.errors[path]?.name}
              onChange={(e) => {
                field.onChange(e);
                // Auto-generate slug from parent slug + current name
                const parentSlug = path.split('.').slice(0, -2).join('.');
                const parentValue = parentSlug ? form.values[parentSlug]?.slug : form.values.slug;
                const slug = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "");
                setFieldValue(
                  `${path}.slug`,
                  parentValue ? `${parentValue}-${slug}` : slug
                );
              }}
              {...field}
            />
          )}
        </Field>
        
        <Field name={`${path}.slug`}>
          {({ field, form }) => {
            const parentSlug = path.split('.').slice(0, -2).join('.');
            const parentValue = parentSlug ? form.values[parentSlug]?.slug : form.values.slug;
            const fullSlug = parentValue ? `${parentValue}-${field.value}` : field.value;
            
            return (
              <CustomInput
                label="Slug"
                prefix={`${parentValue || form.values.slug}/`}
                error={form.errors[path]?.slug}
                {...field}
                value={field.value}
                onChange={(e) => {
                  const cleanSlug = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                  field.onChange({
                    target: { name: field.name, value: cleanSlug }
                  });
                }}
              />
            );
          }}
        </Field>
        
        <Field name={`${path}.description`}>
          {({ field }) => (
            <CustomInput
              label="Description"
              placeholder="Brief description..."
              {...field}
            />
          )}
        </Field>
      </div>

      {/* Render child subcategories recursively */}
      {hasChildren && (
        <div style={{ marginTop: styles.spacing.lg }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: styles.spacing.md,
            padding: styles.spacing.md,
            backgroundColor: styles.grayLighter,
            borderRadius: styles.borderRadius.md
          }}>
            <span style={{ fontWeight: "600", color: styles.dark }}>
              📁 Child Categories ({subcategory.subcategories.length})
            </span>
          </div>
          
          <FieldArray name={`${path}.subcategories`}>
            {({ remove }) => (
              <div>
                {subcategory.subcategories.map((childSub, childIndex) => (
                  <RecursiveSubcategory
                    key={childSub.id}
                    subcategory={childSub}
                    path={`${path}.subcategories.${childIndex}`}
                    setFieldValue={setFieldValue}
                    removeSubcategory={() => remove(childIndex)}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </FieldArray>
        </div>
      )}
    </CustomCard>
  );
};

  const applyPreset = (presetKey, applyTo, setFieldValue, subIndex, values) => {
    const presetFilters = FILTER_PRESETS[presetKey].map(filter => ({
      ...filter,
      id: Date.now() + Math.random(),
      options: filter.options || [],
      required: filter.required || false,
      searchable: true,
    }));
    
    if (applyTo === "all") {
      // Apply to all subcategories
      const updatedSubcategories = values.subcategories.map(sub => ({
        ...sub,
        filterOptions: [...presetFilters]
      }));
      setFieldValue('subcategories', updatedSubcategories);
      alert(`Applied ${presetKey} preset filters to all subcategories!`);
    } else {
      // Apply to current subcategory only
      setFieldValue(
        `subcategories.${subIndex}.filterOptions`,
        presetFilters
      );
      alert(`Applied ${presetKey} preset filters to current subcategory!`);
    }
    
    setPresetModalVisible(false);
  };

  const openPresetModal = (subIndex, mode = "single") => {
    setCurrentSubcategory(subIndex);
    setApplyMode(mode);
    setPresetModalVisible(true);
  };

  const applyExistingToAll = (setFieldValue, values) => {
    if (values.subcategories.length === 0) {
      alert("No subcategories available");
      return;
    }

    // Get filters from the first subcategory
    const sourceFilters = values.subcategories[0].filterOptions;
    
    if (sourceFilters.length === 0) {
      alert("No filters available in the first subcategory");
      return;
    }

    // Apply to all other subcategories
    const updatedSubcategories = values.subcategories.map((sub, index) => {
      if (index === 0) return sub; // Keep original for first subcategory
      
      return {
        ...sub,
        filterOptions: sourceFilters.map(filter => ({
          ...filter,
          id: Date.now() + Math.random(), // New ID to avoid conflicts
        }))
      };
    });

    setFieldValue('subcategories', updatedSubcategories);
    alert(`Applied ${sourceFilters.length} filters to all subcategories!`);
  };

  // Preset Modal Component
  const PresetModal = ({ visible, onClose, onApply }) => {
    const [selectedPreset, setSelectedPreset] = useState(null);

    if (!visible) return null;

    const handleApply = () => {
      if (selectedPreset) {
        onApply(selectedPreset, applyMode);
        setSelectedPreset(null);
      }
    };

    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: styles.white,
          borderRadius: styles.borderRadius.lg,
          padding: styles.spacing.xl,
        
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto"
        }}>
          <h3 style={{ margin: `0 0 ${styles.spacing.lg} 0`, color: styles.dark }}>
            Apply Filter Preset
          </h3>
          
          <p style={{ marginBottom: styles.spacing.lg, color: styles.gray }}>
            Choose a preset template for common product types:
          </p>
          
          <div style={{ marginBottom: styles.spacing.lg }}>
            <label style={{ 
              display: "block", 
              marginBottom: styles.spacing.sm,
              fontWeight: "600",
              color: styles.dark
            }}>
              Apply To:
            </label>
            <div style={{ display: "flex", gap: styles.spacing.lg }}>
              <label style={{ display: "flex", alignItems: "center", gap: styles.spacing.sm }}>
                <input
                  type="radio"
                  checked={applyMode === "all"}
                  onChange={() => setApplyMode("all")}
                />
                All Subcategories
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: styles.spacing.sm }}>
                <input
                  type="radio"
                  checked={applyMode === "single"}
                  onChange={() => setApplyMode("single")}
                />
                Current Subcategory Only
              </label>
            </div>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
            gap: styles.spacing.sm,
            marginBottom: styles.spacing.lg
          }}>
            {Object.keys(FILTER_PRESETS).map(key => (
              <div
                key={key}
                onClick={() => setSelectedPreset(key)}
                style={{
                  padding: styles.spacing.lg,
                  border: `2px solid ${selectedPreset === key ? styles.primary : styles.grayLight}`,
                  borderRadius: styles.borderRadius.md,
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: selectedPreset === key ? styles.primaryLight + "20" : styles.white,
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ 
                  fontSize: "24px", 
                  marginBottom: styles.spacing.sm 
                }}>
                  {key === 'lighting' ? '💡' : '🪑'}
                </div>
                <div style={{ 
                  fontWeight: "600",
                  textTransform: "capitalize"
                }}>
                  {key}
                </div>
              </div>
            ))}
          </div>
          
          {selectedPreset && (
            <div style={{ 
              background: "#f0f9ff", 
              padding: styles.spacing.lg, 
              borderRadius: styles.borderRadius.md,
              border: `1px solid ${styles.info}30`,
              marginBottom: styles.spacing.lg
            }}>
              <strong style={{ display: "block", marginBottom: styles.spacing.sm }}>
                Preset Includes:
              </strong>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {FILTER_PRESETS[selectedPreset].map((filter, idx) => (
                  <li key={idx} style={{ marginBottom: styles.spacing.xs }}>
                    <span>{filter.name}</span>
                    <span style={{
                      backgroundColor: styles.primaryLight,
                      color: styles.dark,
                      padding: "2px 6px",
                      borderRadius: styles.borderRadius.sm,
                      fontSize: "10px",
                      marginLeft: styles.spacing.sm,
                      fontWeight: "600"
                    }}>
                      {filter.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", gap: styles.spacing.sm, justifyContent: "flex-end" }}>
            <CustomButton
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </CustomButton>
            <CustomButton
              variant="primary"
              disabled={!selectedPreset}
              onClick={handleApply}
            >
              Apply Preset
            </CustomButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: styles.spacing.xl, 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", 
      minHeight: "100vh" 
    }}>
      {/* Header */}


      <div style={{
        backgroundColor: styles.white,
        borderRadius: styles.borderRadius.xl,
        boxShadow: styles.shadow.xl,
        margin: "0 auto",
        overflow: "hidden",
        border: "none",
        maxWidth: "1700px"
      }}>
        {/* Header with Steps */}
        <div
          style={{
            background: `linear-gradient(135deg, ${styles.primary} 0%, #b8a05a 100%)`,
            color: styles.white,
            padding: `${styles.spacing.xxl} ${styles.spacing.xxl} ${styles.spacing.xl}`,
          }}
        >
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start", 
            marginBottom: styles.spacing.lg,
            flexWrap: "wrap",
            gap: styles.spacing.md
          }}>
            <div>
              <h1 style={{ 
                color: styles.white, 
                margin: `0 0 ${styles.spacing.sm} 0`, 
                fontWeight: 700,
                fontSize: "32px"
              }}>
                Create New Category
              </h1>
              <p style={{ 
                color: "rgba(255,255,255,0.9)", 
                fontSize: "16px",
                margin: 0
              }}>
                Build your product hierarchy with custom filters
              </p>
            </div>

          </div>

          {/* Steps */}
          <div style={{ 
            display: "flex", 
            gap: styles.spacing.sm,
            maxWidth: "600px",
            flexWrap: "wrap"
          }}>
            {steps.map((step, index) => (
              <div
                key={index}
                onClick={() => setCurrentStep(index)}
                style={{
                  flex: 1,
                  minWidth: "120px",
                  padding: styles.spacing.md,
                  backgroundColor: currentStep === index ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                  borderRadius: styles.borderRadius.md,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: currentStep === index ? `1px solid rgba(255,255,255,0.3)` : "1px solid transparent"
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: styles.spacing.xs }}>
                  {step.icon}
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  fontWeight: currentStep === index ? "600" : "400" 
                }}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: styles.spacing.xxl }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, handleSubmit, isSubmitting, errors, touched }) => (
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <CustomCard 
                    title="📋 Basic Information"
                    extra={
                      <CustomButton 
                        type="button"
                        variant="primary" 
                        onClick={() => setCurrentStep(1)}
                      >
                        Next: Subcategories
                      </CustomButton>
                    }
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: styles.spacing.xl }}>
                      <div>
                        <Field name="name">
                          {({ field, form }) => (
                            <CustomInput
                              label="Category Name"
                              
                              placeholder="e.g., Home Furniture, Electronics, Lighting"
                              error={form.errors.name && form.touched.name ? form.errors.name : ""}
                              {...field}
                            />
                          )}
                        </Field>

                        <Field name="slug">
                          {({ field, form }) => (
                            <CustomInput
                              label="URL Slug"
                              placeholder="auto-generated-slug"
                              prefix="/categories/"
                              error={form.errors.slug && form.touched.slug ? form.errors.slug : ""}
                              {...field}
                            />
                          )}
                        </Field>

                        <Field name="description">
                          {({ field }) => (
                            <CustomTextArea
                              label="Description"
                              rows={4}
                              placeholder="Describe this category and its purpose..."
                              {...field}
                            />
                          )}
                        </Field>
                      </div>

                      <div>
                      <ImageUploader
  previewUrl={values.imagePreview} // Use Formik value instead of local state
  onUpload={(file) => handleBeforeUpload(file, setFieldValue)}
  label="Category Thumbnail"
/>
                        <div style={{
                          background: "#f0f9ff",
                          padding: styles.spacing.lg,
                          borderRadius: styles.borderRadius.md,
                          border: `1px solid ${styles.info}30`,
                          marginTop: styles.spacing.lg
                        }}>
                          <strong style={{ display: "block", marginBottom: styles.spacing.sm }}>
                            📝 Image Guidelines
                          </strong>
                          <p style={{ 
                            margin: 0, 
                            fontSize: "14px", 
                            color: styles.gray,
                            lineHeight: "1.5"
                          }}>
                            Use square images for best results. Max size: 5MB. Recommended: 400x400px
                          </p>
                        </div>
                      </div>
                    </div>
                  </CustomCard>
                )}

                {/* Step 2: Subcategories */}
{currentStep === 1 && (
  <FieldArray name="subcategories">
    {({ remove, push }) => (
      <CustomCard
        title="🏷️ Subcategories"
        extra={
          <div style={{ display: "flex", gap: styles.spacing.sm }}>
            <CustomButton 
              variant="ghost"
              onClick={() => setCurrentStep(0)}
            >
              Back
            </CustomButton>
            <CustomButton 
              type="button"
              variant="primary" 
              onClick={() => setCurrentStep(2)}
            >
              Next: Filters
            </CustomButton>
          </div>
        }
      >
        <div style={{
          background: "#f0f9ff",
          padding: styles.spacing.lg,
          borderRadius: styles.borderRadius.md,
          border: `1px solid ${styles.info}30`,
          marginBottom: styles.spacing.lg
        }}>
          <strong style={{ display: "block", marginBottom: styles.spacing.sm }}>
            💡 Create hierarchical categories with up to 3 levels for better organization.
          </strong>
          <p style={{ margin: 0, fontSize: "14px", color: styles.gray }}>
            Level 1: Main Categories → Level 2: Subcategories → Level 3: Child Categories
          </p>
        </div>

        {values.subcategories.map((sub, subIndex) => (
          <RecursiveSubcategory
            key={sub.id}
            subcategory={sub}
            path={`subcategories.${subIndex}`}
            setFieldValue={setFieldValue}
            removeSubcategory={() => remove(subIndex)}
            level={0}
          />
        ))}

        <CustomButton
          variant="ghost"
          size="large"
          onClick={() => push({
            id: Date.now(),
            name: "",
            slug: "",
            description: "",
            filterOptions: [],
            subcategories: [],
          })}
          style={{ width: "100%", height: "48px" }}
        >
          ➕ Add Top-Level Category
        </CustomButton>
      </CustomCard>
    )}
  </FieldArray>
)}


                {/* Step 3: Filters */}
{/* Step 2: Filters - MODIFIED to show only Level 2 subcategories */}
{currentStep === 2 && (
  <CustomCard
    title="⚙️ Filter Configuration"
    extra={
      <div style={{ display: "flex", gap: styles.spacing.sm }}>
        <CustomButton 
          variant="ghost"
          onClick={() => setCurrentStep(1)}
        >
          Back
        </CustomButton>
        <CustomButton 
          type="button"
          variant="primary" 
          onClick={() => setCurrentStep(3)}
        >
          Review & Create
        </CustomButton>
      </div>
    }
  >
    <div style={{
      background: "#f0f9ff",
      padding: styles.spacing.lg,
      borderRadius: styles.borderRadius.md,
      border: `1px solid ${styles.info}30`,
      marginBottom: styles.spacing.lg
    }}>
      <strong style={{ display: "block", marginBottom: styles.spacing.sm }}>
        💡 Configure filters for Level 2 subcategories only
      </strong>
      <p style={{ margin: 0, fontSize: "14px", color: styles.gray }}>
        Filters are applied to Level 2 subcategories. Level 1 categories act as grouping categories.
      </p>
    </div>

    {/* Get all Level 2 subcategories for filter configuration */}
    {getAllLevel2Subcategories(values.subcategories).map((sub, globalIndex) => (
      <CustomCard
        key={sub.id}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: styles.spacing.sm }}>
            <span style={{ fontWeight: "600" }}>{sub.name}</span>
            <CustomBadge count={sub.filterOptions.length} />
            <span style={{
              backgroundColor: styles.secondary,
              color: styles.white,
              padding: "2px 8px",
              borderRadius: styles.borderRadius.sm,
              fontSize: "10px",
              fontWeight: "600"
            }}>
              Level 2
            </span>
          </div>
        }
        style={{ marginBottom: styles.spacing.lg }}
        extra={
          <div style={{ display: "flex", gap: styles.spacing.sm }}>
            <CustomButton
              size="large"
              onClick={() => openPresetModal(sub.path, "single")}
            >
              📋 Apply Preset
            </CustomButton>
            <CustomButton
              size="large"
              type="button"
              variant="primary"
              onClick={() => setFieldValue(
                `${sub.path}.filterOptions`,
                [
                  ...sub.filterOptions,
                  {
                    id: Date.now(),
                    name: "",
                    key: "",
                    type: "text",
                    options: [],
                    required: false,
                    searchable: true,
                    placeholder: "",
                    defaultValue: "",
                  },
                ]
              )}
            >
              ➕ Add Filter
            </CustomButton>
          </div>
        }
      >
        <PresetModal
          visible={presetModalVisible}
          onClose={() => setPresetModalVisible(false)}
          onApply={(preset, applyTo) => applyPreset(preset, applyTo, setFieldValue, currentSubcategory, values)}
        />

        <FieldArray name={`${sub.path}.filterOptions`}>
          {({ remove }) => (
            <div>
              {sub.filterOptions.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: styles.spacing.xxl, 
                  color: styles.gray 
                }}>
                  <div style={{ fontSize: "48px", marginBottom: styles.spacing.lg }}>⚙️</div>
                  <div style={{ fontSize: "16px", marginBottom: styles.spacing.sm }}>
                    No filters configured for this Level 2 subcategory
                  </div>
                  <div style={{ color: styles.gray, fontSize: "14px" }}>
                    Add filters to help customers find products easily
                  </div>
                </div>
              ) : (
                sub.filterOptions.map((filter, filterIndex) => (
                  <FilterEditor
                    key={filter.id}
                    subIndex={sub.path} // Pass the full path instead of just index
                    filter={filter}
                    filterIndex={filterIndex}
                    setFieldValue={setFieldValue}
                    removeFilter={remove}
                  />
                ))
              )}
            </div>
          )}
        </FieldArray>
      </CustomCard>
    ))}

    {getAllLevel2Subcategories(values.subcategories).length === 0 && (
      <div style={{ 
        textAlign: "center", 
        padding: styles.spacing.xxl, 
        color: styles.gray 
      }}>
        <div style={{ fontSize: "48px", marginBottom: styles.spacing.lg }}>🏷️</div>
        <div style={{ fontSize: "16px", marginBottom: styles.spacing.sm }}>
          No Level 2 subcategories found
        </div>
        <div style={{ color: styles.gray, fontSize: "14px" }}>
          Go back to the Subcategories step and create Level 2 subcategories to configure filters
        </div>
      </div>
    )}
  </CustomCard>
)}

                {/* Step 4: Review */}
                {currentStep === 3 && (
                  <CustomCard 
                    title="👁️ Review & Create"
                    extra={
                      <div style={{ display: "flex", gap: styles.spacing.sm }}>
                        <CustomButton 
                          variant="ghost"
                          onClick={() => setCurrentStep(2)}
                        >
                          Back to Filters
                        </CustomButton>
                        <CustomButton 
                          type="submit"
                          variant="primary"
                          loading={isSubmitting}
                          size="large"
                        >
                          💾 Create Category
                        </CustomButton>
                      </div>
                    }
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: styles.spacing.xl }}>
                      <CustomCard title="Category Summary">
                        <div style={{ display: "flex", flexDirection: "column", gap: styles.spacing.md }}>
                          <div>
                            <strong style={{ display: "block", color: styles.gray, fontSize: "12px" }}>Name:</strong>
                            <div style={{ fontSize: "16px", fontWeight: "600" }}>{values.name}</div>
                          </div>
                          <div>
                            <strong style={{ display: "block", color: styles.gray, fontSize: "12px" }}>Slug:</strong>
                            <div style={{ fontSize: "16px" }}>/categories/{values.slug}</div>
                          </div>
                          <div>
                            <strong style={{ display: "block", color: styles.gray, fontSize: "12px" }}>Description:</strong>
                            <div style={{ fontSize: "14px" }}>{values.description || "No description"}</div>
                          </div>
                          <div>
                            <strong style={{ display: "block", color: styles.gray, fontSize: "12px" }}>Subcategories:</strong>
                            <div style={{ fontSize: "16px", fontWeight: "600" }}>
                              {values.subcategories.length} subcategories
                            </div>
                          </div>
                        </div>
                      </CustomCard>



                      <CustomCard title="Filters Summary">
                        <div style={{ display: "flex", flexDirection: "column", gap: styles.spacing.md }}>
                          {values.subcategories.map((sub, idx) => (
                            <div key={sub.id}>
                              <strong style={{ display: "block", color: styles.gray, fontSize: "12px" }}>
                                {sub.name}:
                              </strong>
                              <div style={{ fontSize: "14px", marginBottom: styles.spacing.sm }}>
                                {sub.filterOptions.length} filters
                              </div>
                              {sub.filterOptions.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: styles.spacing.xs }}>
                                  {sub.filterOptions.map((filter, fIdx) => (
                                    <span
                                      key={fIdx}
                                      style={{
                                        backgroundColor: styles.primaryLight,
                                        color: styles.dark,
                                        padding: "4px 8px",
                                        borderRadius: styles.borderRadius.sm,
                                        fontSize: "12px",
                                        fontWeight: "500"
                                      }}
                                    >
                                      {filter.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CustomCard>
                    </div>
                      <CustomCard title="Category Structure">
    <div style={{ display: "flex", flexDirection: "column", gap: styles.spacing.md }}>
      {renderCategoryTree(values.subcategories)}
    </div>
  </CustomCard>
                  </CustomCard>
                  
                )}
              </form>
            )}
          </Formik>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CreateCategoryWithFilters;