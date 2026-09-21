const express = require("express");
const cors = require('cors')
const htmlparser2= require("htmlparser2")
const gacoanApi = require("../lib/gacoanApi.js");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

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
async function getMusic(music) {
    const resp = await fetch(music, {
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'id,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
            'cache-control': 'max-age=0',
            'dnt': '1',
            'priority': 'u=0, i',
            'referer': music,
            'sec-ch-ua': '"Not=A?Brand";v="99", "Microsoft Edge";v="151", "Chromium";v="151"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"iOS"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
        },
        "body": null,
        "method": "GET",
    });

    const datana = await resp.text();
    const domna = new htmlparser2.parseDocument(datana.trim());
    console.log(htmlparser2.DomUtils.getElementsByTagName('video', domna));
}
async function getVideo(urlna) {
    const resp = await fetch(urlna, {
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'id,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
            'cache-control': 'max-age=0',
            'dnt': '1',
            'priority': 'u=0, i',
            'referer': urlna,
            'sec-ch-ua': '"Not=A?Brand";v="99", "Microsoft Edge";v="151", "Chromium";v="151"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"iOS"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
            // 'cookie': '_waftokenid=eyJ2Ijp7ImEiOiJMR29WRzZYY0FTTlE2WkhMLzVCMlAyNmVlZFVFclFWY3dpalRqZytKYndJPSIsImIiOjE3ODY2NjEyMDUsImMiOiJtN1FpS0hDL3ZmZVM3TlcrbFRENEJ2WDJxS1lXQm1QWmNCeXlmOGZJeVBNPSJ9LCJzIjoiblU3a3RXSHFmcmQyTHBRZld3cE42a0JPLzR0WTVPK0h2YmM2SnlMN2JPST0ifQ; tt_csrf_token=5Kv0QTS5-ncSQdXI7_Qaq1MDajXBb2S4KNUA; tt_chain_token=XfsuAQO8nLfLdGBS41pe3A==; x-web-secsdk-uid=6d7228d2-1709-4062-9907-65c2b117e0ea; delay_guest_mode_vid=5; s_v_web_id=verify_mspsrcfv_ZLcOvQAn_RzYA_4Yff_B6Ap_eBmDMg2WoYke; perf_feed_cache={%22expireTimestamp%22:1787245200000%2C%22itemIds%22:[%227660052183852846357%22%2C%227653011982068616455%22%2C%227656661290588310802%22]}; tiktok_webapp_theme_source=auto; tiktok_webapp_theme=dark; guest_mode_flag=1; ttwid=1%7CX-suC9vfnICt9KD-XoOPZEBMyFD8c_LBh2AwqYf0SZY%7C1786661210%7Caaa3135d7c0b1e252f7e919bfc5b553d129aa155d5ec3e26598ff487d203dfd5; odin_tt=c312ba460ce294e769c820cd1ac890f71896e86087aa8f512243ceab91c8d599; msToken=EY2sJBH_qEN4ep5qz9UrUm-6nygdX4Dig23GojV-AgszWNJafQIIsqlfkdghc7SpUvDhyvcEdrTUMed23froc0nJ09c9wjn6sucTrDQb9GQWQZSmzw632pJvodB_TP4Rg0YJxQ4uxPVReK6HTbr-fCMzGjq1D6b4q6Jyuqcp; msToken=EY2sJBH_qEN4ep5qz9UrUm-6nygdX4Dig23GojV-AgszWNJafQIIsqlfkdghc7SpUvDhyvcEdrTUMed23froc0nJ09c9wjn6sucTrDQb9GQWQZSmzw632pJvodB_TP4Rg0YJxQ4uxPVReK6HTbr-fCMzGjq1D6b4q6Jyuqcp'
        },
        "body": null,
        "method": "GET",
    });

    const datana = await resp.text();
    
    const regex = /<script id="api-data" type="application\/json">([\s\S]*?)<\/script>/im;
    const match = datana.match(regex);
    return JSON.parse(match[1].trim());

    if (!match || !match[1]) {
        throw new Error('Tag script dengan ID __UNIVERSAL_DATA_FOR_REHYDRATION__ tidak ditemukan.');
    }

    return JSON.parse(match[1].trim());
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
        
        return res.json(dataUsername);
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
        return res.json(resVideo);
    }
});

app.get("/api/gacoanfinder", async (req, res) => {
    const gac = new gacoanApi()
    const resp = await gac.run();
    const data = gac.getJson();
    return res.json(data);
});

module.exports = app
