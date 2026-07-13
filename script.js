'use strict';

/**
 * Transfer Express — static exchange interface.
 * All selections, calculations and locally submitted reviews run in the browser.
 * No registration, backend or secret API key is required.
 */

const CONFIG = Object.freeze({
  telegramUsername: 'transfer_express',
  refreshIntervalMs: 60_000,
  cachedRateMaxAgeMs: 12 * 60 * 60 * 1000,
  serviceSpreadPercent: 0,
  questionTemplate: 'Здравствуйте, меня интересует следующий вопрос:',
  reviewStorageKey: 'transfer-express-local-reviews-v2',
  rateStoragePrefix: 'transfer-express-rate-v2:'
});

const CATEGORY_LABELS = Object.freeze({
  coin: 'Криптовалюта',
  bank: 'Банк',
  ps: 'Платёжная система',
  check: 'Check / Voucher',
  cash: 'Наличные'
});

const CATEGORY_SHORT = Object.freeze({
  coin: 'Coin',
  bank: 'Bank',
  ps: 'PS',
  check: 'Check',
  cash: 'Cash'
});

const ASSETS = Object.freeze([
  // Cash
  { id: 'cash-eur', name: 'Наличные EUR', code: 'EUR', pricingCode: 'EUR', category: 'cash', network: 'Наличный обмен', icon: 'cash-eur.svg', colors: ['#4ce2aa', '#1aa97c'] },
  { id: 'cash-usd', name: 'Наличные USD', code: 'USD', pricingCode: 'USD', category: 'cash', network: 'Наличный обмен', icon: 'cash-usd.svg', colors: ['#78d995', '#2f9b59'] },
  { id: 'cash-gbp', name: 'Наличные GBP', code: 'GBP', pricingCode: 'GBP', category: 'cash', network: 'Наличный обмен', icon: 'cash-gbp.svg', colors: ['#8db5ff', '#4f69c6'] },
  { id: 'cash-pln', name: 'Наличные PLN', code: 'PLN', pricingCode: 'PLN', category: 'cash', network: 'Наличный обмен', icon: 'cash-pln.svg', colors: ['#ff8899', '#c84261'] },
  { id: 'cash-sek', name: 'Наличные SEK', code: 'SEK', pricingCode: 'SEK', category: 'cash', network: 'Наличный обмен', icon: 'cash-sek.svg', colors: ['#ffe36d', '#3f7ad8'] },
  { id: 'cash-nok', name: 'Наличные NOK', code: 'NOK', pricingCode: 'NOK', category: 'cash', network: 'Наличный обмен', icon: 'cash-nok.svg', colors: ['#f06b79', '#224e9b'] },

  // Bank cards and transfers
  { id: 'bank-card-eur', name: 'VISA / Mastercard EUR', code: 'EUR', pricingCode: 'EUR', category: 'bank', network: 'Банковская карта · EUR', icon: 'card.svg', colors: ['#3579e8', '#152d78'] },
  { id: 'bank-card-usd', name: 'VISA / Mastercard USD', code: 'USD', pricingCode: 'USD', category: 'bank', network: 'Банковская карта · USD', icon: 'card.svg', colors: ['#3579e8', '#152d78'] },
  { id: 'bank-card-gbp', name: 'VISA / Mastercard GBP', code: 'GBP', pricingCode: 'GBP', category: 'bank', network: 'Банковская карта · GBP', icon: 'card.svg', colors: ['#3579e8', '#152d78'] },
  { id: 'bank-card-pln', name: 'VISA / Mastercard PLN', code: 'PLN', pricingCode: 'PLN', category: 'bank', network: 'Банковская карта · PLN', icon: 'card.svg', colors: ['#3579e8', '#152d78'] },
  { id: 'bank-sepa-eur', name: 'SEPA перевод EUR', code: 'EUR', pricingCode: 'EUR', category: 'bank', network: 'SEPA · EUR', icon: 'sepa.svg', colors: ['#6a8cff', '#4e3cb5'] },
  { id: 'bank-revolut-eur', name: 'Revolut EUR', code: 'EUR', pricingCode: 'EUR', category: 'bank', network: 'Revolut · EUR', icon: 'revolut.svg', colors: ['#f6f6f6', '#9aa0aa'], darkIcon: true },
  { id: 'bank-revolut-usd', name: 'Revolut USD', code: 'USD', pricingCode: 'USD', category: 'bank', network: 'Revolut · USD', icon: 'revolut.svg', colors: ['#f6f6f6', '#9aa0aa'], darkIcon: true },
  { id: 'bank-wise-eur', name: 'Wise EUR', code: 'EUR', pricingCode: 'EUR', category: 'bank', network: 'Wise · EUR', icon: 'wise.svg', colors: ['#9fe870', '#4baf55'], darkIcon: true },
  { id: 'bank-wise-usd', name: 'Wise USD', code: 'USD', pricingCode: 'USD', category: 'bank', network: 'Wise · USD', icon: 'wise.svg', colors: ['#9fe870', '#4baf55'], darkIcon: true },

  // Payment systems
  { id: 'ps-paypal-eur', name: 'PayPal EUR', code: 'EUR', pricingCode: 'EUR', category: 'ps', network: 'PayPal · EUR', icon: 'paypal.svg', colors: ['#3b8cff', '#003087'] },
  { id: 'ps-paypal-usd', name: 'PayPal USD', code: 'USD', pricingCode: 'USD', category: 'ps', network: 'PayPal · USD', icon: 'paypal.svg', colors: ['#3b8cff', '#003087'] },
  { id: 'ps-paypal-gbp', name: 'PayPal GBP', code: 'GBP', pricingCode: 'GBP', category: 'ps', network: 'PayPal · GBP', icon: 'paypal.svg', colors: ['#3b8cff', '#003087'] },
  { id: 'ps-payoneer-usd', name: 'Payoneer USD', code: 'USD', pricingCode: 'USD', category: 'ps', network: 'Payoneer · USD', icon: 'payoneer.svg', colors: ['#ff6e4a', '#6670e8'] },
  { id: 'ps-payoneer-eur', name: 'Payoneer EUR', code: 'EUR', pricingCode: 'EUR', category: 'ps', network: 'Payoneer · EUR', icon: 'payoneer.svg', colors: ['#ff6e4a', '#6670e8'] },
  { id: 'ps-skrill-eur', name: 'Skrill EUR', code: 'EUR', pricingCode: 'EUR', category: 'ps', network: 'Skrill · EUR', icon: 'skrill.svg', colors: ['#a63b89', '#5f184e'] },
  { id: 'ps-skrill-usd', name: 'Skrill USD', code: 'USD', pricingCode: 'USD', category: 'ps', network: 'Skrill · USD', icon: 'skrill.svg', colors: ['#a63b89', '#5f184e'] },
  { id: 'ps-neteller-eur', name: 'Neteller EUR', code: 'EUR', pricingCode: 'EUR', category: 'ps', network: 'Neteller · EUR', icon: 'neteller.svg', colors: ['#8fd248', '#477a22'], darkIcon: true },
  { id: 'ps-neteller-usd', name: 'Neteller USD', code: 'USD', pricingCode: 'USD', category: 'ps', network: 'Neteller · USD', icon: 'neteller.svg', colors: ['#8fd248', '#477a22'], darkIcon: true },
  { id: 'ps-volet-eur', name: 'Volet EUR', code: 'EUR', pricingCode: 'EUR', category: 'ps', network: 'Volet · EUR', icon: 'volet.svg', colors: ['#d9ff42', '#91c315'], darkIcon: true },
  { id: 'ps-volet-usd', name: 'Volet USD', code: 'USD', pricingCode: 'USD', category: 'ps', network: 'Volet · USD', icon: 'volet.svg', colors: ['#d9ff42', '#91c315'], darkIcon: true },
  { id: 'ps-wmz', name: 'WebMoney WMZ', code: 'WMZ', pricingCode: 'USD', category: 'ps', network: 'WebMoney · WMZ', icon: 'webmoney.svg', colors: ['#4b9be7', '#1f5d9c'] },

  // Checks and vouchers
  { id: 'check-crypto-eur', name: 'Crypto Voucher EUR', code: 'EUR', pricingCode: 'EUR', category: 'check', network: 'Voucher · EUR', icon: 'cryptovoucher.svg', colors: ['#17d5b0', '#0a7f70'] },
  { id: 'check-crypto-usd', name: 'Crypto Voucher USD', code: 'USD', pricingCode: 'USD', category: 'check', network: 'Voucher · USD', icon: 'cryptovoucher.svg', colors: ['#17d5b0', '#0a7f70'] },
  { id: 'check-usdt', name: 'USDT Voucher', code: 'USDT', pricingCode: 'USDT', category: 'check', network: 'Voucher · USDT', icon: 'tether.svg', colors: ['#26a17b', '#117057'], coinGeckoId: 'tether' },
  { id: 'check-capitalist', name: 'Capitalist USD', code: 'USD', pricingCode: 'USD', category: 'check', network: 'Capitalist · USD', icon: 'capitalist.svg', colors: ['#76c34a', '#3a7628'], darkIcon: true },

  // Crypto
  { id: 'coin-usdt-trc20', name: 'USDT TRC20', code: 'USDT', pricingCode: 'USDT', category: 'coin', network: 'TRON · TRC20', icon: 'tether.svg', colors: ['#35c79a', '#168567'], coinGeckoId: 'tether', addressType: 'tron' },
  { id: 'coin-usdt-erc20', name: 'USDT ERC20', code: 'USDT', pricingCode: 'USDT', category: 'coin', network: 'Ethereum · ERC20', icon: 'tether.svg', colors: ['#35c79a', '#168567'], coinGeckoId: 'tether', addressType: 'evm' },
  { id: 'coin-usdt-bep20', name: 'USDT BEP20', code: 'USDT', pricingCode: 'USDT', category: 'coin', network: 'BNB Smart Chain · BEP20', icon: 'tether.svg', colors: ['#35c79a', '#168567'], coinGeckoId: 'tether', addressType: 'evm' },
  { id: 'coin-usdc-erc20', name: 'USD Coin ERC20', code: 'USDC', pricingCode: 'USDC', category: 'coin', network: 'Ethereum · ERC20', icon: 'usdcoin.svg', colors: ['#4d91e8', '#1e5aa4'], coinGeckoId: 'usd-coin', addressType: 'evm' },
  { id: 'coin-dai-erc20', name: 'DAI ERC20', code: 'DAI', pricingCode: 'DAI', category: 'coin', network: 'Ethereum · ERC20', icon: 'dai.svg', colors: ['#f5b941', '#b87816'], coinGeckoId: 'dai', addressType: 'evm' },
  { id: 'coin-btc', name: 'Bitcoin', code: 'BTC', pricingCode: 'BTC', category: 'coin', network: 'Bitcoin', icon: 'bitcoin.svg', colors: ['#ffae34', '#e87900'], coinGeckoId: 'bitcoin', addressType: 'btc' },
  { id: 'coin-eth', name: 'Ethereum', code: 'ETH', pricingCode: 'ETH', category: 'coin', network: 'Ethereum', icon: 'ethereum.svg', colors: ['#a9aaf7', '#5960b8'], coinGeckoId: 'ethereum', addressType: 'evm' },
  { id: 'coin-ltc', name: 'Litecoin', code: 'LTC', pricingCode: 'LTC', category: 'coin', network: 'Litecoin', icon: 'litecoin.svg', colors: ['#c8cdd4', '#7f8791'], coinGeckoId: 'litecoin', addressType: 'generic' },
  { id: 'coin-xmr', name: 'Monero', code: 'XMR', pricingCode: 'XMR', category: 'coin', network: 'Monero', icon: 'monero.svg', colors: ['#ff7a22', '#a83b16'], coinGeckoId: 'monero', addressType: 'generic' },
  { id: 'coin-bnb', name: 'BNB', code: 'BNB', pricingCode: 'BNB', category: 'coin', network: 'BNB Smart Chain', icon: 'bnb.svg', colors: ['#f6c94c', '#b38211'], coinGeckoId: 'binancecoin', addressType: 'evm' },
  { id: 'coin-sol', name: 'Solana', code: 'SOL', pricingCode: 'SOL', category: 'coin', network: 'Solana', icon: 'solana.svg', colors: ['#66f7d5', '#8a4dfa'], coinGeckoId: 'solana', addressType: 'sol' },
  { id: 'coin-ton', name: 'Toncoin', code: 'TON', pricingCode: 'TON', category: 'coin', network: 'TON', icon: 'ton.svg', colors: ['#54a9e8', '#206da8'], coinGeckoId: 'the-open-network', addressType: 'ton' },
  { id: 'coin-trx', name: 'TRON', code: 'TRX', pricingCode: 'TRX', category: 'coin', network: 'TRON', icon: 'tron.svg', colors: ['#ef4a59', '#a91423'], coinGeckoId: 'tron', addressType: 'tron' },
  { id: 'coin-xrp', name: 'XRP', code: 'XRP', pricingCode: 'XRP', category: 'coin', network: 'XRP Ledger', icon: 'xrp.svg', colors: ['#e8f1f5', '#7a8993'], coinGeckoId: 'ripple', addressType: 'generic', darkIcon: true },
  { id: 'coin-doge', name: 'Dogecoin', code: 'DOGE', pricingCode: 'DOGE', category: 'coin', network: 'Dogecoin', icon: 'dogecoin.svg', colors: ['#d9bb62', '#94782f'], coinGeckoId: 'dogecoin', addressType: 'generic' }
]);

const MARKET_ASSETS = Object.freeze([
  { code: 'EUR', name: 'Euro', type: 'fiat', icon: 'cash-eur.svg' },
  { code: 'USD', name: 'US Dollar', type: 'fiat', icon: 'cash-usd.svg' },
  { code: 'GBP', name: 'British Pound', type: 'fiat', icon: 'cash-gbp.svg' },
  { code: 'PLN', name: 'Polish Zloty', type: 'fiat', icon: 'cash-pln.svg' },
  { code: 'SEK', name: 'Swedish Krona', type: 'fiat', icon: 'cash-sek.svg' },
  { code: 'NOK', name: 'Norwegian Krone', type: 'fiat', icon: 'cash-nok.svg' },
  { code: 'USDT', name: 'Tether', type: 'crypto', icon: 'tether.svg', coinGeckoId: 'tether', binanceSymbol: 'USDTUSDC', inverseBinance: true },
  { code: 'USDC', name: 'USD Coin', type: 'crypto', icon: 'usdcoin.svg', coinGeckoId: 'usd-coin', binanceSymbol: 'USDCUSDT' },
  { code: 'BTC', name: 'Bitcoin', type: 'crypto', icon: 'bitcoin.svg', coinGeckoId: 'bitcoin', binanceSymbol: 'BTCUSDT' },
  { code: 'ETH', name: 'Ethereum', type: 'crypto', icon: 'ethereum.svg', coinGeckoId: 'ethereum', binanceSymbol: 'ETHUSDT' },
  { code: 'DAI', name: 'Dai', type: 'crypto', icon: 'dai.svg', coinGeckoId: 'dai', binanceSymbol: 'DAIUSDT' },
  { code: 'LTC', name: 'Litecoin', type: 'crypto', icon: 'litecoin.svg', coinGeckoId: 'litecoin', binanceSymbol: 'LTCUSDT' },
  { code: 'XMR', name: 'Monero', type: 'crypto', icon: 'monero.svg', coinGeckoId: 'monero' },
  { code: 'BNB', name: 'BNB', type: 'crypto', icon: 'bnb.svg', coinGeckoId: 'binancecoin', binanceSymbol: 'BNBUSDT' },
  { code: 'SOL', name: 'Solana', type: 'crypto', icon: 'solana.svg', coinGeckoId: 'solana', binanceSymbol: 'SOLUSDT' },
  { code: 'TON', name: 'Toncoin', type: 'crypto', icon: 'ton.svg', coinGeckoId: 'the-open-network', binanceSymbol: 'TONUSDT' },
  { code: 'TRX', name: 'TRON', type: 'crypto', icon: 'tron.svg', coinGeckoId: 'tron', binanceSymbol: 'TRXUSDT' },
  { code: 'XRP', name: 'XRP', type: 'crypto', icon: 'xrp.svg', coinGeckoId: 'ripple', binanceSymbol: 'XRPUSDT' },
  { code: 'DOGE', name: 'Dogecoin', type: 'crypto', icon: 'dogecoin.svg', coinGeckoId: 'dogecoin', binanceSymbol: 'DOGEUSDT' }
]);

const MARKET_BY_CODE = new Map(MARKET_ASSETS.map(asset => [asset.code, asset]));

const ASSET_BY_ID = new Map(ASSETS.map(asset => [asset.id, asset]));
const FIAT_CODES = new Set(['EUR', 'USD', 'GBP', 'PLN', 'SEK', 'NOK', 'CHF', 'JPY', 'CAD', 'AUD']);

const SAMPLE_REVIEWS = Object.freeze([
  { name: 'Анна', rating: 5, pair: 'Наличные EUR → USDT TRC20', text: 'Всё прошло спокойно и понятно. Оператор заранее подтвердил курс, договорились о времени, перевод пришёл сразу после расчёта.' },
  { name: 'Маркус', rating: 5, pair: 'USDT TRC20 → Наличные EUR', text: 'Удобно, что не пришлось создавать аккаунт. В Telegram быстро уточнили детали встречи, сумма совпала с согласованной.' },
  { name: 'Елена', rating: 4, pair: 'Revolut EUR → USDT TRC20', text: 'Обмен прошёл хорошо, курс устроил. Согласование времени заняло немного дольше, чем ожидала, но оператор всё довёл до конца.' },
  { name: 'Олег', rating: 5, pair: 'Bitcoin → Наличные EUR', text: 'Понравилось, что до отправки монет проверили сеть и ещё раз зафиксировали итоговую сумму. Без неожиданностей и скрытых условий.' },
  { name: 'Инга', rating: 5, pair: 'Wise EUR → USD Coin ERC20', text: 'Аккуратный сервис и нормальная коммуникация. На каждом этапе было понятно, что делать дальше и когда ждать зачисление.' },
  { name: 'Даниэль', rating: 5, pair: 'Наличные USD → Bitcoin', text: 'Быстро согласовали направление и место встречи. Отдельный плюс за понятный шаблон заявки — не пришлось вручную расписывать все параметры.' },
  { name: 'Артём', rating: 4, pair: 'PayPal USD → USDT ERC20', text: 'В целом всё хорошо, деньги получил. Вечером ответили не сразу, поэтому ставлю четыре звезды, но сам обмен прошёл без проблем.' },
  { name: 'София', rating: 5, pair: 'SEPA перевод EUR → USDT TRC20', text: 'Отправила заявку, получила точные реквизиты и подтверждение курса. Всё было вежливо, последовательно и без лишней суеты.' }
]);

const state = {
  fromId: 'cash-eur',
  toId: 'coin-usdt-trc20',
  reviewFromId: 'cash-eur',
  reviewToId: 'coin-usdt-trc20',
  chartFromCode: 'EUR',
  chartToCode: 'USDT',
  chartDays: 30,
  chartRequestId: 0,
  chartPoints: [],
  chartCoords: [],
  chartTooltipTimer: null,
  marketRate: null,
  clientRate: null,
  rateSource: '',
  rateMode: 'loading',
  rateUpdatedAt: null,
  rateRequestId: 0,
  modalSide: 'from',
  modalCategory: 'all',
  modalCode: 'all',
  lastModalTrigger: null,
  toastTimer: null,
  reviewRating: 5
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  root: document.documentElement,
  header: $('.site-header'),
  themeToggle: $('.theme-toggle'),
  apiStatus: $('.api-status'),
  apiStatusText: $('.api-status b'),
  chartFromButton: $('#chartFromButton'),
  chartToButton: $('#chartToButton'),
  chartFromIcon: $('#chartFromIcon'),
  chartToIcon: $('#chartToIcon'),
  chartFromName: $('#chartFromName'),
  chartToName: $('#chartToName'),
  swapChartAssets: $('#swapChartAssets'),
  chartPeriods: $('#chartPeriods'),
  chartRangeLabel: $('#chartRangeLabel'),
  chartState: $('#chartState'),
  chartArea: $('#chartArea'),
  chartLine: $('#chartLine'),
  chartEndPoint: $('#chartEndPoint'),
  chartCrosshair: $('#chartCrosshair'),
  chartFocusPoint: $('#chartFocusPoint'),
  chartHitbox: $('#chartHitbox'),
  chartTooltip: $('#chartTooltip'),
  chartTooltipRate: $('#chartTooltipRate'),
  chartTooltipTime: $('#chartTooltipTime'),
  chartStartDate: $('#chartStartDate'),
  chartEndDate: $('#chartEndDate'),
  chartChange: $('#chartChange'),
  chartMin: $('#chartMin'),
  chartMax: $('#chartMax'),
  chartUpdatedAt: $('#chartUpdatedAt'),

  fromAssetButton: $('#fromAssetButton'),
  toAssetButton: $('#toAssetButton'),
  fromAssetIcon: $('#fromAssetIcon'),
  fromAssetName: $('#fromAssetName'),
  fromAssetMeta: $('#fromAssetMeta'),
  toAssetIcon: $('#toAssetIcon'),
  toAssetName: $('#toAssetName'),
  toAssetMeta: $('#toAssetMeta'),
  swapAssets: $('#swapAssets'),

  giveAmount: $('#giveAmount'),
  receiveAmount: $('#receiveAmount'),
  giveChipSymbol: $('#giveChipSymbol'),
  giveChipCode: $('#giveChipCode'),
  giveChipKind: $('#giveChipKind'),
  receiveChipSymbol: $('#receiveChipSymbol'),
  receiveChipCode: $('#receiveChipCode'),
  receiveChipKind: $('#receiveChipKind'),
  networkBadgeText: $('#networkBadgeText'),
  receiveHelpText: $('#receiveHelpText'),

  heroBaseCode: $('#heroBaseCode'),
  heroQuoteCode: $('#heroQuoteCode'),
  heroRate: $('#heroRate'),
  previewDirection: $('#previewDirection'),
  previewNetwork: $('#previewNetwork'),

  marketFromCode: $('#marketFromCode'),
  marketToCode: $('#marketToCode'),
  clientFromCode: $('#clientFromCode'),
  clientToCode: $('#clientToCode'),
  marketRate: $('#marketRate'),
  clientRate: $('#clientRate'),
  refreshRate: $('#refreshRate'),
  updatedAt: $('#updatedAt'),
  rateSource: $('#rateSource'),

  directionRequirement: $('#directionRequirement'),
  directionRequirementText: $('#directionRequirementText'),
  directionFlow: $('#directionFlow'),
  directionFlowText: $('#directionFlowText'),
  detailsLabel: $('#detailsLabel'),
  directionDetails: $('#directionDetails'),
  detailsHint: $('#detailsHint'),
  orderComment: $('#orderComment'),
  agreement: $('#agreement'),
  createOrder: $('#createOrder'),

  summaryPairTitle: $('#summaryPairTitle'),
  summaryFormat: $('#summaryFormat'),
  summaryNetwork: $('#summaryNetwork'),
  summaryRequirement: $('#summaryRequirement'),
  summaryAmount: $('#summaryAmount'),
  summaryCurrencyCode: $('#summaryCurrencyCode'),

  assetModal: $('#assetModal'),
  closeAssetModal: $('#closeAssetModal'),
  assetSearch: $('#assetSearch'),
  assetTabs: $('#assetTabs'),
  assetQuickChips: $('#assetQuickChips'),
  assetList: $('#assetList'),
  assetModalSideHint: $('#assetModalSideHint'),
  assetResultCount: $('#assetResultCount'),

  reviewsList: $('#reviewsList'),
  reviewForm: $('#reviewForm'),
  reviewName: $('#reviewName'),
  reviewText: $('#reviewText'),
  reviewPair: $('#reviewPair'),
  reviewStars: $('#reviewStars'),
  reviewRatingValue: $('#reviewRatingValue'),
  reviewFromButton: $('#reviewFromButton'),
  reviewToButton: $('#reviewToButton'),
  reviewFromIcon: $('#reviewFromIcon'),
  reviewToIcon: $('#reviewToIcon'),
  reviewFromName: $('#reviewFromName'),
  reviewToName: $('#reviewToName'),
  swapReviewAssets: $('#swapReviewAssets'),

  toast: $('#toast'),
  toastTitle: $('#toastTitle'),
  toastText: $('#toastText'),
  currentYear: $('#currentYear')
};

function getAsset(id) {
  return ASSET_BY_ID.get(id) || ASSETS[0];
}

function getPair() {
  return { from: getAsset(state.fromId), to: getAsset(state.toId) };
}

function normalizeNumber(value) {
  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '')
    .replace(/(\..*)\./g, '$1');
  return Number.parseFloat(normalized) || 0;
}

function formatAmount(value, maxFractionDigits = 2) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits
  }).format(value);
}

function formatRate(value) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  let digits = 6;
  if (value >= 1000) digits = 2;
  else if (value >= 10) digits = 4;
  else if (value < 0.01) digits = 8;
  return value.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
}

function getAmountDigits(asset) {
  return asset.category === 'coin' || asset.code === 'BTC' ? 8 : 2;
}

function telegramLink(message) {
  return `https://t.me/${CONFIG.telegramUsername}?text=${encodeURIComponent(message)}`;
}

function iconUrl(asset) {
  return `assets/icons/${asset?.icon || 'generic.svg'}`;
}

function iconMarkup(asset, alt = '') {
  return `<img src="${iconUrl(asset)}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function iconStyle() {
  return '';
}

function setIconElement(element, asset) {
  if (!element) return;
  element.innerHTML = iconMarkup(asset);
}

function getMarketAsset(code) {
  return MARKET_BY_CODE.get(code) || MARKET_ASSETS[0];
}

function setMarketIcon(element, asset) {
  if (!element) return;
  element.innerHTML = iconMarkup(asset);
}

function categoryMeta(asset) {
  return `${CATEGORY_LABELS[asset.category]} · ${asset.network}`;
}

function getDestinationDetails(asset) {
  if (asset.category === 'coin') {
    const placeholders = {
      tron: 'T...',
      evm: '0x...',
      btc: 'bc1... / 1... / 3...',
      sol: 'Адрес Solana...',
      ton: 'EQ... / UQ...',
      generic: 'Адрес кошелька...'
    };
    return {
      label: `Адрес кошелька ${asset.network}`,
      placeholder: placeholders[asset.addressType] || 'Адрес кошелька...',
      requirement: `Кошелёк ${asset.code}`,
      summary: 'Нужен адрес кошелька',
      text: `Укажите адрес для получения ${asset.code} в сети ${asset.network}. Проверьте сеть особенно внимательно.`,
      hint: 'Поле можно оставить пустым и сообщить реквизиты оператору в Telegram.'
    };
  }

  if (asset.category === 'bank') {
    const sepa = asset.id.includes('sepa');
    return {
      label: sepa ? 'IBAN и имя получателя' : 'Номер карты / IBAN / аккаунт',
      placeholder: sepa ? 'LV00 BANK 0000 0000 0000 0' : 'Реквизиты для получения...',
      requirement: sepa ? 'SEPA-реквизиты' : 'Банковские реквизиты',
      summary: sepa ? 'Нужен IBAN' : 'Нужны реквизиты',
      text: `Для направления ${asset.name} оператор уточнит допустимый формат реквизитов и данные получателя.`,
      hint: 'Не указывайте PIN, CVV/CVC, пароль или коды подтверждения.'
    };
  }

  if (asset.category === 'ps') {
    return {
      label: `Аккаунт для получения ${asset.name}`,
      placeholder: 'E-mail, логин или номер аккаунта...',
      requirement: `Аккаунт ${asset.name.replace(/\s+(EUR|USD|GBP|WMZ)$/i, '')}`,
      summary: 'Нужен аккаунт',
      text: 'Укажите идентификатор платёжного аккаунта. Формат и доступность перевода подтвердит оператор.',
      hint: 'Никогда не передавайте пароль и одноразовые коды.'
    };
  }

  if (asset.category === 'check') {
    return {
      label: 'Контакт или данные для выдачи ваучера',
      placeholder: 'E-mail / Telegram / примечание...',
      requirement: 'Данные для выдачи',
      summary: 'Нужны данные выдачи',
      text: `Оператор уточнит способ передачи ${asset.name} и необходимые данные получателя.`,
      hint: 'Секретный код существующего ваучера не отправляйте до подтверждения заявки.'
    };
  }

  return {
    label: 'Предпочтительное место и время встречи',
    placeholder: 'Например: удобное место, сегодня после 18:00',
    requirement: 'Детали встречи',
    summary: 'Согласовать встречу',
    text: `Для получения ${asset.name} оператор согласует место, время и порядок расчёта.`,
    hint: 'Точный адрес встречи не публикуется на сайте и согласовывается лично.'
  };
}

function updatePairUI() {
  const { from, to } = getPair();
  const details = getDestinationDetails(to);

  setIconElement(elements.fromAssetIcon, from);
  setIconElement(elements.toAssetIcon, to);
  setIconElement(elements.giveChipSymbol, from);
  setIconElement(elements.receiveChipSymbol, to);

  elements.fromAssetName.textContent = from.name;
  elements.fromAssetMeta.textContent = categoryMeta(from);
  elements.toAssetName.textContent = to.name;
  elements.toAssetMeta.textContent = categoryMeta(to);

  elements.giveChipCode.textContent = from.code;
  elements.giveChipKind.textContent = CATEGORY_SHORT[from.category];
  elements.receiveChipCode.textContent = to.code;
  elements.receiveChipKind.textContent = to.network.split('·').pop().trim();
  elements.networkBadgeText.textContent = to.network;

  [elements.marketFromCode, elements.clientFromCode].forEach(el => { if (el) el.textContent = from.code; });
  [elements.marketToCode, elements.clientToCode].forEach(el => { if (el) el.textContent = to.code; });

  elements.directionRequirement.textContent = details.requirement;
  elements.directionRequirementText.textContent = details.text;
  elements.directionFlow.textContent = `${from.name} → ${to.name}`;
  elements.directionFlowText.textContent = 'Telegram откроется с готовым сообщением: направление, сумма, ориентировочный результат, реквизиты и комментарий.';
  elements.detailsLabel.textContent = details.label;
  elements.directionDetails.placeholder = details.placeholder;
  elements.detailsHint.textContent = details.hint;

  if (elements.summaryPairTitle) elements.summaryPairTitle.textContent = `${from.code} → ${to.code}`;
  if (elements.summaryFormat) elements.summaryFormat.textContent = `${CATEGORY_LABELS[from.category]} → ${CATEGORY_LABELS[to.category]}`;
  if (elements.summaryNetwork) elements.summaryNetwork.textContent = to.network;
  if (elements.summaryRequirement) elements.summaryRequirement.textContent = details.summary;
  if (elements.summaryCurrencyCode) elements.summaryCurrencyCode.textContent = to.code;

  updateGenericTelegramLinks();
  updateCalculation();
}

function calculateClientRate(marketRate) {
  if (!Number.isFinite(marketRate)) return null;
  const spread = Math.max(0, Number(CONFIG.serviceSpreadPercent) || 0);
  return marketRate * (1 - spread / 100);
}

function setRateLoading() {
  state.marketRate = null;
  state.clientRate = null;
  state.rateMode = 'loading';
  state.rateSource = 'Подключение…';
  elements.refreshRate?.classList.add('loading');
  if (elements.updatedAt) elements.updatedAt.textContent = 'Обновление…';
  updateRateUI();
}

function updateRateUI() {
  const rateText = formatRate(state.clientRate);
  if (elements.marketRate) elements.marketRate.textContent = formatRate(state.marketRate);
  if (elements.clientRate) elements.clientRate.textContent = rateText;
  if (elements.rateSource) elements.rateSource.textContent = state.rateSource || 'Не определён';

  if (state.rateMode === 'online') {
    const time = state.rateUpdatedAt?.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) || '';
    if (elements.updatedAt) elements.updatedAt.textContent = `Обновлено в ${time}`;
    elements.receiveHelpText.textContent = 'Ориентировочный расчёт по открытому API';
  } else if (state.rateMode === 'cached') {
    const time = state.rateUpdatedAt?.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) || '';
    if (elements.updatedAt) elements.updatedAt.textContent = `Кэш от ${time}`;
    elements.receiveHelpText.textContent = 'API недоступен — показан последний сохранённый курс';
  } else if (state.rateMode === 'unavailable') {
    if (elements.updatedAt) elements.updatedAt.textContent = 'Уточнит оператор';
    elements.receiveHelpText.textContent = 'Онлайн-курс недоступен — финальную сумму сообщит оператор';
  }

  elements.refreshRate?.classList.remove('loading');
  updateCalculation();
}

function updateCalculation() {
  const { to } = getPair();
  const amount = normalizeNumber(elements.giveAmount.value);
  const result = Number.isFinite(state.clientRate) && amount > 0 ? amount * state.clientRate : null;
  const formatted = Number.isFinite(result) ? formatAmount(result, getAmountDigits(to)) : '—';
  elements.receiveAmount.textContent = formatted;
  if (elements.summaryAmount) elements.summaryAmount.textContent = formatted;
}

async function fetchJson(url, timeoutMs = 6500) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}


function utcDayTimestamp(date = new Date()) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isoDate(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function dailyTimestamps(days) {
  const end = utcDayTimestamp();
  return Array.from({ length: days }, (_, index) => end - (days - 1 - index) * 86_400_000);
}

function formatChartDate(timestamp) {
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(timestamp));
}

function formatChartDateTime(timestamp) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
}

function setChartStatus(status, text) {
  if (elements.apiStatus) elements.apiStatus.dataset.status = status;
  if (elements.apiStatusText) elements.apiStatusText.textContent = text;
}

function updateChartPickerUI() {
  const from = getMarketAsset(state.chartFromCode);
  const to = getMarketAsset(state.chartToCode);
  setMarketIcon(elements.chartFromIcon, from);
  setMarketIcon(elements.chartToIcon, to);
  elements.chartFromName.textContent = `${from.code} · ${from.name}`;
  elements.chartToName.textContent = `${to.code} · ${to.name}`;
  elements.heroBaseCode.textContent = from.code;
  elements.heroQuoteCode.textContent = to.code;
  elements.previewDirection.textContent = `${from.code} → ${to.code}`;
  elements.chartRangeLabel.textContent = `Динамика за ${state.chartDays} дней`;
  $$('[data-days]', elements.chartPeriods).forEach(button => {
    button.classList.toggle('active', Number(button.dataset.days) === state.chartDays);
  });
}

async function fetchFiatUsdSeries(asset, days) {
  const dates = dailyTimestamps(days);
  if (asset.code === 'USD') return { points: dates.map(time => ({ time, value: 1 })), source: 'USD base' };
  const start = dates[0] - 8 * 86_400_000;
  const end = dates[dates.length - 1];
  const data = await fetchJson(`https://api.frankfurter.dev/v1/${isoDate(start)}..${isoDate(end)}?base=USD&symbols=${encodeURIComponent(asset.code)}`, 9000);
  const points = Object.entries(data?.rates || {}).map(([date, rates]) => {
    const usdToAsset = Number(rates?.[asset.code]);
    return { time: Date.parse(`${date}T00:00:00Z`), value: usdToAsset > 0 ? 1 / usdToAsset : NaN };
  }).filter(point => Number.isFinite(point.value) && point.value > 0);
  if (!points.length) throw new Error(`No fiat history for ${asset.code}`);
  return { points, source: 'ECB / Frankfurter' };
}

async function fetchCryptoUsdSeries(asset, days) {
  const dates = dailyTimestamps(days);
  if (asset.code === 'USDT') return { points: dates.map(time => ({ time, value: 1 })), source: 'USDT reference' };

  if (asset.binanceSymbol) {
    try {
      const limit = Math.min(1000, days + 8);
      const rows = await fetchJson(`https://data-api.binance.vision/api/v3/klines?symbol=${encodeURIComponent(asset.binanceSymbol)}&interval=1d&limit=${limit}`, 9000);
      const points = Array.isArray(rows) ? rows.map(row => {
        const close = Number(row?.[4]);
        const value = asset.inverseBinance ? 1 / close : close;
        return { time: Number(row?.[0]), value };
      }).filter(point => Number.isFinite(point.time) && Number.isFinite(point.value) && point.value > 0) : [];
      if (points.length) return { points, source: 'Binance Market Data' };
    } catch (error) {
      console.warn(`Binance chart fallback for ${asset.code}`, error);
    }
  }

  if (!asset.coinGeckoId) throw new Error(`No crypto history provider for ${asset.code}`);
  const data = await fetchJson(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(asset.coinGeckoId)}/market_chart?vs_currency=usd&days=${Math.max(days, 7)}&interval=daily`, 10000);
  const points = Array.isArray(data?.prices) ? data.prices.map(([time, value]) => ({ time: Number(time), value: Number(value) }))
    .filter(point => Number.isFinite(point.time) && Number.isFinite(point.value) && point.value > 0) : [];
  if (!points.length) throw new Error(`No CoinGecko history for ${asset.code}`);
  return { points, source: 'CoinGecko Market Data' };
}

async function fetchUsdSeries(asset, days) {
  return asset.type === 'fiat' ? fetchFiatUsdSeries(asset, days) : fetchCryptoUsdSeries(asset, days);
}

function normalizeSeries(points, days) {
  const sorted = [...points].sort((a, b) => a.time - b.time);
  const targets = dailyTimestamps(days);
  const normalized = [];
  let index = 0;
  let last = null;
  for (const target of targets) {
    const endOfDay = target + 86_399_999;
    while (index < sorted.length && sorted[index].time <= endOfDay) {
      last = sorted[index].value;
      index += 1;
    }
    if (last == null && sorted.length) last = sorted[0].value;
    normalized.push({ time: target, value: last });
  }
  return normalized;
}

function chartCacheKey() {
  return `transfer-express-chart-v1:${state.chartFromCode}:${state.chartToCode}:${state.chartDays}`;
}

function saveChartCache(points, source) {
  try {
    localStorage.setItem(chartCacheKey(), JSON.stringify({ points, source, timestamp: Date.now() }));
  } catch (_) {}
}

function readChartCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(chartCacheKey()) || 'null');
    if (!parsed || !Array.isArray(parsed.points) || Date.now() - Number(parsed.timestamp) > CONFIG.cachedRateMaxAgeMs) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

function renderChart(points, source, cached = false) {
  const values = points.map(point => point.value).filter(Number.isFinite);
  if (values.length < 2) throw new Error('Not enough chart points');
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || Math.max(max * 0.01, 0.000001);
  const width = 520;
  const top = 15;
  const bottom = 176;
  const coords = points.map((point, index) => ({
    x: points.length === 1 ? width / 2 : index * width / (points.length - 1),
    y: bottom - ((point.value - min) / spread) * (bottom - top)
  }));
  state.chartPoints = points.map(point => ({ time: Number(point.time), value: Number(point.value) }));
  state.chartCoords = coords;
  hideChartTooltip();
  const line = coords.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1].x.toFixed(2)},190 L${coords[0].x.toFixed(2)},190 Z`;
  elements.chartLine.setAttribute('d', line);
  elements.chartArea.setAttribute('d', area);
  elements.chartEndPoint.setAttribute('cx', coords[coords.length - 1].x.toFixed(2));
  elements.chartEndPoint.setAttribute('cy', coords[coords.length - 1].y.toFixed(2));

  const first = values[0];
  const last = values[values.length - 1];
  const change = first ? ((last / first) - 1) * 100 : 0;
  elements.heroRate.textContent = formatRate(last);
  elements.chartChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  elements.chartChange.dataset.trend = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  elements.chartMin.textContent = formatRate(min);
  elements.chartMax.textContent = formatRate(max);
  elements.chartStartDate.textContent = formatChartDate(points[0].time);
  elements.chartEndDate.textContent = formatChartDate(points[points.length - 1].time);
  elements.previewNetwork.textContent = cached ? `${source} · кэш` : source;
  elements.chartUpdatedAt.textContent = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  elements.chartState.hidden = true;
  setChartStatus(cached ? 'offline' : 'online', cached ? 'График из кэша' : 'График онлайн');
}


function hideChartTooltip() {
  window.clearTimeout(state.chartTooltipTimer);
  if (elements.chartTooltip) elements.chartTooltip.hidden = true;
  elements.chartCrosshair?.classList.remove('is-visible');
  elements.chartFocusPoint?.classList.remove('is-visible');
}

function showChartTooltip(clientX) {
  if (!state.chartPoints.length || !state.chartCoords.length || !elements.chartHitbox) return;
  const svg = elements.chartHitbox.ownerSVGElement;
  const svgRect = svg.getBoundingClientRect();
  if (!svgRect.width) return;
  const localX = Math.max(0, Math.min(520, ((clientX - svgRect.left) / svgRect.width) * 520));
  const index = Math.max(0, Math.min(state.chartPoints.length - 1, Math.round((localX / 520) * (state.chartPoints.length - 1))));
  const point = state.chartPoints[index];
  const coord = state.chartCoords[index];
  const from = getMarketAsset(state.chartFromCode);
  const to = getMarketAsset(state.chartToCode);

  elements.chartCrosshair?.setAttribute('x1', coord.x.toFixed(2));
  elements.chartCrosshair?.setAttribute('x2', coord.x.toFixed(2));
  elements.chartFocusPoint?.setAttribute('cx', coord.x.toFixed(2));
  elements.chartFocusPoint?.setAttribute('cy', coord.y.toFixed(2));
  elements.chartCrosshair?.classList.add('is-visible');
  elements.chartFocusPoint?.classList.add('is-visible');

  if (elements.chartTooltip) {
    elements.chartTooltipRate.textContent = `1 ${from.code} = ${formatRate(point.value)} ${to.code}`;
    elements.chartTooltipTime.textContent = formatChartDateTime(point.time);
    elements.chartTooltip.hidden = false;
    const chartRect = elements.chartTooltip.parentElement.getBoundingClientRect();
    const x = (svgRect.left - chartRect.left) + (coord.x / 520) * svgRect.width;
    const y = (svgRect.top - chartRect.top) + (coord.y / 190) * svgRect.height;
    const half = Math.min(122, chartRect.width / 2 - 10);
    elements.chartTooltip.style.left = `${Math.max(half, Math.min(chartRect.width - half, x))}px`;
    elements.chartTooltip.style.top = `${Math.max(72, y)}px`;
  }
}

function initChartInteractions() {
  if (!elements.chartHitbox) return;
  const hitbox = elements.chartHitbox;
  hitbox.addEventListener('pointermove', event => {
    showChartTooltip(event.clientX);
    if (event.pointerType === 'touch') event.preventDefault();
  });
  hitbox.addEventListener('pointerdown', event => {
    showChartTooltip(event.clientX);
    if (event.pointerType === 'touch') {
      event.preventDefault();
      try { hitbox.setPointerCapture(event.pointerId); } catch (_) {}
    }
  });
  hitbox.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') hideChartTooltip();
  });
  hitbox.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch') return;
    window.clearTimeout(state.chartTooltipTimer);
    state.chartTooltipTimer = window.setTimeout(hideChartTooltip, 3500);
  });
  hitbox.addEventListener('pointercancel', hideChartTooltip);
}

async function loadChart() {
  const requestId = ++state.chartRequestId;
  updateChartPickerUI();
  elements.chartState.hidden = false;
  elements.chartState.innerHTML = '<span class="chart-spinner"></span><b>Загружаем историю курса</b>';
  setChartStatus('loading', 'Загружаем график');

  const from = getMarketAsset(state.chartFromCode);
  const to = getMarketAsset(state.chartToCode);
  try {
    let points;
    let source;
    if (from.code === to.code) {
      points = dailyTimestamps(state.chartDays).map(time => ({ time, value: 1 }));
      source = 'Номинальный курс';
    } else {
      const [fromSeries, toSeries] = await Promise.all([
        fetchUsdSeries(from, state.chartDays),
        fetchUsdSeries(to, state.chartDays)
      ]);
      const fromDaily = normalizeSeries(fromSeries.points, state.chartDays);
      const toDaily = normalizeSeries(toSeries.points, state.chartDays);
      points = fromDaily.map((point, index) => ({
        time: point.time,
        value: point.value / toDaily[index].value
      })).filter(point => Number.isFinite(point.value) && point.value > 0);
      source = [...new Set([fromSeries.source, toSeries.source])].join(' + ');
    }
    if (requestId !== state.chartRequestId) return;
    saveChartCache(points, source);
    renderChart(points, source, false);
  } catch (error) {
    console.warn('Transfer Express: chart providers failed', error);
    if (requestId !== state.chartRequestId) return;
    const cached = readChartCache();
    if (cached) {
      renderChart(cached.points, cached.source || 'Последние данные', true);
      return;
    }
    state.chartPoints = [];
    state.chartCoords = [];
    hideChartTooltip();
    elements.chartLine.setAttribute('d', '');
    elements.chartArea.setAttribute('d', '');
    elements.chartEndPoint.setAttribute('cx', '-20');
    elements.heroRate.textContent = '—';
    elements.chartChange.textContent = '—';
    elements.chartMin.textContent = '—';
    elements.chartMax.textContent = '—';
    elements.previewNetwork.textContent = 'Данные недоступны';
    elements.chartUpdatedAt.textContent = '—';
    elements.chartState.hidden = false;
    elements.chartState.innerHTML = '<b>Не удалось загрузить график</b><small>Попробуйте другую пару или обновите страницу позже.</small>';
    setChartStatus('offline', 'Нет данных графика');
  }
}

async function rateFromCoinbase(from, to) {
  const data = await fetchJson(`https://api.coinbase.com/v2/exchange-rates?currency=${encodeURIComponent(from.pricingCode)}`);
  const rate = Number(data?.data?.rates?.[to.pricingCode]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Coinbase pair unavailable');
  return { rate, source: 'Coinbase Exchange Rates' };
}

async function rateFromCryptoCompare(from, to) {
  const fromCode = from.pricingCode;
  const toCode = to.pricingCode;
  const data = await fetchJson(`https://min-api.cryptocompare.com/data/price?fsym=${encodeURIComponent(fromCode)}&tsyms=${encodeURIComponent(toCode)}`);
  const rate = Number(data?.[toCode]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('CryptoCompare pair unavailable');
  return { rate, source: 'CryptoCompare Market API' };
}

async function rateFromFrankfurter(from, to) {
  if (!FIAT_CODES.has(from.pricingCode) || !FIAT_CODES.has(to.pricingCode)) throw new Error('Not a fiat pair');
  if (from.pricingCode === to.pricingCode) return { rate: 1, source: 'Номинальный курс валюты' };
  const data = await fetchJson(`https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(from.pricingCode)}&symbols=${encodeURIComponent(to.pricingCode)}`);
  const rate = Number(data?.rates?.[to.pricingCode]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Frankfurter pair unavailable');
  return { rate, source: 'ECB / Frankfurter' };
}

async function usdValueFromCoinGecko(asset) {
  if (asset.pricingCode === 'USD') return 1;
  if (asset.coinGeckoId) {
    const data = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(asset.coinGeckoId)}&vs_currencies=usd`);
    const value = Number(data?.[asset.coinGeckoId]?.usd);
    if (!Number.isFinite(value) || value <= 0) throw new Error('CoinGecko asset unavailable');
    return value;
  }
  if (FIAT_CODES.has(asset.pricingCode)) {
    const data = await fetchJson(`https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(asset.pricingCode)}&symbols=USD`);
    const value = Number(data?.rates?.USD);
    if (!Number.isFinite(value) || value <= 0) throw new Error('Fiat USD value unavailable');
    return value;
  }
  const data = await fetchJson(`https://min-api.cryptocompare.com/data/price?fsym=${encodeURIComponent(asset.pricingCode)}&tsyms=USD`);
  const value = Number(data?.USD);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Crypto USD value unavailable');
  return value;
}

async function rateFromUsdBridge(from, to) {
  const [fromUsd, toUsd] = await Promise.all([usdValueFromCoinGecko(from), usdValueFromCoinGecko(to)]);
  const rate = fromUsd / toUsd;
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('USD bridge unavailable');
  return { rate, source: 'CoinGecko / ECB cross-rate' };
}

function rateCacheKey(from, to) {
  return `${CONFIG.rateStoragePrefix}${from.id}:${to.id}`;
}

function saveRateToCache(from, to, result) {
  try {
    localStorage.setItem(rateCacheKey(from, to), JSON.stringify({
      rate: result.rate,
      source: result.source,
      timestamp: Date.now()
    }));
  } catch (_) {
    // localStorage may be unavailable for file:// or private mode.
  }
}

function readRateFromCache(from, to) {
  try {
    const raw = localStorage.getItem(rateCacheKey(from, to));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = Date.now() - Number(parsed.timestamp);
    const rate = Number(parsed.rate);
    if (!Number.isFinite(rate) || rate <= 0 || age < 0 || age > CONFIG.cachedRateMaxAgeMs) return null;
    return { rate, source: `${parsed.source || 'последний онлайн-источник'} · сохранённый курс`, timestamp: Number(parsed.timestamp) };
  } catch (_) {
    return null;
  }
}

async function loadRate({ silent = false } = {}) {
  const requestId = ++state.rateRequestId;
  const { from, to } = getPair();

  if (!silent) setRateLoading();

  if (from.pricingCode === to.pricingCode) {
    state.marketRate = 1;
    state.clientRate = calculateClientRate(1);
    state.rateSource = 'Номинальный курс валюты';
    state.rateMode = 'online';
    state.rateUpdatedAt = new Date();
    updateRateUI();
    return;
  }

  const providers = [
    () => rateFromCoinbase(from, to),
    () => rateFromCryptoCompare(from, to),
    () => rateFromFrankfurter(from, to),
    () => rateFromUsdBridge(from, to)
  ];

  let result = null;
  try {
    result = await Promise.any(providers.map(provider => provider()));
  } catch (error) {
    console.warn('Transfer Express: online rate providers failed', error);
  }

  if (requestId !== state.rateRequestId) return;

  if (result) {
    state.marketRate = result.rate;
    state.clientRate = calculateClientRate(result.rate);
    state.rateSource = result.source;
    state.rateMode = 'online';
    state.rateUpdatedAt = new Date();
    saveRateToCache(from, to, result);
  } else {
    const cached = readRateFromCache(from, to);
    if (cached) {
      state.marketRate = cached.rate;
      state.clientRate = calculateClientRate(cached.rate);
      state.rateSource = cached.source;
      state.rateMode = 'cached';
      state.rateUpdatedAt = new Date(cached.timestamp);
    } else {
      state.marketRate = null;
      state.clientRate = null;
      state.rateSource = 'Курс уточнит оператор';
      state.rateMode = 'unavailable';
      state.rateUpdatedAt = null;
    }
  }

  updateRateUI();
}

function isChartModal() {
  return state.modalSide === 'chartFrom' || state.modalSide === 'chartTo';
}

function isReviewModal() {
  return state.modalSide === 'reviewFrom' || state.modalSide === 'reviewTo';
}

function openAssetModal(side) {
  state.modalSide = side;
  state.modalCategory = 'all';
  state.modalCode = 'all';
  const triggerMap = {
    from: elements.fromAssetButton,
    to: elements.toAssetButton,
    chartFrom: elements.chartFromButton,
    chartTo: elements.chartToButton,
    reviewFrom: elements.reviewFromButton,
    reviewTo: elements.reviewToButton
  };
  state.lastModalTrigger = triggerMap[side] || null;
  elements.assetModal.hidden = false;
  document.body.classList.add('modal-open');
  const hints = {
    from: 'Для поля «Вы отдаёте»',
    to: 'Для поля «Вы получаете»',
    chartFrom: 'Базовая валюта онлайн-графика',
    chartTo: 'Валюта котировки онлайн-графика',
    reviewFrom: 'Что вы отдавали',
    reviewTo: 'Что вы получали'
  };
  elements.assetModalSideHint.textContent = hints[side] || 'Выберите актив';
  elements.assetTabs.hidden = isChartModal();
  elements.assetSearch.value = '';
  updateModalTabs();
  renderQuickChips();
  renderAssetList();
  window.setTimeout(() => elements.assetSearch.focus(), 30);
}

function closeAssetModal() {
  if (elements.assetModal.hidden) return;
  elements.assetModal.hidden = true;
  document.body.classList.remove('modal-open');
  state.lastModalTrigger?.focus();
}

function updateModalTabs() {
  $$('.modal-tab', elements.assetTabs).forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === state.modalCategory);
  });
}

function getVisibleAssets() {
  const term = elements.assetSearch.value.trim().toLocaleLowerCase('ru');
  if (isChartModal()) {
    return MARKET_ASSETS.filter(asset => {
      const codeMatch = state.modalCode === 'all' || asset.code === state.modalCode;
      const searchMatch = !term || `${asset.name} ${asset.code} ${asset.type}`.toLocaleLowerCase('ru').includes(term);
      return codeMatch && searchMatch;
    });
  }
  return ASSETS.filter(asset => {
    const categoryMatch = state.modalCategory === 'all' || asset.category === state.modalCategory;
    const codeMatch = state.modalCode === 'all' || asset.code === state.modalCode || asset.pricingCode === state.modalCode;
    const searchMatch = !term || `${asset.name} ${asset.code} ${asset.network} ${CATEGORY_LABELS[asset.category]}`.toLocaleLowerCase('ru').includes(term);
    return categoryMatch && codeMatch && searchMatch;
  });
}

function renderQuickChips() {
  // The old one-line currency strip was easy to clip and forced horizontal scrolling.
  // Search and category tabs cover the same use cases without hiding options.
  elements.assetQuickChips.hidden = true;
  elements.assetQuickChips.innerHTML = '';
  state.modalCode = 'all';
}

function assetCardMarkup(asset, same, market = false) {
  const meta = market
    ? `${asset.type === 'fiat' ? 'Фиатная валюта' : 'Криптовалюта'} · онлайн-график`
    : `${CATEGORY_LABELS[asset.category]} · ${escapeHtml(asset.network)}${same ? ' · выбрано с другой стороны' : ''}`;
  const dataAttr = market ? `data-market-code="${asset.code}"` : `data-asset-id="${asset.id}"`;
  return `
    <button class="asset-item${same ? ' opposite-selected' : ''}" type="button" ${dataAttr}>
      <span class="asset-item-icon">${iconMarkup(asset)}</span>
      <span class="asset-item-copy">
        <span class="asset-item-title-row">
          <strong>${escapeHtml(asset.name)}</strong>
          <b class="asset-item-code">${asset.code}</b>
        </span>
        <small>${meta}</small>
      </span>
    </button>`;
}

function renderAssetList() {
  const visible = getVisibleAssets();
  if (elements.assetResultCount) elements.assetResultCount.textContent = `${visible.length} ${visible.length === 1 ? 'вариант' : visible.length < 5 ? 'варианта' : 'вариантов'}`;
  if (!visible.length) {
    elements.assetList.innerHTML = '<div class="asset-empty">Ничего не найдено. Попробуйте другое название или категорию.</div>';
    return;
  }

  if (isChartModal()) {
    const oppositeCode = state.modalSide === 'chartFrom' ? state.chartToCode : state.chartFromCode;
    elements.assetList.innerHTML = `<div class="asset-grid market-grid">${visible.map(asset => assetCardMarkup(asset, asset.code === oppositeCode, true)).join('')}</div>`;
    return;
  }

  let oppositeId;
  if (state.modalSide === 'reviewFrom') oppositeId = state.reviewToId;
  else if (state.modalSide === 'reviewTo') oppositeId = state.reviewFromId;
  else oppositeId = state.modalSide === 'from' ? state.toId : state.fromId;

  // Keep every result in one compact grid. Category and network information stays
  // inside each card, while the tabs and search provide fast filtering.
  elements.assetList.innerHTML = `<div class="asset-grid">${visible.map(asset => assetCardMarkup(asset, asset.id === oppositeId)).join('')}</div>`;
}

function selectMarketAsset(code) {
  if (!MARKET_BY_CODE.has(code)) return;
  if (state.modalSide === 'chartFrom') {
    const old = state.chartFromCode;
    state.chartFromCode = code;
    if (code === state.chartToCode) state.chartToCode = old;
  } else {
    const old = state.chartToCode;
    state.chartToCode = code;
    if (code === state.chartFromCode) state.chartFromCode = old;
  }
  closeAssetModal();
  updateChartPickerUI();
  loadChart();
}

function selectAsset(assetId) {
  if (!ASSET_BY_ID.has(assetId)) return;

  if (isReviewModal()) {
    if (state.modalSide === 'reviewFrom') {
      const old = state.reviewFromId;
      state.reviewFromId = assetId;
      if (assetId === state.reviewToId) state.reviewToId = old;
    } else {
      const old = state.reviewToId;
      state.reviewToId = assetId;
      if (assetId === state.reviewFromId) state.reviewFromId = old;
    }
    closeAssetModal();
    updateReviewPairUI();
    return;
  }

  if (state.modalSide === 'from') {
    if (assetId === state.toId) {
      const oldFrom = state.fromId;
      state.fromId = assetId;
      state.toId = oldFrom;
    } else {
      state.fromId = assetId;
    }
  } else if (assetId === state.fromId) {
    const oldTo = state.toId;
    state.toId = assetId;
    state.fromId = oldTo;
  } else {
    state.toId = assetId;
  }

  elements.directionDetails.value = '';
  closeAssetModal();
  updatePairUI();
  loadRate();
}

function swapPair() {
  const oldFrom = state.fromId;
  state.fromId = state.toId;
  state.toId = oldFrom;
  elements.directionDetails.value = '';
  updatePairUI();
  loadRate();
  elements.swapAssets.animate([
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(180deg)' }
  ], { duration: 300, easing: 'ease' });
}


function swapChartPair() {
  const old = state.chartFromCode;
  state.chartFromCode = state.chartToCode;
  state.chartToCode = old;
  updateChartPickerUI();
  loadChart();
  elements.swapChartAssets?.animate([
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(180deg)' }
  ], { duration: 300, easing: 'ease' });
}

function getReviewPair() {
  return { from: getAsset(state.reviewFromId), to: getAsset(state.reviewToId) };
}

function updateReviewPairUI() {
  const { from, to } = getReviewPair();
  setIconElement(elements.reviewFromIcon, from);
  setIconElement(elements.reviewToIcon, to);
  elements.reviewFromName.textContent = from.name;
  elements.reviewToName.textContent = to.name;
  elements.reviewPair.textContent = `${from.name} → ${to.name}`;
}

function swapReviewPair() {
  const old = state.reviewFromId;
  state.reviewFromId = state.reviewToId;
  state.reviewToId = old;
  updateReviewPairUI();
  elements.swapReviewAssets?.animate([
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(180deg)' }
  ], { duration: 300, easing: 'ease' });
}

function validateDestinationDetails(asset, value) {
  if (!value || asset.category !== 'coin') return true;
  const validators = {
    tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    evm: /^0x[a-fA-F0-9]{40}$/,
    btc: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/i,
    sol: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    ton: /^(EQ|UQ)[A-Za-z0-9_-]{46}$/,
    generic: /^.{10,}$/
  };
  return (validators[asset.addressType] || validators.generic).test(value.trim());
}

function validateOrder() {
  const amount = normalizeNumber(elements.giveAmount.value);
  const details = elements.directionDetails.value.trim();
  const { to } = getPair();
  const detailsWrap = elements.directionDetails.closest('.input-wrap');
  detailsWrap.classList.remove('invalid');

  if (!Number.isFinite(amount) || amount <= 0) {
    showToast('Проверьте сумму', 'Введите сумму обмена больше нуля.', 'error');
    elements.giveAmount.focus();
    return null;
  }

  if (details && !validateDestinationDetails(to, details)) {
    detailsWrap.classList.add('invalid');
    showToast('Проверьте реквизиты', `Формат не похож на корректные реквизиты для ${to.network}.`, 'error');
    elements.directionDetails.focus();
    return null;
  }

  if (!elements.agreement.checked) {
    showToast('Нужно согласие', 'Подтвердите возраст 18+ и согласие с правилами обмена.', 'error');
    return null;
  }

  return {
    amount,
    details,
    comment: elements.orderComment.value.trim()
  };
}

function buildOrderMessage(order) {
  const { from, to } = getPair();
  const result = Number.isFinite(state.clientRate) ? order.amount * state.clientRate : null;
  const rateLine = Number.isFinite(state.clientRate)
    ? `Ориентировочный курс на сайте: 1 ${from.code} = ${formatRate(state.clientRate)} ${to.code}`
    : 'Ориентировочный курс на сайте: онлайн-источник сейчас недоступен, прошу сообщить актуальный курс';
  const resultLine = Number.isFinite(result)
    ? `Ориентировочно получаю: ${formatAmount(result, getAmountDigits(to))} ${to.code}`
    : 'Ориентировочно получаю: прошу рассчитать';

  return [
    'Здравствуйте! Хочу создать заявку в Transfer Express.',
    '',
    `Направление: ${from.name} → ${to.name}`,
    `Отдаю: ${formatAmount(order.amount, getAmountDigits(from))} ${from.code}`,
    resultLine,
    rateLine,
    `Источник расчёта: ${['online', 'cached'].includes(state.rateMode) ? state.rateSource : 'уточнит оператор'}`,
    `Реквизиты / детали получения: ${order.details || 'сообщу оператору'}`,
    `Комментарий: ${order.comment || 'нет'}`,
    '',
    'Пожалуйста, подтвердите доступность направления, финальный курс, возможную комиссию и порядок обмена.'
  ].join('\n');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }
}

async function createTelegramOrder() {
  const order = validateOrder();
  if (!order) return;
  const message = buildOrderMessage(order);
  const url = telegramLink(message);
  const telegramWindow = window.open(url, '_blank');
  if (telegramWindow) telegramWindow.opener = null;
  const copied = await copyText(message);
  showToast(
    'Заявка подготовлена',
    copied ? 'Telegram открыт с шаблоном; текст также скопирован в буфер.' : 'Telegram открыт с уже заполненным шаблоном.'
  );
  if (!telegramWindow) window.location.href = url;
}

function updateGenericTelegramLinks() {
  const { from, to } = getPair();
  const genericOrder = `Здравствуйте! Хочу уточнить условия обмена ${from.name} → ${to.name}.`;
  const genericUrl = telegramLink(genericOrder);
  const questionUrl = telegramLink(CONFIG.questionTemplate);

  ['#headerTelegram', '#mobileTelegramLink'].forEach(selector => {
    const link = $(selector);
    if (link) link.href = genericUrl;
  });

  ['#heroQuestionLink', '#questionLink', '#summaryQuestionLink', '#faqQuestionLink'].forEach(selector => {
    const link = $(selector);
    if (link) link.href = questionUrl;
  });
}

function showToast(title, text, type = 'success') {
  if (!elements.toast) return;
  window.clearTimeout(state.toastTimer);
  elements.toastTitle.textContent = title;
  elements.toastText.textContent = text;
  elements.toast.dataset.type = type;
  elements.toast.classList.add('show');
  state.toastTimer = window.setTimeout(() => elements.toast.classList.remove('show'), 3800);
}

function getSavedTheme() {
  try { return localStorage.getItem('transfer-express-theme'); } catch (_) { return null; }
}

function applyTheme(theme) {
  elements.root.dataset.theme = theme;
  try { localStorage.setItem('transfer-express-theme', theme); } catch (_) {}
  $('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eef5f1' : '#08140f');
}

function initTheme() {
  const saved = getSavedTheme();
  const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  applyTheme(saved || preferred);
  elements.themeToggle?.addEventListener('click', () => {
    applyTheme(elements.root.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

function initHeader() {
  const update = () => elements.header?.classList.toggle('scrolled', window.scrollY > 18);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initReveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px' });
  items.forEach(item => observer.observe(item));
}

function initFaq() {
  const details = $$('.faq-list details');
  details.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      details.forEach(other => { if (other !== item) other.open = false; });
    });
  });
}

function initAmounts() {
  elements.giveAmount.addEventListener('input', updateCalculation);
  elements.giveAmount.addEventListener('blur', () => {
    const value = normalizeNumber(elements.giveAmount.value);
    if (value > 0) elements.giveAmount.value = formatAmount(value, 2);
  });
  elements.giveAmount.addEventListener('focus', () => {
    const value = normalizeNumber(elements.giveAmount.value);
    elements.giveAmount.value = value || '';
    elements.giveAmount.select();
  });
  $$('[data-amount]').forEach(button => {
    button.addEventListener('click', () => {
      elements.giveAmount.value = formatAmount(Number(button.dataset.amount), 0);
      updateCalculation();
    });
  });
  elements.directionDetails.addEventListener('input', () => elements.directionDetails.closest('.input-wrap')?.classList.remove('invalid'));
}

function initAssetModal() {
  elements.fromAssetButton.addEventListener('click', () => openAssetModal('from'));
  elements.toAssetButton.addEventListener('click', () => openAssetModal('to'));
  elements.chartFromButton?.addEventListener('click', () => openAssetModal('chartFrom'));
  elements.chartToButton?.addEventListener('click', () => openAssetModal('chartTo'));
  elements.reviewFromButton?.addEventListener('click', () => openAssetModal('reviewFrom'));
  elements.reviewToButton?.addEventListener('click', () => openAssetModal('reviewTo'));
  elements.closeAssetModal.addEventListener('click', closeAssetModal);
  $('[data-close-modal]', elements.assetModal).addEventListener('click', closeAssetModal);
  elements.assetSearch.addEventListener('input', renderAssetList);
  elements.assetTabs.addEventListener('click', event => {
    const tab = event.target.closest('[data-category]');
    if (!tab) return;
    state.modalCategory = tab.dataset.category;
    state.modalCode = 'all';
    updateModalTabs();
    renderQuickChips();
    renderAssetList();
  });
  elements.assetQuickChips.addEventListener('click', event => {
    const chip = event.target.closest('[data-code]');
    if (!chip) return;
    state.modalCode = chip.dataset.code;
    renderQuickChips();
    renderAssetList();
  });
  elements.assetList.addEventListener('click', event => {
    const marketItem = event.target.closest('[data-market-code]');
    if (marketItem) {
      selectMarketAsset(marketItem.dataset.marketCode);
      return;
    }
    const item = event.target.closest('[data-asset-id]');
    if (item) selectAsset(item.dataset.assetId);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !elements.assetModal.hidden) closeAssetModal();
  });
  elements.swapAssets.addEventListener('click', swapPair);
  elements.swapChartAssets?.addEventListener('click', swapChartPair);
  elements.swapReviewAssets?.addEventListener('click', swapReviewPair);
  elements.chartPeriods?.addEventListener('click', event => {
    const button = event.target.closest('[data-days]');
    if (!button) return;
    state.chartDays = Number(button.dataset.days) || 30;
    updateChartPickerUI();
    loadChart();
  });
}

function starsMarkup(rating, interactive = false) {
  return Array.from({ length: 5 }, (_, index) => {
    const value = index + 1;
    return `<${interactive ? 'button' : 'span'} ${interactive ? `type="button" data-rating="${value}" aria-label="${value} из 5"` : ''} class="star${value <= rating ? ' active' : ''}">★</${interactive ? 'button' : 'span'}>`;
  }).join('');
}

function readLocalReviews() {
  try {
    const raw = localStorage.getItem(CONFIG.reviewStorageKey);
    if (raw) {
      const reviews = JSON.parse(raw);
      if (Array.isArray(reviews)) return reviews.filter(review => review?.text && review?.name);
    }
    const legacy = JSON.parse(localStorage.getItem('transfer-express-local-review-v1') || 'null');
    if (legacy?.text && legacy?.name) return [legacy];
  } catch (_) {}
  return [];
}

function saveLocalReviews(reviews) {
  localStorage.setItem(CONFIG.reviewStorageKey, JSON.stringify(reviews.slice(0, 20)));
}

function renderReviewCard(review) {
  return `
    <article class="review-card">
      <div class="review-card-top">
        <span class="review-avatar">${escapeHtml(review.name.trim().charAt(0).toUpperCase())}</span>
        <span class="review-person"><strong>${escapeHtml(review.name)}</strong><small>${escapeHtml(review.pair || 'Transfer Express')}</small></span>
        <span class="review-stars" aria-label="${review.rating} из 5">${starsMarkup(Number(review.rating) || 5)}</span>
      </div>
      <p>${escapeHtml(review.text)}</p>
    </article>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderReviews() {
  if (!elements.reviewsList) return;
  const reviews = [...readLocalReviews(), ...SAMPLE_REVIEWS];
  elements.reviewsList.innerHTML = reviews.map(renderReviewCard).join('');
}

function updateReviewStars() {
  if (!elements.reviewStars) return;
  elements.reviewStars.innerHTML = starsMarkup(state.reviewRating, true);
  if (elements.reviewRatingValue) elements.reviewRatingValue.textContent = `Выбрано: ${state.reviewRating} из 5`;
}

function initReviews() {
  if (!elements.reviewForm) return;
  updateReviewPairUI();
  updateReviewStars();
  renderReviews();

  elements.reviewStars.addEventListener('click', event => {
    const star = event.target.closest('[data-rating]');
    if (!star) return;
    state.reviewRating = Math.min(5, Math.max(1, Number(star.dataset.rating) || 5));
    updateReviewStars();
  });

  elements.reviewForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = elements.reviewName.value.trim();
    const text = elements.reviewText.value.trim();
    const nameWrap = elements.reviewName.closest('.input-wrap');
    const textWrap = elements.reviewText.closest('.input-wrap');
    nameWrap?.classList.remove('invalid');
    textWrap?.classList.remove('invalid');

    if (!name) {
      nameWrap?.classList.add('invalid');
      showToast('Укажите имя', 'Поле имени обязательно для добавления комментария.', 'error');
      elements.reviewName.focus();
      return;
    }
    if (text.length < 10) {
      textWrap?.classList.add('invalid');
      showToast('Добавьте текст', 'Комментарий должен содержать хотя бы 10 символов.', 'error');
      elements.reviewText.focus();
      return;
    }

    const { from, to } = getReviewPair();
    const review = {
      name: name.slice(0, 40),
      text: text.slice(0, 700),
      rating: state.reviewRating,
      pair: `${from.name} → ${to.name}`,
      timestamp: Date.now()
    };
    try {
      const reviews = readLocalReviews();
      reviews.unshift(review);
      saveLocalReviews(reviews);
    } catch (_) {
      showToast('Не удалось сохранить', 'Браузер не разрешил сохранить комментарий.', 'error');
      return;
    }
    elements.reviewText.value = '';
    renderReviews();
    showToast('Комментарий добавлен', 'Он появился в блоке отзывов.');
    elements.reviewsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function updateAgreementState() {
  if (!elements.agreement || !elements.createOrder) return;
  const accepted = elements.agreement.checked;
  elements.createOrder.disabled = !accepted;
  elements.createOrder.setAttribute('aria-disabled', String(!accepted));
  elements.createOrder.title = accepted ? 'Создать заявку в Telegram' : 'Сначала примите условия обмена';
  elements.agreement.closest('.check-row')?.classList.toggle('agreement-missing', !accepted);
}

function init() {
  elements.currentYear.textContent = String(new Date().getFullYear());
  initTheme();
  initHeader();
  initReveal();
  initFaq();
  initAmounts();
  initAssetModal();
  initReviews();
  initChartInteractions();
  elements.agreement?.addEventListener('change', updateAgreementState);
  updateAgreementState();
  updatePairUI();
  updateChartPickerUI();
  elements.createOrder.addEventListener('click', createTelegramOrder);
  elements.refreshRate.addEventListener('click', () => loadRate());
  loadRate();
  loadChart();
  window.setInterval(() => loadRate({ silent: true }), CONFIG.refreshIntervalMs);
  window.setInterval(() => loadChart(), 5 * 60_000);
}

document.addEventListener('DOMContentLoaded', init);
