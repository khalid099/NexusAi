export type LanguageCode =
  | 'en'
  | 'ar'
  | 'fr'
  | 'de'
  | 'es'
  | 'pt-BR'
  | 'zh-CN'
  | 'ja'
  | 'ko'
  | 'hi'
  | 'ur'
  | 'tr'
  | 'ru'
  | 'it'
  | 'nl';

export interface LanguageOption {
  code: LanguageCode;
  shortLabel: string;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
}

interface NavCopy {
  chatHub: string;
  marketplace: string;
  discoverNew: string;
  agents: string;
  newBadge: string;
  chat: string;
  discover: string;
  api: string;
  upgrade: string;
  signIn: string;
  signOut: string;
  getStarted: string;
  openWorkspace: string;
  account: string;
  appLanguage: string;
}

export const LANGUAGE_STORAGE_KEY = 'nexusai-language';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', shortLabel: 'EN', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'ar', shortLabel: 'AR', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'fr', shortLabel: 'FR', label: 'French', nativeLabel: 'Francais', dir: 'ltr' },
  { code: 'de', shortLabel: 'DE', label: 'German', nativeLabel: 'Deutsch', dir: 'ltr' },
  { code: 'es', shortLabel: 'ES', label: 'Spanish', nativeLabel: 'Espanol', dir: 'ltr' },
  { code: 'pt-BR', shortLabel: 'BR', label: 'Portuguese (Brazil)', nativeLabel: 'Portugues', dir: 'ltr' },
  { code: 'zh-CN', shortLabel: 'CN', label: 'Chinese (Simplified)', nativeLabel: '中文', dir: 'ltr' },
  { code: 'ja', shortLabel: 'JP', label: 'Japanese', nativeLabel: '日本語', dir: 'ltr' },
  { code: 'ko', shortLabel: 'KR', label: 'Korean', nativeLabel: '한국어', dir: 'ltr' },
  { code: 'hi', shortLabel: 'IN', label: 'Hindi', nativeLabel: 'हिन्दी', dir: 'ltr' },
  { code: 'ur', shortLabel: 'PK', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl' },
  { code: 'tr', shortLabel: 'TR', label: 'Turkish', nativeLabel: 'Turkce', dir: 'ltr' },
  { code: 'ru', shortLabel: 'RU', label: 'Russian', nativeLabel: 'Русский', dir: 'ltr' },
  { code: 'it', shortLabel: 'IT', label: 'Italian', nativeLabel: 'Italiano', dir: 'ltr' },
  { code: 'nl', shortLabel: 'NL', label: 'Dutch', nativeLabel: 'Nederlands', dir: 'ltr' },
];

const NAV_COPY: Record<LanguageCode, NavCopy> = {
  en: {
    chatHub: 'Chat Hub',
    marketplace: 'Marketplace',
    discoverNew: 'Discover New',
    agents: 'Agents',
    newBadge: 'New',
    chat: 'Chat',
    discover: 'Discover',
    api: 'API',
    upgrade: 'Upgrade',
    signIn: 'Sign in',
    signOut: 'Sign out',
    getStarted: 'Get Started',
    openWorkspace: 'Open workspace',
    account: 'Account',
    appLanguage: 'App language',
  },
  ar: {
    chatHub: 'مركز الدردشة',
    marketplace: 'المتجر',
    discoverNew: 'اكتشف الجديد',
    agents: 'الوكلاء',
    newBadge: 'جديد',
    chat: 'الدردشة',
    discover: 'اكتشف',
    api: 'واجهة API',
    upgrade: 'ترقية',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    getStarted: 'ابدأ الان',
    openWorkspace: 'افتح مساحة العمل',
    account: 'الحساب',
    appLanguage: 'لغة التطبيق',
  },
  fr: {
    chatHub: 'Hub Chat',
    marketplace: 'Marketplace',
    discoverNew: 'Decouvrir',
    agents: 'Agents',
    newBadge: 'Nouveau',
    chat: 'Chat',
    discover: 'Explorer',
    api: 'API',
    upgrade: 'Mettre a niveau',
    signIn: 'Se connecter',
    signOut: 'Se deconnecter',
    getStarted: 'Commencer',
    openWorkspace: 'Ouvrir l espace',
    account: 'Compte',
    appLanguage: 'Langue de l app',
  },
  de: {
    chatHub: 'Chat Hub',
    marketplace: 'Marktplatz',
    discoverNew: 'Neu entdecken',
    agents: 'Agenten',
    newBadge: 'Neu',
    chat: 'Chat',
    discover: 'Entdecken',
    api: 'API',
    upgrade: 'Upgrade',
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    getStarted: 'Loslegen',
    openWorkspace: 'Workspace offnen',
    account: 'Konto',
    appLanguage: 'App-Sprache',
  },
  es: {
    chatHub: 'Centro de chat',
    marketplace: 'Marketplace',
    discoverNew: 'Descubrir',
    agents: 'Agentes',
    newBadge: 'Nuevo',
    chat: 'Chat',
    discover: 'Descubrir',
    api: 'API',
    upgrade: 'Mejorar',
    signIn: 'Iniciar sesion',
    signOut: 'Cerrar sesion',
    getStarted: 'Comenzar',
    openWorkspace: 'Abrir espacio',
    account: 'Cuenta',
    appLanguage: 'Idioma de la app',
  },
  'pt-BR': {
    chatHub: 'Central de chat',
    marketplace: 'Marketplace',
    discoverNew: 'Descobrir',
    agents: 'Agentes',
    newBadge: 'Novo',
    chat: 'Chat',
    discover: 'Descobrir',
    api: 'API',
    upgrade: 'Upgrade',
    signIn: 'Entrar',
    signOut: 'Sair',
    getStarted: 'Comecar',
    openWorkspace: 'Abrir workspace',
    account: 'Conta',
    appLanguage: 'Idioma do app',
  },
  'zh-CN': {
    chatHub: '聊天中心',
    marketplace: '模型市场',
    discoverNew: '发现新品',
    agents: '智能体',
    newBadge: '新',
    chat: '聊天',
    discover: '发现',
    api: 'API',
    upgrade: '升级',
    signIn: '登录',
    signOut: '退出',
    getStarted: '开始使用',
    openWorkspace: '打开工作区',
    account: '账户',
    appLanguage: '应用语言',
  },
  ja: {
    chatHub: 'チャットハブ',
    marketplace: 'マーケットプレイス',
    discoverNew: '新着を探す',
    agents: 'エージェント',
    newBadge: '新着',
    chat: 'チャット',
    discover: '発見',
    api: 'API',
    upgrade: 'アップグレード',
    signIn: 'サインイン',
    signOut: 'サインアウト',
    getStarted: '始める',
    openWorkspace: 'ワークスペースを開く',
    account: 'アカウント',
    appLanguage: 'アプリの言語',
  },
  ko: {
    chatHub: '채팅 허브',
    marketplace: '마켓플레이스',
    discoverNew: '새로 발견',
    agents: '에이전트',
    newBadge: '신규',
    chat: '채팅',
    discover: '탐색',
    api: 'API',
    upgrade: '업그레이드',
    signIn: '로그인',
    signOut: '로그아웃',
    getStarted: '시작하기',
    openWorkspace: '워크스페이스 열기',
    account: '계정',
    appLanguage: '앱 언어',
  },
  hi: {
    chatHub: 'चैट हब',
    marketplace: 'मार्केटप्लेस',
    discoverNew: 'नया खोजें',
    agents: 'एजेंट्स',
    newBadge: 'नया',
    chat: 'चैट',
    discover: 'खोजें',
    api: 'API',
    upgrade: 'अपग्रेड',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    getStarted: 'शुरू करें',
    openWorkspace: 'वर्कस्पेस खोलें',
    account: 'खाता',
    appLanguage: 'ऐप भाषा',
  },
  ur: {
    chatHub: 'چیٹ ہب',
    marketplace: 'مارکیٹ پلیس',
    discoverNew: 'نیا دریافت کریں',
    agents: 'ایجنٹس',
    newBadge: 'نیا',
    chat: 'چیٹ',
    discover: 'دریافت',
    api: 'API',
    upgrade: 'اپ گریڈ',
    signIn: 'سائن ان',
    signOut: 'سائن آؤٹ',
    getStarted: 'شروع کریں',
    openWorkspace: 'ورک اسپیس کھولیں',
    account: 'اکاؤنٹ',
    appLanguage: 'ایپ کی زبان',
  },
  tr: {
    chatHub: 'Sohbet Merkezi',
    marketplace: 'Pazaryeri',
    discoverNew: 'Yenileri kesfet',
    agents: 'Ajanlar',
    newBadge: 'Yeni',
    chat: 'Sohbet',
    discover: 'Kesfet',
    api: 'API',
    upgrade: 'Yukselt',
    signIn: 'Giris yap',
    signOut: 'Cikis yap',
    getStarted: 'Baslayin',
    openWorkspace: 'Calisma alanini ac',
    account: 'Hesap',
    appLanguage: 'Uygulama dili',
  },
  ru: {
    chatHub: 'Чат-хаб',
    marketplace: 'Маркетплейс',
    discoverNew: 'Новое',
    agents: 'Агенты',
    newBadge: 'Новое',
    chat: 'Чат',
    discover: 'Обзор',
    api: 'API',
    upgrade: 'Обновить',
    signIn: 'Войти',
    signOut: 'Выйти',
    getStarted: 'Начать',
    openWorkspace: 'Открыть рабочее пространство',
    account: 'Аккаунт',
    appLanguage: 'Язык приложения',
  },
  it: {
    chatHub: 'Hub Chat',
    marketplace: 'Marketplace',
    discoverNew: 'Scopri novita',
    agents: 'Agenti',
    newBadge: 'Nuovo',
    chat: 'Chat',
    discover: 'Scopri',
    api: 'API',
    upgrade: 'Upgrade',
    signIn: 'Accedi',
    signOut: 'Esci',
    getStarted: 'Inizia',
    openWorkspace: 'Apri workspace',
    account: 'Account',
    appLanguage: 'Lingua app',
  },
  nl: {
    chatHub: 'Chat Hub',
    marketplace: 'Marktplaats',
    discoverNew: 'Ontdek nieuw',
    agents: 'Agenten',
    newBadge: 'Nieuw',
    chat: 'Chat',
    discover: 'Ontdekken',
    api: 'API',
    upgrade: 'Upgraden',
    signIn: 'Inloggen',
    signOut: 'Uitloggen',
    getStarted: 'Beginnen',
    openWorkspace: 'Werkruimte openen',
    account: 'Account',
    appLanguage: 'App-taal',
  },
};

export function getLanguageOption(code: string): LanguageOption {
  return (
    LANGUAGE_OPTIONS.find((option) => option.code === code) ??
    LANGUAGE_OPTIONS[0]
  );
}

export function getNavCopy(code: string): NavCopy {
  const option = getLanguageOption(code);
  return NAV_COPY[option.code];
}

export function resolveLanguage(input?: string | null): LanguageOption {
  if (!input) {
    return LANGUAGE_OPTIONS[0];
  }

  const exactMatch = LANGUAGE_OPTIONS.find((option) => option.code.toLowerCase() === input.toLowerCase());
  if (exactMatch) {
    return exactMatch;
  }

  const prefix = input.split('-')[0]?.toLowerCase();
  return (
    LANGUAGE_OPTIONS.find((option) => option.code.split('-')[0].toLowerCase() === prefix) ??
    LANGUAGE_OPTIONS[0]
  );
}
