const { Telegraf } = require('telegraf');

function initBot1(token) {
    const bot = new Telegraf(token);

    // বটের কমান্ড ও লজিক
    bot.start((ctx) => {
        ctx.reply(`হ্যালো ${ctx.from.first_name}! আমি বট ১। আপনার সেবা করতে প্রস্তুত।`);
    });

    bot.help((ctx) => ctx.reply('যেকোনো মেসেজ লিখে পাঠান, আমি রিপ্লাই দেব!'));

    bot.on('text', (ctx) => {
        ctx.reply(`আপনি বলেছেন: "${ctx.message.text}" (Processed by Bot 1)`);
    });

    return bot;
}

module.exports = initBot1;
