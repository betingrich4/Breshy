const Mega = require('megajs').default;
const fs = require('fs');

async function upload(fileStream, filename) {
    return new Promise((resolve, reject) => {
        const mega = new Mega({
            email: process.env.MEGA_EMAIL || 'your@email.com',
            password: process.env.MEGA_PASSWORD || 'yourpassword',
            keepalive: false
        });

        mega.ready.then(() => {
            mega.upload({
                name: filename,
                attributes: { 
                    type: 'file',
                    timestamp: Date.now() 
                }
            }, fileStream).then(file => {
                const url = `https://mega.nz/file/${file.downloadId}#${file.key}`;
                resolve(url);
            }).catch(reject);
        }).catch(reject);
    });
}

module.exports = { upload };
