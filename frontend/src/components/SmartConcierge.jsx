import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Clock, Wifi, Utensils, Key, CreditCard } from 'lucide-react';

const FAQ_KNOWLEDGE = [
  { keywords: ['check-in', 'checkin', 'check in', 'arrival'], answer: 'Standard check-in begins at 14:00 (2:00 PM IST). You can also complete express online check-in from your Guest Dashboard to receive your digital QR room key before arrival!' },
  { keywords: ['check-out', 'checkout', 'check out', 'departure', 'leave'], answer: 'Check-out is at 11:00 AM IST. Our Automated Checkout engine allows you to review your itemized folio, settle in-stay dining/spa charges, and download a tax invoice with one click.' },
  { keywords: ['wifi', 'wi-fi', 'internet', 'password'], answer: 'Complimentary high-speed gigabit Wi-Fi is available across all suites and garden pavilions. Network: "StaySync_Guest_Luxury", no password required once room authenticated.' },
  { keywords: ['breakfast', 'dining', 'restaurant', 'food', 'menu'], answer: 'Breakfast is served daily from 07:00 to 10:30 AM at The Pavilion. 24/7 In-Room Dining is available directly through the In-Stay Services tab on your dashboard.' },
  { keywords: ['spa', 'massage', 'wellness'], answer: 'The Ayurvedic Wellness Spa is open from 08:00 AM to 09:00 PM. You can book signature Abhyanga sessions and salt scrubs through your guest portal.' },
  { keywords: ['key', 'digital key', 'unlock', 'door', 'nfc'], answer: 'Your Digital Room Key is active immediately upon online check-in. Simply tap "Simulate NFC Door Unlock" on your dashboard or scan the room QR code.' },
  { keywords: ['cancel', 'cancellation', 'refund'], answer: 'Cancellations made 24 hours prior to check-in are eligible for a 100% full refund credited back to your original payment method automatically.' }
];

export default function SmartConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! Welcome to StaySync Luxury Concierge. How may I assist your stay today? Feel free to ask about check-in, dining, spa wellness, or digital room keys.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    const queryLower = query.toLowerCase();

    // Rule-based conversational matcher
    let botReply = 'I would be delighted to assist with that. For specialized butler requests or concierge bookings, you can also place an in-stay request directly from your Guest Dashboard.';
    for (const item of FAQ_KNOWLEDGE) {
      if (item.keywords.some(k => queryLower.includes(k))) {
        botReply = item.answer;
        break;
      }
    }

    setMessages(prev => [...prev, userMsg, { sender: 'bot', text: botReply }]);
    setInput('');
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: 'var(--accent-sage-dark)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-hover)',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Bot size={20} />
          <span>Smart Concierge</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8DA58B', display: 'inline-block' }}></span>
        </button>
      )}

      {isOpen && (
        <div style={{
          width: '360px',
          height: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-light)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-sage-dark)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>StaySync Concierge</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-sage-dark)', fontWeight: 600 }}>● Online 24/7 AI Guide</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Quick FAQ Pills */}
          <div style={{ padding: '8px 12px', background: 'var(--bg-primary)', display: 'flex', gap: '6px', overflowX: 'auto', borderBottom: '1px solid var(--border-subtle)' }}>
            <button onClick={() => handleSend('Check-in timings?')} className="badge-sand" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Check-in?</button>
            <button onClick={() => handleSend('Breakfast hours?')} className="badge-sand" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Dining?</button>
            <button onClick={() => handleSend('Wi-Fi credentials?')} className="badge-sand" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Wi-Fi?</button>
            <button onClick={() => handleSend('Digital room key?')} className="badge-sand" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Digital Key?</button>
          </div>

          {/* Messages Body */}
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  backgroundColor: m.sender === 'user' ? 'var(--accent-sage-dark)' : 'var(--bg-secondary)',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                  padding: '9px 13px',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  lineHeight: '1.45',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: '8px',
              background: '#FFFFFF'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--accent-sage-dark)',
                color: '#FFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
