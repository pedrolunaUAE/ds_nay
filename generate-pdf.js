
function loadImageAsDataURL(src){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = ()=>{ const c=document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight; const ctx=c.getContext('2d'); ctx.drawImage(img,0,0); resolve(c.toDataURL('image/png')); };
    img.onerror = reject; img.src = src;
  });
}

function generatePDF(){
  const { jsPDF } = window.jspdf; const doc = new jsPDF('p','mm','a4');
  const margin=15; const pageW=doc.internal.pageSize.getWidth(); const pageH=doc.internal.pageSize.getHeight();
  const contentW=pageW-2*margin; const contentH=pageH-2*margin;
  const loader=document.createElement('div'); loader.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);color:#fff;z-index:99999;font:500 14px system-ui,Segoe UI,Roboto'; loader.textContent='Generando PDF…'; document.body.appendChild(loader);
  const municipioSelect=document.getElementById('municipio-select');
  const municipio=municipioSelect && municipioSelect.options[municipioSelect.selectedIndex]? municipioSelect.options[municipioSelect.selectedIndex].text : '';
  const title='Información Sociodemográfica de Nayarit, 2020'; const logoPath='img/LogotipoLealtad.png';
  let y = margin;
  function addCanvasPaginated(canvas){
    return new Promise((resolve)=>{
      const scale = contentW / canvas.width;
      const sliceHpx = Math.floor(contentH / scale);
      const total = canvas.height; let offset=0; const pageCanvas=document.createElement('canvas'); const ctx=pageCanvas.getContext('2d');
      while(offset < total){ const h = Math.min(sliceHpx, total - offset); pageCanvas.width = canvas.width; pageCanvas.height = h; ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,h); ctx.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h); const imgData = pageCanvas.toDataURL('image/jpeg', 0.9); if(y + (h*scale) > pageH - margin){ doc.addPage(); y = margin; } doc.addImage(imgData, 'JPEG', margin, y, contentW, h*scale); y += h*scale + 4; if(offset + h < total && y + 6 > pageH - margin){ doc.addPage(); y = margin; } offset += h; } resolve();
    });
  }
  function captureSection(id){ return new Promise((resolve)=>{ const el = document.getElementById(id); if(!el){ return resolve(); } html2canvas(el, {scale:2, useCORS:true, backgroundColor:'#ffffff'}).then(async (canvas)=>{ await addCanvasPaginated(canvas); resolve(); }).catch(()=> resolve()); }); }
  function addBullets(lines){ doc.setFontSize(9); doc.setFont(undefined,'normal'); lines.forEach(line=>{ if(y + 6 > pageH - margin){ doc.addPage(); y = margin; } doc.text('• '+line, margin, y); y += 5.5; }); y += 2; }
  const d = (window.nayaritData||nayaritData); const mKey = municipioSelect? municipioSelect.value : null; const m = d.municipios[mKey]||{}; const pct = (num,den)=> ((num||0)/(den||1)*100).toFixed(1);
  const plan = [
    {id:'educacion', bullets:[ `Tasa de analfabetismo (15+): ${pct(m.P15YM_AN,m.P_15YMAS)}% (${new Intl.NumberFormat('es-MX').format(m.P15YM_AN||0)} personas)`, `Grado promedio de escolaridad: ${m.GRAPROES||'-'} años` ]},
    {id:'economia', bullets:[ `Tasa de participación económica (12+): ${pct(m.PEA,m.P_12YMAS)}% (${new Intl.NumberFormat('es-MX').format(m.PEA||0)} personas)`, `PEA hombres: ${pct(m.PEA_M,m.P_12YMAS_M)}% (${new Intl.NumberFormat('es-MX').format(m.PEA_M||0)} personas)`, `PEA mujeres: ${pct(m.PEA_F,m.P_12YMAS_F)}% (${new Intl.NumberFormat('es-MX').format(m.PEA_F||0)} personas)` ]},
    {id:'salud', bullets:[ `Sin afiliación a servicios de salud: ${pct(m.PSINDER,m.POBTOT)}% (${new Intl.NumberFormat('es-MX').format(m.PSINDER||0)} personas)`, `Afiliada a servicios de salud: ${pct(m.PDER_SS,m.POBTOT)}% (${new Intl.NumberFormat('es-MX').format(m.PDER_SS||0)} personas)` ]},
    {id:'inclusion', bullets:[ `Hablantes de lengua indígena (3+): ${pct(m.P3YM_HLI,m.P_3YMAS)}% (${new Intl.NumberFormat('es-MX').format(m.P3YM_HLI||0)} personas)`, `Población con discapacidad o limitación: ${pct(m.PCON_DISC,m.POBTOT)}% (${new Intl.NumberFormat('es-MX').format(m.PCON_DISC||0)} personas)` ]},
    {id:'movilidad', bullets:[ `Nacidos en la entidad: ${pct(m.PNACENT,m.POBTOT)}%`, `Nacidos en otra entidad: ${pct(m.PNACOE,m.POBTOT)}%`, `Misma residencia 2015–2020: ${pct(m.PRES2015,m.P_5YMAS)}%`, `Residían en otra entidad en 2015: ${pct(m.PRESOE15,m.P_5YMAS)}%` ]},
    {id:'vivienda', bullets:[ `Total de viviendas: ${new Intl.NumberFormat('es-MX').format(m.VIVTOT||0)}`, `Viviendas habitadas: ${new Intl.NumberFormat('es-MX').format(m.TVIVHAB||0)}`, `Ocupantes por vivienda: ${(m.PROM_OCUP||0).toFixed(1)} personas` ]},
    {id:'servicios-basicos', bullets:[ `Electricidad: ${pct(m.VPH_C_ELEC,m.VIVPARH_CV)}% (${new Intl.NumberFormat('es-MX').format(m.VPH_C_ELEC||0)} viviendas)`, `Agua entubada: ${pct(m.VPH_AGUADV,m.VIVPARH_CV)}% (${new Intl.NumberFormat('es-MX').format(m.VPH_AGUADV||0)} viviendas)`, `Drenaje: ${pct(m.VPH_DRENAJ,m.VIVPARH_CV)}% (${new Intl.NumberFormat('es-MX').format(m.VPH_DRENAJ||0)} viviendas)` ]},
    {id:'conectividad', bullets:[ `Computadora: ${pct(m.VPH_PC,m.VIVPARH_CV)}% (${new Intl.NumberFormat('es-MX').format(m.VPH_PC||0)} viviendas)`, `Internet: ${pct(m.VPH_INTER,m.VIVPARH_CV)}% (${new Intl.NumberFormat('es-MX').format(m.VPH_INTER||0)} viviendas)`, `Teléfono celular: ${pct(m.VPH_CEL,m.VIVPARH_CV)}% (${new Intl.NumberFormat('es-MX').format(m.VPH_CEL||0)} viviendas)` ]}
  ];
  (async()=>{ try { const logoData = await loadImageAsDataURL(logoPath); doc.addImage(logoData,'PNG', margin, margin-1, 22, 22); } catch {} doc.setFontSize(14); doc.setFont(undefined,'bold'); doc.text(title, pageW/2, margin+6, {align:'center'}); doc.setFontSize(10); doc.setFont(undefined,'normal'); doc.text('Municipio: '+municipio, pageW - margin, margin+6, {align:'right'}); y = margin + 18; for(const sec of plan){ doc.setFontSize(11); doc.setFont(undefined,'bold'); if(y + 8 > pageH - margin){ doc.addPage(); y = margin; } const mapTitle = { 'educacion':'II. EDUCACIÓN Y CAPITAL HUMANO', 'economia':'III. PANORAMA ECONÓMICO', 'salud':'IV. SERVICIOS DE SALUD', 'inclusion':'V. INCLUSIÓN Y DIVERSIDAD', 'movilidad':'VI. MOVILIDAD POBLACIONAL', 'vivienda':'VII. VIVIENDA', 'servicios-basicos':'VIII. SERVICIOS BÁSICOS EN VIVIENDAS', 'conectividad':'VIII. CONECTIVIDAD Y BIENES TIC' }; doc.text(mapTitle[sec.id]||'', margin, y); y += 6; addBullets(sec.bullets); await captureSection(sec.id); } doc.save(`Informacion_Sociodemografica_${(municipio||'').replace(/\s+/g,'_')}.pdf`); document.body.removeChild(loader); })();
}

// Exponer generatePDF globalmente si estamos en navegador
if (typeof window !== 'undefined') {
  window.generatePDF = generatePDF;
}
