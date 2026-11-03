"""Convert the supplied GoldSrc BSP v30 to static browser geometry.
Layout reference: https://github.com/ValveSoftware/halflife/blob/master/utils/common/bspfile.h
Usage: python tools/convert_map.py INPUT.bsp OUTPUT_DIRECTORY (requires Pillow).
"""
import struct,json,re,sys,math
from pathlib import Path
from collections import defaultdict
from PIL import Image
b=Path(sys.argv[1]).read_bytes();out=Path(sys.argv[2]);(out/'textures').mkdir(parents=True,exist_ok=True)
def unpack(fmt,offset):return struct.unpack_from('<'+fmt,b,offset)
assert unpack('i',0)[0]==30,'Expected GoldSrc BSP 30'
lumps=[unpack('ii',4+8*i) for i in range(15)]
assert all(o>=0 and o+n<=len(b) for o,n in lumps),'Incomplete BSP'
def records(i,fmt):
 o,n=lumps[i];size=struct.calcsize('<'+fmt);assert n%size==0
 return [unpack(fmt,p) for p in range(o,o+n,size)]
entities=[dict(re.findall(r'"([^"\n]+)"\s*"([^"\n]*)"',s)) for s in re.findall(r'\{([^}]+)\}',b[lumps[0][0]:sum(lumps[0])].decode('latin1'))]
planes=records(1,'4fi');verts=records(3,'3f');edges=records(12,'2H');surf=records(13,'i');infos=records(6,'8f2i');faces=records(7,'Hhihh4Bi');models=records(14,'9f7i')
scale=.025
def world(v):return [round(v[0]*scale,5),round(v[2]*scale,5),round(-v[1]*scale,5)]
to,n=lumps[2];textures=[]
for i in range(unpack('i',to)[0]):
 rel=unpack('i',to+4+i*4)[0]
 if rel<0:
  textures.append({'name':'unused','width':1,'height':1,'url':None,'masked':False});continue
 p=to+rel;name,w,h,*mips=unpack('16s6I',p);name=name.split(b'\0')[0].decode('latin1');assert mips[0]>0,'External WAD texture required'
 pix=b[p+mips[0]:p+mips[0]+w*h];palpos=p+mips[3]+(w//8)*(h//8)+2;palette=b[palpos:palpos+768]
 image=Image.frombytes('P',(w,h),pix);image.putpalette(palette)
 if name.startswith('{'):image.info['transparency']=255
 image.convert('RGBA').save(out/'textures'/f'{i}.png');textures.append({'name':name,'width':w,'height':h,'url':f'textures/{i}.png','masked':name.startswith('{')})
model_entities={int(e['model'][1:]):e for e in entities if e.get('model','').startswith('*')}
groups={};triangle_count=0
for mi,model in enumerate(models):
 ent=model_entities.get(mi,{});kind=ent.get('classname','worldspawn')
 if kind.startswith('trigger_') or kind in ['func_bomb_target']:continue
 origin=[float(x) for x in ent.get('origin','0 0 0').split()];door=kind=='func_door_rotating'
 def transform(v):
  # Rotating doors are exported open, at their original pivot.
  if door:v=(-v[1],v[0],v[2])
  return world([v[j]+origin[j] for j in range(3)])
 first,count=model[-2:]
 for face in faces[first:first+count]:
  plane,side,fe,ne,ti,*rest=face;info=infos[ti];texid=info[8];tex=textures[texid]
  if tex['name'].lower() in ['sky','origin','clip','aaatrigger','null']:continue
  solid=kind!='func_water';opacity=float(ent.get('renderamt','255'))/255 if ent.get('rendermode','0')!='0' else 1
  key=(texid,solid,round(opacity,2));g=groups.setdefault(key,{'texture':texid,'solid':solid,'opacity':opacity,'positions':[],'uv':[],'colors':[]})
  polygon=[]
  for se in surf[fe:fe+ne]:
   ei=se[0];v=verts[edges[abs(ei)][0 if ei>=0 else 1]];u=sum(v[j]*info[j] for j in range(3))+info[3];t=sum(v[j]*info[j+4] for j in range(3))+info[7];polygon.append((v,u,t))
  cross=[0,0,0];a=polygon[0][0]
  for j in range(1,len(polygon)-1):
   bv,c=polygon[j][0],polygon[j+1][0];ab=[bv[k]-a[k] for k in range(3)];ac=[c[k]-a[k] for k in range(3)]
   cc=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]]
   cross=[cross[k]+cc[k] for k in range(3)]
  normal=planes[plane][:3];sign=-1 if side else 1
  if sum(cross[j]*normal[j]*sign for j in range(3))<0:polygon.reverse()
  min_u=math.floor(min(p[1] for p in polygon)/16);min_t=math.floor(min(p[2] for p in polygon)/16);lw=math.ceil(max(p[1] for p in polygon)/16)-min_u+1;lh=math.ceil(max(p[2] for p in polygon)/16)-min_t+1
  lightoff=face[-1]
  for j in range(1,len(polygon)-1):
   triangle_count+=1
   for v,u,t in [polygon[0],polygon[j],polygon[j+1]]:
    g['positions'].extend(transform(v));g['uv'].extend([round(u/tex['width'],6),round(1-t/tex['height'],6)])
    color=[1,1,1]
    if lightoff>=0:
     x=min(lw-1,max(0,round(u/16-min_u)));y=min(lh-1,max(0,round(t/16-min_t)));off=lumps[8][0]+lightoff+3*(y*lw+x)
     color=[round(min(1,max(.18,(c/128)**.7)),4) for c in b[off:off+3]]
    g['colors'].extend(color)
spawns=[]
for e in entities:
 if e.get('classname') in ['info_player_start','info_player_deathmatch']:
  p=world([float(x) for x in e['origin'].split()]);p[1]-=.9
  spawns.append({'position':p,'yaw':math.radians(float(e.get('angle','0')))-math.pi/2})
result={'name':'de_chaves3.0','author':'Raul Cotrim de Mattos','textures':textures,'groups':list(groups.values()),'spawns':spawns,'triangles':triangle_count,'notes':'Static conversion. Doors fixed open; water and breakables have no original game logic. Skybox not included in source archive.'}
(out/'map.json').write_text(json.dumps(result,separators=(',',':')))
print(json.dumps({'triangles':triangle_count,'textures':len(textures),'spawns':len(spawns),'groups':len(groups),'firstSpawn':spawns[0]}))
