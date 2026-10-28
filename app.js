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
    desc: '而家睇吓要搵邊啲塊：標咗四粒白角。將白角擺到右前上方，重覆 R U R\' U\' 直到角落位。左邊可用 L\' U\' L U。',
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
    this.targetGlowColor = 0xffcc66;
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
      this.highlightMesh.geometry.dispose();
      this.highlightMesh.material.dispose();
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

  _applyTargetGlow(intensity) {
    const glow = this.targetGlowColor;
    for (const c of this.targetCubies) {
      if (!c || !c.parent) continue;
      c.traverse((obj) => {
        if (obj.userData && obj.userData.isSticker && obj.material && obj.material.emissive) {
          obj.material.emissive.setHex(glow);
          obj.material.emissiveIntensity = intensity;
        }
      });
    }
  }

  clearTargets() {
    this._removeTargetLabels();
    this.targetCubies = [];
    this.targetPulse = 0;
    this.keepTargetsDuringMove = false;
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

  highlightTargets(cubies, opts = {}) {
    this.clearTargets();
    this.targetCubies = (cubies || []).slice();
    this.targetGlowColor = opts.glowColor != null ? opts.glowColor : 0xffcc66;
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
      this._updateLabelPositions();
    }
  }

  _updateLabelPositions() {
    for (const sprite of this.targetLabelSprites) {
      const c = sprite.userData.followCubie;
      if (!c || !c.parent) continue;
      const outward = c.position.clone();
      if (outward.lengthSq() < 1e-6) outward.set(0, 1, 0);
      else outward.normalize();
      sprite.position.copy(c.position).addScaledVector(outward, 0.95);
    }
  }

  updateTargetPulse(dt) {
    if (!this.targetCubies.length) return;
    this.targetPulse += dt;
    const wave = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(this.targetPulse * 3.2));
    this._applyTargetGlow(wave);
    if (this.targetLabelSprites.length) this._updateLabelPositions();
  }

  _highlightFace(face) {
    this._clearFaceOverlay();
    // During teaching targets, don't wipe target glow; only boost the turning face lightly
    if (!this.keepTargetsDuringMove) {
      this._clearAllEmissive();
    } else {
      this._applyTargetGlow(0.55);
    }
    for (const c of this._cubiesOnFace(face)) {
      c.traverse((obj) => {
        if (obj.userData.isSticker && obj.material) {
          // if this cubie is also a target, keep warm glow; else blue face cue
          const isTarget = this.targetCubies.indexOf(c) !== -1;
          if (!isTarget) {
            obj.material.emissive.setHex(0x5b8def);
            obj.material.emissiveIntensity = 0.45;
          }
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


/* ========== 粵語旁白（Fish Audio）＋電視字幕 ========== */
const ttsBlobCache = new Map(); // cacheKey -> objectURL
let currentAudio = null;
let ttsLoading = false;
let captionTimer = null;
let captionAbort = false;

function setVoiceStatus(msg) {
  const el = document.getElementById('voice-status');
  if (el) el.textContent = msg || '';
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
  cur.classList.add('is-fading');
  window.setTimeout(() => {
    if (captionAbort) return;
    cur.textContent = text;
    cur.classList.remove('is-fading');
  }, 160);
}

/** Reading-pace fallback when audio duration is unknown. */
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

function waitAudioDuration(audio, timeoutMs = 2500) {
  if (!audio) return Promise.resolve(NaN);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    return Promise.resolve(audio.duration);
  }
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      resolve(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : NaN);
    };
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) finish();
    };
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    setTimeout(finish, timeoutMs);
  });
}

/** Sync TV subtitles to audio duration (char-weighted); fall back to reading pace. */
async function runCaptionsWithAudio(script, audio) {
  clearCaptions();
  captionAbort = false;
  const sentences = splitSentences(script);
  if (!sentences.length) return;

  const duration = await waitAudioDuration(audio);
  if (!(duration > 0) || !Number.isFinite(duration)) {
    return runCaptions(script);
  }

  const weights = sentences.map((s) => Math.max(1, s.length));
  const total = weights.reduce((a, b) => a + b, 0);

  return new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (captionAbort || lessonAbort) {
        clearCaptions();
        resolve();
        return;
      }
      if (i >= sentences.length) {
        resolve();
        return;
      }
      showCaptionPair(sentences, i);
      const ms = Math.max(700, (weights[i] / total) * duration * 1000);
      i += 1;
      captionTimer = setTimeout(tick, ms);
    };
    tick();
  });
}

function stopVoice() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.removeAttribute('src');
      currentAudio.load();
    } catch (_) {}
    currentAudio = null;
  }
  ttsLoading = false;
  clearCaptions();
  const btn = document.getElementById('btn-listen');
  if (btn) {
    btn.classList.remove('playing');
    btn.disabled = false;
    btn.textContent = '再播呢步';
  }
  const stop = document.getElementById('btn-stop-voice');
  if (stop) stop.hidden = true;
  setVoiceStatus('');
}

async function fetchTtsBlob(script, cacheKey) {
  const key = cacheKey || script;
  if (ttsBlobCache.has(key)) return ttsBlobCache.get(key);

  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: script, id: key }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j.error || j.code || '';
    } catch (_) {
      detail = await res.text().catch(() => '');
    }
    const err = new Error(detail || ('TTS HTTP ' + res.status));
    err.status = res.status;
    throw err;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  ttsBlobCache.set(key, url);
  if (ttsBlobCache.size > 40) {
    const first = ttsBlobCache.keys().next().value;
    const old = ttsBlobCache.get(first);
    ttsBlobCache.delete(first);
    try { URL.revokeObjectURL(old); } catch (_) {}
  }
  return url;
}

/**
 * Play Cantonese commentary via Fish Audio.
 * @param {string} script
 * @param {string} cacheKey
 * @param {{ captions?: boolean }} [opts] captions default true
 */
async function playCommentary(script, cacheKey, opts = {}) {
  if (!script || !String(script).trim()) {
    setStatus('呢段冇旁白稿');
    return;
  }
  const withCaptions = opts.captions !== false;
  stopVoice();
  ttsLoading = true;
  const btn = document.getElementById('btn-listen');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '產生緊…';
  }
  setVoiceStatus('呼叫粵語旁白中…');
  setStatus('產生粵語旁白中…', true);

  let captionPromise = Promise.resolve();
  try {
    const url = await fetchTtsBlob(script, cacheKey);
    if (lessonAbort && !courseRunning) {
      ttsLoading = false;
      return;
    }
    const audio = new Audio(url);
    currentAudio = audio;
    ttsLoading = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = '教學中…';
      btn.classList.add('playing');
    }
    const stop = document.getElementById('btn-stop-voice');
    if (stop) stop.hidden = false;
    setVoiceStatus('播放緊粵語旁白');
    setStatus('播放粵語旁白中', true);

    if (withCaptions) {
      captionPromise = runCaptionsWithAudio(script, audio);
    }

    const playPromise = new Promise((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('音訊播放失敗'));
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(reject);
    });

    await Promise.all([playPromise, captionPromise]);
    setVoiceStatus('播放完成');
    if (!courseRunning) setStatus('旁白播放完成');
  } catch (err) {
    console.error(err);
    // Still show TV captions so teaching continues without audio
    if (withCaptions) {
      try { await runCaptions(script); } catch (_) {}
    }
    const msg =
      err.status === 503
        ? '旁白未設定：請喺伺服器設定 FISH_AUDIO_API_KEY'
        : '旁白失敗：' + (err.message || '未知錯誤') + '（改顯示文字）';
    setVoiceStatus(msg);
    setStatus(msg);
  } finally {
    ttsLoading = false;
    if (btn) {
      btn.classList.remove('playing');
      btn.disabled = false;
      btn.textContent = '再播呢步';
    }
    const stop = document.getElementById('btn-stop-voice');
    if (stop) stop.hidden = true;
    if (currentAudio) currentAudio = null;
  }
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
  });
  showTargetBadge(step.targetLabel || '');
}

function clearStepHighlights() {
  if (cube) cube.clearTargets();
  hideTargetBadge();
}

/** 對住而家畫面上嘅亂魔方：粵語旁白＋字幕＋標示要整邊粒（唔會 reset） */
async function playStepLesson() {
  if (demoRunning || (cube && cube.busy() && !courseRunning)) {
    if (!courseRunning) {
      setStatus('等而家嘅動作做完先', true);
      return;
    }
  }

  await waitCubeIdle();
  if (lessonAbort) return;

  const step = STEPS[currentStep];
  demoRunning = true;
  setStatus('播緊教學：' + step.title + '（對住而家呢粒亂魔方）', true);

  // Mark pieces on the *current* scramble — do not reset
  applyStepHighlights(step);

  const voicePromise = playCurrentStepVoice();

  try {
    await new Promise((r) => setTimeout(r, 320));
    if (lessonAbort) return;

    // Optional: short live demo on the same scramble (notation only etc.)
    const live = parseAlgorithm(step.liveDemoMoves || '');
    if (live.length) {
      for (const m of live) {
        if (!demoRunning || lessonAbort) break;
        await animateMovePromise(m, false);
        // re-assert targets after each move (cubies moved but same piece identities)
        applyStepHighlights(step);
      }
      setStatus('示意轉面完成 — 旁白繼續（仲係你呢粒亂魔方）');
    }
  } finally {
    demoRunning = false;
  }

  await voicePromise;
  if (!courseRunning) {
    // keep marks briefly so user can still look, then clear
    await new Promise((r) => setTimeout(r, 900));
    if (!courseRunning && !demoRunning) clearStepHighlights();
  }
}

async function playFullCourse() {
  if (courseRunning || demoRunning || (cube && cube.busy())) {
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
  setStatus('開始由頭播教學 — 粵語旁白＋字幕', true);

  try {
    await waitCubeIdle();
    if (lessonAbort) return;
    for (let i = 0; i < STEPS.length; i++) {
      if (lessonAbort) break;
      currentStep = i;
      renderStep();
      await playStepLesson();
      if (lessonAbort) break;
      clearStepHighlights();
      await new Promise((r) => setTimeout(r, 450));
    }
    if (!lessonAbort) setStatus('成套教學播完 — 可以再撳「由頭播教學」溫習呢粒亂魔方');
  } finally {
    courseRunning = false;
    clearStepHighlights();
    if (stopAll) stopAll.hidden = true;
    if (playAll) {
      playAll.disabled = false;
      playAll.textContent = '由頭播教學';
    }
    if (!lessonAbort) {
      setTimeout(() => {
        if (!courseRunning && !demoRunning && !currentAudio) clearCaptions();
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
  clearStepHighlights();
  // 唔 reset：旁白要對準你而家見到嘅亂魔方
  const stopAll = document.getElementById('btn-stop-all');
  const playAll = document.getElementById('btn-play-all');
  if (stopAll) stopAll.hidden = true;
  if (playAll) {
    playAll.disabled = false;
    playAll.textContent = '由頭播教學';
  }
  setStatus('已停止教學 — 魔方保持而家狀態');
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
  let dist = narrow ? (portrait ? 8.8 : 9.5) : 10.5;
  if (narrow && portrait && h < 700) dist = 8.4;
  if (narrow && portrait && h >= 740) dist = 8.6;
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
    lessonAbort = true;
    demoRunning = false;
    stopVoice();
    clearStepHighlights();
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
    if (currentAudio || ttsLoading || demoRunning || courseRunning) {
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
setStatus('已隨機打亂 — 撳「由頭播教學」：對住呢粒亂魔方講解同標示');
