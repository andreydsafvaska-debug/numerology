// ВАШ НОМЕР WHATSAPP
const myPhone = "79956506287";



// ⚡ ТЕСТОВЫЙ РЕЖИМ (true = всё бесплатно, false = платно)
const TEST_MODE = true;


// Функция для безопасного экранирования HTML-спецсимволов
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
}

// ==========================================================
// ПРЕМИУМ-ДОСТУП С СЕРВЕРОМ (ОДНОРАЗОВЫЕ ТОКЕНЫ)
// ==========================================================
let premiumAccess = false;
let currentToken = localStorage.getItem('accessToken') || '';
const SERVER_URL = 'https://numerology-vnjx.onrender.com'; // ← ЗАМЕНИТЕ НА ВАШ РЕАЛЬНЫЙ URL СЕРВЕРА

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
   СОЗДАНИЕ ЗВЁЗДНОГО ФОНА
   ============================================ */
function createStars(id, c, s, d) {
    const l = document.getElementById(id);
    let sh = [];
    for(let i = 0; i < c; i++) {
        sh.push(`${Math.random()*2000}px ${Math.random()*2000}px #FFF`);
    }
    l.style.boxShadow = sh.join(',');
    l.style.width = s + 'px';
    l.style.height = s + 'px';
    l.style.animation = `animStar ${d}s linear infinite`;
}

createStars('stars', 700, 1, 50);
createStars('stars2', 200, 2, 100);
createStars('stars3', 100, 3, 150);

/* ============================================
   НАВИГАЦИЯ МЕЖДУ СЕКЦИЯМИ
   ============================================ */
function showSection(id) {
    // 1. Скрыть все секции
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    // 2. Показать выбранную секцию
    const activeSection = document.getElementById(id);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.style.display = 'block';
    }
    // 3. Обновить активную кнопку в меню
    document.querySelectorAll('.nav-links button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + id);
    if (activeBtn) activeBtn.classList.add('active');
    // 4. Прокрутка вверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
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
async function calculateCompat() {
    if (!premiumAccess) {
        openUnlockPaymentModal();
        return;
    }
    const canProceed = await useCalculation();
    if (!canProceed) return;

    const d1 = document.getElementById('dateP1').value;
    const d2 = document.getElementById('dateP2').value;
    // ... дальше ваш существующий код без изменений
	
	// Имена нужны только для вывода на экран, в расчёте числа T они не участвуют
    const n1 = document.getElementById('nameP1').value.trim();
    const n2 = document.getElementById('nameP2').value.trim();
    
    if(!d1 || !d2) return alert("Пожалуйста, введите обе даты!");
    
    document.getElementById('result-compat').style.opacity = '0';
    document.getElementById('loader-compat').style.display = 'flex';
	startMagicAnimation('magic-numbers-compat');
    
    setTimeout(() => {
        const gsn = d => {
            let s = 0;
            let st = d.replace(/-/g, '');
            for(let c of st) s += parseInt(c);
            while(s > 9) s = s.toString().split('').reduce((a, b) => +a + (+b), 0);
            return s;
        };
        
        let t = gsn(d1) + gsn(d2);
        
                
        while(t > 9) t = t.toString().split('').reduce((a, b) => +a + (+b), 0);
        
        const dataP1 = calculateMatrixData(d1);
        const dataP2 = calculateMatrixData(d2);
        
        document.getElementById('matrices-compare-container').innerHTML = `
            <div class="compat-matrices-wrapper">
                ${renderMatrixHTML(dataP1, "Мужчина", n1)}
                ${renderMatrixHTML(dataP2, "Женщина", n2)}
            </div>`;
        
        if(n1 || n2) {
const safeName1 = escapeHTML(n1);
const safeName2 = escapeHTML(n2);
document.getElementById('compat-names').innerHTML = `${safeName1 || 'Мужчина'} & ${safeName2 || 'Женщина'}`;			 document.getElementById('result-compat').style.opacity = '0';
    // Показываем новый лоадер
    document.getElementById('loader-compat').style.display = 'flex';
    startMagicAnimation('magic-numbers-compat');
    
    setTimeout(() => {
        // ... расчёты ...
        
        stopMagicAnimation('magic-numbers-compat');
        document.getElementById('loader-compat').style.display = 'none';
        document.getElementById('result-compat').style.opacity = '1';
    }, 1500); // Увеличил время до 1.5 сек для красоты
}
        
        
        // ПОЛУЧАЕМ ОПИСАНИЕ ИЗ НОВОЙ БАЗЫ
        const desc = compatibilityDescriptions[t] || compatibilityDescriptions[9];

        // ФОРМИРУЕМ HTML
        const htmlContent = `
            <h4 style='color:var(--gold); margin-bottom:10px; font-size: 1.8rem; text-align:center;'>${desc.title} — Число ${t}</h4>
            
            <div style="background: rgba(212,175,55,0.1); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid var(--gold);">
                <p style="margin:0; font-size: 1.1rem;"><em>${desc.essence}</em></p>
            </div>

            <h4 style='color:var(--purple-light); margin-top:20px;'><i class="fa-solid fa-bolt"></i> Энергетика и Динамика</h4>
            <p>${desc.dynamics}</p>

            <h4 style='color:var(--purple-light); margin-top:20px;'><i class="fa-solid fa-fire"></i> Секс и Чувства</h4>
            <p>${desc.sex}</p>

            <h4 style='color:var(--purple-light); margin-top:20px;'><i class="fa-solid fa-coins"></i> Финансовая Карма</h4>
            <p>${desc.money}</p>

            <h4 style='color:#ff6b6b; margin-top:20px;'><i class="fa-solid fa-triangle-exclamation"></i> Зона Конфликта</h4>
            <p>${desc.conflict}</p>

            <div style="margin-top: 25px; background: rgba(155, 135, 245, 0.15); padding: 20px; border-radius: 10px;">
                <h4 style='color:var(--gold); margin:0 0 10px 0;'><i class="fa-solid fa-key"></i> Магический Ключ</h4>
                <p style="margin:0;"><strong>${desc.advice}</strong></p>
            </div>
        `;
        
        document.getElementById('compat-number').innerText = t;
        document.getElementById('compat-text').innerHTML = htmlContent;
        document.getElementById('loader-compat').style.display = 'none';
        document.getElementById('result-compat').style.opacity = '1';
    }, 1000);
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
    const lower = name.toLowerCase().trim();

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
    const name1 = document.getElementById('quick-name1').value.trim();
    const name2 = document.getElementById('quick-name2').value.trim();
    
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
});


// ============================================
// РАСЧЁТ ДЕТСКОЙ МАТРИЦЫ
// ============================================
function calculateChildMatrix() {
    const nameInput = document.getElementById('childNameInput');
    const dateInput = document.getElementById('childDateInput');
    
    if (!nameInput || !dateInput || !dateInput.value) {
        return alert("Пожалуйста, введите имя и дату рождения ребёнка!");
    }

    const name = nameInput.value.trim() || "Ребёнок";
    const date = dateInput.value;

    document.getElementById('child-result').style.display = 'none';
    document.getElementById('child-loader').style.display = 'flex';

    setTimeout(() => {
        // Расчёт психоматрицы
        const data = calculateMatrixData(date);
        const nameNum = calculateNameNumber(name);
        
        const safeName = escapeHTML(name);
        const lifePath = data.master || data.lp;
        document.getElementById('child-result-title').innerHTML = 
            `Матрица Пифагора для: <span style="color:var(--gold)">${safeName}</span>`;

        const getS = (n) => {
            let s = "";
            for(let k = 0; k < data.c[n]; k++) s += n;
            return s || "—";
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

    }, 1000);
}
  
async function calculateMoneyMatrix() {
    if (!premiumAccess) {
        openUnlockPaymentModal();
        return;
    }
    const canProceed = await useCalculation();
    if (!canProceed) return;

    const name = document.getElementById('moneyName').value;
    const date = document.getElementById('moneyDate').value;

    if(!date) return alert("Введите дату рождения!");

    // Лоадер
    document.getElementById('result-money').style.display = 'none';
    document.getElementById('loader-money').style.display = 'flex';
    // Показываем кнопку PDF, если есть премиум-доступ
    if (premiumAccess) {
    const pdfBtn = document.getElementById('download-money-pdf');
    if (pdfBtn) pdfBtn.style.display = 'inline-block';
}

    setTimeout(() => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        // Функция сведения к 22
        const reduce22 = (n) => {
            let res = n;
            while (res > 22) {
                res = res.toString().split('').reduce((a, b) => +a + +b, 0);
            }
            return res;
        };

        // --- ТОЧКИ ДЛЯ ФИНАНСОВ ---
        // 1. СФЕРА РЕАЛИЗАЦИИ (День - Личность)
        // Кем работать, чтобы перло.
        const pointProf = reduce22(day);

        // 2. АКТИВАТОР / КЛЮЧ (Месяц - Вдохновение)
        // Что делать, чтобы деньги пришли (Духовная часть).
        const pointActive = reduce22(month);

        // 3. БЛОК / КАРМА (Сумма всей даты - Общий фон)
        // Что мешает, главная ошибка.
        const sumAll = reduce22(day + month + year.toString().split('').reduce((a, b) => +a + +b, 0));
        const pointBlock = sumAll; // Или можно взять Кармический хвост, но Сумма даты тоже отлично показывает урок.

        // --- ВЫВОД В КРУЖОЧКИ ---
        document.getElementById('val-block').innerText = pointBlock;
        document.getElementById('val-prof').innerText = pointProf;
        document.getElementById('val-active').innerText = pointActive;

        document.getElementById('money-user-title').innerText = `Финансовый код: ${name || 'Гость'}`;

        // --- ВЫВОД ТЕКСТА (БЕРЕМ ИЗ БАЗЫ) ---
        // База будет называться moneyMatrixData
        
        const getData = (num) => moneyMatrixData[num] || { 
            block: "Описание...", prof: "Описание...", active: "Описание..." 
        };

        const dataBlock = getData(pointBlock);
        const dataProf = getData(pointProf);
        const dataActive = getData(pointActive);

        document.getElementById('desc-block').innerHTML = 
            `<strong>Аркан ${pointBlock}:</strong> ${dataBlock.block}`;
            
        document.getElementById('desc-prof').innerHTML = 
            `<strong>Аркан ${pointProf}:</strong> ${dataProf.prof}`;
            
        document.getElementById('desc-active').innerHTML = 
            `<strong>Аркан ${pointActive}:</strong> ${dataActive.active}`;

        // Показываем
        document.getElementById('loader-money').style.display = 'none';
        document.getElementById('result-money').style.display = 'block';

    }, 1500);
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


// ============================================================
// БЛОК КАЛЬКУЛЯТОРА «РОДИТЕЛЬ – РЕБЁНОК»
// ============================================================

// Вспомогательная функция: возраст
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

// Возрастной период
function getAgePeriod(age) {
    if (age <= 3) return { name: 'Базовая привязанность (0–3 года)', code: 'attachment' };
    if (age <= 6) return { name: 'Социализация (4–6 лет)', code: 'social' };
    if (age <= 12) return { name: 'Обучение (7–12 лет)', code: 'learning' };
    if (age <= 17) return { name: 'Сепарация (13–17 лет)', code: 'separation' };
    if (age <= 25) return { name: 'Отделение (18–25 лет)', code: 'leaving' };
    return { name: 'Взрослые дети (26+)', code: 'adult' };
}

// Названия ячеек
function getCellName(num) {
    const names = {
        1: 'Характер', 2: 'Энергия', 3: 'Интерес',
        4: 'Здоровье', 5: 'Логика', 6: 'Труд',
        7: 'Удача', 8: 'Долг', 9: 'Память'
    };
    return names[num];
}

// Список всех 17 показателей
function getIndicatorsList(parentMatrix, childMatrix) {
    const indicators = [];
    for (let i = 1; i <= 9; i++) {
        indicators.push({
            name: getCellName(i),
            parentValue: parentMatrix.c[i],
            childValue: childMatrix.c[i],
            category: 'cell',
            importance: (i === 1) ? 1 : 2
        });
    }
    indicators.push(
        { name: 'Цель', parentValue: parentMatrix.goal, childValue: childMatrix.goal, category: 'row', importance: 2 },
        { name: 'Семья', parentValue: parentMatrix.family, childValue: childMatrix.family, category: 'row', importance: 2 },
        { name: 'Привычки', parentValue: parentMatrix.habits, childValue: childMatrix.habits, category: 'row', importance: 3 },
        { name: 'Самооценка', parentValue: parentMatrix.self, childValue: childMatrix.self, category: 'col', importance: 2 },
        { name: 'Быт', parentValue: parentMatrix.life, childValue: childMatrix.life, category: 'col', importance: 3 },
        { name: 'Талант', parentValue: parentMatrix.talent, childValue: childMatrix.talent, category: 'col', importance: 2 },
        { name: 'Темперамент', parentValue: parentMatrix.temp, childValue: childMatrix.temp, category: 'diag', importance: 2 },
        { name: 'Дух', parentValue: parentMatrix.spirit, childValue: childMatrix.spirit, category: 'diag', importance: 2 }
    );
    return indicators;
}

// Классификация разницы
function classifyIndicators(indicators) {
    return indicators.map(ind => {
        const diff = ind.parentValue - ind.childValue;
        let type = '';
        if (ind.parentValue === ind.childValue) {
            if (ind.parentValue <= 1) type = 'BOTH_WEAK';
            else if (ind.parentValue >= 5) type = 'BOTH_EXCESS';
            else type = 'MATCH';
        } else if (Math.abs(diff) === 1) type = 'CLOSE';
        else if (Math.abs(diff) === 2) type = 'MODERATE';
        else if (diff >= 3) type = 'PARENT_STRONG';
        else if (diff <= -3) type = 'CHILD_STRONG';
        else type = 'MODERATE';

        if (ind.parentValue >= 4 && ind.childValue === 0) type = 'CRITICAL_PARENT';
        if (ind.parentValue === 0 && ind.childValue >= 4) type = 'CRITICAL_CHILD';
        if (ind.parentValue === 0 && ind.childValue === 0) type = 'BOTH_WEAK';
        if (ind.parentValue >= 5 && ind.childValue >= 5) type = 'BOTH_EXCESS';
        return { ...ind, diff, type };
    });
}

// Топ-3 гармонии
function getTopHarmony(classified) {
    const harmony = classified.filter(c => c.type === 'MATCH' || c.type === 'CLOSE');
    harmony.sort((a, b) => a.importance - b.importance);
    return harmony.slice(0, 3);
}

// Топ-3 напряжения
function getTopTension(classified) {
    const order = { 'CRITICAL_PARENT': 1, 'CRITICAL_CHILD': 2, 'BOTH_WEAK': 3, 'BOTH_EXCESS': 4, 'PARENT_STRONG': 5, 'CHILD_STRONG': 6 };
    const tension = classified.filter(c => order[c.type]);
    tension.sort((a, b) => (order[a.type] - order[b.type]));
    return tension.slice(0, 3);
}

// Топ-3 роста
function getTopGrowth(classified) {
    const growth = classified.filter(c => c.type === 'PARENT_STRONG' || c.type === 'CHILD_STRONG');
    growth.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    return growth.slice(0, 3);
}

// Форматирование гармонии (использует parentChildTexts)
function formatHarmonyZone(zone, parentMatrix, childMatrix) {
    const name = zone.name;
    const pv = zone.parentValue;
    const cv = zone.childValue;
    
    // Определяем тип гармонии
    let harmonyType = '';
    let intro = '';
    let body = '';
    let howToStrengthen = '';
    let example = '';
    let ritual = '';
    let mantra = '';
    
    // ----- 1. ХАРАКТЕР (ВОЛЯ) -----
    if (name === 'Характер') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба мягкие, неконфликтные';
            intro = `Дорогие родители, у вас обоих мягкий, неконфликтный характер. Вы редко ссоритесь, легко уступаете друг другу, и в доме царит атмосфера тепла и принятия. Это огромный дар – ваша семья похожа на тихую гавань, где можно отдохнуть от штормов внешнего мира. Но есть и обратная сторона медали.`;
            body = `Вам обоим может быть трудно принимать решения, отстаивать свои границы, проявлять инициативу. Вы можете «плыть по течению», упуская важные возможности. Например, вы долго обсуждаете, куда поехать в выходной, и в итоге остаётесь дома. Ребёнку трудно сказать «нет» сверстникам, он часто соглашается на невыгодное. Вы оба можете терпеть некомфортную ситуацию, вместо того чтобы её изменить. В школе ребёнка могут не замечать, потому что он не проявляет себя. Но это не слабость – это просто ваша общая черта. Ваша задача – не пытаться стать «жёсткими», а научиться проявлять волю вместе, мягко, но уверенно.`;
            howToStrengthen = `Начните с малого: каждый день принимайте одно маленькое решение быстро, без долгих обсуждений. Например: «Сегодня на ужин мы едим гречку». Поддерживайте друг друга, когда кто-то проявляет инициативу. Хвалите ребёнка за любые попытки сказать «нет» или выбрать самостоятельно. Играйте в игры, где нужно быстро принимать решения (настолки, квесты). Главное – не давите, а поддерживайте. Ваша мягкость – не проблема, а фундамент доверия.`;
            example = `У мамы и 10-летней Ани были одинаково мягкие характеры. Они никогда не спорили, но и никогда не решали важные вопросы – всё откладывали «на потом». Мы предложили им «день смелых решений»: каждое утро Аня выбирала, что наденет, мама – что приготовит на ужин. Через месяц они стали увереннее, а Аня в школе впервые сказала «нет» однокласснику, который просил списать. Мама сказала: «Я думала, что мягкость – это недостаток. Оказывается, это просто другой тип силы».`;
            ritual = `Сядьте напротив друг друга. Возьмите по листу бумаги. Напишите: «Одно решение, которое я сегодня приму сам(а)». Прочитайте друг другу. Выполните. Вечером обсудите, что получилось. Хвалите друг друга за смелость.`;
            mantra = `«Наша мягкость – не слабость, а особая сила. Она позволяет нам быть чуткими друг к другу. Мы учимся проявлять волю вместе, поддерживая, а не давя. Вместе мы можем всё – тихо, но уверенно».`;
        } 
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с сильным характером';
            intro = `Вы оба – люди с сильными, волевыми характерами. Это значит, что в вашей семье часто будут сталкиваться две непререкаемые позиции. Вы оба привыкли быть правыми, и уступать не любите. С одной стороны, это даёт вам огромную энергию для достижения целей. С другой – постоянная борьба за власть может истощить ваши отношения.`;
            body = `Вы оба знаете, как отстаивать своё мнение, не бояться говорить «нет», брать на себя ответственность. Это прекрасные качества, но они же могут приводить к конфликтам. Вы можете соревноваться, кто больше заработал, кто лучше учится, кто прав в споре. Дома часто звучат фразы: «Потому что я так сказал!» – «А я так хочу!». Вы оба устаёте от борьбы. Но есть и плюс: вы – мощная команда, если направите эту энергию в одно русло.`;
            howToStrengthen = `Разделите зоны ответственности: в одних вопросах решаете вы, в других – ребёнок. Например, вы отвечаете за безопасность и финансы, ребёнок – за порядок в своей комнате и выбор хобби. Не лезьте на чужую территорию. Учитесь уступать в мелочах – это не слабость, а мудрость. И обязательно хвалите друг друга за умение договариваться, а не только за победу.`;
            example = `Папа и 14-летний Дима постоянно спорили: кто главный. У обоих 4 единицы характера. Мы предложили разделить зоны: Дима отвечал за свой график и хобби, папа – за семейный бюджет и безопасность. Конфликты прекратились. Через месяц Дима сам спросил папу: «Как ты думаешь, стоит ли мне брать дополнительный кружок?». Папа сказал: «Он перестал бороться со мной и начал советоваться».`;
            ritual = `Сядьте за стол. Напишите на листе: «В этих вопросах решаю я». Обменяйтесь листами. Прочитайте и обсудите. Договоритесь не лезть в чужие зоны.`;
            mantra = `«Мы – два лидера в одной команде. Мы не конкуренты, а союзники. Сила не в том, чтобы всегда быть правым, а в том, чтобы вовремя остановиться и услышать друг друга. Вместе мы непобедимы».`;
        } 
        else {
            harmonyType = 'близкие, но не одинаковые характеры';
            intro = `Ваши характеры близки по силе, но не идентичны. Это даёт хорошее взаимопонимание, но иногда возникают небольшие трения – кто-то чуть более настойчив, кто-то чуть более уступчив. Эти отличия могут обогащать, если вы их осознаёте.`;
            body = `Вы редко конфликтуете по-крупному, но мелкие недоразумения случаются. Например, один из вас хочет настоять на своём, другой – уступить, но потом жалеет. Важно открыто обсуждать: «Мне кажется, сейчас ты давишь. Давай попробуем по-другому». Учитесь замечать момент, когда настойчивость переходит в давление. И помните, что разница – не проблема, а возможность учиться друг у друга.`;
            howToStrengthen = `Давайте друг другу право на «вето» в безопасных ситуациях. Например, ребёнок может сказать «нет» в выборе ужина, вы – в выборе времени для прогулки. Обсуждайте, где каждый из вас был сегодня слишком настойчив, а где – слишком уступчив. Это развивает рефлексию.`;
            example = `Мама и 12-летний Миша часто спорили из-за гаджетов. Мама была чуть настойчивее, Миша – уступчивее, но потом обижался. Мы предложили им договариваться: «Ты выбираешь время, я – длительность». Конфликты прекратились. Миша сказал: «Теперь я чувствую, что моё мнение важно».`;
            ritual = `В конце дня спросите друг друга: «Где я сегодня был слишком настойчив? Где мне стоило уступить?». Ответьте честно, без обид.`;
            mantra = `«Мы разные, но это не мешает нам быть близкими. Наши отличия – не поле для битвы, а территория для открытий. Мы учимся уступать и настаивать, и это делает нас сильнее».`;
        }
    }
    
    // ----- 2. ЭНЕРГИЯ -----
    else if (name === 'Энергия') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба с низкой энергией';
            intro = `У вас обоих от природы невысокий запас жизненной энергии. Вы быстро устаёте, нуждаетесь в частом отдыхе, тяжело переносите перегрузки. Это создаёт особый ритм жизни – вы оба понимаете друг друга, когда один говорит: «Я больше не могу». Это даёт взаимопонимание и принятие.`;
            body = `Вы редко требуете друг от друга «подвигов», не раздражаетесь, когда кто-то хочет полежать. В доме тихо и спокойно. Но есть и риск: вы можете «тянуть» друг друга вниз, усиливать усталость, вместе избегать активностей. Например, отказываться от прогулок, потому что «оба устали». Важно не застревать в апатии.`;
            howToStrengthen = `Введите «микродвижения»: 5-минутная зарядка, прогулка вокруг дома – лучше, чем ничего. Планируйте дела с большими перерывами. Следите за сном и питанием – качество отдыха напрямую влияет на ваш ресурс. И главное – не сравнивайте себя с «супер-активными» семьями. Ваш ритм – нормальный.`;
            example = `Мама и 8-летний Дима оба быстро уставали. Вместо того чтобы лежать на диване, они ввели «5 минут активности»: просто попрыгать или пройтись. Через месяц они стали выходить на 15-минутные прогулки. Дима сказал: «Оказывается, двигаться не так уж трудно, если по чуть-чуть».`;
            ritual = `Сядьте на пол, закройте глаза. 2 минуты просто дышите. Потом откройте глаза и скажите: «Мы вместе, и это даёт нам силы».`;
            mantra = `«Энергия – не соревнование. Мы оба с маленькой батарейкой, но вместе мы – команда. Мы бережём силы друг друга и не требуем невозможного. Наш темп – это наш темп, и он хорош».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с высокой энергией';
            intro = `Вы оба – «энерджайзеры». Вы можете вместе путешествовать, заниматься спортом, не замечать усталости. Это даёт вам огромные возможности для активного отдыха и совместных проектов. Ваша жизнь наполнена движением, и это прекрасно.`;
            body = `Вы редко ссоритесь из-за «лени» – вы оба всегда готовы к действию. Но есть риск «перегрева»: вы можете не замечать, когда пора остановиться, подстёгивая друг друга к ещё большей активности. Ребёнок может не научиться чувствовать свои пределы, а вы – выгореть.`;
            howToStrengthen = `Введите обязательные «часы покоя» – время, когда никто ничего не делает. Даже если не хочется. Учитесь замечать первые признаки усталости у себя и у ребёнка. Направляйте энергию в совместные проекты (ремонт, спорт, походы), чтобы не конкурировать.`;
            example = `Папа и 12-летняя Аня оба были очень активны. Они постоянно куда-то бежали, пока Аня не начала болеть. Ввели «ленивую субботу» – день без планов. Аня восстановилась, а папа сказал: «Я и не знал, как важно иногда просто валяться».`;
            ritual = `Раз в неделю устраивайте «день без дел» – никаких планов, только то, что хочется в моменте. Это тренирует умение расслабляться.`;
            mantra = `«Наша энергия – наше богатство. Но мы учимся не только разгоняться, но и тормозить. Вместе мы можем и горы свернуть, и просто полежать на травке. И то, и другое – сила».`;
        }
        else {
            harmonyType = 'близкий уровень энергии';
            intro = `Ваши энергетические уровни близки, что помогает вам синхронизироваться. Вы примерно одинаково быстро устаёте и восстанавливаетесь. Это хорошо для совместного планирования, но может приводить к взаимному истощению, если оба не умеют отдыхать.`;
            body = `Вы редко конфликтуете из-за разного темпа, но можете вместе «зависать» в апатии. Важно договариваться о режиме, который подходит обоим, и не заставлять друг друга «догонять», если один чувствует упадок.`;
            howToStrengthen = `Планируйте совместный отдых: например, после активного дня – обязательно тихий вечер. Учитесь вместе замечать, когда пора остановиться. Хвалите друг друга за умение вовремя отдохнуть.`;
            example = `Мама и сын примерно одинаково уставали. Они ввели ритуал: после школы и работы – 30 минут тишины. Конфликтов стало меньше, а продуктивность выросла.`;
            ritual = `Вечером спросите друг друга: «Насколько ты устал по шкале от 1 до 10?». Если оба выше 5 – отмените все планы и просто отдохните.`;
            mantra = `«Наш ритм – наше общее дело. Мы умеем и разгоняться, и тормозить вместе. Главное – мы делаем это в унисон».`;
        }
    }
    
    // ----- 3. ИНТЕРЕС (ПОЗНАНИЕ) -----
    else if (name === 'Интерес') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба с низким познавательным интересом';
            intro = `Вы оба не очень любите учиться, читать, узнавать новое. Вам трудно сосредоточиться на интеллектуальной деятельности, вы быстро теряете интерес. Это создаёт взаимопонимание – вы не ругаете ребёнка за «нелюбовь к школе», потому что сами так же относитесь к учёбе.`;
            body = `Вы можете вместе откладывать дела «на потом», избегать развития, застревать на одном уровне. Ребёнок может отстать в учёбе, потерять интерес к любому обучению. Но есть и плюс: вы не создаёте лишнего напряжения. Ваша задача – не заставлять, а мягко вводить познание через игру и практику.`;
            howToStrengthen = `Начните с малого: 5 минут чтения в день, одно короткое видео на познавательную тему. Ищите практическое применение знаний – готовьте, мастерите, сажайте растения. Хвалите друг друга за любые проявления любопытства.`;
            example = `Мама и 9-летний Дима оба не любили читать. Они начали смотреть 5-минутные научные ролики про животных. Через месяц Дима сам попросил книгу про динозавров. Мама сказала: «Оказывается, учиться можно и без скуки».`;
            ritual = `Каждый вечер делитесь одним интересным фактом, который вы узнали за день. Не важно, откуда – из видео, разговора, наблюдения. Главное – сам факт.`;
            mantra = `«Знания не приходят по приказу. Мы открываем их через радость и игру. Мы учимся вместе, понемногу, и это сближает нас».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с высоким познавательным интересом';
            intro = `Вы оба любите учиться, читать, исследовать новое. Вы можете часами обсуждать прочитанное, смотреть научно-популярные фильмы, посещать лекции. Это даёт огромный ресурс для развития, но есть риск «интеллектуального перегруза».`;
            body = `Вы можете требовать от себя и ребёнка слишком многого, не замечая усталости. Дом завален книгами, ребёнок посещает множество кружков и курсов. Вы можете сравнивать его с собой: «Я в твоём возрасте уже читал энциклопедии». Важно не перегружать и не забывать про отдых.`;
            howToStrengthen = `Введите «дни без учёбы» – время, когда никто не читает, не учит, не развивается. Поощряйте не только интеллектуальные, но и практические, творческие хобби. Спрашивайте ребёнка, что ему НРАВИТСЯ, а не только «что полезно».`;
            example = `Папа и 11-летний Миша оба увлекались астрономией. Они вместе смотрели лекции, но Миша начал уставать. Ввели «субботу без науки» – просто гуляли, играли в настолки. Миша сказал: «Я люблю астрономию, но мне нужно иногда отдыхать от неё».`;
            ritual = `Раз в неделю устраивайте «день без мозгов» – никаких книг, лекций, образовательных видео. Только отдых, игры, природа.`;
            mantra = `«Знания – наше общее сокровище. Но мы помним, что жизнь – не только учёба. Мы умеем и учиться, и отдыхать, и это делает нас счастливыми».`;
        }
        else {
            harmonyType = 'близкий уровень познавательного интереса';
            intro = `Вы примерно одинаково любознательны. Это помогает вам обсуждать новые темы, вместе искать информацию, поддерживать друг друга. Вы редко ссоритесь из-за «нежелания учиться».`;
            body = `Иногда вы можете синхронно «застревать» в поверхностном интересе (быстро переключаться) или, наоборот, слишком углубляться. Важно находить баланс и не давить друг на друга.`;
            howToStrengthen = `Планируйте совместные «познавательные выходные» – музей, лекция, книжный магазин. Делитесь тем, что узнали, и просите обратную связь. Если один устал – не давите, дайте время на отдых.`;
            example = `Мама и дочь вместе увлеклись историей. Они смотрели фильмы, читали книги, но дочь стала отставать. Мама спросила: «Что тебе неинтересно?». Оказалось, дочери скучны войны, но нравится культура. Они переключились на историю костюма – и обе были в восторге.`;
            ritual = `Вместе ведите «семейный журнал открытий» – записывайте интересные факты, которые узнали за неделю. Перечитывайте вместе.`;
            mantra = `«Мы – команда исследователей. Мы делимся открытиями и уважаем темп друг друга. Наше любопытство – мост между нами».`;
        }
    }
    
    // ----- 4. ЗДОРОВЬЕ -----
    else if (name === 'Здоровье') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба со слабым здоровьем';
            intro = `У вас обоих от природы невысокий запас физической прочности. Вы быстро устаёте, часто болеете, нуждаетесь в бережном режиме. Это создаёт взаимопонимание – вы не ругаете друг друга за «лень» или «болезненность».`;
            body = `Вы вместе можете игнорировать спорт, закаливание, правильное питание, оправдывая себя «наследственностью». Но риск в том, что вы оба будете «тянуть» друг друга вниз. Важно не стыдиться, а действовать сообща.`;
            howToStrengthen = `Введите щадящий, но регулярный режим: ложиться спать в одно время, гулять на свежем воздухе. Начните с малой физической активности – 10 минут зарядки, прогулка после ужина. Не стыдите себя за болезни – это не слабость, а особенность.`;
            example = `Мама и 7-летний Дима оба часто болели. Они ввели «день здоровья» раз в неделю: вместе готовили полезный ужин, делали лёгкую зарядку, рано ложились спать. Через три месяца они стали болеть реже.`;
            ritual = `Каждое утро делайте вместе 5-минутную зарядку под музыку. Не для рекордов, а для удовольствия.`;
            mantra = `«Наше здоровье – наше общее дело. Мы бережём друг друга и не стыдимся слабости. Вместе мы сильнее, даже если болеем чаще других».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с крепким здоровьем';
            intro = `У вас обоих отличное здоровье, выносливость, редко болеете. Это даёт огромный ресурс для активной жизни, путешествий, спорта. Вы можете не понимать, как это – болеть «просто так».`;
            body = `Вы рискуете переоценивать свои силы, игнорировать сигналы усталости, требовать от ребёнка такой же выносливости, забывая, что он ещё растёт. Важно не перегружать и не обесценивать чужие проблемы со здоровьем.`;
            howToStrengthen = `Не требуйте от ребёнка такой же выносливости – у него другой предел. Введите обязательные «часы отдыха» – даже если не хочется. Проходите профилактические осмотры – крепкое здоровье не значит «вечное».`;
            example = `Папа и 10-летний Коля оба были крепкими. Папа требовал от сына таких же спортивных достижений, пока Коля не начал жаловаться на боли в спине. Оказалось, перегрузка. Ввели щадящий режим – и Коля снова полюбил спорт.`;
            ritual = `Раз в месяц устраивайте «день тишины» – никакой активности, только отдых и восстановление. Это тренирует умение расслабляться.`;
            mantra = `«Наше здоровье – наше богатство. Но мы помним, что даже крепкий дуб нуждается в отдыхе. Мы уважаем пределы друг друга и не требуем невозможного».`;
        }
        else {
            harmonyType = 'близкий уровень здоровья';
            intro = `Ваш физический ресурс примерно одинаков. Это помогает вам синхронизировать режим, вместе заниматься спортом, не конфликтовать из-за разницы в выносливости.`;
            body = `Вы можете вместе «перегружаться» или, наоборот, оба лениться. Важно находить золотую середину и не соревноваться, кто выносливее.`;
            howToStrengthen = `Планируйте совместную активность с учётом общего ритма. Вместе изучайте основы здорового образа жизни, ведите семейный дневник здоровья – отмечайте, сколько спали, что ели, как себя чувствовали.`;
            example = `Мама и сын примерно одинаково переносили нагрузки. Они начали вместе ходить в бассейн – и полюбили это. Мама сказала: «Мы не соревнуемся, а просто радуемся движению».`;
            ritual = `Вместе готовьте полезный ужин по новому рецепту. Обсуждайте, какие продукты дают энергию, а какие – отнимают.`;
            mantra = `«Наше здоровье – наша общая забота. Мы двигаемся в одном ритме и поддерживаем друг друга. Вместе мы сильнее и здоровее».`;
        }
    }
    
    // ----- 5. ЛОГИКА (аналитический склад) -----
    else if (name === 'Логика') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба с низкой логикой, интуитивный склад';
            intro = `Вы оба больше полагаетесь на интуицию, чувства, готовые решения из прошлого опыта. Вам трудно выстраивать длинные логические цепочки. Это создаёт взаимопонимание – вы не требуете друг от друга «железных» аргументов.`;
            body = `Вы можете вместе принимать необдуманные решения, избегать планирования, попадать в финансовые ловушки. Но есть и плюс: вы редко страдаете от «аналитического паралича». Ваша задача – не стать «логиками», а научиться использовать внешние инструменты.`;
            howToStrengthen = `Используйте чек-листы, календари, напоминалки. Вместе решайте простые логические задачки (головоломки, судоку). Обсуждайте решения вслух: «Если мы сделаем так, что будет потом?».`;
            example = `Мама и сын оба не любили планировать. Они ввели «вечерний список» на завтра: 3 дела. Через месяц они стали более организованными. Сын сказал: «Оказывается, планировать не так уж сложно».`;
            ritual = `Раз в неделю решайте вместе одну логическую задачку (можно из интернета). Пусть ребёнок предлагает свой способ, даже если он нелогичный – обсуждайте, почему он так думает.`;
            mantra = `«Мы мыслим образами и чувствами. Это не хуже логики – это просто другое. Мы учимся структурировать мир через игру и поддержку».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с высокой логикой';
            intro = `Вы оба обладаете отличным аналитическим мышлением. Вы любите раскладывать всё по полочкам, искать причинно-следственные связи, планировать. Это даёт вам огромное преимущество в решении проблем.`;
            body = `Вы можете «засушивать» отношения чрезмерной рациональностью, не замечать эмоций друг друга, требовать логических обоснований даже там, где они не нужны (любовь, искусство, отдых). Важно не забывать про чувства.`;
            howToStrengthen = `Учитесь слышать не только аргументы, но и чувства. Спрашивайте: «Что ты чувствуешь?» – и слушайте. Позволяйте себе «нелогичные» поступки – спонтанные прогулки, глупые шутки.`;
            example = `Папа и дочь оба были «логиками». Они решали всё через анализ, но ссорились из-за мелочей. Ввели правило: «Сначала чувства, потом факты». Конфликтов стало меньше.`;
            ritual = `Раз в неделю играйте в игру «Только чувства» – обсуждаете событие, используя только эмоциональные слова (без «потому что», «следовательно»).`;
            mantra = `«Логика – наш инструмент, но не хозяин. Мы помним, что чувства так же важны, как и факты. Вместе мы – и разум, и сердце».`;
        }
        else {
            harmonyType = 'близкий уровень логики';
            intro = `Ваши аналитические способности близки. Это помогает вам понимать друг друга в деловых вопросах, планировании, учёбе. Вы редко спорите о «правильности» решений.`;
            body = `Иногда вы можете «соревноваться», кто логичнее. Важно не забывать про эмоциональную сторону и не доказывать, что «ваша логика лучше». Ищите синтез.`;
            howToStrengthen = `Цените, когда партнёр находит нестандартное решение. Не доказывайте правоту, а ищите компромисс. Учитесь признавать, когда чувства важнее логики.`;
            example = `Мама и сын вместе решали головоломки. Они заметили, что иногда спорят, чей способ лучше. Договорились: сначала пробуем способ одного, потом другого. Выбираем тот, который быстрее.`;
            ritual = `Вместе смотрите детективный фильм и пытайтесь угадать преступника. Обсуждайте ход мыслей.`;
            mantra = `«Наша логика – наша общая опора. Мы уважаем разные подходы и учимся друг у друга. Вместе мы находим лучшие решения».`;
        }
    }
    
    // ----- 6. ТРУД (РАБОТОСПОСОБНОСТЬ) -----
    else if (name === 'Труд') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба с низкой работоспособностью';
            intro = `Вам трудно заставить себя делать дела каждый день, вы быстро устаёте от однообразия, легко отвлекаетесь. Это создаёт взаимопонимание – вы оба знаете, как тяжело «вставать с дивана».`;
            body = `Вы можете вместе откладывать важные задачи до последнего момента, а домашние дела накапливаются. Но вы не ругаете друг друга за «лентяйство». Ваша задача – не корить себя, а искать маленькие победы.`;
            howToStrengthen = `Начните с микропривычек: не «убрать всю комнату», а «убрать одну вещь». Используйте таймер: работайте 10 минут, отдыхайте 5. Хвалите друг друга за каждый выполненный шаг.`;
            example = `Мама и сын оба не любили убираться. Они ввели «10 минут порядка» вместе. Через неделю комната стала чище, а мама сказала: «Маленькие шаги работают лучше, чем героические усилия».`;
            ritual = `Каждый день делайте одно «микродело» вместе (помыть 3 тарелки, вытереть стол). Отмечайте галочкой в календаре.`;
            mantra = `«Мы не любим рутину, но мы умеем делать маленькие шаги. Вместе нам легче, чем поодиночке. Мы хвалим себя за каждый прогресс».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с высокой работоспособностью';
            intro = `Вы оба трудолюбивы, усидчивы, любите доводить дела до конца. Это даёт вам огромный ресурс для достижений. Вы можете много работать, не уставая, и получать от этого удовольствие.`;
            body = `Но есть риск «трудоголизма» – вы можете не замечать, когда пора остановиться, и требовать того же от ребёнка. Дом в идеальном порядке, но вы оба выгораете. Важно учиться отдыхать.`;
            howToStrengthen = `Введите обязательные «часы ничегонеделания» – когда никто ничего не делает. Хвалите ребёнка не только за труд, но и за умение отдыхать. Направляйте трудолюбие в совместные проекты.`;
            example = `Папа и сын оба были трудоголиками. Они вместе ремонтировали машину, но забывали про отдых. Ввели правило: после 2 часов работы – 30 минут перерыва. Стали меньше уставать.`;
            ritual = `Раз в неделю устраивайте «день без дел» – никакой уборки, уроков, планов. Только то, что хочется.`;
            mantra = `«Наше трудолюбие – наша сила. Но мы помним, что отдых – тоже часть работы. Мы умеем и созидать, и расслабляться. Вместе мы – баланс».`;
        }
        else {
            harmonyType = 'близкий уровень трудолюбия';
            intro = `Вы примерно одинаково усидчивы. Это помогает планировать совместные дела и не конфликтовать из-за «лени». Вы редко спорите о том, кто больше делает.`;
            body = `Иногда вы можете синхронно «зависать» – оба откладывать важное. Важно поддерживать друг друга в такие моменты.`;
            howToStrengthen = `Договаривайтесь о «времени работы» и «времени отдыха» вместе. Если оба чувствуете спад – не вините, а поддержите: «Давай сделаем маленький шаг».`;
            example = `Мама и дочь вместе делали уроки. Они заметили, что если обе устали, то лучше отдохнуть 15 минут, а потом продолжить. Продуктивность выросла.`;
            ritual = `Раз в месяц устраивайте «трудовой день»: вместе делаете большое дело (генеральная уборка, ремонт) – и потом вместе награждаете себя чем-то вкусным.`;
            mantra = `«Наш ритм – наше общее дело. Мы работаем и отдыхаем вместе. Вместе мы – команда, которая знает, когда нажать на газ, а когда на тормоз».`;
        }
    }
    
    // ----- 7. УДАЧА (ВЕЗЕНИЕ) -----
    else if (name === 'Удача') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба с низкой удачей';
            intro = `Вам редко везёт, вы привыкли всего добиваться трудом, планированием, упорством. Это формирует надёжный внутренний стержень. Вы не полагаетесь на «авось», и это ваша сила.`;
            body = `Но может возникать чувство несправедливости: «Почему другим везёт, а нам нет?». Вы можете зависеть от контроля и бояться рисковать. Важно не впадать в пессимизм.`;
            howToStrengthen = `Учитесь замечать маленькие «совпадения» – их можно тренировать. Ведите дневник удачных случайностей. Не завидуйте «везунчикам» – у них могут быть свои трудности. Позволяйте себе небольшие риски.`;
            example = `Мама и сын часто жаловались, что им не везёт. Они начали записывать по одному приятному совпадению в день. Через месяц заметили, что «везти» стало чаще.`;
            ritual = `Каждый вечер рассказывайте друг другу об одном «счастливом совпадении» дня – даже самом маленьком (зелёный свет, нашли потерянную вещь).`;
            mantra = `«Удача не всегда к нам приходит, но мы умеем её замечать. Мы создаём свою удачу через подготовку и открытость. Вместе мы сильнее любых случайностей».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с высокой удачей';
            intro = `Вам часто везёт. Вы оказываетесь в нужное время в нужном месте, получаете неожиданные подарки судьбы. Это прекрасный ресурс, но есть риск привыкнуть полагаться только на удачу.`;
            body = `Вы можете перестать прилагать усилия, а когда удача отворачивается – впадать в панику. Важно не забывать про планирование и труд.`;
            howToStrengthen = `Цените удачу, но не полагайтесь только на неё. Развивайте навыки, создавайте подушку безопасности. Направляйте удачу на помощь другим – это приумножает её.`;
            example = `Папа и дочь часто выигрывали в лотереях. Но они не забывали работать. Однажды удача отвернулась, но их бизнес устоял благодаря запасу прочности.`;
            ritual = `Ведите «дневник удачи»: записывайте, когда и как вам повезло, и анализируйте, что этому предшествовало (ваше состояние, действия).`;
            mantra = `«Удача – наш союзник, но не хозяин. Мы благодарны ей, но не зависим от неё. Вместе мы и везучи, и трудолюбивы».`;
        }
        else {
            harmonyType = 'близкий уровень удачи';
            intro = `Ваше везение примерно одинаково. Вы синхронно переживаете «полосы» и редко спорите о том, кому больше повезло. Это помогает поддерживать друг друга в неудачах.`;
            body = `Вы можете вместе радоваться успехам и не завидовать. Главное – не расслабляться и не полагаться только на удачу.`;
            howToStrengthen = `Используйте совместные ритуалы «на удачу» – перед важным делом вместе делаете что-то символическое. Если одному не везёт, другой поддерживает: «Сегодня твоя очередь, завтра будет моя».`;
            example = `Мама и сын перед экзаменами вместе загадывали желание. Сын сдал, мама – нет, но они не расстроились, а пошли гулять. «В следующий раз повезёт нам обоим», – сказал сын.`;
            ritual = `Раз в месяц делайте что-то спонтанное, без плана (новое кафе, незнакомый маршрут). Наблюдайте, как часто это приносит приятные сюрпризы.`;
            mantra = `«Удача любит смелых, но она любит и подготовленных. Мы доверяем потоку, но не забываем о вёслах. Вместе мы плывём быстрее».`;
        }
    }
    
    // ----- 8. ДОЛГ (ОТВЕТСТВЕННОСТЬ) -----
    else if (name === 'Долг') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба со слабым чувством долга';
            intro = `Вы легко отказываетесь от обещаний, не любите быть «должными», живёте по принципу «как хочется». Это создаёт лёгкость в отношениях, но также и хаос.`;
            body = `Важные дела могут не делаться, договорённости не выполняться. Вы можете опаздывать, не предупреждая. Ребёнок не доводит дела до конца. Важно не стыдить, а учиться держать слово.`;
            howToStrengthen = `Начните с маленьких обязательств – пообещайте друг другу сделать одно дело и обязательно выполните. Ведите «список обещаний». Хвалите друг друга за выполненные обещания.`;
            example = `Мама и сын часто забывали о договорённостях. Они ввели «вечерний чек-лист»: три дела, которые нужно сделать завтра. Через месяц они стали надёжнее.`;
            ritual = `Каждую неделю давайте друг другу по одному маленькому обещанию (например, «я помою посуду вечером»). В конце недели обсуждайте, что получилось, а что нет – без критики.`;
            mantra = `«Ответственность – не бремя, а уважение к себе и другим. Мы учимся держать слово, начиная с малого. Вместе мы становимся надёжнее».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с высоким чувством долга';
            intro = `Вы оба очень ответственны, всегда держите слово, на вас можно положиться. Это создаёт доверие и надёжность. Вы не подводите друг друга.`;
            body = `Но вы можете брать на себя слишком много, страдать от чувства вины, если не справляетесь, и требовать того же от ребёнка. Важно учиться говорить «нет».`;
            howToStrengthen = `Разрешайте себе иногда не выполнять обещание, если это не критично. Не требуйте от ребёнка такой же ответственности – у него может быть другой предел. Хвалите его не только за «долг», но и за спонтанность.`;
            example = `Папа и сын всегда всё делали вовремя. Но папа начал выгорать. Они ввели «день без обязательств» – можно не держать слово. Папа отдохнул, сын научился расслабляться.`;
            ritual = `Раз в неделю устраивайте «день без должен» – делайте только то, что хочется, без обязательств.`;
            mantra = `«Наша ответственность – наша сила, но мы умеем её дозировать. Мы уважаем свой труд и своё право на отдых. Вместе мы – баланс долга и свободы».`;
        }
        else {
            harmonyType = 'близкий уровень долга';
            intro = `Вы примерно одинаково ответственно подходите к обязательствам. Это помогает доверять друг другу и планировать совместные дела.`;
            body = `Иногда вы можете синхронно перегружаться, беря на себя лишнее. Важно поддерживать друг друга и вовремя говорить «стоп».`;
            howToStrengthen = `Договаривайтесь, что можно «сбросить» ответственность, если устали. Поддерживайте друг друга: «Я вижу, что ты перегружен, давай я возьму это на себя».`;
            example = `Мама и дочь вместе готовились к празднику. Когда обе устали, они перенесли часть дел на следующий день. Праздник прошёл отлично, а нервы были целы.`;
            ritual = `Каждый вечер спрашивайте: «Что из обещанного я сегодня не сделал?» и «Что я сделал сверх?». Без оценок, просто факты.`;
            mantra = `«Мы отвечаем за свои слова, но не боимся просить о помощи. Вместе мы справляемся с любыми обязательствами».`;
        }
    }
    
    // ----- 9. ПАМЯТЬ -----
    else if (name === 'Память') {
        if (pv <= 1 && cv <= 1) {
            harmonyType = 'оба с низкой памятью';
            intro = `Вы легко забываете даты, имена, договорённости. Это создаёт взаимопонимание – вы не ругаете друг друга за забывчивость. Но есть риск упускать важное.`;
            body = `Вы можете терять вещи, забывать о дедлайнах, путать планы. Важно не стыдить себя, а использовать внешние инструменты.`;
            howToStrengthen = `Создайте внешнюю систему памяти: календари, напоминалки, стикеры. Повторяйте важную информацию несколько раз. Играйте в игры на память (мемори, «снежный ком»).`;
            example = `Мама и сын постоянно забывали о встречах. Они повесили на холодильник доску с планами на неделю. Проблемы исчезли.`;
            ritual = `Каждый вечер вместе вспоминайте три события дня (можно записывать). Это тренирует память и создаёт семейную традицию.`;
            mantra = `«Память – не наша сильная сторона, но у нас есть внешние помощники. Мы учимся запоминать через игру и поддержку. Вместе мы ничего не забываем».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = 'оба с высокой памятью';
            intro = `Вы оба обладаете отличной памятью. Вы запоминаете быстро и надолго, помните множество деталей. Это даёт преимущество в учёбе и работе.`;
            body = `Вы можете застревать в прошлом, помнить обиды годами, нагружать себя и ребёнка избыточной информацией. Важно учиться забывать и отпускать.`;
            howToStrengthen = `Учитесь отпускать старые обиды – практикуйте прощение. Не требуйте от ребёнка такой же памяти – у него могут быть другие сильные стороны. Хвалите за понимание, а не только за запоминание.`;
            example = `Папа и дочь помнили каждую ссору. Они ввели «вечер прощения» – говорили друг другу: «Я прощаю тебя за…». Отношения стали теплее.`;
            ritual = `Раз в месяц устраивайте «вечер забывания» – вспоминайте только хорошее, а плохое оставляйте в прошлом. Учитесь отпускать.`;
            mantra = `«Наша память – наше сокровище, но мы не хотим быть её рабами. Мы помним важное и отпускаем ненужное. Вместе мы – и память, и мудрость».`;
        }
        else {
            harmonyType = 'близкий уровень памяти';
            intro = `Ваши способности к запоминанию примерно одинаковы. Это помогает вам синхронизироваться – вы оба помните примерно одно и то же, редко спорите о фактах.`;
            body = `Иногда вы можете вместе «застревать» на деталях или, наоборот, оба забывать важное. Важно использовать общие напоминалки.`;
            howToStrengthen = `Ведите семейный календарь. Поддерживайте друг друга – если один забыл, другой мягко напоминает. Не критикуйте за забывчивость.`;
            example = `Мама и сын вместе планировали отпуск. Они записывали все идеи в общий блокнот, чтобы не забыть. Отпуск удался.`;
            ritual = `Раз в неделю играйте в «снежный ком»: первый называет слово, второй повторяет и добавляет своё, и так далее. Это весело и полезно.`;
            mantra = `«Наша память – наша общая библиотека. Мы помогаем друг другу вспоминать и не судим за забывчивость. Вместе мы ничего не теряем».`;
        }
    }
    
    // ----- 10. ОБЩИЙ СЛУЧАЙ (для остальных ячеек: Семья, Привычки, Самооценка, Быт, Талант, Темперамент, Дух) -----
    else {
        if (pv <= 1 && cv <= 1) {
            harmonyType = `оба со слабым проявлением качества «${name}»`;
            intro = `У вас обоих это качество выражено слабо. Вы редко конфликтуете на этой почве, потому что живёте в одном ритме. Но будьте осторожны: ваша общая «слабость» может стать точкой уязвимости.`;
            body = `Вы можете вместе упускать возможности, избегать решений, не замечать важные вещи. Ваша задача – не стыдиться, а развиваться сообща, маленькими шагами.`;
            howToStrengthen = `Начните с одной маленькой цели, связанной с этим качеством. Поддерживайте друг друга, хвалите за каждый шаг. Не пытайтесь объять необъятное.`;
            example = `У мамы и сына было слабо развито чувство стиля. Они вместе смотрели видео о моде, ходили по магазинам. Через полгода они стали одеваться лучше.`;
            ritual = `Каждый день делайте одно маленькое действие, укрепляющее это качество. Отмечайте галочкой в календаре.`;
            mantra = `«Мы не сильны в этой сфере, но мы учимся вместе. Маленькие шаги ведут к большим изменениям. Вместе мы справимся».`;
        }
        else if (pv >= 4 && cv >= 4) {
            harmonyType = `оба с сильным проявлением качества «${name}»`;
            intro = `У вас обоих это качество сильно развито. Вы отлично понимаете друг друга в этой сфере, но есть риск «перегрева».`;
            body = `Вы можете соревноваться, кто лучше, или требовать друг от друга идеала. Важно направлять эту силу во внешние цели, а не друг на друга.`;
            howToStrengthen = `Договоритесь о правилах: «когда я говорю "стоп" – мы прекращаем спорить». Направляйте энергию на совместные проекты.`;
            example = `У папы и дочери было сильно развито чувство справедливости. Они вместе участвовали в волонтёрских проектах, и их сила пошла в мирное русло.`;
            ritual = `Вместе ставьте амбициозную цель, связанную с этим качеством, и идите к ней. Празднуйте промежуточные победы.`;
            mantra = `«Наша сила – наше общее достояние. Мы используем её для созидания, а не для борьбы. Вместе мы – непобедимая команда».`;
        }
        else {
            harmonyType = `близкий уровень качества «${name}»`;
            intro = `Ваши показатели по этому качеству близки. Вы интуитивно понимаете потребности друг друга в этой области и редко конфликтуете.`;
            body = `Такая синхрония – это как общий язык, на котором вы говорите без слов. Используйте её для совместного роста.`;
            howToStrengthen = `Делайте то, что у вас получается, и поддерживайте друг друга. Не сравнивайте себя с другими семьями.`;
            example = `У мамы и сына было одинаковое чувство юмора. Они вместе смотрели комедии и смеялись до слёз. Это сближало их больше, чем любые разговоры.`;
            ritual = `Раз в неделю уделяйте 15 минут обсуждению того, как вы можете вместе улучшить это качество. Без критики, только идеи.`;
            mantra = `«Мы созвучны в этой сфере. Это наш мост, наша опора. Вместе мы развиваем то, что у нас уже есть».`;
        }
    }
    
    // ========== ИТОГОВЫЙ ВЫВОД ==========
    return `<div style="margin-bottom:20px;padding:15px;background:rgba(76,175,80,0.1);border-radius:10px;border-left:4px solid #4caf50;">
        <strong style="font-size:1.1rem;color:#4caf50;">🟢 ${name}:</strong> <strong>${pv} / ${cv}</strong> (${harmonyType})
        <div style="margin:10px 0 0;">
            <p><strong>✨ Что это значит для вас</strong><br>${intro}</p>
            <p><strong>💎 Как это проявляется в жизни</strong><br>${body}</p>
            <p><strong>🌱 Как укрепить эту гармонию</strong><br>${howToStrengthen}</p>
            <div style="background:rgba(212,175,55,0.1);padding:10px;border-radius:8px;margin:10px 0;">
                <p><strong>📖 Пример из практики</strong><br>${example}</p>
            </div>
            <div style="background:rgba(168,218,220,0.15);padding:10px;border-radius:8px;margin:10px 0;">
                <p><strong>🕯️ Ритуал на сегодня</strong><br>${ritual}</p>
            </div>
            <div style="background:rgba(255,215,0,0.08);padding:10px;border-radius:8px;border-left:2px solid var(--gold);margin:10px 0;">
                <p><strong>🌟 Что запомнить навсегда</strong><br>«${mantra}»</p>
            </div>
        </div>
    </div>`;
}

// Форматирование напряжения
function formatTensionZone(zone, parentMatrix, childMatrix) {
    const name = zone.name;
    const pv = zone.parentValue;
    const cv = zone.childValue;
    const diff = Math.abs(pv - cv);
    
    // Определяем тип напряжения
    let typeLabel = '';
    let typeDescription = '';
    if (zone.type === 'PARENT_STRONG') typeLabel = 'родитель сильнее';
    else if (zone.type === 'CHILD_STRONG') typeLabel = 'ребёнок сильнее';
    else if (zone.type === 'BOTH_WEAK') typeLabel = 'обоим не хватает';
    else if (zone.type === 'BOTH_EXCESS') typeLabel = 'перебор у обоих';
    else typeLabel = 'умеренное расхождение';
    
    // Генерация уникального, объёмного текста в зависимости от ячейки
    let fullText = '';
    
    if (name === 'Характер') {
        fullText = `
            <p>🧠 <strong>Почему эта зона напрягает вас обоих</strong><br>
            Дорогие родители, характер — это не «я такой от рождения». Это ваша воля, способность отстаивать границы и при этом слышать другого. Когда у вас с ребёнком большая разница в волевых качествах (${pv} против ${cv}), вы постоянно говорите на разных языках. Вы — командир, который ждёт быстрых решений. Он — разведчик, которому нужно время на размышления. Или наоборот. Каждый вечер вы устаёте от борьбы, а он — от давления. Знаете это чувство «я уже 100 раз сказала, а он как будто не слышит»? Это оно.</p>
            
            <p>🎭 <strong>Как это выглядит в жизни</strong><br>
            Вы заходите в комнату и видите разбросанные вещи. Вам хочется рявкнуть: «Немедленно убери!». А ребёнок замирает, смотрит в пол и молчит. Он не бунтует — он просто не знает, с чего начать. Или вы просите его выбрать кружок, а он неделю мучается, не может определиться. Вы теряете терпение, он закрывается. Замкнутый круг.</p>
            
            <p>⚠️ <strong>Главная ошибка, которую вы совершаете</strong><br>
            Вы думаете: «Если я перестану давить, он совсем сядет на шею». Или: «Если я уступлю, он меня не уважает». Это ловушка. Давление не рождает волю — оно рождает либо бунт, либо апатию. А уступчивость без правил — это не уважение, а потеря ориентиров. Правда в том, что волевой стержень не передаётся через приказы. Он формируется через безопасные выборы и поддержку.</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> Дайте ребёнку выбор в трёх мелочах: «Ты будешь пить чай из красной или синей кружки?», «Какую футболку наденем — зелёную или серую?», «Мы сначала помоем посуду или вытрем пыль?». Выбор из двух вариантов — идеальный тренажёр для слабой воли. И обязательно скажите: «Ты сам решил — это здорово!»<br>
            🔹 <strong>На этой неделе:</strong> Создайте «доску выбора» — на ней будут простые ежедневные решения, которые ребёнок принимает сам. Например: меню на завтрак, порядок домашних дел, последовательность сборов в школу. Ваша задача — не критиковать его выбор, даже если он не самый удачный. Иначе он поймёт: «выбор — это ловушка» и снова начнёт ждать ваших указаний.<br>
            🔹 <strong>В ближайший месяц:</strong> Постепенно увеличивайте сложность выборов. От «какую рубашку» до «в какой кружок пойдём?». И главное — разрешите ему ошибаться. Если он выбрал слишком много кружков и устал — это его опыт, а не ваша ошибка. Не спасайте. Спросите: «Что ты понял? Как в следующий раз поступим?».</p>
            
            <p>📖 <strong>История из практики</strong><br>
            Пришла ко мне мама 12-летнего Кирилла. Вечные скандалы из-за уроков. «Я говорю — садись делать математику, а он начинает ныть, отвлекаться, в итоге сидит до полуночи». Мы разобрали: у мамы — сильный характер (4 единицы), у Кирилла — слабый (1 единица). Вместо приказов она стала давать выбор: «Ты будешь делать математику сейчас или после ужина?», «Ты начнёшь с лёгких задач или с трудных?». Через две недели Кирилл стал сам садиться за уроки. Не потому что полюбил математику, а потому что перестал бояться, что его «задавят». Выбор вернул ему чувство контроля.</p>
            
            <p>🕯️ <strong>Ритуал на сегодня</strong><br>
            Сядьте напротив друг друга. Положите на стол два предмета: например, камень и перо. Скажите: «Камень — это моя твёрдость. Перо — твоя гибкость. Мы разные, и это нормально. Давай договоримся: когда я говорю "стоп" — мы оба замолкаем на минуту и просто дышим». Сделайте это прямо сейчас. Вы увидите, как напряжение уходит.</p>
            
            <p>🌟 <strong>Что запомнить навсегда</strong><br>
            «Характер — это не битва, а танец. Если вы оба настаиваете на своей партии — вы топчетесь на месте. Если один ведёт, а другой подчиняется — это не танец, а прогулка. Настоящая гармония — когда вы меняетесь ролями, слушаете музыку друг друга и вместе создаёте ритм, который никто не мог предвидеть».</p>
        `;
    }
    else if (name === 'Энергия') {
        fullText = `
            <p>🔋 <strong>Почему эта зона напрягает</strong><br>
            Энергия — это ваш общий бюджет сил. Если у вас её много, а у ребёнка мало, вы невольно начинаете считать его ленивым. А он чувствует себя вечно виноватым. Если наоборот — вы выдыхаетесь, а он полон сил — вы чувствуете себя «старой развалиной». Правда в том, что энергия не имеет ничего общего с силой воли или любовью к вам. Это просто биология. И пока вы не примете этот факт, вы будете раздражаться друг на друга.</p>
            
            <p>🏃 <strong>Как это выглядит в жизни</strong><br>
            Вы возвращаетесь с работы и хотите активных выходных: парк, кино, гости. А ребёнок после школы падает на диван и говорит: «Я устал». Вы думаете: «Он просто ленится, надо его расшевелить». Начинаете уговаривать, потом ругаться. В итоге или едете, и ребёнок капризничает весь день, или остаётесь дома и вы злитесь. Знакомо?</p>
            
            <p>⚠️ <strong>Главная ошибка</strong><br>
            Вы требуете от ребёнка вашего темпа. «Я же могу работать до ночи, значит и ты должен». Это как требовать от цыплёнка летать как орёл. Энергия не воспитывается — она даётся от природы. Её можно только беречь и грамотно распределять. Вторая ошибка — обесценивать его усталость. Фразы «Что ты устал? Ты же ничего не делал» бьют больнее, чем вы думаете. Он начинает стыдиться своего тела, а стыд — самый плохой мотиватор.</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> Спросите ребёнка: «По шкале от 1 до 10, сколько у тебя сейчас энергии?». Если меньше 5 — отмените все планы, кроме самых важных. Просто побудьте рядом. Если 7–10 — предложите активность, но не требуйте.<br>
            🔹 <strong>На этой неделе:</strong> Заведите «энергетический дневник». Вместе отмечайте, в какое время суток у вас пик сил, а когда спад. Планируйте сложные дела на пик, а отдых — на спад. Вы удивитесь, насколько меньше станет конфликтов.<br>
            🔹 <strong>В ближайший месяц:</strong> Введите «ленивые дни» — раз в неделю вы вообще ничего не планируете. Валяетесь, смотрите кино, едите, что захочется. Это не распущенность — это профилактика выгорания. Особенно важно, если вы оба с низкой энергией.</p>
            
            <p>📖 <strong>История из практики</strong><br>
            У 8-летней Алисы было 0 двоек в матрице, а у мамы — 4. Алиса быстро уставала в школе, а мама требовала после уроков ещё и на кружки. Девочка начала болеть каждый месяц. Мы ввели простое правило: после школы — час полного покоя (лёжа, без телефона, без разговоров). Через месяц Алиса перестала болеть, а мама... сама полюбила этот час тишины и обнаружила, что тоже устаёт больше, чем думала.</p>
            
            <p>🧘 <strong>Ритуал на сегодня</strong><br>
            Сядьте на пол, закройте глаза, положите руки на колени. 3 минуты просто дышите. Вдох — вы вдыхаете энергию. Выдох — вы отпускаете усталость. Делайте это вместе. Потом обнимитесь и скажите друг другу: «Мы разные, но мы команда».</p>
            
            <p>💎 <strong>Что запомнить навсегда</strong><br>
            «Энергия — это не соревнование. Если у одного бензин на 10 литров, а у другого на 50, это не значит, что первый плохой. Просто у него бак меньше. Ваша задача — не перелить из одного бака в другой, а планировать маршрут, чтобы хватило обоим».</p>
        `;
    }
    else if (name === 'Интерес') {
        fullText = `
            <p>📚 <strong>Почему эта зона напрягает</strong><br>
            Интерес к познанию — это не про школьные оценки. Это про то, насколько человеку интересно узнавать новое вообще. Если вы любите читать, а ребёнок — нет, вы будете считать его «поверхностным». Если он любит, а вы — нет, вы будете чувствовать себя «недостаточно умным». Правда в том, что его мозг просто устроен иначе. Ему нужно учиться через движение, практику, видео, а не через учебники. И это нормально.</p>
            
            <p>📖 <strong>Как это выглядит в жизни</strong><br>
            Вы дарите ребёнку энциклопедию, а он её не открывает. Вы предлагаете сходить в музей — он капризничает. Вы включаете научпоп — он уходит в телефон. Вы думаете: «Ему ничего не интересно, он пропащий». А он просто не может сидеть и слушать. Ему нужно делать: лепить, клеить, проводить опыты, смотреть короткие видео. Его интерес — это не отсутствие, а другой формат.</p>
            
            <p>⚠️ <strong>Главная ошибка</strong><br>
            Вы обесцениваете его способы познания. «Компьютерные игры — это ерунда», «ТикТок — убивает мозг». Но если ему интересно — это уже отправная точка. Через игры можно учить языки, через видео — историю, через мемы — литературу. Вторая ошибка — сравнивать его с собой. «Я в твоём возрасте уже читал Дюма». Не надо. У вас были другие условия и другой мозг.</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> Посмотрите вместе 10-минутное видео на YouTube на тему, которая ему нравится (игры, животные, машины). После просмотра спросите: «Что ты узнал нового? Что было самым интересным?». Не экзамен — просто разговор.<br>
            🔹 <strong>На этой неделе:</strong> Предложите ему самому найти короткое видео или статью и рассказать вам. Сделайте это игрой: «Ты сегодня — учитель, а я — ученик». Он почувствует себя экспертом, и интерес проснётся сам.<br>
            🔹 <strong>В ближайший месяц:</strong> Создайте «копилку знаний» — коробку, куда он будет складывать интересные факты, картинки, вырезки. Раз в неделю открывайте её и вспоминайте, что узнали. Это превратит обучение в игру.</p>
            
            <p>📖 <strong>История из практики</strong><br>
            Дима, 10 лет, ненавидел читать. Мама в отчаянии. Оказалось, у него 0 троек в матрице (интерес к познанию). Мы предложили: вместо книг — комиксы и аудиокниги. Через месяц Дима сам попросил купить ему «Гарри Поттера» — после того, как посмотрел фильм и захотел узнать больше. Не было насилия — было уважение к его темпу.</p>
            
            <p>🎲 <strong>Ритуал на сегодня</strong><br>
            Возьмите лист бумаги и разделите его на две колонки: «Что я хочу узнать» и «Что хочет узнать ребёнок». Выпишите по три пункта. Найдите одну тему, которая пересекается. Изучите её вместе. Без оценок, без экзаменов — просто из любопытства.</p>
            
            <p>✨ <strong>Что запомнить навсегда</strong><br>
            «Интерес не приходит по команде. Он приходит через радость, игру и уважение к тому, что человеку уже нравится. Если вы хотите, чтобы ребёнок полюбил учиться, перестаньте учить его учиться. Просто будьте рядом, когда он открывает что-то своё».</p>
        `;
    }
    else if (name === 'Здоровье') {
        fullText = `
            <p>🩺 <strong>Почему эта зона напрягает</strong><br>
            Здоровье — самая деликатная сфера. Когда у вас и у ребёнка большая разница в физической выносливости, вы невольно начинаете обвинять друг друга. Вы — «крепкий орешек», он — «вечно болеющий». Или наоборот. Вы считаете, что он «симулирует», а он считает, что вы «не понимаете». Правда в том, что организм — это не поле для битвы. Он просто устроен так, как устроен. И ваша задача — не переделывать его, а адаптироваться.</p>
            
            <p>🤒 <strong>Как это выглядит в жизни</strong><br>
            Ребёнок жалуется на головную боль. Вы говорите: «Просто поспи, пройдёт». А через час он уже с температурой. Или вы сами болеете, а ребёнок требует активных игр. Вы чувствуете себя плохим родителем, он — обделённым. Каждый раз, когда кто-то заболевает, начинаются упрёки: «Ты плохо оделся», «Ты мало ешь», «Ты сидишь дома, вот и болеешь». Вместо поддержки — допрос.</p>
            
            <p>⚠️ <strong>Главная ошибка</strong><br>
            Вы игнорируете первые сигналы. «Подумаешь, устал», «Температура невысокая — иди в школу». Вы боитесь, что ребёнок «привыкнет болеть». Но хроническое игнорирование ведёт к психосоматике. Ребёнок начинает болеть ещё чаще — теперь уже на нервной почве. Вторая ошибка — использовать здоровье как рычаг давления: «Будешь плохо есть — заболеешь», «Не наденешь шапку — попадёшь в больницу». Это создаёт тревожность, а не заботу.</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> Спросите ребёнка: «Что ты сейчас чувствуешь в теле?». Научите его называть ощущения: «У меня покалывает в боку», «У меня тяжесть в голове». Чем раньше он научится замечать сигналы, тем реже будет болеть.<br>
            🔹 <strong>На этой неделе:</strong> Введите «золотой час» — время, когда вы просто лежите в тишине. Без телефонов, без разговоров. Это восстановление не только для ребёнка, но и для вас. Делайте это каждый день после школы.<br>
            🔹 <strong>В ближайший месяц:</strong> Пройдите профилактический медосмотр. Не когда уже заболели, а когда здоровы. Узнайте реальные слабые места организма. И на основе этого стройте режим, а не на своих догадках.</p>
            
            <p>📖 <strong>История из практики</strong><br>
            Папа жаловался, что 12-летний сын «вечно сопливит». Проверили — у ребёнка 0 четвёрок (слабое здоровье), у папы 4 (крепкое). Папа требовал, чтобы сын ходил на лыжах, как он сам. После трёх простуд подряд папа сдался. Мы ввели щадящий режим: лыжи заменили на прогулки, добавили витамины, наладили сон. Через два месяца сын перестал болеть, а папа… признал, что сам тоже устаёт и ему нужен отдых.</p>
            
            <p>🕯️ <strong>Ритуал на сегодня</strong><br>
            Зажгите свечу. Сядьте напротив друг друга. Положите руки на сердце. Скажите: «Я желаю тебе здоровья. Не потому что ты болеешь — а потому что ты дорог. Мы будем беречь друг друга». Постойте так минуту. Потом выдохните и обнимитесь.</p>
            
            <p>🌟 <strong>Что запомнить навсегда</strong><br>
            «Здоровье — это не награда за правильное поведение. Это данность, которую нужно принимать и беречь. Если ребёнок болеет чаще, чем вам хочется, это не его вина. Это его конституция. И ваша задача — не лечить его от слабости, а научить жить с ней в гармонии».</p>
        `;
    }
    else {
        // Общий шаблон для всех остальных ячеек (Логика, Труд, Удача, Долг, Память, Семья, Привычки, Самооценка, Быт, Талант, Темперамент, Дух)
        fullText = `
            <p>🧩 <strong>Почему эта зона напрягает</strong><br>
            Сфера «${name}» — это та область, где ваши с ребёнком «операционные системы» не совпадают. Вы ждёте одного, а он выдаёт другое. Вы считаете, что «это же очевидно», а он искренне не понимает. Конфликт возникает не потому, что кто-то плохой. А потому, что вы говорите на разных языках. ${name} — это как быть носителем английского и китайского. Оба языка прекрасны, но без переводчика вы будете раздражаться.</p>
            
            <p>🎭 <strong>Как это выглядит в жизни</strong><br>
            Возьмём ${name}. Вы просите ребёнка сделать что-то, а он делает по-своему. Вы говорите: «Почему не так, как я просил?». Он отвечает: «А я так понял». Вы кипите, он обижается. На следующий день история повторяется. Вы начинаете думать, что он делает назло. А он просто не может уловить ваш способ мышления. Это как если бы вы объясняли, как завязать шнурки, а он видел задачу совсем иначе.</p>
            
            <p>⚠️ <strong>Главная ошибка</strong><br>
            Вы пытаетесь переделать ребёнка под себя. «Почему ты не можешь быть как я?», «Смотри, как надо». Вы не оставляете ему пространства для его собственного способа. Вторая ошибка — вы злитесь, а не объясняете. Фраза «Ну что тут непонятного?» — самая разрушительная. Если бы он понимал, он бы сделал. Он не делает — значит, действительно не понимает. Не упрямится, а именно не понимает.</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> Вместо того чтобы критиковать, спросите: «Как ты понял мою просьбу? Расскажи своими словами». Вы увидите, где возникло недопонимание. И объясните ещё раз, но уже на его языке.<br>
            🔹 <strong>На этой неделе:</strong> Составьте вместе «карту различий». Напишите, как вы подходите к ${name}, и как к этому подходит ребёнок. Не оценивайте, просто констатируйте. Вы удивитесь, насколько вы разные — и это не плохо.<br>
            🔹 <strong>В ближайший месяц:</strong> Выберите одну сферу, где разница максимальна, и договоритесь: «В этом вопросе я следую твоему способу, а в следующем — ты моему». По очереди. Это научит уважать различия.</p>
            
            <p>📖 <strong>История из практики</strong><br>
            Мама с дочкой-подростком вечно ссорились из-за уборки. У мамы была высокая потребность в порядке (${pv}), у дочки — низкая (${cv}). Мама требовала идеальной чистоты, дочка считала это занудством. Мы предложили компромисс: дочка отвечает за порядок в своей комнате (как хочет), а мама — за общие зоны. Конфликт прекратился. Дочка даже стала иногда убирать общие зоны — без давления, а просто потому что видела пример мамы.</p>
            
            <p>🎨 <strong>Ритуал на сегодня</strong><br>
            Возьмите два листа бумаги и фломастеры. Нарисуйте, как вы видите идеальный порядок в этой сфере. Покажите друг другу. Не критикуйте, просто посмотрите. Вы увидите, что у каждого своя красота. И это прекрасно.</p>
            
            <p>💎 <strong>Что запомнить навсегда</strong><br>
            «Разные не значит плохие. Если бы вы были одинаковыми, один из вас был бы лишним. Ваши различия — не поле для битвы, а территория для открытий. Вместо того чтобы переделывать ребёнка, изучите его мир. И вы поймёте, что там тоже есть своя логика, своя красота и своя правда».</p>
        `;
    }
    
    return `<div style="margin-bottom:20px;padding:15px;background:rgba(244,67,54,0.1);border-radius:10px;border-left:4px solid #f44336;">
        <strong style="font-size:1.1rem;color:#f44336;">🔴 ${name}:</strong> <strong>${pv} / ${cv}</strong> (${typeLabel})
        <div style="margin:10px 0 0;">${fullText}</div>
    </div>`;
}
// Форматирование роста
function formatGrowthZone(zone, parentMatrix, childMatrix) {
    const name = zone.name;
    const pv = zone.parentValue;
    const cv = zone.childValue;
    const isParentStronger = pv > cv;
    
    let fullText = '';
    
    if (name === 'Характер') {
        fullText = `
            <p>🌱 <strong>Почему эта зона роста так важна именно сейчас</strong><br>
            Дорогие родители, характер — это не статичная черта, а мышца. И сейчас, когда разница между вами особенно заметна, у вас есть уникальный шанс: либо укрепить волю ребёнка, либо, наоборот, научиться у него гибкости. ${isParentStronger ? 'Вы сильнее в этом качестве' : 'Ваш ребёнок сильнее в этом качестве'}. Это не навсегда — это просто текущая реальность. И её можно использовать как трамплин для роста.</p>
            
            <p>🎯 <strong>Как это проявляется в жизни</strong><br>
            ${isParentStronger ? 
                'Вы замечаете, что ребёнок часто сомневается, долго думает, боится сделать первый шаг. Вы хотите его «подтолкнуть», но он замирает. Ваша сила воли его не зажигает, а гасит. А он, в свою очередь, учит вас терпению. Каждый раз, когда вы ждёте его решения, вы тренируете свою выдержку. Это не слабость — это школа.' : 
                'Вы видите, как ребёнок легко отстаивает своё мнение, спорит, не боится говорить «нет». А вам это даётся тяжелее. Вы восхищаетесь им, но иногда чувствуете себя неуверенно. И это нормально. Ребёнок — ваш личный коуч по смелости. Каждый его шаг — это урок для вас.'
            }</p>
            
            <p>⚠️ <strong>Главная ошибка, которую вы совершаете</strong><br>
            ${isParentStronger ? 
                'Вы пытаетесь «продавить» его волю своей. «Делай как я», «Возьми себя в руки». Этим вы не укрепляете его характер — вы его подавляете. Он не становится сильнее, он просто учится притворяться или бунтовать. Вторая ошибка — вы не замечаете его маленьких побед. Он сам выбрал рубашку? Он сказал «нет» другу? Это миллиметры роста, но без вашего признания они не превратятся в сантиметры.' : 
                'Вы боитесь его силы и начинаете его одёргивать. «Не спорь», «Ты ещё мал», «Я лучше знаю». Вы лишаете его возможности тренировать свой характер, а себя — возможности учиться. Вторая ошибка — вы не берёте с него пример. Вместо того чтобы спросить: «А как у тебя получается не бояться?», вы обесцениваете: «Повезло просто». Упущенный шанс.'
            }</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> ${isParentStronger ? 
                'Дайте ребёнку возможность принять одно решение без вашего участия. Не советуйте, не поправляйте. Просто скажите: «Я доверяю твоему выбору». После этого обязательно похвалите: «Ты сам справился — это здорово!».' : 
                'Попросите ребёнка помочь вам принять решение. «Я сомневаюсь, как ты думаешь, что лучше?». Выслушайте и, если возможно, сделайте по его совету. Вы покажете, что уважаете его мнение, и сами научитесь смелости.'
            }<br>
            🔹 <strong>На этой неделе:</strong> ${isParentStronger ? 
                'Составьте «лестницу решений»: от самых простых (выбор завтрака) до самых сложных (куда поехать в выходные). Каждый день поднимайтесь на одну ступеньку. Ваша задача — не решать за него, а быть рядом. Если он ошибётся — не спасайте, а обсуждайте: «Что ты узнал? Как в следующий раз сделаешь лучше?».' : 
                'Замечайте, в каких ситуациях ребёнок проявляет волю, и записывайте. В конце недели скажите ему: «Ты меня вдохновляешь. Я учусь у тебя смелости». Это укрепит его самооценку и вашу связь.'
            }<br>
            🔹 <strong>В ближайший месяц:</strong> ${isParentStronger ? 
                'Выберите одно дело, где вы обычно берёте инициативу на себя, и передайте её ребёнку. Например, пусть он сам организует семейный ужин или выберет маршрут прогулки. Наблюдайте, не вмешивайтесь. Вы увидите, как растёт его уверенность.' : 
                'Вместе поставьте цель, где нужно проявить волю. Например, записаться на курс, который вы давно хотели, но боялись. Ребёнок будет вашим «тренером» — будет подбадривать, напоминать, радоваться вашим шагам. Так вы оба выиграете.'
            }</p>
            
            <p>📖 <strong>История из практики</strong><br>
            ${isParentStronger ? 
                'Пришла мама с 9-летним Мишей. У мамы — 4 единицы характера, у Миши — 1. Мама жаловалась: «Он не может сказать «нет» в школе, его обижают». Мы начали с малого: дома Миша выбирал, что будет на ужин. Потом — какие фильмы смотреть. Потом — в какие игры играть с друзьями. Через три месяца Миша впервые отказался помочь однокласснику списать — и не почувствовал вины. Мама плакала от счастья. Она поняла: воля не передаётся через давление, а выращивается через маленькие победы.' : 
                'Пришёл папа с 14-летним Димой. У папы — 1 единица характера, у Димы — 4. Папа жаловался: «Он со мной спорит постоянно, я чувствую себя дураком». Мы предложили папе не бороться, а учиться. Дима научил папу говорить «нет» навязчивым продавцам. Через месяц папа впервые отказался от ненужной страховки. Он сказал: «Сын, ты мой герой». Дима расцвёл, а их отношения перестали быть полем битвы.'
            }</p>
            
            <p>🕯️ <strong>Ритуал на сегодня</strong><br>
            Сядьте напротив друг друга. Возьмите по камешку. Скажите: «Этот камень — моя твёрдость. Я кладу его перед тобой, чтобы ты знал: я рядом, но не давлю». Положите камень. Потом скажите: «А теперь твой камень — это твоя смелость. Положи его передо мной, чтобы я помнил: ты можешь больше, чем я думаю». Сделайте это. Обнимитесь.</p>
            
            <p>🌟 <strong>Что запомнить навсегда</strong><br>
            «Характер не воспитывается приказами. Он вырастает из маленьких «я сам», «я решил», «я смог». Ваша задача — не быть надзирателем, а быть садовником. Поливать, удобрять, но не выдёргивать росток, чтобы он рос быстрее».</p>
        `;
    }
    else if (name === 'Энергия') {
        fullText = `
            <p>🔋 <strong>Почему эта зона роста так важна именно сейчас</strong><br>
            Энергия — это ресурс, который нельзя накопить впрок, но можно научиться распределять. Сейчас, когда разница в уровне энергии очевидна, у вас есть шанс: либо научить ребёнка беречь свои силы, либо научиться у него лёгкости и спонтанности. ${isParentStronger ? 'У вас энергии больше' : 'У ребёнка энергии больше'}. Это не навсегда — это просто разные батарейки. И их можно заряжать друг от друга, если знать как.</p>
            
            <p>🏃 <strong>Как это проявляется в жизни</strong><br>
            ${isParentStronger ? 
                'Вы полны сил, а ребёнок быстро устаёт. Вы можете работать допоздна, а он после школы — на нуле. Вы хотите активных выходных, а он — лежать. Вы злитесь, он чувствует себя виноватым. Но правда в том, что он не ленится. Его организм просто устроен иначе. А вы — наоборот — можете научить его, как распределять силы, чтобы не выгорать.' : 
                'Ребёнок — энерджайзер, а вы выдыхаетесь. Он хочет бегать, играть, гулять, а вы — лечь на диван. Вы чувствуете себя «плохим родителем», он — обделённым. Но правда в том, что его энергия — это не упрёк вам. Это дар. И вы можете научиться у него лёгкости, а он у вас — бережливости.'
            }</p>
            
            <p>⚠️ <strong>Главная ошибка, которую вы совершаете</strong><br>
            ${isParentStronger ? 
                'Вы требуете от ребёнка вашего темпа. «Я же могу, значит и ты должен». Это как требовать от цыплёнка летать как орёл. Вы не понимаете, что его усталость — не слабость, а сигнал. Игнорируя его, вы загоняете его в болезнь. Вторая ошибка — вы не учите его отдыхать. Вы сами не умеете останавливаться, поэтому и ему не показываете пример.' : 
                'Вы пытаетесь «затормозить» ребёнка. «Сядь», «Не бегай», «Успокойся». Вы боитесь его энергии, считаете её проблемой. Но его активность — это не гиперактивность, а его природа. Запрещая ему двигаться, вы не делаете его спокойнее — вы делаете его несчастным. Вторая ошибка — вы не используете его энергию для совместных дел.'
            }</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> ${isParentStronger ? 
                'Спросите ребёнка: «По шкале от 1 до 10, сколько у тебя сейчас энергии?». Если меньше 5 — отмените всё, кроме самого важного. Просто побудьте рядом. Если 7–10 — предложите активность, но не требуйте.' : 
                'Спросите ребёнка: «Какую активность ты хочешь сейчас?». И сделайте это вместе. Даже если вы устали. Пятнадцать минут — и вы увидите, как его глаза загорятся.'
            }<br>
            🔹 <strong>На этой неделе:</strong> ${isParentStronger ? 
                'Введите «энергетические перерывы». Каждые 45 минут — 5 минут тишины. Это и для вас, и для него. Вы научитесь замечать свою усталость, он — распределять силы.' : 
                'Планируйте день так: час активных дел (с ребёнком) — час вашего отдыха. Пока он бегает во дворе, вы сидите на скамейке с книгой. Идеальный компромисс.'
            }<br>
            🔹 <strong>В ближайший месяц:</strong> ${isParentStronger ? 
                'Введите «ленивые дни» — раз в неделю вы вообще ничего не планируете. Валяетесь, смотрите кино, едите, что захочется. Это профилактика выгорания для вас обоих.' : 
                'Найдите активность, которая нравится вам обоим. Например, плавание, велосипед, походы. Там, где вы двигаетесь, но в своём темпе. Так вы будете вместе, и никто не будет чувствовать себя обузой.'
            }</p>
            
            <p>📖 <strong>История из практики</strong><br>
            ${isParentStronger ? 
                'У 7-летней Ани было 0 двоек, у мамы — 4. Аня быстро уставала, мама требовала кружков. Девочка начала болеть каждый месяц. Мы ввели правило: после школы — час полного покоя. Через месяц Аня перестала болеть, а мама… сама полюбила этот час тишины и обнаружила, что тоже устаёт больше, чем думала.' : 
                'У 10-летнего Димы было 4 двойки, у папы — 0. Папа жаловался: «Я не могу за ним угнаться, чувствую себя стариком». Мы предложили папе не догонять, а делегировать. Дима стал ответственным за активные игры с младшей сестрой, а папа — за спокойные вечерние ритуалы. Конфликты прекратились, а папа перестал корить себя за «медлительность».'
            }</p>
            
            <p>🧘 <strong>Ритуал на сегодня</strong><br>
            Сядьте на пол, закройте глаза, положите руки на колени. 3 минуты просто дышите. Вдох — вы вдыхаете энергию. Выдох — вы отпускаете усталость. Делайте это вместе. Потом обнимитесь и скажите: «Мы разные, но мы команда».</p>
            
            <p>💎 <strong>Что запомнить навсегда</strong><br>
            «Энергия — это не соревнование. Если у одного бензин на 10 литров, а у другого на 50, это не значит, что первый плохой. Просто у него бак меньше. Ваша задача — не перелить из одного бака в другой, а планировать маршрут, чтобы хватило обоим».</p>
        `;
    }
    else if (name === 'Интерес') {
        fullText = `
            <p>📚 <strong>Почему эта зона роста так важна именно сейчас</strong><br>
            Интерес к познанию — это не про оценки в школе. Это про любопытство, которое остаётся на всю жизнь. Сейчас, когда разница в уровне интереса очевидна, у вас есть шанс: либо заразить ребёнка тягой к знаниям, либо самому открыть новые способы учиться. ${isParentStronger ? 'Вы любите узнавать новое' : 'Ваш ребёнок — природный исследователь'}. И это ваше общее богатство, если не бороться, а дополнять.</p>
            
            <p>📖 <strong>Как это проявляется в жизни</strong><br>
            ${isParentStronger ? 
                'Вы читаете, ходите на курсы, смотрите научпоп. А ребёнок — в телефоне. Вы считаете его «поверхностным», он вас — «занудой». Вы предлагаете пойти в музей — он капризничает. Вы включаете документалку — он уходит. Вы чувствуете, что он «не ценит знания». А он просто не может учиться через лекции. Ему нужно делать, пробовать, ошибаться.' : 
                'Ребёнок постоянно что-то спрашивает, изучает, собирает, разбирает. А вы устали от его «почему?». Вы отмахиваетесь, говорите «потом», «не сейчас». Вы чувствуете себя «недостаточно умным» и раздражаетесь. А он просто хочет делиться с вами своим миром. И каждое ваше «отстань» — это упущенная возможность.'
            }</p>
            
            <p>⚠️ <strong>Главная ошибка, которую вы совершаете</strong><br>
            ${isParentStronger ? 
                'Вы обесцениваете его способы познания. «Компьютерные игры — ерунда», «ТикТок — убивает мозг». Но если ему интересно — это уже отправная точка. Через игры можно учить языки, через видео — историю, через мемы — литературу. Вторая ошибка — вы сравниваете его с собой. «Я в твоём возрасте уже читал Дюма». Не надо. У вас были другие условия.' : 
                'Вы не берёте с него пример. Вместо того чтобы спросить: «А что тебя так увлекло?», вы говорите: «Хватит сидеть в телефоне». Вы лишаете себя шанса узнать что-то новое. Вторая ошибка — вы не даёте ему ресурсов. Ему нужны книги, кружки, инструменты — а вы экономите.'
            }</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> ${isParentStronger ? 
                'Посмотрите вместе 10-минутное видео на тему, которая ему нравится (игры, животные, машины). После спросите: «Что ты узнал нового? Что было самым интересным?». Не экзамен — просто разговор.' : 
                'Попросите ребёнка рассказать вам о том, что его увлекает. Не перебивайте, не оценивайте. Просто слушайте. Вы узнаете много нового.'
            }<br>
            🔹 <strong>На этой неделе:</strong> ${isParentStronger ? 
                'Предложите ребёнку самому найти короткое видео или статью и рассказать вам. Сделайте это игрой: «Ты сегодня — учитель, а я — ученик». Он почувствует себя экспертом, и интерес проснётся сам.' : 
                'Найдите вместе один факт или тему, которая интересна вам обоим. Изучите её. Это может быть что угодно — от космоса до рецепта пиццы. Главное — вместе.'
            }<br>
            🔹 <strong>В ближайший месяц:</strong> ${isParentStronger ? 
                'Создайте «копилку знаний» — коробку, куда он будет складывать интересные факты, картинки, вырезки. Раз в неделю открывайте её и вспоминайте, что узнали. Это превратит обучение в игру.' : 
                'Вместе запишитесь на короткий онлайн-курс или мастер-класс. Пусть ребёнок выбирает. Вы будете учиться вместе — на равных. Это укрепит вашу связь.'
            }</p>
            
            <p>📖 <strong>История из практики</strong><br>
            ${isParentStronger ? 
                'Дима, 10 лет, ненавидел читать. Мама в отчаянии. Оказалось, у него 0 троек (интерес), у мамы 4. Мы предложили: вместо книг — комиксы и аудиокниги. Через месяц Дима сам попросил купить ему «Гарри Поттера» — после того, как посмотрел фильм и захотел узнать больше.' : 
                'Катя, 12 лет, обожала астрономию, а папа считал это «ерундой». Папа работал водителем, звёзды его не интересовали. Мы предложили папе сходить с Катей в планетарий. Он согласился «для дочки». В итоге сам увлёкся — теперь они вместе смотрят видео о космосе и обсуждают чёрные дыры.'
            }</p>
            
            <p>🎲 <strong>Ритуал на сегодня</strong><br>
            Возьмите лист бумаги и разделите его на две колонки: «Что я хочу узнать» и «Что хочет узнать ребёнок». Выпишите по три пункта. Найдите одну тему, которая пересекается. Изучите её вместе. Без оценок, без экзаменов — просто из любопытства.</p>
            
            <p>✨ <strong>Что запомнить навсегда</strong><br>
            «Интерес не приходит по команде. Он приходит через радость, игру и уважение к тому, что человеку уже нравится. Если вы хотите, чтобы ребёнок полюбил учиться, перестаньте учить его учиться. Просто будьте рядом, когда он открывает что-то своё».</p>
        `;
    }
    else {
        // Универсальный шаблон для остальных ячеек (Логика, Труд, Удача, Долг, Память, Семья, Привычки, Самооценка, Быт, Талант, Темперамент, Дух)
        fullText = `
            <p>🌿 <strong>Почему эта зона роста так важна именно сейчас</strong><br>
            Дорогие родители, сфера «${name}» — это не просто набор цифр. Это живая область, где вы можете стать ближе или, наоборот, отдалиться. Сейчас, когда разница между вами заметна, у вас есть уникальный шанс: либо передать ребёнку свой опыт, либо научиться у него чему-то новому. ${isParentStronger ? 'Вы сильнее в этом качестве' : 'Ваш ребёнок сильнее в этом качестве'}. И это не проблема — это ресурс. Вопрос только в том, как вы им распорядитесь.</p>
            
            <p>🎭 <strong>Как это проявляется в жизни</strong><br>
            ${isParentStronger ? 
                'Вы замечаете, что ребёнок часто делает не так, как вы. Вы просите одно — он делает другое. Вы думаете: «Он меня не слышит». А он просто не может уловить ваш способ мышления. Вы злитесь, он обижается. И каждый день вы тратите энергию на борьбу, а не на созидание.' : 
                'Вы видите, как ребёнок легко справляется с тем, что вам даётся с трудом. Вы восхищаетесь, но иногда завидуете. Вы боитесь, что он «вырастет и уйдёт», а вы останетесь один. На самом деле его сила — это ваш шанс. Он может научить вас, если вы позволите.'
            }</p>
            
            <p>⚠️ <strong>Главная ошибка, которую вы совершаете</strong><br>
            ${isParentStronger ? 
                'Вы пытаетесь переделать ребёнка под себя. «Делай как я», «Смотри, как надо». Вы не оставляете ему пространства для его собственного способа. Вторая ошибка — вы не замечаете его маленьких успехов. Он сделал что-то по-своему — и это получилось? Похвалите. Иначе он перестанет стараться.' : 
                'Вы боитесь его силы и начинаете его одёргивать. «Не умничай», «Ты ещё мал». Вы лишаете его возможности расти, а себя — учиться. Вторая ошибка — вы не берёте с него пример. Вместо того чтобы спросить: «А как у тебя получается?», вы обесцениваете: «Просто повезло». Упущенный шанс.'
            }</p>
            
            <p>💡 <strong>Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> ${isParentStronger ? 
                'Дайте ребёнку возможность проявить себя в этой сфере. Попросите его сделать что-то по-своему. Не критикуйте, даже если результат не идеален. Скажите: «Ты старался, молодец. В следующий раз будет ещё лучше».' : 
                'Попросите ребёнка научить вас чему-то в этой сфере. Будьте учеником, слушайте внимательно. Вы удивитесь, как много он знает.'
            }<br>
            🔹 <strong>На этой неделе:</strong> ${isParentStronger ? 
                'Выберите одно дело, где вы обычно берёте инициативу на себя, и передайте её ребёнку. Наблюдайте, не вмешивайтесь. Вы увидите, как растёт его уверенность.' : 
                'Замечайте, в каких ситуациях ребёнок проявляет своё сильное качество, и записывайте. В конце недели скажите ему: «Ты меня вдохновляешь. Я учусь у тебя». Это укрепит его самооценку.'
            }<br>
            🔹 <strong>В ближайший месяц:</strong> ${isParentStronger ? 
                'Вместе поставьте цель, связанную с развитием этого качества. Например, если речь о логике — решать вместе головоломки. Если о труде — делать поделки. Двигайтесь маленькими шагами, празднуйте каждое достижение.' : 
                'Вместе поставьте цель, где вы будете учиться у ребёнка. Например, если он силён в технологиях — пусть научит вас пользоваться новой программой. Если в творчестве — сделайте совместный проект. Вы станете командой.'
            }</p>
            
            <p>📖 <strong>История из практики</strong><br>
            ${isParentStronger ? 
                'Мама жаловалась, что 10-летний сын «ничего не умеет» в сфере ${name}. Мы предложили маме не делать за него, а давать маленькие задания. Через месяц сын сам собрал стеллаж — мама плакала от гордости.' : 
                'Папа говорил, что 12-летняя дочь «слишком умная» и с ней невозможно спорить в сфере ${name}. Мы предложили папе не спорить, а учиться. Дочь научила его пользоваться новым приложением. Папа сказал: «Я теперь знаю, кто в доме главный эксперт». Они посмеялись и стали ближе.'
            }</p>
            
            <p>🕯️ <strong>Ритуал на сегодня</strong><br>
            Сядьте напротив друг друга. Возьмите по листу бумаги. Напишите: «Одно, чему я могу научиться у тебя в сфере ${name}». Прочитайте друг другу. Обнимитесь.</p>
            
            <p>🌟 <strong>Что запомнить навсегда</strong><br>
            «Сила не в том, чтобы быть одинаковыми. Сила в том, чтобы дополнять друг друга. Если вы сильнее — будьте наставником. Если слабее — будьте учеником. В любом случае вы — команда. А команда побеждает, когда каждый играет свою партию».</p>
        `;
    }
    
    return `<div style="margin-bottom:20px;padding:15px;background:rgba(33,150,243,0.1);border-radius:10px;border-left:4px solid #2196f3;">
        <strong style="font-size:1.1rem;color:#2196f3;">🔵 ${name}:</strong> <strong>${pv} / ${cv}</strong>
        <div style="margin:10px 0 0;">${fullText}</div>
    </div>`;
}

// Родительские ловушки (объёмные тексты)
function getParentTraps(parentMatrix, childMatrix, parentRole = 'mother') {
    const p = parentMatrix.c;
    const c = childMatrix.c;
    const traps = [];
    const role = parentRole === 'mother' ? 'мама' : (parentRole === 'father' ? 'папа' : 'родитель');
    const child = 'ребёнок';

    // --------------------------------------------------------------
    // ЛОВУШКА 1: «Делай как я» (сильный характер родителя – слабый ребёнок)
    // --------------------------------------------------------------
    if (p[1] >= 5 && c[1] <= 1) {
        traps.push({
            title: "⚠️ Ловушка «Делай как я»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему эта ловушка возникает</strong><br>
                    Дорогие родители, вы обладаете сильным, волевым характером (${p[1]} единиц). Вы привыкли быстро принимать решения, действовать напролом и не терпите неопределённости. А ваш ребёнок — мягкий, неконфликтный (${c[1]} единиц). Ему нужно время, чтобы обдумать даже простой выбор. Вы говорите: «Что тут думать?», «Бери и делай», «Я в твоём возрасте уже…». Искренне не понимая, почему он «тормозит». Эта ловушка возникает из лучших побуждений — вы хотите научить его быть решительным. Но вместо этого вы его парализуете.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы заходите в комнату, видите разбросанные игрушки и командуете: «Немедленно убери!». Ребёнок замирает, смотрит в пол и не двигается. Вы повышаете голос — он начинает плакать или уходит в себя. Вечером вы чувствуете себя плохим родителем, а он засыпает с обидой. На следующий день всё повторяется. Или: вы просите его выбрать кружок. Он неделю мучается, не может определиться. Вы теряете терпение: «Ну что тут сложного? Давай быстрее!». Он выбирает то, что вы сказали, но потом ходит без желания и бросает. Вы злитесь на него за «неблагодарность», а он не понимает, чем провинился.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы думаете: «Если я перестану давить, он совсем сядет на шею». Или: «Если я уступлю, он меня не уважает». Это ловушка. Давление не рождает волю — оно рождает либо бунт, либо апатию. А уступчивость без правил — это не уважение, а потеря ориентиров. Правда в том, что волевой стержень не передаётся через приказы. Он формируется через безопасные выборы и поддержку. Ваша сила воли не заразительна — она просто пугает. Ребёнок не становится смелее, когда вы кричите. Он становится только тревожнее.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Дайте ребёнку выбор в трёх мелочах: «Ты будешь пить чай из красной или синей кружки?», «Какую футболку наденем — зелёную или серую?», «Мы сначала помоем посуду или вытрем пыль?». Выбор из двух вариантов — идеальный тренажёр для слабой воли. И обязательно скажите: «Ты сам решил — это здорово!»<br>
                    🔹 <strong>На этой неделе:</strong> Создайте «доску выбора» — на ней будут простые ежедневные решения, которые ребёнок принимает сам. Например: меню на завтрак, порядок домашних дел, последовательность сборов в школу. Ваша задача — не критиковать его выбор, даже если он не самый удачный. Иначе он поймёт: «выбор — это ловушка» и снова начнёт ждать ваших указаний.<br>
                    🔹 <strong>В ближайший месяц:</strong> Постепенно увеличивайте сложность выборов. От «какую рубашку» до «в какой кружок пойдём?». И главное — разрешите ему ошибаться. Если он выбрал слишком много кружков и устал — это его опыт, а не ваша ошибка. Не спасайте. Спросите: «Что ты понял? Как в следующий раз поступим?».</p>
                    
                    <p><strong>📖 История из практики</strong><br>
                    Пришла ко мне мама 12-летнего Кирилла. Вечные скандалы из-за уроков. «Я говорю — садись делать математику, а он начинает ныть, отвлекаться, в итоге сидит до полуночи». Мы разобрали: у мамы — сильный характер (4 единицы), у Кирилла — слабый (1 единица). Вместо приказов она стала давать выбор: «Ты будешь делать математику сейчас или после ужина?», «Ты начнёшь с лёгких задач или с трудных?». Через две недели Кирилл стал сам садиться за уроки. Не потому что полюбил математику, а потому что перестал бояться, что его «задавят». Выбор вернул ему чувство контроля.</p>
                    
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                    Сядьте напротив друг друга. Положите на стол два предмета: например, камень и перо. Скажите: «Камень — это моя твёрдость. Перо — твоя гибкость. Мы разные, и это нормально. Давай договоримся: когда я говорю "стоп" — мы оба замолкаем на минуту и просто дышим». Сделайте это прямо сейчас. Вы увидите, как напряжение уходит.</p>
                    
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Характер — это не битва, а танец. Если вы оба настаиваете на своей партии — вы топчетесь на месте. Если один ведёт, а другой подчиняется — это не танец, а прогулка. Настоящая гармония — когда вы меняетесь ролями, слушаете музыку друг друга и вместе создаёте ритм, который никто не мог предвидеть».</p>
                </div>
            `
        });
    }

    // --------------------------------------------------------------
    // ЛОВУШКА 2: «Гиперзащита» (родитель гиперответственный – ребёнок безответственный)
    // --------------------------------------------------------------
    if (p[8] >= 5 && c[8] <= 1) {
        traps.push({
            title: "⚠️ Ловушка «Гиперзащита»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему эта ловушка возникает</strong><br>
                    Дорогие родители, ваше чувство долга и ответственности зашкаливает (${p[8]} восьмёрок). Вы привыкли всё контролировать, перепроверять, доделывать. Вам кажется, что если вы не проконтролируете, всё развалится. А у ребёнка это качество почти отсутствует (${c[8]}). Он забывает обещания, не доводит дела до конца, его приходится постоянно дёргать. Вы искренне не понимаете, как можно быть таким «безответственным». Вы боитесь, что он вырастет неряхой и неудачником. И вы берёте всё на себя.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы каждый вечер проверяете, собрал ли он рюкзак. Вы звоните учителям, чтобы уточнить домашнее задание. Вы напоминаете: «Ты выключил свет?», «Положи ключи на место», «Ты поел?». Вы решаете его проблемы: договариваетесь с друзьями, мирите, ищете забытые вещи. Вы чувствуете, что тащите на себе двоих. А ребёнок привыкает: «Мама/папа всё сделают». Он перестаёт даже пытаться. В итоге вы выгораете, обижаетесь: «Я для него всё, а он не ценит!». А он искренне не понимает, чем провинился — ведь вы всегда сами хотели всё контролировать.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы путаете любовь с гиперопекой. Вам кажется, что «спасать» — это и есть забота. Но на самом деле вы лишаете ребёнка возможности учиться. Он не становится ответственным от того, что вы за него делаете. Он становится только более беспомощным. Вторая ошибка — вы не позволяете ему ошибаться. Вы боитесь его ошибок больше, чем он сам. Но именно через ошибки и формируется ответственность. Если вы будете вечно подстилать соломку, он никогда не научится падать и вставать.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Передайте ребёнку одно маленькое дело, за которое он отвечает полностью. Например, полить цветы или покормить кота. Не напоминайте. Если забудет — не делайте за него. Пусть увидит последствия (цветы завяли, кот мяукает). Это не жестокость, это урок.<br>
                    🔹 <strong>На этой неделе:</strong> Составьте список дел, за которые ребёнок отвечает сам. Начните с 2–3 пунктов: собрать рюкзак, убрать игрушки, заправить кровать. Не проверяйте каждый шаг — проверяйте результат в конце дня. Хвалите, если сделано. Не ругайте, если нет — просто спросите: «Что мы можем сделать, чтобы ты не забывал?». И пусть он сам предложит решение.<br>
                    🔹 <strong>В ближайший месяц:</strong> Постепенно добавляйте новые обязанности. И главное — перестаньте спасать. Если он забыл дневник — пусть идёт без него и получает замечание. Если не сделал уроки — пусть объясняет учителю сам. Ваша задача — быть рядом, но не делать за него. Вы удивитесь, как быстро он научится ответственности, когда поймёт, что вы больше не подстраховываете.</p>
                    
                    <p><strong>📖 История из практики</strong><br>
                    Мама 10-летнего Димы жаловалась: «Он ничего не делает без напоминаний. Я уже устала быть его будильником». Мы предложили: на неделю мама перестаёт напоминать про домашнее задание. Дима получил двойку. На родительском собрании мама не оправдывалась, а сказала: «Дима, это твоя ответственность». На следующей неделе Дима сам сел за уроки. Не потому что полюбил учёбу, а потому что понял: мама больше не будет тащить. Он научился планировать время за три недели.</p>
                    
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                    Возьмите лист бумаги. Напишите сверху: «Я отпускаю контроль над…» и перечислите 3 дела, которые вы будете делать за ребёнком, а с завтрашнего дня перестанете. Сожгите этот лист (безопасно). Скажите себе: «Я верю, что он справится».</p>
                    
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Ваша задача — не вырастить удобного ребёнка, который слушается и не доставляет хлопот. Ваша задача — вырастить самостоятельного взрослого. А для этого иногда нужно отпустить руль и позволить ему набить свои шишки».</p>
                </div>
            `
        });
    }

    // --------------------------------------------------------------
    // ЛОВУШКА 3: «Эмоциональная буря» (родитель с сильным темпераментом – ребёнок спокойный)
    // --------------------------------------------------------------
    if (parentMatrix.temp >= 5 && childMatrix.temp <= 1) {
        traps.push({
            title: "⚠️ Ловушка «Эмоциональная буря»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему эта ловушка возникает</strong><br>
                    Дорогие родители, вы — человек с очень интенсивным темпераментом (${parentMatrix.temp} баллов). Вы быстро загораетесь, громко радуетесь и бурно злитесь. Ваши эмоции — как качели: от эйфории до гнева за пять минут. А ваш ребёнок — спокоен, невозмутим (${childMatrix.temp}). Его трудно рассмешить и трудно рассердить. Вы говорите: «Ну почему ты не радуешься?», «Что ты молчишь, как рыба?», «Вырази хоть как-то свои чувства!». Вы искренне не понимаете, как можно быть таким «бесчувственным». А он не «сухой» — он просто обрабатывает эмоции внутри, а не снаружи.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы приходите с работы в плохом настроении. Ребёнок что-то уронил. Вы взрываетесь: «Вечно у тебя всё из рук валится!». Ребёнок замирает, опускает голову и молчит. Вы думаете: «Он меня игнорирует». А он просто испугался и не знает, что сказать. Или вы выиграли в лотерею — прыгаете от радости, обнимаете всех. А ребёнок просто улыбается и идёт дальше. Вы обижаетесь: «Я стараюсь разделить радость, а ему всё равно». На самом деле он рад, просто не умеет показывать это так, как вы. Он боится ваших вспышек, потому что они для него — ураган. И он закрывается, чтобы не пострадать.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы требуете от ребёнка такой же интенсивности чувств. Но это как требовать от кактуса цвести как роза. У него другая природа. Ваша эмоциональность его не «заражает» — она его пугает. Он не становится от этого ярче, он становится только тревожнее. Вторая ошибка — вы не объясняете свои чувства. Вы просто кричите, а он не понимает, что происходит. Он думает, что это из-за него, и чувствует себя виноватым. А вина — самое разрушительное чувство для ребёнка.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Учитесь паузе. Когда чувствуете, что эмоции зашкаливают, скажите: «Мне нужно 5 минут успокоиться, я потом продолжу». Выйдите в другую комнату, выпейте воды, подышите. Не кричите, не хлопайте дверью. Просто уйдите. Ребёнок поймёт: «мама/папа не злится на меня, им просто нужно отдохнуть».<br>
                    🔹 <strong>На этой неделе:</strong> Объясняйте свои чувства словами. Не «Ты меня бесишь!», а «Я злюсь, потому что устал на работе, это не из-за тебя». Ребёнок перестанет бояться и начнёт понимать, что эмоции — это не опасно. Он даже сам начнёт называть свои чувства: «Мне грустно», «Я боюсь».<br>
                    🔹 <strong>В ближайший месяц:</strong> Введите ритуал «эмоциональный дневник». Каждый вечер записывайте (или рисуйте) по три эмоции за день. У ребёнка это могут быть простые смайлики. Обсуждайте: «Почему ты был грустным?», «Что тебя разозлило?». Так вы оба научитесь лучше понимать себя и друг друга.</p>
                    
                    <p><strong>📖 История из практики</strong><br>
                    Папа 9-летнего Миши был очень вспыльчив (темперамент 6), а Миша — спокоен (темперамент 1). Папа кричал, Миша молчал. Папа думал, что сын его «игнорирует», и злился ещё больше. Мы предложили папе фразу-якорь: «Я сейчас злюсь, но это не из-за тебя. Дай мне 5 минут». Папа попробовал. Через месяц Миша сам стал говорить: «Папа, я вижу, ты устал. Давай я сделаю чай». Папа расплакался. Они впервые за долгое время обнялись без скандала.</p>
                    
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                    Сядьте напротив друг друга. Положите руки на сердце. Скажите: «Мои эмоции — это моя ответственность, не твоя. Я люблю тебя, даже когда злюсь». Повторите три раза. Потом обнимитесь.</p>
                    
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Ваша бурная эмоциональность — это ваша особенность, а не норма для всех. Ребёнок не обязан реагировать так же ярко. Его спокойствие — не холодность, а другой способ проживать чувства. Уважайте его тишину, и он научится уважать ваш шторм».</p>
                </div>
            `
        });
    }

    // --------------------------------------------------------------
    // ЛОВУШКА 4: «Интеллектуальное давление» (родитель любит учиться – ребёнок нет)
    // --------------------------------------------------------------
    if (p[3] >= 4 && c[3] <= 1) {
        traps.push({
            title: "⚠️ Ловушка «Интеллектуальное давление»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему эта ловушка возникает</strong><br>
                    Дорогие родители, вы обожаете учиться, читать, узнавать новое (${p[3]} троек). У вас всегда открыто несколько онлайн-курсов, на полке — десятки книг. А ваш ребёнок не проявляет интереса к учёбе (${c[3]}). Уроки делает через силу, читать не любит, на вопросы «что нового узнал?» отвечает «ничего». Вы говорите: «Как можно не любить читать?», «Вот я в твоём возрасте…», «Будешь учиться — станешь дворником». Вы искренне хотите его «заразить» любовью к знаниям, но получается только хуже.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы дарите ребёнку энциклопедию, а он её не открывает. Вы предлагаете сходить в музей — он капризничает. Вы включаете научпоп — он уходит в телефон. Вы думаете: «Ему ничего не интересно, он пропащий». Вы начинаете заставлять: «Сядь и читай!». Он садится, но с ненавистью. Вы проверяете — он не запомнил ни слова. Вы злитесь, он плачет. Вы чувствуете себя неудачником, он — глупым. И каждый день вы отдаляетесь друг от друга.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы пытаетесь учить его так, как учились сами. Но его мозг устроен иначе. Ему нужно учиться через практику, движение, эксперименты, а не через книги и лекции. Ваш метод «поглощения информации» для него — пытка. Вторая ошибка — вы обесцениваете его способы познания. «Компьютерные игры — ерунда», «ТикТок — убивает мозг». Но если ему интересно — это уже отправная точка. Через игры можно учить языки, через видео — историю, через мемы — литературу. Вы не даёте ему шанса полюбить учёбу, потому что навязываете свой формат.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Посмотрите вместе 10-минутное видео на YouTube на тему, которая ему нравится (игры, животные, машины). После просмотра спросите: «Что ты узнал нового? Что было самым интересным?». Не экзамен — просто разговор.<br>
                    🔹 <strong>На этой неделе:</strong> Предложите ребёнку самому найти короткое видео или статью и рассказать вам. Сделайте это игрой: «Ты сегодня — учитель, а я — ученик». Он почувствует себя экспертом, и интерес проснётся сам.<br>
                    🔹 <strong>В ближайший месяц:</strong> Создайте «копилку знаний» — коробку, куда он будет складывать интересные факты, картинки, вырезки. Раз в неделю открывайте её и вспоминайте, что узнали. Это превратит обучение в игру.</p>
                    
                    <p><strong>📖 История из практики</strong><br>
                    Дима, 10 лет, ненавидел читать. Мама в отчаянии. Оказалось, у него 0 троек (интерес), у мамы 4. Мы предложили: вместо книг — комиксы и аудиокниги. Через месяц Дима сам попросил купить ему «Гарри Поттера» — после того, как посмотрел фильм и захотел узнать больше. Не было насилия — было уважение к его темпу.</p>
                    
                    <p><strong>🎲 Ритуал на сегодня</strong><br>
                    Возьмите лист бумаги и разделите его на две колонки: «Что я хочу узнать» и «Что хочет узнать ребёнок». Выпишите по три пункта. Найдите одну тему, которая пересекается. Изучите её вместе. Без оценок, без экзаменов — просто из любопытства.</p>
                    
                    <p><strong>✨ Что запомнить навсегда</strong><br>
                    «Интерес не приходит по команде. Он приходит через радость, игру и уважение к тому, что человеку уже нравится. Если вы хотите, чтобы ребёнок полюбил учиться, перестаньте учить его учиться. Просто будьте рядом, когда он открывает что-то своё».</p>
                </div>
            `
        });
    }

    // --------------------------------------------------------------
    // ЛОВУШКА 5: «Разный темп жизни» (родитель энергичнее ребёнка)
    // --------------------------------------------------------------
    if (p[2] >= 4 && c[2] <= 1) {
        traps.push({
            title: "⚠️ Ловушка «Разный темп жизни»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему эта ловушка возникает</strong><br>
                    Дорогие родители, вы полны сил и энергии (${p[2]} двоек). Вы можете работать до ночи, успевать тысячу дел. А ваш ребёнок быстро истощается (${c[2]}). После школы он еле доползает до дивана, на кружки ходит без энтузиазма. Вы говорите: «Соберись!», «Хватит ныть», «Посмотри на других детей — они и на спорт, и на музыку успевают». Вы искренне не понимаете, как можно «просто сидеть и ничего не делать». Вы думаете, что он ленится или не старается. Но правда в другом.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы планируете насыщенный выходной: парк, кино, гости. Ребёнок уже к обеду говорит, что устал. Вы раздражаетесь: «Да ладно, потерпи!». Он идёт, но капризничает весь день. Вы злитесь, он плачет. Вечером вы чувствуете, что «отдых» вымотал всех. Или наоборот: вы хотите остаться дома, а ребёнок просится гулять. Вы говорите: «Я устал, давай завтра». Он обижается. Вы чувствуете вину. Каждый выходной превращается в битву.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы требуете от ребёнка вашего темпа. «Я же могу, значит и ты должен». Это как требовать от цыплёнка летать как орёл. Его энергия — не лень, а физиология. Вы не замечаете его сигналов усталости и заставляете его работать на износ. Это ведёт к болезням, неврозам и хронической усталости. Вторая ошибка — вы не учите его отдыхать. Вы сами не умеете останавливаться, поэтому и ему не показываете пример. В итоге вы оба выгораете.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Спросите ребёнка: «По шкале от 1 до 10, сколько у тебя сейчас энергии?». Если меньше 5 — отмените все планы, кроме самых важных. Просто побудьте рядом. Если 7–10 — предложите активность, но не требуйте.<br>
                    🔹 <strong>На этой неделе:</strong> Заведите «энергетический дневник». Вместе отмечайте, в какое время суток у вас пик сил, а когда спад. Планируйте сложные дела на пик, а отдых — на спад. Вы удивитесь, насколько меньше станет конфликтов.<br>
                    🔹 <strong>В ближайший месяц:</strong> Введите «ленивые дни» — раз в неделю вы вообще ничего не планируете. Валяетесь, смотрите кино, едите, что захочется. Это не распущенность — это профилактика выгорания. Особенно важно, если вы оба с низкой энергией.</p>
                    
                    <p><strong>📖 История из практики</strong><br>
                    У 8-летней Алисы было 0 двоек, у мамы — 4. Алиса быстро уставала в школе, а мама требовала после уроков ещё и на кружки. Девочка начала болеть каждый месяц. Мы ввели правило: после школы — час полного покоя (лёжа, без телефона, без разговоров). Через месяц Алиса перестала болеть, а мама… сама полюбила этот час тишины и обнаружила, что тоже устаёт больше, чем думала.</p>
                    
                    <p><strong>🧘 Ритуал на сегодня</strong><br>
                    Сядьте на пол, закройте глаза, положите руки на колени. 3 минуты просто дышите. Вдох — вы вдыхаете энергию. Выдох — вы отпускаете усталость. Делайте это вместе. Потом обнимитесь и скажите: «Мы разные, но мы команда».</p>
                    
                    <p><strong>💎 Что запомнить навсегда</strong><br>
                    «Энергия — это не соревнование. Если у одного бензин на 10 литров, а у другого на 50, это не значит, что первый плохой. Просто у него бак меньше. Ваша задача — не перелить из одного бака в другой, а планировать маршрут, чтобы хватило обоим».</p>
                </div>
            `
        });
    }

    // --------------------------------------------------------------
    // ЛОВУШКА 6: «Логик vs Интуит» (родитель логичнее ребёнка)
    // --------------------------------------------------------------
    if (p[5] >= 4 && c[5] <= 1) {
        traps.push({
            title: "⚠️ Ловушка «Логик vs Интуит»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему эта ловушка возникает</strong><br>
                    Дорогие родители, вы обладаете сильным логическим мышлением (${p[5]} пятёрок). Вы любите всё раскладывать по полочкам, строить планы, анализировать. А ваш ребёнок мыслит образами, чувствами, интуицией (${c[5]}). Вы говорите: «Ну как ты не понимаешь? Это же очевидно!», «Объясни свою логику», «Почему ты сделал не так, как я сказал?». Вы считаете его «непоследовательным», а он вас — «занудой». Вы искренне не понимаете, как можно не видеть «очевидных» вещей. А он искренне не понимает, о чём вы говорите.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы просите ребёнка убрать в комнате. Он убирает, но не так, как вы хотели. Вы говорите: «Я же просила сложить книги по алфавиту!», а он: «Я их красиво поставил по цветам». Вы кипите, он обижается. Или вы объясняете ему задачу по математике. Вы говорите: «Смотри, это же просто: 2+2=4». Он не понимает. Вы повторяете, повышая голос. Он плачет. Вы чувствуете себя плохим учителем, он — глупым. Вы не можете до него достучаться, он не может до вас.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы пытаетесь переделать ребёнка под свой тип мышления. Но его мозг устроен иначе. Он не станет логиком от того, что вы будете давить. Он станет только тревожнее и неувереннее. Вторая ошибка — вы не переводите свои мысли на его язык. Вы говорите на «английском», а он понимает «китайский». Вам нужен переводчик — образы, примеры, истории, аналогии. Без этого вы будете вечно разговаривать, как глухой с немым.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Объясните ребёнку что-то через образ или историю. Вместо «2+2=4» скажите: «У тебя было 2 яблока, друг дал ещё 2. Сколько стало?». Вместо «уберись» скажи: «Давай представим, что комната — это лес, а игрушки — звери, которых нужно отвести в домики». Вы увидите, как загорятся его глаза.<br>
                    🔹 <strong>На этой неделе:</strong> Попросите ребёнка объяснить вам что-то, в чём он силён (игры, мультики, хобби). Пусть он будет учителем. Вы поймёте его язык, а он почувствует себя экспертом.<br>
                    🔹 <strong>В ближайший месяц:</strong> Введите «вечер аналогий». Каждый вечер придумывайте метафору к тому, что произошло за день. Например: «Сегодняшний день был как американские горки — сначала взлёт, потом падение». Ребёнок с удовольствием подхватит, и вы начнёте говорить на одном языке.</p>
                    
                    <p><strong>📖 История из практики</strong><br>
                    Мама 9-летнего Артёма жаловалась, что он «не понимает математику». У мамы — 4 пятёрки (логика), у Артёма — 0. Мы предложили маме объяснять через конфеты: «Если у тебя 5 конфет, ты съел 2, сколько осталось?». Артём понял мгновенно. Через месяц он уже сам придумывал истории к задачам. Мама сказала: «Я думала, он безнадёжен, а он просто мыслит образами».</p>
                    
                    <p><strong>🎨 Ритуал на сегодня</strong><br>
                    Возьмите два листа бумаги и фломастеры. Нарисуйте, как вы видите одну и ту же ситуацию (например, «ссора из-за игрушки»). Покажите друг другу. Вы увидите, как по-разному можно видеть одно и то же. И это прекрасно.</p>
                    
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Логика и интуиция — не враги, а партнёры. Вы видите мир через схемы, ребёнок — через краски. Вместе вы можете создать шедевр, который ни один из вас не создал бы в одиночку. Просто научитесь уважать чужую оптику».</p>
                </div>
            `
        });
    }

    // --------------------------------------------------------------
    // ЛОВУШКА 7: «Вечный должник» (родитель гиперответственный – ребёнок безответственный) – уже есть выше, это другая? Уже есть ловушка 2.
    // Добавим ещё одну, если нужно, но лучше не дублировать. Оставим как есть.
    // --------------------------------------------------------------

    // --------------------------------------------------------------
    // Если ни одна ловушка не подошла – универсальная рекомендация
    // --------------------------------------------------------------
    if (traps.length === 0) {
        traps.push({
            title: "⚠️ Общая рекомендация: будьте внимательны к различиям",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 О чём говорит этот результат</strong><br>
                    Дорогие родители, в вашей паре нет ярко выраженных контрастов по основным качествам. Это хорошо — вы редко будете конфликтовать на почве характера, энергии или логики. Но даже в гармоничных отношениях есть подводные камни. Ловушки возникают не из-за больших различий, а из-за невнимательности к мелочам. Вы можете не замечать его усталость, потому что сами не устаёте так быстро. Вы можете ожидать от него такой же скорости понимания, как у вас. Вы можете не придавать значения его эмоциям, если сами не очень эмоциональны. И эти «незаметные» вещи постепенно создают дистанцию.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы спокойны, ребёнок тоже. Вам кажется, что он всё понимает, потому что не спорит. Но возможно, он просто боится высказывать своё мнение. Вы думаете, что раз вы похожи, то он автоматически понимает вас без слов. А он ждёт, что вы спросите. Вы редко говорите о чувствах, потому что «и так всё хорошо». Но внутри у ребёнка может копиться обида или тревога. Вы не замечаете, потому что он не показывает. А потом — неожиданный взрыв из-за пустяка. Вы удивлены, он — в отчаянии.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы думаете, что раз нет явных конфликтов, то всё в порядке. Но тишина не всегда означает гармонию. Иногда это означает, что ребёнок просто не умеет или боится говорить о своих переживаниях. Вы не задаёте вопросов, потому что вам кажется, что вы и так всё знаете. Это самая коварная ловушка — самоуспокоенность.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Спросите ребёнка: «Что тебя тревожит? Что бы ты хотел изменить в наших отношениях?». Не отмахивайтесь, даже если ответ покажется несерьёзным. Выслушайте.<br>
                    🔹 <strong>На этой неделе:</strong> Введите «семейный совет» раз в неделю. Садитесь и обсуждайте: что было хорошего, что не очень. Без обвинений, просто факты и чувства. Ребёнок научится говорить о себе, вы — слушать.<br>
                    🔹 <strong>В ближайший месяц:</strong> Начните вести «дневник благодарности» — каждый день записывайте три вещи, за которые вы благодарны ребёнку. И просите его делать то же самое. Это укрепит вашу связь и поможет замечать хорошее, а не только проблемы.</p>
                    
                    <p><strong>📖 История из практики</strong><br>
                    Мама 11-летней Алисы была уверена, что у них «идеальные отношения». Алиса — тихая, послушная, спокойная. Но в школе у неё начались истерики. Оказалось, дома она боялась говорить маме, что её обижают одноклассники. Мама не спрашивала, думала, что «и так всё видно». Алиса молчала, потому что не хотела расстраивать маму. Мы ввели правило: каждый вечер — 10 минут «секретов», где можно говорить о чём угодно, без осуждения. Через месяц Алиса рассказала о буллинге, мама помогла, истерики прекратились. Тишина оказалась не золотом, а сигналом.</p>
                    
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                    Сядьте напротив друг друга. Зажгите свечу. По очереди говорите: «Сегодня я благодарен тебе за…». Три пункта. Не смейтесь, не перебивайте. Просто слушайте. Потом задуйте свечу и обнимитесь.</p>
                    
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Гармония не в отсутствии проблем, а в умении их замечать, пока они маленькие. Самые опасные ловушки — те, что вы не видите. Поэтому не ленитесь спрашивать, слушать и смотреть. Ваш ребёнок — не ваша копия, даже если кажется очень похожим. Он — отдельная вселенная. Исследуйте её».</p>
                </div>
            `
        });
    }

    return traps;
}

// Стиль обучения
function getLearningStyle(childMatrix, parentMatrix) {
    const c = childMatrix.c;
    let style = "";
    if (c[3] <= 1) style += "🔸 **Обучение через практику, а не через теорию.** Ему нужно делать руками, пробовать, ошибаться.\n";
    else if (c[3] >= 3) style += "🔸 **Высокий интерес к познанию.** Ему нравится учиться, читать, исследовать.\n";
    if (c[5] <= 1) style += "🔸 **Визуальные материалы.** Схемы, картинки, видео.\n";
    else if (c[5] >= 3) style += "🔸 **Логический склад ума.** Любит анализировать, решать задачи.\n";
    if (c[9] >= 3) style += "🔸 **Хорошая память.** Легко запоминает факты, даты.\n";
    else if (c[9] <= 1) style += "🔸 **Слабая механическая память.** Нужны повторения, ассоциации, мнемотехники.\n";
    if (c[6] >= 3) style += "🔸 **Усидчивость и трудолюбие.** Может долго заниматься одним делом.\n";
    else if (c[6] <= 1) style += "🔸 **Быстрая утомляемость от рутины.** Короткие сессии (10–15 минут) работают лучше.\n";
    if (parentMatrix.c[3] >= 4 && c[3] <= 1) {
        style += `\n⚠️ **Важно:** Вы сами любите учиться, а ребёнку это даётся сложнее. Не сравнивайте его с собой в детстве. Ищите нестандартные подходы – игры, практику, наглядные примеры.\n`;
    }
    if (style === "") style = "🔸 У ребёнка средние способности к обучению. Ему подойдут комбинированные методы: теория + практика, чтение + обсуждение.";
    return style.replace(/\n/g, '<br>');
}

// Эмоциональный язык
function getEmotionalLanguage(childMatrix, parentMatrix) {
    const c = childMatrix.c;
    let lang = "";
    if (c[2] >= 3) lang += "🔸 **Высокая чувствительность.** Ребёнок впитывает эмоции окружающих как губка.\n";
    else if (c[2] <= 1) lang += "🔸 **Низкая энергия, быстрая утомляемость.** Он может казаться апатичным, но это не лень.\n";
    if (c[1] <= 1) lang += "🔸 **Мягкий, легко подавляемый характер.** Ему нужна поддержка, чтобы научиться отстаивать себя.\n";
    else if (c[1] >= 4) lang += "🔸 **Сильная воля.** Он упрям, может спорить. Важно не подавлять, а направлять.\n";
    if (childMatrix.temp >= 4) lang += "🔸 **Интенсивные эмоции.** Переживает всё бурно. Учите выражать чувства экологично.\n";
    else if (childMatrix.temp <= 1) lang += "🔸 **Спокойный, флегматичный темперамент.** Не требуйте бурных реакций.\n";
    lang += "\n**Что ему нужно от вас:**\n🔸 Спокойное присутствие, а не немедленные решения.\n🔸 Тихое пространство для восстановления.\n🔸 Признание его чувств: «Я вижу, что тебе грустно».\n🔸 Объятия и тактильный контакт.\n";
    if (parentMatrix.c[2] <= 1) {
        lang += `\n⚠️ **Важно:** У вас самих невысокий запас энергии, поэтому вам может быть сложно понять его усталость. Не обесценивайте.\n`;
    }
    if (parentMatrix.temp >= 4 && childMatrix.temp <= 1) {
        lang += `\n⚠️ **Важно:** Вы очень эмоциональны, а ребёнок – спокоен. Ваши бурные реакции могут его пугать. Учитесь выражать чувства мягче.\n`;
    }
    return lang.replace(/\n/g, '<br>');
}

// Возрастные рекомендации
function getAgeRecommendations(period, parentMatrix, childMatrix, parentRole = 'mother') {
    const p = parentMatrix.c;
    const c = childMatrix.c;
    const role = parentRole === 'mother' ? 'мама' : (parentRole === 'father' ? 'папа' : 'родитель');
    const child = 'ребёнок';
    
    // ========== 1. БАЗОВАЯ ПРИВЯЗАННОСТЬ (0–3 года) ==========
    if (period.code === 'attachment') {
        return `
            <div style="font-size:1rem; line-height:1.7;">
                <p><strong>📅 Возраст 0–3 года: «Базовое доверие к миру»</strong><br>
                Дорогие родители, этот возраст — фундамент всей дальнейшей жизни. Сейчас решается главный вопрос: «Мир безопасен или опасен?». И ваш ребёнок ищет ответ не в книгах и лекциях, а в ваших глазах, в вашем голосе, в ваших руках. В этом возрасте он не «манипулирует», когда плачет. Он не «капризничает», когда просится на ручки. Он просто проверяет: есть ли кто-то, кто придёт, когда страшно? Кто обнимет, когда грустно? Кто будет рядом, когда мир кажется слишком большим?</p>
                
                <p><strong>🎭 Как это проявляется в жизни</strong><br>
                Вы слышите плач из детской. Вы устали, у вас куча дел, но вы идёте. Берёте на руки, укачиваете. Ребёнок успокаивается, засыпает. Вы кладёте его, через 20 минут – снова плач. Вы снова идёте. И так 10 раз за ночь. Вы на грани. Вам кажется, что он «специально». А он просто учится доверять. Каждый раз, когда вы приходите, он записывает в своей детской «базе данных»: «Когда я зову – приходят. Мир безопасен».</p>
                
                <p><strong>⚠️ Главная ошибка</strong><br>
                Вы боитесь «приучить к рукам». Думаете: «Если буду носить, никогда не слезет». Это миф. Ребёнок, который получил достаточно телесного контакта в раннем возрасте, становится более самостоятельным позже. Потому что у него сформирована базовая безопасность. Он знает, что мама/папа рядом, и может исследовать мир без паники. Вторая ошибка – вы игнорируете его сигналы. «Пусть покричит, ничего страшного». Но для него это страшно. Крик – его единственный язык. Игнорируя его, вы учите его: «Мои потребности не важны».</p>
                
                <p><strong>💡 Что делать: пошагово</strong><br>
                🔹 <strong>Сегодня:</strong> Устройте «день без отвлечений». Выключите телефон, забудьте про дела. Просто будьте с ребёнком. Носите, обнимайте, говорите с ним. Даже если он спит – будьте рядом.<br>
                🔹 <strong>На этой неделе:</strong> Введите ритуал «кожа к коже» – 15–20 минут в день, когда вы сидите без одежды (или в лёгкой одежде), прижав ребёнка к груди. Это снижает стресс и у него, и у вас.<br>
                🔹 <strong>В ближайший месяц:</strong> Создайте «предсказуемую среду». Режим кормления, сна, прогулок – даже если вам кажется, что он не понимает, он понимает. Предсказуемость снижает тревогу.</p>
                
                <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>📖 История из практики</strong><br>
                    Ко мне пришла мама с 8-месячным малышом. Он постоянно плакал, плохо спал. Мама была на грани. Мы предложили: не бояться носить на руках, ввести слинг, спать рядом. Через две недели малыш стал спокойнее, а мама… поняла, что он не «тиран», а просто нуждался в ней. Через год она сказала: «Сейчас он сам отползает играть, но всегда знает, что я рядом. Спасибо, что разрешили мне его «не испортить»».</p>
                </div>
                
                <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                    Перед сном зажгите свечу. Положите руку на животик ребёнка. Шепчите: «Ты в безопасности. Я рядом. Я люблю тебя». Делайте это, пока не почувствуете, что он расслабился. Потом задуйте свечу.</p>
                </div>
                
                <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Доверие к миру не воспитывается строгостью. Оно выстраивается через тысячи возвращений, когда ребёнок плачет. Каждый раз, когда вы приходите, вы говорите ему: «Ты важен. Ты в безопасности». Это фундамент, на котором он построит всю свою жизнь».</p>
                </div>
            </div>
        `;
    }
    
    // ========== 2. СОЦИАЛИЗАЦИЯ (4–6 лет) ==========
    if (period.code === 'social') {
        return `
            <div style="font-size:1rem; line-height:1.7;">
                <p><strong>📅 Возраст 4–6 лет: «Я сам и мы вместе»</strong><br>
                Дорогие родители, этот возраст — время великого противоречия. С одной стороны, ребёнок кричит: «Я сам!». С другой – он ещё не умеет договариваться, делиться, ждать. Он учится быть в коллективе, но его эгоцентризм зашкаливает. Ваша задача – не сломать его «я», а научить жить с другими. Это как учить ёжика не колоться – сложно, но возможно.</p>
                
                <p><strong>🎭 Как это проявляется в жизни</strong><br>
                Вы идёте в гости. Ребёнок не даёт свои игрушки другим, кричит, толкается. Вы краснеете от стыда. Вы говорите: «Нужно делиться!». Он ещё сильнее сжимает игрушку. Вы чувствуете, что он «неблагодарный», «жадный». А он просто не понимает: почему я должен отдавать то, что мне дорого? Ему 4 года, его мозг ещё не способен на эмпатию в полной мере. Он учится.</p>
                
                <p><strong>⚠️ Главная ошибка</strong><br>
                Вы заставляете делиться силой. «Отдай сейчас же!». Этим вы не учите щедрости, вы учите страху: «мои границы не важны». Ребёнок не становится добрее, он становится тревожнее. Вторая ошибка – вы наказываете его за драки, не разбираясь. «Не дерись!». А он, может быть, защищал себя. Важно сначала понять, что произошло, потом учить альтернативам.</p>
                
                <p><strong>💡 Что делать: пошагово</strong><br>
                🔹 <strong>Сегодня:</strong> Прежде чем идти в гости, договоритесь: «Мы берём с собой игрушки, которыми ты готов поделиться. А самые любимые оставим дома». Это уважает его право на собственность.<br>
                🔹 <strong>На этой неделе:</strong> Играйте в ролевые игры, где нужно договариваться. «Давай по очереди катать машинку». Используйте таймер: «Ты катаешь 2 минуты, потом – друг». Это превращает конфликт в игру.<br>
                🔹 <strong>В ближайший месяц:</strong> Создайте «доску достижений»: наклейки за то, что поделился, помирился, сказал «спасибо». Не за оценки, а за социальные навыки.</p>
                
                <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>📖 История из практики</strong><br>
                    Мама 5-летнего Миши жаловалась: «Он жадный, никто с ним не дружит». Мы предложили: перед прогулкой Миша выбирает 3 игрушки, которыми готов делиться. Остальные остаются дома. Через месяц Миша сам предлагал друзьям свои игрушки. Не потому что стал «менее жадным», а потому что понял: делиться – это безопасно, его любимые вещи никто не тронет.</p>
                </div>
                
                <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                        Сядьте в круг. Возьмите мяч. Передавайте его друг другу со словами: «Я даю тебе…». Называйте то, чем готовы поделиться (вниманием, временем, игрушкой). Ребёнок увидит, что делиться – это не терять, а получать радость.</p>
                </div>
                
                <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Щедрость не воспитывается приказами. Она вырастает из чувства безопасности. Если ребёнок знает, что его границы уважают, он легче открывается другим. Сначала защити его право на «моё», и тогда он научится говорить «наше»».</p>
                </div>
            </div>
        `;
    }
    
    // ========== 3. ОБУЧЕНИЕ (7–12 лет) — самый подробный блок ==========
    if (period.code === 'learning') {
        // Персонализация под конкретные показатели
        let energyAdvice = '';
        if (p[2] >= 4 && c[2] <= 1) {
            energyAdvice = `<p><strong>⚡ Важный нюанс с энергией:</strong> Вы полны сил, а ребёнок быстро устаёт. После школы ему нужен час полного покоя. Не сажайте его сразу за уроки. Дайте отдохнуть, перекусить, побыть в тишине. Иначе он будет учиться через «не могу», и это отобьёт желание надолго.</p>`;
        } else if (p[2] <= 1 && c[2] >= 4) {
            energyAdvice = `<p><strong>⚡ Важный нюанс с энергией:</strong> Ребёнок полон сил, а вы быстро выдыхаетесь. Не пытайтесь «догнать» его темп. Лучше используйте его энергию для активного обучения: пусть учит стихи в движении, решает задачи на ходу. А для себя выделите время на восстановление.</p>`;
        }
        
        let interestAdvice = '';
        if (p[3] >= 4 && c[3] <= 1) {
            interestAdvice = `<p><strong>📚 Важный нюанс с интересом к учёбе:</strong> Вы любите учиться, а ребёнку это даётся сложнее. Не сравнивайте его с собой. Ищите его «крючок» – через игры, видео, практику. И никогда не говорите: «Я в твоём возрасте…». Это убивает мотивацию.</p>`;
        } else if (p[3] <= 1 && c[3] >= 4) {
            interestAdvice = `<p><strong>📚 Важный нюанс с интересом к учёбе:</strong> Ребёнок – прирождённый исследователь, а вы относитесь к учёбе прохладнее. Не тормозите его. Давайте книги, кружки, поддержку. И не бойтесь, что он «перегрузится» – он сам знает свой предел.</p>`;
        }
        
        let characterAdvice = '';
        if (p[1] >= 4 && c[1] <= 1) {
            characterAdvice = `<p><strong>💪 Важный нюанс с характером:</strong> Вы сильная воля, ребёнок – мягкий. Не давите на него в учёбе. Давайте выбор: «Ты будешь делать математику сейчас или после ужина?». И обязательно хвалите за каждое самостоятельное решение. Он не станет «ленивым», если вы не будете решать за него.</p>`;
        } else if (p[1] <= 1 && c[1] >= 4) {
            characterAdvice = `<p><strong>💪 Важный нюанс с характером:</strong> Ребёнок упрям и своеволен, а вы мягче. Не пытайтесь сломать его волю – направляйте. Объясняйте, почему важно учиться, а не заставляйте. И признавайте его успехи, даже маленькие.</p>`;
        }
        
        return `
            <div style="font-size:1rem; line-height:1.7;">
                <p><strong>📅 Возраст 7–12 лет: «Школа как новый мир»</strong><br>
                Дорогие родители, этот возраст – один из самых важных для формирования отношения к знаниям на всю жизнь. Сейчас ребёнок не просто учится читать и считать. Он учится учиться. Он формирует свою учебную идентичность: «я способный», «я тупой», «мне интересно», «ненавижу школу». И эти ярлыки он возьмёт с собой во взрослую жизнь. Ваша задача – не сделать из него отличника. Ваша задача – сохранить его любопытство и веру в себя.</p>
                
                <p><strong>🎭 Как это проявляется в жизни</strong><br>
                Ребёнок приносит двойку. Вы злитесь: «Почему не подготовился?», «Ты не стараешься!». Он опускает голову. На следующий день – снова двойка. Вы идёте к учителю, нанимаете репетитора, заставляете сидеть за уроками до ночи. А он всё больше ненавидит школу. И себя. И вас. Знакомая картина? А ведь причина часто не в лени. Может, ему трудно запоминать? Может, он кинестетик, и ему нужно учиться через движение? Может, он просто устаёт?</p>
                
                <p><strong>⚠️ Главная ошибка</strong><br>
                Вы оцениваете ребёнка через оценки. «Ты – двоечник», «Ты – троечник». Но оценка – это не он. Это всего лишь отражение того, как он усвоил конкретную тему в конкретный момент. Когда вы вешаете ярлык, он начинает в него верить. «Я глупый, зачем стараться?». Вторая ошибка – вы наказываете за ошибки. «Не выучил – гулять не пойдёшь». Но ошибка – это не преступление. Это информация: здесь пробел, нужно подтянуть. Наказание за ошибку учит скрывать, врать, бояться.</p>
                
                <p><strong>💡 Что делать: пошаговая стратегия на 7–12 лет</strong><br>
                🔹 <strong>Сегодня:</strong> Спросите ребёнка: «Что тебе сегодня было трудно? Что легко?». Не оценивайте, просто слушайте. Завтра спросите то же самое. Сделайте это ритуалом. Вы увидите, где реальные проблемы, а где просто лень.<br>
                🔹 <strong>На этой неделе:</strong> Вместе составьте расписание. Учитывайте его энергетические пики. Если он «сова» – не заставляйте делать уроки с утра. Если «жаворонок» – не мучайте вечером. И обязательно включите время на отдых.<br>
                🔹 <strong>В ближайший месяц:</strong> Найдите один предмет, который ему нравится. И углубитесь. Купите книгу, найдите видео, сходите в музей. Пусть он почувствует, что учёба – это не только «надо», но и «интересно». А потом переносите это чувство на другие предметы.</p>
                
                ${energyAdvice}
                ${interestAdvice}
                ${characterAdvice}
                
                <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>📖 История из практики</strong><br>
                    Мама 9-летнего Димы жаловалась: «Он не хочет учиться, одни двойки». Проверили – у Димы 0 троек (интерес к познанию), у мамы 4. Мы предложили: забыть про оценки на месяц. Каждый день – 20 минут занятий тем, что интересно Диме (конструкторы, комиксы). Через месяц он сам попросил купить ему книгу по истории. Мама сказала: «Я перестала давить, и он расцвёл». Не потому что он «исправился», а потому что учёба перестала быть наказанием.</p>
                </div>
                
                <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                    Возьмите лист бумаги. Напишите: «Мой ребёнок – это не его оценки. Я люблю его не за пятёрки». Повесьте на видное место. Каждый раз, когда захотите поругать за двойку, посмотрите на эту фразу.</p>
                </div>
                
                <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Учёба – это марафон, а не спринт. Ошибки – не провалы, а подсказки. Ваша задача – не заставлять, а поддерживать. Если ребёнок будет знать, что вы на его стороне, он научится всему, даже если не сразу. И запомнит не формулы, а вашу веру в него».</p>
                </div>
            </div>
        `;
    }
    
    // ========== 4. СЕПАРАЦИЯ (13–17 лет) ==========
    if (period.code === 'separation') {
        return `
            <div style="font-size:1rem; line-height:1.7;">
                <p><strong>📅 Возраст 13–17 лет: «Я не ребёнок, но ещё не взрослый»</strong><br>
                Дорогие родители, добро пожаловать в подростковый возраст. Ваш ребёнок сейчас переживает второе рождение. Он отчаянно хочет быть взрослым, но внутри ещё ребёнок. Он бунтует, чтобы отделиться, но панически боится, что вы его бросите. Он проверяет границы, потому что они ему нужны. Ваша задача – выдержать этот шторм, не разбившись о скалы. И помните: если подросток не бунтует – это тревожный знак. Значит, он либо сломлен, либо не доверяет.</p>
                
                <p><strong>🎭 Как это проявляется в жизни</strong><br>
                Вы говорите: «Надень шапку, холодно». Он: «Отстань!». Вы: «Сделай уроки». Он: «Не хочу!». Каждый день – битва. Вы чувствуете, что теряете контроль. Он чувствует, что его не слышат. Вы кричите, он хлопает дверью. Вы плачете, он уходит в наушники. Это нормально. Так проходит сепарация. Но можно сделать её менее болезненной.</p>
                
                <p><strong>⚠️ Главная ошибка</strong><br>
                Вы пытаетесь подавить бунт силой. «Будешь делать, что я сказал, пока живёшь под моей крышей». Это не работает. Он найдёт способ бунтовать ещё сильнее – уйдёт в плохую компанию, начнёт врать, убегать. Вторая ошибка – вы отстраняетесь. «Ну и делай что хочешь». Он чувствует себя брошенным и теряет опору. Нужна золотая середина: твёрдые границы в важном, свобода – в остальном.</p>
                
                <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                🔹 <strong>Сегодня:</strong> Скажите ему: «Я знаю, тебе нужно пространство. Я уважаю это. Но давай договоримся о правилах, которые важны для твоей безопасности. Остальное – ты решаешь сам».<br>
                🔹 <strong>На этой неделе:</strong> Введите «семейный совет». Раз в неделю садитесь и обсуждаете правила. Он имеет право голоса. Вы вместе ищете компромисс. Это учит его ответственности, а вас – отпускать.<br>
                🔹 <strong>В ближайший месяц:</strong> Дайте ему карманные деньги с правом самостоятельной траты. Без отчёта. Пусть ошибается. Ошибка – лучший учитель.</p>
                
                <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>📖 История из практики</strong><br>
                    Папа 14-летнего Димы жаловался: «Он меня не слышит, делает всё назло». Мы предложили: перестать контролировать мелочи (какую музыку слушать, как одеваться). И оставить контроль только за действительно важным (безопасность, учёба). Через месяц Дима сам стал подходить к папе за советом. Не потому что «исправился», а потому что перестал бороться за свободу – он её получил.</p>
                </div>
                
                <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                    Напишите на листе две колонки: «Что я контролирую» и «Что я отпускаю». Перечитайте. Отпустите то, что не смертельно. Повесьте на видное место. Это поможет вам не срываться на пустяках.</p>
                </div>
                
                <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Подростковый бунт – не война против вас. Это война за свою территорию. Не сражайтесь с ним – станьте его тылом. Пусть знает: вы здесь, вы любите, вы не бросите. Даже когда он хлопает дверью, даже когда говорит «ненавижу». Он всё равно вернётся. И ваша задача – быть открытым для этого возвращения».</p>
                </div>
            </div>
        `;
    }
    
    // ========== 5. ОТДЕЛЕНИЕ (18–25 лет) ==========
    if (period.code === 'leaving') {
        return `
            <div style="font-size:1rem; line-height:1.7;">
                <p><strong>📅 Возраст 18–25 лет: «Крылья или корни?»</strong><br>
                Дорогие родители, ваш ребёнок уже взрослый. Он может голосовать, жениться, брать кредиты. Но внутри он всё ещё нуждается в вашей поддержке. Сейчас решается главный вопрос: «Я самостоятельный или всё ещё ребёнок?». И ваша задача – не мешать ему отделиться, но и не бросать. Это как учить ходить: вы уже не держите за руку, но стоите рядом, на случай если упадёт.</p>
                
                <p><strong>🎭 Как это проявляется в жизни</strong><br>
                Он уехал учиться в другой город. Вы звоните каждый день, спрашиваете, поел ли, выспался ли. Он раздражается, говорит, что вы его контролируете. Вы обижаетесь. Или наоборот: он не звонит, не отвечает на сообщения. Вы сходите с ума от тревоги. Вы хотите приехать, проверить. Он злится. Вы чувствуете, что теряете связь.</p>
                
                <p><strong>⚠️ Главная ошибка</strong><br>
                Вы продолжаете решать за него. «Я оплачу, я выберу, я решу». Он не учится быть взрослым. Или вы полностью отстраняетесь. «Ты взрослый, разбирайся сам». Он чувствует себя брошенным. Нужна золотая середина: поддержка, но не опека; совет, но не решение.</p>
                
                <p><strong>💡 Что делать: пошагово</strong><br>
                🔹 <strong>Сегодня:</strong> Спросите: «В чём ты хочешь моей поддержки? А в чём – нет?». Уважайте его ответ. Даже если вам кажется, что он ошибается.<br>
                🔹 <strong>На этой неделе:</strong> Перестаньте давать непрошеные советы. Если он просит – помогите. Если нет – молчите. Это трудно, но необходимо.<br>
                🔹 <strong>В ближайший месяц:</strong> Договоритесь о частоте звонков. Не каждый день, а, например, раз в три дня. И не нарушайте. Он будет знать, что вы рядом, но не лезете в душу.</p>
                
                <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>📖 История из практики</strong><br>
                    Мама 19-летней Ани звонила по 5 раз на дню. Аня перестала отвечать. Мама приехала без предупреждения – застала беспорядок и начала убираться. Аня взорвалась. Мы предложили: мама звонит раз в три дня, не приезжает без приглашения. Через месяц Аня сама позвонила маме за советом. Мама сказала: «Я научилась доверять ей, и она научилась доверять мне».</p>
                </div>
                
                <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                    <p><strong>🕯️ Ритуал на сегодня</strong><br>
                        Напишите письмо взрослому ребёнку. Без претензий. Просто: «Я люблю тебя. Я верю в тебя. Я рядом, если нужна помощь». Не отправляйте. Просто сожгите. Этот ритуал поможет вам отпустить.</p>
                </div>
                
                <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                    <p><strong>🌟 Что запомнить навсегда</strong><br>
                    «Отпустить – не значит бросить. Это значит дать возможность лететь. Вы построили гнездо, научили летать. Теперь ваша очередь – смотреть в небо и гордиться. А когда ветер устанет, он всегда вернётся отдохнуть».</p>
                </div>
            </div>
        `;
    }
    
    // ========== 6. ВЗРОСЛЫЕ ДЕТИ (26+) ==========
    return `
        <div style="font-size:1rem; line-height:1.7;">
            <p><strong>📅 Возраст 26+: «Друзья, а не родители и дети»</strong><br>
            Дорогие родители, ваш ребёнок уже давно взрослый. У него своя семья, работа, свои трудности и радости. Ваша роль сейчас – не наставник, не контролёр, а друг. Тот, с кем можно посоветоваться, но кто не лезет без спроса. Тот, кто принимает выбор, даже если не согласен. Это самый трудный этап – научиться быть рядом, но не вмешиваться.</p>
            
            <p><strong>🎭 Как это проявляется в жизни</strong><br>
            Он принимает решение, которое вам не нравится. Вы говорите: «Я же предупреждал». Он обижается. Вы чувствуете, что вас не ценят. Он чувствует, что его не уважают. Вы можете потерять связь, если не перестроитесь.</p>
            
            <p><strong>⚠️ Главная ошибка</strong><br>
            Вы продолжаете его опекать. «Ты неправильно воспитываешь детей», «Ты зря купил эту машину». Вы забываете, что он – не продолжение вас, а отдельная личность. Вторая ошибка – вы отстраняетесь. «Раз ты такой умный, сам и справляйся». Он чувствует себя одиноким.</p>
            
            <p><strong>💡 Что делать: пошагово</strong><br>
            🔹 <strong>Сегодня:</strong> Скажите ему: «Я горжусь тобой. Ты справляешься. Я рядом, если нужна помощь». Без «но».<br>
            🔹 <strong>На этой неделе:</strong> Спросите: «Как ты хочешь, чтобы я участвовал в твоей жизни?». Уважайте ответ.<br>
            🔹 <strong>В ближайший месяц:</strong> Начните строить свои планы, не связанные с ним. Ваша жизнь не должна вращаться вокруг детей. Это поможет вам отпустить и ему – не чувствовать вины.</p>
            
            <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>📖 История из практики</strong><br>
                Мама 30-летней дочери постоянно критиковала её выбор мужа. Дочь перестала общаться. Мы предложили маме три месяца не давать советов, только слушать и поддерживать. Через три месяца дочь сама пришла за советом. Сказала: «Мама, ты стала моим другом». Мама расплакалась.</p>
            </div>
            
            <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>🕯️ Ритуал на сегодня</strong><br>
                Напишите список: «Что я могу дать взрослому ребёнку» (время, поддержку, принятие) и «От чего я отказываюсь» (контроль, критику, советы без спроса). Повесьте на видное место.</p>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                <p><strong>🌟 Что запомнить навсегда</strong><br>
                «Вырастить ребёнка – это не сделать его своей копией. Это отпустить его в свободное плавание. И если вы сможете стать ему другом, а не судьёй, вы не потеряете его, а обретёте союзника. На всю жизнь».</p>
            </div>
        </div>
    `;
}

// Общий портрет
function getGeneralPortrait(parentMatrix, childMatrix, parentName, childName, parentRole = 'mother') {
    const p = parentMatrix.c;
    const c = childMatrix.c;
    const role = parentRole === 'mother' ? 'мама' : (parentRole === 'father' ? 'папа' : 'родитель');
    const safeParentName = escapeHTML(parentName || role);
    const safeChildName = escapeHTML(childName || 'ребёнок');
    const pName = safeParentName;
    const cName = safeChildName;

    // ========== 1. ХАРАКТЕР ==========
    let characterText = '';
    if (p[1] >= 4 && c[1] <= 1) {
        characterText = `Вы, ${pName}, обладаете сильным, волевым характером (${p[1]} единиц). Вы привыкли быстро принимать решения, действовать напролом и не терпите неопределённости. ${cName} же, напротив, имеет очень мягкий, неконфликтный характер (${c[1]} единиц). Ему или ей нужно время, чтобы обдумать решение, и любое давление вызывает ступор. Эта разница – главный источник как вашей силы, так и ваших конфликтов. С одной стороны, вы можете быть для ребёнка надёжной опорой и защитой. С другой – вы рискуете неосознанно подавлять его волю, требуя от него решительности, которой у него просто нет. Ваша задача – научиться замедляться рядом с ребёнком, давать ему право на свой темп и не путать его мягкость со слабостью.`;
    } 
    else if (p[1] <= 1 && c[1] >= 4) {
        characterText = `Удивительно, но именно ${cName} обладает более сильным, волевым характером (${c[1]} единиц), чем вы (${p[1]} единиц). Вы, ${pName}, скорее дипломат, склонный к компромиссам и избеганию конфликтов. А ваш ребёнок – прирождённый лидер, который знает, чего хочет, и умеет этого добиваться. Это может быть непросто – особенно когда его воля идёт вразрез с вашей. Но в этом и заключается ваш потенциал роста. Ребёнок может научить вас уверенности, умению отстаивать свои границы. А вы можете научить его эмпатии, умению слышать других и искать компромиссы. Главное – не пытаться сломать его волю, а направить её в нужное русло.`;
    }
    else if (p[1] >= 4 && c[1] >= 4) {
        characterText = `Вы оба – люди с сильными, волевыми характерами (у вас ${p[1]} единиц, у ребёнка ${c[1]}). Это значит, что в вашей семье часто будут сталкиваться две непререкаемые позиции. Вы оба привыкли быть правыми, и уступать не любите. С одной стороны, это даёт вам огромную энергию для достижения целей. С другой – постоянная борьба за власть может истощить ваши отношения. Ваша задача – не подавлять друг друга, а научиться договариваться. Разделите зоны ответственности, где каждый будет главным. И помните: сила не в том, чтобы всегда быть правым, а в том, чтобы вовремя остановиться и услышать другого.`;
    }
    else {
        characterText = `У вас обоих мягкий, неконфликтный характер (у вас ${p[1]} единиц, у ребёнка ${c[1]}). Вы редко ссоритесь, легко уступаете друг другу. Это создаёт в доме атмосферу тепла и принятия. Но есть и обратная сторона: вам обоим может быть трудно принимать решения, отстаивать свои границы, проявлять инициативу. Вы можете «плыть по течению», упуская важные возможности. Ваша задача – учиться проявлять волю вместе. Начните с малого: каждый день принимайте одно маленькое решение быстро, без долгих обсуждений. Поддерживайте друг друга, когда кто-то проявляет инициативу. И помните: мягкость – не слабость, а особая сила, которая позволяет вам быть чуткими друг к другу.`;
    }

    // ========== 2. ЭНЕРГИЯ ==========
    let energyText = '';
    if (p[2] >= 4 && c[2] <= 1) {
        energyText = `Вы, ${pName}, обладаете высоким запасом жизненной энергии (${p[2]} двоек). Вы можете работать допоздна, успевать много дел, редко чувствуете усталость. ${cName} же, напротив, быстро истощается (${c[2]} двоек). Вы можете не понимать его «вялости», раздражаться, требовать большей активности. Это серьёзная зона напряжения. Важно осознать: ребёнок не ленится, он просто устроен иначе. Его ресурс ограничен, и если вы будете давить, он может заболеть или замкнуться. Научитесь замедляться рядом с ним, планировать дела с учётом его усталости, давать время на восстановление.`;
    }
    else if (p[2] <= 1 && c[2] >= 4) {
        energyText = `Удивительно, но ${cName} обладает гораздо более высоким запасом энергии (${c[2]} двоек), чем вы (${p[2]} двоек). Он готов бегать, играть, познавать мир, а вы быстро выдыхаетесь. Вы можете чувствовать себя «плохим родителем», неспособным дать ребёнку всё, что ему нужно. Это не так. Ваша задача – не пытаться «догнать» ребёнка, а научиться распределять силы. Делегируйте активные игры другим (друзьям, папе, бабушке), а с собой создавайте спокойные, восстанавливающие ритуалы. И не стесняйтесь говорить ребёнку: «Я устал, давай отдохнём вместе». Это учит его эмпатии.`;
    }
    else if (p[2] >= 4 && c[2] >= 4) {
        energyText = `Вы оба – «энерджайзеры» (у вас ${p[2]} двоек, у ребёнка ${c[2]}). Вы можете вместе путешествовать, заниматься спортом, не замечать усталости. Это даёт вам огромные возможности для активного отдыха и совместных проектов. Но есть риск «перегрева» – вы можете не замечать, когда пора остановиться, подстёгивая друг друга к ещё большей активности. Введите обязательные «часы покоя», когда никто ничего не делает. Учитесь замечать первые признаки усталости – у себя и у ребёнка.`;
    }
    else {
        energyText = `У вас обоих средний, достаточный запас энергии (у вас ${p[2]} двоек, у ребёнка ${c[2]}). Вы способны справляться с повседневными задачами, но не рвётесь к сверхдостижениям. Это даёт вам стабильный, предсказуемый ритм жизни. Главное – не завидовать более активным семьям и не требовать от себя и ребёнка «олимпийских» рекордов. Ваш ритм – нормальный. Просто иногда устраивайте «дни приключений», чтобы встряхнуться.`;
    }

    // ========== 3. СЕМЕЙНЫЕ ЦЕННОСТИ (если есть значимая разница) ==========
    let familyText = '';
    if (parentMatrix.family >= 4 && childMatrix.family <= 1) {
        familyText = `<p><strong>🏠 Семейные ценности:</strong> Для вас, ${pName}, семья – это главная ценность (${parentMatrix.family} в строке «Семья»). Вы много общаетесь с родственниками, соблюдаете традиции, ждёте такого же отношения от ребёнка. Но ${cName} стремится к автономии, не понимает, зачем нужны «эти тётушки-дяди». Вы можете обижаться, считать ребёнка «чёрствым», а он чувствовать давление. Ваша задача – не давить чувством долга, а объяснять ценность семьи через тепло и принятие. Ищите компромисс: часть праздников проводите с роднёй, часть – только вы. И уважайте право ребёнка на личное пространство.</p>`;
    }
    else if (parentMatrix.family <= 1 && childMatrix.family >= 4) {
        familyText = `<p><strong>🏠 Семейные ценности:</strong> Для ${cName} семья очень важна (${childMatrix.family} в строке «Семья»). Он хочет знать историю рода, общаться с бабушками, соблюдать традиции. Вы же более свободны и не придаёте этому значения. Ребёнок может страдать от вашей отстранённости, чувствовать себя «ненужным». Важно не обесценивать его потребность в принадлежности. Создайте несколько простых семейных ритуалов – например, совместный ужин по воскресеньям или просмотр старых фото. Это укрепит вашу связь, не требуя от вас больших жертв.</p>`;
    }

    // ========== 4. ЦЕЛЕУСТРЕМЛЁННОСТЬ (если есть значимая разница) ==========
    let goalText = '';
    if (parentMatrix.goal >= 4 && childMatrix.goal <= 1) {
        goalText = `<p><strong>🎯 Цели и достижения:</strong> Вы, ${pName}, привыкли ставить цели и достигать их (${parentMatrix.goal} в строке «Цель»). Вы знаете, чего хотите, и идёте к этому. ${cName} же часто не знает, чего хочет, легко отвлекается, бросает начатое. Вы можете давить, требовать «результатов», но это только усилит сопротивление. Ваша задача – не навязывать свои амбиции, а помогать ребёнку найти его собственную цель. Начните с малого: планируйте вместе выходной, пусть он выберет, куда пойти. Хвалите за маленькие достижения. И помните: его путь может быть длиннее вашего, но это не значит, что он хуже.</p>`;
    }
    else if (parentMatrix.goal <= 1 && childMatrix.goal >= 4) {
        goalText = `<p><strong>🎯 Цели и достижения:</strong> Удивительно, но именно ${cName} обладает высокой целеустремлённостью (${childMatrix.goal} в строке «Цель»). Он знает, чего хочет, и упорно идёт к цели. Вы же часто сомневаетесь, откладываете, не доводите дела до конца. Ребёнок может критиковать вас за «медлительность», а вы – чувствовать себя неполноценным. Не позволяйте ему вас обесценивать, но и не завидуйте. Лучше учитесь у него – спросите, как ему удаётся не сдаваться. И поддерживайте его амбиции, даже если они кажутся вам слишком смелыми.</p>`;
    }

    // ========== 5. ОБЩИЙ ВЫВОД (связка) ==========
    let conclusion = '';
    if (p[1] >= 4 && c[1] <= 1) {
        conclusion = `${pName} и ${cName}, ваши отношения – это встреча сильной воли и мягкой души. Ваш главный вызов – не подавить мягкость ребёнка своей силой. Ваш главный дар – вы можете стать для него надёжной опорой и защитой, если научитесь делать это без давления. Помните: сила не в том, чтобы быть всегда правым, а в том, чтобы быть рядом, когда это нужно.`;
    }
    else if (p[1] <= 1 && c[1] >= 4) {
        conclusion = `${pName} и ${cName}, ваши отношения – это встреча мягкости и сильного характера. Ребёнок – прирождённый лидер, вы – дипломат. Ваш вызов – не позволить ему доминировать, но и не впадать в гиперопеку. Ваш дар – вы учите его эмпатии и уважению к другим, а он вас – решительности и умению отстаивать свои границы. Вместе вы – идеальная команда, если научитесь слышать друг друга.`;
    }
    else if (p[1] >= 4 && c[1] >= 4) {
        conclusion = `${pName} и ${cName}, вы оба – сильные, волевые люди. Ваши отношения могут быть как полем битвы, так и мощным союзом. Всё зависит от того, научитесь ли вы договариваться. Разделите зоны ответственности, не соревнуйтесь, а сотрудничайте. И помните: иногда уступить – это не слабость, а мудрость.`;
    }
    else {
        conclusion = `${pName} и ${cName}, вы оба – мягкие, неконфликтные люди. Ваши отношения полны тепла и принятия, но иногда вам не хватает решительности. Учитесь проявлять волю вместе, поддерживайте друг друга в начинаниях. И помните: ваша мягкость – это не слабость, а особая сила, которая позволяет вам быть чуткими друг к другу.`;
    }

    // ========== ФИНАЛЬНЫЙ ТЕКСТ (живая консультация) ==========
    return `
        <div style="font-size: 1.05rem; line-height: 1.7;">
            <p><strong>✨ ${pName} и ${cName} – </strong>${characterText}</p>
            <p><strong>⚡ Энергия и ритм жизни: </strong>${energyText}</p>
            ${familyText ? familyText : ''}
            ${goalText ? goalText : ''}
            <p><strong>💎 Главное, что стоит запомнить: </strong>${conclusion}</p>
            
            <div style="background: rgba(212,175,55,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p style="font-weight: bold; margin-bottom: 10px;">📖 История из практики</p>
                <p>${generateStoryExample(p, c, pName, cName)}</p>
            </div>
            
            <div style="background: rgba(168, 218, 220, 0.15); padding: 20px; border-radius: 12px; margin: 20px 0;">
                <p style="font-weight: bold; margin-bottom: 10px;">🕯️ Ритуал на сегодня</p>
                <p>${generateRitual(p, c)}</p>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.08); padding: 20px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 20px 0;">
                <p style="font-weight: bold; margin-bottom: 10px;">🌟 Что запомнить навсегда</p>
                <p>«${generateMantra(p, c)}»</p>
            </div>
            
            <p style="margin-top: 20px; font-style: italic; border-top: 1px solid rgba(212,175,55,0.3); padding-top: 15px;">
                Этот портрет – лишь первый шаг к пониманию вашей уникальной связи. Дальнейшие разделы отчёта помогут вам увидеть конкретные зоны гармонии, напряжения и роста. Используйте эти знания, чтобы сделать ваши отношения ещё более осознанными и счастливыми.
            </p>
        </div>
    `;
}

// Вспомогательная функция для генерации живой истории (в зависимости от типа различий)
function generateStoryExample(p, c, pName, cName) {
    if (p[1] >= 4 && c[1] <= 1) {
        return `Пришла ко мне мама 12-летнего Кирилла. Вечные скандалы из-за уроков. «Я говорю — садись делать математику, а он начинает ныть, отвлекаться, в итоге сидит до полуночи». Мы разобрали: у мамы — сильный характер (4 единицы), у Кирилла — слабый (1 единица). Вместо приказов она стала давать выбор: «Ты будешь делать математику сейчас или после ужина?», «Ты начнёшь с лёгких задач или с трудных?». Через две недели Кирилл стал сам садиться за уроки. Не потому что полюбил математику, а потому что перестал бояться, что его «задавят». Выбор вернул ему чувство контроля.`;
    }
    else if (p[1] <= 1 && c[1] >= 4) {
        return `Пришёл папа с 14-летним Димой. У папы — 1 единица характера, у Димы — 4. Папа жаловался: «Он со мной спорит постоянно, я чувствую себя дураком». Мы предложили папе не бороться, а учиться. Дима научил папу говорить «нет» навязчивым продавцам. Через месяц папа впервые отказался от ненужной страховки. Он сказал: «Сын, ты мой герой». Дима расцвёл, а их отношения перестали быть полем битвы.`;
    }
    else if (p[2] >= 4 && c[2] <= 1) {
        return `У 8-летней Алисы было 0 двоек, у мамы — 4. Алиса быстро уставала в школе, а мама требовала после уроков ещё и на кружки. Девочка начала болеть каждый месяц. Мы ввели правило: после школы — час полного покоя (лёжа, без телефона, без разговоров). Через месяц Алиса перестала болеть, а мама… сама полюбила этот час тишины и обнаружила, что тоже устаёт больше, чем думала.`;
    }
    else if (p[2] <= 1 && c[2] >= 4) {
        return `У 10-летнего Димы было 4 двойки, у папы — 0. Папа жаловался: «Я не могу за ним угнаться, чувствую себя стариком». Мы предложили папе не догонять, а делегировать. Дима стал ответственным за активные игры с младшей сестрой, а папа — за спокойные вечерние ритуалы. Конфликты прекратились, а папа перестал корить себя за «медлительность».`;
    }
    else if (p[3] >= 4 && c[3] <= 1) {
        return `Дима, 10 лет, ненавидел читать. Мама в отчаянии. Оказалось, у него 0 троек (интерес), у мамы 4. Мы предложили: вместо книг — комиксы и аудиокниги. Через месяц Дима сам попросил купить ему «Гарри Поттера» — после того, как посмотрел фильм и захотел узнать больше. Не было насилия — было уважение к его темпу.`;
    }
    else {
        return `Одна мама долго не могла понять, почему её 9-летний сын «не слышит» её просьб. Оказалось, у неё была высокая логика (4 пятёрки), а у сына — 0. Она объясняла всё схемами и алгоритмами, а ему нужны были образы. Когда она стала использовать метафоры и истории, сын начал понимать с полуслова. Однажды он сказал: «Мама, теперь ты говоришь на моём языке». И они оба заплакали от счастья.`;
    }
}

// Вспомогательная функция для ритуала
function generateRitual(p, c) {
    if (p[1] >= 4 && c[1] <= 1) {
        return `Сядьте напротив друг друга. Положите на стол два предмета: например, камень и перо. Скажите: «Камень — это моя твёрдость. Перо — твоя гибкость. Мы разные, и это нормально. Давай договоримся: когда я говорю "стоп" — мы оба замолкаем на минуту и просто дышим». Сделайте это прямо сейчас. Вы увидите, как напряжение уходит.`;
    }
    else if (p[2] >= 4 && c[2] <= 1) {
        return `Сядьте на пол, закройте глаза, положите руки на колени. 3 минуты просто дышите. Вдох — вы вдыхаете энергию. Выдох — вы отпускаете усталость. Делайте это вместе. Потом обнимитесь и скажите: «Мы разные, но мы команда».`;
    }
    else if (p[3] >= 4 && c[3] <= 1) {
        return `Возьмите лист бумаги и разделите его на две колонки: «Что я хочу узнать» и «Что хочет узнать ребёнок». Выпишите по три пункта. Найдите одну тему, которая пересекается. Изучите её вместе. Без оценок, без экзаменов — просто из любопытства.`;
    }
    else {
        return `Зажгите свечу. Сядьте напротив друг друга. По очереди говорите: «Сегодня я благодарен тебе за…». Три пункта. Не смейтесь, не перебивайте. Просто слушайте. Потом задуйте свечу и обнимитесь.`;
    }
}

// Вспомогательная функция для мантры
function generateMantra(p, c) {
    if (p[1] >= 4 && c[1] <= 1) {
        return `«Сила не в том, чтобы всегда быть правым, а в том, чтобы быть рядом, когда это нужно. Твоя мягкость — не слабость, а мост к моему сердцу. Я учусь у тебя терпению, ты у меня — уверенности. Вместе мы — команда»`;
    }
    else if (p[1] <= 1 && c[1] >= 4) {
        return `«Я учу тебя эмпатии, ты меня — смелости. Мы не конкуренты, а союзники. Твоя сила — не угроза, а дар. И я принимаю его с благодарностью»`;
    }
    else if (p[2] >= 4 && c[2] <= 1) {
        return `«Энергия — не соревнование. У каждого свой бак. Моя задача — не перелить твой в мой, а спланировать маршрут, чтобы хватило обоим. Я уважаю твою усталость, ты — мою активность»`;
    }
    else {
        return `«Мы не обязаны быть одинаковыми, чтобы любить друг друга. Наши различия — не поле для битвы, а территория для открытий. Я выбираю видеть в тебе не проблему, а возможность. И каждый день я учусь быть лучше рядом с тобой»`;
    }
}

// Рендер мини-матрицы
 const getS = (n) => {
        let s = "";
        for(let k = 0; k < matrix.c[n]; k++) s += n;
        return s || "—";
    };
    // Функция получения цвета для ячейки
    function renderMatrixCard(matrix, name, title) {
    const getS = (n) => {
        let s = "";
        for(let k = 0; k < matrix.c[n]; k++) s += n;
        return s || "—";
    };
    return `
    <div class="matrix-card" style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 15px; margin-bottom: 20px;">
<h4 style="text-align:center; margin:0 0 15px 0;">${title}: ${escapeHTML(name)}</h4>
<div class="matrix-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; max-width:300px; margin:0 auto;">
            <div class="matrix-cell"><span class="cell-title">Характер</span><span class="cell-value">${getS(1)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Здоровье</span><span class="cell-value">${getS(4)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Удача</span><span class="cell-value">${getS(7)}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Цель</span><span class="cell-value">${matrix.goal}</span></div>
            <div class="matrix-cell"><span class="cell-title">Энергия</span><span class="cell-value">${getS(2)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Логика</span><span class="cell-value">${getS(5)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Долг</span><span class="cell-value">${getS(8)}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Семья</span><span class="cell-value">${matrix.family}</span></div>
            <div class="matrix-cell"><span class="cell-title">Интерес</span><span class="cell-value">${getS(3)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Труд</span><span class="cell-value">${getS(6)}</span></div>
            <div class="matrix-cell"><span class="cell-title">Память</span><span class="cell-value">${getS(9)}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Привычки</span><span class="cell-value">${matrix.habits}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Самооценка</span><span class="cell-value">${matrix.self}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Быт</span><span class="cell-value">${matrix.life}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Талант</span><span class="cell-value">${matrix.talent}</span></div>
            <div class="matrix-cell summary"><span class="cell-title">Дух</span><span class="cell-value">${matrix.spirit}</span></div>
            <div class="matrix-cell temp"><span class="cell-title">Темперамент</span><span class="cell-value">${matrix.temp}</span></div>
        </div>
    </div>
    `;
}


// ГЛАВНАЯ ФУНКЦИЯ КАЛЬКУЛЯТОРА
async function calculateParentChild() {
    if (!premiumAccess) {
        openUnlockPaymentModal();
        return;
    }
    const canProceed = await useCalculation();
    if (!canProceed) return;

    const parentName = document.getElementById('parentName').value.trim() || 'Родитель';
    const parentDate = document.getElementById('parentDate').value;
    const childName = document.getElementById('childName').value.trim() || 'Ребёнок';
    const childDate = document.getElementById('childDate').value;
    const parentRole = document.getElementById('parentRole').value;

    if (!parentDate || !childDate) {
        alert('Пожалуйста, введите даты рождения родителя и ребёнка!');
        return;
    }

    document.getElementById('result-parent-child').style.display = 'none';
    document.getElementById('loader-parent-child').style.display = 'flex';
    startMagicAnimation('magic-numbers-parent-child');

    setTimeout(() => {
        const parentMatrix = calculateMatrixData(parentDate);
        const childMatrix = calculateMatrixData(childDate);

        const indicators = getIndicatorsList(parentMatrix, childMatrix);
        const classified = classifyIndicators(indicators);

        const topHarmony = getTopHarmony(classified);
        const topTension = getTopTension(classified);
        const topGrowth = getTopGrowth(classified);

        const childAge = calculateAge(childDate);
        const agePeriod = getAgePeriod(childAge);
        const ageRecommendations = getAgeRecommendations(agePeriod, parentMatrix, childMatrix, parentRole);

        const parentTraps = getParentTraps(parentMatrix, childMatrix, parentRole);
        const conflictScenarios = getConflictScenarios(parentMatrix, childMatrix, parentRole);
        const learningStyle = getLearningStyle(childMatrix, parentMatrix);
        const emotionalLanguage = getEmotionalLanguage(childMatrix, parentMatrix);

        let html = `
<div class="comparison-matrices" style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;margin-bottom:30px;">
    ${renderMatrixCard(parentMatrix, parentName, 'Родитель')}
    ${renderMatrixCard(childMatrix, childName, 'Ребёнок')}
</div>
<div class="report-block">
    <h3>📖 Общий портрет отношений</h3>
    <p>${getGeneralPortrait(parentMatrix, childMatrix, parentName, childName, parentRole)}</p>
</div>
<div class="report-block">
    <h3>🟢 Зоны гармонии (Топ-3)</h3>
    ${topHarmony.map(z => formatHarmonyZone(z, parentMatrix, childMatrix)).join('')}
</div>
<div class="report-block">
    <h3>🔴 Зоны напряжения (Топ-3)</h3>
    ${topTension.map(z => formatTensionZone(z, parentMatrix, childMatrix)).join('')}
</div>
<div class="report-block">
    <h3>🔵 Зоны роста (Топ-3)</h3>
    ${topGrowth.map(z => formatGrowthZone(z, parentMatrix, childMatrix)).join('')}
</div>
<div class="report-block">
    <h3>⚠️ Родительские ловушки</h3>
    ${parentTraps.map(trap => `<div style="margin-bottom:15px;"><strong>${trap.title}</strong><br>${trap.text}</div>`).join('')}
</div>
<div class="report-block">
    <h3>📅 Возрастные рекомендации (${agePeriod.name})</h3>
    ${ageRecommendations}
</div>
<div class="report-block">
    <h3>⚡ Конфликтные сценарии</h3>
    ${conflictScenarios.map(sc => `<div style="margin-bottom:15px;"><strong>${sc.title}</strong><br>${sc.text}</div>`).join('')}
</div>
<div class="report-block">
    <h3>📚 Стиль обучения ребёнка</h3>
    ${learningStyle}
</div>
<div class="report-block">
    <h3>💛 Эмоциональный язык ребёнка</h3>
    ${emotionalLanguage}
</div>
<button class="btn-gold" onclick="downloadParentChildPDF()" style="margin-top:20px;width:100%;">
    <i class="fa-solid fa-file-pdf"></i> Скачать отчёт (PDF)
</button>
        `;

        document.getElementById('result-parent-child').innerHTML = html;
        document.getElementById('loader-parent-child').style.display = 'none';
        document.getElementById('result-parent-child').style.display = 'block';
        stopMagicAnimation('magic-numbers-parent-child');
    }, 1500);
}

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ КАЛЬКУЛЯТОРА «РОДИТЕЛЬ-РЕБЁНОК»
// ============================================================

function getConflictScenarios(parentMatrix, childMatrix, parentRole = 'mother') {
    const p = parentMatrix.c;
    const c = childMatrix.c;
    const scenarios = [];
    const role = parentRole === 'mother' ? 'мама' : (parentRole === 'father' ? 'папа' : 'родитель');

    // ========== СЦЕНАРИЙ 1: «Кто здесь главный?» (сильный характер у обоих) ==========
    if (p[1] >= 4 && c[1] >= 4) {
        scenarios.push({
            title: "⚡ Сценарий «Кто здесь главный?»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему этот сценарий возникает</strong><br>
                    Дорогие родители, вы оба – люди с сильными, волевыми характерами. У вас ${p[1]} единиц, у ребёнка ${c[1]}. Вы оба привыкли быть правыми, отстаивать свою точку зрения и не любите, когда кто-то командует. Любой спор, даже о том, в каком порядке мыть посуду, превращается в битву за власть. Вы говорите: «Потому что я так сказал(а)!». Ребёнок: «А я так хочу!». Вы чувствуете, что теряете авторитет, он – что его не уважают. Это как два быка на одном пастбище: либо они разнесут всё вокруг, либо научатся делить территорию.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы просите ребёнка убрать в комнате. Он: «Сначала досмотрю мультик». Вы: «Нет, сейчас». Он: «Ты вечно командуешь!». Вы: «Я – ${role}, я лучше знаю!». Он хлопает дверью, вы кричите. В итоге комната не убрана, настроение испорчено, вы оба обижены. И так каждый день. Вы чувствуете, что дом превратился в поле боя, а ребёнок – в противника. А ведь он не враг. Он просто тоже хочет, чтобы его мнение учитывали.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы путаете уважение с подчинением. Вам кажется, что если ребёнок не слушается с первого слова, значит, он вас не уважает. Но уважение – это не «делай, что я сказал». Это «я слышу тебя, ты слышишь меня, мы договариваемся». Вторая ошибка – вы не разделяете зоны ответственности. Вы пытаетесь контролировать всё, включая то, что ребёнок вполне может решать сам. Это вызывает бунт. Третья ошибка – вы не умеете уступать. Вам кажется, что уступить = проиграть. Но в семейных отношениях уступить – это не проигрыш, а инвестиция в мир.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Выберите одну сферу, где вы обычно спорите, и договоритесь: «В этом вопросе решаешь ты, в следующем – я». Например, порядок уборки – по вашему плану, а выбор фильма – по его. Это снизит градус борьбы.<br>
                    🔹 <strong>На этой неделе:</strong> Введите «правило двух минут»: прежде чем сказать «нет», выслушайте аргументы ребёнка в течение двух минут. Вы удивитесь, как часто его доводы оказываются разумными. И он почувствует, что его мнение важно.<br>
                    🔹 <strong>В ближайший месяц:</strong> Разделите зоны ответственности официально: «Ты отвечаешь за порядок в своей комнате, я – за ужин. Ты выбираешь одежду, я – меню». И не лезьте на чужую территорию. Это снизит количество конфликтов на 80%.</p>
                    
                    <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>📖 История из практики</strong><br>
                        Ко мне пришла мама с 12-летним сыном. Каждый вечер – битва за уроки. Мама говорила: «Садись сейчас!», сын: «Потом». Мы предложили: мама даёт выбор: «Ты садишься за уроки сейчас и заканчиваешь к 8, или через час и заканчиваешь к 9. Решаешь ты». Сын выбрал через час. И… сел сам, без напоминаний. Мама сказала: «Оказывается, он не против уроков, он против приказов».</p>
                    </div>
                    
                    <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>🕯️ Ритуал на сегодня</strong><br>
                        Сядьте напротив друг друга. Положите на стол два камня. Скажите: «Этот камень – моя твёрдость. Этот – твоя. Мы оба сильные, и это здорово. Давай договоримся: когда мы спорим, мы не кричим, а говорим по очереди. И тот, кто уступает сегодня, завтра получает право выбора». Положите камни друг на друга – символ союза.</p>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                        <p><strong>🌟 Что запомнить навсегда</strong><br>
                        «Сила не в том, чтобы всегда быть правым. Сила в том, чтобы уметь договариваться. Вы оба – лидеры. Не воюйте за власть – разделите её. И тогда ваша энергия станет не разрушительной, а созидательной».</p>
                    </div>
                </div>
            `
        });
    }
    
    // ========== СЦЕНАРИЙ 2: «Почему ты не можешь просто решить?» (родитель сильный, ребёнок слабый) ==========
    else if (p[1] >= 4 && c[1] <= 1) {
        scenarios.push({
            title: "⚡ Сценарий «Почему ты не можешь просто решить?»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему этот сценарий возникает</strong><br>
                    Дорогие родители, вы – человек с сильной волей (${p[1]} единиц). Вы привыкли быстро принимать решения, действовать без промедления. А ваш ребёнок – мягкий, неконфликтный (${c[1]}). Он долго думает, сомневается, боится ошибиться. Вы говорите: «Ну что тут думать?», «Бери и делай!», «В твоём возрасте я уже всё решал сам». Вы искренне не понимаете, почему он «тормозит». А он замирает ещё больше. Вы давите – он закрывается. Замкнутый круг.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы стоите перед полкой с соками. Ребёнок не может выбрать уже пять минут. Вы теряете терпение: «Давай быстрее, мы опаздываем!». Он хватает первый попавшийся, вы идёте на кассу. Всю дорогу он молчит, вы думаете, что он обиделся. А он просто не успел понять, чего хотел. Или вы спрашиваете: «В какой кружок хочешь пойти?». Он неделю мучается, не может определиться. Вы злитесь: «Тогда я решу за тебя». Он идёт, куда вы сказали, но без желания, потом бросает. Вы думаете: «Неблагодарный». А он просто не мог выбрать.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы думаете, что он «ленится» или «не старается». Но правда в том, что его мозг устроен иначе. Ему нужно больше времени на обработку информации. Ваше давление не ускоряет его, а парализует. Вторая ошибка – вы не даёте ему права на ошибку. Вы требуете идеального выбора сразу. А выбор – это навык, который тренируется. Если вы будете вечно решать за него, он никогда не научится.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Сузьте поле выбора до двух вариантов. Не «что будем делать?», а «мы идём в парк или в кино?». Два варианта – идеальный тренажёр для слабой воли.<br>
                    🔹 <strong>На этой неделе:</strong> Давайте время на обдумывание. «Подумай, я подойду через 5 минут». Не торопите, не давите. И когда он выберет, обязательно скажите: «Ты сам решил – это здорово!»<br>
                    🔹 <strong>В ближайший месяц:</strong> Постепенно увеличивайте сложность выбора. От «какую футболку?» до «в какой кружок пойдём?». И главное – разрешите ему ошибаться. Если он выбрал не тот кружок и бросил – это его опыт, а не ваша ошибка. Спросите: «Что ты понял? Как в следующий раз поступим?»</p>
                    
                    <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>📖 История из практики</strong><br>
                        Мама 10-летнего Кирилла жаловалась: «Он не может выбрать даже завтрак, я уже устала решать за него». Мы предложили: каждое утро – выбор из двух вариантов: «Кашу или омлет?». Через две недели Кирилл стал выбирать быстрее. Через месяц он уже сам предлагал: «А можно блины?». Мама сказала: «Оказывается, ему просто нужно было время, а не давление».</p>
                    </div>
                    
                    <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>🕯️ Ритуал на сегодня</strong><br>
                        Напишите на листе три простых выбора: «Что надеть», «Что съесть на полдник», «Какую книгу почитать». Отдайте лист ребёнку. Пусть он отметит. И скажите: «Ты сегодня сам(а) решил(а) – я горжусь».</p>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                        <p><strong>🌟 Что запомнить навсегда</strong><br>
                        «Воля не передаётся через приказы. Она выращивается через маленькие выборы. Ваша задача – не решать за ребёнка, а создавать пространство, где он может решать сам. И помнить: его медлительность – не лень, а другой темп. Уважайте его, и он научится уважать себя».</p>
                    </div>
                </div>
            `
        });
    }
    
    // ========== СЦЕНАРИЙ 3: «Ты меня не слышишь» (логика родителя vs эмоции ребёнка) ==========
    if (p[5] >= 4 && c[2] >= 4) {
        scenarios.push({
            title: "⚡ Сценарий «Ты меня не слышишь»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему этот сценарий возникает</strong><br>
                    Дорогие родители, вы – человек логики (${p[5]} пятёрок). Вы привыкли оперировать фактами, аргументами, причинно-следственными связями. Когда возникает проблема, вы сразу предлагаете решение: «Давай сделаем так, потому что это эффективно». А у ребёнка высокая энергия и чувствительность (${c[2]} двоек) – он живёт эмоциями. Ему сначала нужно, чтобы вы признали его чувства, выслушали, поняли. А вы «рубите с плеча» логическими доводами. Ребёнок кричит: «Ты меня не слышишь!», а вы не понимаете, в чём дело – вы же всё сказали.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Ребёнок приходит из школы расстроенный. Вы: «Что случилось?». Он: «Меня никто не любит!». Вы: «Это неправда, вот тебя любят мама, папа, бабушка. Давай подумаем, как наладить отношения с одноклассниками». Он: «Ты меня не понимаешь!» и уходит в комнату. Вы чувствуете, что он нелогичен. А он просто хотел, чтобы вы сказали: «Мне жаль, что тебе больно. Обними меня».</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы пропускаете этап «признание эмоций» и сразу переходите к решениям. Для вас эмоции – это помеха, которую нужно отбросить. Для ребёнка – это главное. Вторая ошибка – вы обесцениваете его чувства. «Не бери в голову», «Это ерунда». Для него это не ерунда. Это его мир. Когда вы обесцениваете его чувства, он чувствует себя невидимым.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Когда ребёнок расстроен, скажите: «Я вижу, тебе грустно / обидно / страшно». Просто назовите его чувство. Не добавляйте «но» или «потому что». Просто признайте. Это снизит напряжение на 50%<br>
                    🔹 <strong>На этой неделе:</strong> Практикуйте активное слушание. Не перебивайте, не советуйте, не оценивайте. Просто повторяйте его слова: «То есть ты обиделся, потому что…». Он почувствует, что его слышат, и успокоится.<br>
                    🔹 <strong>В ближайший месяц:</strong> Введите «эмоциональный час» – раз в неделю вы говорите только о чувствах. Без анализа, без решений. Просто: «Что ты чувствовал сегодня? А я чувствовал…». Это сблизит вас и научит ребёнка понимать себя.</p>
                    
                    <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>📖 История из практики</strong><br>
                        Папа 9-летней Ани жаловался: «Она приходит из школы и плачет, а когда я спрашиваю, в чём дело, отвечает: «Ты всё равно не поймёшь». Мы предложили: вместо вопросов и советов папа просто обнимал дочку и говорил: «Я вижу, тебе грустно». Через неделю Аня сама начала рассказывать, что её обижают. Папа не давал советов – просто слушал. Через месяц они стали лучшими друзьями.</p>
                    </div>
                    
                    <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>🕯️ Ритуал на сегодня</strong><br>
                        Сядьте напротив друг друга. Положите руки на сердце. По очереди называйте чувства, которые вы испытываете прямо сейчас. Без оценок, просто факты. «Я чувствую усталость», «Я чувствую любопытство». Не комментируйте, не оценивайте. Просто слушайте.</p>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                        <p><strong>🌟 Что запомнить навсегда</strong><br>
                        «Прежде чем предлагать решение, признай чувство. Логика без эмпатии – это холодный скальпель. А эмпатия без логики – это хаос. Вместе они – настоящая сила. Сначала обними, потом разбирайся. И ты увидишь, как исчезнут самые сложные конфликты».</p>
                    </div>
                </div>
            `
        });
    }
    
    // ========== СЦЕНАРИЙ 4: «Ты вечно устаёшь!» (разная энергия) ==========
    if (p[2] >= 4 && c[2] <= 1) {
        scenarios.push({
            title: "⚡ Сценарий «Ты вечно устаёшь!»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему этот сценарий возникает</strong><br>
                    Дорогие родители, вы полны сил и энергии (${p[2]} двоек), а ваш ребёнок быстро истощается (${c[2]}). Вы можете работать до ночи, успевать тысячу дел. А он после школы еле стоит на ногах. Вы говорите: «Соберись!», «Хватит ныть», «Посмотри на других детей – они и на спорт, и на музыку успевают». Вы искренне не понимаете, как можно «просто сидеть и ничего не делать». Вы думаете, что он ленится или не старается. Но правда в другом.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы планируете насыщенный выходной: парк, кино, гости. Ребёнок уже к обеду говорит, что устал. Вы раздражаетесь: «Да ладно, потерпи!». Он идёт, но капризничает весь день. Вы злитесь, он плачет. Вечером вы чувствуете, что «отдых» вымотал всех. Или вы хотите остаться дома, а ребёнок просится гулять. Вы говорите: «Я устал, давай завтра». Он обижается. Вы чувствуете вину. Каждый выходной превращается в битву.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы требуете от ребёнка вашего темпа. «Я же могу, значит и ты должен». Это как требовать от цыплёнка летать как орёл. Его энергия – не лень, а физиология. Вы не замечаете его сигналов усталости и заставляете его работать на износ. Это ведёт к болезням, неврозам и хронической усталости. Вторая ошибка – вы не учите его отдыхать. Вы сами не умеете останавливаться, поэтому и ему не показываете пример. В итоге вы оба выгораете.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Спросите ребёнка: «По шкале от 1 до 10, сколько у тебя сейчас энергии?». Если меньше 5 – отмените все планы, кроме самых важных. Просто побудьте рядом. Если 7–10 – предложите активность, но не требуйте.<br>
                    🔹 <strong>На этой неделе:</strong> Заведите «энергетический дневник». Вместе отмечайте, в какое время суток у вас пик сил, а когда спад. Планируйте сложные дела на пик, а отдых – на спад. Вы удивитесь, насколько меньше станет конфликтов.<br>
                    🔹 <strong>В ближайший месяц:</strong> Введите «ленивые дни» – раз в неделю вы вообще ничего не планируете. Валяетесь, смотрите кино, едите, что захочется. Это не распущенность – это профилактика выгорания.</p>
                    
                    <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>📖 История из практики</strong><br>
                        У 8-летней Алисы было 0 двоек, у мамы – 4. Алиса быстро уставала в школе, а мама требовала после уроков ещё и на кружки. Девочка начала болеть каждый месяц. Мы ввели правило: после школы – час полного покоя (лёжа, без телефона, без разговоров). Через месяц Алиса перестала болеть, а мама… сама полюбила этот час тишины и обнаружила, что тоже устаёт больше, чем думала.</p>
                    </div>
                    
                    <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>🕯️ Ритуал на сегодня</strong><br>
                        Сядьте на пол, закройте глаза, положите руки на колени. 3 минуты просто дышите. Вдох – вы вдыхаете энергию. Выдох – вы отпускаете усталость. Делайте это вместе. Потом обнимитесь и скажите: «Мы разные, но мы команда».</p>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                        <p><strong>🌟 Что запомнить навсегда</strong><br>
                        «Энергия – не соревнование. Если у одного бензин на 10 литров, а у другого на 50, это не значит, что первый плохой. Просто у него бак меньше. Ваша задача – не перелить из одного бака в другой, а планировать маршрут, чтобы хватило обоим».</p>
                    </div>
                </div>
            `
        });
    }
    
    // ========== СЦЕНАРИЙ 5: «Ничего не трогай, я сам» (родитель перфекционист, ребёнок боится ошибок) ==========
    if (p[4] >= 4 && c[4] <= 1) {
        scenarios.push({
            title: "⚡ Сценарий «Ничего не трогай, я сам»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему этот сценарий возникает</strong><br>
                    Дорогие родители, вы человек с высокими требованиями к порядку, здоровью, чистоте (${p[4]} четвёрок). Вы привыкли всё делать идеально. А ребёнок не проявляет интереса к порядку (${c[4]}). Он делает всё кое-как, разбрасывает вещи. Вы начинаете переделывать за ним, комментировать: «Вечно у тебя всё из рук валится», «Лучше я сам(а)». Ребёнок перестаёт даже пытаться что-то делать – зачем, если вы всё равно переделаете и раскритикуете? Замкнутый круг.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы просите ребёнка помыть посуду. Он моет, но не очень хорошо. Вы вздыхаете, перемываете и говорите: «Вечно у тебя как попало». Ребёнок обижается. В следующий раз он уже не хочет мыть – «всё равно мама/папа недовольны». Вы злитесь на него за «лень». А он просто боится ошибиться. Или вы просите убрать в комнате. Он убирает, но вы находите пыль под кроватью. Вы ругаетесь. Он чувствует себя неудачником. В итоге вы убираете сами, он играет. И вы выгораете.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы требуете идеального результата с первого раза. Но навыки формируются через ошибки. Если вы будете наказывать за неидеальность, ребёнок перестанет пробовать. Вторая ошибка – вы делаете за него. Этим вы лишаете его возможности научиться. «Лучше я сделаю сама, чем потом переделывать» – это путь к тому, что ребёнок вырастет несамостоятельным.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Дайте ребёнку одно маленькое дело, которое он сделает сам, без вашего контроля. Например, вытереть пыль или полить цветы. И не переделывайте, даже если сделал неидеально. Скажите: «Спасибо, ты мне очень помог(ла)!».<br>
                    🔹 <strong>На этой неделе:</strong> Введите «зону неидеальности» – место, где ребёнок может делать что угодно, и вы не критикуете. Например, его комната. Пусть там будет творческий беспорядок.<br>
                    🔹 <strong>В ближайший месяц:</strong> Учитесь вместе. Не «делай как я», а «давай я покажу, а ты попробуешь». И если получилось хуже – похвалите за старание, а потом предложите: «А давай попробуем ещё раз вместе?»</p>
                    
                    <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>📖 История из практики</strong><br>
                        Мама 10-летнего Димы жаловалась: «Он ничего не делает по дому, я уже устала». Мы предложили: перестать критиковать и переделывать. Дима помыл посуду – мама сказала «спасибо», даже если остались разводы. Через месяц Дима сам вызвался помыть посуду, потому что знал: его похвалят, а не отругают. Мама сказала: «Я поняла: неидеально, но сделано – лучше, чем идеально, но не сделано».</p>
                    </div>
                    
                    <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>🕯️ Ритуал на сегодня</strong><br>
                        Возьмите лист бумаги. Напишите: «Я разрешаю себе не быть идеальным. Я разрешаю ребёнку ошибаться». Повесьте на видное место. И каждый раз, когда захотите переделать, посмотрите на эту фразу.</p>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                        <p><strong>🌟 Что запомнить навсегда</strong><br>
                        «Сделано на троечку и с любовью лучше, чем сделано на пятёрку и с ненавистью. Ваша задача – не вырастить идеального исполнителя, а вырастить человека, который не боится пробовать. И для этого иногда нужно закрыть глаза на пыль под кроватью».</p>
                    </div>
                </div>
            `
        });
    }
    
    // ========== УНИВЕРСАЛЬНЫЙ СЦЕНАРИЙ (если ни один не подошёл) ==========
    if (scenarios.length === 0) {
        scenarios.push({
            title: "⚡ Общий сценарий «Мы говорим на разных языках»",
            text: `
                <div style="font-size:0.95rem; line-height:1.6;">
                    <p><strong>🧠 Почему этот сценарий возникает</strong><br>
                    Дорогие родители, у вас и ребёнка нет ярко выраженных противоречий по основным линиям. И это замечательно! Вы редко ссоритесь на почве характера, энергии или логики. Но конфликты всё равно возникают – просто потому, что вы разные люди. У вас разный жизненный опыт, разные темпераменты, разные текущие состояния. И иногда вы не понимаете друг друга не потому, что кто-то «плохой», а потому, что не проговариваете свои ожидания.</p>
                    
                    <p><strong>🎭 Как это проявляется в жизни</strong><br>
                    Вы просите ребёнка убрать в комнате. Он говорит «хорошо», но не делает. Вы злитесь, он удивляется. Выясняется, что он понял «убери» как «сложи игрушки в коробку», а вы имели в виду «пропылесось и вытри пыль». Вы говорили на разных языках. Или вы спрашиваете: «Как дела в школе?». Он: «Нормально». Вы: «Что значит нормально?». Он: «Ну нормально». Вы обижаетесь, что он скрытный. А он просто не знает, что именно вы хотите услышать.</p>
                    
                    <p><strong>⚠️ Главная ошибка, которую вы совершаете</strong><br>
                    Вы думаете, что раз вы похожи, то он автоматически понимает вас без слов. Это не так. Даже близкие люди нуждаются в ясных объяснениях. Вторая ошибка – вы не спрашиваете, а додумываете. «Он молчит, значит, злится». А он просто устал. Вы придумываете проблему, которой нет, и обижаетесь на неё.</p>
                    
                    <p><strong>💡 Что делать: пошаговая стратегия</strong><br>
                    🔹 <strong>Сегодня:</strong> Вместо того чтобы додумывать, спросите прямо: «Что ты сейчас чувствуешь?», «Как ты понял мою просьбу?». Вы удивитесь, как часто ваши догадки ошибочны.<br>
                    🔹 <strong>На этой неделе:</strong> Введите «семейный совет» раз в неделю. Садитесь и обсуждайте: что было хорошего, что не очень. Без обвинений, просто факты и чувства. Ребёнок научится говорить о себе, вы – слушать.<br>
                    🔹 <strong>В ближайший месяц:</strong> Начните вести «дневник благодарности» – каждый день записывайте три вещи, за которые вы благодарны ребёнку. И просите его делать то же самое. Это укрепит вашу связь и поможет замечать хорошее, а не только проблемы.</p>
                    
                    <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>📖 История из практики</strong><br>
                        Мама 11-летней Алисы была уверена, что у них «идеальные отношения». Алиса – тихая, послушная, спокойная. Но в школе у неё начались истерики. Оказалось, дома она боялась говорить маме, что её обижают одноклассники. Мама не спрашивала, думала, что «и так всё видно». Алиса молчала, потому что не хотела расстраивать маму. Мы ввели правило: каждый вечер – 10 минут «секретов», где можно говорить о чём угодно, без осуждения. Через месяц Алиса рассказала о буллинге, мама помогла, истерики прекратились. Тишина оказалась не золотом, а сигналом.</p>
                    </div>
                    
                    <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                        <p><strong>🕯️ Ритуал на сегодня</strong><br>
                        Сядьте напротив друг друга. Зажгите свечу. По очереди говорите: «Сегодня я благодарен тебе за…». Три пункта. Не смейтесь, не перебивайте. Просто слушайте. Потом задуйте свечу и обнимитесь.</p>
                    </div>
                    
                    <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                        <p><strong>🌟 Что запомнить навсегда</strong><br>
                        «Гармония не в отсутствии проблем, а в умении их замечать, пока они маленькие. Самые опасные ловушки – те, что вы не видите. Поэтому не ленитесь спрашивать, слушать и смотреть. Ваш ребёнок – не ваша копия, даже если кажется очень похожим. Он – отдельная вселенная. Исследуйте её».</p>
                    </div>
                </div>
            `
        });
    }
    
    return scenarios;
}

function getLearningStyle(childMatrix, parentMatrix) {
    const c = childMatrix.c;
    const p = parentMatrix.c;
    
    // ========== 1. АНАЛИЗ ТИПА ОБУЧЕНИЯ ПО ЯЧЕЙКЕ 3 (ИНТЕРЕС) ==========
    let learningType = '';
    let typeDescription = '';
    let strengths = [];
    let challenges = [];
    let parentAdvice = '';
    let storyExample = '';
    let ritual = '';
    
    if (c[3] <= 1) {
        learningType = 'практик-кинестетик («через руки»)';
        typeDescription = `Ваш ребёнок – прирождённый практик. Дорогие родители, поймите главное: он не ленивый и не глупый. Его мозг просто устроен иначе. Ему трудно учиться через книги и лекции, зато он отлично усваивает информацию через движение, прикосновения, эксперименты. Он должен делать, чтобы понять. «Посиди и почитай» – для него пытка. «Давай соберём модель, проведём опыт, нарисуем схему» – вот его стихия.`;
        strengths = [
            `🔸 Высокая вовлечённость в практические занятия – он может часами что-то мастерить, конструировать, экспериментировать.`,
            `🔸 Отличная моторная память – запоминает через действие, а не через зубрёжку.`,
            `🔸 Способность учиться через ошибки – для него «сломать и починить» лучше, чем прочитать инструкцию.`
        ];
        challenges = [
            `🔸 Трудности с чтением и письмом – усидеть за партой для него подвиг.`,
            `🔸 Неусидчивость при пассивном обучении – начинает вертеться, отвлекаться, мешать другим.`,
            `🔸 Быстрая потеря интереса к теории – если нет практики, он «выключается».`
        ];
        storyExample = `К нам пришла мама с 9-летним Артёмом. «Он не может выучить стихи, ненавидит чтение, на уроках вертится», – жаловалась она. Проверили матрицу – у Артёма 0 троек (интерес к познанию). Мы предложили: учить стихи через движение – придумывать жесты к каждой строчке. Артём выучил стих за 15 минут. Мама сказала: «Я думала, он безнадёжен, а он просто учится по-другому». Через месяц Артём сам попросил записать его в кружок робототехники. Теперь он с удовольствием ходит на занятия и даже начал лучше читать – потому что нужно читать инструкции к конструкторам.`;
        ritual = `Сегодня выберите любой школьный материал (правило по русскому, формулу по математике, стих). Придумайте к нему движение, жест, танец. Пусть ребёнок сам предложит. Выучите вместе, двигаясь. Он запомнит в 10 раз быстрее, чем при зубрёжке.`;
        if (p[3] >= 4) {
            parentAdvice = `Вы сами любите учиться классически (читать, слушать лекции), поэтому вам особенно трудно принять его способ. Не сравнивайте его с собой! То, что легко вам – подвиг для него. Переключитесь с книг на видео, опыты, моделирование. Ваша фраза «Я в твоём возрасте уже читал…» убивает его мотивацию. Лучше скажите: «Ты умеешь делать то, что я не умею – собирать модели. Давай я помогу тебе с теорией, а ты мне – с практикой».`;
        } else if (p[3] <= 1) {
            parentAdvice = `Вы сами не очень любите учиться классически, поэтому вам может быть легче понять ребёнка. Но будьте осторожны: не позволяйте ему совсем забросить учёбу. Ваша задача – найти мостик. Например, вместо чтения параграфа – посмотрите короткое видео, вместо письменного упражнения – нарисуйте схему. Вы вместе можете превратить учёбу в игру.`;
        }
    } 
    else if (c[3] >= 3) {
        learningType = 'теоретик-исследователь («через голову»)';
        typeDescription = `Ваш ребёнок – природный исследователь. Дорогие родители, он не «ботаник» и не «заучка». Ему просто нравится понимать суть вещей. Он любит копаться в информации, задавать вопросы, читать. Ему недостаточно знать, что «так надо». Он хочет знать «почему». Он с удовольствием будет изучать энциклопедии, смотреть научно-популярные фильмы, спорить о причинах и следствиях.`;
        strengths = [
            `🔸 Глубокая любознательность – его не надо заставлять учиться, он сам тянется к знаниям.`,
            `🔸 Способность к самостоятельному обучению – может разобраться в сложной теме без помощи.`,
            `🔸 Аналитический склад ума – видит закономерности, строит теории, любит логические задачи.`
        ];
        challenges = [
            `🔸 Склонность перегружать себя информацией – может засиживаться до ночи, забывая про отдых.`,
            `🔸 Трудности с практическим применением – знает всё, но не всегда умеет делать руками.`,
            `🔸 Разочарование, если тема неинтересна – тогда он может полностью «отключиться».`
        ];
        storyExample = `Папа 11-летней Алисы жаловался, что она «зациклена на книгах, не выходит из комнаты». У Алисы 4 тройки. Мы предложили: не ограничивать, а направлять – купить энциклопедии, записать в научный клуб, давать сложные задачи. Через год Алиса выиграла олимпиаду по биологии. Папа сказал: «Я понял, что её «зацикленность» – это талант, а не проблема». Но было и сложно: Алиса часто засиживалась до двух ночи. Мы ввели правило «компьютер выключается в 10 вечера». Сначала она злилась, потом привыкла и стала успевать больше.`;
        ritual = `Вместе посмотрите 15-минутное научно-популярное видео на тему, которая его интересует (космос, динозавры, физика). После обсудите: «Что тебя удивило? Что хочешь узнать ещё? Что ты думаешь об этом?». Не экзамен, а разговор. Поддержите его любопытство.`;
        if (p[3] <= 1) {
            parentAdvice = `Вы сами не очень любите учиться, поэтому вам может быть сложно поддерживать его интерес. Не гасите его любопытство фразами «хватит сидеть за книгами», «иди погуляй». Давайте ему ресурсы: книги, доступ в интернет, кружки. Он сможет стать экспертом в своей области, если вы создадите среду. А вы можете научиться у нему – пусть он расскажет вам о том, что узнал. Это сблизит вас.`;
        } else if (p[3] >= 4) {
            parentAdvice = `Вы оба любите учиться, и это прекрасно! Но будьте осторожны: вы можете начать соревноваться, кто больше знает, или перегружать друг друга. Договоритесь: «Мы – команда, а не конкуренты». И обязательно введите дни без учёбы, когда вы просто отдыхаете.`;
        }
    } 
    else {
        learningType = 'смешанный тип («через баланс»)';
        typeDescription = `У вашего ребёнка средний интерес к познанию. Дорогие родители, это не плохо и не хорошо. Он может учиться и через практику, и через теорию, но нуждается в поддержке и структуре. Его стиль зависит от предмета, настроения и усталости. Сегодня ему может нравиться читать, завтра – мастерить. Ваша задача – не загонять его в рамки, а наблюдать и подстраиваться.`;
        strengths = [
            `🔸 Гибкость, способность адаптироваться к разным форматам обучения.`,
            `🔸 Умеренная нагрузка не вызывает стресса – он не выгорает.`,
            `🔸 Хорошо работает в группе, может быть и лидером, и ведомым.`
        ];
        challenges = [
            `🔸 Отсутствие ярко выраженной мотивации – может «плыть по течению».`,
            `🔸 Нуждается во внешнем стимуле – сам редко проявляет инициативу.`,
            `🔸 Риск потерять интерес, если обучение становится однообразным.`
        ];
        storyExample = `Одна мама долго не могла понять, почему её 10-летний сын «то учится хорошо, то плохо». Оказалось, у него смешанный стиль. Мы предложили чередовать: день – практика (опыты, поделки), день – теория (чтение, задачи). Через месяц успеваемость выровнялась, а сын сказал: «Мама, ты наконец-то меня поняла». Главное – не требовать от него постоянства. Сегодня он может быть «теоретиком», завтра – «практиком». Дайте ему свободу.`;
        ritual = `Возьмите лист бумаги. Напишите три темы, которые ребёнок хочет изучить (или должен изучить по школе). Выберите одну. Сегодня найдите по ней короткое видео (теория) и практическое задание (опыт, рисунок, поделку). Сделайте и то, и другое. Обсудите, что понравилось больше – теория или практика. В следующий раз начните с того, что ему больше отозвалось.`;
        if (p[3] >= 4) {
            parentAdvice = `Вы сами очень любите учиться, поэтому вам может казаться, что ребёнок «не старается». Это не так. Ему просто нужен другой темп и другой формат. Не давите, не сравнивайте. Давайте выбор: «Сегодня мы можем почитать или сделать опыт. Что выберешь?». Он будет учиться охотнее, когда почувствует, что его мнение важно.`;
        } else if (p[3] <= 1) {
            parentAdvice = `Вы сами не очень любите учиться, поэтому вы можете неосознанно тормозить ребёнка. «Зачем тебе эта физика?» – такие фразы убивают его интерес. Постарайтесь поддержать его любопытство, даже если вам это не близко. Спросите: «Расскажи, что ты узнал? Мне правда интересно». Ваше внимание – лучшая мотивация.`;
        }
    }
    
    // ========== 2. АНАЛИЗ ПАМЯТИ (ЦИФРА 9) ==========
    let memoryAdvice = '';
    let memoryExample = '';
    if (c[9] >= 3) {
        memoryAdvice = `У ребёнка отличная механическая память. Он легко запоминает даты, правила, стихи, формулы. Это прекрасно, но есть и ловушка: он может запоминать, не понимая. Поэтому ваша задача – не просто давать информацию, а проверять понимание. «Ты запомнил, что 2+2=4. А почему? Объясни». Используйте его память как фундамент, но стройте на нём понимание.`;
        memoryExample = `Мама 8-летнего Димы хвасталась, что он знает таблицу умножения. Но когда я спросил: «Почему 3×4=12?», он не смог объяснить. Он просто запомнил. Мы начали играть в «объяснялки»: «Расскажи мне, как ты это понял». Через месяц Дима не только знал таблицу, но и мог решать задачи.`;
    } else if (c[9] <= 1) {
        memoryAdvice = `У ребёнка слабая механическая память. Дорогие родители, перестаньте ругать его за забывчивость! Он не назло забывает. Его мозг просто не держит информацию без ассоциаций, образов, повторений. Ваша задача – не требовать «выучить», а помочь «понять и связать». Вместо «выучи стих» разбейте на 4 строчки, нарисуйте картинку к каждой, придумайте историю. Вместо «запомни правило» – придумайте смешную фразу-ассоциацию. Мнемотехники – его лучшие друзья.`;
        memoryExample = `Папа 10-летней Ани жаловался: «Она учит стих час, а наутро ничего не помнит». Мы предложили: разбить стих на четверостишия, к каждому – рисунок. Аня нарисовала смешных персонажей. Через 20 минут она рассказывала стих без запинки. Папа сказал: «Я думал, она неспособна, а ей просто нужны картинки».`;
    }
    
    // ========== 3. АНАЛИЗ ЛОГИКИ (ЦИФРА 5) – КАК ОБРАБАТЫВАЕТ ИНФОРМАЦИЮ ==========
    let logicAdvice = '';
    let logicExample = '';
    if (c[5] >= 3) {
        logicAdvice = `Ребёнок – аналитик. Он любит раскладывать всё по полочкам, строить причинно-следственные связи, доказывать. Ему нравится, когда объясняют последовательно, логично, с аргументами. «Потому что я так сказал» – для него не аргумент. Используйте схемы, таблицы, алгоритмы. Он сам будет выстраивать структуру знаний. Но будьте осторожны: он может зацикливаться на деталях и терять общую картину. Учите его видеть лес, а не только деревья.`;
        logicExample = `12-летний Миша спорил с учителем по истории, потому что «в учебнике написано одно, а в интернете другое». Вместо того чтобы ругать его, мы предложили ему написать мини-исследование. Миша с энтузиазмом взялся, изучил источники и пришёл к выводу, что оба варианта имеют право на существование. Его аналитический ум направили в правильное русло, и он стал лучшим в классе по истории.`;
    } else if (c[5] <= 1) {
        logicAdvice = `Ребёнок – интуит. Ему сложно следовать строгой логике, зато он хорошо чувствует образы, метафоры, контекст. Он может не объяснить, почему он так думает, но его догадки часто оказываются верными. Объясняйте через истории, примеры, аналогии. Не требуйте пошаговых отчётов, спрашивайте общее впечатление. Его способ – видеть целое раньше частей. Уважайте это.`;
        logicExample = `Мама 9-летней Сони жаловалась, что она не может решать задачи по математике. Оказалось, Соня – интуит. Мы предложили объяснять через образы: «Представь, что яблоки – это друзья, а груши – это враги. Сколько друзей останется, если двое уйдут?». Соня поняла мгновенно. Она не любила формулы, но обожала истории. Через месяц она уже сама придумывала сюжеты к задачам.`;
    }
    
    // ========== 4. АНАЛИЗ УСИДЧИВОСТИ (ЦИФРА 6) ==========
    let workAdvice = '';
    let workExample = '';
    if (c[6] >= 3) {
        workAdvice = `Ребёнок усидчив, может долго заниматься одним делом. Это прекрасно для глубокого изучения, но есть риск перегрузки. Он сам не остановится – остановите вы. Следите за признаками усталости (трёт глаза, зевает, становится раздражительным). Вводите обязательные перерывы каждые 45–50 минут. И обязательно – смена деятельности. Учёба чередуется с физкультурой, творчеством, прогулкой.`;
        workExample = `11-летний Дима мог сидеть за уроками 4 часа подряд. Мама радовалась, пока Дима не начал жаловаться на головные боли. Мы ввели таймер: 45 минут учёбы – 15 минут активного отдыха. Через месяц головные боли прошли, а продуктивность выросла. Мама сказала: «Я думала, чем больше, тем лучше. Оказывается, важнее – как, а не сколько».`;
    } else if (c[6] <= 1) {
        workAdvice = `Ребёнок быстро устаёт от однообразия. Ему нужны короткие, интенсивные сессии (15–20 минут) с частыми перерывами. Не заставляйте сидеть за уроками часами – это неэффективно и вредно. Разбивайте материал на маленькие кусочки и меняйте деятельность каждые 15 минут. 15 минут читаем – 5 минут прыгаем – 15 минут пишем – 5 минут рисуем. Это не баловство, а необходимость.`;
        workExample = `Мама 8-летнего Коли жаловалась, что он «не может усидеть на месте». Мы предложили метод «помодоро» для детей: 15 минут учёбы, 5 минут активной игры. Коля начал делать уроки с удовольствием. Мама сказала: «Оказывается, он не гиперактивный, просто ему нужен другой режим». Через месяц он сам стал засекать время.`;
    }
    
    // ========== 5. ДОПОЛНИТЕЛЬНЫЙ СОВЕТ ПО ТЕМПЕРАМЕНТУ (ЕСЛИ ЕСТЬ ВЛИЯНИЕ) ==========
    let tempAdvice = '';
    if (childMatrix.temp >= 4) {
        tempAdvice = `У ребёнка горячий темперамент. Он быстро загорается и быстро остывает. В учёбе это проявляется как «вспышки интереса». Сегодня он готов учить до ночи, завтра – не может смотреть на книги. Не ругайте его за «неровность». Используйте периоды подъёма для сложных тем, а спады – для отдыха и повторения. Главное – не давить в период спада, иначе он возненавидит учёбу.`;
    } else if (childMatrix.temp <= 1) {
        tempAdvice = `У ребёнка спокойный, флегматичный темперамент. Он учится ровно, но медленно. Его сложно «растормошить», но и сложно выбить из колеи. Не требуйте от него быстрых ответов, не подгоняйте. Давайте время на обдумывание. Он не «тормоз», он просто вдумчивый. Такой стиль даёт глубину знаний, хотя и не даёт скорости.`;
    }
    
    // ========== 6. ИТОГОВАЯ ЖИВАЯ КОНСУЛЬТАЦИЯ ==========
    let fullText = `
        <div style="font-size:1rem; line-height:1.7;">
            <p><strong>🧠 Стиль обучения вашего ребёнка: ${learningType}</strong><br>
            ${typeDescription}</p>
            
            <p><strong>✨ Сильные стороны</strong><br>${strengths.join('<br>')}</p>
            
            <p><strong>⚠️ Зоны развития</strong><br>${challenges.join('<br>')}</p>
            
            <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>📖 Как это влияет на память</strong><br>${memoryAdvice}<br><br><em>Пример: ${memoryExample}</em></p>
            </div>
            
            <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>🧩 Как он обрабатывает информацию</strong><br>${logicAdvice}<br><br><em>Пример: ${logicExample}</em></p>
            </div>
            
            <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>⏰ Режим и усидчивость</strong><br>${workAdvice}<br><br><em>Пример: ${workExample}</em></p>
            </div>
            
            ${tempAdvice ? `<div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>🌡️ Влияние темперамента</strong><br>${tempAdvice}</p>
            </div>` : ''}
            
            <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>📖 История из практики</strong><br>${storyExample}</p>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                <p><strong>🕯️ Ритуал на сегодня</strong><br>${ritual}</p>
            </div>
            
            <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>🌟 Что запомнить навсегда</strong><br>
                «У каждого ребёнка свой ключик к знаниям. Ваша задача – не переделать его под систему, а подобрать систему под него. Один учится через уши, другой – через руки, третий – через глаза. Уважайте его способ – и он полюбит учиться на всю жизнь. А если вы будете насиловать его природу, он возненавидит и учёбу, и себя».</p>
            </div>
        </div>
    `;
    
    // Добавляем персонализированный совет для родителя, если есть
    if (parentAdvice) {
        fullText += `
            <div style="background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 12px; margin-top: 15px;">
                <p><strong>💡 Важный совет для вас, родители</strong><br>${parentAdvice}</p>
            </div>
        `;
    }
    
    return fullText;
}

function getEmotionalLanguage(childMatrix, parentMatrix) {
    const c = childMatrix.c;
    const p = parentMatrix.c;
    
    // ========== 1. БАЗОВАЯ ЧУВСТВИТЕЛЬНОСТЬ (ЭНЕРГИЯ – ЦИФРА 2) ==========
    let sensitivityType = '';
    let sensitivityDesc = '';
    let sensitivityAdvice = '';
    let sensitivityStory = '';
    
    if (c[2] >= 3) {
        sensitivityType = 'высокая чувствительность («эмоциональная губка»)';
        sensitivityDesc = `Ваш ребёнок – «эмоциональная губка». Он впитывает настроение окружающих, даже если вы ничего не говорите. Вы улыбаетесь – он радуется. Вы напряжены – он становится тревожным. Вы злитесь – он пугается или замыкается. Это не слабость, это его суперсила. Он чувствует мир тоньше, чем большинство людей. Но у этой суперсилы есть цена: он быстро перегружается, особенно в шумных местах, при конфликтах, в больших компаниях.`;
        sensitivityAdvice = `Как помочь: после школы, садика, гостей – дайте ему час тишины. Без телефона, без разговоров, без дел. Просто полежать, посмотреть в окно, послушать тихую музыку. Ему нужно «выгрузить» чужие эмоции, которые он набрал за день. Не заставляйте его общаться, когда он устал. Его «хочу побыть один» – не отвержение вас, а забота о себе.`;
        sensitivityStory = `Мама 7-летней Алисы жаловалась, что дочка «капризничает» после школы. Оказалось, у Алисы 3 двойки (высокая энергия чувствительности). Мы предложили: после школы – час полного покоя. Через две недели Алиса перестала капризничать. Мама сказала: «Я думала, она просто вредничает. Оказывается, ей нужно тихое время, чтобы перезагрузиться».`;
    } else if (c[2] <= 1) {
        sensitivityType = 'низкая энергия, быстрая утомляемость';
        sensitivityDesc = `У ребёнка небольшой запас жизненной энергии. Он быстро устаёт, может казаться апатичным, вялым. Это не лень и не депрессия. Просто его «батарейка» маленькая. Он не может долго находиться в шумной среде, долго общаться, долго учиться. Ему нужно часто отдыхать. Важно не путать его усталость с нежеланием что-то делать. Он хочет, но не может.`;
        sensitivityAdvice = `Соблюдайте режим: ложиться спать в одно время, есть, гулять. После любых нагрузок – обязательный отдых. Не требуйте от него активности, когда он устал. Лучше скажите: «Я вижу, ты устал. Давай отдохнём, а потом доделаем». И никогда не говорите: «Что ты устал? Ты же ничего не делал!». Для него это звучит как «ты плохой, ты слабый».`;
        sensitivityStory = `Папа 9-летнего Димы считал его «лентяем». У Димы было 0 двоек (энергия на нуле). Мы объяснили: его ресурс ограничен, как у телефона с маленькой батарейкой. Ввели правило: после школы – 30 минут тишины, потом лёгкие дела. Дима перестал «лениться» – просто потому, что его перестали заставлять работать на износ. Папа сказал: «Я не знал, что усталость бывает не только от физической работы».`;
    } else {
        sensitivityType = 'средняя чувствительность и энергия';
        sensitivityDesc = `У ребёнка средний запас энергии и чувствительности. Он может выдерживать обычную нагрузку, но тоже нуждается в отдыхе. Не перегружайте его кружками и секциями. Следите за признаками усталости: капризы, зевота, рассеянность. Лучше профилактически давать отдых, чем потом лечить перегруз.`;
        sensitivityAdvice = `Создайте ритуал «тихого часа» после школы – 20–30 минут без гаджетов, без разговоров. Это поможет ему переключиться и восстановиться. И не стесняйтесь сами отдыхать рядом – вы покажете пример.`;
        sensitivityStory = `Мама 10-летнего Миши заметила, что он стал раздражительным. Оказалось, у него средняя энергия, а нагрузка была слишком высокой. Убрали один кружок, добавили час отдыха. Миша стал спокойнее. «Я просто не понимал, почему я злюсь. Оказывается, я уставал», – сказал он.`;
    }
    
    // ========== 2. ХАРАКТЕР (ЦИФРА 1) – КАК РЕАГИРУЕТ НА СТРЕСС ==========
    let characterType = '';
    let characterDesc = '';
    let characterAdvice = '';
    let characterStory = '';
    
    if (c[1] >= 4) {
        characterType = 'сильная воля, склонность к сопротивлению';
        characterDesc = `У ребёнка сильный, волевой характер. В стрессовой ситуации он не сдаётся, а бунтует. Он может спорить, грубить, хлопать дверью. Это не значит, что он вас не любит. Это значит, что он пытается защитить свои границы. Его девиз: «Не сломают». Но за этой броней часто скрывается ранимость. Он боится показать слабость.`;
        characterAdvice = `Не давите на него в конфликте. Не пытайтесь «сломать» его волю. Дайте время остыть. Скажите: «Я вижу, ты злишься. Давай поговорим через 10 минут». И обязательно вернитесь к разговору, когда оба успокоятся. Ему важно знать, что конфликт не разрушил вашу связь.`;
        characterStory = `Папа 12-летнего Димы жаловался, что сын «огрызается». У Димы 4 единицы характера. Мы предложили папе не вступать в перепалку, а говорить: «Я слышу, что ты злишься. Давай обсудим это, когда ты успокоишься». Дима начал уходить в свою комнату, а через 10 минут выходил и спокойно разговаривал. Папа сказал: «Оказывается, ему нужно просто время, чтобы остыть, а не наказание».`;
    } else if (c[1] <= 1) {
        characterType = 'мягкий характер, склонность замыкаться';
        characterDesc = `У ребёнка мягкий, неконфликтный характер. В стрессовой ситуации он не бунтует, а замыкается. Он может замолчать, уйти в себя, не отвечать на вопросы. Это не игнорирование, это защита. Ему страшно, он не знает, как выразить свои чувства, и просто «выключается». Не давите на него в такие моменты.`;
        characterAdvice = `Скажите тихо: «Я вижу, тебе сейчас трудно говорить. Я рядом, когда захочешь». Не требуйте немедленного ответа. Дайте ему время и безопасное пространство. И никогда не кричите на него – для мягкого ребёнка крик равносилен удару.`;
        characterStory = `Мама 9-летней Ани жаловалась, что дочка «уходит в себя» после ссор. У Ани 1 единица характера. Мы предложили маме не требовать немедленного разговора, а просто обнять и сказать: «Я люблю тебя. Когда будешь готова – поговорим». Через полчаса Аня сама подошла и рассказала, что её обидели в школе. Мама сказала: «Я поняла, что её молчание – не обида на меня, а защита».`;
    } else {
        characterType = 'умеренная воля, может и бунтовать, и замыкаться';
        characterDesc = `У ребёнка средний волевой стержень. В стрессовой ситуации он может и вспылить, и замолчать – зависит от обстоятельств и усталости. Важно не навешивать ярлыки («ты всегда грубишь», «ты вечно молчишь»), а каждый раз разбираться, что именно произошло.`;
        characterAdvice = `В конфликте задавайте открытые вопросы: «Что ты сейчас чувствуешь?», «Что тебя расстроило?». Не оценивайте, просто слушайте. И после конфликта обязательно возвращайтесь к тёплым отношениям – обнимите, скажите, что любите.`;
        characterStory = `Мама 11-летнего Миши заметила, что он то огрызается, то молчит. Оказалось, это зависело от усталости. Ввели правило: после школы – отдых, потом разговоры. Конфликтов стало меньше. «Я не понимал, почему я злюсь. Оказывается, я просто уставал», – сказал Миша.`;
    }
    
    // ========== 3. ТЕМПЕРАМЕНТ (ВЛИЯНИЕ НА ЭМОЦИИ) ==========
    let tempAdvice = '';
    let tempStory = '';
    if (childMatrix.temp >= 4) {
        tempAdvice = `У ребёнка горячий, холерический темперамент. Он переживает эмоции очень интенсивно – радость, гнев, страх, восторг. Всё на пределе. Он может закатить истерику из-за пустяка, а через 5 минут уже смеяться. Не считайте это «плохим характером». Это его природа. Ваша задача – не подавлять, а учить выражать эмоции экологично. «Можно топать ногами, но нельзя бить». И обязательно давайте ему физическую разрядку – спорт, активные игры.`;
        tempStory = `Папа 8-летнего Коли жаловался, что сын «взрывается». У Коли темперамент 5. Мы предложили папе не кричать в ответ, а сказать: «Я вижу, ты очень зол. Давай побьём подушку или попрыгаем». Коля попрыгал, успокоился и через 5 минут уже обнимал папу. «Я понял, что его гнев – это просто энергия, которой нужен выход», – сказал папа.`;
    } else if (childMatrix.temp <= 1) {
        tempAdvice = `У ребёнка спокойный, флегматичный темперамент. Он редко показывает эмоции бурно. Вы можете не понять, рад он или огорчён. Это не значит, что он «бесчувственный». Просто он проживает эмоции внутри. Не требуйте от него бурных проявлений. Его тихая улыбка или лёгкое пожатие плеча – это его способ говорить «я люблю», «мне грустно». Учитесь читать его невербальные сигналы. И никогда не говорите: «Что ты молчишь как рыба?». Для него это больно.`;
        tempStory = `Мама 10-летней Сони жаловалась, что дочь «не проявляет эмоции». У Сони темперамент 1. Мы предложили маме не требовать слов, а спрашивать: «Ты сейчас рада? Покажи жестом». Соня стала кивать или качать головой. Мама научилась понимать её без слов. «Оказывается, она очень чувствительная, просто не кричит об этом», – сказала мама.`;
    } else {
        tempAdvice = `У ребёнка умеренный темперамент. Он может и бурно выражать эмоции, и быть спокойным. Учитесь замечать, когда он на пределе, а когда просто устал. И не требуйте от него быть «ровным» всегда – это невозможно.`;
        tempStory = `Мама 9-летнего Димы заметила, что он то весёлый, то грустный. Оказалось, это зависело от усталости. Ввели правило: после школы – отдых, потом общение. Настроение выровнялось. «Я понял, что когда я устаю, я становлюсь злым. Теперь я отдыхаю, и всё нормально», – сказал Дима.`;
    }
    
    // ========== 4. САМООЦЕНКА И ВЛИЯНИЕ РОДИТЕЛЯ ==========
    let parentInfluence = '';
    let selfEsteemNote = '';
    
    if (p[2] <= 1) {
        parentInfluence = `У вас самих невысокий запас энергии. Вам может быть сложно понять его усталость, потому что вы устаёте по-другому. Не обесценивайте его состояние фразами «Что ты устал? Я больше работаю». Его усталость реальна, даже если вам кажется, что он «ничего не делал». Вместо сравнения скажите: «Я понимаю, ты устал. Давай отдохнём вместе». Это снизит напряжение и укрепит доверие.`;
    } else if (p[2] >= 4) {
        parentInfluence = `У вас высокий запас энергии, и вам может быть трудно понять, почему он быстро выдыхается. Не требуйте от него вашего темпа. Ваш ресурс – не норма, а исключение. Снизьте ожидания, давайте ему больше времени на отдых. И не говорите: «Я же могу, значит и ты должен». Это не мотивирует, а унижает.`;
    }
    
    if (parentMatrix.temp >= 4 && childMatrix.temp <= 1) {
        parentInfluence += ` Вы очень эмоциональны, а ребёнок – спокоен. Ваши бурные реакции могут его пугать. Он не понимает, почему вы кричите, и замыкается. Учитесь выражать чувства мягче. Если вы злитесь, скажите: «Я злюсь, но это не из-за тебя. Мне нужно 5 минут успокоиться». Ребёнок перестанет бояться и начнёт вам доверять.`;
    } else if (parentMatrix.temp <= 1 && childMatrix.temp >= 4) {
        parentInfluence += ` Вы спокойны, а ребёнок – эмоциональный. Вам может казаться, что он «истерит» из-за пустяков. Но для него это не пустяк. Не обесценивайте его чувства фразами «не бери в голову», «это ерунда». Признайте его эмоцию: «Я вижу, ты очень злишься. Расскажи, что случилось». Это поможет ему успокоиться.`;
    }
    
    if (c[2] >= 3 && c[1] <= 1 && childMatrix.temp >= 4) {
        selfEsteemNote = `Комбинация высокой чувствительности, мягкого характера и горячего темперамента – очень сложная. Ребёнок остро всё переживает, но не умеет защищаться, а эмоции выплёскивает бурно. Ему особенно нужна ваша поддержка и безопасное пространство. Не наказывайте за «истерики», учите безопасно выплёскивать гнев (бить подушку, рвать бумагу, кричать в лесу). И обязательно хвалите за попытки справиться.`;
    } else if (c[2] <= 1 && c[1] >= 4 && childMatrix.temp <= 1) {
        selfEsteemNote = `Комбинация низкой энергии, сильного характера и спокойного темперамента. Ребёнок быстро устаёт, но не показывает этого, потому что стесняется «слабости». Он может довести себя до изнеможения. Ваша задача – замечать его усталость раньше, чем он сам. И мягко предлагать отдых: «Я вижу, ты устал. Давай отдохнём, а потом продолжим».`;
    }
    
    // ========== 5. ИТОГОВАЯ ЖИВАЯ КОНСУЛЬТАЦИЯ ==========
    let fullText = `
        <div style="font-size:1rem; line-height:1.7;">
            <p><strong>💛 Эмоциональный язык ребёнка: ${sensitivityType}</strong><br>
            ${sensitivityDesc}</p>
            
            <p><strong>Как помочь ребёнку с его чувствительностью:</strong><br>
            ${sensitivityAdvice}</p>
            
            <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>📖 Пример: ${sensitivityStory}</strong></p>
            </div>
            
            <p><strong>🎭 Как он реагирует на стресс: ${characterType}</strong><br>
            ${characterDesc}</p>
            
            <p><strong>Как вести себя в конфликте:</strong><br>
            ${characterAdvice}</p>
            
            <div style="background: rgba(212,175,55,0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>📖 Пример: ${characterStory}</strong></p>
            </div>
            
            <div style="background: rgba(168, 218, 220, 0.15); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>🌡️ Влияние темперамента</strong><br>${tempAdvice}</p>
                <p><em>Пример: ${tempStory}</em></p>
            </div>
            
            ${selfEsteemNote ? `
            <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>⚠️ Особое сочетание качеств</strong><br>${selfEsteemNote}</p>
            </div>` : ''}
            
            ${parentInfluence ? `
            <div style="background: rgba(255, 107, 107, 0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>💡 Важный совет для вас, родители</strong><br>${parentInfluence}</p>
            </div>` : ''}
            
            <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 12px; margin: 15px 0;">
                <p><strong>🕯️ Ритуал на сегодня</strong><br>
                Сядьте напротив ребёнка. Зажгите свечу. Спросите: «Какое чувство у тебя сейчас самое сильное? Назови его одним словом». Если он не может – покажите карточки с эмоциями или нарисуйте смайлики. Просто назвать чувство – уже облегчение. Потом скажите: «Я рядом. Ты в безопасности». Обнимитесь.
                </p>
            </div>
            
            <div style="background: rgba(255, 215, 0, 0.08); padding: 15px; border-radius: 12px; border-left: 4px solid var(--gold); margin: 15px 0;">
                <p><strong>🌟 Что запомнить навсегда</strong><br>
                «Эмоции ребёнка – не манипуляция, не слабость, не бунт. Это его язык. Ваша задача – не переводить его на свой, а выучить его. Когда ребёнок плачет, он не говорит «я хочу тебя достать». Он говорит: «Мне нужна твоя поддержка». Когда он злится, он говорит: «Мои границы нарушены». Когда он молчит, он говорит: «Мне страшно, я не знаю, как сказать». Услышьте его. И тогда он услышит вас».</p>
            </div>
        </div>
    `;
    
    return fullText;
}
// Убедитесь, что остальные функции (formatHarmonyZone, formatTensionZone, formatGrowthZone, getParentTraps, getGeneralPortrait) уже есть в вашем коде.
// Если нет – возьмите их из предыдущих сообщений.


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
    console.log('showChildMatrixSection вызвана');
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

    // Показываем индикатор загрузки
    const btn = document.querySelector('.btn-gold[onclick="downloadPaidPDF()"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Генерация PDF...';
    }

    try {
        // 1. Собираем данные квадрата (визуал + описания)
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

        // 2. Собираем синтезы
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

        // 3. Прогнозы (как HTML, сервер вставит как есть)
        const forecasts = {
            yearly: getYearlyForecast(data, userName),
            routine: getDailyRoutine(data, userName),
            money: getMoneyInsights(data, userName)
        };
// ... после сборки forecasts ...

// 5. Лунный день (берём из DOM, т.к. он уже отрендерен)
const moonBlock = document.getElementById('moon-block');
const moonPhaseName = document.getElementById('moon-phase-name')?.textContent || '';
const moonDescription = document.getElementById('moon-description')?.innerHTML || '';

// 6. Талисманы
const luckyNumber = document.getElementById('lucky-number')?.textContent || '';
const luckyDay = document.getElementById('lucky-day')?.textContent || '';
const luckyColor = document.getElementById('lucky-color')?.textContent || '';
const luckyStone = document.getElementById('lucky-stone')?.textContent || '';
const luckyElement = document.getElementById('lucky-element')?.textContent || '';
const luckyPlanet = document.getElementById('lucky-planet')?.textContent || '';

// Добавляем в payload
const payload = {
    userName,
    birthDate,
    matrix: matrixCells,
    lifePath: data.master || data.lp,
    nameNum,
    syntheses,
    forecasts,
    // новые поля
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
        // 4. Отправляем на сервер
        const response = await fetch('http://localhost:3000/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName,
                birthDate,
                matrix: matrixCells,
                lifePath: data.master || data.lp,
                nameNum,
                syntheses,
                forecasts
            })
        });

        if (!response.ok) throw new Error('Ошибка сервера');

        // 5. Скачиваем PDF
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
        alert('Не удалось создать PDF. Убедитесь, что сервер запущен (http://localhost:3000).');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Скачать PDF-отчёт';
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
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'attempts-counter';
        counter.className = 'attempts-counter';
        document.body.appendChild(counter);
    }
    counter.innerHTML = `<i class="fa-solid fa-calculator"></i> Осталось расчётов: ${remaining} / 4`;
    if (remaining === 0) counter.remove();
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
