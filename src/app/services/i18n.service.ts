import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'ru' | 'en' | 'tj';

type TranslationKey =
  | 'lang.label'
  | 'lang.ru'
  | 'lang.en'
  | 'lang.tj'
  | 'menu.badge'
  | 'menu.heroTitle1'
  | 'menu.heroTitle2'
  | 'menu.description'
  | 'menu.point1'
  | 'menu.point2'
  | 'menu.point3'
  | 'menu.heading'
  | 'menu.subheading'
  | 'menu.create'
  | 'menu.join'
  | 'menu.tip'
  | 'common.back'
  | 'create.title'
  | 'create.subtitle'
  | 'create.displayName'
  | 'create.displayNamePlaceholder'
  | 'create.roomTitle'
  | 'create.roomTitlePlaceholder'
  | 'create.creating'
  | 'create.submit'
  | 'create.tip'
  | 'join.title'
  | 'join.subtitle'
  | 'join.displayName'
  | 'join.displayNamePlaceholder'
  | 'join.roomCode'
  | 'join.roomCodePlaceholder'
  | 'join.joining'
  | 'join.submit'
  | 'join.tip'
  | 'call.appName'
  | 'call.room'
  | 'call.participant.one'
  | 'call.participant.many'
  | 'call.cameraOff'
  | 'call.you'
  | 'call.guest'
  | 'call.quickTip'
  | 'call.chatTitle'
  | 'call.chatCloseAria'
  | 'call.chatMsg1'
  | 'call.chatMsg2'
  | 'call.chatPlaceholder'
  | 'call.send'
  | 'call.sendAria'
  | 'call.unmute'
  | 'call.mute'
  | 'call.startCamera'
  | 'call.stopCamera'
  | 'call.stopShare'
  | 'call.shareScreen'
  | 'call.hideChat'
  | 'call.showChat'
  | 'call.leave'
  | 'call.localStatus.mutedVideoOff'
  | 'call.localStatus.muted'
  | 'call.localStatus.videoOff'
  | 'call.localStatus.live';

const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = {
  ru: {
    'lang.label': 'Язык',
    'lang.ru': 'Русский',
    'lang.en': 'English',
    'lang.tj': 'Тоҷикӣ',
    'menu.badge': 'P2P-встреча в реальном времени',
    'menu.heroTitle1': 'Встречайтесь быстро.',
    'menu.heroTitle2': 'Решайте быстрее.',
    'menu.description': 'Безопасные видеозвонки в браузере с быстрым доступом по коду комнаты и удобным управлением.',
    'menu.point1': 'Без установки приложений',
    'menu.point2': 'Вход в комнату в один клик',
    'menu.point3': 'Минимальный интерфейс в звонке',
    'menu.heading': 'Создать или войти во встречу',
    'menu.subheading': 'Выберите удобный способ подключения.',
    'menu.create': 'Создать комнату',
    'menu.join': 'Войти по коду комнаты',
    'menu.tip': 'Для лучшего качества используйте наушники и разрешите доступ к камере и микрофону.',
    'common.back': 'Назад',
    'create.title': 'Создать комнату',
    'create.subtitle': 'Укажите параметры комнаты и начните звонок.',
    'create.displayName': 'Имя',
    'create.displayNamePlaceholder': 'Например: Алекс',
    'create.roomTitle': 'Название комнаты',
    'create.roomTitlePlaceholder': 'Ежедневный стендап',
    'create.creating': 'Создаем комнату...',
    'create.submit': 'Создать и войти',
    'create.tip': 'Код комнаты можно отправить участникам после входа.',
    'join.title': 'Войти в комнату',
    'join.subtitle': 'Введите данные и код комнаты для подключения.',
    'join.displayName': 'Имя',
    'join.displayNamePlaceholder': 'Например: Алекс',
    'join.roomCode': 'Код комнаты',
    'join.roomCodePlaceholder': 'Вставьте код комнаты',
    'join.joining': 'Подключаемся...',
    'join.submit': 'Войти в комнату',
    'join.tip': 'Код комнаты чувствителен к символам. Лучше вставлять его целиком.',
    'call.appName': 'Комната',
    'call.room': 'Код комнаты',
    'call.participant.one': 'участник',
    'call.participant.many': 'участников',
    'call.cameraOff': 'Камера выключена',
    'call.you': 'Вы',
    'call.guest': 'Гость',
    'call.quickTip': 'Совет: в большинстве приложений пробел временно включает микрофон.',
    'call.chatTitle': 'Чат встречи',
    'call.chatCloseAria': 'Закрыть панель чата',
    'call.chatMsg1': 'Добро пожаловать в комнату. Пишите коротко и по делу.',
    'call.chatMsg2': 'Отключайте микрофон, когда не говорите, чтобы снизить шум.',
    'call.chatPlaceholder': 'Введите сообщение',
    'call.send': 'Отправить',
    'call.sendAria': 'Отправить сообщение',
    'call.unmute': 'Включить звук',
    'call.mute': 'Выключить звук',
    'call.startCamera': 'Включить камеру',
    'call.stopCamera': 'Выключить камеру',
    'call.stopShare': 'Остановить показ',
    'call.shareScreen': 'Показать экран',
    'call.hideChat': 'Скрыть чат',
    'call.showChat': 'Показать чат',
    'call.leave': 'Выйти',
    'call.localStatus.mutedVideoOff': 'Микрофон и камера выключены',
    'call.localStatus.muted': 'Микрофон выключен',
    'call.localStatus.videoOff': 'Камера выключена',
    'call.localStatus.live': 'В эфире',
  },
  en: {
    'lang.label': 'Language',
    'lang.ru': 'Russian',
    'lang.en': 'English',
    'lang.tj': 'Tajik',
    'menu.badge': 'Real-time P2P meeting',
    'menu.heroTitle1': 'Meet fast.',
    'menu.heroTitle2': 'Ship decisions faster.',
    'menu.description': 'Secure browser-based video calls with instant room sharing and focused controls.',
    'menu.point1': 'No installs required',
    'menu.point2': 'Single-click room access',
    'menu.point3': 'Minimal UI during calls',
    'menu.heading': 'Start or Join a Meeting',
    'menu.subheading': 'Pick the fastest way to connect.',
    'menu.create': 'Create room',
    'menu.join': 'Join with room code',
    'menu.tip': 'Best results: use a headset and allow microphone/camera access.',
    'common.back': 'Back',
    'create.title': 'Create room',
    'create.subtitle': 'Set up your room details and start the call.',
    'create.displayName': 'Display name',
    'create.displayNamePlaceholder': 'For example: Alex',
    'create.roomTitle': 'Room title',
    'create.roomTitlePlaceholder': 'Daily standup',
    'create.creating': 'Creating room...',
    'create.submit': 'Create and enter',
    'create.tip': 'You can share the room code after joining.',
    'join.title': 'Join room',
    'join.subtitle': 'Enter your details and room code to connect.',
    'join.displayName': 'Display name',
    'join.displayNamePlaceholder': 'For example: Alex',
    'join.roomCode': 'Room code',
    'join.roomCodePlaceholder': 'Paste room code',
    'join.joining': 'Joining...',
    'join.submit': 'Join room',
    'join.tip': 'Room codes are case-sensitive. Copy and paste to avoid mistakes.',
    'call.appName': 'Room',
    'call.room': "Room's cod",
    'call.participant.one': 'participant',
    'call.participant.many': 'participants',
    'call.cameraOff': 'Camera is off',
    'call.you': 'You',
    'call.guest': 'Guest',
    'call.quickTip': 'Tip: in many apps, space can temporarily unmute.',
    'call.chatTitle': 'Meeting chat',
    'call.chatCloseAria': 'Close chat panel',
    'call.chatMsg1': 'Welcome to the room. Keep messages short and actionable.',
    'call.chatMsg2': 'Mute when not speaking to reduce background noise.',
    'call.chatPlaceholder': 'Write a message',
    'call.send': 'Send',
    'call.sendAria': 'Send message',
    'call.unmute': 'Unmute',
    'call.mute': 'Mute',
    'call.startCamera': 'Start camera',
    'call.stopCamera': 'Stop camera',
    'call.stopShare': 'Stop share',
    'call.shareScreen': 'Share screen',
    'call.hideChat': 'Hide chat',
    'call.showChat': 'Show chat',
    'call.leave': 'Leave',
    'call.localStatus.mutedVideoOff': 'Muted + camera off',
    'call.localStatus.muted': 'Muted',
    'call.localStatus.videoOff': 'Camera off',
    'call.localStatus.live': 'Live',
  },
  tj: {
    'lang.label': 'Забон',
    'lang.ru': 'Русӣ',
    'lang.en': 'English',
    'lang.tj': 'Тоҷикӣ',
    'menu.badge': 'Мулоқоти P2P дар вақти воқеӣ',
    'menu.heroTitle1': 'Зуд вохӯрӣ кунед.',
    'menu.heroTitle2': 'Қарорҳоро зудтар қабул кунед.',
    'menu.description': 'Зангҳои видеоии бехатар дар браузер бо пайвастшавии зуд аз рӯи рамзи ҳуҷра.',
    'menu.point1': 'Бе насби барнома',
    'menu.point2': 'Воридшавӣ ба ҳуҷра бо як клик',
    'menu.point3': 'Интерфейси оддӣ ҳангоми занг',
    'menu.heading': 'Оғоз ё ҳамроҳ шудан ба мулоқот',
    'menu.subheading': 'Роҳи қулайи пайвастшавиро интихоб кунед.',
    'menu.create': 'Эҷоди ҳуҷра',
    'menu.join': 'Ворид шудан бо рамз',
    'menu.tip': 'Барои сифати беҳтар аз гӯшмонак истифода баред ва дастрасии камера/микрофонро иҷозат диҳед.',
    'common.back': 'Бозгашт',
    'create.title': 'Эҷоди ҳуҷра',
    'create.subtitle': 'Маълумоти ҳуҷраро ворид кунед ва зангро оғоз намоед.',
    'create.displayName': 'Номи намоишӣ',
    'create.displayNamePlaceholder': 'Масалан: Алекс',
    'create.roomTitle': 'Номи ҳуҷра',
    'create.roomTitlePlaceholder': 'Вохӯрии ҳаррӯза',
    'create.creating': 'Ҳуҷра сохта шуда истодааст...',
    'create.submit': 'Эҷод ва ворид шудан',
    'create.tip': 'Баъди воридшавӣ метавонед рамзи ҳуҷраро фиристед.',
    'join.title': 'Ворид шудан ба ҳуҷра',
    'join.subtitle': 'Барои пайвастшавӣ маълумот ва рамзи ҳуҷраро ворид кунед.',
    'join.displayName': 'Номи намоишӣ',
    'join.displayNamePlaceholder': 'Масалан: Алекс',
    'join.roomCode': 'Рамзи ҳуҷра',
    'join.roomCodePlaceholder': 'Рамзи ҳуҷраро гузоред',
    'join.joining': 'Пайваст шуда истодааст...',
    'join.submit': 'Ворид шудан',
    'join.tip': 'Рамз ба ҳарфҳо ҳассос аст. Беҳтар аст рамзро нусхабардорӣ кунед.',
    'call.appName': 'Ҳуҷра',
    'call.room': 'Коди ҳуҷра',
    'call.participant.one': 'иштирокчӣ',
    'call.participant.many': 'иштирокчӣ',
    'call.cameraOff': 'Камера хомӯш аст',
    'call.you': 'Шумо',
    'call.guest': 'Меҳмон',
    'call.quickTip': 'Маслиҳат: дар бисёр барномаҳо тугмаи Space микрофонро муваққатан фаъол мекунад.',
    'call.chatTitle': 'Чати мулоқот',
    'call.chatCloseAria': 'Пӯшидани панели чат',
    'call.chatMsg1': 'Ба ҳуҷра хуш омадед. Паёмҳоро кӯтоҳ ва равшан нависед.',
    'call.chatMsg2': 'Ҳангоми сухан накардан микрофонро хомӯш кунед.',
    'call.chatPlaceholder': 'Паём нависед',
    'call.send': 'Фиристодан',
    'call.sendAria': 'Фиристодани паём',
    'call.unmute': 'Фаъол кардани садо',
    'call.mute': 'Хомӯш кардани садо',
    'call.startCamera': 'Фаъол кардани камера',
    'call.stopCamera': 'Хомӯш кардани камера',
    'call.stopShare': 'Қатъи нишондиҳӣ',
    'call.shareScreen': 'Нишон додани экран',
    'call.hideChat': 'Пинҳон кардани чат',
    'call.showChat': 'Нишон додани чат',
    'call.leave': 'Баромадан',
    'call.localStatus.mutedVideoOff': 'Садо ва камера хомӯш',
    'call.localStatus.muted': 'Садо хомӯш',
    'call.localStatus.videoOff': 'Камера хомӯш',
    'call.localStatus.live': 'Дар эфир',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private lang = signal<Lang>('ru');

  currentLang = this.lang.asReadonly();
  availableLangs: Lang[] = ['ru', 'en', 'tj'];

  currentDictionary = computed(() => TRANSLATIONS[this.lang()]);

  setLang(lang: Lang) {
    this.lang.set(lang);
  }

  t(key: TranslationKey) {
    return this.currentDictionary()[key] ?? key;
  }
}
