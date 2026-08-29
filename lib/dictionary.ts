/**
 * Every user-facing string in the shop, in the three languages her customers read.
 *
 * Product names and descriptions are NOT here — those come from the Shopify
 * catalogue in English and cannot be machine-translated responsibly.
 *
 * `{placeholder}` tokens are filled by the `t()` helper in lib/i18n.ts.
 */

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANG: Lang = "en";

export const DICTIONARY = {
  // Chrome
  language: { en: "Language", hi: "भाषा", pa: "ਭਾਸ਼ਾ" },
  bag: { en: "Bag", hi: "बैग", pa: "ਬੈਗ" },
  callUs: { en: "Call Us", hi: "फ़ोन करें", pa: "ਫ਼ੋਨ ਕਰੋ" },
  whatsapp: { en: "WhatsApp", hi: "व्हाट्सएप", pa: "ਵਟਸਐਪ" },
  callOrWhatsapp: { en: "Call or WhatsApp:", hi: "कॉल या व्हाट्सएप:", pa: "ਫ਼ੋਨ ਜਾਂ ਵਟਸਐਪ:" },
  helpContact: {
    en: "For any help, contact {name}",
    hi: "किसी भी मदद के लिए {name} से बात करें",
    pa: "ਕਿਸੇ ਵੀ ਮਦਦ ਲਈ {name} ਨਾਲ ਗੱਲ ਕਰੋ",
  },

  needHelp: {
    en: "Need help ordering?",
    hi: "ऑर्डर करने में मदद चाहिए?",
    pa: "ਆਰਡਰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
  },
  needHelpSub: {
    en: "Call us or send a WhatsApp message. We will take your order.",
    hi: "हमें फ़ोन करें या व्हाट्सएप भेजें। हम आपका ऑर्डर ले लेंगे।",
    pa: "ਸਾਨੂੰ ਫ਼ੋਨ ਕਰੋ ਜਾਂ ਵਟਸਐਪ ਭੇਜੋ। ਅਸੀਂ ਤੁਹਾਡਾ ਆਰਡਰ ਲੈ ਲਵਾਂਗੇ।",
  },
  branchLabel: { en: "Branch", hi: "ब्रांच", pa: "ਬ੍ਰਾਂਚ" },
  tapToCall: { en: "Tap to call", hi: "दबाकर कॉल करें", pa: "ਦਬਾ ਕੇ ਫ਼ੋਨ ਕਰੋ" },
  chatNow: { en: "Chat with us now", hi: "अभी बात करें", pa: "ਹੁਣੇ ਗੱਲ ਕਰੋ" },

  // Home
  heroKicker: { en: "100% Ayurvedic", hi: "100% आयुर्वेदिक", pa: "100% ਆਯੁਰਵੈਦਿਕ" },
  heroTitle: {
    en: "Ayurvedic skin & hair care, delivered to your door",
    hi: "आयुर्वेदिक त्वचा और बालों की देखभाल, आपके घर तक",
    pa: "ਆਯੁਰਵੈਦਿਕ ਚਮੜੀ ਤੇ ਵਾਲਾਂ ਦੀ ਸੰਭਾਲ, ਤੁਹਾਡੇ ਘਰ ਤੱਕ",
  },
  heroSub: {
    en: "Order from home and we bring it to your door",
    hi: "घर बैठे मंगवाएं, हम आपके दरवाज़े तक पहुँचाएंगे",
    pa: "ਘਰ ਬੈਠੇ ਮੰਗਵਾਓ, ਅਸੀਂ ਤੁਹਾਡੇ ਦਰਵਾਜ਼ੇ ਤੱਕ ਪਹੁੰਚਾਵਾਂਗੇ",
  },
  seeProducts: { en: "See Products", hi: "प्रोडक्ट देखें", pa: "ਪ੍ਰੋਡਕਟ ਵੇਖੋ" },
  genuine: { en: "100% Genuine Products", hi: "100% असली प्रोडक्ट", pa: "100% ਅਸਲੀ ਪ੍ਰੋਡਕਟ" },
  howToOrder: { en: "How to Order", hi: "ऑर्डर कैसे करें", pa: "ਆਰਡਰ ਕਿਵੇਂ ਕਰਨਾ ਹੈ" },
  howToOrderSub: { en: "Just 3 easy steps", hi: "बस 3 आसान स्टेप", pa: "ਸਿਰਫ਼ 3 ਸੌਖੇ ਕਦਮ" },
  step1: { en: "Choose your product", hi: "प्रोडक्ट चुनें", pa: "ਪ੍ਰੋਡਕਟ ਚੁਣੋ" },
  step2: { en: "Give name & address", hi: "नाम और पता भरें", pa: "ਨਾਂ ਤੇ ਪਤਾ ਭਰੋ" },
  step3: { en: "Pay when it arrives", hi: "सामान मिलने पर पैसे दें", pa: "ਸਾਮਾਨ ਮਿਲਣ 'ਤੇ ਪੈਸੇ ਦਿਓ" },
  ourProducts: { en: "Our Products", hi: "हमारे प्रोडक्ट", pa: "ਸਾਡੇ ਪ੍ਰੋਡਕਟ" },
  allProducts: { en: "All Products", hi: "सभी प्रोडक्ट", pa: "ਸਾਰੇ ਪ੍ਰੋਡਕਟ" },

  // Delivery & payment
  cod: { en: "Cash on Delivery", hi: "कैश ऑन डिलीवरी", pa: "ਕੈਸ਼ ਆਨ ਡਿਲਿਵਰੀ" },
  /** Used wherever both ways to pay are on offer, so nothing promises
   *  cash-on-delivery to someone who is about to pay by UPI. */
  payOptions: {
    en: "Cash on Delivery or UPI",
    hi: "कैश ऑन डिलीवरी या UPI",
    pa: "ਕੈਸ਼ ਆਨ ਡਿਲਿਵਰੀ ਜਾਂ UPI",
  },
  payOptionsNote: {
    en: "Pay the delivery person, or pay now by UPI — your choice",
    hi: "डिलीवरी वाले को दें, या अभी UPI से दें — आपकी मर्ज़ी",
    pa: "ਡਿਲਿਵਰੀ ਵਾਲੇ ਨੂੰ ਦਿਓ, ਜਾਂ ਹੁਣੇ UPI ਨਾਲ ਦਿਓ — ਤੁਹਾਡੀ ਮਰਜ਼ੀ",
  },
  codExplain: {
    en: "Pay when you receive the parcel",
    hi: "सामान मिलने पर पैसे दें",
    pa: "ਸਾਮਾਨ ਮਿਲਣ 'ਤੇ ਪੈਸੇ ਦਿਓ",
  },
  noOnlinePayment: {
    en: "No online payment needed.",
    hi: "अभी कोई पैसा नहीं देना है।",
    pa: "ਹੁਣ ਕੋਈ ਪੈਸਾ ਨਹੀਂ ਦੇਣਾ।",
  },
  deliveryCharge: {
    en: "Delivery {charge}, free above {free}",
    hi: "डिलीवरी {charge}, {free} से ऊपर फ्री",
    pa: "ਡਿਲਿਵਰੀ {charge}, {free} ਤੋਂ ਉੱਪਰ ਮੁਫ਼ਤ",
  },
  addMoreForFree: {
    en: "Add {amount} more for free delivery",
    hi: "{amount} और जोड़ें, डिलीवरी फ्री",
    pa: "{amount} ਹੋਰ ਜੋੜੋ, ਡਿਲਿਵਰੀ ਮੁਫ਼ਤ",
  },

  // Product
  viewAndOrder: { en: "View & Order", hi: "देखें और ऑर्डर करें", pa: "ਵੇਖੋ ਤੇ ਆਰਡਰ ਕਰੋ" },
  percentOff: { en: "{off}% OFF", hi: "{off}% छूट", pa: "{off}% ਛੋਟ" },
  backToProducts: {
    en: "Back to all products",
    hi: "सभी प्रोडक्ट पर वापस",
    pa: "ਸਾਰੇ ਪ੍ਰੋਡਕਟ 'ਤੇ ਵਾਪਸ",
  },
  quantity: { en: "Quantity", hi: "कितने चाहिए", pa: "ਕਿੰਨੇ ਚਾਹੀਦੇ" },
  orderNow: { en: "Order Now", hi: "अभी ऑर्डर करें", pa: "ਹੁਣੇ ਆਰਡਰ ਕਰੋ" },
  addToBag: { en: "Add to Bag", hi: "बैग में डालें", pa: "ਬੈਗ ਵਿੱਚ ਪਾਓ" },
  orderOnWhatsapp: {
    en: "Order on WhatsApp",
    hi: "व्हाट्सएप पर ऑर्डर करें",
    pa: "ਵਟਸਐਪ 'ਤੇ ਆਰਡਰ ਕਰੋ",
  },
  productDetails: { en: "Product Details", hi: "प्रोडक्ट की जानकारी", pa: "ਪ੍ਰੋਡਕਟ ਦੀ ਜਾਣਕਾਰੀ" },
  reduceQty: { en: "Reduce quantity", hi: "गिनती कम करें", pa: "ਗਿਣਤੀ ਘਟਾਓ" },
  increaseQty: { en: "Increase quantity", hi: "गिनती बढ़ाएं", pa: "ਗਿਣਤੀ ਵਧਾਓ" },

  // Bag
  yourBag: { en: "Your Bag", hi: "आपका बैग", pa: "ਤੁਹਾਡਾ ਬੈਗ" },
  emptyBag: { en: "Your bag is empty", hi: "आपका बैग खाली है", pa: "ਤੁਹਾਡਾ ਬੈਗ ਖਾਲੀ ਹੈ" },
  remove: { en: "Remove", hi: "हटाएं", pa: "ਹਟਾਓ" },
  itemsTotal: { en: "Items total", hi: "सामान का कुल", pa: "ਸਾਮਾਨ ਦਾ ਕੁੱਲ" },
  delivery: { en: "Delivery", hi: "डिलीवरी", pa: "ਡਿਲਿਵਰੀ" },
  free: { en: "FREE", hi: "फ्री", pa: "ਮੁਫ਼ਤ" },
  toPay: { en: "To Pay", hi: "देने हैं", pa: "ਦੇਣੇ ਹਨ" },
  loading: { en: "Loading…", hi: "रुकिए…", pa: "ਰੁਕੋ…" },

  // Checkout
  yourDetails: { en: "Your Details", hi: "आपकी जानकारी", pa: "ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ" },
  optional: { en: "optional", hi: "ज़रूरी नहीं", pa: "ਜ਼ਰੂਰੀ ਨਹੀਂ" },
  placeOrder: { en: "Place Order", hi: "ऑर्डर पक्का करें", pa: "ਆਰਡਰ ਪੱਕਾ ਕਰੋ" },
  pleaseWait: { en: "Please wait…", hi: "रुकिए…", pa: "ਰੁਕੋ…" },

  // Section headings — the form is grouped so 12 fields do not read as a wall.
  secName: { en: "Your Name", hi: "आपका नाम", pa: "ਤੁਹਾਡਾ ਨਾਂ" },
  secAddress: { en: "Delivery Address", hi: "डिलीवरी का पता", pa: "ਡਿਲਿਵਰੀ ਦਾ ਪਤਾ" },
  secPhone: { en: "Phone Number", hi: "फ़ोन नंबर", pa: "ਫ਼ੋਨ ਨੰਬਰ" },

  // Field labels, in the same order as the address format she sends on WhatsApp.
  fName: { en: "Your Name", hi: "आपका नाम", pa: "ਤੁਹਾਡਾ ਨਾਂ" },
  fRelation: { en: "You are", hi: "आप हैं", pa: "ਤੁਸੀਂ ਹੋ" },
  relSO: { en: "S/O — Son of", hi: "S/O — पुत्र", pa: "S/O — ਪੁੱਤਰ" },
  relWO: { en: "W/O — Wife of", hi: "W/O — पत्नी", pa: "W/O — ਪਤਨੀ" },
  relDO: { en: "D/O — Daughter of", hi: "D/O — पुत्री", pa: "D/O — ਧੀ" },
  fGuardian: {
    en: "Father's / Husband's Name",
    hi: "पिता / पति का नाम",
    pa: "ਪਿਤਾ / ਪਤੀ ਦਾ ਨਾਂ",
  },
  fHouseNo: { en: "House No. / Flat No.", hi: "मकान नंबर", pa: "ਮਕਾਨ ਨੰਬਰ" },
  fVillage: {
    en: "Village / Area / Colony",
    hi: "गाँव / एरिया / कॉलोनी",
    pa: "ਪਿੰਡ / ਏਰੀਆ / ਕਾਲੋਨੀ",
  },
  fStreet: { en: "Street / Road", hi: "गली / सड़क", pa: "ਗਲੀ / ਸੜਕ" },
  fLandmark: { en: "Near By / Landmark", hi: "पास की कोई पहचान", pa: "ਨੇੜੇ ਦੀ ਕੋਈ ਪਛਾਣ" },
  fPostOffice: { en: "Post Office (PO)", hi: "पोस्ट ऑफिस", pa: "ਡਾਕਖਾਨਾ (PO)" },
  fTehsil: { en: "Tehsil", hi: "तहसील", pa: "ਤਹਿਸੀਲ" },
  fDistrict: { en: "District", hi: "ज़िला", pa: "ਜ਼ਿਲ੍ਹਾ" },
  fState: { en: "State", hi: "राज्य", pa: "ਰਾਜ" },
  fPincode: { en: "PIN Code", hi: "पिन कोड", pa: "ਪਿਨ ਕੋਡ" },
  fPhone: { en: "Mobile Number", hi: "मोबाइल नंबर", pa: "ਮੋਬਾਈਲ ਨੰਬਰ" },
  fAltPhone: { en: "Another Mobile Number", hi: "दूसरा नंबर", pa: "ਦੂਜਾ ਨੰਬਰ" },
  fNotes: { en: "Any Message", hi: "कोई बात कहनी हो", pa: "ਕੋਈ ਗੱਲ ਕਹਿਣੀ ਹੋਵੇ" },

  // Payment choice
  secPayment: { en: "Payment", hi: "पैसे कैसे देंगे", pa: "ਪੈਸੇ ਕਿਵੇਂ ਦਿਓਗੇ" },
  payCod: { en: "Cash on Delivery", hi: "सामान मिलने पर पैसे दें", pa: "ਸਾਮਾਨ ਮਿਲਣ 'ਤੇ ਪੈਸੇ ਦਿਓ" },
  payCodNote: {
    en: "Pay the delivery person. Nothing to pay now.",
    hi: "डिलीवरी वाले को पैसे दें। अभी कुछ नहीं देना।",
    pa: "ਡਿਲਿਵਰੀ ਵਾਲੇ ਨੂੰ ਪੈਸੇ ਦਿਓ। ਹੁਣ ਕੁਝ ਨਹੀਂ ਦੇਣਾ।",
  },
  payUpi: { en: "Pay Now by UPI", hi: "अभी UPI से पैसे दें", pa: "ਹੁਣੇ UPI ਨਾਲ ਪੈਸੇ ਦਿਓ" },
  payUpiNote: {
    en: "Pay with GPay, PhonePe or Paytm",
    hi: "GPay, PhonePe या Paytm से दें",
    pa: "GPay, PhonePe ਜਾਂ Paytm ਨਾਲ ਦਿਓ",
  },
  payTo: { en: "Pay to", hi: "किसे पैसे भेजें", pa: "ਕਿਸ ਨੂੰ ਪੈਸੇ ਭੇਜੋ" },
  payAccountNote: {
    en: "This is the Natural Ayurveda {branch} payment account. Your UPI app will show this name.",
    hi: "यह Natural Ayurveda {branch} का पेमेंट अकाउंट है। आपके UPI ऐप में यही नाम दिखेगा।",
    pa: "ਇਹ Natural Ayurveda {branch} ਦਾ ਪੇਮੈਂਟ ਅਕਾਊਂਟ ਹੈ। ਤੁਹਾਡੇ UPI ਐਪ ਵਿੱਚ ਇਹੀ ਨਾਂ ਦਿਖੇਗਾ।",
  },
  payOpenApp: {
    en: "Pay {amount} in your UPI app",
    hi: "अपने UPI ऐप में {amount} दें",
    pa: "ਆਪਣੇ UPI ਐਪ ਵਿੱਚ {amount} ਦਿਓ",
  },
  payStep1: {
    en: "Step 1 — Pay {amount}",
    hi: "स्टेप 1 — {amount} भेजें",
    pa: "ਕਦਮ 1 — {amount} ਭੇਜੋ",
  },
  payStep2: {
    en: "Step 2 — Show us you paid",
    hi: "स्टेप 2 — पेमेंट का सबूत दें",
    pa: "ਕਦਮ 2 — ਪੇਮੈਂਟ ਦਾ ਸਬੂਤ ਦਿਓ",
  },
  payExact: {
    en: "Pay exactly {amount}",
    hi: "ठीक {amount} ही भेजें",
    pa: "ਬਿਲਕੁਲ {amount} ਹੀ ਭੇਜੋ",
  },
  proofRef: {
    en: "I will write the reference number",
    hi: "मैं रेफरेंस नंबर लिखूंगा",
    pa: "ਮੈਂ ਰੈਫਰੈਂਸ ਨੰਬਰ ਲਿਖਾਂਗਾ",
  },
  proofScreenshot: {
    en: "I will send a screenshot on WhatsApp",
    hi: "मैं व्हाट्सएप पर स्क्रीनशॉट भेजूंगा",
    pa: "ਮੈਂ ਵਟਸਐਪ 'ਤੇ ਸਕਰੀਨਸ਼ਾਟ ਭੇਜਾਂਗਾ",
  },
  proofScreenshotNote: {
    en: "Easier — after you place the order, a WhatsApp button appears. Attach the payment screenshot there.",
    hi: "यह आसान है — ऑर्डर करने के बाद व्हाट्सएप बटन आएगा। वहाँ पेमेंट का स्क्रीनशॉट भेज दें।",
    pa: "ਇਹ ਸੌਖਾ ਹੈ — ਆਰਡਰ ਕਰਨ ਤੋਂ ਬਾਅਦ ਵਟਸਐਪ ਬਟਨ ਆਵੇਗਾ। ਉੱਥੇ ਪੇਮੈਂਟ ਦਾ ਸਕਰੀਨਸ਼ਾਟ ਭੇਜ ਦਿਓ।",
  },
  sendScreenshot: {
    en: "Send payment screenshot on WhatsApp",
    hi: "व्हाट्सएप पर पेमेंट स्क्रीनशॉट भेजें",
    pa: "ਵਟਸਐਪ 'ਤੇ ਪੇਮੈਂਟ ਸਕਰੀਨਸ਼ਾਟ ਭੇਜੋ",
  },
  attachReminder: {
    en: "Please attach the payment screenshot in WhatsApp.",
    hi: "व्हाट्सएप में पेमेंट का स्क्रीनशॉट ज़रूर लगाएं।",
    pa: "ਵਟਸਐਪ ਵਿੱਚ ਪੇਮੈਂਟ ਦਾ ਸਕਰੀਨਸ਼ਾਟ ਜ਼ਰੂਰ ਲਾਓ।",
  },
  payScan: {
    en: "Or scan this code from another phone",
    hi: "या दूसरे फ़ोन से यह कोड स्कैन करें",
    pa: "ਜਾਂ ਦੂਜੇ ਫ਼ੋਨ ਤੋਂ ਇਹ ਕੋਡ ਸਕੈਨ ਕਰੋ",
  },
  fPaymentRef: {
    en: "UPI Reference Number",
    hi: "UPI रेफरेंस नंबर",
    pa: "UPI ਰੈਫਰੈਂਸ ਨੰਬਰ",
  },
  payRefHelp: {
    en: "After paying, copy the 12-digit number your UPI app shows",
    hi: "पैसे देने के बाद, UPI ऐप में दिख रहा 12 अंकों का नंबर लिखें",
    pa: "ਪੈਸੇ ਦੇਣ ਤੋਂ ਬਾਅਦ, UPI ਐਪ ਵਿੱਚ ਦਿਖਦਾ 12 ਅੰਕਾਂ ਦਾ ਨੰਬਰ ਲਿਖੋ",
  },
  errPaymentRef: {
    en: "Write the reference number from your UPI app",
    hi: "UPI ऐप का रेफरेंस नंबर लिखें",
    pa: "UPI ਐਪ ਦਾ ਰੈਫਰੈਂਸ ਨੰਬਰ ਲਿਖੋ",
  },
  payVerifyNote: {
    en: "We will check the payment and confirm your order.",
    hi: "हम पेमेंट देखकर आपका ऑर्डर पक्का करेंगे।",
    pa: "ਅਸੀਂ ਪੇਮੈਂਟ ਵੇਖ ਕੇ ਤੁਹਾਡਾ ਆਰਡਰ ਪੱਕਾ ਕਰਾਂਗੇ।",
  },

  // PIN code check
  pinChecking: {
    en: "Checking PIN code…",
    hi: "पिन कोड जाँच रहे हैं…",
    pa: "ਪਿਨ ਕੋਡ ਵੇਖ ਰਹੇ ਹਾਂ…",
  },
  pinFound: {
    en: "Found: {district}, {state}",
    hi: "मिल गया: {district}, {state}",
    pa: "ਮਿਲ ਗਿਆ: {district}, {state}",
  },
  pinNotFound: {
    en: "This PIN code was not found. Please check it.",
    hi: "यह पिन कोड नहीं मिला। कृपया दोबारा देखें।",
    pa: "ਇਹ ਪਿਨ ਕੋਡ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਵੇਖੋ।",
  },
  pinUnavailable: {
    en: "Could not check the PIN code. Please fill the address yourself.",
    hi: "पिन कोड जाँच नहीं सके। कृपया पता खुद भरें।",
    pa: "ਪਿਨ ਕੋਡ ਵੇਖ ਨਹੀਂ ਸਕੇ। ਕਿਰਪਾ ਕਰਕੇ ਪਤਾ ਆਪ ਭਰੋ।",
  },
  pinFillFirst: {
    en: "Fill the PIN code first",
    hi: "पहले पिन कोड भरें",
    pa: "ਪਹਿਲਾਂ ਪਿਨ ਕੋਡ ਭਰੋ",
  },
  choosePostOffice: {
    en: "Choose your Post Office",
    hi: "अपना पोस्ट ऑफिस चुनें",
    pa: "ਆਪਣਾ ਡਾਕਖਾਨਾ ਚੁਣੋ",
  },
  autoFilled: {
    en: "Filled from your PIN code",
    hi: "आपके पिन कोड से भरा गया",
    pa: "ਤੁਹਾਡੇ ਪਿਨ ਕੋਡ ਤੋਂ ਭਰਿਆ ਗਿਆ",
  },
  required: { en: "required", hi: "ज़रूरी", pa: "ਜ਼ਰੂਰੀ" },
  fixErrors: {
    en: "Please fill {count} more detail(s) below",
    hi: "नीचे {count} और जानकारी भरें",
    pa: "ਹੇਠਾਂ {count} ਹੋਰ ਜਾਣਕਾਰੀ ਭਰੋ",
  },

  // Validation — the server returns these keys, the browser renders the language.
  errName: { en: "Please write your name", hi: "अपना नाम लिखें", pa: "ਆਪਣਾ ਨਾਂ ਲਿਖੋ" },
  errPhone: {
    en: "Enter a 10 digit mobile number",
    hi: "10 अंकों का मोबाइल नंबर लिखें",
    pa: "10 ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਲਿਖੋ",
  },
  errRelation: {
    en: "Choose S/O, W/O or D/O",
    hi: "S/O, W/O या D/O चुनें",
    pa: "S/O, W/O ਜਾਂ D/O ਚੁਣੋ",
  },
  errGuardian: {
    en: "Write father's or husband's name",
    hi: "पिता या पति का नाम लिखें",
    pa: "ਪਿਤਾ ਜਾਂ ਪਤੀ ਦਾ ਨਾਂ ਲਿਖੋ",
  },
  errVillage: {
    en: "Write your village, area or colony",
    hi: "गाँव, एरिया या कॉलोनी लिखें",
    pa: "ਪਿੰਡ, ਏਰੀਆ ਜਾਂ ਕਾਲੋਨੀ ਲਿਖੋ",
  },
  errLandmark: {
    en: "Write something near your house",
    hi: "घर के पास की कोई पहचान लिखें",
    pa: "ਘਰ ਦੇ ਨੇੜੇ ਦੀ ਕੋਈ ਪਛਾਣ ਲਿਖੋ",
  },
  errPostOffice: {
    en: "Write your post office",
    hi: "पोस्ट ऑफिस लिखें",
    pa: "ਡਾਕਖਾਨਾ ਲਿਖੋ",
  },
  errDistrict: { en: "Write your district", hi: "ज़िला लिखें", pa: "ਜ਼ਿਲ੍ਹਾ ਲਿਖੋ" },
  errState: { en: "Write your state", hi: "राज्य लिखें", pa: "ਰਾਜ ਲਿਖੋ" },
  errPincode: {
    en: "Enter a 6 digit PIN code",
    hi: "6 अंकों का पिन कोड लिखें",
    pa: "6 ਅੰਕਾਂ ਦਾ ਪਿਨ ਕੋਡ ਲਿਖੋ",
  },
  errGeneric: {
    en: "Something went wrong. Please call us to order.",
    hi: "कुछ गड़बड़ हुई। ऑर्डर के लिए हमें फ़ोन करें।",
    pa: "ਕੁਝ ਗੜਬੜ ਹੋਈ। ਆਰਡਰ ਲਈ ਸਾਨੂੰ ਫ਼ੋਨ ਕਰੋ।",
  },

  // Confirmation
  orderPlaced: { en: "Order Placed!", hi: "ऑर्डर हो गया!", pa: "ਆਰਡਰ ਹੋ ਗਿਆ!" },
  orderNumber: { en: "Order number", hi: "ऑर्डर नंबर", pa: "ਆਰਡਰ ਨੰਬਰ" },
  payOnDelivery: {
    en: "Amount to pay on delivery",
    hi: "डिलीवरी पर देने हैं",
    pa: "ਡਿਲਿਵਰੀ 'ਤੇ ਦੇਣੇ ਹਨ",
  },
  willCall: {
    en: "Your order will be confirmed soon.",
    hi: "आपका ऑर्डर जल्दी पक्का हो जाएगा।",
    pa: "ਤੁਹਾਡਾ ਆਰਡਰ ਜਲਦੀ ਪੱਕਾ ਹੋ ਜਾਵੇਗਾ।",
  },
  sendOnWhatsapp: {
    en: "Send order on WhatsApp",
    hi: "व्हाट्सएप पर ऑर्डर भेजें",
    pa: "ਵਟਸਐਪ 'ਤੇ ਆਰਡਰ ਭੇਜੋ",
  },
  orderSomethingElse: { en: "Order something else", hi: "और सामान देखें", pa: "ਹੋਰ ਸਾਮਾਨ ਵੇਖੋ" },

} as const;

export type MessageKey = keyof typeof DICTIONARY;

export type Vars = Record<string, string | number>;

/** Pure lookup + `{placeholder}` fill. Lives here rather than in lib/i18n.ts so
 *  server code can compose messages in the language the customer chose. */
export function translate(lang: Lang, key: MessageKey, vars?: Vars): string {
  const entry = DICTIONARY[key];
  // Fall back to English rather than showing a raw key if a translation is missing.
  const text: string = entry[lang] ?? entry[DEFAULT_LANG];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

export const isLang = (value: unknown): value is Lang =>
  LANGUAGES.some((language) => language.code === value);
