const BASE_URL = 'http://localhost:8080';
const userId = 'test_user';
const sessionId = 'test_session5';

export const createChatBotSession = async (sessionId, userId, patientToken) => {
    try {
        // Always include patient_token in body
        const requestBody = {
            patient_token: patientToken
        };

        const response = await fetch(`${BASE_URL}/apps/hospital_booking_agent/users/${userId}/sessions/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating chatbot session:", error);
        throw new Error("Failed to create chatbot session");
    }
}

export const sendMessage = async (sessionId, userId, message, streaming = false) => {
    try {
        const payload = {
            appName: "hospital_booking_agent",
            userId: `${userId}`,
            sessionId: `${sessionId}`,
            newMessage: {
                parts: [
                    {
                        text: message
                    }
                ],
                role: "user"
            },
            streaming: streaming
        };

        console.log('🔄 Sending payload to /run:', JSON.stringify(payload, null, 2));
        console.log('🔄 URL:', `${BASE_URL}/run`);

        const response = await fetch(`${BASE_URL}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        console.log('📊 Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Success response:', result);
        return result;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

// Simplified helper function - no longer needs user profile
export const sendFirstMessage = async (sessionId, userId, message) => {
    return await sendMessage(sessionId, userId, message, false);
}


// Test function
// Test function with better data display
export const testChatbot = async () => {
    try {
        console.log("Starting chatbot test...");

        const userProfile = {
            patient_id: "P001",
            fullname: "Nguyen Van A",
            dob: "1990-01-01",
            gender: "Male",
            cccd: "123456789",
            phone: "0123456789",
            email: "nguyenvana@email.com",
            address: "123 Main Street, Ho Chi Minh City"
        };

        // Step 1: Create session
        console.log("Creating chatbot session...");
        const sessionResult = await createChatBotSession(sessionId, userId);
        console.log("Session created:", JSON.stringify(sessionResult, null, 2));

        // Step 2: Send first message with user profile
        console.log("Sending first message with user profile...");
        const firstMessageResult = await sendFirstMessage(
            sessionId,
            userId,
            "Tôi muốn đặt lịch khám. Bạn có thể giúp tôi không?",
            userProfile
        );
        console.log("First message response:");
        console.log("- Full response:", JSON.stringify(firstMessageResult, null, 2));

        // Extract and display specific parts
        if (Array.isArray(firstMessageResult)) {
            firstMessageResult.forEach((event, index) => {
                console.log(`Event ${index + 1}:`, {
                    type: event.type || 'unknown',
                    content: event.content,
                    usageMetadata: event.usageMetadata
                });

                // Extract text content if available
                if (event.content && event.content.parts) {
                    event.content.parts.forEach((part, partIndex) => {
                        if (part.text) {
                            console.log(`  Text ${partIndex + 1}:`, part.text);
                        }
                    });
                }
            });
        }

        // Step 3: Send follow-up message
        console.log("Sending follow-up message...");
        const followUpResult = await sendMessage(
            sessionId,
            userId,
            "I need to book an appointment for a general checkup next week."
        );
        console.log("Follow-up message response:");
        console.log("- Full response:", JSON.stringify(followUpResult, null, 2));

        console.log("Test completed successfully!");
        return { sessionResult, firstMessageResult, followUpResult };

    } catch (error) {
        console.error("Test failed:", error);
        throw error;
    }
}

// Helper function to extract readable text from response
export const extractTextFromResponse = (response) => {
    if (!Array.isArray(response)) return null;

    const messages = [];
    
    response.forEach(event => {
        if (event.content && event.content.parts) {
            event.content.parts.forEach(part => {
                if (part.text) {
                    console.log('🔍 Processing part.text:', part.text);
                    
                    // ✅ First, check if the text contains JSON markers
                    if (part.text.includes('```json') || part.text.includes('{')) {
                        // ✅ Extract JSON from markdown code blocks or plain JSON
                        let jsonString = part.text;
                        
                        // Remove markdown code block markers if present
                        if (part.text.includes('```json')) {
                            const jsonMatch = part.text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
                            if (jsonMatch) {
                                jsonString = jsonMatch[1];
                            }
                        } else if (part.text.includes('```')) {
                            // Handle generic code blocks
                            const codeMatch = part.text.match(/```\s*(\{[\s\S]*?\})\s*```/);
                            if (codeMatch) {
                                jsonString = codeMatch[1];
                            }
                        } else {
                            // Try to extract JSON object from text
                            const jsonMatch = part.text.match(/(\{[\s\S]*\})/);
                            if (jsonMatch) {
                                jsonString = jsonMatch[1];
                            }
                        }
                        
                        console.log('🔍 Extracted JSON string:', jsonString);
                        
                        try {
                            const parsed = JSON.parse(jsonString.trim());
                            console.log('✅ Parsed JSON:', parsed);
                            
                            // ✅ Check if it has choice array (button format)
                            if (parsed.choice && Array.isArray(parsed.choice)) {
                                console.log('📋 Found choice buttons:', parsed.choice);
                                console.log('📝 Choice text:', parsed.text);
                                
                                messages.push({
                                    type: 'choice',
                                    text: parsed.text || 'Vui lòng chọn một tùy chọn:',
                                    choices: parsed.choice
                                });
                            } else if (parsed.text) {
                                // ✅ JSON with text field but no choices
                                messages.push({
                                    type: 'text',
                                    content: parsed.text
                                });
                            } else {
                                // ✅ JSON but unknown format - stringify it
                                messages.push({
                                    type: 'text',
                                    content: JSON.stringify(parsed, null, 2)
                                });
                            }
                        } catch (jsonError) {
                            console.log('❌ JSON parse error:', jsonError);
                            // ✅ If JSON parsing fails, treat as regular text
                            messages.push({
                                type: 'text',
                                content: part.text
                            });
                        }
                    } else {
                        // ✅ Regular text without JSON
                        console.log('📝 Plain text message:', part.text);
                        messages.push({
                            type: 'text',
                            content: part.text
                        });
                    }
                }
            });
        }
    });

    console.log('🎯 Final extracted messages:', messages);
    return messages;
}

export const extractMixedContentFromResponse = (response) => {
    if (!Array.isArray(response)) return null;

    const messages = [];
    
    response.forEach(event => {
        if (event.content && event.content.parts) {
            event.content.parts.forEach(part => {
                if (part.text) {
                    const text = part.text.trim();
                    console.log('🔍 Processing mixed content:', text);
                    
                    // ✅ Split content by potential JSON blocks
                    const parts = text.split(/(```(?:json)?\s*\{[\s\S]*?\}\s*```|\{[\s\S]*?\})/);
                    
                    parts.forEach(partContent => {
                        if (!partContent.trim()) return;
                        
                        if (partContent.includes('{') && partContent.includes('}')) {
                            // ✅ This might be JSON
                            let jsonString = partContent;
                            
                            // Clean up markdown markers
                            if (partContent.includes('```')) {
                                const cleanMatch = partContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                                if (cleanMatch) {
                                    jsonString = cleanMatch[1];
                                }
                            }
                            
                            try {
                                const parsed = JSON.parse(jsonString.trim());
                                
                                if (parsed.choice && Array.isArray(parsed.choice)) {
                                    messages.push({
                                        type: 'choice',
                                        text: parsed.text || 'Vui lòng chọn một tùy chọn:',
                                        choices: parsed.choice
                                    });
                                } else if (parsed.text) {
                                    messages.push({
                                        type: 'text',
                                        content: parsed.text
                                    });
                                } else {
                                    messages.push({
                                        type: 'text',
                                        content: JSON.stringify(parsed, null, 2)
                                    });
                                }
                            } catch (error) {
                                // ✅ Not valid JSON, treat as text
                                messages.push({
                                    type: 'text',
                                    content: partContent.trim()
                                });
                            }
                        } else {
                            // ✅ Regular text
                            messages.push({
                                type: 'text',
                                content: partContent.trim()
                            });
                        }
                    });
                }
            });
        }
    });

    return messages;
}

export const extractPlainTextFromResponse = (response) => {
    if (!Array.isArray(response)) return null;

    const textMessages = [];
    response.forEach(event => {
        if (event.content && event.content.parts) {
            event.content.parts.forEach(part => {
                if (part.text) {
                    textMessages.push(part.text);
                }
            });
        }
    });

    return textMessages.join(' ');
}

export const hasChoices = (parsedResponse) => {
    return Array.isArray(parsedResponse) && 
           parsedResponse.some(msg => msg.type === 'choice');
}

// Helper function to extract usage metadata
export const extractUsageMetadata = (response) => {
    if (!Array.isArray(response)) return null;

    const usageData = response.find(event => event.usageMetadata);
    return usageData ? usageData.usageMetadata : null;
}

// Utility function to generate unique session ID
export const generateSessionId = () => {
    return `hospital-booking-${Date.now()}`;
}

export const getTextMessages = (parsedResponse) => {
    if (!Array.isArray(parsedResponse)) return [];
    return parsedResponse
        .filter(msg => msg.type === 'text')
        .map(msg => msg.content)
        .join('\n');
}

export const getChoiceMessages = (parsedResponse) => {
    if (!Array.isArray(parsedResponse)) return [];
    return parsedResponse.filter(msg => msg.type === 'choice');
}