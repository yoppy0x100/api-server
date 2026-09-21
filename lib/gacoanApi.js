const Crypto = require("crypto-js");

class gacoanApi {
  
  #CONCURRENCY = 15;
  #config = {
    baseUrl: "https://eso-api.esb.co.id/",
    username: atob("RVNCQVBJ"),
    password: atob("MVFUOWFEV2ZGcDh0VVlVak1nWFpxUGtvZ2QyVkJiMHM="),
    baseKey: "kTNoAM5V6+PatKebAprIa7ewC+HdcjnTBRnG2Kh87UZ0oDdvfoWnjtu2qVfJt0whRsexUYnfhz7T3Ac4/YJcnQ==",
  };

  #branchCode = [];
  #result = [];
  #indexna = 0;

  async run() {
    this.generateNum();

    const total = this.#branchCode.length;
    const concurrency = Math.min(this.#CONCURRENCY, total);

    let index = 0;

    const worker = async () => {
      while (true) {
        const currentIndex = index++;

        if (currentIndex >= total) {
          return;
        }

        const dataBranch = this.#branchCode[currentIndex];

        try {
          const result = await this.processUrl(dataBranch);

          if (result !== undefined) {
            this.setResult(this.getKota(result.address), result);
          }
        } catch (error) {
          console.error(`Branch ${dataBranch}:`, error.message);
        }
      }
    };

    await Promise.all(Array.from({ length: concurrency }, worker));

    return this;
  }

  async worker() {
    while (this.#indexna < this.#branchCode.length) {
      const index = this.#indexna++;
      const dataBranch = this.#branchCode[index];
      const result = await this.processUrl(dataBranch);

      if (result != undefined) {
        // console.log(result);
        // console.log(this.getKota(result.address));
        this.setResult(this.getKota(result.address), result);
      }
    }
  }

  async processUrl(dataBranch) {
    const url = this.#config.baseUrl + "qsv1/setting/branch";

    const bearer = this.generateAuthKey("POST", url, "", this.#config.baseKey);

    const controller = new AbortController();

    // Timeout 5 detik
    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Language": "id",
          "Data-Branch": dataBranch,
          Authorization: `Bearer ${bearer}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        return undefined;
      }

      let datana = await response.json();
      if (datana.branchCode != undefined) {
        const gacoanData = {
          branchCode: datana.branchCode,
          branchName: datana.branchName,
          address: datana.address,
          isOpen: datana.isOpen,
          branchID: datana.branchID,
          isTemporaryClosed: datana.isTemporaryClosed,
          temporaryClosedInformation: datana.temporaryClosedInformation,
          closedInMinute: datana.closedInMinute,
          businessHour: datana.businessHour,
          dineInLink: `https://esborder.qs.esb.co.id/APP/${datana.branchCode}/order?mode=dinein`,
          takeAwayLink: `https://esborder.qs.esb.co.id/APP/${datana.branchCode}/order?mode=takeaway`,
        };
  
        return gacoanData;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn(`Timeout: ${dataBranch}`);
      } else {
        console.warn(`Error: ${dataBranch}`, error.message);
      }

      return undefined;
    } finally {
      clearTimeout(timeout);
    }

    return;
  }

  generateNum(total = 500) {
    for (let i = 1; i <= total; i++) {
      let numFormat = i.toString().padStart(3, "0");
      // let urlna = `https://esborder.qs.esb.co.id/APP/1${numFormat}/business-hour`;
      let urlna = `1${numFormat}`;
      this.#branchCode.push(urlna);
    }
  }

  bin2Hex(R) {
    var q;
    for (var O = 0, J = R.length, Y = ""; O < J; ++O) {
      Y += (q = R.charCodeAt(O).toString(16)).length < 2 ? "0" + q : q;
    }
    return Y;
  }

  signature(methods, url, config, time) {
    let passkey = "OGCCcuYFHWkJ6pq0141eCxv9d5AMXfMS";
    let phase = `${methods}:${url}:${Crypto.SHA256(config)
      .toString()
      .replace(/\t|\r|\n|\s/g, "")}:${time}`;
    return Crypto.HmacSHA256(phase, passkey).toString();
  }

  generateAuthKey(method, url, config, keys = null) {
    let timestamp = new Date().getTime().toString();
    let urlna = url.replace("https://", "").replace("http://", "").replace(/\/$/, "");
    let conf = config == "" ? "" : JSON.stringify(config);
    let enc = this.signature(method, urlna, conf, timestamp);
    return this.bin2Hex(keys ? `${enc}:${timestamp}:${keys}` : `${enc}:${timestamp}`);
  }

  getKotas(address) {
    if (!address || typeof address !== "string") {
      return null;
    }

    // const parse = address.split(',').map(value => value.trim()).slice(-3);
    // const kota = (parse[2] != undefined) ? parse[1] : parse[0];
    let text = address
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\d+/g, " ")
      .replace(/[.,/()[\]{}:;]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const abbreviations = {
      jkt: "jakarta",
      jktpus: "jakarta_pusat",
      jktpusat: "jakarta_pusat",
      jktbar: "jakarta_barat",
      jktbarat: "jakarta_barat",
      jktsel: "jakarta_selatan",
      jkts: "jakarta_selatan",
      jkttim: "jakarta_timur",
      jktt: "jakarta_timur",
      jktut: "jakarta_utara",
      jkttara: "jakarta_utara",
      bdg: "bandung",
      bdgbrt: "bandung_barat",
      bgr: "bogor",
      dpk: "depok",
      bks: "bekasi",
      tgr: "tangerang",
      tng: "tangerang",
      smg: "semarang",
      solo: "surakarta",
      ska: "surakarta",
      yog: "yogyakarta",
      jog: "yogyakarta",
      sby: "surabaya",
      mlg: "malang",
      kdr: "kediri",
      mdi: "madiun",
      blt: "blitar",
      psr: "pasuruan",
      mkr: "mojokerto",
      pbl: "probolinggo",
      mdn: "medan",
      plg: "palembang",
      pku: "pekanbaru",
      pdg: "padang",
      jbi: "jambi",
      bkl: "bengkulu",
      bdl: "bandar_lampung",
      ptk: "pontianak",
      bjm: "banjarmasin",
      smd: "samarinda",
      bpn: "balikpapan",
      plk: "palangka_raya",
      dps: "denpasar",
      mtr: "mataram",
      mks: "makassar",
      mdo: "manado",
      kdi: "kendari",
      plw: "palu",
      amb: "ambon",
      jpr: "jayapura",
    };

    const words = text.split(/\s+/);

    for (const word of words) {
      if (abbreviations[word]) {
        return abbreviations[word];
      }
    }

    const cities = [
      "jakarta pusat",
      "jakarta barat",
      "jakarta selatan",
      "jakarta timur",
      "jakarta utara",
      "jakarta",
      "bandung barat",
      "bandung",
      "bogor",
      "bekasi",
      "depok",
      "sukabumi",
      "cirebon",
      "tasikmalaya",
      "banjar",
      "karawang",
      "subang",
      "purwakarta",
      "indramayu",
      "majalengka",
      "kuningan",
      "sumedang",
      "garut",
      "ciamism",
      "tangerang selatan",
      "tangerang",
      "serang",
      "lebak",
      "pandeglang",
      "semarang",
      "surakarta",
      "solo",
      "salatiga",
      "magelang",
      "pekalongan",
      "tegal",
      "banjarnegara",
      "banyumas",
      "batang",
      "blora",
      "boyolali",
      "brebes",
      "cilacap",
      "demak",
      "grobogan",
      "jepara",
      "karanganyar",
      "kebumen",
      "kendal",
      "klaten",
      "kudus",
      "pati",
      "pemalang",
      "purbalingga",
      "purworejo",
      "rembang",
      "semarang",
      "sragen",
      "sukoharjo",
      "temanggung",
      "wonogiri",
      "wonosobo",
      "yogyakarta",
      "sleman",
      "bantul",
      "kulon progo",
      "gunungkidul",
      "surabaya",
      "sidoarjo",
      "malang",
      "batu",
      "kediri",
      "madiun",
      "blitar",
      "mojokerto",
      "pasuruan",
      "probolinggo",
      "jember",
      "banyuwangi",
      "lamongan",
      "gresik",
      "tuban",
      "bojonegoro",
      "nganjuk",
      "ponorogo",
      "pacitan",
      "magetan",
      "trenggalek",
      "tulungagung",
      "bangkalan",
      "sampang",
      "pamekasan",
      "sumenep",
      "medan",
      "binjai",
      "pematangsiantar",
      "tebing tinggi",
      "tanjung balai",
      "sibolga",
      "gunungsitoli",
      "palembang",
      "prabumulih",
      "pagar alam",
      "lubuklinggau",
      "pekanbaru",
      "dumai",
      "padang",
      "bukittinggi",
      "padang panjang",
      "pariaman",
      "payakumbuh",
      "sawahlunto",
      "solok",
      "jambi",
      "sungai penuh",
      "bengkulu",
      "bandar lampung",
      "metro",
      "pontianak",
      "singkawang",
      "banjarmasin",
      "banjarbaru",
      "samarinda",
      "balikpapan",
      "bontang",
      "palangka raya",
      "tarakan",
      "denpasar",
      "mataram",
      "bima",
      "kupang",
      "makassar",
      "parepare",
      "palopo",
      "manado",
      "bitung",
      "tomohon",
      "kotamobagu",
      "palu",
      "kendari",
      "baubau",
      "ambon",
      "ternate",
      "tidore",
      "jayapura",
      "sorong",
      "merauke",
    ];
    cities.sort((a, b) => b.length - a.length);

    for (const city of cities) {
      const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");

      const regex = new RegExp(`\\b${escapedCity}\\b`, "i");

      if (regex.test(text)) {
        return city.toLowerCase().trim().replace(/\s+/g, "_");
      }
    }

    const match = text.match(/\b(?:kota|kabupaten)\s+([a-z]+(?:\s+[a-z]+){0,3})/i);

    if (match) {
      let result = match[1].trim().split(/\s+/).slice(0, 4).join(" ");

      // Jangan sampai mengambil provinsi/negara
      result = result.replace(/\b(jawa|sumatera|kalimantan|sulawesi|papua|maluku|bali|ntb|ntt|indonesia)\b.*$/i, "").trim();

      if (result) {
        return result.toLowerCase().trim().replace(/\s+/g, "_");
      }
    }

    return null;
  }

  getKota(address) {
    if (!address || typeof address !== "string") {
      return "other";
    }

    // =========================================================
    // 1. NORMALISASI
    // =========================================================

    let text = address
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (!text) {
      return "other";
    }

    // =========================================================
    // 2. SINGKATAN KOTA
    // =========================================================

    const abbreviations = {
      "jkt selatan": "jakarta selatan",
      "jkt utara": "jakarta utara",
      "jkt barat": "jakarta barat",
      "jkt timur": "jakarta timur",
      "jkt pusat": "jakarta pusat",

      jkt: "jakarta",
      bks: "bekasi",
      sby: "surabaya",
      bdg: "bandung",
      bgr: "bogor",
      tng: "tangerang",
      tgr: "tangerang",
      dpk: "depok",
      smg: "semarang",
      mlg: "malang",
      ska: "surakarta",
      solo: "surakarta",
      mdn: "medan",
      mks: "makassar",
      dps: "denpasar",
      plg: "palembang",
      smr: "samarinda",
      bjm: "banjarmasin",
      bpp: "balikpapan",
    };

    // =========================================================
    // 3. REPLACE SINGKATAN
    // =========================================================

    for (const [short, full] of Object.entries(abbreviations).sort((a, b) => b[0].length - a[0].length)) {
      const regex = new RegExp(`\\b${short.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");

      text = text.replace(regex, full);
    }

    // =========================================================
    // 4. NORMALISASI ADMINISTRATIVE TERM
    // =========================================================

    text = text
      // Kab. Nganjuk -> Kabupaten Nganjuk
      .replace(/\bkab\.\s*/gi, "kabupaten ")

      // Kab Nganjuk -> Kabupaten Nganjuk
      .replace(/\bkab\s+(?=[a-z])/gi, "kabupaten ")

      // Kec. Nganjuk -> Kec Nganjuk
      .replace(/\bkec\.\s*/gi, "kec ")

      // Kel. xxx -> Kel xxx
      .replace(/\bkel\.\s*/gi, "kel ")

      // Rt / Rw
      .replace(/\brt\.\s*/gi, "rt ")
      .replace(/\brw\.\s*/gi, "rw ")

      .replace(/\s+/g, " ")
      .trim();

    // =========================================================
    // 5. HELPER CLEAN OUTPUT
    // =========================================================

    const clean = (value) => {
      if (!value) {
        return "other";
      }

      let result = value.toLowerCase().trim();

      // Hapus administrative prefix
      result = result.replace(/^(kota|kabupaten|kab)\s+/i, "").trim();

      // Hapus administrative suffix
      result = result.replace(/\s+(city|regency)$/i, "").trim();

      // Jangan sampai "kab" tertinggal
      result = result
        .replace(/\bkab\b/gi, "")
        .replace(/\bkabupaten\b/gi, "")
        .replace(/\bkota\b/gi, "")
        .replace(/\bregency\b/gi, "")
        .replace(/\bcity\b/gi, "")
        .trim();

      // Bersihkan punctuation
      result = result.replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();

      if (!result) {
        return "other";
      }

      return result.replace(/\s+/g, "_");
    };

    // =========================================================
    // 6. PRIORITAS PALING TINGGI
    //
    // KABUPATEN X
    // KAB X
    //
    // Contoh:
    // Kec. Nganjuk Kab. Nganjuk, Jawa Timur
    //
    // => nganjuK
    // =========================================================

    const kabupatenMatch = text.match(/\b(?:kabupaten|kab)\s+([^,]+?)(?=\s*(?:,|$))/i);

    if (kabupatenMatch) {
      const result = clean(kabupatenMatch[1]);

      if (result !== "other") {
        return result;
      }
    }

    // =========================================================
    // 7. CITY / KOTA
    //
    // Kota Semarang
    // Kota Bekasi
    // Banjar City
    // Serang City
    // =========================================================

    const cityMatch = text.match(/\b(?:kota)\s+([^,]+?)(?=\s*(?:,|$))/i);

    if (cityMatch) {
      const result = clean(cityMatch[1]);

      if (result !== "other") {
        return result;
      }
    }

    // English:
    // Banjar City
    // Serang City
    // Tomohon City
    // Jayapura City

    const englishCityMatch = text.match(/\b([^,]+?)\s+city\b/i);

    if (englishCityMatch) {
      const result = clean(englishCityMatch[1]);

      if (result !== "other") {
        return result;
      }
    }

    // =========================================================
    // 8. ENGLISH REGENCY
    //
    // Bulukumba Regency
    // Wajo Regency
    // Tanah Bumbu Regency
    // =========================================================

    const englishRegencyMatch = text.match(/\b([^,]+?)\s+regency\b/i);

    if (englishRegencyMatch) {
      const result = clean(englishRegencyMatch[1]);

      if (result !== "other") {
        return result;
      }
    }

    // =========================================================
    // 9. SPECIAL ENGLISH DIRECTION + REGENCY
    //
    // West Kotawaringin Regency
    // =========================================================

    const directionRegencyMatch = text.match(/\b((?:west|east|north|south|central)\s+[^,]+?)\s+regency\b/i);

    if (directionRegencyMatch) {
      let value = directionRegencyMatch[1].trim();

      const directionMap = {
        west: "barat",
        east: "timur",
        north: "utara",
        south: "selatan",
        central: "tengah",
      };

      const parts = value.split(/\s+/);

      if (directionMap[parts[0]]) {
        const direction = directionMap[parts.shift()];
        value = `${parts.join(" ")} ${direction}`;
      }

      return clean(value);
    }

    // =========================================================
    // 10. KABUPATEN / KOTA BERDASARKAN POSISI SETELAH KECAMATAN
    //
    // Kec. Sananwetan, Blitar, Jawa Timur
    //                      ^^^^^^
    //
    // Kec. Poso Kota Sel., Kabupaten Poso
    //                      ^^^^^^^^^^^^^^
    // sudah ditangani oleh step Kabupaten di atas.
    // =========================================================

    const kecamatanMatch = text.match(/\bkec\s+[^,]+,\s*([^,]+?)(?=\s*,\s*(?:jawa|kalimantan|sumatera|sulawesi|bali|maluku|papua|indonesia)\b|$)/i);

    if (kecamatanMatch) {
      let candidate = kecamatanMatch[1].trim();

      // Jangan mengambil administrative term
      candidate = candidate.replace(/\b(kabupaten|kab|kota|city|regency)\b/gi, "").trim();

      if (candidate) {
        return clean(candidate);
      }
    }

    // =========================================================
    // 11. KNOWN CITY / REGENCY
    //
    // Dipakai untuk kasus seperti:
    //
    // ... Telukjambe Timur, Karawang, Jawa Barat
    //
    // ... Pontianak Utara, Pontianak, West Kalimantan
    // =========================================================

    const knownPlaces = [
      "jakarta selatan",
      "jakarta utara",
      "jakarta barat",
      "jakarta timur",
      "jakarta pusat",
      "jakarta",

      "bekasi",
      "surabaya",
      "bandung",
      "bogor",
      "tangerang",
      "depok",
      "semarang",
      "yogyakarta",
      "malang",
      "surakarta",
      "medan",
      "makassar",
      "denpasar",
      "palembang",
      "samarinda",
      "banjarmasin",
      "balikpapan",

      "karawang",
      "blitar",
      "poso",
      "banjar",
      "serang",
      "bulukumba",
      "nganjuk",
      "situbondo",
      "kendari",
      "singkawang",
      "wajo",
      "cianjur",
      "tanah bumbu",
      "minahasa",
      "berau",
      "tabalong",
      "kapuas",
      "pontianak",
      "jember",
      "tomohon",
      "jayapura",
      "bone",
    ];

    // Cari dari nama terpanjang
    knownPlaces.sort((a, b) => b.length - a.length);

    for (const place of knownPlaces) {
      const regex = new RegExp(`\\b${place.replace(/\s+/g, "\\s+")}\\b`, "i");

      if (regex.test(text)) {
        return clean(place);
      }
    }

    return "other";
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  setResult(keyna, data) {
    if (!data || typeof data !== "object") {
      return;
    }

    if (!this.#result[keyna]) {
      this.#result[keyna] = [];
    }

    this.#result[keyna].push(data);
  }

  getResult(keyna) {
    if (keyna !== undefined) {
      return this.#result[keyna];
    }

    return this.#result;
  }

  getJson() {
    const objectna = Object.assign({}, this.#result);
    return JSON.stringify(objectna);
  }
}

module.exports = gacoanApi
