import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../context/StoreContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import TelegramIcon from './TelegramIcon.jsx'
import CartIcon from './CartIcon.jsx'
import {
  MessageCircleIcon,
  CloseIcon,
  CheckIcon,
  ClockIcon,
  ArrowRightIcon,
  SendIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HeartIcon
} from './Icons.jsx'

const TG_SVG_HTML = `<svg viewBox="0 0 24 24" width="14" height="14" style="display:inline-block;vertical-align:-2px;margin-right:4px;" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#24A1DE"/><path fill="#FFFFFF" d="M17.56 8.16l-2.02 9.52c-.15.68-.56.84-1.13.52l-3.1-2.29-1.5 1.44c-.17.16-.31.3-.63.3l.22-3.17 5.76-5.2c.25-.22-.05-.35-.39-.12l-7.12 4.48-3.07-.96c-.67-.21-.68-.67.14-.99l12.01-4.63c.56-.2 1.05.13.87 1.1z"/></svg>`

// Lightweight safe HTML sanitizer for bot assistant responses (prevents XSS)
function sanitizeBotHtml(raw) {
  if (!raw) return ''
  return String(raw)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/javascript:/gi, '')
}

// ============================================================================
// COMPREHENSIVE BURMESE & ENGLISH NLP DICTIONARIES & KNOWLEDGE BASE
// ============================================================================

// Category Synonyms & Burmese Transliterations
const CATEGORY_SYNONYMS = {
  // Keyboards & Barebones
  'ကီးဘုတ်': ['Keyboard', 'Barebone', 'Numpad Keyboard'],
  'ခလုတ်ခုံ': ['Keyboard', 'Barebone'],
  'keyboard': ['Keyboard', 'Barebone', 'Numpad Keyboard'],
  'keyboards': ['Keyboard', 'Barebone', 'Numpad Keyboard'],
  'barebone': ['Barebone'],
  'ဘဲဘုန်း': ['Barebone'],
  'ဘယ်ဘုန်း': ['Barebone'],
  'numpad': ['Numpad Keyboard'],
  'နမ်ပတ်': ['Numpad Keyboard'],
  'နံပါတ်ခလုတ်': ['Numpad Keyboard'],
  'custom keyboard': ['Keyboard', 'Barebone'],
  'mechanical keyboard': ['Keyboard'],
  'မက္ကနစ်ကယ်': ['Keyboard'],

  // Controllers
  'ဂိမ်းလက်ကိုင်': ['Controller'],
  'လက်ကိုင်': ['Controller'],
  'controller': ['Controller'],
  'gamepad': ['Controller'],
  'joystick': ['Controller'],
  'ဂျွိုင်းစတစ်': ['Controller'],

  // Mice
  'မောက်စ်': ['Mouse'],
  'မောက်': ['Mouse'],
  'mouse': ['Mouse'],
  'mice': ['Mouse'],
  'ကြွက်': ['Mouse'],
  'ကြိုးမဲ့မောက်စ်': ['Mouse'],
  'wireless mouse': ['Mouse'],
  'gaming mouse': ['Mouse'],

  // Mousepads & Glasspads
  'မောက်စ်ပတ်': ['Mousepad', 'Glasspad'],
  'မောက်ပတ်': ['Mousepad', 'Glasspad'],
  'မောက်ပြား': ['Mousepad', 'Glasspad'],
  'mousepad': ['Mousepad'],
  'mouse pad': ['Mousepad'],
  'deskmat': ['Mousepad'],
  'glasspad': ['Glasspad'],
  'glass pad': ['Glasspad'],
  'ဖန်မောက်ပြား': ['Glasspad'],
  'ဖန်ပတ်': ['Glasspad'],

  // Switches
  'ဆွစ်ချ်': ['Switch'],
  'ဆွစ်': ['Switch'],
  'switch': ['Switch'],
  'switches': ['Switch'],
  'ခလုတ်': ['Switch'],

  // Keycaps
  'ကီးကပ်': ['Keycaps'],
  'ကီးကတ်': ['Keycaps'],
  'keycap': ['Keycaps'],
  'keycaps': ['Keycaps'],
  'ခလုတ်ခေါင်း': ['Keycaps'],

  // Skincare & Beauty
  'ခေါင်းလျှော်ရည်': ['Shampoo'],
  'shampoo': ['Shampoo'],
  'ဆံပင်ပေါင်းဆေး': ['Hair Mask'],
  'hair mask': ['Hair Mask'],
  'hair treatment': ['Hair Mask'],
  'မျက်နှာသစ်': ['Cleansing'],
  'cleansing': ['Cleansing'],
  'cleanser': ['Cleansing'],
  'micellar': ['Cleansing'],
  'မိတ်ကပ်ဖျက်': ['Cleansing'],
  'လိုးရှင်း': ['Body Care'],
  'lotion': ['Body Care'],
  'body care': ['Body Care'],
  'ခရင်မ်': ['Cream'],
  'cream': ['Cream'],
  'moisturizer': ['Cream'],
  'ကော်လာဂျင်': ['Collagen'],
  'collagen': ['Collagen'],
  'ဖောင်ဒေးရှင်း': ['Foundation'],
  'foundation': ['Foundation'],
  'မိတ်ကပ်': ['Foundation', 'Powder'],
  'နှုတ်ခမ်းနီ': ['Lipstick'],
  'lipstick': ['Lipstick'],
  'ပေါင်ဒါ': ['Powder'],
  'powder': ['Powder'],
  'သနပ်ခါး': ['Powder'],
  'စကင်ကဲ': ['Skin Booster', 'Cream', 'Cleansing', 'Body Care'],
  'skincare': ['Skin Booster', 'Cream', 'Cleansing', 'Body Care'],
  'skin booster': ['Skin Booster'],
  'retinol': ['Skin Booster'],

  // Lifestyle, Fan, Bottle, Lighting & Accessories
  'မီးဆိုင်း': ['Lighting'],
  'lighting': ['Lighting'],
  'light bar': ['Lighting'],
  'အမွှေးအိတ်': ['Scent bag'],
  'scent bag': ['Scent bag'],
  'ပန်ကာ': ['Fan'],
  'fan': ['Fan'],
  'ရေဘူး': ['Water Bottle'],
  'water bottle': ['Water Bottle'],
  'bottle': ['Water Bottle'],
  'ဓား': ['Kitchen Accessories'],
  'knife': ['Kitchen Accessories'],
  'မျက်တောင်': ['Eyelashes'],
  'eyelashes': ['Eyelashes'],
  'desk organizer': ['Accessories'],
  'accessories': ['Accessories'],
}

// Brand Synonyms & Transliterations
const BRAND_SYNONYMS = {
  'attack shark': ['Attack Shark', 'Attackshark'],
  'attackshark': ['Attack Shark', 'Attackshark'],
  'အတက်ရှာ့ခ်': ['Attack Shark', 'Attackshark'],
  'အတက်ရှပ်': ['Attack Shark', 'Attackshark'],
  'aula': ['Aula'],
  'အော်လာ': ['Aula'],
  'အူလာ': ['Aula'],
  'atk': ['ATK'],
  'အေတီကေ': ['ATK'],
  'dareu': ['Dareu'],
  'ဒါရူး': ['Dareu'],
  'ဒါရူ': ['Dareu'],
  'wooting': ['Wooting'],
  'ဝူးတင်း': ['Wooting'],
  'ဝုတင်း': ['Wooting'],
  'drunkdeer': ['DrunkDeer'],
  'ဒရန့်ဒီးယား': ['DrunkDeer'],
  'ဒရန့်ဒီး': ['DrunkDeer'],
  'nuphy': ['NuPhy'],
  'နူဖီ': ['NuPhy'],
  'keychron': ['Keychron'],
  'ကီးခရွန်': ['Keychron'],
  'razer': ['Razer'],
  'ရာဇာ': ['Razer'],
  'ရေဇာ': ['Razer'],
  'logitech': ['Logitech'],
  'vgn': ['VGN'],
  'dragonfly': ['VGN'],
  'vxe': ['VXE'],
  'fantech': ['Fantech'],
  'ajazz': ['AJAZZ', 'Ajazz'],
  'အေဂျက်စ်': ['AJAZZ', 'Ajazz'],
  'အာဂျက်စ်': ['AJAZZ', 'Ajazz'],
  'leobog': ['LEOBOG', 'Leobog'],
  'mchose': ['MCHOSE'],
  'fl-esports': ['FL-ESPORTS'],
  'monsgeek': ['MonsGeek'],
  'akko': ['Akko'],
  'အက်ကို': ['Akko'],
  'outemu': ['Outemu'],
  'ktt': ['KTT'],
  'gateron': ['Gateron'],
  'aolion': ['Aolion'],
  'cidoo': ['CIDOO', 'Cidoo'],
  'စီဒူး': ['CIDOO', 'Cidoo'],
  'chilkey': ['Chilkey'],
  'ချီကေး': ['Chilkey'],
  'gravastar': ['Gravastar'],
  'hyperx': ['HyperX'],
  'ဟိုက်ပါအိတ်စ်': ['HyperX'],
  'iqunix': ['IQUNIX'],
  'အိုင်ကျူနစ်': ['IQUNIX'],
  'kzzi': ['KZZI'],
  'langtu': ['Langtu'],
  'လန်းတူ': ['Langtu'],
  'လန်တု': ['Langtu'],
  'madlions': ['MADLIONS'],
  'မက်ဒ်လိုင်ယွန်': ['MADLIONS'],
  'msi': ['MSI'],
  'machenike': ['Machenike'],
  'မက်ရှန်းနစ်ခ်': ['Machenike'],
  'melgeek': ['Melgeek', 'MelGeek'],
  'မယ်လ်ဂီးခ်': ['Melgeek', 'MelGeek'],
  'smailwolf': ['Smailwolf'],
  'inphic': ['Inphic'],
  'mofii': ['MOFii'],
  'lenovo': ['Lenovo'],
  'pulsar': ['Pulsar'],
  'skn': ['SKN'],
  'valkyrie': ['Valkyrie'],
  'ဗယ်လ်ကီရီ': ['Valkyrie'],
  'wobkey': ['WOBKEY'],
  'ဝေါ့ဘ်ကီး': ['WOBKEY'],
  'xinmeng': ['Xinmeng', 'Xingmen'],
  'xingmen': ['Xinmeng', 'Xingmen'],
  'ရှင်းမင်': ['Xinmeng', 'Xingmen'],
  '8bitdo': ['8BitDo'],
  'vrtk': ['VRTK'],
  'kezhi': ['Kezhi'],
  'vaseline': ['Vaseline'],
  'ဗက်စလင်း': ['Vaseline'],
  'kerastase': ['Kerastase', 'Kérastase'],
  'fino': ['Fino'],
  'tsubaki': ['Tsubaki'],
  'cerave': ['Cerave'],
  'ဆီရာဗီ': ['Cerave'],
  'garnier': ['Garnier'],
  'ဂါနီယာ': ['Garnier'],
  'pantene': ['Pantene'],
  'ပန်တင်း': ['Pantene'],
  'johnson': ['Johnson'],
  'ဂျွန်ဆင်': ['Johnson'],
  'eweadn': ['Eweadn'],
  'အီဝီဒန်': ['Eweadn'],
  'sasi': ['Sasi', 'SASI'],
  'ဆာစီ': ['Sasi', 'SASI'],
  'kma': ['KMA'],
  'celimax': ['Celimax'],
  'jmcy': ['JMCY'],
  '3ce': ['3ce'],
  'centella': ['CENTELLA'],
}

const SWITCH_SOUND_PROFILES = {
  thocky: {
    pattern: /(thock|thocky|သောက်ကီ|သောက်ခီ|အသံထူ|အသံလေး)/i,
    switches: [
      'Leobog Reaper Switch',
      'Leobog Greywood v4 Switch',
      'Gateron Oil King Switch',
      'Gateron Milky Yellow Switch',
      'Aula Coconut Latte V2 Switch',
      'Leobog Ice Vein Switch',
    ],
    title: '🔊 Thocky (အသံလေး/အသံထူ) Switch များ',
    desc: 'နားထောင်လို့ ကောင်းပြီး အသံထူထူလေး ထွက်စေသော Thocky Switch များ ဖြစ်ပါတယ်ခင်ဗျာ -',
  },
  clacky: {
    pattern: /(clack|clacky|ကလက်ကီ|ကလက်ခီ|အသံကျယ်|အသံတောက်|clicky)/i,
    switches: [
      'Leobog StarVector Switch',
      '3 Pin Blue Switch',
      '3Pin White Switch',
      'Kezhi Rainbow Switch',
    ],
    title: '🔊 Clacky / Clicky (အသံတောက်/အသံစို) Switch များ',
    desc: 'ရိုက်ရတာ ခပ်သွက်သွက်နဲ့ အသံတောက်တောက်ထွက်သော Clacky / Clicky Switch များ ဖြစ်ပါတယ်ခင်ဗျာ -',
  },
  creamy: {
    pattern: /(creamy|ခရင်မီ|အသံညက်|အသံပျော့)/i,
    switches: [
      'Aula Coconut Latte V2 Switch',
      'Gateron Milky Yellow Switch',
      'Gateron Oil King Switch',
      'Leobog Ice Vein Switch',
      'QK 01 Black Switch',
    ],
    title: '🍦 Creamy (အသံညက်ညော) Switch များ',
    desc: 'နှိပ်ရတာ ချောမွေ့ပြီး အသံညက်ညောလှသော Creamy Switch များ ဖြစ်ပါတယ်ခင်ဗျာ -',
  },
  silent: {
    pattern: /(silent\s*switch|အသံတိတ်\s*ဆွစ်|အသံငြိမ်\s*ဆွစ်)/i,
    switches: [
      'Outemu Silent Lemon V3',
      'Outemu Silent Peach V3',
    ],
    title: '🤫 Silent (အသံတိတ်/အသံငြိမ်) Switch များ',
    desc: 'ဆူညံသံမထွက်ဘဲ ရုံးသုံး/ညဘက်သုံးရန် အသံငြိမ်သက်သော Silent Switch များ ဖြစ်ပါတယ်ခင်ဗျာ -',
  },
}

// Department clusters for cross-category isolation
const DEPARTMENT_CLUSTERS = {
  gaming_hardware: [
    'Keyboard',
    'Barebone',
    'Numpad Keyboard',
    'Keycaps',
    'Switch',
    'Mouse',
    'mouse',
    'Mousepad',
    'Glasspad',
    'Controller',
    'Lighting',
  ],
  beauty_personal_care: [
    'Cleansing',
    'Body Care',
    'Cream',
    'Collagen',
    'Cosmetic',
    'Cosmetic ',
    'Eyelashes',
    'Foundation',
    'Hair Mask',
    'Lipstick',
    'Mask',
    'Powder',
    'Scent bag',
    'Shampoo',
    'Skin Booster',
  ],
  lifestyle: [
    'Accessories',
    'Fan',
    'Kitchen Accessories',
    'Water Bottle',
  ],
}

const GAMING_HARDWARE_INTENT_REGEX =
  /(keyboard|keyboards|barebone|numpad|mouse|mice|switch|switches|keycap|keycaps|mousepad|glasspad|controller|gamepad|joystick|rapid trigger|hall effect|magnetic switch|သံလိုက်|thock|clack|creamy|\bhe\b|\brt\b|dpi|wireless mouse|mechanical|ကီးဘုတ်|ခလုတ်ခုံ|မောက်|မောက်စ်|ဆွစ်|ဆွစ်ချ်|ကီးကပ်|ဂိမ်းလက်ကိုင်)/i

const BEAUTY_CARE_INTENT_REGEX =
  /(shampoo|ခေါင်းလျှော်ရည်|hair mask|cleansing|cleanser|မျက်နှာသစ်|မိတ်ကပ်ဖျက်|body care|lotion|လိုးရှင်း|cream|moisturizer|ခရင်မ်|collagen|ကော်လာဂျင်|cosmetic|foundation|မိတ်ကပ်|lipstick|နှုတ်ခမ်းနီ|မျက်နှာဖုံး|powder|ပေါင်ဒါ|skin|skin booster|အသားအရေ|အမွှေး|scent bag)/i

// Special Feature Tech Keywords (Strictly Category Isolated)
const TECH_FEATURES = {
  rapid_trigger: {
    pattern: /(rapid\s*trigger|hall\s*effect|magnetic\s*switch|magnetic\s*keyboard|\bhe\b\s*keyboard|သံလိုက်\s*ဆွစ်|သံလိုက်\s*ကီးဘုတ်|သံလိုက်|\brt\b\s*keyboard)/i,
    allowedCategories: ['Keyboard', 'Barebone', 'Numpad Keyboard'],
    filter: (p) => {
      const cat = (p.category || '').toLowerCase()
      if (!['keyboard', 'barebone', 'numpad keyboard'].some((c) => cat.includes(c))) return false
      const name = p.name || ''
      const content = p.content || ''
      const isHeOrRt =
        /\b(he|rt)\b/i.test(name) || /he\+/i.test(name) || /\d+he\b/i.test(name)
      const isRapidOrMag = /(rapid\s*trigger|magnetic|hall\s*effect|wooting|atk68|drunkdeer)/i.test(
        name + ' ' + content
      )
      return isHeOrRt || isRapidOrMag
    },
    title: '⚡ Rapid Trigger / Magnetic Switch (HE) Keyboards',
    desc: 'Magnetic Hall Effect နည်းပညာသုံးထားပြီး Rapid Trigger ပါဝင်သော Gaming Keyboard များမှာ အောက်ပါအတိုင်း ဖြစ်ပါတယ်ခင်ဗျာ -',
  },
  silent: {
    pattern: /(silent|အသံတိတ်|အသံငြိမ်|ညဘက်သုံး|မဆူတဲ့|ရုံးသုံး)/i,
    allowedCategories: ['Switch', 'Keyboard', 'Mouse', 'mouse', 'Barebone'],
    filter: (p) => {
      const cat = (p.category || '').toLowerCase()
      if (!['switch', 'keyboard', 'mouse', 'barebone'].some((c) => cat.includes(c))) return false
      const text = `${p.name || ''} ${p.content || ''}`
      return /(silent|အသံတိတ်|အသံငြိမ်)/i.test(text)
    },
    title: '🤫 Silent (အသံငြိမ်) ပစ္စည်းများ',
    desc: 'ဆူညံသံမထွက်ဘဲ အသံငြိမ်သက်စွာ အသုံးပြုနိုင်သော Silent ပစ္စည်းများမှာ -',
  },
  wireless: {
    pattern: /(wireless|ကြိုးမဲ့|bluetooth|2\.4g|ဘလူးတု|tri-mode|trimode)/i,
    allowedCategories: ['Keyboard', 'Mouse', 'mouse', 'Controller', 'Barebone'],
    filter: (p) => {
      const cat = (p.category || '').toLowerCase()
      if (!['keyboard', 'mouse', 'controller', 'barebone'].some((c) => cat.includes(c))) return false
      return (
        /(wireless|bluetooth|tri-mode|tri mode|3-mode|2\.4g)/i.test(p.connection || '') ||
        /(wireless|bluetooth|tri-mode|3-mode|2\.4g)/i.test(p.name || '') ||
        /(wireless|bluetooth|tri-mode)/i.test(p.content || '')
      )
    },
    title: '📶 ကြိုးမဲ့ (Wireless / Bluetooth / Tri-Mode) ပစ္စည်းများ',
    desc: 'ကြိုးမဲ့ အသုံးပြုနိုင်သော Wireless & Bluetooth ပစ္စည်းများ ဖြစ်ပါတယ်ခင်ဗျာ -',
  },
}

// Burmese Particles & Question Words Regex
const BURMESE_PARTICLES_REGEX = /(instock|in-stock|preorder|pre-order|အဆင်သင့်ရှိ|ရှိတဲ့ထဲက|ပစ္စည်းရှိတဲ့|ရှိတာ|ရှိတဲ့|ဘာတွေရှိလဲ|ဘာရှိလဲ|ဘာတွေရလဲ|ဘာရလဲ|ရနိုင်တာ|စျေးနှုန်းသိချင်လို့|စျေးဘယ်လောက်လဲ|စျေးဘယ်လောက်|စျေးက|စျေး|ဈေးနှုန်းသိချင်လို့|ဈေးဘယ်လောက်လဲ|ဈေးဘယ်လောက်|ဈေးက|ဈေး|ဘယ်လောက်ကျမလဲ|တန်ဖိုးဘယ်လောက်လဲ|ဘယ်လောက်လဲ|ရှိလား|ရနိုင်လား|ရသေးလား|ရှိသေးလား|ပြပေးပါ|စျေးနှုန်း|ဈေးနှုန်း|သိချင်လို့|price|cost|how much|stock|ဝန်းကျင်|ပတ်ချာလည်|အောက်|မကျော်|အထက်|ကျော်|ကြား|အတွင်း|သိန်းခွဲ|သောင်းခွဲ|သိန်း|သောင်း|ကျပ်|တွေ|များ|ပါ|ပြပါ|ပြောတာ|ကြည့်ချင်လို့|ဝယ်ချင်လို့|ရှာပေးပါ|တစ်ချက်|တချက်|လောက်|လေး|ကော|ပါသလဲ|လဲခင်ဗျာ|ခင်ဗျာ|ဗျာ|လား|ဆိုတာ|အကြောင်း|အခြေအနေ|က)/gi

// Category name tokens to strip when isolating specific model names
const CATEGORY_WORDS = [
  'keyboard', 'keyboards', 'mouse', 'mice', 'switch', 'switches', 'barebone',
  'numpad', 'keycaps', 'keycap', 'mousepad', 'glasspad', 'controller', 'shampoo',
  'cream', 'cleansing', 'lotion', 'collagen', 'powder', 'lipstick', 'fan', 'bottle',
  'ကီးဘုတ်', 'မောက်', 'မောက်စ်', 'ဆွစ်', 'ဆွစ်ချ်', 'ခလုတ်ခုံ', 'ကီးကပ်', 'မောက်စ်ပတ်', 'မောက်ပြား',
]

const GENERIC_MODIFIER_WORDS = new Set([
  ...CATEGORY_WORDS,
  'gaming', 'office', 'wireless', 'wired', 'bluetooth', 'mechanical', 'magnetic',
  'rapid', 'trigger', 'hall', 'effect', 'silent', 'rgb', 'custom', 'he', 'rt',
  'pro', 'max', 'plus', 'ultra', 'lite', 'mini', 'air', 'v2', 'v3', 'v4', 'v5',
  'best', 'good', 'cheap', 'budget', 'new', 'instock', 'preorder', 'pad', 'glass',
  '60%', '65%', '68%', '75%', '80%', '85%', '87%', '96%', '98%', '100%',
  '60', '61', '63', '65', '67', '68', '75', '80', '81', '82', '84', '85', '87', '96', '98', '99', '100',
  'key', 'keys', 'layout', 'size', 'full', 'tkl', 'tenkeyless', 'fullsize', 'compact', 'split',
  'aluminum', 'aluminium', 'cnc', 'wooden', 'wood', 'metal',
  'low', 'profile', 'linear', 'tactile', 'clicky', 'thocky', 'clacky', 'creamy', 'hotswap', 'pin', '3pin', '5pin',
  'shine', 'through', 'side', 'print', 'contour', 'anime', 'cartoon', 'theme', 'game',
  'ergonomic', 'lightweight', 'dock', 'charging', 'valorant', 'cs2', 'csgo', 'fps',
  'esports', 'coding', 'programmer', 'mac', 'macbook', 'ipad', 'tablet', 'android', 'ios',
  'web', 'driver', 'software', 'qmk', 'via', 'macro', 'remap', 'lube', 'lubed', 'mod', 'build',
  'screen', 'display', 'knob', 'tft', 'lcd', 'gift', 'present', 'acne', 'skin', 'dry', 'oily', 'hair',
  'paw3950', 'paw3395', '3950', '3395', '8k', '4k', '1k', '8000hz', 'original', 'authentic', 'official',
  'အကောင်းဆုံး', 'အသက်သာဆုံး', 'အချိုဆုံး', 'အနည်းဆုံး', 'အများဆုံး', 'အမြင့်ဆုံး',
  'ကြိုးမဲ့', 'သံလိုက်', 'အသံတိတ်', 'အသံငြိမ်', 'အသစ်', 'ပစ္စည်း', 'အမျိုးအစား',
])

// ============================================================================
// BURMESE NUMERAL, MYANGLISH, CATEGORY, TOKEN & BUDGET PARSERS
// ============================================================================

const normalizeMyanglish = (str) => {
  if (!str) return ''
  return str
    .replace(/\b(bhal\s*lout\s*lal|bhal\s*lout\s*le|bhal\s*lout|zay\s*bhal\s*lout|zay\s*nhun|aps)\b/gi, ' စျေးဘယ်လောက်လဲ ')
    .replace(/\b(bha\s*twe\s*shi\s*lal|bha\s*twe\s*ya\s*lal|bha\s*shi\s*lal|bha\s*ya\s*lal)\b/gi, ' ဘာတွေရှိလဲ ')
    .replace(/\b(shi\s*lar|shi\s*la|ya\s*lar|ya\s*la|shi\s*thay\s*lar)\b/gi, ' ရှိလား ')
    .replace(/\b(bhal\s*ha\s*kaung\s*lal|bha\s*kaung\s*lal|recommend\s*pay)\b/gi, ' ဘယ်ဟာကောင်းလဲ ')
    .replace(/\b(po\s*kha|deli\s*kha|bhal\s*lout\s*kya\s*ml)\b/gi, ' ပို့ဆောင်ခ ')
    .replace(/\b(bhal\s*lo\s*mhar\s*ya\s*ml|mhar\s*chin\s*tal|wll\s*chin\s*tal|wal\s*chin\s*tal)\b/gi, ' မှာယူနည်း ')
    .replace(/\b(sai\s*bhal\s*mhar\s*lal|address\s*bhal\s*mhar)\b/gi, ' ဆိုင်လိပ်စာ ')
    .replace(/\b(zay\s*shော့|zay\s*lyော့|discount\s*shi\s*lar)\b/gi, ' စျေးလျှော့ ')
}

const burmeseToAsciiDigits = (str) => {
  if (!str) return ''
  const myanDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉']
  return str.replace(/[၀-၉]/g, (ch) => myanDigits.indexOf(ch).toString())
}

const formatCategoryLabel = (cats) => {
  if (!cats || cats.length === 0) return 'ပစ္စည်း'
  const seen = new Set()
  const unique = []
  for (const c of cats) {
    const low = c.toLowerCase().trim()
    if (!seen.has(low)) {
      seen.add(low)
      unique.push(c.charAt(0).toUpperCase() + c.slice(1))
    }
  }
  if (unique.includes('Keyboard') && unique.includes('Barebone') && unique.length >= 2) {
    return 'Keyboard & Barebone'
  }
  return unique.join(' / ')
}

const extractTargetCategories = (query, categories = []) => {
  let qWork = (query || '').toLowerCase()
  const matched = []

  if (/(mouse\s*feet|mouse\s*skates?|mouse\s*sticker|switch\s*puller|keyboard\s*bag|keyboard\s*stand|desk\s*organizer|led\s*cable|cosmetic\s*စင်|diy\s*စင်|money\s*saving|ပိုက်ဆံစုဘူး|jewel\s*box|bedsheet)/i.test(qWork)) {
    matched.push('Accessories')
    qWork = qWork.replace(/(mouse\s*feet|mouse\s*skates?|mouse\s*sticker|switch\s*puller|keyboard\s*bag|keyboard\s*stand|desk\s*organizer|led\s*cable|cosmetic\s*စင်|diy\s*စင်|money\s*saving|ပိုက်ဆံစုဘူး|jewel\s*box|bedsheet)/gi, ' ')
  }

  if (/(glass\s*pad|glasspad|ဖန်မောက်ပြား|ဖန်ပတ်)/i.test(qWork)) {
    matched.push('Glasspad')
    qWork = qWork.replace(/(glass\s*pad|glasspad|ဖန်မောက်ပြား|ဖန်ပတ်)/gi, ' ')
  }
  if (/(mouse\s*pad|mousepad|desk\s*mat|deskmat|wrist\s*pad|wristpad|မောက်စ်ပတ်|မောက်ပတ်|မောက်ပြား)/i.test(qWork)) {
    matched.push('Mousepad')
    if (/မောက်စ်ပတ်|မောက်ပတ်|မောက်ပြား/.test(query)) {
      matched.push('Glasspad')
    }
    qWork = qWork.replace(/(mouse\s*pad|mousepad|desk\s*mat|deskmat|wrist\s*pad|wristpad|မောက်စ်ပတ်|မောက်ပတ်|မောက်ပြား)/gi, ' ')
  }

  if (/(key\s*caps?|ကီးကပ်|ကီးကတ်|ခလုတ်ခေါင်း)/i.test(qWork)) {
    matched.push('Keycaps')
    qWork = qWork.replace(/(key\s*caps?|ကီးကပ်|ကီးကတ်|ခလုတ်ခေါင်း)/gi, ' ')
  }
  if (/(num\s*pad|နမ်ပတ်|နံပါတ်ခလုတ်|ဂဏန်းခလုတ်)\s*(ပါတဲ့|ပါသော|ပါဝင်တဲ့)/i.test(qWork)) {
    matched.push('Keyboard')
    qWork = qWork.replace(/(num\s*pad|နမ်ပတ်|နံပါတ်ခလုတ်|ဂဏန်းခလုတ်)\s*(ပါတဲ့|ပါသော|ပါဝင်တဲ့)/gi, ' ')
  } else if (/(num\s*pad|နမ်ပတ်|နံပါတ်ခလုတ်)/i.test(qWork)) {
    matched.push('Numpad Keyboard')
    qWork = qWork.replace(/(num\s*pad|နမ်ပတ်|နံပါတ်ခလုတ်)/gi, ' ')
  }

  const sortedSynonyms = Object.entries(CATEGORY_SYNONYMS).sort((a, b) => b[0].length - a[0].length)
  for (const [synonym, cats] of sortedSynonyms) {
    if (['mousepad', 'mouse pad', 'glasspad', 'glass pad', 'keycap', 'keycaps', 'numpad'].includes(synonym)) {
      continue
    }
    const isAsciiWord = /^[a-z0-9\s]+$/i.test(synonym)
    const hit = isAsciiWord
      ? new RegExp(`\\b${synonym.replace(/\s+/g, '\\s+')}\\b`, 'i').test(qWork)
      : qWork.includes(synonym)
    if (hit) {
      matched.push(...cats)
    }
  }

  for (const cat of categories) {
    const lowCat = (cat || '').toLowerCase().trim()
    if (!lowCat || lowCat === 'mouse' || lowCat === 'mask') continue
    const isAscii = /^[a-z0-9\s]+$/i.test(lowCat)
    const hit = isAscii
      ? new RegExp(`\\b${lowCat.replace(/\s+/g, '\\s+')}\\b`, 'i').test(qWork)
      : qWork.includes(lowCat)
    if (hit) matched.push(cat)
  }

  if (/\bmask\b/i.test(qWork) && !/hair\s*mask/i.test(query)) {
    matched.push('Mask', 'Hair Mask')
  }

  if (matched.some((c) => c.toLowerCase() === 'mouse')) {
    matched.push('Mouse', 'mouse')
  }

  return [...new Set(matched)]
}

const tokenMatchesName = (token, productName) => {
  if (!token || !productName) return false
  const tok = token.toLowerCase().trim()
  const name = productName.toLowerCase()
  if (!tok) return false

  if (tok.length <= 2) {
    return new RegExp(`(?:^|[^a-z0-9])${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^a-z0-9])`, 'i').test(name)
  }

  if (/^\d+$/.test(tok)) {
    return new RegExp(`(?:^|[^0-9])${tok}(?:$|[^0-9])`).test(name)
  }

  if (/^[a-z]{1,4}$/i.test(tok)) {
    return new RegExp(`(?:^|[^a-z])${tok}(?:$|[^a-z])`, 'i').test(name)
  }

  if (name.includes(tok)) return true

  const compactTok = tok.replace(/[\s\-_]+/g, '')
  const compactName = name.replace(/[\s\-_]+/g, '')
  if (compactTok.length >= 3 && /[a-z]/i.test(compactTok) && /\d/.test(compactTok)) {
    if (compactName.includes(compactTok)) return true
  }

  if (tok.includes('graywood') && name.includes('greywood')) return true
  if (tok.includes('greywood') && name.includes('graywood')) return true

  return false
}

// Extract budget / price range from query
const parsePriceFilter = (userQuery) => {
  const q = burmeseToAsciiDigits((userQuery || '').toLowerCase().replace(/,/g, ''))

  const rangePattern = /(\d+(?:\.\d+)?)\s*(သိန်းခွဲ|သောင်းခွဲ|သိန်း|သောင်း|ks|k|ကျပ်)?\s*(မှ|to|-|–)\s*(\d+(?:\.\d+)?)\s*(သိန်းခွဲ|သောင်းခွဲ|သိန်း|သောင်း|ks|k|ကျပ်)?\s*(ကြား|အတွင်း)?/i
  const rangeMatch = q.match(rangePattern)
  if (rangeMatch) {
    const hasPriceUnit = rangeMatch[2] || rangeMatch[5] || rangeMatch[6] || /(သိန်း|သောင်း|ကျပ်|ks|စျေး|ဈေး|budget)/i.test(q)
    if (hasPriceUnit || parseFloat(rangeMatch[1]) >= 10000) {
      const parseVal = (numStr, unitStr) => {
        let val = parseFloat(numStr)
        if (unitStr && unitStr.includes('ခွဲ')) val += 0.5
        if (unitStr && unitStr.includes('သိန်း')) return val * 100000
        if (unitStr && unitStr.includes('သောင်း')) return val * 10000
        if (unitStr && unitStr.toLowerCase() === 'k') return val * 1000
        if (val < 20) return val * 100000
        return val
      }
      const min = parseVal(rangeMatch[1], rangeMatch[2])
      const max = parseVal(rangeMatch[4], rangeMatch[5])
      return {
        type: 'range',
        target: null,
        minPrice: Math.min(min, max),
        maxPrice: Math.max(min, max),
        label: `${Number(Math.min(min, max)).toLocaleString()} ကျပ် မှ ${Number(Math.max(min, max)).toLocaleString()} ကျပ် ကြား`,
      }
    }
  }

  const qForPrice = q
    .replace(
      /\b(?!keyboard|keyboards|mouse|mice|switch|switches|keycap|keycaps|pad|mousepad|glasspad|barebone|controller|price|cost|around|under|above|below|over)[a-z]{1,5}\s*\d+(?!\s*(?:သိန်း|သောင်း|ကျပ်|ks|kyats|k\b|ခွဲ|ဝန်းကျင်|ပတ်ချာလည်|အောက်|မကျော်|အထက်|ကျော်))/gi,
      ' '
    )
    .replace(/\b\d+\s*(?:cm|mm|key|keys|pin|g|mah|hz|%)\b/gi, ' ')

  const priceRegex = /(\d+(?:\.\d+)?)\s*(သိန်းခွဲ|သောင်းခွဲ|သိန်း|သောင်း|ks|kyats|ကျပ်|k(?![a-z])|lakh)?\s*(ခွဲ)?\s*(ဝန်းကျင်|ပတ်ချာလည်|around|approx|about|အောက်|မကျော်|အတွင်း|under|below|အထက်|ကျော်|above|over)?/i
  const match = qForPrice.match(priceRegex)

  if (match && match[1]) {
    let num = parseFloat(match[1])
    const unit = (match[2] || '').toLowerCase()
    const isKwal = match[3] === 'ခွဲ' || unit.includes('ခွဲ')

    const isKeyboardLayoutSize = [60, 65, 68, 75, 80, 84, 87, 96, 98, 100, 104, 108].includes(Math.round(num))
    if (isKeyboardLayoutSize && !unit.includes('သိန်း') && !unit.includes('သောင်း') && !unit.includes('ကျပ်') && !unit.includes('ks') && !q.includes('စျေး') && !q.includes('ဈေး') && !q.includes('ဝန်းကျင်')) {
      return null
    }

    const isAround = /(ဝန်းကျင်|ပတ်ချာလည်|around|approx|about)/i.test(qForPrice)
    const isUnder = /(အောက်|မကျော်|အတွင်း|under|below|less)/i.test(qForPrice)
    const isAbove = /(အထက်|ကျော်|above|over|more)/i.test(qForPrice)

    if (!unit && !isAround && !isUnder && !isAbove && num < 1000) {
      return null
    }

    if (isKwal) {
      num += 0.5
    }

    let targetAmount = null
    if (unit.includes('သိန်း') || qForPrice.includes('သိန်း')) {
      targetAmount = num * 100000
    } else if (unit.includes('သောင်း') || qForPrice.includes('သောင်း')) {
      targetAmount = num * 10000
    } else if (unit === 'k' || unit.includes('lakh')) {
      if (unit.includes('lakh')) targetAmount = num * 100000
      else targetAmount = num * 1000
    } else if (num < 20 && (isAround || isUnder || isAbove)) {
      targetAmount = num * 100000
    } else if (num < 100 && (isAround || isUnder || isAbove)) {
      targetAmount = num * 10000
    } else if (num >= 1000) {
      targetAmount = num
    }

    if (targetAmount) {
      if (isAround || (!isUnder && !isAbove)) {
        const tolerance = 50000
        const minPrice = Math.max(0, targetAmount - tolerance)
        const maxPrice = targetAmount + tolerance
        return {
          type: 'around',
          target: targetAmount,
          minPrice,
          maxPrice,
          label: `${Number(targetAmount).toLocaleString()} ကျပ် ဝန်းကျင် (${Number(minPrice).toLocaleString()} မှ ${Number(maxPrice).toLocaleString()} ကျပ် ကြား)`,
        }
      }

      if (isUnder) {
        return {
          type: 'under',
          target: targetAmount,
          minPrice: 0,
          maxPrice: targetAmount,
          label: `${Number(targetAmount).toLocaleString()} ကျပ် အောက်`,
        }
      }

      if (isAbove) {
        return {
          type: 'above',
          target: targetAmount,
          minPrice: targetAmount,
          maxPrice: Infinity,
          label: `${Number(targetAmount).toLocaleString()} ကျပ် အထက်`,
        }
      }
    }
  }
  return null
}

// Helper to check if product is in price range
const isProductInPriceRange = (p, minPrice, maxPrice) => {
  const kv = p.var_group
  if (kv) {
    const pMin = kv.price_min != null ? kv.price_min : Number(p.selling_price || 0)
    const pMax = kv.price_max != null ? kv.price_max : pMin
    return pMin <= maxPrice && pMax >= minPrice
  }
  const price = Number(p.selling_price || 0)
  return price >= minPrice && price <= maxPrice
}

export default function ChatWidget({ products = [], categories = [], onSelectProduct }) {
  const { currentStore } = useStore()
  const { totalItems, cartItems, totalPrice, setIsCartOpen } = useCart()
  const { wishlistCount, wishlist, recentlyViewed, setIsWishlistOpen } = useWishlist()
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(1)
  const [isAtTop, setIsAtTop] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)

  // Customer identity loaded from browser cache (localStorage)
  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('ngrsine_customer_info')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return { name: '', phone: '', address: '', notes: '' }
  })

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight

      setIsAtTop(scrollTop < 120)
      setIsAtBottom(scrollTop + windowHeight >= docHeight - 120)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollPageToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollPageToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
  }

  // Toggle class on body and sync visualViewport (fixes iOS Safari / Dynamic Island / Notch top clipping)
  useEffect(() => {
    const root = document.documentElement
    const updateVisualViewport = () => {
      if (window.visualViewport) {
        root.style.setProperty('--vvh', `${window.visualViewport.height}px`)
        root.style.setProperty('--vvt', `${window.visualViewport.offsetTop}px`)
      }
    }

    if (isOpen) {
      document.body.classList.add('chat-is-open')
      updateVisualViewport()
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateVisualViewport)
        window.visualViewport.addEventListener('scroll', updateVisualViewport)
      }
    } else {
      document.body.classList.remove('chat-is-open')
      root.style.removeProperty('--vvh')
      root.style.removeProperty('--vvt')
    }
    return () => {
      document.body.classList.remove('chat-is-open')
      root.style.removeProperty('--vvh')
      root.style.removeProperty('--vvt')
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateVisualViewport)
        window.visualViewport.removeEventListener('scroll', updateVisualViewport)
      }
    }
  }, [isOpen])

  // Persistent session ID for chat sync with dashboard
  const [sessionId] = useState(() => {
    try {
      let sid = localStorage.getItem('ngrsine_chat_session_id_v1')
      if (!sid) {
        sid = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7)
        localStorage.setItem('ngrsine_chat_session_id_v1', sid)
      }
      return sid
    } catch (e) {
      return 'sess_' + Date.now().toString(36)
    }
  })
  const lastMsgIdRef = useRef(0)

  // Construct snapshot of browser cache memory
  const getMemorySnapshot = (overrideName = null, overridePhone = null) => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const platform = isMobile
        ? navigator.userAgent.includes('iPhone')
          ? 'Mobile (iOS)'
          : 'Mobile (Android)'
        : 'Desktop'

      const currentName = (overrideName !== null ? overrideName : customerInfo.name || '').trim()
      const currentPhone = (overridePhone !== null ? overridePhone : customerInfo.phone || '').trim()

      return {
        name: currentName,
        phone: currentPhone,
        address: customerInfo.address || '',
        cart: (cartItems || []).map((i) => ({
          name: i.name,
          qty: i.quantity || 1,
          price: i.price,
          model: i.option || i.color || '',
        })),
        cart_count: totalItems || 0,
        cart_total: totalPrice || 0,
        wishlist_count: wishlistCount || 0,
        wishlist_items: (wishlist || []).slice(0, 5).map((w) => w.name),
        recently_viewed: (recentlyViewed || []).slice(0, 5).map((v) => (typeof v === 'string' ? v : v.name || '')),
        device: platform,
        updated_at: new Date().toISOString(),
      }
    } catch (e) {
      return {}
    }
  }

  // Sync customer memory snapshot to POS server
  const syncMemoryToServer = (overrideName = null, overridePhone = null) => {
    try {
      const memSnapshot = getMemorySnapshot(overrideName, overridePhone)
      localStorage.setItem('ngrsine_customer_memory_v1', JSON.stringify(memSnapshot))

      fetch('/api/shop/chat-session-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          customer_name: memSnapshot.name || '',
          customer_phone: memSnapshot.phone || '',
          customer_memory: memSnapshot,
        }),
      }).catch(() => {})

      return memSnapshot
    } catch (e) {
      return {}
    }
  }

  // Periodic/event-based sync when cart or widget opens
  useEffect(() => {
    if (isOpen) {
      syncMemoryToServer()
    }
  }, [isOpen, cartItems, totalItems, customerInfo])

  // Context memory across chat turns
  const [lastProduct, setLastProduct] = useState(null)
  const [lastCategory, setLastCategory] = useState(null)

  // Initial welcome message
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ngrsine_chat_history_v3')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return [
      {
        id: 1,
        sender: 'bot',
        text: `မင်္ဂလာပါခင်ဗျာ! 🙏 <b>Ngr Sine</b> မှ ကြိုဆိုပါတယ်။\n\nဘာများ ကူညီပေးရမလဲခင်ဗျာ?`,
        products: [],
        allProducts: [],
        visibleCount: 6,
        categoryChips: [],
        timestamp: new Date().toISOString(),
      },
    ]
  })

  // Poll for admin replies from server
  useEffect(() => {
    let isMounted = true
    const pollAdminMessages = async () => {
      try {
        const res = await fetch(`/api/shop/chat-poll?session_id=${encodeURIComponent(sessionId)}&after_id=${lastMsgIdRef.current}`)
        if (!res.ok) return
        const data = await res.json()
        if (!isMounted || !data.messages || data.messages.length === 0) return

        const newAdminMsgs = data.messages.filter((m) => m.sender === 'admin')
        if (newAdminMsgs.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.remoteId || m.id))
            const toAdd = newAdminMsgs
              .filter((m) => !existingIds.has(m.id))
              .map((m) => ({
                id: Date.now() + m.id,
                remoteId: m.id,
                sender: 'admin',
                senderName: m.sender_name || 'Ngr Sine Admin',
                text: m.text,
                timestamp: m.created_at,
              }))
            if (toAdd.length === 0) return prev
            if (!isOpen) {
              setUnreadCount((c) => c + toAdd.length)
            }
            return [...prev, ...toAdd]
          })
        }

        const maxId = Math.max(...data.messages.map((m) => m.id))
        if (maxId > lastMsgIdRef.current) {
          lastMsgIdRef.current = maxId
        }
      } catch (err) {}
    }

    const interval = setInterval(pollAdminMessages, isOpen ? 3000 : 8000)
    pollAdminMessages()
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [sessionId, isOpen])

  // Save chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ngrsine_chat_history_v3', JSON.stringify(messages))
    } catch (e) {}
  }, [messages])

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setUnreadCount(0)
    }
  }, [isOpen, messages, isTyping])

  // Clear chat history
  const handleClearHistory = () => {
    const defaultMsg = [
      {
        id: Date.now(),
        sender: 'bot',
        text: `မင်္ဂလာပါခင်ဗျာ! 🙏 <b>Ngr Sine</b> မှ ကြိုဆိုပါတယ်။\n\nဘာများ ကူညီပေးရမလဲခင်ဗျာ?`,
        products: [],
        allProducts: [],
        visibleCount: 6,
        categoryChips: [],
        timestamp: new Date().toISOString(),
      },
    ]
    setMessages(defaultMsg)
    setLastProduct(null)
    setLastCategory(null)
    try {
      localStorage.removeItem('ngrsine_chat_history_v3')
    } catch (e) {}
  }

  // Quick suggestion prompts
  const suggestions = [
    '⚡ Instock ဘာတွေရှိလဲ',
    '⌨️ Instock Keyboard များ',
    '🖱️ Mouse ဘာတွေရလဲ',
    '🔘 Switch များ ကြည့်ချင်လို့',
    '💄 Skincare ပစ္စည်းများ',
    '📦 မှာယူနည်းနှင့် ပို့ခ',
    '📍 ဆိုင်လိပ်စာနှင့် ဖုန်း',
  ]

  // Helper to format product price
  const formatPrice = (p) => {
    const kv = p.var_group
    if (kv) {
      if (kv.price_min === kv.price_max) {
        return `${Number(kv.price_min).toLocaleString()} Ks`
      }
      return `${Number(kv.price_min).toLocaleString()} – ${Number(kv.price_max).toLocaleString()} Ks`
    }
    return `${Number(p.selling_price || 0).toLocaleString()} Ks`
  }

  // Helper to check if product is in stock
  const isProductInStock = (p) => {
    return p.var_group ? !!p.var_group.in_stock : p.stock_status === 'instock'
  }

  // Helper to format stock status text
  const formatStock = (p) => {
    return isProductInStock(p)
      ? '✅ <b>ပစ္စည်း အဆင်သင့် ရှိပါသည် (In-stock)</b>'
      : '📦 <b>Pre-order မှာယူနိုင်ပါသည်</b>'
  }

  // Helper to get raw price for sorting
  const getRawPrice = (p) => {
    return p.var_group ? p.var_group.price_min : Number(p.selling_price || 0)
  }

  // Count instock items per category
  const getCategoryInstockBreakdown = () => {
    const map = {}
    products.forEach((p) => {
      const cat = p.category || 'Other'
      if (!map[cat]) {
        map[cat] = { total: 0, instock: 0 }
      }
      map[cat].total += 1
      if (isProductInStock(p)) {
        map[cat].instock += 1
      }
    })
    return map
  }

  // Sort products: In-stock first by default, preserving price/target sorting when requested
  const sortProductsSmart = (list, { isCheapest = false, isMostExpensive = false, isBestOrRecommend = false, priceFilter = null, hasPreorderFilter = false } = {}) => {
    const arr = [...list]
    if (isCheapest) {
      return arr.sort((a, b) => {
        if (!hasPreorderFilter) {
          const stockDiff = Number(isProductInStock(b)) - Number(isProductInStock(a))
          if (stockDiff !== 0) return stockDiff
        }
        return getRawPrice(a) - getRawPrice(b)
      })
    }
    if (isMostExpensive) {
      return arr.sort((a, b) => getRawPrice(b) - getRawPrice(a))
    }
    if (priceFilter?.target) {
      return arr.sort((a, b) => {
        const stockDiff = Number(isProductInStock(b)) - Number(isProductInStock(a))
        if (!hasPreorderFilter && stockDiff !== 0) return stockDiff
        return Math.abs(getRawPrice(a) - priceFilter.target) - Math.abs(getRawPrice(b) - priceFilter.target)
      })
    }
    return arr.sort((a, b) => {
      if (!hasPreorderFilter) {
        const stockDiff = Number(isProductInStock(b)) - Number(isProductInStock(a))
        if (stockDiff !== 0) return stockDiff
      }
      if (isBestOrRecommend) {
        return getRawPrice(b) - getRawPrice(a)
      }
      return getRawPrice(a) - getRawPrice(b)
    })
  }

  // Find specific product(s) mentioned in a query (ignoring generic category/feature/modifier words)
  const findSpecificProductsInQuery = (userQuery) => {
    const qLow = (userQuery || '').toLowerCase()

    const idMatch = userQuery.match(/(?:product\s*id|id|#)\s*[:#-]?\s*#?(\d+)\b/i)
    if (idMatch) {
      const prodId = parseInt(idMatch[1], 10)
      const exact = products.find((p) => Number(p.id) === prodId)
      if (exact) return [exact]
    }

    const cleaned = qLow
      .replace(BURMESE_PARTICLES_REGEX, ' ')
      .replace(/(material|ပစ္စည်းသား|pbt|abs|aluminum|အလူမီနီယံ|plastic|ကိုယ်ထည်|အသား|sound\s*test|အသံနားထောင်|အသံစမ်း|အသံပြ|video|ဗီဒီယို|battery|ဘက်ထရီ|ခံလဲ|mac|apple|windows|ios|android|phone|dpi|sensor|polling|rate|profile|weight|အလေးချိန်|gasket|knob|အရောင်|color|colour|ဘာလဲ|ဘယ်လို|ရလား|ပါလား|သုံးလို့ရလား|ကောင်းလား|ဘာကွာလဲ|ကွာခြားချက်|ရှင်းပြ|အသေးစိတ်|သိချင်လို့|ဘယ်လိုလဲ|အဆင်ပြေလား|ဘာတွေပါလဲ)/gi, ' ')
      .trim()

    const rawTokens = cleaned.split(/[\s,၊?]+/).filter((w) => w.length >= 2)
    const distinctiveTokens = rawTokens.filter((t) => !GENERIC_MODIFIER_WORDS.has(t.toLowerCase()) && !/[\u1000-\u109F]/.test(t))

    if (distinctiveTokens.length === 0) return []

    const scored = []
    for (const p of products) {
      const pName = p.name || ''
      let matchedDistinctive = 0
      let matchedAll = 0

      for (const dt of distinctiveTokens) {
        if (tokenMatchesName(dt, pName)) matchedDistinctive++
      }
      if (matchedDistinctive === 0) continue

      for (const rt of rawTokens) {
        if (tokenMatchesName(rt, pName)) matchedAll++
      }

      let score = matchedDistinctive * 50 + matchedAll * 20
      if (matchedDistinctive === distinctiveTokens.length) score += 60
      if (!rawTokens.includes('he') && /\bhe\b/i.test(pName)) score -= 15
      if (!rawTokens.includes('max') && /\bmax\b/i.test(pName)) score -= 10
      if (!rawTokens.includes('pro') && /\bpro\b/i.test(pName)) score -= 10
      if (!rawTokens.includes('ultra') && /\bultra\b/i.test(pName)) score -= 10

      scored.push({ product: p, score, matchedDistinctive })
    }

    if (scored.length === 0) return []

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return Number(isProductInStock(b.product)) - Number(isProductInStock(a.product))
    })

    const topScore = scored[0].score
    return scored.filter((s) => s.score >= topScore - 15).map((s) => s.product)
  }

  // Compare two products side-by-side (e.g. "f75 နဲ့ ak820 ဘာကွာလဲ", "sc620 vs sc525")
  const handleProductComparison = (userQuery) => {
    const qTrim = (userQuery || '').trim()
    const isCompare =
      /(?:နဲ့|နှင့်|\bvs\.?\b|\bversus\b).*?(?:ဘာကွာ|ကွာခြား|ဘယ်ဟာ|နှိုင်းယှဉ်|compare|ပိုကောင်း|ရွေးရမလဲ)/i.test(qTrim) ||
      /\bvs\.?\b/i.test(qTrim)

    if (!isCompare) return null

    const parts = qTrim.split(/\s*(?:နဲ့|နှင့်|\bvs\.?\b|\bversus\b)\s*/i)
    if (parts.length < 2) return null

    const leftMatches = findSpecificProductsInQuery(parts[0])
    const rightMatches = findSpecificProductsInQuery(parts.slice(1).join(' '))

    if (leftMatches.length === 0 || rightMatches.length === 0) return null
    const pA = leftMatches[0]
    const pB = rightMatches.find((p) => p.id !== pA.id) || rightMatches[0]
    if (!pA || !pB || pA.id === pB.id) return null

    const extractHighlights = (p) => {
      const lines = (p.content || '')
        .split(/[\r\n]+/)
        .filter((raw) => !raw.trim().startsWith('#') && !/#[a-zA-Z0-9_]{3,}/.test(raw))
        .map((l) => l.replace(/^[\*\-\s•#>]+/, '').replace(/\*\*(.*?)\*\*/g, '$1').trim())
        .filter(
          (l) =>
            l.length > 15 &&
            l.length < 220 &&
            !l.startsWith('![') &&
            !l.endsWith('?') &&
            !/(ဘာလို့|ထူးခြားချက်တွေကတော့|ရောက်ရှိလို့|လက်မလွတ်ရအောင်|Direct Message|မှာယူနိုင်ပါပြီ)/i.test(l)
        )
      return lines.slice(0, 2).join(' | ') || `${p.category || 'Gaming'} ပစ္စည်းကောင်းတစ်ခု ဖြစ်ပါသည်။`
    }

    const priceA = formatPrice(pA)
    const priceB = formatPrice(pB)
    const stockA = formatStock(pA)
    const stockB = formatStock(pB)
    const connA = pA.connection || (/(tri-mode|wireless|bluetooth)/i.test(pA.content || '') ? 'Tri-Mode (Wireless / BT / Wired)' : 'Wired / Standard')
    const connB = pB.connection || (/(tri-mode|wireless|bluetooth)/i.test(pB.content || '') ? 'Tri-Mode (Wireless / BT / Wired)' : 'Wired / Standard')

    let recommendation = ''
    if (isProductInStock(pA) && !isProductInStock(pB)) {
      recommendation = `💡 <b>အကြံပြုချက်:</b> စောင့်စရာမလိုဘဲ ချက်ချင်းလိုချင်ပါက In-stock အသင့်ရှိသော <b>${pA.name} (🆔 #${pA.id})</b> ကို ရွေးချယ်သင့်ပါသည်ခင်ဗျာ။`
    } else if (isProductInStock(pB) && !isProductInStock(pA)) {
      recommendation = `💡 <b>အကြံပြုချက်:</b> စောင့်စရာမလိုဘဲ ချက်ချင်းလိုချင်ပါက In-stock အသင့်ရှိသော <b>${pB.name} (🆔 #${pB.id})</b> ကို ရွေးချယ်သင့်ပါသည်ခင်ဗျာ။`
    } else if (getRawPrice(pA) < getRawPrice(pB)) {
      recommendation = `💡 <b>အကြံပြုချက်:</b> Budget သက်သာပြီး တန်ဖိုးရှိတာ လိုချင်ပါက <b>${pA.name} (🆔 #${pA.id})</b>၊ Feature ပိုမြင့်တာ လိုချင်ပါက <b>${pB.name} (🆔 #${pB.id})</b> ကို ရွေးချယ်နိုင်ပါသည်ခင်ဗျာ။`
    } else {
      recommendation = `💡 <b>အကြံပြုချက်:</b> မော်ဒယ်နှစ်ခုလုံး လူကြိုက်များပြီး အရည်အသွေးကောင်းမွန်သဖြင့် မိမိနှစ်သက်ရာ ဒီဇိုင်းနှင့် စျေးနှုန်းအလိုက် ရွေးချယ်နိုင်ပါသည်ခင်ဗျာ။`
    }

    const text =
      `⚖️ <b>${pA.name} နှင့် ${pB.name} နှိုင်းယှဉ်ချက်:</b>\n\n` +
      `1️⃣ <b>${pA.name} (🆔 #${pA.id})</b>\n` +
      `   • 💰 စျေးနှုန်း: <b>${priceA}</b>\n` +
      `   • 📊 အခြေအနေ: ${stockA}\n` +
      `   • 🔌 ချိတ်ဆက်မှု: ${connA}\n` +
      `   • ✨ ထူးခြားချက်: ${extractHighlights(pA)}\n\n` +
      `2️⃣ <b>${pB.name} (🆔 #${pB.id})</b>\n` +
      `   • 💰 စျေးနှုန်း: <b>${priceB}</b>\n` +
      `   • 📊 အခြေအနေ: ${stockB}\n` +
      `   • 🔌 ချိတ်ဆက်မှု: ${connB}\n` +
      `   • ✨ ထူးခြားချက်: ${extractHighlights(pB)}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `${recommendation}`

    return {
      text,
      products: [pA, pB],
      allProducts: [pA, pB],
      visibleCount: 2,
    }
  }

  // Answer specific questions about product materials, switches, specs, connectivity, and features
  const answerProductSpecificationQuery = (product, userQuery, siblingVariants = []) => {
    const qLow = (userQuery || '').toLowerCase()
    const content = product.content || ''
    const name = product.name
    const id = product.id
    const price = formatPrice(product)
    const stock = formatStock(product)
    const kv = product.var_group

    const otherSiblings = (siblingVariants || []).filter((s) => s.id !== product.id).slice(0, 3)
    const siblingNote =
      otherSiblings.length > 0
        ? `\n📌 <b>ဆက်စပ် ရွေးချယ်နိုင်သော မော်ဒယ်ကွဲများ:</b>\n` +
          otherSiblings.map((s) => `   • <b>${s.name}</b> (🆔 #${s.id}) — <b>${formatPrice(s)}</b> | ${isProductInStock(s) ? '✅ In-stock' : '📦 Pre-order'}`).join('\n') +
          '\n'
        : ''

    // 1. MATERIAL & BUILD QUALITY INTENT
    if (/(material|ပစ္စည်းသား|pbt|abs|aluminum|အလူမီနီယံ|plastic|သံ|ကိုယ်ထည်|အသား|ဘာသား)/i.test(qLow)) {
      const lines = content.split(/[\r\n]+/)
      const materialLines = lines.filter(
        (l) => !l.trim().startsWith('#') && /(material|pbt|abs|aluminum|cnc|alloy|plastic|ptfe|glass|ကိုယ်ထည်|အသား|ဖန်သား)/i.test(l)
      )

      let matDetail = ''
      if (materialLines.length > 0) {
        matDetail = materialLines
          .map((l) =>
            l
              .replace(/^[\*\-\s•]+/, '')
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
              .replace(/\*\*/g, '')
              .trim()
          )
          .join('\n• ')
      } else if (product.category === 'Keycaps') {
        matDetail = '<b>Premium PBT Material</b> ကို အသုံးပြုထားပြီး အရောင်လွင့်ခြင်း၊ ဆီပြန်ပြောင်လက်ခြင်း ကင်းဝေးကာ စာရိုက်ရတာ Matte Feel ဖြင့် အမြဲ သက်တောင့်သက်သာ ရှိစေပါသည်ခင်ဗျာ။'
      } else if (product.category === 'Glasspad') {
        matDetail = '<b>Tempered Micro-Etched Glass (အဆင့်မြင့် ဖန်သားပြင်)</b> ဖြင့် ပြုလုပ်ထားပြီး ရေစိုခံကာ ပွန်းပဲ့ခြင်းမရှိဘဲ နှစ်ပေါင်းများစွာ ချောမွေ့စွာ အသုံးပြုနိုင်ပါသည်ခင်ဗျာ။'
      } else {
        matDetail = 'အရည်အသွေးမြင့် ခိုင်ခံ့သော Premium Build Quality ဖြင့် ဖန်တီးတည်ဆောက်ထားပါသည်ခင်ဗျာ။'
      }

      const text =
        `✨ <b>${name} (🆔 #${id}) ၏ Material နှင့် Build Quality အချက်အလက်:</b>\n\n` +
        `• ${matDetail}\n` +
        `${siblingNote}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 <b>စျေးနှုန်း:</b> <b>${price}</b> | ${stock}\n` +
        `📁 <b>အမျိုးအစား:</b> ${product.category}`

      return {
        text,
        products: [product, ...otherSiblings],
        allProducts: [product, ...otherSiblings],
        visibleCount: 4,
      }
    }

    // 2. COLOR / VARIANT / OPTION INTENT
    if (/(အရောင်|color|colour|ဘာအရောင်|variant|option|ရွေးချယ်)/i.test(qLow)) {
      const colors = kv?.colors?.length ? kv.colors.join(', ') : (product.colors || 'ပုံမှန် မူရင်းအရောင် (Standard Color)')
      const options = kv?.options?.length ? `\n• <b>${kv.option_label || 'Switch / Option'}:</b> ${kv.options.join(', ')}` : ''
      const text =
        `🎨 <b>${name} (🆔 #${id}) အတွက် ရွေးချယ်နိုင်သော အရောင်နှင့် Options:</b>\n\n` +
        `• <b>ရနိုင်သော အရောင်များ:</b> <b>${colors}</b>${options}\n` +
        `${siblingNote}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 <b>စျေးနှုန်း:</b> <b>${price}</b> | ${stock}`

      return {
        text,
        products: [product, ...otherSiblings],
        allProducts: [product, ...otherSiblings],
        visibleCount: 4,
      }
    }

    // 3. SWITCH & SOUND INTENT
    if (/(switch|ဆွစ်|အသံ|sound|thock|clack|creamy|silent|linear|tactile|အသံဘယ်လို)/i.test(qLow)) {
      const lines = content.split(/[\r\n]+/)
      const switchLines = lines.filter(
        (l) => !l.trim().startsWith('#') && /(switch|ဆွစ်|အသံ|sound|thock|clack|creamy|silent|linear|tactile|gasket|foam|magnetic|hall\s*effect)/i.test(l)
      )

      let soundDetail = ''
      if (switchLines.length > 0) {
        soundDetail = switchLines
          .slice(0, 5)
          .map((l) =>
            l
              .replace(/^[\*\-\s•]+/, '')
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
              .replace(/\*\*/g, '')
              .trim()
          )
          .join('\n• ')
      } else {
        const remark = kv?.combos?.find((c) => c.remark)?.remark || product.remarks
        soundDetail = remark
          ? `<b>${remark}</b>`
          : `အသုံးပြုရတာ အဆင်ပြေချောမွေ့ပြီး အသံထွက်ကောင်းမွန်သော Switch & Mount စနစ်ကို အသုံးပြုထားပါသည်ခင်ဗျာ။`
      }

      const text =
        `🎵 <b>${name} (🆔 #${id}) ၏ Switch နှင့် အသံပိုင်းဆိုင်ရာ အချက်အလက်:</b>\n\n` +
        `• ${soundDetail}\n` +
        `${siblingNote}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 <b>စျေးနှုန်း:</b> <b>${price}</b> | ${stock}`

      return {
        text,
        products: [product, ...otherSiblings],
        allProducts: [product, ...otherSiblings],
        visibleCount: 4,
      }
    }

    // 4. CONNECTIVITY, WIRELESS & BATTERY INTENT
    if (/(wireless|ကြိုးမဲ့|bluetooth|2\.4g|tri-mode|trimode|battery|ဘက်ထရီ|ခံလဲ|type-c|ကြိုး|wire|အားသွင်း)/i.test(qLow)) {
      const connStr = product.connection || ''
      const lines = content.split(/[\r\n]+/)
      const connLines = lines.filter(
        (l) => !l.trim().startsWith('#') && /(wireless|bluetooth|2\.4g|tri-mode|battery|mah|type-c|ကြိုး|အားသွင်း|polling)/i.test(l)
      )

      let detail = ''
      if (connLines.length > 0) {
        detail = connLines
          .slice(0, 5)
          .map((l) =>
            l
              .replace(/^[\*\-\s•]+/, '')
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
              .replace(/\*\*/g, '')
              .trim()
          )
          .join('\n• ')
      } else if (connStr) {
        detail = `<b>${connStr}</b> စနစ် ပါဝင်ပါသည်ခင်ဗျာ။`
      } else {
        detail = `တည်ငြိမ်မြန်ဆန်သော ချိတ်ဆက်မှုစနစ် ပါဝင်ပါသည်ခင်ဗျာ။`
      }

      const text =
        `🔋 <b>${name} (🆔 #${id}) ၏ ချိတ်ဆက်မှုနှင့် ဘက်ထရီ အချက်အလက်:</b>\n\n` +
        `• ${detail}\n` +
        `${siblingNote}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 <b>စျေးနှုန်း:</b> <b>${price}</b> | ${stock}`

      return {
        text,
        products: [product, ...otherSiblings],
        allProducts: [product, ...otherSiblings],
        visibleCount: 4,
      }
    }

    // 5. COMPATIBILITY (Mac / Windows / iOS / Android)
    if (/(mac|apple|macbook|windows|ios|android|ipad|phone|ဖုန်းနဲ့)/i.test(qLow)) {
      const text =
        `💻 <b>${name} (🆔 #${id}) ၏ OS & Device Compatibility:</b>\n\n` +
        `• <b>Windows / PC:</b> Windows 10, 11 နှင့် အပြည့်အဝ ချိတ်ဆက်အသုံးပြုနိုင်ပါသည်ခင်ဗျာ။\n` +
        `• <b>Mac / macOS:</b> MacBook / iMac များနှင့် ချောမွေ့စွာ အသုံးပြုနိုင်ပါသည်ခင်ဗျာ။\n` +
        `• <b>Mobile / Tablet:</b> Bluetooth / 2.4GHz ပါဝင်သော မော်ဒယ်များကို iPad, iPhone, Android ဖုန်းများနှင့်ပါ ချိတ်ဆက်သုံးနိုင်ပါသည်။\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 <b>စျေးနှုန်း:</b> <b>${price}</b> | ${stock}`

      return {
        text,
        products: [product, ...otherSiblings],
        allProducts: [product, ...otherSiblings],
        visibleCount: 4,
      }
    }

    // 6. GENERAL DETAILED SPECIFICATION / FEATURE BREAKDOWN
    const cleanContent = content
      .replace(/^#+.*$/gm, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*\*/g, '')
      .trim()

    const paragraphs = cleanContent
      .split(/[\r\n]{2,}/)
      .filter((p) => !p.trim().startsWith('#') && p.trim().length > 15)
    const mainFeatureText =
      paragraphs.slice(0, 3).join('\n\n') ||
      `• <b>အမျိုးအစား:</b> ${product.category || 'Gaming Peripheral'}\n` +
        (product.connection ? `• <b>ချိတ်ဆက်မှု:</b> ${product.connection}\n` : '') +
        (kv?.colors?.length ? `• <b>အရောင်များ:</b> ${kv.colors.join(', ')}\n` : '')

    const text =
      `📋 <b>${name} (🆔 #${id}) ၏ အသေးစိတ် အချက်အလက်များနှင့် Features များ:</b>\n\n` +
      `${mainFeatureText}\n` +
      `${siblingNote}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 <b>စျေးနှုန်း:</b> <b>${price}</b> | ${stock}\n` +
      `📁 <b>အမျိုးအစား:</b> ${product.category}`

    return {
      text,
      products: [product, ...otherSiblings],
      allProducts: [product, ...otherSiblings],
      visibleCount: 4,
    }
  }

  // Proactive handler for realistic customer scenarios (Layouts, Use-Cases, Switch Calc, Keycap Themes, Pads, Skincare, Store Policies)
  const handleProactiveCustomerScenarios = (
    userQuery,
    {
      specificMatchedProducts = [],
      targetCategories = [],
      matchedBrands = [],
      priceFilter = null,
      hasInstockFilter = false,
      isCheapest = false,
      isMostExpensive = false,
    } = {}
  ) => {
    const q = normalizeMyanglish(userQuery || '').trim().toLowerCase()

    const formatListReply = (title, intro, list, footer = '', preserveOrder = false) => {
      let sorted = preserveOrder && !isCheapest && !isMostExpensive && !priceFilter
        ? [...list]
        : sortProductsSmart(list, { isCheapest, isMostExpensive, priceFilter })
      if (priceFilter) {
        const pf = sorted.filter((p) => isProductInPriceRange(p, priceFilter.minPrice, priceFilter.maxPrice))
        if (pf.length > 0) sorted = pf
      }
      if (hasInstockFilter) {
        const instockOnly = sorted.filter(isProductInStock)
        if (instockOnly.length > 0) sorted = instockOnly
      }
      const top = sorted.slice(0, 6)
      let text = `${title}\n\n${intro}`
      if (footer) text += `\n\n${footer}`
      return {
        text: text.trim(),
        products: top,
        allProducts: sorted,
        visibleCount: 6,
      }
    }

    // A1. Authenticity / Original / Brand New check
    if (/(အစစ်လား|original\s*လား|authentic|official\s*လား|clone\s*လား|အတုလား|ဘူးအသစ်|brand\s*new|ဖောက်ပြီးသားလား|second\s*hand|အဟောင်းလား|ပါကင်ပိတ်)/i.test(q)) {
      return {
        text:
          `🏅 <b>ပစ္စည်းစစ်မှန်မှုနှင့် အရည်အသွေး အာမခံချက် (100% Authentic & Brand New):</b>\n\n` +
          `• <b>100% Official Original:</b> ငါ့ဆိုင် (NgrSine Shop) တွင် ရောင်းချသော ပစ္စည်းအားလုံးသည် သက်ဆိုင်ရာ Official Brand ကုမ္ပဏီများမှ တိုက်ရိုက်တင်သွင်းထားသော <b>၁၀၀% အစစ်အမှန် (Genuine)</b> ပစ္စည်းများသာ ဖြစ်ပါသည်ခင်ဗျာ။\n` +
          `• <b>Factory Sealed (ပါကင်ပိတ် အသစ်စက်စက်):</b> Second-hand သို့မဟုတ် ပြန်လည်ပြုပြင်ထားသော ပစ္စည်း လုံးဝမရှိပါ။ စက်ရုံထုတ် ပါကင်ပိတ် ဘူးအသစ်များသာ ဖြစ်ပါသည်။\n` +
          `• <b>7-Day 1-to-1 Replacement:</b> ပစ္စည်းရောက်ရှိပြီး ၇ ရက်အတွင်း စက်ရုံထုတ်ချို့ယွင်းချက် (Factory Defect) ပါရှိပါက အသစ်တစ်ခု ချက်ချင်း လဲလှယ်ပေးပါသည်ခင်ဗျာ။`,
        products: [],
      }
    }

    // A2. Order Modification / Address Change / Cancellation
    if (/(order\s*cancel|အော်ဒါ\s*ဖျက်|မှာထားတာ\s*ဖျက်|မှာထားတာ\s*ပြင်|လိပ်စာ\s*ပြောင်း|ဖုန်းနံပါတ်\s*ပြောင်း|အရောင်\s*ပြောင်းချင်|မော်ဒယ်\s*ပြောင်းချင်)/i.test(q)) {
      return {
        text:
          `📝 <b>အော်ဒါ ပြင်ဆင်ခြင်း / လိပ်စာပြောင်းခြင်း / ပယ်ဖျက်ခြင်း:</b>\n\n` +
          `• <b>In-stock အော်ဒါများ:</b> Deli မအပ်နှံမီ အချိန်အတွင်း အရောင်၊ မော်ဒယ်၊ ဖုန်းနံပါတ် သို့မဟုတ် လိပ်စာကို အချိန်မရွေး ပြင်ဆင်/ပြောင်းလဲနိုင်ပါသည်ခင်ဗျာ။\n` +
          `• <b>Pre-order အော်ဒါများ:</b> စက်ရုံ/Supplier ဘက်မှ ပစ္စည်းမထွက်ခွာမီ ဆိုင်ရှင်ထံ ဆက်သွယ်၍ ပြင်ဆင်နိုင်ပါသည်။\n` +
          `• အမြန်ဆုံး ပြင်ဆင်ပေးနိုင်ရန် လူကြီးမင်း၏ <b>အမည်နှင့် ဖုန်းနံပါတ်</b> ကို ဆိုင်ရှင် <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a> သို့ တိုက်ရိုက် ပေးပို့ပေးပါခင်ဗျာ။`,
        products: [],
        categoryChips: [
          { label: `💬 ဆိုင်ရှင် @${currentStore?.telegram || 'mark03168_bot'} သို့ အော်ဒါပြင်မည်`, query: 'ဆိုင်ရှင်နဲ့ပြောချင်လို့' },
        ],
      }
    }

    // A3. Installment / Payment Methods Inquiry
    if (/(အရစ်ကျ|installment|bnpl|ဘာ\s*pay\s*တွေရ|kpay\s*နံပါတ်|wave\s*နံပါတ်|ငွေဘယ်လိုချေ)/i.test(q)) {
      return {
        text:
          `💳 <b>ငွေပေးချေမှု စနစ်များနှင့် အရစ်ကျ/စရန် အချက်အလက်:</b>\n\n` +
          `၁။ <b>အိမ်ရောက်ငွေချေ (COD):</b> In-stock ပစ္စည်းများကို Royal Express ရောက်သည့်မြို့တိုင်း ပစ္စည်းလက်ဝယ်ရောက်မှ ငွေချေနိုင်ပါသည်ခင်ဗျာ။\n` +
          `၂။ <b>Mobile Banking / Pay များ:</b> <b>KBZPay (KPay), WavePay, AYA Pay, CB Pay</b> အားလုံးဖြင့် ပေးချေနိုင်ပါသည်။\n` +
          `၃။ <b>Pre-order ၂ ရစ်ခွဲချေစနစ်:</b> သီးသန့် လစဉ်အရစ်ကျ မရှိသေးသော်လည်း Pre-order မှာယူပါက <b>စရန် 30%–50% သာ အရင်ပေးချေပြီး</b>၊ ပစ္စည်းရောက်ရှိချိန် (၂၆ ရက်အကြာ) မှသာ ကျန်ငွေကို အိမ်ရောက်ငွေချေ (COD) ဖြင့် ၂ ရစ်ခွဲ၍ ပေါ့ပေါ့ပါးပါး ပေးချေနိုင်ပါသည်ခင်ဗျာ!`,
        products: [],
      }
    }

    // A4. Software / Web Driver / Macro / Key Remap Inquiry
    if (specificMatchedProducts.length === 0 && /(software|driver|web\s*driver|qmk|\bvia\b|macro|remap|ဆော့ဖ်ဝဲ|ဒရိုင်ဘာ|key\s*ပြောင်း)/i.test(q)) {
      return {
        text:
          `💻 <b>Keyboard & Mouse Software / Web Driver အချက်အလက်:</b>\n\n` +
          `• <b>Web-Based Driver (Install လုပ်စရာမလို):</b> Magnetic Switch (HE) ကီးဘုတ်အများစု (Aula Win60/Hero68/Hero84, Attack Shark R85 HE, Madlions MAD60/68, MelGeek MADE68, Wooting, NuPhy, Keychron) သည် Chrome/Edge Browser မှတစ်ဆင့် တိုက်ရိုက် ချိန်ညှိနိုင်သော <b>Web Driver</b> ပါဝင်ပါသည်ခင်ဗျာ။\n` +
          `• <b>ချိန်ညှိနိုင်သော စနစ်များ:</b> Rapid Trigger (0.01mm–0.1mm), SOCD / Snap Tap, DKS, Key Remapping, Macro နှင့် RGB Lighting Effects များကို စိတ်ကြိုက် ချိန်ညှိနိုင်ပါသည်။\n` +
          `• <b>Official Windows/Mac Software:</b> Gaming Mouse များနှင့် Mechanical Keyboard များအတွက်လည်း သက်ဆိုင်ရာ Brand အလိုက် Official Software Link များကို ဆိုင်ရှင်ထံ အချိန်မရွေး တောင်းယူနိုင်ပါသည်ခင်ဗျာ။`,
        products: [],
      }
    }

    // A5. Custom Keyboard Build / Barebone Assembly / Modding / Lube
    if (/(custom\s*(?:ဆင်|build|keyboard)|barebone\s*ဆင်|အစအဆုံး\s*ဆင်|ကီးဘုတ်\s*ဆင်ချင်|mod\s*လုပ်|lube\s*လုပ်|lubed|တပ်ပေးလား|ဆင်ပေးလား)/i.test(q)) {
      const barebones = products.filter((p) => (p.category || '').toLowerCase() === 'barebone')
      const instockBarebone = barebones.filter(isProductInStock)
      const switchPuller = products.find((p) => Number(p.id) === 527)
      const sampleProducts = [...instockBarebone, ...barebones.filter((p) => !isProductInStock(p)).slice(0, 3), switchPuller].filter(Boolean)

      return {
        text:
          `🛠️ <b>Custom Keyboard ဆင်ယူခြင်းနှင့် Barebone Kit လမ်းညွှန်:</b>\n\n` +
          `မိမိစိတ်ကြိုက် အသံထွက် (Thocky / Creamy / Silent) နှင့် ဒီဇိုင်းရရှိအောင် Custom Keyboard ဆင်လိုပါက အောက်ပါ ၃ ဆင့်ဖြင့် အလွယ်တကူ ရွေးချယ်နိုင်ပါသည် -\n\n` +
          `၁။ <b>Barebone Kit (ခလုတ်အိမ်):</b> <b>VRTK 68key Barebone (#34 — 140,000 Ks, In-stock)</b> သို့မဟုတ် Pre-order Barebone များ\n` +
          `၂။ <b>Switch (ခလုတ်):</b> ဆိုင်ရှိ Switch ၁၄ မျိုးလုံး (၁ လုံး <b>420 Ks – 4,000 Ks</b>) သည် <b>Factory Pre-lubed</b> ဖြစ်ပြီး Hot-swap socket ထဲသို့ ဖိထည့်ရုံဖြင့် အသင့်သုံးနိုင်ပါသည်။\n` +
          `၃။ <b>Keycaps (ခလုတ်ခေါင်း):</b> In-stock PBT Keycap Set ၁၆ မျိုး (<b>36,000 Ks – 83,000 Ks</b>) စိတ်ကြိုက် ရွေးချယ်နိုင်ပါသည်။\n` +
          `🔧 <b>2 in 1 Switch & Keycap Puller (#527 — 14,000 Ks, In-stock)</b> လည်း အသင့်ရှိပါသည်ခင်ဗျာ။`,
        products: sampleProducts.slice(0, 6),
        allProducts: sampleProducts,
        visibleCount: 6,
      }
    }

    // B. SWITCH SPECIALIST CALCULATOR & TECHNICAL GUIDE
    const isSwitchCalcQuery =
      /(?:switch|ဆွစ်|ဆွစ်ချ်).*?(?:တစ်လုံး|၁လုံး|တလုံး|ဘယ်နှလုံး|ဘယ်နှစ်လုံး|အလုံးရေ|တစ်ဘူး|တစ်ဗူး|ကီးဘုတ်တစ်ခုစာ|ဘယ်လောက်လို|ဘယ်လောက်ကျ)/i.test(q) ||
      /(?:60%|65%|68%|75%|80%|tkl|full\s*size).*?(?:switch|ဆွစ်).*?(?:ဘယ်နှလုံး|ဘယ်နှစ်လုံး|ဘယ်လောက်)/i.test(q) ||
      /(?:switch|ဆွစ်).*?(?:တစ်လုံးစျေး|တစ်လုံးဈေး)/i.test(q)

    if (isSwitchCalcQuery) {
      const instockSwitches = sortProductsSmart(
        products.filter((p) => (p.category || '').toLowerCase() === 'switch' && isProductInStock(p))
      )
      return {
        text:
          `🔘 <b>Switch စျေးနှုန်းနှင့် ကီးဘုတ်အရွယ်အစားအလိုက် လိုအပ်သော အလုံးရေ လမ်းညွှန်:</b>\n\n` +
          `• ဆိုင်ရှိ Switch အားလုံးသည် <b>၁ လုံးချင်းစျေး (Per Switch Price: 420 Ks – 4,000 Ks)</b> ဖြစ်သောကြောင့် မိမိလိုအပ်သလောက် အလုံးရေအတိအကျ ဝယ်ယူနိုင်ပါသည်ခင်ဗျာ။\n\n` +
          `📏 <b>ကီးဘုတ် Layout အလိုက် လိုအပ်သော Switch အရေအတွက်:</b>\n` +
          `• <b>60% / 65% / 68% Keyboard:</b> <b>61 မှ 68 လုံး</b> (အပိုအပါ <b>70 လုံး</b> ဝယ်ယူသင့်ပါသည် — ဥပမာ Leobog Reaper 750 Ks × 70 = 52,500 Ks)\n` +
          `• <b>75% / 80% TKL Keyboard:</b> <b>82 မှ 87 လုံး</b> (အပိုအပါ <b>90 လုံး</b> ဝယ်ယူသင့်ပါသည် — ဥပမာ Leobog StarVector 900 Ks × 90 = 81,000 Ks)\n` +
          `• <b>96% / 98% / Full-Size Keyboard:</b> <b>98 မှ 108 လုံး</b> (အပိုအပါ <b>105–110 လုံး</b>)`,
        products: instockSwitches.slice(0, 6),
        allProducts: instockSwitches,
        visibleCount: 6,
      }
    }

    const isSwitchTechQuery =
      /(linear\s*နဲ့\s*tactile|tactile\s*နဲ့\s*linear|3\s*pin\s*နဲ့\s*5\s*pin|hot\s*swap\s*ဆိုတာ|hotswap\s*ဆိုတာ|magnetic\s*နဲ့\s*mechanical|switch\s*ဘယ်ဟာကောင်း)/i.test(q)

    if (isSwitchTechQuery && specificMatchedProducts.length === 0) {
      const instockSwitches = sortProductsSmart(
        products.filter((p) => (p.category || '').toLowerCase() === 'switch' && isProductInStock(p))
      )
      return {
        text:
          `⚙️ <b>Switch အမျိုးအစား ကွာခြားချက်နှင့် ရွေးချယ်နည်း လမ်းညွှန်:</b>\n\n` +
          `၁။ <b>Linear Switch (အချော):</b> နှိပ်လိုက်လျှင် အထစ်မရှိဘဲ အဆုံးထိ ချောမွေ့စွာ ဆင်းသွားပါသည်။ ဂိမ်းဆော့ရန်နှင့် စာရိုက်မြန်ရန် အသင့်တော်ဆုံး ဖြစ်ပါသည် (ဥပမာ - <b>Leobog Reaper #32</b>, <b>Greywood V4 #12</b>, <b>Ice Vein #29</b>, <b>Gateron Oil King #13</b>)။\n` +
          `၂။ <b>Tactile Switch (အထစ်ပါ):</b> နှိပ်လိုက်ချိန် အလယ်တွင် အထစ်လေး (Bump) ခံစားရပြီး စာရိုက်ရတာ လက်ဆိပ်ရှိကာ အမှားနည်းစေပါသည် (ဥပမာ - <b>Outemu Silent Lemon V3 #273</b>)။\n` +
          `၃။ <b>Silent Switch (အသံတိတ်):</b> ရုံးခန်းနှင့် ညဘက်သုံးရန် အသံလုံးဝမထွက်သော Switch ဖြစ်ပါသည် (ဥပမာ - <b>Outemu Silent Peach V3 #272</b>, <b>Silent Lemon V3 #273</b> — 900 Ks)။\n` +
          `၄။ <b>3-Pin နှင့် 5-Pin:</b> 5-Pin သည် ပိုမိုတည်ငြိမ်ပြီး 3-Pin socket ကီးဘုတ်များတွင်လည်း ဘေးပလတ်စတစ်ခြေထောက် ၂ ချောင်းကို ညှပ်၍ တပ်ဆင်နိုင်ပါသည်။`,
        products: instockSwitches.slice(0, 6),
        allProducts: instockSwitches,
        visibleCount: 6,
      }
    }

    // C. KEYCAP COMPATIBILITY, ANIME/GAME THEMES & CONTOUR/SHINE-THROUGH GUIDE
    if (specificMatchedProducts.length === 0 && /(key\s*caps?|ကီးကပ်|ခလုတ်ခေါင်း)/i.test(q)) {
      const allKeycaps = products.filter((p) => (p.category || '').toLowerCase() === 'keycaps')

      if (/(တော်လား|တပ်လို့ရလား|အဆင်ပြေလား|ဘယ်ကီးဘုတ်|layout|ဘယ်နှလုံးပါ|key\s*ဘယ်လောက်ပါ)/i.test(q)) {
        const instockKc = sortProductsSmart(allKeycaps.filter(isProductInStock))
        return {
          text:
            `🔤 <b>Keycaps တပ်ဆင်နိုင်မှု (Compatibility) လမ်းညွှန်:</b>\n\n` +
            `• <b>MX Stem (+) စနစ်:</b> ဆိုင်ရှိ Keycaps အားလုံးသည် အပေါင်းလက္ခဏာ <code>(+)</code> ပုံစံ တိုင်ပါသော Mechanical Switch နှင့် Magnetic (HE) Switch ကီးဘုတ်အားလုံးတွင် တပ်ဆင်နိုင်ပါသည်ခင်ဗျာ။\n` +
            `• <b>Supported Layouts:</b> တစ်ဘူးလျှင် <b>Key ၁၂၀ မှ ၁၄၀+ လုံး</b> အပြည့်အစုံ ပါဝင်သောကြောင့် <b>60%, 65%, 68%, 75%, 80% (TKL), 96%, 98% နှင့် 100% Full-Size</b> ကီးဘုတ်များအားလုံးနှင့် တော်ပါသည်။`,
          products: instockKc.slice(0, 6),
          allProducts: instockKc,
          visibleCount: 6,
        }
      }

      if (/(anime|အန်နီမေး|ဂိမ်း|game|cartoon|ကာတွန်း|ဇာတ်ကောင်|theme|လှတာ)/i.test(q)) {
        const themedKc = allKeycaps.filter((p) =>
          /(luffy|genshin|eva|samurai|mario|minecraft|cs:go|mecha|heart|spiderweb)/i.test(p.name)
        )
        return formatListReply(
          '🎨 <b>Anime, Game & Custom Theme Keycaps (In-stock အသင့်ရှိ):</b>',
          'ဂိမ်းနှင့် Anime ဇာတ်ကောင် ဒီဇိုင်း နှစ်သက်သူများအတွက် Premium PBT Keycaps များမှာ -',
          themedKc
        )
      }

      if (/(contour|topographic|မြေပုံ|လိုင်း|side\s*print|shine\s*through|အလင်းပေါက်|rgb\s*ပေါက်|transparent|အကြည်)/i.test(q)) {
        const contourKc = allKeycaps.filter((p) =>
          /(contour|transparent|spiderweb|black&white)/i.test(p.name)
        )
        return formatListReply(
          '✨ <b>Contour / Side-Print & RGB Shine-Through Keycaps (In-stock):</b>',
          'RGB မီးအလင်းရောင် လှပစွာ ပေါ်လွင်စေသော Contour နှင့် Transparent Keycaps များမှာ -',
          contourKc
        )
      }
    }

    // D. KEYBOARD LAYOUTS (60%, 65%/68%, 75%, 80%/TKL, FULL-SIZE/NUMPAD), ALUMINUM, LOW-PROFILE, SCREEN/KNOB
    const isKeyboardContext =
      targetCategories.some((c) => ['keyboard', 'barebone', 'numpad keyboard'].includes(c.toLowerCase())) ||
      /(keyboard|ကီးဘုတ်|barebone|ခလုတ်ခုံ|layout|\bkey\b)/i.test(q) ||
      /\b(60%|65%|68%|75%|80%|96%|98%|100%|tkl)\b/i.test(q)

    if (specificMatchedProducts.length === 0 && isKeyboardContext && matchedBrands.length === 0) {
      const kbPool = products.filter((p) =>
        ['keyboard', 'barebone'].includes((p.category || '').toLowerCase())
      )

      if (/(?:\b60\s*%|60\s*key|61\s*key|63\s*key|အသေးဆုံး\s*(?:keyboard|ကီးဘုတ်)|compact\s*keyboard)/i.test(q)) {
        const kb60 = kbPool.filter((p) => /(?:60|61|63)/i.test(p.name))
        return formatListReply(
          '⌨️ <b>60% Compact Layout Keyboards (61–63 Keys):</b>',
          'စားပွဲပေါ် နေရာမယူဘဲ Mouse ဆွဲရန် နေရာကျယ်ကျယ်ရရှိစေသော 60% Gaming Keyboards များမှာ -',
          kb60
        )
      }

      if (/(?:\b65\s*%|\b68\s*%|65\s*key|67\s*key|68\s*key)/i.test(q)) {
        const kb68 = kbPool.filter((p) => /(?:65|67|68)/i.test(p.name))
        return formatListReply(
          '⌨️ <b>65% / 68% Layout Keyboards & Barebones (Arrow Keys ပါဝင်):</b>',
          'ကျစ်လျစ်ပြီး Arrow Keys သီးသန့်ပါဝင်သော လူကြိုက်များ 65% / 68% မော်ဒယ်များမှာ -',
          kb68
        )
      }

      if (/(?:\b75\s*%|75\s*key|81\s*key|82\s*key|84\s*key)/i.test(q)) {
        const kb75 = kbPool.filter((p) => /(?:75|81|82|84|\bq1\b|\bk1\b|5075)/i.test(p.name))
        return formatListReply(
          '⌨️ <b>75% Layout Keyboards (F-Row + Arrow Keys ပါဝင်သော အရောင်းရဆုံး Layout):</b>',
          'ဂိမ်းဆော့ရန်ရော ရုံးလုပ်ငန်း/Coding အတွက်ပါ အသင့်တော်ဆုံး 75% Keyboards များမှာ -',
          kb75
        )
      }

      if (/(?:\b80\s*%|\b85\s*%|\b87\s*%|\btkl\b|tenkeyless|85\s*key|86\s*key|87\s*key)/i.test(q)) {
        const kbTkl = kbPool.filter((p) => /(?:r85|87|86|tkl|80he|alloy\s*fps)/i.test(p.name))
        return formatListReply(
          '⌨️ <b>80% / TKL (Tenkeyless 85–87 Keys) Keyboards:</b>',
          'In-stock အသင့်ရှိသော <b>Attack Shark R85 HE (#104)</b> အပါအဝင် 80% / TKL Keyboards များမှာ -',
          kbTkl
        )
      }

      if (/(?:\b96\s*%|\b98\s*%|\b99\s*%|\b100\s*%|full\s*size|numpad\s*ပါတဲ့|နမ်ပတ်ပါတဲ့|နံပါတ်ခလုတ်ပါတဲ့|ဂဏန်းခလုတ်ပါတဲ့|ကီးအပြည့်)/i.test(q)) {
        const kbFull = kbPool.filter((p) => /(?:98|99|100|815|gk300)/i.test(p.name))
        return formatListReply(
          '⌨️ <b>98% / Full-Size (Numpad ဂဏန်းခလုတ် ပါဝင်သော) Keyboards:</b>',
          'စာရင်းတွက်ချက်မှု၊ ရုံးလုပ်ငန်းနှင့် ကီးအပြည့် သုံးလိုသူများအတွက် Numpad ပါဝင်သော ကီးဘုတ်များမှာ -',
          kbFull
        )
      }

      if (/(?:aluminum|aluminium|\bcnc\b|အလူမီနီယံ|သံကိုယ်ထည်|သတ္တုကိုယ်ထည်|အလေးချိန်စီးတဲ့)/i.test(q)) {
        const kbAlu = kbPool.filter((p) =>
          /(?:rainy75|nd75|sk75|q1|ev63|made68\s*ultra|hi75|stars75|e68|k1\s*pro|neo\s*sonic)/i.test(p.name)
        )
        return formatListReply(
          '🛡️ <b>Premium CNC Aluminum (သတ္တုကိုယ်ထည်) Keyboards & Barebones:</b>',
          'အလေးချိန်စီးပြီး အသံထွက် အလွန်ပြည့်ဝသော Full CNC Aluminum ကီးဘုတ်များမှာ -',
          kbAlu
        )
      }

      if (/(?:low\s*profile|အပါး|ပါးပါးလေး|slim)/i.test(q)) {
        const kbLow = kbPool.filter((p) => /(?:air75|\bair\b|low\s*profile)/i.test(`${p.name} ${p.content || ''}`))
        return formatListReply(
          '🪶 <b>Low-Profile (အပါးဒီဇိုင်း) Mechanical & Magnetic Keyboards:</b>',
          'လက်ကောက်ဝတ် မညောင်းဘဲ သယ်ဆောင်ရလွယ်ကူသော Low-Profile ကီးဘုတ်များမှာ -',
          kbLow
        )
      }

      if (/(?:screen|display|မှန်ပြင်|tft|lcd|knob|အလှည့်|volume\s*ဘီး)/i.test(q)) {
        const kbScreenKnob = kbPool.filter((p) =>
          /(?:ak820|f75|f98|f99|nd75|kt84|lt75|vk\s*87|vk\s*99|q1|5075|n75|k98|z98|t98|ag75)/i.test(p.name)
        )
        return formatListReply(
          '🎛️ <b>Mini Screen (TFT Display) နှင့် Volume Knob ပါဝင်သော Keyboards:</b>',
          'GIF ပုံတင်နိုင်သော Screen သို့မဟုတ် အသံအတိုးအချဲ့ လှည့်ခလုတ် (Knob) ပါဝင်သော ကီးဘုတ်များမှာ -',
          kbScreenKnob
        )
      }
    }

    // E1. Mousepad vs Glasspad comparison or Mousepad sizes
    if (
      /(?:mouse\s*pad|မောက်စ်ပတ်|မောက်ပတ်|မောက်ပြား).*?(?:glass\s*pad|ဖန်ပတ်|ဘာကွာ|size|ဆိုဒ်|အရွယ်အစား|အကြီး)/i.test(q) ||
      /(?:glass\s*pad|ဖန်ပတ်).*?(?:ဆိုတာ|ကောင်းလား|ဘာကွာ)/i.test(q)
    ) {
      const pads = sortProductsSmart(
        products.filter((p) => ['mousepad', 'glasspad'].includes((p.category || '').toLowerCase()) && isProductInStock(p))
      )
      return {
        text:
          `🖲️ <b>Cloth Mousepad နှင့် Tempered Glasspad ကွာခြားချက်နှင့် အရွယ်အစားများ (အားလုံး In-stock):</b>\n\n` +
          `၁။ <b>Tempered Glasspad (ဖန်သားပြင် မောက်ပြား):</b>\n` +
          `   • <b>40x45cm Glass Pad (#103 — 140,000 Ks, In-stock)</b>: Micro-etched ဖန်သားပြင်ဖြစ်၍ ပွတ်တိုက်မှု အနည်းဆုံးဖြင့် အမြန်ဆုံး ဆွဲနိုင်ပြီး ရေစိုခံကာ နှစ်ပေါင်းများစွာ ပွန်းပဲ့ခြင်းမရှိဘဲ သုံးနိုင်ပါသည်။\n\n` +
          `၂။ <b>Cloth Gaming Mousepad (အဝတ်သား Desk Mat — In-stock ၃ ဆိုဒ်):</b>\n` +
          `   • <b>90x40cm XXL Desk Mat (#96 — 45,000 Ks)</b> | <b>80x30cm XL (#68 — 32,000 Ks)</b> | <b>60x30cm Medium (#130 — 24,000 Ks)</b>\n` +
          `   • Control နှင့် Stopping Power ပိုကောင်းပြီး လက်တင်ရတာ နူးညံ့သက်တောင့်သက်သာ ရှိပါသည်။`,
        products: pads,
        allProducts: pads,
        visibleCount: 4,
      }
    }

    // E2. Mouse with Charging Dock
    if (specificMatchedProducts.length === 0 && /(charging\s*dock|အားသွင်းခုံ|\bdock\b.*?(?:mouse|မောက်))/i.test(q)) {
      const dockMice = products.filter((p) => [540, 132, 67, 536].includes(Number(p.id)))
      return formatListReply(
        '⚡ <b>Magnetic Charging Dock (အားသွင်းခုံ) ပါဝင်သော Wireless Gaming Mice:</b>',
        'စားပွဲပေါ် တင်လိုက်ရုံဖြင့် အလွယ်တကူ အားသွင်းနိုင်သော မော်ဒယ်များနှင့် လက်ရှိ In-stock Wireless Mice များမှာ -',
        dockMice
      )
    }

    // E3. 8K Polling Rate / PAW3950 / PAW3395 / Ultra-Lightweight / Carbon Fiber Mouse
    if (
      specificMatchedProducts.length === 0 &&
      /(?:\b8k\b|8000\s*hz|paw\s*3950|3950|paw\s*3395|3395|အပေါ့ဆုံး\s*(?:mouse|မောက်)|lightweight\s*mouse|carbon\s*fiber)/i.test(q) &&
      !isKeyboardContext
    ) {
      const proMice = products.filter(
        (p) =>
          ['mouse'].includes((p.category || '').toLowerCase()) &&
          (/(?:3950|3395|8k|8000|ultra|rs6|sc620|sc650|v8|x1|r1|r5|trinity)/i.test(`${p.name} ${p.content || ''}`))
      )
      return formatListReply(
        '🚀 <b>High-Spec Pro Gaming Mice (PAW3395 / PAW3950 / 8K / Ultra-Lightweight):</b>',
        'Esports အဆင့် Sensor မြင့်မားပြီး အလေးချိန် ပေါ့ပါးသော ထိပ်တန်း Gaming Mouse များမှာ -',
        proMice
      )
    }

    // F1. Competitive Gaming (Valorant / CS2 / Apex / FPS / Esports)
    if (specificMatchedProducts.length === 0 && /(valorant|valo|\bcs2\b|csgo|apex|\bfps\b|pubg|dota|esports|ဂိမ်းဆော့ဖို့|ဂိမ်းအတွက်)/i.test(q)) {
      const gamingPicks = [
        products.find((p) => Number(p.id) === 104),
        products.find((p) => Number(p.id) === 67),
        products.find((p) => Number(p.id) === 536),
        products.find((p) => Number(p.id) === 103),
        products.find((p) => Number(p.id) === 648),
        products.find((p) => Number(p.id) === 576),
      ].filter(Boolean)

      return formatListReply(
        '🎮 <b>Valorant / CS2 / FPS Esports Gaming အတွက် အကောင်းဆုံး ရွေးချယ်မှုများ:</b>',
        'FPS ဂိမ်းများတွင် Counter-strafe နှင့် Aim တိကျမြန်ဆန်စေရန် <b>Rapid Trigger Magnetic Keyboard + Lightweight Wireless Mouse + Glasspad</b> တွဲဖက်အသုံးပြုရန် အကြံပြုအပ်ပါသည် -',
        gamingPicks,
        '',
        true
      )
    }

    // F2. Office / Coding / Programming / Quiet Typing
    if (specificMatchedProducts.length === 0 && /(office|ရုံးသုံး|coding|programmer|developer|စာရိုက်ဖို့|အလုပ်သုံး|စာရိုက်ကောင်းတဲ့|စာရင်းတွက်)/i.test(q)) {
      const officePicks = [
        products.find((p) => Number(p.id) === 67),
        products.find((p) => Number(p.id) === 9),
        products.find((p) => Number(p.id) === 273),
        products.find((p) => Number(p.id) === 272),
        products.find((p) => Number(p.id) === 546),
        products.find((p) => Number(p.id) === 591),
      ].filter(Boolean)

      return formatListReply(
        '💼 <b>ရုံးလုပ်ငန်း (Office)၊ Coding နှင့် အသံငြိမ်စွာ စာရိုက်ရန် အသင့်တော်ဆုံး ပစ္စည်းများ:</b>',
        'နာရီပေါင်းများစွာ စာရိုက်သော်လည်း လက်မညောင်းဘဲ ပတ်ဝန်းကျင်ကို အသံမနှောင့်ယှက်စေမည့် ရွေးချယ်မှုများမှာ -',
        officePicks,
        '',
        true
      )
    }

    // F3. Phone / iPad / Tablet / MacBook Connection
    if (specificMatchedProducts.length === 0 && /(ဖုန်းနဲ့|phone\s*နဲ့|ipad\s*နဲ့|tablet\s*နဲ့|တက်ဘလက်နဲ့|macbook\s*နဲ့)/i.test(q)) {
      const mobilePicks = [
        products.find((p) => Number(p.id) === 67),
        products.find((p) => Number(p.id) === 351),
        products.find((p) => Number(p.id) === 9),
        products.find((p) => Number(p.id) === 546),
        products.find((p) => Number(p.id) === 572),
        products.find((p) => Number(p.id) === 568),
      ].filter(Boolean)

      return formatListReply(
        '📱 <b>ဖုန်း (Phone)၊ iPad၊ Tablet နှင့် MacBook တို့နှင့် Bluetooth ချိတ်သုံးနိုင်သော ပစ္စည်းများ:</b>',
        'Bluetooth ပါဝင်သော Tri-Mode Keyboard နှင့် Mouse များကို Dongle မလိုဘဲ ဖုန်း/iPad/MacBook တို့နှင့် တိုက်ရိုက် ချိတ်ဆက်သုံးနိုင်ပါသည် -',
        mobilePicks,
        '',
        true
      )
    }

    // F4. Gift / Birthday Present Advisor
    if (specificMatchedProducts.length === 0 && /(လက်ဆောင်|gift|present|မွေးနေ့|ချစ်သူအတွက်|ကောင်လေးအတွက်|ကောင်မလေးအတွက်|သူငယ်ချင်းအတွက်)/i.test(q)) {
      const giftPicks = [
        products.find((p) => Number(p.id) === 104),
        products.find((p) => Number(p.id) === 67),
        products.find((p) => Number(p.id) === 16),
        products.find((p) => Number(p.id) === 96),
        products.find((p) => Number(p.id) === 588),
        products.find((p) => Number(p.id) === 252),
        products.find((p) => Number(p.id) === 668),
      ].filter(Boolean)

      return formatListReply(
        '🎁 <b>လက်ဆောင်ပေးရန် အသင့်တော်ဆုံး In-stock ပစ္စည်းများ (ချက်ချင်းပို့ပေးနိုင်ပါသည်):</b>',
        'မွေးနေ့လက်ဆောင် သို့မဟုတ် အမှတ်တရ ပေးရန် အဆင်သင့်ရှိသော (In-stock) လူကြိုက်များ ပစ္စည်းများမှာ -',
        giftPicks,
        '',
        true
      )
    }

    // F5. Skincare & Haircare Concern Advisor
    if (specificMatchedProducts.length === 0 && /(ဝက်ခြံ|acne|အဆီပြန်|ချွေးပေါက်|အသားခြောက်|dry\s*skin|အစိုဓာတ်|အသားဖြူ|brightening|အရေးအကြောင်း|anti\s*aging|ဆံပင်ကျွတ်|ဆံပင်ပျက်စီး|ဆံသား|မိတ်ကပ်ဖျက်)/i.test(q)) {
      if (/(ဆံပင်|ဆံသား)/i.test(q)) {
        const hairCare = products.filter((p) => ['shampoo', 'hair mask', 'hair oil'].includes((p.category || '').toLowerCase()))
        return formatListReply(
          '💇‍♀️ <b>ဆံသားထိန်းသိမ်းရေး ပစ္စည်းများ (Shampoo, Hair Mask & Hair Oil):</b>',
          'ဆံပင်ပျက်စီးခြင်းနှင့် ဆံပင်ကျွတ်ခြင်းကို သက်သာစေပြီး ပိုးသားလို နူးညံ့စေသော ပစ္စည်းများမှာ -',
          hairCare
        )
      }
      if (/(ဝက်ခြံ|acne|အဆီပြန်|ချွေးပေါက်|မိတ်ကပ်ဖျက်)/i.test(q)) {
        const acneCare = products.filter((p) => [393, 74, 40, 603, 75, 76].includes(Number(p.id)))
        return formatListReply(
          '🌿 <b>ဝက်ခြံနှင့် အဆီပြန်သော အသားအရေအတွက် In-stock Skincare များ:</b>',
          'ချွေးပေါက်သန့်စင်ပြီး ဝက်ခြံသက်သာစေသော In-stock ပစ္စည်းများမှာ -',
          acneCare
        )
      }
      const moistureCare = products.filter((p) => [75, 76, 252, 77, 39, 393].includes(Number(p.id)))
      return formatListReply(
        '✨ <b>အသားအရေ စိုပြည်ဝင်းပစေသော In-stock Skincare & Supplement များ:</b>',
        'အသားခြောက်ခြင်း၊ အရေးအကြောင်းနှင့် အသားအရေ ကြည်လင်စိုပြည်စေရန် အသင့်ရှိသော ပစ္စည်းများမှာ -',
        moistureCare
      )
    }

    return null
  }

  // Smart Context-Aware & Multi-Attribute Auto-Reply Engine
  const generateBotReply = (userQuery) => {
    const normalizedQuery = normalizeMyanglish(userQuery || '')
    const q = normalizedQuery.trim().toLowerCase()

    // Response when requested product/model is not found in database
    const makeNotFoundResponse = () => {
      const seenCats = new Set()
      const popularInstock = []
      const allInstock = products.filter(isProductInStock)
      const priorityCats = ['Keyboard', 'Mouse', 'Keycaps', 'Switch']
      for (const cat of priorityCats) {
        const match = allInstock.find((p) => p.category === cat && !seenCats.has(p.category))
        if (match) {
          popularInstock.push(match)
          seenCats.add(match.category)
        }
        if (popularInstock.length >= 3) break
      }
      for (const p of allInstock) {
        if (popularInstock.length >= 3) break
        if (!popularInstock.some((item) => item.id === p.id)) {
          popularInstock.push(p)
        }
      }

      return {
        text:
          `တောင်းပန်ပါတယ်ခင်ဗျာ၊ လူကြီးမင်း မေးမြန်းထားသော ပစ္စည်းသည် ဆိုင်၏ database ထဲတွင် လတ်တလော မတွေ့ရှိသေးပါခင်ဗျာ။ 🙏\n\n` +
          `💡 <b>သို့သော် လူကြီးမင်း လိုချင်သော မော်ဒယ်/ပစ္စည်းကို ဆိုင်ရှင်ထံ တိုက်ရိုက် Pre-order စုံစမ်းမှာယူနိုင်ပါသည်ခင်ဗျာ</b> (သို့မဟုတ်) ဆိုင်တွင် လက်ရှိ အဆင်သင့်ရှိသော အောက်ပါ ပစ္စည်းများကိုလည်း လေ့လာကြည့်ရှုနိုင်ပါသည်ခင်ဗျာ -\n\n` +
          `တိုက်ရိုက် စုံစမ်းလိုပါက <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-bubble-tg-btn">${TG_SVG_HTML} @${currentStore?.telegram || 'mark03168_bot'}</a> သို့ ဆက်သွယ်နိုင်ပါသည်ခင်ဗျာ။`,
        products: popularInstock,
        allProducts: popularInstock,
        visibleCount: popularInstock.length,
        categoryChips: [
          { label: `💬 Telegram @${currentStore?.telegram || 'mark03168_bot'} သို့ မေးမည်`, query: 'မှာယူနည်း' },
          { label: '⚡ Instock ပစ္စည်းများ အကုန်ကြည့်မည်', query: 'instock ဘာတွေရှိလဲ' },
        ],
      }
    }

    // Check if user is asking about their cart / browser memory
    if (/(?:ငါ့|ကျွန်တော်|ကျနော်|ကျွန်မ|မိမိ|my)?\s*(?:ရဲ့)?\s*(?:cart|ခြင်းတောင်း|ခြင်း|ဝယ်ထားတာ|ထည့်ထားတာ)/i.test(q)) {
      if (!cartItems || cartItems.length === 0) {
        return {
          text: `လူကြီးမင်း၏ ခြင်းတောင်း (Cart) ထဲတွင် ပစ္စည်း မရှိသေးပါခင်ဗျာ။\nဆိုင်ထဲမှ ကြိုက်နှစ်သက်ရာ ပစ္စည်းများကို <b>'Cart ထဲထည့်မည်'</b> နှိပ်၍ ထည့်သွင်းထားနိုင်ပါသည်ခင်ဗျာ! 🛒`
        }
      }
      const listStr = cartItems.map((item, idx) => `${idx + 1}. <b>${item.name}</b> ${item.option ? `(${item.option})` : ''} - ${item.quantity} ခု (${(Number(item.price) * (item.quantity || 1)).toLocaleString()} ကျပ်)`).join('\n')
      return {
        text: `လူကြီးမင်း၏ Cart (ခြင်းတောင်း) ထဲတွင် အောက်ပါ ပစ္စည်းများ မှတ်ထားပေးထားပါသည်ခင်ဗျာ:\n\n${listStr}\n\n💰 စုစုပေါင်း: <b>${Number(totalPrice).toLocaleString()} ကျပ်</b>\n\nအော်ဒါအတည်ပြုလိုပါက ညာဘက်အောက်ရှိ Cart ခလုတ်လေးကို နှိပ်၍ မှာယူနိုင်ပါသည်ခင်ဗျာ! 🚀`
      }
    }

    // Check if user introduced their name
    const introMatch = userQuery.match(/(?:ကျနော်|ကျွန်တော်|ကျမ|ကျွန်မ|ငါ|my name is)\s*(?:ရဲ့)?\s*နာမည်\s*(?:က|ကတော့)?\s*([a-zA-Z\u1000-\u109F\s]+?)(?:ပါ|ဖြစ်ပါတယ်|ပါခင်ဗျာ|ပါရှင်|$)/i)
    if (introMatch && introMatch[1]?.trim()) {
      const detectedName = introMatch[1].trim()
      return {
        text: `မင်္ဂလာပါ <b>${detectedName}</b> ခင်ဗျာ! 🙏\nလူကြီးမင်း၏ အမည်ကို ဆိုင်ရှင်နှင့် စကားပြောရာတွင် မရောထွေးစေရန် Browser Memory ထဲတွင် မှတ်သားထားလိုက်ပါပြီ။ ဘာများ ကူညီပေးရမလဲခင်ဗျာ?`
      }
    }

    // Stock Intent Flags
    const hasInstockFilter =
      /(instock|in-stock|in\s*stock|အဆင်သင့်ရှိ|ရှိတဲ့ထဲက|ပစ္စည်းရှိတဲ့|ရှိတာပဲ|ရှိတဲ့ဟာ|လက်ကျန်)/i.test(q) &&
      !/(မရှိ|မရ|ကုန်)/i.test(q)
    const hasPreorderFilter = /(preorder|pre-order|မှာယူရမယ့်|မှာရမယ့်|ပရီအော်ဒါ)/i.test(q)

    // Sorting Flags
    const isCheapest = /(အသက်သာဆုံး|အချိုဆုံး|အနည်းဆုံး|စျေးသက်သာ|ဈေးသက်သာ|စျေးချို|ဈေးချို|cheap|lowest price|စျေးပေါ|ဈေးပေါ)/i.test(q)
    const isMostExpensive = /(အများဆုံး|အမြင့်ဆုံး|စျေးအကြီးဆုံး|ဈေးအကြီးဆုံး|highest price|expensive|flagship)/i.test(q)
    const isBestOrRecommendQuery = /(ဘယ်ဟာ\s*ကောင်း|ဘာကောင်းလဲ|ဘာဝယ်ရမလဲ|အကောင်းဆုံး|recommend|အကြံပေး|ညွှန်းပေး|လူကြိုက်အများဆုံး|best\s*seller|ရောင်းအကောင်းဆုံး)/i.test(q)

    // Budget & Price Range Filter Extraction
    const priceFilter = parsePriceFilter(normalizedQuery)

    // Intent Flags
    const isPriceQuery = /(စျေး|ဈေး|စျေးနှုန်း|ဈေးနှုန်း|ဘယ်လောက်|တန်ဖိုး|\bprice\b|\bcost\b|how much)/i.test(q)
    const isStockQuery = /(ရှိလား|ရနိုင်လား|ရသေးလား|ရှိသေးလား|instock|preorder|\bstock\b|ပစ္စည်းရှိ|အဆင်သင့်)/i.test(q)
    const isColorQuery = /(အရောင်|color|colour|ဘာအရောင်)/i.test(q)
    const isSwitchQuery = /(switch|sound|အသံ|ဆွစ်|ဆွစ်ချ်)/i.test(q)
    const isOrderQuery = /(မှာယူနည်း|ဘယ်လိုမှာရမလဲ|\border\b|မှာချင်|ဝယ်ချင်|ဝယ်ယူနည်း|ငွေချေနည်း|ငွေလွှဲ|kpay|wave|ဒါယူမယ်|ဒီဟာယူမယ်|အဲ့ဒါယူမယ်|ဝယ်မယ်)/i.test(q) && !/(order\s*cancel|အော်ဒါ\s*ဖျက်|မှာထားတာ\s*ဖျက်|မှာထားတာ\s*ပြင်)/i.test(q)
    const isDeliveryQuery = /(ပို့ဆောင်ခ|\bdelivery\b|\bdeli\b|ပို့ခ|ဘယ်လောက်ကြာ|ကြာမလဲ|ရောက်မလဲ|ကားဂိတ်|\bcod\b|အိမ်ရောက်ငွေချေ|ပစ္စည်းရောက်မှ)/i.test(q)
    const isContactQuery = /(ဆိုင်ဘယ်မှာလဲ|လိပ်စာ|ဆိုင်နေရာ|ဖုန်းနံပါတ်|ဆိုင်ဖုန်း|\bphone\b|\baddress\b|\bcontact\b|တည်နေရာ|ဘယ်မှာဝယ်)/i.test(q) && !/iphone|ip\s*\d+|လိပ်စာ\s*ပြောင်း|ဖုန်းနံပါတ်\s*ပြောင်း/i.test(q)
    const isGreeting = /^(မင်္ဂလာပါ|ဟဲလို|hi|hello|hey|နေကောင်းလား|မဂ်လာပါ)$/i.test(q) || (/^(မင်္ဂလာပါ|ဟဲလို|hi|hello|hey)/i.test(q) && q.length < 18)
    const isThankYouQuery = /(ကျေးဇူးပါ|ကျေးဇူးတင်|thanks|thank you|ကျေးဇူး|အဆင်ပြေတယ်|အဆင်ပြေသွား)/i.test(q)
    const isAckQuery = /^(ok|okay|အိုကေ|ဟုတ်|ဟုတ်ကဲ့|ဟုတ်ကဲ့ပါ|နားလည်ပြီ|သိပြီ|ကောင်းပြီ|ရပြီ|စဉ်းစားလိုက်ဦးမယ်|ကြည့်လိုက်ဦးမယ်|အိုခေ|k|kk|yes|yep)$/i.test(q)
    const isDiscountQuery = /(စျေးလျှော့|ဈေးလျှော့|လျှော့ပေး|discount|promotion|ပရိုမိုးရှင်း|လက်ကား|wholesale|အထူးစျေး|အထူးဈေး)/i.test(q)
    const isHumanHandoverQuery = /(ဆိုင်ရှင်နဲ့ပြော|လူနဲ့ပြော|admin နဲ့ပြော|လူခေါ်|တိုက်ရိုက်ပြောချင်|owner နဲ့ပြော|မန်နေဂျာ|စကားပြောချင်လို့|လူရှိလား|human agent|talk to agent)/i.test(q)
    const isWarrantyQuery = /(warranty|အာမခံ|အာမခံရှိလား|အာမခံဘယ်လောက်|ပျက်ရင်|ချို့ယွင်း|လဲလို့ရလား|return|refund|exchange|လဲပေးလား)/i.test(q)
    const isTrackingQuery = /(tracking|ဘယ်တော့ရောက်|ဘယ်တော့ပို့|ပို့ပြီးပြီလား|ပို့လိုက်ပြီလား|ဘယ်ရောက်ပြီလဲ|order စစ်|ဘောက်ချာ|voucher|လမ်းကြောင်း)/i.test(q)
    const isPaymentSlipQuery = /(ငွေလွှဲပြီး|kpay လွှဲ|wave လွှဲ|လွှဲပြီးပြီ|slip|စလစ်|ပြေစာ|screenshot|ငွေစစ်|ငွေဝင်|ငွေချေပြီး)/i.test(q)
    const isPreorderHowQuery = /(preorder ဘယ်လို|pre-order ဘယ်လို|preorder ဘယ်လောက်ကြာ|ပရီအော်ဒါ ဘယ်လို|deposit|စရန်|စရံ)/i.test(q)
    const isTroubleshootingQuery = /(ချိတ်မရ|မလင်း|အသံမထွက်|မတုံ့ပြန်|connect မရ|bluetooth ချိတ်|key မထွက်|switch မရ|မရတော့ဘူး|ပျက်နေ)/i.test(q)

    // Extract target categories, brands, and specific products upfront
    const targetCategories = extractTargetCategories(q, categories)

    let matchedBrands = []
    const sortedBrands = Object.entries(BRAND_SYNONYMS).sort((a, b) => b[0].length - a[0].length)
    for (const [synonym, brands] of sortedBrands) {
      const isAscii = /^[a-z0-9\s\-]+$/i.test(synonym)
      const hit = isAscii
        ? new RegExp(`\\b${synonym.replace(/\s+/g, '\\s+')}\\b`, 'i').test(q)
        : q.includes(synonym)
      if (hit) {
        matchedBrands = [...matchedBrands, ...brands]
      }
    }
    matchedBrands = [...new Set(matchedBrands)]

    const specificMatchedProducts = findSpecificProductsInQuery(userQuery)

    // ------------------------------------------------------------------------
    // 0.2. PRODUCT COMPARISON ("A နဲ့ B ဘာကွာလဲ", "f75 vs ak820")
    // ------------------------------------------------------------------------
    const comparisonReply = handleProductComparison(userQuery)
    if (comparisonReply) {
      return comparisonReply
    }

    // ------------------------------------------------------------------------
    // 0.5. PRODUCT SPECIFICATION & DETAILED FEATURE Q&A INTENT
    // ------------------------------------------------------------------------
    const hasExplicitSpecWord =
      /(video|ဗီဒီယို|sound\s*test|အသံနားထောင်|အသံစမ်း|အသံပြ|material|ပစ္စည်းသား|pbt|abs|aluminum|အလူမီနီယံ|plastic|ကိုယ်ထည်|အသား|ဘာသား|wireless|ကြိုးမဲ့|bluetooth|2\.4g|tri-mode|trimode|battery|ဘက်ထရီ|ခံလဲ|mac|apple|windows|ios|android|phone|sensor|dpi|polling\s*rate|rgb|profile|cherry|oem|xda|moa|weight|အလေးချိန်|software|driver|layout|gasket|knob|အသေးစိတ်|ရှင်းပြ|ဘာကွာလဲ|ကွာခြားချက်|ဘာတွေပါလဲ|သုံးလို့ရလား|အသံဘယ်လို|ဘာ\s*switch)/i.test(q)

    const isCategoryOrFeatureBrowse =
      /(ဘာတွေရှိလဲ|ဘာရှိလဲ|ဘာတွေရလဲ|ဘာရလဲ|ရနိုင်တာ|ကြည့်ချင်လို့|ပြပေးပါ|ပြပါ)/i.test(q) ||
      (specificMatchedProducts.length === 0 && (targetCategories.length > 0 || TECH_FEATURES.rapid_trigger.pattern.test(q) || TECH_FEATURES.silent.pattern.test(q) || TECH_FEATURES.wireless.pattern.test(q)))

    if (hasExplicitSpecWord && !isOrderQuery && !isPriceQuery && !isCategoryOrFeatureBrowse) {
      if (specificMatchedProducts.length > 0) {
        setLastProduct(specificMatchedProducts[0])
        return answerProductSpecificationQuery(specificMatchedProducts[0], userQuery, specificMatchedProducts)
      }
      const proactiveBeforeLastProduct = handleProactiveCustomerScenarios(userQuery, {
        specificMatchedProducts,
        targetCategories,
        matchedBrands,
        priceFilter,
        hasInstockFilter,
        isCheapest,
        isMostExpensive,
      })
      if (proactiveBeforeLastProduct) {
        return proactiveBeforeLastProduct
      }
      if (lastProduct && targetCategories.length === 0 && matchedBrands.length === 0) {
        return answerProductSpecificationQuery(lastProduct, userQuery, [lastProduct])
      }
    }

    // ------------------------------------------------------------------------
    // 1. GREETINGS
    // ------------------------------------------------------------------------
    if (isGreeting && !isPriceQuery && !isStockQuery && !isOrderQuery && !hasInstockFilter) {
      return {
        text: `မင်္ဂလာပါခင်ဗျာ! 🙏 <b>Ngr Sine</b> မှ ကြိုဆိုပါတယ်။\n\nကုန်ပစ္စည်း အချက်အလက်များ၊ စျေးနှုန်း၊ Instock နှင့် Pre-order အခြေအနေများကို အဆင်ပြေပြေ ကူညီဖြေကြားပေးပါမည်ခင်ဗျာ။\n\nဘာပစ္စည်းလေးများ စိတ်ဝင်စားပါသလဲခင်ဗျာ?`,
        products: [],
      }
    }

    // ------------------------------------------------------------------------
    // 2. THANK YOU & CONVERSATIONAL ACKNOWLEDGEMENTS
    // ------------------------------------------------------------------------
    if (isThankYouQuery && q.length < 35) {
      return {
        text:
          `စိတ်ချမ်းသာစွာ အသုံးပြုနိုင်ပါစေခင်ဗျာ! 🥰\n\n` +
          `<b>${currentStore.name_my}</b> ကို အားပေးသည့်အတွက် အထူးပင် ကျေးဇူးတင်ရှိပါသည်ခင်ဗျာ။ နောက်ထပ် သိရှိလိုသည်များ သို့မဟုတ် လိုအပ်သည်များ ရှိပါက အချိန်မရွေး လွတ်လပ်စွာ မေးမြန်းနိုင်ပါသည်ခင်ဗျာ။ 🙏`,
        products: [],
      }
    }

    if (isAckQuery) {
      return {
        text:
          `ဟုတ်ကဲ့ပါခင်ဗျာ! 🙏\n\n` +
          `ထပ်မံသိရှိလိုသော ပစ္စည်းအချက်အလက်များ ရှိပါက သို့မဟုတ် အော်ဒါမှာယူလိုပါက အချိန်မရွေး မေးမြန်းနိုင်ပါသည်ခင်ဗျာ။`,
        products: [],
      }
    }

    // ------------------------------------------------------------------------
    // 2.5. BARGAINING / DISCOUNT / WHOLESALE INQUIRY
    // ------------------------------------------------------------------------
    if (isDiscountQuery) {
      return {
        text:
          `💝 <b>စျေးနှုန်းနှင့် Promotion အချက်အလက်:</b>\n\n` +
          `• ဆိုင်ရှိ ပစ္စည်းများအားလုံးကို အသက်သာဆုံး လက်လီစျေးနှုန်း (Best Fair Price) ဖြင့် တွက်ချက်သတ်မှတ်ပေးထားပါသည်ခင်ဗျာ။\n` +
          `• <b>၂ ခုနှင့်အထက် တွဲဖက်ဝယ်ယူခြင်း (Combo / Bundle)</b> သို့မဟုတ် <b>လက်ကား (Wholesale)</b> ဝယ်ယူလိုပါက ဆိုင်ရှင် <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a> ထံ တိုက်ရိုက် ညှိနှိုင်းဝယ်ယူနိုင်ပါသည်ခင်ဗျာ! 🙏`,
        products: [],
        categoryChips: [
          { label: `💬 ဆိုင်ရှင် @${currentStore?.telegram || 'mark03168_bot'} နှင့် ညှိနှိုင်းမည်`, query: 'ဆိုင်ရှင်နဲ့ပြောချင်လို့' },
          { label: '⚡ Instock ပစ္စည်းများ', query: 'instock ဘာတွေရှိလဲ' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 3. HUMAN HANDOVER / TALK TO OWNER
    // ------------------------------------------------------------------------
    if (isHumanHandoverQuery) {
      return {
        text:
          `👨‍💼 <b>ဆိုင်ရှင် (Admin) နှင့် တိုက်ရိုက် ဆက်သွယ်ရန်:</b>\n\n` +
          `• <b>Telegram Direct:</b> <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a> (တိုက်ရိုက် စကားပြောနိုင်ပါသည်)\n` +
          `• <b>Hotline ဖုန်း:</b> <b>${currentStore.phone}</b> (ချက်ချင်း ခေါ်ဆိုနိုင်ပါသည်)\n\n` +
          `လူကြီးမင်း၏ မက်ဆေ့ခ်ျကို ဆိုင်ရှင်ထံသို့ အကြောင်းကြားပေးထားပါသည်ခင်ဗျာ။ မကြာမီ ဆိုင်ရှင်မှ တိုက်ရိုက် ဆက်သွယ်ဖြေကြားပေးပါမည်ခင်ဗျာ။`,
        products: [],
        categoryChips: [
          { label: `💬 Telegram @${currentStore?.telegram || 'mark03168_bot'} သို့ တိုက်ရိုက်ပြောမည်`, query: 'ဆိုင်ရှင်နဲ့ပြောချင်လို့' },
          { label: '⚡ Instock ပစ္စည်းများ', query: 'instock ဘာတွေရှိလဲ' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 4. PAYMENT SLIP & SCREENSHOT FAQs
    // ------------------------------------------------------------------------
    if (isPaymentSlipQuery) {
      return {
        text:
          `✅ <b>ငွေပေးချေမှုနှင့် ပြေစာ (Slip) စစ်ဆေးခြင်း:</b>\n\n` +
          `• ငွေလွှဲပြေစာ (Slip / Screenshot) ပေးပို့ပေးသည့်အတွက် ကျေးဇူးတင်ပါသည်ခင်ဗျာ! 🙏\n` +
          `• ဆိုင်မှ ငွေဝင်ရောက်မှုနှင့် အော်ဒါအချက်အလက်ကို <b>အမြန်ဆုံး စစ်ဆေးအတည်ပြုပေးပါမည်ခင်ဗျာ</b>။\n` +
          `• တိုက်ရိုက် အတည်ပြုချက် ရယူလိုပါက ဆိုင်ရှင် <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a> သို့ စလစ်လေး ပို့ပေးထားနိုင်ပါသည်ခင်ဗျာ။`,
        products: [],
        categoryChips: [
          { label: `💬 ဆိုင်ရှင် @${currentStore?.telegram || 'mark03168_bot'} သို့ စလစ်ပြမည်`, query: 'ဆိုင်ရှင်နဲ့ပြောချင်လို့' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 5. ORDER TRACKING FAQs
    // ------------------------------------------------------------------------
    if (isTrackingQuery) {
      return {
        text:
          `📦 <b>အော်ဒါလမ်းကြောင်းနှင့် ပို့ဆောင်မှု အခြေအနေ စစ်ဆေးခြင်း:</b>\n\n` +
          `၁။ <b>In-stock ပစ္စည်းများ:</b> deli အပ်ပြီး ၂ ရက်အတွင်း အိမ်အရောက် ရောက်ရှိပါသည်ခင်ဗျာ။\n` +
          `၂။ <b>တခြားနယ်မြို့များ:</b> Royal Express deli အပ်ပြီး ၃ ရက် မှ ၄ ရက်ခန့် ကြာမြင့်ပါသည်ခင်ဗျာ။\n` +
          `၃။ <b>Pre-order ပစ္စည်းများ:</b> ပစ္စည်းရောက်ရှိချိန်သည် ၂၆ ရက် ကြာမြင့်ပါသည်ခင်ဗျာ။\n` +
          `၄။ Royal Express ဖြင့် ပို့ဆောင်ပြီးပါက <b>Tracking Number (Waybill ID)</b> ကို ဆိုင်မှ ပေးပို့ပေးပါမည်ခင်ဗျာ။\n` +
          `၅။ လူကြီးမင်း၏ <b>ဖုန်းနံပါတ် (သို့မဟုတ်) Order ဘောက်ချာ</b> ကို ဆိုင်ရှင်ထံ ပေးပို့၍ အခြေအနေကို အချိန်မရွေး စုံစမ်းစစ်ဆေးနိုင်ပါသည်ခင်ဗျာ။`,
        products: [],
        categoryChips: [
          { label: `💬 ဆိုင်ရှင် @${currentStore?.telegram || 'mark03168_bot'} သို့ စစ်ဆေးခိုင်းမည်`, query: 'ဆိုင်ရှင်နဲ့ပြောချင်လို့' },
          { label: '⚡ Instock ပစ္စည်းများ', query: 'instock ဘာတွေရှိလဲ' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 6. PRE-ORDER POLICY & TERMS FAQs
    // ------------------------------------------------------------------------
    if (isPreorderHowQuery) {
      return {
        text:
          `⏳ <b>Pre-order မှာယူနည်းနှင့် ကြာမြင့်ချိန်:</b>\n\n` +
          `၁။ <b>ပစ္စည်းကြာချိန်:</b> Pre-order မှာယူပါက ပစ္စည်းကြာချိန်သည် <b>၂၆ ရက်</b> ကြာမြင့်ပါသည်ခင်ဗျာ။\n` +
          `၂။ <b>စရန်ငွေ (Deposit):</b> ပစ္စည်းတန်ဖိုး၏ <b>30% မှ 50% စရန်</b> လွှဲပေးရပါသည် (အပြည့်လွှဲလိုပါကလည်း ရပါသည်)။\n` +
          `၃။ <b>ပစ္စည်းရောက်ချိန် ပို့ဆောင်မှု:</b> ပစ္စည်းဆိုင်ရောက်လျှင် လူကြီးမင်းထံ ချက်ချင်း အကြောင်းကြားပြီး ကျန်ငွေကို In-stock အတိုင်း deli အပ်ပြီး ၂ ရက်အတွင်း (တခြားနယ်မြို့များသို့ Royal Express deli အပ်ပြီး ၃ ရက်မှ ၄ ရက်အတွင်း) <b>အိမ်ရောက်ငွေချေ (COD)</b> ဖြင့် ပို့ဆောင်ပေးပါသည်ခင်ဗျာ။`,
        products: [],
        categoryChips: [
          { label: `💬 Pre-order မှာယူရန် @${currentStore?.telegram || 'mark03168_bot'}`, query: 'မှာယူနည်း' },
          { label: '⚡ Instock ပစ္စည်းများ', query: 'instock ဘာတွေရှိလဲ' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 7. WARRANTY & 7-DAY REPLACEMENT FAQs
    // ------------------------------------------------------------------------
    if (isWarrantyQuery) {
      return {
        text:
          `🛡️ <b>အာမခံနှင့် ပစ္စည်းလဲလှယ်ရေး မူဝါဒ (Warranty & Return Policy):</b>\n\n` +
          `• <b>100% Brand New & Genuine:</b> ဆိုင်ရှိ ပစ္စည်းအားလုံးသည် စစ်မှန်သော မူရင်း Official Brand ပစ္စည်းသစ်များသာ ဖြစ်ပါသည်ခင်ဗျာ။\n` +
          `• <b>၇ ရက်အတွင်း အသစ်လဲလှယ်ပေးခြင်း (7-Day 1-to-1 Replacement):</b> စက်ရုံထုတ် ချို့ယွင်းချက် (Factory Defect) ဖြစ်ပါက ပစ္စည်းရောက်ရှိပြီး ၇ ရက်အတွင်း ပစ္စည်းအသစ်သို့ 1-to-1 ချက်ချင်း လဲလှယ်ပေးပါသည်ခင်ဗျာ။\n` +
          `• <b>Official Brand Warranty:</b> သက်ဆိုင်ရာ Brand ကုမ္ပဏီများ၏ Warranty မူဝါဒအတိုင်း အပြည့်အဝ တာဝန်ယူ ပေးပါသည်ခင်ဗျာ။\n\n` +
          `အသေးစိတ် မေးမြန်းလိုပါက ဆိုင်ရှင် <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a> သို့ အချိန်မရွေး ဆက်သွယ်နိုင်ပါသည်ခင်ဗျာ။`,
        products: [],
        categoryChips: [
          { label: `💬 ဆိုင်ရှင် @${currentStore?.telegram || 'mark03168_bot'} သို့ မေးမည်`, query: 'ဆိုင်ရှင်နဲ့ပြောချင်လို့' },
          { label: '⚡ Instock ပစ္စည်းများ', query: 'instock ဘာတွေရှိလဲ' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 8. TECH SUPPORT & TROUBLESHOOTING FAQs
    // ------------------------------------------------------------------------
    if (isTroubleshootingQuery) {
      return {
        text:
          `🔧 <b>ပစ္စည်း အသုံးပြုမှု အကူအညီနှင့် Troubleshooting:</b>\n\n` +
          `စိတ်မပူပါနဲ့ခင်ဗျာ၊ အဆင်ပြေအောင် အတူတူ စစ်ဆေးကြည့်ပေးပါ့မယ် -\n\n` +
          `၁။ <b>Wireless / Bluetooth မချိတ်ပါက:</b> Mode switch (2.4G/BT/Wired) မှန်မမှန် စစ်ဆေးပြီး Fn key စုံတွဲ (Fn+Q/W/E) ကို ၃ စက္ကန့်ခန့် ဖိနှိပ်ထားပေးပါခင်ဗျာ။\n` +
          `၂။ <b>ဘက်ထရီအားနည်းနေခြင်း:</b> Type-C ကြိုးဖြင့် အားသွင်းပြီး စမ်းသပ်ကြည့်ပေးပါခင်ဗျာ။\n` +
          `၃။ <b>Switch မတုံ့ပြန်ပါက:</b> Hot-swap socket ဖြစ်ပါက Switch pin ကွေးနေခြင်း ရှိမရှိ စစ်ဆေးနိုင်ပါသည်။\n\n` +
          `မပြေလည်သေးပါက ဆိုင်ရှင် <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a> သို့ ပစ္စည်း ဗီဒီယို/ပုံ ပို့ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။ အသစ်လဲလှယ်ခြင်း/ပြုပြင်ခြင်းအတွက် တာဝန်ယူ ကူညီပေးပါမည်ခင်ဗျာ!`,
        products: [],
        categoryChips: [
          { label: `💬 ဆိုင်ရှင် @${currentStore?.telegram || 'mark03168_bot'} သို့ ဗီဒီယို/ပုံ ပို့မည်`, query: 'ဆိုင်ရှင်နဲ့ပြောချင်လို့' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 9. GENERAL ORDERING & PAYMENT FAQs (with Context-Aware Product Order)
    // ------------------------------------------------------------------------
    if (isOrderQuery && specificMatchedProducts.length === 0 && targetCategories.length === 0 && matchedBrands.length === 0) {
      if (lastProduct) {
        return {
          text:
            `📦 <b>${lastProduct.name} (🆔 #${lastProduct.id}) ကို မှာယူရန်:</b>\n\n` +
            `• 💰 <b>စျေးနှုန်း:</b> <b>${formatPrice(lastProduct)}</b>\n` +
            `• 📊 <b>အခြေအနေ:</b> ${formatStock(lastProduct)}\n\n` +
            `အောက်ပါပစ္စည်းကတ်ရှိ <b>"ကြည့်မည်"</b> ကို နှိပ်၍ <b>Cart ထဲထည့်ကာ မှာယူနိုင်သလို</b>၊ Telegram <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a> မှတစ်ဆင့်လည်း တိုက်ရိုက် မှာယူနိုင်ပါသည်ခင်ဗျာ။ 🙏`,
          products: [lastProduct],
          allProducts: [lastProduct],
          visibleCount: 1,
        }
      }
      return {
        text: `📦 <b>ပစ္စည်း မှာယူနည်းနှင့် ငွေပေးချေမှု အချက်အလက်များ:</b>\n\n` +
          `၁။ မိမိနှစ်သက်သော ပစ္စည်းကတ်ရှိ <b>"Telegram ဖြင့် မှာယူမည်"</b> ခလုတ်ကို နှိပ်၍ အလွယ်တကူ မှာယူနိုင်ပါတယ်ခင်ဗျာ။\n` +
          `၂။ Telegram တိုက်ရိုက်ဆက်သွယ်ရန်: <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a>\n` +
          `၃။ ဖုန်းဖြင့် တိုက်ရိုက်မှာယူလိုပါက <b>${currentStore.phone}</b> သို့ ဖုန်းခေါ်ဆိုနိုင်ပါသည်။\n` +
          `၄။ KPay, WavePay, AYA Pay, CB Pay စသည့် Mobile Banking များဖြင့် အလွယ်တကူ ငွေပေးချေနိုင်ပါသည်။\n` +
          `၅။ <b>Royal Express ရောက်သည့်မြို့တိုင်း အိမ်ရောက်ငွေချေ (Cash on Delivery) စနစ်ဖြင့် ရရှိနိုင်ပါတယ်ခင်ဗျာ။</b>`,
        products: [],
      }
    }

    // ------------------------------------------------------------------------
    // 10. DELIVERY & TIMING FAQs (including COD)
    // ------------------------------------------------------------------------
    if (isDeliveryQuery && specificMatchedProducts.length === 0 && targetCategories.length === 0) {
      return {
        text: `🚚 <b>ပို့ဆောင်ရေးနှင့် အိမ်ရောက်ငွေချေ (COD) အချက်အလက်များ:</b>\n\n` +
          `• <b>အိမ်ရောက်ငွေချေ (COD):</b> Royal Express ရောက်သည့် မြို့နယ်တိုင်း <b>ပစ္စည်းလက်ဝယ်ရောက်မှ ငွေချေနိုင်သော (COD) စနစ်</b> ရရှိပါသည်ခင်ဗျာ။\n` +
          `• <b>In-stock ပစ္စည်းများ:</b> deli အပ်ပြီး <b>၂ ရက်အတွင်း</b> အိမ်အရောက် ရောက်ရှိပါသည်ခင်ဗျာ။\n` +
          `• <b>တခြားနယ်မြို့များ:</b> Royal Express deli အပ်ပြီး <b>၃ ရက် မှ ၄ ရက်ခန့်</b> ကြာမြင့်ပါသည်ခင်ဗျာ။\n` +
          `• <b>Pre-order ပစ္စည်းများ:</b> ပစ္စည်းရောက်ရှိချိန်သည် <b>၂၆ ရက်</b> ကြာမြင့်ပါသည်ခင်ဗျာ။\n` +
          `• ပို့ဆောင်ခမှာ မြို့နယ်အလိုက် Royal Express deli နှုန်းထားအတိုင်း သင့်တင့်စွာ ကျသင့်ပါမည်ခင်ဗျာ။`,
        products: [],
      }
    }

    // ------------------------------------------------------------------------
    // 11. LOCATION & PHONE CONTACT
    // ------------------------------------------------------------------------
    if (isContactQuery) {
      return {
        text: `📍 <b>${currentStore.name_my} ဆိုင်လိပ်စာနှင့် ဆက်သွယ်ရန်:</b>\n\n` +
          `• တည်နေရာ: <b>${currentStore.address}</b>\n` +
          `• ဆက်သွယ်ရန်ဖုန်း: <b>${currentStore.phone}</b>\n` +
          `• Telegram: <a href="https://t.me/${currentStore?.telegram || 'mark03168_bot'}" target="_blank" rel="noreferrer" class="chat-tg-link">${TG_SVG_HTML}@${currentStore?.telegram || 'mark03168_bot'}</a>\n` +
          `• ဆိုင်ဖွင့်ချိန်: နေ့စဉ် မနက် ၉:၀၀ မှ ည ၈:၀၀ အထိ ဖွင့်လှစ်ထားပါတယ်ခင်ဗျာ။`,
        products: [],
      }
    }

    // ------------------------------------------------------------------------
    // 11.5 NEW ARRIVALS (Latest In-stock Products in Chronological Order)
    // ------------------------------------------------------------------------
    if (/(new arrival|new arrivals|အသစ်ရောက်|ရောက်တာအသစ်|အသစ်တွေ)/i.test(q)) {
      const instockNew = products
        .filter(isProductInStock)
        .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))

      return {
        text: `✨ <b>New Arrivals (ဆိုင်သို့ အသစ်ရောက်ရှိထားသော In-stock ပစ္စည်းများ):</b>\n\nလက်ရှိ အဆင်သင့်ရနိုင်သော အသစ်ရောက် ပစ္စည်း စုစုပေါင်း ${instockNew.length} မျိုး ရှိပါသည်ခင်ဗျာ -`,
        products: instockNew.slice(0, 6),
        allProducts: instockNew,
        visibleCount: 6,
        categoryChips: [
          { label: '⚡ Instock ဘာတွေရှိလဲ', query: 'instock ဘာတွေရှိလဲ' },
          { label: '⌨️ Keyboard Instock', query: 'keyboard instock' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 11.6 PROACTIVE CUSTOMER SCENARIOS (Layouts, Use-Cases, Switch Calc, Keycap Themes, Pads, Skincare, Policies)
    // ------------------------------------------------------------------------
    const proactiveReply = handleProactiveCustomerScenarios(userQuery, {
      specificMatchedProducts,
      targetCategories,
      matchedBrands,
      priceFilter,
      hasInstockFilter,
      isCheapest,
      isMostExpensive,
    })
    if (proactiveReply) {
      return proactiveReply
    }

    // ------------------------------------------------------------------------
    // 11.8. GENERAL RECOMMENDATION ("ဘယ်ဟာ ကောင်းလဲ" without category/brand)
    // ------------------------------------------------------------------------
    if (isBestOrRecommendQuery && targetCategories.length === 0 && matchedBrands.length === 0 && specificMatchedProducts.length === 0) {
      if (lastCategory) {
        const catInstock = sortProductsSmart(
          products.filter((p) => (p.category || '').toLowerCase() === lastCategory.toLowerCase()),
          { isBestOrRecommend: true }
        )
        if (catInstock.length > 0) {
          return {
            text: `⭐ <b>${lastCategory} အမျိုးအစားထဲမှ အရည်အသွေးအကောင်းဆုံးနှင့် လူကြိုက်အများဆုံး မော်ဒယ်များ:</b>`,
            products: catInstock.slice(0, 6),
            allProducts: catInstock,
            visibleCount: 6,
          }
        }
      }
      const topPicks = [
        products.find((p) => Number(p.id) === 104), // Attack Shark R85 HE (In-stock)
        products.find((p) => Number(p.id) === 67),  // Aula SC620 (In-stock)
        products.find((p) => Number(p.id) === 32),  // Leobog Reaper Switch (In-stock)
        products.find((p) => Number(p.id) === 648), // Aula Win 60 HE
      ].filter(Boolean)

      return {
        text: `🏆 <b>ငါ့ဆိုင် (NgrSine Shop) ၏ လူကြိုက်အများဆုံး အကြံပြုပစ္စည်းများ (Top Recommendations):</b>\n\nလူကြီးမင်း စိတ်ဝင်စားသော အမျိုးအစား (ဥပမာ - Keyboard, Mouse, Switch, Keycaps) သို့မဟုတ် သုံးမည့် Budget ပမာဏကို ပြောပြပေးပါက အသင့်တော်ဆုံး မော်ဒယ်ကို တိကျစွာ ရွေးချယ်ပေးပါမည်ခင်ဗျာ -`,
        products: topPicks,
        allProducts: topPicks,
        visibleCount: 4,
        categoryChips: [
          { label: '⌨️ Keyboard အကောင်းဆုံး', query: 'keyboard အကောင်းဆုံး' },
          { label: '🖱️ Gaming Mouse အကောင်းဆုံး', query: 'gaming mouse အကောင်းဆုံး' },
          { label: '⚡ Rapid Trigger Keyboard', query: 'magnetic switch keyboard ရှိလား' },
        ],
      }
    }

    // ------------------------------------------------------------------------
    // 12. GENERAL "INSTOCK ဘာတွေရှိလဲ" QUERY (Only when NO category/brand/product is specified)
    // ------------------------------------------------------------------------
    const isGeneralInstockQuery =
      /(instock\s*ဘာတွေရှိလဲ|instock\s*ဘာရှိလဲ|ဘာတွေ\s*instock\s*ရှိလဲ|ပစ္စည်း\s*ဘာတွေရှိလဲ|အဆင်သင့်\s*ဘာတွေရှိလဲ|^instock$|^in-stock$|လက်ကျန်ပစ္စည်း)/i.test(q) &&
      targetCategories.length === 0 &&
      matchedBrands.length === 0 &&
      specificMatchedProducts.length === 0

    if (isGeneralInstockQuery || (hasInstockFilter && targetCategories.length === 0 && matchedBrands.length === 0 && specificMatchedProducts.length === 0 && !priceFilter && q.length < 24)) {
      const allInstock = products.filter(isProductInStock)
      const breakdown = getCategoryInstockBreakdown()
      const countFor = (cats) => cats.reduce((sum, c) => sum + (breakdown[c]?.instock || 0), 0)

      const chips = [
        { label: `⌨️ Keyboard (${countFor(['Keyboard', 'Barebone', 'Numpad Keyboard'])})`, query: 'keyboard instock' },
        { label: `🖱️ Mouse (${countFor(['Mouse', 'mouse'])})`, query: 'mouse instock' },
        { label: `🔘 Switch (${countFor(['Switch'])})`, query: 'switch instock' },
        { label: `🔤 Keycaps (${countFor(['Keycaps'])})`, query: 'keycaps instock' },
        { label: `🖲️ Mousepad & Glasspad (${countFor(['Mousepad', 'Glasspad'])})`, query: 'mousepad instock' },
        { label: `🧴 Skincare & Beauty (${countFor(DEPARTMENT_CLUSTERS.beauty_personal_care)})`, query: 'skincare instock' },
      ]

      const replyText =
        `📦 <b>လက်ရှိဆိုင်တွင် အဆင်သင့်ရှိသော (In-stock) ပစ္စည်း စုစုပေါင်း ${allInstock.length} မျိုး ရှိပါသည်ခင်ဗျာ။</b>\n\n` +
        `အောက်ပါ အမျိုးအစားခလုတ်များကို နှိပ်၍ဖြစ်စေ၊ ပစ္စည်းအမည်ရိုက်ထည့်၍ဖြစ်စေ အလွယ်တကူ ရွေးချယ်ကြည့်ရှုနိုင်ပါတယ်ခင်ဗျာ -`

      return {
        text: replyText,
        products: allInstock.slice(0, 6),
        allProducts: allInstock,
        categoryChips: chips,
        visibleCount: 6,
      }
    }

    // ------------------------------------------------------------------------
    // 13. CONTEXT-AWARE FOLLOW-UPS (Referring to previous product)
    // ------------------------------------------------------------------------
    const isPronounFollowup = /(အဲ့ဒါ|ဒီဟာ|အဲ့ကောင်|ဒါ|it|that|this)/i.test(q)
    if (
      lastProduct &&
      targetCategories.length === 0 &&
      matchedBrands.length === 0 &&
      specificMatchedProducts.length === 0 &&
      (isPronounFollowup || ((isPriceQuery || isStockQuery || isColorQuery || isSwitchQuery) && q.length < 25 && !hasInstockFilter))
    ) {
      const p = lastProduct
      const kv = p.var_group
      const priceStr = formatPrice(p)
      const stockStr = formatStock(p)

      if (isPriceQuery) {
        return {
          text: `လက်ရှိ မေးမြန်းထားသော <b>${p.name} (🆔 #${p.id})</b> ၏ စျေးနှုန်းမှာ <b>${priceStr}</b> ဖြစ်ပါတယ်ခင်ဗျာ။\n\nအခြေအနေ: ${stockStr}`,
          products: [p],
          allProducts: [p],
        }
      }

      if (isStockQuery) {
        return {
          text: `<b>${p.name} (🆔 #${p.id})</b> သည် ${stockStr} ဖြစ်ပါတယ်ခင်ဗျာ။\n\nစျေးနှုန်း: <b>${priceStr}</b>`,
          products: [p],
          allProducts: [p],
        }
      }

      if (isColorQuery) {
        const colors = kv?.colors?.length ? kv.colors.join(', ') : (p.colors || 'ပုံမှန်အရောင်')
        return {
          text: `<b>${p.name} (🆔 #${p.id})</b> အတွက် ရရှိနိုင်သော အရောင်များမှာ: <b>${colors}</b> ဖြစ်ပါတယ်ခင်ဗျာ။`,
          products: [p],
          allProducts: [p],
        }
      }

      if (isSwitchQuery) {
        return answerProductSpecificationQuery(p, userQuery, [p])
      }
    }

    // Department intent
    const isGamingIntent =
      GAMING_HARDWARE_INTENT_REGEX.test(q) ||
      Object.keys(BRAND_SYNONYMS).some(
        (b) => q.includes(b) && !['vaseline', 'kerastase', 'fino', 'tsubaki', 'cerave', 'garnier', 'pantene', 'johnson', 'sasi', 'kma', 'celimax', 'jmcy', '3ce', 'centella'].includes(b)
      )
    const isBeautyIntent =
      BEAUTY_CARE_INTENT_REGEX.test(q) ||
      ['vaseline', 'kerastase', 'fino', 'tsubaki', 'cerave', 'garnier', 'pantene', 'johnson', 'sasi', 'kma', 'celimax', 'jmcy', '3ce', 'centella'].some((b) => q.includes(b))

    // Extract Model Tokens (stripping Burmese particles, category words, brand names, and price digits)
    let cleanedModel = q.replace(BURMESE_PARTICLES_REGEX, ' ')
    for (const cat of CATEGORY_WORDS) {
      const isAsc = /^[a-z0-9\s]+$/i.test(cat)
      cleanedModel = isAsc
        ? cleanedModel.replace(new RegExp(`\\b${cat}\\b`, 'gi'), ' ')
        : cleanedModel.replace(new RegExp(cat, 'gi'), ' ')
    }
    for (const brand of Object.keys(BRAND_SYNONYMS)) {
      const isAsc = /^[a-z0-9\s\-]+$/i.test(brand)
      cleanedModel = isAsc
        ? cleanedModel.replace(new RegExp(`\\b${brand.replace(/\s+/g, '\\s+')}\\b`, 'gi'), ' ')
        : cleanedModel.replace(new RegExp(brand, 'gi'), ' ')
    }
    if (priceFilter) {
      cleanedModel = cleanedModel.replace(/[\d၀-၉\.]+/g, ' ')
    }
    const modelTokens = cleanedModel
      .trim()
      .split(/\s+/)
      .filter((t) => t && !GENERIC_MODIFIER_WORDS.has(t.toLowerCase()) && !/[\u1000-\u109F]/.test(t))
    const hasHeToken = /\bhe\b/i.test(q)
    const hasRtToken = /\brt\b/i.test(q)

    // ------------------------------------------------------------------------
    // 14. SWITCH SOUND PROFILE MATCHING (Thocky, Clacky, Creamy, Silent Switches)
    // ------------------------------------------------------------------------
    if (specificMatchedProducts.length === 0 && matchedBrands.length === 0) {
      for (const [, profile] of Object.entries(SWITCH_SOUND_PROFILES)) {
        if (profile.pattern.test(q)) {
          let matchedSwitches = products.filter((p) => {
            if ((p.category || '').toLowerCase() !== 'switch') return false
            return profile.switches.some(
              (swName) =>
                p.name.toLowerCase().includes(swName.toLowerCase()) ||
                swName.toLowerCase().includes(p.name.toLowerCase())
            )
          })

          if (hasInstockFilter) {
            const instockSw = matchedSwitches.filter(isProductInStock)
            if (instockSw.length > 0) matchedSwitches = instockSw
          }

          matchedSwitches = sortProductsSmart(matchedSwitches, { isCheapest, isMostExpensive, isBestOrRecommend: isBestOrRecommendQuery })

          if (matchedSwitches.length > 0) {
            return {
              text: `<b>${profile.title}</b>\n\n${profile.desc}`,
              products: matchedSwitches.slice(0, 6),
              allProducts: matchedSwitches,
              visibleCount: 6,
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 15. BRAND-BASED SEARCH (With Space-Insensitive Model Matching)
    // ------------------------------------------------------------------------
    if (matchedBrands.length > 0) {
      let brandProducts = products.filter((p) => {
        const pName = (p.name || '').toLowerCase()
        return matchedBrands.some((b) => pName.includes(b.toLowerCase()))
      })

      if (targetCategories.length > 0 && modelTokens.length === 0) {
        brandProducts = brandProducts.filter((p) =>
          targetCategories.some((tc) => (p.category || '').toLowerCase() === tc.toLowerCase())
        )
      } else if (isGamingIntent) {
        brandProducts = brandProducts.filter(
          (p) =>
            !DEPARTMENT_CLUSTERS.beauty_personal_care.some(
              (bc) => (p.category || '').toLowerCase() === bc.toLowerCase()
            )
        )
      }

      if (brandProducts.length === 0) {
        return makeNotFoundResponse()
      }

      const brandQueryTokens = [...modelTokens]
      if (hasHeToken) brandQueryTokens.push('he')
      if (hasRtToken) brandQueryTokens.push('rt')

      if (brandQueryTokens.length > 0) {
        let modelFiltered = brandProducts.filter((p) =>
          brandQueryTokens.every((kw) => tokenMatchesName(kw, p.name))
        )

        if (modelFiltered.length === 0 && modelTokens.length > 1) {
          const joinedToken = modelTokens.join('')
          modelFiltered = brandProducts.filter((p) => {
            if (!tokenMatchesName(joinedToken, p.name)) return false
            if (hasHeToken && !tokenMatchesName('he', p.name)) return false
            return true
          })
        }

        if (modelFiltered.length === 0 && modelTokens.length > 0) {
          modelFiltered = brandProducts.filter((p) =>
            modelTokens.some((kw) => tokenMatchesName(kw, p.name))
          )
        }

        if (modelFiltered.length > 0) {
          brandProducts = modelFiltered
        } else if (modelTokens.length > 0) {
          const otherMatches = products.filter((p) =>
            modelTokens.some((kw) => tokenMatchesName(kw, p.name))
          )

          if (otherMatches.length === 0) {
            const requestedModel = brandQueryTokens.join(' ').toUpperCase()
            const brandName = matchedBrands[0]
            brandProducts = sortProductsSmart(brandProducts)
            return {
              text:
                `တောင်းပန်ပါတယ်ခင်ဗျာ၊ လူကြီးမင်း မေးမြန်းထားသော <b>${brandName} ${requestedModel}</b> သည် ဆိုင်၏ database ထဲတွင် လတ်တလော မရှိသေးပါခင်ဗျာ။\n\n` +
                `💡 <b>လက်ရှိဆိုင်တွင် ရရှိနိုင်သော ${brandName} ပစ္စည်းများမှာ -</b>`,
              products: brandProducts.slice(0, 6),
              allProducts: brandProducts,
              visibleCount: 6,
            }
          }
        }
      }

      if (priceFilter) {
        brandProducts = brandProducts.filter((p) =>
          isProductInPriceRange(p, priceFilter.minPrice, priceFilter.maxPrice)
        )
        if (brandProducts.length === 0) {
          return {
            text: `တောင်းပန်ပါတယ်ခင်ဗျာ၊ <b>${matchedBrands[0]}</b> တံဆိပ်တွင် <b>${priceFilter.label}</b> ရှိသော ပစ္စည်း လတ်တလော မတွေ့ရှိပါဘူးခင်ဗျာ။`,
            products: [],
          }
        }
      }

      brandProducts = sortProductsSmart(brandProducts, {
        isCheapest,
        isMostExpensive,
        isBestOrRecommend: isBestOrRecommendQuery,
        priceFilter,
        hasPreorderFilter,
      })

      if (hasInstockFilter && brandQueryTokens.length === 0) {
        const instockOnly = brandProducts.filter(isProductInStock)
        if (instockOnly.length > 0) {
          return {
            text: `🏷️ <b>${matchedBrands[0]}</b> တံဆိပ်ထဲတွင် ${priceFilter ? `<b>${priceFilter.label}</b> ရှိသော ` : ''}<b>ပစ္စည်းအဆင်သင့်ရှိသော (In-stock)</b> ပစ္စည်း ${instockOnly.length} မျိုး ရှိပါသည်ခင်ဗျာ -`,
            products: instockOnly.slice(0, 6),
            allProducts: instockOnly,
            visibleCount: 6,
          }
        } else {
          return {
            text: `တောင်းပန်ပါတယ်ခင်ဗျာ၊ <b>${matchedBrands[0]}</b> တံဆိပ်တွင် ${priceFilter ? `<b>${priceFilter.label}</b> ရှိသော ` : ''}လတ်တလော <b>In-stock ပစ္စည်း မရှိသေးပါခင်ဗျာ</b>။\n\nအောက်ပါ <b>Pre-order မှာယူနိုင်သော</b> ပစ္စည်း ${brandProducts.length} မျိုး ရှိပါသည်ခင်ဗျာ -`,
            products: brandProducts.slice(0, 6),
            allProducts: brandProducts,
            visibleCount: 6,
          }
        }
      }

      if (brandProducts.length === 1 && brandQueryTokens.length > 0) {
        const topP = brandProducts[0]
        setLastProduct(topP)
        const kv = topP.var_group
        let reply = `✨ <b>${topP.name} (🆔 #${topP.id}) ၏ အချက်အလက်များ ဖြစ်ပါတယ်ခင်ဗျာ -</b>\n\n`
        reply += `• 💰 <b>စျေးနှုန်း:</b> <b>${formatPrice(topP)}</b>\n`
        reply += `• 📊 <b>အခြေအနေ:</b> ${formatStock(topP)}\n`
        if (topP.category) reply += `• 📁 <b>အမျိုးအစား:</b> ${topP.category}\n`
        if (topP.connection) reply += `• 🔌 <b>ချိတ်ဆက်မှု:</b> ${topP.connection}\n`
        if (kv?.colors?.length > 1) reply += `• 🎨 <b>ရနိုင်သောအရောင်:</b> ${kv.colors.join(', ')}\n`
        if (kv?.options?.length > 1) reply += `• ⚙️ <b>${kv.option_label || 'Option'}:</b> ${kv.options.join(', ')}\n`
        return {
          text: reply,
          products: [topP],
          allProducts: [topP],
          visibleCount: 1,
        }
      }

      const instockCount = brandProducts.filter(isProductInStock).length
      setLastProduct(brandProducts[0])
      return {
        text: `🏷️ <b>${matchedBrands[0]}</b> တံဆိပ် ${priceFilter ? `<b>${priceFilter.label}</b> ` : ''}ပစ္စည်း စုစုပေါင်း ${brandProducts.length} မျိုး (In-stock ${instockCount} မျိုး) ရှိပါသည်ခင်ဗျာ -`,
        products: brandProducts.slice(0, 6),
        allProducts: brandProducts,
        visibleCount: 6,
      }
    }

    // ------------------------------------------------------------------------
    // 16. SPECIAL TECH FEATURES (Rapid Trigger, Silent, Wireless - Category Isolated)
    // ------------------------------------------------------------------------
    if (specificMatchedProducts.length === 0) {
      for (const [, feat] of Object.entries(TECH_FEATURES)) {
        if (feat.pattern.test(q)) {
          let matched = products.filter(feat.filter)
          if (targetCategories.length > 0) {
            matched = matched.filter((p) =>
              targetCategories.some((tc) => (p.category || '').toLowerCase() === tc.toLowerCase())
            )
          }
          if (priceFilter) {
            matched = matched.filter((p) => isProductInPriceRange(p, priceFilter.minPrice, priceFilter.maxPrice))
          }
          if (hasInstockFilter) {
            const instockM = matched.filter(isProductInStock)
            if (instockM.length > 0) matched = instockM
          }

          matched = sortProductsSmart(matched, {
            isCheapest,
            isMostExpensive,
            isBestOrRecommend: isBestOrRecommendQuery,
            priceFilter,
            hasPreorderFilter,
          })

          if (matched.length > 0) {
            return {
              text: `<b>${feat.title}</b>\n\n${feat.desc}`,
              products: matched.slice(0, 6),
              allProducts: matched,
              visibleCount: 6,
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 17. CATEGORY MATCHING (Only when no specific model/product was named)
    // ------------------------------------------------------------------------
    if (targetCategories.length > 0 && specificMatchedProducts.length === 0 && modelTokens.length === 0) {
      const catLabel = formatCategoryLabel(targetCategories)
      let catProducts = products.filter((p) =>
        targetCategories.some((tc) => (p.category || '').toLowerCase() === tc.toLowerCase())
      )

      if (priceFilter) {
        catProducts = catProducts.filter((p) =>
          isProductInPriceRange(p, priceFilter.minPrice, priceFilter.maxPrice)
        )
        if (catProducts.length === 0) {
          return {
            text: `တောင်းပန်ပါတယ်ခင်ဗျာ၊ <b>${catLabel}</b> အမျိုးအစားထဲတွင် <b>${priceFilter.label}</b> ရှိသော ပစ္စည်း လတ်တလော မတွေ့ရှိပါဘူးခင်ဗျာ။\n\nအခြား စျေးနှုန်းဝန်းကျင်ဖြင့် စမ်းသပ်မေးမြန်းပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။`,
            products: [],
          }
        }
      }

      if (hasInstockFilter) {
        const instockOnly = sortProductsSmart(catProducts.filter(isProductInStock), {
          isCheapest,
          isMostExpensive,
          isBestOrRecommend: isBestOrRecommendQuery,
          priceFilter,
        })

        if (instockOnly.length > 0) {
          setLastCategory(targetCategories[0])
          return {
            text: `📂 <b>${catLabel}</b> အမျိုးအစားထဲတွင် ${priceFilter ? `<b>${priceFilter.label}</b> ရှိသော ` : ''}<b>ပစ္စည်းအဆင်သင့်ရှိသော (In-stock) ပစ္စည်း စုစုပေါင်း ${instockOnly.length} မျိုး</b> ရှိပါသည်ခင်ဗျာ -`,
            products: instockOnly.slice(0, 6),
            allProducts: instockOnly,
            visibleCount: 6,
          }
        } else {
          const sortedPreorder = sortProductsSmart(catProducts, { isCheapest, isMostExpensive, priceFilter })
          return {
            text: `တောင်းပန်ပါတယ်ခင်ဗျာ၊ <b>${catLabel}</b> အမျိုးအစားထဲတွင် ${priceFilter ? `<b>${priceFilter.label}</b> ရှိသော ` : ''}<b>In-stock ပစ္စည်း လတ်တလော မရှိသေးပါခင်ဗျာ</b>။\n\nအောက်ပါ <b>Pre-order</b> မှာယူနိုင်သော ပစ္စည်း ${sortedPreorder.length} မျိုး ရှိပါသည်ခင်ဗျာ -`,
            products: sortedPreorder.slice(0, 6),
            allProducts: sortedPreorder,
            visibleCount: 6,
          }
        }
      }

      if (hasPreorderFilter) {
        const preorderOnly = sortProductsSmart(
          catProducts.filter((p) => !isProductInStock(p)),
          { isCheapest, isMostExpensive, priceFilter, hasPreorderFilter: true }
        )
        if (preorderOnly.length > 0) {
          return {
            text: `📂 <b>${catLabel}</b> အမျိုးအစားထဲတွင် ${priceFilter ? `<b>${priceFilter.label}</b> ရှိသော ` : ''}<b>Pre-order မှာယူနိုင်သော ပစ္စည်း စုစုပေါင်း ${preorderOnly.length} မျိုး</b> ဖြစ်ပါတယ်ခင်ဗျာ -`,
            products: preorderOnly.slice(0, 6),
            allProducts: preorderOnly,
            visibleCount: 6,
          }
        }
      }

      catProducts = sortProductsSmart(catProducts, {
        isCheapest,
        isMostExpensive,
        isBestOrRecommend: isBestOrRecommendQuery,
        priceFilter,
      })

      if (catProducts.length > 0) {
        setLastCategory(targetCategories[0])
        const instockCount = catProducts.filter(isProductInStock).length
        const headerPrefix = isBestOrRecommendQuery
          ? `🏆 <b>${catLabel}</b> အမျိုးအစားထဲမှ အကောင်းဆုံးနှင့် လူကြိုက်အများဆုံး မော်ဒယ်များ (စုစုပေါင်း ${catProducts.length} မျိုး၊ In-stock ${instockCount} မျိုး):`
          : `📂 <b>${catLabel}</b> အမျိုးအစားထဲတွင် ${priceFilter ? `<b>${priceFilter.label}</b> ရှိသော ` : ''}ပစ္စည်း စုစုပေါင်း ${catProducts.length} မျိုး (In-stock ${instockCount} မျိုး) ရှိပါသည်ခင်ဗျာ -`

        return {
          text: headerPrefix,
          products: catProducts.slice(0, 6),
          allProducts: catProducts,
          visibleCount: 6,
        }
      }
    }

    // ------------------------------------------------------------------------
    // 17.5 PURE PRICE / BUDGET FILTER MATCHING (e.g. "၁သိန်းခွဲဝန်းကျင် ဘာတွေရှိလဲ")
    // ------------------------------------------------------------------------
    if (priceFilter && targetCategories.length === 0 && matchedBrands.length === 0 && specificMatchedProducts.length === 0) {
      let priceProducts = products.filter((p) => {
        const pCat = (p.category || '').toLowerCase()
        if (isGamingIntent) {
          if (DEPARTMENT_CLUSTERS.beauty_personal_care.some((bc) => pCat === bc.toLowerCase())) return false
        }
        if (isBeautyIntent) {
          if (DEPARTMENT_CLUSTERS.gaming_hardware.some((gh) => pCat === gh.toLowerCase())) return false
        }
        return isProductInPriceRange(p, priceFilter.minPrice, priceFilter.maxPrice)
      })

      if (hasInstockFilter) {
        priceProducts = priceProducts.filter(isProductInStock)
      }

      priceProducts = sortProductsSmart(priceProducts, {
        isCheapest,
        isMostExpensive,
        isBestOrRecommend: isBestOrRecommendQuery,
        priceFilter,
      })

      if (priceProducts.length > 0) {
        const instockCount = priceProducts.filter(isProductInStock).length
        return {
          text: `💰 <b>${priceFilter.label}</b> ရှိသော ပစ္စည်း စုစုပေါင်း ${priceProducts.length} မျိုး (In-stock ${instockCount} မျိုး) ရှိပါသည်ခင်ဗျာ -`,
          products: priceProducts.slice(0, 6),
          allProducts: priceProducts,
          visibleCount: 6,
        }
      } else {
        return {
          text: `တောင်းပန်ပါတယ်ခင်ဗျာ၊ ဆိုင်တွင် <b>${priceFilter.label}</b> ရှိသော ပစ္စည်း လတ်တလော မတွေ့ရှိပါဘူးခင်ဗျာ။`,
          products: [],
        }
      }
    }

    // ------------------------------------------------------------------------
    // 18. PRODUCT SEARCH & MATCHING (Space-Insensitive & Multi-Variant Aware)
    // ------------------------------------------------------------------------
    if (specificMatchedProducts.length > 0) {
      let matched = [...specificMatchedProducts]
      if (targetCategories.length > 0) {
        const catFiltered = matched.filter((p) =>
          targetCategories.some((tc) => (p.category || '').toLowerCase() === tc.toLowerCase())
        )
        if (catFiltered.length > 0) matched = catFiltered
      }
      if (priceFilter) {
        matched = matched.filter((p) => isProductInPriceRange(p, priceFilter.minPrice, priceFilter.maxPrice))
      }

      if (matched.length === 1) {
        const topP = matched[0]
        setLastProduct(topP)
        const kv = topP.var_group
        let reply = `✨ <b>${topP.name} (🆔 #${topP.id}) ၏ အချက်အလက်များ ဖြစ်ပါတယ်ခင်ဗျာ -</b>\n\n`
        reply += `• 💰 <b>စျေးနှုန်း:</b> <b>${formatPrice(topP)}</b>\n`
        reply += `• 📊 <b>အခြေအနေ:</b> ${formatStock(topP)}\n`
        if (topP.category) reply += `• 📁 <b>အမျိုးအစား:</b> ${topP.category}\n`
        if (topP.connection) reply += `• 🔌 <b>ချိတ်ဆက်မှု:</b> ${topP.connection}\n`
        if (kv?.colors?.length > 1) reply += `• 🎨 <b>ရနိုင်သောအရောင်:</b> ${kv.colors.join(', ')}\n`
        if (kv?.options?.length > 1) reply += `• ⚙️ <b>${kv.option_label || 'Option'}:</b> ${kv.options.join(', ')}\n`
        return {
          text: reply,
          products: [topP],
          allProducts: [topP],
          visibleCount: 1,
        }
      }

      if (matched.length > 1) {
        matched = sortProductsSmart(matched, { isCheapest, isMostExpensive, priceFilter })
        setLastProduct(matched[0])
        return {
          text: `🔍 လူကြီးမင်း မေးမြန်းသော ပစ္စည်းနှင့် ကိုက်ညီသည့် မော်ဒယ် <b>${matched.length} မျိုး</b> တွေ့ရှိထားပါသည်ခင်ဗျာ -`,
          products: matched.slice(0, 6),
          allProducts: matched,
          visibleCount: 6,
        }
      }
    }

    if (modelTokens.length > 0) {
      const hasAnyMatch = products.some((p) => modelTokens.some((kw) => tokenMatchesName(kw, p.name)))
      if (!hasAnyMatch) {
        return makeNotFoundResponse()
      }
    }

    // ------------------------------------------------------------------------
    // 19. FALLBACK IF NO MATCH FOUND
    // ------------------------------------------------------------------------
    return makeNotFoundResponse()
  }

  // Handle Send Message
  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim()
    if (!text) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    // Check if user is introducing their name
    const introMatch = text.match(/(?:ကျနော်|ကျွန်တော်|ကျမ|ကျွန်မ|ငါ|my name is)\s*(?:ရဲ့)?\s*နာမည်\s*(?:က|ကတော့)?\s*([a-zA-Z\u1000-\u109F\s]+?)(?:ပါ|ဖြစ်ပါတယ်|ပါခင်ဗျာ|ပါရှင်|$)/i)
    let activeName = (customerInfo.name || '').trim()
    if (introMatch && introMatch[1]?.trim()) {
      activeName = introMatch[1].trim()
      const updated = { ...customerInfo, name: activeName }
      setCustomerInfo(updated)
      try {
        localStorage.setItem('ngrsine_customer_info', JSON.stringify(updated))
      } catch (e) {}
    }

    const memSnapshot = syncMemoryToServer(activeName)

    // Sync customer message to server with memory
    fetch('/api/shop/chat-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        sender: 'user',
        sender_name: activeName || '',
        customer_name: activeName || '',
        customer_phone: customerInfo.phone || '',
        customer_memory: memSnapshot,
        text,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.id && d.id > lastMsgIdRef.current) lastMsgIdRef.current = d.id
      })
      .catch(() => {})

    setTimeout(() => {
      try {
        const botResponse = generateBotReply(text)
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse.text,
          products: botResponse.products || [],
          allProducts: botResponse.allProducts || botResponse.products || [],
          visibleCount: botResponse.visibleCount || 6,
          categoryChips: botResponse.categoryChips || [],
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, botMsg])
        setIsTyping(false)

        // Sync bot message to server
        fetch('/api/shop/chat-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            sender: 'bot',
            text: botResponse.text,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d?.id && d.id > lastMsgIdRef.current) lastMsgIdRef.current = d.id
          })
          .catch(() => {})
      } catch (err) {
        console.error('Bot reply error:', err)
        setIsTyping(false)
      }
    }, 400)
  }

  // Handle "Load More" for a specific bot message
  const handleLoadMore = (msgId) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.allProducts) {
          const nextCount = (m.visibleCount || 6) + 6
          return {
            ...m,
            visibleCount: nextCount,
            products: m.allProducts.slice(0, nextCount),
          }
        }
        return m
      })
    )
  }

  // Handle keyboard submission
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Unified Floating Action Stack: Up Arrow, Down Arrow, Help/Chat, Cart, Favourite */}
      <div className={`floating-action-stack ${isOpen ? 'chat-open' : ''}`}>
        {!isOpen && (
          <>
            <button
              type="button"
              className={`scroll-nav-btn scroll-to-top-btn ${isAtTop ? 'dimmed' : ''}`}
              onClick={scrollPageToTop}
              aria-label="Scroll to top"
              title="အပေါ်ဆုံးသို့ တက်ရန် (Scroll to Top)"
            >
              <ArrowUpIcon size={19} />
            </button>

            <button
              type="button"
              className={`scroll-nav-btn scroll-to-bottom-btn ${isAtBottom ? 'dimmed' : ''}`}
              onClick={scrollPageToBottom}
              aria-label="Scroll to bottom"
              title="အောက်ဆုံးသို့ ဆင်းရန် (Scroll to Bottom)"
            >
              <ArrowDownIcon size={19} />
            </button>
          </>
        )}

        <button
          type="button"
          className={`scroll-nav-btn chat-widget-fab ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open chat assistant"
          title="အကူအညီ (Ngr Sine Bot)"
        >
          {isOpen ? (
            <span className="fab-icon-close">
              <CloseIcon size={19} />
            </span>
          ) : (
            <>
              <span className="fab-icon-chat">
                <MessageCircleIcon size={19} />
              </span>
              {unreadCount > 0 && <span className="floating-badge fab-unread-badge">{unreadCount}</span>}
            </>
          )}
        </button>

        {!isOpen && (
          <>
            <button
              type="button"
              className="scroll-nav-btn floating-cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open shopping cart"
              title={`စျေးခြင်းတောင်း (${totalItems})`}
            >
              <CartIcon size={19} color="currentColor" />
              {totalItems > 0 && <span className="floating-badge cart-count-badge">{totalItems}</span>}
            </button>

            <button
              type="button"
              className="scroll-nav-btn floating-fav-btn"
              onClick={() => setIsWishlistOpen(true)}
              aria-label="Open wishlist"
              title={`အကြိုက်ဆုံးစာရင်း (${wishlistCount})`}
            >
              <HeartIcon
                size={19}
                color="currentColor"
                filled={wishlistCount > 0}
                fillColor="#E05353"
              />
              {wishlistCount > 0 && <span className="floating-badge fav-count-badge">{wishlistCount}</span>}
            </button>
          </>
        )}
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chat-window-panel" role="dialog" aria-labelledby="chat-title">
          {/* Header */}
          <div className="chat-window-header">
            <div className="chat-header-info">
              <div className="chat-avatar-wrap">
                <img
                  src="/logo.png"
                  alt="Ngr Sine Bot"
                  className="chat-avatar-img"
                />
                <span className="chat-online-indicator"></span>
              </div>
              <div className="chat-title-group">
                <h4 id="chat-title" className="chat-assistant-title">
                  Ngr Sine Bot
                </h4>
                <span className="chat-assistant-status">
                  Online
                </span>
              </div>
            </div>

            <div className="chat-header-actions">
              <a
                className="chat-header-action-btn chat-tg-direct-btn"
                href={`https://t.me/${currentStore?.telegram || 'mark03168_bot'}`}
                target="_blank"
                rel="noreferrer"
                title={`Telegram (@${currentStore?.telegram || 'mark03168_bot'}) တွင် တိုက်ရိုက်ပြောမည်`}
              >
                <TelegramIcon size={16} />
              </a>
              <button
                className="chat-header-action-btn"
                onClick={handleClearHistory}
                title="စကားပြောမှတ်တမ်း အသစ်ပြန်စရန်"
              >
                ↻
              </button>
              <button
                className="chat-minimize-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="ပိတ်မည်"
              >
                <CloseIcon size={15} />
              </button>
            </div>
          </div>

          {/* Customer Browser Memory Identity Bar */}
          <div className="chat-memory-bar">
            <div
              className="chat-memory-pill"
              onClick={() => {
                setEditName(customerInfo.name || '')
                setEditPhone(customerInfo.phone || '')
                setShowProfileModal(true)
              }}
              title="လူကြီးမင်း၏ နာမည်/ဖုန်းနံပါတ် ပြင်ရန် နှိပ်ပါ (Browser Cache Memory)"
            >
              <span className="memory-badge-icon">👤</span>
              <span className="memory-name-text">
                {customerInfo.name ? customerInfo.name : `ဧည့်သည် #${sessionId.slice(-4).toUpperCase()}`}
              </span>
              {customerInfo.phone ? (
                <span className="memory-phone-text">({customerInfo.phone})</span>
              ) : null}
              <span className="memory-edit-hint" title="အမည်/ဖုန်း ထည့်သွင်းရန်">✏️</span>
            </div>

            {totalItems > 0 && (
              <div
                className="chat-memory-cart-chip"
                onClick={() => setIsCartOpen(true)}
                title="Cart ဖွင့်ကြည့်ရန်"
              >
                🛒 {totalItems} ခု
              </div>
            )}
          </div>

          {/* Profile Edit Modal */}
          {showProfileModal && (
            <div className="chat-profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
              <div className="chat-profile-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="chat-profile-modal-header">
                  <h5>👤 မိမိအချက်အလက် (Browser Memory)</h5>
                  <button type="button" className="close-profile-btn" onClick={() => setShowProfileModal(false)}>✕</button>
                </div>
                <p className="chat-profile-sub">
                  ဆိုင်ရှင်မှ လူကြီးမင်းကို မရောထွေးစေရန် အမည်နှင့် ဖုန်းနံပါတ် ထည့်ထားနိုင်ပါသည် (Browser Cache တွင် အမြဲမှတ်ထားပါမည်)။
                </p>
                <div className="chat-profile-fields">
                  <label>အမည် (Customer Name)</label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - ကိုမင်းသူ"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <label>ဖုန်းနံပါတ် (Phone Number)</label>
                  <input
                    type="text"
                    placeholder="ဥပမာ - 09123456789"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div className="chat-profile-actions">
                  {(customerInfo.name || customerInfo.phone) && (
                    <button
                      type="button"
                      className="clear-profile-btn"
                      onClick={() => {
                        const cleared = { name: '', phone: '', address: '', notes: '' }
                        setCustomerInfo(cleared)
                        setEditName('')
                        setEditPhone('')
                        try {
                          localStorage.removeItem('ngrsine_customer_info')
                          localStorage.removeItem('ngrsine_customer_memory_v1')
                        } catch (e) {}
                        syncMemoryToServer('', '')
                        setShowProfileModal(false)
                      }}
                      title="မှတ်သားထားသော အချက်အလက်များ ဖျက်မည်"
                    >
                      🗑️ ဖျက်မည်
                    </button>
                  )}
                  <button
                    type="button"
                    className="save-profile-btn"
                    onClick={() => {
                      const updated = {
                        ...customerInfo,
                        name: editName.trim(),
                        phone: editPhone.trim(),
                      }
                      setCustomerInfo(updated)
                      try {
                        localStorage.setItem('ngrsine_customer_info', JSON.stringify(updated))
                      } catch (e) {}
                      syncMemoryToServer(editName.trim(), editPhone.trim())
                      setShowProfileModal(false)
                    }}
                  >
                    ✓ မှတ်သားမည်
                  </button>
                  <button
                    type="button"
                    className="cancel-profile-btn"
                    onClick={() => setShowProfileModal(false)}
                  >
                    ပိတ်မည်
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="chat-messages-container">
            {messages.map((m) => (
              <div key={m.id} className={`chat-message-row ${m.sender}`}>
                {m.sender === 'bot' && (
                  <div className="bot-chat-avatar">
                    <img
                      src="/logo.png"
                      alt="Assistant Logo"
                      className="bot-chat-avatar-img"
                    />
                  </div>
                )}
                {m.sender === 'admin' && (
                  <div className="bot-chat-avatar admin-chat-avatar" title="Ngr Sine ဆိုင်ရှင်">
                    <span className="admin-avatar-icon">👨‍💼</span>
                  </div>
                )}

                <div className={`chat-bubble-content ${m.sender === 'admin' ? 'admin-bubble-content' : ''}`}>
                  {m.sender === 'admin' && (
                    <div className="admin-chat-tag">
                      <span className="admin-tag-badge">👨‍💼 ဆိုင်ရှင် (Admin)</span>
                    </div>
                  )}

                  {m.sender === 'user' ? (
                    <div className="chat-bubble-text" style={{ whiteSpace: 'pre-wrap' }}>
                      {m.text}
                    </div>
                  ) : (
                    <div
                      className="chat-bubble-text"
                      dangerouslySetInnerHTML={{ __html: sanitizeBotHtml(m.text) }}
                    />
                  )}

                  {/* Optional Category Filter Pills (e.g. for Instock Breakdown) */}
                  {m.categoryChips && m.categoryChips.length > 0 && (
                    <div className="chat-category-chips-bar">
                      {m.categoryChips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          className="chat-cat-chip"
                          onClick={() => handleSendMessage(chip.query)}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sleek Attached Product Mini Cards (NO IMAGES, Direct View) */}
                  {m.products && m.products.length > 0 && (
                    <div className="chat-products-mini-list">
                      {m.products.map((prod) => {
                        const price = formatPrice(prod)
                        const inStock = isProductInStock(prod)

                        return (
                          <div key={prod.id} className="chat-product-mini-card">
                            <div className="mini-card-details">
                              <div className="mini-card-top-row">
                                <span className="mini-card-cat">{prod.category || 'General'} · #{prod.id}</span>
                                <span
                                  className={`mini-card-badge ${
                                    inStock ? 'instock' : 'preorder'
                                  }`}
                                >
                                  {inStock ? (
                                    <>
                                      <CheckIcon size={11} /> In-stock
                                    </>
                                  ) : (
                                    <>
                                      <ClockIcon size={11} /> Pre-order
                                    </>
                                  )}
                                </span>
                              </div>
                              <div className="mini-card-name" title={prod.name}>
                                {prod.name}
                              </div>
                              <div className="mini-card-price">{price}</div>
                            </div>

                            <div className="mini-card-actions">
                              <button
                                className="mini-card-view-btn"
                                onClick={() => onSelectProduct && onSelectProduct(prod)}
                                title="ပစ္စည်းအသေးစိတ် ကြည့်ရှုမည်"
                              >
                                ကြည့်မည် <ArrowRightIcon size={11} />
                              </button>
                            </div>
                          </div>
                        )
                      })}

                      {/* Load More Button if more items are available */}
                      {m.allProducts && m.allProducts.length > (m.visibleCount || 6) && (
                        <button
                          className="chat-load-more-btn"
                          onClick={() => handleLoadMore(m.id)}
                        >
                          နောက်ထပ် {Math.min(6, m.allProducts.length - (m.visibleCount || 6))} ခု ကြည့်ရန် (ကျန်ရှိ: {m.allProducts.length - (m.visibleCount || 6)} ခု) ▾
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="chat-message-row bot">
                <div className="bot-chat-avatar">
                  <img
                    src="/logo.png"
                    alt="Assistant Logo"
                    className="bot-chat-avatar-img"
                  />
                </div>
                <div className="chat-bubble-content">
                  <div className="typing-indicator-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="chat-suggestions-bar">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                className="chat-suggestion-chip"
                onClick={() => handleSendMessage(sug)}
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-text-input"
              placeholder="သိလိုသည်များကို မေးမြန်းပါ..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              aria-label="Send message"
            >
              <SendIcon size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
