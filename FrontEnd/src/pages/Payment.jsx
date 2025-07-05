import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Building2,
  Smartphone,
  Shield,
  Lock,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  MapPin,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function Payment({
  appointmentData,
  paymentInfo,
  onBack,
  onPaymentSuccess,
}) {
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    city: "",
    postalCode: "",
    saveCard: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const token = localStorage.getItem("AToken");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBankTransferPayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentError("");

      const bankTransferDto = {
        appointmentId: appointmentData.appointmentId,
        patientUserId: appointmentData.patientUserId || 1, // You may need to pass this from parent
        amount: calculateTotal(),
      };

      const response = await fetch(
        "http://localhost:5000/api/patient/bank-transfer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bankTransferDto),
        }
      );

      const result = await response.json();

      if (result.success) {
        setPaymentComplete(true);
        // Call parent component's success handler after a short delay
        setTimeout(() => {
          onPaymentSuccess(result);
        }, 2000);
      } else {
        setPaymentError(result.message || "Bank transfer payment failed");
      }
    } catch (error) {
      setPaymentError("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (selectedPayment === "bank") {
      await handleBankTransferPayment();
    } else {
      // Handle other payment methods (card, digital wallet)
      setIsProcessing(true);
      // Simulate payment processing for other methods
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentComplete(true);
        // Call parent component's success handler after a short delay
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      }, 3000);
    }
  };

  const calculateTotal = () => {
    const fee = paymentInfo?.fee || 0;
    const tax = fee * 0.1; // 10% tax
    return fee + tax;
  };

  const isPaymentDisabled = () => {
    if (selectedPayment === "card") {
      return (
        !formData.cardNumber ||
        !formData.expiryDate ||
        !formData.cvv ||
        !formData.cardholderName
      );
    }
    return false;
  };

  if (paymentComplete) {
    useEffect(() => {
      const timeout = setTimeout(() => {
        window.location.href = "http://localhost:5173/my-appointments";
      }, 3000); // wait 3 seconds before redirect

      return () => clearTimeout(timeout);
    }, []);

    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your appointment has been confirmed
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
          <p className="font-mono text-lg font-semibold">
            #APT-{appointmentData.appointmentId}
          </p>
        </div>
        <div className="text-left mb-6">
          <p className="text-sm text-gray-600 mb-1">Doctor</p>
          <p className="font-semibold">{paymentInfo.doctorName}</p>
          <p className="text-sm text-gray-600 mb-1 mt-2">Date & Time</p>
          <p className="font-semibold">
            {paymentInfo.date} at {paymentInfo.time}
          </p>
        </div>
        <p className="text-gray-500 text-sm">
          Redirecting to your appointments page...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center mb-2">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full hover:bg-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Complete Your Payment</h1>
        </div>
        <p className="text-blue-100">
          Secure checkout for your medical appointment
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Booking Summary */}
        <div className="lg:w-1/2 p-6 bg-gray-50 border-r border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Booking Summary
          </h3>

          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {paymentInfo?.doctorSpecialty || "General Consultation"}
                </p>
                <p className="text-sm text-gray-600">
                  {paymentInfo?.doctorName || "Doctor"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {paymentInfo?.date || "Date"}
                </p>
                <p className="text-sm text-gray-600">
                  {paymentInfo?.time || "Time"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <p className="font-medium text-gray-900">
                123 Hung Vuong Street, Ho Chi Minh City
              </p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Fee</span>
              <span className="font-medium">
                ${(paymentInfo?.fee || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax & Fees (10%)</span>
              <span className="font-medium">
                ${((paymentInfo?.fee || 0) * 0.1).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span className="text-blue-600">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="lg:w-1/2 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

            <div className="space-y-3">
              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedPayment === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={selectedPayment === "card"}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="sr-only"
                />
                <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Credit/Debit Card</span>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedPayment === "bank"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={selectedPayment === "bank"}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="sr-only"
                />
                <Building2 className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Bank Transfer</span>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedPayment === "digital"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="digital"
                  checked={selectedPayment === "digital"}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="sr-only"
                />
                <Smartphone className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Digital Wallet</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {paymentError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{paymentError}</p>
            </div>
          )}

          {selectedPayment === "card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="saveCard"
                  name="saveCard"
                  checked={formData.saveCard}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="saveCard"
                  className="ml-2 text-sm text-gray-700"
                >
                  Save card for future appointments
                </label>
              </div>
            </div>
          )}

          {selectedPayment === "bank" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Bank Transfer Payment
              </h4>
              <p className="text-sm text-blue-800 mb-2">
                Your payment will be processed instantly via bank transfer.
              </p>
              <p className="text-xs text-blue-700">
                Click "Pay Now" to complete the bank transfer payment for your
                appointment.
              </p>
            </div>
          )}

          {selectedPayment === "digital" && (
            <div className="space-y-3">
              <button className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2">
                <span className="font-medium">Pay with Apple Pay</span>
              </button>
              <button className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2">
                <span className="font-medium">Pay with Google Pay</span>
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
              <Shield className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing || isPaymentDisabled()}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>
                    {selectedPayment === "bank"
                      ? "Processing Bank Transfer..."
                      : "Processing Payment..."}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>
                    {selectedPayment === "bank"
                      ? "Pay Now"
                      : `Pay $${calculateTotal().toFixed(2)}`}
                  </span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              By completing this payment, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
