import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layout, Typography, Row, Col, Button, Input, Avatar, Badge, Card, Divider, message as antMessage, Space } from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    QuestionCircleOutlined,
    ClockCircleOutlined,
    BookOutlined,
    HeartOutlined,
    LoadingOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import './ChatPage.scss';

// ✅ Import chatbot service
import {
    createChatBotSession,
    sendMessage as sendChatMessage,
    sendFirstMessage,
    extractTextFromResponse,
    generateSessionId,
    extractMixedContentFromResponse
} from '../../services/chatbotService';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const ChatPage = () => {
    const [messages, setMessages] = useState([
        {
            id: `welcome_${Date.now()}`,
            type: 'bot',
            content: 'Xin chào! Tôi là DABS Assistant - Trợ lý đặt khám thông minh được hỗ trợ bởi AI. Tôi có thể giúp bạn đặt lịch khám bệnh, tìm bác sĩ phù hợp và trả lời các câu hỏi về y tế. Bạn cần hỗ trợ gì hôm nay?',
            time: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // ✅ Use refs for values that don't need to trigger re-renders
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const inputValueRef = useRef('');
    const initializationRef = useRef(false);
    const userIdRef = useRef(null);

    // ✅ Get user and token from Redux store with proper null checking
    const user = useSelector((state) => state.user?.user);
    const accessToken = useSelector((state) => state.user?.accessToken || state.auth?.accessToken);

    // ✅ Ensure userId is always a string
    const userId = user?.id ? String(user.id) : `guest_${Date.now()}`;

    // ✅ Initialize chat session using chatbotService with useCallback
    const initializeChatSession = useCallback(async () => {
        if (initializationRef.current || isInitializing || !userId || !accessToken) {
            return;
        }

        initializationRef.current = true;
        setIsInitializing(true);

        try {
            console.log('🔄 Initializing chat session for user:', userId);

            // Generate unique session ID
            const newSessionId = generateSessionId();
            console.log('🆔 Generated session ID:', newSessionId);

            // Create session using chatbotService
            const sessionResult = await createChatBotSession(newSessionId, userId, accessToken);

            console.log('✅ Session created:', sessionResult);

            // Ensure sessionId is always a string
            const finalSessionId = String(sessionResult?.sessionId || newSessionId);
            console.log('✅ Final session ID (string):', finalSessionId);
            setSessionId(finalSessionId);
            userIdRef.current = userId;

            antMessage.success('Đã kết nối với trợ lý AI!');

        } catch (error) {
            console.error('❌ Error initializing chat session:', error);
            antMessage.error('Không thể kết nối với trợ lý AI. Vui lòng thử lại.');
            setSessionId(null);
            initializationRef.current = false; // Allow retry
        } finally {
            setIsInitializing(false);
        }
    }, [userId, accessToken, isInitializing]);

    // ✅ Initialize chat session when component mounts and user/token are available
    useEffect(() => {
        if (userId && userId !== `guest_${Date.now()}` && accessToken && !initializationRef.current) {
            initializeChatSession();
        }
    }, [userId, accessToken, initializeChatSession]);

    // ✅ Enhanced scroll behavior with better timing
    useEffect(() => {
        if (messagesEndRef.current) {
            // ✅ Scroll with a slight delay to ensure DOM is updated
            const scrollTimer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
            
            return () => clearTimeout(scrollTimer);
        }
    }, [messages]);

    // Focus vào input khi trang được load
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // ✅ New function to process multiple responses with delay (similar to ChatBot)
    const processMultipleResponses = async (response) => {
        console.log('📦 Processing multiple responses:', response);

        // ✅ Try both parsing methods
        let parsedResponse = extractTextFromResponse(response);
        
        if (!parsedResponse || parsedResponse.length === 0) {
            console.log('🔄 Trying mixed content parser...');
            parsedResponse = extractMixedContentFromResponse(response);
        }
        
        console.log('📋 Final parsed response:', parsedResponse);

        if (parsedResponse && parsedResponse.length > 0) {
            // ✅ Process each message with a small delay for better UX
            for (let i = 0; i < parsedResponse.length; i++) {
                const messageData = parsedResponse[i];
                console.log(`📨 Processing message ${i + 1}/${parsedResponse.length}:`, messageData);
                
                // ✅ Add delay between messages for natural conversation flow
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between messages
                }

                if (messageData.type === 'choice') {
                    // ✅ Add choice message with buttons
                    const choiceMessageObj = {
                        id: `choice_${Date.now()}_${i}`,
                        type: 'bot',
                        content: messageData.text,
                        choices: messageData.choices,
                        time: new Date()
                    };
                    console.log('🎯 Adding choice message:', choiceMessageObj);
                    
                    setMessages(prev => [...prev, choiceMessageObj]);
                    
                } else if (messageData.type === 'text' && messageData.content.trim()) {
                    // ✅ Add regular text message (skip empty ones)
                    const textMessageObj = {
                        id: `text_${Date.now()}_${i}`,
                        type: 'bot',
                        content: messageData.content,
                        time: new Date()
                    };
                    console.log('📝 Adding text message:', textMessageObj);
                    
                    setMessages(prev => [...prev, textMessageObj]);
                }

                // ✅ Scroll to bottom after each message
                setTimeout(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        } else {
            // ✅ Fallback - try to extract plain text and split into multiple messages if needed
            console.log('⚠️ Parsing failed, trying plain text extraction...');
            const plainText = response
                .map(event => event.content?.parts?.map(part => part.text).join(' '))
                .filter(Boolean)
                .join(' ');
                
            if (plainText.trim()) {
                // ✅ Split long text into multiple messages if it contains multiple paragraphs
                const textParts = plainText.split('\n\n').filter(part => part.trim());
                
                if (textParts.length > 1) {
                    console.log(`📄 Splitting response into ${textParts.length} parts`);
                    
                    for (let i = 0; i < textParts.length; i++) {
                        if (i > 0) {
                            await new Promise(resolve => setTimeout(resolve, 800)); // Longer delay for split messages
                        }
                        
                        const partMessageObj = {
                            id: `split_${Date.now()}_${i}`,
                            type: 'bot',
                            content: textParts[i].trim(),
                            time: new Date()
                        };
                        
                        setMessages(prev => [...prev, partMessageObj]);
                        
                        setTimeout(() => {
                            if (messagesEndRef.current) {
                                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                            }
                        }, 100);
                    }
                } else {
                    const fallbackMessageObj = {
                        id: `fallback_${Date.now()}`,
                        type: 'bot',
                        content: plainText,
                        time: new Date()
                    };
                    setMessages(prev => [...prev, fallbackMessageObj]);
                }
            } else {
                const errorMessageObj = {
                    id: `error_${Date.now()}`,
                    type: 'bot',
                    content: 'Tôi đã nhận được tin nhắn của bạn nhưng không thể tạo phản hồi phù hợp.',
                    time: new Date()
                };
                setMessages(prev => [...prev, errorMessageObj]);
            }
        }
    };

    // ✅ Function to start new chat session with multiple welcome messages
    const startNewSession = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Starting new session...');

            if (!accessToken) {
                antMessage.error('Vui lòng đăng nhập để sử dụng trợ lý AI');
                return;
            }

            // Reset refs
            initializationRef.current = false;
            userIdRef.current = null;
            inputValueRef.current = '';
            setInputValue('');
            if (inputRef.current) {
                inputRef.current.value = '';
            }

            // Generate new session ID
            const newSessionId = generateSessionId();

            // Create new session
            const sessionResult = await createChatBotSession(newSessionId, userId, accessToken);

            console.log('✅ New session result:', sessionResult);

            // Ensure sessionId is always a string
            const finalSessionId = String(sessionResult?.sessionId || newSessionId);
            setSessionId(finalSessionId);
            userIdRef.current = userId;

            // ✅ Reset messages with multiple welcome messages for better onboarding
            const welcomeMessages = [
                {
                    id: `welcome_1_${Date.now()}`,
                    type: 'bot',
                    content: `Xin chào ${user?.fullName || user?.name || 'bạn'}! Tôi là DABS Assistant - Trợ lý đặt khám thông minh được hỗ trợ bởi AI.`,
                    time: new Date()
                },
                {
                    id: `welcome_2_${Date.now()}`,
                    type: 'bot',
                    content: `🏥 Tôi có thể giúp bạn:
• Đặt lịch khám bệnh theo chuyên khoa
• Tìm bác sĩ phù hợp với triệu chứng
• Tư vấn quy trình khám chữa bệnh
• Hướng dẫn chuẩn bị trước khi khám
• Giải đáp thắc mắc về y tế`,
                    time: new Date()
                },
                {
                    id: `welcome_3_${Date.now()}`,
                    type: 'bot',
                    content: 'Hãy cho tôi biết bạn cần hỗ trợ gì hôm nay! Bạn có thể bắt đầu bằng cách mô tả triệu chứng hoặc yêu cầu cụ thể.',
                    time: new Date()
                }
            ];

            setMessages(welcomeMessages);

            antMessage.success('Đã tạo phiên chat mới với trợ lý AI!');
            console.log('✅ New session started:', finalSessionId);

        } catch (error) {
            console.error('❌ Error creating new session:', error);
            antMessage.error('Không thể tạo phiên chat mới. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, userId, user]);

    // ✅ Handle input change using both ref and state
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        inputValueRef.current = value;
        setInputValue(value);
        setInput(value); // ✅ Also update input state for sendMessage
    }, []);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && inputValue.trim() && !isLoading) {
            sendMessage();
        }
    }, [inputValue, isLoading]);

    // ✅ Enhanced sendMessage function to handle multiple responses
    const sendMessage = async () => {
        if (!input.trim() || isLoading || !sessionId || !accessToken) {
            if (!accessToken) {
                antMessage.error('Vui lòng đăng nhập để sử dụng trợ lý AI');
            }
            return;
        }

        const userMessage = input.trim();
        setInput('');
        setInputValue(''); // ✅ Clear both states
        inputValueRef.current = '';
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setIsLoading(true);

        // ✅ Add user message immediately
        const userMessageObj = {
            id: `user_${Date.now()}`,
            type: 'user',
            content: userMessage,
            time: new Date()
        };

        setMessages(prev => [...prev, userMessageObj]);

        try {
            console.log('🔄 Sending message to ADK agent...');

            const response = await sendChatMessage(sessionId, userId, userMessage);
            console.log('✅ Raw response from API:', response);

            // ✅ Process multiple messages from response
            await processMultipleResponses(response);

        } catch (error) {
            console.error('❌ Error sending message:', error);

            const errorMessageObj = {
                id: `error_${Date.now()}`,
                type: 'bot',
                content: 'Xin lỗi, có lỗi xảy ra khi kết nối với trợ lý AI. Vui lòng thử lại sau.',
                time: new Date()
            };

            setMessages(prev => [...prev, errorMessageObj]);
            antMessage.error('Lỗi kết nối API. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Enhanced handleChoiceClick to handle multiple responses
    const handleChoiceClick = useCallback(async (choice) => {
        console.log('🎯 Choice clicked:', choice);

        const userChoiceObj = {
            id: `user_choice_${Date.now()}`,
            type: 'user',
            content: choice.label,
            time: new Date()
        };
        setMessages(prev => [...prev, userChoiceObj]);

        setIsLoading(true);
        try {
            console.log('🔄 Sending choice value to API:', choice.value);
            
            const response = await sendChatMessage(sessionId, userId, choice.value);
            console.log('✅ Choice response from API:', response);
            
            // ✅ Use the same multiple response processing
            await processMultipleResponses(response);
            
        } catch (error) {
            console.error('❌ Error sending choice:', error);
            const errorMessageObj = {
                id: `choice_error_${Date.now()}`,
                type: 'bot',
                content: 'Xin lỗi, có lỗi xảy ra khi xử lý lựa chọn của bạn.',
                time: new Date()
            };
            setMessages(prev => [...prev, errorMessageObj]);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, accessToken, userId, isLoading]);

    // ✅ Enhanced handleSuggestedQuestion to handle multiple responses
    const handleSuggestedQuestion = useCallback(async (questionText) => {
        if (!sessionId || !accessToken) {
            antMessage.error('Vui lòng đăng nhập để sử dụng trợ lý AI');
            return;
        }

        inputValueRef.current = '';
        setInputValue('');
        setInput(''); // ✅ Clear all input states
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setIsLoading(true);

        // Thêm tin nhắn của người dùng
        const userMessageObj = {
            id: `user_suggest_${Date.now()}`,
            type: 'user',
            content: questionText,
            time: new Date()
        };

        setMessages(prev => [...prev, userMessageObj]);

        try {
            // Send to API
            const response = await sendChatMessage(sessionId, userId, questionText, accessToken);
            console.log('✅ Suggested question response:', response);
            
            // ✅ Use the same multiple response processing
            await processMultipleResponses(response);

        } catch (error) {
            console.error('❌ Error sending suggested question:', error);

            setMessages(prev => [...prev, {
                id: `suggest_error_${Date.now()}`,
                type: 'bot',
                content: 'Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.',
                time: new Date()
            }]);

            antMessage.error('Lỗi kết nối API. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, accessToken, userId]);

    // Format timestamp
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ✅ Get session status
    const getSessionStatus = () => {
        if (isInitializing) return { status: 'processing', text: 'Đang kết nối...' };
        if (!accessToken) return { status: 'warning', text: 'Chưa đăng nhập' };
        if (!sessionId) return { status: 'error', text: 'Chưa kết nối' };
        return { status: 'success', text: 'Trực tuyến với AI' };
    };

    const sessionStatus = getSessionStatus();

    // Danh sách câu hỏi gợi ý
    const suggestedQuestions = [
        { icon: <QuestionCircleOutlined />, text: 'Cách đặt lịch khám?' },
        { icon: <ClockCircleOutlined />, text: 'Giờ làm việc?' },
        { icon: <BookOutlined />, text: 'Có những chuyên khoa nào?' },
        { icon: <HeartOutlined />, text: 'Làm thế nào để tạo hồ sơ bệnh nhân?' },
    ];

    return (
        <Content className="chat-page-container" style={{ padding: '16px 24px' }}>
            <Row gutter={[24, 24]} style={{ height: 'calc(100vh - 140px)' }}>
                {/* ✅ Chat window với chiều rộng ban đầu (16/24) */}
                <Col xs={24} md={16} lg={16} xl={16} className="chat-main-col" style={{ height: '100%' }}>
                    <Card 
                        className="chat-card" 
                        style={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            padding: 0
                        }}
                        bodyStyle={{ 
                            padding: 0, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}
                    >
                        {/* ✅ Header với chiều cao fixed */}
                        <div className="chat-header" style={{ 
                            padding: '16px 20px', 
                            borderBottom: '1px solid #f0f0f0',
                            flexShrink: 0
                        }}>
                            <Avatar icon={<RobotOutlined />} className="bot-avatar" size={42} />
                            <div className="header-info">
                                <Title level={4} className="bot-name" style={{ margin: 0 }}>DABS Assistant</Title>
                                <div className="bot-status">
                                    <Badge status={sessionStatus.status} />
                                    <span>{sessionStatus.text}</span>
                                </div>
                            </div>
                            {/* ✅ Add new session button */}
                            <div className="header-actions">
                                <Button
                                    type="text"
                                    icon={<ReloadOutlined />}
                                    onClick={startNewSession}
                                    disabled={isLoading || isInitializing}
                                    loading={isLoading}
                                    title="Tạo phiên chat mới"
                                />
                            </div>
                        </div>

                        {/* ✅ Messages container với scroll tối ưu */}
                        <div 
                            className="chat-messages" 
                            style={{ 
                                flex: 1,
                                overflowY: 'auto',
                                padding: '16px 20px',
                                minHeight: 0, // Important for flexbox scrolling
                                maxHeight: 'calc(100vh - 280px)', // Dynamically adjust based on viewport
                                scrollBehavior: 'smooth'
                            }}
                        >
                            {messages.map((message, index) => (
                                <div
                                    key={message.id || `message_${index}`}
                                    className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
                                    style={{ marginBottom: '16px' }}
                                >
                                    {message.type === 'bot' && (
                                        <Avatar
                                            icon={<RobotOutlined />}
                                            className="message-avatar"
                                            size="default"
                                            style={{ flexShrink: 0 }}
                                        />
                                    )}

                                    <div className="message-content" style={{ maxWidth: '80%' }}>
                                        <div className="message-bubble" style={{
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            backgroundColor: message.type === 'user' ? '#1890ff' : '#f6f6f6',
                                            color: message.type === 'user' ? 'white' : '#333',
                                            wordBreak: 'break-word'
                                        }}>
                                            {/* ✅ Preserve line breaks and formatting */}
                                            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                                {message.content}
                                            </div>
                                        </div>

                                        {/* ✅ Render choice buttons if available */}
                                        {message.choices && message.choices.length > 0 && (
                                            <div className="choice-buttons" style={{ marginTop: 12 }}>
                                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                                    {message.choices.map((choice, choiceIndex) => (
                                                        <Button
                                                            key={`${message.id || index}_choice_${choiceIndex}`}
                                                            type="default"
                                                            onClick={() => handleChoiceClick(choice)}
                                                            style={{
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                height: 'auto',
                                                                padding: '8px 12px',
                                                                whiteSpace: 'normal',
                                                                wordWrap: 'break-word',
                                                                border: '1px solid #d9d9d9',
                                                                borderRadius: '6px'
                                                            }}
                                                            disabled={isLoading}
                                                        >
                                                            {choice.label}
                                                        </Button>
                                                    ))}
                                                </Space>
                                            </div>
                                        )}

                                        <div className="message-time" style={{
                                            fontSize: '11px',
                                            color: '#999',
                                            marginTop: '4px',
                                            textAlign: message.type === 'user' ? 'right' : 'left'
                                        }}>
                                            {formatTime(message.time)}
                                        </div>
                                    </div>

                                    {message.type === 'user' && (
                                        <Avatar
                                            icon={<UserOutlined />}
                                            className="message-avatar"
                                            size="default"
                                            style={{ flexShrink: 0 }}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* ✅ Loading indicator */}
                            {(isLoading || isInitializing) && (
                                <div className="message bot-message" style={{ marginBottom: '16px' }}>
                                    <Avatar
                                        icon={<RobotOutlined />}
                                        className="message-avatar"
                                        size="default"
                                        style={{ flexShrink: 0 }}
                                    />
                                    <div className="message-content">
                                        <div className="message-bubble loading" style={{
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            backgroundColor: '#f6f6f6',
                                            color: '#333'
                                        }}>
                                            <LoadingOutlined /> {isInitializing ? 'Đang kết nối trợ lý AI...' : 'Đang xử lý...'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ✅ Input area với chiều cao fixed */}
                        <div 
                            className="chat-input" 
                            style={{ 
                                padding: '16px 20px', 
                                borderTop: '1px solid #f0f0f0',
                                flexShrink: 0
                            }}
                        >
                            <Input
                                placeholder={
                                    isLoading ? "Đang xử lý..." :
                                        isInitializing ? "Đang kết nối..." :
                                            !accessToken ? "Vui lòng đăng nhập để sử dụng AI..." :
                                                !sessionId ? "Chưa kết nối với AI..." :
                                                    "Nhập câu hỏi về y tế, đặt khám..."
                                }
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                size="large"
                                ref={inputRef}
                                disabled={isLoading || isInitializing || !sessionId || !accessToken}
                                suffix={
                                    <Button
                                        type="primary"
                                        icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
                                        onClick={sendMessage}
                                        disabled={!inputValue.trim() || isLoading || isInitializing || !sessionId || !accessToken}
                                        className="send-button"
                                        loading={isLoading}
                                    >
                                        Gửi
                                    </Button>
                                }
                            />
                        </div>
                    </Card>
                </Col>

                {/* ✅ Sidebar với chiều rộng ban đầu (8/24) */}
                <Col xs={24} md={8} lg={8} xl={8} style={{ height: '100%' }}>
                    <Card 
                        className="info-card" 
                        style={{ 
                            height: '100%',
                            overflowY: 'auto'
                        }}
                    >
                        <Title level={4}>Hỏi đáp y tế với AI</Title>
                        <Paragraph>
                            Trợ lý ảo DABS Assistant được hỗ trợ bởi AI có thể giúp bạn trả lời các câu hỏi về dịch vụ y tế,
                            đặt khám và thông tin về bác sĩ tại hệ thống DABS.
                        </Paragraph>

                        {/* ✅ Session info */}
                        {sessionId && (
                            <div className="session-info">
                                <small style={{ color: '#666' }}>
                                    Session ID: {sessionId.slice(-8)}...
                                </small>
                            </div>
                        )}

                        <Divider />

                        <div className="suggested-questions">
                            <Title level={5}>Câu hỏi thường gặp</Title>
                            {suggestedQuestions.map((question, index) => (
                                <Button
                                    key={index}
                                    className="question-button"
                                    icon={question.icon}
                                    onClick={() => handleSuggestedQuestion(question.text)}
                                    disabled={isLoading || isInitializing || !sessionId || !accessToken}
                                    loading={isLoading}
                                    style={{ 
                                        width: '100%', 
                                        marginBottom: '8px',
                                        textAlign: 'left',
                                        height: 'auto',
                                        padding: '8px 12px'
                                    }}
                                >
                                    {question.text}
                                </Button>
                            ))}
                        </div>

                        <Divider />

                        <div className="session-controls">
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={startNewSession}
                                disabled={isLoading || isInitializing}
                                loading={isLoading}
                                block
                            >
                                Tạo phiên chat mới
                            </Button>
                        </div>

                        <Divider />

                        <div className="contact-info">
                            <Title level={5}>Cần hỗ trợ thêm?</Title>
                            <Paragraph>
                                Vui lòng liên hệ với chúng tôi qua hotline: <strong>1900 1234</strong>
                                <br />
                                hoặc email: <strong>contact@dabs.com.vn</strong>
                            </Paragraph>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Content>
    );
};

export default ChatPage;