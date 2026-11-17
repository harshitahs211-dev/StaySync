const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../../config/env');

let razorpayInstance = null;

function getRazorpayInstance() {
  if (!razorpayInstance) {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
      console.warn('[Razorpay Gateway] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in env.');
    }
    razorpayInstance = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

/**
 * Create a new Razorpay Order
 * @param {Object} options
 * @param {number} options.amount - Amount in INR
 * @param {string} options.receipt - Booking reference or receipt ID
 * @param {Object} options.notes - Metadata dictionary (bookingId, roomNumber, etc.)
 * @returns {Promise<Object>}
 */
async function createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  const rzp = getRazorpayInstance();
  const amountInPaise = Math.round(parseFloat(amount) * 100);

  try {
    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt.substring(0, 40),
      notes: {
        ...notes,
        system: 'StaySync Hotel Management System'
      }
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount, // in paise
      amountInINR: amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      created_at: order.created_at
    };
  } catch (err) {
    console.error('[Razorpay Gateway] Order creation error:', err);
    throw new Error(err.error?.description || err.message || 'Failed to create Razorpay order');
  }
}

/**
 * Verify Razorpay payment signature using HMAC SHA-256
 * @param {Object} options
 * @param {string} options.orderId
 * @param {string} options.paymentId
 * @param {string} options.signature
 * @returns {boolean}
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const secret = config.RAZORPAY_KEY_SECRET;
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[Razorpay Gateway] Signature verification error:', err);
    return false;
  }
}

/**
 * Verify Razorpay Webhook signature
 * @param {Object} options
 * @param {Buffer|string} options.rawBody
 * @param {string} options.signature
 * @param {string} [options.secret]
 * @returns {boolean}
 */
function verifyWebhookSignature({ rawBody, signature, secret }) {
  if (!rawBody || !signature) {
    return false;
  }

  try {
    const webhookSecret = secret || config.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[Razorpay Gateway] Webhook signature verification error:', err);
    return false;
  }
}

/**
 * Refund a captured Razorpay payment
 * @param {Object} options
 * @param {string} options.paymentId
 * @param {number} [options.amount] - Amount in INR (optional; full refund if omitted)
 * @param {Object} [options.notes]
 * @returns {Promise<Object>}
 */
async function refundPayment({ paymentId, amount, notes = {} }) {
  const rzp = getRazorpayInstance();
  const payload = { notes };
  if (amount) {
    payload.amount = Math.round(parseFloat(amount) * 100);
  }

  try {
    const refund = await rzp.payments.refund(paymentId, payload);
    return {
      success: true,
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount / 100,
      currency: refund.currency,
      status: refund.status
    };
  } catch (err) {
    console.error('[Razorpay Gateway] Refund error:', err);
    throw new Error(err.error?.description || err.message || 'Failed to process refund');
  }
}

module.exports = {
  getRazorpayInstance,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  refundPayment
};
