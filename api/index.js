const express = require("express");
const cors = require('cors')
const path = require('path');
const gacoanApi = require("../lib/gacoanApi.js");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

async function getUsername(username) {
    const resp = await fetch("https://www.tiktok.com/@" + username, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
        },
        "body": null,
        "method": "GET",
    });

    const datana = await resp.text();
    const regex = /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/im;
    const match = datana.match(regex);
    
    if (!match || !match[1]) {
        throw new Error('Tag script dengan ID __UNIVERSAL_DATA_FOR_REHYDRATION__ tidak ditemukan.');
    }
    
    const parse = JSON.parse(match[1].trim())
    
    return parse["__DEFAULT_SCOPE__"]["webapp.user-detail"]["userInfo"];
}

app.use(cors())

app.get("/api/tokkit", async (req, res) => {
    const { username, music, video } = req.query;

    // Tidak ada parameter
    if (
        username === undefined &&
        music === undefined &&
        video === undefined
    ) {
        return res.json({
            message: "pukimay"
        });
    }

    // Parameter username
    if (username !== undefined) {
        const dataUsername = await getUsername(username)
        
        return res.status(200).send(dataUsername);
    }

    // Parameter music
    if (music !== undefined) {
        const musicna = await getMusic(music)
        return res.json({
            type: "music",
            music: musicna
        });
    }

    // Parameter video
    if (video !== undefined) {
        const resVideo = await getVideo(video)
        return res.status(200).send(resVideo);
    }
});

app.get("/api/gacoanfinder", async (req, res) => {
    const gac = new gacoanApi()
    const resp = await gac.run();
    const data = gac.getJson();
    return res.status(200).send(data);
});

module.exports = app
