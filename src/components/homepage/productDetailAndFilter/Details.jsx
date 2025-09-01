import { Button, Rate, Tag, Form, Input, Select, DatePicker, Radio, Drawer } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FaLongArrowAltDown } from "react-icons/fa";
import Customers from "../_components/Customers";
import { LiaStarSolid } from "react-icons/lia";
import Similier from "./_components/Similier";
import PreviouslyBought from "./_components/PreviouslyBought";
import Breadcrumb from "../../others/Breadcrumb";
import DetailsModal from "./_components/DetailsModal";
import { Link, useLocation } from "react-router-dom";
import ZoomSection from "./_components/ZoomSection";
import { useGetAllProductsQuery } from "../../../redux/slices/Apis/dashboardApis";
import { useAddProductToCartMutation, useCreateCheckoutMutation, useCreateSingleOrderMutation, useGetAddressQuery, useGetAppCartQuery } from "../../../redux/slices/Apis/customersApi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FiArrowLeft, FiShoppingCart, FiCreditCard } from "react-icons/fi";
import FloatingChat from "../../others/FolatingChat/FloatingChat";

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
  const [currentSection, setCurrentSection] = useState("description");
  const form = Form.useForm()[0];
  const zoomPaneRef = useRef(null);
  const { data: productsData } = useGetAllProductsQuery();
  const [addProductToCart] = useAddProductToCartMutation();
  const { data: cartData, refetch } = useGetAppCartQuery();
  const [createSingleOrder] = useCreateSingleOrderMutation();
  const { data: sevedAddress } = useGetAddressQuery();
  const [createCheckout] = useCreateCheckoutMutation();
    const location = useLocation();
  const { product } = location.state || {};
  const productData = location.state;
  console.log('this is productData', productData)
  const productSpecs = [
    { label: "Dimensions", value: productData?.specifications?.dimensions || "Not specified" },
    { label: "Material", value: productData?.specifications?.material || "Not specified" },
    { label: "Color", value: productData?.specifications?.color || "Not specified" },
    { label: "Weight", value: productData?.specifications?.weight || "Not specified" },
    { label: "Assembly Required", value: productData?.specifications?.assembly_required ? "Yes" : "No" },
    { label: "Warranty", value: productData?.specifications?.warranty || "Not specified" },
    { label: "Care Instructions", value: productData?.specifications?.care_instructions || "Not specified" },
    { label: "Country of Origin", value: productData?.specifications?.country_of_origin || "Not specified" },
  ];

  const vendorId = productData?.vendor_id



  const filteredProducts = productsData?.results?.filter((product) =>
    product?.categories.some((cat) => productData?.categories?.includes(cat))
  );

  // Fisher–Yates shuffle
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

  // Set the initial main image when productData is available
  useEffect(() => {
    if (productData?.images && productData?.images?.length > 0) {
      setMainImage(productData?.images[0]);
    }
  }, [productData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to handle image click
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

  const handleOrderSubmit = async (values) => {
    try {
      const payload = {
        discount_amount: values.discount_amount ?? null,
        promo_code: values.promo_code ?? "",
        delivery_type: values.delivery_type ?? "express",
        delivery_instructions: values.delivery_instructions ?? "",
        estimated_delivery: values.estimated_delivery ?? null,
        delivery_date: values.delivery_date ? values.delivery_date.format("YYYY-MM-DD") : null,
        selected_shipping_address_id: values.selected_shipping_address_id ?? null,
        payment_method: values.payment_method ?? "bank",
        notes: values.notes ?? "",
        product_id: productData.id,
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

  // Navigation tabs for mobile
  const sectionTabs = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="bg-[#FAF8F2] overflow-hidden min-h-screen">
      {/* Mobile Back Navigation */}
      <div className="lg:hidden bg-white p-4 shadow-sm sticky top-0 z-30">
        <div className="flex items-center">
          <Link to="/" className="mr-3">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-medium truncate">{productData?.name}</h1>
        </div>
      </div>

      <div className="px-2 md:px-6 lg:px-20 pb-8 pt-4 lg:pt-8">


        <div className="w-full max-w-7xl mx-auto rounded-lg">
          {/* Order Form Drawer for Mobile */}
          <Drawer
            title="Complete Your Order"
            placement="bottom"
            height="90%"
            onClose={() => setMobileOrderDrawer(false)}
            open={mobileOrderDrawer}
            className="lg:hidden"
          >
            <div className="p-4 h-full overflow-y-auto">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleOrderSubmit}
                initialValues={{
                  delivery_type: "express",
                  payment_method: "bank",
                }}
              >
                {/* Shipping Address */}
                <Form.Item
                  name="selected_shipping_address_id"
                  label="Shipping Address"
                  rules={[{ required: true, message: "Please select a shipping address" }]}
                >
                  <Select placeholder="Select a saved address">
                    {sevedAddress?.results?.map((address) => (
                      <Option key={address.id} value={address.id}>
                        {`${address.street_address}, ${address.city}, ${address.zip_code}`}
                      </Option>
                    ))}
                    <Option value="new">➕ Add new address</Option>
                  </Select>
                </Form.Item>

                {/* Delivery Type */}
                <Form.Item name="delivery_type" label="Delivery Type">
                  <Radio.Group className="flex gap-6">
                    <Radio value="standard">Standard</Radio>
                    <Radio value="express">Express</Radio>
                  </Radio.Group>
                </Form.Item>

                {/* Delivery Date */}
                <Form.Item name="delivery_date" label="Preferred Delivery Date">
                  <DatePicker className="w-full" />
                </Form.Item>

                {/* Payment Method */}
                <Form.Item
                  name="payment_method"
                  label="Payment Method"
                  rules={[{ required: true, message: "Please select a payment method" }]}
                >
                  <Select>
                    <Option value="bank">🏦 Bank Transfer</Option>
                    <Option value="card">💳 Credit/Debit Card</Option>
                    <Option value="paypal">💲 PayPal</Option>
                  </Select>
                </Form.Item>

                {/* Promo Code */}
                <Form.Item name="promo_code" label="Promo Code (Optional)">
                  <Input
                    placeholder="Enter promo code"
                    className="!border !border-gray-400 !rounded-lg !p-2 focus:!border-blue-500 focus:!shadow-md"
                  />
                </Form.Item>

                {/* Delivery Instructions */}
                <Form.Item
                  name="delivery_instructions"
                  label="Delivery Instructions (Optional)"
                >
                  <TextArea
                    rows={3}
                    placeholder="Special instructions for delivery"
                    className="!border !border-gray-400 !rounded-lg !p-2 focus:!border-blue-500 focus:!shadow-md"
                  />
                </Form.Item>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t mt-6 sticky bottom-0 bg-white pb-4">
                  <Button
                    onClick={handleOrderCancel}
                    className="h-10 px-6 border-gray-300 hover:border-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-10 px-6 bg-[#CBA135] hover:bg-[#B58C2D] border-[#CBA135] text-white"
                  >
                    Place Order
                  </Button>
                </div>
              </Form>
            </div>
          </Drawer>

          {/* Order Form Modal for Desktop */}
          {orderFormVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 hidden lg:flex">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center border-b px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Complete Your Order
                  </h2>
                  <button
                    onClick={handleOrderCancel}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleOrderSubmit}
                    initialValues={{
                      delivery_type: "express",
                      payment_method: "bank",
                    }}
                  >
                    {/* Form content same as above */}
                    {/* Shipping Address */}
                    <Form.Item
                      name="selected_shipping_address_id"
                      label="Shipping Address"
                      rules={[{ required: true, message: "Please select a shipping address" }]}
                    >
                      <Select placeholder="Select a saved address">
                        {sevedAddress?.results?.map((address) => (
                          <Option key={address.id} value={address.id}>
                            {`${address.street_address}, ${address.city}, ${address.zip_code}`}
                          </Option>
                        ))}
                        <Option value="new">➕ Add new address</Option>
                      </Select>
                    </Form.Item>

                    {/* Delivery Type */}
                    <Form.Item name="delivery_type" label="Delivery Type">
                      <Radio.Group className="flex gap-6">
                        <Radio value="standard">Standard</Radio>
                        <Radio value="express">Express</Radio>
                      </Radio.Group>
                    </Form.Item>

                    {/* Delivery Date */}
                    <Form.Item name="delivery_date" label="Preferred Delivery Date">
                      <DatePicker className="w-full" />
                    </Form.Item>

                    {/* Payment Method */}
                    <Form.Item
                      name="payment_method"
                      label="Payment Method"
                      rules={[{ required: true, message: "Please select a payment method" }]}
                    >
                      <Select>
                        <Option value="bank">🏦 Bank Transfer</Option>
                        <Option value="card">💳 Credit/Debit Card</Option>
                        <Option value="paypal">💲 PayPal</Option>
                      </Select>
                    </Form.Item>

                    {/* Promo Code */}
                    <Form.Item name="promo_code" label="Promo Code (Optional)">
                      <Input
                        placeholder="Enter promo code"
                        className="!border !border-gray-400 !rounded-lg !p-2 focus:!border-blue-500 focus:!shadow-md"
                      />
                    </Form.Item>

                    {/* Delivery Instructions */}
                    <Form.Item
                      name="delivery_instructions"
                      label="Delivery Instructions (Optional)"
                    >
                      <TextArea
                        rows={3}
                        placeholder="Special instructions for delivery"
                        className="!border !border-gray-400 !rounded-lg !p-2 focus:!border-blue-500 focus:!shadow-md"
                      />
                    </Form.Item>

                    {/* Notes */}
                    <Form.Item name="notes" label="Additional Notes (Optional)">
                      <TextArea
                        rows={3}
                        placeholder="Any additional notes"
                        className="!border !border-gray-400 !rounded-lg !p-2 focus:!border-blue-500 focus:!shadow-md"
                      />
                    </Form.Item>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                      <Button
                        onClick={handleOrderCancel}
                        className="h-10 px-6 border-gray-300 hover:border-gray-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="h-10 px-6 bg-[#CBA135] hover:bg-[#B58C2D] border-[#CBA135] text-white"
                      >
                        Place Order
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          )}

          {/* Main Product Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row items-start justify-center gap-6 md:gap-8 lg:gap-9">
              {/* Product Image */}
              <div className="w-full lg:w-1/2">
                {mainImage && (
                  <ZoomSection img={mainImage.image} zoomPaneRef={zoomPaneRef} />
                )}

                {/* Image Gallery */}
                <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 overflow-x-auto pb-2">
                  {productData?.images?.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative flex-shrink-0 w-20 h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 rounded-lg cursor-pointer overflow-hidden ${
                        mainImage?.id === image.id ? "ring-2 ring-[#CBA135]" : "border border-gray-200"
                      }`}
                      onClick={() => handleImageClick(image, index)}
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={image.image}
                        alt={`Product view ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="w-full lg:w-1/2 space-y-4 md:space-y-6">
                <div
                  ref={zoomPaneRef}
                  className="absolute rounded-md w-full max-w-md h-96 z-50 pointer-events-none"
                ></div>

                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl popbold text-gray-800 mb-1">
                    {productData?.name}
                  </h2>
                  <h3 className="text-sm md:text-base popreg text-gray-500">
                    by Elegant Furniture Co.
                  </h3>
                  <div className="flex items-center mt-4 md:mt-6 gap-2">
                    <Rate
                      defaultValue={4}
                      disabled
                      className="text-yellow-500 text-xs md:text-sm"
                    />
                    <p>•</p>
                    <p className="popreg text-xs md:text-sm">127 reviews</p>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl lg:text-4xl popbold text-[#CBA135]">
                   {productData?.price1} XAF
                </h3>

                {/* Color Options */}
                <div>
                  <h4 className="text-sm md:text-base popmed mb-2 text-gray-700">
                    Color
                  </h4>
                  <div className="flex gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-lg bg-fuchsia-500 border-2 border-gray-300 cursor-pointer" />
                    <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-lg bg-[#1E40AF] border-2 border-gray-300 cursor-pointer" />
                    <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-lg bg-[#374151] border-2 border-gray-300 cursor-pointer" />
                  </div>
                </div>

                {/* Size Options */}
                <div>
                  <h4 className="text-sm md:text-base popmed mb-2 text-gray-700">
                    Size
                  </h4>
                  <div className="flex flex-wrap gap-2 md:gap-3 popmed">
                    <Button className="border-gray-300 bg-[#CBA135] px-3 md:px-4 lg:px-6 text-white h-8 md:h-10 text-xs md:text-sm">
                      {productData?.specifications?.dimensions }
                    </Button>
                   
                  </div>
                </div>

                {/* Stock & Wishlist */}
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 max-w-md">
                  <div className="flex items-center gap-2">
                    <Tag className="popmed text-xs md:text-sm" color="green">
                      In Stock
                    </Tag>
                    <p className="text-xs md:text-sm popreg text-gray-400">
                      * Only 3 left
                    </p>
                  </div>
                  <p className="text-xs md:text-sm text-[#CBA135] popreg cursor-pointer hover:underline">
                    Move to Wishlist
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6">
                  <button
                    onClick={() => handleCart(productData)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 md:px-6 lg:px-8 popbold rounded-xl h-10 md:h-12 w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => handleOrder(productData)} 
                    className="border-yellow-600 px-4 md:px-6 lg:px-8 h-10 md:h-12 popbold rounded-xl text-white bg-[#2B2B2B] w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <FiCreditCard size={16} />
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
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

          {/* Description Section */}
          <div className={`mb-8 md:mb-12 lg:mb-16 ${currentSection !== 'description' ? 'lg:block hidden' : 'block'}`}>
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
                 <p>{productData?.short_description}</p>
                <p>{productData?.full_description}</p>

              </div>
            </div>
          </div>

          {/* Specifications Section */}
          <div className={`mb-8 md:mb-12 lg:mb-16 ${currentSection !== 'specifications' ? 'lg:block hidden' : 'block'}`}>
            <div className="mb-4 hidden lg:block">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="border-b-2 text-[#CBA135] text-base md:text-lg popmed border-[#CBA135] w-28 md:w-36 pb-1">
                  Specifications
                </p>
                <p className="text-[#CBA135] flex gap-2 items-center font-semibold text-sm md:text-base cursor-pointer">
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

          {/* Reviews Section */}
          <div className={`mb-8 md:mb-12 lg:mb-16 ${currentSection !== 'reviews' ? 'lg:block hidden' : 'block'}`}>
            <div className="mb-4 hidden lg:block">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="border-b-2 text-[#CBA135] border-[#CBA135] text-base md:text-lg popmed w-28 md:w-36 pb-1">
                  Review (127)
                </p>
                <p
                  onClick={() => setIsModalOpen(true)}
                  className="text-[#CBA135] hover:text-yellow-700 cursor-pointer popbold text-sm md:text-base"
                >
                  Write a Review
                </p>
              </div>
            </div>
            <Customers details={true} />
          </div>

          {/* You Also Bought Section */}
          <div className="mb-8 md:mb-12 lg:mb-16">
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="border-b-2 text-[#CBA135] popmed border-[#CBA135] text-base md:text-lg w-36 md:w-44 pb-1">
                  You also bought
                </p>
                <Link to="/filter">
                  <p className="text-[#CBA135] popbold text-sm md:text-base">
                    View all
                  </p>
                </Link>
              </div>
            </div>
            <Similier randomProducts={randomProducts} />
          </div>

          {/* Compare Similar Section */}
          <div className="mb-8 md:mb-12 lg:mb-16">
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <p className="border-b-2 text-[#CBA135] popmed border-[#CBA135] text-base md:text-lg w-36 md:w-44 pb-1">
                  Compare Similar
                </p>
                <Link to="/filter">
                  <p className="text-[#CBA135] popbold text-sm md:text-base">
                    View all
                  </p>
                </Link>
              </div>
            </div>
            <PreviouslyBought filteredProducts={filteredProducts} />
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Buttons */}
                <FloatingChat targetedId={vendorId} />

      <DetailsModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
    </div>
  );
};

export default Details;