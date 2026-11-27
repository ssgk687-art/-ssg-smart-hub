(() => {
'use strict';

const $ = (id) => document.getElementById(id);
const on = (id, event, fn) => { const el=$(id); if(el) el.addEventListener(event, fn); };
const status = (id, message, error=false) => {
  const el=$(id); if(!el) return;
  el.dataset.originalMessage=message;
  el.textContent=typeof translateValue==='function'?translateValue(message,$('language')?.value||'en'):message;
  el.classList.toggle('error', !!error);
};
const bytes = (n) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(2)} MB`;
const downloadBlob = (blob, name) => {
  if(!(blob instanceof Blob)||!blob.size)return false;
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 60000);
};
const safeName = (name, suffix) => `${(name||'ssg-file').replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]/gi,'-').slice(0,60)||'ssg-file'}-${suffix}`;
const readImage = (file) => new Promise((resolve,reject)=>{
  if(!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) return reject(new Error('Please choose a JPG, PNG or WebP image.'));
  if(file.size>25*1024*1024) return reject(new Error('Image is larger than the 25 MB limit.'));
  const url=URL.createObjectURL(file), img=new Image();
  img.onload=()=>{ URL.revokeObjectURL(url); if(img.naturalWidth>6000||img.naturalHeight>6000||img.naturalWidth*img.naturalHeight>24000000){reject(new Error('Image dimensions exceed the safe 6000 px / 24 MP processing limit.'));return;} resolve(img); };
  img.onerror=()=>{ URL.revokeObjectURL(url); reject(new Error('The image could not be opened.')); };
  img.src=url;
});
const canvasBlob=(canvas,type='image/png',quality=.9)=>new Promise((resolve,reject)=>{
  canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not export this image format.')),type,quality);
});

// Navigation and tool directory
const cards=[...document.querySelectorAll('#toolGrid .tool-card')];
const allGrid=$('allToolGrid');
if(allGrid){
  cards.forEach(card=>{
    const clone=card.cloneNode(true);
    clone.addEventListener('click',()=>openTool(clone.dataset.tool));
    clone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTool(clone.dataset.tool);}});
    allGrid.appendChild(clone);
  });
}
function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${name}`));
  document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
  $('navlinks')?.classList.remove('open'); $('menuToggle')?.setAttribute('aria-expanded','false');
  window.scrollTo({top:0,behavior:'smooth'});
}
function openTool(name){
  showPage('home');
  document.querySelectorAll('.tool-view').forEach(v=>v.classList.toggle('active',v.id===`tool-${name}`));
  const v=$(`tool-${name}`); if(v) v.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
document.querySelectorAll('[data-footer-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.footerPage)));
$('brandHome')?.addEventListener('click',e=>{e.preventDefault();showPage('home');});
$('exploreBtn')?.addEventListener('click',()=>showPage('tools'));
$('imageBtn')?.addEventListener('click',()=>openTool('image'));
$('menuToggle')?.addEventListener('click',()=>{
  const nav=$('navlinks'), open=nav.classList.toggle('open');
  $('menuToggle').setAttribute('aria-expanded',String(open));
});
cards.forEach(card=>{
  card.addEventListener('click',()=>openTool(card.dataset.tool));
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTool(card.dataset.tool);}});
});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{
  const v=b.closest('.tool-view'); if(v) v.classList.remove('active');
}));
$('toolSearch')?.addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();
  cards.forEach(c=>c.classList.toggle('hidden',!(`${c.dataset.search} ${c.textContent}`.toLowerCase().includes(q))));
});
$('year').textContent=new Date().getFullYear();

// Basic UI translations for the main navigation and landing controls.
const translations={
  ur:{home:'صفحۂ اول',allTools:'تمام ٹولز',about:'ہمارے بارے میں',contact:'رابطہ',privacy:'رازداری',terms:'شرائط',
    eyebrow:'آپ کے روزمرہ ڈیجیٹل ٹولز',heroTitle:'ایک مرکز۔<br><span class="gradient">بہت سے اسمارٹ ٹولز۔</span>',
    heroText:'تصاویر، PDF، متن، QR کوڈ، رنگ اور روزمرہ کاموں کے لیے مفت اور آسان ٹولز۔',
    explore:'تمام ٹولز دیکھیں →',tryImage:'تصویر کے ٹولز آزمائیں',exploreLabel:'دریافت کریں',
    saveTime:'وقت بچانے والے ٹولز',chooseCategory:'شروع کرنے کے لیے ایک زمرہ منتخب کریں۔',
    imageTools:'تصویر کے ٹولز',imageDesc:'تصویر کا سائز بدلیں، کمپریس، کنورٹ اور ایڈٹ کریں۔',
    pdfTools:'PDF ٹولز',pdfDesc:'PDF دیکھیں، جوڑیں اور صفحات نکالیں۔',textTools:'متن کے ٹولز',
    textDesc:'الفاظ گنیں، حروف بدلیں اور متن صاف کریں۔',qrTools:'QR کوڈ',qrDesc:'QR کوڈ بنائیں اور ڈاؤن لوڈ کریں۔',
    colorTools:'رنگوں کے ٹولز',colorDesc:'HEX، RGB اور HSL تبدیل کریں۔',creatorTools:'کریئیٹر ٹولز',
    creatorDesc:'کیپشن اور ہیش ٹیگ کے آئیڈیاز بنائیں۔',webTools:'ویب یوٹیلٹیز',
    webDesc:'یونٹ تبدیل کریں، تاریخ اور متن کے ٹولز استعمال کریں۔',learning:'سیکھنے کا مرکز',
    learningDesc:'ٹولز استعمال کرنے کے لیے رہنما ہدایات۔'},
  hi:{home:'होम',allTools:'सभी टूल्स',about:'परिचय',contact:'संपर्क',privacy:'गोपनीयता',terms:'नियम',
    heroTitle:'एक हब।<br><span class="gradient">कई स्मार्ट टूल।</span>',eyebrow:'आपके रोज़मर्रा के डिजिटल टूल',heroText:'इमेज, PDF, टेक्स्ट, QR कोड, रंग और रोज़मर्रा के कामों के लिए मुफ़्त और आसान टूल।',
    explore:'सभी टूल देखें →',tryImage:'इमेज टूल आज़माएँ',exploreLabel:'खोजें',saveTime:'समय बचाने वाले टूल',
    chooseCategory:'शुरू करने के लिए एक श्रेणी चुनें।',imageTools:'इमेज टूल',imageDesc:'इमेज का आकार बदलें, कंप्रेस, कन्वर्ट और एडिट करें।',
    pdfTools:'PDF टूल',pdfDesc:'PDF देखें, जोड़ें और पेज निकालें।',textTools:'टेक्स्ट टूल',
    textDesc:'शब्द गिनें, केस बदलें और टेक्स्ट साफ़ करें।',qrTools:'QR कोड',qrDesc:'QR कोड बनाएँ और डाउनलोड करें.',
    colorTools:'कलर टूल',colorDesc:'HEX, RGB और HSL बदलें।',creatorTools:'क्रिएटर टूल',
    creatorDesc:'कैप्शन और हैशटैग के सुझाव बनाएँ।',webTools:'वेब यूटिलिटी',
    webDesc:'यूनिट, तारीख और टेक्स्ट टूल इस्तेमाल करें।',learning:'लर्निंग सेंटर',
    learningDesc:'टूल इस्तेमाल करने के लिए गाइड।'}
};

// Full interface translation layer for English, Urdu and Hindi.
const uiText = {
  ur: {
    'Menu':'مینو','Close':'بند کریں','Search tools...':'ٹولز تلاش کریں...','All SSG SMART HUB Tools':'SSG SMART HUB کے تمام ٹولز',
    'Select any category to open its tools.':'ٹولز کھولنے کے لیے کوئی زمرہ منتخب کریں۔','Image Tools':'امیج ٹولز','PDF Tools':'پی ڈی ایف ٹولز','Text Tools':'ٹیکسٹ ٹولز','QR Code':'کیو آر کوڈ','Color Tools':'رنگوں کے ٹولز','Creator Tools':'کریئیٹر ٹولز','Web Utilities':'ویب یوٹیلٹیز','Learning Center':'سیکھنے کا مرکز',
    'Resize':'سائز تبدیل کریں','Compress':'کمپریس کریں','Convert':'فارمیٹ تبدیل کریں','Crop':'کراپ کریں','Manual Background Editor':'پس منظر ایڈیٹر','Choose an image':'تصویر منتخب کریں','1. Choose an image':'1۔ تصویر منتخب کریں','2. Adjust and export':'2۔ تبدیلی اور ایکسپورٹ','Upload JPG, PNG or WebP (max 25 MB)':'JPG، PNG یا WebP اپ لوڈ کریں (زیادہ سے زیادہ 25 MB)','Keep aspect ratio':'تناسب برقرار رکھیں','Output format':'آؤٹ پٹ فارمیٹ','Quality (JPG/WebP)':'کوالٹی (JPG/WebP)','Process Image':'تصویر تیار کریں','Download image':'تصویر ڈاؤن لوڈ کریں','Erase Brush':'مٹانے والا برش','Restore Brush':'بحال کرنے والا برش','Brush size':'برش کا سائز','Reset Zoom':'زوم ری سیٹ کریں','Undo':'واپس کریں','Redo':'دوبارہ کریں','Background color':'پس منظر کا رنگ','Apply color':'رنگ لگائیں','Or upload background image':'یا پس منظر کی تصویر اپ لوڈ کریں','Download transparent PNG':'شفاف PNG ڈاؤن لوڈ کریں','Download JPG':'JPG ڈاؤن لوڈ کریں',
    'PDF information':'پی ڈی ایف معلومات','Merge PDFs':'پی ڈی ایف فائلیں جوڑیں','Extract pages':'صفحات نکالیں','Open / Print PDF':'پی ڈی ایف کھولیں / پرنٹ کریں','Choose PDF files':'پی ڈی ایف فائلیں منتخب کریں','Merge selected PDFs':'منتخب پی ڈی ایف جوڑیں','Page numbers':'صفحہ نمبر','Extract selected pages':'منتخب صفحات نکالیں','Choose a PDF':'پی ڈی ایف منتخب کریں',
    'Word counter':'الفاظ گنیں','Uppercase':'بڑے حروف','lowercase':'چھوٹے حروف','Title Case':'ہر لفظ کا پہلا حرف بڑا','Clean text':'متن صاف کریں','Clear':'صاف کریں','Copy':'کاپی کریں','Download text':'متن ڈاؤن لوڈ کریں','Generate QR code':'کیو آر کوڈ بنائیں','Download QR':'کیو آر ڈاؤن لوڈ کریں','Color picker':'رنگ منتخب کریں','Copy HEX':'HEX کاپی کریں','Caption ideas':'کیپشن تجاویز','Hashtag ideas':'ہیش ٹیگ تجاویز','Generate caption':'کیپشن بنائیں','Generate hashtags':'ہیش ٹیگ بنائیں','Topic, product or post idea':'موضوع، پروڈکٹ یا پوسٹ کا خیال','Unit converter':'اکائی تبدیل کریں','Date calculator':'تاریخ کیلکولیٹر','Convert units':'اکائیاں تبدیل کریں','Calculate date difference':'تاریخوں کا فرق معلوم کریں','Add days to date':'تاریخ میں دن شامل کریں','Reverse text':'متن الٹا کریں','Sort lines':'سطریں ترتیب دیں','Remove duplicate lines':'دہرائی گئی سطریں ہٹائیں',
    'About SSG SMART HUB':'SSG SMART HUB کے بارے میں','Simple tools for everyday digital tasks':'روزمرہ ڈیجیٹل کاموں کے لیے آسان ٹولز','Contact SSG SMART HUB':'SSG SMART HUB سے رابطہ','Privacy Policy':'رازداری کی پالیسی','Terms & Conditions':'شرائط و ضوابط','Disclaimer':'وضاحتی نوٹس','Cookie Policy':'کوکی پالیسی','Last updated: 26 November 2026':'آخری تازہ کاری: 26 نومبر 2026',
    'Choose an image first.':'پہلے تصویر منتخب کریں۔','Choose a PDF first.':'پہلے پی ڈی ایف منتخب کریں۔','Copied.':'کاپی ہو گیا۔','Text cleared.':'متن صاف کر دیا گیا۔','QR code generated.':'کیو آر کوڈ بن گیا۔','Image loaded.':'تصویر لوڈ ہو گئی۔','Image is ready.':'تصویر تیار ہے۔','Enter a valid number.':'درست عدد درج کریں۔','Choose both dates.':'دونوں تاریخیں منتخب کریں۔','Nothing more to undo.':'مزید واپس کرنے کے لیے کچھ نہیں۔','Nothing to redo.':'دوبارہ کرنے کے لیے کچھ نہیں۔'
  },
  hi: {
    'Menu':'मेनू','Close':'बंद करें','Search tools...':'टूल खोजें...','All SSG SMART HUB Tools':'SSG SMART HUB के सभी टूल','Select any category to open its tools.':'टूल खोलने के लिए कोई श्रेणी चुनें।','Image Tools':'इमेज टूल','PDF Tools':'PDF टूल','Text Tools':'टेक्स्ट टूल','QR Code':'QR कोड','Color Tools':'कलर टूल','Creator Tools':'क्रिएटर टूल','Web Utilities':'वेब यूटिलिटी','Learning Center':'लर्निंग सेंटर',
    'Resize':'आकार बदलें','Compress':'कंप्रेस करें','Convert':'कन्वर्ट करें','Crop':'क्रॉप करें','Manual Background Editor':'मैनुअल बैकग्राउंड एडिटर','Choose an image':'इमेज चुनें','1. Choose an image':'1. इमेज चुनें','2. Adjust and export':'2. बदलाव करें और एक्सपोर्ट करें','Upload JPG, PNG or WebP (max 25 MB)':'JPG, PNG या WebP अपलोड करें (अधिकतम 25 MB)','Keep aspect ratio':'अनुपात बनाए रखें','Output format':'आउटपुट फॉर्मेट','Quality (JPG/WebP)':'क्वालिटी (JPG/WebP)','Process Image':'इमेज प्रोसेस करें','Download image':'इमेज डाउनलोड करें','Erase Brush':'मिटाने वाला ब्रश','Restore Brush':'वापस लाने वाला ब्रश','Brush size':'ब्रश का आकार','Reset Zoom':'ज़ूम रीसेट करें','Undo':'पूर्ववत करें','Redo':'फिर से करें','Background color':'बैकग्राउंड रंग','Apply color':'रंग लागू करें','Or upload background image':'या बैकग्राउंड इमेज अपलोड करें','Download transparent PNG':'पारदर्शी PNG डाउनलोड करें','Download JPG':'JPG डाउनलोड करें',
    'PDF information':'PDF जानकारी','Merge PDFs':'PDF जोड़ें','Extract pages':'पेज निकालें','Open / Print PDF':'PDF खोलें / प्रिंट करें','Choose PDF files':'PDF फाइलें चुनें','Merge selected PDFs':'चुनी हुई PDF जोड़ें','Page numbers':'पेज नंबर','Extract selected pages':'चुने हुए पेज निकालें','Choose a PDF':'PDF चुनें',
    'Word counter':'शब्द गणना','Uppercase':'बड़े अक्षर','lowercase':'छोटे अक्षर','Title Case':'हर शब्द का पहला अक्षर बड़ा','Clean text':'टेक्स्ट साफ करें','Clear':'साफ करें','Copy':'कॉपी करें','Download text':'टेक्स्ट डाउनलोड करें','Generate QR code':'QR कोड बनाएं','Download QR':'QR डाउनलोड करें','Color picker':'रंग चुनें','Copy HEX':'HEX कॉपी करें','Caption ideas':'कैप्शन सुझाव','Hashtag ideas':'हैशटैग सुझाव','Generate caption':'कैप्शन बनाएं','Generate hashtags':'हैशटैग बनाएं','Topic, product or post idea':'विषय, उत्पाद या पोस्ट का विचार','Unit converter':'यूनिट कन्वर्टर','Date calculator':'तारीख कैलकुलेटर','Convert units':'यूनिट बदलें','Calculate date difference':'तारीखों का अंतर निकालें','Add days to date':'तारीख में दिन जोड़ें','Reverse text':'टेक्स्ट उल्टा करें','Sort lines':'लाइनें क्रम में लगाएं','Remove duplicate lines':'डुप्लिकेट लाइनें हटाएं',
    'About SSG SMART HUB':'SSG SMART HUB के बारे में','Simple tools for everyday digital tasks':'रोज़मर्रा के डिजिटल कामों के आसान टूल','Contact SSG SMART HUB':'SSG SMART HUB से संपर्क','Privacy Policy':'गोपनीयता नीति','Terms & Conditions':'नियम और शर्तें','Disclaimer':'अस्वीकरण','Cookie Policy':'कुकी नीति','Last updated: 26 November 2026':'अंतिम अपडेट: 26 नवंबर 2026',
    'Choose an image first.':'पहले इमेज चुनें।','Choose a PDF first.':'पहले PDF चुनें।','Copied.':'कॉपी हो गया।','Text cleared.':'टेक्स्ट साफ हो गया।','QR code generated.':'QR कोड बन गया।','Image loaded.':'इमेज लोड हो गई।','Image is ready.':'इमेज तैयार है।','Enter a valid number.':'मान्य संख्या दर्ज करें।','Choose both dates.':'दोनों तारीखें चुनें।','Nothing more to undo.':'अब और पूर्ववत करने के लिए कुछ नहीं।','Nothing to redo.':'फिर से करने के लिए कुछ नहीं।'
  }
};
// Expanded tool-interface dictionaries so the working controls are localized, not only the home screen.
Object.assign(uiText.ur,{
 'Main navigation':'مرکزی نیویگیشن','Language':'زبان','Tool directory':'ٹولز کی فہرست','Your image preview will appear here.':'آپ کی تصویر کا پیش منظر یہاں دکھائی دے گا۔','Processed image will appear here.':'تیار شدہ تصویر یہاں دکھائی دے گی۔','Width (px)':'چوڑائی (پکسل)','Height (px)':'اونچائی (پکسل)','Quality:':'کوالٹی:','Maximum width (optional)':'زیادہ سے زیادہ چوڑائی (اختیاری)','e.g. 1600':'مثلاً 1600','Crop by entering the rectangle position and size in pixels.':'کراپ کرنے کے لیے مستطیل کی جگہ اور سائز پکسل میں درج کریں۔','Choose image for background editing':'پس منظر کی تدوین کے لیے تصویر منتخب کریں','Remove replacement background':'متبادل پس منظر ہٹائیں','Choose an image to begin.':'شروع کرنے کے لیے تصویر منتخب کریں۔','Image dimensions are too large for safe browser processing (maximum 24 megapixels).':'تصویر کے ابعاد براؤزر میں محفوظ عمل کاری کے لیے بہت بڑے ہیں (زیادہ سے زیادہ 24 میگا پکسلز)۔','PDF Tools':'پی ڈی ایف ٹولز','Read PDF Info':'پی ڈی ایف کی معلومات پڑھیں','Choose a PDF to inspect it.':'جائزے کے لیے پی ڈی ایف منتخب کریں۔','Merge PDF files':'پی ڈی ایف فائلیں جوڑیں','Merge & Download':'جوڑیں اور ڈاؤن لوڈ کریں','Extract pages':'صفحات نکالیں','Page numbers (e.g. 1,3,5-7)':'صفحہ نمبر (مثلاً 1,3,5-7)','Extract selected pages':'منتخب صفحات نکالیں','Open / Print PDF':'پی ڈی ایف کھولیں / پرنٹ کریں','Open PDF':'پی ڈی ایف کھولیں','Word counter':'الفاظ کی گنتی','Enter or paste your text here...':'اپنا متن یہاں لکھیں یا پیسٹ کریں...','Uppercase':'بڑے حروف','lowercase':'چھوٹے حروف','Title Case':'ہر لفظ کا پہلا حرف بڑا','Clean text':'متن صاف کریں','Clear':'صاف کریں','Copy':'کاپی کریں','Download text':'متن ڈاؤن لوڈ کریں','Generate QR code':'کیو آر کوڈ بنائیں','Enter text or a URL':'متن یا ویب لنک درج کریں','QR size':'کیو آر سائز','Download QR':'کیو آر ڈاؤن لوڈ کریں','Color picker':'رنگ منتخب کریں','Copy HEX':'HEX کاپی کریں','Caption ideas':'کیپشن تجاویز','Hashtag ideas':'ہیش ٹیگ تجاویز','Topic, product or post idea':'موضوع، پروڈکٹ یا پوسٹ کا خیال','Tone':'انداز','Generate caption':'کیپشن بنائیں','Generate hashtags':'ہیش ٹیگ بنائیں','Caption ideas will appear here.':'کیپشن تجاویز یہاں ظاہر ہوں گی۔','Hashtags will appear here.':'ہیش ٹیگز یہاں ظاہر ہوں گے۔','Unit Converter':'اکائیوں کا مبدل','Value':'قدر','Convert':'تبدیل کریں','to':'کو','Date Calculator':'تاریخ کیلکولیٹر','Start date':'ابتدائی تاریخ','End date':'آخری تاریخ','Calculate difference':'فرق معلوم کریں','Choose two dates.':'دو تاریخیں منتخب کریں۔','Add days to a date':'تاریخ میں دن شامل کریں','Calculate new date':'نئی تاریخ معلوم کریں','Text utilities':'متن کے ٹولز','Enter text':'متن درج کریں','Reverse text':'متن الٹا کریں','Sort lines A–Z':'سطریں الف سے ی تک ترتیب دیں','Remove duplicate lines':'دہرائی گئی سطریں ہٹائیں','Result appears here.':'نتیجہ یہاں ظاہر ہوگا۔','Simple tools for everyday digital tasks':'روزمرہ ڈیجیٹل کاموں کے لیے آسان ٹولز','Our approach':'ہمارا طریقۂ کار','About':'تعارف','Contact':'رابطہ','Privacy':'رازداری','Terms':'شرائط','Disclaimer':'وضاحتی نوٹس','Cookie Policy':'کوکی پالیسی','No user account or profile required.':'صارف اکاؤنٹ یا پروفائل درکار نہیں۔','Some features load open-source libraries from public CDNs and may require an internet connection.':'کچھ خصوصیات عوامی CDN سے اوپن سورس لائبریریاں لوڈ کرتی ہیں اور انٹرنیٹ درکار ہو سکتا ہے۔','Smart Tools. Smarter You!':'اسمارٹ ٹولز، بہتر آپ!','Tool directory':'ٹولز کی فہرست','All SSG SMART HUB Tools':'SSG SMART HUB کے تمام ٹولز'
});
Object.assign(uiText.hi,{
 'Main navigation':'मुख्य नेविगेशन','Language':'भाषा','Tool directory':'टूल निर्देशिका','Your image preview will appear here.':'आपकी इमेज का प्रीव्यू यहां दिखेगा।','Processed image will appear here.':'प्रोसेस की गई इमेज यहां दिखेगी।','Width (px)':'चौड़ाई (पिक्सेल)','Height (px)':'ऊंचाई (पिक्सेल)','Quality:':'क्वालिटी:','Maximum width (optional)':'अधिकतम चौड़ाई (वैकल्पिक)','e.g. 1600':'जैसे 1600','Crop by entering the rectangle position and size in pixels.':'क्रॉप करने के लिए आयत की स्थिति और आकार पिक्सेल में दर्ज करें।','Choose image for background editing':'बैकग्राउंड संपादन के लिए इमेज चुनें','Remove replacement background':'वैकल्पिक बैकग्राउंड हटाएं','Choose an image to begin.':'शुरू करने के लिए इमेज चुनें।','Image dimensions are too large for safe browser processing (maximum 24 megapixels).':'इमेज के आयाम ब्राउज़र में सुरक्षित प्रोसेसिंग के लिए बहुत बड़े हैं (अधिकतम 24 मेगापिक्सेल)।','PDF Tools':'PDF टूल','Read PDF Info':'PDF जानकारी पढ़ें','Choose a PDF to inspect it.':'जांचने के लिए PDF चुनें।','Merge PDF files':'PDF फाइलें जोड़ें','Merge & Download':'जोड़ें और डाउनलोड करें','Extract pages':'पेज निकालें','Page numbers (e.g. 1,3,5-7)':'पेज नंबर (जैसे 1,3,5-7)','Extract selected pages':'चुने हुए पेज निकालें','Open / Print PDF':'PDF खोलें / प्रिंट करें','Open PDF':'PDF खोलें','Word counter':'शब्द गणना','Enter or paste your text here...':'अपना टेक्स्ट यहां लिखें या पेस्ट करें...','Uppercase':'बड़े अक्षर','lowercase':'छोटे अक्षर','Title Case':'हर शब्द का पहला अक्षर बड़ा','Clean text':'टेक्स्ट साफ करें','Clear':'साफ करें','Copy':'कॉपी करें','Download text':'टेक्स्ट डाउनलोड करें','Generate QR code':'QR कोड बनाएं','Enter text or a URL':'टेक्स्ट या URL दर्ज करें','QR size':'QR आकार','Download QR':'QR डाउनलोड करें','Color picker':'रंग चुनें','Copy HEX':'HEX कॉपी करें','Caption ideas':'कैप्शन सुझाव','Hashtag ideas':'हैशटैग सुझाव','Topic, product or post idea':'विषय, उत्पाद या पोस्ट का विचार','Tone':'शैली','Generate caption':'कैप्शन बनाएं','Generate hashtags':'हैशटैग बनाएं','Caption ideas will appear here.':'कैप्शन सुझाव यहां दिखाई देंगे।','Hashtags will appear here.':'हैशटैग यहां दिखाई देंगे।','Unit Converter':'यूनिट कन्वर्टर','Value':'मान','Convert':'कन्वर्ट करें','to':'में','Date Calculator':'तारीख कैलकुलेटर','Start date':'शुरुआती तारीख','End date':'अंतिम तारीख','Calculate difference':'अंतर निकालें','Choose two dates.':'दो तारीखें चुनें।','Add days to a date':'तारीख में दिन जोड़ें','Calculate new date':'नई तारीख निकालें','Text utilities':'टेक्स्ट टूल','Enter text':'टेक्स्ट दर्ज करें','Reverse text':'टेक्स्ट उल्टा करें','Sort lines A–Z':'लाइनें A–Z क्रम में लगाएं','Remove duplicate lines':'दोहराई गई लाइनें हटाएं','Result appears here.':'परिणाम यहां दिखाई देगा।','Simple tools for everyday digital tasks':'रोज़मर्रा के डिजिटल कामों के आसान टूल','Our approach':'हमारा तरीका','About':'परिचय','Contact':'संपर्क','Privacy':'गोपनीयता','Terms':'शर्तें','Disclaimer':'अस्वीकरण','Cookie Policy':'कुकी नीति','No user account or profile required.':'यूज़र अकाउंट या प्रोफाइल की आवश्यकता नहीं।','Some features load open-source libraries from public CDNs and may require an internet connection.':'कुछ सुविधाएं सार्वजनिक CDN से ओपन-सोर्स लाइब्रेरी लोड करती हैं और इंटरनेट की आवश्यकता हो सकती है।','Smart Tools. Smarter You!':'स्मार्ट टूल, बेहतर आप!','Tool directory':'टूल निर्देशिका','All SSG SMART HUB Tools':'SSG SMART HUB के सभी टूल'
});
// Legal pages, learning guide and common validation messages are also localized.
Object.assign(uiText.ur,{
 'Compress an image':'تصویر کمپریس کریں','Open Image Tools → Compress.':'امیج ٹولز کھولیں → کمپریس منتخب کریں۔','Select an image from your device.':'اپنے آلے سے تصویر منتخب کریں۔','Choose quality and optional maximum width.':'کوالٹی اور اختیاری زیادہ سے زیادہ چوڑائی منتخب کریں۔','Process and download the result.':'تصویر تیار کرکے نتیجہ ڈاؤن لوڈ کریں۔','Edit an image background':'تصویر کا پس منظر تبدیل کریں','Open Image Tools → Manual Background Editor.':'امیج ٹولز کھولیں → مینوئل بیک گراؤنڈ ایڈیٹر منتخب کریں۔','Upload an image and choose Erase Brush.':'تصویر اپ لوڈ کریں اور مٹانے والا برش منتخب کریں۔','Paint over areas to make them transparent.':'جن حصوں کو شفاف بنانا ہو ان پر برش چلائیں۔','Use Restore, Undo and Redo to correct edits.':'درستگی کے لیے بحال، واپس اور دوبارہ کے بٹن استعمال کریں۔','Add a color or background image, then download.':'رنگ یا پس منظر کی تصویر شامل کریں، پھر ڈاؤن لوڈ کریں۔','Create a QR code':'QR کوڈ بنائیں','Enter text or a full website address.':'متن یا مکمل ویب سائٹ کا پتہ درج کریں۔','Choose a size and generate the code.':'سائز منتخب کرکے کوڈ بنائیں۔','Download PNG and test it with your phone camera.':'PNG ڈاؤن لوڈ کریں اور فون کیمرے سے اسے چیک کریں۔','Close the tab after using private files, especially on shared devices.':'نجی فائلیں استعمال کرنے کے بعد ٹیب بند کردیں، خاص طور پر مشترکہ ڈیوائس پر۔','Use page numbers such as 1,3,5-7 to extract selected pages. Choose merge files in the desired order. Keep original copies of important documents.':'منتخب صفحات نکالنے کے لیے 1,3,5-7 جیسے نمبر درج کریں۔ فائلیں جوڑتے وقت مطلوبہ ترتیب منتخب کریں۔ اہم دستاویزات کی اصل نقول محفوظ رکھیں۔','SSG SMART HUB brings useful everyday utilities together in one clean, mobile-friendly place. Our goal is to make common tasks easy, fast and accessible without requiring an account.':'SSG SMART HUB روزمرہ کے مفید ٹولز کو ایک صاف اور موبائل دوست جگہ پر یکجا کرتا ہے۔ ہمارا مقصد عام کاموں کو اکاؤنٹ کے بغیر آسان، تیز اور قابلِ رسائی بنانا ہے۔','Browser-based processing wherever practical.':'جہاں ممکن ہو عمل کاری براؤزر کے اندر ہوتی ہے۔','No user account or profile required.':'صارف اکاؤنٹ یا پروفائل درکار نہیں۔','Clear tools with simple controls.':'سادہ کنٹرولز کے ساتھ واضح ٹولز۔','Responsive experience for phones, tablets and computers.':'فون، ٹیبلٹ اور کمپیوٹر کے لیے موزوں تجربہ۔','For support, please use the official contact details published by the site owner. The site owner must add and verify a monitored support email address before public launch. Do not publish placeholder contact details.':'مدد کے لیے ویب سائٹ کے مالک کی شائع کردہ سرکاری رابطہ معلومات استعمال کریں۔ عوامی اجرا سے پہلے مالک کو فعال اور تصدیق شدہ سپورٹ ای میل شامل کرنا ہوگی۔ فرضی رابطہ معلومات شائع نہ کریں۔','This static version does not transmit or store contact messages.':'اس جامد ورژن میں رابطے کے پیغامات نہ بھیجے جاتے ہیں اور نہ محفوظ کیے جاتے ہیں۔','SSG SMART HUB does not require accounts or personal profiles to use its browser tools.':'SSG SMART HUB کے براؤزر ٹولز استعمال کرنے کے لیے اکاؤنٹ یا ذاتی پروفائل درکار نہیں۔','Files and text':'فائلیں اور متن','Image, text and PDF tools are designed to process selected content in your browser. Files are processed locally in your browser by the tools in this build; the site does not send selected file contents to an SSG application server. Do not use a shared device for sensitive documents and close the tab when finished.':'تصویر، متن اور PDF ٹولز منتخب مواد کو آپ کے براؤزر میں پراسیس کرنے کے لیے بنائے گئے ہیں۔ اس ورژن کے ٹولز فائلوں کو مقامی طور پر براؤزر میں پراسیس کرتے ہیں؛ ویب سائٹ منتخب فائلوں کا مواد SSG ایپلیکیشن سرور کو نہیں بھیجتی۔ حساس دستاویزات کے لیے مشترکہ ڈیوائس استعمال نہ کریں اور کام مکمل ہونے پر ٹیب بند کردیں۔','Third-party services':'تھرڈ پارٹی سروسز','Some tools load open-source libraries from public CDN providers. Those providers may receive standard technical request information, such as IP address and browser details, when resources are requested. Their own privacy terms apply.':'کچھ ٹولز عوامی CDN فراہم کنندگان سے اوپن سورس لائبریریاں لوڈ کرتے ہیں۔ وسائل کی درخواست کے وقت ان فراہم کنندگان کو عام تکنیکی معلومات، مثلاً IP ایڈریس اور براؤزر کی تفصیلات موصول ہوسکتی ہیں۔ ان کی اپنی رازداری کی شرائط لاگو ہوں گی۔','Cookies and analytics':'کوکیز اور تجزیات','This build contains no advertising or analytics code and does not intentionally set tracking cookies. If analytics, advertising, forms or other services are introduced, this policy must be reviewed and updated before activation.':'اس ورژن میں اشتہارات یا تجزیاتی کوڈ شامل نہیں اور جان بوجھ کر ٹریکنگ کوکیز استعمال نہیں کی جاتیں۔ اگر تجزیات، اشتہارات، فارم یا دیگر سروسز شامل کی جائیں تو فعال کرنے سے پہلے اس پالیسی کا جائزہ لے کر اسے اپ ڈیٹ کرنا ہوگا۔','The site owner must publish a monitored support contact before launch. This policy is a starter template and must be checked against the actual hosting, analytics, advertising and applicable local legal requirements.':'اجرا سے پہلے ویب سائٹ کے مالک کو فعال سپورٹ رابطہ شائع کرنا ہوگا۔ یہ پالیسی ابتدائی نمونہ ہے؛ اسے اصل ہوسٹنگ، تجزیات، اشتہارات اور مقامی قانونی تقاضوں کے مطابق جانچنا ضروری ہے۔','Use SSG SMART HUB lawfully and responsibly. Tools are provided for general convenience and may change as the site is improved.':'SSG SMART HUB کو قانون کے مطابق اور ذمہ داری سے استعمال کریں۔ ٹولز عمومی سہولت کے لیے فراہم کیے گئے ہیں اور ویب سائٹ بہتر ہونے کے ساتھ تبدیل ہوسکتے ہیں۔','No warranty':'کوئی ضمانت نہیں','The website and tools are provided “as is” and “as available”. Uninterrupted operation, accuracy or suitability for a particular purpose is not guaranteed.':'ویب سائٹ اور ٹولز موجودہ حالت اور دستیابی کے مطابق فراہم کیے جاتے ہیں۔ مسلسل دستیابی، درستگی یا کسی خاص مقصد کے لیے موزونیت کی ضمانت نہیں دی جاتی۔','Your responsibility':'آپ کی ذمہ داری','Keep backups of important files and verify outputs before relying on them. Do not use the website to violate laws or others\' rights. You are responsible for ensuring you have rights to any files you process.':'اہم فائلوں کی نقول محفوظ رکھیں اور نتائج پر انحصار کرنے سے پہلے ان کی تصدیق کریں۔ قوانین یا دوسروں کے حقوق کی خلاف ورزی کے لیے ویب سائٹ استعمال نہ کریں۔ پراسیس کی جانے والی فائلوں کے حقوق کی تصدیق آپ کی ذمہ داری ہے۔','Availability':'دستیابی','Some functions depend on browser support and third-party libraries. Features may not work offline or in every browser.':'کچھ افعال براؤزر کی معاونت اور تھرڈ پارٹی لائبریریوں پر منحصر ہیں۔ تمام خصوصیات آف لائن یا ہر براؤزر میں کام نہیں کرسکتیں۔','Tools are provided for general productivity purposes. Results may vary by browser, device, file format and input. Verify important outputs independently. The website does not provide professional legal, financial, medical or other regulated advice.':'ٹولز عمومی پیداواری کاموں کے لیے فراہم کیے گئے ہیں۔ نتائج براؤزر، ڈیوائس، فائل فارمیٹ اور ان پٹ کے لحاظ سے مختلف ہوسکتے ہیں۔ اہم نتائج کی خود تصدیق کریں۔ ویب سائٹ پیشہ ورانہ قانونی، مالی، طبی یا دیگر ضابطہ بند مشورہ فراہم نہیں کرتی۔','This static build does not intentionally set advertising or analytics cookies. Third-party libraries may make standard network requests. This policy must be reviewed if tracking, advertising, analytics or embedded third-party services are introduced.':'اس جامد ورژن میں جان بوجھ کر اشتہاری یا تجزیاتی کوکیز استعمال نہیں کی جاتیں۔ تھرڈ پارٹی لائبریریاں عام نیٹ ورک درخواستیں کرسکتی ہیں۔ ٹریکنگ، اشتہارات، تجزیات یا ایمبیڈڈ تھرڈ پارٹی سروسز شامل ہونے پر اس پالیسی کا جائزہ لینا ہوگا۔','Unsupported image. Choose JPG, PNG or WebP.':'غیر معاون تصویر۔ JPG، PNG یا WebP منتخب کریں۔','Image exceeds 25 MB. Choose a smaller file.':'تصویر 25 MB سے بڑی ہے۔ چھوٹی فائل منتخب کریں۔','Image could not be decoded. It may be damaged.':'تصویر نہیں کھل سکی۔ ممکن ہے فائل خراب ہو۔','Canvas is unavailable in this browser.':'اس براؤزر میں Canvas دستیاب نہیں۔','Enter dimensions from 1 to 6000 pixels.':'1 سے 6000 پکسل تک ابعاد درج کریں۔','Crop rectangle must be inside the original image.':'کراپ کا مستطیل اصل تصویر کے اندر ہونا چاہیے۔','Enter a valid maximum width (1–6000).':'زیادہ سے زیادہ چوڑائی 1 سے 6000 کے درمیان درج کریں۔','QR library did not load. Check your internet connection.':'QR لائبریری لوڈ نہیں ہوئی۔ انٹرنیٹ کنکشن چیک کریں۔','Enter text or a URL first.':'پہلے متن یا URL درج کریں۔','Please keep QR content under 2,000 characters.':'QR مواد 2,000 حروف سے کم رکھیں۔','Could not generate this QR code.':'یہ QR کوڈ نہیں بن سکا۔','The selected PDFs exceed the 80 MB combined processing limit. Choose fewer or smaller files.':'منتخب PDF فائلیں 80 MB کی مجموعی حد سے زیادہ ہیں۔ کم یا چھوٹی فائلیں منتخب کریں۔','Could not merge PDFs. Check files, encryption, available memory and internet connection.':'PDF فائلیں نہیں جڑ سکیں۔ فائلیں، انکرپشن، دستیاب میموری اور انٹرنیٹ چیک کریں۔','Enter two real calendar dates.':'دو درست کیلنڈر تاریخیں درج کریں۔','Choose a real calendar date and enter a whole number of days (within ±100,000).':'درست کیلنڈر تاریخ اور دنوں کی مکمل تعداد درج کریں (±100,000 کے اندر)۔'
});
Object.assign(uiText.hi,{
 'Compress an image':'इमेज कंप्रेस करें','Open Image Tools → Compress.':'इमेज टूल खोलें → कंप्रेस चुनें।','Select an image from your device.':'अपने डिवाइस से इमेज चुनें।','Choose quality and optional maximum width.':'क्वालिटी और वैकल्पिक अधिकतम चौड़ाई चुनें।','Process and download the result.':'इमेज प्रोसेस करके परिणाम डाउनलोड करें।','Edit an image background':'इमेज का बैकग्राउंड संपादित करें','Open Image Tools → Manual Background Editor.':'इमेज टूल खोलें → मैनुअल बैकग्राउंड एडिटर चुनें।','Upload an image and choose Erase Brush.':'इमेज अपलोड करें और इरेज़ ब्रश चुनें।','Paint over areas to make them transparent.':'जिन हिस्सों को पारदर्शी बनाना है उन पर ब्रश चलाएं।','Use Restore, Undo and Redo to correct edits.':'सुधार के लिए रिस्टोर, अनडू और रीडू का उपयोग करें।','Add a color or background image, then download.':'रंग या बैकग्राउंड इमेज जोड़ें, फिर डाउनलोड करें।','Create a QR code':'QR कोड बनाएं','Enter text or a full website address.':'टेक्स्ट या वेबसाइट का पूरा पता दर्ज करें।','Choose a size and generate the code.':'आकार चुनें और कोड बनाएं।','Download PNG and test it with your phone camera.':'PNG डाउनलोड करें और फोन कैमरे से जांचें।','Close the tab after using private files, especially on shared devices.':'निजी फाइलें उपयोग करने के बाद टैब बंद करें, खासकर साझा डिवाइस पर।','Use page numbers such as 1,3,5-7 to extract selected pages. Choose merge files in the desired order. Keep original copies of important documents.':'चुने हुए पेज निकालने के लिए 1,3,5-7 जैसे नंबर दर्ज करें। PDF जोड़ते समय फाइलों का क्रम चुनें। महत्वपूर्ण दस्तावेज़ों की मूल प्रतियां सुरक्षित रखें।','SSG SMART HUB brings useful everyday utilities together in one clean, mobile-friendly place. Our goal is to make common tasks easy, fast and accessible without requiring an account.':'SSG SMART HUB रोज़मर्रा के उपयोगी टूल को एक साफ और मोबाइल-फ्रेंडली जगह पर लाता है। हमारा लक्ष्य बिना अकाउंट के सामान्य कामों को आसान, तेज़ और सुलभ बनाना है।','Browser-based processing wherever practical.':'जहां संभव हो, प्रोसेसिंग ब्राउज़र में होती है।','No user account or profile required.':'यूज़र अकाउंट या प्रोफाइल की आवश्यकता नहीं।','Clear tools with simple controls.':'सरल कंट्रोल वाले स्पष्ट टूल।','Responsive experience for phones, tablets and computers.':'फोन, टैबलेट और कंप्यूटर के लिए अनुकूल अनुभव।','For support, please use the official contact details published by the site owner. The site owner must add and verify a monitored support email address before public launch. Do not publish placeholder contact details.':'सहायता के लिए साइट मालिक द्वारा प्रकाशित आधिकारिक संपर्क विवरण का उपयोग करें। सार्वजनिक लॉन्च से पहले मालिक को सक्रिय और सत्यापित सपोर्ट ईमेल जोड़ना होगा। नकली संपर्क विवरण प्रकाशित न करें।','This static version does not transmit or store contact messages.':'यह स्थिर संस्करण संपर्क संदेश न भेजता है और न संग्रहीत करता है।','SSG SMART HUB does not require accounts or personal profiles to use its browser tools.':'SSG SMART HUB के ब्राउज़र टूल उपयोग करने के लिए अकाउंट या व्यक्तिगत प्रोफाइल आवश्यक नहीं है।','Files and text':'फाइलें और टेक्स्ट','Image, text and PDF tools are designed to process selected content in your browser. Files are processed locally in your browser by the tools in this build; the site does not send selected file contents to an SSG application server. Do not use a shared device for sensitive documents and close the tab when finished.':'इमेज, टेक्स्ट और PDF टूल चुनी गई सामग्री को आपके ब्राउज़र में प्रोसेस करने के लिए बनाए गए हैं। इस बिल्ड के टूल फाइलों को ब्राउज़र में स्थानीय रूप से प्रोसेस करते हैं; साइट चुनी गई फाइलों की सामग्री SSG एप्लिकेशन सर्वर को नहीं भेजती। संवेदनशील दस्तावेज़ों के लिए साझा डिवाइस का उपयोग न करें और काम के बाद टैब बंद करें।','Third-party services':'थर्ड-पार्टी सेवाएं','Some tools load open-source libraries from public CDN providers. Those providers may receive standard technical request information, such as IP address and browser details, when resources are requested. Their own privacy terms apply.':'कुछ टूल सार्वजनिक CDN प्रदाताओं से ओपन-सोर्स लाइब्रेरी लोड करते हैं। संसाधन अनुरोध के समय इन प्रदाताओं को IP पता और ब्राउज़र विवरण जैसी सामान्य तकनीकी जानकारी मिल सकती है। उनकी अपनी गोपनीयता शर्तें लागू होंगी।','Cookies and analytics':'कुकी और एनालिटिक्स','This build contains no advertising or analytics code and does not intentionally set tracking cookies. If analytics, advertising, forms or other services are introduced, this policy must be reviewed and updated before activation.':'इस बिल्ड में विज्ञापन या एनालिटिक्स कोड नहीं है और जानबूझकर ट्रैकिंग कुकी सेट नहीं की जाती। यदि एनालिटिक्स, विज्ञापन, फॉर्म या अन्य सेवाएं जोड़ी जाती हैं, तो सक्रिय करने से पहले इस नीति की समीक्षा और अपडेट आवश्यक है।','The site owner must publish a monitored support contact before launch. This policy is a starter template and must be checked against the actual hosting, analytics, advertising and applicable local legal requirements.':'लॉन्च से पहले साइट मालिक को सक्रिय सपोर्ट संपर्क प्रकाशित करना होगा। यह नीति शुरुआती टेम्पलेट है और वास्तविक होस्टिंग, एनालिटिक्स, विज्ञापन तथा स्थानीय कानूनी आवश्यकताओं के अनुसार जांची जानी चाहिए।','Use SSG SMART HUB lawfully and responsibly. Tools are provided for general convenience and may change as the site is improved.':'SSG SMART HUB का कानूनी और जिम्मेदारी से उपयोग करें। टूल सामान्य सुविधा के लिए दिए गए हैं और साइट में सुधार के साथ बदल सकते हैं।','No warranty':'कोई वारंटी नहीं','The website and tools are provided “as is” and “as available”. Uninterrupted operation, accuracy or suitability for a particular purpose is not guaranteed.':'वेबसाइट और टूल “जैसे हैं” और “जैसे उपलब्ध हैं” आधार पर दिए जाते हैं। निरंतर संचालन, सटीकता या किसी विशेष उद्देश्य के लिए उपयुक्तता की गारंटी नहीं है।','Your responsibility':'आपकी जिम्मेदारी','Keep backups of important files and verify outputs before relying on them. Do not use the website to violate laws or others\' rights. You are responsible for ensuring you have rights to any files you process.':'महत्वपूर्ण फाइलों का बैकअप रखें और परिणामों पर भरोसा करने से पहले जांचें। कानून या दूसरों के अधिकारों का उल्लंघन करने के लिए वेबसाइट का उपयोग न करें। प्रोसेस की गई फाइलों के अधिकार सुनिश्चित करना आपकी जिम्मेदारी है।','Availability':'उपलब्धता','Some functions depend on browser support and third-party libraries. Features may not work offline or in every browser.':'कुछ कार्य ब्राउज़र सपोर्ट और थर्ड-पार्टी लाइब्रेरी पर निर्भर हैं। सुविधाएं ऑफलाइन या हर ब्राउज़र में काम नहीं कर सकतीं।','Tools are provided for general productivity purposes. Results may vary by browser, device, file format and input. Verify important outputs independently. The website does not provide professional legal, financial, medical or other regulated advice.':'टूल सामान्य उत्पादकता के लिए दिए गए हैं। परिणाम ब्राउज़र, डिवाइस, फाइल फॉर्मेट और इनपुट के अनुसार बदल सकते हैं। महत्वपूर्ण परिणामों की स्वतंत्र रूप से जांच करें। वेबसाइट पेशेवर कानूनी, वित्तीय, चिकित्सा या अन्य विनियमित सलाह नहीं देती।','This static build does not intentionally set advertising or analytics cookies. Third-party libraries may make standard network requests. This policy must be reviewed if tracking, advertising, analytics or embedded third-party services are introduced.':'यह स्थिर बिल्ड जानबूझकर विज्ञापन या एनालिटिक्स कुकी सेट नहीं करता। थर्ड-पार्टी लाइब्रेरी सामान्य नेटवर्क अनुरोध कर सकती हैं। ट्रैकिंग, विज्ञापन, एनालिटिक्स या एम्बेडेड थर्ड-पार्टी सेवाएं जोड़े जाने पर इस नीति की समीक्षा आवश्यक है।','Unsupported image. Choose JPG, PNG or WebP.':'असमर्थित इमेज। JPG, PNG या WebP चुनें।','Image exceeds 25 MB. Choose a smaller file.':'इमेज 25 MB से बड़ी है। छोटी फाइल चुनें।','Image could not be decoded. It may be damaged.':'इमेज नहीं खुल सकी। फाइल खराब हो सकती है।','Canvas is unavailable in this browser.':'इस ब्राउज़र में Canvas उपलब्ध नहीं है।','Enter dimensions from 1 to 6000 pixels.':'1 से 6000 पिक्सेल तक आयाम दर्ज करें।','Crop rectangle must be inside the original image.':'क्रॉप आयत मूल इमेज के भीतर होना चाहिए।','Enter a valid maximum width (1–6000).':'1 से 6000 के बीच वैध अधिकतम चौड़ाई दर्ज करें।','QR library did not load. Check your internet connection.':'QR लाइब्रेरी लोड नहीं हुई। इंटरनेट कनेक्शन जांचें।','Enter text or a URL first.':'पहले टेक्स्ट या URL दर्ज करें।','Please keep QR content under 2,000 characters.':'QR सामग्री 2,000 अक्षरों से कम रखें।','Could not generate this QR code.':'यह QR कोड नहीं बनाया जा सका।','The selected PDFs exceed the 80 MB combined processing limit. Choose fewer or smaller files.':'चुनी गई PDF फाइलें 80 MB की संयुक्त सीमा से अधिक हैं। कम या छोटी फाइलें चुनें।','Could not merge PDFs. Check files, encryption, available memory and internet connection.':'PDF फाइलें नहीं जुड़ सकीं। फाइलें, एन्क्रिप्शन, उपलब्ध मेमोरी और इंटरनेट जांचें।','Enter two real calendar dates.':'दो वास्तविक कैलेंडर तारीखें दर्ज करें।','Choose a real calendar date and enter a whole number of days (within ±100,000).':'वास्तविक कैलेंडर तारीख और दिनों की पूर्ण संख्या दर्ज करें (±100,000 के भीतर)।'
});
const originalTextNodes=new WeakMap(), originalAttributes=new WeakMap(), originalI18n=new WeakMap();
function translateValue(value,lang){return lang==='en'?value:(uiText[lang]?.[value]||value);}
function applyLanguage(lang){
  const safeLang=['en','ur','hi'].includes(lang)?lang:'en';
  const dict=translations[safeLang]||translations.en||{};
  document.documentElement.lang=safeLang;
  document.documentElement.dir=safeLang==='ur'?'rtl':'ltr';
  document.title='SSG SMART HUB — Smart Tools. Smarter You!';
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.parentElement?.closest('[data-i18n]'))continue;
    if(!originalTextNodes.has(node))originalTextNodes.set(node,node.nodeValue);
    const original=originalTextNodes.get(node),base=original.trim();
    if(!base)continue;
    const translated=translateValue(base,safeLang);
    node.nodeValue=original.replace(base,translated);
  }
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    if(!originalI18n.has(el))originalI18n.set(el,el.innerHTML);
    const key=el.dataset.i18n,original=originalI18n.get(el);
    el.innerHTML=safeLang==='en'?original:(dict[key]!==undefined?dict[key]:original);
  });
  document.querySelectorAll('input[placeholder],textarea[placeholder],button[title],[aria-label]').forEach(el=>{
    if(!originalAttributes.has(el))originalAttributes.set(el,{placeholder:el.getAttribute('placeholder'),title:el.getAttribute('title'),aria:el.getAttribute('aria-label')});
    const a=originalAttributes.get(el);
    for(const [attr,val] of [['placeholder',a.placeholder],['title',a.title],['aria-label',a.aria]])if(val!==null)el.setAttribute(attr,translateValue(val,safeLang));
  });
  document.querySelectorAll('option').forEach(el=>{
    if(!el.dataset.originalLabel)el.dataset.originalLabel=el.textContent;
    el.textContent=translateValue(el.dataset.originalLabel,safeLang);
  });
  updateStats();
}
$('language')?.addEventListener('change',e=>applyLanguage(e.target.value));
applyLanguage($('language')?.value||'en');


// Image tools: resize, compress, convert and crop
let sourceImage=null, sourceFile=null, previewUrl=null, imageOutputUrl=null;
on('imgFile','change',async e=>{
  const f=e.target.files?.[0];
  if(previewUrl)URL.revokeObjectURL(previewUrl); previewUrl=null;
  sourceImage=null; sourceFile=null; $('imgPreview').replaceChildren();
  if(!f){status('imgStatus','Choose an image to begin.');return;}
  try{
    const loaded=await readImage(f);
    sourceImage=loaded; sourceFile=f; previewUrl=URL.createObjectURL(f);
    const im=document.createElement('img'); im.src=previewUrl; im.alt='Selected image preview';
    $('imgPreview').appendChild(im);
    $('imgWidth').value=loaded.naturalWidth; $('imgHeight').value=loaded.naturalHeight;
    $('cropW').value=loaded.naturalWidth; $('cropH').value=loaded.naturalHeight;
    status('imgStatus',`Loaded ${loaded.naturalWidth} × ${loaded.naturalHeight} (${bytes(f.size)}).`);
  }catch(err){status('imgStatus',err.message,true);}
});
$('imgWidth')?.addEventListener('input',()=>{
  if(sourceImage && $('imgLock').checked && Number($('imgWidth').value)>0)
    $('imgHeight').value=Math.round(Number($('imgWidth').value)*sourceImage.naturalHeight/sourceImage.naturalWidth);
});
$('imgHeight')?.addEventListener('input',()=>{
  if(sourceImage && $('imgLock').checked && Number($('imgHeight').value)>0)
    $('imgWidth').value=Math.round(Number($('imgHeight').value)*sourceImage.naturalWidth/sourceImage.naturalHeight);
});
$('imgQuality')?.addEventListener('input',e=>$('qualityValue').textContent=`${e.target.value}%`);
document.querySelectorAll('[data-image-tab]').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('[data-image-tab]').forEach(t=>t.classList.toggle('active',t===tab));
  ['resize','compress','convert','crop'].forEach(k=>$(`${k}Controls`)?.classList.toggle('hidden',k!==tab.dataset.imageTab));
  const isBackground=tab.dataset.imageTab==='background';
  $('backgroundControls')?.classList.toggle('hidden',!isBackground);
  $('processImage')?.classList.toggle('hidden',isBackground);
}));
on('processImage','click',async()=>{
  if(!sourceImage||!sourceFile){status('imgStatus','Choose an image first.',true);return;}
  try{
    const mode=document.querySelector('[data-image-tab].active')?.dataset.imageTab||'resize';
    const c=document.createElement('canvas'), ctx=c.getContext('2d');
    let sx=0,sy=0,sw=sourceImage.naturalWidth,sh=sourceImage.naturalHeight;
    let w=sw,h=sh,type='image/png',quality=.9,suffix=mode;
    if(mode==='resize'){
      w=Number($('imgWidth').value); h=Number($('imgHeight').value);
      if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>6000||h>6000)throw Error('Width and height must be between 1 and 6000 pixels.');
    } else if(mode==='compress'){
      const rawMax=$('imgMaxWidth').value.trim(),max=Number(rawMax);
      if(rawMax&&(!Number.isInteger(max)||max<1||max>6000))throw Error('Maximum width must be a whole number from 1 to 6000.');
      if(rawMax&&max<sw){w=max;h=Math.round(sh*max/sw);}
      type='image/jpeg';quality=Number($('imgQuality').value)/100;
    } else if(mode==='convert'){
      type=$('imgFormat').value;quality=Number($('convertQuality').value)/100;
    } else if(mode==='crop'){
      sx=Number($('cropX').value);sy=Number($('cropY').value);sw=Number($('cropW').value);sh=Number($('cropH').value);
      if(![sx,sy,sw,sh].every(Number.isInteger)||sx<0||sy<0||sw<1||sh<1||sx+sw>sourceImage.naturalWidth||sy+sh>sourceImage.naturalHeight)
        throw Error('Crop rectangle must fit inside the original image.');
      w=sw;h=sh;
    }
    if(w>6000||h>6000||w*h>24000000)throw Error('Output dimensions are too large for safe browser processing (maximum 24 megapixels).');
    c.width=w;c.height=h;
    if(type==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);}
    ctx.drawImage(sourceImage,sx,sy,sw,sh,0,0,w,h);
    const blob=await canvasBlob(c,type,quality);
    if(imageOutputUrl)URL.revokeObjectURL(imageOutputUrl); imageOutputUrl=URL.createObjectURL(blob);
    const url=imageOutputUrl, wrap=$('imgResult');wrap.replaceChildren();
    const im=document.createElement('img');im.src=url;im.alt='Processed image preview';wrap.appendChild(im);
    const p=document.createElement('p');p.textContent=`${w} × ${h} · ${bytes(blob.size)} · ${type}`;wrap.appendChild(p);
    const a=document.createElement('a');a.href=url;a.download=safeName(sourceFile.name,suffix)+(type==='image/jpeg'?'.jpg':type==='image/webp'?'.webp':'.png');a.textContent='Download processed image';a.className='btn small';wrap.appendChild(a);
    status('imgStatus','Image processed successfully. Download it using the link below.');
  }catch(err){status('imgStatus',err.message||'Image processing failed.',true);}
});

// Manual brush background editor with reversible edits
const bg=$('bgCanvas'), bgctx=bg?.getContext('2d',{willReadFrequently:true});
let original=null, mask=null, bgImage=null, brush='erase', zoom=1, drawing=false, last=null, undoStack=[], redoStack=[];
const bgMaskCanvas=document.createElement('canvas');
function bgMessage(m,err=false){status('bgStatus',m,err);}
function captureMask(){const alpha=new Uint8Array(mask.width*mask.height);for(let p=0,i=3;p<alpha.length;p++,i+=4)alpha[p]=mask.data[i];return alpha;}
function restoreMask(alpha){for(let p=0,i=3;p<alpha.length;p++,i+=4)mask.data[i]=alpha[p];}
function snapshot(){if(!mask)return;if(undoStack.length>=3)undoStack.shift();undoStack.push(captureMask());redoStack=[];}
function updateMaskCanvas(){if(bgMaskCanvas.width!==bg.width||bgMaskCanvas.height!==bg.height){bgMaskCanvas.width=bg.width;bgMaskCanvas.height=bg.height;}bgMaskCanvas.getContext('2d').putImageData(mask,0,0);}
function paintBG(){
  if(!original||!mask)return;
  const w=bg.width,h=bg.height;
  bgctx.clearRect(0,0,w,h);bgctx.drawImage(original,0,0,w,h);
  bgctx.globalCompositeOperation='destination-in';bgctx.drawImage(bgMaskCanvas,0,0);
  bgctx.globalCompositeOperation='destination-over';
  if($('bgUseColor').checked){bgctx.fillStyle=$('bgColor').value;bgctx.fillRect(0,0,w,h);}
  else if(bgImage){const scale=Math.max(w/bgImage.width,h/bgImage.height),dw=bgImage.width*scale,dh=bgImage.height*scale;bgctx.drawImage(bgImage,(w-dw)/2,(h-dh)/2,dw,dh);}
  bgctx.globalCompositeOperation='source-over';
}
on('bgSourceFile','change',async e=>{
  try{
    const im=await readImage(e.target.files?.[0]);
    if(im.naturalWidth*im.naturalHeight>8000000)throw Error('For smooth background editing, use an image up to 8 megapixels.');
    original=im;bg.width=im.naturalWidth;bg.height=im.naturalHeight;
    const tmp=document.createElement('canvas');tmp.width=bg.width;tmp.height=bg.height;
    const t=tmp.getContext('2d');mask=t.createImageData(bg.width,bg.height);
    for(let i=3;i<mask.data.length;i+=4)mask.data[i]=255;
    updateMaskCanvas();undoStack=[];redoStack=[];bgImage=null;$('bgUseColor').checked=false;paintBG();
    bg.style.width=`${Math.min(bg.width,900)*zoom}px`;bgMessage(`Loaded ${bg.width} × ${bg.height}. Paint to erase or restore.`);
  }catch(err){bgMessage(err.message,true);}
});
function canvasPoint(e){
  const r=bg.getBoundingClientRect();
  return {x:(e.clientX-r.left)*bg.width/r.width,y:(e.clientY-r.top)*bg.height/r.height};
}
function stroke(a,b){
  if(!mask)return;
  const radius=Math.max(2,Number($('bgBrushSize').value)/2),dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;
  const x0=Math.max(0,Math.floor(Math.min(a.x,b.x)-radius)),x1=Math.min(bg.width,Math.ceil(Math.max(a.x,b.x)+radius));
  const y0=Math.max(0,Math.floor(Math.min(a.y,b.y)-radius)),y1=Math.min(bg.height,Math.ceil(Math.max(a.y,b.y)+radius));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const px=x+.5,py=y+.5,t=len2?Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/len2)):0;
    const ex=px-(a.x+t*dx),ey=py-(a.y+t*dy);
    if(ex*ex+ey*ey<=radius*radius){const i=(y*bg.width+x)*4;mask.data[i+3]=brush==='erase'?0:255;}
  }
  updateMaskCanvas();paintBG();
}
bg?.addEventListener('pointerdown',e=>{
  if(!mask)return;drawing=true;bg.setPointerCapture(e.pointerId);snapshot();last=canvasPoint(e);stroke(last,last);
});
bg?.addEventListener('pointermove',e=>{
  if(!drawing||!last)return;const p=canvasPoint(e);stroke(last,p);last=p;
});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>bg?.addEventListener(ev,()=>{drawing=false;last=null;}));

function setBrush(which){brush=which;$('bgErase').setAttribute('aria-pressed',String(which==='erase'));$('bgRestore').setAttribute('aria-pressed',String(which==='restore'));}
on('bgErase','click',()=>setBrush('erase'));on('bgRestore','click',()=>setBrush('restore'));
on('bgUndo','click',()=>{if(!undoStack.length||!mask)return;redoStack.push(captureMask());restoreMask(undoStack.pop());updateMaskCanvas();paintBG();});
on('bgRedo','click',()=>{if(!redoStack.length||!mask)return;undoStack.push(captureMask());restoreMask(redoStack.pop());updateMaskCanvas();paintBG();});
on('zoomIn','click',()=>{zoom=Math.min(2,zoom+.1);if(original)bg.style.width=`${Math.min(bg.width,900)*zoom}px`;});
on('zoomOut','click',()=>{zoom=Math.max(.3,zoom-.1);if(original)bg.style.width=`${Math.min(bg.width,900)*zoom}px`;});
on('zoomReset','click',()=>{zoom=1;if(original)bg.style.width=`${Math.min(bg.width,900)}px`;});
on('bgColor','input',()=>{if($('bgUseColor').checked)paintBG();});
on('bgUseColor','change',paintBG);
on('bgImageFile','change',async e=>{
  try{const im=await readImage(e.target.files?.[0]);bgImage=im;$('bgUseColor').checked=false;paintBG();bgMessage('Replacement background applied.');}
  catch(err){bgMessage(err.message,true);}
});
on('clearBG','click',()=>{bgImage=null;$('bgUseColor').checked=false;paintBG();});
on('downloadTransparent','click',async()=>{
  if(!original){bgMessage('Choose an image first.',true);return;}
  try{
    const c=document.createElement('canvas');c.width=bg.width;c.height=bg.height;
    const x=c.getContext('2d');x.drawImage(original,0,0);x.globalCompositeOperation='destination-in';x.drawImage(bgMaskCanvas,0,0);x.globalCompositeOperation='source-over';
    downloadBlob(await canvasBlob(c),'ssg-transparent-background.png');bgMessage('Transparent PNG downloaded.');
  }catch(err){bgMessage(err.message,true);}
});
on('downloadJPG','click',async()=>{if(!original){bgMessage('Choose an image first.',true);return;}try{const c=document.createElement('canvas');c.width=bg.width;c.height=bg.height;const x=c.getContext('2d');x.fillStyle=$('bgUseColor').checked?$('bgColor').value:'#ffffff';x.fillRect(0,0,c.width,c.height);x.drawImage(bg,0,0);downloadBlob(await canvasBlob(c,'image/jpeg',.92),'ssg-background-edited.jpg');bgMessage('JPG downloaded.');}catch(err){bgMessage(err.message,true);}});

// PDF tools. PDF-Lib is loaded from the pinned CDN script in index.html.
function pdfLib(){if(!window.PDFLib)throw new Error('PDF library did not load. Check your internet connection and reload the page.');return window.PDFLib;}
async function validPdfHeader(file){if(!file||!(file.type==='application/pdf'||/\.pdf$/i.test(file.name)))throw Error('Choose a PDF file.');if(file.size<8)throw Error('The selected file is too small to be a PDF.');if(file.size>80*1024*1024)throw Error('PDF is larger than the 80 MB limit.');const data=new Uint8Array(await file.slice(0,8).arrayBuffer());if(new TextDecoder().decode(data.slice(0,5))!=='%PDF-')throw Error('The selected file does not have a valid PDF header.');}
async function pdfBytes(file){await validPdfHeader(file);return new Uint8Array(await file.arrayBuffer());}
on('pdfInfoBtn','click',async()=>{
  try{const f=$('pdfInfoFile').files[0];if(!f)throw Error('Choose a PDF first.');await validPdfHeader(f);const {PDFDocument}=pdfLib(),doc=await PDFDocument.load(await pdfBytes(f),{ignoreEncryption:false});
    $('pdfInfoResult').textContent=`File: ${f.name}\nSize: ${bytes(f.size)}\nPages: ${doc.getPageCount()}\nTitle: ${doc.getTitle()||'Not set'}\nAuthor: ${doc.getAuthor()||'Not set'}\nSubject: ${doc.getSubject()||'Not set'}`;
  }catch(e){$('pdfInfoResult').textContent=e.message;}
});
on('mergeBtn','click',async()=>{
  try{const files=[...$('pdfMergeFiles').files];if(files.length<2)throw Error('Select at least two PDF files.');if(files.length>10)throw Error('Maximum 10 PDFs per merge.');
    if(files.reduce((n,f)=>n+f.size,0)>80*1024*1024)throw Error('Combined file size exceeds 80 MB.');
    for(const f of files)await validPdfHeader(f);
    const {PDFDocument}=pdfLib(),out=await PDFDocument.create();let pages=0;
    for(const f of files){const doc=await PDFDocument.load(await pdfBytes(f));pages+=doc.getPageCount();if(pages>500)throw Error('Combined page count exceeds 500.');const copied=await out.copyPages(doc,doc.getPageIndices());copied.forEach(p=>out.addPage(p));}
    downloadBlob(new Blob([await out.save()],{type:'application/pdf'}),'ssg-merged.pdf');status('pdfMergeStatus',`Merged ${files.length} files (${pages} pages).`);
  }catch(e){status('pdfMergeStatus',e.message,true);}
});
function parsePages(value,total){
  const set=new Set();
  for(const part of value.split(',')){const m=part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!m)throw Error('Use page numbers like 1,3,5-7.');
    const a=Number(m[1]),b=Number(m[2]||m[1]);if(a<1||b<a||b>total)throw Error(`Page range must be between 1 and ${total}.`);for(let n=a;n<=b;n++)set.add(n-1);}
  if(!set.size)throw Error('Enter at least one page number.');if(set.size>500)throw Error('Select up to 500 pages at a time.');return [...set].sort((a,b)=>a-b);
}
on('extractBtn','click',async()=>{
  try{const f=$('pdfExtractFile').files[0];if(!f)throw Error('Choose a PDF first.');await validPdfHeader(f);const {PDFDocument}=pdfLib(),src=await PDFDocument.load(await pdfBytes(f)),indices=parsePages($('pdfPages').value,src.getPageCount()),out=await PDFDocument.create();
    const pages=await out.copyPages(src,indices);pages.forEach(p=>out.addPage(p));downloadBlob(new Blob([await out.save()],{type:'application/pdf'}),'ssg-extracted-pages.pdf');status('pdfExtractStatus',`Extracted ${indices.length} page(s).`);
  }catch(e){status('pdfExtractStatus',e.message,true);}
});
let openedPdfUrl=null;
on('openPdfBtn','click',async()=>{
  const f=$('pdfOpenFile').files[0];if(!f){status('pdfOpenStatus','Choose a PDF first.',true);return;}
  try{await validPdfHeader(f);if(openedPdfUrl)URL.revokeObjectURL(openedPdfUrl);openedPdfUrl=URL.createObjectURL(f);
    const a=document.createElement('a');a.href=openedPdfUrl;a.target='_blank';a.rel='noopener noreferrer';a.click();
    status('pdfOpenStatus','PDF open request sent to a new tab.');
  }catch(err){status('pdfOpenStatus',err.message,true);}
});

// Text utilities
function updateStats(){
  const t=$('textInput').value, words=t.trim()?t.trim().split(/\s+/u).length:0;
  const chars=Array.from(t).length,sentences=(t.match(/[.!?۔؟]+(?=\s|$)/gu)||[]).length;
  const lang=$('language')?.value||'en';
  const labels=lang==='ur'?['الفاظ','حروف','جملے','پڑھنے کا وقت']:lang==='hi'?['शब्द','अक्षर','वाक्य','पढ़ने का समय']:['Words','Characters','Sentences','Reading time'];
  $('textStats').textContent=`${labels[0]}: ${words} · ${labels[1]}: ${chars} · ${labels[2]}: ${sentences} · ${labels[3]}: ${words?Math.max(1,Math.ceil(words/200)):0} min`;
}
on('textInput','input',updateStats);
document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{
  const el=$('textInput'),v=el.value;
  el.value=b.dataset.case==='upper'?v.toLocaleUpperCase():b.dataset.case==='lower'?v.toLocaleLowerCase():v.toLocaleLowerCase().replace(/(^|[\s.!?])\p{L}/gu,m=>m.toLocaleUpperCase());
  updateStats();
}));
on('cleanText','click',()=>{$('textInput').value=$('textInput').value.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();updateStats();});
on('copyText','click',async()=>{try{await navigator.clipboard.writeText($('textInput').value);status('textStatus','Text copied.');}catch{status('textStatus','Clipboard access is unavailable in this browser.',true);}});
on('downloadText','click',()=>downloadBlob(new Blob([$('textInput').value],{type:'text/plain;charset=utf-8'}),'ssg-text.txt'));
on('clearText','click',()=>{$('textInput').value='';updateStats();status('textStatus','Text cleared.');});
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  const text=$(b.dataset.copy)?.textContent||'';try{await navigator.clipboard.writeText(text);b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1200);}catch{b.textContent='Copy unavailable';}
}));

// QR code generator
on('makeQR','click',()=>{
  const value=$('qrText').value.trim(),box=$('qrResult');box.replaceChildren();
  if(!value){status('qrStatus','Enter text or a URL first.',true);return;}
  if(value.length>2000){status('qrStatus','Please keep QR content under 2,000 characters.',true);return;}
  if(!window.QRCode){status('qrStatus','QR library did not load. Check your internet connection.',true);return;}
  try{
    const size=Number($('qrSize').value);
    new QRCode(box,{text:value,width:size,height:size,colorDark:'#071225',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
    status('qrStatus','QR code generated. Download it below.');
  }catch(e){status('qrStatus','Could not generate this QR code. Try shorter text.',true);}
});
on('downloadQR','click',()=>{
  const box=$('qrResult'),canvas=box.querySelector('canvas'),img=box.querySelector('img');
  if(canvas)canvas.toBlob(b=>{if(b)downloadBlob(b,'ssg-qr-code.png');else status('qrStatus','Could not export the QR image.',true);});
  else if(img){const a=document.createElement('a');a.href=img.src;a.download='ssg-qr-code.png';a.click();}
  else status('qrStatus','Generate a QR code first.',true);
});

// Color converter
function hexToRgb(hex){const m=hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);return m?m.slice(1).map(v=>parseInt(v,16)):null;}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0,s=0,l=(max+min)/2;
  if(d){s=d/(1-Math.abs(2*l-1));switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h*=60;if(h<0)h+=360;}
  return [Math.round(h),Math.round(s*100),Math.round(l*100)];
}
function updateColor(hex){
  const rgb=hexToRgb(hex);if(!rgb)return;
  const [r,g,b]=rgb,hsl=rgbToHsl(r,g,b);$('colorPicker').value='#'+hex.replace('#','');$('hexColor').value='#'+hex.replace('#','');
  $('colorSwatch').style.backgroundColor='#'+hex.replace('#','');
  $('colorValues').textContent=`HEX: #${hex.replace('#','').toUpperCase()}\nRGB: ${r}, ${g}, ${b}\nHSL: ${hsl[0]}°, ${hsl[1]}%, ${hsl[2]}%`;
}
on('colorPicker','input',e=>updateColor(e.target.value));
on('hexColor','input',e=>{if(hexToRgb(e.target.value))updateColor(e.target.value);});
on('copyHex','click',async()=>{try{await navigator.clipboard.writeText($('hexColor').value);status('colorStatus','HEX copied.');}catch{status('colorStatus','Clipboard unavailable.',true);}});
updateColor('#31e6f2');

// Creator templates (explicitly not AI generated)
const templates={
 Friendly:['{topic} — small steps, big progress! ✨','Make every moment count with {topic}.','A little inspiration for your day: {topic}.'],
 Professional:['Discover a smarter approach to {topic}.','Focused on quality, consistency and results: {topic}.','Practical ideas. Meaningful progress. {topic}.'],
 Funny:['Warning: {topic} may cause unstoppable smiles. 😄','We tried to be serious about {topic}. It did not work.','Mood today: 100% {topic}.'],
 Inspirational:['Dream it. Start it. Grow with {topic}.','Your next chapter can begin with {topic}.','Keep moving forward — {topic} is worth the effort.']
};
on('makeCaption','click',()=>{
  const topic=$('captionTopic').value.trim();if(!topic){$('captionResult').textContent='Enter a topic first.';return;}
  const tone=$('captionTone').value,arr=templates[tone]||templates.Friendly;
  $('captionResult').textContent=arr.map(t=>t.replaceAll('{topic}',topic)).join('\n\n');
});
on('makeHashtags','click',()=>{
  const topic=$('hashTopic').value.trim();if(!topic){$('hashResult').textContent='Enter a topic first.';return;}
  const words=topic.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu,'').trim().split(/\s+/).filter(Boolean);
  if(!words.length){$('hashResult').textContent='Enter a topic containing letters or numbers.';return;}
  const tag=words.join('');const title=words.map(w=>w[0]?.toUpperCase()+w.slice(1)).join('');
  $('hashResult').textContent=[`#${tag}`,`#${title}`,`#${tag}Tips`,`#${tag}Daily`,'#CreativeIdeas','#SSGSmartHub'].join(' ');
});

// Web utilities tabs: keep exactly one utility panel visible at a time.
document.querySelectorAll('[data-web-tab]').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('[data-web-tab]').forEach(t=>t.classList.toggle('active',t===tab));
  ['unit','date','case'].forEach(name=>$(`web-${name}`)?.classList.toggle('hidden',name!==tab.dataset.webTab));
}));

// Unit conversion
const units={
 km:{group:'length',toBase:v=>v*1000,fromBase:v=>v/1000},mi:{group:'length',toBase:v=>v*1609.344,fromBase:v=>v/1609.344},
 m:{group:'length',toBase:v=>v,fromBase:v=>v},ft:{group:'length',toBase:v=>v*.3048,fromBase:v=>v/.3048},
 kg:{group:'mass',toBase:v=>v,fromBase:v=>v},lb:{group:'mass',toBase:v=>v*.45359237,fromBase:v=>v/.45359237},
 c:{group:'temp'},f:{group:'temp'},l:{group:'volume',toBase:v=>v,fromBase:v=>v},gal:{group:'volume',toBase:v=>v*3.785411784,fromBase:v=>v/3.785411784}
};
on('convertUnit','click',()=>{
  const raw=$('unitValue').value,v=Number(raw),a=$('unitFrom').value,b=$('unitTo').value;
  if(raw.trim()===''||!Number.isFinite(v)){$('unitResult').textContent='Enter a valid number.';return;}
  if(units[a].group!==units[b].group){$('unitResult').textContent='Choose units from the same measurement group.';return;}
  let result;
  if(a==='c')result=b==='f'?v*9/5+32:v;
  else if(a==='f')result=b==='c'?(v-32)*5/9:v;
  else result=units[b].fromBase(units[a].toBase(v));
  $('unitResult').textContent=`${v} ${a.toUpperCase()} = ${Number(result.toFixed(6))} ${b.toUpperCase()}`;
});

// Date calculator uses UTC calendar dates to avoid daylight-saving errors
function dateUTC(v){const m=v.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return NaN;const y=+m[1],mo=+m[2],d=+m[3],t=Date.UTC(y,mo-1,d),check=new Date(t);return check.getUTCFullYear()===y&&check.getUTCMonth()===mo-1&&check.getUTCDate()===d?t:NaN;}
on('dateDiff','click',()=>{
  const a=dateUTC($('dateStart').value),b=dateUTC($('dateEnd').value);
  if(!Number.isFinite(a)||!Number.isFinite(b)){$('dateResult').textContent='Choose both dates.';return;}
  $('dateResult').textContent=`Difference: ${Math.abs(b-a)/86400000} day(s)${b<a?' (end date is earlier)':''}.`;
});
on('addDateBtn','click',()=>{
  const d=dateUTC($('addDate').value),raw=$('addDays').value,n=Number(raw);
  if(!Number.isFinite(d)||raw.trim()===''||!Number.isInteger(n)||Math.abs(n)>100000){$('addDateResult').textContent='Choose a date and enter a whole number of days (within ±100,000).';return;}
  const x=new Date(d+n*86400000);$('addDateResult').textContent=x.toISOString().slice(0,10);
});

// Additional text utilities
on('reverseText','click',()=>{$('utilityResult').textContent=Array.from($('utilityText').value).reverse().join('');});
on('sortLines','click',()=>{$('utilityResult').textContent=$('utilityText').value.split(/\r?\n/).sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'})).join('\n');});
on('removeDuplicates','click',()=>{$('utilityResult').textContent=[...new Set($('utilityText').value.split(/\r?\n/))].join('\n');});

// Prevent accidental form submission and announce runtime state in console for debugging.
document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>e.preventDefault()));
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('/sw.js').catch(()=>{});
window.addEventListener('beforeunload',()=>{[previewUrl,imageOutputUrl,openedPdfUrl].forEach(u=>{if(u)URL.revokeObjectURL(u);});});
console.info('SSG SMART HUB app.js initialized.');
})();