import { Button, Rate, Tag, Form, Input, Select, DatePicker, Radio } from "antd";
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
// import {
//   useAddProductToCartMutation,
//   useCreateSingleOrderMutation,
//   useGetAddressQuery,
//   useGetAppCartQuery,
// } from "../../../redux/slices/Apis/customersApi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAddProductToCartMutation, useCreateCheckoutMutation, useCreateSingleOrderMutation, useGetAddressQuery, useGetAppCartQuery } from "../../../redux/slices/Apis/customersApi";

const { Option } = Select;
const { TextArea } = Input;

const MySwal = withReactContent(Swal);
const Details = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderFormVisible, setOrderFormVisible] = useState(false);
  const [randomProducts, setRandomProducts] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [form] = Form.useForm();
  const zoomPaneRef = useRef(null);
  const { data: productsData } = useGetAllProductsQuery();
  const [addProductToCart] = useAddProductToCartMutation();
  const { data: cartData, refetch } = useGetAppCartQuery();
  const [createSingleOrder] = useCreateSingleOrderMutation();
  const { data: sevedAddress } = useGetAddressQuery();
  const [createCheckout] = useCreateCheckoutMutation()

  const productSpecs = [
    { label: "Dimensions (W×H×D)", value: '88" × 35" × 38"' },
    { label: "Assembly Required", value: "Minimal (Legs only)" },
    { label: "Material", value: "Premium Velvet, Hardwood Frame" },
    { label: "Warranty", value: "2 Years Limited" },
    { label: "Color", value: "Navy Blue" },
    { label: "Care Instructions", value: "Professional Cleaning" },
    { label: "Weight", value: "145 lbs" },
    { label: "Country of Origin", value: "Italy" },
  ];

  const location = useLocation();
  const { product } = location.state || {};
  const productData = location.state;

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
  const handleImageClick = (image) => {
    setMainImage(image);
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

    console.log(res.data.order_id, 'adaaaaaaaaaaaaaaaa')
    if (res.data.order_id) {
      const checkoutRes = await createCheckout({ order_id: res.data.order_id }).unwrap();

      console.log("Checkout Response:", checkoutRes.checkout_url);

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
    form.resetFields();
  };

  return (
    <div className="bg-[#FAF8F2] px-4 md:px-10 lg:px-20 pb-16 md:pb-20">
      <div className="pt-4">{/* <Breadcrumb /> */}</div>

      <div className="w-full max-w-7xl mx-auto rounded-lg">
        {/* Order Form Popover */}
        {orderFormVisible && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start justify-center gap-6 md:gap-9">
            {/* Product Image */}
            <div className="w-full lg:w-1/2">
              {mainImage && (
                <ZoomSection img={mainImage.image} zoomPaneRef={zoomPaneRef} />
              )}

              {/* Image Gallery */}
              <div className="flex gap-3 md:gap-4 mt-8 overflow-x-auto pb-2">
                {productData?.images?.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative w-28 md:w-36 lg:w-44 h-20 md:h-24 lg:h-24 rounded-lg cursor-pointer overflow-hidden ${
                      mainImage?.id === image.id ? "ring-2 ring-[#CBA135]" : ""
                    }`}
                    onClick={() => handleImageClick(image)}
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
            <div className="w-full lg:w-1/2 space-y-6 md:space-y-8">
              <div
                ref={zoomPaneRef}
                className="absolute rounded-md w-full max-w-md h-96 z-50 pointer-events-none"
              ></div>

              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl popbold text-gray-800 mb-1">
                  {productData?.name}
                </h2>
                <h3 className="text-base md:text-lg popreg text-gray-500">
                  by Elegant Furniture Co.
                </h3>
                <div className="flex items-center mt-6 gap-2">
                  <Rate
                    defaultValue={4}
                    disabled
                    className="text-yellow-500 text-sm md:text-base"
                  />
                  <p>•</p>
                  <p className="popreg text-sm md:text-base">127 reviews</p>
                </div>
              </div>

              <h3 className="text-3xl md:text-4xl popbold text-[#CBA135]">
                $ {productData?.price1}
              </h3>

              {/* Color Options */}
              <div>
                <h4 className="text-sm md:text-base popmed mb-2 text-gray-700">
                  Color
                </h4>
                <div className="flex gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-fuchsia-500 border-2 border-gray-300 cursor-pointer" />
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1E40AF] border-2 border-gray-300 cursor-pointer" />
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#374151] border-2 border-gray-300 cursor-pointer" />
                </div>
              </div>

              {/* Size Options */}
              <div>
                <h4 className="text-sm md:text-base popmed mb-2 text-gray-700">
                  Size
                </h4>
                <div className="flex flex-wrap gap-3 popmed">
                  <Button className="border-gray-300 bg-[#CBA135] px-6 md:px-8 lg:px-12 text-white h-10 md:h-12">
                    3 Seater
                  </Button>
                  <Button className="border-gray-300 px-6 md:px-8 lg:px-12 h-10 md:h-12">
                    2 Seater
                  </Button>
                  <Button className="border-gray-300 px-6 md:px-8 lg:px-12 h-10 md:h-12">
                    L Shape
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
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-4 md:mt-6">
                <button
                  onClick={() => handleCart(productData)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 md:px-12 lg:px-20 popbold rounded-xl h-12 md:h-14 w-full sm:w-auto"
                >
                  Add to Cart
                </button>
                <button onClick={() => handleOrder(productData)} className="border-yellow-600 px-6 md:px-12 lg:px-20 h-12 md:h-14 popbold rounded-xl text-white bg-[#2B2B2B] w-full sm:w-auto">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-12 md:mb-16 lg:mb-24">
          <div className="mb-4">
            <p className="border-b-2 text-[#CBA135] text-base md:text-lg popmed border-[#CBA135] w-28 md:w-32 pb-1">
              Description
            </p>
          </div>
          <div className="p-6 md:p-8 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl md:text-2xl lg:text-3xl popbold mb-4 md:mb-6">
              Product Description
            </h2>
            <div className="space-y-3 md:space-y-4 popreg text-[#666666] text-sm md:text-base">
              <p>
                Experience ultimate comfort and sophistication with our Luxury
                Velvet Sectional Sofa. Crafted with premium velvet upholstery
                and a solid hardwood frame, this piece combines durability with
                elegance.
              </p>
              <p>
                Experience ultimate comfort and sophistication with our Luxury
                Velvet Sectional Sofa. Crafted with premium velvet upholstery
                and a solid hardwood frame, this piece combines durability with
                elegance.
              </p>
              <p>
                Experience ultimate comfort and sophistication with our Luxury
                Velvet Sectional Sofa. Crafted with premium velvet upholstery
                and a solid hardwood frame, this piece combines durability with
                elegance.
              </p>
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="mb-12 md:mb-16 lg:mb-24">
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="border-b-2 text-[#CBA135] text-base md:text-lg popmed border-[#CBA135] w-28 md:w-36 pb-1">
                Specifications
              </p>
              <p className="text-[#CBA135] flex gap-2 items-center font-semibold text-sm md:text-base cursor-pointer">
                <FaLongArrowAltDown size={16} /> Download
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl md:text-2xl popbold mb-4 md:mb-6">
              Product Specifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-3 md:gap-y-4 pt-2 md:pt-4">
              {productSpecs.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-gray-100 items-baseline py-2 md:py-3"
                >
                  <span className="popmed text-sm md:text-base text-gray-700">
                    {item.label}
                  </span>
                  <span className="text-[#666666] popreg text-sm md:text-base text-right max-w-[55%]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-12 md:mb-16 lg:mb-24">
          <div className="mb-4">
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
        <div className="mb-12 md:mb-16 lg:mb-24">
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
        <div className="mb-12 md:mb-16 lg:mb-24">
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

      <DetailsModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
    </div>
  );
};

export default Details;