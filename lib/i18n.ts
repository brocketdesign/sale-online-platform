export type PageLanguage = 'en' | 'fr' | 'es' | 'ja'

export const LANGUAGE_OPTIONS: { value: PageLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
]

/**
 * Maps our PageLanguage codes to Stripe's locale codes.
 * https://stripe.com/docs/api/checkout/sessions/create#create_checkout_session-locale
 */
export const STRIPE_LOCALE_MAP: Record<PageLanguage, string> = {
  en: 'en',
  fr: 'fr',
  es: 'es',
  ja: 'ja',
}

export interface PageTranslations {
  // Product page — sticky bar / sidebar
  addToCart: string
  addToWishlist: string
  wishlistSaved: string
  saveToWishlist: string
  removeFromWishlist: string
  buyUnlock: string
  ratings: string
  rating: string
  salesCount: (n: number) => string
  // Product page — sections
  preview: string
  previewSubtitle: string
  previewBlurSubtitle: string
  verifiedReviews: string
  verifiedBadge: string
  verifiedReviewsSubtitle: string
  creatorSection: string
  viewStore: string
  // Product detail page sidebar
  sidebarBy: string
  // Checkout page
  continueShoppingLink: string
  yourOrder: string
  removeGiftOption: string
  sendAsGift: string
  recipientEmail: string
  giftNote: string
  giftNotePlaceholder: string
  tipCreators: string
  noTip: string
  customTip: string
  contactInformation: string
  emailLabel: string
  emailPlaceholder: string
  fullNameLabel: string
  fullNamePlaceholder: string
  countryLabel: string
  vatLabel: string
  vatPlaceholder: string
  vatHint: string
  orderSummary: string
  subtotalLabel: string
  tipLabel: string
  vatSummary: (percent: number) => string
  totalLabel: string
  payButton: (amount: string) => string
  stripeDisclaimer: string
  emptyCartTitle: string
  emptyCartBody: string
  browseProducts: string
  cartItemBy: string
  // Checkout success
  paymentSuccessTitle: string
  paymentSuccessGift: (email: string) => string
  paymentSuccessEmail: (email: string) => string
  goToLibrary: string
  continueShopping: string
  paymentNotConfirmedTitle: string
  paymentNotConfirmedBody: string
  backToCheckout: string
  // Checkout cancel
  paymentCancelledTitle: string
  paymentCancelledBody: string
  returnToCart: string
}

const en: PageTranslations = {
  addToCart: 'Add to cart',
  addToWishlist: 'Add to wishlist',
  wishlistSaved: 'Saved',
  saveToWishlist: 'Save to wishlist',
  removeFromWishlist: 'Remove from wishlist',
  buyUnlock: 'Buy to unlock',
  ratings: 'Ratings',
  rating: 'rating',
  salesCount: (n) => `${n.toLocaleString()} sales`,
  preview: 'Preview',
  previewSubtitle: 'A look inside the product.',
  previewBlurSubtitle: 'Sample pages — purchase to unlock the full content.',
  verifiedReviews: 'Verified Reviews',
  verifiedBadge: 'Verified',
  verifiedReviewsSubtitle: 'Real messages from customers, shared with permission.',
  creatorSection: 'About the Creator',
  viewStore: 'View Store',
  sidebarBy: 'by',
  continueShoppingLink: '← Continue shopping',
  yourOrder: 'Your Order',
  removeGiftOption: 'Remove gift option',
  sendAsGift: 'Send as a gift',
  recipientEmail: 'Recipient Email',
  giftNote: 'Gift Note (optional)',
  giftNotePlaceholder: 'Happy birthday! Enjoy this!',
  tipCreators: 'Leave a tip for creators',
  noTip: 'No tip',
  customTip: 'Custom',
  contactInformation: 'Contact Information',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  fullNameLabel: 'Full Name',
  fullNamePlaceholder: 'Jane Smith',
  countryLabel: 'Country',
  vatLabel: 'VAT / Tax ID (optional)',
  vatPlaceholder: 'EU1234567890',
  vatHint: 'Provide to remove VAT',
  orderSummary: 'Order Summary',
  subtotalLabel: 'Subtotal',
  tipLabel: 'Tip',
  vatSummary: (percent) => `VAT (${percent}%)`,
  totalLabel: 'Total',
  payButton: (amount) => `Pay ${amount}`,
  stripeDisclaimer: 'Powered by Stripe. Your info is encrypted and secure.',
  emptyCartTitle: 'Your cart is empty',
  emptyCartBody: 'Add some products before checking out.',
  browseProducts: 'Browse Products',
  cartItemBy: 'by',
  paymentSuccessTitle: 'Payment Successful!',
  paymentSuccessGift: (email) => `Your gift has been sent to ${email}.`,
  paymentSuccessEmail: (email) => `A confirmation has been sent to ${email}.`,
  goToLibrary: 'Go to My Library',
  continueShopping: 'Continue Shopping',
  paymentNotConfirmedTitle: 'Payment not confirmed',
  paymentNotConfirmedBody: 'Your payment has not been processed. Please try again.',
  backToCheckout: 'Back to Checkout',
  paymentCancelledTitle: 'Payment Cancelled',
  paymentCancelledBody: "No worries — your cart is still saved. You can complete your purchase whenever you're ready.",
  returnToCart: 'Return to Cart',
}

const fr: PageTranslations = {
  addToCart: 'Ajouter au panier',
  addToWishlist: 'Ajouter à la liste de souhaits',
  wishlistSaved: 'Sauvegardé',
  saveToWishlist: 'Enregistrer dans la liste de souhaits',
  removeFromWishlist: 'Retirer de la liste de souhaits',
  buyUnlock: 'Acheter pour déverrouiller',
  ratings: 'Évaluations',
  rating: 'évaluation',
  salesCount: (n) => `${n.toLocaleString()} ventes`,
  preview: 'Aperçu',
  previewSubtitle: 'Un aperçu du produit.',
  previewBlurSubtitle: "Pages d'exemple — achetez pour accéder au contenu complet.",
  verifiedReviews: 'Avis vérifiés',
  verifiedBadge: 'Vérifié',
  verifiedReviewsSubtitle: 'Vrais messages de clients, partagés avec permission.',
  creatorSection: 'À propos du créateur',
  viewStore: 'Voir la boutique',
  sidebarBy: 'par',
  continueShoppingLink: '← Continuer vos achats',
  yourOrder: 'Votre commande',
  removeGiftOption: "Retirer l'option cadeau",
  sendAsGift: 'Envoyer en cadeau',
  recipientEmail: 'E-mail du destinataire',
  giftNote: 'Note cadeau (optionnel)',
  giftNotePlaceholder: 'Joyeux anniversaire ! Profites-en !',
  tipCreators: 'Laisser un pourboire aux créateurs',
  noTip: 'Pas de pourboire',
  customTip: 'Personnalisé',
  contactInformation: 'Informations de contact',
  emailLabel: 'E-mail',
  emailPlaceholder: 'vous@exemple.com',
  fullNameLabel: 'Nom complet',
  fullNamePlaceholder: 'Jeanne Dupont',
  countryLabel: 'Pays',
  vatLabel: 'TVA / Numéro fiscal (optionnel)',
  vatPlaceholder: 'FR1234567890',
  vatHint: 'Fournir pour supprimer la TVA',
  orderSummary: 'Récapitulatif de commande',
  subtotalLabel: 'Sous-total',
  tipLabel: 'Pourboire',
  vatSummary: (percent) => `TVA (${percent}%)`,
  totalLabel: 'Total',
  payButton: (amount) => `Payer ${amount}`,
  stripeDisclaimer: 'Propulsé par Stripe. Vos informations sont chiffrées et sécurisées.',
  emptyCartTitle: 'Votre panier est vide',
  emptyCartBody: 'Ajoutez des produits avant de passer à la caisse.',
  browseProducts: 'Parcourir les produits',
  cartItemBy: 'par',
  paymentSuccessTitle: 'Paiement réussi !',
  paymentSuccessGift: (email) => `Votre cadeau a été envoyé à ${email}.`,
  paymentSuccessEmail: (email) => `Une confirmation a été envoyée à ${email}.`,
  goToLibrary: 'Accéder à ma bibliothèque',
  continueShopping: 'Continuer vos achats',
  paymentNotConfirmedTitle: 'Paiement non confirmé',
  paymentNotConfirmedBody: "Votre paiement n'a pas été traité. Veuillez réessayer.",
  backToCheckout: 'Retour à la caisse',
  paymentCancelledTitle: 'Paiement annulé',
  paymentCancelledBody: 'Pas de panique — votre panier est toujours enregistré. Vous pouvez finaliser votre achat quand vous le souhaitez.',
  returnToCart: 'Retour au panier',
}

const es: PageTranslations = {
  addToCart: 'Añadir al carrito',
  addToWishlist: 'Añadir a la lista de deseos',
  wishlistSaved: 'Guardado',
  saveToWishlist: 'Guardar en la lista de deseos',
  removeFromWishlist: 'Eliminar de la lista de deseos',
  buyUnlock: 'Compra para desbloquear',
  ratings: 'Valoraciones',
  rating: 'valoración',
  salesCount: (n) => `${n.toLocaleString()} ventas`,
  preview: 'Vista previa',
  previewSubtitle: 'Un vistazo al producto.',
  previewBlurSubtitle: 'Páginas de muestra — compra para acceder al contenido completo.',
  verifiedReviews: 'Reseñas verificadas',
  verifiedBadge: 'Verificado',
  verifiedReviewsSubtitle: 'Mensajes reales de clientes, compartidos con permiso.',
  creatorSection: 'Sobre el creador',
  viewStore: 'Ver tienda',
  sidebarBy: 'por',
  continueShoppingLink: '← Seguir comprando',
  yourOrder: 'Tu pedido',
  removeGiftOption: 'Eliminar opción de regalo',
  sendAsGift: 'Enviar como regalo',
  recipientEmail: 'Correo del destinatario',
  giftNote: 'Nota de regalo (opcional)',
  giftNotePlaceholder: '¡Feliz cumpleaños! ¡Disfrútalo!',
  tipCreators: 'Dejar una propina a los creadores',
  noTip: 'Sin propina',
  customTip: 'Personalizado',
  contactInformation: 'Información de contacto',
  emailLabel: 'Correo electrónico',
  emailPlaceholder: 'tu@ejemplo.com',
  fullNameLabel: 'Nombre completo',
  fullNamePlaceholder: 'Juan García',
  countryLabel: 'País',
  vatLabel: 'IVA / NIF (opcional)',
  vatPlaceholder: 'ES1234567890',
  vatHint: 'Proporciona para eliminar el IVA',
  orderSummary: 'Resumen del pedido',
  subtotalLabel: 'Subtotal',
  tipLabel: 'Propina',
  vatSummary: (percent) => `IVA (${percent}%)`,
  totalLabel: 'Total',
  payButton: (amount) => `Pagar ${amount}`,
  stripeDisclaimer: 'Desarrollado por Stripe. Tu información está cifrada y segura.',
  emptyCartTitle: 'Tu carrito está vacío',
  emptyCartBody: 'Añade productos antes de pagar.',
  browseProducts: 'Explorar productos',
  cartItemBy: 'por',
  paymentSuccessTitle: '¡Pago exitoso!',
  paymentSuccessGift: (email) => `Tu regalo ha sido enviado a ${email}.`,
  paymentSuccessEmail: (email) => `Se ha enviado una confirmación a ${email}.`,
  goToLibrary: 'Ir a mi biblioteca',
  continueShopping: 'Seguir comprando',
  paymentNotConfirmedTitle: 'Pago no confirmado',
  paymentNotConfirmedBody: 'Tu pago no ha sido procesado. Por favor, inténtalo de nuevo.',
  backToCheckout: 'Volver al pago',
  paymentCancelledTitle: 'Pago cancelado',
  paymentCancelledBody: 'No te preocupes, tu carrito sigue guardado. Puedes completar tu compra cuando quieras.',
  returnToCart: 'Volver al carrito',
}

const ja: PageTranslations = {
  addToCart: 'カートに追加',
  addToWishlist: 'ウィッシュリストに追加',
  wishlistSaved: '保存済み',
  saveToWishlist: 'ウィッシュリストに保存',
  removeFromWishlist: 'ウィッシュリストから削除',
  buyUnlock: '購入してロック解除',
  ratings: '評価',
  rating: '評価',
  salesCount: (n) => `${n.toLocaleString('ja-JP')} 件の販売`,
  preview: 'プレビュー',
  previewSubtitle: '商品の中身をご覧ください。',
  previewBlurSubtitle: 'サンプルページ — 全コンテンツを閲覧するには購入してください。',
  verifiedReviews: '認証済みレビュー',
  verifiedBadge: '認証済み',
  verifiedReviewsSubtitle: '許可を得て共有された実際のお客様のメッセージです。',
  creatorSection: 'クリエイターについて',
  viewStore: 'ストアを見る',
  sidebarBy: '著者：',
  continueShoppingLink: '← ショッピングを続ける',
  yourOrder: 'ご注文内容',
  removeGiftOption: 'ギフトオプションを削除',
  sendAsGift: 'ギフトとして送る',
  recipientEmail: '受取人のメールアドレス',
  giftNote: 'ギフトメッセージ（任意）',
  giftNotePlaceholder: 'お誕生日おめでとう！楽しんでね！',
  tipCreators: 'クリエイターへのチップ',
  noTip: 'チップなし',
  customTip: 'カスタム',
  contactInformation: '連絡先情報',
  emailLabel: 'メールアドレス',
  emailPlaceholder: 'you@example.com',
  fullNameLabel: '氏名',
  fullNamePlaceholder: '山田 太郎',
  countryLabel: '国',
  vatLabel: '消費税 / 税番号（任意）',
  vatPlaceholder: 'JP1234567890',
  vatHint: '入力すると消費税が免除されます',
  orderSummary: '注文概要',
  subtotalLabel: '小計',
  tipLabel: 'チップ',
  vatSummary: (percent) => `消費税 (${percent}%)`,
  totalLabel: '合計',
  payButton: (amount) => `${amount} を支払う`,
  stripeDisclaimer: 'Stripe による決済。お客様の情報は暗号化されて安全に保護されています。',
  emptyCartTitle: 'カートは空です',
  emptyCartBody: 'チェックアウト前に商品を追加してください。',
  browseProducts: '商品を見る',
  cartItemBy: '著者：',
  paymentSuccessTitle: '支払いが完了しました！',
  paymentSuccessGift: (email) => `ギフトが ${email} に送信されました。`,
  paymentSuccessEmail: (email) => `確認メールが ${email} に送信されました。`,
  goToLibrary: 'マイライブラリへ',
  continueShopping: 'ショッピングを続ける',
  paymentNotConfirmedTitle: '支払いが確認できません',
  paymentNotConfirmedBody: 'お支払いが処理されませんでした。もう一度お試しください。',
  backToCheckout: 'チェックアウトに戻る',
  paymentCancelledTitle: '支払いがキャンセルされました',
  paymentCancelledBody: 'ご安心ください — カートはそのまま保存されています。準備ができたらいつでも購入を完了できます。',
  returnToCart: 'カートに戻る',
}

export const translations: Record<PageLanguage, PageTranslations> = { en, fr, es, ja }

export function getTranslations(lang?: string | null): PageTranslations {
  if (lang === 'fr') return fr
  if (lang === 'es') return es
  if (lang === 'ja') return ja
  return en
}
