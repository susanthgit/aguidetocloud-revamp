/* ══════════════════════════════════════════════════════════
   Password Generator — password-generator.js
   100% client-side, zero API calls, privacy-first
   Uses Web Crypto API for CSPRNG
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

  /* ── CSPRNG helper ── */
  function secureRandom(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }

  function secureRandomFloat() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  }

  function pickRandom(list) {
    return list[secureRandom(list.length)];
  }

  /* ── Character sets ── */
  const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
    ambiguous: '0O1lI'
  };

  /* ── Pronounceable syllable data ── */
  /* Use simple CV (consonant-vowel) pairs for truly speakable output */
  const ONSETS = ['b','c','d','f','g','h','j','k','l','m','n','p','r','s','t','v','w','z',
                  'br','ch','cl','cr','dr','fl','fr','gr','pl','pr','sh','sl','sp','st','tr'];
  const NUCLEI = ['a','e','i','o','u'];
  // ~70% open syllables (empty coda), 30% closed — avoids harsh consonant clusters
  const CODAS  = ['','','','','','','','','','n','m','s','l','r'];

  /* ── Common password patterns for detection ── */
  const COMMON_PASSWORDS = new Set([
    'password','123456','12345678','qwerty','abc123','monkey','master','dragon','111111',
    'baseball','iloveyou','trustno1','sunshine','princess','football','shadow','superman',
    'michael','ninja','mustang','access','batman','letmein','passw0rd','hello','charlie',
    'donald','admin','welcome','login','starwars','solo','whatever','qazwsx','password1',
    'password123','123456789','1234567890','0987654321','1q2w3e4r','zaq1xsw2'
  ]);

  const KEYBOARD_PATTERNS = [
    'qwerty','qwertyuiop','asdfgh','asdfghjkl','zxcvbn','zxcvbnm',
    'qazwsx','wsxedc','edcrfv','rfvtgb','tgbyhn','yhnujm',
    '1qaz2wsx','2wsx3edc','1234qwer','qweasdzxc','!@#$%^&*'
  ];

  /* ── State ── */
  const S = {
    mode: 'random',
    password: '',
    passwordVisible: true,
    checkVisible: false,
    wordList: null,
    wordListLoading: false,
    wordListIsFallback: false,
    history: [],
    ppWords: [],
    ppWordCount: 5,
    genCounter: 0
  };

  /* ── Load EFF word list ── */
  async function loadWordList() {
    if (S.wordList) return S.wordList;
    if (S.wordListLoading) {
      return new Promise(resolve => {
        const check = setInterval(() => {
          if (S.wordList) { clearInterval(check); resolve(S.wordList); }
        }, 100);
      });
    }
    S.wordListLoading = true;
    try {
      const resp = await fetch('/data/password-generator/wordlist.json');
      S.wordList = await resp.json();
      S.wordListIsFallback = false;
    } catch (e) {
      S.wordListIsFallback = true;
      S.wordList = [
        'abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse',
        'access','accident','account','accuse','achieve','acid','across','act','action','actor',
        'adapt','add','addict','address','adjust','admit','adult','advance','advice','afford',
        'again','agent','agree','ahead','aim','air','airport','aisle','alarm','album',
        'alert','alien','almost','alone','alpha','already','also','alter','always','amount',
        'anchor','ancient','anger','angle','animal','ankle','announce','annual','another','answer',
        'apart','apple','april','arena','army','around','arrow','artist','ask','atom',
        'attack','attend','autumn','average','avocado','avoid','awake','aware','awesome','baby',
        'bacon','badge','balance','ball','banana','banner','base','basket','battle','beach',
        'bean','beauty','become','before','begin','behind','believe','below','bench','best',
        'better','beyond','bicycle','bird','birth','black','blade','blame','blanket','blast',
        'blaze','bleak','blend','bless','blind','block','blood','blossom','blue','blur',
        'board','boat','body','bomb','bone','bonus','book','border','bottom','bounce',
        'brave','bread','breeze','brick','bridge','bright','bring','broken','brother','brown',
        'brush','bubble','buddy','budget','buffalo','build','bullet','bumpy','burden','burger',
        'burst','butter','cabin','cable','cage','cake','call','calm','camera','camp',
        'canal','cancel','candy','capable','captain','carbon','card','cargo','carpet','carry',
        'castle','catalog','catch','cause','caution','cave','ceiling','celery','cement','census',
        'chair','chalk','champion','change','chaos','chapter','charge','chase','cheap','check',
        'cheese','cherry','chest','chicken','chief','child','choice','chunk','circle','citizen',
        'claim','clap','clarify','clean','clever','cliff','climb','clock','close','cloud',
        'cluster','coach','coast','coconut','code','coffee','collect','color','column','combine',
        'comfort','common','company','concert','conduct','confirm','congress','connect','consider','control',
        'convince','cook','cool','copper','coral','corner','correct','couch','country','couple',
        'course','cousin','cover','craft','crash','crater','crazy','cream','credit','creek',
        'cricket','crime','crisp','critic','crop','cross','crowd','crucial','cruel','cruise',
        'crumble','crush','crystal','cube','culture','cupboard','curious','current','curtain','curve',
        'cushion','custom','cycle','damage','dance','danger','daring','dawn','debate','decade',
        'december','decide','decline','decorate','decrease','deer','defense','define','degree','delay',
        'deliver','demand','depart','depend','deposit','depth','deputy','derive','describe','desert',
        'design','detail','detect','develop','device','devote','diagram','diamond','diary','diesel',
        'differ','digital','dignity','dilemma','dinner','dinosaur','direct','discover','disease','display',
        'distance','divide','dizzy','doctor','document','dolphin','domain','donate','donkey','donor',
        'door','double','dove','draft','dragon','drama','drastic','dream','dress','drift',
        'drink','drip','drive','drop','drum','duck','dumb','dune','during','dust',
        'dutch','dwarf','dynamic','eager','eagle','early','earth','easily','echo','ecology',
        'economy','edge','edit','educate','effort','eight','either','elbow','elder','electric',
        'elegant','element','elephant','elite','embrace','emerge','emotion','employ','empower','empty',
        'enable','endorse','enemy','energy','engine','enjoy','enough','enter','entire','envelope',
        'episode','equal','equip','erode','erosion','error','erupt','escape','essay','essence',
        'estate','eternal','evidence','evil','evolve','exact','example','excess','exchange','excite',
        'exclude','excuse','execute','exercise','exhaust','exhibit','exile','exist','expand','expect',
        'expire','explain','expose','express','extend','extra','fabric','face','faculty','fade',
        'faint','faith','false','family','famous','fancy','fantasy','farm','fashion','father',
        'fatigue','fault','favorite','feature','fence','festival','fetch','fever','fiber','fiction',
        'field','figure','film','filter','final','find','finger','finish','fire','first',
        'fiscal','fitness','flag','flame','flash','flat','flavor','flight','flip','float',
        'flock','floor','flower','fluid','flush','fly','foam','focus','follow','food',
        'force','forest','forget','fork','fortune','forum','forward','fossil','foster','found',
        'frame','frequent','fresh','friend','fringe','frog','front','frozen','fruit','fuel',
        'funny','furnace','fury','future','gadget','galaxy','gallery','game','garage','garden',
        'garlic','garment','gather','gauge','general','genius','genre','gentle','genuine','gesture',
        'ghost','giant','gift','giggle','ginger','giraffe','glad','glance','glass','globe',
        'glory','glove','glow','glue','goat','goddess','gold','good','gorilla','gospel',
        'gossip','govern','grace','grain','grant','grape','grass','gravity','great','green',
        'grid','grief','grit','grocery','group','grow','grunt','guard','guess','guide',
        'guitar','gun','habit','half','hammer','hamster','hand','happy','harbor','hard',
        'harsh','harvest','hat','hawk','hazard','head','health','heart','heavy','hedgehog',
        'height','hello','helmet','hen','hero','hidden','high','hill','hint','hip',
        'history','hobby','hockey','hold','hole','holiday','hollow','home','honey','hood',
        'hope','horn','horror','horse','hospital','host','hotel','hour','hover','hub',
        'huge','human','humble','humor','hundred','hungry','hunt','hurdle','hurry','hurt',
        'husband','hybrid','ice','icon','idea','identify','idle','ignore','image','imitate',
        'immense','immune','impact','impose','improve','impulse','inch','include','income','increase',
        'index','indicate','indoor','industry','infant','inflict','inform','initial','inject','inner',
        'input','inquiry','insane','insect','inside','inspire','install','intact','interest','invest',
        'invite','involve','iron','island','isolate','issue','ivory','jacket','jaguar','jar',
        'jazz','jealous','jelly','jewel','job','join','joke','journey','joy','judge',
        'juice','jungle','junior','junk','jury','just','kangaroo','keen','keep','kernel',
        'key','kick','kidney','kind','kingdom','kiss','kitchen','kite','kitten','kiwi',
        'knee','knife','knock','know','label','labor','ladder','lake','lamp','language',
        'laptop','large','later','laugh','laundry','lava','lawn','layer','lazy','leader',
        'leaf','learn','leave','lecture','legal','legend','leisure','lemon','length','lens',
        'leopard','lesson','letter','level','liberty','library','license','life','lift','light',
        'limit','link','lion','liquid','list','little','live','lizard','load','loan',
        'lobster','local','lock','logic','lonely','long','loop','lottery','loud','love',
        'loyal','lucky','lumber','lunch','luxury','lyrics','machine','magic','magnet','maiden',
        'major','mammal','manage','mandate','mango','manner','manual','maple','marble','march',
        'margin','market','master','material','matrix','matter','maximum','meadow','meaning','measure',
        'media','melody','member','memory','mention','mentor','mercy','merge','merit','method',
        'middle','might','million','mimic','mind','minimum','minor','minute','miracle','mirror',
        'misery','modify','moment','monitor','monkey','monster','month','moral','morning','mother',
        'motion','motor','mountain','mouse','movie','much','muffin','multiply','muscle','museum',
        'music','must','mutual','myself','mystery','myth','naive','name','napkin','narrow',
        'nation','nature','near','neck','need','negative','neglect','neither','nephew','nerve',
        'network','neutral','never','next','nice','night','noble','noise','normal','north',
        'notable','nothing','notice','novel','number','nurse','object','oblige','observe','obtain',
        'obvious','ocean','october','odor','offer','office','often','olive','olympic','omit',
        'once','onion','online','only','open','opera','opinion','oppose','option','orange',
        'orbit','orchard','order','organ','orient','original','orphan','ostrich','other','outdoor',
        'outer','output','outside','oval','oven','owner','oxygen','oyster','ozone','pact',
        'paddle','page','palace','palm','panda','panel','panic','panther','paper','parade',
        'parent','park','parrot','party','patch','path','patient','patrol','pattern','pause',
        'peanut','pear','pelican','pencil','people','pepper','perfect','permit','person','phone',
        'photo','phrase','physical','piano','picnic','picture','piece','pilot','pink','pioneer',
        'pistol','pitch','pizza','place','planet','plastic','plate','please','pledge','pluck',
        'plug','plunge','poem','point','polar','police','pond','pony','pool','popular',
        'portion','position','possible','potato','pottery','poverty','powder','power','practice','praise',
        'predict','prepare','present','pretty','prevent','price','pride','primary','print','prison',
        'private','problem','process','produce','profit','program','project','promote','proof','property',
        'prosper','protect','proud','provide','public','pudding','pulse','pumpkin','punch','pupil',
        'puppy','purchase','purple','purpose','push','puzzle','pyramid','quality','quantum','quarter',
        'question','quick','quit','quiz','quote','rabbit','raccoon','radar','radio','rail',
        'rainbow','raise','rally','ramp','ranch','random','range','rapid','rare','rather',
        'razor','ready','real','reason','rebel','rebuild','recall','receive','recipe','record',
        'recycle','reduce','reflect','reform','region','regret','regular','reject','relax','release',
        'relief','remain','remember','remind','remove','render','renew','rent','repair','repeat',
        'replace','report','require','rescue','resemble','resist','resource','response','result','retire',
        'retreat','return','reunion','reveal','review','reward','rhythm','ribbon','rice','rich',
        'ride','rifle','right','rigid','ring','risk','ritual','river','road','robot',
        'robust','rocket','romance','roof','rookie','room','rose','rough','round','route',
        'royal','rubber','rude','rug','rule','runway','rural','sad','saddle','sadness',
        'safe','salad','salmon','salon','salt','salute','sample','sand','satisfy','sauce',
        'sausage','save','scale','scan','scatter','scene','scheme','school','science','scissors',
        'scorpion','scout','scrap','screen','script','scrub','search','season','second','secret',
        'section','security','segment','select','senior','sense','sentence','series','service','session',
        'settle','setup','seven','shadow','shaft','shallow','shape','share','shell','sheriff',
        'shield','shift','shine','ship','shock','shoot','short','shoulder','shove','shrimp',
        'shuffle','shy','sibling','sick','side','siege','sight','sign','silent','silver',
        'similar','simple','since','sister','situate','size','sketch','skill','skin','skirt',
        'skull','sleep','slender','slice','slide','slight','slogan','slot','slow','small',
        'smart','smile','smoke','smooth','snack','snake','snap','snow','soap','soccer',
        'social','soldier','solid','solution','someone','song','soon','sorry','sort','soul',
        'sound','source','south','space','spare','spatial','spawn','special','speed','spell',
        'spend','sphere','spider','spike','spirit','split','sponsor','spoon','sport','spray',
        'spread','spring','square','squeeze','squirrel','stable','stadium','staff','stage','stairs',
        'stamp','stand','start','state','stay','steak','steel','stem','step','stereo',
        'stick','still','sting','stock','stomach','stone','stool','story','stove','strategy',
        'street','strike','strong','struggle','student','stuff','stumble','style','subject','submit',
        'success','such','sudden','suffer','sugar','suggest','suit','summer','sun','sunny',
        'super','supply','supreme','sure','surface','surge','surprise','surround','survey','suspect',
        'sustain','swallow','swamp','swap','swear','sweet','swim','swing','switch','sword',
        'symbol','symptom','system','table','tackle','tag','tail','talent','target','task',
        'tattoo','taxi','teach','team','tell','tenant','tend','term','test','text',
        'thank','that','theme','theory','there','they','thing','this','thought','three',
        'thrive','throw','thumb','thunder','ticket','tide','tiger','tilt','timber','time',
        'tiny','tired','tissue','title','toast','tobacco','today','toddler','together','toilet',
        'token','tomato','tomorrow','tone','tongue','tonight','tool','tooth','topic','topple',
        'torch','tornado','tortoise','total','touch','tough','tourist','toward','tower','town',
        'trade','traffic','tragic','train','transfer','trap','travel','tray','treat','tree',
        'trend','trial','tribe','trick','trigger','trim','trip','trophy','trouble','truck',
        'truly','trumpet','trust','truth','try','tube','tuna','tunnel','turkey','turn',
        'turtle','twelve','twenty','twice','twin','twist','type','typical','ugly','umbrella',
        'unable','unaware','uncle','under','undo','unfair','unfold','unhappy','uniform','unique',
        'unit','universe','unknown','unlock','until','unusual','unveil','update','upgrade','upon',
        'upper','upset','urban','usage','used','useful','useless','usual','utility','vacant',
        'vacuum','vague','valid','valley','valve','vanish','vapor','various','vast','vault',
        'vehicle','velvet','vendor','venture','venue','verb','verify','version','vessel','veteran',
        'viable','vibrant','vicious','victory','video','village','vintage','violin','virtual','virus',
        'visa','visit','visual','vital','vivid','vocal','voice','volcano','volume','vote',
        'voyage','wage','wagon','wait','walk','wall','walnut','want','warfare','warm',
        'warrior','wash','wave','wealth','weapon','weather','web','wedding','weekend','weird',
        'welcome','west','whale','wheat','wheel','where','whisper','wide','width','wife',
        'wild','will','window','wine','wing','winner','winter','wire','wisdom','wise',
        'wish','witness','wolf','woman','wonder','wood','wool','word','work','world',
        'worry','worth','wrap','wreck','wrestle','wrist','write','wrong','yard','year',
        'yellow','young','youth','zebra','zero','zone','zoo'
      ];
    }
    S.wordListLoading = false;
    return S.wordList;
  }

  /* ══════════════════════════════════════════════════════════
     PASSWORD GENERATION
     ══════════════════════════════════════════════════════════ */

  function generateRandom() {
    const len = parseInt($('#pwgen-length').value);
    let pool = '';
    if ($('#pwgen-upper').checked) pool += CHARS.upper;
    if ($('#pwgen-lower').checked) pool += CHARS.lower;
    if ($('#pwgen-numbers').checked) pool += CHARS.numbers;
    if ($('#pwgen-symbols').checked) pool += CHARS.symbols;
    if (!pool) pool = CHARS.lower;

    if ($('#pwgen-ambiguous').checked) {
      pool = pool.split('').filter(c => !CHARS.ambiguous.includes(c)).join('');
    }
    const exclude = $('#pwgen-exclude').value;
    if (exclude) {
      pool = pool.split('').filter(c => !exclude.includes(c)).join('');
    }
    if (!pool) pool = CHARS.lower;

    let pw = '';
    for (let i = 0; i < len; i++) pw += pool[secureRandom(pool.length)];
    return pw;
  }

  async function generatePassphrase() {
    const words = await loadWordList();
    const count = parseInt($('#pwgen-words').value);
    const sep = $('#pwgen-separator').value;
    const capitalize = $('#pwgen-capitalize').checked;
    const addNum = $('#pwgen-pp-number').checked;

    let parts = [];
    for (let i = 0; i < count; i++) {
      let w = pickRandom(words);
      if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
      parts.push(w);
    }
    if (addNum) parts.splice(secureRandom(parts.length + 1), 0, String(secureRandom(1000)));
    return parts.join(sep);
  }

  function generatePIN() {
    const len = parseInt($('#pwgen-pin-length').value);
    let pin = '';
    for (let i = 0; i < len; i++) pin += String(secureRandom(10));
    return pin;
  }

  function generatePronounceable() {
    const targetLen = parseInt($('#pwgen-pron-length').value);
    const addNumbers = $('#pwgen-pron-numbers').checked;
    const mixedCase = $('#pwgen-pron-caps').checked;

    // Build syllables: onset + nucleus + optional coda (e.g., "bra", "kem", "to")
    let pw = '';
    while (pw.length < targetLen) {
      pw += pickRandom(ONSETS) + pickRandom(NUCLEI) + pickRandom(CODAS);
    }
    pw = pw.slice(0, targetLen);

    if (mixedCase) {
      // Capitalise at syllable boundaries (~every 3 chars)
      let arr = pw.split('');
      for (let i = 0; i < arr.length; i += (2 + secureRandom(3))) {
        arr[i] = arr[i].toUpperCase();
      }
      pw = arr.join('');
    }

    if (addNumbers && targetLen > 4) {
      // Insert a digit near the middle, not replacing a vowel
      let arr = pw.split('');
      const mid = Math.floor(arr.length / 2) + secureRandom(3) - 1;
      const pos = Math.max(1, Math.min(mid, arr.length - 2));
      arr.splice(pos, 0, String(secureRandom(10)));
      pw = arr.join('').slice(0, targetLen);
    }

    return pw;
  }

  async function generateRecipe() {
    const words = await loadWordList();
    const pattern = ($('#pwgen-recipe-input') || {}).value || 'Word-0000-Word-!';
    const SYMS = '!@#$%^&*_+-=?';
    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const CONS_U = 'BCDFGHJKLMNPQRSTVWXYZ';
    const CONS_L = 'bcdfghjklmnpqrstvwxyz';
    const VOWELS_U = 'AEIOU';
    const VOWELS_L = 'aeiou';

    let pw = '';
    let i = 0;
    while (i < pattern.length) {
      // Check for "Word" token (4 chars)
      if (pattern.substring(i, i + 4) === 'Word') {
        let w = pickRandom(words);
        w = w.charAt(0).toUpperCase() + w.slice(1);
        pw += w;
        i += 4;
      } else {
        const ch = pattern[i];
        if (ch === '0') pw += String(secureRandom(10));
        else if (ch === '!') pw += SYMS[secureRandom(SYMS.length)];
        else if (ch === 'A') pw += UPPER[secureRandom(UPPER.length)];
        else if (ch === 'a') pw += LOWER[secureRandom(LOWER.length)];
        else if (ch === 'C') pw += CONS_U[secureRandom(CONS_U.length)];
        else if (ch === 'c') pw += CONS_L[secureRandom(CONS_L.length)];
        else if (ch === 'V') pw += VOWELS_U[secureRandom(VOWELS_U.length)];
        else if (ch === 'v') pw += VOWELS_L[secureRandom(VOWELS_L.length)];
        else pw += ch; // literal
        i++;
      }
    }
    return pw;
  }

  async function generate() {
    const thisGen = ++S.genCounter;
    let pw;
    switch (S.mode) {
      case 'random':        pw = generateRandom(); break;
      case 'passphrase':    pw = await generatePassphrase(); break;
      case 'pin':           pw = generatePIN(); break;
      case 'pronounceable': pw = generatePronounceable(); break;
      case 'recipe':        pw = await generateRecipe(); break;
      default:              pw = generateRandom();
    }
    // Discard if a newer generation started while we were awaiting
    if (thisGen !== S.genCounter) return;
    S.password = pw;
    displayPassword();
    addToHistory(pw);
    return pw;
  }

  /* ══════════════════════════════════════════════════════════
     STRENGTH ANALYSIS
     ══════════════════════════════════════════════════════════ */

  function analysePassword(pw) {
    if (!pw) return { score: 0, label: '—', color: '#666', entropy: 0, crackTime: 0, warnings: [], suggestions: [] };

    const len = pw.length;
    let poolSize = 0;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pw);

    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNum) poolSize += 10;
    if (hasSymbol) poolSize += 33;
    if (poolSize === 0) poolSize = 26;

    let entropy = len * Math.log2(poolSize);
    const warnings = [];
    const suggestions = [];

    // Pattern detection penalties
    const lower = pw.toLowerCase();

    // Common password check
    if (COMMON_PASSWORDS.has(lower)) {
      entropy = Math.min(entropy, 5);
      warnings.push('This is a commonly used password found in breach databases');
      suggestions.push('Use a completely random password or passphrase instead');
    }

    // Keyboard pattern check
    for (const pat of KEYBOARD_PATTERNS) {
      if (lower.includes(pat) || lower.includes(pat.split('').reverse().join(''))) {
        entropy *= 0.3;
        warnings.push('Contains keyboard pattern: "' + esc(pat) + '"');
        suggestions.push('Avoid keyboard walk patterns — they are among the first things attackers try');
        break;
      }
    }

    // Sequential characters (abc, 123, etc.)
    let seqCount = 0;
    for (let i = 0; i < len - 2; i++) {
      const a = pw.charCodeAt(i), b = pw.charCodeAt(i + 1), c = pw.charCodeAt(i + 2);
      if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1)) seqCount++;
    }
    if (seqCount > 0) {
      entropy *= Math.max(0.4, 1 - seqCount * 0.15);
      warnings.push('Contains ' + seqCount + ' sequential character pattern(s) (e.g., abc, 321)');
      suggestions.push('Replace sequential characters with random ones');
    }

    // Repeated characters
    let maxRepeat = 1, curRepeat = 1;
    for (let i = 1; i < len; i++) {
      if (pw[i] === pw[i - 1]) { curRepeat++; maxRepeat = Math.max(maxRepeat, curRepeat); }
      else curRepeat = 1;
    }
    if (maxRepeat >= 3) {
      // Scale penalty by how dominant the repetition is
      const uniqueChars = new Set(pw).size;
      if (uniqueChars === 1) {
        entropy = Math.min(entropy, 10); // All same char = essentially zero randomness
        warnings.push('All characters are identical — trivially guessable');
      } else if (uniqueChars <= 3) {
        entropy *= 0.25;
        warnings.push('Contains ' + maxRepeat + ' repeated characters with very low variety');
      } else {
        entropy *= 0.6;
        warnings.push('Contains ' + maxRepeat + ' repeated characters in a row');
      }
      suggestions.push('Avoid repeating the same character — it drastically reduces randomness');
    }

    // Date-like patterns
    if (/(?:19|20)\d{2}/.test(pw) || /\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/.test(pw)) {
      entropy *= 0.7;
      warnings.push('Contains what looks like a date — dates are easy to guess');
      suggestions.push('Avoid birth dates, anniversaries, or other personal dates');
    }

    // Common substitutions (l33t speak)
    const leetMap = { '@': 'a', '3': 'e', '1': 'i', '0': 'o', '$': 's', '5': 's', '7': 't', '!': 'i' };
    let deLeeted = lower.split('').map(c => leetMap[c] || c).join('');
    if (COMMON_PASSWORDS.has(deLeeted) && deLeeted !== lower) {
      entropy *= 0.3;
      warnings.push('Common substitution pattern detected (e.g., @ for a, 0 for o)');
      suggestions.push('Leet speak substitutions are well-known to attackers — use true randomness');
    }

    // All same case
    if (len > 4 && pw === pw.toLowerCase() && /^[a-z]+$/.test(pw)) {
      suggestions.push('Add uppercase letters, numbers, or symbols for stronger entropy');
    }
    if (len > 4 && pw === pw.toUpperCase() && /^[A-Z]+$/.test(pw)) {
      suggestions.push('Mix in lowercase letters, numbers, or symbols');
    }

    // Short password
    if (len < 12) {
      suggestions.push('Increase length to at least 12 characters — length is the strongest factor');
    }

    // No symbols
    if (!hasSymbol && len > 6) {
      suggestions.push('Adding symbols increases the character pool from ~62 to ~95');
    }

    // Uniqueness ratio
    const unique = new Set(pw).size;
    const ratio = unique / len;
    if (ratio < 0.4 && len > 6) {
      entropy *= 0.7;
      warnings.push('Low character variety — only ' + unique + ' unique characters in ' + len + ' total');
    }

    // Clamp entropy
    entropy = Math.max(0, entropy);

    // Score: map entropy to 0-100
    let score;
    if (entropy <= 0) score = 0;
    else if (entropy < 28) score = Math.round(entropy / 28 * 20);
    else if (entropy < 36) score = 20 + Math.round((entropy - 28) / 8 * 20);
    else if (entropy < 60) score = 40 + Math.round((entropy - 36) / 24 * 20);
    else if (entropy < 80) score = 60 + Math.round((entropy - 60) / 20 * 20);
    else score = Math.min(100, 80 + Math.round((entropy - 80) / 40 * 20));

    // Label + color
    let label, color;
    if (score < 20) { label = 'Very Weak'; color = '#EF4444'; }
    else if (score < 40) { label = 'Weak'; color = '#F97316'; }
    else if (score < 60) { label = 'Fair'; color = '#EAB308'; }
    else if (score < 80) { label = 'Strong'; color = '#22C55E'; }
    else { label = 'Very Strong'; color = '#10B981'; }

    return { score, label, color, entropy, crackTime: calcCrackTime(entropy), warnings, suggestions,
             percentile: scoreToPercentile(score),
             composition: { length: len, upper: (pw.match(/[A-Z]/g) || []).length, lower: (pw.match(/[a-z]/g) || []).length,
                            numbers: (pw.match(/[0-9]/g) || []).length, symbols: (pw.match(/[^a-zA-Z0-9]/g) || []).length,
                            unique } };
  }

  /* Map score to approximate percentile (based on breach database studies) */
  function scoreToPercentile(score) {
    // Most real-world passwords are weak: ~50% score <20, ~75% score <40, ~90% score <60
    if (score <= 0) return 0;
    if (score < 10) return Math.round(score * 3);       // 0-30%
    if (score < 20) return 30 + Math.round((score - 10) * 2); // 30-50%
    if (score < 40) return 50 + Math.round((score - 20) * 1.25); // 50-75%
    if (score < 60) return 75 + Math.round((score - 40) * 0.75); // 75-90%
    if (score < 80) return 90 + Math.round((score - 60) * 0.4);  // 90-98%
    return Math.min(99, 98 + Math.round((score - 80) * 0.05)); // 98-99%
  }

  function calcCrackTime(entropy) {
    const combos = Math.pow(2, entropy);
    return {
      online:  combos / 1000,          // 1K guesses/sec (rate-limited)
      offline: combos / 100000000000,   // 100B guesses/sec (fast hash)
      gpu:     combos / 1000000000000   // 1T guesses/sec (GPU cluster)
    };
  }

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds <= 0) return 'instantly';
    if (seconds < 1) return 'less than a second';
    if (seconds < 60) return Math.round(seconds) + ' seconds';
    if (seconds < 3600) return Math.round(seconds / 60) + ' minutes';
    if (seconds < 86400) return Math.round(seconds / 3600) + ' hours';
    if (seconds < 86400 * 365) return Math.round(seconds / 86400) + ' days';
    if (seconds < 86400 * 365 * 1000) return Math.round(seconds / (86400 * 365)) + ' years';
    if (seconds < 86400 * 365 * 1e6) return Math.round(seconds / (86400 * 365 * 1000)) + ' thousand years';
    if (seconds < 86400 * 365 * 1e9) return Math.round(seconds / (86400 * 365 * 1e6)) + ' million years';
    if (seconds < 86400 * 365 * 1e12) return Math.round(seconds / (86400 * 365 * 1e9)) + ' billion years';
    return Math.round(seconds / (86400 * 365 * 1e12)) + ' trillion years';
  }

  /* ══════════════════════════════════════════════════════════
     DISPLAY
     ══════════════════════════════════════════════════════════ */

  function displayPassword() {
    const el = $('#pwgen-password');
    if (S.passwordVisible) {
      el.textContent = S.password;
      el.classList.remove('masked');
    } else {
      el.textContent = '•'.repeat(Math.min(S.password.length, 40));
      el.classList.add('masked');
    }
    updateStrength(S.password);
  }

  function updateStrength(pw) {
    const a = analysePassword(pw);

    // Override entropy for known generation modes (Generate tab only)
    let displayEntropy = a.entropy;
    let displayScore = a.score;
    let displayLabel = a.label;
    let displayColor = a.color;

    if (S.mode === 'passphrase') {
      const wordCount = parseInt($('#pwgen-words').value);
      const listSize = S.wordList ? S.wordList.length : 7776;
      displayEntropy = wordCount * Math.log2(listSize);
      if ($('#pwgen-pp-number').checked) displayEntropy += Math.log2(1000);
    } else if (S.mode === 'pin') {
      displayEntropy = parseInt($('#pwgen-pin-length').value) * Math.log2(10);
    } else if (S.mode === 'pronounceable') {
      // Syllable structure: onset(33) + nucleus(5) + coda(14, ~64% empty) ≈ 2310 combos per syllable (~11.2 bits)
      // Average syllable ~2.6 chars, so ~4.3 bits per output character
      const avgSyllLen = 2.6;
      const syllables = Math.ceil(pw.length / avgSyllLen);
      displayEntropy = syllables * Math.log2(33 * 5 * 14);
      if ($('#pwgen-pron-caps').checked) displayEntropy += syllables * 1;
      if ($('#pwgen-pron-numbers').checked) displayEntropy += Math.log2(10 * pw.length);
    } else if (S.mode === 'recipe') {
      // Recipe entropy: count tokens in pattern
      const pattern = ($('#pwgen-recipe-input') || {}).value || '';
      let bits = 0;
      let j = 0;
      const wl = S.wordList ? S.wordList.length : 7776;
      while (j < pattern.length) {
        if (pattern.substring(j, j + 4) === 'Word') { bits += Math.log2(wl); j += 4; }
        else {
          const c = pattern[j];
          if (c === '0') bits += Math.log2(10);
          else if (c === '!') bits += Math.log2(13);
          else if (c === 'A' || c === 'a') bits += Math.log2(26);
          else if (c === 'C' || c === 'c') bits += Math.log2(21);
          else if (c === 'V' || c === 'v') bits += Math.log2(5);
          // Literals add 0 bits
          j++;
        }
      }
      displayEntropy = bits;
    }

    // Recalculate score/label/color from corrected entropy
    if (S.mode !== 'random') {
      if (displayEntropy <= 0) displayScore = 0;
      else if (displayEntropy < 28) displayScore = Math.round(displayEntropy / 28 * 20);
      else if (displayEntropy < 36) displayScore = 20 + Math.round((displayEntropy - 28) / 8 * 20);
      else if (displayEntropy < 60) displayScore = 40 + Math.round((displayEntropy - 36) / 24 * 20);
      else if (displayEntropy < 80) displayScore = 60 + Math.round((displayEntropy - 60) / 20 * 20);
      else displayScore = Math.min(100, 80 + Math.round((displayEntropy - 80) / 40 * 20));

      if (displayScore < 20) { displayLabel = 'Very Weak'; displayColor = '#EF4444'; }
      else if (displayScore < 40) { displayLabel = 'Weak'; displayColor = '#F97316'; }
      else if (displayScore < 60) { displayLabel = 'Fair'; displayColor = '#EAB308'; }
      else if (displayScore < 80) { displayLabel = 'Strong'; displayColor = '#22C55E'; }
      else { displayLabel = 'Very Strong'; displayColor = '#10B981'; }
    }

    const bar = $('#pwgen-strength-bar');
    bar.style.width = displayScore + '%';
    bar.style.background = displayColor;
    bar.classList.toggle('glow', displayScore >= 80);
    $('#pwgen-strength-label').textContent = displayLabel;
    $('#pwgen-strength-label').style.color = displayColor;

    const crackTime = calcCrackTime(displayEntropy);
    const crackLabel = displayScore > 0
      ? '⏱ ' + formatTime(crackTime.offline) + ' to crack (offline)'
      : '';
    $('#pwgen-crack-time').textContent = crackLabel;

    // Percentile on Generate tab
    const pctGen = $('#pwgen-strength-percentile');
    if (pctGen) {
      const pct = scoreToPercentile(displayScore);
      pctGen.textContent = displayScore > 0 ? 'Top ' + (100 - pct) + '%' : '';
      pctGen.style.color = displayColor;
    }

    // Show fallback word list warning
    if (S.wordListIsFallback && (S.mode === 'passphrase')) {
      $('#pwgen-crack-time').textContent += ' ⚠️ Using smaller fallback word list (' + (S.wordList ? S.wordList.length : '?') + ' words)';
    }
  }

  /* ── History ── */
  function addToHistory(pw) {
    S.history.unshift({ pw, time: Date.now() });
    if (S.history.length > 20) S.history.pop();
    renderHistory();
  }

  function renderHistory() {
    const el = $('#pwgen-history');
    if (!S.history.length) { el.innerHTML = '<p class="pwgen-muted">No passwords generated yet</p>'; return; }
    el.innerHTML = S.history.map((h, i) => {
      const a = analysePassword(h.pw);
      return '<div class="pwgen-history-item">' +
        '<span class="pwgen-history-item-strength" style="background:' + a.color + '"></span>' +
        '<span class="pwgen-history-item-text">' + esc(h.pw) + '</span>' +
        '<button class="pwgen-history-item-copy" data-idx="' + i + '" title="Copy" aria-label="Copy password">📋</button>' +
      '</div>';
    }).join('');
  }

  /* ══════════════════════════════════════════════════════════
     CHECK MY PASSWORD TAB
     ══════════════════════════════════════════════════════════ */

  /* ── HIBP k-anonymity breach check ── */
  async function checkHIBP(pw) {
    const breachSection = $('#pwgen-breach-section');
    const breachResult = $('#pwgen-breach-result');
    if (!breachSection || !breachResult || !pw) {
      if (breachSection) breachSection.style.display = 'none';
      return;
    }

    try {
      // SHA-1 hash the password
      const encoder = new TextEncoder();
      const data = encoder.encode(pw);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      const prefix = hashHex.slice(0, 5);
      const suffix = hashHex.slice(5);

      // Query HIBP API with k-anonymity (only sends first 5 chars of hash)
      const resp = await fetch('https://api.pwnedpasswords.com/range/' + prefix);
      if (!resp.ok) throw new Error('API error');

      const text = await resp.text();
      const lines = text.split('\n');
      let found = 0;
      for (const line of lines) {
        const [hashSuffix, count] = line.trim().split(':');
        if (hashSuffix === suffix) {
          found = parseInt(count);
          break;
        }
      }

      breachSection.style.display = '';
      if (found > 0) {
        breachResult.innerHTML = '<div class="pwgen-breach-bad">🚨 Found in <strong>' +
          found.toLocaleString() + '</strong> data breaches! Do NOT use this password.</div>';
      } else {
        breachResult.innerHTML = '<div class="pwgen-breach-good">✅ Not found in any known data breaches.</div>';
      }
    } catch (e) {
      breachSection.style.display = '';
      breachResult.innerHTML = '<div class="pwgen-breach-info">⚠️ Could not check breach database (offline or blocked). ' +
        'Your password was NOT sent — only the first 5 characters of its SHA-1 hash are used.</div>';
    }
  }

  function updateCheckAnalysis() {
    const pw = $('#pwgen-check-input').value;
    const results = $('#pwgen-check-results');
    if (!pw) { results.classList.add('pwgen-hidden'); return; }
    results.classList.remove('pwgen-hidden');

    const a = analysePassword(pw);

    // Score ring
    const ring = $('#pwgen-score-ring');
    const circumference = 2 * Math.PI * 52; // ~327
    const offset = circumference - (a.score / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = a.color;
    ring.style.transition = 'stroke-dashoffset 0.6s ease, stroke 0.4s ease';

    $('#pwgen-check-score-num').textContent = a.score;
    const label = $('#pwgen-check-score-label');
    label.textContent = a.label;
    label.style.color = a.color;

    // Percentile comparison
    const pctEl = $('#pwgen-check-percentile');
    if (pctEl) {
      if (a.score > 0 && a.percentile > 0) {
        pctEl.textContent = 'Stronger than ~' + a.percentile + '% of passwords';
        pctEl.style.display = '';
      } else {
        pctEl.style.display = 'none';
      }
    }

    // Crack times
    $('#pwgen-check-crack-times').innerHTML =
      '<div class="pwgen-crack-row"><span class="pwgen-crack-label">Online (1K/sec)</span><span class="pwgen-crack-value">' + esc(formatTime(a.crackTime.online)) + '</span></div>' +
      '<div class="pwgen-crack-row"><span class="pwgen-crack-label">Offline — fast hash (100B/sec)</span><span class="pwgen-crack-value">' + esc(formatTime(a.crackTime.offline)) + '</span></div>' +
      '<div class="pwgen-crack-row"><span class="pwgen-crack-label">GPU cluster (1T/sec)</span><span class="pwgen-crack-value">' + esc(formatTime(a.crackTime.gpu)) + '</span></div>';

    // Composition
    if (a.composition) {
      const c = a.composition;
      const maxComp = Math.max(c.upper, c.lower, c.numbers, c.symbols, 1);
      $('#pwgen-composition').innerHTML = [
        compBar('Length', c.length, 128, '#D946EF'),
        compBar('Uppercase', c.upper, c.length, '#818CF8'),
        compBar('Lowercase', c.lower, c.length, '#60A5FA'),
        compBar('Numbers', c.numbers, c.length, '#34D399'),
        compBar('Symbols', c.symbols, c.length, '#FBBF24'),
        compBar('Unique chars', c.unique, c.length, '#F472B6')
      ].join('');
    }

    // Warnings
    const wSec = $('#pwgen-warnings-section');
    const wEl = $('#pwgen-warnings');
    if (a.warnings.length) {
      wSec.style.display = '';
      wEl.innerHTML = a.warnings.map(w => '<div class="pwgen-warning-item"><span>⚠️</span><span>' + w + '</span></div>').join('');
    } else {
      wSec.style.display = 'none';
    }

    // Suggestions
    const sSec = $('#pwgen-suggestions-section');
    const sEl = $('#pwgen-suggestions');
    if (a.suggestions.length) {
      sSec.style.display = '';
      sEl.innerHTML = a.suggestions.map(s => '<div class="pwgen-suggestion-item"><span>💡</span><span>' + s + '</span></div>').join('');
    } else {
      sSec.style.display = 'none';
    }

    // Trigger HIBP breach check only if opt-in checkbox is checked
    if ($('#pwgen-breach-toggle') && $('#pwgen-breach-toggle').checked) {
      checkHIBP(pw);
    } else {
      var bs = $('#pwgen-breach-section');
      if (bs) bs.style.display = 'none';
    }
  }

  function compBar(label, value, max, color) {
    const pct = max > 0 ? Math.round(value / max * 100) : 0;
    return '<div class="pwgen-comp-item">' +
      '<div class="pwgen-comp-label"><span>' + esc(label) + '</span><span>' + value + '</span></div>' +
      '<div class="pwgen-comp-bar"><div class="pwgen-comp-bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
    '</div>';
  }

  /* ══════════════════════════════════════════════════════════
     PASSPHRASE BUILDER TAB
     ══════════════════════════════════════════════════════════ */

  async function initPassphraseBuilder() {
    const words = await loadWordList();
    S.ppWords = [];
    for (let i = 0; i < S.ppWordCount; i++) {
      S.ppWords.push(pickRandom(words));
    }
    renderPassphrase();
  }

  async function rerollWord(idx) {
    const words = await loadWordList();
    S.ppWords[idx] = pickRandom(words);
    renderPassphrase(idx);
  }

  function renderPassphrase(animIdx) {
    const sep = $('#pwgen-pp-sep').value;
    const capitalize = $('#pwgen-pp-cap').checked;
    const addNum = $('#pwgen-pp-num').checked;
    const addSymbol = $('#pwgen-pp-symbol').checked;

    // Build chips
    const chipsEl = $('#pwgen-pp-chips');
    chipsEl.innerHTML = S.ppWords.map((w, i) => {
      let display = capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
      return '<button class="pwgen-pp-chip' + (i === animIdx ? ' rerolled' : '') + '" data-idx="' + i + '" title="Click to reroll this word">' + esc(display) + '</button>';
    }).join('');

    // Build full passphrase
    let parts = S.ppWords.map(w => capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w);
    let ppText = parts.join(sep);
    if (addNum) ppText += sep + secureRandom(1000);
    if (addSymbol) ppText += pickRandom('!@#$%^&*'.split(''));

    $('#pwgen-pp-full').textContent = ppText;

    // Entropy calculation
    const wordListSize = S.wordList ? S.wordList.length : 7776;
    let entropyBits = S.ppWords.length * Math.log2(wordListSize);
    if (addNum) entropyBits += Math.log2(1000);
    if (addSymbol) entropyBits += Math.log2(8);

    const crackTime = calcCrackTime(entropyBits);
    $('#pwgen-pp-entropy').innerHTML = '<strong>' + entropyBits.toFixed(1) + ' bits</strong> of entropy — ' +
      formatTime(crackTime.offline) + ' to crack offline';

    // Strength breakdown
    $('#pwgen-pp-strength').innerHTML = [
      stat('Words', S.ppWords.length),
      stat('Word list size', wordListSize.toLocaleString() + ' words'),
      stat('Entropy per word', Math.log2(wordListSize).toFixed(1) + ' bits'),
      stat('Total entropy', entropyBits.toFixed(1) + ' bits'),
      stat('Crack time (online)', formatTime(crackTime.online)),
      stat('Crack time (offline)', formatTime(crackTime.offline)),
      stat('Crack time (GPU cluster)', formatTime(crackTime.gpu)),
      stat('Equivalent random chars', Math.ceil(entropyBits / Math.log2(95)) + ' characters')
    ].join('');
  }

  function stat(label, val) {
    return '<div class="pwgen-pp-stat"><span>' + esc(label) + '</span><span class="pwgen-pp-stat-val">' + esc(String(val)) + '</span></div>';
  }

  /* ══════════════════════════════════════════════════════════
     CLIPBOARD
     ══════════════════════════════════════════════════════════ */

  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied';
        btn.style.color = '#10B981';
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
      }
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied';
        setTimeout(() => { btn.innerHTML = orig; }, 1500);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════
     BULK GENERATE
     ══════════════════════════════════════════════════════════ */

  async function bulkGenerate() {
    const results = [];
    for (let i = 0; i < 10; i++) {
      let pw;
      switch (S.mode) {
        case 'random':        pw = generateRandom(); break;
        case 'passphrase':    pw = await generatePassphrase(); break;
        case 'pin':           pw = generatePIN(); break;
        case 'pronounceable': pw = generatePronounceable(); break;
        case 'recipe':        pw = await generateRecipe(); break;
        default:              pw = generateRandom();
      }
      results.push(pw);
    }

    const listEl = $('#pwgen-bulk-list');
    listEl.innerHTML = results.map((pw, i) =>
      '<div class="pwgen-bulk-item">' +
        '<span class="pwgen-bulk-item-text">' + esc(pw) + '</span>' +
        '<button class="pwgen-bulk-item-copy" data-pw="' + esc(pw).replace(/"/g, '&quot;') + '" title="Copy" aria-label="Copy">📋</button>' +
      '</div>'
    ).join('');

    $('#pwgen-bulk-results').classList.remove('pwgen-hidden');

    // Store for copy-all / download
    S.bulkPasswords = results;
  }

  /* ══════════════════════════════════════════════════════════
     TABS
     ══════════════════════════════════════════════════════════ */

  function switchTab(tabName) {
    $$('.pwgen-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    $$('.pwgen-panel').forEach(p => p.classList.remove('active'));
    const tab = $(`.pwgen-tab[data-tab="${tabName}"]`);
    const panel = $(`#panel-${tabName}`);
    if (tab) { tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); }
    if (panel) panel.classList.add('active');
    location.hash = tabName;

    if (tabName === 'passphrase' && !S.ppWords.length) initPassphraseBuilder();
  }

  /* ══════════════════════════════════════════════════════════
     EVENT WIRING
     ══════════════════════════════════════════════════════════ */

  function init() {

    // Tabs
    $$('.pwgen-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Mode pills
    $$('.pwgen-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        $$('.pwgen-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        S.mode = pill.dataset.mode;
        $$('.pwgen-mode-controls').forEach(c => c.classList.add('pwgen-hidden'));
        const ctrl = $(`#pwgen-ctrl-${S.mode}`);
        if (ctrl) ctrl.classList.remove('pwgen-hidden');
        generate();
      });
    });

    // Quick-start presets
    const PRESETS = {
      banking:    { mode: 'random', length: 20, upper: true, lower: true, numbers: true, symbols: true },
      pin:        { mode: 'pin', pinLength: 6 },
      memorable:  { mode: 'passphrase', words: 4 },
      wifi:       { mode: 'random', length: 12, upper: true, lower: true, numbers: true, symbols: false }
    };

    $$('.pwgen-qs-card').forEach(card => {
      card.addEventListener('click', () => {
        const p = PRESETS[card.dataset.preset];
        if (!p) return;

        // Activate the right mode
        $$('.pwgen-pill').forEach(pill => {
          pill.classList.toggle('active', pill.dataset.mode === p.mode);
        });
        S.mode = p.mode;
        $$('.pwgen-mode-controls').forEach(c => c.classList.add('pwgen-hidden'));
        const ctrl = $(`#pwgen-ctrl-${S.mode}`);
        if (ctrl) ctrl.classList.remove('pwgen-hidden');

        // Apply preset values
        if (p.length !== undefined) { $('#pwgen-length').value = p.length; $('#pwgen-length-val').textContent = p.length; }
        if (p.upper !== undefined) $('#pwgen-upper').checked = p.upper;
        if (p.lower !== undefined) $('#pwgen-lower').checked = p.lower;
        if (p.numbers !== undefined) $('#pwgen-numbers').checked = p.numbers;
        if (p.symbols !== undefined) $('#pwgen-symbols').checked = p.symbols;
        if (p.pinLength !== undefined) { $('#pwgen-pin-length').value = p.pinLength; $('#pwgen-pin-length-val').textContent = p.pinLength; }
        if (p.words !== undefined) { $('#pwgen-words').value = p.words; $('#pwgen-words-val').textContent = p.words; }

        generate();
      });
    });

    // Slider value displays
    const sliderPairs = [
      ['pwgen-length', 'pwgen-length-val'],
      ['pwgen-words', 'pwgen-words-val'],
      ['pwgen-pin-length', 'pwgen-pin-length-val'],
      ['pwgen-pron-length', 'pwgen-pron-length-val']
    ];
    sliderPairs.forEach(([sliderId, valId]) => {
      const slider = $('#' + sliderId);
      const val = $('#' + valId);
      if (slider && val) {
        slider.addEventListener('input', () => {
          val.textContent = slider.value;
          generate();
          // Update word count hints
          if (sliderId === 'pwgen-words') updateWordHint('pwgen-word-hint', parseInt(slider.value));
        });
      }
    });

    function updateWordHint(hintId, count) {
      const hint = $('#' + hintId);
      if (!hint) return;
      if (count < 4) { hint.textContent = '⚠️ ' + count + ' words is weak — use 5+ for strong security'; hint.className = 'pwgen-word-hint warning'; }
      else if (count === 4) { hint.textContent = '💡 4 words is borderline — consider 5+ for better security'; hint.className = 'pwgen-word-hint warning'; }
      else { hint.textContent = '✅ ' + count + ' words = ' + (count * 12.9).toFixed(0) + ' bits of entropy — strong!'; hint.className = 'pwgen-word-hint ok'; }
    }

    // Character toggles
    ['pwgen-upper', 'pwgen-lower', 'pwgen-numbers', 'pwgen-symbols', 'pwgen-ambiguous'].forEach(id => {
      const el = $('#' + id);
      if (el) el.addEventListener('change', () => generate());
    });
    const exEl = $('#pwgen-exclude');
    if (exEl) exEl.addEventListener('input', debounce(() => generate(), 300));

    // Passphrase controls in Generate tab
    ['pwgen-separator', 'pwgen-capitalize', 'pwgen-pp-number'].forEach(id => {
      const el = $('#' + id);
      if (el) el.addEventListener('change', () => { if (S.mode === 'passphrase') generate(); });
    });

    // Pronounceable controls
    ['pwgen-pron-numbers', 'pwgen-pron-caps'].forEach(id => {
      const el = $('#' + id);
      if (el) el.addEventListener('change', () => { if (S.mode === 'pronounceable') generate(); });
    });

    // Recipe controls
    const recipeInput = $('#pwgen-recipe-input');
    if (recipeInput) recipeInput.addEventListener('input', debounce(() => { if (S.mode === 'recipe') generate(); }, 300));
    $$('#pwgen-recipe-presets .pwgen-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#pwgen-recipe-presets .pwgen-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (recipeInput) recipeInput.value = btn.dataset.recipe;
        if (S.mode === 'recipe') generate();
      });
    });

    // Copy button
    $('#pwgen-copy-btn').addEventListener('click', () => copyText(S.password, $('#pwgen-copy-btn')));

    // Dark/light preview toggle
    $$('.pwgen-bg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.pwgen-bg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const wrap = $('#pwgen-password-wrap');
        const pwEl = $('#pwgen-password');
        if (btn.dataset.bg === 'light') {
          wrap.style.background = '#f5f5f5';
          wrap.style.borderRadius = '8px';
          wrap.style.padding = '0.75rem';
          pwEl.style.color = '#1a1a2e';
        } else {
          wrap.style.background = '';
          wrap.style.borderRadius = '';
          wrap.style.padding = '';
          pwEl.style.color = '';
        }
      });
    });

    // Regenerate button
    $('#pwgen-regen-btn').addEventListener('click', () => generate());

    // Eye toggle
    $('#pwgen-eye-btn').addEventListener('click', () => {
      S.passwordVisible = !S.passwordVisible;
      $('#pwgen-eye-btn').textContent = S.passwordVisible ? '👁️' : '🔒';
      displayPassword();
    });

    // Bulk generate
    $('#pwgen-bulk-btn').addEventListener('click', () => bulkGenerate());
    $('#pwgen-qr-btn').addEventListener('click', () => {
      if (S.password) window.open('/qr-generator/#create?text=' + encodeURIComponent(S.password), '_blank');
    });
    $('#pwgen-bulk-close').addEventListener('click', () => $('#pwgen-bulk-results').classList.add('pwgen-hidden'));
    $('#pwgen-bulk-copy-all').addEventListener('click', () => {
      if (S.bulkPasswords) copyText(S.bulkPasswords.join('\n'), $('#pwgen-bulk-copy-all'));
    });
    $('#pwgen-bulk-download').addEventListener('click', () => {
      if (!S.bulkPasswords) return;
      const blob = new Blob([S.bulkPasswords.join('\n')], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'passwords.txt';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Bulk list copy delegation
    $('#pwgen-bulk-list').addEventListener('click', e => {
      const btn = e.target.closest('.pwgen-bulk-item-copy');
      if (btn) copyText(btn.dataset.pw, btn);
    });

    // History delegation
    $('#pwgen-history').addEventListener('click', e => {
      const btn = e.target.closest('.pwgen-history-item-copy');
      if (btn) {
        const idx = parseInt(btn.dataset.idx);
        if (S.history[idx]) copyText(S.history[idx].pw, btn);
      }
    });

    // Clear history
    $('#pwgen-clear-history').addEventListener('click', () => {
      S.history = [];
      renderHistory();
    });

    // ── Check tab ──
    const checkInput = $('#pwgen-check-input');
    checkInput.addEventListener('input', debounce(updateCheckAnalysis, 150));

    $('#pwgen-check-eye').addEventListener('click', () => {
      S.checkVisible = !S.checkVisible;
      checkInput.type = S.checkVisible ? 'text' : 'password';
      $('#pwgen-check-eye').textContent = S.checkVisible ? '🔒' : '👁️';
    });

    // ── Breach toggle opt-in ──
    var breachToggle = $('#pwgen-breach-toggle');
    if (breachToggle) {
      breachToggle.addEventListener('change', function () {
        var pw = $('#pwgen-check-input').value || S.password;
        if (breachToggle.checked && pw) {
          checkHIBP(pw);
        } else {
          var bs = $('#pwgen-breach-section');
          if (bs) bs.style.display = 'none';
        }
      });
    }

    // ── Passphrase builder tab ──
    $('#pwgen-pp-chips').addEventListener('click', e => {
      const chip = e.target.closest('.pwgen-pp-chip');
      if (chip) rerollWord(parseInt(chip.dataset.idx));
    });

    $('#pwgen-pp-reroll').addEventListener('click', () => initPassphraseBuilder());
    $('#pwgen-pp-copy').addEventListener('click', () => {
      const text = $('#pwgen-pp-full').textContent;
      copyText(text, $('#pwgen-pp-copy'));
    });

    $('#pwgen-pp-add-word').addEventListener('click', async () => {
      if (S.ppWords.length >= 12) return;
      const words = await loadWordList();
      S.ppWords.push(pickRandom(words));
      S.ppWordCount = S.ppWords.length;
      renderPassphrase();
    });

    $('#pwgen-pp-remove-word').addEventListener('click', () => {
      if (S.ppWords.length <= 2) return;
      S.ppWords.pop();
      S.ppWordCount = S.ppWords.length;
      renderPassphrase();
    });

    ['pwgen-pp-sep', 'pwgen-pp-cap', 'pwgen-pp-num', 'pwgen-pp-symbol'].forEach(id => {
      const el = $('#' + id);
      if (el) el.addEventListener('change', () => { if (S.ppWords.length) renderPassphrase(); });
    });

    // ── Keyboard shortcuts ──
    document.addEventListener('keydown', e => {
      // Only on Generate tab
      const activePanel = $('.pwgen-panel.active');
      if (!activePanel) return;
      const tabName = activePanel.id.replace('panel-', '');

      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && tabName === 'generate') {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
          generate();
        }
      }

      if (e.key === 'Escape') {
        if (tabName === 'check') {
          checkInput.value = '';
          updateCheckAnalysis();
        }
      }
    });

    // ── URL hash routing ──
    const hash = location.hash.replace('#', '');
    if (['generate', 'check', 'passphrase'].includes(hash)) {
      switchTab(hash);
    }

    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#', '');
      if (['generate', 'check', 'passphrase'].includes(h)) switchTab(h);
    });

    // ── Initial generation ──
    loadWordList(); // Pre-load word list
    generate();
  }

  /* ── Debounce ── */
  function debounce(fn, ms) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
  }

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
