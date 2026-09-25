require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.WEBHOOK_DOMAIN;

app.use(express.json());

// ১. UptimeRobot এর জন্য Keep-Alive রুট
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
            <h1 style="color: #22c55e;">✔ মাস্টার সার্ভার সক্রিয় আছে!</h1>
            <p>সবগুলো টেলিগ্রাম বট ২৪ ঘণ্টা সচল আছে।</p>
        </div>
    `);
});

// ২. bots ফোল্ডার থেকে অটোমেটিক সব বট লোড করা
const botsDir = path.join(__dirname, 'bots');
const activeBots = [];

// ফোল্ডার না থাকলে তৈরি করবে
if (fs.existsSync(botsDir)) {
    const botFiles = fs.readdirSync(botsDir).filter(file => file.endsWith('.js'));

    botFiles.forEach((file, index) => {
        const botIndex = index + 1;
        const token = process.env[`BOT_TOKEN_${botIndex}`];

        if (token) {
            try {
                const initBot = require(path.join(botsDir, file));
                const botInstance = initBot(token);
                const webhookPath = `/webhook/bot${botIndex}`;

                // Webhook রুট যুক্ত করা
                app.use(botInstance.webhookCallback(webhookPath));

                activeBots.push({
                    name: file,
                    instance: botInstance,
                    path: webhookPath
                });
                console.log(`[LOADED] ${file} লোড হয়েছে।`);
            } catch (err) {
                console.error(`[ERROR] ${file} লোড করতে সমস্যা:`, err.message);
            }
        } else {
            console.warn(`[WARNING] ${file} এর জন্য .env তে BOT_TOKEN_${botIndex} পাওয়া যায়নি!`);
        }
    });
} else {
    console.error("❌ 'bots' ফোল্ডারটি পাওয়া যায়নি!");
}

// ৩. সার্ভার স্টার্ট এবং টেলিগ্রামের সাথে Webhook সেটআপ
app.listen(PORT, async () => {
    console.log(`🚀 সার্ভার চালু হয়েছে পোর্ট: ${PORT}`);

    if (DOMAIN && !DOMAIN.includes('your-app-name')) {
        for (const bot of activeBots) {
            try {
                const fullUrl = `${DOMAIN}${bot.path}`;
                await bot.instance.telegram.setWebhook(fullUrl);
                console.log(`[CONNECTED] ${bot.name} Webhook লিংক: ${fullUrl}`);
            } catch (err) {
                console.error(`[WEBHOOK ERROR] ${bot.name}:`, err.message);
            }
        }
    } else {
        console.warn('⚠️ সতর্কবার্তা: Render এর Environment Variables-এ WEBHOOK_DOMAIN সেট করুন!');
    }
});
