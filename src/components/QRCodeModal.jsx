import React from "react";
import QRCode from "react-qr-code";

const QRCodeModal = ({ qrCodeData, onClose }) => {
  if (!qrCodeData) return null; // Don't render if no QR code data is provided

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded">
        <h2 className="text-lg font-medium mb-4">QR Code</h2>
        <QRCode value={qrCodeData} size={200} />
        <a href={qrCodeData}>{qrCodeData}</a>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
