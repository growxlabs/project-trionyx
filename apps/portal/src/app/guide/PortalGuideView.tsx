'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SafeUser } from '@trionyx/types';

interface PortalGuideViewProps {
  user: SafeUser;
}

type Language = 'en' | 'te' | 'hi';
type SectionKey = 'overview' | 'products' | 'warranty_policy' | 'inventory' | 'transfers' | 'warranty_activation' | 'appearance';

export function PortalGuideView({ user }: PortalGuideViewProps) {
  const [lang, setLang] = useState<Language>('en');
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');

  const content = {
    en: {
      title: 'Operations Portal Guide',
      subtitle: 'Official walkthrough for Managing Directors, Operations, and Administrators',
      quickJump: 'Quick Navigation',
      openModule: 'Open Module',
      sections: {
        overview: {
          nav: 'Overview',
          title: 'System Overview & Purpose',
          desc: 'The central command center for Trionyx company leadership and operations staff.',
          points: [
            { step: '1', title: 'Product Catalog', detail: 'Create, update, and manage official chemical coatings and nanotech surface protection formulas.' },
            { step: '2', title: 'Warranty Policy Engine', detail: 'Set official warranty duration limits (e.g. 24, 36, 60 months) before any customer certificates can be issued.' },
            { step: '3', title: 'Batch Receiving & Serials', detail: 'Receive factory batches, scan or paste individual serial barcodes, and assign them to central or regional warehouses.' },
            { step: '4', title: 'Territory Distribution', detail: 'Transfer verified serial batches to regional distributors and approved applicator studios.' },
            { step: '5', title: 'Warranty Governance', detail: 'Verify serial legitimacy, inspect vehicle registration records, and activate digital certificates.' },
          ],
          actionLabel: 'Go to Operations Cockpit',
          actionHref: '/overview',
        },
        products: {
          nav: 'Products & Catalog',
          title: 'How to Add & Manage Products',
          desc: 'Register new formulas and make them available for inventory stocking and public visibility.',
          points: [
            { step: '1', title: 'Open Catalog', detail: 'Click the Products icon in the left navigation rail.' },
            { step: '2', title: 'Start Creation', detail: 'Click the orange "+ New Product" button in the top right corner.' },
            { step: '3', title: 'Enter Product Identity', detail: 'Type the Product Name (e.g. Trionyx Ceramic Quartz 9H), select Category, and choose Status (Active).' },
            { step: '4', title: 'Set Visibility', detail: 'Choose "Public" to display on trionyx.com, or "Private" for internal studio distribution only.' },
            { step: '5', title: 'Save Product', detail: 'Scroll down to the bottom of the page and click "Create Product".' },
          ],
          actionLabel: 'Open Product Catalog',
          actionHref: '/products',
        },
        warranty_policy: {
          nav: 'Warranty Policy',
          title: 'Configuring Product Warranty Policies',
          desc: 'Mandatory step: Serials cannot have warranties registered until their formula has an active policy.',
          points: [
            { step: '1', title: 'Select Product', detail: 'Go to Products and click on the product formula (e.g. Trionyx Ceramic Quartz 9H).' },
            { step: '2', title: 'Open Policy Tab', detail: 'In the tabs bar, click the "Warranty Policy" tab (the 6th tab).' },
            { step: '3', title: 'Click Configure', detail: 'Click the "Configure Warranty Policy" (or "Edit Warranty Policy") button.' },
            { step: '4', title: 'Set Duration', detail: 'Enter coverage months (e.g. 24 for 2 years, 36 for 3 years, 60 for 5 years).' },
            { step: '5', title: 'Set Active & Save', detail: 'Ensure Status is set to "Active" and click "Save Policy". Warranties can now be activated.' },
          ],
          actionLabel: 'Manage Product Policies',
          actionHref: '/products',
        },
        inventory: {
          nav: 'Receive Stock & Serials',
          title: 'Inwarding New Stock into Warehouses',
          desc: 'Track individual physical bottles in the warehouse with serial barcode numbers.',
          points: [
            { step: '1', title: 'Open Inventory', detail: 'Click the Inventory icon in the left navigation menu.' },
            { step: '2', title: 'Click Receive Serials', detail: 'Click the green "Receive Serials" button at the top (or "+ In" on any product row).' },
            { step: '3', title: 'Pick Product & Facility', detail: 'Select the formula and choose which warehouse facility is receiving the stock.' },
            { step: '4', title: 'Enter Serial Barcodes', detail: 'Type or paste serial barcodes (one per line, e.g. TRX-CQ-2609-000001) or scan with camera. Click "Add" or press Enter.' },
            { step: '5', title: 'Confirm Inwarding', detail: 'Enter optional Batch/Lot reference and click "Confirm Receipt". Stock counts update instantly.' },
          ],
          actionLabel: 'Open Inventory Registry',
          actionHref: '/inventory',
        },
        transfers: {
          nav: 'Stock Transfers',
          title: 'Transferring Stock to Distributors & Studios',
          desc: 'Safely move serial units between company facilities, regional distributors, and studios.',
          points: [
            { step: '1', title: 'Start Transfer', detail: 'On the Inventory page, click the "Transfer" button in the top toolbar.' },
            { step: '2', title: 'Select Source Location', detail: 'Pick the facility where the physical bottles are currently located.' },
            { step: '3', title: 'Select Destination', detail: 'Choose the receiving Regional Distributor Hub or Authorized Detailing Studio.' },
            { step: '4', title: 'Input Serials', detail: 'Scan or type the serial numbers being transferred.' },
            { step: '5', title: 'Confirm Dispatch', detail: 'Click "Confirm Transfer". The custody chain and movement logs are instantly recorded.' },
          ],
          actionLabel: 'View Inventory & Transfers',
          actionHref: '/inventory',
        },
        warranty_activation: {
          nav: 'Warranty Management',
          title: 'Checking & Activating Customer Warranties',
          desc: 'Verify serial legitimacy, inspect vehicle registration records, and activate digital certificates.',
          points: [
            { step: '1', title: 'Open Warranty Registry', detail: 'Click the Warranty shield icon in the left menu.' },
            { step: '2', title: 'Check Serial Status', detail: 'Enter any serial number in "Check Serial" and click "Check" to see formula, validity, and active coverage.' },
            { step: '3', title: 'Activate Warranty Directly', detail: 'Click "+ Activate Warranty" in the top right.' },
            { step: '4', title: 'Provide Details', detail: 'Enter the serial barcode, select the authorized studio that installed it, and pick the installation date.' },
            { step: '5', title: 'Complete Registration', detail: 'Click "Activate Warranty". The digital certificate is live for customer online verification.' },
          ],
          actionLabel: 'Open Warranty Registry',
          actionHref: '/warranty',
        },
        appearance: {
          nav: 'Appearance & Themes',
          title: 'Customizing Workspace Theme',
          desc: 'Personalize the interface display to match your operational lighting and preference.',
          points: [
            { step: '1', title: 'Open Settings', detail: 'Click the sliders/settings icon at the bottom of the navigation rail.' },
            { step: '2', title: 'Select Mode', detail: 'Choose Dark, Light, or Match System.' },
            { step: '3', title: 'Pick Accent Theme', detail: 'Select from 6 curated workspace accents: Ember (Orange), Plum, Rosewood, Moss (Green), Slate, or Monochrome.' },
            { step: '4', title: 'Density & Motion', detail: 'Select Comfortable or Compact layout density, and toggle animations with Reduce Motion.' },
          ],
          actionLabel: 'Open Appearance Settings',
          actionHref: '/settings/appearance',
        },
      },
    },
    te: {
      title: 'ఆపరేషన్స్ పోర్టల్ యూజర్ గైడ్',
      subtitle: 'మేనేజింగ్ డైరెక్టర్ (MD), ఆపరేషన్స్ మరియు అడ్మినిస్ట్రేటర్ల కోసం అధికారిక మార్గదర్శిని',
      quickJump: 'విభాగాలు',
      openModule: 'పేజీకి వెళ్లండి',
      sections: {
        overview: {
          nav: 'స్థూల వివరణ',
          title: 'సిస్టమ్ ప్రయోజనం & ముఖ్య విధులు',
          desc: 'ట్రైయోనిక్స్ వ్యాపార నిర్వహణ మరియు ఉత్పత్తుల నియంత్రణ కోసం ప్రధాన వ్యవస్థ.',
          points: [
            { step: '1', title: 'ప్రాడక్ట్ కేటలాగ్', detail: 'అన్ని కోటింగ్ మరియు ప్రొటెక్షన్ ఫార్ములాలను సిస్టమ్‌లో రూపొందించి నిర్వహించండి.' },
            { step: '2', title: 'వారంటీ పాలసీలు', detail: 'ప్రతి ప్రాడక్ట్‌కు అధికారిక వారంటీ సమయాన్ని (24, 36, 60 నెలలు) నిర్ణయించండి.' },
            { step: '3', title: 'స్టాక్ & సీరియల్ నంబర్లు', detail: 'ఫ్యాక్టరీ నుండి వచ్చిన స్టాక్ బాటిల్స్‌ను సీరియల్ బార్‌కోడ్ ద్వారా వేర్‌హౌస్‌లో తీసుకోండి.' },
            { step: '4', title: 'స్టాక్ పంపిణీ', detail: 'ప్రాంతీయ డిస్ట్రిబ్యూటర్లకు మరియు అధీకృత డీలర్ స్టూడియోలకు స్టాక్‌ను బదిలీ చేయండి.' },
            { step: '5', title: 'వారంటీ జారీ', detail: 'కస్టమర్ వాహనాలకు అధికారిక డిజిటల్ వారంటీ సర్టిఫికెట్లను ధృవీకరించి యాక్టివేట్ చేయండి.' },
          ],
          actionLabel: 'కంట్రోల్ బోర్డుకు వెళ్లండి',
          actionHref: '/overview',
        },
        products: {
          nav: 'ప్రాడక్ట్‌ల నిర్వహణ',
          title: 'కొత్త ప్రాడక్ట్‌ను ఎలా జోడించాలి?',
          desc: 'కొత్త ఫార్ములాను నమోదు చేసి, వెబ్‌సైట్ మరియు వేర్‌హౌస్ కోసం సిద్ధం చేయండి.',
          points: [
            { step: '1', title: 'Products పేజీ తెరవండి', detail: 'ఎడమ మెనూలో క్యూబ్ / బాక్స్ ఐకాన్‌పై క్లిక్ చేయండి.' },
            { step: '2', title: 'కొత్త ప్రాడక్ట్ బటన్', detail: 'కుడివైపు పైభాగంలో ఉన్న "+ New Product" నారింజ బటన్‌ను నొక్కండి.' },
            { step: '3', title: 'వివరాలు నమోదు', detail: 'ప్రాడక్ట్ పేరు (ఉదా: Trionyx Ceramic Quartz 9H), కేటగిరీ ఎంచుకుని, Status ను "Active" గా ఉంచండి.' },
            { step: '4', title: 'విజిబిలిటీ ఎంపిక', detail: 'వెబ్‌సైట్‌లో అందరికీ కనిపించాలంటే "Public" అని, స్టూడియోలకు మాత్రమే అయితే "Private" అని ఎంచుకోండి.' },
            { step: '5', title: 'సేవ్ చేయండి', detail: 'పేజీ చివరకు వెళ్లి "Create Product" బటన్ నొక్కండి.' },
          ],
          actionLabel: 'ప్రాడక్ట్ కేటలాగ్‌కు వెళ్లండి',
          actionHref: '/products',
        },
        warranty_policy: {
          nav: 'వారంటీ పాలసీ సెట్టింగ్స్',
          title: 'ప్రాడక్ట్ వారంటీ పాలసీని ఎలా కాన్ఫిగర్ చేయాలి?',
          desc: 'ముఖ్యమైన నిబంధన: పాలసీ కాన్ఫిగర్ చేయకుండా ఏ ప్రాడక్ట్‌కు వారంటీ జారీ చేయడం సాధ్యం కాదు.',
          points: [
            { step: '1', title: 'ప్రాడక్ట్ ఎంచుకోండి', detail: 'Products పేజీలో సంబంధిత ప్రాడక్ట్ పేరుపై క్లిక్ చేయండి.' },
            { step: '2', title: 'Warranty Policy ట్యాబ్', detail: 'ట్యాబ్‌ల వరుసలో 6వ ట్యాబ్ అయిన "Warranty Policy" పై క్లిక్ చేయండి.' },
            { step: '3', title: 'Configure నొక్కండి', detail: '"Configure Warranty Policy" బటన్ పై క్లిక్ చేయండి.' },
            { step: '4', title: 'సమయం నమోదు (నెలలు)', detail: 'వారంటీ సమయాన్ని నెలల్లో నమోదు చేయండి (2 సంవత్సరాలకు 24, 3 సంవత్సరాలకు 36, 5 సంవత్సరాలకు 60).' },
            { step: '5', title: 'Active చేసి సేవ్ చేయండి', detail: 'స్టేటస్ "Active" గా ఉంచి "Save Policy" నొక్కండి. ఇప్పుడు వారంటీలు రిజిస్టర్ చేసుకోవచ్చు.' },
          ],
          actionLabel: 'పాలసీలను నిర్వహించండి',
          actionHref: '/products',
        },
        inventory: {
          nav: 'స్టాక్ & సీరియల్ నమోదు',
          title: 'వేర్‌హౌస్‌లో కొత్త స్టాక్ తీసుకోవడం (Receive Inventory)',
          desc: 'ప్రతి బాటిల్ సీరియల్ బార్‌కోడ్‌ను సిస్టమ్‌లో నమోదు చేసి స్టాక్‌ను పెంచండి.',
          points: [
            { step: '1', title: 'Inventory పేజీ', detail: 'ఎడమ మెనూలో Inventory చిహ్నంపై క్లిక్ చేయండి.' },
            { step: '2', title: 'Receive Serials బటన్', detail: 'పైభాగంలో ఉన్న ఆకుపచ్చ "Receive Serials" బటన్ నొక్కండి (లేదా ప్రాడక్ట్ పక్కన "+ In" నొక్కండి).' },
            { step: '3', title: 'ప్రాడక్ట్ & వేర్‌హౌస్ ఎంపిక', detail: 'ఏ ప్రాడక్ట్ వచ్చిందో మరియు ఏ గోడౌన్‌కు వచ్చిందో ఎంచుకోండి.' },
            { step: '4', title: 'సీరియల్ నంబర్లు నమోదు', detail: 'బాక్స్‌లో సీరియల్ నంబర్లు టైప్ చేయండి లేదా పేస్ట్ చేయండి (ఉదా: TRX-CQ-2609-000001). "Add" బటన్ నొక్కండి.' },
            { step: '5', title: 'ధృవీకరించి సేవ్ చేయండి', detail: 'బ్యాచ్ నంబర్ నమోదు చేసి "Confirm Receipt" పై క్లిక్ చేయండి. స్టాక్ వెంటనే పెరుగుతుంది.' },
          ],
          actionLabel: 'ఇన్వెంటరీ పేజీకి వెళ్లండి',
          actionHref: '/inventory',
        },
        transfers: {
          nav: 'స్టాక్ బదిలీ (Transfers)',
          title: 'డిస్ట్రిబ్యూటర్లు & డీలర్లకు స్టాక్ పంపడం',
          desc: 'ఒక వేర్‌హౌస్ నుండి డిస్ట్రిబ్యూటర్ హబ్‌లకు లేదా స్టూడియోలకు బాటిల్స్ బదిలీ చేయండి.',
          points: [
            { step: '1', title: 'Transfer ప్రారంభించండి', detail: 'Inventory పేజీలో "Transfer" బటన్ నొక్కండి.' },
            { step: '2', title: 'ప్రస్తుత వేర్‌హౌస్ ఎంపిక', detail: 'ప్రస్తుతం స్టాక్ ఉన్న వేర్‌హౌస్‌ను Source గా ఎంచుకోండి.' },
            { step: '3', title: 'గమ్యస్థానం ఎంపిక', detail: 'స్టాక్ పంపుతున్న రీజినల్ డిస్ట్రిబ్యూటర్ లేదా డీలర్ స్టూడియోను ఎంచుకోండి.' },
            { step: '4', title: 'సీరియల్ నంబర్లు స్కాన్', detail: 'పంపుతున్న సీరియల్ నంబర్లను ఎంటర్ చేయండి.' },
            { step: '5', title: 'బదిలీ పూర్తి చేయండి', detail: '"Confirm Transfer" నొక్కండి. స్టాక్ లొకేషన్ వెంటనే అప్‌డేట్ అవుతుంది.' },
          ],
          actionLabel: 'స్టాక్ బదిలీ చూడండి',
          actionHref: '/inventory',
        },
        warranty_activation: {
          nav: 'వారంటీ నిర్వహణ',
          title: 'వారంటీలను తనిఖీ చేయడం & యాక్టివేట్ చేయడం',
          desc: 'సీరియల్ నంబర్లను తనిఖీ చేసి, కస్టమర్ వాహనానికి డిజిటల్ సర్టిఫికెట్ ఇవ్వండి.',
          points: [
            { step: '1', title: 'Warranty పేజీ తెరవండి', detail: 'ఎడమ మెనూలో రక్షణ కవచం (Shield) ఐకాన్ క్లిక్ చేయండి.' },
            { step: '2', title: 'సీరియల్ చెక్ చేయండి', detail: '"Check Serial" బాక్స్‌లో సీరియల్ నంబర్ వేసి Check నొక్కండి.' },
            { step: '3', title: 'వారంటీ యాక్టివేషన్', detail: 'పైనున్న "+ Activate Warranty" బటన్ నొక్కండి.' },
            { step: '4', title: 'వివరాలు నమోదు', detail: 'సీరియల్ నంబర్, ఇన్‌స్టాల్ చేసిన డీలర్ స్టూడియో, మరియు ఇన్‌స్టాలేషన్ తేదీ ఎంచుకోండి.' },
            { step: '5', title: 'యాక్టివేట్ చేయండి', detail: '"Activate Warranty" నొక్కండి. కస్టమర్ సర్టిఫికెట్ వెంటనే అమల్లోకి వస్తుంది.' },
          ],
          actionLabel: 'వారంటీ రిజిస్ట్రీకి వెళ్లండి',
          actionHref: '/warranty',
        },
        appearance: {
          nav: 'రూపురేఖలు & థీమ్స్',
          title: 'స్క్రీన్ రంగులు మరియు డిజైన్ సెట్టింగ్స్',
          desc: 'మీ పని వాతావరణానికి తగినట్లుగా పోర్టల్ రూపురేఖలను మార్చుకోండి.',
          points: [
            { step: '1', title: 'Settings తెరవండి', detail: 'ఎడమ మెనూ చివరలో ఉన్న స్లైడర్ / సెట్టింగ్స్ ఐకాన్ నొక్కండి.' },
            { step: '2', title: 'మోడ్ ఎంపిక', detail: 'Dark (డార్క్), Light (లైట్), లేదా System మోడ్ ఎంచుకోండి.' },
            { step: '3', title: 'యాసెంట్ థీమ్', detail: 'Ember (నారింజ), Plum, Rosewood, Moss (ఆకుపచ్చ), Slate, లేదా Mono లో నచ్చినది ఎంచుకోండి.' },
            { step: '4', title: 'కంఫర్ట్ & మోషన్', detail: 'కంఫర్టబుల్ లేదా కాంపాక్ట్ సైజు ఎంచుకోవచ్చు.' },
          ],
          actionLabel: 'అపీయరెన్స్ సెట్టింగ్స్ తెరవండి',
          actionHref: '/settings/appearance',
        },
      },
    },
    hi: {
      title: 'ऑपरेशंस पोर्टल मार्गदर्शिका',
      subtitle: 'मैनेजिंग डायरेक्टर (MD), ऑपरेशंस टीम और एडमिनिस्ट्रेटर के लिए आधिकारिक गाइड',
      quickJump: 'शीघ्र नेविगेशन',
      openModule: 'पेज पर जाएं',
      sections: {
        overview: {
          nav: 'सिस्टम अवलोकन',
          title: 'पोर्टल का उद्देश्य और मुख्य कार्य',
          desc: 'कंपनी नेतृत्व और परिचालन टीम के लिए केंद्रीय नियंत्रण प्रणाली।',
          points: [
            { step: '1', title: 'प्रोडक्ट कैटलॉग', detail: 'सभी केमिकल कोटिंग्स और नैनोटेक प्रोटेक्शन फॉर्मूले बनाएं और प्रबंधित करें।' },
            { step: '2', title: 'वारंटी पॉलिसी इंजन', detail: 'हर प्रोडक्ट के लिए आधिकारिक वारंटी अवधि (24, 36, 60 महीने) तय करें।' },
            { step: '3', title: 'स्टॉक और सीरियल नंबर', detail: 'फैक्ट्री बैच को सीरियल बारकोड के साथ वेयरहाउस में दर्ज करें।' },
            { step: '4', title: 'क्षेत्रीय वितरण', detail: 'सत्यापित सीरियल स्टॉक को रीजनल डिस्ट्रीब्यूटर्स और अधिकृत स्टूडियोज को ट्रांसफर करें।' },
            { step: '5', title: 'वारंटी सक्रियण', detail: 'सीरियल नंबर की जांच करें और ग्राहकों के वाहनों के लिए डिजिटल वारंटी जारी करें।' },
          ],
          actionLabel: 'कंट्रोल बोर्ड पर जाएं',
          actionHref: '/overview',
        },
        products: {
          nav: 'प्रोडक्ट कैटलॉग',
          title: 'नया प्रोडक्ट कैसे जोड़ें और प्रबंधित करें?',
          desc: 'नया फॉर्मूला पंजीकृत करें और उसे वेबसाइट और वेयरहाउस के लिए तैयार करें।',
          points: [
            { step: '1', title: 'Products खोलें', detail: 'बाईं ओर के नेविगेशन मेनू में क्यूब/बॉक्स आइकन पर क्लिक करें।' },
            { step: '2', title: 'नया प्रोडक्ट शुरू करें', detail: 'ऊपर दाईं ओर नारंगी रंग के "+ New Product" बटन पर क्लिक करें।' },
            { step: '3', title: 'विवरण भरें', detail: 'प्रोडक्ट का नाम (जैसे: Trionyx Ceramic Quartz 9H), श्रेणी चुनें और स्टेटस "Active" रखें।' },
            { step: '4', title: 'विजिबिलिटी चुनें', detail: 'वेबसाइट पर दिखाने के लिए "Public" या केवल आंतरिक स्टूडियो उपयोग के लिए "Private" चुनें।' },
            { step: '5', title: 'सुरक्षित करें', detail: 'पेज के नीचे स्क्रॉल करें और "Create Product" बटन दबाएं।' },
          ],
          actionLabel: 'प्रोडक्ट कैटलॉग खोलें',
          actionHref: '/products',
        },
        warranty_policy: {
          nav: 'वारंटी पॉलिसी',
          title: 'प्रोडक्ट वारंटी पॉलिसी कैसे सेट करें?',
          desc: 'अनिवार्य नियम: पॉलिसी सेट किए बिना किसी भी सीरियल नंबर पर वारंटी पंजीकृत नहीं हो सकती।',
          points: [
            { step: '1', title: 'प्रोडक्ट चुनें', detail: 'Products पेज पर जाएं और संबंधित प्रोडक्ट के नाम पर क्लिक करें।' },
            { step: '2', title: 'Warranty Policy टैब', detail: 'टैब बार में 6वें टैब "Warranty Policy" पर क्लिक करें।' },
            { step: '3', title: 'Configure दबाएं', detail: '"Configure Warranty Policy" बटन पर क्लिक करें।' },
            { step: '4', title: 'अवधि दर्ज करें (महीने)', detail: 'वारंटी की कुल अवधि महीनों में लिखें (जैसे: 2 वर्ष के लिए 24, 3 वर्ष के लिए 36, 5 वर्ष के लिए 60)।' },
            { step: '5', title: 'Active करके सेव करें', detail: 'स्टेटस को "Active" रखें और "Save Policy" दबाएं। अब वारंटी सक्रिय की जा सकती है।' },
          ],
          actionLabel: 'पॉलिसी प्रबंधित करें',
          actionHref: '/products',
        },
        inventory: {
          nav: 'स्टॉक और सीरियल लेना',
          title: 'वेयरहाउस में नया स्टॉक दर्ज करना (Receive Inventory)',
          desc: 'वेयरहाउस में भौतिक बोतलों को सीरियल नंबर के साथ इनवर्ड करें।',
          points: [
            { step: '1', title: 'Inventory खोलें', detail: 'बाईं ओर मेनू में Inventory आइकन पर क्लिक करें।' },
            { step: '2', title: 'Receive Serials बटन', detail: 'ऊपर हरे रंग के "Receive Serials" बटन पर क्लिक करें (या प्रोडक्ट के आगे "+ In" दबाएं)।' },
            { step: '3', title: 'प्रोडक्ट और वेयरहाउस चुनें', detail: 'कौन सा प्रोडक्ट आया है और किस वेयरहाउस में रखा जाना है, उसे चुनें।' },
            { step: '4', title: 'सीरियल नंबर दर्ज करें', detail: 'सीरियल नंबर टाइप या पेस्ट करें (जैसे: TRX-CQ-2609-000001) या कैमरे से स्कैन करें। "Add" दबाएं।' },
            { step: '5', title: 'स्वीकार करें', detail: 'बैच नंबर लिखें और "Confirm Receipt" पर क्लिक करें। स्टॉक तुरंत अपडेट होगा।' },
          ],
          actionLabel: 'इन्वेंट्री रजिस्ट्री खोलें',
          actionHref: '/inventory',
        },
        transfers: {
          nav: 'स्टॉक ट्रांसफर',
          title: 'डिस्ट्रीब्यूटर्स और स्टूडियोज को स्टॉक भेजना',
          desc: 'वेयरहाउस से रीजनल डिस्ट्रीब्यूटर हब या अधिकृत स्टूडियो को स्टॉक ट्रांसफर करें।',
          points: [
            { step: '1', title: 'Transfer शुरू करें', detail: 'Inventory पेज पर ऊपर दिए गए "Transfer" बटन पर क्लिक करें।' },
            { step: '2', title: 'वर्तमान वेयरहाउस चुनें', detail: 'जहां माल रखा है उस वेयरहाउस को Source के रूप में चुनें।' },
            { step: '3', title: 'गंतव्य चुनें', detail: 'जिस डिस्ट्रीब्यूटर हब या डीलर स्टूडियो को स्टॉक भेजा जा रहा है, उसे चुनें।' },
            { step: '4', title: 'सीरियल नंबर दर्ज करें', detail: 'भेजे जाने वाले सीरियल नंबर स्कैन करें या दर्ज करें।' },
            { step: '5', title: 'ट्रांसफर पूरा करें', detail: '"Confirm Transfer" पर क्लिक करें। स्टॉक का स्थान तुरंत बदल जाएगा।' },
          ],
          actionLabel: 'इन्वेंट्री ट्रांसफर देखें',
          actionHref: '/inventory',
        },
        warranty_activation: {
          nav: 'वारंटी प्रबंधन',
          title: 'वारंटी की जांच और एक्टिवेशन करना',
          desc: 'सीरियल नंबर की प्रामाणिकता जांचें और ग्राहक के वाहन के लिए डिजिटल सर्टिफिकेट जारी करें।',
          points: [
            { step: '1', title: 'Warranty पेज खोलें', detail: 'बाईं ओर मेनू में शील्ड (Shield) आइकन पर क्लिक करें।' },
            { step: '2', title: 'सीरियल की स्थिति जांचें', detail: '"Check Serial" बॉक्स में सीरियल नंबर डालें और Check दबाएं।' },
            { step: '3', title: 'वारंटी एक्टिवेट करें', detail: 'ऊपर दाईं ओर "+ Activate Warranty" बटन पर क्लिक करें।' },
            { step: '4', title: 'विवरण भरें', detail: 'सीरियल नंबर, अधिकृत स्टूडियो और इंस्टॉलेशन की तारीख दर्ज करें।' },
            { step: '5', title: 'सक्रिय करें', detail: '"Activate Warranty" दबाएं। डिजिटल वारंटी सर्टिफिकेट तुरंत सक्रिय हो जाएगा।' },
          ],
          actionLabel: 'वारंटी रजिस्ट्री खोलें',
          actionHref: '/warranty',
        },
        appearance: {
          nav: 'अपीयरेंस और थीम्स',
          title: 'पोर्टल का रंग और थीम बदलना',
          desc: 'अपनी पसंद अनुसार डार्क मोड, लाइट मोड और थीम कलर्स सेट करें।',
          points: [
            { step: '1', title: 'Settings खोलें', detail: 'बाईं ओर मेनू के नीचे दिए गए सेटिंग्स/स्लाइडर्स आइकन पर क्लिक करें।' },
            { step: '2', title: 'मोड चुनें', detail: 'Dark (डार्क), Light (लाइट) या Match System चुनें।' },
            { step: '3', title: 'कलर थीम चुनें', detail: 'Ember (नारंगी), Plum, Rosewood, Moss (हरा), Slate या Mono में से चुनें।' },
            { step: '4', title: 'डेंसिटी', detail: 'कम्फर्टेबल या कॉम्पैक्ट व्यू चुनें।' },
          ],
          actionLabel: 'अपीयरेंस सेटिंग्स खोलें',
          actionHref: '/settings/appearance',
        },
      },
    },
  };

  const current = content[lang];
  const section = current.sections[activeSection];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Header with Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight m-0">
            {current.title}
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 m-0">
            {current.subtitle}
          </p>
        </div>

        {/* 3-Language Selector Buttons */}
        <div className="inline-flex items-center p-1 rounded-[6px] border border-[var(--border)] bg-[var(--surface-raised)] shrink-0 self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
              lang === 'en'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('te')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
              lang === 'te'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            తెలుగు
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-3 py-1.5 rounded-[4px] text-[12px] font-semibold transition-colors cursor-pointer ${
              lang === 'hi'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* 2. Topic Selector Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-4.5 no-scrollbar border-b border-[var(--border)] mb-2">
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
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs'
                  : 'bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
              }`}
            >
              {item.nav}
            </button>
          );
        })}
      </div>

      {/* 3. Active Section Guide Card */}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(23,23,20,0.03)] space-y-6 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--text-primary)] m-0">
              {section.title}
            </h2>
            <p className="text-[13.5px] text-[var(--text-secondary)] mt-1.5 m-0 leading-relaxed">
              {section.desc}
            </p>
          </div>
          <Link
            href={section.actionHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[var(--text-primary)] text-[var(--background)] hover:opacity-90 text-[12.5px] font-semibold transition-opacity shrink-0 shadow-xs"
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
              className="flex items-start gap-3.5 p-4 rounded-[6px] border border-[var(--border)] bg-[var(--background)] transition-colors hover:border-[var(--accent)]/50"
            >
              <div className="w-7 h-7 rounded-[4px] bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-[12px] flex items-center justify-center shrink-0">
                {pt.step}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
                  {pt.title}
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1 m-0 leading-relaxed">
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
