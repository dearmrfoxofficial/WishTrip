(function(){
  const $ = (id)=>document.getElementById(id);

  function guessMonths(input){
    const m = (input||'').toLowerCase();
    if(!m) return [];
    const monthMap = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
    const out = [];
    if(m.includes('summer')) out.push(6,7,8);
    if(m.includes('winter')) out.push(12,1,2);
    if(m.includes('spring')) out.push(3,4,5);
    if(m.includes('fall')||m.includes('autumn')) out.push(9,10,11);
    m.split(/[, ]+/).forEach(tok=>{
      const key = tok.slice(0,3);
      if(monthMap[key]) out.push(monthMap[key]);
    });
    return Array.from(new Set(out)).sort((a,b)=>a-b);
  }

  function buildJSON(){
    const name = $('name').value.trim() || 'My Trip';
    const home = $('homeAirports').value.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
    const dests = $('destinations').value.split(',').map(s=>s.trim()).filter(Boolean);
    const months = guessMonths($('months').value);
    const pattern = $('pattern').value;
    const nightsTxt = $('nights').value.trim();
    const nights = /^\d+\s*-\s*\d+$/.test(nightsTxt) ? nightsTxt : '';
    const maxPrice = parseInt(($('maxPrice').value||'').replace(/[^0-9]/g,''),10) || null;
    const cadence = $('cadence').value;
    const notes = $('notes').value.trim();

    const cfg = { name, homeAirports: home, destinations: dests, months, pattern, nights, maxPrice, cadence, notes };
    $('output').value = JSON.stringify(cfg, null, 2);
    return cfg;
  }

  function googleFlightsLink(home, dest, months){
    const q = encodeURIComponent(`Flights from ${home} to ${dest} ${months.length?('in ' + months.map(m=>new Date(2025,m-1,1).toLocaleString('en',{month:'long'})).join(' or ')) : ''}`);
    return `https://www.google.com/travel/flights?q=${q}`;
  }
  function hotelsLink(dest, months){
    const q = encodeURIComponent(`${dest} hotels ${months.length?('in ' + months.map(m=>new Date(2025,m-1,1).toLocaleString('en',{month:'long'})).join(' or ')) : ''}`);
    return `https://www.google.com/travel/hotels?q=${q}`;
  }
  function skyscannerLink(home, dest){
    return `https://www.skyscanner.com/transport/flights/${home.toLowerCase()}/${encodeURIComponent(dest.toLowerCase())}/?adults=1`;
  }

  function previewLinks(){
    const cfg = buildJSON();
    const cont = $('links');
    cont.innerHTML = '';
    if(cfg.homeAirports.length===0 || cfg.destinations.length===0){ cont.innerHTML = '<span class="muted small">Add home airports and destinations first.</span>'; return; }
    for(const h of cfg.homeAirports){
      for(const d of cfg.destinations){
        const a = document.createElement('a');
        a.className = 'pill'; a.target = '_blank'; a.rel = 'noopener';
        a.href = googleFlightsLink(h,d,cfg.months);
        a.textContent = `${h} → ${d} (Flights)`;
        cont.appendChild(a);

        const b = document.createElement('a');
        b.className = 'pill'; b.target = '_blank'; b.rel = 'noopener';
        b.href = hotelsLink(d,cfg.months);
        b.textContent = `${d} (Hotels)`;
        cont.appendChild(b);

        const c = document.createElement('a');
        c.className = 'pill'; c.target = '_blank'; c.rel = 'noopener';
        c.href = skyscannerLink(h,d);
        c.textContent = `${h} → ${d} (Skyscanner)`;
        cont.appendChild(c);
      }
    }
  }

  $('generate').onclick = buildJSON;
  $('clear').onclick = ()=>{ ['name','homeAirports','destinations','months','nights','maxPrice','notes'].forEach(id=>$(id).value=''); $('pattern').value='any'; $('cadence').value='WEEKLY'; $('output').value=''; $('links').innerHTML=''; };
  $('copy').onclick = ()=>{ navigator.clipboard.writeText($('output').value).then(()=>alert('Copied!')).catch(()=>alert('Copy failed')); };
  $('preview').onclick = previewLinks;
  $('loadSample').onclick = ()=>{
    $('name').value = 'Europe Fall Sampler';
    $('homeAirports').value = 'SLC, DEN';
    $('destinations').value = 'Paris, Rome, Barcelona';
    $('months').value = 'Sep, Oct, Nov';
    $('pattern').value = 'weekends';
    $('nights').value = '5-9';
    $('maxPrice').value = '700';
    $('cadence').value = 'WEEKLY';
    $('notes').value = 'Prefer nonstop; avoid redeye.';
    buildJSON();
    previewLinks();
  };
})();