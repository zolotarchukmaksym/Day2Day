/**
 * DESIGN TOKENS (Premium & Vibrant - Blue Edition)
 * -------------
 * Дуже красивий, "дорогий" і сучасний дизайн з білими картками.
 * Замість нудного сірого ми використовуємо глибокі відтінки, 
 * кольорові м'які тіні (glow-ефект) та ідеальний контраст для зручності читання.
 * Головний колір — Королівський синій (Azure).
 */

export const colors = {
  // Backgrounds
  bg: '#F8F9FC',          // Ледь помітний холодно-білий фон (не ріже очі)
  bgDeep: '#0F172A',      // Дуже глибокий синьо-чорний для контрастних деталей
  surface: '#FFFFFF',     // Чистий білий для карток (виділяється на фоні bg)

  // Ink (текст та іконки)
  ink: '#1E293B',         // Темний слейт замість чорного (виглядає набагато дорожче)

  // Brand (Головний колір - Синій)
  primary: '#0062FF',     // Королівський синій
  primaryDark: '#004BCC', // Темніший синій для натискань і тіней

  // Accents (Акценти для статусів і категорій - пастельні, але яскраві)
  yellow: '#F59E0B',      // Теплий бурштиновий
  coral: '#FB7185',       // М'який рожево-кораловий (не такий агресивний, як чистий червоний)
  sky: '#38BDF8',         // Яскравий небесно-блакитний
  lime: '#34D399',        // Соковитий м'ятно-зелений (ідеально для виконаних завдань)

  // Text
  textPrimary: '#334155', // М'який темний для основного тексту (зручно читати довго)
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnDark: '#FFFFFF',

  // Borders
  border: 'rgba(0, 98, 255, 0.15)', // Напівпрозора синя лінія (додає шарму)
  divider: '#F1F5F9',
};

// Твої оригінальні шрифти (вони ідеальні для цього стилю)
export const fonts = {
  display: 'Fredoka-SemiBold',
  displayBold: 'Fredoka-Bold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
};

// Форми м'якші (Apple-style)
export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/**
 * Premium Shadow (Glow Effect)
 * Кольорова розмита тінь (відтінок синього).
 * Це створює ефект світіння, ніби картка "парить".
 */
export const stickerShadow = (offset = 4) => ({
  shadowColor: colors.primaryDark, // Синє світіння!
  shadowOffset: { width: 0, height: offset * 1.2 },
  shadowOpacity: 0.12,
  shadowRadius: offset * 2.5,
  elevation: offset,
});

// Тонка, елегантна рамка з ледь помітним синім відтінком
export const cardBorder = {
  borderWidth: 1.5,
  borderColor: colors.border,
};

export const theme = {
  colors,
  fonts,
  fontSizes,
  radii,
  spacing,
  stickerShadow,
  cardBorder,
};

export default theme;