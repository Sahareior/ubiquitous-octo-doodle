import React, { useState } from 'react';
import { Modal, Tag, Image, message, Button, Steps, Divider, Card, Row, Col } from 'antd';
import { 
  LiaStarSolid, 
  LiaFileContractSolid, 
  LiaIdCardSolid,
  LiaBuildingSolid,
  LiaUserTieSolid,
  LiaPhoneSolid,
  LiaMapMarkerSolid,
  LiaCalendarCheckSolid,
  LiaFileInvoiceDollarSolid,
  LiaStoreSolid
} from "react-icons/lia";
import { 
  FaFilePdf, 
  FaFileImage, 
  FaCheckCircle, 
  FaTimesCircle,
  FaRegClock 
} from 'react-icons/fa';
import { useAcceptSellerMutation, useGetAllSellerApplicationQuery } from '../../../../../redux/slices/Apis/dashboardApis';

const { Step } = Steps;

const SellsModal = ({ isModalOpen, setIsModalOpen, sellerInfo }) => {
  const { data: applicants, isLoading, refetch } = useGetAllSellerApplicationQuery();
  const [acceptSeller] = useAcceptSellerMutation();
  const [activeTab, setActiveTab] = useState('info');

  const handleAccept = () => {
    if (!sellerInfo) return;

    const payload = {
      job_title: sellerInfo.jobTitle || "",
      phone_number: sellerInfo.phone || "",
      legal_business_name: sellerInfo.name || "",
      business_address: sellerInfo.businessAddress || "",
      country: sellerInfo.country || "",
      city_town: sellerInfo.city || "",
      state_province: sellerInfo.stateProvince || "",
      postal_code: sellerInfo.postalCode || "",
      established_date: sellerInfo.establishedDate || new Date().toISOString().split('T')[0],
      business_type: sellerInfo.businessType || "",
      taxpayer_number: sellerInfo.documents?.taxpayerDoc || "",
      trade_register_number: sellerInfo.documents?.tradeRegisterDoc || "",
      home_localization_plan: sellerInfo.documents?.homeLocalizationPlan || "",
      business_localization_plan: sellerInfo.documents?.businessLocalizationPlan || ""
    };

    acceptSeller({ id: sellerInfo.id, payload })
      .unwrap()
      .then(() => {
        message.success("Seller approved successfully!");
        refetch();
        setIsModalOpen(false);
      })
      .catch((err) => {
        message.error("Failed to approve seller.");
        console.error(err);
      });
  };

  const handleReject = () => {
    // Implement reject functionality
    message.info("Reject functionality would be implemented here");
  };

  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  // Function to render status tag with appropriate color
  const renderStatusTag = (status) => {
    let color = '';
    let text = '';
    let icon = null;
    
    switch(status.toLowerCase()) {
      case 'approved':
        color = 'green';
        text = 'Approved';
        icon = <FaCheckCircle className="mr-1" />;
        break;
      case 'pending':
        color = 'orange';
        text = 'Pending Review';
        icon = <FaRegClock className="mr-1" />;
        break;
      case 'rejected':
        color = 'red';
        text = 'Rejected';
        icon = <FaTimesCircle className="mr-1" />;
        break;
      default:
        color = 'gray';
        text = 'Unknown';
    }
    
    return (
      <Tag color={color} className="flex items-center px-3 py-1 rounded-full">
        {icon}
        {text}
      </Tag>
    );
  };

  // Function to render document links
  const renderDocumentLink = (url, label) => {
    if (!url) return null;
    
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isPDF = /\.(pdf)$/i.test(url);
    
    return (
      <div className="flex items-center mb-3 p-2 border rounded hover:bg-gray-50 transition-colors">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isImage && <FaFileImage className="mr-2 text-green-500 text-lg" />}
          {isPDF && <FaFilePdf className="mr-2 text-red-500 text-lg" />}
          <span className="text-sm">{label}</span>
        </a>
      </div>
    );
  };

  // Get application progress based on status
  const getApplicationProgress = () => {
    switch(sellerInfo?.status?.toLowerCase()) {
      case 'pending':
        return 1;
      case 'approved':
        return 2;
      case 'rejected':
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Modal
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      className="seller-application-modal"
    >
      <div className="bg-white rounded-lg">
        {/* Header with status and action buttons */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Seller Application</h2>
            <p className="text-gray-500 text-sm mt-1">
              Application ID: {sellerInfo?.id || 'N/A'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {sellerInfo?.status === "approved" ? (
              <Button 
                onClick={handleReject} 
                className="bg-red-100 border-red-300 text-red-600 hover:bg-red-200 flex items-center"
              >
                <FaTimesCircle className="mr-2" />
                Reject Application
              </Button>
            ) : (
              <Button 
                onClick={handleAccept} 
                className="bg-green-100 border-green-300 text-green-600 hover:bg-green-200 flex items-center"
                disabled={sellerInfo?.status === "rejected"}
              >
                <FaCheckCircle className="mr-2" />
                Approve Seller
              </Button>
            )}
          </div>
        </div>

        {/* Application Progress */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <Steps current={getApplicationProgress()} className="custom-steps">
            <Step title="Submitted" description="Application received" />
            <Step title="Under Review" description="Verification in progress" />
            <Step title="Completed" description="Application processed" />
          </Steps>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('info')}
          >
            Business Information
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'info' && (
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Business Details" className="shadow-sm">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div className="flex items-start mb-4">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <LiaStoreSolid className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Business Name</p>
                          <p className="font-medium">{sellerInfo?.name || 'N/A'}</p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="flex items-start mb-4">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <LiaUserTieSolid className="text-purple-600 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Job Title</p>
                          <p className="font-medium">{sellerInfo?.jobTitle || 'N/A'}</p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="flex items-start mb-4">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <LiaPhoneSolid className="text-green-600 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">{sellerInfo?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="flex items-start mb-4">
                        <div className="bg-yellow-100 p-2 rounded-full mr-3">
                          <LiaCalendarCheckSolid className="text-yellow-600 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Established Date</p>
                          <p className="font-medium">
                            {sellerInfo?.establishedDate 
                              ? new Date(sellerInfo.establishedDate).toLocaleDateString() 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="flex items-start mb-4">
                        <div className="bg-indigo-100 p-2 rounded-full mr-3">
                          <LiaBuildingSolid className="text-indigo-600 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Business Type</p>
                          <p className="font-medium">{sellerInfo?.businessType || 'N/A'}</p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="flex items-start mb-4">
                        <div className="bg-pink-100 p-2 rounded-full mr-3">
                          <LiaMapMarkerSolid className="text-pink-600 text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Country</p>
                          <p className="font-medium">{sellerInfo?.country || 'N/A'}</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Application Status" className="shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-3 rounded-full mr-4">
                        <LiaFileContractSolid className="text-gray-600 text-2xl" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Status</p>
                        <div className="mt-1">
                          {sellerInfo?.status ? renderStatusTag(sellerInfo.status) : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Submitted On</p>
                      <p className="font-medium">
                        {sellerInfo?.submittedDate 
                          ? new Date(sellerInfo.submittedDate).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {activeTab === 'documents' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Identity Documents" className="shadow-sm h-full">
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <LiaIdCardSolid className="mr-2 text-blue-500" />
                      National ID
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {sellerInfo?.documents?.nidFront && (
                        <div className="border rounded p-2">
                          <p className="text-xs text-gray-500 mb-2 text-center">Front Side</p>
                          <Image
                            width="100%"
                            src={sellerInfo.documents.nidFront}
                            alt="NID Front"
                            className="rounded"
                            placeholder={
                              <div className="flex items-center justify-center h-32 bg-gray-100">
                                <FaFileImage className="text-3xl text-gray-400" />
                              </div>
                            }
                          />
                        </div>
                      )}
                      {sellerInfo?.documents?.nidBack && (
                        <div className="border rounded p-2">
                          <p className="text-xs text-gray-500 mb-2 text-center">Back Side</p>
                          <Image
                            width="100%"
                            src={sellerInfo.documents.nidBack}
                            alt="NID Back"
                            className="rounded"
                            placeholder={
                              <div className="flex items-center justify-center h-32 bg-gray-100">
                                <FaFileImage className="text-3xl text-gray-400" />
                              </div>
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <LiaFileInvoiceDollarSolid className="mr-2 text-green-500" />
                      Taxpayer Document
                    </h4>
                    {sellerInfo?.documents?.taxpayerDoc ? (
                      <Image
                        width="100%"
                        src={sellerInfo.documents.taxpayerDoc}
                        alt="Taxpayer Document"
                        className="border rounded"
                        placeholder={
                          <div className="flex items-center justify-center h-48 bg-gray-100">
                            <FaFileImage className="text-3xl text-gray-400" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No taxpayer document provided
                      </div>
                    )}
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Business Documents" className="shadow-sm h-full">
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <LiaBuildingSolid className="mr-2 text-purple-500" />
                      Trade Register
                    </h4>
                    {sellerInfo?.documents?.tradeRegisterDoc ? (
                      <Image
                        width="100%"
                        src={sellerInfo.documents.tradeRegisterDoc}
                        alt="Trade Register Document"
                        className="border rounded"
                        placeholder={
                          <div className="flex items-center justify-center h-48 bg-gray-100">
                            <FaFileImage className="text-3xl text-gray-400" />
                          </div>
                        }
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No trade register document provided
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Document Links</h4>
                    <div className="space-y-2">
                      {renderDocumentLink(sellerInfo?.documents?.nidFront, "National ID Front")}
                      {renderDocumentLink(sellerInfo?.documents?.nidBack, "National ID Back")}
                      {renderDocumentLink(sellerInfo?.documents?.taxpayerDoc, "Taxpayer Document")}
                      {renderDocumentLink(sellerInfo?.documents?.tradeRegisterDoc, "Trade Register Document")}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>

      <style jsx>{`
        .seller-application-modal :global(.custom-steps .ant-steps-item-title) {
          font-size: 12px;
        }
        .seller-application-modal :global(.ant-steps-item-description) {
          font-size: 11px;
        }
      `}</style>
    </Modal>
  );
};

export default SellsModal;