'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  ThumbsUp, 
  ThumbsDown, 
  Bug, 
  Lightbulb, 
  HelpCircle,
  Send,
  CheckCircle2
} from 'lucide-react';

type FeedbackType = 'general' | 'bug' | 'feature' | 'help';

interface FeedbackWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
}

export default function FeedbackWidget({ position = 'bottom-right' }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { id: 'general' as FeedbackType, icon: MessageSquare, label: 'General Feedback', color: 'bg-slate-500' },
    { id: 'bug' as FeedbackType, icon: Bug, label: 'Report a Bug', color: 'bg-red-500' },
    { id: 'feature' as FeedbackType, icon: Lightbulb, label: 'Feature Request', color: 'bg-amber-500' },
    { id: 'help' as FeedbackType, icon: HelpCircle, label: 'Need Help', color: 'bg-blue-500' },
  ];

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    
    // TODO: Connect to your backend API
    // await api.submitFeedback({ type: feedbackType, rating, message, email });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setFeedbackType(null);
      setRating(null);
      setMessage('');
      setEmail('');
    }, 3000);
  };

  const positionClasses = position === 'bottom-right' 
    ? 'right-6 bottom-6' 
    : 'left-6 bottom-6';

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses} z-50 w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Send feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed ${positionClasses} z-50 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">
                  {submitted ? 'Thanks!' : feedbackType ? 'Send Feedback' : 'How can we help?'}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-slate-900 font-medium mb-1">Feedback received!</p>
                    <p className="text-sm text-slate-500">We'll use this to improve Movva.</p>
                  </motion.div>
                ) : !feedbackType ? (
                  <div className="space-y-2">
                    {feedbackTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFeedbackType(type.id)}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left"
                      >
                        <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}>
                          <type.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-slate-700">{type.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Back button */}
                    <button
                      onClick={() => setFeedbackType(null)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      ← Back
                    </button>

                    {/* Quick rating for general feedback */}
                    {feedbackType === 'general' && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-3">How's your experience?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setRating('positive')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                              rating === 'positive'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                            Good
                          </button>
                          <button
                            onClick={() => setRating('negative')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                              rating === 'negative'
                                ? 'bg-red-50 border-red-300 text-red-700'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <ThumbsDown className="w-5 h-5" />
                            Needs work
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {feedbackType === 'bug' 
                          ? 'What went wrong?' 
                          : feedbackType === 'feature'
                          ? 'What feature would you like?'
                          : feedbackType === 'help'
                          ? 'What do you need help with?'
                          : 'Tell us more'}
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          feedbackType === 'bug'
                            ? 'Describe the issue and steps to reproduce...'
                            : feedbackType === 'feature'
                            ? 'Describe the feature and how it would help you...'
                            : 'Type your message...'
                        }
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>

                    {/* Email (optional) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email (optional - for follow-up)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim() || isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Feedback
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!submitted && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-500 text-center">
                    Your feedback helps us build a better product 💜
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
