const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const Message = require('./src/models/Message');
const User = require('./src/models/User');

dotenv.config({ path: './.env' });

const verifyPersistence = async () => {
    try {
        // 1. Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 2. Login to get token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'mentor@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const userId = loginRes.data.userId || (await User.findOne({ email: 'mentor@test.com' }))._id;

        console.log('Logged in as:', userId);

        // 3. Send Chat Message
        const messageContent = `Test persistence ${Date.now()}`;
        console.log('Sending message:', messageContent);

        const chatRes = await axios.post('http://localhost:5000/api/chat/ai-chat',
            { message: messageContent },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('AI Response:', chatRes.data.reply);

        // 4. Verify Persistence
        // Wait a bit for async operations if any (though await should handle it)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check User Message
        const savedUserMsg = await Message.findOne({
            sender: userId,
            content: messageContent
        });

        if (savedUserMsg) {
            console.log('✅ User message saved successfully:', savedUserMsg._id);
        } else {
            console.error('❌ User message NOT found!');
        }

        // Check AI Message
        const savedAIMsg = await Message.findOne({
            sender: 'ai-bot',
            receiver: userId,
            content: chatRes.data.reply
        });

        if (savedAIMsg) {
            console.log('✅ AI message saved successfully:', savedAIMsg._id);
            console.log('   Metadata:', savedAIMsg.aiMetadata);
        } else {
            console.error('❌ AI message NOT found!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('Response data:', error.response.data);
        process.exit(1);
    }
};

verifyPersistence();
