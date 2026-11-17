import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, MessageSquare, Star, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SentimentWidget() {
  const [reviewText, setReviewText] = useState('The ocean suite view was breathtaking! Room service was fast and the digital NFC key worked seamlessly.');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeSentiment(reviewText);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border-glass)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--accent-gold-light)' }}>
        <Sparkles size={20} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AI Guest Sentiment Analyzer</h3>
      </div>

      <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          className="input-field"
          rows={3}
          placeholder="Share your stay experience or feedback..."
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
        />

        <button type="submit" disabled={analyzing} className="btn-gold" style={{ alignSelf: 'flex-start', fontSize: '0.85rem' }}>
          {analyzing ? 'Analyzing NLP Sentiment...' : 'Analyze Review Sentiment'}
        </button>
      </form>

      {result && (
        <div className="animate-fade" style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Classification</span>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: result.sentiment_classification === 'POSITIVE' ? '#10b981' : result.sentiment_classification === 'NEGATIVE' ? '#ef4444' : '#f59e0b'
              }}>
                ● {result.sentiment_classification} (Confidence: {Math.round(result.confidence_score * 100)}%)
              </div>
            </div>
            <span className="badge badge-available">AI Model v2.4</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.82rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Cleanliness</div>
              <strong>{result.aspect_ratings.cleanliness} / 5</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Service</div>
              <strong>{result.aspect_ratings.service} / 5</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.5rem', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-muted)' }}>Comfort</div>
              <strong>{result.aspect_ratings.comfort} / 5</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
