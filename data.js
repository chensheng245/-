/* ことばの森 — JLPT N5–N2 场景词汇数据 */

const LEVELS = [
  {
    id: 'N5',
    jp: 'はじまり',
    zh: '入门',
    desc: '10 章 50 小节，从自我介绍到健康表达。',
    accent: '#2F6652',
    soft: '#E4EFE8'
  },
  {
    id: 'N4',
    jp: 'ひろがる',
    zh: '基础',
    desc: '8 章 38 小节，学校、工作、旅行与日常表达。',
    accent: '#3D6B84',
    soft: '#E3EDF3'
  },
  {
    id: 'N3',
    jp: 'こなれる',
    zh: '进阶',
    desc: '12 章 59 小节，覆盖生活、工作、新闻与心情。',
    accent: '#9A6638',
    soft: '#F3EBDD'
  },
  {
    id: 'N2',
    jp: 'ふかまる',
    zh: '高阶',
    desc: '12 章 60 小节，覆盖生活、职场、新闻与惯用表达。',
    accent: '#8A4D50',
    soft: '#F3E5E5'
  }
];

const SCENES = [
  {
    id: 'greetings',
    jp: 'あいさつ',
    zh: '日常问候',
    desc: '见面、道别与礼貌回应',
    color: '#C26142',
    soft: '#F6E4DA'
  },
  {
    id: 'food',
    jp: 'たべもの',
    zh: '饮食餐桌',
    desc: '食材、味道与用餐',
    color: '#B07B2F',
    soft: '#F5ECD8'
  },
  {
    id: 'shopping',
    jp: 'かいもの',
    zh: '购物消费',
    desc: '价格、付款与退换',
    color: '#A5556D',
    soft: '#F4E4E9'
  },
  {
    id: 'travel',
    jp: 'たび・交通',
    zh: '出行交通',
    desc: '交通、住宿与观光',
    color: '#416D8D',
    soft: '#E2ECF3'
  },
  {
    id: 'study',
    jp: '学校・仕事',
    zh: '学习工作',
    desc: '课堂、职场与任务',
    color: '#4F7256',
    soft: '#E5EEE4'
  },
  {
    id: 'nature',
    jp: '天気・自然',
    zh: '天气自然',
    desc: '季节、气候与自然',
    color: '#5E8767',
    soft: '#E7EFE6'
  },
  {
    id: 'health',
    jp: 'からだ・健康',
    zh: '身体健康',
    desc: '症状、就医与养生',
    color: '#B45B51',
    soft: '#F6E4E0'
  },
  {
    id: 'feelings',
    jp: 'きもち',
    zh: '心情感受',
    desc: '情绪、判断与内心',
    color: '#84658A',
    soft: '#EFE7F0'
  }
];

const VOCAB = [
  /* ── N5（来自 n5.docx 的完整词库，见 n5-data.js） ── */
  ...N5_WORDS,

  /* ── N4（来自 n4.docx 的完整词库，见 n4-data.js） ── */
  ...N4_WORDS,

  /* ── N3（来自 n3.docx 的完整词库，见 n3-data.js） ── */
  ...N3_WORDS,

  /* ── N2（来自 n2.docx 的完整词库，见 n2-data.js） ── */
  ...N2_WORDS

];
