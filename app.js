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

const COLOR_LABEL = {
  U: '白',
  D: '黃',
  F: '綠',
  B: '藍',
  R: '紅',
  L: '橙',
};

const FACE_COLOR_KEY = {
  [COLORS.U]: 'U',
  [COLORS.D]: 'D',
  [COLORS.F]: 'F',
  [COLORS.B]: 'B',
  [COLORS.R]: 'R',
  [COLORS.L]: 'L',
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
    title: '點睇亂魔方：中心、邊、角',
    desc: '對住而家呢粒亂魔方：先認六個中心塊（決定面色，白對黃、紅對橙、藍對綠）。保持白上綠前。分清邊塊（兩色）同角塊（三色）。掃亂面時先搵白中心，再搵白邊，黃色暫時唔理。',
    targetLabel: '而家標咗：六個中心塊',
    highlight: { type: 'centers', labels: true },
    algos: [
      {
        name: '認識符號',
        moves: 'R U F',
        explain: "R＝右面順時針，U＝上面順時針，F＝前面順時針。加 ' 就係逆時針，加 2 就係轉 180°。",
      },
      {
        name: '性感公式預覽（稍後會用）',
        moves: "R U R' U'",
        explain: '呢條叫 Sexy Move，好短好常用，第 3 步砌白角會用到。',
      },
    ],
    // 只做示意轉面，唔會 reset；對住你而家嘅亂魔方示範符號
    liveDemoMoves: "R U F R' U' F'",
    demoSetup: [],
    demoMoves: '',
  },
  {
    title: '砌白十字',
    desc: '而家睇吓亂魔方要搵邊啲塊：標咗四條白邊。目標係圍住白中心砌十字，側面顏色要同中間層中心對齊。先認清楚邊四粒，再學點翻上去。',
    targetLabel: '而家標咗：白色邊塊',
    highlight: { type: 'edges-with', colorKey: 'U' },
    algos: [
      {
        name: '下層白邊翻上（白朝下）',
        moves: 'F2',
        explain: '白邊已經喺下面而且白貼紙朝下，對準側面顏色之後轉 F2（或對應面 2）就可以翻上白色面。',
      },
      {
        name: '側邊白邊翻上',
        moves: "F D F'",
        explain: '白邊喺中間層時，可以扭到下面再對齊。',
      },
    ],
    liveDemoMoves: '',
    demoSetup: [],
    demoMoves: '',
  },
  {
    title: '砌白面四個角（完成第一層）',
    desc: '完成白十字後，將整個魔方翻轉，讓白色在下、黃色在上。把要放入的白角移到目標位置的右前上方，重複右手公式，直到白角進入右前下方。',
    targetLabel: '而家標咗：白色角塊',
    highlight: { type: 'corners-with', colorKey: 'U' },
    algos: [
      {
        name: '性感公式 Sexy Move',
        moves: "R U R' U'",
        explain: '白角喺右前上（頂層），重覆呢條直到角塊跌入右前下。通常做 1～5 次。',
      },
      {
        name: '反方向（左邊）',
        moves: "L' U' L U",
        explain: '如果想喺左前位砌角，用鏡像版本。',
      },
    ],
    liveDemoMoves: '',
    demoSetup: [],
    demoMoves: '',
  },
  {
    title: '砌中間層四條邊',
    desc: '而家睇吓要搵邊啲塊：標咗冇白冇黃嘅中間層邊。先對準前面中心，再用右插或左插公式放入中間層。',
    targetLabel: '而家標咗：中間層邊塊',
    highlight: { type: 'equator-edges' },
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
    liveDemoMoves: '',
    demoSetup: [],
    demoMoves: '',
  },
  {
    title: '砌黃十字',
    desc: '而家睇吓要搵邊啲塊：標咗四條黃邊。淨係睇黃色頂面邊，角暫時唔理。用 F R U R\' U\' F\' 由 L／一字變成十字。',
    targetLabel: '而家標咗：黃色邊塊',
    highlight: { type: 'edges-with', colorKey: 'D' },
    algos: [
      {
        name: "黃十字公式（F R U R' U' F'）",
        moves: "F R U R' U' F'",
        explain: '由「L 形」開始最易：將 L 形放喺左上角，做一次就變十字。',
      },
    ],
    liveDemoMoves: '',
    demoSetup: [],
    demoMoves: '',
  },
  {
    title: '砌黃面',
    desc: '而家睇吓要搵邊啲塊：標咗四隻黃角。用 Sune 或反 Sune 將黃角翻到朝上，砌完整黃面。',
    targetLabel: '而家標咗：黃色角塊',
    highlight: { type: 'corners-with', colorKey: 'D' },
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
    liveDemoMoves: '',
    demoSetup: [],
    demoMoves: '',
  },
  {
    title: '排好頂層角同邊（完成）',
    desc: '而家睇吓要搵邊啲塊：標咗頂層角同邊。先交換角到啱位，再用 Ua 排邊。角啱、邊啱就還原。',
    targetLabel: '而家標咗：頂層角同邊',
    highlight: { type: 'last-layer' },
    algos: [
      {
        name: '頂層角交換（新手）',
        moves: "R' F R' B2 R F' R' B2 R2",
        explain: '保持參考角定位後執行；可能要做兩次。',
      },
      {
        name: '頂層邊三循環（Ua）',
        moves: "R U' R U R U R U' R' U' R2",
        explain: '角啱咗但邊未啱：搵一條已經啱嘅邊放後面，做呢條三循環。',
      },
    ],
    liveDemoMoves: '',
    demoSetup: [],
    demoMoves: '',
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
    this.targetCubies = [];
    this.targetLabelSprites = [];
    this.targetArrows = [];
    this.targetGlowColor = 0xffcc66;
    this.targetGlowColorKey = null;
    this.targetPulse = 0;
    this.keepTargetsDuringMove = false;
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
          cubie.userData.home = { x, y, z };

          const absCount = (x !== 0 ? 1 : 0) + (y !== 0 ? 1 : 0) + (z !== 0 ? 1 : 0);
          cubie.userData.kind = absCount === 1 ? 'center' : absCount === 2 ? 'edge' : 'corner';

          const body = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshStandardMaterial({ color: COLORS.plastic, roughness: 0.45, metalness: 0.08 })
          );
          body.castShadow = false;
          body.userData.isBody = true;
          cubie.add(body);

          const colorKeys = [];
          const addSticker = (nx, ny, nz, color, faceKey) => {
            const geo = new THREE.PlaneGeometry(stickerSize, stickerSize);
            const mat = new THREE.MeshStandardMaterial({
              color,
              roughness: 0.32,
              metalness: 0.04,
              emissive: 0x000000,
              emissiveIntensity: 0,
              side: THREE.DoubleSide,
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
            sticker.userData.colorHex = color;
            sticker.userData.faceKey = faceKey;
            cubie.add(sticker);
            colorKeys.push(faceKey);
          };

          if (x === 1) addSticker(1, 0, 0, COLORS.R, 'R');
          if (x === -1) addSticker(-1, 0, 0, COLORS.L, 'L');
          if (y === 1) addSticker(0, 1, 0, COLORS.U, 'U');
          if (y === -1) addSticker(0, -1, 0, COLORS.D, 'D');
          if (z === 1) addSticker(0, 0, 1, COLORS.F, 'F');
          if (z === -1) addSticker(0, 0, -1, COLORS.B, 'B');

          cubie.userData.colorKeys = colorKeys.slice();
          if (cubie.userData.kind === 'center') {
            cubie.userData.centerFace = colorKeys[0];
          }

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
    this.clearTargets();
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

  findCenters() {
    return this.cubies.filter((c) => c.userData.kind === 'center');
  }

  findEdgesWithColor(colorKey) {
    return this.cubies.filter(
      (c) => c.userData.kind === 'edge' && (c.userData.colorKeys || []).includes(colorKey)
    );
  }

  findCornersWithColor(colorKey) {
    return this.cubies.filter(
      (c) => c.userData.kind === 'corner' && (c.userData.colorKeys || []).includes(colorKey)
    );
  }

  findEquatorEdges() {
    // 中間層四條邊：冇白（U）亦冇黃（D）
    return this.cubies.filter((c) => {
      if (c.userData.kind !== 'edge') return false;
      const keys = c.userData.colorKeys || [];
      return !keys.includes('U') && !keys.includes('D');
    });
  }

  findLastLayerPieces() {
    // 頂層相關：黃邊 + 黃角（OLL/PLL 焦點）
    const edges = this.findEdgesWithColor('D');
    const corners = this.findCornersWithColor('D');
    return edges.concat(corners);
  }

  resolveHighlightSpec(spec) {
    if (!spec) return [];
    switch (spec.type) {
      case 'centers':
        return this.findCenters();
      case 'edges-with':
        return this.findEdgesWithColor(spec.colorKey || 'U');
      case 'corners-with':
        return this.findCornersWithColor(spec.colorKey || 'U');
      case 'equator-edges':
        return this.findEquatorEdges();
      case 'last-layer':
        return this.findLastLayerPieces();
      default:
        return [];
    }
  }

  _clearFaceOverlay() {
    if (this.highlightMesh) {
      this.group.remove(this.highlightMesh);
      this.highlightMesh.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
      this.highlightMesh = null;
    }
  }

  _clearAllEmissive() {
    for (const c of this.cubies) {
      c.traverse((obj) => {
        if (obj.isMesh && obj.material && obj.material.emissive) {
          obj.material.emissive.setHex(0x000000);
          obj.material.emissiveIntensity = 0;
        }
      });
    }
  }

  _clearHighlight() {
    this._clearFaceOverlay();
    this._clearAllEmissive();
  }

  _applyTargetGlow() {
    // Target arrows identify pieces without changing the stickers' actual colors.
  }

  clearTargets() {
    this._removeTargetLabels();
    this._removeTargetArrows();
    this.targetCubies = [];
    this.targetPulse = 0;
    this.keepTargetsDuringMove = false;
    this.targetGlowColorKey = null;
    // only clear emissive if no face overlay active mid-move — safe full clear of sticker glow
    this._clearAllEmissive();
  }

  _removeTargetLabels() {
    for (const s of this.targetLabelSprites) {
      if (s.parent) s.parent.remove(s);
      if (s.material) {
        if (s.material.map) s.material.map.dispose();
        s.material.dispose();
      }
    }
    this.targetLabelSprites = [];
  }

  _removeTargetArrows() {
    for (const a of this.targetArrows) {
      if (a.parent) a.parent.remove(a);
      a.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }
    this.targetArrows = [];
  }

  _makeLabelSprite(text, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#' + (colorHex >>> 0).toString(16).padStart(6, '0');
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 66);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.55, 0.55, 0.55);
    sprite.renderOrder = 10;
    return sprite;
  }

  /** Orange/gold 3D arrow (cone tip + thin shaft). Default local +Y = tip direction. */
  _makeTargetArrow() {
    const g = new THREE.Group();
    g.userData.isTargetArrow = true;
    const shaftMat = new THREE.MeshBasicMaterial({
      color: 0xff9a2e,
      transparent: true,
      opacity: 0.95,
      depthTest: true,
      depthWrite: false,
    });
    const tipMat = new THREE.MeshBasicMaterial({
      color: 0xffd36a,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: false,
    });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 8), shaftMat);
    shaft.position.y = -0.14;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.2, 12), tipMat);
    tip.position.y = 0.1;
    g.add(shaft);
    g.add(tip);
    g.scale.setScalar(0.48);
    g.renderOrder = 12;
    // Don't participate in any future picking; OrbitControls uses pointer drag on canvas anyway
    g.traverse((o) => {
      o.raycast = () => {};
    });
    return g;
  }

  highlightTargets(cubies, opts = {}) {
    this.clearTargets();
    this.targetCubies = (cubies || []).slice();
    this.targetGlowColor = opts.glowColor != null ? opts.glowColor : 0xffcc66;
    this.targetGlowColorKey = opts.colorKey || null;
    this.keepTargetsDuringMove = true;
    this._showLabels = !!opts.labels;
    this._applyTargetGlow(0.7);

    if (opts.labels) {
      for (const c of this.targetCubies) {
        if (c.userData.kind !== 'center') continue;
        const faceKey = c.userData.centerFace;
        const label = COLOR_LABEL[faceKey] || faceKey;
        const colorHex = COLORS[faceKey] || 0xffffff;
        const sprite = this._makeLabelSprite(label, colorHex);
        sprite.userData.followCubie = c;
        this.group.add(sprite);
        this.targetLabelSprites.push(sprite);
      }
    }

    // Arrows for every highlight type (centers, edges, corners, equator, last-layer)
    for (const c of this.targetCubies) {
      const arrow = this._makeTargetArrow();
      arrow.userData.followCubie = c;
      this.group.add(arrow);
      this.targetArrows.push(arrow);
    }
    this._updateTargetIndicators();
  }

  /** World-accurate follow so indicators stay correct while a face is mid-pivot. */
  _cubieLocalPos(cubie, out = new THREE.Vector3()) {
    cubie.updateMatrixWorld(true);
    cubie.getWorldPosition(out);
    this.group.worldToLocal(out);
    return out;
  }

  _updateTargetIndicators() {
    const tmp = new THREE.Vector3();
    const yAxis = new THREE.Vector3(0, 1, 0);
    const inward = new THREE.Vector3();

    for (const sprite of this.targetLabelSprites) {
      const c = sprite.userData.followCubie;
      if (!c || !c.parent) continue;
      this._cubieLocalPos(c, tmp);
      const outward = tmp.clone();
      if (outward.lengthSq() < 1e-6) outward.set(0, 1, 0);
      else outward.normalize();
      sprite.position.copy(tmp).addScaledVector(outward, 1.05);
    }

    for (const arrow of this.targetArrows) {
      const c = arrow.userData.followCubie;
      if (!c || !c.parent) continue;
      this._cubieLocalPos(c, tmp);
      const outward = tmp.clone();
      if (outward.lengthSq() < 1e-6) outward.set(0, 1, 0);
      else outward.normalize();
      // Tip near cubie surface, shaft floats outside; arrow points inward at the piece
      arrow.position.copy(tmp).addScaledVector(outward, 1.15);
      inward.copy(outward).negate();
      arrow.quaternion.setFromUnitVectors(yAxis, inward);
    }
  }

  updateTargetPulse(dt) {
    if (!this.targetCubies.length) return;
    this.targetPulse += dt;
    const wave = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(this.targetPulse * 3.2));
    this._applyTargetGlow(wave);
    if (this.targetLabelSprites.length || this.targetArrows.length) {
      this._updateTargetIndicators();
    }
  }

  _highlightFace(face, turns = 1) {
    this._clearFaceOverlay();
    const { axis, dir } = FACE_AXES[face];
    const outward = new THREE.Vector3(axis === 'x' ? dir : 0, axis === 'y' ? dir : 0, axis === 'z' ? dir : 0);
    const overlay = new THREE.Group();
    // The local +Z axis points out of the face. Negative angles are clockwise
    // when looking directly at it, matching the cube's turn convention.
    overlay.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward);
    overlay.position.copy(outward).multiplyScalar(1.64);
    const corners = [
      new THREE.Vector3(-1.59, -1.59, 0), new THREE.Vector3(1.59, -1.59, 0),
      new THREE.Vector3(1.59, 1.59, 0), new THREE.Vector3(-1.59, 1.59, 0),
    ];
    const frame = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(corners),
      new THREE.LineBasicMaterial({ color: 0x8fe4ff })
    );
    overlay.add(frame);

    const start = Math.PI * 0.75;
    const sweep = turns === 2 ? -Math.PI : turns === -1 ? Math.PI / 2 : -Math.PI / 2;
    const radius = 2.02;
    const points = [];
    for (let i = 0; i <= 32; i++) {
      const angle = start + sweep * i / 32;
      points.push(new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xb2ecff });
    overlay.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.035, 8, false), arrowMaterial));
    const arrowhead = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 12), arrowMaterial.clone());
    arrowhead.position.copy(points[points.length - 1]);
    const end = start + sweep;
    const direction = Math.sign(sweep);
    const tangent = new THREE.Vector3(-Math.sin(end) * direction, Math.cos(end) * direction, 0);
    arrowhead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    overlay.add(arrowhead);
    this.group.add(overlay);
    this.highlightMesh = overlay;
  }

  enqueue(move, { record = true, silent = false, teaching = false } = {}) {
    const m = typeof move === 'string' ? parseMove(move) : move;
    if (!m) return;
    this.queue.push({ type: 'move', move: m, record, silent, teaching });
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

  _animateMove(move, { record, silent, teaching }) {
    this.animating = true;
    if (!silent) setStatus('扭緊：' + move.notation, true);
    this._highlightFace(move.face, move.turns);

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

    const duration = (teaching ? (move.turns === 2 ? 2200 : 1700) : (move.turns === 2 ? 400 : 300)) / this.speed;
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
        this._clearFaceOverlay();
        if (this.keepTargetsDuringMove && this.targetCubies.length) {
          this._applyTargetGlow(0.65);
        } else {
          this._clearAllEmissive();
        }
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
    this.enqueueCallback(() => setStatus('打亂完成 — 撳「由頭播教學」對住呢粒亂魔方聽'));
  }

  busy() {
    return this.animating || this.queue.length > 0;
  }
}


/* ========== 教學旁白與字幕 ========== */
let currentAudio = null;
let audioUrl = null;
let audioResolve = null;
let ttsController = null;
let voiceGeneration = 0;
let captionTimer = null;
let captionAbort = false;

function setVoiceStatus(msg) {
  const status = document.getElementById('voice-status');
  if (status) status.textContent = msg;
}

function splitSentences(script) {
  const raw = String(script || '').trim();
  if (!raw) return [];
  const parts = raw
    .split(/(?<=[。！？])\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length) return parts;
  return [raw];
}

let captionResolve = null;
let captionGeneration = 0;

function clearCaptions() {
  captionAbort = true;
  captionGeneration++;
  if (captionResolve) {
    const resolve = captionResolve;
    captionResolve = null;
    resolve();
  }
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
  const generation = captionGeneration;
  cur.classList.add('is-fading');
  window.setTimeout(() => {
    if (captionAbort || generation !== captionGeneration) return;
    cur.textContent = text;
    cur.classList.remove('is-fading');
  }, 160);
}

/** Reading-pace TV captions (no audio duration needed). */
function runCaptions(script) {
  clearCaptions();
  captionAbort = false;
  const sentences = splitSentences(script);
  if (!sentences.length) return Promise.resolve();

  return new Promise((resolve) => {
    captionResolve = resolve;
    const generation = captionGeneration;
    let i = 0;
    const tick = () => {
      if (generation !== captionGeneration) return;
      if (captionAbort || lessonAbort) {
        clearCaptions();
        resolve();
        return;
      }
      if (i >= sentences.length) {
        captionResolve = null;
        resolve();
        return;
      }
      showCaptionPair(sentences, i);
      const s = sentences[i];
      const ms = Math.min(9000, Math.max(2600, s.length * 130 + 1400));
      i += 1;
      captionTimer = setTimeout(tick, ms);
    };
    tick();
  });
}

function stopVoice() {
  voiceGeneration++;
  if (ttsController) ttsController.abort();
  ttsController = null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.removeAttribute('src');
    currentAudio = null;
  }
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = null;
  if (audioResolve) {
    const resolve = audioResolve;
    audioResolve = null;
    resolve();
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  clearCaptions();
  setVoiceStatus('');
}

async function playCantoneseVoice(script, generation) {
  const controller = new AbortController();
  ttsController = controller;
  setVoiceStatus('正在準備粵語旁白…');
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: script }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('TTS unavailable');
    const blob = await response.blob();
    if (generation !== voiceGeneration) return;
    audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    await new Promise((resolve, reject) => {
      audioResolve = resolve;
      audio.onended = resolve;
      audio.onerror = () => reject(new Error('Audio playback failed'));
      audio.play().then(() => { if (generation === voiceGeneration) setVoiceStatus('粵語旁白播放中'); }).catch(reject);
    });
    if (generation === voiceGeneration) setVoiceStatus('粵語旁白已播放');
    return;
  } catch (error) {
    if (generation !== voiceGeneration || error.name === 'AbortError') return;
  } finally {
    if (generation === voiceGeneration) {
      ttsController = null;
      audioResolve = null;
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioUrl = null;
      currentAudio = null;
    }
  }

  if (!('speechSynthesis' in window)) {
    setVoiceStatus('粵語旁白無法使用，請設定 Fish Audio');
    return;
  }
  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  if (!voices.length) {
    await new Promise((resolve) => {
      let timer;
      const ready = () => { clearTimeout(timer); synth.removeEventListener('voiceschanged', ready); resolve(); };
      synth.addEventListener('voiceschanged', ready);
      timer = setTimeout(ready, 1500);
    });
    voices = synth.getVoices();
  }
  if (generation !== voiceGeneration) return;
  const voice = voices.find((v) => /^yue([_-]|$)/i.test(v.lang) || /cantonese|粵語|粤语/i.test(v.name)) ||
    voices.find((v) => /^zh[-_]HK$/i.test(v.lang));
  if (!voice) {
    setVoiceStatus('找不到粵語語音，請設定 Fish Audio 或安裝裝置粵語語音');
    return;
  }
  await new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    audioResolve = resolve;
    const startTimer = setTimeout(() => {
      if (generation === voiceGeneration) {
        setVoiceStatus('裝置語音無法開始，請檢查瀏覽器語音設定或設定 Fish Audio');
        synth.cancel();
      }
      resolve();
    }, 8000);
    utterance.onend = () => { clearTimeout(startTimer); resolve(); };
    utterance.onstart = () => { clearTimeout(startTimer); if (generation === voiceGeneration) setVoiceStatus('裝置粵語旁白播放中'); };
    utterance.onerror = () => { clearTimeout(startTimer); if (generation === voiceGeneration) setVoiceStatus('粵語旁白播放失敗'); resolve(); };
    setVoiceStatus('準備裝置粵語語音…');
    synth.speak(utterance);
  });
  if (generation === voiceGeneration) audioResolve = null;
}

async function playCommentary(script, _cacheKey, opts = {}) {
  if (!script || !String(script).trim()) return;
  stopVoice();
  const generation = voiceGeneration;
  const captions = opts.captions !== false ? runCaptions(script) : Promise.resolve();
  const voice = opts.voice === false ? Promise.resolve() : playCantoneseVoice(script, generation);
  await Promise.all([captions, voice]);
}

function currentStepScript() {
  const c = STEP_COMMENTARY[currentStep];
  return c ? c.script : STEPS[currentStep].desc;
}

function playCurrentStepVoice() {
  const c = STEP_COMMENTARY[currentStep];
  const id = c ? c.id : 'step-' + (currentStep + 1);
  return playCommentary(currentStepScript(), id, { captions: true });
}

function waitCubeIdle(timeoutMs = 20000) {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = () => {
      if (!cube || !cube.busy()) return resolve();
      if (performance.now() - start > timeoutMs) return resolve();
      setTimeout(tick, 40);
    };
    tick();
  });
}

function showTargetBadge(text) {
  const el = document.getElementById('target-badge');
  if (!el) return;
  if (!text) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.textContent = text;
  el.hidden = false;
}

function hideTargetBadge() {
  showTargetBadge('');
}

function applyStepHighlights(step) {
  if (!cube || !step) return;
  const list = cube.resolveHighlightSpec(step.highlight);
  cube.highlightTargets(list, {
    labels: !!(step.highlight && step.highlight.labels),
    glowColor: 0xffb84d,
    colorKey: step.highlight && step.highlight.colorKey ? step.highlight.colorKey : null,
  });
  showTargetBadge(step.targetLabel || '');
}

function clearStepHighlights() {
  if (cube) {
    cube.clearTargets();
    cube._clearFaceOverlay();
  }
  hideTargetBadge();
}

/** 播放單一階段，或從第一階段連續播放。 */
let playbackGeneration = 0;

function updatePlaybackControls(playing) {
  const stop = document.getElementById('btn-stop-all');
  const play = document.getElementById('btn-play-all');
  if (stop) stop.hidden = !playing;
  if (play) {
    play.disabled = playing;
    play.textContent = playing ? '教學播放中…' : '由頭播教學';
  }
}

async function startPlayback(index, continuous = false) {
  const generation = ++playbackGeneration;
  lessonAbort = true;
  stopVoice();
  document.getElementById('video-move').hidden = true;
  clearStepHighlights();
  courseRunning = true;
  updatePlaybackControls(true);
  currentStep = index;
  renderStep();
  setStatus('準備播放第 ' + (index + 1) + ' 階段…', true);

  // 讓正在進行的轉動完成，再切換段落，避免破壞魔方狀態。
  await waitCubeIdle();
  if (generation !== playbackGeneration) return;
  lessonAbort = false;
  try {
    const end = continuous ? STEPS.length : index + 1;
    for (let i = index; i < end; i++) {
      if (generation !== playbackGeneration) return;
      currentStep = i;
      renderStep();
      const step = STEPS[i];
      // 白十字後以黃色朝上、綠色朝前，公式的方向以這個握法為準。
      cube.group.rotation.z = i >= 2 ? Math.PI : 0;
      applyStepHighlights(step);
      setStatus('播放第 ' + (i + 1) + ' 階段：' + step.title, true);
      const captions = playCurrentStepVoice();
      const videoMove = document.getElementById('video-move');
      const faceNames = { R: '右面', L: '左面', U: '上面', D: '下面', F: '前面', B: '後面' };
      const purposes = [
        ['認識右、上、前各面的轉動方向，為後續步驟做準備。'],
        ['將已對準的白邊翻到白色中心旁，建立白十字。', '把白邊移到方便重新對齊的位置。'],
        ['將白角移入第一層，讓白面與側面顏色對齊。', '從左側練習將白角移入第一層。'],
        ['把頂層邊塊插入右側的中間層位置。', '把頂層邊塊插入左側的中間層位置。'],
        ['調整頂層邊塊的朝向，讓黃色邊形成十字。'],
        ['調整頂層角塊的朝向，讓黃色朝上。', '從另一種魚形方向調整黃色角塊。', '練習角塊轉動，為後續調整做準備。'],
        ['調整頂層角塊的位置，讓側面顏色對齊。', '循環調整頂層邊塊的位置，完成側面對齊。'],
      ];
      const examples = i === 0
        ? [{ name: '認識轉面', moves: step.liveDemoMoves }]
        : step.algos;
      for (const [exampleIndex, example] of examples.entries()) {
        if (generation !== playbackGeneration) break;
        const moves = parseAlgorithm(example.moves);
        const mapMove = (move) => {
          if (i < 2) return move;
          const face = { U: 'D', D: 'U', R: 'L', L: 'R', F: 'F', B: 'B' }[move.face];
          return { ...move, face };
        };
        if (i !== 0) {
          // 每條公式建立可重現的示範狀態，避免把任意亂序誤當成解題實例。
          clearStepHighlights();
          cube.reset();
          videoMove.hidden = false;
          videoMove.textContent = '準備公式示範：' + example.name;
          for (const move of [...moves].reverse().map(invertMove).map(mapMove)) {
            if (generation !== playbackGeneration) break;
            await animateMovePromise(move, true);
          }
          if (generation === playbackGeneration) applyStepHighlights(step);
        }
        for (let j = 0; j < moves.length; j++) {
          if (generation !== playbackGeneration) break;
          const move = moves[j];
          const direction = move.turns === 2 ? '轉半圈' : move.turns === -1 ? '逆時針轉 90°' : '順時針轉 90°';
          videoMove.hidden = false;
          videoMove.replaceChildren();
          const how = document.createElement('strong');
          how.textContent = `第 ${j + 1} / ${moves.length} 步：${faceNames[move.face]}${direction}（${move.notation}）`;
          const rule = document.createElement('span');
          rule.textContent = (i >= 2 ? '黃上、綠前。' : '白上、綠前。') + '正對要轉的面判斷方向；淺藍彎箭頭標示轉向；橘色箭頭指向目標方塊。';
          const why = document.createElement('span');
          why.textContent = '為什麼要依序轉？' + purposes[i][exampleIndex] + '請完成整組動作，再觀察變化。';
          videoMove.append(how, rule, why);
          const actualMove = mapMove(move);
          cube._highlightFace(actualMove.face, actualMove.turns);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (generation !== playbackGeneration) break;
          await animateMovePromise(actualMove, true, true);
          await new Promise((resolve) => setTimeout(resolve, 1100));
        }
      }
      if (generation === playbackGeneration) videoMove.hidden = true;
      await captions;
      if (generation !== playbackGeneration) return;
      clearStepHighlights();
    }
    setStatus(continuous ? '所有階段播放完畢' : '本階段播放完畢，選擇其他階段繼續');
  } finally {
    if (generation === playbackGeneration) {
      courseRunning = false;
      updatePlaybackControls(false);
      clearStepHighlights();
    }
  }
}

function playStepLesson() {
  return startPlayback(currentStep);
}

function playFullCourse() {
  setMode('teach');
  return startPlayback(0, true);
}

function stopFullCourse() {
  playbackGeneration++;
  lessonAbort = true;
  courseRunning = false;
  stopVoice();
  document.getElementById('video-move').hidden = true;
  clearStepHighlights();
  updatePlaybackControls(false);
  lessonAbort = false;
  setStatus('已停止教學，魔方保持目前狀態');
}

function maybeAutoplayStepVoice() {
  // Manual play only (browser autoplay policies)
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
  camera.position.set(6.2, 5.0, 7.4);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  viewport.insertBefore(renderer.domElement, viewport.firstChild);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.8;
  controls.maxDistance = 16;
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
  const fill = new THREE.DirectionalLight(0xffffff, 0.28);
  fill.position.set(-4, 2, -3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfff4e8, 0.12);
  rim.position.set(2, -3, -5);
  scene.add(rim);

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
  let dist = narrow ? (portrait ? 8.8 : 9.5) : 10.5;
  if (narrow && portrait && h < 700) dist = 8.4;
  if (narrow && portrait && h >= 740) dist = 8.6;
  // The horizontal field of view narrows on a phone; keep all three faces visible.
  if (narrow && portrait) dist = Math.max(dist, 6.5 / (w / h));
  if (narrow && !portrait && window.matchMedia('(orientation: portrait)').matches) dist = 6.8;
  const dir = camera.position.clone().sub(controls.target).normalize();
  if (dir.lengthSq() < 1e-6) dir.set(0.55, 0.45, 0.7).normalize();
  camera.position.copy(controls.target).addScaledVector(dir, dist);
  camera.fov = narrow ? 46 : 48;
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

let _lastPulseTs = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(0.05, (now - _lastPulseTs) / 1000);
  _lastPulseTs = now;
  if (cube) cube.updateTargetPulse(dt);
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
  document.getElementById('step-title').textContent = '階段 ' + (currentStep + 1) + '：' + step.title;
  document.getElementById('video-stage-title').textContent = '階段 ' + (currentStep + 1) + ' · ' + step.title;
  document.getElementById('step-desc').textContent = step.desc;
  const orientation = document.getElementById('orientation-note');
  orientation.textContent = currentStep >= 2 ? '實體魔方：白色朝下、黃色朝上。畫面中的方向仍以固定的白上、綠前為準；拖曳畫面只會改變視角。' : '握法：白色朝上、綠色朝前。畫面可拖曳旋轉視角。';

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
    const moves = parseAlgorithm(algo.moves);
    const guide = document.createElement('div');
    guide.className = 'move-guide';
    guide.innerHTML = '<p class="move-guide-hint">依序操作；方向以正面看著要轉的那一面為準。按按鈕可讓畫面中的魔方轉一步。</p><ol class="move-guide-list"></ol><button type="button" class="move-guide-next">執行第 1 步</button><p class="move-guide-status" aria-live="polite"></p>';
    const moveList = guide.querySelector('ol');
    const next = guide.querySelector('button');
    const progress = guide.querySelector('.move-guide-status');
    const faceNames = { R: '右面', L: '左面', U: '上面', D: '下面', F: '前面', B: '後面' };
    const items = moves.map((move, index) => {
      const item = document.createElement('li');
      const direction = move.turns === 2 ? '轉 180°（半圈）' : move.turns === -1 ? '逆時針轉 90°' : '順時針轉 90°';
      item.textContent = `${index + 1}. ${move.notation}｜${faceNames[move.face]}${direction}`;
      moveList.appendChild(item);
      return item;
    });
    let position = 0;
    const updateGuide = () => {
      items.forEach((item, index) => {
        item.classList.toggle('current', index === position);
        item.classList.toggle('done', index < position);
      });
      next.textContent = position < moves.length ? `執行第 ${position + 1} 步` : '再做一次';
      progress.textContent = position < moves.length ? `下一步：${items[position].textContent}` : '公式完成；確認方塊位置後再繼續。';
    };
    next.addEventListener('click', async () => {
      if (demoRunning || courseRunning || cube.busy()) {
        setStatus('請等目前動作完成');
        return;
      }
      if (position === moves.length) position = 0;
      next.disabled = true;
      await animateMovePromise(moves[position], false);
      position++;
      updateGuide();
      next.disabled = false;
    });
    updateGuide();
    box.appendChild(guide);
    const actions = box.querySelector('.algo-actions');
    const demoBtn = document.createElement('button');
    demoBtn.type = 'button';
    demoBtn.textContent = '從還原狀態示範';
    demoBtn.title = '示範會先將畫面中的魔方還原';
    demoBtn.addEventListener('click', () => runAlgoDemo(algo.moves, []));
    const listenBtn = document.createElement('button');
    listenBtn.type = 'button';
    listenBtn.textContent = '字幕＋示範';
    const algoIdx = step.algos.indexOf(algo);
    listenBtn.addEventListener('click', () => {
      if (courseRunning || demoRunning || cube.busy()) {
        setStatus('請先停止或等目前教學完成');
        return;
      }
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
    li.innerHTML = '<button type="button"><span class="num"></span><span class="txt"></span></button>';
    if (i === currentStep) li.querySelector('button').setAttribute('aria-current', 'step');
    li.querySelector('.num').textContent = String(i + 1);
    li.querySelector('.txt').textContent = s.title;
    li.querySelector('button').addEventListener('click', () => {
      startPlayback(i);
    });
    ul.appendChild(li);
  });
  if (window.matchMedia('(max-width: 900px)').matches) {
    const selected = ul.querySelector('.current');
    if (selected) ul.scrollLeft = selected.offsetLeft - ul.offsetLeft - (ul.clientWidth - selected.offsetWidth) / 2;
  }
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
    listen.textContent = '字幕＋示範';
    listen.addEventListener('click', () => {
      if (courseRunning || demoRunning || cube.busy()) {
        setStatus('請先停止或等目前教學完成');
        return;
      }
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
  if (demoRunning || courseRunning || cube.busy()) {
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

function animateMovePromise(move, silent, teaching = false) {
  return new Promise((resolve) => {
    cube.enqueue(move, { record: true, silent, teaching });
    cube.enqueueCallback(resolve);
  });
}

async function runStepDemo() {
  // 對準而家亂魔方播教學（唔 reset）
  return playStepLesson();
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
      startPlayback(currentStep - 1);
    }
  });
  document.getElementById('btn-next').addEventListener('click', () => {
    if (currentStep < STEPS.length - 1) {
      startPlayback(currentStep + 1);
    }
  });
  document.getElementById('btn-demo').addEventListener('click', () => playStepLesson());
  const listenBtn = document.getElementById('btn-listen');
  if (listenBtn) listenBtn.addEventListener('click', () => playStepLesson());
  const playAllBtn = document.getElementById('btn-play-all');
  if (playAllBtn) playAllBtn.addEventListener('click', () => playFullCourse());
  const stopAllBtn = document.getElementById('btn-stop-all');
  if (stopAllBtn) stopAllBtn.addEventListener('click', () => stopFullCourse());
  const showPad = document.getElementById('show-move-pad');
  const movePad = document.getElementById('move-pad');
  if (showPad && movePad) {
    showPad.addEventListener('change', () => {
      if (showPad.checked) movePad.removeAttribute('hidden');
      else movePad.setAttribute('hidden', '');
    });
  }
  document.body.classList.add('listen-first');

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
      startPlayback(currentStep - 1);
    }
    e.preventDefault();
    return;
  }
  if (key === ']') {
    if (currentStep < STEPS.length - 1) {
      startPlayback(currentStep + 1);
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
    if (demoRunning || courseRunning) {
      stopFullCourse();
    } else {
      playFullCourse();
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
setStatus('已隨機打亂 — 撳「由頭播教學」：字幕、標示與粵語旁白');
// 頁面載入時先顯示字幕，按下播放後才開始語音。
playCommentary(INTRO_COMMENTARY, 'intro', { captions: true, voice: false });
