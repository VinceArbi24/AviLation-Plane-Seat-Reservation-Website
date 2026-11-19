/* ==========================================================================
   AviLation: js/globe.js
   Animated globe for the home page hero (index.html).

   What it does
   - Draws a rotating dotted Earth on a canvas inside .hero-image.
   - A plane flies a curved route from the departure city to the destination.
   - Glowing city markers, and a floating label for the destination.
   - Pick a destination (type it in the form, or tap a chip under the globe)
     and the globe turns towards it while the plane sets off again.

   To switch it on, add this line in index.html (in <head> or before </body>):

       <script src="js/globe.js"></script>

   It also passes the home search form (from, to, date, passengers) on to
   booking.html, so the home page search really works.

   No libraries needed. If this script fails to load, the page falls back to
   the plain image from the HTML, so nothing breaks.
   ========================================================================== */
function aviLationGlobe() {
  'use strict';

  var host = document.querySelector('.hero-image');
  if (!host) { return; }

  /* ---------- land outlines (coarse, hand-made) ---------- */
  // Hand-authored coarse land outlines [lon,lat]. Even-odd fill; WATER polygons are subtracted.
  var LAND = [
  // North America
  [[-168,66],[-162,70],[-156,71.5],[-141,69.6],[-128,70],[-115,68.5],[-95,72],[-85,69],[-82,66],[-90,64],[-94,60],[-93,57],[-85,55],[-82,52],[-79,51.5],[-78,57],[-77,62],[-72,61],[-65,60],[-62,57],[-56,52],[-60,50],[-66,49],[-64,47],[-60,46],[-66,44],[-70,43],[-70,41.5],[-74,40.5],[-76,37],[-76,35],[-81,31],[-80,26],[-82,26.5],[-84,30],[-89,30],[-94,29.5],[-97,27],[-97.5,22],[-96,19],[-91,18.5],[-90.5,21],[-87,21.5],[-88,16],[-84,15.5],[-83.5,11],[-81,8.5],[-77.5,8.5],[-80,7.5],[-83,8.5],[-86,11],[-88,13],[-92,14.5],[-96,15.8],[-105,19.5],[-106,23],[-109,26],[-112.5,29],[-112,28],[-110,23],[-112,24.5],[-115,28],[-117,32.5],[-120.5,34.5],[-122.5,37.5],[-124,40.5],[-124,46],[-123,48.5],[-127,51],[-131,55],[-135,58.5],[-141,60],[-148,60.5],[-152,58.5],[-158,56.5],[-163,55],[-158,58.5],[-162,60],[-166,62],[-164,64.5]],
  // Greenland
  [[-73,78],[-60,82],[-30,83.5],[-18,80],[-20,75],[-22,70],[-30,68],[-40,65],[-43,60],[-49,61],[-52,65],[-54,69],[-58,75]],
  // South America
  [[-77.5,8.5],[-72,12],[-64,10.5],[-60,8.5],[-52,5],[-50,0],[-44,-2.5],[-35,-5.5],[-35,-9],[-38.5,-13],[-39,-18],[-41,-22],[-45,-23.5],[-48.5,-26],[-48.5,-28.5],[-53,-34],[-58,-34.5],[-57,-38],[-62,-39],[-65,-41],[-65,-45],[-67.5,-46.5],[-66,-48],[-69,-51],[-68.5,-53],[-66,-55],[-72,-54],[-75,-50],[-74,-44],[-73.5,-37],[-71.5,-30],[-70.5,-23],[-70.5,-18.5],[-76,-14],[-79,-8],[-81.5,-5],[-80,-2],[-80,1],[-77.5,4]],
  // Eurasia
  [[-5.5,36],[-9,37],[-8.8,41],[-9.5,43],[-1.8,43.5],[-1.2,46],[-4.5,48.3],[-1.5,48.7],[1.5,50.2],[3,51.2],[4.5,52.5],[8.5,53.7],[8.5,55.5],[10,57.5],[10.5,56],[11,54.2],[14,54],[19,54.4],[21,56],[21,57.5],[24,57.5],[24,59.4],[30,59.9],[28,60.5],[24,60],[21.5,61],[21.5,63],[25,65],[22,65.8],[17.5,62.5],[17.2,60.7],[18.9,59.5],[16.5,57],[14.3,56],[12.8,55.5],[11.5,58.5],[8,58],[5.5,59],[5,62],[8,63.5],[12.5,65.5],[15,68.7],[20,70],[26,71],[31,70.2],[33,69.5],[41,67.8],[40.5,66],[34.5,66.5],[34,64.5],[37,64],[40,64.8],[44,66],[44,68.5],[53,68.8],[60,69.5],[66,69],[68,71.5],[72,73],[80,73.5],[87,75],[95,76],[104,77.7],[112,76],[114,73.8],[118,73.5],[128,73],[132,71.5],[140,72.5],[150,71.5],[160,69.5],[170,70],[178,69],[180,68.5],[180,65],[178,64],[173,61.5],[170,60],[164,59.8],[162,57.8],[160,54],[156.7,50.9],[155.5,55.5],[156,57.5],[160,60.5],[155,59.5],[150,59.3],[142,59],[138,55],[140.5,53],[141,48.5],[137,45],[133,43],[130,42.5],[129.5,40.5],[129.3,37],[129,35.1],[126.5,34.6],[126,37.5],[125,39.5],[121.5,39],[121.5,40.8],[118,39],[119,37.2],[122.5,37.2],[120,35.5],[121,32],[122,30],[120,26.5],[117,23.5],[113,22],[110.5,21],[108,21.5],[106,20],[106.5,18],[109,15],[108.8,12],[107.5,10.5],[105,8.7],[104.5,10.5],[102.5,12],[100.5,13.5],[99.5,10.5],[100.2,7],[102,6],[103.5,4],[104.2,1.4],[103.5,1.3],[101.3,2.8],[100.3,5.5],[98.5,8],[98.3,12],[97.7,16.5],[94.2,16.5],[94,19],[92,21.5],[90.5,22.2],[88.5,21.5],[87,21],[86.5,20],[84.5,18.5],[82,16.5],[80.2,15.5],[80.3,12.5],[79.8,10.3],[79,9.2],[77.5,8.2],[76.5,9.5],[75,12.5],[73.7,16],[72.8,19.5],[72.8,21.5],[70.5,21],[69,22.3],[67,24.7],[64,25.2],[61.5,25.2],[57.5,25.7],[56.5,27],[54.5,26.6],[51.5,27.8],[50,29.8],[48.5,30],[48,29.5],[49.5,27],[50.2,26],[51.6,24.5],[53,24.2],[55.5,25.3],[56.4,26.3],[56.3,24.5],[58.5,23.6],[59.8,22.5],[58,20.5],[56.5,18],[52.5,16],[48.5,14],[45,12.8],[43.3,13.2],[42.7,16],[41,19],[38.7,23.5],[36.7,26],[35,28.2],[34.9,29.5],[35,31.5],[34.5,31.5],[35,33.5],[35.8,35.8],[36,36.5],[34,36.2],[31,36.8],[28.5,36.8],[27,37.5],[26.3,39.5],[26,40.8],[24,40.5],[23.5,38.5],[22.5,36.5],[21.5,37],[21,38.5],[19.5,40],[19.5,42],[16,43.5],[13.5,45.5],[12.3,44.8],[13.5,43.5],[16,41.8],[18.5,40.2],[16.5,38.8],[16,38],[15.7,40],[14,40.8],[12,41.8],[10.5,43],[9,44.3],[7,43.7],[4.5,43.4],[3,42.5],[3.2,41.8],[0.8,41],[-0.2,39.2],[0,38.7],[-0.7,37.6],[-2.2,36.8],[-4.5,36.7]],
  // Africa
  [[-5.5,35.8],[-2,35.1],[3,36.8],[10,37.3],[11,35.2],[10,33.5],[15,32.3],[20,32.2],[20,30.8],[25,31.6],[29,31],[32.3,31.3],[32.5,30],[33.8,27.5],[35.5,24],[37.2,21],[37.5,18],[39,15.5],[42.5,12.8],[43.5,11.7],[51,12],[51,10.5],[48,5],[43,0],[40,-3],[39,-6],[40.5,-11],[40.5,-15],[35,-19.5],[35.5,-24],[32.8,-26],[32.8,-28.5],[30,-31.5],[27,-33.7],[22,-34.2],[19,-34.5],[18.2,-32],[16,-28.5],[14.5,-22.5],[12,-17],[13.8,-11],[12.3,-6],[9,-1],[9.5,3.5],[6,4.3],[4.5,6.3],[1,5.8],[-3,5],[-7.5,4.4],[-10,6.2],[-13,8.5],[-15.5,11.5],[-17.2,14.7],[-16.5,19],[-17,21],[-13,27.5],[-10,29.5],[-9.7,31.5],[-8,33.5],[-6,35.5]],
  // Madagascar
  [[49.3,-12],[50.4,-15.5],[49.2,-20],[47.2,-25],[45,-25.5],[43.3,-22],[44.2,-17],[47,-15]],
  // Australia
  [[113.5,-22],[114,-26],[115,-34],[118,-35],[123,-34],[126,-32.3],[131,-31.5],[134,-32.7],[137.8,-33.2],[137.5,-35.2],[140,-37.7],[143.5,-38.8],[146.5,-39],[150,-37.5],[151.2,-34],[153,-30],[153.2,-27],[152,-24.5],[149,-21],[146.3,-19],[145.5,-15],[143.7,-14],[142.5,-10.8],[141.5,-13],[141.5,-17],[139.5,-17.5],[136.8,-15.8],[135.5,-14.5],[136.8,-12.2],[132.5,-11.5],[131,-12.2],[129.5,-15],[126,-14],[123.5,-17],[121.5,-19.5],[117,-20.7]],
  [[144.8,-40.7],[148.3,-40.9],[148,-43],[146,-43.6]],
  [[172.7,-34.5],[175.5,-37],[178.5,-37.7],[176,-39.5],[175,-41.5],[173,-39.2],[174.5,-37]],
  [[172.7,-40.5],[174.3,-41.7],[171.5,-44.5],[170.5,-46],[167,-46.2],[166.5,-45.5],[168,-44],[170.5,-43]],
  // British Isles, Iceland
  [[-5.7,50],[1.4,51.2],[1.7,52.7],[0,53.5],[-1.5,55],[-2,57.6],[-3.5,58.6],[-6,58],[-5.5,56],[-5,54.8],[-3,54.5],[-3,53.5],[-4.5,53.3],[-5,51.7],[-3.5,51.3]],
  [[-10,51.8],[-6,52],[-6,54.5],[-8,55.2],[-10,54]],
  [[-24,65.5],[-22,66.4],[-16,66.5],[-13.5,65],[-18,63.5],[-22,63.8]],
  // Japan, Sakhalin, Taiwan, Hainan
  [[130.8,34],[132,34.8],[135.5,35.6],[136.8,37.4],[139.5,38.2],[140,40.5],[141.5,41.3],[142,39.5],[141,37],[140.8,35.7],[139.8,35],[137,34.7],[135.2,33.5],[133,33.8]],
  [[140,41.5],[141.5,43],[145.5,43.3],[143.5,42],[141,41.5]],
  [[129.8,33.2],[131.8,33.7],[131.2,31.3],[130.3,31.2]],
  [[142,46],[143.5,49],[143,53.5],[142.5,54],[142,50]],
  [[120.2,23],[121,25.2],[122,25],[121.5,22],[120.7,22]],
  [[108.6,19.5],[110.5,20],[111,19],[109.5,18.2]],
  // Philippines
  [[120.5,18.5],[122.2,18.5],[122.5,16.5],[121.6,14],[124,13],[122,13.5],[120.6,14.2],[120,16]],
  [[122,7],[123.5,8.5],[125.5,9.8],[126.5,7.5],[125.5,5.8],[123.5,6.8]],
  [[124,12.5],[125.6,12.2],[125,10.5],[124.3,10.5]],
  [[122,11.5],[123.3,11],[123.2,9.5],[122.5,10]],
  // Indonesia, PNG, Sri Lanka
  [[95.3,5.6],[98,4],[100.5,2],[103.7,-1],[106,-3.2],[105.8,-5.8],[102,-4],[99,0],[96,3.5]],
  [[105.2,-6.8],[108,-6.3],[111,-6.5],[114.5,-7.8],[114.4,-8.7],[108,-7.8],[105.5,-6.8]],
  [[109,1.5],[111,1.8],[113,3.2],[115,5],[117,7],[119,5.2],[117.5,2.5],[118,1],[117,-1],[116.5,-3.7],[114.5,-4],[111.5,-3.2],[110,-2],[109,-0.5]],
  [[119.5,-5.5],[120.4,-2.8],[121,-1],[123,0.5],[125,1.5],[124,0],[122,-1.2],[121.5,-4.5],[122.5,-4.8],[121.7,-5],[120.4,-5.5]],
  [[131,-0.8],[134,-0.8],[138,-1.7],[141,-2.6],[145.5,-4.5],[147.5,-6],[148,-8],[146,-8],[143.5,-8.5],[141,-9.1],[138,-8.2],[137.8,-5],[133,-4],[132,-2.8]],
  [[79.8,9.5],[81.8,7.5],[81,6],[80,6]],
  // Caribbean, Arctic Canada, Newfoundland, Novaya Zemlya
  [[-84.9,21.9],[-82,23.2],[-78,22.5],[-74.2,20.2],[-77.5,20],[-80,21.6]],
  [[-74.4,18.5],[-72,19.8],[-69,19.2],[-68.5,18.5],[-71.5,17.8]],
  [[-80,73.5],[-72,71.5],[-68,69.5],[-62,66.5],[-65,63],[-72,63.5],[-78,64.5],[-73,67.5],[-80,69.5],[-85,70.5]],
  [[-117,73],[-105,73],[-101,69.5],[-110,68],[-118,69.5]],
  [[-90,80],[-65,82.5],[-62,81.3],[-75,78.5],[-90,76.5]],
  [[-59.3,47.7],[-53,47],[-52.7,49.5],[-55.5,51.5],[-59,48.5]],
  [[52,71],[57,70.5],[69,76.5],[60,76.5]],
  // Antarctica
  [[-180,-72],[-120,-74],[-60,-70],[-62,-65],[-55,-63.5],[-58,-72],[0,-70],[60,-67],[100,-66],[150,-68],[180,-71],[180,-90],[-180,-90]]
  ];
  var WATER = [
   [[41.5,41.5],[37,41],[33,42],[29,41.2],[28,42.5],[28.7,44],[30,45.3],[31.5,46.5],[33.5,46],[35,45],[36.5,45.3],[37.5,47],[39,47],[38,45],[37.7,44.5],[40,43.5]],
   [[47,45],[49,46.7],[53,46.8],[53,45],[51,44.5],[52.7,41.5],[53,40],[53.8,37.2],[50.5,37],[49,38.5],[49,41],[47.5,43]]
  ];
  function pip(lon, lat, poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];if(((yi>lat)!=(yj>lat))&&(lon<(xj-xi)*(lat-yi)/(yj-yi)+xi))c=!c;}return c;}
  function isLand(lon,lat){let l=false;for(const p of LAND){if(pip(lon,lat,p)){l=true;break;}}if(!l)return false;for(const w of WATER){if(pip(lon,lat,w))return false;}return true;}
  

  var DEG = Math.PI / 180;
  var DOT_COUNT = 20000;     // points on the sphere; lower this if a phone feels slow
  var CYCLE = 8;             // seconds for one flight

  /* ---------- cities ---------- */
  var CITIES = [
    { name: 'Manila',      code: 'MNL', lon: 120.98, lat: 14.60,  alias: ['philippines'] },
    { name: 'Cebu',        code: 'CEB', lon: 123.95, lat: 10.31,  alias: ['mactan'] },
    { name: 'Singapore',   code: 'SIN', lon: 103.82, lat: 1.35,   alias: [] },
    { name: 'Tokyo',       code: 'NRT', lon: 139.69, lat: 35.68,  alias: ['japan'] },
    { name: 'Seoul',       code: 'ICN', lon: 126.98, lat: 37.57,  alias: ['south korea', 'korea'] },
    { name: 'Hong Kong',   code: 'HKG', lon: 114.17, lat: 22.32,  alias: [] },
    { name: 'Bangkok',     code: 'BKK', lon: 100.50, lat: 13.75,  alias: ['thailand'] },
    { name: 'Kuala Lumpur', code: 'KUL', lon: 101.69, lat: 3.14,  alias: ['malaysia'] },
    { name: 'Taipei',      code: 'TPE', lon: 121.56, lat: 25.03,  alias: ['taiwan'] },
    { name: 'Sydney',      code: 'SYD', lon: 151.21, lat: -33.87, alias: ['australia'] },
    { name: 'Dubai',       code: 'DXB', lon: 55.30,  lat: 25.20,  alias: ['uae', 'united arab emirates'] },
    { name: 'Paris',       code: 'CDG', lon: 2.35,   lat: 48.86,  alias: ['france'] },
    { name: 'London',      code: 'LHR', lon: -0.12,  lat: 51.50,  alias: ['united kingdom', 'uk'] },
    { name: 'New York',    code: 'JFK', lon: -74.00, lat: 40.71,  alias: ['usa', 'united states'] },
    { name: 'Los Angeles', code: 'LAX', lon: -118.24, lat: 34.05, alias: [] }
  ];
  var CHIPS = ['SIN', 'NRT', 'ICN', 'DXB', 'CDG', 'JFK'];

  function byCode(code) {
    for (var i = 0; i < CITIES.length; i++) { if (CITIES[i].code === code) { return CITIES[i]; } }
    return CITIES[0];
  }
  function vec(lon, lat) {
    var la = lat * DEG, lo = lon * DEG;
    return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
  }
  CITIES.forEach(function (c) { c.v = vec(c.lon, c.lat); });

  /* Turns whatever was typed into a city: "tokyo", "Tokyo (NRT)", "japan", "tok" */
  function findCity(text) {
    var t = (text || '').toLowerCase().trim();
    if (t.length < 2) { return null; }
    var i, j, c;
    for (i = 0; i < CITIES.length; i++) {
      c = CITIES[i];
      if (t.indexOf(c.name.toLowerCase()) > -1 || t.indexOf('(' + c.code.toLowerCase() + ')') > -1) { return c; }
      for (j = 0; j < c.alias.length; j++) { if (t.indexOf(c.alias[j]) > -1) { return c; } }
    }
    if (t.length >= 3) {
      for (i = 0; i < CITIES.length; i++) {
        if (CITIES[i].name.toLowerCase().indexOf(t) === 0) { return CITIES[i]; }
      }
    }
    return null;
  }

  /* ---------- state ---------- */
  var state = { origin: byCode('MNL'), dest: byCode('SIN') };
  var route = { a: null, b: null, om: 0 };
  var cam = vec(state.dest.lon, state.dest.lat);
  var routeStart = 0;
  var curTime = 0;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function setRoute() {
    route.a = state.origin.v;
    route.b = state.dest.v;
    var d = route.a[0] * route.b[0] + route.a[1] * route.b[1] + route.a[2] * route.b[2];
    route.om = Math.acos(Math.max(-1, Math.min(1, d)));
  }
  setRoute();

  /* ---------- DOM ---------- */
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) { return; }
  canvas.setAttribute('role', 'img');
  host.classList.add('has-globe');
  host.insertBefore(canvas, host.firstChild);

  var form = document.querySelector('.flight-booking form');
  var textInputs = form ? form.querySelectorAll('input[type="text"]') : [];
  var fromInput = textInputs[0] || null;
  var toInput = textInputs[1] || null;

  /* Suggestions list for the two text boxes */
  var list = document.createElement('datalist');
  list.id = 'globe-cities';
  CITIES.forEach(function (c) {
    var o = document.createElement('option');
    o.value = c.name + ' (' + c.code + ')';
    list.appendChild(o);
  });
  document.body.appendChild(list);
  if (fromInput) { fromInput.setAttribute('list', 'globe-cities'); fromInput.setAttribute('autocomplete', 'off'); }
  if (toInput) { toInput.setAttribute('list', 'globe-cities'); toInput.setAttribute('autocomplete', 'off'); }

  /* Destination chips under the globe */
  var chipBox = document.createElement('div');
  chipBox.className = 'globe-chips';
  chipBox.setAttribute('role', 'group');
  chipBox.setAttribute('aria-label', 'Pick a destination to turn the globe');
  var chipButtons = {};
  CHIPS.forEach(function (code) {
    var c = byCode(code);
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = c.name;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      if (toInput) { toInput.value = c.name + ' (' + c.code + ')'; }
      setDest(c);
    });
    chipButtons[code] = b;
    chipBox.appendChild(b);
  });
  host.appendChild(chipBox);

  function describe() {
    canvas.setAttribute('aria-label',
      'Globe showing a plane flying from ' + state.origin.name + ' to ' + state.dest.name);
    Object.keys(chipButtons).forEach(function (code) {
      chipButtons[code].setAttribute('aria-pressed', code === state.dest.code ? 'true' : 'false');
    });
  }

  function setDest(city) {
    if (!city || city === state.dest) { describe(); return; }
    state.dest = city;
    if (state.origin === city) { state.origin = byCode(city.code === 'MNL' ? 'SIN' : 'MNL'); }
    setRoute();
    routeStart = curTime;
    describe();
    renderStatic();
  }
  function setOrigin(city) {
    if (!city || city === state.origin) { return; }
    state.origin = city;
    if (state.dest === city) { state.dest = byCode(city.code === 'MNL' ? 'SIN' : 'MNL'); }
    setRoute();
    routeStart = curTime;
    describe();
    renderStatic();
  }

  if (toInput) {
    var onTo = function () { var c = findCity(toInput.value); if (c) { setDest(c); } };
    toInput.addEventListener('input', onTo);
    toInput.addEventListener('change', onTo);
  }
  if (fromInput) {
    var onFrom = function () { var c = findCity(fromInput.value); if (c) { setOrigin(c); } };
    fromInput.addEventListener('input', onFrom);
    fromInput.addEventListener('change', onFrom);
  }
  describe();

  /* ---------- sphere points (built once) ---------- */
  var px = new Float32Array(DOT_COUNT);
  var py = new Float32Array(DOT_COUNT);
  var pz = new Float32Array(DOT_COUNT);
  var pLand = new Uint8Array(DOT_COUNT);

  function buildSphere() {
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < DOT_COUNT; i++) {
      var z = 1 - 2 * (i + 0.5) / DOT_COUNT;
      var r = Math.sqrt(1 - z * z);
      var th = golden * i;
      var x = r * Math.cos(th), y = r * Math.sin(th);
      px[i] = x; py[i] = y; pz[i] = z;
      pLand[i] = isLand(Math.atan2(y, x) / DEG, Math.asin(z) / DEG) ? 1 : 0;
    }
  }

  /* 6 brightness steps for land and 6 for ocean, so each step is one fill() */
  var STEPS = 6;
  var bucketX = [], bucketY = [], bucketR = [], bucketN = new Int32Array(STEPS * 2);
  for (var bi = 0; bi < STEPS * 2; bi++) {
    bucketX.push(new Float32Array(DOT_COUNT));
    bucketY.push(new Float32Array(DOT_COUNT));
    bucketR.push(new Float32Array(DOT_COUNT));
  }

  /* ---------- sizing ---------- */
  var size = 0, dpr = 1;
  function resize() {
    var rect = host.getBoundingClientRect();
    var s = Math.max(120, Math.round(Math.min(rect.width, rect.height || rect.width)));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (s === size && canvas.width === Math.round(s * dpr)) { return; }
    size = s;
    canvas.width = Math.round(s * dpr);
    canvas.height = Math.round(s * dpr);
    canvas.style.width = s + 'px';
    canvas.style.height = s + 'px';
    renderStatic();
  }

  /* ---------- drawing ---------- */
  var LIGHT = (function () { var l = [-0.3, 0.45, 0.85]; var m = Math.hypot(l[0], l[1], l[2]); return [l[0] / m, l[1] / m, l[2] / m]; })();

  function slerp(a, b, t, om) {
    if (om < 1e-5) { return a.slice(); }
    var s = Math.sin(om);
    var k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }
  function norm(v) { var m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m]; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function stepCamera(time, dt) {
    var t = route.om > 1.8 ? 0.5 : 0.6;
    var target = norm(slerp(route.a, route.b, t, route.om));
    var sway = reduceMotion ? 0 : Math.sin(time * 0.35) * 0.05;
    var cs = Math.cos(sway), sn = Math.sin(sway);
    target = [target[0] * cs - target[1] * sn, target[0] * sn + target[1] * cs, target[2]];
    var k = reduceMotion ? 1 : 1 - Math.exp(-dt * 3.2);
    cam = norm([cam[0] + (target[0] - cam[0]) * k, cam[1] + (target[1] - cam[1]) * k, cam[2] + (target[2] - cam[2]) * k]);
  }

  function render(time, dt) {
    if (!size) { return; }
    curTime = time;
    stepCamera(time, dt);

    var S = size, CX = S / 2, CY = S * 0.46, R = S * 0.37;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);

    // camera basis: east, north, and the direction we look from
    var ex = -cam[1], ey = cam[0], ez = 0;
    var em = Math.hypot(ex, ey) || 1; ex /= em; ey /= em;
    var nx0 = cam[1] * ez - cam[2] * ey, ny0 = cam[2] * ex - cam[0] * ez, nz0 = cam[0] * ey - cam[1] * ex;
    var lE = LIGHT[0] * ex + LIGHT[1] * ey;
    var lN = LIGHT[0] * nx0 + LIGHT[1] * ny0 + LIGHT[2] * nz0;
    var lC = LIGHT[0] * cam[0] + LIGHT[1] * cam[1] + LIGHT[2] * cam[2];

    function project(v, lift) {
      var e = v[0] * ex + v[1] * ey;
      var n = v[0] * nx0 + v[1] * ny0 + v[2] * nz0;
      var c = v[0] * cam[0] + v[1] * cam[1] + v[2] * cam[2];
      var L = lift || 1;
      return { x: CX + R * L * e, y: CY - R * L * n, z: c };
    }

    var g;
    // atmosphere glow
    g = ctx.createRadialGradient(CX, CY, R * 0.95, CX, CY, R * 1.32);
    g.addColorStop(0, 'rgba(88,101,242,0.34)');
    g.addColorStop(0.3, 'rgba(88,101,242,0.10)');
    g.addColorStop(1, 'rgba(88,101,242,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(CX, CY, R * 1.32, 0, 7); ctx.fill();

    // sphere body
    g = ctx.createRadialGradient(CX - R * 0.35, CY - R * 0.4, R * 0.1, CX, CY, R);
    g.addColorStop(0, '#2b3475'); g.addColorStop(0.55, '#171c46'); g.addColorStop(1, '#0c0e22');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.clip();

    // faint grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(137,149,255,0.10)';
    var lat, lon, pts, p, on, i;
    for (lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath(); on = false;
      for (lon = -180; lon <= 180; lon += 6) {
        p = project(vec(lon, lat));
        if (p.z > 0) { if (!on) { ctx.moveTo(p.x, p.y); on = true; } else { ctx.lineTo(p.x, p.y); } } else { on = false; }
      }
      ctx.stroke();
    }
    for (lon = -180; lon < 180; lon += 30) {
      ctx.beginPath(); on = false;
      for (lat = -90; lat <= 90; lat += 6) {
        p = project(vec(lon, lat));
        if (p.z > 0) { if (!on) { ctx.moveTo(p.x, p.y); on = true; } else { ctx.lineTo(p.x, p.y); } } else { on = false; }
      }
      ctx.stroke();
    }

    // dots
    for (i = 0; i < STEPS * 2; i++) { bucketN[i] = 0; }
    var rLand = R * 0.0072, rSea = R * 0.0040;
    for (i = 0; i < DOT_COUNT; i++) {
      var x = px[i], y = py[i], z = pz[i];
      var c = x * cam[0] + y * cam[1] + z * cam[2];
      if (c <= 0.02) { continue; }
      var e = x * ex + y * ey;
      var n = x * nx0 + y * ny0 + z * nz0;
      var lam = e * lE + n * lN + c * lC;
      if (lam < 0) { lam = 0; }
      var edge = Math.pow(c, 0.55);
      var land = pLand[i];
      var a = land ? Math.min(1, 0.5 + 0.6 * lam) * edge : (0.16 + 0.16 * lam) * edge / 0.32;
      var step = Math.min(STEPS - 1, Math.floor(a * STEPS));
      var b = (land ? 0 : STEPS) + step;
      var k = bucketN[b]++;
      bucketX[b][k] = CX + R * e;
      bucketY[b][k] = CY - R * n;
      bucketR[b][k] = (land ? rLand : rSea) * (0.55 + 0.45 * c);
    }
    var bkt, cnt, j;
    for (bkt = 0; bkt < STEPS * 2; bkt++) {
      cnt = bucketN[bkt];
      if (!cnt) { continue; }
      var isLandBucket = bkt < STEPS;
      var level = (bkt % STEPS + 0.5) / STEPS;
      ctx.globalAlpha = isLandBucket ? level : level * 0.5;
      ctx.fillStyle = isLandBucket ? '#B9C2FF' : '#6C7BF2';
      ctx.beginPath();
      for (j = 0; j < cnt; j++) {
        var xx = bucketX[bkt][j], yy = bucketY[bkt][j], rr = bucketR[bkt][j];
        ctx.moveTo(xx + rr, yy);
        ctx.arc(xx, yy, rr, 0, 6.2832);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // shadow side and rim light
    g = ctx.createRadialGradient(CX - R * 0.5, CY - R * 0.55, R * 0.2, CX + R * 0.2, CY + R * 0.25, R * 1.25);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.65, 'rgba(6,7,18,0.10)'); g.addColorStop(1, 'rgba(6,7,18,0.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    g = ctx.createRadialGradient(CX, CY, R * 0.86, CX, CY, R);
    g.addColorStop(0, 'rgba(137,149,255,0)'); g.addColorStop(1, 'rgba(137,149,255,0.36)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.fill();
    ctx.restore();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(168,177,255,0.5)';
    ctx.beginPath(); ctx.arc(CX, CY, R - 0.75, 0, 7); ctx.stroke();

    // other cities
    var dest = state.dest, origin = state.origin;
    CITIES.forEach(function (city) {
      if (city === dest || city === origin) { return; }
      var q = project(city.v);
      if (q.z < 0.08) { return; }
      var gg = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, R * 0.045);
      gg.addColorStop(0, 'rgba(190,198,255,0.55)'); gg.addColorStop(1, 'rgba(88,101,242,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(q.x, q.y, R * 0.045, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(q.x, q.y, R * 0.0085, 0, 7); ctx.fill();
    });

    // flight route
    var om = route.om;
    function routePoint(t) {
      var v = norm(slerp(route.a, route.b, t, om));
      var lift = 1 + 0.16 * Math.sin(Math.PI * t) * Math.min(1, om * 2.2);
      var q = project(v, lift);
      return q;
    }
    var u = (((time - routeStart) % CYCLE) + CYCLE) % CYCLE / CYCLE;
    if (reduceMotion) { u = 0.5; }
    var flightEnd = 0.78;
    var prog = u < flightEnd ? ease(u / flightEnd) : 1;
    var fade = u > 0.92 ? 1 - (u - 0.92) / 0.08 : 1;
    var T = 120, s0, s1, f;

    ctx.lineCap = 'round';
    ctx.globalAlpha = fade;
    ctx.setLineDash([2, R * 0.05]);
    ctx.lineWidth = R * 0.008;
    ctx.strokeStyle = 'rgba(190,198,255,0.55)';
    ctx.beginPath(); on = false;
    for (i = 0; i <= T; i++) {
      s0 = routePoint(i / T);
      if (s0.z > 0.02) { if (!on) { ctx.moveTo(s0.x, s0.y); on = true; } else { ctx.lineTo(s0.x, s0.y); } } else { on = false; }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    var segs = Math.max(2, Math.floor(T * prog));
    for (i = 0; i < segs; i++) {
      s0 = routePoint(i / T); s1 = routePoint((i + 1) / T);
      if (s0.z < 0.02 || s1.z < 0.02) { continue; }
      f = i / segs;
      ctx.strokeStyle = 'rgba(190,198,255,' + (0.12 + 0.85 * f).toFixed(3) + ')';
      ctx.lineWidth = R * (0.006 + 0.010 * f);
      ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // origin marker
    var oq = project(origin.v);
    if (oq.z > 0.05) {
      var og = ctx.createRadialGradient(oq.x, oq.y, 0, oq.x, oq.y, R * 0.07);
      og.addColorStop(0, 'rgba(190,198,255,0.6)'); og.addColorStop(1, 'rgba(88,101,242,0)');
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(oq.x, oq.y, R * 0.07, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(oq.x, oq.y, R * 0.013, 0, 7); ctx.fill();
    }

    // destination marker, pulse ring, label
    var dq = project(dest.v);
    if (dq.z > 0.05) {
      var dg = ctx.createRadialGradient(dq.x, dq.y, 0, dq.x, dq.y, R * 0.16);
      dg.addColorStop(0, 'rgba(200,207,255,0.95)'); dg.addColorStop(0.25, 'rgba(137,149,255,0.5)'); dg.addColorStop(1, 'rgba(88,101,242,0)');
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(dq.x, dq.y, R * 0.16, 0, 7); ctx.fill();
      var ph = reduceMotion ? 0.4 : (time % 1.8) / 1.8;
      ctx.strokeStyle = 'rgba(200,207,255,' + (0.7 * (1 - ph)).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(dq.x, dq.y, R * (0.03 + 0.1 * ph), 0, 7); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(dq.x, dq.y, R * 0.022, 0, 7); ctx.fill();

      // label
      var fs = Math.max(11, Math.round(S * 0.023));
      ctx.font = '700 ' + fs + 'px Inter, system-ui, sans-serif';
      var label = dest.name.toUpperCase();
      var tw = ctx.measureText(label).width + fs * 1.5;
      var th2 = fs * 2.0;
      var lx = Math.min(Math.max(dq.x + R * 0.07, 6), S - tw - 6);
      var ly = Math.min(Math.max(dq.y - R * 0.2, 6), S - th2 - 6);
      ctx.strokeStyle = 'rgba(242,243,245,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(dq.x + R * 0.012, dq.y - R * 0.012); ctx.lineTo(lx + 8, ly + th2); ctx.stroke();
      ctx.fillStyle = '#F2F3F5';
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(lx, ly, tw, th2, th2 / 2); } else { ctx.rect(lx, ly, tw, th2); }
      ctx.fill();
      ctx.fillStyle = '#1E1F22';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lx + fs * 0.75, ly + th2 / 2 + 0.5);
    }

    // plane
    if (u < flightEnd + 0.06) {
      var pa = prog;
      var planeAlpha = u < flightEnd ? 1 : 1 - (u - flightEnd) / 0.06;
      var pc = routePoint(pa);
      var q0 = routePoint(Math.max(0, pa - 0.015)), q1 = routePoint(Math.min(1, pa + 0.015));
      if (pc.z > 0.02 && planeAlpha > 0) {
        var ang = Math.atan2(q1.y - q0.y, q1.x - q0.x);
        var k2 = S * 0.00096;
        ctx.save();
        ctx.globalAlpha = planeAlpha;
        ctx.translate(pc.x, pc.y);
        ctx.rotate(ang);
        ctx.shadowColor = 'rgba(88,101,242,0.95)'; ctx.shadowBlur = S * 0.02;
        ctx.fillStyle = '#F2F3F5';
        ctx.beginPath();
        ctx.moveTo(30 * k2, 0); ctx.quadraticCurveTo(26 * k2, -3.2 * k2, 16 * k2, -3.4 * k2);
        ctx.lineTo(-2 * k2, -3.6 * k2); ctx.lineTo(-12 * k2, -26 * k2); ctx.lineTo(-18 * k2, -26 * k2); ctx.lineTo(-14 * k2, -3.8 * k2);
        ctx.lineTo(-24 * k2, -3.2 * k2); ctx.lineTo(-30 * k2, -11 * k2); ctx.lineTo(-34 * k2, -11 * k2); ctx.lineTo(-31 * k2, -2.4 * k2);
        ctx.lineTo(-33 * k2, 0); ctx.lineTo(-31 * k2, 2.4 * k2); ctx.lineTo(-34 * k2, 11 * k2); ctx.lineTo(-30 * k2, 11 * k2); ctx.lineTo(-24 * k2, 3.2 * k2);
        ctx.lineTo(-14 * k2, 3.8 * k2); ctx.lineTo(-18 * k2, 26 * k2); ctx.lineTo(-12 * k2, 26 * k2); ctx.lineTo(-2 * k2, 3.6 * k2);
        ctx.lineTo(16 * k2, 3.4 * k2); ctx.quadraticCurveTo(26 * k2, 3.2 * k2, 30 * k2, 0);
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(88,101,242,0.55)';
        ctx.beginPath(); ctx.ellipse(18 * k2, 0, 5 * k2, 1.6 * k2, 0, 0, 7); ctx.fill();
        ctx.restore();
      }
    }
  }

  /* ---------- run loop ---------- */
  var t0 = performance.now(), last = 0, raf = 0, running = false, inView = true;

  function frame(now) {
    if (!running) { return; }
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    render((now - t0) / 1000, dt);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduceMotion || document.hidden || !inView) { return; }
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function renderStatic() {
    if (!running) { render(reduceMotion ? CYCLE * 0.5 : curTime, 10); }
  }

  document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); } else { start(); } });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) { start(); } else { stop(); }
    }).observe(host);
  }
  if ('ResizeObserver' in window) { new ResizeObserver(resize).observe(host); }
  window.addEventListener('resize', resize);

  buildSphere();
  resize();
  start();
  renderStatic();


  /* ---------- home search form: carry the trip over to booking.html ---------- */
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var dateBox = form.querySelector('input[type="date"]');
      var paxBox = form.querySelector('input[type="number"]');
      var trip = {
        from: fromInput ? fromInput.value.trim() : '',
        to: toInput ? toInput.value.trim() : '',
        date: dateBox ? dateBox.value : '',
        passengers: paxBox ? paxBox.value : '1'
      };
      try { window.localStorage.setItem('aviliation_prefill', JSON.stringify(trip)); } catch (err) { /* ignore */ }
      window.location.href = 'booking.html';
    });
  }
}

/* Works whether the <script> tag is in <head> or before </body> */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', aviLationGlobe);
} else {
  aviLationGlobe();
}

