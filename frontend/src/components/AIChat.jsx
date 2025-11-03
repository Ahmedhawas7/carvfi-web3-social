import React, { useState, useRef, useEffect } from 'react';

const AIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'مرحباً! أنا المساعد الافتراضي لـ CarVFi، كيف يمكنني مساعدتك اليوم؟',
      sender: 'AI',
      timestamp: new Date(),
      isCurrentUser: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'You',
        timestamp: new Date(),
        isCurrentUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsLoading(true);

      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: `شكراً على رسالتك: "${newMessage}". أنا هنا لمساعدتك في أي استفسار حول CarVFi وتقنية Web3.`,
          sender: 'AI',
          timestamp: new Date(),
          isCurrentUser: false
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleQuickReply = (reply) => {
    const userMessage = {
      id: Date.now().toString(),
      text: reply,
      sender: 'You',
      timestamp: new Date(),
      isCurrentUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      let aiResponse = '';
      switch(reply) {
        case 'كيفية ربط المحفظة':
          aiResponse = 'لربط محفظتك:\n1. انقر على زر "Connect Wallet"\n2. اختر محفظتك المفضلة (MetaMask, Trust Wallet, etc.)\n3. وافق على الصفقة في محفظتك\n4. سيتم ربط محفظتك تلقائياً';
          break;
        case 'كيفية كسب النقاط':
          aiResponse = 'يمكنك كسب النقاط عبر:\n• التفاعل مع المنشورات\n• إنشاء محتوى قيم\n• دعوة الأصدقاء\n• المشاركة في التحديات\n• إكمال المهام اليومية';
          break;
        case 'معلومات عن CarVFi':
          aiResponse = 'CarVFi هو منصة اجتماعية Web3 تجمع بين:\n• الشبكات الاجتماعية\n• تقنية البلوكشين\n• نظام المكافآت\n• الملكية الرقمية\n• المجتمع التفاعلي';
          break;
        default:
          aiResponse = 'شكراً على سؤالك! كيف يمكنني مساعدتك أكثر؟';
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'AI',
        timestamp: new Date(),
        isCurrentUser: false
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'مرحباً! أنا المساعد الافتراضي لـ CarVFi، كيف يمكنني مساعدتك اليوم؟',
        sender: 'AI',
        timestamp: new Date(),
        isCurrentUser: false
      }
    ]);
  };

  return (
    <div className="ai-chat-wrapper">
      {/* Header */}
      <div className="ai-chat-header-fixed">
        <div className="ai-header-info">
          <h3>المساعد الافتراضي CarVFi</h3>
          <div className="ai-status">● متصل الآن</div>
        </div>
        <div className="ai-header-actions-fixed">
          <button className="btn-clear-fixed" onClick={clearChat}>
            مسح المحادثة
          </button>
          <button className="btn-close-fixed" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="ai-chat-container-fixed">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isCurrentUser ? 'user' : 'ai'}`}
          >
            <div className="message-content">
              {message.text}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="quick-replies">
          <p>أسئلة سريعة:</p>
          <div className="reply-buttons">
            <button 
              className="reply-btn" 
              onClick={() => handleQuickReply('كيفية ربط المحفظة')}
            >
              كيفية ربط المحفظة
            </button>
            <button 
              className="reply-btn" 
              onClick={() => handleQuickReply('كيفية كسب النقاط')}
            >
              كيفية كسب النقاط
            </button>
            <button 
              className="reply-btn" 
              onClick={() => handleQuickReply('معلومات عن CarVFi')}
            >
              معلومات عن CarVFi
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="ai-chat-input-fixed">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn-send-fixed"
          disabled={isLoading || !newMessage.trim()}
        >
          إرسال
        </button>
      </form>
    </div>
  );
};

export default AIChat;
