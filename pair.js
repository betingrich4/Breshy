const { makeid } = require('./lib/gen-id');
const fs = require('fs');
const pino = require("pino");
const { 
    makeWASocket, 
    useMultiFileAuthState, 
    delay,
    Browsers
} = require('@whiskeysockets/baileys');
const { upload } = require('./lib/mega');
const { startStatusWatcher } = require('./bot/statusWatcher');
const { startBioUpdater } = require('./bot/bioUpdater');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

async function handlePairing(req, res) {
    const id = makeid();
    let num = req.query.number;
    
    if (!num || num.replace(/[^0-9]/g, '').length < 10) {
        return res.status(400).json({ code: "Invalid number" });
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
        
        const sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
            },
            printQRInTerminal: false,
            browser: Browsers.macOS("Safari"),
            logger: pino({ level: "error" })
        });

        if (!sock.authState.creds.registered) {
            num = num.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(num);
            res.json({ code });
        }

        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on("connection.update", async (update) => {
            if (update.connection === "open") {
                console.log("Connected to WhatsApp");
                
                // Start auto features
                startStatusWatcher(sock);
                startBioUpdater(sock);
                
                // Save session
                try {
                    const credsPath = `./temp/${id}/creds.json`;
                    const megaUrl = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                    const sessionId = `StatusBot~${megaUrl.replace('https://mega.nz/file/', '')}`;
                    
                    await sock.sendMessage(sock.user.id, {
                        text: `✅ *WhatsApp Connected!*\n\n` +
                              `Auto Features Enabled:\n` +
                              `👀 Auto-Status View\n` +
                              `❤️ Auto-Status React\n` +
                              `📝 Auto-Bio (updates every minute)\n\n` +
                              `Your Session ID:\n\`${sessionId}\`\n\n` +
                              `Visit: ${req.headers.host}/success`
                    });
                } catch (e) {
                    console.error("Error sending success message:", e);
                } finally {
                    sock.ws.close();
                    removeFile(`./temp/${id}`);
                }
            }
        });

        sock.ev.on("connection.update", (update) => {
            if (update.connection === "close") {
                console.log("Connection closed");
                removeFile(`./temp/${id}`);
            }
        });
    } catch (err) {
        console.error("Pairing error:", err);
        removeFile(`./temp/${id}`);
        res.status(500).json({ code: "Error: " + err.message });
    }
}

function makeCacheableSignalKeyStore(keys, logger) {
    return {
        async get(type, ids) {
            const data = {};
            await Promise.all(
                ids.map(async (id) => {
                    let value = keys.get(type, id);
                    if (value) {
                        if (typeof value === 'object') {
                            value = JSON.stringify(value);
                        }
                        data[id] = value;
                    }
                })
            );
            return data;
        },
        async set(data) {
            for (const type in data) {
                for (const id in data[type]) {
                    keys.set(type, id, data[type][id]);
                }
            }
        }
    };
}

module.exports = handlePairing;
