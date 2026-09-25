require('dotenv').config();
const express = require('express');

// বট ফাইলগুলো ইমপোর্ট করুন
const initBot1 = require('./bots/bot1');
const initBot2 = require('./bots/bot2');
// const initBot3 = require('./bots/bot3'); // ৩য় বট যোগ করতে চাইলে

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.WEBHOOK_DOMAIN;

app.use(express.json());

// ১. UptimeRobot এর জন্য Keep-Alive রুট
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
            <h1 style="color: #22c55e;">✔ মাস্টার সার্ভার সক্রিয় আছে!</h1>
            <p>সবগুলো টেলিগ্রাম বট ২৪ ঘণ্টা সচল এবং সুরক্ষিত আছে।</p>
        </div>
    `);
});

// ২. বটগুলো ইনিশিয়ালাইজ করা
const botsConfig = [
    { name: 'Bot 1', instance: initBot1(process.env.BOT_TOKEN_1), path: '/webhook/bot1' },
    { name: 'Bot 2', instance: initBot2(process.env.BOT_TOKEN_2), path: '/webhook/bot2' },
    // { name: 'Bot 3', instance: initBot3(process.env.BOT_TOKEN_3), path: '/webhook/bot3' },
];

// ৩. এক্সপ্রেস সার্ভারে প্রতিটি বটের Webhook রুট যুক্ত করা
botsConfig.forEach(bot => {
    app.use(bot.instance.webhookCallback(bot.path));
});

// ৪. সার্ভার স্টার্ট এবং টেলিগ্রামের সাথে Webhook কানেক্ট
app.listen(PORT, async () => {
    console.log(`=========================================`);
    console.log(`🚀 সার্ভার চালু হয়েছে পোর্ট: ${PORT}`);
    console.log(`=========================================`);

    if (!DOMAIN || DOMAIN.includes('your-app-name')) {
        console.warn('⚠️ সতর্কবার্তা: .env ফাইলে সঠিক WEBHOOK_DOMAIN লিংক দেওয়া হয়নি!');
        return;
    }

    // স্বয়ংক্রিয়ভাবে সবগুলো বটের জন্য Webhook সেটআপ
    for (const bot of botsConfig) {
        try {
            const webhookUrl = `${DOMAIN}${bot.path}`;
            await bot.instance.telegram.setWebhook(webhookUrl);
            console.log(`[CONNECTED] ${bot.name} Webhook লিঙ্ক হয়েছে: ${webhookUrl}`);
        } catch (error) {
            console.error(`[ERROR] ${bot.name} কানেক্ট হতে ব্যর্থ:`, error.message);
        }
    }
});
