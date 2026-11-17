const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('staysync_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || 'API request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),

  // Hotels & Rooms
  getHotels: () => request('/rooms/hotels'),
  getRooms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/rooms${query ? '?' + query : ''}`);
  },
  getAvailableRooms: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/rooms/available?${query}`);
  },
  getRoomById: (id) => request(`/rooms/${id}`),
  getRoomTypes: () => request('/rooms/types'),
  getAmenities: () => request('/rooms/amenities'),

  // Bookings & Checkout
  createBooking: (bookingData) => request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  createWalkInBooking: (bookingData) => request('/bookings/walkin', { method: 'POST', body: JSON.stringify(bookingData) }),
  getBookings: () => request('/bookings'),
  getBookingById: (id) => request(`/bookings/${id}`),
  checkoutBooking: (id) => request(`/bookings/${id}/checkout`, { method: 'POST' }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),

  // Payments & Razorpay
  createRazorpayOrder: (orderData) => request('/payments/create-order', { method: 'POST', body: JSON.stringify(orderData) }),
  verifyRazorpayPayment: (verifyData) => request('/payments/verify', { method: 'POST', body: JSON.stringify(verifyData) }),
  cancelPaymentOrder: (cancelData) => request('/payments/cancel', { method: 'POST', body: JSON.stringify(cancelData) }),
  processRefund: (refundData) => request('/payments/refund', { method: 'POST', body: JSON.stringify(refundData) }),
  getPaymentHistory: () => request('/payments/history'),
  getPaymentOrderByRazorpayId: (orderId) => request(`/payments/order/${orderId}`),
  processPaymentCharge: (paymentData) => request('/payments/charge', { method: 'POST', body: JSON.stringify(paymentData) }),
  getPaymentStatus: (idempotencyKey) => request(`/payments/status/${idempotencyKey}`),

  // Check-In & Digital Keys
  performOnlineCheckin: (checkinData) => request('/checkin/online-checkin', { method: 'POST', body: JSON.stringify(checkinData) }),
  getDigitalKey: () => request('/checkin/digital-key', { method: 'POST' }),
  validateNFCKey: (payload) => request('/checkin/validate-key', { method: 'POST', body: JSON.stringify(payload) }),
  revokeNFCKey: (payload) => request('/checkin/revoke-key', { method: 'POST', body: JSON.stringify(payload) }),

  // In-Stay Services & Folio
  getServices: () => request('/services'),
  createService: (serviceData) => request('/services', { method: 'POST', body: JSON.stringify(serviceData) }),
  updateServiceStatus: (id, data) => request(`/services/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Housekeeping Staff Board
  getHousekeepingTasks: () => request('/housekeeping/tasks'),
  createHousekeepingTask: (taskData) => request('/housekeeping/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
  updateHousekeepingTaskStatus: (id, data) => request(`/housekeeping/tasks/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Maintenance Staff Board
  getMaintenanceTickets: () => request('/maintenance/tickets'),
  createMaintenanceTicket: (ticketData) => request('/maintenance/tickets', { method: 'POST', body: JSON.stringify(ticketData) }),
  updateMaintenanceTicket: (id, data) => request(`/maintenance/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Restaurant & In-Room Dining
  getRestaurantMenu: () => request('/restaurant/menu'),
  getRestaurantOrders: () => request('/restaurant/orders'),
  placeRestaurantOrder: (orderData) => request('/restaurant/order', { method: 'POST', body: JSON.stringify(orderData) }),
  updateRestaurantOrderStatus: (id, data) => request(`/restaurant/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Reviews & Aspect Sentiment
  getReviews: (hotelId) => request(`/reviews${hotelId ? '?hotelId=' + hotelId : ''}`),
  submitReview: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),

  // Loyalty Rewards
  getLoyalty: () => request('/loyalty'),
  redeemLoyalty: (data) => request('/loyalty/redeem', { method: 'POST', body: JSON.stringify(data) }),

  // IoT Smart Room Controls
  getRoomControls: (roomNumber) => request(`/iot/controls/${roomNumber}`),
  updateRoomControls: (roomNumber, data) => request(`/iot/controls/${roomNumber}`, { method: 'POST', body: JSON.stringify(data) }),

  // AI Recommendations & Manager Analytics
  getAIRecommendations: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/recommendations/recommend?${query}`);
  },
  analyzeSentiment: (reviewText) => request('/recommendations/sentiment', { method: 'POST', body: JSON.stringify({ reviewText }) }),
  getManagerAnalytics: () => request('/analytics/dashboard'),
  getDynamicPricing: () => request('/analytics/dynamic-pricing')
};
