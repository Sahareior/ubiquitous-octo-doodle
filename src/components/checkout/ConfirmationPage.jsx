import React, { useState, useEffect, useRef } from 'react'; 
import { useLocation, Link } from 'react-router-dom';
import Breadcrumb from '../others/Breadcrumb';
import { MdOutlineDone } from 'react-icons/md';
import { Button } from 'antd';
import { BiCopy } from "react-icons/bi";
import { FaArrowDownLong } from 'react-icons/fa6';
import CustomModal from './modal/CustomModal';
import { useGetReceptQuery } from '../../redux/slices/Apis/customersApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ConfirmationPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const pdfRef = useRef();

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("order_id");
    setOrderId(id);
  }, [location]);

  // Fetch order receipt only when orderId is ready
  const { data: orderRecipt, isLoading } = useGetReceptQuery(orderId, {
    skip: !orderId,
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPdf = () => {
    const input = pdfRef.current;
    
    // Hide elements that shouldn't be in the PDF
    const elementsToHide = input.querySelectorAll('.no-print');
    elementsToHide.forEach(el => {
      el.style.visibility = 'hidden';
    });
    
    html2canvas(input, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      // Restore hidden elements
      elementsToHide.forEach(el => {
        el.style.visibility = 'visible';
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add more pages if the content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`order-confirmation-${orderRecipt.order_id}.pdf`);
    });
  };

  if (isLoading || !orderRecipt) {
    return <p className="text-center py-10">Loading your order details...</p>;
  }

  return (
    <div className='bg-[#FAF8F2] '>
      <div className='mx-40 pb-10'>
        <Breadcrumb />
        <div className='max-w-6xl bg-white mx-auto px-4'>
          <div ref={pdfRef} className='max-w-3xl mx-auto rounded-2xl p-8 mt-6'>
            
            {/* Success Message */}
            <div className='flex flex-col items-center justify-center gap-3 mb-6'>
              <span className='h-12 w-12 flex items-center justify-center bg-[#CBA135] rounded-full text-white text-lg'>
                <MdOutlineDone />
              </span>
              <div>
                <h3 className='text-[32px] font-bold text-[#333333] text-center'>
                  Order Placed Successfully!
                </h3>
                <p className='text-gray-600 text-[20px] text-center'>
                  Thank you for your order.
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className='mb-6 w-6/12'>
              <h4 className='text-[20px] font-semibold py-5'>Order Details</h4>
              <div className='flex justify-between text-sm text-gray-700 mb-2'>
                <span className='text-[16px] text-[#666666]'>Order ID:</span>
                <span className='font-medium flex items-center gap-2'>
                  #{orderRecipt.order_id}
                  <BiCopy
                    onClick={() => handleCopy(orderRecipt.order_id)}
                    className='cursor-pointer no-print' // Hide from PDF
                    size={18}
                  />
                </span>
              </div>
              <div className='flex justify-between text-sm text-gray-700 mb-2'>
                <span className='text-[16px] text-[#666666]'>Estimated Delivery:</span>
                <span className='font-medium text-[16px]'>
                  {orderRecipt.estimated_delivery || "N/A"}
                </span>
              </div>
              <div className='flex justify-between text-sm text-gray-700 mb-2'>
                <span className='text-[16px] text-[#666666]'>Order Status:</span>
                <span className='font-medium text-[16px]'>
                  {orderRecipt.order_status_display}
                </span>
              </div>
              <div className='flex justify-between text-sm text-gray-700 mb-2'>
                <span className='text-[16px] text-[#666666]'>Payment Status:</span>
                <span className='font-medium text-[16px]'>
                  {orderRecipt.payment_status_display}
                </span>
              </div>
            </div>

            <hr className='my-4' />

            {/* Product List */}
            <div className='space-y-4'>
              <h4 className='text-[20px] font-semibold'>Product List</h4>
              {orderRecipt.items.map((item, index) => (
                <div key={index} className='flex justify-between items-center p-1 rounded-xl'>
                  <div>
                    <p className='font-semibold text-[16px] text-[#333333]'>{item.product_name}</p>
                    <p className='text-[16px] text-gray-600'>Qty: {item.quantity}</p>
                  </div>
                  <p className='text-right font-semibold'>${parseFloat(item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <hr className='my-6' />

            {/* Price Summary */}
            <div className='space-y-2 text-[16px] text-[#666666]'>
              <div className='flex justify-between'>
                <span>Subtotal ({orderRecipt.items.length} items)</span>
                <span>${parseFloat(orderRecipt.subtotal).toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Delivery Fee</span>
                <span>${parseFloat(orderRecipt.delivery_fee).toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Tax</span>
                <span>${parseFloat(orderRecipt.tax_amount).toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Total Discount</span>
                <span>-${parseFloat(orderRecipt.discount_amount).toFixed(2)}</span>
              </div>
            </div>

            <hr className='my-6' />

            <div className='flex justify-between items-center text-lg font-bold'>
              <span>Total</span>
              <span className='text-[#CBA135]'>${parseFloat(orderRecipt.total_amount).toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className='mt-14 flex flex-col justify-center items-center gap-4 no-print'>
              <p 
                onClick={downloadPdf}
                className='flex items-center gap-1 text-[#CBA135] text-[16px] cursor-pointer'
              >
                <FaArrowDownLong /> Download
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className='bg-[#CBA135] rounded-md hover:bg-yellow-600 w-60 h-[46px] text-white px-12 py-2'
              >
                Track My Order
              </button>
              <Link to='/'>
                <Button type='default' className='w-60 h-[46px] px-20 py-2'>
                  Continue Shopping
                </Button>
              </Link>
              <p className='text-[16px]'>
                “A confirmation has been sent to your email and WhatsApp.”
              </p>
            </div>
          </div>
        </div>
      </div>

      <CustomModal setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} />
    </div>
  );
};

export default ConfirmationPage;