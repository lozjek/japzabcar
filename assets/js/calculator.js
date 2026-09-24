/* Растаможка физлица. Формулы перенесены без изменений из прежнего calculator.html
   (см. calculator-formuly.md за источниками) — меняется только то, что расчёт
   теперь живой (на каждый input), без кнопки «Рассчитать». */

// Источники и статус подтверждения — см. calculator-formuly.md в этом же комплекте.
// Пошлина физлиц: Решение Совета ЕЭК №107 от 20.12.2017, Прил.2 Табл.2 — прочитан официальный PDF напрямую.
const DUTY_TABLE = {
  // Для age="new" (младше 3 лет) строка выбирается по ТАМОЖЕННОЙ СТОИМОСТИ В ЕВРО (max — порог стоимости €),
  // а не по объёму двигателя — так буквально в тексте Решения Совета ЕЭК №107, Прил.2, Табл.2, п.3.
  // Объём двигателя входит только в формулу минимума (perCm3 × объём).
  new: [
    { max: 8500, pct: 0.54, perCm3: 2.5 },
    { max: 16700, pct: 0.48, perCm3: 3.5 },
    { max: 42300, pct: 0.48, perCm3: 5.5 },
    { max: 84500, pct: 0.48, perCm3: 7.5 },
    { max: 169000, pct: 0.48, perCm3: 15.0 },
    { max: Infinity, pct: 0.48, perCm3: 20.0 },
  ],
  mid: [
    { max: 1000, perCm3: 1.5 },
    { max: 1500, perCm3: 1.7 },
    { max: 1800, perCm3: 2.5 },
    { max: 2300, perCm3: 2.7 },
    { max: 3000, perCm3: 3.0 },
    { max: Infinity, perCm3: 3.6 },
  ],
  old: [
    { max: 1000, perCm3: 3.0 },
    { max: 1500, perCm3: 3.2 },
    { max: 1800, perCm3: 3.5 },
    { max: 2300, perCm3: 4.8 },
    { max: 3000, perCm3: 5.0 },
    { max: Infinity, perCm3: 5.7 },
  ],
};

const UTIL_FEE_BASE = 20000;
const UTIL_COEF = { new: 0.17, mid: 0.26, old: 0.26 };
const POWER_LIMIT_HP = 160;

// Утильсбор для мощности >=160 л.с. — Пост. №1291 в ред. №1713 от 01.11.2025.
// Коэффициенты = таблица alta.ru/Контур.Норматив × 1.2 (индексация 2026 года).
// Круглое число-порог относится к следующему диапазону (строгое "<").
const UTIL_HP_BRACKETS = [190, 220, 250, 280, 310, 340, 370, 400, 430, 460, 500, Infinity];
const UTIL_INDEXATION_2026 = 1.2;
const UTIL_HIGH_POWER_TABLE = {
  1000: [[12.8,23.7],[13.2,24.4],[13.5,25.1],[14.4,25.1],[14.4,25.1],[14.4,25.1],[14.4,25.1],[14.4,25.1],[14.4,25.1],[14.4,25.1],[14.4,25.1],[14.4,25.1]],
  2000: [[37.5,62.2],[39.7,66],[42.1,69.9],[47.6,76.6],[53.8,83.8],[60.8,91.8],[69.3,100.5],[79,110],[90,120.5],[102.7,132],[117,144.5],[133.4,158.2]],
  3000: [[96.11,144],[98.5,145.9],[100.1,148],[105,152.5],[109.2,157.1],[113.6,161.4],[118.1,165.9],[122.9,170.6],[127.8,175.4],[132.9,180.3],[138.2,185.3],[143.7,190.5]],
  3500: [[109.8,166.7],[112,168.5],[114.3,170.3],[117.1,172.7],[120,177],[126.6,181.5],[133.6,186.9],[141,192.5],[148.7,198.3],[156.9,204.2],[165.5,210.4],[174.6,216.7]],
  Infinity: [[139.4,182.9],[141.8,185.7],[144.2,188.5],[147.1,192.8],[150,197.2],[155.3,208],[160.73,219.5],[166.4,231.6],[172.2,244.3],[178.2,257.8],[184.4,272],[190.9,286.9]],
};

function getVolumeCategoryKey(volume) {
  if (volume <= 1000) return 1000;
  if (volume <= 2000) return 2000;
  if (volume <= 3000) return 3000;
  if (volume <= 3500) return 3500;
  return Infinity;
}

function getUtilFeeRub(age, volume, power) {
  if (power < POWER_LIMIT_HP) return UTIL_FEE_BASE * UTIL_COEF[age];
  const volKey = getVolumeCategoryKey(volume);
  const rowIndex = UTIL_HP_BRACKETS.findIndex(b => power < b);
  const row = UTIL_HIGH_POWER_TABLE[volKey][rowIndex];
  const coef = (age === 'new' ? row[0] : row[1]) * UTIL_INDEXATION_2026; // mid и old — обе по колонке "старше 3 лет"
  return UTIL_FEE_BASE * coef;
}

// Таможенный сбор за операции — Пост. №1637 от 28.11.2024, ставки на 2026 г. по Пост. №1638 от 23.10.2025.
const CUSTOMS_FEE_TABLE = [
  { max: 200000, fee: 1231 },
  { max: 450000, fee: 2462 },
  { max: 1200000, fee: 4924 },
  { max: 2700000, fee: 13541 },
  { max: 4200000, fee: 18465 },
  { max: 5500000, fee: 21344 },
  { max: 10000000, fee: 49240 },
  { max: Infinity, fee: 73860 },
];
function findCustomsFee(valueRub) { return CUSTOMS_FEE_TABLE.find(b => valueRub <= b.max).fee; }
function findBracket(age, volume, valueEur) {
  const key = age === 'new' ? valueEur : volume;
  return DUTY_TABLE[age].find(b => key <= b.max);
}

const rub = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';

(function () {
  var calc = document.getElementById('calcAgeSeg');
  if (!calc) return;

  var volumeEl = document.getElementById('calcVolume');
  var powerEl = document.getElementById('calcPower');
  var valueEurEl = document.getElementById('calcValueEur');
  var rateEl = document.getElementById('calcRate');
  var rateStatusEl = document.getElementById('calcRateStatus');
  var age = 'new';

  var readyEl = document.getElementById('calcReady');
  var emptyEl = document.getElementById('calcEmpty');
  var warnEl = document.getElementById('calcWarn');
  var dutyEl = document.getElementById('calcDutyVal');
  var utilEl = document.getElementById('calcUtilVal');
  var feeEl = document.getElementById('calcFeeVal');
  var totalEl = document.getElementById('calcTotalVal');
  var lastTotal = null;

  calc.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-age]');
    if (!btn) return;
    age = btn.getAttribute('data-age');
    calc.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn); });
    recalc();
  });
  [volumeEl, powerEl, valueEurEl, rateEl].forEach(function (el) { el.addEventListener('input', recalc); });

  function recalc() {
    var volume = parseFloat(volumeEl.value), power = parseFloat(powerEl.value);
    var valueEur = parseFloat(valueEurEl.value), rate = parseFloat(rateEl.value);

    if (!volume || !power) {
      emptyEl.textContent = 'Заполните объём двигателя и мощность.';
      show(false); return;
    }
    if (!valueEur || !rate) {
      emptyEl.textContent = 'Заполните стоимость авто и курс — сбор считается от стоимости при любом возрасте авто.';
      show(false); return;
    }

    var bracket = findBracket(age, volume, valueEur);
    var dutyEur = age === 'new' ? Math.max(valueEur * bracket.pct, bracket.perCm3 * volume) : bracket.perCm3 * volume;
    var dutyRub = dutyEur * rate;
    var utilFeeRub = getUtilFeeRub(age, volume, power);
    var valueRub = valueEur * rate;
    var customsFeeRub = findCustomsFee(valueRub);
    var totalRub = dutyRub + utilFeeRub + customsFeeRub;

    dutyEl.textContent = rub(dutyRub);
    utilEl.textContent = rub(utilFeeRub);
    feeEl.textContent = rub(customsFeeRub);
    totalEl.textContent = rub(totalRub);
    warnEl.hidden = power < POWER_LIMIT_HP;
    show(true);

    var t = Math.round(totalRub);
    if (t !== lastTotal && window.JZAnim) window.JZAnim.rise(totalEl);
    lastTotal = t;
  }

  function show(ready) {
    readyEl.hidden = !ready;
    emptyEl.hidden = ready;
  }

  // Официальный cbr.ru не отдаёт CORS-заголовки для клиентского fetch — используем
  // зеркало cbr-xml-daily.ru (те же данные ЦБ РФ, отдаёт с CORS).
  async function loadCbrRate() {
    try {
      var res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
      var data = await res.json();
      var eurRate = data.Valute.EUR.Value;
      var dateStr = new Date(data.Date).toLocaleDateString('ru-RU');
      if (!rateEl.value) rateEl.value = eurRate.toFixed(4);
      rateEl.placeholder = '';
      rateStatusEl.textContent = 'Курс ЦБ РФ на ' + dateStr + ': ' + eurRate.toFixed(2) + ' ₽ (зеркало cbr-xml-daily.ru, можно исправить вручную)';
      recalc();
    } catch (e) {
      rateEl.placeholder = 'не загрузилось, введите вручную (cbr.ru)';
      rateStatusEl.textContent = 'Не удалось загрузить курс автоматически — введите вручную с cbr.ru.';
    }
  }
  loadCbrRate();

  show(false);
  emptyEl.textContent = 'Заполните все поля слева — расчёт появится сразу.';
})();
