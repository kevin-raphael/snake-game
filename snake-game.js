/**
 * snake-game.js — Reusable Snake Game Module
 *
 * Usage:
 *   <script src="snake-game.js"></script>
 *   <script>
 *     SnakeGame.init({
 *       accessCode:        "Bestofus@!",   // gate password
 *       firebase:          { ... },         // optional — Firebase config for live leaderboard
 *       speed:             120,             // ms per tick  (lower = faster)
 *       canvasSize:        400,             // px
 *       bonusPoints:       5,
 *       bonusDuration:     5000,
 *       bonusInterval:     8000,
 *       obstacleDuration:  4000,
 *       obstacleInterval:  6000,
 *     });
 *   </script>
 */
(function (global) {
  'use strict';

  // ── CSS ──────────────────────────────────────────────────────────
  const CSS = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:radial-gradient(ellipse at center,#0d1b2a 0%,#050d14 100%);min-height:100vh;font-family:'Segoe UI',Arial,sans-serif;color:#fff;overflow:hidden;transition:background .4s,filter .4s}
    body.sg-night{background:#000;filter:brightness(.5) saturate(.6)}
    #sg-gate{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:16px}
    #sg-gate h2{font-size:13px;letter-spacing:3px;color:#888;text-transform:uppercase}
    .sg-card{background:rgba(255,255,255,.04);border:1px solid #4ecca333;border-radius:12px;padding:32px 40px;display:flex;flex-direction:column;align-items:center;gap:14px;width:320px}
    .sg-card input{width:100%;padding:10px 14px;background:rgba(255,255,255,.06);border:1px solid #4ecca344;border-radius:8px;color:#fff;font-size:15px;letter-spacing:2px;text-align:center;outline:none;transition:border-color .2s}
    .sg-card input:focus{border-color:#4ecca3}
    .sg-card input.sg-error{border-color:#e74c3c;animation:sg-shake .3s}
    @keyframes sg-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
    .sg-card input::placeholder{color:#555;letter-spacing:1px}
    .sg-btn{width:100%;padding:10px;background:rgba(78,204,163,.15);border:1px solid #4ecca355;border-radius:8px;color:#4ecca3;font-size:14px;letter-spacing:2px;cursor:pointer;font-family:inherit;transition:background .2s,box-shadow .2s}
    .sg-btn:hover{background:rgba(78,204,163,.28);box-shadow:0 0 12px #4ecca355}
    #sg-gate-err{font-size:12px;color:#e74c3c;min-height:16px}
    #sg-step2{display:none;flex-direction:column;align-items:center;gap:14px;width:100%}
    .sg-share{width:320px;background:rgba(245,166,35,.07);border:1px solid #f5a62333;border-radius:10px;padding:12px 16px;font-size:12px;color:#888;text-align:center;word-break:break-all}
    .sg-share span{color:#f5a623;font-weight:bold}
    .sg-copy{margin-top:6px;padding:5px 14px;background:rgba(245,166,35,.12);border:1px solid #f5a62344;border-radius:6px;color:#f5a623;font-size:12px;cursor:pointer;font-family:inherit}
    .sg-copy:hover{background:rgba(245,166,35,.25)}
    #sg-app{display:none;height:100vh;align-items:center;justify-content:center;gap:20px;padding:10px}
    #sg-left{display:flex;flex-direction:column;align-items:center;gap:7px}
    #sg-scorebar{display:flex;gap:40px;background:rgba(255,255,255,.04);border:1px solid #4ecca333;border-radius:8px;padding:6px 28px;letter-spacing:1px}
    .sg-sb-block{text-align:center}
    .sg-sb-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px}
    .sg-sb-val{font-size:20px;font-weight:bold;color:#4ecca3;text-shadow:0 0 8px #4ecca388}
    #sg-best-val{color:#f5a623;text-shadow:0 0 8px #f5a62366}
    #sg-canvas-wrap{position:relative}
    #sg-canvas{border:2px solid #4ecca344;border-radius:8px;box-shadow:0 0 40px #4ecca322;display:block}
    #sg-pause-overlay{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:32px;font-weight:bold;letter-spacing:6px;color:#4ecca3;text-shadow:0 0 20px #4ecca3;pointer-events:none}
    #sg-controls{display:flex;gap:8px}
    .sg-ctrl{display:flex;align-items:center;gap:5px;padding:6px 13px;border-radius:7px;border:1px solid #4ecca355;background:rgba(78,204,163,.08);color:#4ecca3;font-size:12px;font-family:inherit;cursor:pointer;letter-spacing:1px;transition:background .2s,box-shadow .2s}
    .sg-ctrl:hover{background:rgba(78,204,163,.2);box-shadow:0 0 10px #4ecca355}
    .sg-ctrl.sg-night-btn{border-color:#f5a62355;background:rgba(245,166,35,.08);color:#f5a623}
    .sg-ctrl.sg-night-btn:hover{background:rgba(245,166,35,.2);box-shadow:0 0 10px #f5a62355}
    #sg-msg{font-size:14px;color:#f5a623;letter-spacing:1px;text-shadow:0 0 8px #f5a62388;min-height:18px}
    #sg-legend{font-size:11px;color:#888;display:flex;gap:14px}
    #sg-legend span{display:flex;align-items:center;gap:4px}
    .sg-dot{width:9px;height:9px;border-radius:50%;display:inline-block}
    #sg-right{width:220px;height:500px;background:rgba(255,255,255,.03);border:1px solid #4ecca322;border-radius:12px;display:flex;flex-direction:column;overflow:hidden}
    #sg-lb-header{padding:12px 14px 8px;border-bottom:1px solid #4ecca322}
    #sg-lb-header h3{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4ecca3}
    #sg-player-tag{font-size:11px;color:#666;margin-top:3px}
    #sg-player-tag span{color:#f5a623}
    #sg-lb-list{flex:1;overflow-y:auto;padding:8px 0}
    #sg-lb-list::-webkit-scrollbar{width:4px}
    #sg-lb-list::-webkit-scrollbar-thumb{background:#4ecca322;border-radius:2px}
    .sg-lb-row{display:flex;align-items:center;padding:7px 14px;gap:10px;transition:background .2s}
    .sg-lb-row:hover{background:rgba(255,255,255,.03)}
    .sg-lb-row.sg-me{background:rgba(78,204,163,.08)}
    .sg-lb-rank{width:20px;text-align:center;font-size:11px;color:#555;flex-shrink:0}
    .sg-lb-rank.gold{color:#ffd700;font-weight:bold}
    .sg-lb-rank.silver{color:#c0c0c0;font-weight:bold}
    .sg-lb-rank.bronze{color:#cd7f32;font-weight:bold}
    .sg-lb-name{flex:1;font-size:13px;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .sg-lb-row.sg-me .sg-lb-name{color:#4ecca3;font-weight:bold}
    .sg-lb-score{font-size:14px;font-weight:bold;color:#fff;flex-shrink:0}
    #sg-lb-empty{text-align:center;color:#444;font-size:12px;padding:30px 14px;line-height:1.8}
    #sg-lb-footer{padding:10px 14px;border-top:1px solid #4ecca322;font-size:10px;color:#555;text-align:center;letter-spacing:1px}
    #sg-lb-status{color:#4ecca355}
  `;

  // ── HTML TEMPLATE ────────────────────────────────────────────────
  const HTML = `
    <div id="sg-gate">
      <canvas id="sg-gate-title" width="420" height="64"></canvas>
      <h2>Private Access Required</h2>
      <div class="sg-card">
        <div id="sg-step1" style="display:flex;flex-direction:column;align-items:center;gap:14px;width:100%">
          <input id="sg-code-input" type="password" placeholder="ENTER ACCESS CODE" maxlength="32" autocomplete="off">
          <div id="sg-gate-err"></div>
          <button class="sg-btn" id="sg-verify-btn">VERIFY →</button>
        </div>
        <div id="sg-step2">
          <input id="sg-name-input" type="text" placeholder="YOUR NAME" maxlength="16" autocomplete="off">
          <button class="sg-btn" id="sg-enter-btn">ENTER GAME →</button>
        </div>
      </div>
      <div class="sg-share" id="sg-share-box" style="display:none">
        Share this link with friends:<br>
        <span id="sg-share-url"></span><br>
        <button class="sg-copy" id="sg-copy-btn">Copy Link</button>
      </div>
    </div>

    <div id="sg-app">
      <div id="sg-left">
        <canvas id="sg-title" width="420" height="64"></canvas>
        <div id="sg-scorebar">
          <div class="sg-sb-block"><div class="sg-sb-label">Score</div><div class="sg-sb-val" id="sg-score-val">0</div></div>
          <div class="sg-sb-block"><div class="sg-sb-label">Best</div><div class="sg-sb-val" id="sg-best-val">0</div></div>
        </div>
        <div id="sg-canvas-wrap">
          <canvas id="sg-canvas"></canvas>
          <div id="sg-pause-overlay">⏸ PAUSED</div>
        </div>
        <div id="sg-controls">
          <button class="sg-ctrl" id="sg-btn-restart">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>Restart
          </button>
          <button class="sg-ctrl" id="sg-btn-pause">
            <svg id="sg-icon-pause" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <svg id="sg-icon-play" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="display:none"><polygon points="5,3 19,12 5,21"/></svg>
            <span id="sg-pause-label">Pause</span>
          </button>
          <button class="sg-ctrl" id="sg-btn-fs">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>Fullscreen
          </button>
          <button class="sg-ctrl sg-night-btn" id="sg-btn-night">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>Lights Out
          </button>
        </div>
        <div id="sg-msg">Press any arrow key to start</div>
        <div id="sg-legend">
          <span><span class="sg-dot" style="background:#e056fd"></span> Bonus +5</span>
          <span><span class="sg-dot" style="background:#e74c3c;border-radius:2px"></span> Obstacle</span>
        </div>
      </div>
      <div id="sg-right">
        <div id="sg-lb-header">
          <h3>🏆 Leaderboard</h3>
          <div id="sg-player-tag">Playing as <span id="sg-player-tag-name">—</span></div>
        </div>
        <div id="sg-lb-list"><div id="sg-lb-empty">Play a game to<br>appear here!<br><br><span style="color:#333;font-size:10px">Scores update live</span></div></div>
        <div id="sg-lb-footer"><span id="sg-lb-status">● LOCAL MODE</span></div>
      </div>
    </div>
  `;

  // ── DOT-MATRIX FONT ──────────────────────────────────────────────
  const FONT = {
    S:[[0,1,1,1,0],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0]],
    N:[[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
    A:[[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    K:[[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0]],
    E:[[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
    G:[[0,1,1,1,0],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[0,1,1,1,0]],
    M:[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  };

  function drawDotTitle(canvasEl) {
    const c=canvasEl.getContext('2d'),DOT=9,GAP=3,LGAP=10,STEP=DOT+GAP;
    function rowW(l){return l.length*5*STEP+(l.length-1)*LGAP-GAP;}
    function drawLine(letters,sy,col){
      let sx=(canvasEl.width-rowW(letters))/2;
      letters.forEach(ch=>{
        (FONT[ch]||[]).forEach((row,ry)=>row.forEach((on,cx)=>{
          if(!on)return;
          const px=sx+cx*STEP,py=sy+ry*STEP;
          c.shadowColor=col.glow;c.shadowBlur=10;
          const g=c.createRadialGradient(px+DOT/2,py+DOT/2,1,px+DOT/2,py+DOT/2,DOT/2);
          g.addColorStop(0,col.hi);g.addColorStop(1,col.lo);
          c.fillStyle=g;c.beginPath();c.roundRect(px,py,DOT,DOT,3);c.fill();
        }));
        sx+=5*STEP+LGAP;
      });
      c.shadowBlur=0;
    }
    drawLine(['S','N','A','K','E'],2, {hi:'#7fffd4',lo:'#00b894',glow:'#4ecca3'});
    drawLine(['G','A','M','E'],   36,{hi:'#ffe082',lo:'#f5a623',glow:'#f5a62388'});
  }

  // ── MAIN INIT ────────────────────────────────────────────────────
  function init(userConfig) {
    const cfg = Object.assign({
      accessCode:       'SNAKE2024',
      firebase:         null,
      speed:            120,
      canvasSize:       400,
      bonusPoints:      5,
      bonusDuration:    5000,
      bonusInterval:    8000,
      obstacleDuration: 4000,
      obstacleInterval: 6000,
    }, userConfig);

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Inject HTML
    document.body.innerHTML = HTML;

    // Canvas size
    const gameCanvas = document.getElementById('sg-canvas');
    gameCanvas.width = gameCanvas.height = cfg.canvasSize;

    // Draw titles
    drawDotTitle(document.getElementById('sg-gate-title'));

    // ── Firebase ────────────────────────────────────────────────
    let db = null;
    if (cfg.firebase && cfg.firebase.apiKey && typeof firebase !== 'undefined') {
      try {
        const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg.firebase);
        db = firebase.database(app);
      } catch(e) { console.warn('SnakeGame: Firebase init failed', e); }
    }

    // ── Player identity ─────────────────────────────────────────
    let playerId = localStorage.getItem('sg_pid');
    if (!playerId) { playerId = Math.random().toString(36).slice(2,10); localStorage.setItem('sg_pid', playerId); }
    let playerName = '';
    let roomRef = null;

    // ── Auto-fill code from URL ──────────────────────────────────
    const urlCode = new URLSearchParams(location.search).get('code');
    if (urlCode) document.getElementById('sg-code-input').value = urlCode;

    // ── Gate logic ───────────────────────────────────────────────
    function checkCode() {
      const val = document.getElementById('sg-code-input').value.trim();
      if (val === cfg.accessCode) {
        document.getElementById('sg-step1').style.display = 'none';
        document.getElementById('sg-step2').style.display = 'flex';
        document.getElementById('sg-name-input').focus();
        const shareUrl = location.href.split('?')[0] + '?code=' + encodeURIComponent(cfg.accessCode);
        document.getElementById('sg-share-url').textContent = shareUrl;
        document.getElementById('sg-share-box').style.display = 'block';
      } else {
        const inp = document.getElementById('sg-code-input');
        inp.classList.add('sg-error');
        document.getElementById('sg-gate-err').textContent = 'Invalid code. Try again.';
        setTimeout(() => inp.classList.remove('sg-error'), 400);
        inp.value = ''; inp.focus();
      }
    }

    function enterGame() {
      const name = document.getElementById('sg-name-input').value.trim();
      if (!name) { document.getElementById('sg-name-input').focus(); return; }
      playerName = name.slice(0, 16);
      localStorage.setItem('sg_name', playerName);
      document.getElementById('sg-gate').style.display = 'none';
      document.getElementById('sg-app').style.display  = 'flex';
      document.getElementById('sg-player-tag-name').textContent = playerName;
      drawDotTitle(document.getElementById('sg-title'));
      initLeaderboard();
      gameInit();
    }

    document.getElementById('sg-verify-btn').addEventListener('click', checkCode);
    document.getElementById('sg-enter-btn').addEventListener('click', enterGame);
    document.getElementById('sg-code-input').addEventListener('keydown', e => { if(e.key==='Enter') checkCode(); });
    document.getElementById('sg-name-input').addEventListener('keydown', e => { if(e.key==='Enter') enterGame(); });
    document.getElementById('sg-copy-btn').addEventListener('click', () => {
      const url = location.href.split('?')[0] + '?code=' + encodeURIComponent(cfg.accessCode);
      navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('sg-copy-btn');
        btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy Link', 2000);
      });
    });

    // Auto-submit if code in URL
    if (urlCode) setTimeout(checkCode, 100);

    // ── Leaderboard ──────────────────────────────────────────────
    let localScores = JSON.parse(localStorage.getItem('sg_scores') || '{}');

    function initLeaderboard() {
      if (db) {
        const room = cfg.accessCode.toLowerCase().replace(/\W/g, '');
        roomRef = db.ref('snake_rooms/' + room + '/scores');
        roomRef.on('value', snap => renderLeaderboard(snap.val() || {}));
        document.getElementById('sg-lb-status').textContent = '● LIVE';
        document.getElementById('sg-lb-status').style.color = '#4ecca3';
      } else {
        renderLeaderboard(localScores);
        document.getElementById('sg-lb-status').textContent = '● LOCAL — Add Firebase for live';
        document.getElementById('sg-lb-status').style.color = '#f5a62388';
      }
    }

    function renderLeaderboard(data) {
      const list = document.getElementById('sg-lb-list');
      const entries = Object.values(data).sort((a,b) => b.score - a.score);
      if (!entries.length) {
        list.innerHTML = '<div id="sg-lb-empty">Play a game to<br>appear here!<br><br><span style="color:#333;font-size:10px">Scores update live</span></div>';
        return;
      }
      const medals = ['🥇','🥈','🥉'], cls = ['gold','silver','bronze'];
      list.innerHTML = entries.slice(0,20).map((e,i) => `
        <div class="sg-lb-row${e.id===playerId?' sg-me':''}">
          <div class="sg-lb-rank ${i<3?cls[i]:''}">${i<3?medals[i]:i+1}</div>
          <div class="sg-lb-name">${esc(e.name)}</div>
          <div class="sg-lb-score">${e.score}</div>
        </div>`).join('');
    }

    function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

    function submitScore(s) {
      const entry = { id:playerId, name:playerName, score:s, ts:Date.now() };
      if (!localScores[playerId] || localScores[playerId].score < s) {
        localScores[playerId] = entry;
        localStorage.setItem('sg_scores', JSON.stringify(localScores));
        if (!db) renderLeaderboard(localScores);
      }
      if (db && roomRef) {
        roomRef.child(playerId).transaction(cur => (!cur || cur.score < s) ? entry : undefined);
      }
    }

    // ── Game engine ──────────────────────────────────────────────
    const canvas  = gameCanvas;
    const ctx     = canvas.getContext('2d');
    const CELL    = 20;
    const COLS    = canvas.width / CELL;
    const ROWS    = canvas.height / CELL;

    // Strawberry sprite
    const sb = document.createElement('canvas');
    sb.width = sb.height = CELL;
    (function(c){
      const cx=CELL/2,cy=CELL/2+1,r=CELL/2-2;
      const g=c.createRadialGradient(cx-r*.2,cy-r*.2,r*.1,cx,cy,r);
      g.addColorStop(0,'#ff6b6b');g.addColorStop(.6,'#e01010');g.addColorStop(1,'#8b0000');
      c.beginPath();c.moveTo(cx,cy+r);
      c.bezierCurveTo(cx-r*1.1,cy,cx-r*1.1,cy-r*.5,cx,cy-r*.15);
      c.bezierCurveTo(cx+r*1.1,cy-r*.5,cx+r*1.1,cy,cx,cy+r);
      c.fillStyle=g;c.fill();
      c.fillStyle='rgba(255,220,100,.85)';
      [{dx:-.25,dy:.1},{dx:.25,dy:.1},{dx:0,dy:.4},{dx:-.2,dy:-.15},{dx:.2,dy:-.15}]
        .forEach(s=>{c.beginPath();c.ellipse(cx+s.dx*r,cy+s.dy*r,1.2,1.6,0,0,Math.PI*2);c.fill();});
      c.fillStyle='#27ae60';
      [[cx-3,4,4,2,-.6],[cx+3,4,4,2,.6],[cx,2,2,4,0]]
        .forEach(([ex,ey,rx,ry,rot])=>{c.beginPath();c.ellipse(ex,ey,rx,ry,rot,0,Math.PI*2);c.fill();});
      c.strokeStyle='#145a32';c.lineWidth=1.5;c.beginPath();c.moveTo(cx,0);c.lineTo(cx,-2);c.stroke();
    })(sb.getContext('2d'));

    let snake,dir,nextDir,food,score,loop,running,paused=false;
    let bonus,bonusTimer,bonusSpawnTimer;
    let obstacles,obstacleTimers,obstacleSpawnTimer;
    let bestScore=parseInt(localStorage.getItem('sg_best')||'0');
    let floatMsg='',floatAlpha=0,floatY=0,floatTick=null;
    let nightMode=false;

    const scoreEl = document.getElementById('sg-score-val');
    const bestEl  = document.getElementById('sg-best-val');
    const msgEl   = document.getElementById('sg-msg');
    const pauseOv = document.getElementById('sg-pause-overlay');

    bestEl.textContent = bestScore;

    function rand(){return{x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};}
    function free(cell,ex=[]){return![...snake,food,...obstacles,...ex].some(b=>b&&b.x===cell.x&&b.y===cell.y);}

    function gameInit(){
      snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];
      dir={x:1,y:0};nextDir={x:1,y:0};
      score=0;running=false;paused=false;bonus=null;obstacles=[];obstacleTimers=[];
      clearTimeout(bonusTimer);clearInterval(bonusSpawnTimer);clearInterval(obstacleSpawnTimer);
      obstacleTimers.forEach(clearTimeout);
      scoreEl.textContent='0';bestEl.textContent=bestScore;
      msgEl.textContent='Press any arrow key to start';
      setPauseUI(false);placeFood();draw();
    }

    function placeFood(){let c;do{c=rand();}while(!free(c));food=c;}

    function spawnBonus(){
      if(!running||paused)return;
      let c;do{c=rand();}while(!free(c,bonus?[bonus]:[]));
      bonus=c;clearTimeout(bonusTimer);
      bonusTimer=setTimeout(()=>{bonus=null;},cfg.bonusDuration);
    }
    function spawnObstacle(){
      if(!running||paused)return;
      let c;do{c=rand();}while(!free(c,bonus?[bonus]:[]));
      obstacles.push(c);
      const t=setTimeout(()=>{const i=obstacles.indexOf(c);if(i!==-1)obstacles.splice(i,1);},cfg.obstacleDuration);
      obstacleTimers.push(t);
    }

    function startGame(){
      if(loop)clearInterval(loop);
      running=true;paused=false;msgEl.textContent='';
      loop=setInterval(tick,cfg.speed);
      bonusSpawnTimer=setInterval(spawnBonus,cfg.bonusInterval);
      obstacleSpawnTimer=setInterval(spawnObstacle,cfg.obstacleInterval);
    }

    function togglePause(){
      if(!running)return;
      paused=!paused;
      if(paused){
        clearInterval(loop);clearInterval(bonusSpawnTimer);clearInterval(obstacleSpawnTimer);
        pauseOv.style.display='block';msgEl.textContent='Paused — press P to resume';
      } else {
        loop=setInterval(tick,cfg.speed);
        bonusSpawnTimer=setInterval(spawnBonus,cfg.bonusInterval);
        obstacleSpawnTimer=setInterval(spawnObstacle,cfg.obstacleInterval);
        pauseOv.style.display='none';msgEl.textContent='';
      }
      setPauseUI(paused);
    }

    function setPauseUI(p){
      document.getElementById('sg-icon-pause').style.display=p?'none':'block';
      document.getElementById('sg-icon-play').style.display=p?'block':'none';
      document.getElementById('sg-pause-label').textContent=p?'Resume':'Pause';
    }

    function updateBest(){
      if(score>bestScore){bestScore=score;localStorage.setItem('sg_best',bestScore);bestEl.textContent=bestScore;}
    }

    function tick(){
      dir=nextDir;
      const head={x:(snake[0].x+dir.x+COLS)%COLS,y:(snake[0].y+dir.y+ROWS)%ROWS};
      if(snake.some(s=>s.x===head.x&&s.y===head.y))return gameOver();
      if(obstacles.some(o=>o.x===head.x&&o.y===head.y))return gameOver();
      snake.unshift(head);
      if(head.x===food.x&&head.y===food.y){
        score++;scoreEl.textContent=score;updateBest();placeFood();
      } else if(bonus&&head.x===bonus.x&&head.y===bonus.y){
        score+=cfg.bonusPoints;scoreEl.textContent=score;updateBest();
        bonus=null;clearTimeout(bonusTimer);showFloat('+'+cfg.bonusPoints+' BONUS!');
      } else {snake.pop();}
      draw();
    }

    function showFloat(text){
      floatMsg=text;floatAlpha=1;floatY=canvas.height/2;
      clearInterval(floatTick);
      floatTick=setInterval(()=>{floatAlpha-=.04;floatY-=1;if(floatAlpha<=0){floatAlpha=0;clearInterval(floatTick);}},40);
    }

    function draw(){
      const bg=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
      bg.addColorStop(0,'#0d1b2a');bg.addColorStop(1,'#050d14');
      ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle='rgba(78,204,163,.06)';ctx.lineWidth=.5;
      for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,canvas.height);ctx.stroke();}
      for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(canvas.width,y*CELL);ctx.stroke();}
      obstacles.forEach(o=>{
        const x=o.x*CELL,y=o.y*CELL;
        ctx.shadowColor='#e74c3c';ctx.shadowBlur=8;
        ctx.fillStyle='#c0392b';ctx.beginPath();ctx.roundRect(x+1,y+1,CELL-2,CELL-2,3);ctx.fill();
        ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(x+5,y+5);ctx.lineTo(x+CELL-5,y+CELL-5);
        ctx.moveTo(x+CELL-5,y+5);ctx.lineTo(x+5,y+CELL-5);ctx.stroke();ctx.lineWidth=1;
      });
      ctx.drawImage(sb,food.x*CELL,food.y*CELL);
      if(bonus){
        const x=bonus.x*CELL,y=bonus.y*CELL;
        ctx.shadowColor='#e056fd';ctx.shadowBlur=14;
        ctx.fillStyle='#9b59b6';ctx.beginPath();ctx.arc(x+CELL/2,y+CELL/2,CELL/2-1,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='bold 13px Arial';
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',x+CELL/2,y+CELL/2+1);
      }
      snake.forEach((seg,i)=>{
        const isHead=i===0,x=seg.x*CELL+1,y=seg.y*CELL+1,s=CELL-2;
        if(isHead){
          const g=ctx.createRadialGradient(x+s/2,y+s/2,1,x+s/2,y+s/2,s/2);
          g.addColorStop(0,'#7fffd4');g.addColorStop(1,'#00b894');ctx.fillStyle=g;
          ctx.shadowColor='#4ecca3';ctx.shadowBlur=10;
        } else {ctx.fillStyle=`rgba(46,204,113,${Math.max(.4,1-i*.015)})`;ctx.shadowBlur=0;}
        ctx.beginPath();ctx.roundRect(x,y,s,s,isHead?5:3);ctx.fill();ctx.shadowBlur=0;
      });
      if(floatAlpha>0){
        ctx.save();ctx.globalAlpha=floatAlpha;ctx.fillStyle='#e056fd';
        ctx.font='bold 24px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.shadowColor='#e056fd';ctx.shadowBlur=12;ctx.fillText(floatMsg,canvas.width/2,floatY);ctx.restore();
      }
    }

    function gameOver(){
      clearInterval(loop);clearInterval(bonusSpawnTimer);clearInterval(obstacleSpawnTimer);
      obstacleTimers.forEach(clearTimeout);clearTimeout(bonusTimer);
      running=false;paused=false;pauseOv.style.display='none';setPauseUI(false);
      submitScore(score);
      if(score>bestScore){
        bestScore=score;localStorage.setItem('sg_best',bestScore);bestEl.textContent=bestScore;
        msgEl.textContent=`🏆 New Best: ${score}! — Press R to restart`;
      } else {
        msgEl.textContent=`Game Over! Score: ${score} — Press R to restart`;
      }
    }

    // Buttons
    document.getElementById('sg-btn-restart').addEventListener('click', gameInit);
    document.getElementById('sg-btn-pause').addEventListener('click', togglePause);
    document.getElementById('sg-btn-fs').addEventListener('click', ()=>{
      if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
      else document.exitFullscreen();
    });
    document.getElementById('sg-btn-night').addEventListener('click', ()=>{
      nightMode=!nightMode;
      document.body.classList.toggle('sg-night',nightMode);
      const btn=document.getElementById('sg-btn-night');
      btn.innerHTML=nightMode
        ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/></svg> Lights On`
        : `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Lights Out`;
    });

    // Keyboard
    document.addEventListener('keydown', e=>{
      if(document.getElementById('sg-gate').style.display!=='none')return;
      switch(e.key){
        case 'ArrowUp':    if(dir.y!== 1)nextDir={x:0,y:-1};break;
        case 'ArrowDown':  if(dir.y!==-1)nextDir={x:0,y: 1};break;
        case 'ArrowLeft':  if(dir.x!== 1)nextDir={x:-1,y:0};break;
        case 'ArrowRight': if(dir.x!==-1)nextDir={x: 1,y:0};break;
        case 'r':case 'R': gameInit();return;
        case 'p':case 'P': togglePause();return;
        case 'f':case 'F':
          if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
          else document.exitFullscreen();return;
        case 'n':case 'N': document.getElementById('sg-btn-night').click();return;
      }
      if(!running&&!paused) startGame();
    });
  }

  global.SnakeGame = { init };

}(window));
