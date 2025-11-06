import React, { useState, useEffect, useRef } from 'react'; 
import { useLocation, Link } from 'react-router-dom';
import Breadcrumb from '../others/Breadcrumb';
import { MdOutlineDone } from 'react-icons/md';
import { Button, message } from 'antd';
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


  let deleveryCharge = 0;
  if (orderRecipt?.delivery_type_display === "Standard") {
    deleveryCharge = 50
  }
  else if (orderRecipt?.delivery_type_display === "Express") {
    deleveryCharge = 100
  } 
  else {
    deleveryCharge = 0
  } 

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text.toString());
      
      // Show success message using Antd message
      message.success('Copied to clipboard!');
      
      // Alternative: Show custom popup if preferred
      const popup = document.createElement("div");
      popup.textContent = "Copied!";
      popup.className =
        "fixed top-5 right-5 bg-[#CBA135] text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50";
      document.body.appendChild(popup);

      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      message.error('Failed to copy to clipboard');
      
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text.toString();
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        message.success('Copied to clipboard!');
      } catch (fallbackErr) {
        message.error('Failed to copy to clipboard');
      }
      document.body.removeChild(textArea);
    }
  };

  const downloadPdf = () => {
    const input = pdfRef.current;
    
    // Create a clone of the element to avoid modifying the original
    const elementToPrint = input.cloneNode(true);
    
    // Apply PDF-specific styles to the clone
    elementToPrint.style.width = '210mm'; // A4 width
    elementToPrint.style.padding = '20mm';
    elementToPrint.style.margin = '0 auto';
    elementToPrint.style.boxSizing = 'border-box';
    
    // Hide elements that shouldn't be in the PDF
    const elementsToHide = elementToPrint.querySelectorAll('.no-print');
    elementsToHide.forEach(el => {
      el.style.display = 'none';
    });

    // Temporarily append to body for capture
    elementToPrint.style.position = 'fixed';
    elementToPrint.style.left = '-9999px';
    elementToPrint.style.top = '0';
    document.body.appendChild(elementToPrint);

    html2canvas(elementToPrint, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: elementToPrint.scrollWidth,
      height: elementToPrint.scrollHeight,
      windowWidth: elementToPrint.scrollWidth,
      windowHeight: elementToPrint.scrollHeight,
    }).then((canvas) => {
      // Remove the clone from DOM
      document.body.removeChild(elementToPrint);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions to fit content properly
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image with proper margins
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Check if we need additional pages
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add new pages if content is longer than one page
      while (heightLeft > pdfHeight - 20) {
        position = heightLeft - (pdfHeight - 20);
        pdf.addPage();
        pdf.addImage(
          imgData, 
          'PNG', 
          10, 
          -position + 10, // Adjust position for the new page
          imgWidth, 
          imgHeight
        );
        heightLeft -= pdfHeight - 20;
      }

      pdf.save(`order-confirmation-${orderRecipt.order_id}.pdf`);
    }).catch(error => {
      console.error('Error generating PDF:', error);
      message.error('Failed to generate PDF');
    });
  };

  if (isLoading || !orderRecipt) {
    return <p className="text-center py-10">Loading your order details...</p>;
  }

  return (
    <div className='bg-[#FAF8F2] py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12'>
        <Breadcrumb />
        <div className='bg-white mx-auto rounded-2xl p-6 sm:p-8 mt-6'>
          {/* PDF-specific container with proper styling */}
          <div 
            ref={pdfRef} 
            className='max-w-3xl mx-auto pdf-container'
            style={{
              boxSizing: 'border-box',
            }}
          >
            
            {/* Success Message */}
            <div className='flex flex-col items-center justify-center gap-4 mb-8'>
              <span className='h-16 w-16 flex items-center justify-center bg-[#CBA135] rounded-full text-white text-2xl'>
                <MdOutlineDone />
              </span>
              <div className='space-y-2'>
                <h3 className='text-3xl sm:text-4xl font-bold text-[#333333] text-center'>
                  Order Placed Successfully!
                </h3>
                <p className='text-gray-600 text-xl text-center'>
                  Thank you for your order.
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className='mb-8'>
              <h4 className='text-2xl font-semibold pb-6'>Order Details</h4>
              <div className='space-y-4'>
                <div className='flex justify-between items-center text-gray-700'>
                  <span className='text-lg text-[#666666]'>Order ID:</span>
                  <span className='font-medium flex items-center gap-2'>
                    #{orderRecipt.order_id}
                    <BiCopy
                      onClick={() => handleCopy(`${orderRecipt.order_id}`)}
                      className='cursor-pointer no-print hover:text-[#CBA135] transition-colors'
                      size={20}
                    />
                  </span>
                </div>
                {/* <div className='flex justify-between text-gray-700'>
                  <span className='text-lg text-[#666666]'>Estimated Delivery:</span>
                  <span className='font-medium text-lg'>
                    {orderRecipt.estimated_delivery || "N/A"}
                  </span>
                </div> */}
                <div className='flex justify-between text-gray-700'>
                  <span className='text-lg text-[#666666]'>Order Status:</span>
                  <span className='font-medium text-lg'>
                    {orderRecipt.order_status_display}
                  </span>
                </div>
                <div className='flex justify-between text-gray-700'>
                  <span className='text-lg text-[#666666]'>Payment Status:</span>
                  <span className='font-medium text-lg'>
                    {orderRecipt.payment_status_display}
                  </span>
                </div>
              </div>
            </div>

            <hr className='my-8 border-gray-200' />

            {/* Product List */}
            <div className='space-y-6 mb-8'>
              <h4 className='text-2xl font-semibold'>Product List</h4>
              {orderRecipt.items.map((item, index) => (
                <div key={index} className='flex justify-between items-center p-3 rounded-xl'>
                  <div>
                    <p className='font-semibold text-lg text-[#333333]'>{item.product_name}</p>
                    <p className='text-lg text-gray-600'>Qty: {item.quantity}</p>
                  </div>
                 <p className="text-right font-semibold text-lg">
  XAF{" "}
  {parseFloat(
    item.offer_price ?? item.discount_price ?? item.price ?? 0
  ).toFixed(2)}
</p>

                </div>
              ))}
            </div>

            <hr className='my-8 border-gray-200' />

            {/* Price Summary */}
            <div className='space-y-4 text-lg text-[#666666] mb-8'>
              <div className='flex justify-between'>
                <span>Subtotal ({orderRecipt.items.length} items)</span>
                <span>XAF {parseFloat(orderRecipt.subtotal).toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Delivery Fee</span>
                <span>XAF {deleveryCharge}</span>
              </div>

              <div className='flex justify-between'>
                <span>Total Discount</span>
                <span>-XAF {parseFloat(orderRecipt.total_discount_amount).toFixed(2)}</span>
              </div>
            </div>

            <hr className='my-8 border-gray-200' />

            <div className='flex justify-between items-center text-xl font-bold mb-12'>
              <span>Total</span>
              <span className='text-[#CBA135] text-2xl'>XAF {parseFloat(orderRecipt.total_amount + deleveryCharge).toFixed(2)}</span>
            </div>

            {/* Actions - Hidden in PDF */}
            <div className='mt-12 flex flex-col justify-center items-center gap-6 no-print'>
              <p 
                onClick={downloadPdf}
                className='flex items-center gap-2 text-[#CBA135] text-lg cursor-pointer font-medium hover:text-[#b8962e] transition-colors'
              >
                <FaArrowDownLong /> Download Receipt
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className='bg-[#CBA135] rounded-md hover:bg-yellow-600 w-full max-w-xs h-14 text-white text-lg font-medium transition-colors'
              >
                Track My Order
              </button>
              <Link to='/' className='w-full max-w-xs'>
                <Button type='default' className='w-full h-14 text-lg font-medium border-2 border-gray-300 hover:border-gray-400'>
                  Continue Shopping
                </Button>
              </Link>
              <p className='text-lg text-center text-gray-600 mt-4'>
                "A confirmation has been sent to your email and WhatsApp."
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