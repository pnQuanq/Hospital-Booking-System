import React, { useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Payment from "./Payment"; // Import your Payment component

const MyAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [viewingReview, setViewingReview] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("AToken");
      console.log("1. Token:", token);
      if (!token) {
        alert("User not authenticated");
        return;
      }

      const decoded = jwtDecode(token);
      const userId = parseInt(decoded?.UserId);
      console.log("2. Patient ID:", userId);

      try {
        const res = await axios.get(
          `http://localhost:5000/api/patient/get-all-appointment?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("3. API Response:", res.data);
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem("AToken");
    if (!token) {
      alert("User not authenticated");
      return;
    }

    // Confirm cancellation
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        "http://localhost:5000/api/home/update-appointment",
        {
          appointmentId: appointmentId,
          newStatus: "Cancelled",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Cancel appointment response:", response.data);

      // Update the local state to reflect the change
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.appointmentId === appointmentId
            ? { ...appointment, status: "Cancelled" }
            : appointment
        )
      );

      alert("Appointment cancelled successfully!");
    } catch (err) {
      console.error("Failed to cancel appointment:", err);

      // Handle different error scenarios
      if (err.response?.status === 400) {
        alert("Invalid appointment ID or status. Please try again.");
      } else if (err.response?.status === 401) {
        alert("You are not authorized to perform this action.");
      } else {
        alert("Failed to cancel appointment. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async (appointment) => {
    setPaymentLoading(true);
    setSelectedAppointment(appointment);

    const token = localStorage.getItem("AToken");
    if (!token) {
      alert("User not authenticated");
      setPaymentLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/patient/get-payment-detail/${appointment.appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Payment info response:", response.data);
      setPaymentInfo(response.data);
      setShowPayment(true);
    } catch (err) {
      console.error("Failed to fetch payment details:", err);

      if (err.response?.status === 401) {
        alert("You are not authorized to access this information.");
      } else if (err.response?.status === 404) {
        alert("Payment information not found for this appointment.");
      } else {
        alert("Failed to load payment details. Please try again later.");
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBackToAppointments = () => {
    setShowPayment(false);
    setSelectedAppointment(null);
    setPaymentInfo(null);
  };

  const handlePaymentSuccess = () => {
    // Update the appointment status to "Confirmed" after successful payment
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment.appointmentId === selectedAppointment.appointmentId
          ? { ...appointment, status: "Confirmed" }
          : appointment
      )
    );

    // Go back to appointments list
    handleBackToAppointments();
  };

  const handleReviewRating = (appointment) => {
    setReviewAppointment(appointment);
    setViewingReview(false);
    setShowReview(true);
  };

  const handleViewReview = async (appointment) => {
    const token = localStorage.getItem("AToken");
    if (!token) {
      alert("User not authenticated");
      return;
    }

    setReviewLoading(true);

    try {
      console.log(
        "Fetching review for appointment:",
        appointment.appointmentId
      );

      // Try to get review data directly by appointment ID
      const reviewResponse = await axios.get(
        `http://localhost:5000/api/review/appointment/${appointment.appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Review response:", reviewResponse.data);

      // Set the review data and show the ViewReview component
      setReviewData(reviewResponse.data);
      setReviewAppointment(appointment);
      setViewingReview(true);
      setShowReview(true);
    } catch (err) {
      console.error("Failed to fetch review:", err);

      if (err.response?.status === 404) {
        alert("Review not found for this appointment.");
      } else if (err.response?.status === 401) {
        alert("You are not authorized to view this review.");
      } else {
        alert("Failed to load review. Please try again later.");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBackToAppointmentsList = () => {
    setShowReview(false);
    setReviewAppointment(null);
    setViewingReview(false);
    setReviewData(null);
  };

  const handleReviewSubmit = async (reviewData) => {
    const token = localStorage.getItem("AToken");
    if (!token) {
      alert("User not authenticated");
      return;
    }

    const requestData = {
      appointmentId: reviewData.appointmentId,
      rating: reviewData.rating,
      comment: "",
    };

    console.log("Submitting review with data:", requestData);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/review",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Review submitted successfully:", response.data);

      if (response.data.Success !== false) {
        alert("Review submitted successfully!");

        // Update the appointment's isReviewed status
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.appointmentId === reviewData.appointmentId
              ? { ...appointment, isReviewed: true }
              : appointment
          )
        );

        handleBackToAppointmentsList();
      } else {
        alert(response.data.Message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Failed to submit review:", err);

      if (err.response?.status === 400) {
        alert(
          err.response.data.Message ||
            "Invalid review data. Please check your input."
        );
      } else if (err.response?.status === 401) {
        alert("You are not authorized to submit this review.");
      } else if (err.response?.status === 403) {
        alert(
          err.response.data.Message ||
            "You don't have permission to review this appointment."
        );
      } else if (err.response?.status === 500) {
        alert("Server error occurred. Please try again later.");
      } else {
        alert("Failed to submit review. Please try again later.");
      }
    }
  };

  // If showing review, render Review component
  if (showReview && reviewAppointment) {
    if (viewingReview && reviewData) {
      return (
        <ViewReview
          appointment={reviewAppointment}
          reviewData={reviewData}
          onBack={handleBackToAppointmentsList}
        />
      );
    } else {
      return (
        <ReviewAndRating
          appointment={reviewAppointment}
          onBack={handleBackToAppointmentsList}
          onSubmit={handleReviewSubmit}
        />
      );
    }
  }

  // If showing payment, render Payment component
  if (showPayment && selectedAppointment && paymentInfo) {
    return (
      <Payment
        appointmentData={selectedAppointment}
        paymentInfo={paymentInfo}
        onBack={handleBackToAppointments}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>
      <div>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments found.</p>
        ) : (
          appointments.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-gray-300"
              key={index}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={`http://localhost:5000${item.doctorImageUrl}`}
                  alt=""
                />
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {item.doctorName}
                </p>
                <p>{item.speciality}</p>
                <p className="text-zinc-700 font-medium mt-1">Status:</p>
                <p
                  className={`text-xs font-medium ${
                    item.status === "Cancelled"
                      ? "text-red-600"
                      : item.status === "Confirmed"
                      ? "text-green-600"
                      : item.status === "Completed"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  {item.status}
                </p>
                <p className="text-zinc-700 font-medium mt-1">Date & Time:</p>
                <p className="text-xs">
                  {new Date(item.date).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                {/* Show Pay Online button only for pending appointments */}
                {item.status === "Pending" && (
                  <button
                    className={`cursor-pointer text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-blue-600 hover:text-white transition-all duration-300 ${
                      paymentLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handlePayOnline(item)}
                    disabled={paymentLoading || loading}
                  >
                    {paymentLoading ? "Loading..." : "Pay Online"}
                  </button>
                )}

                {/* Show Cancel button for non-cancelled appointments */}
                {item.status !== "Cancelled" && item.status !== "Completed" && (
                  <button
                    className={`cursor-pointer text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handleCancelAppointment(item.appointmentId)}
                    disabled={loading || paymentLoading}
                  >
                    {loading ? "Cancelling..." : "Cancel appointment"}
                  </button>
                )}

                {/* Show Review and Rating button for completed appointments */}
                {item.status === "Completed" && (
                  <>
                    {item.isReviewed === true ? (
                      <button
                        className={`cursor-pointer text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-blue-600 hover:text-white transition-all duration-300 ${
                          reviewLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => handleViewReview(item)}
                        disabled={reviewLoading}
                      >
                        {reviewLoading ? "Loading..." : "View Rating"}
                      </button>
                    ) : (
                      <button
                        className="cursor-pointer text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-green-600 hover:text-white transition-all duration-300"
                        onClick={() => handleReviewRating(item)}
                      >
                        Rate Doctor
                      </button>
                    )}
                  </>
                )}

                {/* Show message for cancelled appointments */}
                {item.status === "Cancelled" && (
                  <p className="text-red-600 text-sm font-medium text-center sm:min-w-48 py-2">
                    Appointment Cancelled
                  </p>
                )}

                {/* Show message for confirmed appointments */}
                {item.status === "Confirmed" && (
                  <p className="text-green-600 text-sm font-medium text-center sm:min-w-48 py-2">
                    Payment Completed
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// View Review Component
// View Review Component - Fixed Version
const ViewReview = ({ appointment, reviewData, onBack }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-2xl ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "";
    }
  };

  // Debug logs to help identify the issue
  console.log("ViewReview - reviewData:", reviewData);
  console.log("ViewReview - reviewData.data:", reviewData?.data);
  console.log("ViewReview - rating value:", reviewData?.data?.rating);
  console.log("ViewReview - rating type:", typeof reviewData?.data?.rating);

  // Get the rating value - handle both string and number types
  // The API returns data nested in reviewData.data
  const ratingValue = reviewData?.data?.rating
    ? parseInt(reviewData.data.rating)
    : 0;
  console.log("ViewReview - parsed rating:", ratingValue);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <button
            onClick={onBack}
            className="mb-4 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            ← Back to Appointments
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Your Rating</h2>
        </div>

        {/* Doctor Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <img
              src={`http://localhost:5000${appointment.doctorImageUrl}`}
              alt={appointment.doctorName}
              className="w-16 h-16 rounded-full object-cover bg-indigo-50"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {appointment.doctorName}
              </h3>
              <p className="text-gray-600">{appointment.speciality}</p>
              <p className="text-sm text-gray-500">
                Appointment Date:{" "}
                {new Date(appointment.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Display */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <h4 className="text-lg font-medium text-gray-700 mb-4">
              Your Rating
            </h4>
            <div className="flex items-center justify-center gap-1 mb-3">
              {renderStars(ratingValue)}
            </div>
            <div className="text-xl font-semibold text-gray-700 mb-2">
              {ratingValue}/5
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {getRatingText(ratingValue)}
            </p>
            
          </div>

          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={onBack}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Review and Rating Component
const ReviewAndRating = ({ appointment, onBack, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        appointmentId: appointment.appointmentId,
        doctorId: appointment.doctorId,
        rating: rating,
        review: "",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-3xl transition-colors duration-200 ${
            i <= (hoveredRating || rating) ? "text-yellow-400" : "text-gray-300"
          } hover:scale-110 transform`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <button
            onClick={onBack}
            className="mb-4 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            ← Back to Appointments
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            Rate Your Experience
          </h2>
        </div>

        {/* Doctor Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <img
              src={`http://localhost:5000${appointment.doctorImageUrl}`}
              alt={appointment.doctorName}
              className="w-16 h-16 rounded-full object-cover bg-indigo-50"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {appointment.doctorName}
              </h3>
              <p className="text-gray-600">{appointment.speciality}</p>
              <p className="text-sm text-gray-500">
                Appointment Date:{" "}
                {new Date(appointment.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Rating Section */}
          <div className="mb-8 text-center">
            <label className="block text-lg font-medium text-gray-700 mb-4">
              How would you rate your experience?
            </label>
            <div className="flex items-center justify-center gap-2 mb-4">
              {renderStars()}
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {rating === 0 && "Please select a rating"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                isSubmitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                isSubmitting
                  ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyAppointment;
