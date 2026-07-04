/* ============================================================
   نقي ومترميش — 3D eco adventure (enhanced trees & flowers)
============================================================ */
'use strict';
const $=id=>document.getElementById(id);
const ACTIVE_MODE_REGISTRY=window.CleanGardenModes;
const ACTIVE_MODE_DEFINITIONS=ACTIVE_MODE_REGISTRY.listModes();
const DEFAULT_ACTIVE_MODE=ACTIVE_MODE_REGISTRY.getDefaultMode();
function isKnownActiveMode(mode){
  return ACTIVE_MODE_REGISTRY.hasMode(mode);
}
function normalizeActiveMode(mode){
  return isKnownActiveMode(mode)?mode:DEFAULT_ACTIVE_MODE;
}
function currentActiveModeDefinition(){
  return ACTIVE_MODE_REGISTRY.getMode(activeMode);
}
let activeSeed='menu-'+Date.now().toString(36);
let activeRngState=hashSeed(activeSeed);
let activeAttempt=0;
function hashSeed(seed){
  let h=2166136261>>>0;
  for(const ch of String(seed)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  return h>>>0||1;
}
function setActiveSeed(seed){
  activeSeed=String(seed&&String(seed).trim()?seed:'seed-1');
  activeRngState=hashSeed(activeSeed);
  return activeSeed;
}
function makeAttemptSeed(level){
  activeAttempt++;
  return `level-${level}-attempt-${activeAttempt}-${Date.now().toString(36)}`;
}
function random(){
  activeRngState=(activeRngState+0x6D2B79F5)>>>0;
  let t=activeRngState;
  t=Math.imul(t^(t>>>15),t|1);
  t^=t+Math.imul(t^(t>>>7),t|61);
  return ((t^(t>>>14))>>>0)/4294967296;
}
const rand=(a,b)=>a+random()*(b-a);
const randi=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[Math.floor(random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(cur,target,lag,dt)=>{const t=1-Math.exp(-dt/Math.max(lag,1e-4));return cur+(target-cur)*t;};
const plainPos=(x=0,y=0,z=0)=>({x,y,z});
function setPlainPos(pos,x,y=pos.y||0,z=pos.z||0){pos.x=x;pos.y=y;pos.z=z;return pos;}
function plainDistance(a,b){return Math.hypot(a.x-b.x,(a.y||0)-(b.y||0),a.z-b.z);}
function plainDistanceXZ(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
function plainToVector(pos,y=pos.y||0){return new THREE.Vector3(pos.x,y,pos.z);}
function setObjectPosition(obj,pos,y=pos.y||0){obj.position.set(pos.x,y,pos.z);}

const ACTIVE_I18N={
  en:{dir:'ltr',title:'Clean Garden',language:'Language',tagline:'A 3D adventure to save the garden! 🌍',credit:'By Quantum Billing LLC',howto:'🗑️ <b>Pick up trash</b> — walk over it to clean it up!<br>🌱 <b>Plant trees</b> — single player uses E; two-player uses P1 F and P2 L. Touch screens use the 🌱 button.<br>😈 <span class="bad">Stop Mtermish minions</span> — touch them to turn them into nature friends!<br>🎩 <span class="bad">Big Mtermish</span> needs <b>3 touches</b>... and runs fast!',start:'🚀 Start Adventure',keys:'💻 Arrow keys / WASD to move — E to plant<br>📱 Joystick right — tap 🌱 button left',keysRace:'💻 P1: WASD + F<br>💻 P2: Arrow keys + L',level:'Level',clean:'Garden cleanliness',prompt:'🌱 Press E to plant a tree!',promptRace:'🌱 P1 F | P2 L to plant trees!',promptTouch:'🌱 Tap the plant button to plant a tree!',exit:'Exit',pause:'Pause',paused:'Paused',resume:'Resume',retry:'Retry',menu:'Menu',next:'Next Level',trashLeft:'Trash left',trees:'Trees',minions:'Mtermish minions',boss:'Big Mtermish',time:'Time',best:'Best',view:'View',resetView:'Reset',sound:'Sound',mode:'Game mode',singlePlayer:'Single Player',twoPlayerRace:'Two Player Race',gender:'Avatar',genderMale:'Male',genderFemale:'Female',clothes:'Clothes',clothesGreen:'Green',clothesBlue:'Blue',clothesPink:'Pink',clothesOrange:'Orange',savedScore:s=>`Best score: ${s.best} | Last: ${s.last} | Total: ${s.total}`,levelStart:n=>`Level ${n}: clean the garden and plant trees! 🌍`,levelDone:n=>`🎉 Level ${n} complete!`,exited:'Exited the game',lines:{pickup:['Nice! One less piece of trash.','The garden says thank you.','Sparkly clean!','Fresh and tidy.','Keep going!'],plant:['A new tree! 🌳','The birds will love this.','Free oxygen for everyone.','That green looks good.'],minion:['Turned into a nature friend!','They said sorry.','One less Mtermish minion.'],mtermishHit:['Mtermish: Ouch! My hat!','Mtermish: You will not catch me!','Mtermish: Fine... maybe I will litter less.'],mtermishDown:['Mtermish: I promise to use the bin!','Mtermish gave up. Next level!'],mtermishTaunt:['Mtermish: More trash!','Mtermish: Clean gardens are boring!','Mtermish: Try to catch me!'],quotes:['Plant a tree, plant hope.','Clean today, protect tomorrow.','Every bin helps the planet.','Trees are homes for birds.','You are the garden hero.']}},
  ar:{dir:'rtl',title:'الحديقة النظيفة',language:'اللغة',tagline:'مغامرة ثلاثية الأبعاد لإنقاذ الحديقة! 🌍',credit:'من Quantum Billing LLC',howto:'🗑️ <b>التقط القمامة</b> — امشِ فوقها لتختفي!<br>🌱 <b>ازرع الأشجار</b> — اللاعب الواحد يستخدم E؛ في لاعبين: اللاعب 1 يستخدم F واللاعب 2 يستخدم L. شاشات اللمس تستخدم زر 🌱.<br>😈 <span class="bad">أوقف أتباع مترميش</span> — المسهم ليتحولوا إلى أصدقاء للطبيعة!<br>🎩 <span class="bad">مترميش الكبير</span> يحتاج <b>٣ لمسات</b>... وهو سريع الهرب!',start:'🚀 ابدأ المغامرة',keys:'💻 الأسهم / WASD للحركة — E للزراعة<br>📱 عصا التحكم يمين — المس زر 🌱 يسار',keysRace:'💻 اللاعب 1: WASD + F<br>💻 اللاعب 2: الأسهم + L',level:'مستوى',clean:'نظافة الحديقة',prompt:'🌱 اضغط E لتزرع شجرة!',promptRace:'🌱 اللاعب 1 F | اللاعب 2 L للزراعة!',promptTouch:'🌱 المس زر الزراعة لتزرع شجرة!',exit:'خروج',pause:'إيقاف',paused:'إيقاف مؤقت',resume:'متابعة',retry:'إعادة',menu:'القائمة',next:'المستوى التالي',trashLeft:'قمامة متبقية',trees:'أشجار',minions:'أتباع مترميش',boss:'مترميش الكبير',time:'الوقت',best:'الأفضل',view:'العرض',resetView:'إعادة',sound:'الصوت',mode:'نمط اللعب',singlePlayer:'لاعب واحد',twoPlayerRace:'سباق لاعبين',gender:'الشخصية',genderMale:'ذكر',genderFemale:'أنثى',clothes:'الملابس',clothesGreen:'أخضر',clothesBlue:'أزرق',clothesPink:'وردي',clothesOrange:'برتقالي',savedScore:s=>`أفضل نقاط: ${s.best} | آخر نتيجة: ${s.last} | المجموع: ${s.total}`,levelStart:n=>`المستوى ${n}: نظّف الحديقة وازرع الأشجار! 🌍`,levelDone:n=>`🎉 المستوى ${n} اكتمل!`,exited:'تم الخروج من اللعبة',lines:{pickup:['رائع! قطعة أقل 🗑️','الحديقة تشكرك!','لمعان ✨','نظيف تمام!','هيّا نكمل!'],plant:['شجرة جديدة! 🌳','الطيور ستحب هذه!','أوكسجين مجاني للجميع 😄','يا سلام على الخضرة!'],minion:['تحوّل إلى صديق للطبيعة! 💚','قال: آسف يا نقي! 😅','واحد أقل من عصابة مترميش!'],mtermishHit:['مترميش: آي! قبعتي! 🎩','مترميش: لن تمسكني!! 😤','مترميش: حسناً حسناً... ربما أرمي أقل!'],mtermishDown:['مترميش: أعدك... سأستخدم سلة المهملات! 😭','مترميش استسلم! إلى المستوى القادم!'],mtermishTaunt:['مترميش: هاهاها! المزيد من القمامة! 😈','مترميش: النظافة مملّة! 🗑️','مترميش: حاول أن تمسكني يا نقي!'],quotes:['من زرع شجرة، زرع أملاً.','نظّفنا اليوم... ونحمي الأرض غداً.','كل قطعة قمامة في مكانها = كوكب أسعد.','الأشجار بيوت العصافير.','بطل البيئة الحقيقي هو أنت.']}},
  es:{dir:'ltr',title:'Jardin Limpio',language:'Idioma',tagline:'Una aventura 3D para salvar el jardin. 🌍',credit:'Por Quantum Billing LLC',howto:'🗑️ <b>Recoge basura</b> — pasa por encima para limpiarla.<br>🌱 <b>Planta arboles</b> — en solitario usa E; en dos jugadores, P1 usa F y P2 usa L. En pantallas tactiles usa el boton 🌱.<br>😈 <span class="bad">Deten a los secuaces de Mtermish</span> — tocalos para convertirlos en amigos de la naturaleza.<br>🎩 <span class="bad">Gran Mtermish</span> necesita <b>3 toques</b>... y corre rapido.',start:'🚀 Iniciar aventura',keys:'💻 Flechas / WASD para moverte — E para plantar<br>📱 Joystick derecha — toca el boton 🌱 izquierda',keysRace:'💻 P1: WASD + F<br>💻 P2: flechas + L',level:'Nivel',clean:'Limpieza del jardin',prompt:'🌱 Pulsa E para plantar un arbol.',promptRace:'🌱 P1 F | P2 L para plantar arboles.',promptTouch:'🌱 Toca el boton de plantar para plantar un arbol.',exit:'Salir',pause:'Pausa',paused:'Pausa',resume:'Continuar',retry:'Reintentar',menu:'Menu',next:'Siguiente nivel',trashLeft:'Basura restante',trees:'Arboles',minions:'Secuaces de Mtermish',boss:'Gran Mtermish',time:'Tiempo',best:'Mejor',view:'Vista',resetView:'Reiniciar',sound:'Sonido',mode:'Modo de juego',singlePlayer:'Un jugador',twoPlayerRace:'Carrera de dos',gender:'Avatar',genderMale:'Masculino',genderFemale:'Femenino',clothes:'Ropa',clothesGreen:'Verde',clothesBlue:'Azul',clothesPink:'Rosa',clothesOrange:'Naranja',savedScore:s=>`Mejor puntuacion: ${s.best} | Ultima: ${s.last} | Total: ${s.total}`,levelStart:n=>`Nivel ${n}: limpia el jardin y planta arboles. 🌍`,levelDone:n=>`🎉 Nivel ${n} completado.`,exited:'Saliste del juego',lines:{pickup:['Bien! Una basura menos.','El jardin te da las gracias.','Todo brilla.','Limpio y listo.','Sigamos!'],plant:['Un arbol nuevo! 🌳','A los pajaros les encantara.','Oxigeno gratis para todos.','Que verde tan bonito.'],minion:['Se convirtio en amigo de la naturaleza!','Pidio perdon.','Un secuaz menos de Mtermish.'],mtermishHit:['Mtermish: Ay! Mi sombrero!','Mtermish: No me atraparas!','Mtermish: Bueno... tirare menos basura.'],mtermishDown:['Mtermish: Prometo usar el bote!','Mtermish se rindio. Siguiente nivel!'],mtermishTaunt:['Mtermish: Mas basura!','Mtermish: La limpieza es aburrida!','Mtermish: Intenta atraparme!'],quotes:['Plantar un arbol es plantar esperanza.','Limpia hoy, protege manana.','Cada bote ayuda al planeta.','Los arboles son casas para aves.','Eres el heroe del jardin.']}},
  fr:{dir:'ltr',title:'Jardin Propre',language:'Langue',tagline:'Une aventure 3D pour sauver le jardin. 🌍',credit:'Par Quantum Billing LLC',howto:'🗑️ <b>Ramasse les dechets</b> — marche dessus pour les nettoyer.<br>🌱 <b>Plante des arbres</b> — en solo utilise E; a deux, P1 utilise F et P2 utilise L. Sur ecran tactile, utilise le bouton 🌱.<br>😈 <span class="bad">Arrete les sbires de Mtermish</span> — touche-les pour en faire des amis de la nature.<br>🎩 <span class="bad">Grand Mtermish</span> demande <b>3 touches</b>... et court vite.',start:"🚀 Lancer l'aventure",keys:'💻 Fleches / WASD pour bouger — E pour planter<br>📱 Joystick a droite — touche le bouton 🌱 a gauche',keysRace:'💻 P1 : WASD + F<br>💻 P2 : fleches + L',level:'Niveau',clean:'Proprete du jardin',prompt:'🌱 Appuie sur E pour planter un arbre.',promptRace:'🌱 P1 F | P2 L pour planter.',promptTouch:'🌱 Touche le bouton planter pour planter un arbre.',exit:'Quitter',pause:'Pause',paused:'Pause',resume:'Reprendre',retry:'Rejouer',menu:'Menu',next:'Niveau suivant',trashLeft:'Dechets restants',trees:'Arbres',minions:'Sbires de Mtermish',boss:'Grand Mtermish',time:'Temps',best:'Meilleur',view:'Vue',resetView:'Recentrer',sound:'Son',mode:'Mode de jeu',singlePlayer:'Solo',twoPlayerRace:'Course a deux',gender:'Avatar',genderMale:'Masculin',genderFemale:'Feminin',clothes:'Tenue',clothesGreen:'Vert',clothesBlue:'Bleu',clothesPink:'Rose',clothesOrange:'Orange',savedScore:s=>`Meilleur score : ${s.best} | Dernier : ${s.last} | Total : ${s.total}`,levelStart:n=>`Niveau ${n} : nettoie le jardin et plante des arbres. 🌍`,levelDone:n=>`🎉 Niveau ${n} termine.`,exited:'Partie quittee',lines:{pickup:['Super! Un dechet en moins.','Le jardin te remercie.','Ca brille.','Propre et net.','On continue!'],plant:['Un nouvel arbre! 🌳','Les oiseaux vont adorer.','De l oxygene pour tout le monde.','Cette verdure est belle.'],minion:['Transforme en ami de la nature!','Il a dit pardon.','Un sbire de Mtermish en moins.'],mtermishHit:['Mtermish: Aie! Mon chapeau!','Mtermish: Tu ne m attraperas pas!','Mtermish: Bon... je jetterai moins.'],mtermishDown:['Mtermish: Je promets d utiliser la poubelle!','Mtermish abandonne. Niveau suivant!'],mtermishTaunt:['Mtermish: Encore des dechets!','Mtermish: La proprete, quel ennui!','Mtermish: Essaie de m attraper!'],quotes:['Planter un arbre, c est planter l espoir.','Nettoyer aujourd hui, proteger demain.','Chaque poubelle aide la planete.','Les arbres sont des maisons pour les oiseaux.','Tu es le heros du jardin.']}}
};
const ACTIVE_I18N_KEYS=[
  'title','language','tagline','credit','howto','start','keys','keysRace','level','clean','prompt','promptRace','promptTouch',
  'exit','pause','paused','resume','retry','menu','next','trashLeft','trees',
  'minions','boss','time','best','view','resetView','sound','mode',
  'singlePlayer','twoPlayerRace','gender','genderMale','genderFemale',
  'clothes','clothesGreen','clothesBlue','clothesPink','clothesOrange','savedScore',
  'levelStart','levelDone','exited'
];
const ACTIVE_I18N_LINE_KEYS=[
  'pickup','plant','minion','mtermishHit','mtermishDown','mtermishTaunt','quotes'
];
const requestedLocale=new URLSearchParams(location.search).get('locale');
let activeLocale=ACTIVE_I18N[requestedLocale]?requestedLocale:(localStorage.getItem('cleanGarden.locale')||'en');
let activeMode=normalizeActiveMode(localStorage.getItem('cleanGarden.mode'));
const AVATAR_CLOTHES={
  green:{body:0x39b54a,dark:0x1d6b33,leaf:0x69db7c,belly:0xd8f3c4,pants:0x2b7fd4,sole:0xe03131},
  blue:{body:0x228be6,dark:0x1864ab,leaf:0x74c0fc,belly:0xd0ebff,pants:0x0b7285,sole:0x364fc7},
  pink:{body:0xe64980,dark:0xa61e4d,leaf:0xf783ac,belly:0xffdeeb,pants:0x7048e8,sole:0xc2255c},
  orange:{body:0xf76707,dark:0xd9480f,leaf:0xff922b,belly:0xffe8cc,pants:0x2b8a3e,sole:0xe8590c},
};
function normalizedAvatarGender(value){return value==='female'?'female':'male';}
function normalizedAvatarClothes(value){return AVATAR_CLOTHES[value]?value:'green';}
function readAvatarSettings(){return {
  gender:normalizedAvatarGender(localStorage.getItem('cleanGarden.avatar.gender')),
  clothes:normalizedAvatarClothes(localStorage.getItem('cleanGarden.avatar.clothes')),
};}
let avatarSettings=readAvatarSettings();
function saveAvatarSettings(settings=avatarSettings){
  avatarSettings={gender:normalizedAvatarGender(settings.gender),clothes:normalizedAvatarClothes(settings.clothes)};
  localStorage.setItem('cleanGarden.avatar.gender',avatarSettings.gender);
  localStorage.setItem('cleanGarden.avatar.clothes',avatarSettings.clothes);
  return avatarSettings;
}
function readScoreMemory(){
  return {
    last:Math.max(0,Number(localStorage.getItem('cleanGarden.score.last'))||0),
    best:Math.max(0,Number(localStorage.getItem('cleanGarden.score.best'))||0),
    total:Math.max(0,Number(localStorage.getItem('cleanGarden.score.total'))||0),
  };
}
function updateSavedScoreUi(memory=readScoreMemory()){
  const el=$('savedScore');
  if(el)el.textContent=tr('savedScore',memory);
}
function rememberScore(score){
  const safe=Math.max(0,Math.round(Number(score)||0));
  const prev=readScoreMemory();
  const memory={last:safe,best:Math.max(prev.best,safe),total:prev.total+safe};
  localStorage.setItem('cleanGarden.score.last',String(memory.last));
  localStorage.setItem('cleanGarden.score.best',String(memory.best));
  localStorage.setItem('cleanGarden.score.total',String(memory.total));
  updateSavedScoreUi(memory);
  return memory;
}
function tr(k,...args){const pack=ACTIVE_I18N[activeLocale]||ACTIVE_I18N.en;const v=pack[k]??ACTIVE_I18N.en[k]??k;return typeof v==='function'?v(...args):v;}
function hasTouchInput(){return 'ontouchstart' in window||navigator.maxTouchPoints>0;}
function raceModeActive(){return currentActiveModeDefinition().simultaneous===true;}
function controlsHelpText(){return tr(raceModeActive()?'keysRace':'keys');}
function plantPromptText(){return tr(hasTouchInput()?'promptTouch':(raceModeActive()?'promptRace':'prompt'));}
function applyLocale(locale=activeLocale){
  activeLocale=ACTIVE_I18N[locale]?locale:'en';
  localStorage.setItem('cleanGarden.locale',activeLocale);
  const pack=ACTIVE_I18N[activeLocale];
  document.documentElement.lang=activeLocale;document.documentElement.dir=pack.dir;
  document.title=tr('title');
  $('languageSelect').value=activeLocale;$('gameTitle').textContent=tr('title');$('languageLabel').textContent=tr('language');$('tagline').textContent=tr('tagline');$('credit').textContent=tr('credit');
  $('howto').innerHTML=tr('howto');$('startBtn').textContent=tr('start');$('keysHint').innerHTML=controlsHelpText();
  $('modeSelect').setAttribute('aria-label',tr('mode'));$('singleModeBtn').textContent=tr('singlePlayer');$('raceModeBtn').textContent=tr('twoPlayerRace');
  $('singleModeBtn').setAttribute('aria-label',tr('singlePlayer'));$('raceModeBtn').setAttribute('aria-label',tr('twoPlayerRace'));
  $('genderLabel').textContent=tr('gender');$('clothesLabel').textContent=tr('clothes');
  $('genderSelect').options[0].textContent=tr('genderMale');$('genderSelect').options[1].textContent=tr('genderFemale');
  $('clothesSelect').options[0].textContent=tr('clothesGreen');$('clothesSelect').options[1].textContent=tr('clothesBlue');
  $('clothesSelect').options[2].textContent=tr('clothesPink');$('clothesSelect').options[3].textContent=tr('clothesOrange');
  $('genderSelect').setAttribute('aria-label',tr('gender'));$('clothesSelect').setAttribute('aria-label',tr('clothes'));updateSavedScoreUi();
  $('uiLevelLabel').textContent=tr('level');$('cleanlinessLabel').textContent=tr('clean');$('prompt').textContent=plantPromptText();
  $('exitBtn').textContent=tr('exit');$('pauseBtn').textContent=tr('pause');$('pauseTitle').textContent=tr('paused');
  $('resumeBtn').textContent=tr('resume');$('retryBtn').textContent=tr('retry');$('menuBtn').textContent=tr('menu');$('nextBtn').textContent=tr('next');
  $('viewBtn').textContent=tr('view');$('resetViewBtn').textContent=tr('resetView');
  $('stTimeLabel').textContent=tr('time');$('stBestLabel').textContent=tr('best');
  $('actBtn').setAttribute('aria-label',tr('promptTouch'));$('exitBtn').setAttribute('aria-label',tr('exit'));$('viewBtn').setAttribute('aria-label',tr('view'));$('resetViewBtn').setAttribute('aria-label',tr('resetView'));$('sndBtn').setAttribute('aria-label',tr('sound'));
  if(typeof Game!=='undefined'&&Game.running)Game.updateMission();
}

/* ---------------- Audio (tiny synth) ---------------- */
const Snd={ctx:null,on:true,
  init(){if(!this.ctx){try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}},
  tone(f,dur=.15,type='sine',vol=.18,slide=0){
    if(!this.ctx||!this.on)return;const t=this.ctx.currentTime;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+dur);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g);g.connect(this.ctx.destination);o.start(t);o.stop(t+dur+.02);},
  pickup(){this.tone(660,.09,'triangle',.2);setTimeout(()=>this.tone(990,.12,'triangle',.18),60);},
  plant(){[440,554,659,880].forEach((f,i)=>setTimeout(()=>this.tone(f,.18,'sine',.16),i*90));},
  bonk(){this.tone(200,.18,'square',.14,-120);setTimeout(()=>this.tone(320,.1,'square',.1),90);},
  convert(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.tone(f,.14,'triangle',.16),i*70));},
  laugh(){[300,260,300,260,220].forEach((f,i)=>setTimeout(()=>this.tone(f,.1,'square',.08),i*110));},
  fanfare(){[523,523,659,784,1046,784,1046].forEach((f,i)=>setTimeout(()=>this.tone(f,.2,'triangle',.18),i*130));}
};

/* ---------------- Renderer / scene ---------------- */
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,300);
const renderer=new THREE.WebGLRenderer({antialias:true});
const QUALITY_PRESETS={
  low:{shadows:false,maxPixelRatio:1,shadowSize:512},
  high:{shadows:true,maxPixelRatio:2,shadowSize:1024}
};
function readActiveQuality(){
  const requested=new URLSearchParams(location.search).get('quality');
  const saved=localStorage.getItem('cleanGarden.quality');
  return QUALITY_PRESETS[requested]?requested:(QUALITY_PRESETS[saved]?saved:'high');
}
let activeQuality=readActiveQuality();
function applyActiveQuality(qualityName=activeQuality){
  activeQuality=QUALITY_PRESETS[qualityName]?qualityName:'high';
  localStorage.setItem('cleanGarden.quality',activeQuality);
  const quality=QUALITY_PRESETS[activeQuality];
  renderer.setPixelRatio(Math.min(devicePixelRatio,quality.maxPixelRatio));
  renderer.shadowMap.enabled=quality.shadows;
  document.documentElement.dataset.quality=activeQuality;
  window.CleanGardenQuality=activeQuality;
  return quality;
}
const renderQuality=applyActiveQuality(activeQuality);
const ALLOW_PAUSED_VISUAL_ANIMATION=true;
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('game').appendChild(renderer.domElement);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);});

const hemi=new THREE.HemisphereLight(0xcfe8ff,0x3a6b3a,.9);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff3d6,1.05);
sun.position.set(30,45,20);sun.castShadow=renderQuality.shadows;
sun.shadow.mapSize.set(renderQuality.shadowSize,renderQuality.shadowSize);
sun.shadow.camera.left=-60;sun.shadow.camera.right=60;
sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;
scene.add(sun);

/* pollution → sky/grass color blending */
const COL={skyClean:new THREE.Color(0x8ecae6),skyDirty:new THREE.Color(0x9aa38a),
  grassClean:new THREE.Color(0x59b25f),grassDirty:new THREE.Color(0x8a8f57),
  fogClean:new THREE.Color(0xbfe3f2),fogDirty:new THREE.Color(0xaab098)};
let worldColors=COL;
scene.background=worldColors.skyDirty.clone();
scene.fog=new THREE.Fog(worldColors.fogDirty.clone(),60,160);

/* ---------------- Materials helper ---------------- */
const MAT={};
function mat(hex){if(!MAT[hex])MAT[hex]=new THREE.MeshStandardMaterial({color:hex,roughness:.85,metalness:0});return MAT[hex];}
// dedicated leaf material factory (slightly waxy) for nicer foliage
function leafMat(hex){const k='L'+hex;if(!MAT[k])MAT[k]=new THREE.MeshStandardMaterial({color:hex,roughness:.82,metalness:0});return MAT[k];}

/* ---------------- World ---------------- */
const WORLD_R=42;
const groundMat=new THREE.MeshStandardMaterial({color:COL.grassDirty.clone(),roughness:1});
const ground=new THREE.Mesh(new THREE.CircleGeometry(WORLD_R+14,48),groundMat);
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const sea=new THREE.Mesh(new THREE.RingGeometry(WORLD_R+13.5,160,48),
  new THREE.MeshStandardMaterial({color:0x2f7fb8,roughness:.6}));
sea.rotation.x=-Math.PI/2;sea.position.y=-.05;scene.add(sea);
const sand=new THREE.Mesh(new THREE.RingGeometry(WORLD_R+8,WORLD_R+14,48),mat(0xd9c07a));
sand.rotation.x=-Math.PI/2;sand.position.y=.01;sand.receiveShadow=true;scene.add(sand);
const path=new THREE.Mesh(new THREE.RingGeometry(14,17,48),mat(0xb08a5a));
path.rotation.x=-Math.PI/2;path.position.y=.02;path.receiveShadow=true;scene.add(path);

/* ---------------- Enhanced foliage builders ---------------- */
const BARK=[0x6b4423,0x7a5230,0x5c3a1e,0x8a5a2b];
const GREEN_DARK=[0x1f6b2e,0x256d2a,0x228b3a];
const GREEN_MID =[0x2f9e44,0x37a94d,0x2b8a3e,0x40b04a];
const GREEN_LT  =[0x51cf66,0x69db7c,0x40c057,0x74dd7f];

function clump(g,x,y,z,r,hex){
  const s=new THREE.Mesh(new THREE.SphereGeometry(r,20,16),leafMat(hex));
  s.position.set(x,y,z);s.scale.y=.92;s.castShadow=true;s.receiveShadow=true;g.add(s);
  return s;}

function makeBroadleaf(){
  const g=new THREE.Group();
  const barkC=pick(BARK);
  const th=rand(1.7,2.4);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.30,th,10),mat(barkC));
  trunk.position.y=th/2;trunk.castShadow=true;g.add(trunk);
  // root flare
  const flare=new THREE.Mesh(new THREE.ConeGeometry(.44,.55,10),mat(barkC));
  flare.position.y=.22;g.add(flare);
  // a couple of branches poking out
  for(let i=0;i<2;i++){const ang=i?2.1:-1.0;
    const br=new THREE.Mesh(new THREE.CylinderGeometry(.05,.09,.85,6),mat(barkC));
    br.position.set(Math.cos(ang)*.22,th*.72,Math.sin(ang)*.22);
    br.rotation.z=(i?-1:1)*.85;br.rotation.y=ang;br.castShadow=true;g.add(br);}
  // layered multi-tone canopy
  const dark=pick(GREEN_DARK),mid=pick(GREEN_MID),lt=pick(GREEN_LT);
  const cy=th+1.0;
  clump(g, .00,cy,     .00,1.28,mid);
  clump(g, .95,cy-.10, .30, .92,dark);
  clump(g,-.88,cy+.02, .18, .88,mid);
  clump(g, .20,cy+.60,-.42, .98,lt);
  clump(g,-.42,cy+.42, .52, .82,lt);
  clump(g, .55,cy+.20, .62, .72,mid);
  clump(g,-.62,cy-.18,-.52, .78,dark);
  clump(g, .10,cy+.15, .05, .70,lt);
  return g;}

function makePine(){
  const g=new THREE.Group();
  const th=rand(1.0,1.5);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.11,.24,th,8),mat(0x5c3a1e));
  trunk.position.y=th/2;trunk.castShadow=true;g.add(trunk);
  const a=pick(GREEN_DARK),b=pick(GREEN_MID);
  const layers=5;
  for(let i=0;i<layers;i++){
    const r=1.4-i*.21;
    const cone=new THREE.Mesh(new THREE.ConeGeometry(r,1.05,28),leafMat(i%2?a:b));
    cone.position.y=th+.15+i*.6;cone.rotation.y=rand(0,1);cone.castShadow=true;g.add(cone);}
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.32,.75,10),leafMat(a));
  tip.position.y=th+.15+layers*.6;tip.castShadow=true;g.add(tip);
  return g;}

function makePalm(){
  const g=new THREE.Group();
  const th=rand(2.7,3.5),seg=6;
  for(let i=0;i<seg;i++){
    const r1=.15-i*.008,r2=.19-i*.008;
    const s=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,th/seg+.02,8),mat(0x9c6b3f));
    s.position.set(Math.sin(i*.35)*.12,(i+.5)*(th/seg),Math.cos(i*.35)*.05);
    s.castShadow=true;g.add(s);}
  const topX=Math.sin((seg-.5)*.35)*.12, topY=th, topZ=Math.cos((seg-.5)*.35)*.05;
  const frondC=pick(GREEN_MID);
  for(let i=0;i<9;i++){const ang=i/9*Math.PI*2;
    const frond=new THREE.Mesh(new THREE.ConeGeometry(.2,1.9,4),leafMat(frondC));
    frond.position.set(topX+Math.cos(ang)*.6,topY-.05,topZ+Math.sin(ang)*.6);
    frond.rotation.z=Math.PI/2-.55;frond.rotation.y=-ang;
    frond.scale.set(1,1,.35);frond.castShadow=true;g.add(frond);}
  for(let i=0;i<5;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.11,6,6),mat(0x8a4b2a));
    d.position.set(topX+rand(-.22,.22),topY-.22,topZ+rand(-.22,.22));g.add(d);}
  return g;}

function makeTree(){
  const type=pick(['broadleaf','broadleaf','broadleaf','pine','palm']);
  if(type==='pine')return makePine();
  if(type==='palm')return makePalm();
  return makeBroadleaf();}

/* enhanced flower with real petals */
const PETAL_COLORS=[0xff6b9d,0xffd166,0xff8c42,0xc084fc,0xffffff,0xff5c8a,0xffa94d,0x74c0fc,0xf783ac];
function makeFlower(){
  const g=new THREE.Group();
  const stemH=rand(.42,.7);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.038,stemH,6),mat(0x2f7d3a));
  stem.position.y=stemH/2;g.add(stem);
  // a leaf on the stem
  const leaf=new THREE.Mesh(new THREE.SphereGeometry(.1,6,6),mat(0x3e8e4b));
  leaf.scale.set(1.7,.28,.7);leaf.position.set(.11,stemH*.5,0);leaf.rotation.z=-.55;g.add(leaf);
  // petal ring
  const petalC=pick(PETAL_COLORS);
  const nP=randi(5,7);
  const headY=stemH+.04;
  for(let i=0;i<nP;i++){const ang=i/nP*Math.PI*2;
    const petal=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),mat(petalC));
    petal.scale.set(1.5,.42,.95);
    petal.position.set(Math.cos(ang)*.12,headY,Math.sin(ang)*.12);
    petal.rotation.y=-ang;g.add(petal);}
  // raised center disc
  const center=new THREE.Mesh(new THREE.SphereGeometry(.07,10,10),mat(pick([0xffd43b,0xf59f00,0xffe066])));
  center.position.y=headY+.03;center.scale.y=.55;g.add(center);
  const s=rand(.85,1.35);g.scale.setScalar(s);
  g.userData.flower=true;g.userData.sway=random()*6.28;g.userData.base=g.rotation.z;
  return g;}

function scatter(n,maker,rMin=6,rMax=WORLD_R+6,collect){
  const created=[];
  for(let i=0;i<n;i++){const a=random()*Math.PI*2,r=rand(rMin,rMax);
    const o=maker();o.position.set(Math.cos(a)*r,o.position.y,Math.sin(a)*r);
    o.rotation.y=random()*Math.PI*2;scene.add(o);created.push(o);if(collect)collect.push(o);}
  return created;
}

const flowers=[];
const clouds=[];
const worldObjects=[];
const WORLD_THEMES=[
  {id:'meadow',grassClean:0x59b25f,grassDirty:0x8a8f57,skyClean:0x8ecae6,skyDirty:0x9aa38a,fogClean:0xbfe3f2,fogDirty:0xaab098,sea:0x2f7fb8,sand:0xd9c07a,path:0xb08a5a,rock:0x9aa0a6,flowers:70,shrubs:16,trees:10,clouds:7,treeTypes:['broadleaf','broadleaf','pine','palm'],landmark:'broadleaf'},
  {id:'pine-forest',grassClean:0x3f8f4e,grassDirty:0x546f45,skyClean:0x9bd6d2,skyDirty:0x778b7d,fogClean:0xcbe7df,fogDirty:0x8c9b88,sea:0x285f7f,sand:0xb8a46a,path:0x7b6747,rock:0x6f7b78,flowers:38,shrubs:28,trees:20,clouds:5,treeTypes:['pine','pine','pine','broadleaf'],landmark:'pine'},
  {id:'flower-coast',grassClean:0x74b96d,grassDirty:0x9a9861,skyClean:0x93d5ff,skyDirty:0xa7a27c,fogClean:0xd3edf9,fogDirty:0xb4ae8a,sea:0x1f8cc5,sand:0xe8cf86,path:0xc19b62,rock:0xaab0b8,flowers:96,shrubs:12,trees:8,clouds:9,treeTypes:['palm','palm','broadleaf'],landmark:'palm'},
  {id:'rocky-grove',grassClean:0x6ca65c,grassDirty:0x747353,skyClean:0x9fc5df,skyDirty:0x8b8d80,fogClean:0xcbdce8,fogDirty:0x9b9d91,sea:0x326e9b,sand:0xc7b279,path:0x8a7352,rock:0x7d8187,flowers:44,shrubs:20,trees:14,clouds:6,treeTypes:['broadleaf','pine'],landmark:'broadleaf'},
  {id:'moon-garden',grassClean:0x5da98f,grassDirty:0x596a78,skyClean:0x8fb8ff,skyDirty:0x687189,fogClean:0xc8dcff,fogDirty:0x7d8499,sea:0x315889,sand:0xc4c1a5,path:0x77728d,rock:0x8c93a4,flowers:62,shrubs:18,trees:12,clouds:10,treeTypes:['pine','broadleaf','palm'],landmark:'pine'},
];
function worldThemeForLevel(level){
  return WORLD_THEMES[(Math.max(1,level)-1)%WORLD_THEMES.length];
}
function themeColors(theme){
  return {
    skyClean:new THREE.Color(theme.skyClean),skyDirty:new THREE.Color(theme.skyDirty),
    grassClean:new THREE.Color(theme.grassClean),grassDirty:new THREE.Color(theme.grassDirty),
    fogClean:new THREE.Color(theme.fogClean),fogDirty:new THREE.Color(theme.fogDirty),
  };
}
function themedTree(theme){
  const type=pick(theme.treeTypes||['broadleaf']);
  if(type==='pine')return makePine();
  if(type==='palm')return makePalm();
  return makeBroadleaf();
}
function applyWorldTheme(theme){
  worldColors=themeColors(theme);
  groundMat.color.copy(worldColors.grassDirty);
  sea.material=mat(theme.sea);
  sand.material=mat(theme.sand);
  path.material=mat(theme.path);
  scene.background.copy(worldColors.skyDirty);
  scene.fog.color.copy(worldColors.fogDirty);
}

function buildDecorativeWorld(level=1){
  const theme=worldThemeForLevel(level);
  applyWorldTheme(theme);
  flowers.length=0;
  clouds.length=0;
  const decorScale=Math.min(1.7,1+level*.08);
  worldObjects.push(...scatter(Math.round(14*decorScale),()=>{const s=rand(.5,1.6);
    const m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mat(theme.rock));
    m.position.y=s*.5;m.castShadow=m.receiveShadow=true;m.scale.y=.7;return m;}));
  worldObjects.push(...scatter(Math.round(theme.flowers*decorScale),makeFlower,5,WORLD_R+4,flowers));
  worldObjects.push(...scatter(Math.round(theme.shrubs*decorScale),()=>{const g=new THREE.Group();
    for(let i=0;i<3;i++){const s=rand(.5,.9);
      const b=new THREE.Mesh(new THREE.SphereGeometry(s,8,8),leafMat(pick(GREEN_MID)));
      b.position.set(rand(-.5,.5),s*.7,rand(-.5,.5));b.castShadow=true;g.add(b);}return g;},8));
  worldObjects.push(...scatter(Math.round(theme.trees*decorScale),()=>themedTree(theme),20,WORLD_R+5));
  for(let i=0;i<Math.round(theme.clouds*decorScale);i++){const g=new THREE.Group();
    for(let j=0;j<4;j++){const s=rand(1.4,3);
      const c=new THREE.Mesh(new THREE.SphereGeometry(s,8,8),
        new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:.9}));
      c.position.set(j*2.2-3+rand(-.5,.5),rand(-.4,.4),rand(-1,1));g.add(c);}
    g.position.set(rand(-70,70),rand(22,32),rand(-70,70));
    g.userData.spd=rand(.5,1.2);scene.add(g);clouds.push(g);worldObjects.push(g);}
  const landmark=theme.landmark==='pine'?makePine():(theme.landmark==='palm'?makePalm():makeBroadleaf());
  landmark.scale.setScalar(2.4);landmark.position.set(0,0,0);scene.add(landmark);worldObjects.push(landmark);
}

/* ---------------- Character builders ---------------- */
function makeEyes(g,y,z,spread=.16,r=.09){
  [-spread,spread].forEach(x=>{
    const w=new THREE.Mesh(new THREE.SphereGeometry(r,8,8),new THREE.MeshStandardMaterial({color:0xffffff}));
    w.position.set(x,y,z);g.add(w);
    const p=new THREE.Mesh(new THREE.SphereGeometry(r*.5,6,6),new THREE.MeshStandardMaterial({color:0x1e1e1e}));
    p.position.set(x,y,z+r*.6);g.add(p);});}

function buildNaqi(){
  const g=new THREE.Group();
  const SKIN=0xffd9b3, GREEN=0x39b54a, GREEN_D=0x1d6b33, LEAF=0x69db7c;

  // --- soft rounded body ---
  const body=new THREE.Mesh(new THREE.SphereGeometry(.54,24,20),mat(GREEN));
  body.userData.avatarRole='body';body.userData.avatarPart='torso';body.scale.set(1,1.28,.98);body.position.y=.86;body.castShadow=true;g.add(body);
  // lighter belly
  const belly=new THREE.Mesh(new THREE.SphereGeometry(.42,22,18),mat(0xd8f3c4));
  belly.userData.avatarRole='belly';belly.scale.set(.78,1.05,.52);belly.position.set(0,.8,.3);g.add(belly);
  // two little buttons
  [.02,-.14].forEach(y=>{const bt=new THREE.Mesh(new THREE.SphereGeometry(.035,10,10),mat(0xffd166));
    bt.position.set(0,.88+y,.42);g.add(bt);});

  // --- big friendly head ---
  const head=new THREE.Mesh(new THREE.SphereGeometry(.46,26,22),mat(SKIN));
  head.position.y=1.74;head.castShadow=true;g.add(head);
  // ears
  [-.44,.44].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.1,14,14),mat(SKIN));
    e.position.set(x,1.72,0);g.add(e);});
  // big sparkly eyes
  [-.17,.17].forEach(x=>{
    const w=new THREE.Mesh(new THREE.SphereGeometry(.13,20,20),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35}));
    w.scale.set(.9,1.05,.7);w.position.set(x,1.8,.35);g.add(w);
    const p=new THREE.Mesh(new THREE.SphereGeometry(.075,16,16),new THREE.MeshStandardMaterial({color:0x2b2018,roughness:.3}));
    p.position.set(x,1.79,.43);g.add(p);
    const hi=new THREE.Mesh(new THREE.SphereGeometry(.03,10,10),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xaaaaaa}));
    hi.position.set(x+.035,1.83,.47);g.add(hi);
    const hi2=new THREE.Mesh(new THREE.SphereGeometry(.016,8,8),new THREE.MeshStandardMaterial({color:0xffffff}));
    hi2.position.set(x-.03,1.77,.47);g.add(hi2);
  });
  // gentle eyebrows
  [-.17,.17].forEach((x,i)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.13,.028,.03),mat(0x8a5a2b));
    b.position.set(x,1.95,.4);b.rotation.z=i?.12:-.12;g.add(b);});
  // rosy cheeks
  [-.29,.29].forEach(x=>{const c=new THREE.Mesh(new THREE.SphereGeometry(.085,14,14),
    new THREE.MeshStandardMaterial({color:0xffa8a8,transparent:true,opacity:.5,roughness:.7}));
    c.scale.z=.35;c.position.set(x,1.66,.34);g.add(c);});
  // happy open smile
  const smile=new THREE.Mesh(new THREE.TorusGeometry(.15,.035,10,18,Math.PI),mat(0x9c4a2a));
  smile.position.set(0,1.64,.4);smile.rotation.x=Math.PI;g.add(smile);
  const tongue=new THREE.Mesh(new THREE.SphereGeometry(.07,12,12),mat(0xff8fab));
  tongue.scale.set(1.3,.5,.6);tongue.position.set(0,1.6,.42);g.add(tongue);

  // --- explorer cap with leaf sprout ---
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.48,26,22,0,Math.PI*2,0,Math.PI/2),mat(GREEN_D));
  cap.userData.avatarRole='dark';cap.position.y=1.86;g.add(cap);
  const capBand=new THREE.Mesh(new THREE.TorusGeometry(.47,.045,12,26),mat(0x14532d));
  capBand.userData.avatarRole='dark';capBand.position.y=1.86;capBand.rotation.x=Math.PI/2;g.add(capBand);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.05,20),mat(GREEN_D));
  brim.userData.avatarRole='dark';brim.position.set(0,1.85,.46);brim.scale.set(1.5,1,1);g.add(brim);
  const sproutStem=new THREE.Mesh(new THREE.CylinderGeometry(.02,.026,.18,6),mat(0x2f7d3a));
  sproutStem.position.set(0,2.28,0);g.add(sproutStem);
  const sl1=new THREE.Mesh(new THREE.SphereGeometry(.1,16,16),mat(LEAF));
  sl1.userData.avatarRole='leaf';sl1.scale.set(1.4,.4,1);sl1.position.set(.07,2.38,0);sl1.rotation.z=.6;g.add(sl1);
  const sl2=new THREE.Mesh(new THREE.SphereGeometry(.085,16,16),mat(LEAF));
  sl2.userData.avatarRole='leaf';sl2.scale.set(1.4,.4,1);sl2.position.set(-.06,2.34,0);sl2.rotation.z=-.7;g.add(sl2);

  // --- backpack with sapling ---
  const pack=new THREE.Mesh(new THREE.BoxGeometry(.5,.55,.26),mat(0xf76707));
  pack.position.set(0,.95,-.46);pack.castShadow=true;g.add(pack);
  const flap=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.28),mat(0xe8590c));
  flap.position.set(0,1.16,-.46);g.add(flap);
  [-.22,.22].forEach(x=>{const s=new THREE.Mesh(new THREE.BoxGeometry(.08,.55,.06),mat(0xe8590c));
    s.position.set(x,1.06,.34);g.add(s);});
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.1,.08,.16,12),mat(0xb5651d));
  pot.position.set(0,1.34,-.46);g.add(pot);
  const st=new THREE.Mesh(new THREE.CylinderGeometry(.026,.03,.28,8),mat(0x2f7d3a));
  st.position.set(0,1.54,-.46);g.add(st);
  const lf=new THREE.Mesh(new THREE.SphereGeometry(.13,16,16),mat(LEAF));
  lf.position.set(0,1.7,-.46);lf.scale.y=.8;g.add(lf);

  // --- soft chubby arms (pivot at shoulder) ---
  const arms=[];
  [-.58,.58].forEach(x=>{
    const arm=new THREE.Group();arm.position.set(x,1.18,0);
    const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.11,.1,.42,16),mat(GREEN));
    sleeve.userData.avatarRole='body';sleeve.position.y=-.22;sleeve.castShadow=true;arm.add(sleeve);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.14,18,18),mat(SKIN));
    hand.position.y=-.48;hand.castShadow=true;arm.add(hand);
    g.add(arm);arms.push(arm);
  });

  // --- little legs (pivot at hip) ---
  const legs=[];
  [-.22,.22].forEach(x=>{
    const leg=new THREE.Group();leg.position.set(x,.5,0);
    const pant=new THREE.Mesh(new THREE.CylinderGeometry(.14,.12,.42,16),mat(0x2b7fd4));
    pant.userData.avatarRole='pants';pant.position.y=-.21;pant.castShadow=true;leg.add(pant);
    const shoe=new THREE.Mesh(new THREE.SphereGeometry(.15,18,16),mat(0xffffff));
    shoe.scale.set(1,.65,1.5);shoe.position.set(0,-.44,.08);shoe.castShadow=true;leg.add(shoe);
    const sole=new THREE.Mesh(new THREE.SphereGeometry(.15,18,16),mat(0xe03131));
    sole.userData.avatarRole='sole';sole.scale.set(1.02,.3,1.52);sole.position.set(0,-.5,.08);leg.add(sole);
    g.add(leg);legs.push(leg);
  });

  g.userData={arms,legs};
  return g;}

function tintNaqiBlue(g){
  const swaps=new Map([
    [mat(0x39b54a),mat(0x228be6)],
    [mat(0x1d6b33),mat(0x1864ab)],
    [mat(0x69db7c),mat(0x74c0fc)],
    [mat(0xd8f3c4),mat(0xd0ebff)],
    [mat(0x14532d),mat(0x0b4f8a)],
  ]);
  g.traverse(o=>{
    if(o.isMesh&&swaps.has(o.material))o.material=swaps.get(o.material);
  });
  return g;
}

function applyAvatarStyle(g,settings=avatarSettings){
  const saved=saveAvatarSettings(settings);
  const colors=AVATAR_CLOTHES[saved.clothes]||AVATAR_CLOTHES.green;
  g.traverse(o=>{
    if(!o.isMesh)return;
    if(o.userData.avatarRole==='body')o.material=mat(colors.body);
    if(o.userData.avatarRole==='dark')o.material=mat(colors.dark);
    if(o.userData.avatarRole==='leaf')o.material=mat(colors.leaf);
    if(o.userData.avatarRole==='belly')o.material=mat(colors.belly);
    if(o.userData.avatarRole==='pants')o.material=mat(colors.pants);
    if(o.userData.avatarRole==='sole')o.material=mat(colors.sole);
    if(o.userData.avatarPart==='torso')o.scale.y=saved.gender==='female'?1.18:1.28;
  });
  if(g.userData.avatarExtra){
    const old=g.userData.avatarExtra;
    g.remove(old);
    old.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose();});
  }
  const extra=new THREE.Group();
  if(saved.gender==='female'){
    const hairMat=mat(0x5c3a1e);
    [-.36,.36].forEach(x=>{
      const bun=new THREE.Mesh(new THREE.SphereGeometry(.14,14,12),hairMat);
      bun.position.set(x,1.88,.02);bun.castShadow=true;extra.add(bun);
    });
    const skirt=new THREE.Mesh(new THREE.ConeGeometry(.6,.34,24),mat(colors.dark));
    skirt.userData.avatarRole='dark';skirt.position.y=.55;skirt.rotation.y=Math.PI/8;skirt.castShadow=true;extra.add(skirt);
  }else{
    const scarf=new THREE.Mesh(new THREE.TorusGeometry(.38,.035,10,24),mat(colors.leaf));
    scarf.userData.avatarRole='leaf';scarf.position.y=1.34;scarf.rotation.x=Math.PI/2;extra.add(scarf);
  }
  g.userData.avatarExtra=extra;
  g.add(extra);
  return g;
}

function buildMinion(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.SphereGeometry(.55,10,10),mat(0x9c6bd6));
  body.position.y=.6;body.scale.y=1.15;body.castShadow=true;g.add(body);
  makeEyes(g,.82,.44,.18,.1);
  [-.18,.18].forEach((x,i)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.2,.05,.04),mat(0x3b2358));
    b.position.set(x,.98,.5);b.rotation.z=i?-.5:.5;g.add(b);});
  const frown=new THREE.Mesh(new THREE.TorusGeometry(.12,.03,6,10,Math.PI),mat(0x3b2358));
  frown.position.set(0,.52,.5);g.add(frown);
  const bag=new THREE.Mesh(new THREE.SphereGeometry(.3,8,8),mat(0x555c66));
  bag.position.set(.5,.55,-.25);bag.scale.y=1.2;bag.castShadow=true;g.add(bag);
  const feet=[];
  [-.22,.22].forEach(x=>{const f=new THREE.Mesh(new THREE.SphereGeometry(.14,8,8),mat(0x3b2358));
    f.position.set(x,.1,.1);g.add(f);feet.push(f);});
  g.userData={feet,body};
  return g;}

function buildMtermish(){
  const g=buildMinion();
  g.scale.setScalar(1.7);
  const hat=new THREE.Group();
  const top=new THREE.Mesh(new THREE.CylinderGeometry(.28,.3,.5,12),mat(0x2b213d));top.position.y=.35;hat.add(top);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.06,12),mat(0x2b213d));hat.add(brim);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.305,.305,.12,12),mat(0xc084fc));band.position.y=.16;hat.add(band);
  hat.position.y=1.12;g.add(hat);
  const stache=new THREE.Mesh(new THREE.TorusGeometry(.2,.05,6,10,Math.PI),mat(0x2b213d));
  stache.position.set(0,.66,.5);g.add(stache);
  return g;}

/* trash item builders */
const trashBuilders=[
  ()=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.4,10),mat(0xd64545));
    m.rotation.z=Math.PI/2.4;m.position.y=.15;return m;},
  ()=>{const g=new THREE.Group();
    for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.1,.05,.5),mat(0xffe066));
      p.rotation.y=i*2.1;p.rotation.x=.4;p.position.y=.1;g.add(p);}return g;},
  ()=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,0),mat(0xf1f3f5));
    m.position.y=.2;return m;},
  ()=>{const g=new THREE.Group();
    const b=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.45,10),mat(0x74c0fc));b.position.y=.12;
    b.rotation.z=Math.PI/2.2;g.add(b);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.1,8),mat(0x1971c2));
    cap.position.set(.24,.2,0);cap.rotation.z=Math.PI/2.2;g.add(cap);return g;},
  ()=>{const g=new THREE.Group();
    const s=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.05,3),mat(0xffc078));s.position.y=.06;g.add(s);
    return g;}
];

/* ---------------- Input ---------------- */
const keys={};
addEventListener('keydown',e=>{keys[e.code]=true;
  if(Game.isRace()&&e.code==='KeyF'){e.preventDefault();Game.tryPlant(0);}
  else if(Game.isRace()&&e.code==='KeyL'){e.preventDefault();Game.tryPlant(1);}
  else if(!Game.isRace()&&(e.code==='Space'||e.code==='KeyE')){e.preventDefault();Game.tryPlant(0);}});
addEventListener('keyup',e=>keys[e.code]=false);
const joy={active:false,x:0,y:0,id:null};
const agentInput={x:0,z:0,until:0};
const mouseMoveTarget={active:false,pos:new THREE.Vector3()};
const joyEl=$('joy'),knob=$('joyKnob');
function joyMove(t){const r=joyEl.getBoundingClientRect();
  let dx=t.clientX-(r.left+r.width/2),dy=t.clientY-(r.top+r.height/2);
  const L=Math.hypot(dx,dy),max=r.width/2-10;
  if(L>max){dx*=max/L;dy*=max/L;}
  knob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
  joy.x=dx/max;joy.y=dy/max;}
joyEl.addEventListener('touchstart',e=>{e.preventDefault();joy.active=true;joy.id=e.changedTouches[0].identifier;joyMove(e.changedTouches[0]);},{passive:false});
addEventListener('touchmove',e=>{if(!joy.active)return;
  for(const t of e.changedTouches)if(t.identifier===joy.id){e.preventDefault();joyMove(t);}},{passive:false});
addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===joy.id){
  joy.active=false;joy.x=joy.y=0;knob.style.transform='translate(-50%,-50%)';}});
$('actBtn').addEventListener('touchstart',e=>{e.preventDefault();Game.tryPlant();},{passive:false});
$('actBtn').addEventListener('click',()=>Game.tryPlant());
const CAMERA_DEFAULT={mode:'follow',yaw:0,zoom:1};
const CAMERA_MODES=['follow','close','top'];
const cameraState={
  mode:localStorage.getItem('cleanGarden.cameraMode')||CAMERA_DEFAULT.mode,
  yaw:Number(localStorage.getItem('cleanGarden.cameraYaw')||CAMERA_DEFAULT.yaw),
  zoom:Number(localStorage.getItem('cleanGarden.cameraZoom')||CAMERA_DEFAULT.zoom),
  dragging:false,lastX:0,lastY:0,moved:false
};
function saveCamera(){
  localStorage.setItem('cleanGarden.cameraMode',cameraState.mode);
  localStorage.setItem('cleanGarden.cameraYaw',String(cameraState.yaw));
  localStorage.setItem('cleanGarden.cameraZoom',String(cameraState.zoom));
}
function resetCameraView(){
  cameraState.mode=CAMERA_DEFAULT.mode;cameraState.yaw=CAMERA_DEFAULT.yaw;cameraState.zoom=CAMERA_DEFAULT.zoom;
  saveCamera();
}
function toggleCameraView(){
  const index=CAMERA_MODES.indexOf(cameraState.mode);
  cameraState.mode=CAMERA_MODES[(index+1)%CAMERA_MODES.length]||CAMERA_DEFAULT.mode;
  saveCamera();
}
const pointerNdc=new THREE.Vector2();
const groundRaycaster=new THREE.Raycaster();
const groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
const groundHit=new THREE.Vector3();
function setMouseMoveTarget(e){
  pointerNdc.set((e.clientX/innerWidth)*2-1,-(e.clientY/innerHeight)*2+1);
  groundRaycaster.setFromCamera(pointerNdc,camera);
  if(!groundRaycaster.ray.intersectPlane(groundPlane,groundHit))return false;
  const d=Math.hypot(groundHit.x,groundHit.z);
  if(d>WORLD_R+6){const s=(WORLD_R+6)/d;groundHit.x*=s;groundHit.z*=s;}
  mouseMoveTarget.pos.copy(groundHit);
  mouseMoveTarget.active=true;
  return true;
}
renderer.domElement.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||(e.button!==0&&e.button!==2))return;
  cameraState.dragging=true;cameraState.lastX=e.clientX;cameraState.lastY=e.clientY;cameraState.moved=false;
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener('pointermove',e=>{
  if(!cameraState.dragging)return;
  const dx=e.clientX-cameraState.lastX,dy=e.clientY-cameraState.lastY;
  if(Math.abs(dx)+Math.abs(dy)>3)cameraState.moved=true;
  cameraState.lastX=e.clientX;cameraState.lastY=e.clientY;
  if(cameraState.moved){cameraState.yaw+=dx*.01;cameraState.zoom=clamp(cameraState.zoom+dy*.003,.65,1.7);saveCamera();}
});
renderer.domElement.addEventListener('pointerup',e=>{
  if(!cameraState.dragging)return;
  cameraState.dragging=false;
  renderer.domElement.releasePointerCapture(e.pointerId);
  if(!cameraState.moved){
    if(e.button===2||e.shiftKey)setMouseMoveTarget(e);
    else Game.tryPlant();
  }
});
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('wheel',e=>{
  e.preventDefault();
  cameraState.zoom=clamp(cameraState.zoom+Math.sign(e.deltaY)*.08,.65,1.7);
  saveCamera();
},{passive:false});
const isTouch=hasTouchInput();
$('sndBtn').onclick=()=>{Snd.on=!Snd.on;$('sndBtn').textContent=Snd.on?'🔊':'🔇';};
$('exitBtn').onclick=()=>exitGame();
$('viewBtn').onclick=()=>toggleCameraView();
$('resetViewBtn').onclick=()=>resetCameraView();

/* ---------------- UI helpers ---------------- */
const notesEl=$('notes');
function note(msg,good=false,ms=2600){
  const d=document.createElement('div');d.className='note'+(good?' good':'');d.textContent=msg;
  notesEl.appendChild(d);
  while(notesEl.children.length>3)notesEl.firstChild.remove();
  setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),400);},ms);}
function popText(worldPos,txt){
  const v=worldPos.clone().project(camera);
  if(v.z>1)return;
  const d=document.createElement('div');d.className='pop';d.textContent=txt;
  d.style.left=((v.x*.5+.5)*innerWidth)+'px';
  d.style.top=((-v.y*.5+.5)*innerHeight)+'px';
  $('hud').appendChild(d);setTimeout(()=>d.remove(),1000);}
function confetti(){
  const cols=['#ffd166','#3fa34d','#ff6b9d','#74c0fc','#c084fc','#ff8c42'];
  for(let i=0;i<70;i++){const c=document.createElement('div');c.className='conf';
    c.style.left=rand(0,100)+'vw';c.style.background=pick(cols);
    c.style.animationDuration=rand(1.6,3.2)+'s';c.style.animationDelay=rand(0,.6)+'s';
    c.style.borderRadius=random()<.5?'50%':'2px';
    document.body.appendChild(c);setTimeout(()=>c.remove(),4200);}}

/* sparkle particle bursts */
const bursts=[];
function burst(pos,color=0xffd166,n=14,spd=4){
  const geo=new THREE.BufferGeometry();
  const arr=new Float32Array(n*3),vel=[];
  for(let i=0;i<n;i++){arr[i*3]=pos.x;arr[i*3+1]=pos.y;arr[i*3+2]=pos.z;
    vel.push(new THREE.Vector3(rand(-1,1),rand(.5,1.6),rand(-1,1)).normalize().multiplyScalar(rand(spd*.5,spd)));}
  geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
  const m=new THREE.Points(geo,new THREE.PointsMaterial({color,size:.22,transparent:true,opacity:1}));
  scene.add(m);bursts.push({m,vel,life:0});}
function updateBursts(dt){
  for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.life+=dt;
    const p=b.m.geometry.attributes.position;
    for(let j=0;j<b.vel.length;j++){b.vel[j].y-=6*dt;
      p.array[j*3]+=b.vel[j].x*dt;p.array[j*3+1]+=b.vel[j].y*dt;p.array[j*3+2]+=b.vel[j].z*dt;}
    p.needsUpdate=true;b.m.material.opacity=1-b.life/.9;
    if(b.life>.9){scene.remove(b.m);b.m.geometry.dispose();b.m.material.dispose();bursts.splice(i,1);}}}

/* ---------------- Fun copy ---------------- */
function line(group){
  const pack=ACTIVE_I18N[activeLocale]||ACTIVE_I18N.en;
  const lines=(pack.lines&&pack.lines[group])||(ACTIVE_I18N.en.lines&&ACTIVE_I18N.en.lines[group])||[group];
  return pick(lines);
}

/* ---------------- Game entities ---------------- */
function createActiveGameplayState(){
  return {
    player:{pos:plainPos(6,0,6),vel:plainPos(0,0,0),yaw:0,anim:0},
    player2:{pos:plainPos(-6,0,6),vel:plainPos(0,0,0),yaw:0,anim:0},
    trash:[],
    patches:[],
    villains:[],
    mtermish:null,
  };
}
const playerMesh=buildNaqi();
applyAvatarStyle(playerMesh,avatarSettings);
scene.add(playerMesh);
const player2Mesh=buildNaqi();
tintNaqiBlue(player2Mesh);
player2Mesh.visible=false;
player2Mesh.scale.setScalar(.92);
const player2Marker=new THREE.Mesh(new THREE.TorusGeometry(.72,.06,12,36),mat(0x4dabf7));
player2Marker.rotation.x=Math.PI/2;player2Marker.position.y=.08;player2Mesh.add(player2Marker);
scene.add(player2Mesh);
const trashMeshes=new WeakMap();
const patchViews=new WeakMap();
const villainViews=new WeakMap();
function setTrashMesh(item,mesh){trashMeshes.set(item,mesh);return item;}
function trashMesh(item){return trashMeshes.get(item);}
function setPatchView(patch,view){patchViews.set(patch,view);return patch;}
function patchView(patch){return patchViews.get(patch);}
function setVillainView(villain,view){villainViews.set(villain,view);return villain;}
function villainView(villain){return villainViews.get(villain);}
function plantPatchView(patch){
  const view=patchView(patch);
  if(!view)return;
  view.tree=makeTree();view.tree.scale.setScalar(.01);
  setObjectPosition(view.tree,patch.pos);scene.add(view.tree);
  view.ring.visible=false;
}
function createTrashView(item){
  const m=trashBuilders[randi(0,trashBuilders.length-1)]();
  m.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  setObjectPosition(m,item.pos);
  m.rotation.y=item.spin;
  scene.add(m);
  setTrashMesh(item,m);
  return m;
}
function createPatchView(patch){
  const g=new THREE.Group();
  const soil=new THREE.Mesh(new THREE.CircleGeometry(1.4,20),mat(0x6d4a2f));
  soil.rotation.x=-Math.PI/2;soil.position.y=.03;g.add(soil);
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.5,1.75,24),
    new THREE.MeshBasicMaterial({color:0x9ef01a,transparent:true,opacity:.8,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.05;g.add(ring);
  setObjectPosition(g,patch.pos);
  scene.add(g);
  setPatchView(patch,{mesh:g,ring,tree:null});
  return g;
}
function createVillainView(villain){
  const m=villain.boss?buildMtermish():buildMinion();
  setObjectPosition(m,villain.pos);
  scene.add(m);
  setVillainView(villain,{mesh:m});
  return m;
}
function convertVillainView(villain){
  villainView(villain)?.mesh?.traverse(o=>{if(o.isMesh&&o.material===mat(0x9c6bd6))o.material=mat(0x51cf66);});
}
function removeTrashView(item){
  removeAttemptObject(trashMesh(item));
}
function removeVillainView(villain){
  removeAttemptObject(villainView(villain)?.mesh);
}

function activeMissionState(){
  return {
    trash:Game.state.trash,
    patches:Game.state.patches,
    converted:Game.converted,
    quota:Game.quota,
    spawnedBoss:Game.spawnedBoss,
    boss:Game.state.mtermish,
  };
}
function activeModeObjectives(){
  return currentActiveModeDefinition().objectives||[];
}
function activeModeScore(rule){
  const value=currentActiveModeDefinition().scoring?.[rule]??0;
  return typeof value==='function'?value(Game):value;
}
function activeObjectiveRows(objectives,state){
  return objectives.map(objective=>{
    const done=Boolean(objective.done(state));
    const value=objective.value?objective.value(state):'';
    return {done,icon:done?(objective.completeIcon||'✅'):objective.icon,label:tr(objective.labelKey),value};
  });
}
function renderActiveMissionHtml(rows){
  return rows.map(row=>`<div class="${row.done?'done':''}">${row.icon} ${row.label}${row.value?`: <b>${row.value}</b>`:''}</div>`).join('');
}

function spawnTrash(pos){
  if(Game.state.trash.length>=45)return { spawned:false, reason:'cap' };
  const trashPos=plainPos();
  if(pos)setPlainPos(trashPos,pos.x,0,pos.z);
  else{const a=random()*Math.PI*2,r=rand(4,WORLD_R-2);
    setPlainPos(trashPos,Math.cos(a)*r,0,Math.sin(a)*r);}
  const item={pos:trashPos,spin:random()*Math.PI*2};
  createTrashView(item);
  Game.state.trash.push(item);
  return { spawned:true };
}

function spawnPatch(){
  const a=random()*Math.PI*2,r=rand(7,WORLD_R-6);
  const patchPos=plainPos(Math.cos(a)*r,0,Math.sin(a)*r);
  const patch={pos:patchPos,planted:false,grow:0};
  createPatchView(patch);
  Game.state.patches.push(patch);}

function spawnVillain(boss=false){
  const a=random()*Math.PI*2,r=WORLD_R+4;
  const villainPos=plainPos(Math.cos(a)*r,0,Math.sin(a)*r);
  const v={pos:villainPos,boss,hp:boss?3:1,state:'walk',t:0,
    target:plainPos(),drop:rand(2.5,5),hitCd:0,speed:boss?3.4:rand(1.8,2.6)};
  createVillainView(v);
  newTarget(v);Game.state.villains.push(v);
  if(boss){Game.state.mtermish=v;note(line('mtermishTaunt'));Snd.laugh();}
  return v;}
function newTarget(v){const a=random()*Math.PI*2,r=rand(5,WORLD_R-3);
  setPlainPos(v.target,Math.cos(a)*r,0,Math.sin(a)*r);}

function isSharedMaterial(material){
  return Object.values(MAT).includes(material);
}
function disposeAttemptObject(obj){
  if(!obj)return;
  obj.traverse(o=>{
    if(!o.isMesh&&!o.isPoints)return;
    if(o.geometry)o.geometry.dispose();
    const materials=Array.isArray(o.material)?o.material:[o.material];
    for(const material of materials){
      if(material&&!isSharedMaterial(material)&&material!==groundMat)material.dispose();
    }
  });
}
function removeAttemptObject(obj){
  if(!obj)return;
  scene.remove(obj);
  disposeAttemptObject(obj);
}
function cleanupLevelAttempt(){
  Game.state.trash.forEach(t=>removeAttemptObject(trashMesh(t)));
  Game.state.trash.length=0;
  Game.state.villains.forEach(v=>removeAttemptObject(villainView(v)?.mesh));
  Game.state.villains.length=0;
  Game.state.patches.forEach(p=>{
    const view=patchView(p);
    removeAttemptObject(view?.tree);
    removeAttemptObject(view?.mesh);
  });
  Game.state.patches.length=0;
  Game.state.mtermish=null;
}
function cleanupDecorativeWorld(){
  worldObjects.forEach(removeAttemptObject);
  worldObjects.length=0;
  flowers.length=0;
  clouds.length=0;
}
function formatTime(seconds){
  const safe=Math.max(0,seconds||0);
  const minutes=Math.floor(safe/60);
  const secs=safe-minutes*60;
  return `${minutes}:${secs.toFixed(1).padStart(4,'0')}`;
}
function bestTimeKey(level){
  return `cleanGarden.best.single.level.${level}`;
}
function readBestTime(level){
  const value=Number(localStorage.getItem(bestTimeKey(level)));
  return Number.isFinite(value)&&value>0?value:null;
}
function recordBestTime(level,seconds){
  const prev=readBestTime(level);
  if(prev===null||seconds<prev){
    localStorage.setItem(bestTimeKey(level),String(seconds));
    return { best:seconds, isNew:true, previous:prev };
  }
  return { best:prev, isNew:false, previous:prev };
}
buildDecorativeWorld(1);

/* ---------------- Game state ---------------- */
function createActiveGameRuntime(state){
return {
  state,status:'menu',running:false,level:1,score:0,trees:0,lifetimeTrees:0,trashGot:0,
  playerScores:[0,0],quota:0,spawned:0,converted:0,spawnTimer:0,nearPatch:null,nearPatch2:null,plantCd:0,plantCd2:0,bossDelay:0,elapsed:0,seed:activeSeed,

  isRace(){
    return currentActiveModeDefinition().simultaneous===true;
  },

  activePlayers(){
    return this.isRace()?[this.state.player,this.state.player2]:[this.state.player];
  },

  playerScoreLabel(){
    return this.isRace()?`P1 ${this.playerScores[0]} | P2 ${this.playerScores[1]}`:String(this.score);
  },

  setStatus(status){
    this.status=status;
    this.running=status==='running';
  },

  startRunning(){
    this.setStatus('running');
  },

  pause(){
    if(this.status==='running')this.setStatus('paused');
  },

  resume(){
    if(this.status==='paused')this.setStatus('running');
  },

  complete(){
    this.setStatus('complete');
  },

  exit(){
    this.setStatus('exited');
    this.clearTimers();
  },

  clearTimers(){
    this.bossDelay=0;
  },

  startLevel(n,options={}){
    this.startRunning();
    this.clearTimers();
    const seed=setActiveSeed(options.seed||makeAttemptSeed(n));
    this.seed=seed;
    console.info(`[CleanGarden] level ${n} seed: ${seed}`);
    cleanupLevelAttempt();
    cleanupDecorativeWorld();
    buildDecorativeWorld(n);
    this.level=n;this.converted=0;this.spawned=0;this.spawnTimer=2;this.trees=0;this.nearPatch=null;this.nearPatch2=null;this.plantCd=0;this.plantCd2=0;this.elapsed=0;
    this.score=0;this.playerScores=[0,0];$('uiScore').textContent=this.playerScoreLabel();
    const nTrash=9+n*3, nPatch=2+Math.min(n,5);
    for(let i=0;i<nTrash;i++)spawnTrash();
    for(let i=0;i<nPatch;i++)spawnPatch();
    this.quota=Math.min(18,1+n*2);
    this.spawnedBoss=false;
    this.bossDelay=4;
    this.polMax=nTrash*3+nPatch*6+18;
    setPlainPos(this.state.player.pos,6,0,6);setPlainPos(this.state.player.vel,0,0,0);
    setPlainPos(this.state.player2.pos,-6,0,6);setPlainPos(this.state.player2.vel,0,0,0);
    player2Mesh.visible=this.isRace();
    $('uiLevel').textContent=n;$('uiTrees').textContent=this.trees;
    note(tr('levelStart',n),true,3200);
    this.updateMission();
  },

  updateTimers(dt){
    this.elapsed+=dt;
    if(!this.spawnedBoss&&this.bossDelay>0){
      this.bossDelay-=dt;
      if(this.bossDelay<=0){
        this.spawnedBoss=true;
        spawnVillain(true);
        this.updateMission();
      }
    }
  },

  tryPlant(playerIndex=0){
    const near=playerIndex===1?this.nearPatch2:this.nearPatch;
    const cd=playerIndex===1?this.plantCd2:this.plantCd;
    if(!this.running||!near||cd>0)return;
    const p=near;p.planted=true;p.grow=0;
    plantPatchView(p);
    this.trees++;this.lifetimeTrees++;this.addScore(activeModeScore('plant'),plainToVector(p.pos,2),playerIndex);
    if(playerIndex===1)this.plantCd2=.6;else this.plantCd=.6;
    Snd.plant();burst(plainToVector(p.pos,1),0x9ef01a,18,3.5);
    note(line('plant'),true);
    $('uiTrees').textContent=this.trees;
    this.updateMission();
  },

  addScore(v,pos,playerIndex=0){
    this.score+=v;
    if(this.isRace())this.playerScores[playerIndex]+=v;
    $('uiScore').textContent=this.playerScoreLabel();
    if(pos)popText(pos,this.isRace()?`P${playerIndex+1} +${v}`:'+'+v);
  },

  pollution(){
    const total=this.state.trash.length*3+this.state.villains.length*9+this.state.patches.filter(p=>!p.planted).length*6;
    this.polMax=Math.max(this.polMax||60,total,1);
    return clamp(total/(this.polMax||60)*100,0,100);},

  updateMission(){
    const raceScores=this.isRace()?`<div class="raceScores">🏁 P1: <b>${this.playerScores[0]}</b> &nbsp; P2: <b>${this.playerScores[1]}</b></div>`:'';
    $('missionCard').innerHTML=renderActiveMissionHtml(activeObjectiveRows(activeModeObjectives(),activeMissionState()))+raceScores;
  },
  bossDefeated(){return this.spawnedBoss&&(!this.state.mtermish);},

  checkWin(){
    if(this.state.trash.length===0&&this.state.patches.every(p=>p.planted)&&
       this.converted>=this.quota&&this.spawned>=this.quota&&this.bossDefeated()){
      this.complete();
      Snd.fanfare();confetti();
      const completionBonus=activeModeScore('levelComplete');
      if(this.isRace()){
        this.addScore(completionBonus,undefined,0);
        this.addScore(completionBonus,undefined,1);
      }else this.addScore(completionBonus);
      const raceWinner=this.isRace()?(this.playerScores[0]===this.playerScores[1]?'Tie':(this.playerScores[0]>this.playerScores[1]?'P1 wins':'P2 wins')):null;
      const result=recordBestTime(this.level,this.elapsed);
      rememberScore(this.score);
      $('stScore').textContent=this.score;
      $('stTrees').textContent=this.trees;
      $('stTrash').textContent=this.trashGot;
      $('stTime').textContent=formatTime(this.elapsed);
      $('stBest').textContent=formatTime(result.best);
      $('lvlQuote').textContent=line('quotes');
      $('lvlTitle').textContent=raceWinner?`${tr('levelDone',this.level)} ${raceWinner}`:tr('levelDone',this.level);
      $('lvlOverlay').style.display='flex';
    }
  }
};}
const Game=createActiveGameRuntime(createActiveGameplayState());

/* ---------------- Update loop ---------------- */
const clock=new THREE.Clock();
const camTarget=new THREE.Vector3();
const cameraOffset=new THREE.Vector3();
function currentCameraOffset(){
  if(cameraState.mode==='top')return cameraOffset.set(0,34*cameraState.zoom,.01);
  const close=cameraState.mode==='close';
  const dist=(close?8:15)*cameraState.zoom,height=(close?6:13)*cameraState.zoom;
  return cameraOffset.set(Math.sin(cameraState.yaw)*dist,height,Math.cos(cameraState.yaw)*dist);
}
camera.position.copy(currentCameraOffset());

function playerInputVector(playerIndex){
  let ix=0,iz=0,worldX=0,worldZ=0;
  if(playerIndex===1){
    if(keys.ArrowUp)iz-=1;
    if(keys.ArrowDown)iz+=1;
    if(keys.ArrowLeft)ix-=1;
    if(keys.ArrowRight)ix+=1;
  }else{
    if(keys.KeyW||(!Game.isRace()&&keys.ArrowUp))iz-=1;
    if(keys.KeyS||(!Game.isRace()&&keys.ArrowDown))iz+=1;
    if(keys.KeyA||(!Game.isRace()&&keys.ArrowLeft))ix-=1;
    if(keys.KeyD||(!Game.isRace()&&keys.ArrowRight))ix+=1;
    ix+=joy.x;iz+=joy.y;
    if(performance.now()<agentInput.until){worldX+=agentInput.x;worldZ+=agentInput.z;}
    else{agentInput.x=0;agentInput.z=0;}
    if(ix||iz)mouseMoveTarget.active=false;
    if(mouseMoveTarget.active){
      const dx=mouseMoveTarget.pos.x-Game.state.player.pos.x,dz=mouseMoveTarget.pos.z-Game.state.player.pos.z;
      const dist=Math.hypot(dx,dz);
      if(dist<.45)mouseMoveTarget.active=false;
      else{worldX+=dx/dist;worldZ+=dz/dist;}
    }
  }
  const L=Math.hypot(ix,iz);
  if(L>1){ix/=L;iz/=L;}
  if(ix||iz){
    const yaw=cameraState.mode==='top'?0:cameraState.yaw;
    worldX+=ix*Math.cos(yaw)+iz*Math.sin(yaw);
    worldZ+=-ix*Math.sin(yaw)+iz*Math.cos(yaw);
  }
  const WL=Math.hypot(worldX,worldZ);
  if(WL>1){worldX/=WL;worldZ/=WL;}
  return {ix:worldX,iz:worldZ};
}
function updatePlayerState(player,dt,playerIndex=0){
  const {ix,iz}=playerInputVector(playerIndex);
  const SPEED=8;
  const lag=(ix||iz)?.06:.09;
  player.vel.x=smooth(player.vel.x,ix*SPEED,lag,dt);
  player.vel.z=smooth(player.vel.z,iz*SPEED,lag,dt);
  player.pos.x+=player.vel.x*dt;
  player.pos.z+=player.vel.z*dt;
  const d=Math.hypot(player.pos.x,player.pos.z);
  if(d>WORLD_R+6){const s=(WORLD_R+6)/d;player.pos.x*=s;player.pos.z*=s;}
  const dc=Math.hypot(player.pos.x,player.pos.z);
  if(dc<2.6){const s=2.6/Math.max(dc,.001);player.pos.x*=s;player.pos.z*=s;}
  const spd=Math.hypot(player.vel.x,player.vel.z);
  if(spd>.4){const targetYaw=Math.atan2(player.vel.x,player.vel.z);
    let dy=targetYaw-player.yaw;
    while(dy>Math.PI)dy-=Math.PI*2;while(dy<-Math.PI)dy+=Math.PI*2;
    player.yaw+=dy*Math.min(1,dt*12);}
  player.anim+=dt*(3+spd*1.4);
}
function playerUpdate(dt){
  updatePlayerState(Game.state.player,dt,0);
  if(Game.isRace())updatePlayerState(Game.state.player2,dt,1);
}
function nearestActivePlayer(pos){
  let best={player:Game.state.player,index:0,distance:plainDistance(pos,Game.state.player.pos)};
  if(Game.isRace()){
    const d2=plainDistance(pos,Game.state.player2.pos);
    if(d2<best.distance)best={player:Game.state.player2,index:1,distance:d2};
  }
  return best;
}

function villainsUpdate(dt){
  for(let i=Game.state.villains.length-1;i>=0;i--){
    const v=Game.state.villains[i];v.t+=dt;v.hitCd-=dt;
    if(v.state==='walk'){
      if(v.boss){
        const nearest=nearestActivePlayer(v.pos);
        const toPlayerX=nearest.player.pos.x-v.pos.x,toPlayerZ=nearest.player.pos.z-v.pos.z;
        const toPlayerDist=Math.hypot(toPlayerX,toPlayerZ);
        if(toPlayerDist<8){
          const scale=12/Math.max(toPlayerDist,.001);
          v.target.x=v.pos.x-toPlayerX*scale;v.target.y=0;v.target.z=v.pos.z-toPlayerZ*scale;
          const dT=Math.hypot(v.target.x,v.target.z);
          if(dT>WORLD_R-3){const s=(WORLD_R-3)/dT;v.target.x*=s;v.target.z*=s;}}}
      const dirX=v.target.x-v.pos.x,dirZ=v.target.z-v.pos.z;
      const dirLen=Math.hypot(dirX,dirZ);
      if(dirLen<1){newTarget(v);}
      else{
        const nx=dirX/dirLen,nz=dirZ/dirLen;
        v.pos.x+=nx*v.speed*dt;v.pos.z+=nz*v.speed*dt;
        v.yaw=Math.atan2(nx,nz);}
      v.drop-=dt;
      if(v.drop<=0){v.drop=v.boss?rand(2,3.5):rand(3.5,6.5);
        const inD=Math.hypot(v.pos.x,v.pos.z);
        const dropResult=inD<WORLD_R?spawnTrash(v.pos):{ spawned:false, reason:'outside-world' };
        if(dropResult.spawned&&random()<.25)note(line('mtermishTaunt'),false,1800);
        if(dropResult.spawned)Game.updateMission();}
      if(v.hitCd<=0){
        const nearest=nearestActivePlayer(v.pos);
        if(nearest.distance<(v.boss?2.2:1.5)){
          v.hitCd=.9;v.hp--;
          burst(plainToVector(v.pos,1.2),v.boss?0xc084fc:0xffd166,16,4.5);
          if(v.hp<=0){
            v.state='convert';v.t=0;Snd.convert();
            convertVillainView(v);
            if(v.boss){note(line('mtermishDown'),true,3000);Game.addScore(activeModeScore('bossDefeat'),plainToVector(v.pos,2.5),nearest.index);}
            else{note(line('minion'),true);Game.addScore(activeModeScore('minionConvert'),plainToVector(v.pos,2),nearest.index);}
          }else{Snd.bonk();note(line('mtermishHit'),false,2000);
            Game.addScore(activeModeScore('villainHit'),plainToVector(v.pos,2.5),nearest.index);
            const awayX=v.pos.x-nearest.player.pos.x,awayZ=v.pos.z-nearest.player.pos.z;
            const awayLen=Math.max(Math.hypot(awayX,awayZ),.001);
            v.target.x=v.pos.x+(awayX/awayLen)*9;v.target.y=0;v.target.z=v.pos.z+(awayZ/awayLen)*9;}
        }}
    }else if(v.state==='convert'){
      const s=Math.max(.01,1-(v.t-.7)*2)* (v.boss?1.7:1);
      if(v.t>.7)v.visualScale=s;
      if(v.t>1.2){
        burst(plainToVector(v.pos,1),0x51cf66,20,5);
        removeVillainView(v);Game.state.villains.splice(i,1);
        if(v.boss)Game.state.mtermish=null;else Game.converted++;
        Game.updateMission();Game.checkWin();
      }
    }
  }
  if(Game.spawned<Game.quota){
    Game.spawnTimer-=dt;
    if(Game.spawnTimer<=0){Game.spawnTimer=rand(Math.max(2.5,5-Game.level*.2),Math.max(3.6,8-Game.level*.28));Game.spawned++;spawnVillain(false);}
  }
}

function trashUpdate(dt){
  for(let i=Game.state.trash.length-1;i>=0;i--){
    const t=Game.state.trash[i];
    t.spin=(t.spin||0)+dt*.8;
    const nearest=nearestActivePlayer(t.pos);
    if(nearest.distance<1.35){
      burst(plainToVector(t.pos,.6),0xffd166,10,3);
      Snd.pickup();
      Game.trashGot++;$('uiTrash').textContent=Game.trashGot;
      Game.addScore(activeModeScore('trash'),plainToVector(t.pos,1.4),nearest.index);
      if(random()<.3)note(line('pickup'),true,1500);
      removeTrashView(t);Game.state.trash.splice(i,1);
      Game.updateMission();Game.checkWin();
    }}}

function patchesUpdate(dt,time){
  Game.plantCd-=dt;
  Game.plantCd2-=dt;
  Game.nearPatch=null;Game.nearPatch2=null;
  for(const p of Game.state.patches){
    if(p.planted){
      if(p.grow<1)p.grow=Math.min(1,p.grow+dt*.9);
      continue;}
    if(plainDistance(p.pos,Game.state.player.pos)<2.2)Game.nearPatch=p;
    if(Game.isRace()&&plainDistance(p.pos,Game.state.player2.pos)<2.2)Game.nearPatch2=p;
  }
  $('prompt').style.display=((Game.nearPatch||Game.nearPatch2)&&Game.running)?'block':'none';
}

function syncGameplayMeshes(dt,time){
  setObjectPosition(playerMesh,Game.state.player.pos);
  playerMesh.rotation.y=Game.state.player.yaw;
  const spd=Math.hypot(Game.state.player.vel.x,Game.state.player.vel.z);
  const sw=Math.sin(Game.state.player.anim*4)*clamp(spd/8,0,1);
  const {arms,legs}=playerMesh.userData;
  arms[0].rotation.x=sw*.9;arms[1].rotation.x=-sw*.9;
  legs[0].rotation.x=-sw*.8;legs[1].rotation.x=sw*.8;
  playerMesh.position.y=Math.abs(Math.sin(Game.state.player.anim*4))*.1*clamp(spd/8,0,1);
  player2Mesh.visible=Game.isRace()&&Game.status!=='menu'&&Game.status!=='exited';
  if(player2Mesh.visible){
    setObjectPosition(player2Mesh,Game.state.player2.pos);
    player2Mesh.rotation.y=Game.state.player2.yaw;
    const spd2=Math.hypot(Game.state.player2.vel.x,Game.state.player2.vel.z);
    const sw2=Math.sin(Game.state.player2.anim*4)*clamp(spd2/8,0,1);
    const parts=player2Mesh.userData;
    parts.arms[0].rotation.x=sw2*.9;parts.arms[1].rotation.x=-sw2*.9;
    parts.legs[0].rotation.x=-sw2*.8;parts.legs[1].rotation.x=sw2*.8;
    player2Mesh.position.y=Math.abs(Math.sin(Game.state.player2.anim*4))*.1*clamp(spd2/8,0,1);
  }

  for(const v of Game.state.villains){
    const view=villainView(v);
    const mesh=view?.mesh;
    if(!mesh)continue;
    setObjectPosition(mesh,v.pos);
    if(v.state==='walk'){
      if(Number.isFinite(v.yaw))mesh.rotation.y=v.yaw;
      mesh.position.y=Math.abs(Math.sin(v.t*8))*.12;
      mesh.rotation.z=Math.sin(v.t*8)*.08;
    }else if(v.state==='convert'){
      mesh.rotation.y+=dt*14;
      mesh.position.y=Math.abs(Math.sin(v.t*9))*.6;
      if(Number.isFinite(v.visualScale))mesh.scale.setScalar(v.visualScale);
    }
  }

  for(const t of Game.state.trash){
    const mesh=trashMesh(t);
    if(!mesh)continue;
    setObjectPosition(mesh,t.pos);
    mesh.rotation.y=t.spin||0;
  }

  for(const p of Game.state.patches){
    const view=patchView(p);
    if(!view)continue;
    setObjectPosition(view.mesh,p.pos);
    if(p.planted&&view.tree){
      const e=1-Math.pow(1-p.grow,3);
      setObjectPosition(view.tree,p.pos);
      view.tree.scale.setScalar(p.grow>=1?1:.01+e*(0.85+Math.sin(p.grow*Math.PI)*.25));
    }
    if(!p.planted){
      view.ring.material.opacity=.55+Math.sin(time*4)*.3;
      view.ring.scale.setScalar(1+Math.sin(time*4)*.06);
    }
  }
}

function updatePollutionVisuals(){
  const pol=Game.pollution()/100;
  groundMat.color.lerpColors(worldColors.grassClean,worldColors.grassDirty,pol);
  scene.background.lerpColors(worldColors.skyClean,worldColors.skyDirty,pol);
  scene.fog.color.lerpColors(worldColors.fogClean,worldColors.fogDirty,pol);
  const pct=Math.round((1-pol)*100);
  $('meterPct').textContent=pct+'%';
  const f=$('meterFill');f.style.width=pct+'%';
  f.style.background=pct>66?'linear-gradient(90deg,#51cf66,#2f9e44)':
    pct>33?'linear-gradient(90deg,#ffd166,#f59f00)':'linear-gradient(90deg,#a3742f,#7a5230)';
}
function updateVisualEnvironment(dt,time){
  for(const c of clouds){c.position.x+=c.userData.spd*dt;
    if(c.position.x>90)c.position.x=-90;}
  for(const fl of flowers){fl.rotation.z=fl.userData.base+Math.sin(time*1.6+fl.userData.sway)*.12;}
}
function envUpdate(dt,time){
  updatePollutionVisuals();
  updateVisualEnvironment(dt,time);
}

function tickGameplay(dt,time){
  if(Game.running){
    Game.updateTimers(dt);
    playerUpdate(dt);
    villainsUpdate(dt);
    trashUpdate(dt);
    patchesUpdate(dt,time);
    Game.checkWin();
  }
}

function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),.05);
  const time=clock.elapsedTime;
  tickGameplay(dt,time);
  syncGameplayMeshes(dt,time);
  if(Game.running||ALLOW_PAUSED_VISUAL_ANIMATION)envUpdate(dt,time);
  updateBursts(dt);
  const focus=Game.isRace()
    ?plainPos((Game.state.player.pos.x+Game.state.player2.pos.x)/2,0,(Game.state.player.pos.z+Game.state.player2.pos.z)/2)
    :Game.state.player.pos;
  camTarget.set(focus.x,focus.y||0,focus.z).add(currentCameraOffset());
  camera.position.x=smooth(camera.position.x,camTarget.x,.18,dt);
  camera.position.y=smooth(camera.position.y,camTarget.y,.18,dt);
  camera.position.z=smooth(camera.position.z,camTarget.z,.18,dt);
  camera.lookAt(focus.x,(focus.y||0)+1.2,focus.z);
  sun.position.set(focus.x+30,45,focus.z+20);
  sun.target.position.set(focus.x,focus.y||0,focus.z);sun.target.updateMatrixWorld();
  renderer.render(scene,camera);
}
loop();

/* ---------------- Flow ---------------- */
function requestFullscreen(){
  const el=document.documentElement;
  if(document.fullscreenElement||!el.requestFullscreen)return;
  el.requestFullscreen().catch(()=>{});
}
function exitFullscreen(){
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
}
function tauriInvoke(){
  return window.__TAURI__?.core?.invoke||window.__TAURI__?.invoke||null;
}
async function closeTauriWindowAfterConfirm(){
  const invoke=tauriInvoke();
  if(!invoke)return false;
  if(!window.confirm(`${tr('exit')}?`))return true;
  try{
    await invoke('close_window');
    return true;
  }catch(e){
    console.warn('Tauri close_window failed',e);
    return false;
  }
}
function showMenu(){
  $('startOverlay').style.display='flex';
  $('pauseOverlay').style.display='none';
  $('hud').style.display='none';
  $('sndBtn').style.display='none';
  $('exitBtn').style.display='none';
  $('pauseBtn').style.display='none';
  $('viewBtn').style.display='none';
  $('resetViewBtn').style.display='none';
  $('joy').style.display='none';
  $('actBtn').style.display='none';
  $('prompt').style.display='none';
  player2Mesh.visible=false;
}
async function exitGame(){
  Game.exit();
  if(await closeTauriWindowAfterConfirm())return;
  exitFullscreen();
  note(tr('exited'),true,1200);
  showMenu();
}
function pauseGame(){
  if(!Game.running)return;
  Game.pause();
  $('pauseOverlay').style.display='flex';
}
function resumeGame(){
  $('pauseOverlay').style.display='none';
  Game.resume();
}
function retryLevel(){
  $('pauseOverlay').style.display='none';
  Game.startLevel(Game.level);
}
function setActiveMode(mode){
  activeMode=normalizeActiveMode(mode);
  localStorage.setItem('cleanGarden.mode',activeMode);
  $('keysHint').innerHTML=controlsHelpText();
  $('prompt').textContent=plantPromptText();
  document.querySelectorAll('.modeOption').forEach(btn=>{
    const selected=btn.dataset.mode===activeMode;
    btn.classList.toggle('active',selected);
    btn.setAttribute('aria-pressed',String(selected));
  });
}
function syncAvatarControls(){
  $('genderSelect').value=avatarSettings.gender;
  $('clothesSelect').value=avatarSettings.clothes;
}
function setAvatarFromMenu(){
  applyAvatarStyle(playerMesh,{gender:$('genderSelect').value,clothes:$('clothesSelect').value});
  syncAvatarControls();
}
$('startBtn').onclick=()=>{
  Snd.init();
  requestFullscreen();
  $('startOverlay').style.display='none';
  $('hud').style.display='block';
  $('sndBtn').style.display='block';
  $('exitBtn').style.display='block';
  $('pauseBtn').style.display='block';
  $('viewBtn').style.display='block';
  $('resetViewBtn').style.display='block';
  if(isTouch){$('joy').style.display='block';$('actBtn').style.display='flex';}
  Game.startLevel(1);
};
$('nextBtn').onclick=()=>{
  $('lvlOverlay').style.display='none';
  $('exitBtn').style.display='block';
  $('pauseBtn').style.display='block';
  $('viewBtn').style.display='block';
  $('resetViewBtn').style.display='block';
  Game.startLevel(Game.level+1);
};
$('languageSelect').onchange=e=>applyLocale(e.target.value);
$('genderSelect').onchange=setAvatarFromMenu;
$('clothesSelect').onchange=setAvatarFromMenu;
document.querySelectorAll('.modeOption').forEach(btn=>{
  btn.onclick=()=>{
    if(btn.getAttribute('aria-disabled')==='true')return;
    setActiveMode(btn.dataset.mode);
  };
});
$('pauseBtn').onclick=()=>pauseGame();
$('resumeBtn').onclick=()=>resumeGame();
$('retryBtn').onclick=()=>retryLevel();
$('menuBtn').onclick=()=>exitGame();
applyLocale(activeLocale);
setActiveMode(activeMode);
syncAvatarControls();
updateSavedScoreUi();

/* ---------------- Browser LLM/agent hook ---------------- */
const agentIds=new WeakMap();
const agentState={lastActAt:0,minActMs:16,maxStepFrames:30};
function agentId(prefix,obj,index){
  if(!obj)return null;
  if(!agentIds.has(obj))agentIds.set(obj,`${prefix}-${String(index+1).padStart(3,'0')}`);
  return agentIds.get(obj);
}
function q(n){return Math.round(n*100)/100;}
function vecObs(v){return { x:q(v.x), y:q(v.y||0), z:q(v.z) };}
function nearestList(items,prefix,positionOf,extra){
  return items.map((item,index)=>{
    const pos=positionOf(item);
    return {
      id:agentId(prefix,item,index),
      position:vecObs(pos),
      distance:q(plainDistance(pos,Game.state.player.pos)),
      ...extra(item)
    };
  }).sort((a,b)=>a.distance-b.distance).slice(0,8);
}
function observeAgent(){
  const planted=Game.state.patches.filter(p=>p.planted).length;
  return {
    apiVersion:1,
    deterministic:false,
    note:'Browser demo hook controls the live prototype. Use web/src/input/llm-agent.js for deterministic headless evaluation.',
    mode:activeMode,
    running:Game.running,
    locale:activeLocale,
    levelId:String(Game.level),
    seed:Game.seed,
    score:Game.score,
    elapsed:q(Game.elapsed),
    bossDelay:q(Math.max(0,Game.bossDelay)),
    objective:{
      trashLeft:Game.state.trash.length,
      patchesPlanted:planted,
      patchesTotal:Game.state.patches.length,
      minionsConverted:Game.converted,
      minionsRequired:Game.quota,
      bossDefeated:Game.bossDefeated()
    },
    player:{
      position:vecObs(Game.state.player.pos),
      velocity:vecObs(Game.state.player.vel),
      heading:q(Game.state.player.yaw)
    },
    camera:{
      mode:cameraState.mode,
      yaw:q(cameraState.yaw),
      zoom:q(cameraState.zoom),
      actions:['toggleCamera','resetCamera','setCamera']
    },
    nearest:{
      trash:nearestList(Game.state.trash,'trash',t=>t.pos,()=>({})),
      patches:nearestList(Game.state.patches,'patch',p=>p.pos,p=>({ planted:!!p.planted })),
      villains:nearestList(Game.state.villains,'villain',v=>v.pos,v=>({
        boss:!!v.boss,
        hp:v.hp,
        state:v.state
      }))
    },
    canPlant:!!(Game.running&&Game.nearPatch&&Game.plantCd<=0),
    limits:{ minActMs:agentState.minActMs, maxStepFrames:agentState.maxStepFrames }
  };
}
function moveAgent(x,z,durationMs=250){
  const L=Math.hypot(x,z);
  agentInput.x=L>1?x/L:x;
  agentInput.z=L>1?z/L:z;
  agentInput.until=performance.now()+clamp(durationMs,16,2000);
}
function moveTowardAgent(target,durationMs){
  if(!target||!target.position)return false;
  const dx=target.position.x-Game.state.player.pos.x;
  const dz=target.position.z-Game.state.player.pos.z;
  moveAgent(dx,dz,durationMs);
  return true;
}
function actAgent(action={}){
  const now=performance.now();
  if(now-agentState.lastActAt<agentState.minActMs)return { ok:false, reason:'rate_limited', observation:observeAgent() };
  agentState.lastActAt=now;
  const type=action.type||action.action;
  if(type==='move')moveAgent(Number(action.x)||0,Number(action.z)||Number(action.y)||0,action.durationMs);
  else if(type==='moveToward'){
    const obs=observeAgent();
    const all=[...obs.nearest.trash,...obs.nearest.patches,...obs.nearest.villains];
    if(!moveTowardAgent(all.find(o=>o.id===action.targetId),action.durationMs))return { ok:false, reason:'unknown_target', observation:obs };
  }else if(type==='moveToNearestTrash'||type==='collectNearest')moveTowardAgent(observeAgent().nearest.trash[0],action.durationMs);
  else if(type==='moveToNearestPatch')moveTowardAgent(observeAgent().nearest.patches.find(p=>!p.planted),action.durationMs);
  else if(type==='chaseNearestVillain'||type==='attackBoss'){
    const villainsObs=observeAgent().nearest.villains;
    moveTowardAgent(type==='attackBoss'?villainsObs.find(v=>v.boss):villainsObs[0],action.durationMs);
  }else if(type==='plant'||type==='plantNearest')Game.tryPlant();
  else if(type==='toggleCamera')toggleCameraView();
  else if(type==='resetCamera')resetCameraView();
  else if(type==='setCamera'){
    if(CAMERA_MODES.includes(action.mode))cameraState.mode=action.mode;
    if(Number.isFinite(Number(action.yaw)))cameraState.yaw=Number(action.yaw);
    if(Number.isFinite(Number(action.zoom)))cameraState.zoom=clamp(Number(action.zoom),.65,1.7);
    saveCamera();
  }
  else if(type==='pause')pauseGame();
  else if(type==='resume')resumeGame();
  else if(type==='restart'||type==='retry')retryLevel();
  else return { ok:false, reason:'unknown_action', observation:observeAgent() };
  return { ok:true, observation:observeAgent() };
}
function resetAgent(options={}){
  $('startOverlay').style.display='none';
  $('lvlOverlay').style.display='none';
  $('pauseOverlay').style.display='none';
  $('hud').style.display='block';
  $('sndBtn').style.display='block';
  $('exitBtn').style.display='block';
  $('pauseBtn').style.display='block';
  const levelId=Number(options.levelId||options.level||1);
  Game.startLevel(Number.isFinite(levelId)&&levelId>0?levelId:1,{ seed:options.seed });
  return { ok:true, seedApplied:!!options.seed, observation:observeAgent() };
}
function stepAgent(action){
  const result=action?actAgent(action):{ ok:true, observation:observeAgent() };
  const frames=clamp(Number(action&&action.frames)||1,1,agentState.maxStepFrames);
  for(let i=0;i<frames;i++)tickGameplay(1/60,clock.elapsedTime+i/60);
  envUpdate(1/60,clock.elapsedTime);
  return { ...result, observation:observeAgent() };
}
window.QuantumGardenAgent=Object.freeze({
  observe:observeAgent,
  act:actAgent,
  reset:resetAgent,
  step:stepAgent
});


