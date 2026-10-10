'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SafeUser, DistributorWithRelations } from '@trionyx/types';

interface DistributorGuideViewProps {
  user: SafeUser;
  distributor: DistributorWithRelations;
}

type Language = 'en' | 'te' | 'hi';
type SectionKey = 'overview' | 'warranty_registration' | 'serial_check' | 'dealers' | 'requests';

export function DistributorGuideView({ user, distributor }: DistributorGuideViewProps) {
  const [lang, setLang] = useState<Language>('en');
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');

  const content = {
    en: {
      title: 'Distributor & Dealer User Guide',
      subtitle: 'Official handbook for regional operations partners and authorized studios',
      sections: {
        overview: {
          nav: 'Workspace Overview',
          title: 'Regional Operations & Purpose',
          desc: 'Manage your allocated genuine inventory, authorized detailing studios, and digital customer warranties.',
          points: [
            { step: '1', title: 'Territory Stock Control', detail: 'View available bottles and serial numbers assigned directly to your regional warehouse.' },
            { step: '2', title: 'Verify Genuine Product', detail: 'Scan any bottle barcode before application to confirm authenticity and active warranty eligibility.' },
            { step: '3', title: 'Digital Warranty Certificates', detail: 'Register customer vehicles after application so owners can look up their warranty anytime on trionyx.com.' },
            { step: '4', title: 'Studio Network Directory', detail: 'Keep track of authorized applicator studios operating in your territory.' },
            { step: '5', title: 'Stock Orders', detail: 'Request fresh product replenishment directly from Trionyx Central Operations when inventory is running low.' },
          ],
          actionLabel: 'Go to Territory Overview',
          actionHref: '/overview',
        },
        warranty_registration: {
          nav: 'Register Warranty',
          title: 'How to Register a Customer Warranty',
          desc: 'Issue an official digital warranty certificate as soon as a coating job is completed on a customer vehicle.',
          points: [
            { step: '1', title: 'Open Warranty Page', detail: 'Click Warranty in the left navigation menu.' },
            { step: '2', title: 'Click Register Warranty', detail: 'Click the orange "Register Warranty" button in the top right.' },
            { step: '3', title: 'Verify Bottle Serial', detail: 'Enter or scan the bottle serial barcode (e.g. TRX-CQ-2609-000001) and click Verify.' },
            { step: '4', title: 'Select Installing Studio', detail: 'Choose which authorized studio in your territory performed the application, and pick the installation date.' },
            { step: '5', title: 'Customer & Vehicle Info', detail: 'Enter customer name, mobile number, vehicle license plate (e.g. KA 01 AB 1234), and vehicle model (e.g. BMW 330i).' },
            { step: '6', title: 'Submit Registration', detail: 'Click "Register Warranty". The customer warranty is instantly active and verifiable online.' },
          ],
          actionLabel: 'Open Warranty Register',
          actionHref: '/warranty',
        },
        serial_check: {
          nav: 'Check Serial Status',
          title: 'Pre-Application Serial Eligibility Check',
          desc: 'Verify if a product bottle is genuine, in stock, and ready for warranty registration.',
          points: [
            { step: '1', title: 'Open Warranty', detail: 'Click the Warranty icon in the left menu.' },
            { step: '2', title: 'Enter Serial Number', detail: 'Under "Check Warranty Eligibility", type or scan the serial number on the bottle.' },
            { step: '3', title: 'Click Check Status', detail: 'Click the "Check Status" button to query the system.' },
            { step: '4', title: 'Inspect Result', detail: 'Green means the bottle is verified and ready. If already registered, it shows the vehicle plate. If policy is missing, contact central operations.' },
          ],
          actionLabel: 'Check a Serial Number',
          actionHref: '/warranty',
        },
        dealers: {
          nav: 'Authorized Studios',
          title: 'Managing Territory Detailing Studios',
          desc: 'Monitor approved applicator studios and dealerships operating in your region.',
          points: [
            { step: '1', title: 'Open Dealers Directory', detail: 'Click "My Dealers" in the left navigation menu.' },
            { step: '2', title: 'View Studio Details', detail: 'Check studio business names, contact persons, phone numbers, and official dealer codes.' },
            { step: '3', title: 'Track Activity', detail: 'Review warranty volume and active status for every studio in your territory.' },
          ],
          actionLabel: 'View My Dealers',
          actionHref: '/dealers',
        },
        requests: {
          nav: 'Order Stock Replenishment',
          title: 'Requesting Fresh Inventory from Central',
          desc: 'Quickly submit product replenishment requests when your warehouse stock runs low.',
          points: [
            { step: '1', title: 'Open Requests', detail: 'Click "Dealer Requests" in the left navigation menu.' },
            { step: '2', title: 'Click New Request', detail: 'Click the orange button to create a new replenishment order.' },
            { step: '3', title: 'Select Products & Quantities', detail: 'Pick the required coating formulas and specify the number of units needed.' },
            { step: '4', title: 'Submit to Central', detail: 'Add delivery notes and submit. Central Operations will approve and dispatch the serial batch to your hub.' },
          ],
          actionLabel: 'Go to Stock Requests',
          actionHref: '/requests',
        },
      },
    },
    te: {
      title: 'డిస్ట్రిబ్యూటర్ & డీలర్ యూజర్ గైడ్',
      subtitle: 'ప్రాంతీయ డిస్ట్రిబ్యూటర్లు మరియు అధీకృత డీలర్ స్టూడియోల కోసం అధికారిక మార్గదర్శిని',
      sections: {
        overview: {
          nav: 'పోర్టల్ స్థూల వివరణ',
          title: 'డిస్ట్రిబ్యూటర్ హబ్ ప్రయోజనం & ముఖ్య విధులు',
          desc: 'మీ ప్రాంతీయ స్టాక్, అధీకృత డీలర్ స్టూడియోలు మరియు కస్టమర్ డిజిటల్ వారంటీలను నిర్వహించండి.',
          points: [
            { step: '1', title: 'ప్రాంతీయ స్టాక్ ట్రాకింగ్', detail: 'మీ గోడౌన్‌కు కేటాయించిన అసలైన బాటిల్స్ మరియు సీరియల్ నంబర్లను ఎప్పటికప్పుడు చూడవచ్చు.' },
            { step: '2', title: 'అసలైన ప్రాడక్ట్ ధృవీకరణ', detail: 'కోటింగ్ వేసే ముందు బాటిల్ బార్‌కోడ్ స్కాన్ చేసి, అది అసలైనదో కాదో సరిచూడండి.' },
            { step: '3', title: 'డిజిటల్ వారంటీ సర్టిఫికెట్లు', detail: 'కస్టమర్ కారుకు కోటింగ్ వేసిన వెంటనే అధికారిక డిజిటల్ వారంటీని నమోదు చేయండి.' },
            { step: '4', title: 'స్టూడియోల పర్యవేక్షణ', detail: 'మీ పరిధిలో ఉన్న అధీకృత డిటైలింగ్ స్టూడియోల జాబితాను నిర్వహించండి.' },
            { step: '5', title: 'కొత్త స్టాక్ ఆర్డర్', detail: 'స్టాక్ తగ్గినప్పుడు నేరుగా ట్రైయోనిక్స్ హెడ్ ఆఫీస్ నుండి కొత్త బ్యాచ్ ఆర్డర్ చేయండి.' },
          ],
          actionLabel: 'ఓవర్‌వ్యూ పేజీకి వెళ్లండి',
          actionHref: '/overview',
        },
        warranty_registration: {
          nav: 'వారంటీ రిజిస్ట్రేషన్',
          title: 'కస్టమర్ వారంటీని ఎలా నమోదు చేయాలి?',
          desc: 'కారుపై కోటింగ్ పూర్తయిన వెంటనే అధికారిక వారంటీ సర్టిఫికెట్ జారీ చేయండి.',
          points: [
            { step: '1', title: 'Warranty పేజీ తెరవండి', detail: 'ఎడమ మెనూలో Warranty చిహ్నంపై క్లిక్ చేయండి.' },
            { step: '2', title: 'Register Warranty బటన్', detail: 'పైభాగంలో కుడివైపు ఉన్న నారింజ రంగు "Register Warranty" బటన్ నొక్కండి.' },
            { step: '3', title: 'సీరియల్ నంబర్ ధృవీకరణ', detail: 'బాటిల్ సీరియల్ బార్‌కోడ్ (ఉదా: TRX-CQ-2609-000001) నమోదు చేసి Verify నొక్కండి.' },
            { step: '4', title: 'డీలర్ & తేదీ ఎంపిక', detail: 'ఏ స్టూడియోలో కోటింగ్ వేశారో ఎంచుకుని, ఇన్‌స్టాలేషన్ తేదీని ఎంచుకోండి.' },
            { step: '5', title: 'కస్టమర్ & వాహనం వివరాలు', detail: 'కస్టమర్ పేరు, మొబైల్ నంబర్, వాహనం నంబర్ (ఉదా: TS 09 AB 1234), మోడల్ నమోదు చేయండి.' },
            { step: '6', title: 'వారంటీ సమర్పించండి', detail: '"Register Warranty" నొక్కండి. కస్టమర్ సర్టిఫికెట్ వెంటనే అమల్లోకి వస్తుంది.' },
          ],
          actionLabel: 'వారంటీ రిజిస్ట్రేషన్ తెరవండి',
          actionHref: '/warranty',
        },
        serial_check: {
          nav: 'సీరియల్ చెక్',
          title: 'కోటింగ్ వేయడానికి ముందు సీరియల్ తనిఖీ',
          desc: 'బాటిల్ అసలైనదో కాదో మరియు వారంటీకి సిద్ధంగా ఉందో లేదో చూడండి.',
          points: [
            { step: '1', title: 'Warranty పేజీ', detail: 'ఎడమ మెనూలో Warranty క్లిక్ చేయండి.' },
            { step: '2', title: 'సీరియల్ నమోదు', detail: '"Check Warranty Eligibility" కింద సీరియల్ నంబర్ ఎంటర్ చేయండి.' },
            { step: '3', title: 'Check Status నొక్కండి', detail: '"Check Status" బటన్ నొక్కి వివరాలు చూడండి.' },
            { step: '4', title: 'ఫలితం పరిశీలించండి', detail: 'గ్రీన్ వస్తే బాటిల్ అసలైనది, వారంటీకి రెడీ. పాత రిజిస్ట్రేషన్ ఉంటే వెహికల్ నంబర్ చూపిస్తుంది.' },
          ],
          actionLabel: 'సీరియల్ నంబర్ చెక్ చేయండి',
          actionHref: '/warranty',
        },
        dealers: {
          nav: 'డీలర్ స్టూడియోలు',
          title: 'మీ ప్రాంతంలోని డీలర్ నెట్‌వర్క్ నిర్వహణ',
          desc: 'మీ పరిధిలోని అధీకృత డిటైలింగ్ స్టూడియోల వివరాలు.',
          points: [
            { step: '1', title: 'My Dealers తెరవండి', detail: 'ఎడమ మెనూలో "My Dealers" పై క్లిక్ చేయండి.' },
            { step: '2', title: 'స్టూడియో వివరాలు', detail: 'స్టూడియో పేరు, డీలర్ కోడ్, ఫోన్ నంబర్లు మరియు చిరునామా చూడవచ్చు.' },
            { step: '3', title: 'వ్యాపార స్థితి', detail: 'ప్రతి స్టూడియో ఎన్ని వారంటీలు నమోదు చేసిందో గమనించవచ్చు.' },
          ],
          actionLabel: 'డీలర్ల జాబితా చూడండి',
          actionHref: '/dealers',
        },
        requests: {
          nav: 'కొత్త స్టాక్ ఆర్డర్',
          title: 'హెడ్ ఆఫీస్ నుండి స్టాక్ ఆర్డర్ చేయడం',
          desc: 'మీ గోడౌన్‌లో స్టాక్ తగ్గినప్పుడు వెంటనే కొత్త ఆర్డర్ పంపండి.',
          points: [
            { step: '1', title: 'Dealer Requests తెరవండి', detail: 'ఎడమ మెనూలో "Dealer Requests" క్లిక్ చేయండి.' },
            { step: '2', title: 'New Request బటన్', detail: 'కొత్త ఆర్డర్ కోసం నారింజ బటన్ నొక్కండి.' },
            { step: '3', title: 'ప్రాడక్ట్‌లు & పరిమాణం', detail: 'కావాల్సిన ఉత్పత్తులను మరియు ఎన్ని బాటిల్స్ కావాలో ఎంచుకోండి.' },
            { step: '4', title: 'ఆర్డర్ పంపండి', detail: 'సమర్పించండి. ట్రైయోనిక్స్ హెడ్ ఆఫీస్ పరిశీలించి స్టాక్‌ను వెంటనే పంపుతుంది.' },
          ],
          actionLabel: 'స్టాక్ రిక్వెస్ట్‌లు చూడండి',
          actionHref: '/requests',
        },
      },
    },
    hi: {
      title: 'डिस्ट्रीब्यूटर एवं डीलर यूजर गाइड',
      subtitle: 'क्षेत्रीय डिस्ट्रीब्यूटर पार्टनर्स और अधिकृत स्टूडियोज के लिए आधिकारिक हैंडबुक',
      sections: {
        overview: {
          nav: 'पोर्टल अवलोकन',
          title: 'डिस्ट्रीब्यूटर हब का उद्देश्य और मुख्य कार्य',
          desc: 'अपने क्षेत्रीय स्टॉक, अधिकृत डिटेलिंग स्टूडियोज और डिजिटल कस्टमर वारंटी का प्रबंधन करें।',
          points: [
            { step: '1', title: 'क्षेत्रीय स्टॉक नियंत्रण', detail: 'अपने वेयरहाउस को आवंटित असली बॉटल्स और सीरियल नंबर तुरंत देखें।' },
            { step: '2', title: 'असली प्रोडक्ट सत्यापन', detail: 'कोटिंग लगाने से पहले बॉटल बारकोड स्कैन करके उसकी प्रामाणिकता जांचें।' },
            { step: '3', title: 'डिजिटल वारंटी सर्टिफिकेट', detail: 'ग्राहक की कार पर काम पूरा होने के बाद डिजिटल वारंटी जारी करें।' },
            { step: '4', title: 'डीलर नेटवर्क निर्देशिका', detail: 'अपने क्षेत्र के सभी अधिकृत स्टूडियोज की सूची और संपर्क देखें।' },
            { step: '5', title: 'स्टॉक ऑर्डर', detail: 'स्टॉक कम होने पर सीधे सेंट्रल हेड ऑफिस से नया स्टॉक मंगाएं।' },
          ],
          actionLabel: 'ओवरव्यू पर जाएं',
          actionHref: '/overview',
        },
        warranty_registration: {
          nav: 'वारंटी पंजीकरण',
          title: 'ग्राहक की डिजिटल वारंटी कैसे दर्ज करें?',
          desc: 'कार पर कोटिंग का काम पूरा होते ही आधिकारिक डिजिटल वारंटी सर्टिफिकेट जारी करें।',
          points: [
            { step: '1', title: 'Warranty पेज खोलें', detail: 'बाईं ओर मेनू में Warranty विकल्प पर क्लिक करें।' },
            { step: '2', title: 'Register Warranty बटन', detail: 'ऊपर दाईं ओर नारंगी "Register Warranty" बटन पर क्लिक करें।' },
            { step: '3', title: 'सीरियल नंबर जांचें', detail: 'बॉटल का बारकोड सीरियल (जैसे: TRX-CQ-2609-000001) दर्ज करें और Verify दबाएं।' },
            { step: '4', title: 'स्टूडियो और तारीख चुनें', detail: 'जिस स्टूडियो ने काम किया है उसे चुनें और इंस्टॉलेशन की तारीख दर्ज करें।' },
            { step: '5', title: 'ग्राहक व वाहन विवरण', detail: 'ग्राहक का नाम, मोबाइल नंबर, वाहन नंबर (जैसे: DL 01 AB 1234) और मॉडल दर्ज करें।' },
            { step: '6', title: 'वारंटी सबमिट करें', detail: '"Register Warranty" पर क्लिक करें। डिजिटल सर्टिफिकेट तुरंत सक्रिय हो जाएगा।' },
          ],
          actionLabel: 'वारंटी पंजीकरण खोलें',
          actionHref: '/warranty',
        },
        serial_check: {
          nav: 'सीरियल जांच',
          title: 'कोटिंग लगाने से पहले सीरियल की पात्रता जांचना',
          desc: 'जांचें कि बोतल असली है, स्टॉक में है और वारंटी के लिए तैयार है या नहीं।',
          points: [
            { step: '1', title: 'Warranty खोलें', detail: 'बाईं ओर मेनू में Warranty पर क्लिक करें।' },
            { step: '2', title: 'सीरियल नंबर डालें', detail: '"Check Warranty Eligibility" के नीचे सीरियल नंबर टाइप या स्कैन करें।' },
            { step: '3', title: 'Check Status दबाएं', detail: '"Check Status" बटन दबाकर जानकारी देखें।' },
            { step: '4', title: 'परिणाम देखें', detail: 'हरा संकेत मिलने पर बोतल असली और वारंटी के लिए तैयार है। पूर्व पंजीकृत होने पर वाहन नंबर दिखाई देगा।' },
          ],
          actionLabel: 'सीरियल नंबर जांचें',
          actionHref: '/warranty',
        },
        dealers: {
          nav: 'अधिकृत स्टूडियोज',
          title: 'क्षेत्रीय डीलर स्टूडियोज का प्रबंधन',
          desc: 'अपने अधीन काम कर रहे सभी अधिकृत डिटेलिंग स्टूडियोज की जानकारी रखें।',
          points: [
            { step: '1', title: 'My Dealers खोलें', detail: 'बाईं ओर मेनू में "My Dealers" पर क्लिक करें।' },
            { step: '2', title: 'स्टूडियो का विवरण', detail: 'स्टूडियो का नाम, डीलर कोड, मोबाइल नंबर और पता देखें।' },
            { step: '3', title: 'सक्रियता देखें', detail: 'हर स्टूडियो द्वारा की गई कुल वारंटी पंजीकरण की संख्या देखें।' },
          ],
          actionLabel: 'डीलर्स की सूची देखें',
          actionHref: '/dealers',
        },
        requests: {
          nav: 'नया स्टॉक ऑर्डर',
          title: 'सेंट्रल हेड ऑफिस से स्टॉक मंगाना',
          desc: 'वेयरहाउस में माल कम होने पर तुरंत नया स्टॉक अनुरोध भेजें।',
          points: [
            { step: '1', title: 'Dealer Requests खोलें', detail: 'बाईं ओर मेनू में "Dealer Requests" पर क्लिक करें।' },
            { step: '2', title: 'New Request बटन', detail: 'नया अनुरोध दर्ज करने के लिए नारंगी बटन दबाएं।' },
            { step: '3', title: 'प्रोडक्ट और मात्रा चुनें', detail: 'आवश्यक कोटिंग प्रोडक्ट्स और बॉटल्स की संख्या चुनें।' },
            { step: '4', title: 'ऑर्डर सबमिट करें', detail: 'सेंट्रल ऑपरेशंस टीम इसे स्वीकृत कर तुरंत स्टॉक आपके हब पर रवाना करेगी।' },
          ],
          actionLabel: 'स्टॉक अनुरोध देखें',
          actionHref: '/requests',
        },
      },
    },
  };

  const current = content[lang];
  const section = current.sections[activeSection];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Header with Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#171717]/10">
        <div>
          <h1 className="text-[20px] font-bold text-[#171717] tracking-tight m-0">
            {current.title}
          </h1>
          <p className="text-[13px] text-[#737373] mt-1 m-0">
            {current.subtitle}
          </p>
        </div>

        {/* 3-Language Selector Buttons */}
        <div className="inline-flex items-center p-1 rounded-[6px] border border-[#171717]/15 bg-white shrink-0 self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
              lang === 'en'
                ? 'bg-[#F26522] text-white'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('te')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
              lang === 'te'
                ? 'bg-[#F26522] text-white'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            తెలుగు
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
              lang === 'hi'
                ? 'bg-[#F26522] text-white'
                : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* 2. Topic Selector Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-4.5 no-scrollbar border-b border-[#171717]/10 mb-2">
        {(Object.keys(current.sections) as SectionKey[]).map((key) => {
          const item = current.sections[key];
          const isActive = activeSection === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              className={`px-4 py-2 rounded-[6px] text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#F26522] text-white font-semibold shadow-xs'
                  : 'bg-white border border-[#171717]/15 text-[#737373] hover:text-[#171717] hover:bg-[#F5F5F5]'
              }`}
            >
              {item.nav}
            </button>
          );
        })}
      </div>

      {/* 3. Active Section Guide Card */}
      <div className="bg-white border border-[#171717]/10 rounded-[8px] p-6 sm:p-7 shadow-xs space-y-6 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-[#171717]/10">
          <div>
            <h2 className="text-[17px] font-bold text-[#171717] m-0">
              {section.title}
            </h2>
            <p className="text-[13.5px] text-[#737373] mt-1.5 m-0 leading-relaxed">
              {section.desc}
            </p>
          </div>
          <Link
            href={section.actionHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#171717] text-white hover:opacity-90 text-[12.5px] font-semibold transition-opacity shrink-0 shadow-xs"
          >
            <span>{section.actionLabel}</span>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Action Steps */}
        <div className="space-y-3.5">
          {section.points.map((pt) => (
            <div
              key={pt.step}
              className="flex items-start gap-3.5 p-4 rounded-[6px] border border-[#171717]/10 bg-[#FAFAFA] transition-colors hover:border-[#F26522]/50"
            >
              <div className="w-7 h-7 rounded-[4px] bg-[#F26522] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
                {pt.step}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-[#171717] m-0">
                  {pt.title}
                </h3>
                <p className="text-[13px] text-[#737373] mt-1 m-0 leading-relaxed">
                  {pt.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
