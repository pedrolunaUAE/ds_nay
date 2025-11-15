
function formatNumber(num){ return new Intl.NumberFormat('es-MX').format(num); }

document.addEventListener('DOMContentLoaded',()=>{
  const d = document.getElementById('fecha-generacion'); if(d){ d.textContent = new Date().toISOString().split('T')[0]; }
  const sel = document.getElementById('municipio-select');
  const src = (window.nayaritData||nayaritData);
  if(src && src.municipios){ Object.keys(src.municipios).forEach(k=>{ const o=document.createElement('option'); o.value=k; o.textContent=k; sel.appendChild(o); }); }
  document.getElementById('download-pdf')?.addEventListener('click', generatePDF);
  initCharts();
  const first = sel.value || (src && Object.keys(src.municipios)[0]);
  if(first){ updateAllCharts(first); updateIndicators(first); sel.value = first; }
  sel.addEventListener('change', function(){ updateAllCharts(this.value); updateIndicators(this.value); });
});

function initCharts(){
  charts.piramidePoblacional = new Chart(document.getElementById('piramide-poblacional'), getPiramidePoblacionalConfig());
  charts.escolaridad = new Chart(document.getElementById('escolaridad-chart'), getSimpleBarChartConfig('', 'años', false));
  charts.analfabetismo = new Chart(document.getElementById('analfabetismo-chart'), getSimpleBarChartConfig('', '%', true));
  charts.participacionEconomica = new Chart(document.getElementById('participacion-economica-chart'), getSimpleBarChartConfig('', '%', true));
  charts.peaSexo = new Chart(document.getElementById('pea-sexo-chart'), getPEASexoConfig());
  charts.sinSalud = new Chart(document.getElementById('sin-salud-chart'), getSimpleBarChartConfig('', '%', true));
  charts.conSalud = new Chart(document.getElementById('con-salud-chart'), getSimpleBarChartConfig('', '%', true));
  charts.lenguaIndigena = new Chart(document.getElementById('lengua-indigena-chart'), getSimpleBarChartConfig('', '%', true));
  charts.discapacidad = new Chart(document.getElementById('discapacidad-chart'), getSimpleBarChartConfig('', '%', true));
  charts.ocupantesVivienda = new Chart(document.getElementById('ocupantes-vivienda-chart'), getSimpleBarChartConfig('', 'personas', false));
  charts.lugarNacimiento = new Chart(document.getElementById('lugar-nacimiento-chart'), getMovilidadConfig('', ['Nacidos en la entidad','Nacidos en otra entidad']));
  charts.movilidadReciente = new Chart(document.getElementById('movilidad-reciente-chart'), getMovilidadConfig('', ['Residían en la entidad','Residían en otra entidad']));
  charts.serviciosBasicos = new Chart(document.getElementById('servicios-basicos-chart'), getServiciosBasicosConfig());
  charts.ticCombinado = new Chart(document.getElementById('tic-combinado-chart'), getTICCombinadoConfig());
}

function updateAllCharts(k){ const d=(window.nayaritData||nayaritData); const m=d.municipios[k]; if(!m) return;
  updatePiramidePoblacional(m); updateEscolaridad(m); updateAnalfabetismo(m); updateParticipacionEconomica(m); updatePEASexo(m); updateSalud(m); updateLenguaIndigena(m); updateDiscapacidad(m); updateMovilidadPoblacional(m); updateOcupantesVivienda(m); updateServiciosBasicos(m); updateTICCombinado(m); updateViviendaIndicators(k);
}

function updateIndicators(k){ const d=(window.nayaritData||nayaritData); const m=d.municipios[k]; if(!m) return;
  document.getElementById('poblacion-total').textContent = formatNumber(m.POBTOT||0);
  document.getElementById('poblacion-femenina').textContent = formatNumber(m.POBFEM||0);
  document.getElementById('poblacion-masculina').textContent = formatNumber(m.POBMAS||0);
  document.getElementById('indice-masculinidad').textContent = (m.REL_H_M||0).toFixed ? m.REL_H_M.toFixed(1) : m.REL_H_M;
  document.getElementById('edad-mediana').textContent = `${calcularEdadMediana(m)} años`;
  document.getElementById('poblacion-0-14').textContent = formatNumber(m.POB0_14||0);
  document.getElementById('poblacion-15-64').textContent = formatNumber(m.POB15_64||0);
  document.getElementById('poblacion-65-mas').textContent = formatNumber(m.POB65_MAS||0);
}

function updatePiramidePoblacional(m){
  const h=[
    parseFloat((-(m.P_0A4_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_5A9_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_10A14_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_15A19_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_20A24_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_25A29_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_30A34_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_35A39_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_40A44_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_45A49_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_50A54_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_55A59_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_60A64_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_65A69_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_70A74_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_75A79_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_80A84_M/m.POBTOT*100)).toFixed(1)),
    parseFloat((-(m.P_85YMAS_M/m.POBTOT*100)).toFixed(1))
  ];
  const f=[
    parseFloat((m.P_0A4_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_5A9_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_10A14_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_15A19_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_20A24_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_25A29_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_30A34_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_35A39_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_40A44_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_45A49_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_50A54_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_55A59_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_60A64_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_65A69_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_70A74_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_75A79_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_80A84_F/m.POBTOT*100).toFixed(1)),
    parseFloat((m.P_85YMAS_F/m.POBTOT*100).toFixed(1))
  ];
  // Dibujar las barras transparentes y mostrar color solo al pasar el mouse (hover)
  // Aplicar un relleno sutil y mantener la leyenda oculta; no imprimiremos etiquetas sobre las barras
  charts.piramidePoblacional.data.datasets = [
    { label: 'Hombres', data: h, backgroundColor: 'rgba(0,63,92,0.16)', hoverBackgroundColor: colors.municipal, borderColor: colors.municipal, borderWidth: 1 },
    { label: 'Mujeres', data: f, backgroundColor: 'rgba(221,81,130,0.16)', hoverBackgroundColor: colors.accent2 || '#dd5182', borderColor: colors.accent2 || '#dd5182', borderWidth: 1 }
  ];
  charts.piramidePoblacional.update();
}
function updateEscolaridad(m){ const e=nayaritData.estatal, n=nayaritData.nacional; charts.escolaridad.data.datasets[0].data=[m.GRAPROES,e.GRAPROES,n.GRAPROES]; charts.escolaridad.update(); }
function updateAnalfabetismo(m){ const e=nayaritData.estatal, n=nayaritData.nacional; const v=[calcPct(m.P15YM_AN,m.P_15YMAS),calcPct(e.P15YM_AN,e.P_15YMAS),calcPct(n.P15YM_AN,n.P_15YMAS)]; charts.analfabetismo.data.datasets[0].data=v.map(parseFloat); charts.analfabetismo.update(); }
function updateParticipacionEconomica(m){ const e=nayaritData.estatal, n=nayaritData.nacional; const v=[calcPct(m.PEA,m.P_12YMAS),calcPct(e.PEA,e.P_12YMAS),calcPct(n.PEA,n.P_12YMAS)]; charts.participacionEconomica.data.datasets[0].data=v.map(parseFloat); charts.participacionEconomica.update(); }
function updatePEASexo(m){ const e=nayaritData.estatal, n=nayaritData.nacional; const mun=[calcPct(m.PEA_M,m.P_12YMAS_M),calcPct(m.PEA_F,m.P_12YMAS_F)], est=[calcPct(e.PEA_M,e.P_12YMAS_M),calcPct(e.PEA_F,e.P_12YMAS_F)], nac=[calcPct(n.PEA_M,n.P_12YMAS_M),calcPct(n.PEA_F,n.P_12YMAS_F)]; charts.peaSexo.data.datasets=[{label:'Municipal',data:mun,backgroundColor:colors.municipal},{label:'Estatal',data:est,backgroundColor:colors.estatal},{label:'Nacional',data:nac,backgroundColor:colors.nacional}]; charts.peaSexo.update(); }
function updateSalud(m){ const e=nayaritData.estatal, n=nayaritData.nacional; charts.sinSalud.data.datasets[0].data=[calcPct(m.PSINDER,m.POBTOT),calcPct(e.PSINDER,e.POBTOT),calcPct(n.PSINDER,n.POBTOT)].map(parseFloat); charts.conSalud.data.datasets[0].data=[calcPct(m.PDER_SS,m.POBTOT),calcPct(e.PDER_SS,e.POBTOT),calcPct(n.PDER_SS,n.POBTOT)].map(parseFloat); charts.sinSalud.update(); charts.conSalud.update(); }
function updateLenguaIndigena(m){ const e=nayaritData.estatal, n=nayaritData.nacional; charts.lenguaIndigena.data.datasets[0].data=[calcPct(m.P3YM_HLI,m.P_3YMAS),calcPct(e.P3YM_HLI,e.P_3YMAS),calcPct(n.P3YM_HLI,n.P_3YMAS)].map(parseFloat); charts.lenguaIndigena.update(); }
function updateDiscapacidad(m){ const e=nayaritData.estatal, n=nayaritData.nacional; charts.discapacidad.data.datasets[0].data=[calcPct(m.PCON_DISC,m.POBTOT),calcPct(e.PCON_DISC,e.POBTOT),calcPct(n.PCON_DISC,n.POBTOT)].map(parseFloat); charts.discapacidad.update(); }
function updateMovilidadPoblacional(m){ updateLugarNacimiento(m); updateMovilidadReciente(m); }
function updateLugarNacimiento(m){ const e=nayaritData.estatal, n=nayaritData.nacional; const vm=[calcPct(m.PNACENT,m.POBTOT),calcPct(m.PNACOE,m.POBTOT)], ve=[calcPct(e.PNACENT,e.POBTOT),calcPct(e.PNACOE,e.POBTOT)], vn=[calcPct(n.PNACENT,n.POBTOT),calcPct(n.PNACOE,n.POBTOT)]; charts.lugarNacimiento.data.datasets=[{label:'Municipal',data:vm,backgroundColor:colors.municipal},{label:'Estatal',data:ve,backgroundColor:colors.estatal},{label:'Nacional',data:vn,backgroundColor:colors.nacional}]; charts.lugarNacimiento.update(); }
function updateMovilidadReciente(m){ const e=nayaritData.estatal, n=nayaritData.nacional; const vm=[calcPct(m.PRES2015,m.P_5YMAS),calcPct(m.PRESOE15,m.P_5YMAS)], ve=[calcPct(e.PRES2015,e.P_5YMAS),calcPct(e.PRESOE15,e.P_5YMAS)], vn=[calcPct(n.PRES2015,n.P_5YMAS),calcPct(n.PRESOE15,n.P_5YMAS)]; charts.movilidadReciente.data.datasets=[{label:'Municipal',data:vm,backgroundColor:colors.municipal},{label:'Estatal',data:ve,backgroundColor:colors.estatal},{label:'Nacional',data:vn,backgroundColor:colors.nacional}]; charts.movilidadReciente.update(); }
function updateOcupantesVivienda(m){ const e=nayaritData.estatal, n=nayaritData.nacional; charts.ocupantesVivienda.data.datasets[0].data=[(m.PROM_OCUP||0).toFixed(1),(e.PROM_OCUP||0).toFixed(1),(n.PROM_OCUP||0).toFixed(1)]; charts.ocupantesVivienda.update(); }
function updateServiciosBasicos(m){ const e=nayaritData.estatal, n=nayaritData.nacional; const bM=m.VIVPARH_CV||m.TVIVPARHAB||m.TVIVHAB||1, bE=e.VIVPARH_CV||e.TVIVPARHAB||e.TVIVHAB||1, bN=n.VIVPARH_CV||n.TVIVPARHAB||n.TVIVHAB||1; const dm=[calcPct(m.VPH_C_ELEC,bM),calcPct(m.VPH_AGUADV,bM),calcPct(m.VPH_DRENAJ,bM)], de=[calcPct(e.VPH_C_ELEC,bE),calcPct(e.VPH_AGUADV,bE),calcPct(e.VPH_DRENAJ,bE)], dn=[calcPct(n.VPH_C_ELEC,bN),calcPct(n.VPH_AGUADV,bN),calcPct(n.VPH_DRENAJ,bN)]; charts.serviciosBasicos.data.datasets=[{label:'Municipal',data:dm,backgroundColor:colors.municipal},{label:'Estatal',data:de,backgroundColor:colors.estatal},{label:'Nacional',data:dn,backgroundColor:colors.nacional}]; charts.serviciosBasicos.update(); }
function updateTICCombinado(m){ const e=nayaritData.estatal, n=nayaritData.nacional; const bM=m.VIVPARH_CV||m.TVIVPARHAB||m.TVIVHAB||1, bE=e.VIVPARH_CV||e.TVIVPARHAB||e.TVIVHAB||1, bN=n.VIVPARH_CV||n.TVIVPARHAB||n.TVIVHAB||1; const dm=[calcPct(m.VPH_PC,bM),calcPct(m.VPH_INTER,bM),calcPct(m.VPH_CEL,bM)], de=[calcPct(e.VPH_PC,bE),calcPct(e.VPH_INTER,bE),calcPct(e.VPH_CEL,bE)], dn=[calcPct(n.VPH_PC,bN),calcPct(n.VPH_INTER,bN),calcPct(n.VPH_CEL,bN)]; charts.ticCombinado.data.datasets=[{label:'Municipal',data:dm,backgroundColor:colors.municipal},{label:'Estatal',data:de,backgroundColor:colors.estatal},{label:'Nacional',data:dn,backgroundColor:colors.nacional}]; charts.ticCombinado.update(); }
