/* ============================================================
   نقي ومترميش — 3D eco adventure (enhanced trees & flowers)
============================================================ */
'use strict';
const $=id=>document.getElementById(id);
const rand=(a,b)=>a+Math.random()*(b-a);
const randi=(a,b)=>Math.floor(rand(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(cur,target,lag,dt)=>{const t=1-Math.exp(-dt/Math.max(lag,1e-4));return cur+(target-cur)*t;};

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
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('game').appendChild(renderer.domElement);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);});

const hemi=new THREE.HemisphereLight(0xcfe8ff,0x3a6b3a,.9);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff3d6,1.05);
sun.position.set(30,45,20);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-60;sun.shadow.camera.right=60;
sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;
scene.add(sun);

/* pollution → sky/grass color blending */
const COL={skyClean:new THREE.Color(0x8ecae6),skyDirty:new THREE.Color(0x9aa38a),
  grassClean:new THREE.Color(0x59b25f),grassDirty:new THREE.Color(0x8a8f57),
  fogClean:new THREE.Color(0xbfe3f2),fogDirty:new THREE.Color(0xaab098)};
scene.background=COL.skyDirty.clone();
scene.fog=new THREE.Fog(COL.fogDirty.clone(),60,160);

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
  g.userData.flower=true;g.userData.sway=Math.random()*6.28;g.userData.base=g.rotation.z;
  return g;}

function scatter(n,maker,rMin=6,rMax=WORLD_R+6,collect){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=rand(rMin,rMax);
    const o=maker();o.position.set(Math.cos(a)*r,o.position.y,Math.sin(a)*r);
    o.rotation.y=Math.random()*Math.PI*2;scene.add(o);if(collect)collect.push(o);}}

// rocks
scatter(14,()=>{const s=rand(.5,1.6);
  const m=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mat(0x9aa0a6));
  m.position.y=s*.5;m.castShadow=m.receiveShadow=true;m.scale.y=.7;return m;});
// flowers (enhanced) — kept in array for sway
const flowers=[];
scatter(70,makeFlower,5,WORLD_R+4,flowers);
// bushes
scatter(16,()=>{const g=new THREE.Group();
  for(let i=0;i<3;i++){const s=rand(.5,.9);
    const b=new THREE.Mesh(new THREE.SphereGeometry(s,8,8),leafMat(pick(GREEN_MID)));
    b.position.set(rand(-.5,.5),s*.7,rand(-.5,.5));b.castShadow=true;g.add(b);}return g;},8);
// decorative full-grown trees scattered around the island
scatter(10,makeTree,20,WORLD_R+5);
// clouds
const clouds=[];
for(let i=0;i<7;i++){const g=new THREE.Group();
  for(let j=0;j<4;j++){const s=rand(1.4,3);
    const c=new THREE.Mesh(new THREE.SphereGeometry(s,8,8),
      new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,transparent:true,opacity:.9}));
    c.position.set(j*2.2-3+rand(-.5,.5),rand(-.4,.4),rand(-1,1));g.add(c);}
  g.position.set(rand(-70,70),rand(22,32),rand(-70,70));
  g.userData.spd=rand(.5,1.2);scene.add(g);clouds.push(g);}
// big landmark tree (the "grandma tree") — enhanced broadleaf, scaled up
(function(){const g=makeBroadleaf();g.scale.setScalar(2.4);g.position.set(0,0,0);scene.add(g);})();

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
  body.scale.set(1,1.28,.98);body.position.y=.86;body.castShadow=true;g.add(body);
  // lighter belly
  const belly=new THREE.Mesh(new THREE.SphereGeometry(.42,22,18),mat(0xd8f3c4));
  belly.scale.set(.78,1.05,.52);belly.position.set(0,.8,.3);g.add(belly);
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
  cap.position.y=1.86;g.add(cap);
  const capBand=new THREE.Mesh(new THREE.TorusGeometry(.47,.045,12,26),mat(0x14532d));
  capBand.position.y=1.86;capBand.rotation.x=Math.PI/2;g.add(capBand);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.05,20),mat(GREEN_D));
  brim.position.set(0,1.85,.46);brim.scale.set(1.5,1,1);g.add(brim);
  const sproutStem=new THREE.Mesh(new THREE.CylinderGeometry(.02,.026,.18,6),mat(0x2f7d3a));
  sproutStem.position.set(0,2.28,0);g.add(sproutStem);
  const sl1=new THREE.Mesh(new THREE.SphereGeometry(.1,16,16),mat(LEAF));
  sl1.scale.set(1.4,.4,1);sl1.position.set(.07,2.38,0);sl1.rotation.z=.6;g.add(sl1);
  const sl2=new THREE.Mesh(new THREE.SphereGeometry(.085,16,16),mat(LEAF));
  sl2.scale.set(1.4,.4,1);sl2.position.set(-.06,2.34,0);sl2.rotation.z=-.7;g.add(sl2);

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
    sleeve.position.y=-.22;sleeve.castShadow=true;arm.add(sleeve);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.14,18,18),mat(SKIN));
    hand.position.y=-.48;hand.castShadow=true;arm.add(hand);
    g.add(arm);arms.push(arm);
  });

  // --- little legs (pivot at hip) ---
  const legs=[];
  [-.22,.22].forEach(x=>{
    const leg=new THREE.Group();leg.position.set(x,.5,0);
    const pant=new THREE.Mesh(new THREE.CylinderGeometry(.14,.12,.42,16),mat(0x2b7fd4));
    pant.position.y=-.21;pant.castShadow=true;leg.add(pant);
    const shoe=new THREE.Mesh(new THREE.SphereGeometry(.15,18,16),mat(0xffffff));
    shoe.scale.set(1,.65,1.5);shoe.position.set(0,-.44,.08);shoe.castShadow=true;leg.add(shoe);
    const sole=new THREE.Mesh(new THREE.SphereGeometry(.15,18,16),mat(0xe03131));
    sole.scale.set(1.02,.3,1.52);sole.position.set(0,-.5,.08);leg.add(sole);
    g.add(leg);legs.push(leg);
  });

  g.userData={arms,legs};
  return g;}

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
  if(['Space','KeyE'].includes(e.code)){e.preventDefault();Game.tryPlant();}});
addEventListener('keyup',e=>keys[e.code]=false);
const joy={active:false,x:0,y:0,id:null};
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
const isTouch='ontouchstart' in window||navigator.maxTouchPoints>0;
$('sndBtn').onclick=()=>{Snd.on=!Snd.on;$('sndBtn').textContent=Snd.on?'🔊':'🔇';};
$('exitBtn').onclick=()=>exitGame();

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
    c.style.borderRadius=Math.random()<.5?'50%':'2px';
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
const LINES={
  pickup:['رائع! قطعة أقل 🗑️','الحديقة تشكرك!','لمعان ✨','نظيف تمام!','هيّا نكمل!'],
  plant:['شجرة جديدة! 🌳','الطيور ستحب هذه!','أوكسجين مجاني للجميع 😄','يا سلام على الخضرة!'],
  minion:['تحوّل إلى صديق للطبيعة! 💚','قال: آسف يا نقي! 😅','واحد أقل من عصابة مترميش!'],
  mtermishHit:['مترميش: آي! قبعتي! 🎩','مترميش: لن تمسكني!! 😤','مترميش: حسناً حسناً... ربما أرمي أقل!'],
  mtermishDown:['مترميش: أعدك... سأستخدم سلة المهملات! 😭','مترميش استسلم! (إلى المستوى القادم 😏)'],
  mtermishTaunt:['مترميش: هاهاها! المزيد من القمامة! 😈','مترميش: النظافة مملّة! 🗑️','مترميش: حاول أن تمسكني يا نقي!'],
  quotes:['"من زرع شجرة، زرع أملاً" 🌱','نظّفنا اليوم... ونحمي الأرض غداً 🌍','كل قطعة قمامة في مكانها = كوكب أسعد 💚',
    'الأشجار بيوت العصافير... شكراً لبنائها! 🐦','بطل البيئة الحقيقي هو أنت! 🦸']
};

/* ---------------- Game entities ---------------- */
const player={mesh:buildNaqi(),pos:new THREE.Vector3(6,0,6),vel:new THREE.Vector3(),yaw:0,anim:0};
scene.add(player.mesh);
const trash=[];
const patches=[];
const villains=[];
let mtermish=null;

function spawnTrash(pos){
  if(trash.length>45)return;
  const m=trashBuilders[randi(0,trashBuilders.length-1)]();
  m.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  if(pos)m.position.set(pos.x,m.position.y,pos.z);
  else{const a=Math.random()*Math.PI*2,r=rand(4,WORLD_R-2);
    m.position.set(Math.cos(a)*r,m.position.y,Math.sin(a)*r);}
  m.rotation.y=Math.random()*Math.PI*2;
  scene.add(m);trash.push({mesh:m});}

function spawnPatch(){
  const a=Math.random()*Math.PI*2,r=rand(7,WORLD_R-6);
  const g=new THREE.Group();
  const soil=new THREE.Mesh(new THREE.CircleGeometry(1.4,20),mat(0x6d4a2f));
  soil.rotation.x=-Math.PI/2;soil.position.y=.03;g.add(soil);
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.5,1.75,24),
    new THREE.MeshBasicMaterial({color:0x9ef01a,transparent:true,opacity:.8,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.05;g.add(ring);
  g.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
  scene.add(g);patches.push({mesh:g,ring,planted:false,tree:null,grow:0});}

function spawnVillain(boss=false){
  const m=boss?buildMtermish():buildMinion();
  const a=Math.random()*Math.PI*2,r=WORLD_R+4;
  m.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
  scene.add(m);
  const v={mesh:m,boss,hp:boss?3:1,state:'walk',t:0,
    target:new THREE.Vector3(),drop:rand(2.5,5),hitCd:0,speed:boss?3.4:rand(1.8,2.6)};
  newTarget(v);villains.push(v);
  if(boss){mtermish=v;note(pick(LINES.mtermishTaunt));Snd.laugh();}
  return v;}
function newTarget(v){const a=Math.random()*Math.PI*2,r=rand(5,WORLD_R-3);
  v.target.set(Math.cos(a)*r,0,Math.sin(a)*r);}

/* ---------------- Game state ---------------- */
const Game={
  running:false,level:1,score:0,trees:0,trashGot:0,
  quota:0,spawned:0,converted:0,spawnTimer:0,nearPatch:null,plantCd:0,

  startLevel(n){
    this.level=n;this.converted=0;this.spawned=0;this.spawnTimer=2;
    trash.forEach(t=>scene.remove(t.mesh));trash.length=0;
    villains.forEach(v=>scene.remove(v.mesh));villains.length=0;mtermish=null;
    patches.forEach(p=>{if(!p.planted)scene.remove(p.mesh);});
    for(let i=patches.length-1;i>=0;i--)if(!patches[i].planted)patches.splice(i,1);
    const nTrash=9+n*3, nPatch=2+Math.min(n,5);
    for(let i=0;i<nTrash;i++)spawnTrash();
    for(let i=0;i<nPatch;i++)spawnPatch();
    this.quota=1+Math.min(n,5);
    this.spawnedBoss=false;
    this.polMax=nTrash*3+nPatch*6+18;
    player.pos.set(6,0,6);player.vel.set(0,0,0);
    $('uiLevel').textContent=n;
    note(`المستوى ${n}: نظّف الحديقة وازرع الأشجار! 🌍`,true,3200);
    setTimeout(()=>{if(this.running){this.spawnedBoss=true;spawnVillain(true);this.updateMission();}},4000);
    this.updateMission();
  },

  tryPlant(){
    if(!this.running||!this.nearPatch||this.plantCd>0)return;
    const p=this.nearPatch;p.planted=true;p.grow=0;
    p.tree=makeTree();p.tree.scale.setScalar(.01);
    p.tree.position.copy(p.mesh.position);scene.add(p.tree);
    p.ring.visible=false;
    this.trees++;this.addScore(25,p.mesh.position.clone().add(new THREE.Vector3(0,2,0)));
    this.plantCd=.6;
    Snd.plant();burst(p.mesh.position.clone().setY(1),0x9ef01a,18,3.5);
    note(pick(LINES.plant),true);
    $('uiTrees').textContent=this.trees;
    this.updateMission();
  },

  addScore(v,pos){this.score+=v;$('uiScore').textContent=this.score;if(pos)popText(pos,'+'+v);},

  pollution(){
    const total=trash.length*3+villains.length*9+patches.filter(p=>!p.planted).length*6;
    return clamp(total/(this.polMax||60)*100,0,100);},

  updateMission(){
    const left=trash.length, pl=patches.filter(p=>p.planted).length;
    const bossDone=this.bossDefeated();
    $('missionCard').innerHTML=
      `<div class="${left===0?'done':''}">${left===0?'✅':'🗑️'} قمامة متبقية: <b>${left}</b></div>`+
      `<div class="${pl===patches.length?'done':''}">${pl===patches.length?'✅':'🌱'} أشجار: <b>${pl}/${patches.length}</b></div>`+
      `<div class="${this.converted>=this.quota?'done':''}">${this.converted>=this.quota?'✅':'😈'} أتباع مترميش: <b>${this.converted}/${this.quota}</b></div>`+
      `<div class="${bossDone?'done':''}">${bossDone?'✅':'🎩'} مترميش الكبير</div>`;
  },
  bossDefeated(){return this.spawnedBoss&&(!mtermish);},

  checkWin(){
    if(trash.length===0&&patches.every(p=>p.planted)&&
       this.converted>=this.quota&&this.spawned>=this.quota&&this.bossDefeated()){
      this.running=false;
      Snd.fanfare();confetti();
      this.addScore(50+this.level*10);
      $('stScore').textContent=this.score;
      $('stTrees').textContent=this.trees;
      $('stTrash').textContent=this.trashGot;
      $('lvlQuote').textContent=pick(LINES.quotes);
      $('lvlTitle').textContent=`🎉 المستوى ${this.level} اكتمل!`;
      $('lvlOverlay').style.display='flex';
    }
  }
};

/* ---------------- Update loop ---------------- */
const clock=new THREE.Clock();
const camTarget=new THREE.Vector3();
const CAM_OFF=new THREE.Vector3(0,13,15);
camera.position.copy(CAM_OFF);

function playerUpdate(dt){
  let ix=0,iz=0;
  if(keys.KeyW||keys.ArrowUp)iz-=1;
  if(keys.KeyS||keys.ArrowDown)iz+=1;
  if(keys.KeyA||keys.ArrowLeft)ix-=1;
  if(keys.KeyD||keys.ArrowRight)ix+=1;
  ix+=joy.x;iz+=joy.y;
  const L=Math.hypot(ix,iz);
  if(L>1){ix/=L;iz/=L;}
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
  player.mesh.position.copy(player.pos);
  player.mesh.rotation.y=player.yaw;
  player.anim+=dt*(3+spd*1.4);
  const sw=Math.sin(player.anim*4)* clamp(spd/8,0,1);
  const {arms,legs}=player.mesh.userData;
  arms[0].rotation.x=sw*.9;arms[1].rotation.x=-sw*.9;
  legs[0].rotation.x=-sw*.8;legs[1].rotation.x=sw*.8;
  player.mesh.position.y=Math.abs(Math.sin(player.anim*4))*.1*clamp(spd/8,0,1);
}

function villainsUpdate(dt){
  for(let i=villains.length-1;i>=0;i--){
    const v=villains[i];v.t+=dt;v.hitCd-=dt;
    if(v.state==='walk'){
      if(v.boss){const toP=player.pos.clone().sub(v.mesh.position);
        if(toP.length()<8){v.target.copy(v.mesh.position).sub(toP.setY(0).normalize().multiplyScalar(12));
          const dT=Math.hypot(v.target.x,v.target.z);
          if(dT>WORLD_R-3){const s=(WORLD_R-3)/dT;v.target.x*=s;v.target.z*=s;}}}
      const dir=v.target.clone().sub(v.mesh.position);dir.y=0;
      if(dir.length()<1){newTarget(v);}
      else{dir.normalize();
        v.mesh.position.addScaledVector(dir,v.speed*dt);
        v.mesh.rotation.y=Math.atan2(dir.x,dir.z);}
      v.mesh.position.y=Math.abs(Math.sin(v.t*8))*.12;
      v.mesh.rotation.z=Math.sin(v.t*8)*.08;
      v.drop-=dt;
      if(v.drop<=0){v.drop=v.boss?rand(2,3.5):rand(3.5,6.5);
        const inD=Math.hypot(v.mesh.position.x,v.mesh.position.z);
        if(inD<WORLD_R)spawnTrash(v.mesh.position);
        if(Math.random()<.25)note(pick(LINES.mtermishTaunt),false,1800);
        Game.updateMission();}
      if(v.hitCd<=0){
        const dist=v.mesh.position.distanceTo(player.pos);
        if(dist<(v.boss?2.2:1.5)){
          v.hitCd=.9;v.hp--;
          burst(v.mesh.position.clone().setY(1.2),v.boss?0xc084fc:0xffd166,16,4.5);
          if(v.hp<=0){
            v.state='convert';v.t=0;Snd.convert();
            v.mesh.traverse(o=>{if(o.isMesh&&o.material===mat(0x9c6bd6))o.material=mat(0x51cf66);});
            if(v.boss){note(pick(LINES.mtermishDown),true,3000);Game.addScore(100,v.mesh.position.clone().setY(2.5));}
            else{note(pick(LINES.minion),true);Game.addScore(30,v.mesh.position.clone().setY(2));}
          }else{Snd.bonk();note(pick(LINES.mtermishHit),false,2000);
            Game.addScore(15,v.mesh.position.clone().setY(2.5));
            const away=v.mesh.position.clone().sub(player.pos).setY(0).normalize().multiplyScalar(9);
            v.target.copy(v.mesh.position).add(away);}
        }}
    }else if(v.state==='convert'){
      v.mesh.rotation.y+=dt*14;
      v.mesh.position.y=Math.abs(Math.sin(v.t*9))*.6;
      const s=Math.max(.01,1-(v.t-.7)*2)* (v.boss?1.7:1);
      if(v.t>.7)v.mesh.scale.setScalar(s);
      if(v.t>1.2){
        burst(v.mesh.position.clone().setY(1),0x51cf66,20,5);
        scene.remove(v.mesh);villains.splice(i,1);
        if(v.boss)mtermish=null;else Game.converted++;
        Game.updateMission();Game.checkWin();
      }
    }
  }
  if(Game.spawned<Game.quota){
    Game.spawnTimer-=dt;
    if(Game.spawnTimer<=0){Game.spawnTimer=rand(5,8);Game.spawned++;spawnVillain(false);}
  }
}

function trashUpdate(dt){
  for(let i=trash.length-1;i>=0;i--){
    const t=trash[i];
    t.mesh.rotation.y+=dt*.8;
    if(t.mesh.position.distanceTo(player.pos)<1.35){
      burst(t.mesh.position.clone().setY(.6),0xffd166,10,3);
      Snd.pickup();
      Game.trashGot++;$('uiTrash').textContent=Game.trashGot;
      Game.addScore(10,t.mesh.position.clone().setY(1.4));
      if(Math.random()<.3)note(pick(LINES.pickup),true,1500);
      scene.remove(t.mesh);trash.splice(i,1);
      Game.updateMission();Game.checkWin();
    }}}

function patchesUpdate(dt,time){
  Game.plantCd-=dt;
  Game.nearPatch=null;
  for(const p of patches){
    if(p.planted){
      if(p.grow<1){p.grow=Math.min(1,p.grow+dt*.9);
        const e=1-Math.pow(1-p.grow,3);
        p.tree.scale.setScalar(.01+e*(0.85+Math.sin(p.grow*Math.PI)*.25));
        if(p.grow>=1)p.tree.scale.setScalar(1);}
      continue;}
    p.ring.material.opacity=.55+Math.sin(time*4)*.3;
    p.ring.scale.setScalar(1+Math.sin(time*4)*.06);
    if(p.mesh.position.distanceTo(player.pos)<2.2)Game.nearPatch=p;
  }
  $('prompt').style.display=(Game.nearPatch&&Game.running)?'block':'none';
}

function envUpdate(dt,time){
  const pol=Game.pollution()/100;
  groundMat.color.lerpColors(COL.grassClean,COL.grassDirty,pol);
  scene.background.lerpColors(COL.skyClean,COL.skyDirty,pol);
  scene.fog.color.lerpColors(COL.fogClean,COL.fogDirty,pol);
  const pct=Math.round((1-pol)*100);
  $('meterPct').textContent=pct+'%';
  const f=$('meterFill');f.style.width=pct+'%';
  f.style.background=pct>66?'linear-gradient(90deg,#51cf66,#2f9e44)':
    pct>33?'linear-gradient(90deg,#ffd166,#f59f00)':'linear-gradient(90deg,#a3742f,#7a5230)';
  for(const c of clouds){c.position.x+=c.userData.spd*dt;
    if(c.position.x>90)c.position.x=-90;}
  // gentle flower sway in the breeze
  for(const fl of flowers){fl.rotation.z=fl.userData.base+Math.sin(time*1.6+fl.userData.sway)*.12;}
}

function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(),.05);
  const time=clock.elapsedTime;
  if(Game.running){
    playerUpdate(dt);
    villainsUpdate(dt);
    trashUpdate(dt);
    patchesUpdate(dt,time);
  }
  envUpdate(dt,time);
  updateBursts(dt);
  camTarget.copy(player.pos).add(CAM_OFF);
  camera.position.x=smooth(camera.position.x,camTarget.x,.18,dt);
  camera.position.y=smooth(camera.position.y,camTarget.y,.18,dt);
  camera.position.z=smooth(camera.position.z,camTarget.z,.18,dt);
  camera.lookAt(player.pos.x,player.pos.y+1.2,player.pos.z);
  sun.position.set(player.pos.x+30,45,player.pos.z+20);
  sun.target.position.copy(player.pos);sun.target.updateMatrixWorld();
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
function showMenu(){
  $('startOverlay').style.display='flex';
  $('hud').style.display='none';
  $('sndBtn').style.display='none';
  $('exitBtn').style.display='none';
  $('joy').style.display='none';
  $('actBtn').style.display='none';
  $('prompt').style.display='none';
}
function exitGame(){
  Game.running=false;
  exitFullscreen();
  note('تم الخروج من اللعبة',true,1200);
  showMenu();
}
$('startBtn').onclick=()=>{
  Snd.init();
  requestFullscreen();
  $('startOverlay').style.display='none';
  $('hud').style.display='block';
  $('sndBtn').style.display='block';
  $('exitBtn').style.display='block';
  if(isTouch){$('joy').style.display='block';$('actBtn').style.display='flex';}
  Game.running=true;
  Game.startLevel(1);
};
$('nextBtn').onclick=()=>{
  $('lvlOverlay').style.display='none';
  $('exitBtn').style.display='block';
  Game.running=true;
  Game.startLevel(Game.level+1);
};
