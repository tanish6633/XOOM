const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// MOCK GEMINI 3 FLASH API
// In a real scenario, this would import @google/generative-ai
const RESPONSES = {
    // ENGLISH (Default)
    'en-IN': {
        'default': "I am listening. Ask me about crops, market prices, weather, or government schemes.",
        'wheat': "For wheat (Rabi season), sow HD-2967 or DBW-187 in Nov. Use 100kg DAP and 50kg Urea per acre. Irrigate at CRI stage (21 days).",
        'rice': "Rice requires standing water. Use Basmati 1121 for high value. Beware of Stem Borer - use Cartap Hydrochloride 4G.",
        'tomato': "Tomatoes need staking. Use 19:19:19 NPK for growth. If leaves curl, it might be Whitefly - spray Imidacloprid.",
        'weather': "Sky is clear. Temperature is 24°C with 60% humidity. No rain expected for 3 days. Good for spraying.",
        'price': "Market analysis: Wheat is trading at ₹2250/Qtl (Up 2%), Onion is ₹1800/Qtl, and Cotton is stable at ₹6000/Qtl.",
        'scheme': "PM Kisan offers ₹6000/year. You can also apply for the 'Agri-Infrastructure Fund' for warehouse loans at 3% subsidy."
    },
    // HINDI
    'hi-IN': {
        'default': "Main sun raha hoon. Fasal, mandi bhav, mausam ya yojanao ke baare mein puchein.",
        'wheat': "Gehu (Rabi) ke liye HD-2967 beej chunein. Prati acre 50kg Urea aur 1 bori DAP dalein. 21 din baad pehli sinchai karein.",
        'rice': "Dhaan ke liye paani khet mein khada rakhein. Basmati 1121 lagayein. Tana chedak ke liye Cartap 4G ka prayog karein.",
        'tomato': "Tamatar ko sahara dein. 19:19:19 khaad ka upyog karein. Patta modak rog ke liye Imidacloprid chidkein.",
        'weather': "Mausam saaf hai. Tapman 24°C hai. Agle 3 din barish ki sambhavna nahi hai. Dawai chidakne ke liye sahi samay hai.",
        'price': "Mandi Bhav: Gehu ₹2250/Quintal par hai, Pyaaz ₹1800/Quintal, aur Kapas ₹6000/Quintal par sthir hai.",
        'scheme': "PM Kisan mein ₹6000 salana milte hain. Aap godam ke liye 'Agri-Infra Fund' se 3% subsidy par loan le sakte hain."
    },
    // PUNJABI
    'pa-IN': {
        'default': "Main tuhadi gal sun raha haan. Faslan, mandi de bhav, mausam ya scheme baare pucho.",
        'wheat': "Kanak layi HD-2967 beej verto. Ikk acre vich 50kg Urea te DAP pao. Pehla paani 21 dina baad lagao.",
        'rice': "Jhone layi khet vich paani khada rakho. Basmati 1121 wadiya hai. Tana chedak layi Cartap 4G verto.",
        'tomato': "Tamatar nu sahara devo. 19:19:19 khaad verto. Patta marod rog layi Imidacloprid da chidkav karo.",
        'weather': "Mausam saaf hai. Tapman 24°C hai. Agle 3 din meeh di koi sambhavna nahi.",
        'price': "Mandi Bhav: Kanak ₹2250, Pyaaz ₹1800, te Narma ₹6000/Quintal te chal reha hai.",
        'scheme': "PM Kisan yojna hethan ₹6000 milde ne. Tuc Agri-Infra Fund toh loan le sakde ho."
    },
    // MARATHI
    'mr-IN': {
        'default': "Mi aiktoy. Pik, bajarbhav, havaman kivva yojana badal vichara.",
        'wheat': "Gahvasathi HD-2967 biyane vapra. Prati acre 50kg Urea ani DAP takavi. Pahile pani 21 divsanantara dya.",
        'rice': "Bhatasathi shetat pani sathvun theva. Basmati 1121 lavve. Khodkidyasathi Cartap 4G vapra.",
        'tomato': "Tomato zhadanna aadhar dya. 19:19:19 khatacha vapar kara. Panvallya rogasathi Imidacloprid favara.",
        'weather': "Havaman swach ahe. Tapman 24°C ahe. Pudhil 3 divas pavsachi shakyata nahi.",
        'price': "Bajarbhav: Gahu ₹2250, Kanda ₹1800, ani Kapus ₹6000 prati quintal ahe.",
        'scheme': "PM Kisan yojne antargat ₹6000 miltat. Agri-Infra Fund madhun tumhi karj gheu shakta."
    },
    // GUJARATI
    'gu-IN': {
        'default': "Hu sambhlu chu. Pak, bajar bhav, havaman athva yojnao vishe pucho.",
        'wheat': "Ghau mate HD-2967 biyaran vapro. Prati acre 50kg Urea ane DAP nakho. Pehlu pani 21 divse aapo.",
        'rice': "Dangar mate khetar ma pani bhari rakho. Basmati 1121 lavo. Jivat mate Cartap 4G vapro.",
        'tomato': "Tameta mate 19:19:19 khatar vapro. Pan valva rog mate Imidacloprid chanto.",
        'weather': "Havaman saaf che. Tapman 24°C che. Agami 3 divas varsad ni sambhavna nathi.",
        'price': "Bajar Bhav: Ghau ₹2250, Dungli ₹1800, ane Kapas ₹6000 prati man (20kg) nathi, quintal che.",
        'scheme': "PM Kisan yojna ma ₹6000 male che. Agri-Infra Fund mathi loan lai shako cho."
    },
    // TAMIL
    'ta-IN': {
        'default': "Naan ketkukiren. Payir, sandhai vilai, vaanilai allathu thittangal patri ketkalam.",
        'wheat': "Godhumai payirida HD-2967 vidhaiyai payanpaduthavum. Ekarukku 50kg Urea matrum DAP idavum.",
        'rice': "Nel payirukku Basmati 1121 sirandhadhu. Poochi thaakkudhalukku Cartap 4G payanpaduthavum.",
        'tomato': "Thakkali chedikku 19:19:19 uram idavum. Ilai surul noiku Imidacloprid thelikkavum.",
        'weather': "Vaanilai thelivaaga ulladhu. Veppanilai 24°C. Adutha 3 naatkalukku mazhai illai.",
        'price': "Sandhai nilavaram: Godhumai ₹2250, Vengayam ₹1800, Paruthi ₹6000.",
        'scheme': "PM Kisan thittathin keezh ₹6000 kidaikkum. Agri-Infra Fund moolam kadan peralam."
    },
    // TELUGU
    'te-IN': {
        'default': "Nenu vintunnanu. Panta, market dhara, vathavaranam leda pathakala gurinchi adagandi.",
        'wheat': "Godhuma kosam HD-2967 vittanani vadandi. Acre ki 50kg Urea mariyu DAP veyandi.",
        'rice': "Vari pantaku Basmati 1121 manchidi. Kanda purugu nivaranaku Cartap 4G vadandi.",
        'tomato': "Tomato pantaku 19:19:19 eruvu vadandi. Aaku mudatha teguluku Imidacloprid spray cheyandi.",
        'weather': "Vathavaranam bagundi. Ushnogratha 24°C. Rendu moodu rojulu varsham ledu.",
        'price': "Market Dharalu: Godhuma ₹2250, Ullipaya ₹1800, Patthi ₹6000 quintal ki.",
        'scheme': "PM Kisan kinda ₹6000 vastayi. Agri-Infra Fund dwara loan tiskovachu."
    },
    // KANNADA
    'kn-IN': {
        'default': "Naanu keluttiddene. Bele, marukatte bele, havamana athava yojanegala bagge keli.",
        'wheat': "Godhi beleyalu HD-2967 beejavannu balasi. Ekarege 50kg Urea mattu DAP haki.",
        'rice': "Bhatta beleyalu Basmati 1121 uttama. Kandada hula niyantrisalu Cartap 4G balasi.",
        'tomato': "Tomato gidaakke 19:19:19 gobbra haki. Ele suruli rogakke Imidacloprid spray madi.",
        'weather': "Havamana swacchavagide. Ushnamsha 24°C ide. Mundina 3 dina male illa.",
        'price': "Marukatte bele: Godhi ₹2250, Eerulli ₹1800, Hatti ₹6000 prati quintal ge.",
        'scheme': "PM Kisan yojaneyalli ₹6000 siguttade. Agri-Infra Fund ninda sala padeyabahudu."
    },
    // MALAYALAM
    'ml-IN': {
        'default': "Njan Kelkkunnu. Krishi, vipani vila, kalavastha, athva paddhathikale kurichu chodikkoo.",
        'wheat': "Gothambu krishi cheyyan HD-2967 vithu upayokikku. 50kg Urea, DAP enniva iduka.",
        'rice': "Nellu krishikku Basmati 1121 aanu nallathu. Vandu shalyathinu Cartap 4G upayokikku.",
        'tomato': "Thakkaali krishikku 19:19:19 vallam nalkuka. Ila churulalinu Imidacloprid spray cheyyuka.",
        'weather': "Kalavastha thelinjirikkunnu. 24°C aanu choodu. Adutha 3 divasam mazhaundakilla.",
        'price': "Vipani Vila: Gothambu ₹2250, Ulli ₹1800, Paruthi ₹6000.",
        'scheme': "PM Kisan vazhi ₹6000 labhikkum. Agri-Infra Fund vazhi vaaypa edukkaam."
    },
    // BENGALI
    'bn-IN': {
        'default': "Ami shunchi. Fashol, bazar dor, abohaoya ba prokolpo niye jigges korun.",
        'wheat': "Gom-er jonno HD-2967 beech bebohar korun. Proti acre 50kg Urea o DAP din.",
        'rice': "Dhaan chashe Basmati 1121 bhalo. Kandopoka-r jonno Cartap 4G spray korun.",
        'tomato': "Tomato gache 19:19:19 shaar din. Pata kokrano roger jonno Imidacloprid din.",
        'weather': "Akash porishkar. Tapmatra 24°C. Agami 3 din brishtir sombhabona nei.",
        'price': "Bazar Dor: Gom ₹2250, Peyaj ₹1800, Tulo ₹6000 prothi quintal.",
        'scheme': "PM Kisan-e ₹6000 paben. Agri-Infra Fund theke loan nite paren."
    }
};

router.post('/ask', auth, (req, res) => {
    let { query, language } = req.body;

    // Default to Hindi if no language specified or not supported
    if (!RESPONSES[language]) language = 'en-IN';

    // Simulate High-Speed AI Processing (Faster Response for Real-time feel)
    setTimeout(() => {
        const langDB = RESPONSES[language];
        let answer = "";

        const q = query.toLowerCase();

        // 1. Check Pre-defined Agri Knowledge first (High Precision)
        if (q.includes('wheat') || q.includes('gehu') || q.includes('godhuma') || q.includes('kanak') || q.includes('gom') || q.includes('godhi')) answer = langDB.wheat;
        else if (q.includes('rice') || q.includes('dhaan') || q.includes('chawal') || q.includes('jhone') || q.includes('nel') || q.includes('vari')) answer = langDB.rice;
        else if (q.includes('tomato') || q.includes('tamatar') || q.includes('thakkali')) answer = langDB.tomato;
        else if (q.includes('weather') || q.includes('mausam') || q.includes('havaman') || q.includes('vaanilai') || q.includes('kalavastha')) answer = langDB.weather;
        else if (q.includes('price') || q.includes('bhav') || q.includes('rate') || q.includes('vilai') || q.includes('dhara')) answer = langDB.price;
        else if (q.includes('scheme') || q.includes('yojna') || q.includes('thittam') || q.includes('pathakam') || q.includes('loan')) answer = langDB.scheme;

        // 2. General Conversation Fallback (The "Real LLM" Simulation)
        if (!answer) {
            // Basic Small Talk & General Queries to make it feel "Open Domain"
            if (q.includes('hello') || q.includes('hi ') || q.includes('namaste')) {
                const greetings = { 'en-IN': "Hello! I am ready to help.", 'hi-IN': "Namaste! Main taiyaar hoon.", 'pa-IN': "Sat Sri Akal! Main taiyaar haan." };
                answer = greetings[language] || langDB.default;
            }
            else if (q.includes('who are you') || q.includes('your name')) {
                const identity = { 'en-IN': "I am Kisan Friend, your advanced AI farm assistant.", 'hi-IN': "Main Kisan Friend hoon, aapka AI saathi." };
                answer = identity[language] || "I am Kisan Friend AI.";
            }
            else if (q.includes('time')) {
                answer = new Date().toLocaleTimeString();
            }
            else {
                // The "I can answer anything" simulation - Generic helpful responses
                const generic = {
                    'en-IN': "That is an interesting question. While I specialize in agriculture, I can tell you that successful farming requires patience and observation. What specific information do you need?",
                    'hi-IN': "Yeh ek accha sawal hai. Main kheti mein visheshagya hoon, par main yeh keh sakta hoon ki safalta ke liye dhairya zaroori hai. Batayein main kaise madat karoon?",
                    'pa-IN': "Eh vadiya sawal hai. Kheti-baadi ton ilava, main tuhanu hor vi jaankari de sakda haan. Tusi ki puchna chahunde ho?"
                };
                answer = generic[language] || langDB.default;
            }
        }

        res.json({
            success: true,
            answer: answer,
            language_detected: language
        });

    }, 600); // Reduced latency to 600ms for "Real Time" feel
});

module.exports = router;
