import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STEP_COMMENTARY, FORMULA_COMMENTARY, INTRO_COMMENTARY } from './commentary.js';

const COLORS = {
  U: 0xffffff,
  D: 0xffd500,
  F: 0x009b48,
  B: 0x0046ad,
  R: 0xb71234,
  L: 0xff5800,
  plastic: 0x111111,
};

const FACE_AXES = {
  R: { axis: 'x', dir: 1 },
  L: { axis: 'x', dir: -1 },
  U: { axis: 'y', dir: 1 },
  D: { axis: 'y', dir: -1 },
  F: { axis: 'z', dir: 1 },
  B: { axis: 'z', dir: -1 },
};

const MOVE_LIST = [
  'R', "R'", 'R2', 'L', "L'", 'L2',
  'U', "U'", 'U2', 'D', "D'", 'D2',
  'F', "F'", 'F2', 'B', "B'", 'B2',
];

const STEPS = [
  {
    title: '明白顏色同中心塊',
    desc: '第一步：先認清楚六個中心塊。中心塊決定嗰一面嘅顏色，相對位置唔會變。記住：白色對黃色、紅色對橙色、藍色對綠色。跟教學時保持白色喺上面、綠色喺前面。睇清楚顏色之後，就可以開始砌白十字。',
    algos: [
      {
        name: '認識符號',
        moves: 'R U F',
        explain: "R＝右面順時針，U＝上面順時針，F＝前面順時針。加 ' 就係逆時針，加 2 就係轉 180°。",
      },
      {
        name: '性感公式預覽（稍後會用）',
        moves: "R U R' U'",
        explain: '呢條叫 Sexy Move，好短好常用，第 3 步砌白角會用到。而家可以撳示範睇下動畫。',
      },
    ],
    demoSetup: [],
    demoMoves: "R U F R' U' F'",
  },
  {
    title: '砌白十字',
    desc: '第二步：將四條白色邊塊砌去白色中心周圍，形成十字。每條白邊嘅側面顏色都要同中間層中心對齊。做法：先搵一條白邊，扭到下面，對準側面顏色，再翻上去。四條都對齊，白十字就完成。',
    algos: [
      {
        name: '下層白邊翻上（白朝下）',
        moves: 'F2',
        explain: '白邊已經喺下面而且白貼紙朝下，對準側面顏色之後轉 F2（或對應面 2）就可以翻上白色面。',
      },
      {
        name: '側邊白邊翻上',
        moves: "F D F'",
        explain: '白邊喺中間層時，可以扭到下面再對齊。示範係其中一種常見手勢。',
      },
    ],
    demoSetup: ['R', 'U', "F'", 'D', 'L'],
    demoMoves: "F2 U R U' R' F'",
  },
  {
    title: '砌白面四個角（完成第一層）',
    desc: '第三步：將白角擺喺右前上方，重覆性感公式 R U R\' U\'（通常 1～5 次）直到白角落位。左邊可用鏡像 L\' U\' L U。四個白角砌好，第一層就齊。',
    algos: [
      {
        name: '性感公式 Sexy Move',
        moves: "R U R' U'",
        explain: '白角喺右前上（頂層），白貼紙唔使一定朝上——重覆呢條直到角塊跌入右前下。通常做 1～5 次。',
      },
      {
        name: '反方向（左邊）',
        moves: "L' U' L U",
        explain: '如果想喺左前位砌角，用鏡像版本。',
      },
    ],
    demoSetup: ['R', 'U', "R'", "U'", 'R', 'U', "R'"],
    demoMoves: "R U R' U' R U R' U' R U R' U'",
  },
  {
    title: '砌中間層四條邊',
    desc: '第四步：搵頂層冇黃色嘅邊塊，先將側面顏色對準前面中心。要去右邊用 U R U\' R\' U\' F\' U F；要去左邊用對稱公式。插入後檢查中間層係咪齊色。',
    algos: [
      {
        name: '中間層插入（去右）',
        moves: "U R U' R' U' F' U F",
        explain: '頂層邊塊要插入去右前方中間位時用。先 U 對齊前面顏色，再做呢條。',
      },
      {
        name: '中間層插入（去左）',
        moves: "U' L' U L U F U' F'",
        explain: '對稱版本：邊塊要插入去左前方中間位。',
      },
    ],
    demoSetup: ['R', 'U', "R'", "U'", "F'", 'U', 'F'],
    demoMoves: "U R U' R' U' F' U F",
  },
  {
    title: '砌黃十字',
    desc: '第五步：淨係睇黃色頂面，角暫時唔理。公式係 F R U R\' U\' F\'。見到 L 形就放左上角做一次；如果係一字，先做一次變 L，再做一次變十字。',
    algos: [
      {
        name: "黃十字公式（F R U R' U' F'）",
        moves: "F R U R' U' F'",
        explain: '由「L 形」（兩條黃邊相鄰）開始最易：將 L 形放喺左上角，做一次就變十字。如果係一字，將橫線水平再做一次變 L，再做一次變十字。如果得個黃中心，就要做三次。',
      },
    ],
    demoSetup: ['F', 'R', 'U', "R'", "U'", "F'"],
    demoMoves: "F R U R' U' F'",
  },
  {
    title: '砌黃面',
    desc: '第六步：用 Sune（R U R\' U R U2 R\'）砌完整黃面。見到魚形（淨一隻黃角朝上）就對準方位再做；另一方向用反 Sune。做到所有黃角朝上就得。',
    algos: [
      {
        name: 'Sune',
        moves: "R U R' U R U2 R'",
        explain: '頂層只有一隻黃角朝上（魚形）時最常用：對準方位後做 Sune。',
      },
      {
        name: '反 Sune（Anti-Sune）',
        moves: "R U2 R' U' R U' R'",
        explain: '魚形鏡像或者另一個方向時用。',
      },
      {
        name: '性感公式變奏',
        moves: "R U R' U'",
        explain: '有時重覆 Sexy 都可以導向魚形，再接 Sune。',
      },
    ],
    demoSetup: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
    demoMoves: "R U R' U R U2 R'",
  },
  {
    title: '排好頂層角同邊（完成）',
    desc: '最後一步：先用角交換公式將四隻角換到啱位，再用 Ua 邊三循環排邊。角啱、邊啱，魔方就還原。可以再撳「由頭播教學」溫一次。',
    algos: [
      {
        name: '頂層角交換（新手）',
        moves: "R' F R' B2 R F' R' B2 R2",
        explain: '保持參考角定位後執行；可能要做兩次。詳見「常用公式」分頁。',
      },
      {
        name: '頂層邊三循環（Ua）',
        moves: "R U' R U R U R U' R' U' R2",
        explain: '角啱咗但邊未啱：搵一條已經啱嘅邊放後面，做呢條三循環。',
      },
    ],
    demoSetup: [],
    demoMoves: "R U' R U R U R U' R' U' R2",
  },
];

const FORMULA_CATALOG = [
  {
    id: 'sexy',
    name: '性感公式 Sexy Move',
    tag: '萬用',
    moves: "R U R' U'",
    when: '砌白角、調整位置時最常用。短、好記、幾乎每步都會用到。建議練到盲打。',
    setup: ["R'", "U'", 'R', 'U'],
  },
  {
    id: 'sexy-mirror',
    name: '性感鏡像',
    tag: '萬用',
    moves: "L' U' L U",
    when: '左邊版本嘅 Sexy，砌左前白角時用。',
    setup: ['L', 'U', "L'", "U'"],
  },
  {
    id: 'insert-right',
    name: '中間層插入（右）',
    tag: '第二層',
    moves: "U R U' R' U' F' U F",
    when: '頂層邊塊要插入右前方中間層。先將邊塊側面對準前面中心，再執行。',
    setup: [],
  },
  {
    id: 'insert-left',
    name: '中間層插入（左）',
    tag: '第二層',
    moves: "U' L' U L U F U' F'",
    when: '對稱：邊塊要插入左前方中間層。',
    setup: [],
  },
  {
    id: 'yellow-cross',
    name: '黃十字',
    tag: '頂層',
    moves: "F R U R' U' F'",
    when: '由 L 形／一字／單點變成黃十字。記住：L 形放左上 → 做一次。',
    setup: ['F', 'U', 'R', "U'", "R'", "F'"],
  },
  {
    id: 'sune',
    name: 'Sune',
    tag: '砌黃面',
    moves: "R U R' U R U2 R'",
    when: '頂層「魚形」——淨一隻黃角朝上。對準方位後做一次或多次。',
    setup: ['R', 'U2', "R'", "U'", 'R', "U'", "R'"],
  },
  {
    id: 'antisune',
    name: '反 Sune',
    tag: '砌黃面',
    moves: "R U2 R' U' R U' R'",
    when: '魚形另一個方向，或者 Sune 嘅逆向思路。',
    setup: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
  },
  {
    id: 'ua',
    name: 'Ua 邊三循環',
    tag: '最後一步',
    moves: "R U' R U R U R U' R' U' R2",
    when: '頂層角已經啱位，三條邊要循環對調時用。已啱嗰條邊放後面。',
    setup: [],
  },
  {
    id: 'corner-swap',
    name: '頂層角交換',
    tag: '最後一步',
    moves: "R' F R' B2 R F' R' B2 R2",
    when: '黃面砌好但角塊位置錯。對準參考角再做；可能要重複。',
    setup: [],
  },
];

const SHORTCUTS = {
  moves: [
    { keys: ['R'], label: '右面順時針' },
    { keys: ['Shift', 'R'], label: "右面逆時針 R'" },
    { keys: ['L'], label: '左面順時針' },
    { keys: ['Shift', 'L'], label: "左面逆時針 L'" },
    { keys: ['U'], label: '上面順時針' },
    { keys: ['Shift', 'U'], label: "上面逆時針 U'" },
    { keys: ['D'], label: '下面順時針' },
    { keys: ['Shift', 'D'], label: "下面逆時針 D'" },
    { keys: ['F'], label: '前面順時針' },
    { keys: ['Shift', 'F'], label: "前面逆時針 F'" },
    { keys: ['B'], label: '後面順時針' },
    { keys: ['Shift', 'B'], label: "後面逆時針 B'" },
    { keys: ['2'], label: '下一個轉面改為 180°（先撳 2 再撳面）' },
  ],
  ops: [
    { keys: ['S'], label: '打亂（20 步）' },
    { keys: ['Esc'], label: '一鍵還原（已還原狀態）' },
    { keys: ['0'], label: '一鍵還原（同上）' },
    { keys: ['Z'], label: '撤銷上一步' },
    { keys: ['Ctrl', 'Z'], label: '撤銷上一步' },
  ],
  nav: [
    { keys: ['['], label: '上一步教學' },
    { keys: [']'], label: '下一步教學' },
    { keys: ['Enter'], label: '示範而家呢步' },
    { keys: ['1'], label: '切去「教學」分頁' },
    { keys: ['`'], label: '切去「常用公式」分頁' },
    { keys: ['3'], label: '切去「快捷鍵」分頁' },
    { keys: ['V'], label: '播教學／停止（旁白＋點扭）' },
  ],
};

/* ========== Helpers ========== */
function parseMove(token) {
  token = String(token).trim();
  if (!token) return null;
  const face = token[0].toUpperCase();
  if (!FACE_AXES[face]) return null;
  let turns = 1;
  if (token.length > 1) {
    if (token.includes("'")) turns = -1;
    else if (token.includes('2')) turns = 2;
  }
  let notation = face;
  if (turns === -1) notation += "'";
  else if (turns === 2) notation += '2';
  return { face, turns, notation };
}

function parseAlgorithm(str) {
  return String(str).trim().split(/\s+/).map(parseMove).filter(Boolean);
}

function invertMove(m) {
  const t = m.turns === 2 ? 2 : -m.turns;
  let notation = m.face;
  if (t === -1) notation += "'";
  else if (t === 2) notation += '2';
  return { face: m.face, turns: t, notation };
}

function setStatus(msg, busy = false) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('busy', !!busy);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ========== Rubik Cube ========== */
class RubiksCube {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.cubies = [];
    this.pivot = new THREE.Group();
    this.group.add(this.pivot);
    this.animating = false;
    this.queue = [];
    this.history = [];
    this.speed = 1;
    this.highlightMesh = null;
    this.onIdle = null;
    this._build();
  }

  _build() {
    const gap = 0.08;
    const size = 1 - gap;
    const stickerT = 0.035;
    const stickerSize = size * 0.86;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const cubie = new THREE.Group();
          cubie.userData.grid = { x, y, z };

          const body = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshStandardMaterial({ color: COLORS.plastic, roughness: 0.45, metalness: 0.08 })
          );
          body.castShadow = false;
          cubie.add(body);

          const addSticker = (nx, ny, nz, color) => {
            const geo = new THREE.PlaneGeometry(stickerSize, stickerSize);
            const mat = new THREE.MeshStandardMaterial({
              color,
              roughness: 0.32,
              metalness: 0.04,
              emissive: 0x000000,
              emissiveIntensity: 0,
            });
            const sticker = new THREE.Mesh(geo, mat);
            const off = size / 2 + stickerT / 2 + 0.001;
            sticker.position.set(nx * off, ny * off, nz * off);
            if (Math.abs(nx) === 1) {
              sticker.rotation.y = nx > 0 ? Math.PI / 2 : -Math.PI / 2;
            } else if (Math.abs(ny) === 1) {
              sticker.rotation.x = ny > 0 ? -Math.PI / 2 : Math.PI / 2;
            } else if (nz < 0) {
              sticker.rotation.y = Math.PI;
            }
            sticker.userData.isSticker = true;
            cubie.add(sticker);
          };

          if (x === 1) addSticker(1, 0, 0, COLORS.R);
          if (x === -1) addSticker(-1, 0, 0, COLORS.L);
          if (y === 1) addSticker(0, 1, 0, COLORS.U);
          if (y === -1) addSticker(0, -1, 0, COLORS.D);
          if (z === 1) addSticker(0, 0, 1, COLORS.F);
          if (z === -1) addSticker(0, 0, -1, COLORS.B);

          cubie.position.set(x, y, z);
          this.group.add(cubie);
          this.cubies.push(cubie);
        }
      }
    }
  }

  reset() {
    this.queue = [];
    this.history = [];
    this.animating = false;
    this._clearHighlight();
    while (this.pivot.children.length) {
      const c = this.pivot.children[0];
      this.pivot.remove(c);
    }
    this.pivot.quaternion.identity();
    for (const c of this.cubies) this.group.remove(c);
    this.cubies = [];
    this._build();
  }

  _cubiesOnFace(face) {
    const { axis, dir } = FACE_AXES[face];
    return this.cubies.filter((c) => {
      const p = c.position;
      const v = axis === 'x' ? p.x : axis === 'y' ? p.y : p.z;
      return Math.round(v) === dir;
    });
  }

  _clearHighlight() {
    if (this.highlightMesh) {
      this.group.remove(this.highlightMesh);
      this.highlightMesh.geometry.dispose();
      this.highlightMesh.material.dispose();
      this.highlightMesh = null;
    }
    for (const c of this.cubies) {
      c.traverse((obj) => {
        if (obj.isMesh && obj.material && obj.material.emissive) {
          obj.material.emissive.setHex(0x000000);
          obj.material.emissiveIntensity = 0;
        }
      });
    }
  }

  _highlightFace(face) {
    this._clearHighlight();
    for (const c of this._cubiesOnFace(face)) {
      c.traverse((obj) => {
        if (obj.userData.isSticker && obj.material) {
          obj.material.emissive.setHex(0x5b8def);
          obj.material.emissiveIntensity = 0.55;
        }
      });
    }
    const { axis, dir } = FACE_AXES[face];
    const geo = new THREE.PlaneGeometry(3.1, 3.1);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x5b8def,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const plane = new THREE.Mesh(geo, mat);
    if (axis === 'x') {
      plane.rotation.y = Math.PI / 2;
      plane.position.x = dir * 1.58;
    } else if (axis === 'y') {
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = dir * 1.58;
    } else {
      plane.position.z = dir * 1.58;
    }
    this.group.add(plane);
    this.highlightMesh = plane;
  }

  enqueue(move, { record = true, silent = false } = {}) {
    const m = typeof move === 'string' ? parseMove(move) : move;
    if (!m) return;
    this.queue.push({ type: 'move', move: m, record, silent });
    this._pump();
  }

  enqueueAlgorithm(algo, opts = {}) {
    const moves = typeof algo === 'string' ? parseAlgorithm(algo) : algo;
    for (const m of moves) this.enqueue(m, opts);
  }

  enqueueCallback(fn) {
    this.queue.push({ type: 'callback', fn });
    this._pump();
  }

  _pump() {
    if (this.animating || this.queue.length === 0) {
      if (!this.animating && this.queue.length === 0 && this.onIdle) {
        const cb = this.onIdle;
        this.onIdle = null;
        cb();
      }
      return;
    }
    const job = this.queue.shift();
    if (job.type === 'callback') {
      job.fn();
      this._pump();
      return;
    }
    this._animateMove(job.move, job);
  }

  _animateMove(move, { record, silent }) {
    this.animating = true;
    if (!silent) setStatus('扭緊：' + move.notation, true);
    this._highlightFace(move.face);

    const { axis, dir } = FACE_AXES[move.face];
    const cubies = this._cubiesOnFace(move.face);

    this.pivot.quaternion.identity();
    this.group.updateMatrixWorld(true);
    for (const c of cubies) {
      this.group.remove(c);
      this.pivot.add(c);
    }

    // Clockwise when looking at the face = negative rotation about outward normal
    let targetAngle;
    if (move.turns === 2) targetAngle = -Math.PI;
    else if (move.turns === -1) targetAngle = Math.PI / 2;
    else targetAngle = -Math.PI / 2;

    const outward = new THREE.Vector3(
      axis === 'x' ? dir : 0,
      axis === 'y' ? dir : 0,
      axis === 'z' ? dir : 0
    );

    const duration = (move.turns === 2 ? 400 : 300) / this.speed;
    const start = performance.now();
    const deltaQuat = new THREE.Quaternion().setFromAxisAngle(outward, targetAngle);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOutCubic(t);
      const q = new THREE.Quaternion().slerpQuaternions(new THREE.Quaternion(), deltaQuat, e);
      this.pivot.quaternion.copy(q);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        this.pivot.quaternion.copy(deltaQuat);
        this._finalizeTurn(cubies);
        if (record) this.history.push({ ...move });
        this.animating = false;
        this._clearHighlight();
        if (!silent && this.queue.length === 0) setStatus('準備就緒');
        this._pump();
      }
    };
    requestAnimationFrame(tick);
  }

  _finalizeTurn(cubies) {
    this.group.updateMatrixWorld(true);
    for (const c of cubies) {
      c.updateMatrixWorld(true);
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      c.getWorldPosition(worldPos);
      c.getWorldQuaternion(worldQuat);

      this.pivot.remove(c);
      this.group.add(c);

      const localPos = this.group.worldToLocal(worldPos.clone());
      c.position.set(Math.round(localPos.x), Math.round(localPos.y), Math.round(localPos.z));

      const parentQ = new THREE.Quaternion();
      this.group.getWorldQuaternion(parentQ);
      c.quaternion.copy(parentQ.clone().invert()).multiply(worldQuat);

      c.userData.grid = { x: c.position.x, y: c.position.y, z: c.position.z };
    }
    this.pivot.quaternion.identity();
  }

  undo() {
    if (this.animating || this.queue.length) {
      setStatus('等扭完先可以撤銷', true);
      return;
    }
    const last = this.history.pop();
    if (!last) {
      setStatus('冇嘢可以撤銷');
      return;
    }
    this.enqueue(invertMove(last), { record: false });
  }

  scramble(n = 20) {
    if (this.animating || this.queue.length) return;
    const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
    const turnOpts = [1, -1, 2];
    let prev = null;
    const seq = [];
    for (let i = 0; i < n; i++) {
      let f;
      do {
        f = faces[(Math.random() * 6) | 0];
      } while (f === prev);
      prev = f;
      const t = turnOpts[(Math.random() * 3) | 0];
      seq.push(parseMove(f + (t === -1 ? "'" : t === 2 ? '2' : '')));
    }
    setStatus('打亂中（' + n + ' 步）…', true);
    for (const m of seq) this.enqueue(m, { record: true, silent: true });
    this.enqueueCallback(() => setStatus('打亂完成 — 可以開始練習'));
  }

  busy() {
    return this.animating || this.queue.length > 0;
  }
}


/* ========== 教學字幕（無配音；逐句展示） ========== */
let captionTimer = null;
let captionAbort = false;

function splitSentences(script) {
  const raw = String(script || '').trim();
  if (!raw) return [];
  // Prefer 。！？； keep short fragments readable
  const parts = raw
    .split(/(?<=[。！？])\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length) return parts;
  return [raw];
}

function clearCaptions() {
  captionAbort = true;
  if (captionTimer) {
    clearTimeout(captionTimer);
    captionTimer = null;
  }
  const bar = document.getElementById('caption-bar');
  const cur = document.getElementById('caption-current');
  if (bar) bar.hidden = true;
  if (cur) {
    cur.classList.remove('is-fading');
    cur.textContent = '';
  }
}

function showCaptionPair(sentences, index) {
  const bar = document.getElementById('caption-bar');
  const cur = document.getElementById('caption-current');
  if (!bar || !cur) return;
  bar.hidden = false;
  const text = sentences[index] || '';
  // TV-style: fade out → swap line → fade in
  cur.classList.add('is-fading');
  window.setTimeout(() => {
    cur.textContent = text;
    cur.classList.remove('is-fading');
  }, 180);
}

/** Advance captions on a reading-pace timer (ms per sentence ~ chars * 80 + 900). */
function runCaptions(script) {
  clearCaptions();
  captionAbort = false;
  const sentences = splitSentences(script);
  if (!sentences.length) return Promise.resolve();

  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (captionAbort || lessonAbort) {
        clearCaptions();
        resolve();
        return;
      }
      if (i >= sentences.length) {
        // keep last line briefly then clear on resolve for course flow
        resolve();
        return;
      }
      showCaptionPair(sentences, i);
      const s = sentences[i];
      const ms = Math.min(7000, Math.max(1800, s.length * 100 + 900));
      i += 1;
      captionTimer = setTimeout(tick, ms);
    };
    tick();
  });
}

function stopVoice() {
  // Legacy name: stop captions / any leftover UI
  clearCaptions();
  const btn = document.getElementById('btn-listen');
  if (btn) {
    btn.classList.remove('playing');
    btn.disabled = false;
    btn.textContent = '再播呢步';
  }
  const stop = document.getElementById('btn-stop-voice');
  if (stop) stop.hidden = true;
  const vs = document.getElementById('voice-status');
  if (vs) vs.textContent = '';
}

function currentStepScript() {
  const c = STEP_COMMENTARY[currentStep];
  return c ? c.script : STEPS[currentStep].desc;
}

/** 字幕 + 點扭示範（無 TTS）；視角可繼續拖動 */
async function playStepLesson() {
  if (demoRunning || (cube && cube.busy() && !courseRunning)) {
    // allow during course; otherwise wait
    if (!courseRunning) {
      setStatus('等而家嘅動作做完先', true);
      return;
    }
  }

  const step = STEPS[currentStep];
  const script = currentStepScript();
  const captionPromise = runCaptions(script);

  demoRunning = true;
  // Keep OrbitControls enabled so user can orbit while faces turn
  setStatus('播緊教學：' + step.title, true);

  try {
    await new Promise((r) => setTimeout(r, 280));
    if (lessonAbort) return;

    cube.reset();
    if (step.demoSetup && step.demoSetup.length) {
      for (const tok of step.demoSetup) {
        if (!demoRunning || lessonAbort) return;
        await animateMovePromise(parseMove(tok), true);
      }
    }
    const moves = parseAlgorithm(step.demoMoves || '');
    const fallback =
      !moves.length && step.algos && step.algos[0]
        ? parseAlgorithm(step.algos[0].moves)
        : moves;
    for (const m of fallback) {
      if (!demoRunning || lessonAbort) return;
      await animateMovePromise(m, false);
    }
    setStatus('呢步示範完成');
  } finally {
    demoRunning = false;
  }

  await captionPromise;
}

async function playFullCourse() {
  if (courseRunning || demoRunning || cube.busy()) {
    setStatus('等而家嘅教學做完先，或者撳停止', true);
    return;
  }
  courseRunning = true;
  lessonAbort = false;
  const stopAll = document.getElementById('btn-stop-all');
  const playAll = document.getElementById('btn-play-all');
  if (stopAll) stopAll.hidden = false;
  if (playAll) {
    playAll.disabled = true;
    playAll.textContent = '教學播放中…';
  }
  setMode('teach');
  setStatus('開始由頭播教學 — 下面會逐句顯示講解', true);

  try {
    for (let i = 0; i < STEPS.length; i++) {
      if (lessonAbort) break;
      currentStep = i;
      renderStep();
      await playStepLesson();
      if (lessonAbort) break;
      await new Promise((r) => setTimeout(r, 400));
    }
    if (!lessonAbort) setStatus('成套教學播完 — 可以再撳「由頭播教學」');
  } finally {
    courseRunning = false;
    if (stopAll) stopAll.hidden = true;
    if (playAll) {
      playAll.disabled = false;
      playAll.textContent = '由頭播教學';
    }
    if (!lessonAbort) {
      // leave last caption briefly; clear after short delay
      setTimeout(() => {
        if (!courseRunning && !demoRunning) clearCaptions();
      }, 1200);
    }
  }
}

function stopFullCourse() {
  lessonAbort = true;
  courseRunning = false;
  demoRunning = false;
  stopVoice();
  clearCaptions();
  cube.reset();
  const stopAll = document.getElementById('btn-stop-all');
  const playAll = document.getElementById('btn-play-all');
  if (stopAll) stopAll.hidden = true;
  if (playAll) {
    playAll.disabled = false;
    playAll.textContent = '由頭播教學';
  }
  setStatus('已停止教學');
}

function maybeAutoplayStepVoice() {
  // Autoplay disabled (no TTS); manual play only
}

/* ========== App / UI ========== */
let cube, camera, renderer, controls, scene;
let currentStep = 0;
let mode = 'teach';
let pendingDouble = false;
let demoRunning = false;
let lessonAbort = false;
let courseRunning = false;

function initThree() {
  const viewport = document.getElementById('viewport');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1117);

  const w = viewport.clientWidth;
  const h = viewport.clientHeight;
  camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
  // Closer default framing so the cube reads larger on phones
  camera.position.set(5.4, 4.3, 6.4);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  viewport.insertBefore(renderer.domElement, viewport.firstChild);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.8;
  controls.maxDistance = 12;
  controls.target.set(0, 0, 0);
  controls.enablePan = false;
  controls.rotateSpeed = 0.85;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  // Prevent browser scroll/zoom fighting cube orbit on phones
  renderer.domElement.style.touchAction = 'none';

  const amb = new THREE.AmbientLight(0xffffff, 0.62);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.85);
  dir.position.set(5, 8, 4);
  scene.add(dir);
  const fill = new THREE.DirectionalLight(0xaabbff, 0.25);
  fill.position.set(-4, 2, -3);
  scene.add(fill);

  cube = new RubiksCube(scene);
  fitCubeInView();

  window.addEventListener('resize', onResize);
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => onResize());
    ro.observe(viewport);
  }
  // visualViewport helps iOS URL-bar show/hide
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
  }
  animate();
}


function fitCubeInView() {
  if (!camera || !controls) return;
  const viewport = document.getElementById('viewport');
  if (!viewport) return;
  const w = Math.max(1, viewport.clientWidth);
  const h = Math.max(1, viewport.clientHeight);
  const narrow = w < 900;
  // Keep a comfortable framed distance; pull in more on portrait phones
  const portrait = h >= w;
  let dist = narrow ? (portrait ? 7.4 : 8.2) : 9.0;
  if (narrow && portrait && h < 700) dist = 7.0;
  if (narrow && portrait && h >= 740) dist = 7.2;
  const dir = camera.position.clone().sub(controls.target).normalize();
  if (dir.lengthSq() < 1e-6) dir.set(0.55, 0.45, 0.7).normalize();
  camera.position.copy(controls.target).addScaledVector(dir, dist);
  camera.fov = narrow ? 42 : 44;
  camera.updateProjectionMatrix();
  controls.update();
}

function onResize() {
  const viewport = document.getElementById('viewport');
  if (!viewport || !camera || !renderer) return;
  const w = Math.max(1, viewport.clientWidth);
  const h = Math.max(1, viewport.clientHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  fitCubeInView();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function buildMovePad() {
  const pad = document.getElementById('move-pad');
  pad.innerHTML = '';
  for (const m of MOVE_LIST) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = m;
    btn.title = '扭 ' + m;
    if (m.includes("'")) btn.classList.add('prime');
    if (m.includes('2')) btn.classList.add('double');
    btn.addEventListener('click', () => {
      if (cube.busy() && cube.queue.length > 40) return;
      cube.enqueue(m);
    });
    pad.appendChild(btn);
  }
}

function renderStep() {
  const step = STEPS[currentStep];
  document.getElementById('step-badge').textContent = currentStep + 1 + ' / ' + STEPS.length;
  document.getElementById('step-title').textContent = step.title;
  document.getElementById('step-desc').textContent = step.desc;

  const list = document.getElementById('algo-list');
  list.innerHTML = '';
  for (const algo of step.algos) {
    const box = document.createElement('div');
    box.className = 'algo-box';
    box.innerHTML =
      '<div class="algo-name"></div>' +
      '<div class="algo-moves"></div>' +
      '<div class="algo-explain"></div>' +
      '<div class="algo-actions"></div>';
    box.querySelector('.algo-name').textContent = algo.name;
    box.querySelector('.algo-moves').textContent = algo.moves;
    box.querySelector('.algo-explain').textContent = algo.explain;
    const actions = box.querySelector('.algo-actions');
    const demoBtn = document.createElement('button');
    demoBtn.type = 'button';
    demoBtn.textContent = '示範呢條';
    demoBtn.addEventListener('click', () => runAlgoDemo(algo.moves, []));
    const listenBtn = document.createElement('button');
    listenBtn.type = 'button';
    listenBtn.textContent = '聽＋示範';
    const algoIdx = step.algos.indexOf(algo);
    listenBtn.addEventListener('click', () => {
      const script =
        '公式叫做' + algo.name + '。寫法係：' + algo.moves.replace(/'/g, '撇') + '。' + algo.explain;
      playCommentary(script, 'step-' + (currentStep + 1) + '-algo-' + algoIdx);
      runAlgoDemo(algo.moves, []);
    });
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = '複製公式';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(algo.moves);
        setStatus('已複製：' + algo.moves);
      } catch {
        setStatus('複製失敗，請手動選取公式');
      }
    });
    actions.appendChild(demoBtn);
    actions.appendChild(listenBtn);
    actions.appendChild(copyBtn);
    list.appendChild(box);
  }

  document.getElementById('btn-prev').disabled = currentStep === 0;
  document.getElementById('btn-next').disabled = currentStep === STEPS.length - 1;
  renderChecklist();
}

function renderChecklist() {
  const ul = document.getElementById('checklist');
  ul.innerHTML = '';
  STEPS.forEach((s, i) => {
    const li = document.createElement('li');
    if (i === currentStep) li.classList.add('current');
    if (i < currentStep) li.classList.add('done');
    li.innerHTML = '<span class="num"></span><span class="txt"></span>';
    li.querySelector('.num').textContent = i < currentStep ? '✓' : String(i + 1);
    li.querySelector('.txt').textContent = s.title;
    li.addEventListener('click', () => {
      currentStep = i;
      renderStep();
      maybeAutoplayStepVoice();
    });
    ul.appendChild(li);
  });
}

function renderFormulaCatalog() {
  const root = document.getElementById('formula-catalog');
  root.innerHTML = '';
  for (const f of FORMULA_CATALOG) {
    const card = document.createElement('div');
    card.className = 'formula-card';
    card.innerHTML =
      '<div class="formula-meta"><span class="formula-name"></span><span class="formula-tag"></span></div>' +
      '<div class="formula-moves"></div>' +
      '<div class="formula-when"></div>' +
      '<div class="formula-actions"></div>';
    card.querySelector('.formula-name').textContent = f.name;
    card.querySelector('.formula-tag').textContent = f.tag;
    card.querySelector('.formula-moves').textContent = f.moves;
    card.querySelector('.formula-when').textContent = f.when;
    const actions = card.querySelector('.formula-actions');
    const demo = document.createElement('button');
    demo.type = 'button';
    demo.className = 'demo-btn';
    demo.textContent = '示範';
    demo.addEventListener('click', () => runAlgoDemo(f.moves, f.setup || []));
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = '複製';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(f.moves);
        setStatus('已複製：' + f.moves);
      } catch {
        setStatus('複製失敗');
      }
    });
    const listen = document.createElement('button');
    listen.type = 'button';
        listen.className = 'listen-mini';
    listen.textContent = '聽＋示範';
    listen.addEventListener('click', () => {
      const script = FORMULA_COMMENTARY[f.id] || f.when;
      playCommentary(script, 'formula-' + f.id);
      runAlgoDemo(f.moves, f.setup || []);
    });
    actions.appendChild(demo);
    actions.appendChild(listen);
    actions.appendChild(copy);
    root.appendChild(card);
  }
}

function renderShortcuts() {
  const fill = (id, rows) => {
    const el = document.getElementById(id);
    el.innerHTML = '';
    for (const row of rows) {
      const div = document.createElement('div');
      div.className = 'shortcut-row';
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = row.label;
      const keys = document.createElement('span');
      keys.className = 'keys';
      row.keys.forEach((k, i) => {
        if (i > 0) {
          const plus = document.createElement('span');
          plus.textContent = '+';
          plus.style.color = 'var(--text-muted)';
          plus.style.fontSize = '0.75rem';
          keys.appendChild(plus);
        }
        const kbd = document.createElement('kbd');
        kbd.textContent = k;
        keys.appendChild(kbd);
      });
      div.appendChild(label);
      div.appendChild(keys);
      el.appendChild(div);
    }
  };
  fill('shortcut-moves', SHORTCUTS.moves);
  fill('shortcut-ops', SHORTCUTS.ops);
  fill('shortcut-nav', SHORTCUTS.nav);
}

function switchTab(name) {
  document.querySelectorAll('.side-tab').forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('.tab-pane').forEach((p) => {
    p.classList.toggle('active', p.id === 'tab-' + name);
  });
  const scroll = document.querySelector('.sidebar-scroll');
  if (scroll) scroll.scrollTop = 0;
}

function setMode(next) {
  mode = next;
  document.body.classList.toggle('mode-teach', mode === 'teach');
  document.body.classList.toggle('mode-free', mode === 'free');
  document.getElementById('btn-mode-teach').classList.toggle('active', mode === 'teach');
  document.getElementById('btn-mode-free').classList.toggle('active', mode === 'free');
  setStatus(mode === 'teach' ? '教學模式 — 跟住步驟學公式同快捷鍵' : '自由練習 — 打亂之後自己扭');
  if (mode === 'teach') switchTab('teach');
  const movePadEl = document.getElementById('move-pad');
  const showPadEl = document.getElementById('show-move-pad');
  if (movePadEl && showPadEl) {
    if (mode === 'free' && showPadEl.checked) movePadEl.removeAttribute('hidden');
    if (mode === 'teach' && !showPadEl.checked) movePadEl.setAttribute('hidden', '');
  }
}

async function runAlgoDemo(movesStr, setup) {
  if (demoRunning || cube.busy()) {
    setStatus('等而家嘅動作做完先', true);
    return;
  }
  demoRunning = true;
  setStatus('準備示範…', true);

  cube.reset();
  // Apply setup instantly (no animation) then animate the algo
  if (setup && setup.length) {
    for (const tok of setup) {
      await animateMovePromise(parseMove(tok), true);
    }
  }
  setStatus('示範公式：' + movesStr, true);
  const moves = parseAlgorithm(movesStr);
  for (const m of moves) {
    await animateMovePromise(m, false);
  }
  demoRunning = false;
  setStatus('示範完成 — 可以自己再試（或撳複製公式）');
}

function animateMovePromise(move, silent) {
  return new Promise((resolve) => {
    cube.enqueue(move, { record: true, silent });
    cube.enqueueCallback(resolve);
  });
}

async function runStepDemo() {
  if (demoRunning || cube.busy()) {
    setStatus('等而家嘅動作做完先', true);
    return;
  }
  const step = STEPS[currentStep];
  demoRunning = true;
  setStatus('示範呢步：' + step.title, true);
  cube.reset();
  if (step.demoSetup && step.demoSetup.length) {
    for (const tok of step.demoSetup) {
      await animateMovePromise(parseMove(tok), true);
    }
  }
  const moves = parseAlgorithm(step.demoMoves);
  for (const m of moves) {
    await animateMovePromise(m, false);
  }
  demoRunning = false;
  setStatus('呢步示範完成');
}

function bindUI() {
  buildMovePad();
  renderStep();
  renderFormulaCatalog();
  renderShortcuts();

  document.getElementById('btn-scramble').addEventListener('click', () => {
    if (demoRunning) return;
    cube.scramble(20);
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    demoRunning = false;
    stopVoice();
    cube.reset();
    setStatus('已一鍵還原');
  });
  document.getElementById('btn-undo').addEventListener('click', () => cube.undo());

  document.getElementById('btn-prev').addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
      maybeAutoplayStepVoice();
    }
  });
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentStep < STEPS.length - 1) {
      currentStep++;
      renderStep();
      maybeAutoplayStepVoice();
    }
  });
  document.getElementById('btn-demo').addEventListener('click', () => playStepLesson());
  document.getElementById('btn-listen').addEventListener('click', () => playStepLesson());
  const playAllBtn = document.getElementById('btn-play-all');
  if (playAllBtn) playAllBtn.addEventListener('click', () => playFullCourse());
  const stopAllBtn = document.getElementById('btn-stop-all');
  if (stopAllBtn) stopAllBtn.addEventListener('click', () => stopFullCourse());
  const stopVoiceBtn = document.getElementById('btn-stop-voice');
  if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener('click', () => {
      lessonAbort = true;
    });
  }
  const showPad = document.getElementById('show-move-pad');
  const movePad = document.getElementById('move-pad');
  if (showPad && movePad) {
    showPad.addEventListener('change', () => {
      if (showPad.checked) movePad.removeAttribute('hidden');
      else movePad.setAttribute('hidden', '');
    });
  }
  document.body.classList.add('listen-first');
  document.getElementById('btn-stop-voice').addEventListener('click', () => {
    stopVoice();
    setStatus('已停止旁白');
  });
  const autoplayBox = document.getElementById('autoplay-voice');
  if (autoplayBox) {
    autoplayBox.checked = localStorage.getItem('rubik-autoplay-voice') === '1';
    autoplayBox.addEventListener('change', () => {
      localStorage.setItem('rubik-autoplay-voice', autoplayBox.checked ? '1' : '0');
      if (autoplayBox.checked) playStepLesson();
    });
  }

  document.getElementById('btn-mode-teach').addEventListener('click', () => setMode('teach'));
  document.getElementById('btn-mode-free').addEventListener('click', () => setMode('free'));

  document.querySelectorAll('.side-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  const speed = document.getElementById('speed');
  const speedLabel = document.getElementById('speed-label');
  speed.addEventListener('input', () => {
    const v = parseFloat(speed.value);
    cube.speed = v;
    speedLabel.textContent = v.toFixed(1) + '×';
  });

  const moreBtn = document.getElementById('btn-more');
  const morePanel = document.getElementById('more-panel');
  if (moreBtn && morePanel) {
    moreBtn.addEventListener('click', () => {
      const open = morePanel.hasAttribute('hidden');
      if (open) morePanel.removeAttribute('hidden');
      else morePanel.setAttribute('hidden', '');
      moreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      moreBtn.textContent = open ? '收起' : '更多';
      // layout change may alter viewport size
      requestAnimationFrame(onResize);
    });
  }

  window.addEventListener('keydown', onKeyDown);
}

function onKeyDown(e) {
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
  if (demoRunning) return;

  const key = e.key;

  // Tabs 1/2/3 — but 2 also used for double-move modifier
  if (!e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (key === '1') {
      switchTab('teach');
      return;
    }
    if (key === '3') {
      switchTab('keys');
      return;
    }
  }

  if (key === '2' && !e.shiftKey && !e.ctrlKey) {
    // If already pending, ignore; else arm double. Also allow tab switch if Shift+2? Keep simple: 2 arms double.
    pendingDouble = true;
    setStatus('下一個轉面會係 180°（2）— 再撳 R/L/U/D/F/B');
    e.preventDefault();
    return;
  }

  // Move keys
  const faceKeys = ['r', 'l', 'u', 'd', 'f', 'b'];
  if (faceKeys.includes(key.toLowerCase()) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const face = key.toUpperCase();
    let notation = face;
    if (pendingDouble) {
      notation += '2';
      pendingDouble = false;
    } else if (e.shiftKey) {
      notation += "'";
    }
    cube.enqueue(notation);
    e.preventDefault();
    return;
  }

  if (key === 's' || key === 'S') {
    if (!e.ctrlKey && !e.metaKey) {
      cube.scramble(20);
      e.preventDefault();
    }
    return;
  }
  if (key === 'Escape' || key === '0') {
    cube.reset();
    setStatus('已一鍵還原');
    e.preventDefault();
    return;
  }
  if ((key === 'z' || key === 'Z') && !e.altKey) {
    cube.undo();
    e.preventDefault();
    return;
  }
  if (key === '[') {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
      maybeAutoplayStepVoice();
    }
    e.preventDefault();
    return;
  }
  if (key === ']') {
    if (currentStep < STEPS.length - 1) {
      currentStep++;
      renderStep();
      maybeAutoplayStepVoice();
    }
    e.preventDefault();
    return;
  }
  if (key === 'Enter' && mode === 'teach') {
    runStepDemo();
    e.preventDefault();
    return;
  }

  if (key === '`' || key === '～') {
    switchTab('formulas');
    e.preventDefault();
    return;
  }
  if ((key === 'v' || key === 'V') && !e.ctrlKey && !e.metaKey) {
    if (currentAudio || ttsLoading || demoRunning) {
      demoRunning = false;
      stopVoice();
      cube.reset();
      setStatus('已停止教學');
    } else {
      playStepLesson();
    }
    e.preventDefault();
  }
}

initThree();
bindUI();
setMode('teach');
document.body.classList.add('listen-first');
// 一開頭 random 打亂
cube.scramble(20);
setStatus('已隨機打亂 — 撳「由頭播教學」開始（下面會逐句顯示文字）');
