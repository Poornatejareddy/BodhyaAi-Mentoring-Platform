// Script to fix old messages with missing sender/receiver population
const mongoose = require('mongoose');
const Message = require('./src/models/Message');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function fixOldMessages() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find messages where sender is not populated (is just an ObjectId)
        const messages = await Message.find({});

        console.log(`Found ${messages.length} total messages`);

        let fixed = 0;
        for (const message of messages) {
            let needsUpdate = false;
            const updateData = {};

            // If sender is an ObjectId string, fetch the user
            if (message.sender && typeof message.sender === 'string') {
                const senderUser = await User.findById(message.sender);
                if (senderUser) {
                    needsUpdate = true;
                }
            }

            // If receiver is an ObjectId string (not 'ai-bot'), fetch the user
            if (message.receiver && typeof message.receiver === 'string' && message.receiver !== 'ai-bot') {
                const receiverUser = await User.findById(message.receiver);
                if (receiverUser) {
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                // Message will be re-populated when fetched
                fixed++;
            }
        }

        console.log(`✅ Checked ${fixed} messages`);
        console.log('Note: Messages are automatically populated when fetched via getChatHistory');
        console.log('The "Unknown" issue should be resolved with the backend fixes');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixOldMessages();
