import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'promptcubby.db');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const database = db;

  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT DEFAULT '📋',
      icon TEXT NOT NULL DEFAULT 'file',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS platforms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      delivery_method TEXT NOT NULL DEFAULT 'clipboard',
      url_template TEXT,
      color TEXT DEFAULT '#666',
      bg_color TEXT DEFAULT '#f0f0f0'
    );

    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prompt_platforms (
      prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
      platform_id INTEGER REFERENCES platforms(id) ON DELETE CASCADE,
      PRIMARY KEY (prompt_id, platform_id)
    );

    CREATE TABLE IF NOT EXISTS variables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_id INTEGER REFERENCES prompts(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      hint TEXT DEFAULT '',
      type TEXT DEFAULT 'text',
      options TEXT DEFAULT NULL,
      default_value TEXT DEFAULT '',
      required INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );
  `);

  // Migration: add icon column if it doesn't exist (for existing databases)
  const cols = database.prepare('PRAGMA table_info(categories)').all() as { name: string }[];
  if (!cols.some(c => c.name === 'icon')) {
    database.prepare("ALTER TABLE categories ADD COLUMN icon TEXT NOT NULL DEFAULT 'file'").run();
    // Back-fill icons for existing seed categories
    const iconMap: Record<string, string> = {
      '文案类': 'edit',
      '分析类': 'chart',
      '翻译类': 'globe',
      '编程类': 'code',
      '营销类': 'speaker',
      '客服类': 'headphones',
    };
    const update = database.prepare('UPDATE categories SET icon = ? WHERE name = ?');
    for (const [name, icon] of Object.entries(iconMap)) {
      update.run(icon, name);
    }
  }

  const catCount = (database.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number }).c;
  if (catCount === 0) {
    seedData(database);
  }

  // Migration: add new platforms for existing databases
  const upsertPlat = database.prepare(
    'INSERT OR IGNORE INTO platforms (name, slug, delivery_method, url_template, color, bg_color) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const newPlatforms: [string, string, string, string, string, string][] = [
    ['Perplexity', 'perplexity', 'clipboard', 'https://www.perplexity.ai/', '#1cb8b8', 'rgba(28,184,184,0.1)'],
    ['Comet',      'comet',      'clipboard', 'https://cometapi.com/',      '#6c47ff', 'rgba(108,71,255,0.1)'],
    ['Grok',       'grok',       'clipboard', 'https://grok.com/',          '#ff6b35', 'rgba(255,107,53,0.1)'],
  ];
  newPlatforms.forEach(([name, slug, method, url, color, bg]) =>
    upsertPlat.run(name, slug, method, url, color, bg));

  // Migration: remove Wenxin (文心一言) from existing databases
  database.prepare("DELETE FROM prompt_platforms WHERE platform_id IN (SELECT id FROM platforms WHERE slug = 'wenxin')").run();
  database.prepare("DELETE FROM platforms WHERE slug = 'wenxin'").run();
}

function seedData(database: Database.Database) {
  const insertCat = database.prepare('INSERT INTO categories (name, emoji, icon, sort_order) VALUES (?, ?, ?, ?)');
  const cats: [string, string, string, number][] = [
    ['Shopify',  '🛍️', 'box',        1],
    ['SEO',      '📊', 'chart',      2],
    ['EDM',      '✉️', 'edit',       3],
    ['编程',     '💻', 'code',       4],
    ['客服咨询', '🎧', 'headphones', 5],
  ];
  cats.forEach(([name, emoji, icon, order]) => insertCat.run(name, emoji, icon, order));

  const insertPlat = database.prepare('INSERT INTO platforms (name, slug, delivery_method, url_template, color, bg_color) VALUES (?, ?, ?, ?, ?, ?)');
  const platforms: [string, string, string, string, string, string][] = [
    ['ChatGPT',    'chatgpt',    'clipboard',  'https://chatgpt.com/',                    '#10a37f', 'rgba(16,163,127,0.12)'],
    ['Claude',     'claude',     'url_scheme', 'https://claude.ai/new?q={prompt}',        '#1e6ec8', 'rgba(30,110,200,0.08)'],
    ['Gemini',     'gemini',     'clipboard',  'https://gemini.google.com/',              '#4285f4', 'rgba(66,133,244,0.12)'],
    ['Perplexity', 'perplexity', 'clipboard',  'https://www.perplexity.ai/',              '#1cb8b8', 'rgba(28,184,184,0.1)'],
    ['Comet',      'comet',      'clipboard',  'https://cometapi.com/',                   '#6c47ff', 'rgba(108,71,255,0.1)'],
    ['Grok',       'grok',       'clipboard',  'https://grok.com/',                       '#ff6b35', 'rgba(255,107,53,0.1)'],
  ];
  platforms.forEach(([name, slug, method, url, color, bg]) =>
    insertPlat.run(name, slug, method, url, color, bg));

  const insertPrompt = database.prepare(`
    INSERT INTO prompts (title, description, content, category_id) VALUES (?, ?, ?, ?)
  `);
  const insertPP  = database.prepare('INSERT INTO prompt_platforms (prompt_id, platform_id) VALUES (?, ?)');
  const insertVar = database.prepare(`
    INSERT INTO variables (prompt_id, name, hint, type, options, default_value, required, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const samplePrompts = [
    {
      title: '品牌文案生成器',
      description: '根据品牌调性、目标受众和产品特点，自动生成多风格品牌文案，适用于广告、社媒和官网场景。',
      content: '你是一位专业的品牌文案策划师。请根据以下信息，为品牌 {{品牌名称}} 生成一篇适用于 {{使用场景}} 的文案。\n\n目标受众：{{目标受众}}\n\n要求：语言风格符合品牌调性，突出核心卖点，结尾附有行动号召语句。',
      category_id: 1, platforms: [1, 2],
      variables: [
        { name: '品牌名称', hint: '填写您的品牌或产品名称',     type: 'text',     options: null,                                                                              default_value: '',        required: 1, sort_order: 0 },
        { name: '使用场景', hint: '选择文案投放的渠道或场景',   type: 'select',   options: JSON.stringify(['小红书推广帖','微博营销','抖音脚本','官网介绍','广告语']),        default_value: '小红书推广帖', required: 1, sort_order: 1 },
        { name: '目标受众', hint: '描述核心用户群体特征',       type: 'textarea', options: null,                                                                              default_value: '',        required: 0, sort_order: 2 },
      ],
    },
    {
      title: '数据分析报告',
      description: '输入数据背景与分析维度，输出结构化分析报告，包含趋势判断、问题归因与行动建议。',
      content: '请你作为数据分析师，对以下数据进行深度分析：\n\n数据背景：{{数据背景}}\n\n分析维度：{{分析维度}}\n\n请输出结构化分析报告，包括：趋势判断、问题归因、行动建议。',
      category_id: 2, platforms: [1, 3],
      variables: [
        { name: '数据背景', hint: '描述数据来源和业务背景',                       type: 'textarea', options: null, default_value: '', required: 1, sort_order: 0 },
        { name: '分析维度', hint: '指定需要分析的维度，如时间、地区、用户群等',  type: 'text',     options: null, default_value: '', required: 1, sort_order: 1 },
      ],
    },
    {
      title: '代码审查助手',
      description: '对指定代码片段进行安全性、性能、可读性三维度审查，并给出具体改进建议与示例。',
      content: '请对以下代码进行专业审查：\n\n```\n{{代码内容}}\n```\n\n请从以下三个维度给出详细分析：\n1. 安全性：是否存在安全漏洞或风险\n2. 性能：是否有优化空间\n3. 可读性：代码规范性与可维护性\n\n对于每个问题，请给出具体的改进建议和示例代码。',
      category_id: 4, platforms: [2],
      variables: [
        { name: '代码内容', hint: '粘贴需要审查的代码', type: 'textarea', options: null, default_value: '', required: 1, sort_order: 0 },
      ],
    },
    {
      title: '多语言翻译优化',
      description: '将输入文本翻译为目标语言，并针对文化背景进行本地化润色，保留原文语气与风格。',
      content: '请将以下文本翻译为{{目标语言}}，并进行本地化润色：\n\n原文：{{原文内容}}\n\n要求：\n- 准确传达原文含义\n- 语言自然流畅，符合目标语言表达习惯\n- 保留原文的语气和风格\n- 如有文化差异，请适当调整以符合目标文化',
      category_id: 3, platforms: [1, 2, 3],
      variables: [
        { name: '目标语言', hint: '翻译目标语言，如：英语、日语、法语', type: 'text',     options: null, default_value: '英语', required: 1, sort_order: 0 },
        { name: '原文内容', hint: '输入需要翻译的文本',               type: 'textarea', options: null, default_value: '',     required: 1, sort_order: 1 },
      ],
    },
    {
      title: '社媒营销文案',
      description: '根据产品卖点与平台风格，生成适配微博、小红书、抖音等平台的营销短文案与话题标签。',
      content: '你是一位资深的社交媒体营销专家。请为以下产品生成适配{{目标平台}}的营销文案：\n\n产品名称：{{产品名称}}\n核心卖点：{{核心卖点}}\n目标用户：{{目标用户}}\n\n要求：\n- 文案风格符合{{目标平台}}的调性\n- 配上3-5个相关话题标签\n- 长度控制在{{字数要求}}字以内',
      category_id: 5, platforms: [1],
      variables: [
        { name: '目标平台', hint: '选择发布平台',         type: 'select',   options: JSON.stringify(['小红书','微博','抖音','B站','微信公众号','Instagram']), default_value: '小红书', required: 1, sort_order: 0 },
        { name: '产品名称', hint: '输入产品或服务名称',   type: 'text',     options: null,                                                                    default_value: '',       required: 1, sort_order: 1 },
        { name: '核心卖点', hint: '描述产品最大的优势或特点', type: 'textarea', options: null,                                                                 default_value: '',       required: 1, sort_order: 2 },
        { name: '目标用户', hint: '描述目标消费群体',     type: 'text',     options: null,                                                                    default_value: '',       required: 0, sort_order: 3 },
        { name: '字数要求', hint: '文案字数限制',         type: 'text',     options: null,                                                                    default_value: '150',    required: 0, sort_order: 4 },
      ],
    },
    {
      title: '客户投诉处理',
      description: '针对客户投诉，生成专业、有温度的回复，平衡客户情绪与企业立场。',
      content: '你是一位经验丰富的客户服务专员。请针对以下客户投诉，生成一份专业回复：\n\n投诉内容：{{投诉内容}}\n投诉类型：{{投诉类型}}\n\n要求：\n- 先表达歉意和理解，安抚情绪\n- 清楚说明解决方案或处理进度\n- 语气诚恳，避免推卸责任\n- 结尾表达后续跟进的承诺',
      category_id: 6, platforms: [1, 2],
      variables: [
        { name: '投诉内容', hint: '粘贴客户的具体投诉内容', type: 'textarea', options: null,                                                                        default_value: '',      required: 1, sort_order: 0 },
        { name: '投诉类型', hint: '选择投诉类别',           type: 'select',   options: JSON.stringify(['产品质量问题','物流配送问题','售后服务问题','账户问题','其他']), default_value: '产品质量问题', required: 1, sort_order: 1 },
      ],
    },
  ];

  samplePrompts.forEach(p => {
    const result = insertPrompt.run(p.title, p.description, p.content, p.category_id);
    const promptId = result.lastInsertRowid as number;
    p.platforms.forEach(pid => insertPP.run(promptId, pid));
    p.variables.forEach(v =>
      insertVar.run(promptId, v.name, v.hint, v.type, v.options, v.default_value, v.required, v.sort_order));
  });
}

export default getDb;
