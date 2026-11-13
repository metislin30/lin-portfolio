const stage = document.querySelector('#rally-stage');
const canvas = document.querySelector('#rally-map');
const ctx = canvas.getContext('2d');

if (ctx) startRally();

function startRally() {
  const stops = [
    { id: 'commerce', x: 237, y: 213, color: '#df6d54', art: 'commerce.jpg' },
    { id: 'english', x: 755, y: 198, color: '#55a396', art: 'english.jpg' },
    { id: 'retouch', x: 780, y: 562, color: '#e5ab51', art: 'retouch.jpg' },
    { id: 'writing', x: 208, y: 563, color: '#9b79ce' },
  ];
  for (const stop of stops) {
    stop.link = stage.querySelector(`[data-stop="${stop.id}"]`);
    if (stop.art) {
      stop.image = new Image();
      stop.image.src = 'assets/' + stop.art;
    }
  }
  const car = { x: 501, y: 426, angle: -Math.PI / 2, speed: 0 };
  const keys = new Set();
  const pointers = new Map();
  const keyNames = {
    arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
    arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
  };
  const trees = [[118,128,1],[160,168,.7],[376,125,.88],[862,128,1],[923,190,.8],[902,325,.76],
    [109,420,.72],[130,598,1],[365,624,.78],[597,619,.9],[891,617,1],[943,545,.7],[614,128,.74]];
  let width, height, ratio, scale, cx, cy, near;
  let previous = performance.now();

  stage.classList.add('ready');
  document.querySelector('.rally-help').hidden = false;
  document.querySelector('.rally-pad').hidden = false;
  const reset = document.querySelector('#reset-car');
  reset.hidden = false;
  reset.addEventListener('click', () => Object.assign(car, { x: 501, y: 426, angle: -Math.PI / 2, speed: 0 }));

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    scale = Math.min(width / 1190, height / 620);
    cx = width * .5;
    cy = height * .53;
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  function project(x, y, z = 0) {
    x -= 500;
    y -= 390;
    return [cx + (x * .91 - y * .45) * scale, cy + (x * .29 + y * .53 - z) * scale];
  }

  function polygon(points, color) {
    ctx.beginPath();
    points.forEach(([x, y, z], index) => {
      const [sx, sy] = project(x, y, z);
      if (index) ctx.lineTo(sx, sy);
      else ctx.moveTo(sx, sy);
    });
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function rect(x, y, w, h, color, z = 0) {
    polygon([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]], color);
  }

  function block(x, y, w, h, z, rise, top, side, front) {
    const t = z + rise;
    polygon([[x+w,y,z],[x+w,y+h,z],[x+w,y+h,t],[x+w,y,t]], side);
    polygon([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,t],[x,y+h,t]], front);
    rect(x, y, w, h, top, t);
  }

  function drawIsland() {
    const ocean = ctx.createLinearGradient(0, 0, width, height);
    ocean.addColorStop(0, '#e5d4f1');
    ocean.addColorStop(1, '#a897d0');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#fff6ed66';
    ctx.lineWidth = 1;
    for (let i = 0; i < 34; i++) {
      const x = (i * 131 + 36) % (width || 1);
      const y = (i * 67 + 20) % (height || 1);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 15 + (i % 4) * 6, y - 4);
      ctx.stroke();
    }
    const shore = [[52,148],[138,83],[841,83],[944,138],[973,560],[905,681],[167,696],[62,613],[29,389]];
    polygon(shore.map(([x,y]) => [x+12,y+31,-49]), '#6b539c48');
    for (let i = 0; i < shore.length; i++) {
      const [x,y] = shore[i], [a,b] = shore[(i+1)%shore.length];
      polygon([[x,y,-35],[a,b,-35],[a,b,0],[x,y,0]], i < 4 ? '#b76d6c' : '#ce8e78');
    }
    polygon(shore, '#edc69d');
    polygon([[68,165],[150,102],[838,103],[925,153],[949,554],[890,654],[180,670],[82,602],[53,391]], '#f6d8af');
    for (const [x,y,w,h] of [[178,166,650,91],[178,513,650,91],[163,166,92,438],[740,166,92,438],[220,340,540,88],[458,211,83,342]]) {
      rect(x-3,y-3,w+6,h+6,'#a9778f');
      rect(x,y,w,h,'#c38f9f',.4);
    }
    for (let i = 0; i < 11; i++) {
      rect(276 + i*40,208,17,3,'#fff0c8',1);
      rect(276 + i*40,554,17,3,'#fff0c8',1);
      rect(274 + i*40,383,16,3,'#fff0c8',1);
    }
    for (let i = 0; i < 6; i++) {
      rect(205,266+i*39,3,17,'#fff0c8',1);
      rect(783,265+i*39,3,17,'#fff0c8',1);
    }
    rect(457,396,87,71,'#f1c6ac',1);
    for (let i = 0; i < 5; i++) rect(465+i*15,446,7,11,'#fff4d9',2);
  }

  function tree(x,y,s) {
    rect(x-13*s,y-8*s,47*s,24*s,'#764d5740',1);
    block(x-4*s,y-4*s,8*s,8*s,0,23*s,'#9b6958','#81524e','#a56f55');
    const peak = [x-5*s,y-5*s,68*s];
    const base = [[x-20*s,y-14*s,16*s],[x+18*s,y-13*s,16*s],[x+19*s,y+16*s,16*s],[x-17*s,y+16*s,16*s]];
    polygon([base[0],base[1],peak], '#78a99d');
    polygon([base[1],base[2],peak], '#428477');
    polygon([base[2],base[3],peak], '#559789');
    polygon([base[3],base[0],peak], '#8db4a3');
  }

  function exhibit(stop) {
    const { x,y,color,image } = stop;
    rect(x-47,y-26,108,74,'#754b5940',1);
    block(x-44,y-31,88,61,0,7,'#fff1d7','#b47e74','#d29b83');
    block(x-36,y-25,72,47,7,20,color,'#875c73','#aa747c');
    block(x-30,y-15,60,30,27,7,'#f9efd9','#a67a86','#c49f99');
    const [sx,sy] = project(x,y,35);
    if (image?.complete && image.naturalWidth) {
      const w = 37*scale, h = 23*scale;
      const cover = Math.max(w/image.naturalWidth, h/image.naturalHeight);
      const sw = w/cover, sh = h/cover;
      ctx.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)/2,sw,sh,sx-w/2,sy-h/2,w,h);
    } else {
      for (let i = 0; i < 3; i++) rect(x-18,y-12+i*9,34-i*5,3,'#6f50a6',35);
    }
  }

  function drawCar() {
    const { x,y,angle } = car;
    const c = Math.cos(angle), s = Math.sin(angle);
    const face = (coords, color) => polygon(coords.map(([a,b,z]) => [x+a*c-b*s,y+a*s+b*c,z]), color);
    face([[-24,-14,1],[27,-14,1],[28,20,1],[-23,20,1]],'#61445858');
    for (const a of [-15,13]) {
      for (const b of [-12,8]) face([[a-5,b,2],[a+6,b,2],[a+6,b+6,2],[a-5,b+6,2]],'#392d4f');
    }
    face([[-22,12,5],[22,12,5],[22,12,18],[-22,12,18]],'#b84e4b');
    face([[22,-12,5],[22,12,5],[22,12,18],[22,-12,18]],'#d96854');
    face([[-22,-12,18],[22,-12,18],[22,12,18],[-22,12,18]],'#f58e66');
    face([[-12,-9,18],[10,-9,18],[5,-8,30],[-11,-8,30]],'#67486d');
    face([[10,-9,18],[10,9,18],[5,8,30],[5,-8,30]],'#6f7592');
    face([[-11,-8,30],[5,-8,30],[5,8,30],[-11,8,30]],'#fff2d0');
    for (const b of [-10,5]) face([[17,b,18.2],[22,b,18.2],[22,b+4,18.2],[17,b+4,18.2]],'#fff6c3');
  }

  function update(dt) {
    const active = direction => keys.has(direction) || [...pointers.values()].includes(direction);
    const throttle = Number(active('up')) - Number(active('down'));
    const turn = Number(active('right')) - Number(active('left'));
    const target = throttle * (throttle < 0 ? 105 : 250);
    car.speed += (target - car.speed) * Math.min(1,dt*5.7);
    car.angle += turn * dt * 2.65 * (car.speed < -7 ? -1 : 1);
    car.x = Math.max(120,Math.min(887,car.x+Math.cos(car.angle)*car.speed*dt));
    car.y = Math.max(153,Math.min(619,car.y+Math.sin(car.angle)*car.speed*dt));
    near = stops.find(stop => Math.hypot(stop.x-car.x,stop.y-car.y) < 87);
  }

  function frame(now) {
    update(Math.min((now-previous)/1000,.04));
    previous = now;
    ctx.setTransform(ratio,0,0,ratio,0,0);
    drawIsland();
    const objects = [
      ...trees.map(([x,y,s]) => ({ depth: .29*x+.53*y, draw: () => tree(x,y,s) })),
      ...stops.map(stop => ({ depth: .29*stop.x+.53*stop.y, draw: () => exhibit(stop) })),
      { depth: .29*car.x+.53*car.y, draw: drawCar },
    ];
    objects.sort((a,b) => a.depth-b.depth).forEach(object => object.draw());
    for (const stop of stops) {
      const [x,y] = project(stop.x,stop.y,48);
      const inset = stop.link.offsetWidth / 2 + 5;
      stop.link.style.left = Math.max(inset,Math.min(width-inset,x)) + 'px';
      stop.link.style.top = Math.max(40,y) + 'px';
      stop.link.classList.toggle('near', near === stop);
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('a, button, input, textarea, video, summary, [contenteditable]')) return;
    if (stage.getBoundingClientRect().bottom < 100) return;
    const direction = keyNames[event.key.toLowerCase()];
    if (direction) {
      event.preventDefault();
      keys.add(direction);
    } else if (event.key === 'Enter' && near) {
      event.preventDefault();
      near.link.click();
    }
  });
  window.addEventListener('keyup', event => keys.delete(keyNames[event.key.toLowerCase()]));
  window.addEventListener('blur', () => { keys.clear(); pointers.clear(); });
  for (const button of stage.querySelectorAll('[data-drive]')) {
    button.addEventListener('pointerdown', event => {
      button.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, button.dataset.drive);
    });
    for (const type of ['pointerup','pointercancel','lostpointercapture']) {
      button.addEventListener(type, event => pointers.delete(event.pointerId));
    }
    button.addEventListener('keydown', event => {
      if (event.key === ' ' || event.key === 'Enter') keys.add(button.dataset.drive);
    });
    button.addEventListener('keyup', event => {
      if (event.key === ' ' || event.key === 'Enter') keys.delete(button.dataset.drive);
    });
    button.addEventListener('blur', () => keys.delete(button.dataset.drive));
  }
  for (const stop of stops) {
    stop.link.addEventListener('click', () => {
      keys.clear();
      const target = document.getElementById(stop.id);
      const details = target.querySelector('details');
      if (details) details.open = true;
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    });
  }
  requestAnimationFrame(frame);
}
