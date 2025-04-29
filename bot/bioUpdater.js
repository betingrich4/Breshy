const moment = require('moment-timezone');
const config = {
    BIO_INTERVAL: 60000, // 1 minute
    TIME_ZONE: 'Africa/Nairobi',
    TEMPLATES: [
        "🌟 Last seen: {time}",
        "📅 {date} | {emoji}",
        "🕒 Online at {time}",
        "🚀 Using StatusBot | {emoji}",
        "✨ Active now | {time}",
        "🌍 {time} | {emoji}",
        "⚡ Powered by MariselTech",
        "💫 {date} {emoji}"
    ],
    EMOJIS: ['✨', '⚡', '💫', '🚀', '🌈', '🎯', '🎭', '🦋']
};

let bioInterval;

function startBioUpdater(sock) {
    console.log("Starting bio updater...");
    
    bioInterval = setInterval(() => {
        updateBio(sock).catch(err => {
            console.error("Bio update error:", err);
        });
    }, config.BIO_INTERVAL);
    
    // Initial update
    updateBio(sock).catch(console.error);
}

async function updateBio(sock) {
    try {
        const now = moment().tz(config.TIME_ZONE);
        const template = config.TEMPLATES[
            Math.floor(Math.random() * config.TEMPLATES.length)
        ];
        const emoji = config.EMOJIS[
            Math.floor(Math.random() * config.EMOJIS.length)
        ];
        
        const bio = template
            .replace(/{time}/g, now.format('h:mm A'))
            .replace(/{date}/g, now.format('MMM D'))
            .replace(/{emoji}/g, emoji);
            
        console.log(`Updating bio to: ${bio}`);
        await sock.updateProfileStatus(bio);
    } catch (error) {
        console.error("Bio update error:", error);
        throw error;
    }
}

function stopBioUpdater() {
    if (bioInterval) {
        clearInterval(bioInterval);
        console.log("Stopped bio updater");
    }
}

module.exports = { startBioUpdater, stopBioUpdater };
