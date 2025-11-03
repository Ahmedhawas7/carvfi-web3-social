import React, { useState, useEffect, useRef } from 'react'

const AIChat = ({ account, contracts, widgetMode = false }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // رسالة ترحيب تلقائية
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `مرحباً! أنا مساعد CARVFi الذكي. كيف يمكنني مساعدتك اليوم؟`,
          sender: 'ai',
          timestamp: new Date()
        }
      ])
    }
  }, [])

  const simulateAIResponse = async (userMessage) => {
    // محاكاة استجابة الذكاء الاصطناعي
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = {
      'hello': 'أهلاً وسهلاً! أنا مساعد CARVFi. كيف يمكنني مساعدتك في منصتنا الاجتماعية؟',
      'help': 'يمكنني مساعدتك في: إنشاء البروفيل، كسب النقاط، حماية الحساب، واستكشاف منصة CARVFi!',
      'points': 'يمكنك كسب النقاط من خلال: التفاعل مع AI، تحديث البروفيل، الإبلاغ عن أخطاء، والإحالة!',
      'profile': 'اذهب إلى تبويب Profile لإنشاء وتعديل بروفيلك الشخصي!',
      'rewards': 'تحقق من تبويب Rewards لرؤية مكافآتك وكيفية كسب المزيد!',
      'protection': 'نظام الحماية لدينا يمنع الروبوتات ويكشف السلوك المشبوه!',
      'carv': 'CARVFi مبني على شبكة Carv SVM Testnet - منصة رائدة في الهوية الرقمية!',
      'default': 'هذا سؤال مثير للاهتمام! يمكنني مساعدتك في استكشاف ميزات CARVFi. هل تريد معرفة المزيد عن النقاط، البروفيل، أو الحماية؟'
    }

    const lowerMessage = userMessage.toLowerCase()
    let response = responses.default

    if (lowerMessage.includes('مرحبا') || lowerMessage.includes('اهلا')) response = responses.hello
    else if (lowerMessage.includes('مساعدة') || lowerMessage.includes('help')) response = responses.help
    else if (lowerMessage.includes('نقاط') || lowerMessage.includes('points')) response = responses.points
    else if (lowerMessage.includes('بروفيل') || lowerMessage.includes('profile')) response = responses.profile
    else if (lowerMessage.includes('مكافآت') || lowerMessage.includes('rewards')) response = responses.rewards
    else if (lowerMessage.includes('حماية') || lowerMessage.includes('protection')) response = responses.protection
    else if (lowerMessage.includes('carv')) response = responses.carv

    return response
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await simulateAIResponse(inputMessage)
      
      const aiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // مكافأة المستخدم على التفاعل مع AI
      if (contracts.socialRewards) {
        // await contracts.socialRewards.earnPoints(account, "ai_chat")
      }
    } catch (error) {
      console.error('Error in AI chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (widgetMode && isMinimized) {
    return (
      <div className="ai-chat" style={{ height: '60px', width: '200px' }}>
        <div className="chat-header" style={{ cursor: 'pointer' }} onClick={() => setIsMinimized(false)}>
          🤖 AI Assistant
        </div>
      </div>
    )
  }

  if (widgetMode) {
    return (
      <div className="ai-chat">
        <div className="chat-header" style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
          <span>🤖 CARVFi Assistant</span>
          <button 
            onClick={() => setIsMinimized(true)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            ➖
          </button>
        </div>
        
        <div className="chat-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ animation: 'pulse 1s infinite' }}>●</div>
                <div style={{ animation: 'pulse 1s infinite', animationDelay: '0.2s' }}>●</div>
                <div style={{ animation: 'pulse 1s infinite', animationDelay: '0.4s' }}>●</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            disabled={isLoading}
          />
          <button 
            className="btn" 
            onClick={handleSendMessage}
            disabled={isLoading}
            style={{ padding: '10px 15px' }}
          >
            إرسال
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>🤖 CARVFi AI Assistant</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        محادثة ذكية مع المساعد الآلي لكسب النقاط والحصول على المساعدة
      </p>

      <div style={{ 
        border: '1px solid #e2e8f0', 
        borderRadius: '10px', 
        height: '400px', 
        display: 'flex', 
        flexDirection: 'column',
        marginBottom: '20px'
      }}>
        <div style={{ 
          padding: '15px', 
          background: '#f7fafc', 
          borderBottom: '1px solid #e2e8f0',
          borderRadius: '10px 10px 0 0'
        }}>
          <strong>المحادثة</strong>
        </div>
        
        <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map(message => (
            <div key={message.id} style={{ 
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              background: message.sender === 'user' ? 'var(--primary)' : '#e2e8f0',
              color: message.sender === 'user' ? 'white' : 'var(--dark)',
              padding: '10px 15px',
              borderRadius: '15px',
              maxWidth: '70%',
              borderBottomRightRadius: message.sender === 'user' ? '5px' : '15px',
              borderBottomLeftRadius: message.sender === 'user' ? '15px' : '5px'
            }}>
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', background: '#e2e8f0', padding: '10px 15px', borderRadius: '15px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ animation: 'pulse 1s infinite' }}>●</div>
                <div style={{ animation: 'pulse 1s infinite', animationDelay: '0.2s' }}>●</div>
                <div style={{ animation: 'pulse 1s infinite', animationDelay: '0.4s' }}>●</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب سؤالك هنا..."
            disabled={isLoading}
            style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '5px' }}
          />
          <button 
            className="btn" 
            onClick={handleSendMessage}
            disabled={isLoading}
          >
            إرسال
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h4>🎯 كسب النقاط</h4>
          <p>احصل على 10 نقاط لكل محادثة مع المساعد AI</p>
        </div>
        
        <div className="card">
          <h4>💡 نصائح سريعة</h4>
          <p>اسأل عن: النقاط، البروفيل، المكافآت، الحماية</p>
        </div>
      </div>
    </div>
  )
}

export default AIChat
