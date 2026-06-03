/** 重点复习词汇：一级菜单 → 日期子菜单 → 词表 */
const REVIEW_FOCUS_GROUPS = [
  {
    id: "2025-05-16",
    label: "5月16日",
    words: [
      "sandwich",
      "peanut butter",
      "jelly",
      "first",
      "next",
      "last",
      "hot dog",
      "pan",
      "bun",
      "can",
      "spaghetti",
      "flour",
      "sugar",
      "are/is going to",
      "to make",
      "cook",
      "stir",
      "mix",
      "bake",
      "bread",
      "tell me how",
      "it",
      "Autumn",
      "fall",
      "winter",
      "spring",
      "summer",
    ],
  },
  {
    id: "2025-05-20",
    label: "5月20日",
    words: [
      "store",
      "Popsicle",
      "safety",
      "rules",
      "sidewalk",
      "crosswalk",
      "traffic lights",
      "handlebars",
      "pedals",
      "stop signs",
      "helmet",
      "traffic",
      "follow",
      "wait",
      "money",
    ],
  },
  {
    id: "2025-05-23",
    label: "5月23日",
    categoryId: "body",
  },
  {
    id: "2025-05-27",
    label: "5月27日",
    categoryId: "occupation",
  },
  {
    id: "2025-05-30",
    label: "5月30日",
    words: [
      "sleeping bags",
      "tent",
      "van",
      "horn",
      "siren",
      "ambulance",
      "police car",
      "railroad crossing",
      "pickup truck",
      "dump truck",
      "garbage truck",
      "almost",
      "campfire",
      "drive",
      "honk",
      "put up",
      "camping",
      "buckle up",
      "instruments",
      "note",
      "tambourine",
      "maracas",
      "triangle",
      "wood block",
      "cymbals",
    ],
  },
  {
    id: "2025-06-03",
    label: "6月3日",
    words: [
      "car",
      "comb",
      "corn",
      "cap",
      "candle",
      "collar",
      "can",
      "coat",
      "carrot",
      "cow",
      "elephant",
      "elbow",
      "egg",
      "elf",
      "elevator",
      "balloon",
      "doll",
      "dog",
      "bow",
      "bell",
      "cup",
      "shell",
      "ten",
      "fish",
      "web",
      "sock",
    ],
  },
];

/** 复习词中文（词表无 zh 或需覆盖时使用） */
const REVIEW_FOCUS_ZH = {
  "peanut butter": "花生酱",
  jelly: "果酱",
  first: "第一，首先",
  next: "下一个，接下来",
  last: "最后，上一个",
  "hot dog": "热狗",
  bun: "小圆面包，汉堡胚",
  spaghetti: "意大利面，意面",
  flour: "面粉",
  sugar: "糖",
  "are/is going to": "将要，打算（be going to）",
  "to make": "制作，去做",
  cook: "烹饪，煮",
  stir: "搅拌",
  mix: "混合",
  bake: "烘烤，烘焙",
  bread: "面包",
  "tell me how": "告诉我怎么做",
  it: "它",
  Autumn: "秋天（英式）",
  fall: "秋天（美式），落下",
  winter: "冬天",
  spring: "春天",
  summer: "夏天",
  store: "商店",
  Popsicle: "冰棒，冰棍",
  safety: "安全",
  rules: "规则",
  sidewalk: "人行道",
  crosswalk: "人行横道，斑马线",
  "traffic lights": "红绿灯，交通信号灯",
  handlebars: "（自行车）车把",
  pedals: "踏板，脚蹬",
  "stop signs": "停车标志",
  helmet: "头盔",
  traffic: "交通，车流",
  follow: "遵守，跟随",
  wait: "等待",
  money: "钱",
  corn: "玉米",
  collar: "衣领，项圈",
  elf: "小精灵，精灵",
  elevator: "电梯",
  "sleeping bags": "睡袋",
  tent: "帐篷",
  van: "面包车，厢式货车",
  horn: "（汽车）喇叭",
  siren: "警笛，警报器",
  ambulance: "救护车",
  "police car": "警车",
  "railroad crossing": "铁路道口",
  "pickup truck": "皮卡",
  "dump truck": "翻斗车，渣土车",
  "garbage truck": "垃圾车",
  almost: "几乎，差不多",
  campfire: "营火，篝火",
  drive: "驾驶，开车",
  honk: "按喇叭",
  "put up": "搭建，支起",
  camping: "露营",
  "buckle up": "系好安全带",
  instruments: "乐器（总称）",
  note: "音符",
  tambourine: "铃鼓",
  maracas: "沙锤",
  triangle: "三角形，三角铁",
  "wood block": "木鱼（打击乐）",
  cymbals: "钹，镲",
};

const REVIEW_FOCUS_EMOJI = {
  "peanut butter": "🥜",
  jelly: "🍇",
  first: "1️⃣",
  next: "➡️",
  last: "🔚",
  "hot dog": "🌭",
  bun: "🥯",
  spaghetti: "🍝",
  flour: "🌾",
  sugar: "🍬",
  "are/is going to": "🔜",
  "to make": "🛠️",
  cook: "👨‍🍳",
  stir: "🥄",
  mix: "🔄",
  bake: "🥧",
  bread: "🍞",
  "tell me how": "❓",
  it: "👆",
  Autumn: "🍂",
  fall: "🍁",
  winter: "❄️",
  spring: "🌸",
  summer: "☀️",
  store: "🏪",
  Popsicle: "🍦",
  safety: "🦺",
  rules: "📋",
  sidewalk: "🚶",
  crosswalk: "🚸",
  "traffic lights": "🚦",
  handlebars: "🚲",
  pedals: "🦶",
  "stop signs": "🛑",
  helmet: "⛑️",
  traffic: "🚗",
  follow: "👣",
  wait: "⏳",
  money: "💰",
  corn: "🌽",
  collar: "👔",
  elf: "🧝",
  elevator: "🛗",
  "sleeping bags": "🛏️",
  tent: "⛺",
  van: "🚐",
  horn: "📣",
  siren: "🚨",
  ambulance: "🚑",
  "police car": "🚓",
  "railroad crossing": "🚧",
  "pickup truck": "🛻",
  "dump truck": "🚛",
  "garbage truck": "🗑️",
  almost: "≈",
  campfire: "🔥",
  drive: "🚗",
  honk: "📯",
  "put up": "🏕️",
  camping: "🏕️",
  "buckle up": "💺",
  instruments: "🎸",
  note: "🎵",
  tambourine: "🪇",
  maracas: "🪇",
  triangle: "🔺",
  "wood block": "🪵",
  cymbals: "🥁",
};

/** 日期词表：显式 words，或按分类同步（与分类拼写一致） */
function getReviewFocusWords(group) {
  if (!group) return [];
  if (group.categoryId) {
    const out = [];
    for (let i = 0; i < VOCAB.length; i += 1) {
      const cats = VOCAB[i].category || [];
      if (cats.includes(group.categoryId)) out.push(VOCAB[i].word);
    }
    return out;
  }
  return group.words || [];
}

function vocabEntryByWord(word) {
  const idx = vocabIndexByWord(word);
  return idx >= 0 ? VOCAB[idx] : null;
}

function vocabIndexByWord(word) {
  const key = String(word).trim().toLowerCase();
  for (let i = 0; i < VOCAB.length; i += 1) {
    if (VOCAB[i].word.trim().toLowerCase() === key) return i;
  }
  return -1;
}

function buildReviewFocusSpellQueue(groupId) {
  const group = REVIEW_FOCUS_GROUPS.find((g) => g.id === groupId);
  if (!group) return [];
  const indices = [];
  getReviewFocusWords(group).forEach((w) => {
    const idx = vocabIndexByWord(w);
    if (idx >= 0) indices.push(idx);
  });
  return shuffleInPlace(indices);
}

function reviewFocusEntry(word) {
  const base = vocabEntryByWord(word);
  const zh =
    REVIEW_FOCUS_ZH[word] ||
    (base && base.zh && String(base.zh).trim()) ||
    "";
  const emoji = (base && base.emoji) || REVIEW_FOCUS_EMOJI[word] || "📖";
  const file = (base && base.file) || "";
  return {
    word,
    zh,
    file,
    emoji,
    vocabEntry: base,
  };
}
