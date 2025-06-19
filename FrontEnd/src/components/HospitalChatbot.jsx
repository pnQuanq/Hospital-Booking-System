import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, MessageCircle, Loader2 } from "lucide-react";

const HospitalChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Hospital Booking Assistant. I can help you with:\n\n• Booking appointments\n• Checking appointment status\n• Finding doctors and specialties\n• General hospital information\n\nHow can I assist you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // JWT Token decoder function
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Get user info from JWT token
  useEffect(() => {
    const token = localStorage.getItem('AToken');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUserInfo({
          userId: parseInt(decoded.UserId),
          fullName: decoded.fullName,
          role: decoded.Role
        });
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem('AToken');
      
      const requestBody = {
        message: currentMessage,
        userId: userInfo?.userId || null,
        sessionId: sessionId
      };

      const headers = {
        "Content-Type": "application/json",
      };

      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:5000/api/chat/chat", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Store session ID for future requests
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      let errorText = "I'm sorry, I'm having trouble connecting right now. Please try again later or contact our support team.";
      
      if (error.message.includes("Authentication")) {
        errorText = "Please log in to continue using the chat service.";
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        isBot: true,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = async () => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem('AToken');
      const headers = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:5000/api/chat/history/${sessionId}`, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const history = await response.json();
        // Process history and update messages if needed
        console.log("Chat history loaded:", history);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    // Auto-focus input after setting message
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <div>
            <h3 className="font-semibold">Hospital Assistant</h3>
            <p className="text-blue-100 text-xs">
              {userInfo ? `Hello, ${userInfo.fullName}` : "Online"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-blue-100 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isBot ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isBot
                  ? message.isError
                    ? "bg-red-100 text-red-800"
                    : "bg-white text-gray-800 shadow-sm"
                  : "bg-blue-600 text-white"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.isBot && (
                  <Bot
                    size={16}
                    className={`mt-1 ${
                      message.isError ? "text-red-600" : "text-blue-600"
                    }`}
                  />
                )}
                <div className="flex-1">
                  <div className="text-sm">{formatMessage(message.text)}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.isBot ? "text-gray-500" : "text-blue-100"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                {!message.isBot && (
                  <User size={16} className="mt-1 text-blue-100" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <Bot size={16} className="text-blue-600" />
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="1"
            style={{ minHeight: "40px", maxHeight: "100px" }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !inputMessage.trim() || isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            "Book Appointment",
            "Check Status",
            "Find Doctor",
            "Hospital Hours",
          ].map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
              disabled={isLoading}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalChatbot;