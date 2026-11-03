import * as THREE from 'three';

// Original stylized humans. All geometry/materials are shared between instances.
export const OPERATORS = [
 {name:'Sentinela',role:'Assalto urbano',cloth:0x344a60,vest:0x1a2531,skin:0xc99673,helmet:true,mask:false,accent:0x76b8cd},
 {name:'Vanguarda',role:'Operações especiais',cloth:0x3e4940,vest:0x252c26,skin:0x81533f,helmet:true,mask:true,accent:0xb6bc85},
 {name:'Nômade',role:'Reconhecimento',cloth:0xaa8a5d,vest:0x514838,skin:0xaa7352,helmet:false,mask:false,accent:0xe2c389},
 {name:'Sombra',role:'Infiltração',cloth:0x555459,vest:0x28282c,skin:0xe0ad89,helmet:false,mask:true,accent:0xb59b81}
];
const materials=new Map(), shapes=new Map();
function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.88,flatShading:true}));return materials.get(color);}
function geometry(type){if(!shapes.has(type))shapes.set(type,type==='box'?new THREE.BoxGeometry(1,1,1):type==='head'?new THREE.SphereGeometry(1,8,6):new THREE.CylinderGeometry(1,1,1,8));return shapes.get(type);}
export function createOperator(index=0){
 const preset=OPERATORS[((index%4)+4)%4],root=new THREE.Group();root.name=preset.name;
 function piece(parent,type,color,x,y,z,sx,sy,sz,rz=0){const m=new THREE.Mesh(geometry(type),material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.z=rz;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const box=(parent,color,x,y,z,sx,sy,sz,rz=0)=>piece(parent,'box',color,x,y,z,sx,sy,sz,rz);
 const joint=(parent,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;};
 const body=joint(root,0,.96,0);
 box(body,preset.cloth,0,.23,0,.47,.48,.27);
 box(body,preset.vest,0,.26,.025,.51,.37,.33);
 // Shoulder straps, four magazine pouches, belt and radio.
 for(const x of [-.18,.18])box(body,preset.vest,x,.48,.04,.075,.15,.34);
 for(const x of [-.17,-.055,.06,.175]){box(body,0x444b43,x,.17,.215,.09,.18,.085);box(body,0x252d29,x,.23,.265,.07,.025,.02);}
 box(body,0x191d20,0,-.015,0,.47,.075,.30);box(body,0x95958c,0,-.015,.163,.07,.05,.025);
 box(body,preset.accent,-.15,.36,.204,.13,.045,.012);
 box(body,0x151d22,.31,.23,0,.09,.15,.08);box(body,0x151d22,.31,.36,0,.012,.15,.012);
 box(body,preset.vest,0,.26,-.20,.32,.36,.12);
 // Neck and faceted head, with visibly human proportions.
 piece(body,'cylinder',preset.skin,0,.55,0,.075,.14,.075);
 const head=joint(body,0,.72,.015);
 piece(head,'head',preset.skin,0,0,0,.145,.194,.14);
 box(head,preset.skin,0,-.095,.025,.19,.095,.17);
 for(const side of [-1,1]){
  piece(head,'head',preset.skin,side*.143,-.005,0,.026,.055,.031);
  box(head,0xe1d8c8,side*.055,.024,.126,.054,.025,.018);
  box(head,0x283136,side*.052,.024,.139,.018,.022,.008);
  box(head,0x3a2c26,side*.055,.057,.13,.06,.014,.018,side*.09);
 }
 piece(head,'head',preset.skin,0,-.012,.147,.031,.053,.039);
 box(head,0x754f43,0,-.093,.116,.067,.012,.012);
 if(preset.mask){box(head,preset.vest,0,-.091,.113,.205,.11,.09);box(head,preset.vest,0,.145,-.005,.26,.105,.235);}
 else{piece(head,'head',0x302a26,0,.1,-.025,.149,.112,.132);box(head,0x4b3930,0,-.126,.068,.17,.028,.10);}
 if(preset.helmet){
  const helmet=piece(head,'head',preset.cloth,0,.14,-.018,.175,.135,.175);
  box(head,preset.vest,0,.112,.15,.31,.055,.07);
  box(head,0x222c2d,0,.12,.194,.07,.045,.018);
  for(const side of [-1,1]){box(head,preset.vest,side*.166,.01,-.025,.045,.11,.09);box(head,preset.vest,side*.12,-.10,.07,.018,.14,.02,side*.18);}
 }else{box(head,preset.cloth,0,.137,-.015,.29,.075,.25);box(head,preset.cloth,0,.10,.165,.28,.027,.17);}
 // Articulated arms with elbows and gloves.
 const leftArm=joint(body,-.30,.43,0),rightArm=joint(body,.30,.43,0);
 for(const [arm,side] of [[leftArm,-1],[rightArm,1]]){
  box(arm,preset.cloth,0,-.13,0,.17,.28,.19,-side*.08);
  box(arm,preset.vest,side*.015,-.08,.02,.18,.13,.20);
  const forearm=joint(arm,0,-.27,.015);forearm.rotation.x=-.95;
  box(forearm,preset.cloth,0,-.12,0,.14,.25,.15);
  box(forearm,0x252a29,0,-.27,0,.145,.10,.15);
  arm.rotation.x=-.25;arm.rotation.z=side*.12;
 }
 // Two-piece legs and boots: knee pivots make walking readable at a distance.
 const legs=[];
 for(const side of [-1,1]){
  const leg=joint(root,side*.135,.96,0);legs.push(leg);
  box(leg,preset.cloth,0,-.22,0,.215,.43,.235);
  box(leg,preset.vest,side*.1,-.16,0,.065,.19,.18);
  const knee=joint(leg,0,-.43,0);leg.userData.knee=knee;
  box(knee,preset.cloth,0,-.17,0,.18,.36,.20);
  box(knee,preset.vest,0,-.01,.112,.155,.15,.055);
  box(knee,0x202626,0,-.385,.045,.21,.16,.32);
  box(knee,0x111719,0,-.455,.045,.22,.045,.34);
 }
 // Compact original rifle, pointing forward (+Z).
 const rifle=joint(body,.15,.10,.37);rifle.rotation.z=-.09;
 box(rifle,0x242b30,0,0,0,.09,.12,.43);box(rifle,0x41494b,0,.01,.22,.08,.085,.23);
 const barrel=piece(rifle,'cylinder',0x171c20,0,.02,.44,.018,.25,.018);barrel.rotation.x=Math.PI/2;
 box(rifle,0x1b2226,0,-.10,-.015,.06,.17,.10,.12);box(rifle,0x242b30,0,-.09,-.14,.06,.13,.065);
 box(rifle,0x191f22,0,.095,-.025,.065,.07,.10);box(rifle,0x24302e,0,0,-.28,.075,.13,.16);
 root.userData.rig={body,legs,leftArm,rightArm,phase:index};root.userData.operator=index;
 return root;
}
export function animateOperator(root,dt,speed=0){
 const rig=root.userData.rig;if(!rig)return;
 const amount=Math.min(1,speed/2);rig.phase+=dt*(speed>0.1?8:1.5);
 rig.legs.forEach((leg,i)=>{const phase=rig.phase+i*Math.PI;leg.rotation.x=Math.sin(phase)*.43*amount;leg.userData.knee.rotation.x=Math.max(0,-Math.sin(phase))*.45*amount;});
 rig.body.position.y=.96+Math.abs(Math.sin(rig.phase))*.025*amount;
}
