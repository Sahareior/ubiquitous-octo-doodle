import { Button, Rate, Tag, Form, Input, Select, DatePicker, Radio, Drawer, Image, Spin } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaLongArrowAltDown } from "react-icons/fa";
import Customers from "../_components/Customers";
import { LiaStarSolid } from "react-icons/lia";
import Similier from "./_components/Similier";
import PreviouslyBought from "./_components/PreviouslyBought";
import Breadcrumb from "../../others/Breadcrumb";
import DetailsModal from "./_components/DetailsModal";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ZoomSection from "./_components/ZoomSection";
import { useGetAllProductsQuery, useLazyGetProductsByIdQuery } from "../../../redux/slices/Apis/dashboardApis";
import { useAddProductToCartMutation, useCreateCheckoutMutation, useCreateSingleOrderMutation, useGetAddressQuery, useGetAppCartQuery, useLazyGetProductByIdQuery } from "../../../redux/slices/Apis/customersApi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FiArrowLeft, FiShoppingCart, FiCreditCard } from "react-icons/fi";
import FloatingChat from "../../others/FolatingChat/FloatingChat";
import jsPDF from "jspdf";
import { 
  FaShoppingCart, 
  FaMapMarkerAlt, 
  FaTruck, 
  FaCreditCard,
  FaFileAlt,
  FaDollarSign,
  FaGlobe,
  FaCalendarAlt,
  FaEdit,
  FaCheck,
  FaTimes,
  FaPlus,
  FaChevronDown,
  FaBolt
} from 'react-icons/fa';

const { Option } = Select;
const { TextArea } = Input;

const MySwal = withReactContent(Swal);

const Details = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderFormVisible, setOrderFormVisible] = useState(false);

  const [randomProducts, setRandomProducts] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [mobileOrderDrawer, setMobileOrderDrawer] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(50);
  const [currentSection, setCurrentSection] = useState("description");
  const form = Form.useForm()[0];

  const zoomPaneRef = useRef(null);
  const { data: productsData } = useGetAllProductsQuery();
  const [addProductToCart] = useAddProductToCartMutation();
  const { data: cartData, refetch } = useGetAppCartQuery();
  const [createSingleOrder] = useCreateSingleOrderMutation();
  const { data: sevedAddress } = useGetAddressQuery();
  const [createCheckout] = useCreateCheckoutMutation();
     const navigate = useNavigate();
    const location = useLocation();
 const productFromState = location.state?.productFromState|| null;
    const searchParams = new URLSearchParams(location?.search);
  const productId = searchParams.get('id');
  const [getProductById, { data, error, isLoading }] = useLazyGetProductByIdQuery();
const [selectedProduct, setSelectedProduct] = useState(productFromState|| null);


useEffect(() => {
  if (!productFromState&& productId) {
    getProductById(productId);
  }
}, [productId, productFromState, getProductById]);


useEffect(() => {
  if (data) {
    setSelectedProduct(data);
    console.log(data,'adad')
  }
}, [data]);



      const checkCartData = useCallback((id) => {
      return cartData?.results?.some(items => items.product.id === id)
    },[cartData])


  const productSpecs = [
    { label: "Dimensions", value: selectedProduct?.specifications?.dimensions || "Not specified" },
    { label: "Material", value: selectedProduct?.specifications?.material || "Not specified" },
    { label: "Color", value: selectedProduct?.specifications?.color || "Not specified" },
    { label: "Weight", value: selectedProduct?.specifications?.weight || "Not specified" },
    { label: "Assembly Required", value: selectedProduct?.specifications?.assembly_required ? "Yes" : "No" },
    { label: "Warranty", value: selectedProduct?.specifications?.warranty || "Not specified" },
    { label: "Care Instructions", value: selectedProduct?.specifications?.care_instructions || "Not specified" },
    { label: "Country of Origin", value: selectedProduct?.specifications?.country_of_origin || "Not specified" },
  ];

  const vendorId = selectedProduct?.vendor_id



const filteredProducts = productsData?.results?.filter(
  (product) =>
    product?.id !== selectedProduct?.id &&
    product?.categories?.some((cat) =>
      selectedProduct?.categories?.includes(cat)
    )
);



  
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (productsData?.results) {
      setRandomProducts(shuffleArray(productsData.results));
    }
  }, [productsData]);


  useEffect(() => {
    if (selectedProduct?.images && selectedProduct?.images?.length > 0) {
      setMainImage(selectedProduct?.images[0]);
    }
  }, [selectedProduct]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

 
  const handleImageClick = (image, index) => {
    setMainImage(image);
    setActiveImageIndex(index);
  };

  const handleCart = async (data) => {
    const payload = {
      ...data,
      id: data.id,
      quantity: 1,
      product_id: data.id,
    };

    const res = await addProductToCart(payload);
    refetch();

    MySwal.fire({
      position: "top-end",
      icon: "success",
      title: '<span style="font-family: Poppins, sans-serif;">Item added to cart!</span>',
      background: "#FFFFFF",
      customClass: {
        popup: "rounded-xl shadow-lg",
        title: "text-lg text-gray-800",
        icon: "text-green-500",
      },
      showConfirmButton: false,
      timer: 1800,
      toast: true,
      didOpen: (toast) => {
        toast.style.border = "1px solid #e0e0e0";
        toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
      },
    });
  };

  const handleOrder = (data) => {
    setOrderFormVisible(true);
    setMobileOrderDrawer(true);
  };



  const handleChange = (value) => {
    if (value === "new") {
      navigate("/checkout", {
          state:{productData:selectedProduct}
      }); 
    }
  };


  const handleDownloadSpecs = () => {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Product Specifications", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = 35;
  productSpecs.forEach((spec) => {
    doc.text(`${spec.label}: ${spec.value}`, 14, y);
    y += 10;
  });

  doc.save(`${selectedProduct?.name || "product"}-specifications.pdf`);
};


  const handleOrderSubmit = async (values) => {
    try {
    const payload = {
      discount_amount: values.discount_amount ?? null,
      promo_code: values.promo_code ?? "",
      delivery_type: values.delivery_type ?? "express",
      delivery_instructions: values.delivery_instructions ?? "",
      estimated_delivery: values.estimated_delivery ?? null,
      delivery_date: values.delivery_date 
        ? values.delivery_date.format("YYYY-MM-DD") 
        : null,
      selected_shipping_address_id: values.selected_shipping_address_id ?? null,
      payment_method: values.payment_method ?? "bank",
      notes: values.notes ?? "",
      product_id: selectedProduct.id,
    };


      const res = await createSingleOrder(payload);

      if (res.data.order_id) {
        const checkoutRes = await createCheckout({ order_id: res.data.order_id }).unwrap();

        if (checkoutRes.checkout_url) {
          setTimeout(() => {
            window.location.href = checkoutRes.checkout_url;
          }, 2000);
        }
      }

      if (res.data) {
        MySwal.fire({
          position: "center",
          icon: "success",
          title: '<span style="font-family: Poppins, sans-serif;">Successfull! Redirecting to the payment page</span>',
          showConfirmButton: false,
          timer: 1500,
        });
        setOrderFormVisible(false);
        setMobileOrderDrawer(false);
        form.resetFields();
      } else {
        throw new Error(res.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Order creation error:", error);
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "There was an error placing your order. Please try again.",
      });
    }
  };

  const handleOrderCancel = () => {
    setOrderFormVisible(false);
    setMobileOrderDrawer(false);
    form.resetFields();
  };

const handleDeliveryTypeChange = (e) => {
  const deliveryType = e.target.value;
  let charge = 0;
  
  switch (deliveryType) {
    case "standard":
      charge = 50;
      break;
    case "express":
      charge = 100;
      break;
    case "pickup":
      charge = 0;
      break;
   
  }
  
  setDeliveryCharge(charge);
};


const calculateTotal = () => {
  const productPrice = selectedProduct?.new_price || selectedProduct?.price1 || 0;
  return productPrice + deliveryCharge;
};


 
  const sectionTabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Reviews" },
  ];

  if(isLoading){
  return(
    <div className="h-screen flex bg-[#FAF8F2] justify-center items-center">
      <Spin className="" size="large" />
    </div>
  )
}


     const storedRole = localStorage.getItem('user_role'); 

  return (
    <div className="bg-[#FAF8F2] relative overflow-hidden min-h-screen">
     
      <div className="lg:hidden bg-white p-4 shadow-sm sticky top-0 z-30">
        <div className="flex items-center">
          <Link to="/" className="mr-3">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-medium truncate">{selectedProduct?.name}</h1>
        </div>
      </div>

      <div className="px-2 md:px-6 lg:px-20 pb-8 pt-4 lg:pt-8">


        <div className="w-full max-w-7xl mx-auto rounded-lg">
       
<Drawer
  title={
    <h2 className="text-2xl font-bold text-[#5D4037] tracking-tight flex items-center gap-2">
      <FaShoppingCart className="text-[#8D6E63]" />
      Complete Your Order
    </h2>
  }
  placement="bottom"
  height="85%"
  onClose={() => setMobileOrderDrawer(false)}
  open={mobileOrderDrawer}
  className="lg:hidden"
  bodyStyle={{ padding: 0 }}
  headerStyle={{
    background: "linear-gradient(to right, #F8F4EF, #EFEBE9)",
    borderBottom: "1px solid #D7CCC8",
    borderRadius: "16px 16px 0 0",
    padding: "16px 20px",
  }}
>
  <div className="p-6 h-full overflow-y-auto bg-gradient-to-b from-[#F8F4EF] to-[#EFEBE9] rounded-t-3xl flex justify-center">
    <Form
      form={form}
      layout="vertical"
      onFinish={handleOrderSubmit}
     initialValues={{
    delivery_type: "standard",
    payment_method: "cash",
  }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto"
    >
   
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D7CCC8] hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#5D4037]">
          <FaMapMarkerAlt className="text-[#8D6E63]" />
          Shipping Address
        </h3>
        <Form.Item
          name="selected_shipping_address_id"
          rules={[{ required: true, message: "Please select a shipping address" }]}
          className="mb-0"
        >
          <Select
            placeholder="Select a saved address"
            onChange={handleChange}
            className="w-full rounded-xl border-[#D7CCC8] hover:border-[#A67B5B] focus:border-[#8D6E63] focus:ring-2 focus:ring-[#EFEBE9] transition-all duration-200"
            suffixIcon={<FaChevronDown className="text-[#8D6E63]" />}
          >
            {sevedAddress?.results?.map((address) => (
              <Option key={address.id} value={address.id}>
                {`${address.street_address}, ${address.city}, ${address.zip_code}`}
              </Option>
            ))}
            <Option value="new" className="text-[#8D6E63] font-medium">
              <FaPlus className="inline mr-2" />
              Add new address
            </Option>
          </Select>
        </Form.Item>
      </div>


      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D7CCC8] hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#5D4037]">
          <FaTruck className="text-[#8D6E63]" />
          Delivery Details
        </h3>
        <Form.Item
          name="delivery_type"
          label={<span className="text-sm text-[#795548] font-medium">Delivery Type</span>}
          className="mb-5"
        >
          <Radio.Group 
            className="flex gap-4 flex-wrap"
            onChange={handleDeliveryTypeChange}
          >
            <Radio value="standard" className="custom-radio">
              <span className="text-[#5D4037]">Standard (XAF 50)</span>
            </Radio>
            <Radio value="express" className="custom-radio">
              <span className="text-[#5D4037] flex items-center">
                <FaBolt className="mr-1 text-[#A67B5B]" />
                Express (XAF 100)
              </span>
            </Radio>
            <Radio value="pickup" className="custom-radio">
              <span className="text-[#5D4037]">Pickup (Free)</span>
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="delivery_date"
          label={<span className="text-sm text-[#795548] font-medium">Preferred Delivery Date</span>}
          className="mb-0"
        >
          <DatePicker
            className="w-full rounded-xl border-[#D7CCC8] hover:border-[#A67B5B] focus:border-[#8D6E63] focus:ring-2 focus:ring-[#EFEBE9] transition-all duration-200"
            disabledDate={(current) => current && current < new Date().setHours(0, 0, 0, 0)}
            suffixIcon={<FaCalendarAlt className="text-[#8D6E63]" />}
          />
        </Form.Item>
      </div>


      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D7CCC8] hover:shadow-md transition-all">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#5D4037]">
          <FaCreditCard className="text-[#8D6E63]" />
          Payment Method
        </h3>
        <Form.Item
          name="payment_method"
          rules={[{ required: true, message: "Please select a payment method" }]}
          className="mb-0"
        >
          <Select
            className="w-full rounded-xl border-[#D7CCC8] hover:border-[#A67B5B] focus:border-[#8D6E63] focus:ring-2 focus:ring-[#EFEBE9] transition-all duration-200"
            suffixIcon={<FaChevronDown className="text-[#8D6E63]" />}
          >
            <Option value="cash" className="flex items-center">
              <span>Cash on Delivery</span>
            </Option>
            <Option value="online" className="flex items-center">
              <span>Online Payment</span>
            </Option>
          </Select>
        </Form.Item>
      </div>

   
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D7CCC8] hover:shadow-md transition-all">
        <Form.Item
          name="delivery_instructions"
          label={
            <span className="text-sm text-[#795548] font-medium flex items-center gap-2">
              <FaEdit className="text-[#8D6E63]" />
              Delivery Instructions (Optional)
            </span>
          }
          className="mb-0"
        >
          <TextArea
            rows={3}
            placeholder="Add any notes for the delivery driver..."
            className="rounded-xl border-[#D7CCC8] hover:border-[#A67B5B] focus:border-[#8D6E63] focus:ring-2 focus:ring-[#EFEBE9] transition-all duration-200"
          />
        </Form.Item>
      </div>

     <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D7CCC8] hover:shadow-md transition-all md:col-span-2">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#5D4037]">
          <FaFileAlt className="text-[#8D6E63] popmed" />
          Order Summary
        </h3>
        <div className="flex justify-between popreg text-[#5D4037] py-1">
          <span>Subtotal</span>
          <span>XAF {selectedProduct?.new_price || selectedProduct?.price1 || 0}</span>
        </div>
        <div className="flex justify-between popreg text-[#5D4037] py-1">
          <span>Shipping</span>
          <span>XAF {deliveryCharge}</span>
        </div>
        <div className="flex justify-between text-[#5D4037] py-1 border-t border-[#D7CCC8] mt-3 pt-2 font-semibold">
          <span>Total</span>
          <span className="text-[#8D6E63] popbold text-xl">XAF {calculateTotal()}</span>
        </div>
      </div>


      <div className="flex justify-between gap-3 pt-5 mt-6 sticky bottom-0 backdrop-blur-lg bg-gradient-to-r from-[#F8F4EF]/95 to-[#EFEBE9]/95 p-4 rounded-t-2xl border-t border-[#D7CCC8] shadow-lg md:col-span-2">
        <Button
          onClick={handleOrderCancel}
          className="h-12 flex-1 rounded-xl border border-[#D7CCC8] text-[#5D4037] hover:border-[#A67B5B] hover:text-[#8D6E63] transition-all duration-200 flex items-center justify-center"
        >
          <FaTimes className="mr-2" />
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          className="h-12 flex-1 rounded-xl bg-[#8D6E63] hover:bg-[#6D4C41] border-none text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          <FaCheck className="mr-2" />
          Place Order
        </Button>
      </div>
    </Form>
  </div>
</Drawer>
        
          <div className="bg-white rounded-xl shadow-sm p-1 md:p-6 lg:p-8 mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-6 md:gap-8 lg:gap-9">
           
              <div className="w-full lg:w-1/2">
                {mainImage && (
                  <ZoomSection img={mainImage.image} zoomPaneRef={zoomPaneRef} />
                )}

               
                <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 overflow-x-auto pb-2">
                  {selectedProduct?.images?.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative flex-shrink-0 w-20 h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 rounded-lg cursor-pointer overflow-hidden ${
                        mainImage?.id === image.id ? "ring-2 ring-[#CBA135]" : "border border-gray-200"
                      }`}
                      onClick={() => handleImageClick(image, index)}
                    >
                     <Image
  className="w-full h-full object-cover"
  src={image.image}
  alt={`Product view ${index + 1}`}
  preview={false} 
/>

                    </div>
                  ))}
                </div>
              </div>

        
        <div className="w-full lg:w-1/2 space-y-4 md:space-y-6">
  <div
    ref={zoomPaneRef}
    className="absolute hidden md:block rounded-md w-full max-w-md h-[550px] z-50 pointer-events-none"
  ></div>


  <div>
    <h2 className="text-xl md:text-2xl lg:text-3xl popbold text-gray-800 mb-1">
      {selectedProduct?.name}
    </h2>
    <h3 className="text-sm md:text-base popreg text-gray-500">
 
    </h3>
    <div className="flex items-center mt-4 md:mt-6 gap-2">
      <Rate
        value={selectedProduct?.average_rating}
        disabled
        className="text-yellow-500 text-xs md:text-sm"
      />
      <p>•</p>
      <p className="popreg text-xs md:text-sm">{selectedProduct?.reviews.length} reviews</p>
    </div>
  </div>


  {(() => {
    const oldPrice = selectedProduct?.price1;
    const newPrice = selectedProduct?.new_price;
    const discount = selectedProduct?.promotion_discount_value;

     const hasDiscount = discount && discount > 0;
    return (
      <div className="flex items-center gap-3">
        <h3 className="text-2xl md:text-3xl lg:text-4xl popbold text-[#CBA135]">
          XAF {newPrice? newPrice : oldPrice}
        </h3>
        {hasDiscount && (
          <>
                  <span className="text-gray-400 line-through popreg text-lg">
          XAF {oldPrice}
        </span>
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md">
          -{discount} {selectedProduct?.promotion_discount_type === "percentage" ? "%" : "XAF"}
        </span>
          </>
        )}
      </div>
    );
  })()}


<div className="p-2">
  <h4 className="text-sm md:text-base popmed mb-2 text-gray-700">Color</h4>
  <div className="flex gap-2 md:gap-3 flex-wrap">
    {selectedProduct?.specifications?.color
      ?.split(",")
      .map((clr, index) => {
        const colorName = clr.trim();
        const isLight = ["white", "#fff", "#ffffff", "beige", "ivory"].includes(
          colorName.toLowerCase()
        );
        
        return (
          <button
            key={index}
            style={{
              backgroundColor: colorName.startsWith("#")
                ? colorName
                : colorName.toLowerCase(),
            }}
            className={`md:h-10 md:w-10 h-8 w-8 rounded-full flex items-center justify-center relative
              border border-gray-300 shadow-inner
              ${isLight ? "ring-1 ring-gray-200" : ""}`}
          >
          
            <div className="absolute inset-0 rounded-full shadow-inner opacity-20"></div>
            <span className="sr-only">{colorName}</span>
          </button>
        );
      })}
  </div>
</div>



  <div>
    <h4 className="text-sm md:text-base popmed mb-2 text-gray-700">Size</h4>
    <div className="flex flex-wrap gap-2 md:gap-3 popmed">
      <p className="bg-purple-400 px-4 text-white rounded-md">
        {selectedProduct?.specifications?.dimensions}
      </p>
    </div>
  </div>


  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 max-w-md">
    <div className="flex items-center gap-2">
      <Tag className="popmed text-xs md:text-sm" color="green">
        In Stock
      </Tag>
      <p className="text-xs md:text-sm popreg text-gray-400"></p>
    </div>
  </div>


  <div
  className={`flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6 ${storedRole === 'admin' ? 'hidden' : ''}`}
>
    <button
      onClick={() => handleCart(selectedProduct)}
       className={`  text-white px-4 md:px-6 lg:px-8 popbold rounded-xl h-10 md:h-12 w-full sm:w-auto flex items-center justify-center gap-2
    ${checkCartData(selectedProduct?.id) ? "bg-green-500" : "bg-[#CBA135] hover:bg-yellow-700"}`}
    >
      <FiShoppingCart size={16} />
      {
        checkCartData(selectedProduct?.id) ? "Added" : "Add to Cart"
      }
    </button>
    <button
      onClick={() => handleOrder(selectedProduct)}
      className="border-yellow-600 px-4 md:px-6 lg:px-8 h-10 md:h-12 popbold rounded-xl text-white bg-[#2B2B2B] w-full sm:w-auto flex items-center justify-center gap-2"
    >
      <FiCreditCard size={16} />
      Buy Now
    </button>
  </div>
</div>

            </div>
          </div>

        
          <div className="lg:hidden bg-white rounded-xl shadow-sm mb-6 sticky top-16 z-20">
            <div className="flex border-b">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentSection(tab.id)}
                  className={`flex-1 py-3 text-center text-sm font-medium ${
                    currentSection === tab.id
                      ? "text-[#CBA135] border-b-2 border-[#CBA135]"
                      : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

     
          <div className={`mb-8 md:mb-12 shadow-md lg:mb-16 ${currentSection !== 'description' ? 'lg:block hidden' : 'block'}`}>
            <div className="mb-4 hidden lg:block">
              <p className="border-b-2 text-[#CBA135] text-base md:text-lg popmed border-[#CBA135] w-28 md:w-32 pb-1">
                Description
              </p>
            </div>
            <div className="p-4 md:p-6 lg:p-8 bg-white rounded-xl shadow-sm">
              <h2 className="text-lg md:text-xl lg:text-2xl popbold mb-3 md:mb-4 lg:mb-6">
                Product Description
              </h2>
              <div className="space-y-2 md:space-y-3 lg:space-y-4 popreg text-[#666666] text-sm md:text-base">
                 <p>{selectedProduct?.short_description}</p>
                <p>{selectedProduct?.full_description}</p>

              </div>
            </div>
          </div>


          <div className={`mb-8 md:mb-12 shadow-md lg:mb-16 ${currentSection !== 'specifications' ? 'lg:block hidden' : 'block'}`}>
            <div className="mb-4 hidden lg:block">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="border-b-2 text-[#CBA135] text-base md:text-lg popmed border-[#CBA135] w-28 md:w-36 pb-1">
                  Specifications
                </p>
<p
  onClick={handleDownloadSpecs}
  className="text-[#CBA135] flex gap-2 items-center font-semibold text-sm md:text-base cursor-pointer"
>
  <FaLongArrowAltDown size={16} /> Download
</p>

              </div>
            </div>

            <div className="p-4 md:p-6 lg:p-8 bg-white rounded-xl shadow-sm">
              <h2 className="text-lg md:text-xl lg:text-2xl popbold mb-3 md:mb-4 lg:mb-6">
                Product Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-2 md:gap-y-3 lg:gap-y-4 pt-2 md:pt-3 lg:pt-4">
                {productSpecs.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between border-b border-gray-100 items-baseline py-2 md:py-3"
                  >
                    <span className="popmed text-xs md:text-sm lg:text-base text-gray-700">
                      {item.label}
                    </span>
                    <span className="text-[#666666] popreg text-xs md:text-sm lg:text-base text-right max-w-[55%]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          <div className={`mb-8 md:mb-12 lg:mb-16 ${currentSection !== 'reviews' ? 'lg:block hidden' : 'block'}`}>
            <div className="mb-4 lg:block">
              <div className="flex   justify-between items-start sm:items-center gap-2">
                <p className="border-b-2 text-[#CBA135] border-[#CBA135] text-xs md:text-lg popmed w-28 md:w-36 pb-1">
                  Review 
                </p>
                <p
                  onClick={() => setIsModalOpen(true)}
                  className="text-[#CBA135] hover:text-yellow-700 cursor-pointer popbold text-xs md:text-base"
                >
                  Write a Review
                </p>
              </div>
            </div>
            <Customers reviews={selectedProduct?.reviews} details={true} />
          </div>


          <div className="mb-8 md:mb-12 lg:mb-16">
            <div className="mb-4">
              <div className="flex justify-between items-start sm:items-center gap-2">
                <p className="border-b-2 text-[#CBA135] popmed border-[#CBA135] text-xs md:text-lg w-36 md:w-44 pb-1">
                  You also bought
                </p>
                <Link to="/filter">
                  <p className="text-[#CBA135] popbold text-xs md:text-base">
                    View all
                  </p>
                </Link>
              </div>
            </div>
            <Similier setSelectedProduct={setSelectedProduct} randomProducts={randomProducts} />
          </div>

          <div className="mb-8 md:mb-12 lg:mb-16">
            <div className="mb-4">
              <div className="flex  justify-between items-start sm:items-center gap-2">
                <p className="border-b-2 text-[#CBA135] popmed border-[#CBA135] text-xs md:text-lg w-36 md:w-44 pb-1">
                  Compare Similar
                </p>
                <Link to="/filter">
                  <p className="text-[#CBA135] popbold text-xs md:text-base">
                    View all
                  </p>
                </Link>
              </div>
            </div>
            <PreviouslyBought setSelectedProduct={setSelectedProduct} filteredProducts={filteredProducts} />
          </div>
        </div>
      </div>


                <div className="fixed bottom-52 md:right-6 right-0 animate-float z-50">
             <FloatingChat targetedId={vendorId} />
          </div>

      <DetailsModal id={selectedProduct?.id} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
    </div>
  );
};

export default Details;