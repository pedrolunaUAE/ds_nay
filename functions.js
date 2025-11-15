
// Variables globales para los gráficos
window.charts = window.charts || {};

const colors = { municipal:'#003f5c', estatal:'#A14D94', nacional:'#9CAEC0', accent1:'#955196', accent2:'#dd5182', accent3:'#ff6e54', accent4:'#ffa600' };

if (typeof Chart !== 'undefined'){
  Chart.defaults.font.family = "Inter, 'Segoe UI', Roboto, Arial, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = '#334155';
  Chart.defaults.plugins.legend.position = 'bottom';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.tooltip.mode = 'index';
  Chart.defaults.plugins.tooltip.intersect = false;
  Chart.defaults.elements.bar.borderRadius = 4;
  Chart.defaults.maintainAspectRatio = false;
}

function formatNumber(num){ return new Intl.NumberFormat('es-MX').format(num||0); }
function calcPct(valor, base, dec=1){ const v=Number(valor)||0, b=Number(base)||0; if(!b) return (0).toFixed(dec); return ((v/b)*100).toFixed(dec); }


// Función para calcular la edad mediana
function calcularEdadMediana(data) {
    const rangos = [
        { poblacion: data.P_0A4, min: 0, max: 4 },      // 0-4 años
        { poblacion: data.P_5A9, min: 5, max: 9 },      // 5-9 años
        { poblacion: data.P_10A14, min: 10, max: 14 },  // 10-14 años
        { poblacion: data.P_15A19, min: 15, max: 19 },  // 15-19 años
        { poblacion: data.P_20A24, min: 20, max: 24 },  // 20-24 años
        { poblacion: data.P_25A29, min: 25, max: 29 },  // 25-29 años
        { poblacion: data.P_30A34, min: 30, max: 34 },  // 30-34 años
        { poblacion: data.P_35A39, min: 35, max: 39 },  // 35-39 años
        { poblacion: data.P_40A44, min: 40, max: 44 },  // 40-44 años
        { poblacion: data.P_45A49, min: 45, max: 49 },  // 45-49 años
        { poblacion: data.P_50A54, min: 50, max: 54 },  // 50-54 años
        { poblacion: data.P_55A59, min: 55, max: 59 },  // 55-59 años
        { poblacion: data.P_60A64, min: 60, max: 64 },  // 60-64 años
        { poblacion: data.P_65A69, min: 65, max: 69 },  // 65-69 años
        { poblacion: data.P_70A74, min: 70, max: 74 },  // 70-74 años
        { poblacion: data.P_75A79, min: 75, max: 79 },  // 75-79 años
        { poblacion: data.P_80A84, min: 80, max: 84 },  // 80-84 años
        { poblacion: data.P_85YMAS, min: 85, max: 100 } // 85+ años (asumimos hasta 100)
    ];
    
    const pobTotal = data.POBTOT;
    const mitadPoblacion = pobTotal / 2;
    
    let acumulado = 0;
    
    // Recorrer todos los rangos para encontrar dónde está la mediana
    for (let i = 0; i < rangos.length; i++) {
        const rango = rangos[i];
        const acumuladoAnterior = acumulado; // Población acumulada antes de este rango
    acumulado += Number(rango.poblacion) || 0;
        
        // Verificar si la mediana está en este rango
    if (acumulado >= mitadPoblacion) {
            // Calcular cuánta población del rango necesitamos para llegar a la mitad
            const poblacionFaltante = mitadPoblacion - acumuladoAnterior;
      const proporcionEnRango = rango.poblacion ? (poblacionFaltante / Number(rango.poblacion)) : 0;
            
            // Calcular la edad exacta dentro del rango
            const anchoRango = rango.max - rango.min;
            const edadCalculada = rango.min + (proporcionEnRango * anchoRango);
            
            // Redondear a 1 decimal para mayor precisión
            return Math.round(edadCalculada);
        }
    }
    
    // Caso de respaldo: si por alguna razón no se encuentra la mediana
    console.warn('No se pudo calcular la edad mediana con los rangos detallados, usando método aproximado');
  return 0; // fallback seguro
}

function getAbsoluteValue(index, context, dataType, subType=null){
  const mSel=document.getElementById('municipio-select'); const key=mSel? mSel.value:null;
  const base = (typeof window.nayaritData!== 'undefined')? window.nayaritData : (typeof nayaritData!=='undefined'? nayaritData : null);
  const m = base && base.municipios ? base.municipios[key] : {}; const e=base? base.estatal:{}; const n=base? base.nacional:{}; function pick3(a,b,c){ return [a,b,c][index]||0; }
  if(dataType==='poblacion'){
    if(subType==='analfabetismo') return pick3(m.P15YM_AN,e.P15YM_AN,n.P15YM_AN);
    if(subType==='sin_salud') return pick3(m.PSINDER,e.PSINDER,n.PSINDER);
    if(subType==='con_salud') return pick3(m.PDER_SS,e.PDER_SS,n.PDER_SS);
    if(subType==='lengua_indigena') return pick3(m.P3YM_HLI,e.P3YM_HLI,n.P3YM_HLI);
    if(subType==='discapacidad') return pick3(m.PCON_DISC,e.PCON_DISC,n.PCON_DISC);
    if(subType==='escolaridad'){ const b=[m.POBTOT,e.POBTOT,n.POBTOT][index]||0; const y=context.parsed?.y||0; return Math.round((y/15)*b); }
  }
  if(dataType==='vivienda'){
    if(subType==='ocupantes') return pick3(m.PROM_OCUP,e.PROM_OCUP,n.PROM_OCUP);
    if(subType==='electricidad')return pick3(m.VPH_C_ELEC,e.VPH_C_ELEC,n.VPH_C_ELEC);
    if(subType==='agua') return pick3(m.VPH_AGUADV,e.VPH_AGUADV,n.VPH_AGUADV);
    if(subType==='drenaje') return pick3(m.VPH_DRENAJ,e.VPH_DRENAJ,n.VPH_DRENAJ);
    if(subType==='computadora') return pick3(m.VPH_PC,e.VPH_PC,n.VPH_PC);
    if(subType==='internet') return pick3(m.VPH_INTER,e.VPH_INTER,n.VPH_INTER);
    if(subType==='celular') return pick3(m.VPH_CEL,e.VPH_CEL,n.VPH_CEL);
  }
  if(dataType==='economia'){
    if(subType==='pea_total') return pick3(m.PEA,e.PEA,n.PEA);
    if(subType==='pea_hombres') return pick3(m.PEA_M,e.PEA_M,n.PEA_M);
    if(subType==='pea_mujeres') return pick3(m.PEA_F,e.PEA_F,n.PEA_F);
  }
  if(dataType==='movilidad'){
    if(subType==='nacidos_entidad') return pick3(m.PNACENT||0,e.PNACENT||0,n.PNACENT||0);
    if(subType==='nacidos_otra_entidad') return pick3(m.PNACOE||0,e.PNACOE||0,n.PNACOE||0);
    if(subType==='misma_residencia') return pick3(m.PRES2015||0,e.PRES2015||0,n.PRES2015||0);
    if(subType==='residia_otra_entidad') return pick3(m.PRESOE15||0,e.PRESOE15||0,n.PRESOE15||0);
  }
  return 0;
}

function makeTooltipCallback(){
  return function(context){
    const id = context.chart?.canvas?.id || '';
    const value = context.parsed?.y ?? context.parsed?.x;
    const xLabel = context.label || '';
    // Asegurar que trabajamos con números
    const rawValue = (typeof value === 'number') ? value : Number(value) || 0;
    let dataType=null, subType=null, unit='%';
    switch(id){
      case 'analfabetismo-chart': dataType='poblacion'; subType='analfabetismo'; break;
      case 'participacion-economica-chart': dataType='economia'; subType='pea_total'; break;
      case 'sin-salud-chart': dataType='poblacion'; subType='sin_salud'; break;
      case 'con-salud-chart': dataType='poblacion'; subType='con_salud'; break;
      case 'lengua-indigena-chart': dataType='poblacion'; subType='lengua_indigena'; break;
      case 'discapacidad-chart': dataType='poblacion'; subType='discapacidad'; break;
      case 'ocupantes-vivienda-chart': unit='personas'; dataType='vivienda'; subType='ocupantes'; break;
      case 'lugar-nacimiento-chart': dataType='movilidad'; subType=(xLabel==='Nacidos en la entidad'?'nacidos_entidad':'nacidos_otra_entidad'); break;
      case 'movilidad-reciente-chart': dataType='movilidad'; subType=(xLabel.indexOf('Residían en otra')>=0?'residia_otra_entidad':'misma_residencia'); break;
      case 'servicios-basicos-chart': dataType='vivienda'; subType=(xLabel==='Electricidad'?'electricidad':(xLabel==='Agua entubada'?'agua':'drenaje')); break;
      case 'tic-combinado-chart': dataType='vivienda'; subType=(xLabel==='Computadora'?'computadora':(xLabel==='Internet'?'internet':'celular')); break;
    }
    const dsCount = context.chart?.data?.datasets?.length || 1;
    const absIndex = (dsCount===1)? context.dataIndex : context.datasetIndex;
    const abs = (dataType&&subType)? getAbsoluteValue(absIndex, context, dataType, subType) : null;
    if(unit==='%'){
      const absLabel = abs? ` (${formatNumber(abs)} ${dataType==='vivienda'?'viviendas':'personas'})` : '';
      return `${xLabel}: ${Math.abs(rawValue).toFixed(1)}%${absLabel}`;
    }
    // unidad distinta a porcentaje (por ejemplo 'personas')
    const absLabel = abs? ` (${formatNumber(abs)})` : '';
    return `${xLabel}: ${rawValue} ${unit}${absLabel}`;
  }
}

const customValueLabelsPlugin = {
  id: 'customValueLabels',
  afterDatasetsDraw(chart){
    const ctx = chart.ctx; ctx.save();
    ctx.font = `${Chart.defaults.font.size}px ${Chart.defaults.font.family}`;
    ctx.fillStyle = Chart.defaults.color; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const id = chart.canvas?.id || '';
    // No dibujar etiquetas de valor para la pirámide (evitamos imprimir textos sobre las barras)
    if(id === 'piramide-poblacional'){
      ctx.restore();
      return;
    }
    const datasets = chart.data.datasets || [];
    const labels = chart.data.labels || [];
    datasets.forEach((ds, di) => {
      const meta = chart.getDatasetMeta(di);
      meta.data.forEach((elem, i) => {
        const raw = ds.data[i];
        const val = parseFloat(raw);
        if (isNaN(val)) return;
        const xLabel = labels[i] || '';
        let dataType = null, subType = null, unit = '%';
        switch(id){
          case 'analfabetismo-chart': dataType='poblacion'; subType='analfabetismo'; break;
          case 'participacion-economica-chart': dataType='economia'; subType='pea_total'; break;
          case 'sin-salud-chart': dataType='poblacion'; subType='sin_salud'; break;
          case 'con-salud-chart': dataType='poblacion'; subType='con_salud'; break;
          case 'lengua-indigena-chart': dataType='poblacion'; subType='lengua_indigena'; break;
          case 'discapacidad-chart': dataType='poblacion'; subType='discapacidad'; break;
          case 'ocupantes-vivienda-chart': unit='personas'; dataType='vivienda'; subType='ocupantes'; break;
          case 'lugar-nacimiento-chart': dataType='movilidad'; subType=(xLabel==='Nacidos en la entidad'?'nacidos_entidad':'nacidos_otra_entidad'); break;
          case 'movilidad-reciente-chart': dataType='movilidad'; subType=(xLabel.indexOf('Residían en otra')>=0?'residia_otra_entidad':'misma_residencia'); break;
          case 'servicios-basicos-chart': dataType='vivienda'; subType=(xLabel==='Electricidad'?'electricidad':(xLabel==='Agua entubada'?'agua':'drenaje')); break;
          case 'tic-combinado-chart': dataType='vivienda'; subType=(xLabel==='Computadora'?'computadora':(xLabel==='Internet'?'internet':'celular')); break;
        }
        const absIndex = (datasets.length===1)? i : di;
        const abs = (dataType&&subType)? getAbsoluteValue(absIndex, { parsed:{ y: val }, dataIndex:i, datasetIndex:di, label:xLabel }, dataType, subType) : null;
        const pos = elem.tooltipPosition();
        // Mostrar siempre el valor principal (porcentaje o valor), pero solo dibujar el absoluto
        // cuando se solicita explícitamente (por ejemplo al generar PDF)
        const showAbs = !!window.__showChartAbsOnCanvas;
        if(unit === '%'){
          ctx.fillText(`${val.toFixed(1)}%`, pos.x, pos.y-4);
          if(showAbs && abs){ ctx.fillText(`(${formatNumber(abs)})`, pos.x, pos.y-16); }
        } else {
          // e.g. 'personas'
          ctx.fillText(`${val} ${unit}`, pos.x, pos.y-4);
          if(showAbs && abs){ ctx.fillText(`(${formatNumber(abs)})`, pos.x, pos.y-16); }
        }
      });
    });
    ctx.restore();
  }
};
if (typeof Chart!=='undefined'){ Chart.register(customValueLabelsPlugin); }

function getSimpleBarChartConfig(title, unit, isPercentage=true){ return { type:'bar', data:{ labels:['Municipal','Estatal','Nacional'], datasets:[{ label:title||'Dato', data:[], backgroundColor:[colors.municipal,colors.estatal,colors.nacional] }] }, options:{ maintainAspectRatio:false, plugins:{ title:{ display: !!title, text:title }, legend:{ display:false }, tooltip:{ callbacks:{ label: makeTooltipCallback() } }, customValueLabels:{} }, scales:{ y:{ beginAtZero:true, title:{ display:true, text: unit } } } } } }
function getPEASexoConfig(){ return { type:'bar', data:{ labels:['Hombres','Mujeres'], datasets:[] }, options:{ maintainAspectRatio:false, plugins:{ title:{ display:true, text:'' }, legend:{ position:'bottom' }, tooltip:{ callbacks:{ label: makeTooltipCallback() } }, customValueLabels:{} }, scales:{ y:{ beginAtZero:true, title:{ display:true, text:'Porcentaje' } } } } } }
function getServiciosBasicosConfig(){ return { type:'bar', data:{ labels:['Electricidad','Agua entubada','Drenaje'], datasets:[] }, options:{ maintainAspectRatio:false, plugins:{ title:{ display:true, text:'' }, legend:{ position:'bottom' }, tooltip:{ callbacks:{ label: makeTooltipCallback() } }, customValueLabels:{} }, scales:{ y:{ beginAtZero:true, max:100, title:{ display:true, text:'Porcentaje de viviendas' } } } } } }
function getTICCombinadoConfig(){ return { type:'bar', data:{ labels:['Computadora','Internet','Teléfono Celular'], datasets:[] }, options:{ maintainAspectRatio:false, plugins:{ title:{ display:true, text:'' }, legend:{ position:'bottom' }, tooltip:{ callbacks:{ label: makeTooltipCallback() } }, customValueLabels:{} }, scales:{ y:{ beginAtZero:true, max:100, title:{ display:true, text:'Porcentaje de viviendas' } } } } } }
function getMovilidadConfig(title, labels){ return { type:'bar', data:{ labels, datasets:[] }, options:{ maintainAspectRatio:false, plugins:{ title:{ display:true, text:title }, legend:{ display:false }, tooltip:{ callbacks:{ label: makeTooltipCallback() } }, customValueLabels:{} }, scales:{ y:{ beginAtZero:true, max:100, title:{ display:true, text:'Porcentaje' } } } } } }

function getPiramidePoblacionalConfig(){
  return {
    type: 'bar',
    data: {
      labels: ['0-4 años','5-9 años','10-14 años','15-19 años','20-24 años','25-29 años','30-34 años','35-39 años','40-44 años','45-49 años','50-54 años','55-59 años','60-64 años','65-69 años','70-74 años','75-79 años','80-84 años','85 años y más'],
      datasets: []
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        // No mostrar la leyenda: los colores se revelarán al pasar el mouse sobre cada barra
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context){
                  // Garantizar coerción numérica y usar datasetIndex para elegir sexo
                  const rawVal = Number(context.parsed.x) || 0;
                  const abs = Math.abs(rawVal);
                  const idx = context.dataIndex;
                  const dsIndex = context.datasetIndex;
                  const mSel = document.getElementById('municipio-select');
                  const key = mSel ? mSel.value : null;
                  const base = (window.nayaritData || nayaritData) || {};
                  const m = (base && base.municipios && key) ? base.municipios[key] : {};
                  const map = [
                    {h:'P_0A4_M',f:'P_0A4_F'},{h:'P_5A9_M',f:'P_5A9_F'},{h:'P_10A14_M',f:'P_10A14_F'},{h:'P_15A19_M',f:'P_15A19_F'},{h:'P_20A24_M',f:'P_20A24_F'},{h:'P_25A29_M',f:'P_25A29_F'},{h:'P_30A34_M',f:'P_30A34_F'},{h:'P_35A39_M',f:'P_35A39_F'},{h:'P_40A44_M',f:'P_40A44_F'},{h:'P_45A49_M',f:'P_45A49_F'},{h:'P_50A54_M',f:'P_50A54_F'},{h:'P_55A59_M',f:'P_55A59_F'},{h:'P_60A64_M',f:'P_60A64_F'},{h:'P_65A69_M',f:'P_65A69_F'},{h:'P_70A74_M',f:'P_70A74_F'},{h:'P_75A79_M',f:'P_75A79_F'},{h:'P_80A84_M',f:'P_80A84_F'},{h:'P_85YMAS_M',f:'P_85YMAS_F'}
                  ];
                  // datasetIndex 0 -> Hombres, 1 -> Mujeres (coherente con updatePiramidePoblacional)
                  const sex = (dsIndex === 0) ? 'h' : 'f';
                  const varKey = (map[idx] && map[idx][sex]) ? map[idx][sex] : null;
                  const absPeople = varKey ? (m[varKey] || 0) : 0;
                  // Mostrar porcentaje absoluto y conteo de personas
                  return `${abs.toFixed(1)}% (${formatNumber(absPeople)} personas)`;
                }
          }
        }
      },
      scales: {
        x: { stacked:true, ticks: { callback: (v) => Math.abs(v) + '%' } },
        y: { stacked:true, reverse:true, ticks:{ autoSkip:false, maxRotation:0, minRotation:0, font:{ size:10 } }, afterFit:(s)=>{ s.width = 120; } }
      },
      layout: { padding: { left:10, right:10, top:10, bottom:10 } }
    }
  };
}

function updateViviendaIndicators(municipioKey){
  const base = (window.nayaritData || nayaritData);
  const m = base && base.municipios ? base.municipios[municipioKey] : null;
  if(!m) return;
  const elTotal = document.getElementById('total-viviendas'); if(elTotal) elTotal.textContent = formatNumber(m.VIVTOT);
  const elHab = document.getElementById('viviendas-habitadas'); if(elHab) elHab.textContent = formatNumber(m.TVIVHAB);
  const elPart = document.getElementById('viviendas-particulares-habitadas'); if(elPart) elPart.textContent = formatNumber(m.TVIVPARHAB);
  const elDes = document.getElementById('viviendas-deshabitadas'); if(elDes) elDes.textContent = formatNumber(m.VIVPAR_DES);
  const elOcup = document.getElementById('ocupantes-vivienda'); if(elOcup) elOcup.textContent = (m.PROM_OCUP||0).toFixed(1);
}

// Exponer funciones públicas como API global para uso desde HTML y para ESLint
if (typeof window !== 'undefined') {
  window.calcPct = calcPct;
  window.calcularEdadMediana = calcularEdadMediana;
  window.getSimpleBarChartConfig = getSimpleBarChartConfig;
  window.getPEASexoConfig = getPEASexoConfig;
  window.getServiciosBasicosConfig = getServiciosBasicosConfig;
  window.getTICCombinadoConfig = getTICCombinadoConfig;
  window.getMovilidadConfig = getMovilidadConfig;
  window.getPiramidePoblacionalConfig = getPiramidePoblacionalConfig;
  window.updateViviendaIndicators = updateViviendaIndicators;
}
