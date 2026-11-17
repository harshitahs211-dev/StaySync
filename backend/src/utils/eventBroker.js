const EventEmitter = require('events');

class EventBrokerEngine extends EventEmitter {}
const broker = new EventBrokerEngine();

// Event Topic Registry
const TOPICS = {
  BOOKING_CREATED: 'staysync.booking.created',
  PAYMENT_SUCCESS: 'staysync.payment.success',
  CHECKIN_COMPLETED: 'staysync.checkin.completed',
  HOUSEKEEPING_UPDATED: 'staysync.housekeeping.updated'
};

const eventLogHistory = [];

function publish(topic, payload) {
  const eventRecord = {
    eventId: `evt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    topic,
    payload,
    timestamp: new Date().toISOString()
  };
  
  eventLogHistory.unshift(eventRecord);
  if (eventLogHistory.length > 50) eventLogHistory.pop();

  console.log(`[Kafka/Broker Stream] Topic: [${topic}] | EventId: ${eventRecord.eventId}`);
  broker.emit(topic, eventRecord);
  return eventRecord;
}

function subscribe(topic, handler) {
  broker.on(topic, handler);
}

// -------------------------------------------------------------
// Background Worker Subscribers (Simulating Kafka Consumer Group)
// -------------------------------------------------------------

// 1. Notification Worker: Dispatches SMS / Email Alerts
subscribe(TOPICS.BOOKING_CREATED, (event) => {
  const { booking_reference, user_id, total_price } = event.payload;
  console.log(`[Worker Notification] 📩 Confirmation Email & SMS dispatched for Booking #${booking_reference} (Amount: ₹${total_price})`);
});

subscribe(TOPICS.PAYMENT_SUCCESS, (event) => {
  const { booking_reference, idempotency_key, amount } = event.payload;
  console.log(`[Worker Notification] 💳 Payment Confirmation SMS sent for Ref ${booking_reference} (Idempotency Token: ${idempotency_key})`);
});

// 2. Check-in Worker: Digital Key Activation
subscribe(TOPICS.CHECKIN_COMPLETED, (event) => {
  const { room_number, digital_key_token } = event.payload;
  console.log(`[Worker NFC IoT] 🔑 Room #${room_number} Door Lock NFC Activated with token ${digital_key_token}`);
});

function getEventHistory() {
  return eventLogHistory;
}

module.exports = {
  TOPICS,
  publish,
  subscribe,
  getEventHistory
};
