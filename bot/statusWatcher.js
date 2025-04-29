const moment = require('moment-timezone');
const config = {
    REACT_EMOJIS: ['❤️', '🔥', '👍', '😍', '🎉', '👏', '💯', '😎', '🤩', '✨'],
    VIEW_INTERVAL: 30000, // 30 seconds
    TIME_ZONE: 'Africa/Nairobi'
};

let statusInterval;

function startStatusWatcher(sock) {
    console.log("Starting status watcher...");
    
    statusInterval = setInterval(() => {
        checkStatuses(sock).catch(err => {
            console.error("Status check error:", err);
        });
    }, config.VIEW_INTERVAL);
    
    // Initial check
    checkStatuses(sock).catch(console.error);
}

async function checkStatuses(sock) {
    try {
        const now = moment().tz(config.TIME_ZONE).format('YYYY-MM-DD HH:mm:ss');
        console.log(`[${now}] Checking statuses...`);
        
        const statuses = await sock.fetchStatus(sock.user.id);
        if (!statuses || statuses.length === 0) {
            console.log("No statuses found");
            return;
        }
        
        console.log(`Found ${statuses.length} statuses`);
        
        for (const status of statuses.slice(0, 20)) { // Limit to 20 statuses
            try {
                // Mark as viewed
                await sock.readMessages([status.key]);
                
                // React to status
                const randomEmoji = config.REACT_EMOJIS[
                    Math.floor(Math.random() * config.REACT_EMOJIS.length)
                ];
                
                console.log(`Reacting to status with ${randomEmoji}`);
                await sock.sendMessage(status.key.remoteJid, {
                    react: { text: randomEmoji, key: status.key }
                });
                
                await delay(1000); // 1 second between statuses
            } catch (statusError) {
                console.error("Error processing status:", statusError);
            }
        }
    } catch (error) {
        console.error("Status check error:", error);
        throw error;
    }
}

function stopStatusWatcher() {
    if (statusInterval) {
        clearInterval(statusInterval);
        console.log("Stopped status watcher");
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { startStatusWatcher, stopStatusWatcher };
