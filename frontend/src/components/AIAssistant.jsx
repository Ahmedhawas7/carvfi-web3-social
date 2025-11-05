import React, { useState, useRef, useEffect } from 'react';

const AIAssistant = ({ user, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Assistant. I can help you with:\n• Chat and answer questions\n• Analyze images you upload\n• Read PDF, ZIP, and TXT files\n• Generate images from text\n\nHow can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('chat');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated API calls - Replace with actual OpenAI API
  const simulateAPICall = (prompt, type = 'text') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let response = '';
        switch (type) {
          case 'image_analysis':
            response = `I've analyzed the image you uploaded. It appears to be ${prompt || 'an image'}.\n\nKey observations:\n• Visual content detected\n• Colors and composition analyzed\n• Potential context understood\n\nHow would you like me to help with this image?`;
            break;
          case 'file_analysis':
            response = `I've processed the file you uploaded (${prompt}).\n\nFile analysis complete:\n• Content extracted successfully\n• Ready to answer questions about it\n• Key information processed\n\nWhat would you like to know about this file?`;
            break;
          case 'image_generation':
            response = `I've generated an image based on your prompt: "${prompt}"\n\nThe image has been created with:\n• Your specified theme and style\n• High-quality resolution\n• Creative interpretation\n\nWould you like to generate another image or modify this one?`;
            break;
          default:
            response = `I understand you're asking about: "${prompt}"\n\nThis is a simulated response. In a real implementation, this would connect to OpenAI GPT-4 with vision capabilities to provide intelligent responses based on your query and any uploaded files or images.\n\nHow else can I assist you?`;
        }
        resolve(response);
      }, 2000);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !uploadedImage && !uploadedFile) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      image: uploadedImage,
      file: uploadedFile,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setUploadedImage(null);
    setUploadedFile(null);

    try {
      let responseType = 'text';
      if (uploadedImage) responseType = 'image_analysis';
      if (uploadedFile) responseType = 'file_analysis';

      const aiResponse = await simulateAPICall(inputMessage, responseType);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setInputMessage(prev => prev ? prev : 'Analyze this image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      setInputMessage(prev => prev ? prev : `Analyze this ${file.name.split('.').pop().toUpperCase()} file`);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await simulateAPICall(imagePrompt, 'image_generation');
      
      // Simulate generated image URL
      const mockImageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;
      setGeneratedImage(mockImageUrl);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        image: mockImageUrl,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setImagePrompt('');
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: 'Hello! I\'m your AI Assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
    setUploadedImage(null);
    setUploadedFile(null);
    setGeneratedImage(null);
  };

  const features = [
    { id: 'chat', name: 'Chat', icon: '💬', description: 'Text conversation' },
    { id: 'vision', name: 'Image Analysis', icon: '🖼️', description: 'Upload and analyze images' },
    { id: 'files', name: 'File Upload', icon: '📎', description: 'PDF, ZIP, TXT files' },
    { id: 'generate', name: 'Image Generation', icon: '🎨', description: 'Text to image' }
  ];

  return (
    <div className="ai-assistant-wrapper">
      {/* Header */}
      <div className="ai-assistant-header">
        <div className="ai-header-info">
          <h3>🤖 AI Assistant</h3>
          <div className="ai-status">Powered by OpenAI GPT-4</div>
        </div>
        <div className="ai-header-actions">
          <button className="btn-clear" onClick={clearChat}>
            Clear Chat
          </button>
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div className="ai-assistant-content">
        {/* Sidebar */}
        <div className="ai-sidebar">
          <div className="feature-list">
            {features.map(feature => (
              <button
                key={feature.id}
                className={`feature-btn ${activeFeature === feature.id ? 'active' : ''}`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <span className="feature-icon">{feature.icon}</span>
                <div className="feature-info">
                  <div className="feature-name">{feature.name}</div>
                  <div className="feature-desc">{feature.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* User Info */}
          <div className="user-section">
            <div className="user-avatar">
              {user?.walletAddress ? user.walletAddress.slice(2, 4).toUpperCase() : 'US'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username || 'User'}</div>
              <div className="user-wallet">
                {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not connected'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="ai-main">
          {/* Feature-specific input areas */}
          {activeFeature === 'vision' && (
            <div className="feature-panel">
              <h4>Image Analysis</h4>
              <p>Upload an image for AI analysis</p>
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="image-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="upload-btn">
                  📸 Upload Image
                </label>
                {uploadedImage && (
                  <div className="upload-preview">
                    <img src={uploadedImage} alt="Uploaded" />
                    <span>Image ready for analysis</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeFeature === 'files' && (
            <div className="feature-panel">
              <h4>File Upload</h4>
              <p>Upload PDF, ZIP, or TXT files</p>
              <div className="upload-area">
                <input
                  type="file"
                  accept=".pdf,.zip,.txt"
                  onChange={handleFileUpload}
                  id="file-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="upload-btn">
                  📎 Upload File
                </label>
                {uploadedFile && (
                  <div className="file-preview">
                    <span>📄 {uploadedFile.name}</span>
                    <small>{uploadedFile.type} • {uploadedFile.size}</small>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeFeature === 'generate' && (
            <div className="feature-panel">
              <h4>Image Generation</h4>
              <p>Create images from text descriptions</p>
              <div className="generate-area">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="generate-input"
                />
                <button 
                  onClick={handleGenerateImage}
                  disabled={!imagePrompt.trim() || isLoading}
                  className="generate-btn"
                >
                  {isLoading ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.image && (
                  <div className="message-image">
                    <img src={message.image} alt="Uploaded content" />
                  </div>
                )}
                <div className="message-content">
                  {message.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message ai loading">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="ai-input-area">
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  activeFeature === 'vision' ? "Ask about the image or type a message..." :
                  activeFeature === 'files' ? "Ask about the file or type a message..." :
                  activeFeature === 'generate' ? "Type a message or use image generation..." :
                  "Type your message here..."
                }
                disabled={isLoading}
                className="message-input"
              />
              <button
                type="submit"
                disabled={isLoading || (!inputMessage.trim() && !uploadedImage && !uploadedFile)}
                className="send-btn"
              >
                {isLoading ? '⏳' : '🚀'}
              </button>
            </div>
            
            {/* Upload indicators */}
            <div className="upload-indicators">
              {uploadedImage && (
                <span className="upload-indicator">🖼️ Image Ready</span>
              )}
              {uploadedFile && (
                <span className="upload-indicator">📎 {uploadedFile.name}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;