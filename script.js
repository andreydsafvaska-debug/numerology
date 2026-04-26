// Временный отладчик для поиска вызова toLowerCase на undefined
(function() {
    const original = String.prototype.toLowerCase;
    String.prototype.toLowerCase = function() {
        if (this === undefined || this === null) {
            console.trace('ОШИБКА: toLowerCase вызван на undefined/null');
            return '';
        }
        return original.call(this);
    };
})();

// ВАШ НОМЕР WHATSAPP
const myPhone = "79956506287";



// ⚡ ТЕСТОВЫЙ РЕЖИМ (true = всё бесплатно, false = платно)
const TEST_MODE = true;
// ==========================================================
//  ПРОВЕРКА ЦЕЛОСТНОСТИ ДАННЫХ (защита от пропажи файлов)
// ==========================================================
/*(function checkRequiredData() {
    const required = {
        'cellTexts':              typeof cellTexts !== 'undefined',
        'rowTexts':               typeof rowTexts !== 'undefined',
        'compatibilityDescriptions': typeof compatibilityDescriptions !== 'undefined',
        'moneyMatrixData':        typeof moneyMatrixData !== 'undefined',
        'moneyCompatData':        typeof moneyCompatData !== 'undefined',
        'parentChildTexts':       typeof parentChildTexts !== 'undefined',
        'childLifePathTexts':     typeof childLifePathTexts !== 'undefined',
        'pythagorasSynthesis':    typeof pythagorasSynthesis !== 'undefined',
        'lifePathDescriptions':   typeof lifePathDescriptions !== 'undefined',
        'lifePathAdvice':         typeof lifePathAdvice !== 'undefined',
        'arcanaFullData':         typeof arcanaFullData !== 'undefined'  // если есть файл data-arcana-full.js
    };
    const missing = Object.keys(required).filter(key => !required[key]);
    if (missing.length > 0) {
        // Показываем сообщение вместо всего контента
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:white;font-size:1.2rem;text-align:center;background:#0f0c29;padding:20px;">
                <div>
                    <h2 style="color:#D4AF37; font-family: 'Cormorant Garamond', serif;">⚠️ Ошибка загрузки данных</h2>
                    <p style="color:#ccc;">Отсутствуют следующие модули:</p>
                    <p style="color:#ff6b6b; font-weight:bold;">${missing.join(', ')}</p>
                    <p style="color:#aaa; margin-top:20px;">Пожалуйста, обновите страницу (F5) или свяжитесь с администратором.</p>
                </div>
            </div>`;
        //throw new Error('Отсутствуют обязательные данные: ' + missing.join(', '));
    }
})();*/

// Функция для безопасного экранирования HTML-спецсимволов
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
}

// Индикация загрузки PDF
function setPdfLoading(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add('pdf-loading');
    btn.setAttribute('data-original-html', btn.innerHTML);
    btn.setAttribute('data-original-display', btn.style.display || '');
    btn.style.display = 'inline-block';   // покажем кнопку, если была скрыта
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Генерация PDF...';
}

function resetPdfButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const originalHTML = btn.getAttribute('data-original-html');
    if (originalHTML) btn.innerHTML = originalHTML;
    const originalDisplay = btn.getAttribute('data-original-display');
    if (originalDisplay !== undefined) btn.style.display = originalDisplay;
    btn.disabled = false;
    btn.classList.remove('pdf-loading');
}

// ==========================================================
// ПРЕМИУМ-ДОСТУП С СЕРВЕРОМ (ОДНОРАЗОВЫЕ ТОКЕНЫ)
// ==========================================================
let premiumAccess = false;
let currentToken = localStorage.getItem('accessToken') || '';
const SERVER_URL = 'https://numerology-pdf-server.onrender.com'; // ← ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ URL СЕРВЕРА
// При загрузке проверяем сохранённый токен и показываем счётчик
(async function showCounterIfPaid() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
        const resp = await fetch(`${SERVER_URL}/check-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await resp.json();
        if (data.success) {
            updateAttemptsDisplay(data.remaining);
            premiumAccess = true;
            localStorage.setItem('premiumAccess', 'true');
        } else {
            // токен недействителен – чистим
            localStorage.removeItem('accessToken');
            localStorage.removeItem('premiumAccess');
        }
    } catch (e) {
        console.warn('Не удалось проверить токен при загрузке', e);
    }
})();

// Асинхронная проверка токена при загрузке страницы
async function checkPremiumAccess() {

    // ... ДЛЯ ТЕСТА
    if (TEST_MODE) {
        premiumAccess = true;
        localStorage.setItem('premiumAccess', 'true');
        return true;
    }
    // ... ДЛЯ ТЕСТА


    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access');
    const tokenToCheck = token || currentToken;

    if (!tokenToCheck) return false;

    try {
        const response = await fetch(`${SERVER_URL}/check-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenToCheck })
        });
        const data = await response.json();
        if (data.success) {
            premiumAccess = true;
            updateAttemptsDisplay(data.remaining);
             localStorage.setItem('accessToken', tokenToCheck);
            localStorage.setItem('premiumAccess', 'true');
            if (token) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            updateUIForPremium(); // ← добавить
            return true;
        } else {
            premiumAccess = false;
            localStorage.removeItem('premiumAccess');
            localStorage.removeItem('accessToken');
            return false;
        }
    } catch (err) {
        console.error('Ошибка проверки токена:', err);
        return false;
    }
    if (!premiumAccess) {
    const pdfBtn = document.getElementById('download-pdf-btn');
    if (pdfBtn) pdfBtn.style.display = 'none';
}
}

// Вызываем проверку при старте
(async () => {
    await checkPremiumAccess();
    // Если на главной уже был расчёт, применяем paywall
    if (document.getElementById('decoding-content').innerHTML) {
        applyPaywallToDecoding();
    }
})();

// Функция списания одной попытки перед платным расчётом
async function useCalculation() {

    // в тестовом режиме всегда успешно
      if (TEST_MODE) return true;  // в тестовом режиме всегда успешно
    // в тестовом режиме всегда успешно


    if (!premiumAccess || !currentToken) return false;
    try {
        const response = await fetch(`${SERVER_URL}/use-calculation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentToken })
        });
        const data = await response.json();
        if (data.success) {
            
                if (data.remaining === 0) {
                premiumAccess = false;
                localStorage.removeItem('premiumAccess');
                // Показываем красивое окно
                document.getElementById('no-attempts-modal').style.display = 'flex';
                // Убираем счётчик
                const counter = document.getElementById('attempts-counter');
                if (counter) counter.remove();
            }
            return true;
        } else {
            alert('Невозможно выполнить расчёт: ' + data.error);
            premiumAccess = false;
            localStorage.removeItem('premiumAccess');
            return false;
        }
    } catch (err) {
        console.error('Ошибка списания попытки:', err);
        return false;
    }
}

function closeNoAttemptsModal() {
    document.getElementById('no-attempts-modal').style.display = 'none';
}



function getRowText(rowName, value) {
    const maxKey = 7; // максимальный ключ в наших текстах
    let key = value;
    if (key > maxKey) key = maxKey;
    if (rowTexts[rowName] && rowTexts[rowName][key]) {
        return rowTexts[rowName][key];
    }
    return rowTexts[rowName][0] || "Расшифровка временно отсутствует.";
}

function getRowValue(val) {
    return val > 7 ? 7 : val;
}
/* ============================================
   ЛОГИКА ОПЛАТЫ С ОФЕРТОЙ
   ============================================ */

let currentPaymentLink = ""; // Временное хранение ссылки
let currentServiceName = "";

// 1. Открываем окно подтверждения вместо прямой ссылки
function bookService(serviceName, paymentLink) {
    if (!paymentLink) {
        alert("Ссылка на оплату формируется. Напишите мне в Telegram.");
        window.open("https://t.me/zoya_viik", "_blank");
        return;
    }

    currentPaymentLink = paymentLink;
    currentServiceName = serviceName;

    // Заполняем данные в модальном окне
    document.getElementById('payment-product-name').textContent = serviceName;
    document.getElementById('offer-agree').checked = false; // Сбрасываем галочку
    document.getElementById('payment-modal').style.display = 'flex';
}

// 2. Обработка нажатия кнопки "ОПЛАТИТЬ" внутри окна
document.getElementById('final-pay-btn').addEventListener('click', function() {
    const email = document.getElementById('client-email').value;
    const isAgreed = document.getElementById('offer-agree').checked;

    // Проверки
    if (!email.includes('@') || email.length < 5) {
        alert("Пожалуйста, введите корректный Email, чтобы получить чек и материалы.");
        return;
    }

    if (!isAgreed) {
        alert("Для продолжения необходимо принять условия оферты (поставьте галочку).");
        return;
    }

function showReceiptModal(tgUrl) {
    const modal = document.getElementById('receipt-modal');
    const okBtn = document.getElementById('receipt-ok-btn');
    const cancelBtn = document.getElementById('receipt-cancel-btn');

    // Если вдруг модалки нет (на всякий случай) — вернемся к confirm
    if (!modal || !okBtn) {
        if (confirm('Спасибо! После оплаты нажмите ОК, чтобы отправить чек в Telegram.')) {
            window.location.href = tgUrl;
        }
        return;
    }

    modal.style.display = 'flex';

    okBtn.onclick = function () {
        modal.style.display = 'none';
        window.location.href = tgUrl;
    };

    if (cancelBtn) {
        cancelBtn.onclick = function () {
            modal.style.display = 'none';
        };
    }
}

function closeReceiptModal() {
    const modal = document.getElementById('receipt-modal');
    if (modal) modal.style.display = 'none';
}
    // Если всё ок — идем платить
    window.open(currentPaymentLink, '_blank');
    
    // Закрываем окно
    closePaymentModal();

    // Запускаем сценарий "Отправь чек"
    const telegramUsername = "zoya_viik";
    const text = `Здравствуйте, Зоя! Я оплатил(а) услугу «${currentServiceName}». Мой Email: ${email}. Отправляю чек.`;
    const tgUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(text)}`;

    setTimeout(() => {
    showReceiptModal(tgUrl);
}, 3000);
});

function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
}

function openOfferText() {
    document.getElementById('offer-text-modal').style.display = 'flex';
}


/* ============================================
   НАВИГАЦИЯ МЕЖДУ СЕКЦИЯМИ
   ============================================ */
function showSection(id) {
    // Сначала плавно скрываем все секции
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transition = 'opacity 0.3s ease';
    });

    // Через короткую задержку переключаем видимость
    setTimeout(() => {
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        const activeSection = document.getElementById(id);
        if (activeSection) {
            activeSection.classList.add('active');
            activeSection.style.display = 'block';
            // Принудительно вызываем перерисовку, затем делаем видимым
            activeSection.offsetHeight; // reflow
            activeSection.style.opacity = '1';
        }
        // Обновляем кнопки меню
        document.querySelectorAll('.nav-links button').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById('btn-' + id);
        if (activeBtn) activeBtn.classList.add('active');
        const section = document.getElementById(id);
if (section) {
    const top = section.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({ top: top, behavior: 'smooth' });
}
    }, 300);
    if (premiumAccess) updateUIForPremium();
}

/* ============================================
   ТАБЛИЦА ЧИСЛОВЫХ ЗНАЧЕНИЙ БУКВ
   ============================================ */
const letterValues = {
    'а': 1, 'б': 2, 'в': 3, 'г': 4, 'д': 5, 'е': 6, 'ё': 7, 'ж': 8, 'з': 9,
    'и': 1, 'й': 2, 'к': 3, 'л': 4, 'м': 5, 'н': 6, 'о': 7, 'п': 8, 'р': 9,
    'с': 1, 'т': 2, 'у': 3, 'ф': 4, 'х': 5, 'ц': 6, 'ч': 7, 'ш': 8, 'щ': 9,
    'ъ': 1, 'ы': 2, 'ь': 3, 'э': 4, 'ю': 5, 'я': 6,
    'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
    'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
    's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
};

/* ============================================
   РАСЧЁТ ЧИСЛА ИМЕНИ
   ============================================ */
function calculateNameNumber(name) {
    if (!name || typeof name !== 'string') return 0;
    const cleanName = name.toLowerCase().replace(/[^а-яёa-z]/g, '');
    let sum = 0;
    for (let char of cleanName) {
        if (letterValues[char]) {
            sum += letterValues[char];
        }
    }
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((a, b) => +a + +b, 0);
    }
    return sum;

}

/* ============================================
   ТРАКТОВКА ЧИСЛА ИМЕНИ
   ============================================ */
function getNameMeaning(num, name) {
	const safeName = escapeHTML(name);
    const meanings = {
        1: `<strong>${safeName}</strong>, ваше имя несёт вибрацию числа <em>1 — Лидер и Первопроходец</em>. Это энергия независимости, амбиций и силы воли. Вы рождены быть первым, прокладывать новые пути там, где другие боятся ступить. Ваше имя программирует вас на самостоятельность и решительность. Люди с числом имени 1 часто становятся руководителями, предпринимателями, новаторами. Вам сложно быть на вторых ролях — душа требует реализации через собственные проекты и идеи. <strong>Совет:</strong> учитесь делегировать и слышать других, чтобы ваша сила не превращалась в упрямство.`,
        
        2: `<strong>${safeName}</strong>, ваше имя вибрирует на частоте числа <em>2 — Дипломат и Миротворец</em>. Это энергия партнёрства, сотрудничества и интуиции. Вы — природный медиатор, способный видеть обе стороны любого конфликта. Ваша сила в мягкости и умении находить компромиссы. Число 2 даёт глубокую эмпатию и способность чувствовать настроение окружающих на тонком уровне. Вы прирождённый психолог и советник. <strong>Совет:</strong> не растворяйтесь полностью в других — сохраняйте границы своей личности, иначе рискуете потерять себя.`,
        
        3: `<strong>${safeName}</strong>, ваше имя резонирует с числом <em>3 — Творец и Вдохновитель</em>. Это вибрация радости, самовыражения и креативности. Вы — солнечный человек, способный зажигать других своим энтузиазмом. Искусство, слово, коммуникация — ваши стихии. Люди тянутся к вам за позитивом и вдохновением. Число 3 дарит артистизм, остроумие и способность превращать обыденное в праздник. <strong>Совет:</strong> избегайте поверхностности и распыления энергии — концентрируйтесь на главном, чтобы ваши таланты принесли реальные плоды.`,
        
        4: `<strong>${safeName}</strong>, ваше имя несёт энергию числа <em>4 — Строитель и Фундамент</em>. Это вибрация стабильности, порядка и практичности. Вы — человек системы, способный превращать хаос в структуру. На вас можно положиться как на скалу. Число 4 даёт терпение, трудолюбие и способность доводить дела до конца. Вы строите не воздушные замки, а реальные достижения, которые переживут века. <strong>Совет:</strong> не становитесь рабом рутины — оставляйте место для спонтанности и гибкости, иначе жизнь превратится в бесконечный список дел.`,
        
        5: `<strong>${safeName}</strong>, ваше имя вибрирует на частоте числа <em>5 — Путешественник и Искатель Свободы</em>. Это энергия перемен, приключений и многогранности. Вы — вечный студент жизни, которому скучно в рамках и ограничениях. Ваша душа жаждет нового опыта, путешествий, знаний. Число 5 даёт адаптивность, харизму и магнетизм. Вы легко находите общий язык с любым человеком. <strong>Совет:</strong> учитесь завершать начатое — ваша любовь к новизне может превратить жизнь в коллекцию незаконченных проектов.`,
        
        6: `<strong>${safeName}</strong>, ваше имя резонирует с числом <em>6 — Хранитель Очага и Целитель</em>. Это вибрация любви, заботы и ответственности. Вы — душа семьи и коллектива, создающая атмосферу тепла и гармонии вокруг себя. Число 6 даёт глубокое чувство справедливости и желание помогать. Вы прирождённый родитель, учитель, врач — тот, кто исцеляет словом и присутствием. <strong>Совет:</strong> помните о собственных потребностях — в стремлении спасти всех вы можете забыть о себе и выгореть.`,
        
        7: `<strong>${safeName}</strong>, ваше имя несёт вибрацию числа <em>7 — Мыслитель и Искатель Истины</em>. Это энергия глубины, анализа и духовного поиска. Вы — философ, которому недостаточно поверхностных ответов. Ваш ум проникает в суть вещей. Число 7 даёт интуицию, граничащую с ясновидением, и способность видеть скрытое. Вы нуждаетесь в уединении для подзарядки и размышлений. <strong>Совет:</strong> не замыкайтесь в башне из слоновой кости — делитесь своей мудростью с миром, иначе она превратится в бесплодное умствование.`,
        
        8: `<strong>${safeName}</strong>, ваше имя вибрирует на частоте числа <em>8 — Властелин и Магнат</em>. Это энергия материального успеха, власти и изобилия. Вы рождены управлять ресурсами — финансовыми, человеческими, энергетическими. Число 8 — это бесконечность, стоящая вертикально, символ кармического баланса «отдал — получил». Вы способны создавать империи и оставлять наследие. <strong>Совет:</strong> помните о законе равновесия — чем больше получаете, тем больше нужно отдавать. Жадность разрушает всё, что вы создаёте.`,
        
        9: `<strong>${safeName}</strong>, ваше имя резонирует с числом <em>9 — Мудрец и Гуманист</em>. Это вибрация завершения цикла, вселенской любви и служения человечеству. Вы — старая душа, прошедшая долгий путь развития. Число 9 даёт широту взглядов, сострадание и способность видеть общую картину. Вы здесь, чтобы делиться накопленной мудростью и помогать другим пройти их путь. <strong>Совет:</strong> учитесь отпускать — число 9 связано с завершениями, и попытки удержать уходящее причиняют боль.`,
        
        11: `<strong>${safeName}</strong>, ваше имя несёт редкую вибрацию мастер-числа <em>11 — Просветлённый Визионер</em>. Это число духовного озарения и высшей интуиции. Вы — канал между мирами, способный улавливать тонкие энергии и транслировать их в материальный мир. Число 11 даёт дар вдохновлять массы, но требует работы над нервной системой. Вы чувствуете больше, чем другие, и это может быть как даром, так и бременем. <strong>Совет:</strong> заземляйтесь через практику и физическую активность — иначе высокие вибрации могут дестабилизировать психику.`,
        
        22: `<strong>${safeName}</strong>, ваше имя резонирует с мастер-числом <em>22 — Мастер-Строитель</em>. Это самое могущественное число в нумерологии, соединяющее духовное видение (11) с практическим воплощением (4). Вы способны материализовывать грандиозные замыслы и создавать проекты, влияющие на судьбы миллионов. Число 22 — это архитектор новой реальности. <strong>Совет:</strong> не бойтесь масштаба своих идей, но помните — великая сила требует великой ответственности. Работайте над своим эго.`,
        
        33: `<strong>${safeName}</strong>, ваше имя несёт высочайшую вибрацию мастер-числа <em>33 — Учитель Учителей</em>. Это число вселенской любви и духовного служения на самом высоком уровне. Вы пришли в этот мир, чтобы исцелять, просвещать и поднимать сознание человечества. Число 33 — это путь бескорыстного служения и жертвенной любви. <strong>Совет:</strong> берегите свою энергию — вы склонны отдавать всё без остатка. Помните, что пустой сосуд не может наполнить другие.`
    };
    return meanings[num] || `Число вашего имени: ${num}`;
}

/* ============================================
   РАСЧЁТ МАТРИЦЫ ПИФАГОРА
   ============================================ */

// ==========================================================
// ОПРЕДЕЛЕНИЕ УРОВНЯ ДЛЯ СИНТЕЗА (low/medium/high)
// ==========================================================
function getLevel(value, type = 'cell') {
    if (type === 'cell') {
        // Для ячеек 1-9: 0-1 = low, 2-3 = medium, 4+ = high
        if (value <= 1) return 'low';
        if (value >= 4) return 'high';
        return 'medium';
    } else {
        // Для сумм (goal, family, habits, self, life, talent, spirit, temp)
        // Обычно значения от 0 до 8-9
        if (value <= 2) return 'low';
        if (value >= 6) return 'high';
        return 'medium';
    }
}


function calculateMatrixData(dateString) {
    const p = dateString.split('-');
    const d = p[2];
    const m = p[1];
    const y = p[0];
    const f = d + m + y;
    
    let n1 = 0;
    for(let c of f) n1 += parseInt(c);
    
    let n2 = 0;
    for(let c of n1.toString()) n2 += parseInt(c);
    
    let n3 = n1 - (2 * (d[0] === '0' ? parseInt(d[1]) : parseInt(d[0])));
    
    let n4 = 0;
    for(let c of Math.abs(n3).toString()) n4 += parseInt(c);
    
    // --- ЛОГИКА МАСТЕР-ЧИСЕЛ ---
    let lp = n1;
    let master = null;

    // Проверяем, является ли первая сумма мастер-числом (11, 22, 33)
    if (lp === 11 || lp === 22 || lp === 33) {
        master = lp;
    }

    // Сокращаем до однозначного для базового числа (lp)
    while (lp > 9) {
        lp = lp.toString().split('').reduce((a, b) => +a + (+b), 0);
        // Если в процессе сокращения получили мастер-число, запоминаем его
        if (!master && (lp === 11 || lp === 22 || lp === 33)) {
            master = lp;
        }
    }
    
    // Если в итоге lp — это база мастер-числа, а само мастер-число мы нашли
    // Например, если lp стала 6, а master был 33, мы их выведем вместе позже
    // ---------------------------

    const all = f + n1 + n2 + Math.abs(n3) + n4;
    const c = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0};
    
    for(let x of all) {
        if(c[x] !== undefined) c[x]++;
    }
    
    return {
        c: c,
        lp: lp,
        master: master, // ДОБАВИЛИ ЭТУ СТРОКУ, чтобы передать мастер-число дальше
        work: `${n1}, ${n2}, ${n3}, ${n4}`,
        goal: c[1] + c[4] + c[7],
        family: c[2] + c[5] + c[8],
        habits: c[3] + c[6] + c[9],
        self: c[1] + c[2] + c[3],
        life: c[4] + c[5] + c[6],
        talent: c[7] + c[8] + c[9],
        spirit: c[1] + c[5] + c[9],
        temp: c[3] + c[5] + c[7]
    };
}
/* ============================================
   ГЕНЕРАЦИЯ HTML ДЛЯ МИНИ-МАТРИЦЫ
   ============================================ */
function renderMatrixHTML(data, title, name) {
    const getS = (n) => {
        let s = "";
        for(let k = 0; k < data.c[n]; k++) s += n;
        return s || "—";
    };
    
    return `
    <div class="compat-matrix-single">
        <h5>${title}${name ? ': ' + escapeHTML(name) : ''}</h5>
        <div class="matrix-grid matrix-compact" style="margin-top:0;">
            <div class="matrix-cell"><span class="cell-title">Характер</span><span class="cell-value">${getS(1)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Здоровье</span><span class="cell-value">${getS(4)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Удача</span><span class="cell-value">${getS(7)}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Цель</span><span class="cell-value">${data.goal}</span></div>
            <div class="matrix-cell"><span class="cell-title">Энергия</span><span class="cell-value">${getS(2)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Логика</span><span class="cell-value">${getS(5)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Долг</span><span class="cell-value">${getS(8)}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Семья</span><span class="cell-value">${data.family}</span></div>
            <div class="matrix-cell"><span class="cell-title">Интерес</span><span class="cell-value">${getS(3)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Труд</span><span class="cell-value">${getS(6)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Память</span><span class="cell-value">${getS(9)}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Привычки</span><span class="cell-value">${data.habits}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Самооценка</span><span class="cell-value">${data.self}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Быт</span><span class="cell-value">${data.life}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Талант</span><span class="cell-value">${data.talent}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Дух</span><span class="cell-value">${data.spirit}</span></div>
            <div class="matrix-cell temp"><span class="cell-title">Темперамент</span><span class="cell-value">${data.temp}</span></div>
        </div>
    </div>`;
}

/* ============================================
   УНИВЕРСАЛЬНАЯ МАГИЧЕСКАЯ АНИМАЦИЯ
   ============================================ */
let magicIntervals = {};

function startMagicAnimation(id, maxNum = 9) {
    const el = document.getElementById(id);
    if (!el) return;
    
    // Символы: цифры 1-9 + руны
    const symbols = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '✧', '☆', '∞'];
    
    if (magicIntervals[id]) clearInterval(magicIntervals[id]);
    
    let index = 0;
    magicIntervals[id] = setInterval(() => {
        el.textContent = symbols[index % symbols.length];
        index++;
    }, 100);
}

function stopMagicAnimation(id) {
    if (magicIntervals[id]) {
        clearInterval(magicIntervals[id]);
        delete magicIntervals[id];
    }
}

/* ============================================
   МОДАЛЬНЫЕ ОКНА
   ============================================ */
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

window.onclick = e => {
    if(e.target.classList.contains('modal')) closeModals();
};


/* ============================================
   РАСЧЁТ СОВМЕСТИМОСТИ ПАРТНЁРОВ (PRO)
   ============================================ */
// Совместимость загружается лениво
function calculateCompat() {
    if (window._compatLoaded) {
        calculateCompatReal();
    } else {
        // Загружаем модуль и выполняем расчёт
        const script = document.createElement('script');
        script.src = 'js/compatibility.js';
        script.onload = function() {
            window._compatLoaded = true;
            calculateCompatReal();
        };
        document.head.appendChild(script);
    }
}

/* ============================================
   РАСЧЁТ МАТРИЦЫ (ГЛАВНАЯ ФУНКЦИЯ)
   ============================================ */
function calculateMatrix() {
    const inp = document.getElementById('birthDateMatrix').value;
    const userName = document.getElementById('userName').value.trim();
    
    if(!inp) return alert("Введите дату рождения!");
    if(!userName) return alert("Введите ваше имя!");
    
    document.getElementById('matrix-result').style.opacity = '0';
    document.getElementById('matrix-stats').style.opacity = '0';
    document.getElementById('name-block').style.opacity = '0';
    document.getElementById('matrix-result').style.display = 'none';
    document.getElementById('decoding-block').style.display = 'none';
    document.getElementById('name-block').style.display = 'none';
    document.getElementById('loader-matrix').style.display = 'flex';
    startMagicAnimation('magic-numbers');
    
    setTimeout(() => {
        const data = calculateMatrixData(inp);
        const nameNum = calculateNameNumber(userName);
        
        // Сохраняем данные для PDF-генерации
        window.lastMatrixData = data;
        window.lastUserName = userName;
        window.lastNameNum = nameNum;
        
        const nameGreeting = document.getElementById('name-greeting');
        if (nameGreeting) {
            nameGreeting.innerHTML = '';
            nameGreeting.appendChild(document.createTextNode('Приветствую, '));
            const strong = document.createElement('strong');
            strong.textContent = userName;
            nameGreeting.appendChild(strong);
            nameGreeting.appendChild(document.createTextNode('!'));
        }
        document.getElementById('name-number-display').innerText = nameNum;
        document.getElementById('name-meaning').innerHTML = getNameMeaning(nameNum, userName);
        document.getElementById('name-block').style.display = 'block';
        setTimeout(() => document.getElementById('name-block').style.opacity = '1', 50);
        
        document.getElementById('work-nums').innerText = data.work;
        const lpOutput = document.getElementById('life-path-matrix');
        if (lpOutput) {
            if (data.master) {
                lpOutput.innerHTML = `${data.lp} <span class="master-badge" onclick="showMasterInfo(${data.master})" style="display:inline-block; margin-left:10px; cursor:pointer;">(${data.master})</span>`;
            } else {
                lpOutput.innerText = data.lp;
            }
        }
        document.getElementById('name-num-display').innerText = nameNum;
        
        const getS = (n) => {
            let s = "";
            for(let k = 0; k < data.c[n]; k++) s += n;
            return s || "—";
        };
        
        for(let i = 1; i <= 9; i++) {
            document.getElementById('cell-' + i).innerText = getS(i);
        }
        
        document.getElementById('res-goal').innerText = data.goal;
        document.getElementById('res-family').innerText = data.family;
        document.getElementById('res-habits').innerText = data.habits;
        document.getElementById('res-self').innerText = data.self;
        document.getElementById('res-life').innerText = data.life;
        document.getElementById('res-talent').innerText = data.talent;
        document.getElementById('res-spirit').innerText = data.spirit;
        document.getElementById('res-temp').innerText = data.temp;
        
        let html = "";
        const add = (t, v, txt) => `<div class="decode-card"><div class="decode-header"><span class="decode-title">${t}</span><span class="decode-count">${v}</span></div><div class="decode-text">${txt}</div></div>`;
        const c = data.c;
        
       // Характер
if (cellTexts[1] && cellTexts[1][c[1]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Характер (Воля)</span>
            <span class="decode-count">${c[1]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[1][c[1]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[1] < 2) fallback = `<strong>${userName}</strong>, ваш характер отличается мягкостью и утонченностью...`;
    else if(c[1] === 2) fallback = `<strong>${userName}</strong>, у вас гармоничный, уравновешенный характер...`;
    else if(c[1] === 3) fallback = `<strong>${userName}</strong>, вы обладаете «золотой серединой» характера...`;
    else if(c[1] === 4) fallback = `<strong>${userName}</strong>, в вас живёт прирождённый лидер...`;
    else fallback = `<strong>${userName}</strong>, в вас заключена энергия абсолютной власти...`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Характер (Воля)</span>
            <span class="decode-count">${c[1]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}
        
       // 2. Энергия
if (cellTexts[2] && cellTexts[2][c[2]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Энергия (Аура)</span>
            <span class="decode-count">${c[2]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[2][c[2]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[2] < 2) fallback = `<strong>${userName}</strong>, ваш энергетический потенциал требует бережного отношения...`;
    else if(c[2] === 2) fallback = `<strong>${userName}</strong>, у вас оптимальный баланс энергии...`;
    else fallback = `<strong>${userName}</strong>, вы — мощный донор энергии, человек-батарейка...`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Энергия (Аура)</span>
            <span class="decode-count">${c[2]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}
        
       // 3. Интерес
if (cellTexts[3] && cellTexts[3][c[3]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Интерес (Познание)</span>
            <span class="decode-count">${c[3]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[3][c[3]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[3] === 0) fallback = `<strong>${userName}</strong>, у вас творческий, гуманитарный склад ума...`;
    else if(c[3] === 1) fallback = `<strong>${userName}</strong>, вы — человек настроения и универсал...`;
    else fallback = `<strong>${userName}</strong>, вы обладаете выраженным аналитическим складом ума...`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Интерес (Познание)</span>
            <span class="decode-count">${c[3]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}
        
       // 4. Здоровье
if (cellTexts[4] && cellTexts[4][c[4]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Здоровье (Тело)</span>
            <span class="decode-count">${c[4]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[4][c[4]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[4] === 0) fallback = `<strong>${userName}</strong>, ваше здоровье требует особого внимания. <em>На практике:</em> избегайте экстремальных нагрузок, следите за психосоматикой. <strong>Важно:</strong> регулярные обследования, профилактика, качественный сон.`;
    else fallback = `<strong>${userName}</strong>, вы наделены крепким физическим телом. Ваш организм вынослив и способен переносить серьёзные нагрузки. <em>Предупреждение:</em> не испытывайте организм на прочность зря.`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Здоровье (Тело)</span>
            <span class="decode-count">${c[4]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}
        
         // 5. Логика
if (cellTexts[5] && cellTexts[5][c[5]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Логика (Интуиция)</span>
            <span class="decode-count">${c[5]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[5][c[5]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[5] === 0) fallback = `<strong>${userName}</strong>, вы — мечтатель и творец, живущий в мире интуиции. Вы чувствуете правильный ответ, а не вычисляете его. <strong>Совет:</strong> доверяйте внутреннему голосу, но проверяйте важные решения с «логичными» людьми.`;
    else if(c[5] === 1) fallback = `<strong>${userName}</strong>, у вас хорошая логика. Вы умеете планировать и видеть причинно-следственные связи. <em>Нюанс:</em> в стрессе логика может «отключаться». <strong>Совет:</strong> сначала успокойтесь, потом решайте.`;
    else fallback = `<strong>${userName}</strong>, вы обладаете мощнейшей интуицией, граничащей с ясновидением. Вы стратег, видящий на много ходов вперёд. <strong>Предупреждение:</strong> не игнорируйте свою интуицию.`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Логика (Интуиция)</span>
            <span class="decode-count">${c[5]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}
        
         // 6. Труд
if (cellTexts[6] && cellTexts[6][c[6]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Труд (Мастерство)</span>
            <span class="decode-count">${c[6]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[6][c[6]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[6] === 0) fallback = `<strong>${userName}</strong>, вы — человек интеллектуального труда или духовной практики. Физическая рутина разрушает вас изнутри. <em>Ваша стихия:</em> работа с идеями, людьми, смыслами. <strong>Рекомендация:</strong> делегируйте рутину.`;
    else fallback = `<strong>${userName}</strong>, у вас «золотые руки». Вы способны создавать что-то осязаемое: рукоделие, техника, кулинария. <em>Ваш дар:</em> умение превращать идеи в реальные вещи.`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Труд (Мастерство)</span>
            <span class="decode-count">${c[6]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}

        
        // 7. Удача
if (cellTexts[7] && cellTexts[7][c[7]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Удача (Везение)</span>
            <span class="decode-count">${c[7]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[7][c[7]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[7] === 0) fallback = `<strong>${userName}</strong>, отсутствие семёрок — знак свободной воли. Удача для вас — результат личных усилий. <em>Что это означает:</em> вы получаете ровно столько, сколько вкладываете. <strong>Преимущество:</strong> вы — хозяин своей судьбы.`;
    else fallback = `<strong>${userName}</strong>, семёрки в матрице — печать Ангела-Хранителя. Мир заботится о вас особым образом. <em>Ваш дар:</em> интуитивное чувство «правильного пути». <strong>Рекомендация:</strong> доверяйте вселенной.`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Удача (Везение)</span>
            <span class="decode-count">${c[7]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}
        
        // 8. Долг
if (cellTexts[8] && cellTexts[8][c[8]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Долг (Ответственность)</span>
            <span class="decode-count">${c[8]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[8][c[8]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[8] === 0) fallback = `<strong>${userName}</strong>, отсутствие восьмёрок — свобода от внешних обязательств. Вы не любите быть обязанным и живёте по своим правилам. <em>Философия:</em> «я никому не должен, но и мне не должны».`;
    else fallback = `<strong>${userName}</strong>, восьмёрки говорят о высокой ответственности. Вы надёжны как скала. <em>Теневая сторона:</em> можете забывать о себе ради других. <strong>Рекомендация:</strong> забота о себе — тоже обязанность.`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Долг (Ответственность)</span>
            <span class="decode-count">${c[8]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}
        
       // 9. Память
if (cellTexts[9] && cellTexts[9][c[9]] !== undefined) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Память (Ум)</span>
            <span class="decode-count">${c[9]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text"><strong>${userName}</strong>, ${cellTexts[9][c[9]]}</div>
    </details>`;
} else {
    let fallback = "";
    if(c[9] === 0 || c[9] === 1) fallback = `<strong>${userName}</strong>, у вас избирательная память — «важное помню, остальное отсеиваю». <strong>Рекомендация:</strong> ведите записи и используйте напоминалки.`;
    else if(c[9] === 2) fallback = `<strong>${userName}</strong>, у вас светлая голова и отличная обучаемость. Вы легко усваиваете новое и можете стать экспертом в любой области. <strong>Потенциал:</strong> интеллектуальные профессии, наука.`;
    else fallback = `<strong>${userName}</strong>, вы обладаете феноменальной памятью. Вы помните практически всё. <em>Особенность:</em> способность к предвидению. <strong>Теневая сторона:</strong> сложнее забывать обиды.`;
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Память (Ум)</span>
            <span class="decode-count">${c[9]}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${fallback}</div>
    </details>`;
}
        
            // Расшифровки итоговых строк матрицы
        const rowGoalValue = getRowValue(data.goal);
        const rowFamilyValue = getRowValue(data.family);
        const rowHabitsValue = getRowValue(data.habits);
        const rowSelfValue = getRowValue(data.self);
        const rowLifeValue = getRowValue(data.life);
        const rowTalentValue = getRowValue(data.talent);
        const rowSpiritValue = getRowValue(data.spirit);
        const rowTempValue = getRowValue(data.temp);

// Добавляем блоки для каждой строки (пока только "Цель", остальные добавим позже)
       
if (rowTexts["Цель"] && rowTexts["Цель"][rowGoalValue]) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Цель (Целеустремлённость)</span>
            <span class="decode-count">${data.goal}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${rowTexts["Цель"][rowGoalValue]}</div>
    </details>`;
}
       // Семья
if (rowTexts["Семья"] && rowTexts["Семья"][rowFamilyValue]) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Семья (Отношения с близкими)</span>
            <span class="decode-count">${data.family}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${rowTexts["Семья"][rowFamilyValue]}</div>
    </details>`;
}
        
       // Привычки
if (rowTexts["Привычки"] && rowTexts["Привычки"][rowHabitsValue]) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Привычки (Бытовые паттерны)</span>
            <span class="decode-count">${data.habits}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${rowTexts["Привычки"][rowHabitsValue]}</div>
    </details>`;
}
        
          // Самооценка
if (rowTexts["Самооценка"] && rowTexts["Самооценка"][rowSelfValue]) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Самооценка (Отношение к себе)</span>
            <span class="decode-count">${data.self}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${rowTexts["Самооценка"][rowSelfValue]}</div>
    </details>`;
}
        
         // Быт
if (rowTexts["Быт"] && rowTexts["Быт"][rowLifeValue]) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Быт (Домашняя атмосфера)</span>
            <span class="decode-count">${data.life}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${rowTexts["Быт"][rowLifeValue]}</div>
    </details>`;
}
        
       // Талант
if (rowTexts["Талант"] && rowTexts["Талант"][rowTalentValue]) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Талант (Природные способности)</span>
            <span class="decode-count">${data.talent}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${rowTexts["Талант"][rowTalentValue]}</div>
    </details>`;
}
        
        
       // Темперамент
if (rowTexts["Темперамент"] && rowTexts["Темперамент"][rowTempValue]) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Темперамент (Тип нервной системы)</span>
            <span class="decode-count">${data.temp}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${rowTexts["Темперамент"][rowTempValue]}</div>
    </details>`;
}
        
        
       // Дух
if (rowTexts["Дух"] && rowTexts["Дух"][rowSpiritValue]) {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">Дух (Внутренняя сила)</span>
            <span class="decode-count">${data.spirit}</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${rowTexts["Дух"][rowSpiritValue]}</div>
    </details>`;
}
            
     
        // Блоки по квадрату Пифагора (только по цифрам)
        const { blindHtml: pythagorasBlind, growthHtml: pythagorasGrowth } = getBlindSpotsAndGrowthPoints(data.c);

        // Блоки по числу судьбы (включая мастер-числа 11,22,33)
        const lifePathKey = data.master || data.lp;  // если есть мастер-число, берём его, иначе базовое
const { blindHtml: destinyBlind, growthHtml: destinyGrowth } = getLifePathAdvice(lifePathKey);

        // Добавляем оба блока в общий HTML
        html = html + pythagorasBlind + pythagorasGrowth + destinyBlind + destinyGrowth;
       
        // Собираем содержимое для блока «Взаимосвязи»
let interconnectionsContent = '';
interconnectionsContent += getCompensationsHTML(c, data);
interconnectionsContent += getConflictsHTML(c, data);
interconnectionsContent += getAmplificationsHTML(c, data);
interconnectionsContent += getCriticalCombosHTML(c, data);

// Если есть хоть одна взаимосвязь – добавляем весь блок
if (interconnectionsContent.trim() !== '') {
    html += `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">🔗 Взаимосвязи между ячейками</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">
            <p><em>Квадрат Пифагора — это не набор отдельных качеств, а живая система, где каждый элемент влияет на другие. Понимание взаимосвязей позволяет увидеть целостную картину личности, объяснить внутренние конфликты и найти скрытые ресурсы.</em></p>
            ${interconnectionsContent}
        </div>
    </details>`;
}
        
                       // ===== СИНТЕЗ: ИНТЕГРАЛЬНЫЙ ПОРТРЕТ (ВСЕ 11 КОМБИНАЦИЙ) =====
        const levels = {
            c1: getLevel(c[1], 'cell'),
            c2: getLevel(c[2], 'cell'),
            c3: getLevel(c[3], 'cell'),
            c4: getLevel(c[4], 'cell'),
            c5: getLevel(c[5], 'cell'),
            c6: getLevel(c[6], 'cell'),
            c7: getLevel(c[7], 'cell'),
            c8: getLevel(c[8], 'cell'),
            c9: getLevel(c[9], 'cell'),
            goal: getLevel(data.goal, 'sum'),
            family: getLevel(data.family, 'sum'),
            temp: getLevel(data.temp, 'sum'),
            self: getLevel(data.self, 'sum'),
            spirit: getLevel(data.spirit, 'sum')
        };

        const combos = [
            { key: `1_${levels.c1}_2_${levels.c2}`, name: 'Характер + Энергия' },
            { key: `5_${levels.c5}_3_${levels.c3}`, name: 'Логика + Интерес' },
            { key: `4_${levels.c4}_2_${levels.c2}`, name: 'Здоровье + Энергия' },
            { key: `8_${levels.c8}_6_${levels.c6}`, name: 'Долг + Труд' },
            { key: `7_${levels.c7}_goal_${levels.goal}`, name: 'Удача + Цель' },
            { key: `temp_${levels.temp}_fam_${levels.family}`, name: 'Темперамент + Семья' },
            { key: `self_${levels.self}_spirit_${levels.spirit}`, name: 'Самооценка + Дух' },
            { key: `9_${levels.c9}_3_${levels.c3}`, name: 'Память + Интерес' },
            { key: `4_${levels.c4}_6_${levels.c6}`, name: 'Здоровье + Труд' },
            { key: `7_${levels.c7}_8_${levels.c8}`, name: 'Удача + Долг' },
            { key: `temp_${levels.temp}_self_${levels.self}`, name: 'Темперамент + Самооценка' }
        ];

        const synthesisItems = [];
        for (let combo of combos) {
            if (typeof pythagorasSynthesis !== 'undefined' && pythagorasSynthesis[combo.key]) {
                const synData = pythagorasSynthesis[combo.key];
                synthesisItems.push({
                    name: combo.name,
                    title: synData.title,
                    portrait: synData.portrait,
                    strengths: synData.strengths,
                    weaknesses: synData.weaknesses,
                    advice: synData.advice,
                    danger: synData.danger
                });
            }
        }

        if (synthesisItems.length > 0) {
            html += `<details class="decode-card">
                <summary class="decode-header" style="cursor: pointer; list-style: none;">
                    <span class="decode-title">🧩 Интегральный портрет (синтез качеств)</span>
                    <span style="float: right;">▼</span>
                </summary>
                <div class="decode-text" style="padding: 0;">`;
            
            for (let item of synthesisItems) {
                html += `
                    <div style="margin-bottom: 25px; border-bottom: 1px solid rgba(212,175,55,0.2); padding-bottom: 20px;">
                        <h4 style="color: var(--gold); margin: 0 0 5px 0;">${item.name}: ${item.title}</h4>
                        <p style="margin-top: 5px;"><em>${item.portrait}</em></p>
                        <p><strong>💪 Сильные стороны:</strong></p>
                        <ul>${item.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                        <p><strong>⚠️ Зоны роста:</strong></p>
                        <ul>${item.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                        <p><strong>💡 Совет:</strong> ${item.advice}</p>
                        <p><strong>🚫 Опасность:</strong> ${item.danger}</p>
                    </div>
                `;
            }
            
            html += `</div></details>`;
        }
        // ===== КОНЕЦ БЛОКА СИНТЕЗА =====
        // ===== ПЕРСОНАЛЬНЫЙ ПРОГНОЗ (ВНУТРИ ДЕКОДИНГА) =====
html += `<details class="decode-card">
    <summary class="decode-header" style="cursor: pointer; list-style: none;">
        <span class="decode-title">🔮 Ваш персональный прогноз</span>
        <span style="float: right;">▼</span>
    </summary>
    <div class="decode-text">
        ${getYearlyForecast(data, userName)}
        ${getDailyRoutine(data, userName)}
        ${getMoneyInsights(data, userName)}
        <p style="margin-top: 15px; text-align: center; font-style: italic;">✨✨✨✨✨✨✨✨✨</p>
    </div>
</details>`;
// ===== КОНЕЦ БЛОКА ПРОГНОЗА =====
        
        document.getElementById('decoding-content').innerHTML = html;
        // Показываем кнопку PDF, если есть премиум-доступ
        if (premiumAccess) {
        const pdfBtn = document.getElementById('download-pdf-btn');
        if (pdfBtn) pdfBtn.style.display = 'inline-block';
}
        setTimeout(() => applyPaywallToDecoding(), 100);
        document.getElementById('loader-matrix').style.display = 'none';
        document.getElementById('matrix-result').style.display = 'grid';
        setTimeout(() => document.getElementById('matrix-result').style.opacity = '1', 50);
        document.getElementById('matrix-stats').style.display = 'flex';
        setTimeout(() => document.getElementById('matrix-stats').style.opacity = '1', 100);
        document.getElementById('decoding-block').style.display = 'block';
        
        // Дополнительные фишки (луна, радар, счастливые числа, матрица судьбы, годовой график)
        calculateMoonPhase(inp, userName);
        drawRadarChart(data);
        calculateLuckyItems(data, nameNum, userName);
        calculateYearChart(inp);
        
        const shareBtnHtml = `
<div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
    <button onclick="shareWithImage()" class="btn-gold" style="font-size:0.9rem; padding:8px 16px;">
        <i class="fa-solid fa-share-nodes"></i> Поделиться результатом
    </button>
</div>`;
      // ===================================
                     
        let shareContainer = document.getElementById('share-btn-container');
        if (!shareContainer) {
            shareContainer = document.createElement('div');
            shareContainer.id = 'share-btn-container';
            document.getElementById('decoding-block').appendChild(shareContainer);
        }
        shareContainer.innerHTML = shareBtnHtml;
        
        stopMagicAnimation('magic-numbers');
    }, 1500);
}

/* ============================================
   ЛУННАЯ ФАЗА
   ============================================ */
function calculateMoonPhase(dateString, userName) {
    const safeUserName = escapeHTML(userName);
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const c = Math.floor(year / 100);
    const n = year - 19 * Math.floor(year / 19);
    let k = Math.floor((c - 17) / 25);
    let i = c - Math.floor(c / 4) - Math.floor((c - k) / 3) + 19 * n + 15;
    i = i - 30 * Math.floor(i / 30);
    i = i - Math.floor(i / 28) * (1 - Math.floor(i / 28) * Math.floor(29 / (i + 1)) * Math.floor((21 - n) / 11));
    let j = year + Math.floor(year / 4) + i + 2 - c + Math.floor(c / 4);
    j = j - 7 * Math.floor(j / 7);
    const l = i - j;
    const moonMonth = 3 + Math.floor((l + 40) / 44);
    const moonDay = l + 28 - 31 * Math.floor(moonMonth / 4);
    
    const lunarDay = ((day + moonDay) % 30) + 1;
    
    let phase, icon, description;
    
    if (lunarDay >= 1 && lunarDay <= 7) {
        phase = "Новолуние / Растущая Луна";
        icon = "🌑";
        description = `<strong>${safeUserName}</strong>, вы родились в период новых начинаний. 
        Вы — человек старта, инициатор, генератор идей. 
        Вам важно начинать, запускать, вдохновлять.`;
        
    } else if (lunarDay >= 8 && lunarDay <= 14) {
        phase = "Первая четверть";
        icon = "🌓";
        description = `<strong>${safeUserName}</strong>, вы родились в фазе роста. 
        Вы умеете преодолевать препятствия и усиливаться через трудности.`;
        
    } else if (lunarDay >= 15 && lunarDay <= 21) {
        phase = "Полнолуние";
        icon = "🌕";
        description = `<strong>${safeUserName}</strong>, вы родились в полнолуние. 
        Это знак сильной энергетики, харизмы и эмоциональной глубины.`;
        
    } else {
        phase = "Убывающая Луна";
        icon = "🌗";
        description = `<strong>${safeUserName}</strong>, вы родились в период завершения. 
        Вы — мудрый аналитик, человек глубины и философии.`;
    }
    
    document.getElementById('moon-phase-icon').textContent = icon;
    document.getElementById('moon-phase-name').textContent = phase + ` (${lunarDay}-й лунный день)`;
    document.getElementById('moon-description').innerHTML = description;
    
    document.getElementById('moon-block').style.display = 'block';
    setTimeout(() => document.getElementById('moon-block').style.opacity = '1', 100);
}

function drawRadarChart(data) {
    const svg = document.getElementById('radar-svg');
    if (!svg) return;

    svg.setAttribute("viewBox", "0 0 400 400");
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 150;

    const explanations = {
        1: { title: "Характер", text: "Сила воли, стержень, способность отстаивать свои границы и лидерство." },
        2: { title: "Энергия", text: "Ваш жизненный ресурс, способность действовать, общаться и влиять на других." },
        3: { title: "Интерес", text: "Тяга к знаниям, творчеству, технике. Способность быстро обучаться." },
        4: { title: "Здоровье", text: "Физическая выносливость, красота тела и природная сила." },
        5: { title: "Логика", text: "Интуиция, аналитика, умение строить планы и видеть причинно-следственные связи." },
        6: { title: "Труд", text: "Мастерство, умение работать руками, заземленность и практичность." },
        7: { title: "Удача", text: "Покровительство Высших сил, везение и интуитивное понимание пути." },
        8: { title: "Долг", text: "Чувство ответственности, забота о близких, терпимость и доброта." },
        9: { title: "Память", text: "Мудрость, интеллект, способность запоминать и предвидеть будущее." }
    };

    const params = [
        { name: 'Характер', key: 1, max: 6 },
        { name: 'Энергия', key: 2, max: 5 },
        { name: 'Интерес', key: 3, max: 4 },
        { name: 'Здоровье', key: 4, max: 4 },
        { name: 'Логика', key: 5, max: 4 },
        { name: 'Труд', key: 6, max: 4 },
        { name: 'Удача', key: 7, max: 3 },
        { name: 'Долг', key: 8, max: 3 },
        { name: 'Память', key: 9, max: 4 }
    ];

    const numParams = params.length;
    const angleStep = (2 * Math.PI) / numParams;

    svg.innerHTML = '';

    // Сетка (5 уровней)
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
        const r = (maxRadius / levels) * level;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX); circle.setAttribute('cy', centerY);
        circle.setAttribute('r', r); circle.setAttribute('class', 'radar-grid');
        svg.appendChild(circle);
    }

    // Оси
    for (let i = 0; i < numParams; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        axis.setAttribute('x1', centerX); axis.setAttribute('y1', centerY);
        axis.setAttribute('x2', x); axis.setAttribute('y2', y);
        axis.setAttribute('class', 'radar-axis');
        svg.appendChild(axis);

        const labelRadius = maxRadius + 30;
        const labelX = centerX + labelRadius * Math.cos(angle);
        const labelY = centerY + labelRadius * Math.sin(angle);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX); label.setAttribute('y', labelY);
        label.setAttribute('class', 'radar-label');
        label.textContent = params[i].name;
        svg.appendChild(label);
    }

    // Фигура
    let areaPath = '';
    const points = [];

    for (let i = 0; i < numParams; i++) {
        const angle = i * angleStep - Math.PI / 2;
        let val = data.c[params[i].key];
        let normVal = Math.min(val, params[i].max);
        if (normVal === 0) normVal = 0.1;

        const valueRatio = normVal / params[i].max;
        const r = valueRatio * maxRadius;

        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);

        points.push({ x, y, val, key: params[i].key });
        areaPath += (i === 0 ? 'M' : 'L') + `${x},${y}`;
    }
    areaPath += 'Z';

    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaPath);
    area.setAttribute('class', 'radar-area');
    svg.appendChild(area);

    // Точки с кликом
    for (let i = 0; i < points.length; i++) {
        const p = points[i];

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.style.cursor = "pointer";

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x); circle.setAttribute('cy', p.y);
        circle.setAttribute('r', '10');
        circle.setAttribute('class', 'radar-point-circle');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', p.x); text.setAttribute('y', p.y + 4);
        text.setAttribute('class', 'radar-point-value');
        text.textContent = p.val;

        g.onclick = function() {
            document.querySelectorAll('.radar-point-circle').forEach(c => {
                c.setAttribute('stroke', '#D4AF37');
                c.setAttribute('stroke-width', '3');
            });
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '5');

            const tooltip = document.getElementById('radar-tooltip');
            const tTitle = document.getElementById('radar-tooltip-title');
            const tDesc = document.getElementById('radar-tooltip-desc');
            const info = explanations[p.key];

            tTitle.innerHTML = `${info.title}: <span style="color:#fff">${p.val}</span>`;
            tDesc.innerHTML = `${info.text} <br><br><em>(Чем больше цифра, тем сильнее качество).</em>`;

            tooltip.style.display = 'block';
        };

        g.appendChild(circle);
        g.appendChild(text);
        svg.appendChild(g);
    }

    document.getElementById('radar-container').style.display = 'block';
    setTimeout(() => document.getElementById('radar-container').style.opacity = '1', 200);
}
/* ============================================
   СЧАСТЛИВЫЕ ЧИСЛА
   ============================================ */
function calculateLuckyItems(data, nameNum, userName) {
    const luckyNumber = ((nameNum + data.lp) % 9) || 9;
    
    document.getElementById('lucky-number').textContent = luckyNumber;
    document.getElementById('lucky-day').textContent = "Среда";
    document.getElementById('lucky-color').textContent = "Золотой";
    document.getElementById('lucky-stone').textContent = "Гранат";
    document.getElementById('lucky-element').textContent = "Огонь 🔥";
    document.getElementById('lucky-planet').textContent = "Солнце ☀️";
    
   const safeUserName = escapeHTML(userName);
document.getElementById('lucky-description').innerHTML =
    `<strong>${safeUserName}</strong>, ваше счастливое число — <strong>${luckyNumber}</strong>. 
    Используйте его при выборе дат и решений.`;
    
    document.getElementById('lucky-block').style.display = 'block';
    setTimeout(() => document.getElementById('lucky-block').style.opacity = '1', 300);
}
/* ============================================
   РАСЧЁТ ЧИСЛА ЖИЗНЕННОГО ПУТИ
   ============================================ */
function calculateLifePath(dateString) {
    const digits = dateString.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);

    if (sum === 11 || sum === 22 || sum === 33) {
        return { master: sum, base: sum === 11 ? 2 : (sum === 22 ? 4 : 6) };
    }

    while (sum > 9) {
        sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
        if (sum === 11 || sum === 22 || sum === 33) {
            return { master: sum, base: sum === 11 ? 2 : (sum === 22 ? 4 : 6) };
        }
    }

    return { master: null, base: sum };
}
/* ==========================================================
   ADVANCED FINANCIAL ENGINE
   Глубокий модуль анализа финансовой архетипики
   ========================================================== */

/* ---------- Определение пола ---------- */
function detectGenderAdvanced(name) {
    const lower = (name || '').toLowerCase().trim();

    const femaleEndings = ['а','я','ия','ья','ея'];
    const maleExceptions = ['никита','илья','кузьма','фома','лука','савва','данила'];

    if (maleExceptions.includes(lower)) return 'male';

    for (let ending of femaleEndings) {
        if (lower.endsWith(ending)) return 'female';
    }

    return 'unknown';
}

/* ---------- Денежная карма года ---------- */
function calculateMoneyKarma(dateString) {
    const year = parseInt(dateString.split('-')[0]);
    let sum = year.toString().split('').map(Number).reduce((a,b)=>a+b,0);

    while (sum > 9 && sum !== 11 && sum !== 22) {
        sum = sum.toString().split('').map(Number).reduce((a,b)=>a+b,0);
    }

    return sum;
}

/* ---------- Влияние матрицы на деньги ---------- */
function calculateMatrixMoneyVector(matrix) {

    let vector = 0;

    vector += matrix.c[1] * 5; // воля
    vector += matrix.c[8] * 6; // ответственность
    vector += matrix.c[4] * 4; // стабильность

    vector -= matrix.c[6] * 6; // венера
    vector -= matrix.c[2] * 4; // зависимость

    return vector;
}

/* ---------- Темперамент как фактор ---------- */
function calculateTemperamentFactor(temp) {
    if (temp >= 5) return 5;
    if (temp >= 3) return 2;
    if (temp <= 1) return -3;
    return 0;
}

/* ---------- Влияние имени ---------- */
function calculateNameMoneyInfluence(nameNum) {

    if ([1,8].includes(nameNum)) return 6;
    if ([6,2].includes(nameNum)) return -5;
    if ([4].includes(nameNum)) return 3;
    if ([7].includes(nameNum)) return -2;

    return 0;
}

/* ---------- Венерианский фактор ---------- */
function calculateVenusFactor(lifePathBase) {
    if (lifePathBase === 6) return -12;
    if (lifePathBase === 2) return -6;
    if (lifePathBase === 8) return 10;
    if (lifePathBase === 1) return 8;
    return 0;
}
/* ==========================================================
   СБОРКА ФИНАНСОВОГО ПРОФИЛЯ
   ========================================================== */

function buildFinancialProfile(dateString, name) {

    const lp = calculateLifePathAdvanced(dateString);
    const matrix = calculateMatrixData(dateString);
    const nameNum = calculateNameNumber(name);
    const karma = calculateMoneyKarma(dateString);
    const gender = detectGenderAdvanced(name);

    let score = 50;

    /* --- ЧЖП --- */
    const lpValue = lp.master || lp.base;

    if ([1,8].includes(lpValue)) score += 20;
    if ([4,22].includes(lpValue)) score += 15;
    if ([6].includes(lpValue)) score -= 18;
    if ([2,11].includes(lpValue)) score -= 8;
    if ([9].includes(lpValue)) score -= 5;

    /* --- Матрица --- */
    score += calculateMatrixMoneyVector(matrix);

    /* --- Темперамент --- */
    score += calculateTemperamentFactor(matrix.temp);

    /* --- Имя --- */
    score += calculateNameMoneyInfluence(nameNum);

    /* --- Венера --- */
    score += calculateVenusFactor(lp.base);

    /* --- Денежная карма --- */
    if ([8,22].includes(karma)) score += 8;
    if ([5].includes(karma)) score -= 4;
    if ([6].includes(karma)) score -= 6;

    score = Math.max(5, Math.min(95, score));

    return {
        index: score,
        lifePath: lp,
        matrix: matrix,
        nameNum: nameNum,
        karma: karma,
        gender: gender
    };
}

/* ==========================================================
   ГЕНЕРАЦИЯ ГЛУБОКОЙ ТРАКТОВКИ
   ========================================================== */

function generateFinancialNarrative(profile, name) {

    const lpNumber = profile.lifePath.master || profile.lifePath.base;
    // Используем безопасное получение описания
    const desc = (typeof getLifePathDescription === 'function') ?
                  getLifePathDescription(lpNumber) 
                 : (lifePathDescriptions[lpNumber] || lifePathDescriptions[1]);
                 
    const isMaster = [11, 22, 33].includes(lpNumber);

    /* ---------- ТИЗЕР (БЕСПЛАТНО) ---------- */
    const teaser = `
        <h4 style="color:var(--gold);">${desc.emoji} ${desc.title}</h4>
        <p>${desc.essence}</p>

        <div style="
            margin-top:20px;
            padding:15px;
            background:rgba(212,175,55,0.1);
            border-radius:12px;
        ">
            🔒 Полная трактовка, теневая сторона, деньги, любовь, карьера и кармические годы доступны в премиум версии.
        </div>
    `;

    // Если нет премиума — возвращаем тизер и ВЫХОДИМ
    if (typeof premiumAccess !== 'undefined' && !premiumAccess) {
        return teaser;
    }

    /* ---------- МАСТЕР-БЛОК (ТОЛЬКО ДЛЯ 11, 22, 33) ---------- */
    let masterBlock = '';

    if (isMaster) {
        masterBlock = `
        <div style="
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, rgba(155,135,245,0.2), rgba(212,175,55,0.2));
            border: 1px solid var(--gold);
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 0 20px rgba(212,175,55,0.3);
        ">
            <h3 style="color:var(--gold); margin-bottom:10px;">⚡ МАСТЕР-ЧИСЛО ${lpNumber}</h3>
            <p style="font-size:1.1rem; line-height:1.6;">
                Вы обладатель редкой и мощной вибрации. 
                Ваш путь — это путь <strong>служения и трансформации</strong>.
                Вы живёте на двух уровнях одновременно: земном и духовном.
            </p>
            <p style="margin-top:15px; font-style:italic; opacity:0.8;">
                Ваша задача — научиться управлять этой огромной энергией, 
                не разрушая себя.
            </p>
        </div>
        `;
    }

    // Определяем роль (безопасная проверка)
    let roleText = '';
    if (desc.sponsor && desc.kept) {
        roleText = profile.sponsorScore > profile.keptScore ? desc.sponsor : desc.kept;
    } else {
        roleText = "Роль определяется индивидуально.";
    }

    /* ---------- ПОЛНАЯ ВЕРСИЯ (ЕДИНЫЙ ВОЗВРАТ) ---------- */
    return `
        ${masterBlock}

        <h4 style="color:var(--gold);">${desc.emoji} ${desc.title}</h4>

        <p>${desc.essence}</p>

        <h4 style="color:var(--purple-light); margin-top:20px;">Сильные стороны</h4>
        <ul>
            ${desc.strengths ? desc.strengths.map(s => `<li>${s}</li>`).join('') : ''}
        </ul>

        <h4 style="color:var(--purple-light); margin-top:20px;">Теневая сторона</h4>
        <ul>
            ${desc.shadow ? desc.shadow.map(s => `<li>${s}</li>`).join('') : ''}
        </ul>

        <h4 style="color:var(--purple-light); margin-top:20px;">Любовь</h4>
        <p>${desc.love}</p>

        <h4 style="color:var(--purple-light); margin-top:20px;">Деньги</h4>
        <p>${desc.money}</p>

        <h4 style="color:var(--purple-light); margin-top:20px;">Карьера</h4>
        <p>${desc.career}</p>

        <h4 style="color:var(--gold); margin-top:25px;">Ролевая модель</h4>
        <p>${roleText}</p>

        <h4 style="color:var(--purple-light); margin-top:20px;">Кармический урок</h4>
        <p>${desc.advice}</p>

        <h4 style="color:var(--purple-light); margin-top:20px;">Ключевые годы</h4>
        <p>${desc.years}</p>
    `;
}

/* ============================================
   ИНДЕКС СПОНСОР / СОДЕРЖАНКА
   ============================================ */
function calculateSponsorIndex(dateString, name) {

    const lifePath = calculateLifePath(dateString);
    const birthDay = parseInt(dateString.split('-')[2], 10);
    const nameNum = calculateNameNumber(name);

    const sponsorNumbers = {
        1: 85,
        8: 90,
        4: 70,
        22: 80,
        3: 45,
        5: 50,
        7: 40,
        9: 35,
        2: 30,
        11: 35,
        6: 25,
        33: 30
    };

    let sponsorIndex = sponsorNumbers[lifePath.master] || sponsorNumbers[lifePath.base] || 50;

    if ([1, 10, 19, 28].includes(birthDay)) sponsorIndex += 10;
    if ([8, 17, 26].includes(birthDay)) sponsorIndex += 15;
    if ([6, 15, 24].includes(birthDay)) sponsorIndex -= 10;

    if ([1, 8].includes(nameNum)) sponsorIndex += 5;
    if ([6, 2].includes(nameNum)) sponsorIndex -= 5;

    sponsorIndex = Math.max(5, Math.min(95, sponsorIndex));

    return {
        index: sponsorIndex,
        lifePath: lifePath,
        birthDay: birthDay,
        nameNum: nameNum
    };
}

/* ==========================================================
   ФИНАНСОВАЯ АРХЕТИПИКА
   ========================================================== */

function calculateLifePathAdvanced(dateString) {
    const digits = dateString.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);

    if (sum === 11 || sum === 22 || sum === 33) {
        return { master: sum, base: sum === 11 ? 2 : (sum === 22 ? 4 : 6) };
    }

    while (sum > 9) {
        sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
        if (sum === 11 || sum === 22 || sum === 33) {
            return { master: sum, base: sum === 11 ? 2 : (sum === 22 ? 4 : 6) };
        }
    }

    return { master: null, base: sum };
}

/* ==========================================================
   ГЛУБОКИЙ РАСЧЁТ ФИНАНСОВОГО ВЕКТОРА
   ========================================================== */

function calculateFinancialVector(dateString, name) {

    const lp = calculateLifePathAdvanced(dateString);
    const matrix = calculateMatrixData(dateString);
    const nameNum = calculateNameNumber(name);
    const birthDay = parseInt(dateString.split('-')[2]);

    let score = 50;

    /* --- ЧЖП --- */
    const lpValue = lp.master || lp.base;

    if ([1,8].includes(lpValue)) score += 20;
    if ([4,22].includes(lpValue)) score += 15;
    if ([6].includes(lpValue)) score -= 20;
    if ([2,11].includes(lpValue)) score -= 10;
    if ([9].includes(lpValue)) score -= 5;

    /* --- День рождения --- */
    if ([1,10,19,28].includes(birthDay)) score += 10;
    if ([8,17,26].includes(birthDay)) score += 15;
    if ([6,15,24].includes(birthDay)) score -= 15;

    /* --- Матрица --- */
    score += matrix.c[1] * 5;
    score += matrix.c[8] * 4;
    score += matrix.c[4] * 3;

    score -= matrix.c[6] * 5;
    score -= matrix.c[2] * 3;

    /* --- Имя --- */
    if ([1,8].includes(nameNum)) score += 5;
    if ([6,2].includes(nameNum)) score -= 5;

    score = Math.max(5, Math.min(95, score));

    return {
        index: score,
        lifePath: lp,
        matrix: matrix,
        nameNum: nameNum,
        birthDay: birthDay
    };
}

/* ==========================================================
   ИНДИВИДУАЛЬНЫЙ АНАЛИЗ
   ========================================================== */

function calculateSponsorSingle() {

    const name = document.getElementById('sponsorName').value.trim();
    const date = document.getElementById('sponsorDate').value;

    if (!name || !date) {
        alert("Введите имя и дату рождения");
        return;
    }

    const profile = buildFinancialProfile(date, name);
    const sponsorPercent = profile.index;
    const keeperPercent = 100 - sponsorPercent;

    document.getElementById('sponsor-fill-single').style.width = sponsorPercent + '%';
    document.getElementById('sponsor-indicator').style.left = sponsorPercent + '%';
    document.getElementById('sponsor-percent-single').textContent =
        sponsorPercent + "% Спонсор / " + keeperPercent + "% Принимающий";

    document.getElementById('sponsor-type-single').textContent =
        sponsorPercent >= 60 ? "Финансово доминирующий тип"
        : sponsorPercent <= 40 ? "Принимающий тип"
        : "Сбалансированный тип";

    document.getElementById('sponsor-text-single').innerHTML =
        generateFinancialNarrative(profile, name);
		document.getElementById('sponsor-single-result').style.display = 'none';
    document.getElementById('loader-sponsor-single').style.display = 'flex';
    startMagicAnimation('magic-numbers-sponsor-single');
    
    setTimeout(() => {
        // ... расчёты ...
        
        stopMagicAnimation('magic-numbers-sponsor-single');
        document.getElementById('loader-sponsor-single').style.display = 'none';
        document.getElementById('sponsor-single-result').style.display = 'block';
    }, 1500);

  }

/* ==========================================================
   АНАЛИЗ ПАРЫ
   ========================================================== */

function calculateSponsorCouple() {

    const name1 = document.getElementById('sponsorName1').value.trim();
    const date1 = document.getElementById('sponsorDate1').value;
    const name2 = document.getElementById('sponsorName2').value.trim();
    const date2 = document.getElementById('sponsorDate2').value;

    if (!name1 || !name2 || !date1 || !date2) {
        alert("Заполните все поля");
        return;
    }

    const profile1 = buildFinancialProfile(date1, name1);
    const profile2 = buildFinancialProfile(date2, name2);

    document.getElementById('sponsor-name1-display').textContent = name1;
    document.getElementById('sponsor-name2-display').textContent = name2;

    document.getElementById('sponsor-percent1').textContent = profile1.index + "%";
    document.getElementById('sponsor-percent2').textContent = profile2.index + "%";

    const balance = 50 + (profile1.index - profile2.index) / 2;
    document.getElementById('sponsor-balance-fill').style.width = balance + "%";

    document.getElementById('sponsor-role1').textContent =
        profile1.index > profile2.index ? "Финансовый донор" : "Принимающий";

    document.getElementById('sponsor-role2').textContent =
        profile2.index > profile1.index ? "Финансовый донор" : "Принимающий";

    // ✅ СНАЧАЛА создаём переменную
    const karmaNarrative = generateCoupleFinancialNarrative(
        profile1,
        profile2,
        name1,
        name2,
		date1,
        date2 
    );

    // ✅ ПОТОМ вставляем её в HTML
    document.getElementById('sponsor-couple-text').innerHTML = karmaNarrative;
	const resultBlock = document.getElementById('sponsor-couple-result');

    document.getElementById('sponsor-couple-result').style.display = 'block';

resultBlock.style.display = 'block';

	document.getElementById('sponsor-couple-result').style.display = 'none';
    document.getElementById('loader-sponsor-couple').style.display = 'flex';
    startMagicAnimation('magic-numbers-sponsor-couple');
    
    setTimeout(() => {
        // ... расчёты ...
        
        stopMagicAnimation('magic-numbers-sponsor-couple');
        document.getElementById('loader-sponsor-couple').style.display = 'none';
        document.getElementById('sponsor-couple-result').style.display = 'block';
    }, 1500);

}
/* ==========================================================
   ARCHETYPE LAYER PRO
   ========================================================== */

function determineFinancialArchetype(profile) {

    const p = profile.index;
    const lp = profile.lifePath.master || profile.lifePath.base;
    const matrix = profile.matrix;
    const karma = profile.karma;

    if (p >= 80) {
        if (lp === 8 || lp === 22) return "Донор‑Император";
        if (matrix.c[1] >= 3) return "Донор‑Контролёр";
        return "Донор‑Стратег";
    }

    if (p >= 65) {
        if (matrix.c[4] >= 2) return "Донор‑Фундамент";
        return "Донор‑Защитник";
    }

    if (p >= 45 && p <= 60) {
        if (karma === 5) return "Баланс‑Кармический";
        return "Баланс‑Гибкий";
    }

    if (p >= 25) {
        if (lp === 6) return "Муза‑Венерианская";
        if (matrix.c[2] >= 2) return "Муза‑Интуитивная";
        return "Муза‑Вдохновительница";
    }

    return "Муза‑Кармическая";
}
/* ==========================================================
   KARMA FINANCIAL COUPLE DYNAMICS PRO
   ========================================================== */

function generateCoupleFinancialNarrative(profile1, profile2, name1, name2, date1, date2) {
	

    const p1 = profile1.index;
    const p2 = profile2.index;

    const diff = Math.abs(p1 - p2);

    let dominant = p1 > p2 ? name1 : name2;
    let secondary = p1 > p2 ? name2 : name1;

    let dynamic;
    let conflict;
    let evolution;
    let collapse;

    /* ---------- Баланс ---------- */
    if (diff <= 10) {

        dynamic = `
        Между ${name1} и ${name2} наблюдается почти идеальное финансовое равновесие.
        Это не классическая модель «донор — принимающий».
        Это союз двух автономных систем.
        `;

        conflict = `
        Главная опасность — отсутствие лидерства.
        В сложный период может возникнуть паралич решений.
        `;

        evolution = `
        В долгосрочной перспективе возможна смена ролей
        в зависимости от карьерной фазы каждого.
        `;

        collapse = `
        Разрыв возможен не из‑за денег,
        а из‑за отсутствия эмоционального превосходства одного из партнёров.
        `;

    } 
    /* ---------- Умеренный перевес ---------- */
    else if (diff <= 30) {

        dynamic = `
        ${dominant} имеет более выраженный материальный вектор,
        но ${secondary} усиливает систему через психологию и энергию.
        Это функциональная модель.
        `;

        conflict = `
        Внутренний риск — скрытая конкуренция.
        ${secondary} может начать доказывать свою ценность
        через альтернативные формы влияния.
        `;

        evolution = `
        При правильной осознанности эта пара
        может выйти на стабильную материальную модель
        без жёсткого доминирования.
        `;

        collapse = `
        Разрыв возможен, если финансовый вклад
        станет инструментом давления.
        `;

    }
    /* ---------- Явный дисбаланс ---------- */
    else {

        dynamic = `
        В паре существует выраженная финансовая иерархия.
        ${dominant} — центр материального контроля.
        ${secondary} — зависимая или усиливающая сторона.
        `;

        conflict = `
        Основной риск — психологическая зависимость.
        Если ${dominant} потеряет ресурс,
        система может разрушиться.
        `;

        evolution = `
        Через 5–10 лет возможен переворот ролей,
        если ${secondary} начнёт усиливать самостоятельность.
        `;

        collapse = `
        Наиболее вероятный сценарий распада —
        финансовый кризис или эмоциональная усталость донора.
        `;
		
    }
	 /* ✅ ВСЕ ДОПОЛНИТЕЛЬНЫЕ РАСЧЁТЫ — СЮДА */

    const turning1 = calculateFinancialTurningPoint(profile1, date1);
    const turning2 = calculateFinancialTurningPoint(profile2, date2);

    const projection1 = calculateTenYearFinancialProjection(profile1);
    const projection2 = calculateTenYearFinancialProjection(profile2);

    const toxicity = calculateFinancialToxicity(profile1, profile2);
    const roleShift = calculateRoleShiftProbability(profile1, profile2);

    return `
    <h4 style="color:var(--gold); margin-bottom:15px;">Кармическая финансовая динамика</h4>

    <h4 style="color:var(--purple-light); margin-top:15px;">Структура союза</h4>
    <p>${dynamic}</p>
	
<div class="role-graph">
   <div class="role-donor" style="width:${profile1.index}%"></div>
   <div class="role-acceptor" style="width:${profile2.index}%"></div>
</div>

    <h4 style="color:var(--purple-light); margin-top:15px;">Скрытый конфликт</h4>
    <p>${conflict}</p>

    <h4 style="color:var(--purple-light); margin-top:15px;">Эволюция союза</h4>
    <p>${evolution}</p>

    <h4 style="color:var(--purple-light); margin-top:15px;">Точка возможного распада</h4>
    <p>${collapse}</p>

    <hr style="margin:25px 0; opacity:0.2;">

    <h4 style="color:var(--gold); margin-top:10px;">Финансовые переломы</h4>
    <p><strong>${name1}</strong>: ${turning1.phase}, ориентировочно около ${turning1.turningAge} лет (цикл ${turning1.cycle})</p>
    <p><strong>${name2}</strong>: ${turning2.phase}, ориентировочно около ${turning2.turningAge} лет (цикл ${turning2.cycle})</p>

    <h4 style="color:var(--gold); margin-top:20px;">10‑летняя финансовая динамика</h4>
    <p><strong>${name1}</strong>: ${projection1.trajectory}</p>
    <p><strong>${name2}</strong>: ${projection2.trajectory}</p>
    <p style="opacity:0.8;"><em>Риски:</em> ${projection1.risk} / ${projection2.risk}</p>

    <hr style="margin:25px 0; opacity:0.2;">

    <h4 style="color:var(--gold); margin-top:10px;">Индикатор токсичности</h4>
    <p style="color:${toxicity.color}; font-weight:bold;">
    ${toxicity.level}
</p>
    <p>${toxicity.description}</p>

    <h4 style="color:var(--gold); margin-top:20px;">Вероятность смены ролей</h4>
    <p>${roleShift}</p>

    ${analyzeMoneyPsychology(profile1, profile2, name1, name2)}

    ${generateHigherEvolutionScenario(profile1, profile2, name1, name2)}
	
	${generateArchetypalMoneyScenario(profile1, profile2, name1, name2)}
	
	${determineRelationshipModel(profile1, profile2, name1, name2)}
	
    `;
}
/* ==========================================================
   FINANCIAL PSYCHO-DYNAMIC ENGINE
   ========================================================== */

function calculateChildhoodMoneyPattern(profile) {

    const matrix = profile.matrix;
    const karma = profile.karma;

    let pattern;
    let trauma;
    let trigger;

    if (matrix.c[8] === 0 && karma === 5) {
        pattern = "Страх нестабильности";
        trauma = "В детстве формировалась тревога из-за денег.";
        trigger = "Партнёрская нестабильность усиливает тревогу.";
    }
    else if (matrix.c[6] >= 2) {
        pattern = "Ожидание заботы";
        trauma = "Подсознательная модель: кто-то должен обеспечить.";
        trigger = "Отказ партнёра платить вызывает обиду.";
    }
    else if (matrix.c[1] >= 3) {
        pattern = "Контроль через деньги";
        trauma = "Финансовый контроль = безопасность.";
        trigger = "Потеря контроля вызывает агрессию.";
    }
    else {
        pattern = "Гибкая модель";
        trauma = "Финансовых травм не выражено.";
        trigger = "Зависит от текущей динамики.";
    }

    return {
        pattern,
        trauma,
        trigger
    };
}
/* ==========================================================
   FINANCIAL TIME & TOXICITY ANALYSIS
   ========================================================== */

function calculateFinancialTurningPoint(profile, birthDate) {

    const lp = profile.lifePath.master || profile.lifePath.base;
    const karma = profile.karma;

    const birthYear = parseInt(birthDate.split('-')[0]);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    // 9‑летний цикл
    const cycle = (age % 9) + 1;

    let turningAge;
    let phase;

    if (lp === 8 || lp === 1) {
        turningAge = 36 + (karma || 0);
        phase = "Материальный пик";
    }
    else if (lp === 6) {
        turningAge = 33;
        phase = "Смена роли через отношения";
    }
    else {
        turningAge = 40;
        phase = "Поздний финансовый разворот";
    }

    return {
        currentAge: age,
        cycle: cycle,
        turningAge: turningAge,
        phase: phase
    };
}

/* ---------- 10-летняя динамика ---------- */

function calculateTenYearFinancialProjection(profile) {

    const p = profile.index;

    let trajectory;
    let risk;

    if (p >= 70) {
        trajectory = "Рост через усиление доминирования";
        risk = "Выгорание или жёсткий контроль партнёра";
    }
    else if (p >= 45) {
        trajectory = "Колебания и смена ролей";
        risk = "Неопределённость позиции";
    }
    else {
        trajectory = "Рост через правильный союз";
        risk = "Финансовая зависимость";
    }

    return {
        trajectory,
        risk
    };
}

/* ---------- Индикатор токсичности пары ---------- */

function calculateFinancialToxicity(profile1, profile2) {

    const diff = Math.abs(profile1.index - profile2.index);

    if (diff > 40) {
        return {
            level: "Высокий риск токсичности",
            color: "#ff4d4d",
            description: "Сильный финансовый перекос. Возможна зависимость и подавление."
        };
    }

    if (diff > 25) {
        return {
            level: "Умеренный дисбаланс",
            color: "#ffb84d",
            description: "Есть скрытая борьба за влияние через деньги."
        };
    }

    return {
        level: "Низкий риск",
        color: "#4dff88",
        description: "Финансовая динамика сбалансирована."
    };
}

/* ---------- Вероятность смены ролей ---------- */

function calculateRoleShiftProbability(profile1, profile2) {

    const combined = profile1.index + profile2.index;

    if (combined > 140) {
        return "Вероятность смены ролей низкая — структура устойчива.";
    }

    if (combined > 100) {
        return "Возможна смена ролей при внешнем кризисе.";
    }

    return "Высокая вероятность смены ролей в течение 5–7 лет.";
}
/* ==========================================================
   DEEP PSYCHOLOGICAL MONEY COMPATIBILITY
   ========================================================== */

function analyzeMoneyPsychology(profile1, profile2, name1, name2) {

    const p1 = profile1.index;
    const p2 = profile2.index;

    let language1, language2;
    let fear1, fear2;
    let manipulation;
    let breakup;
	

    /* ---------- Язык любви через деньги ---------- */

    language1 = p1 >= 60 ?
         `${name1} выражает любовь через материальную поддержку.` 
        : `${name1} выражает любовь через эмоциональное присутствие.`;

    language2 = p2 >= 60 ?
         `${name2} выражает любовь через материальную поддержку.` 
        : `${name2} выражает любовь через эмоциональное присутствие.`;

    /* ---------- Страх ---------- */

    fear1 = p1 >= 60 ?
         `${name1} боится потерять контроль.` 
        : `${name1} боится оказаться зависимым.`;

    fear2 = p2 >= 60 ?
         `${name2} боится потерять контроль.` 
        : `${name2} боится оказаться зависимым.`;

    /* ---------- Манипуляция ---------- */

    if (Math.abs(p1 - p2) > 35) {
        manipulation = `
        В паре возможна скрытая финансовая манипуляция.
        Один может использовать деньги как инструмент давления.
        `;
    } else {
        manipulation = `
        Финансовая манипуляция маловероятна,
        но возможна эмоциональная компенсация через деньги.
        `;
    }

    /* ---------- Кто уйдёт первым ---------- */

    if (p1 > p2 + 25) {
        breakup = `${name1} уйдёт первым при финансовом истощении.`;
    } else if (p2 > p1 + 25) {
        breakup = `${name2} уйдёт первым при ощущении зависимости.`;
    } else {
        breakup = `Разрыв вероятнее по эмоциональной причине, а не финансовой.`;
    }

    return `
    <hr style="margin:30px 0; opacity:0.2;">

    <h4 style="color:var(--gold);">Психология денег в паре</h4>

    <h4 style="color:var(--purple-light); margin-top:15px;">Финансовый язык любви</h4>
    <p>${language1}</p>
    <p>${language2}</p>

    <h4 style="color:var(--purple-light); margin-top:15px;">Скрытые страхи</h4>
    <p>${fear1}</p>
    <p>${fear2}</p>

    <h4 style="color:var(--purple-light); margin-top:15px;">Манипулятивный потенциал</h4>
    <p>${manipulation}</p>

    <h4 style="color:var(--purple-light); margin-top:15px;">Вероятный инициатор разрыва</h4>
    <p>${breakup}</p>
    `;
}
/* ==========================================================
   HIGHER FINANCIAL EVOLUTION SCENARIO
   ========================================================== */

function generateHigherEvolutionScenario(profile1, profile2, name1, name2) {

    const p1 = profile1.index;
    const p2 = profile2.index;
    const diff = Math.abs(p1 - p2);

    let growthVector;
    let transformation;
    let breakthrough;
    let danger;

    if (diff <= 15) {

        growthVector = `
        Ваша пара способна выйти на новый финансовый уровень
        через совместный проект или общее дело.
        Вы усиливаете друг друга симметрично.
        `;

        transformation = `
        Рост произойдёт, если вы определите
        конкретную общую материальную цель.
        `;

        breakthrough = `
        Возможен финансовый скачок в период,
        когда оба одновременно входят в фазу расширения.
        `;

        danger = `
        Опасность — расфокусировка и отсутствие лидера.
        `;

    } else if (diff <= 30) {

        growthVector = `
        Финансовый рост возможен,
        если доминирующая сторона перестанет контролировать,
        а принимающая — усилит самостоятельность.
        `;

        transformation = `
        Ключ — баланс власти.
        Нельзя расти, если один подавлен.
        `;

        breakthrough = `
        Скачок возможен при перераспределении ролей.
        `;

        danger = `
        Если роли зацементируются,
        союз станет статичным и рост остановится.
        `;

    } else {

        growthVector = `
        Ваша модель требует осознанного управления.
        Без внутренней трансформации рост невозможен.
        `;

        transformation = `
        Доминирующий партнёр должен научиться делегировать,
        принимающий — взять на себя часть ответственности.
        `;

        breakthrough = `
        Переломный момент возможен
        после кризиса или финансовой встряски.
        `;

        danger = `
        Без изменений пара может застрять
        в модели зависимости.
        `;
    }

    return `
    <hr style="margin:30px 0; opacity:0.2;">

    <h4 style="color:var(--gold);">Высший сценарий эволюции союза</h4>

    <h4 style="color:var(--purple-light); margin-top:15px;">Вектор роста</h4>
    <p>${growthVector}</p>

    <h4 style="color:var(--purple-light); margin-top:15px;">Необходимая трансформация</h4>
    <p>${transformation}</p>

    <h4 style="color:var(--purple-light); margin-top:15px;">Вероятность прорыва</h4>
    <p>${breakthrough}</p>

    <h4 style="color:var(--purple-light); margin-top:15px;">Главная опасность</h4>
    <p>${danger}</p>
    `;
}
/* ==========================================================
   ARCHETYPAL COUPLE MONEY DYNAMICS
   ========================================================== */

function generateArchetypalMoneyScenario(profile1, profile2, name1, name2) {

    const lp1 = profile1.lifePath.master || profile1.lifePath.base;
    const lp2 = profile2.lifePath.master || profile2.lifePath.base;
	
	const matrix1 = profile1.matrix;
    const matrix2 = profile2.matrix;

    let scenario;

    /* --- 2 + 6 --- */
    if ((lp1 === 2 || lp1 === 11) && lp2 === 6) {

        scenario = `
        <h4 style="color:var(--gold);">Архетип: Спонсор‑Интуит + Венера</h4>

        <p><strong>${name1}</strong> (2/11) — партнёр‑интуит.
        Он не жёсткий лидер, но стремится быть нужным.
        Его спонсорство не про власть — а про гармонию.</p>

        <p><strong>${name2}</strong> (6) — венерианская энергия.
        Ей важен комфорт, эстетика, качество жизни.
        Она не «иждивенец», а усилитель ресурса.</p>

        <p>Сценарий: ${name1} «несёт мамонта», чтобы ${name2} создавала
        из него красивый интерьер жизни.
        Это гармоничная классическая модель,
        если оба осознают свои роли.</p>
        `;
    }
	
	/* ===== 5 + 6 ===== */
    else if ((lp1 === 5 && lp2 === 6) || (lp2 === 5 && lp1 === 6)) {
        scenario = `
        <h4 style="color:var(--gold);">Архетип: Нестабильность + Запрос комфорта</h4>
        <p>5 — хаос и перемены.</p>
        <p>6 — стабильность и уют.</p>
        <p>Союз возможен, но требует дисциплины.</p>
        `;
    }

    /* --- 6 + 2 (зеркало) --- */
    else if ((lp2 === 2 || lp2 === 11) && lp1 === 6) {

        scenario = `
        <h4 style="color:var(--gold);">Архетип: Венера + Спонсор‑Интуит</h4>

        <p><strong>${name2}</strong> (2/11) — эмоциональный донор.
        Его мотивация — сохранить гармонию.</p>

        <p><strong>${name1}</strong> (6) — венерианский центр притяжения.
        Запрос на качество жизни усиливает добытчика.</p>

        <p>Сценарий идентичен: донор ради красоты и гармонии.</p>
        `;
    }
	
	 /* ===== 1 + 2 ===== */
    else if ((lp1 === 1 && lp2 === 2) || (lp2 === 1 && lp1 === 2)) {
        scenario = `
        <h4 style="color:var(--gold);">Архетип: Лидер + Поддержка</h4>
        <p>1 — прямой вектор силы.</p>
        <p>2 — эмоциональная дипломатия.</p>
        <p>Это модель, где лидер действует, а партнёр стабилизирует.</p>
        `;
    }
	
	/* ===== 9 + 6 ===== */
    else if ((lp1 === 9 && lp2 === 6) || (lp2 === 9 && lp1 === 6)) {
        scenario = `
        <h4 style="color:var(--gold);">Архетип: Идеалист + Венера</h4>
        <p>9 — духовная энергия.</p>
        <p>6 — материально‑эстетическая.</p>
        <p>Возможен конфликт между идеализмом и комфортом.</p>
        `;
    }
	
	/* ===== 4 + 6 ===== */
    else if ((lp1 === 4 && lp2 === 6) || (lp2 === 4 && lp1 === 6)) {
        scenario = `
        <h4 style="color:var(--gold);">Архетип: Фундамент + Уют</h4>
        <p>4 создаёт структуру.</p>
        <p>6 наполняет её смыслом.</p>
        <p>Очень устойчивая, «семейная» модель.</p>
        `;
    }
	

    /* --- 8 + 6 --- */
    else if ((lp1 === 8 && lp2 === 6) || (lp2 === 8 && lp1 === 6)) {

        scenario = `
        <h4 style="color:var(--gold);">Архетип: Император + Муза</h4>

        <p>8 — материальная сила.
        6 — эстетика и комфорт.</p>

        <p>Это мощный союз:
        один строит империю,
        второй придаёт ей смысл.</p>

        <p>Опасность — контроль через деньги.
        Потенциал — высокий финансовый скачок.</p>
        `;
    }

    /* --- 6 + 6 --- */
    else if (lp1 === 6 && lp2 === 6) {

        scenario = `
        <h4 style="color:var(--gold);">Архетип: Две Венеры</h4>

        <p>Оба партнёра ориентированы на комфорт.
        Вопрос: кто будет добывать ресурс?</p>

        <p>Союз красивый,
        но нестабильный без внешнего донора.</p>
        `;
    }

    /* --- fallback --- */
    else {

        scenario = `
        <h4 style="color:var(--gold);">Архетипическая модель</h4>

        <p>Ваша комбинация чисел не создаёт классического
        «донор — принимающий» сценария.
        Роли будут определяться личной зрелостью,
        а не числовым архетипом.</p>
        `;
    }

    return `
    <hr style="margin:30px 0; opacity:0.2;">
    <h4 style="color:var(--purple-light);">Архетипический сценарий пары</h4>
    ${scenario}
    `;
}

/* ==========================================================
   RELATIONSHIP MODEL CLASSIFICATION
   ========================================================== */

function determineRelationshipModel(profile1, profile2, name1, name2) {

    const p1 = profile1.index;
    const p2 = profile2.index;
    const diff = Math.abs(p1 - p2);

    let model;
    let explanation;

    /* ===== КЛАССИЧЕСКАЯ ===== */
    if (diff > 25 && (p1 >= 65 || p2 >= 65) && (p1 <= 40 || p2 <= 40)) {

        model = "Классическая модель";
        explanation = `
        Ваша пара работает по традиционной схеме:
        один партнёр — финансовый локомотив,
        второй — эмоциональный и эстетический центр.
        Это устойчивая структура,
        если роли принимаются добровольно.
        `;
    }

    /* ===== СОВРЕМЕННАЯ ===== */
    else if (diff <= 15) {

        model = "Современная партнёрская модель";
        explanation = `
        Финансовые роли распределены гибко.
        Нет жёсткого доминирования.
        Союз строится на равенстве и взаимной поддержке.
        `;
    }

    /* ===== ГИБРИД ===== */
    else if (diff <= 30) {

        model = "Гибридная модель";
        explanation = `
        Есть выраженный донор,
        но второй партнёр сохраняет автономность.
        Роли могут меняться со временем.
        `;
    }

    /* ===== НЕСТАБИЛЬНАЯ ===== */
    else {

        model = "Нестабильная модель";
        explanation = `
        В паре присутствует сильный дисбаланс.
        Без осознанного перераспределения ролей
        возможны конфликты и финансовая напряжённость.
        `;
    }

    return `
    <hr style="margin:30px 0; opacity:0.2;">
    <h4 style="color:var(--gold);">Тип финансовой модели союза</h4>
    <p><strong>${model}</strong></p>
    <p>${explanation}</p>
	
    `;
}
function applyPremiumAccess() {

    if (premiumAccess) {

        const locks = document.querySelectorAll(".premium-lock");
        locks.forEach(lock => {
            lock.style.display = "none";
        });

    } else {

        const locks = document.querySelectorAll(".premium-lock");
        locks.forEach(lock => {
            lock.addEventListener("click", function() {
                alert("🔒 Этот раздел доступен только после оплаты.");
            });
        });
    }
}

applyPremiumAccess();

/* ============================================
   PREMIUM LOCK INTERACTION
   ============================================ */

document.querySelectorAll('.premium-lock').forEach(lock => {
    lock.addEventListener('click', function() {

        const icon = this.querySelector('.lock-icon');
        icon.classList.add('shake');

        setTimeout(() => {
            icon.classList.remove('shake');
            openPremium();
        }, 300);
    });
});

function openPremium() {
    document.getElementById('premium-modal').style.display = 'flex';
}

function closePremium() {
    document.getElementById('premium-modal').style.display = 'none';
}

function goToPremium() {
    window.location.href = "https://t.me/yourtelegram"; 
    // ← потом сюда вставим реальную оплату
}



function getLifePathDescription(n) {
  return lifePathDescriptions[n] || lifePathDescriptions[9];
}

/* ============================================
   ФУНКЦИИ ДЛЯ КУРСА
   ============================================ */

/* 1. Покупка файла (Автоматизация через Lava/ссылку) */
function buyCourseFile() {
    // 👇 СЮДА ты потом вставишь свою реальную ссылку на оплату
    const paymentLink = "https://lava.top/your-product-link"; 
    
    // Проверка: если ссылка всё ещё стандартная (заглушка), ведем в Телеграм
    if (paymentLink === "https://lava.top/your-product-link") {
        const telegramUsername = "zoya_viik";
        const text = "Здравствуйте! Хочу купить курс «Мелодия Цифр» (файл). Пришлите, пожалуйста, ссылку на оплату картой.";
        window.open(`https://t.me/${telegramUsername}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
        // Если ты вставил свою ссылку, клиент перейдет сразу на оплату
        window.open(paymentLink, '_blank');
    }
}

/* 2. Запись на личное наставничество (с вопросом про рассрочку) */
function bookPersonalMentoring() {
    const telegramUsername = "zoya_viik";
    const text = "Здравствуйте, Зоя! Хочу на личное наставничество. Есть ли возможность рассрочки или оплаты частями?";
    const url = `https://t.me/${telegramUsername}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

/* ============================================
   ГРАФИК ЛИЧНОГО ГОДА
   ============================================ */
function calculateYearChart(dateString) {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
   const currentYear = new Date().getFullYear() + 1; // Всегда следующий год (в 2025 покажет 2026
    const birthDay = parseInt(dateString.split('-')[2]);
    const birthMonth = parseInt(dateString.split('-')[1]);
    
    // Личное число года = (День + Месяц + Текущий Год) -> сворачиваем
    let personalYear = reduceToSingleDigit(birthDay + birthMonth + currentYear);
    
    const container = document.getElementById('energy-bars');
    container.innerHTML = '';
    
    // Энергия месяца = Личный Год + Номер Месяца
    months.forEach((month, index) => {
        const monthNum = index + 1;
        let energy = reduceToSingleDigit(personalYear + monthNum);
        
        // Высота столбика (от 1 до 9, где 9 = 100%)
        const height = (energy / 9) * 100;
        
        const bar = document.createElement('div');
        bar.className = 'energy-bar';
        bar.style.height = height + '%';
        bar.innerHTML = `<span class="month-label">${month}</span>`;
        
        // Клик по столбику
        bar.onclick = function() {
            document.querySelectorAll('.energy-bar').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showMonthAdvice(month, energy);
        };
        
        container.appendChild(bar);
    });
    
    document.getElementById('year-chart-block').style.display = 'block';
}

function showMonthAdvice(month, energy) {
    const advices = {
        1: {
            title: "🌟 Время Действовать",
            text: "Этот месяц открывает двери. Вселенная ждёт от вас инициативы. Запускайте проекты, меняйте имидж, заявляйте о себе. Энергия лидера на максимуме. Главное — не ждать, а брать.",
            warning: "Избегайте агрессии и эгоизма."
        },
        2: {
            title: "🤝 Время Партнёрства",
            text: "Месяц для налаживания связей. Прислушивайтесь к интуиции, она сейчас работает на 100%. Идеальное время для романтики, примирения и командной работы.",
            warning: "Не принимайте резких решений, лучше подождать."
        },
        3: {
            title: "🎉 Время Творчества",
            text: "Удача на вашей стороне! Месяц лёгкости, общения и самовыражения. Пишите, рисуйте, выступайте. Деньги могут прийти через неожиданные идеи и знакомства.",
            warning: "Осторожнее с тратами — склонность к транжирству."
        },
        4: {
            title: "🏗️ Время Порядка",
            text: "Месяц труда и фундамента. Займитесь здоровьем, телом и документами. Наведите порядок в делах и доме. Это время сеять, а не собирать урожай.",
            warning: "Не рискуйте и не нарушайте правил."
        },
        5: {
            title: "🚀 Время Перемен",
            text: "Ветер странствий! Возможны неожиданные поездки, командировки или смена обстановки. Рутина сейчас губительна. Рискуйте (с умом) — удача любит смелых.",
            warning: "Следите за вещами и документами в дороге."
        },
        6: {
            title: "🏡 Время Семьи",
            text: "Самый уютный месяц. Посвятите его близким, дому и красоте. Купите что-то красивое в квартиру, устройте ужин. Любовь витает в воздухе.",
            warning: "Не давите заботой на близких."
        },
        7: {
            title: "🧘‍♂️ Время Тишины",
            text: "Остановитесь и выдохните. Время для анализа, учёбы и духовных практик. Ответы сейчас внутри вас, а не снаружи. Внешняя активность может тормозиться.",
            warning: "Не впадайте в уныние и самокопание."
        },
        8: {
            title: "💰 Время Денег",
            text: "Кармическая жатва. Время больших сделок, инвестиций и карьерных рывков. Вы сейчас обладаете авторитетом. Требуйте то, что вам причитается.",
            warning: "Честность — залог успеха. Махинации выйдут боком."
        },
        9: {
            title: "🍂 Время Очищения",
            text: "Финал цикла. Выбрасывайте хлам, прощайте обиды, завершайте проекты. Не начинайте ничего нового — оно не приживется. Освободите место для чуда.",
            warning: "Возможны эмоциональные качели. Отпускайте легко."
        }
    };
    
    const advice = advices[energy];
    
    document.getElementById('month-title').innerHTML = `${month}: <span style="color:var(--gold);">${advice.title}</span>`;
    document.getElementById('month-text').innerHTML = `
        <p style="margin-bottom:10px;">${advice.text}</p>
        <p style="font-size:0.85rem; color:#ff6b6b;"><i class="fa-solid fa-circle-exclamation"></i> <em>${advice.warning}</em></p>
    `;
}

function reduceToSingleDigit(n) {
    while (n > 9) {
        n = n.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return n;
}


/* ============================================
   БЫСТРАЯ СОВМЕСТИМОСТЬ (УМНАЯ ВЕРСИЯ)
   ============================================ */
function quickCompatibility() {
    
     const el1 = document.getElementById('quick-name1');
    const el2 = document.getElementById('quick-name2');
    if (!el1 || !el2) {
        console.warn('Поля быстрой совместимости не найдены');
        return;
    }
    
    const name1 = el1.value.trim();
    const name2 = el2.value.trim();
    
    if (!name1 || !name2) {
        alert('Пожалуйста, введите оба имени!');
        return;
    }
    
    // 1. Считаем число совместимости по именам
    const num1 = calculateNameNumber(name1);
    const num2 = calculateNameNumber(name2);
    let result = num1 + num2;
    while (result > 9) result = result.toString().split('').reduce((a, b) => +a + +b, 0);
    
    // 2. Определяем пол
    const gender1 = detectGenderAdvanced(name1); // Используем твою умную функцию
    const gender2 = detectGenderAdvanced(name2);
    
    // 3. Определяем тип отношений
    let type = 'universal'; // По умолчанию
    if ((gender1 === 'male' && gender2 === 'female') || (gender1 === 'female' && gender2 === 'male')) {
        type = 'love'; // М + Ж
    } else if (gender1 === gender2 && gender1 !== 'unknown') {
        type = 'business'; // М + М или Ж + Ж (Дружба/Бизнес)
    }

    // 4. База описаний (Умная)
    const descriptions = {
        1: {
            title: "Лидерский Союз",
            love: "Вы оба хотите быть главными. Страсть через конкуренцию. Вместе вы сила, если научитесь уступать.",
            business: "Мощное бизнес-партнёрство. Два лидера, которые могут свернуть горы. Главное — поделить зоны ответственности."
        },
        2: {
            title: "Гармония и Понимание",
            love: "Мягкая, нежная связь. Вы чувствуете друг друга без слов. Идеально для семьи и уюта.",
            business: "Отличное сотрудничество. Вы слышите друг друга и умеете договариваться без конфликтов."
        },
        3: {
            title: "Радость и Творчество",
            love: "Вам никогда не скучно! Флирт, смех, путешествия. Легкие и яркие отношения.",
            business: "Креативный тандем. Вместе вы генерируете лучшие идеи. Но может не хватать дисциплины."
        },
        4: {
            title: "Стабильность и Труд",
            love: "Надежный брак. Без африканских страстей, зато на века. Вы строите дом и будущее.",
            business: "Железная надежность. Вы работаете как часы. Идеально для долгосрочных проектов."
        },
        5: {
            title: "Ветер Перемен",
            love: "Американские горки! Страсть, ссоры, примирения. С вами всегда интересно, но нестабильно.",
            business: "Прорывной стартап. Вы не боитесь рисковать и менять правила игры. Хаос — ваша стихия."
        },
        6: {
            title: "Забота и Уют",
            love: "Классическая семья. Забота, вкусные ужины, тепло. Вы созданы друг для друга.",
            business: "Комфортное партнёрство. Вы поддерживаете друг друга и создаете приятную атмосферу в команде."
        },
        7: {
            title: "Интеллектуальная Связь",
            love: "Любовь умов. Вам интереснее разговаривать, чем обниматься. Глубокая духовная связь.",
            business: "Союз экспертов. Вы уважаете профессионализм друг друга. Минимум эмоций, максимум пользы."
        },
        8: {
            title: "Власть и Деньги",
            love: "Союз двух королей. Статус, амбиции, дорогие подарки. Вы усиливаете успех друг друга.",
            business: "Денежная машина. Самый прибыльный союз. Вместе вы можете заработать миллионы."
        },
        9: {
            title: "Высшая Миссия",
            love: "Кармическая встреча. Вы учите друг друга мудрости и прощению. Любовь на уровне душ.",
            business: "Глобальные проекты. Вы хотите изменить мир к лучшему. Благотворительность или социальный бизнес."
        }
    };

    const desc = descriptions[result];
    const text = type === 'love' ? desc.love : desc.business;
    
    // 5. Вывод
	
    document.getElementById('quick-result-number').textContent = result;
    const safeName1 = escapeHTML(name1);
    const safeName2 = escapeHTML(name2);
    document.getElementById('quick-result-text').innerHTML = `
        <h4 style="color:var(--gold); margin-bottom:5px;">${desc.title}</h4>
        <p style="margin-bottom:10px;">${text}</p>
        <div style="font-size:0.85rem; color:#aaa;">
            <em>(Анализ для пары: ${safeName1} + ${safeName2})</em>
        </div>
    `;
    
    document.getElementById('quick-result').style.display = 'block';
    
    // Анимация
    const fillBar = document.getElementById('compatibility-fill');
    fillBar.classList.remove('complete');
    fillBar.style.width = '0%';
    setTimeout(() => {
        fillBar.style.width = '100%';
        setTimeout(() => fillBar.classList.add('complete'), 1000);
    }, 100);
}

/* ============================================
   ЭНЕРГИЯ ДНЯ
   ============================================ */
function initDailyEnergy() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // Красивая дата
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = today.toLocaleDateString('ru-RU', options);
    
    // Расчет числа дня
    let sum = day + month + year;
    while (sum > 9) sum = sum.toString().split('').reduce((a,b) => +a + +b, 0);
    
    document.getElementById('daily-number').textContent = sum;
    
    const descs = {
        1: "— День начинаний и лидерства",
        2: "— День дипломатии и чувств",
        3: "— День творчества и удачи",
        4: "— День труда и порядка",
        5: "— День перемен и риска",
        6: "— День любви и семьи",
        7: "— День анализа и тишины",
        8: "— День денег и силы",
        9: "— День завершения дел"
    };
    
    document.getElementById('daily-desc').textContent = descs[sum];
}

// Запускаем сразу при загрузке
initDailyEnergy();
/* ============================================
   ДВИЖОК МАТРИЦЫ СУДЬБЫ (22 АРКАНА)
   ============================================ */

function reduceArcana(num) {
    let result = num;
    while (result > 22) {
        result = result - 22;
    }
    if (result === 0) result = 22;
    return result;
}

// Вспомогательная: Рисуем точку
function createMatrixPoint(p, svg, r=22) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "matrix-point");
    
    // Круг
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x); circle.setAttribute("cy", p.y);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", p.color);
    circle.setAttribute("stroke", "#fff");
    
    // Текст
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", p.x); text.setAttribute("y", p.y + 1); // Центровка
    text.textContent = p.val;

    // КЛИК
    g.onclick = function() {
        // 1. Убираем активность у других
        document.querySelectorAll('.matrix-point').forEach(el => {
            el.classList.remove('active'); 
            el.classList.remove('clicked');
        });

        // 2. Добавляем эффекты текущему
        g.classList.add('active'); // Подсветка рамки
        g.classList.add('clicked'); // Анимация пульсации
        
        // Убираем класс анимации через 0.4с, чтобы можно было кликнуть снова
        setTimeout(() => {
            g.classList.remove('clicked');
        }, 400);

        // 3. Показываем описание
        const infoTitle = document.getElementById('arcana-title');
        const infoDesc = document.getElementById('arcana-desc');
        
        infoTitle.innerHTML = `${p.val} Аркан — <span style="color:${p.color}">${p.name}</span>`;
        infoDesc.innerHTML = getArcanaMeaning(p.val);
        
        // Анимация текста
        infoDesc.style.opacity = 0;
        setTimeout(() => infoDesc.style.opacity = 1, 100);
    };

    g.appendChild(circle);
    g.appendChild(text);
    svg.appendChild(g);
}

function getArcanaMeaning(n) {
    const meanings = {
        1: "Маг: Идеи, инициатива, материализация мыслей.",
        2: "Жрица: Интуиция, тайны, скрытые знания.",
        3: "Императрица: Женственность, плодородие, деньги.",
        4: "Император: Власть, структура, порядок, бизнес.",
        5: "Иерофант: Учитель, традиции, закон, семья.",
        6: "Влюбленные: Любовь, выбор, красота, общение.",
        7: "Колесница: Цель, движение, победа, путешествия.",
        8: "Справедливость: Карма, ответственность, равновесие.",
        9: "Отшельник: Мудрость, глубина, опыт души.",
        10: "Колесо Фортуны: Удача, поток, цикличность.",
        11: "Сила: Потенциал, энергия, трудолюбие.",
        12: "Повешенный: Креатив, служение, иной взгляд.",
        13: "Смерть: Трансформация, очищение, перемены.",
        14: "Умеренность: Гармония, исцеление, творчество.",
        15: "Дьявол: Харизма, искушение, большие деньги.",
        16: "Башня: Духовный рост через разрушение старого.",
        17: "Звезда: Талант, известность, вдохновение.",
        18: "Луна: Магия, психология, страхи/желания.",
        19: "Солнце: Радость, успех, богатство, дети.",
        20: "Суд: Род, семья, возрождение, система.",
        21: "Мир: Глобальность, расширение, миротворчество.",
        22: "Шут: Свобода, начало пути, доверие Богу."
    };
    return meanings[n] || "Энергия судьбы";
}

/* ============================================
   ЛОГИКА КОЛЕСА PRO
   ============================================ */
function spinWheel() {
    // 1. Проверяем, крутил ли уже
    if (localStorage.getItem('wheelUsed') === 'true') {
        showAlreadyUsedModal();
        return;
    }
    
    // Если не крутил — открываем
    const modal = document.getElementById('wheel-modal');
    if(modal) modal.style.display = 'flex';
}

// Красивое окно "Уже использовано"
function showAlreadyUsedModal() {
    document.getElementById('lose-text').textContent = "Вы уже испытали удачу!";
    document.querySelector('#lose-modal h2').textContent = "🎁 Попытка использована";
    document.querySelector('#lose-modal > div > div:first-child').textContent = "🎰";
    document.getElementById('lose-modal').style.display = 'flex';
}

function doSpin() {
    const wheel = document.getElementById('the-wheel');
    const btn = document.getElementById('spin-btn');
    
    if (btn.disabled) return;
    btn.disabled = true;
    btn.innerHTML = "Удача... 🤞";
    
    // 2. ЗАПИСЫВАЕМ: "КОЛЕСО ИСПОЛЬЗОВАНО"
    localStorage.setItem('wheelUsed', 'true');
    
    // 12 секторов (Четные - призы, Нечетные - пусто)
    const sectors = [
        { type: 'win', text: "Скидка 5% на консультацию" },
        { type: 'lose', text: "Пусто..." },
        { type: 'win', text: "Секретный Сюрприз" },
        { type: 'lose', text: "Эх, мимо!" },
        { type: 'win', text: "Скидка 10% на обучение" },
        { type: 'lose', text: "Не повезло." },
        { type: 'win', text: "Скидка 5% на консультацию" },
        { type: 'lose', text: "Пусто..." },
        { type: 'win', text: "Секретный Сюрприз" },
        { type: 'lose', text: "Эх, мимо!" },
        { type: 'win', text: "Скидка 10% на обучение" },
        { type: 'lose', text: "Не повезло." }
    ];

    const extraSpins = 360 * 10;
    const randomDegree = Math.floor(Math.random() * 360);
    const totalDegree = extraSpins + randomDegree;
    
    wheel.style.transform = `rotate(${totalDegree}deg)`;
    
    setTimeout(() => {
        const actualDeg = totalDegree % 360;
        const index = Math.floor((360 - actualDeg + 15) / 30) % 12;
        
        const result = sectors[index];
        
        if (result.type === 'win') {
            showWinner(result.text);
        } else {
            showLoser(result.text);
        }
        
        btn.innerHTML = "Попытка использована";
    }, 5000); 
}

// Показываем красивое окно проигрыша
function showLoser(loseText) {
    document.getElementById('wheel-modal').style.display = 'none';
    
    // Возвращаем стандартные тексты
    document.querySelector('#lose-modal > div > div:first-child').textContent = "🌙";
    document.querySelector('#lose-modal h2').textContent = "Звёзды сегодня шалят...";
    document.getElementById('lose-text').textContent = loseText;
    
    document.getElementById('lose-modal').style.display = 'flex';
}

// Закрываем окно проигрыша
function closeLoseModal() {
    document.getElementById('lose-modal').style.display = 'none';
}

function showWinner(prizeText) {
    document.getElementById('wheel-modal').style.display = 'none';
    document.getElementById('winner-modal').style.display = 'flex';
    document.getElementById('winner-prize-name').textContent = prizeText;
}

function sendScreenshotToTg() {
    const telegramUsername = "zoya_viik";
    const text = "Здравствуйте, Зоя! Я выиграл приз в Колесе Фортуны. Высылаю скриншот!";
    window.open(`https://t.me/${telegramUsername}?text=${encodeURIComponent(text)}`, '_blank');
}

/* ============================================
   АВТО-СОЗДАНИЕ КНОПКИ ПОДАРКА
   ============================================ */
window.addEventListener('DOMContentLoaded', () => {
    // Проверяем, есть ли уже кнопка
    if (!document.querySelector('.fortune-btn')) {
        const btn = document.createElement('div');
        btn.className = 'fortune-btn';
        btn.innerHTML = '🎁';
        btn.onclick = spinWheel;
        document.body.appendChild(btn);
        console.log("Кнопка подарка создана через JS!");
    }
});

/* =========================================
   УМНОЕ МЕНЮ (ИСЧЕЗАЕТ ПРИ СКРОЛЛЕ)
   ========================================= */
let lastScrollTop = 0;
const navbar = document.getElementById('main-nav');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Скроллим ВНИЗ -> Прячем
        navbar.classList.add('nav-hidden');
    } else {
        // Скроллим ВВЕРХ -> Показываем
        navbar.classList.remove('nav-hidden');
    }
    
    lastScrollTop = scrollTop;
    
    // Добавление тени для меню при скролле
window.addEventListener('scroll', function() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});
});


// ============================================
// РАСЧЁТ ДЕТСКОЙ МАТРИЦЫ
// ============================================
function calculateChildMatrix() {
    const nameInput = document.getElementById('childNameInput');
    const dateInput = document.getElementById('childDateInput');

    if (!nameInput || !dateInput) {
        console.warn('Поля детской матрицы не найдены на странице');
        return;
    }

    if (!dateInput.value) {
        alert('Пожалуйста, введите дату рождения ребёнка!');
        return;
    }

    const name = (nameInput.value && nameInput.value.trim()) || 'Ребёнок';
    const date = dateInput.value;

    const resultBlock = document.getElementById('child-result');
    const loader = document.getElementById('child-loader');

    if (resultBlock) resultBlock.style.display = 'none';
    if (loader) loader.style.display = 'flex';

    setTimeout(() => {
        try {
            // Расчёт матрицы
            const data = calculateMatrixData(date);
            const nameNum = calculateNameNumber(name);
            const safeName = escapeHTML(name);
            const lifePath = data.master || data.lp;

            // Заголовок
            const titleEl = document.getElementById('child-result-title');
            if (titleEl) {
                titleEl.innerHTML = `Матрица Пифагора для: <span style="color:var(--gold)">${safeName}</span>`;
            }

            // Вспомогательная функция для отображения цифр
            const getS = (n) => {
                let s = '';
                for (let k = 0; k < (data.c[n] || 0); k++) s += n;
                return s || '—';
            };

        // Таблица 17 ячеек
        const tableHtml = `
            <div class="matrix-grid matrix-compact" style="margin-top:20px;">
                <div class="matrix-cell"><span class="cell-title">Характер (1)</span><span class="cell-value">${getS(1)}</span></div>
                <div class="matrix-cell"><span class="cell-title">Здоровье (4)</span><span class="cell-value">${getS(4)}</span></div>
                <div class="matrix-cell"><span class="cell-title">Удача (7)</span><span class="cell-value">${getS(7)}</span></div>
                <div class="matrix-cell summary"><span class="cell-title">Цель</span><span class="cell-value">${data.goal}</span></div>
                <div class="matrix-cell"><span class="cell-title">Энергия (2)</span><span class="cell-value">${getS(2)}</span></div>
                <div class="matrix-cell"><span class="cell-title">Логика (5)</span><span class="cell-value">${getS(5)}</span></div>
                <div class="matrix-cell"><span class="cell-title">Долг (8)</span><span class="cell-value">${getS(8)}</span></div>
                <div class="matrix-cell summary"><span class="cell-title">Семья</span><span class="cell-value">${data.family}</span></div>
                <div class="matrix-cell"><span class="cell-title">Интерес (3)</span><span class="cell-value">${getS(3)}</span></div>
                <div class="matrix-cell"><span class="cell-title">Труд (6)</span><span class="cell-value">${getS(6)}</span></div>
                <div class="matrix-cell"><span class="cell-title">Память (9)</span><span class="cell-value">${getS(9)}</span></div>
                <div class="matrix-cell summary"><span class="cell-title">Привычки</span><span class="cell-value">${data.habits}</span></div>
                <div class="matrix-cell summary"><span class="cell-title">Самооценка</span><span class="cell-value">${data.self}</span></div>
                <div class="matrix-cell summary"><span class="cell-title">Быт</span><span class="cell-value">${data.life}</span></div>
                <div class="matrix-cell summary"><span class="cell-title">Талант</span><span class="cell-value">${data.talent}</span></div>
                <div class="matrix-cell summary"><span class="cell-title">Дух</span><span class="cell-value">${data.spirit}</span></div>
                <div class="matrix-cell temp"><span class="cell-title">Темперамент</span><span class="cell-value">${data.temp}</span></div>
            </div>
            <p style="color:#aaa; font-size:0.85rem; margin-top:10px; text-align:center;">
                Число имени: <strong>${nameNum}</strong> | Число судьбы: <strong>${lifePath}</strong>
            </p>
        `;

        document.getElementById('child-pythagoras-table').innerHTML = tableHtml;
// ------------------- РАСШИРЕННЫЕ ТРАКТОВКИ -------------------
let charHtml = '';
if (data.c[1] <= 1) {
    charHtml = `<strong>Мягкий, уступчивый характер.</strong> ${safeName} избегает конфликтов, легко поддаётся влиянию. Ему сложно сказать «нет» и отстоять своё мнение. В играх он скорее ведомый, чем лидер. Родителям важно не давить, а мягко подталкивать к самостоятельным решениям. Хвалите за любые проявления инициативы — даже за выбор между яблоком и грушей. Так вы поможете воспитать внутренний стержень без надлома.`;
} else if (data.c[1] >= 4) {
    charHtml = `<strong>Сильный, волевой, упрямый.</strong> ${safeName} с ранних лет стремится к самостоятельности, часто спорит и проверяет границы. Это будущий лидер, но его энергию нужно направлять в мирное русло. Запреты и приказы вызывают бунт, поэтому договаривайтесь на равных. Дайте ему зону ответственности (например, выбор одежды или порядок в игрушках) — он расцветёт. Учите проигрывать без истерик через настольные игры и спорт.`;
} else {
    charHtml = `<strong>Уравновешенный, гибкий характер.</strong> ${safeName} умеет и настоять на своём, и уступить, когда это разумно. Он легко находит общий язык с разными детьми, не стремится доминировать, но и не даёт себя в обиду. Это золотая середина. Поддерживайте его естественное чувство меры, поощряйте и лидерские, и командные игры.`;
}

let energyHtml = '';
if (data.c[2] <= 1) {
    energyHtml = `<strong>Низкий запас энергии.</strong> ${safeName} быстро устаёт, нуждается в частом отдыхе и спокойной обстановке. Шумные праздники и большие компании его истощают. Идеальный режим: короткие, но продуктивные занятия с перерывами. Не заставляйте его «догонять» активных сверстников — это путь к неврозам. Вместо этого учите его восстанавливаться: тихий час, рисование, аудиосказки. При правильном ритме он будет успевать не меньше, но без вреда для здоровья.`;
} else if (data.c[2] >= 4) {
    energyHtml = `<strong>Очень высокий уровень энергии.</strong> ${safeName} — настоящий «энерджайзер». Ему жизненно необходимо много двигаться, иначе он становится капризным и неуправляемым. Спорт, танцы, активные прогулки — его стихия. Но важно учить его и расслабляться, иначе рискуете получить перевозбуждение и проблемы со сном. Введите ритуалы засыпания, ограничьте гаджеты перед сном. Направляйте его неуёмную энергию в творчество или помощь по дому — он будет счастлив быть полезным.`;
} else {
    energyHtml = `<strong>Сбалансированная энергия.</strong> ${safeName} активен в меру: может и побегать, и спокойно посидеть за книжкой. Он легко переключается между разными видами деятельности. Следите, чтобы нагрузки были равномерными, и обязательно оставляйте время на свободную игру без правил — это лучший способ восстановления для такого ребёнка.`;
}

let interestHtml = '';
if (data.c[3] <= 1) {
    interestHtml = `<strong>Практический склад ума.</strong> ${safeName} лучше всего учится через действия, а не через слушание или чтение. Ему трудно усидеть за партой, он познаёт мир руками: разобрать, собрать, пощупать. Не ругайте за «неусидчивость» — это его способ познания. Предлагайте конструкторы, опыты, кулинарию, работу с инструментами. В школе делайте упор на наглядные пособия и короткие видеоуроки. Его девиз: «Лучше один раз сделать, чем сто раз услышать».`;
} else if (data.c[3] >= 4) {
    interestHtml = `<strong>Высокий познавательный интерес.</strong> ${safeName} — прирождённый исследователь. Он задаёт миллион вопросов, любит энциклопедии, научные шоу. Его мозг требует постоянной подпитки новыми знаниями. Важно не перегрузить: такой ребёнок может забывать о еде и отдыхе, увлёкшись очередной темой. Поддерживайте его увлечения, водите в музеи, покупайте книги. Но следите за балансом: спорт и прогулки обязательны.`;
} else {
    interestHtml = `<strong>Умеренный интерес к познанию.</strong> ${safeName} учится с удовольствием, когда тема ему близка, и может «отключаться», если скучно. Его мотивация сильно зависит от подачи материала. Старайтесь превращать учёбу в игру, связывать с его хобби. Тогда он покажет отличные результаты.`;
}

let healthHtml = '';
if (data.c[4] <= 1) {
    healthHtml = `<strong>Чувствительное здоровье.</strong> Организм ${safeName} требует бережного отношения. Он может чаще сверстников простужаться, быстро утомляться. Важно соблюдать режим дня, полноценное питание и достаточно сна. Закаливание вводите очень мягко. Не ругайте за «слабость» — его ресурс ограничен от природы. Зато при правильном уходе он научится слышать свой организм и вырастет осознанным в вопросах здоровья.`;
} else if (data.c[4] >= 4) {
    healthHtml = `<strong>Крепкое здоровье от природы.</strong> ${safeName} обладает хорошим иммунитетом и выносливостью. Он редко болеет, быстро восстанавливается. Однако есть риск переоценить его силы: он может не замечать усталости и перегружаться. Следите, чтобы он не «загонял» себя на тренировках или в учёбе. Профилактические осмотры и разумный режим сохранят этот дар на долгие годы.`;
} else {
    healthHtml = `<strong>Нормальное здоровье.</strong> ${safeName} болеет среднестатистически, без серьёзных хронических проблем. Поддерживайте стандартные меры: прогулки, витамины, спорт по настроению. Особых ограничений нет.`;
}
        
        // ------------------- ФОРМИРОВАНИЕ ЕДИНОГО БЛОКА РАСШИФРОВКИ -------------------
let decodeHtml = `<h3 class="child-decode-title" style="justify-content:center; border-bottom:none;">✨ Краткий портрет ${safeName}</h3>`;

// --- ХАРАКТЕР ---
decodeHtml += `<div class="child-decode-block">
    <div class="child-decode-title"><i class="fa-solid fa-crown"></i> Характер</div>
    <div class="child-decode-text">${charHtml}</div>
</div>`;

// --- ЭНЕРГИЯ ---
decodeHtml += `<div class="child-decode-block">
    <div class="child-decode-title"><i class="fa-solid fa-bolt"></i> Энергия</div>
    <div class="child-decode-text">${energyHtml}</div>
</div>`;

// --- ПОЗНАНИЕ ---
decodeHtml += `<div class="child-decode-block">
    <div class="child-decode-title"><i class="fa-solid fa-brain"></i> Познание</div>
    <div class="child-decode-text">${interestHtml}</div>
</div>`;

// --- ЗДОРОВЬЕ ---
decodeHtml += `<div class="child-decode-block">
    <div class="child-decode-title"><i class="fa-solid fa-heart-pulse"></i> Здоровье</div>
    <div class="child-decode-text">${healthHtml}</div>
</div>`;

// --- ЧИСЛО СУДЬБЫ (из внешнего файла) ---
const lifePathData = (typeof childLifePathTexts !== 'undefined') ? childLifePathTexts[lifePath] : null;
const lifePathDesc = (lifePathData && lifePathData.description) 
    ? lifePathData.description 
    : "<p>Уникальный путь, который раскроется с вашей поддержкой и любовью.</p>";

decodeHtml += `<div class="child-decode-block child-decode-highlight">
    <div class="child-decode-title"><i class="fa-solid fa-star"></i> Число судьбы ${lifePath}</div>
    <div class="child-decode-text">${lifePathDesc}</div>
</div>`;

// --- СЧАСТЛИВЫЕ ПОДСКАЗКИ ---
const luckyNum = ((nameNum + data.lp) % 9) || 9;
const luckyColors = ["Красный", "Оранжевый", "Жёлтый", "Зелёный", "Голубой", "Синий", "Фиолетовый", "Розовый", "Золотой"];
const luckyColor = luckyColors[luckyNum - 1] || "Золотой";

decodeHtml += `<div class="child-decode-block" style="border-left-color: var(--gold);">
    <div class="child-decode-title"><i class="fa-solid fa-clover"></i> Талисманы</div>
    <div class="child-decode-text" style="text-align:center;">
        <span style="font-size:1.2rem;">🍀 Счастливое число: <strong style="color:var(--gold);">${luckyNum}</strong> &nbsp;|&nbsp; 🎨 Цвет силы: <strong style="color:var(--gold);">${luckyColor}</strong></span>
    </div>
</div>`;

// --- КЛЮЧ К ТЕМПЕРАМЕНТУ ---
let tempAdvice = '';
if (data.temp >= 5) tempAdvice = 'Очень активный, эмоциональный. Ему нужен спорт, чёткие границы и возможность выплеснуть энергию.';
else if (data.temp >= 3) tempAdvice = 'Живой, но управляемый. Хорошо отзывается на похвалу и совместные игры.';
else if (data.temp <= 1) tempAdvice = 'Спокойный, вдумчивый. Ему нужен тихий уголок, время на размышления и минимум давления.';
else tempAdvice = 'Уравновешенный. Легко адаптируется, но иногда нуждается в мягком подталкивании.';

decodeHtml += `<div class="child-decode-block">
    <div class="child-decode-title"><i class="fa-solid fa-temperature-half"></i> Темперамент</div>
    <div class="child-decode-text">${tempAdvice}</div>
</div>`;

// --- ЧИСЛО ИМЕНИ (открытый блок с объёмным описанием) ---
const nameDescriptions = {
    1: `<strong>Число имени 1 — Лидер и Первопроходец.</strong> ${safeName} обладает яркой индивидуальностью и стремлением быть первым. Это ребёнок, который хочет всё делать сам, часто командует в играх и не любит, когда его ограничивают. Его энергия направлена на достижение целей, и он готов преодолевать препятствия. Родителям важно давать ему пространство для самостоятельности, но мягко направлять, чтобы лидерство не переросло в упрямство. Хвалите за инициативу, учите слушать других и договариваться.`,
    2: `<strong>Число имени 2 — Дипломат и Миротворец.</strong> ${safeName} очень чувствителен к настроению окружающих, стремится к гармонии и избегает конфликтов. Это мягкий, заботливый ребёнок, который нуждается в одобрении и поддержке. Он может быть нерешительным и зависимым от чужого мнения. Родителям важно создавать атмосферу безопасности, поощрять его высказывать своё мнение и учить отстаивать личные границы. Развивайте его природную эмпатию через заботу о животных или младших детях.`,
    3: `<strong>Число имени 3 — Творец и Вдохновитель.</strong> ${safeName} — артистичный, общительный и жизнерадостный ребёнок. Он любит быть в центре внимания, легко заводит друзей и обладает богатой фантазией. Его слабость — поверхностность и неорганизованность. Родителям нужно направлять его творческую энергию в конструктивное русло (рисование, музыка, театр), учить доводить дела до конца и не распыляться. Хвалите за креативность, но прививайте дисциплину.`,
    4: `<strong>Число имени 4 — Строитель и Основатель.</strong> ${safeName} — надёжный, ответственный и трудолюбивый ребёнок. Он ценит порядок, стабильность и предсказуемость. Может быть упрямым и медлительным, но зато доводит начатое до конца. Родителям важно обеспечить ему чёткий режим дня и понятные правила. Поощряйте его усидчивость и практические навыки (конструирование, рукоделие), учите гибкости и тому, что иногда можно отступать от плана.`,
    5: `<strong>Число имени 5 — Искатель приключений и Свободолюбец.</strong> ${safeName} — любознательный, подвижный и непоседливый ребёнок. Он обожает всё новое, легко адаптируется к переменам и не выносит скуки. Его слабость — непостоянство и нетерпеливость. Родителям нужно давать ему разнообразие впечатлений (кружки, поездки), но при этом учить концентрации и ответственности. Объясняйте, что свобода не равна вседозволенности, и ставьте мягкие, но чёткие границы.`,
    6: `<strong>Число имени 6 — Хранитель и Целитель.</strong> ${safeName} — заботливый, ответственный и очень семейный ребёнок. Он стремится всем помочь, любит животных и младших детей. Может быть слишком тревожным и брать на себя чужую вину. Родителям важно учить его заботиться и о себе, не растворяться в других. Создавайте тёплую домашнюю атмосферу, поощряйте его помогать, но следите, чтобы он не перегружался эмоционально.`,
    7: `<strong>Число имени 7 — Мыслитель и Искатель истины.</strong> ${safeName} — вдумчивый, спокойный и немного замкнутый ребёнок. Он любит уединение, чтение, размышления. Ему трудно в шумных компаниях, он задаёт глубокие вопросы. Родителям не стоит навязывать ему общение, уважайте его потребность в личном пространстве. Развивайте его аналитические способности (шахматы, головоломки), но следите, чтобы он не уходил полностью в свой внутренний мир.`,
    8: `<strong>Число имени 8 — Властелин и Организатор.</strong> ${safeName} — амбициозный, волевой и целеустремлённый ребёнок. Он стремится к лидерству, любит соревнования и материальные поощрения. Может быть властным и нетерпимым к слабостям. Родителям важно направлять его энергию в спорт или проекты, учить честной игре и уважению к соперникам. Объясняйте, что сила — это ответственность, а не превосходство.`,
    9: `<strong>Число имени 9 — Мудрец и Гуманист.</strong> ${safeName} — добрый, отзывчивый и мечтательный ребёнок. Он сострадателен, любит природу и часто кажется старше своих лет. Может быть рассеянным и витать в облаках. Родителям нужно поддерживать его идеалы, учить практичности и заботе о себе. Поощряйте волонтёрство или помощь другим, но следите за балансом, чтобы он не истощался.`,
    11: `<strong>Мастер-число 11 — Вдохновитель и Интуит.</strong> ${safeName} обладает особой чувствительностью и интуицией. Он словно считывает эмоции и мысли окружающих. Это творческая, одухотворённая натура с богатым внутренним миром. Может быть нервным и тревожным. Родителям важно создать спокойную, гармоничную обстановку, учить его заземляться через физическую активность и творчество. Поддерживайте его идеи, даже если они кажутся нереальными.`,
    22: `<strong>Мастер-число 22 — Архитектор и Созидатель.</strong> ${safeName} — прирождённый организатор и стратег. Он способен видеть общую картину и воплощать грандиозные планы. Это серьёзный, ответственный ребёнок с практической хваткой. Может быть перфекционистом и требовать слишком многого от себя. Родителям важно учить его делегировать, отдыхать и не бояться ошибок. Поддерживайте его амбициозные проекты, но следите за балансом учёбы и отдыха.`,
    33: `<strong>Мастер-число 33 — Учитель и Служитель.</strong> ${safeName} обладает огромным сердцем и желанием помогать другим. Он альтруистичен, мудр не по годам и часто становится моральным авторитетом среди сверстников. Его главная опасность — самопожертвование и эмоциональное выгорание. Родителям важно учить его говорить «нет», заботиться о себе и не брать на себя чужие проблемы. Поощряйте его добрые дела, но напоминайте о собственных границах.`
};

const nameDescText = nameDescriptions[nameNum] || `<strong>Число имени ${nameNum}.</strong> У ${safeName} уникальная энергия имени, которая раскроется с вашей поддержкой.`;

decodeHtml += `<div class="child-decode-block">
    <div class="child-decode-title"><i class="fa-solid fa-signature"></i> Число имени ${nameNum}</div>
    <div class="child-decode-text">${nameDescText}</div>
</div>`;

// --- ИТОГОВАЯ РЕКОМЕНДАЦИЯ ---
decodeHtml += `<div class="child-decode-block" style="background:rgba(212,175,55,0.05);">
    <div class="child-decode-title"><i class="fa-solid fa-key"></i> Ключ к воспитанию</div>
    <div class="child-decode-text">${safeName} важно чувствовать вашу поддержку. ${data.goal >= 4 ? 'Ставьте вместе маленькие цели и хвалите за достижения.' : 'Не давите, давайте время на размышления.'} ${data.family >= 4 ? 'Семейные традиции и ритуалы дают чувство безопасности.' : 'Уважайте его личное пространство.'}</div>
</div>`;

document.getElementById('child-pythagoras-decode').innerHTML = decodeHtml;
        
        document.getElementById('child-pythagoras-decode').innerHTML = decodeHtml;

        document.getElementById('child-loader').style.display = 'none';
        document.getElementById('child-result').style.display = 'block';

         } catch (error) {
        console.error('Ошибка в детской матрице:', error);
        alert('Во время расчёта произошла ошибка. Обновите страницу.');
        const loader = document.getElementById('child-loader');
        if (loader) loader.style.display = 'none';
    }
    }, 1000);
}
  
/* ============================================
   ФИНАНСОВЫЙ АРХЕТИП – ЛЕНИВАЯ ЗАГРУЗКА
   ============================================ */

function calculateMoneyMatrix() {
    if (window._moneyLoaded) {
        // файл уже загружен, сразу вызываем реальную функцию
        window._realCalculateMoneyMatrix();
    } else {
        // загружаем модуль
        const script = document.createElement('script');
        script.src = 'js/money.js';
        script.onload = function() {
            window._realCalculateMoneyMatrix();
        };
        document.head.appendChild(script);
    }
}

function calculateMoneyCompat() {
    if (window._moneyLoaded) {
        window._realCalculateMoneyCompat();
    } else {
        const script = document.createElement('script');
        script.src = 'js/money.js';
        script.onload = function() {
            window._realCalculateMoneyCompat();
        };
        document.head.appendChild(script);
    }
}

/* ============================================
   РАСЧЁТ ФИНАНСОВ ПАРЫ (КОНСТРУКТОР СМЫСЛОВ)
   ============================================ */
function calculateMoneyCompat() {
    const name1 = document.getElementById('moneyName1').value.trim() || "Мужчина";
    const date1 = document.getElementById('moneyDate1').value;
    const name2 = document.getElementById('moneyName2').value.trim() || "Женщина";
    const date2 = document.getElementById('moneyDate2').value;

    if(!date1 || !date2) return alert("Введите даты обоих партнёров!");

    // Лоадер
    document.getElementById('result-money-compat').style.display = 'none';
    document.getElementById('loader-money-compat').style.display = 'flex';

    // Показываем кнопку PDF, если есть премиум-доступ
    if (premiumAccess) {
    const pdfBtn = document.getElementById('download-money-pdf');
    if (pdfBtn) pdfBtn.style.display = 'inline-block';
}

    setTimeout(() => {
        // --- МАТЕМАТИКА ---
        const reduce22 = (n) => {
            let res = n;
            while (res > 22) res = res.toString().split('').reduce((a, b) => +a + +b, 0);
            return res;
        };

        const getMoneyCode = (dStr) => {
            const d = new Date(dStr);
            // Для Личных денег в паре берем: День + Месяц (Таланты + Личность)
            // Это самая точная характеристика для "Стиля поведения в деньгах"
            return reduce22(d.getDate() + (d.getMonth() + 1));
        };

        // 1. Код Мужчины
        const codeMale = getMoneyCode(date1);

        // 2. Код Женщины
        const codeFemale = getMoneyCode(date2);

        // 3. Код Пары
        const codePair = reduce22(codeMale + codeFemale);

        // --- ВЫВОД ЦИФР ---
        document.getElementById('compat-val-1').innerText = codeMale;
        document.getElementById('compat-val-2').innerText = codeFemale;
        document.getElementById('compat-val-total').innerText = codePair;

        const safeName1 = escapeHTML(name1);
        const safeName2 = escapeHTML(name2);
document.getElementById('money-compat-names').innerHTML = 
    `<span style="color:#54a0ff">${safeName1}</span> + <span style="color:#ff9ff3">${safeName2}</span>`;
        // --- СБОРКА ТЕКСТА (КОНСТРУКТОР) ---
        
        // Функция безопасного получения текста (если в базе пусто)
        const getData = (num) => moneyCompatData[num] || { 
            male: "<p>Описание мужчины готовится...</p>", 
            female: "<p>Описание женщины готовится...</p>", 
            pair: "<p>Описание союза готовится...</p>" 
        };

        const textMale = getData(codeMale).male;     // Берём текст "Он" для его цифры
        const textFemale = getData(codeFemale).female; // Берём текст "Она" для её цифры
        const textPair = getData(codePair).pair;     // Берём текст "Пара" для общей цифры

        // Формируем красивый HTML
        document.getElementById('desc-money-total').innerHTML = `
            
            <!-- БЛОК МУЖЧИНЫ -->
            <div class="trait-block" style="border-left: 4px solid #54a0ff; margin-bottom: 25px;">
                <h4 style="color:#54a0ff; margin-bottom:15px; font-size:1.2rem;">
                    <i class="fa-solid fa-mars"></i> Его Денежный Стиль (Аркан ${codeMale})
                </h4>
                ${textMale}
            </div>

            <!-- БЛОК ЖЕНЩИНЫ -->
            <div class="trait-block" style="border-left: 4px solid #ff9ff3; margin-bottom: 25px;">
                <h4 style="color:#ff9ff3; margin-bottom:15px; font-size:1.2rem;">
                    <i class="fa-solid fa-venus"></i> Её Денежный Стиль (Аркан ${codeFemale})
                </h4>
                ${textFemale}
            </div>

            <!-- БЛОК ПАРЫ -->
            <div class="trait-block" style="border-left: 4px solid var(--gold); background: rgba(255, 215, 0, 0.08);">
                <h4 style="color:var(--gold); margin-bottom:15px; font-size:1.3rem;">
                    <i class="fa-solid fa-sack-dollar"></i> Ваш Совместный Поток (Аркан ${codePair})
                </h4>
                ${textPair}
            </div>
        `;

        document.getElementById('loader-money-compat').style.display = 'none';
        document.getElementById('result-money-compat').style.display = 'block';

    }, 1500);
}

/* ============================================
   РОДИТЕЛЬ-РЕБЁНОК – ЛЕНИВАЯ ЗАГРУЗКА
   ============================================ */
async function calculateParentChild() {
    if (window._parentChildLoaded) {
        await window._realCalculateParentChild();
    } else {
        const script = document.createElement('script');
        script.src = 'js/parent-child.js';
        script.onload = async function() {
            await window._realCalculateParentChild();
        };
        document.head.appendChild(script);
    }
}
/* ============================================
   ПЛАВНОЕ ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ ФИНАНСОВ
   ============================================ */
function switchMoneyMode(mode) {
    const personal = document.getElementById('money-personal-block');
    const pair = document.getElementById('money-pair-block');
    const btns = document.querySelectorAll('.mode-btn');

    // Функция для плавной смены
    const fadeSwap = (hideEl, showEl) => {
        hideEl.style.opacity = '0';
        hideEl.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            hideEl.style.display = 'none';
            
            showEl.style.display = 'block';
            // Небольшая задержка, чтобы браузер отрисовал блок перед анимацией
            setTimeout(() => {
                showEl.style.opacity = '1';
                showEl.classList.add('fade-in'); // Добавляем CSS анимацию
            }, 50);
        }, 300); // Ждем пока исчезнет старый (0.3s)
    };

    if (mode === 'personal') {
        if (personal.style.display !== 'none') return; // Уже активен
        fadeSwap(pair, personal);
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        if (pair.style.display !== 'none') return; // Уже активен
        fadeSwap(personal, pair);
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
}
function toggleWidget() {
    const widget = document.getElementById('daily-widget');
    widget.classList.toggle('active'); // Эта строка будет добавлять/убирать класс active
}

// Функция для получения красивого описания числа судьбы
function getLifePathDescription(lifePath) {
    const descriptions = {
        1: "Вы — лидер и первопроходец. Ваша сила в независимости, амбициях и умении прокладывать новые пути. Вдохновляете других своей уверенностью и решительностью.",
        2: "Вы — дипломат и миротворец. Ваш дар — создавать гармонию, находить компромиссы и чувствовать людей на глубоком уровне. Вы — надёжный партнёр и хранитель равновесия.",
        3: "Вы — творец и вдохновитель. Ваша стихия — радость, общение и креативность. Вы способны зажигать сердца и дарить миру красоту своими идеями и талантом.",
        4: "Вы — строитель и основатель. Надёжность, дисциплина и практичность — ваши главные союзники. Вы создаёте прочные структуры и доводите дела до совершенства.",
        5: "Вы — искатель приключений и свободная душа. Вас манят перемены, путешествия и новый опыт. Ваша гибкость и любознательность открывают все двери.",
        6: "Вы — хранитель очага и целитель. Любовь, забота и ответственность — ваша суть. Вы создаёте уют, поддерживаете близких и исцеляете теплом своего сердца.",
        7: "Вы — мыслитель и мистик. Глубина, интуиция и поиск истины — ваш путь. Вы видите скрытое и способны проникать в самую суть вещей и явлений.",
        8: "Вы — властелин и магнат. Ваша энергия — это сила, изобилие и власть. Вы рождены управлять ресурсами и создавать империи, сохраняя баланс между материальным и духовным.",
        9: "Вы — мудрец и гуманист. Вселенская любовь, сострадание и служение миру — ваше предназначение. Вы завершаете циклы и делитесь мудростью, вдохновляя других.",
        11: "Вы — мастер-число, обладающий высокой интуицией и духовным видением. Вы — мост между мирами, способный вдохновлять и вести за собой, неся свет и идеи.",
        22: "Вы — мастер-строитель. Вы способны воплощать грандиозные идеи в реальность, создавая проекты, которые меняют мир. Ваша сила — в видении и реализации.",
        33: "Вы — мастер-учитель. Ваша миссия — бескорыстное служение и любовь к человечеству. Вы исцеляете сердца и ведёте других к просветлению."
    };
    return descriptions[lifePath] || "Ваше число судьбы хранит уникальный потенциал и миссию.";
}
// Функция для генерации изображения и открытия модального окна шаринга
async function shareWithImage() {
    // Получаем данные с главной страницы
    const userName = document.getElementById('userName')?.value || 'Гость';
    const lifePath = document.getElementById('life-path-matrix')?.textContent || '?';
    const luckyNumber = document.getElementById('lucky-number')?.textContent || '—';
    const luckyElement = document.getElementById('lucky-element')?.textContent || '—';

    // Находим шаблон и клонируем его
    const template = document.getElementById('share-card-template');
    if (!template) return;

    const element = template.cloneNode(true);
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '600px';
    
    // Заполняем данные в карточке
    element.querySelector('#share-card-name').textContent = userName;
    element.querySelector('#share-card-lifepath').textContent = lifePath;
    element.querySelector('#share-card-lucky').textContent = luckyNumber;
    element.querySelector('#share-card-element').textContent = luckyElement;

    document.body.appendChild(element);

    // Показываем модальное окно с индикатором загрузки
    const modal = document.getElementById('share-image-modal');
    const container = document.getElementById('share-image-container');
    container.innerHTML = '<p style="color:#aaa;">Генерируем изображение...</p>';
    modal.style.display = 'flex';

    try {
        // Генерируем изображение
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#1a1a2e',
            allowTaint: false,
            useCORS: true
        });

        const imageData = canvas.toDataURL('image/png');
        container.innerHTML = `<img src="${imageData}" style="width:100%; border-radius:10px;">`;

        // Получаем описание числа судьбы (только для текста поста)
        const description = getLifePathDescription(parseInt(lifePath));
        const shareText = `✨ Мой нумерологический портрет от ASTRA! ✨\n\n${description}\n\nПрисоединяйтесь: ${window.location.href}`;
        
        // Вставляем текст в обычный div
        const postDiv = document.getElementById('share-post-text');
        if (postDiv) {
            postDiv.textContent = shareText;
        }

        // Обновляем ссылки для соцсетей
        document.getElementById('share-vk').href = `https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareText)}&image=${encodeURIComponent(imageData)}`;
        document.getElementById('share-tg').href = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
        document.getElementById('share-ok').href = `https://connect.ok.ru/dk?st.cmd=WidgetShare&st.shareUrl=${encodeURIComponent(window.location.href)}&st.title=${encodeURIComponent(shareText)}`;

    } catch (error) {
        console.error('Ошибка генерации:', error);
        container.innerHTML = '<p style="color:red;">Ошибка генерации. Попробуйте ещё раз.</p>';
    } finally {
        // Удаляем временный элемент
        document.body.removeChild(element);
    }
}
// Функция для скачивания сгенерированной картинки
function downloadShareImage() {
    const img = document.querySelector('#share-image-container img');
    if (!img) return;
    const link = document.createElement('a');
    link.download = 'matrix-result.png';
    link.href = img.src;
    link.click();
}

// Тексты для мастер-чисел
const masterMeanings = {
    11: `
       <p class="profile-title">
            <span>✦</span> Аналитик-интуит <span>✦</span>
        </p>
        
        <div class="profile-content" style="
            text-align: left; 
            font-size: 0.95rem; 
            line-height: 1.7; 
            color: #eee; 
            padding: 0 10px;
        ">
            <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ ПСИХОТИП ✦ </span><br>
            Обладает сверхчувствительной нервной системой и способностью к мгновенной обработке неявных сигналов. Вы замечаете микро‑изменения в поведении людей и рыночных трендах раньше, чем они становятся очевидными для большинства.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ ИНТЕЛЛЕКТУАЛЬНЫЙ РЕСУРС ✦ </span><br>
            Глубокое эмпатическое прогнозирование. Ваш мозг работает как сложный радар, выявляя скрытые причинно‑следственные связи. Вы эффективны в генерации нестандартных идей и поиске инновационных решений там, где классические методы заходят в тупик.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ РИСКИ И БАРЬЕРЫ ✦ </span><br>
            Склонность к когнитивной перегрузке и повышенной тревожности. Избыток информации может приводить к состоянию «аналитического паралича», когда сложно сделать первый шаг. Частое ощущение внутреннего одиночества из‑за высокой скорости мышления.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ СТРАТЕГИЯ РЕАЛИЗАЦИИ ✦ </span><br>
            Консалтинг высокого уровня, психоанализ, медиа‑стратегии, инновационный менеджмент. Ваша задача — переводить сложные интуитивные догадки на язык понятных инструкций и вдохновлять команду на качественные изменения.
        </p>
        
        <p style="margin-top: 25px; font-style: italic; color: var(--gold); text-align: center; border-top: 1px solid rgba(212,175,55,0.2); padding-top: 15px;">
            "Ваш путь — это интеллектуальное лидерство через понимание скрытых процессов".
        </p>
    </div>
    `,


    // ─────────────────────────────────────────────────────────────
    //  ПРОФИЛЬ 22: Системный архитектор и масштабный организатор
    // ─────────────────────────────────────────────────────────────
    22: `
        <p class="profile-title">
            <span>✦</span> Системный архитектор <span>✦</span>
        </p>
        
        <div class="profile-content" style="
            text-align: left; 
            font-size: 0.95rem; 
            line-height: 1.7; 
            color: #eee; 
            padding: 0 10px;
        ">
            <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ ПСИХОТИП ✦ </span><br>
            Обладает исключительным организационным потенциалом и системным мышлением. Вы способны не просто придумать концепцию, но и выстроить под неё работающую структуру, способную функционировать автономно.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ ПРАГМАТИЧЕСКИЙ РЕСУРС ✦ </span><br>
            Навык масштабного моделирования. Вы видите проект сразу в трёх измерениях: идея, ресурсы, результат. У вас есть редкое сочетание волевых качеств и способности к долгосрочному планированию, что позволяет реализовывать проекты государственного или международного уровня.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ РИСКИ И БАРЬЕРЫ ✦ </span><br>
            Высокий уровень стресса из-за масштаба ответственности. Склонность к трудоголизму и авторитарному стилю управления. Главный риск — подавление окружающих своим темпом работы и жёсткий перфекционизм по отношению к себе и близким.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ СТРАТЕГИЯ РЕАЛИЗАЦИИ ✦ </span><br>
            Крупное предпринимательство, управление сложными техническими или социальными системами, масштабное производство. Ваша задача — создавать долговечные структуры, которые продолжат работать и приносить пользу вне зависимости от вашего участия.
        </p>
        
        <p style="margin-top: 25px; font-style: italic; color: var(--gold); text-align: center; border-top: 1px solid rgba(212,175,55,0.2); padding-top: 15px;">
            "Ваш путь — это создание фундаментальных систем и управление реальностью через порядок".
        </p>
        </div>
    `,


    // ─────────────────────────────────────────────────────────────
    //  ПРОФИЛЬ 33: Гуманитарный лидер и эксперт по развитию личности
    // ─────────────────────────────────────────────────────────────
    33: `
        <p class="profile-title">
            <span>✦ Гуманитарный лидер ✦</span>
        </p>
        
        <div class="profile-content" style="
            text-align: left; 
            font-size: 0.95rem; 
            line-height: 1.7; 
            color: #eee; 
            padding: 0 10px;
        ">
            <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ ПСИХОТИП ✦ </span><br>
            Высший уровень развития социального интеллекта. Вы обладаете врождённым авторитетом, основанным не на силе, а на глубоком понимании человеческой психологии и этики. Люди подсознательно признают ваше право быть наставником.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ СОЦИАЛЬНЫЙ РЕСУРС ✦ </span><br>
            Глубинная эмпатия и дар убеждения. Вы способны разрешать конфликты любой сложности, находя «золотую середину». Ваша сила — в умении обучать и развивать других, делая их лучшей версией себя. Вы являетесь «этическим компасом» для своего окружения.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ РИСКИ И БАРЬЕРЫ ✦ </span><br>
            Эмоциональное выгорание из-за чрезмерного вовлечения в проблемы других. Склонность к самопожертвованию в ущерб личным интересам. Опасность разочарования в людях, если их поведение не соответствует вашим высоким моральным стандартам.
        </p>
        
        <p style="margin-bottom: 20px;">
            <span style="color: var(--gold); font-weight: 600; letter-spacing: 1px;">✦ СТРАТЕГИЯ РЕАЛИЗАЦИИ ✦ </span><br>
            Наставничество, педагогика высшей школы, дипломатия, руководство гуманитарными проектами, психотерапия. Ваша задача — быть эталоном профессионализма и человечности, задавая вектор развития для всего общества.
        </p>
        
        <p style="margin-top: 25px; font-style: italic; color: var(--gold); text-align: center; border-top: 1px solid rgba(212,175,55,0.2); padding-top: 15px;">
            "Ваш путь — это социальное служение и развитие человеческого потенциала через личный пример".
        </p>
        </div>`
};

// Функция открытия окна
function showMasterInfo(num) {
    const title = document.getElementById('master-title');
    const text = document.getElementById('master-text');
    const modal = document.getElementById('master-modal');
    
    if (title && text && modal) {
        title.innerText = "Мастер-число " + num;
        text.innerHTML = masterMeanings[num];
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Запрет прокрутки
    }
}

// Функция закрытия окна
function closeMasterModal() {
    const modal = document.getElementById('master-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Возврат прокрутки
    }
}

function showChildMatrixSection() {
    // Показываем секцию child-matrix
    //console.log('showChildMatrixSection вызвана');
    showSection('child-matrix');
    // Плавно прокручиваем к этой секции
    const section = document.getElementById('child-matrix');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// ВЗАИМОСВЯЗИ МЕЖДУ ЯЧЕЙКАМИ (НОВЫЙ РАЗДЕЛ)
// ============================================

// Введение
const interconnectionsIntro = `
<details class="decode-card">
    <summary class="decode-header" style="cursor: pointer; list-style: none;">
        <span class="decode-title">🔗 Взаимосвязи между ячейками</span>
        <span style="float: right;">▼</span>
    </summary>
    <div class="decode-text" style="padding: 0;">
        <p><em>Квадрат Пифагора — это не набор отдельных качеств, а живая система, где каждый элемент влияет на другие. Понимание взаимосвязей позволяет увидеть целостную картину личности, объяснить внутренние конфликты и найти скрытые ресурсы.</em></p>
        <div id="interconnections-content"></div>
    </div>
</details>
`;
// ЧАСТЬ 1: КОМПЕНСАТОРНЫЕ МЕХАНИЗМЫ (без отдельного <details>)
function getCompensationsHTML(c, data) {
    let html = '';
    // 1.1 Компенсация слабого характера (цифра 1)
    if (c[1] <= 1 && (c[6] >= 4 || c[8] >= 4 || c[2] >= 4)) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">🔄 Компенсация слабой воли (цифра 1)</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> Вам сложно действовать ради себя, но вы можете делать что-то ради других — из чувства долга, ответственности или под влиянием сильной личности.</p>
                <p><strong>Позитивная сторона:</strong> Вы способны на героические поступки во имя близких. Вас сложно обвинить в эгоизме.</p>
                <p><strong>Теневая сторона:</strong> Вы можете жертвовать собой, не получая благодарности. Риск попасть в зависимые отношения.</p>
                <p><strong>Рекомендация:</strong> Учитесь действовать и для себя. Ваши желания так же важны, как и чужие.</p>
            </div>
        </div>`;
    }
    // 1.2 Компенсация слабой энергии (цифра 2)
    if (c[2] <= 1 && (c[5] >= 4 || c[7] >= 4)) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">🔄 Компенсация слабой энергии (цифра 2)</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> При нехватке жизненной энергии вы полагаетесь на логику, стратегию или удачу. Там, где других «прёт», вы действуете расчётливо.</p>
                <p><strong>Позитивная сторона:</strong> Вы реже совершаете импульсивные ошибки. Ваши решения продуманы.</p>
                <p><strong>Теневая сторона:</strong> Вы можете застревать в анализе, так и не начиная действовать. Удача переменчива.</p>
                <p><strong>Рекомендация:</strong> Развивайте здоровые привычки, дающие энергию. Не полагайтесь только на расчёт.</p>
            </div>
        </div>`;
    }
    // 1.3 Компенсация слабой логики (цифра 5)
    if (c[5] <= 1 && (c[9] >= 4 || data.spirit >= 4)) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">🔄 Компенсация слабой логики (цифра 5)</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> Вы не любите длинные логические цепочки, предпочитая интуицию или готовые решения из прошлого опыта.</p>
                <p><strong>Позитивная сторона:</strong> Быстрота решений, доверие внутреннему чутью. Вы редко страдаете от «аналитического паралича».</p>
                <p><strong>Теневая сторона:</strong> Ошибки в тех областях, где требуется точный расчёт. Сложности с планированием.</p>
                <p><strong>Рекомендация:</strong> Учитесь проверять интуицию фактами. Ведите записи – это структурирует мышление.</p>
            </div>
        </div>`;
    }
    // 1.4 Компенсация слабого здоровья (цифра 4)
    if (c[4] <= 1 && (c[3] >= 4 || data.habits >= 4)) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">🔄 Компенсация слабого здоровья (цифра 4)</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> Слабое от природы здоровье вы компенсируете осознанностью: изучаете тело, следите за режимом, строите строгую систему.</p>
                <p><strong>Позитивная сторона:</strong> Вы становитесь экспертом в своём здоровье. Ваш режим может быть примером для других.</p>
                <p><strong>Теневая сторона:</strong> Риск тревожности по поводу самочувствия, ипохондрия.</p>
                <p><strong>Рекомендация:</strong> Не впадайте в крайности. Разрешайте себе иногда отклоняться от правил – это снижает напряжение.</p>
            </div>
        </div>`;
    }
    return html;
}

// ЧАСТЬ 2: КОНФЛИКТУЮЩИЕ КОМБИНАЦИИ
function getConflictsHTML(c, data) {
    let html = '';
    // 2.1 Характер vs Семья
    if (c[1] >= 3 && data.family >= 4) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Конфликт: Сильная воля vs Семья</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> Вы хотите быть независимым, но одновременно ощущаете сильную связь с родом и потребность в принадлежности. Внутренний спор: «Я сам» против «Мы – одно целое».</p>
                <p><strong>Внутренний диалог:</strong> «Хочу уехать, но не могу оставить родителей»; «Моё мнение важно, но что скажет семья?»</p>
                <p><strong>Типичные сценарии:</strong> Ранний уход из семьи с последующим чувством вины; жизнь по чужим правилам с подавленным гневом.</p>
                <p><strong>Путь интеграции:</strong> Признайте, что можно быть отдельным и при этом любить близких. Стройте здоровые границы без разрыва связей.</p>
            </div>
        </div>`;
    }
    // 2.2 Логика vs Дух
    if (c[5] >= 3 && data.spirit >= 4) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Конфликт: Логика vs Дух</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> Рациональный ум требует доказательств, а интуиция даёт знание без объяснений. Вы мечетесь между «надо проверить» и «я и так знаю».</p>
                <p><strong>Внутренний диалог:</strong> «Это нелогично, но я чувствую, что это правильно».</p>
                <p><strong>Типичные сценарии:</strong> Зацикленность на анализе, упускающий возможности; или же отказ от разума, ведущий к ошибкам.</p>
                <p><strong>Путь интеграции:</strong> Используйте логику для проверки интуитивных догадок. Доверяйте чувствам, но подкрепляйте их аргументами.</p>
            </div>
        </div>`;
    }
    // 2.3 Труд vs Удача
    if (c[6] >= 3 && c[7] >= 3) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Конфликт: Труд vs Удача</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> Вы верите, что всё достигается трудом, но при этом замечаете, что некоторым везёт без усилий. Возникает внутреннее противоречие: «надо пахать» vs «а вдруг повезёт».</p>
                <p><strong>Внутренний диалог:</strong> «Я не заслужил этот успех – просто повезло»; «Зачем стараться, если всё равно не везёт?»</p>
                <p><strong>Типичные сценарии:</strong> Трудоголизм с постоянным недовольством результатами; пассивное ожидание «чуда».</p>
                <p><strong>Путь интеграции:</strong> Признайте, что удача – это тоже ресурс. Используйте её, но не отказывайтесь от труда. Готовьтесь, чтобы быть готовым к везению.</p>
            </div>
        </div>`;
    }
    // 2.4 Темперамент vs Привычки
    if (data.temp >= 4 && data.habits >= 4) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Конфликт: Темперамент vs Привычки</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> Страстная, импульсивная натура борется с потребностью в порядке, режиме, стабильности. Вы то дисциплинированны, то срываетесь.</p>
                <p><strong>Внутренний диалог:</strong> «Хочу всё бросить и уехать» – «Нет, надо работать по плану».</p>
                <p><strong>Типичные сценарии:</strong> Жёсткие диеты, сменяющиеся зажорами; идеальный порядок, внезапно сменяющийся хаосом.</p>
                <p><strong>Путь интеграции:</strong> Создайте гибкие рамки: режим, но с окнами свободы. Разрешайте себе спонтанность в безопасных пределах.</p>
            </div>
        </div>`;
    }
    // 2.5 Цель vs Быт
    if (data.goal >= 4 && data.life >= 4) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Конфликт: Цель vs Быт</span>
            </div>
            <div class="decode-text">
                <p><strong>Как проявляется:</strong> Стремление к большим достижениям сталкивается с необходимостью заниматься рутиной, домом, материальными вопросами.</p>
                <p><strong>Внутренний диалог:</strong> «Я создан для великого, а не для мытья посуды» – «Но без порядка в быте нет сил для подвигов».</p>
                <p><strong>Типичные сценарии:</strong> Запущенный дом, хроническая усталость от «подвигов»; или наоборот – погружение в быт, отказ от мечты.</p>
                <p><strong>Путь интеграции:</strong> Делегируйте быт, где возможно. Включите малые дела в свою миссию – они дисциплинируют.</p>
            </div>
        </div>`;
    }
    return html;
}

// ЧАСТЬ 3: УСИЛИВАЮЩИЕ КОМБИНАЦИИ
function getAmplificationsHTML(c, data) {
    let html = '';
    // 3.1 Характер + Цель
    if (c[1] >= 3 && data.goal >= 4) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Усиление: Сила воли + Целеустремлённость</span>
            </div>
            <div class="decode-text">
                <p><strong>Позитивное проявление:</strong> Вы способны ставить амбициозные цели и достигать их, невзирая на препятствия. Природный лидер, достигатор.</p>
                <p><strong>Теневое проявление:</strong> Жёсткость, нетерпимость к чужому мнению, риск одиночества на вершине.</p>
                <p><strong>Рекомендация:</strong> Используйте свою силу, чтобы вдохновлять, а не подавлять. Делитесь властью, растите команду.</p>
            </div>
        </div>`;
    }
    // 3.2 Логика + Познание (тройки)
    if (c[5] >= 3 && c[3] >= 3) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Усиление: Логика + Интерес к познанию</span>
            </div>
            <div class="decode-text">
                <p><strong>Позитивное проявление:</strong> Мощный аналитический интеллект, способность глубоко понимать сложные системы. Вы – прирождённый исследователь, учёный, стратег.</p>
                <p><strong>Теневое проявление:</strong> Склонность к бесконечному анализу без действия, интеллектуальное высокомерие.</p>
                <p><strong>Рекомендация:</strong> Применяйте знания на практике. Учитесь объяснять сложное простым языком.</p>
            </div>
        </div>`;
    }
    // 3.3 Долг + Семья
    if (c[8] >= 3 && data.family >= 4) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Усиление: Долг + Семья</span>
            </div>
            <div class="decode-text">
                <p><strong>Позитивное проявление:</strong> Глубочайшая преданность семье, готовность нести ответственность за род. Вы – опора и защитник.</p>
                <p><strong>Теневое проявление:</strong> Жертвенность, подавление себя, гиперопека. Вы можете «задавить» любовью.</p>
                <p><strong>Рекомендация:</strong> Помните, что забота о себе – тоже часть ответственности. Уважайте автономию близких.</p>
            </div>
        </div>`;
    }
    // 3.4 Энергия + Темперамент
    if (c[2] >= 3 && data.temp >= 4) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Усиление: Энергия + Темперамент</span>
            </div>
            <div class="decode-text">
                <p><strong>Позитивное проявление:</strong> Мощнейшая жизненная энергия, страстность, интенсивность. Вы способны «заряжать» собой целые команды.</p>
                <p><strong>Теневое проявление:</strong> Эмоциональные качели, склонность к выгоранию, агрессия при перегрузке.</p>
                <p><strong>Рекомендация:</strong> Учитесь канализировать энергию – спорт, творчество, большие проекты. Обязательно чередуйте активность с отдыхом.</p>
            </div>
        </div>`;
    }
    // 3.5 Память + Дух
    if (c[9] >= 3 && data.spirit >= 4) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: var(--gold);">
                <span class="decode-title">⚡ Усиление: Память + Дух</span>
            </div>
            <div class="decode-text">
                <p><strong>Позитивное проявление:</strong> Глубокая связь с прошлым, предками, коллективной памятью, духовным измерением. Вы – хранитель знаний и традиций.</p>
                <p><strong>Теневое проявление:</strong> Жизнь прошлым, неспособность отпустить старые обиды, навязчивые воспоминания.</p>
                <p><strong>Рекомендация:</strong> Используйте память для роста, а не для страдания. Практикуйте прощение и отпускание.</p>
            </div>
        </div>`;
    }
    return html;
}

// ЧАСТЬ 4: КРИТИЧЕСКИЕ КОМБИНАЦИИ
function getCriticalCombosHTML(c, data) {
    let html = '';
    // 4.1 Пустая энергия + Пустое здоровье
    if (c[2] === 0 && c[4] === 0) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: #ff6b6b;">
                <span class="decode-title">⚠️ Критическая комбинация: Нет энергии + Нет здоровья</span>
            </div>
            <div class="decode-text">
                <p><strong>Риск:</strong> Крайне ограниченный физический ресурс. Вы можете функционировать только в идеальных условиях – без стресса, с полноценным отдыхом и питанием.</p>
                <p><strong>Рекомендация:</strong> Сделайте здоровье и восстановление приоритетом №1. Строгий режим, бережное отношение к себе. Не сравнивайте себя с выносливыми людьми. Ищите работу с гибким графиком.</p>
            </div>
        </div>`;
    }
    // 4.2 Избыточный характер + Пустая семья
    if (c[1] >= 6 && data.family === 0) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: #ff6b6b;">
                <span class="decode-title">⚠️ Критическая комбинация: Избыток воли + Отсутствие семейной связи</span>
            </div>
            <div class="decode-text">
                <p><strong>Риск:</strong> Тотальная изоляция. Сильное эго без способности к близости. Вы можете достичь многого, но остаться в одиночестве.</p>
                <p><strong>Рекомендация:</strong> Осознанно стройте отношения. Учитесь уступать, просить прощения, быть уязвимым. Терапия поможет разобраться с корнями отчуждения.</p>
            </div>
        </div>`;
    }
    // 4.3 Избыточная логика + Пустой темперамент
    if (c[5] >= 6 && data.temp === 0) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: #ff6b6b;">
                <span class="decode-title">⚠️ Критическая комбинация: Избыток логики + Отсутствие темперамента</span>
            </div>
            <div class="decode-text">
                <p><strong>Риск:</strong> «Чистый разум» без энергии для жизни. Понимание без действия. Вы можете всё анализировать, но не иметь сил и желания воплощать.</p>
                <p><strong>Рекомендация:</strong> Выходите из головы в тело. Спорт, танцы, физическая активность. Начните с малого – действие рождает энергию.</p>
            </div>
        </div>`;
    }
    // 4.4 Избыточный долг + Избыточный труд
    if (c[8] >= 6 && c[6] >= 6) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: #ff6b6b;">
                <span class="decode-title">⚠️ Критическая комбинация: Избыток долга + Избыток труда</span>
            </div>
            <div class="decode-text">
                <p><strong>Риск:</strong> Тотальное самосожжение на алтаре ответственности и работы. Вы готовы работать до истощения, не замечая сигналов тела.</p>
                <p><strong>Рекомендация:</strong> Делегируйте. Учитесь говорить «нет». Планируйте отдых как обязательную задачу. Работа с психологом над чувством вины за «безделье».</p>
            </div>
        </div>`;
    }
    // 4.5 Пустая самооценка + Избыточный долг
    if (data.self === 0 && c[8] >= 6) {
        html += `<div class="decode-card" style="margin-bottom: 10px;">
            <div class="decode-header" style="font-weight: bold; color: #ff6b6b;">
                <span class="decode-title">⚠️ Критическая комбинация: Низкая самооценка + Гиперответственность</span>
            </div>
            <div class="decode-text">
                <p><strong>Риск:</strong> Служение другим из чувства неполноценности. «Я недостоин, поэтому должен заслужить через жертву». Вы рискуете полностью раствориться в чужих нуждах.</p>
                <p><strong>Рекомендация:</strong> Работайте над самоценностью. Практикуйте отказ без чувства вины. Терапия для проработки ощущения «я должен заслужить любовь».</p>
            </div>
        </div>`;
    }
    return html;
}
// ФУНКЦИЯ ДЛЯ СЛЕПЫХ ЗОН И ТОЧЕК РОСТА (С УЧЁТОМ МАСТЕР-ЧИСЕЛ)
// ============================================
// Функция для слепых зон и точек роста по квадрату Пифагора (только на основе частоты цифр c)
function getBlindSpotsAndGrowthPoints(c) {
    const blindSpots = [];
    const growthPoints = [];

    const blindMap = {
        1: "Вам не хватает уверенности в себе и лидерских качеств. Учитесь брать инициативу, даже если страшно.",
        2: "Слабая энергия общения и дипломатии. Вам сложно находить компромиссы, стоит развивать эмпатию.",
        3: "Не хватает творческого подхода и интереса к новому. Пробуйте больше хобби, читайте, расширяйте кругозор.",
        4: "Проблемы с дисциплиной и здоровьем. Введите режим дня, спорт, следите за питанием.",
        5: "Слабая логика и аналитика. Развивайте критическое мышление, решайте головоломки.",
        6: "Трудности с физическим трудом и заботой о теле. Начните с малого: утренняя зарядка, помощь по дому.",
        7: "Не хватает удачи и интуиции. Работайте над позитивным мышлением, медитируйте.",
        8: "Слабая ответственность и терпимость. Учитесь держать слово, помогать близким.",
        9: "Проблемы с памятью и интеллектом. Тренируйте память, учите стихи, решайте кроссворды."
    };

    const growthMap = {
        1: "У вас сильная воля и лидерство. Берите ответственность, ведите за собой.",
        2: "Хорошая энергетика, вы душа компании. Используйте это для нетворкинга.",
        3: "Творческий потенциал. Займитесь искусством, блогингом, креативными проектами.",
        4: "Отличное здоровье и выносливость. Занимайтесь спортом, закаляйтесь.",
        5: "Логика и планирование – ваше оружие. Ставьте цели и добивайтесь.",
        6: "Золотые руки. Работайте руками, ремесло, кулинария – ваше.",
        7: "Везение и интуиция. Доверяйте знакам, рискуйте.",
        8: "Ответственность и забота. Станьте опорой для близких.",
        9: "Феноменальная память. Учитесь легко, осваивайте языки."
    };

    for (let i = 1; i <= 9; i++) {
        if (c[i] === 0 && blindMap[i]) {
            blindSpots.push(`<li><strong>Цифра ${i}:</strong> ${blindMap[i]}</li>`);
        }
        if (c[i] >= 2 && growthMap[i]) {
            growthPoints.push(`<li><strong>Цифра ${i}:</strong> ${growthMap[i]}</li>`);
        }
    }

    let blindHtml = '';
    if (blindSpots.length) {
        blindHtml = `<details class="decode-card" style="margin-bottom: 20px;">
            <summary class="decode-header" style="cursor: pointer; list-style: none;">
                <span class="decode-title">🌀 Слепые зоны (недостающие цифры в матрице)</span>
                <span style="float: right;">▼</span>
            </summary>
            <div class="decode-text"><ul>${blindSpots.join('')}</ul></div>
        </details>`;
    } else {
        blindHtml = `<details class="decode-card" style="margin-bottom: 20px;">
            <summary class="decode-header" style="cursor: pointer; list-style: none;">
                <span class="decode-title">🌀 Слепые зоны (недостающие цифры в матрице)</span>
                <span style="float: right;">▼</span>
            </summary>
            <div class="decode-text"><p>У вас нет ярко выраженных слабых мест – вы гармоничная личность!</p></div>
        </details>`;
    }

    let growthHtml = '';
    if (growthPoints.length) {
        growthHtml = `<details class="decode-card" style="margin-bottom: 20px;">
            <summary class="decode-header" style="cursor: pointer; list-style: none;">
                <span class="decode-title">✨ Сильные стороны (избыточные цифры в матрице)</span>
                <span style="float: right;">▼</span>
        </summary>
            <div class="decode-text"><ul>${growthPoints.join('')}</ul></div>
        </details>`;
    } else {
        growthHtml = `<details class="decode-card" style="margin-bottom: 20px;">
            <summary class="decode-header" style="cursor: pointer; list-style: none;">
                <span class="decode-title">✨ Сильные стороны (избыточные цифры в матрице)</span>
                <span style="float: right;">▼</span>
            </summary>
            <div class="decode-text"><p>Ваши силы распределены равномерно – используйте любые возможности.</p></div>
        </details>`;
    }

    return { blindHtml, growthHtml };
}

    const blindSpots = [];
    const growthPoints = [];

// Функция для генерации блоков по числу судьбы
// Функция для числа судьбы (жизненного пути) – с развёрнутыми текстами для всех чисел 1–9, 11,22,33
function getLifePathAdvice(lp) {
    const advice = lifePathAdvice[lp];
    if (!advice) return { blindHtml: '', growthHtml: '' };

    const blindHtml = `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">🌀 Кармические задачи (Число судьбы ${lp})</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${advice.blindSpot}</div>
    </details>`;

    const growthHtml = `<details class="decode-card">
        <summary class="decode-header" style="cursor: pointer; list-style: none;">
            <span class="decode-title">✨ Предназначение и дар (Число судьбы ${lp})</span>
            <span style="float: right;">▼</span>
        </summary>
        <div class="decode-text">${advice.growthPoint}</div>
    </details>`;

    return { blindHtml, growthHtml };
    
    
}

// Сохранять при вводе
document.getElementById('parentDate').addEventListener('change', function() {
    localStorage.setItem('savedParentDate', this.value);
});
document.getElementById('childDate').addEventListener('change', function() {
    localStorage.setItem('savedChildDate', this.value);
});
// Восстановить при загрузке
if(localStorage.getItem('savedParentDate')) {
    document.getElementById('parentDate').value = localStorage.getItem('savedParentDate');
}
if(localStorage.getItem('savedChildDate')) {
    document.getElementById('childDate').value = localStorage.getItem('savedChildDate');
}


    // Анимация числа выпускников (плавное увеличение)
    const counterEl = document.getElementById('graduatesCount');
    if (counterEl) {
        const target = 127;
        let current = 0;
        const step = Math.ceil(target / 50);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counterEl.textContent = target;
                clearInterval(timer);
            } else {
                counterEl.textContent = current;
            }
        }, 30);
    }

    // Эффект печатной машинки (меняем текст)
    const typewriterEl = document.getElementById('typewriter-text');
    if (typewriterEl) {
        const phrases = [
            "Станьте архитектором судьбы, а не просто наблюдателем...",
            "Перестаньте гадать на будущее. Научитесь его создавать.",
            "Нумерология — профессия нового времени. Ваше время пришло."
        ];
        let phraseIndex = 0;
        setInterval(() => {
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typewriterEl.style.opacity = '0';
            setTimeout(() => {
                typewriterEl.textContent = phrases[phraseIndex];
                typewriterEl.style.opacity = '1';
            }, 200);
        }, 5000);
    }

// ==========================================================
// ПЛАТНЫЙ БЛОК (ПРЕМИУМ КОНТЕНТ)
// ==========================================================
function showPremiumInsights(data, userName) {
    const container = document.getElementById('premium-insights');
    if (!container) return;

    container.style.display = 'block';

    if (typeof premiumAccess === 'undefined' || !premiumAccess) {
        container.innerHTML = `
            <div style="text-align: center; filter: blur(4px); pointer-events: none; user-select: none; opacity: 0.6;">
                <h3 style="color: var(--gold);">🔮 Персональный прогноз и план действий</h3>
                <p>Ваш идеальный день на основе матрицы Пифагора<br>
                Денежные стратегии на 2026 год<br>
                Рекомендации по здоровью и энергии</p>
                <p style="font-size: 0.9rem;">...</p>
            </div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 10;">
                <p style="color: #fff; font-size: 1.2rem; margin-bottom: 15px;">🔒 Премиум-раздел</p>
                <button class="btn-gold" onclick="openPremiumModal()">Разблокировать (199 ₽)</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h3 style="color: var(--gold); text-align: center;">🔮 Ваш персональный прогноз</h3>
    ${getYearlyForecast(data, userName)}
    ${getDailyRoutine(data, userName)}
    ${getMoneyInsights(data, userName)}
    <p style="margin-top: 15px; text-align: center; font-style: italic;">✨ Это лишь малая часть возможностей премиум-доступа.</p>
`;
}

// ==========================================================
// ПРЕМИУМ: ПРОГНОЗ НА ТЕКУЩИЙ ГОД ПО ЯЧЕЙКАМ
// ==========================================================
function getYearlyForecast(data, userName) {
    const c = data.c;
    const year = new Date().getFullYear();
    const lp = data.lp; // Число судьбы

    // Вычисляем число личного года (упрощённо: lp + год)
    let personalYear = lp + year.toString().split('').reduce((a,b) => +a + +b, 0);
    while (personalYear > 9) personalYear = personalYear.toString().split('').reduce((a,b) => +a + +b, 0);
    if (personalYear === 0) personalYear = 9;

    // Базовые тексты для каждого значения личного года
    const yearMeanings = {
        1: { title: 'Год Начинаний', advice: 'Активно начинайте новые проекты, меняйте имидж, берите инициативу.' },
        2: { title: 'Год Партнёрства', advice: 'Учитесь слушать, ищите компромиссы, занимайтесь отношениями.' },
        3: { title: 'Год Творчества', advice: 'Время для самовыражения, радости, лёгких денег.' },
        4: { title: 'Год Труда', advice: 'Закладывайте фундамент, работайте над здоровьем, порядком.' },
        5: { title: 'Год Перемен', advice: 'Рискуйте, путешествуйте, меняйте обстановку.' },
        6: { title: 'Год Семьи', advice: 'Уделите внимание дому, близким, комфорту.' },
        7: { title: 'Год Анализа', advice: 'Углубитесь в учёбу, духовные практики, уединение.' },
        8: { title: 'Год Денег', advice: 'Карьерный рост, инвестиции, материальные достижения.' },
        9: { title: 'Год Завершения', advice: 'Отпускайте старое, подводите итоги, очищайте пространство.' }
    };

    const ym = yearMeanings[personalYear] || yearMeanings[1];

    let html = `
        <div style="margin-bottom: 25px;">
            <h4 style="color: var(--gold); margin-bottom: 5px;">📅 Ваш ${year} год — «${ym.title}» (Число ${personalYear})</h4>
            <p style="margin-bottom: 15px;">${ym.advice}</p>
    `;

    // Анализ влияния года на ключевые ячейки
    const cells = [
        { num: 1, name: 'Характер', val: c[1] },
        { num: 2, name: 'Энергия', val: c[2] },
        { num: 3, name: 'Интерес', val: c[3] },
        { num: 4, name: 'Здоровье', val: c[4] },
        { num: 5, name: 'Логика', val: c[5] },
        { num: 8, name: 'Долг/Деньги', val: c[8] }
    ];

    cells.forEach(cell => {
        let effect = '';
        if (cell.val === 0) {
            effect = `<span style="color: #ff6b6b;">⚠️ Слабое место — требуется особое внимание.</span>`;
        } else if (cell.val >= 3) {
            effect = `<span style="color: #4caf50;">✅ Сильная сторона — используйте по максимуму.</span>`;
        } else {
            effect = `<span style="color: #a8dadc;">🟢 Умеренно — стабильность.</span>`;
        }

        // Персонализация в зависимости от числа года
        if (personalYear === 8 && cell.num === 8) {
            effect += ` В этом году ваш денежный канал особенно активен.`;
        } else if (personalYear === 1 && cell.num === 1) {
            effect += ` Время проявить лидерские качества.`;
        } else if (personalYear === 2 && cell.num === 2) {
            effect += ` Энергия может быть нестабильной — берегите силы.`;
        }

        html += `<p><strong>${cell.name} (${cell.val}):</strong> ${effect}</p>`;
    });

    html += `</div>`;
    return html;
}

// ==========================================================
// ПРЕМИУМ: ИДЕАЛЬНОЕ РАСПИСАНИЕ ДНЯ
// ==========================================================
function getDailyRoutine(data, userName) {
    const c = data.c;

    // Определяем хронотип и пики на основе цифр
    const energy = c[2]; // 0-1: низкая, 2: средняя, 3+: высокая
    const will = c[1];
    const health = c[4];
    const logic = c[5];

    let wakeUp = '07:00';
    let bedTime = '23:00';
    let workPeak = '09:00 - 12:00';
    let restNote = '';

    if (energy === 0) {
        wakeUp = '08:00';
        bedTime = '22:00';
        restNote = 'Вам требуется 8-9 часов сна и дневной отдых 20-30 минут после обеда.';
    } else if (energy >= 3) {
        wakeUp = '06:30';
        bedTime = '23:30';
        restNote = 'Вы активны, но избегайте перегрузок. Делайте короткие паузы каждые 2 часа.';
    } else {
        restNote = 'Старайтесь ложиться и вставать в одно и то же время.';
    }

    if (will >= 3) {
        workPeak = '08:00 - 11:00 (пик воли)';
    } else if (will <= 1) {
        workPeak = '10:00 - 13:00 (после разогрева)';
    }

    if (logic >= 3) {
        workPeak += ' и 16:00 - 19:00 (аналитический подъём)';
    }

    let mealAdvice = '';
    if (health <= 1) {
        mealAdvice = 'Питание дробное, 5-6 раз в день, тёплая пища.';
    } else {
        mealAdvice = '3-4 приёма пищи, больше белка и овощей.';
    }

    return `
        <div style="margin-bottom: 25px;">
            <h4 style="color: var(--gold);">⏰ Идеальное расписание дня для ${escapeHTML(userName) || 'вас'}</h4>
            <ul style="list-style: none; padding: 0;">
                <li>🌅 <strong>Подъём:</strong> ${wakeUp}</li>
                <li>💼 <strong>Продуктивные часы:</strong> ${workPeak}</li>
                <li>🍽️ <strong>Питание:</strong> ${mealAdvice}</li>
                <li>😴 <strong>Отбой:</strong> ${bedTime}</li>
                <li>💤 <strong>Восстановление:</strong> ${restNote}</li>
            </ul>
            <p><em>Совет: придерживайтесь этого ритма хотя бы 2 недели, и вы заметите прилив сил.</em></p>
        </div>
    `;
}

// ==========================================================
// ПРЕМИУМ: ДЕНЕЖНЫЕ СТРАТЕГИИ
// ==========================================================
function getMoneyInsights(data, userName) {
    const c = data.c;
    const debt = c[8];
    const energy = c[2];
    const interest = c[3];
    const work = c[6];
    const habits = data.habits;

    let strategy = '';
    let leak = '';

    // Определяем стратегию
    if (debt >= 3) {
        strategy = 'Вы прирождённый добытчик. Ваши деньги приходят через ответственность и управление. Рекомендуется: инвестиции в недвижимость, бизнес, долгосрочные проекты.';
    } else if (debt === 0) {
        strategy = 'Вам сложно удерживать деньги. Рекомендуется: откладывать сразу 10% дохода на отдельный счёт, не пользоваться кредитными картами.';
    } else {
        strategy = 'У вас сбалансированный подход. Хорошо работают накопления и умеренные траты.';
    }

    // Утечки
    if (energy === 0) {
        leak = 'Импульсивные траты на комфорт и доставку еды, когда вы устали.';
    } else if (energy >= 3) {
        leak = 'Спонтанные покупки из-за переизбытка энергии, ненужные подписки.';
    }

    if (work <= 1) {
        leak += ' Склонность переплачивать за услуги, которые могли бы сделать сами.';
    }

    if (habits >= 5) {
        leak += ' Траты на развлечения и хобби могут выходить из-под контроля.';
    }

    return `
        <div style="margin-bottom: 25px;">
            <h4 style="color: var(--gold);">💰 Денежный профиль</h4>
            <p><strong>Стратегия:</strong> ${strategy}</p>
            <p><strong>Основные утечки:</strong> ${leak || 'Явных утечек не выявлено, но ведите бюджет.'}</p>
            <p><strong>Рекомендация на год:</strong> ${debt >= 3 ? 'В этом году можно брать кредиты на развитие, но не на потребление.' : 'Избегайте долгов, создайте финансовую подушку.'}</p>
        </div>
    `;
}

// ==========================================================
// ПОЛНОЕ ОПИСАНИЕ АРКАНА ИЗ ФАЙЛА data-arcana-full.js
// ==========================================================
function getArcanaFullDescription(num) {
    if (typeof arcanaFullData === 'undefined') {
        return '<p style="color:#ff6b6b;">Ошибка: данные арканов не загружены.</p>';
    }
    const data = arcanaFullData[num];
    if (!data) {
        return '<p>Описание для этого аркана временно отсутствует.</p>';
    }
    return `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; padding-right: 5px;">
            <h4 style="color: var(--gold); margin: 0 0 5px 0;">${num} — ${data.title}</h4>
            <p style="margin-top: 5px;"><em>${data.essence}</em></p>
            <p><strong style="color: #4caf50;">✨ В плюсе:</strong><br>${data.light}</p>
            <p><strong style="color: #ff6b6b;">⚠️ В минусе:</strong><br>${data.shadow}</p>
            <p><strong>💡 Совет:</strong> ${data.advice}</p>
            <p><strong>💼 Профессии:</strong> ${data.profession}</p>
            <p><strong>🩺 Здоровье:</strong> ${data.health}</p>
        </div>
    `;
}
// ==========================================================
// Генерация PDF файла
// ==========================================================

async function downloadPaidPDF() {
    

    const data = window.lastMatrixData;
    const userName = window.lastUserName;
    const nameNum = window.lastNameNum;
    const birthDate = document.getElementById('birthDateMatrix').value;
    
    if (!data) {
        alert('Сначала выполните расчёт матрицы!');
        return;
    }

    // 1. Запоминаем кнопку
    const btn = document.getElementById('download-pdf-btn');
    const originalHTML = btn ? btn.innerHTML : '';
    
    // 2. Показываем загрузку
    if (btn) {
        btn.disabled = true;
        btn.classList.add('pdf-loading');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Генерация PDF...';
    }

    try {
        // Вся логика сборки данных и отправки на сервер (без изменений)
        const getS = (n) => { let s = ""; for(let k=0; k<data.c[n]; k++) s+=n; return s||"—"; };
        const getDesc = (i) => cellTexts[i] ? cellTexts[i][data.c[i]] || '' : '';
        const getRowDesc = (name, val) => rowTexts[name] ? rowTexts[name][getRowValue(val)] || '' : '';
        
        const matrixCells = [
            { title: 'Характер', value: getS(1), description: getDesc(1), isSummary: false },
            { title: 'Здоровье', value: getS(4), description: getDesc(4), isSummary: false },
            { title: 'Удача', value: getS(7), description: getDesc(7), isSummary: false },
            { title: 'Цель', value: data.goal.toString(), description: getRowDesc('Цель', data.goal), isSummary: true, rowName: 'Цель', rowValue: data.goal },
            { title: 'Энергия', value: getS(2), description: getDesc(2), isSummary: false },
            { title: 'Логика', value: getS(5), description: getDesc(5), isSummary: false },
            { title: 'Долг', value: getS(8), description: getDesc(8), isSummary: false },
            { title: 'Семья', value: data.family.toString(), description: getRowDesc('Семья', data.family), isSummary: true, rowName: 'Семья', rowValue: data.family },
            { title: 'Интерес', value: getS(3), description: getDesc(3), isSummary: false },
            { title: 'Труд', value: getS(6), description: getDesc(6), isSummary: false },
            { title: 'Память', value: getS(9), description: getDesc(9), isSummary: false },
            { title: 'Привычки', value: data.habits.toString(), description: getRowDesc('Привычки', data.habits), isSummary: true, rowName: 'Привычки', rowValue: data.habits },
            { title: 'Самооценка', value: data.self.toString(), description: getRowDesc('Самооценка', data.self), isSummary: true, rowName: 'Самооценка', rowValue: data.self },
            { title: 'Быт', value: data.life.toString(), description: getRowDesc('Быт', data.life), isSummary: true, rowName: 'Быт', rowValue: data.life },
            { title: 'Талант', value: data.talent.toString(), description: getRowDesc('Талант', data.talent), isSummary: true, rowName: 'Талант', rowValue: data.talent },
            { title: 'Дух', value: data.spirit.toString(), description: getRowDesc('Дух', data.spirit), isSummary: true, rowName: 'Дух', rowValue: data.spirit },
            { title: 'Темперамент', value: data.temp.toString(), description: getRowDesc('Темперамент', data.temp), isSummary: false, name: 'Темперамент' }
        ];

        const levels = {
            c1: getLevel(data.c[1],'cell'), c2: getLevel(data.c[2],'cell'), c3: getLevel(data.c[3],'cell'),
            c4: getLevel(data.c[4],'cell'), c5: getLevel(data.c[5],'cell'), c6: getLevel(data.c[6],'cell'),
            c7: getLevel(data.c[7],'cell'), c8: getLevel(data.c[8],'cell'), c9: getLevel(data.c[9],'cell'),
            goal: getLevel(data.goal,'sum'), family: getLevel(data.family,'sum'),
            temp: getLevel(data.temp,'sum'), self: getLevel(data.self,'sum'), spirit: getLevel(data.spirit,'sum')
        };
        const combos = [
            ['1',levels.c1,'2',levels.c2,'Характер + Энергия'],
            ['5',levels.c5,'3',levels.c3,'Логика + Интерес'],
            ['4',levels.c4,'2',levels.c2,'Здоровье + Энергия'],
            ['8',levels.c8,'6',levels.c6,'Долг + Труд'],
            ['7',levels.c7,'goal',levels.goal,'Удача + Цель'],
            ['temp',levels.temp,'fam',levels.family,'Темперамент + Семья'],
            ['self',levels.self,'spirit',levels.spirit,'Самооценка + Дух'],
            ['9',levels.c9,'3',levels.c3,'Память + Интерес'],
            ['4',levels.c4,'6',levels.c6,'Здоровье + Труд'],
            ['7',levels.c7,'8',levels.c8,'Удача + Долг'],
            ['temp',levels.temp,'self',levels.self,'Темперамент + Самооценка']
        ];
        const syntheses = [];
        combos.forEach(([a,av,b,bv,name]) => {
            const key = `${a}_${av}_${b}_${bv}`;
            const syn = pythagorasSynthesis?.[key];
            if (syn) syntheses.push({ name, ...syn });
        });

        const forecasts = {
            yearly: getYearlyForecast(data, userName),
            routine: getDailyRoutine(data, userName),
            money: getMoneyInsights(data, userName)
        };

        const moonBlock = document.getElementById('moon-block');
        const moonPhaseName = document.getElementById('moon-phase-name')?.textContent || '';
        const moonDescription = document.getElementById('moon-description')?.innerHTML || '';

        const luckyNumber = document.getElementById('lucky-number')?.textContent || '';
        const luckyDay = document.getElementById('lucky-day')?.textContent || '';
        const luckyColor = document.getElementById('lucky-color')?.textContent || '';
        const luckyStone = document.getElementById('lucky-stone')?.textContent || '';
        const luckyElement = document.getElementById('lucky-element')?.textContent || '';
        const luckyPlanet = document.getElementById('lucky-planet')?.textContent || '';

        const payload = {
            userName,
            birthDate,
            matrix: matrixCells,
            lifePath: data.master || data.lp,
            nameNum,
            syntheses,
            forecasts,
            moon: {
                phaseName: moonPhaseName,
                description: moonDescription
            },
            lucky: {
                number: luckyNumber,
                day: luckyDay,
                color: luckyColor,
                stone: luckyStone,
                element: luckyElement,
                planet: luckyPlanet
            }
        };

        const response = await fetch(`${SERVER_URL}/generate-pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Ошибка сервера');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Matrix_${userName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Ошибка генерации PDF:', error);
        alert('Не удалось создать PDF. Убедитесь, что сервер запущен.');
    } finally {
        // 3. Возвращаем кнопку в исходное состояние
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('pdf-loading');
            btn.innerHTML = originalHTML;
        }
    }
}

// ==========================================================
// PAYWALL LOGIC
// ==========================================================
// Блокировка/разблокировка decode-карточек
function applyPaywallToDecoding() {
    const cards = document.querySelectorAll('#decoding-content .decode-card');
    const pdfBtn = document.getElementById('download-pdf-btn');
    
    if (premiumAccess) {
        // Разблокируем карточки
        cards.forEach(card => {
            card.classList.remove('locked');
            const overlay = card.querySelector('.lock-overlay');
            if (overlay) overlay.remove();
            const header = card.querySelector('.decode-header');
            if (header) header.style.pointerEvents = '';
        });
        // Кнопку PDF показываем ТОЛЬКО если был расчёт (контент в decoding-content уже есть)
        if (pdfBtn && document.getElementById('decoding-content').innerHTML.trim() !== '') {
            pdfBtn.style.display = 'inline-block';
        } else if (pdfBtn) {
            pdfBtn.style.display = 'none';
        }
    } else {
        // Блокируем карточки
        cards.forEach(card => {
            if (card.tagName === 'DETAILS') card.removeAttribute('open');
            card.classList.add('locked');
            const header = card.querySelector('.decode-header');
            if (header) header.style.pointerEvents = 'none';
            if (!card.querySelector('.lock-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'lock-overlay';
                overlay.innerHTML = '<i class="fa-solid fa-lock"></i>';
                overlay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openUnlockPaymentModal();
                });
                card.style.position = 'relative';
                card.appendChild(overlay);
            }
            card.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openUnlockPaymentModal();
            }, { once: false });
        });
        if (pdfBtn) pdfBtn.style.display = 'none';
    }
}

// Вызывать эту функцию каждый раз после рендеринга decoding-content
// В calculateMatrix после присвоения innerHTML добавить: setTimeout(applyPaywallToDecoding, 100);
// ==========================================================
// НЕЗАВИСИМОЕ ОКНО ОПЛАТЫ (ГЛАВНАЯ СТРАНИЦА)
// ==========================================================

let unlockPaymentLink = 'https://zoyanum.getplatinum.ru/payment/bdsSxOn'; // ← ЗАМЕНИТЕ НА СВОЮ ССЫЛКУ

function openUnlockPaymentModal() {
    document.getElementById('unlock-payment-modal').style.display = 'flex';
}

function closeUnlockPaymentModal() {
    document.getElementById('unlock-payment-modal').style.display = 'none';
}

// Обработчик кнопки оплаты в новом окне
document.addEventListener('DOMContentLoaded', 
function() {
    const payBtn = document.getElementById('unlock-final-pay-btn');
    if (payBtn) {
        payBtn.addEventListener('click', function() {
            const email = document.getElementById('unlock-client-email').value;
            const isAgreed = document.getElementById('unlock-offer-agree').checked;
            
            if (!email.includes('@') || email.length < 5) {
                alert('Пожалуйста, введите корректный Email.');
                return;
            }
            if (!isAgreed) {
                alert('Для продолжения необходимо принять условия оферты.');
                return;
            }
            
            window.open(unlockPaymentLink, '_blank');
            closeUnlockPaymentModal();
            
            // Показываем окно с инструкцией отправить чек
            const telegramUsername = "zoya_viik";
            const text = `Здравствуйте, Зоя! Я оплатил(а) доступ «Полный разбор личности» (499 ₽). Мой Email: ${email}. Отправляю чек.`;
            const tgUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(text)}`;
            
            if (confirm('Спасибо! После оплаты нажмите ОК, чтобы отправить чек в Telegram.')) {
                window.location.href = tgUrl;
            }
        });
    }
});

function updateUIForPremium() {
    // Главная: кнопка PDF ВСЕГДА скрыта, если нет premiumAccess или не был выполнен расчёт
    const pdfBtn = document.getElementById('download-pdf-btn');
    if (pdfBtn) {
        pdfBtn.style.display = 'none'; // скрываем по умолчанию
    }

    if (!premiumAccess) {
        // Если нет доступа – прячем всё и выходим
        if (pdfBtn) pdfBtn.style.display = 'none';
        return;
    }

    // Для главной страницы: снимаем замки с карточек (если они есть)
    if (document.getElementById('decoding-content')) {
        applyPaywallToDecoding(); // эта функция покажет кнопку, если premiumAccess и расчёт был
    }

    // Совместимость: активируем кнопку
    const compatBtn = document.querySelector('#compat .btn-gold');
    if (compatBtn) {
        compatBtn.disabled = false;
        const lock = document.getElementById('lock-compat');
        if (lock) lock.style.display = 'none';
    }

    // Финансовый архетип: активируем кнопки
    document.querySelectorAll('#sponsor .btn-gold').forEach(btn => btn.disabled = false);

    // Родитель-ребёнок: активируем кнопку
    const parentChildBtn = document.querySelector('#parent-child .btn-gold');
    if (parentChildBtn) parentChildBtn.disabled = false;
}

function showOutOfAttemptsModal() {
    document.getElementById('out-of-attempts-modal').style.display = 'flex';
}
function closeOutOfAttemptsModal() {
    document.getElementById('out-of-attempts-modal').style.display = 'none';
}
function updateAttemptsDisplay(remaining) {
    let counter = document.getElementById('attempts-counter');

    if (remaining <= 0) {
        // Попытки закончились – вместо счётчика показываем кнопку покупки
        if (counter) counter.remove();
        if (document.getElementById('buy-more-btn')) return; // уже показана

        const btn = document.createElement('div');
        btn.id = 'buy-more-btn';
        btn.className = 'attempts-counter';
        btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Купить ещё расчёты (499 ₽)`;
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
            openUnlockPaymentModal();
        };
        document.body.appendChild(btn);
        return;
    }

    // Если есть активные попытки – показываем счётчик
    if (document.getElementById('buy-more-btn')) {
        document.getElementById('buy-more-btn').remove();
    }

    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'attempts-counter';
        counter.className = 'attempts-counter';
        document.body.appendChild(counter);
    }
    counter.innerHTML = `<i class="fa-solid fa-calculator"></i> Осталось расчётов: ${remaining} / 4`;
    counter.style.cursor = 'default';
}

// В функции checkPremiumAccess после успешной активации добавьте:
// (найдите место, где data.success и premiumAccess = true)
// добавьте строку:
// updateAttemptsDisplay(data.remaining);

// Интерактивность радара
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('radar-canvas');
    if (!canvas) return;
    const tooltip = document.getElementById('radar-tooltip');
    const tooltipTitle = document.getElementById('radar-tooltip-title');
    const tooltipDesc = document.getElementById('radar-tooltip-desc');

    const explanations = {
        1: { title: "Характер", text: "Сила воли, лидерство, способность отстаивать границы." },
        2: { title: "Энергия", text: "Жизненный ресурс, общительность, влияние на других." },
        3: { title: "Интерес", text: "Тяга к знаниям, творчеству, обучаемость." },
        4: { title: "Здоровье", text: "Физическая выносливость, иммунитет, красота." },
        5: { title: "Логика", text: "Интуиция, аналитика, планирование." },
        6: { title: "Труд", text: "Мастерство, усидчивость, практичность." },
        7: { title: "Удача", text: "Везение, покровительство, интуиция." },
        8: { title: "Долг", text: "Ответственность, забота, терпимость." },
        9: { title: "Память", text: "Мудрость, интеллект, предвидение." }
    };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const points = canvas.points;
        if (!points) return;

        let hovered = null;
        points.forEach(p => {
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 15) hovered = p;
        });

        if (hovered) {
            const info = explanations[hovered.key];
            tooltipTitle.innerHTML = `${info.title}: <span style="color:${hovered.color}">${hovered.val}</span>`;
            tooltipDesc.textContent = info.text;
            tooltip.style.display = 'block';
            canvas.style.cursor = 'pointer';
        } else {
            tooltip.style.display = 'none';
            canvas.style.cursor = 'default';
        }
    });

    canvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
});
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('section').forEach(s => {
        if (!s.classList.contains('active')) {
            s.style.display = 'none';
            s.style.opacity = '0';
        } else {
            s.style.opacity = '1';
        }
    });
});

// Функция для скачивания PDF из разделов (Совместимость, Финансы, Родитель-ребёнок)
async function downloadSectionPDF(section) {
    if (!premiumAccess) {
        openUnlockPaymentModal();
        return;
    }

    // Определяем, какую кнопку анимировать
    let btnId = '';
    if (section === 'compat') btnId = 'download-compat-pdf';
    else if (section === 'money') btnId = 'download-money-pdf';
    else if (section === 'parentchild') btnId = 'download-parentchild-pdf';

    const btn = btnId ? document.getElementById(btnId) : null;
    const originalHTML = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.classList.add('pdf-loading');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Генерация PDF...';
    }

    let html = '';
    let filename = 'report.pdf';

    const getText = (id) => document.getElementById(id)?.value?.trim() || '';

    try {
        // Твоя существующая логика сборки html для каждого раздела
        if (section === 'compat') {
            const name1 = getText('nameP1') || 'Партнёр 1';
            const name2 = getText('nameP2') || 'Партнёр 2';
            const date1 = getText('dateP1');
            const date2 = getText('dateP2');
            const matrices = document.getElementById('matrices-compare-container')?.innerHTML || '';
            const compatNumber = document.getElementById('compat-number')?.textContent?.trim() || '';
            const compatText = document.getElementById('compat-text')?.innerHTML || '';

            html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Совместимость ${name1} и ${name2}</title>
<style>body{background:#1a1a2e;color:#eee;font-family:'Cormorant Garamond',serif;padding:40px;} h1,h2{color:#D4AF37;} .matrix-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;} .matrix-cell{background:#1e1e3a;border:1px solid #D4AF37;border-radius:8px;padding:8px;text-align:center;}</style>
</head><body>
<h1>Совместимость партнёров</h1>
<h2>${name1} и ${name2}</h2>
<p>Даты рождения: ${date1} и ${date2}</p>
<div>${matrices}</div>
<h2>Энергия союза: ${compatNumber}</h2>
<div>${compatText}</div>
<p style="margin-top:40px;text-align:center;color:#aaa;">© Astra Numerology</p>
</body></html>`;
            filename = `Совместимость_${name1}_${name2}.pdf`;

        } else if (section === 'money') {
            let content = document.getElementById('result-money')?.innerHTML || '';
            if (!content || document.getElementById('result-money')?.style.display === 'none') {
                content = document.getElementById('result-money-compat')?.innerHTML || '';
            }
            html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Финансовый архетип</title>
<style>body{background:#1a1a2e;color:#eee;font-family:'Cormorant Garamond',serif;padding:40px;} h1,h2{color:#D4AF37;} .matrix-card{background:rgba(0,0,0,0.2);padding:15px;border-radius:10px;margin:15px 0;}</style>
</head><body>
<h1>💰 Денежный код</h1>
${content}
<p style="margin-top:40px;text-align:center;color:#aaa;">© Astra Numerology</p>
</body></html>`;
            filename = `Финансовый_архетип.pdf`;

        } else if (section === 'parentchild') {
            const parentName = getText('parentName') || 'Родитель';
            const childName = getText('childName') || 'Ребёнок';
            const content = document.getElementById('result-parent-child')?.innerHTML || '';
            html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Родитель и ребёнок</title>
<style>body{background:#1a1a2e;color:#eee;font-family:'Cormorant Garamond',serif;padding:40px;} h1,h2{color:#D4AF37;}</style>
</head><body>
<h1>👨‍👧 Родитель и ребёнок</h1>
<h2>${parentName} и ${childName}</h2>
${content}
<p style="margin-top:40px;text-align:center;color:#aaa;">© Astra Numerology</p>
</body></html>`;
            filename = `Родитель_ребёнок_${childName}.pdf`;
        }

        if (!html) return;

        const response = await fetch(`${SERVER_URL}/generate-pdf-from-html`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html })
        });

        if (!response.ok) throw new Error('Ошибка сервера');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/\s+/g, '_') + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (err) {
        console.error('Ошибка генерации PDF:', err);
        alert('Не удалось создать PDF. Попробуйте позже.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('pdf-loading');
            btn.innerHTML = originalHTML;
        }
    }
}
// Новый звёздный фон на Canvas
(function() {
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let stars = [];
    const STAR_COUNT = 400; // Можешь менять количество звёзд

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.8 + 0.2,
                speed: Math.random() * 0.3 + 0.05,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
            ctx.fill();
            // Движение вверх
            star.y -= star.speed;
            if (star.y < -5) {
                star.y = canvas.height + 5;
                star.x = Math.random() * canvas.width;
            }
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });

    resize();
    createStars();
    draw();
})();

// ==========================================================
//  МОБИЛЬНОЕ МЕНЮ
// ==========================================================
function openMobileMenu() {
    document.getElementById('mobile-menu').classList.add('open');
    document.getElementById('mobile-menu-overlay').style.display = 'block';
    document.getElementById('mobile-menu-btn').style.display = 'none';  // бургер прячется
    document.getElementById('mobile-menu-close').style.display = 'flex'; // крестик показывается
    document.body.style.overflow = 'hidden';
}


function closeMobileMenu() {
    document.getElementById('mobile-menu').classList.remove('open');
    document.getElementById('mobile-menu-overlay').style.display = 'none';
    document.getElementById('mobile-menu-btn').style.display = '';        // бургер возвращается
    document.getElementById('mobile-menu-close').style.display = '';      // крестик возвращается
    document.body.style.overflow = '';
}
// Обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            if (menu.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }
});