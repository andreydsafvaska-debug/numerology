// Вспомогательная функция для определения уровня (low/medium/high)
function getLevel(value) {
    if (value <= 1) return 'low';
    if (value >= 3) return 'high';
    return 'medium';
}

function getMirrorLevel(value) {
    if (value === 0) return 0;
    if (value <= 2) return 1;
    if (value <= 4) return 3;
    if (value <= 6) return 5;
    return 7;
}

// Главная функция расчёта личного денежного кода
async function calculateMoneyPersonal() {
    
const auditPersonal = document.getElementById('audit-personal');
if (auditPersonal) auditPersonal.style.display = 'none';
    
    const name = document.getElementById('moneyName').value.trim();
    const date = document.getElementById('moneyDate').value;

    if (!date) return alert("Введите дату рождения!");

    // Показываем лоадер, скрываем результат и аудит-блок
    document.getElementById('result-money').style.display = 'none';
    document.getElementById('loader-money').style.display = 'flex';
    const auditBlock = document.getElementById('audit-block');
    if (auditBlock) auditBlock.style.display = 'none';

    // Показываем кнопку PDF, если есть доступ
    if (premiumAccess) {
        const pdfBtn = document.getElementById('download-money-pdf');
        if (pdfBtn) pdfBtn.style.display = 'inline-block';
    }

    setTimeout(() => {
        // --- 1. Считаем матрицу и Число Жизненного Пути ---
        const matrix = calculateMatrixData(date);
        const lpData = calculateLifePath(date);
        const lifePath = lpData.master || lpData.base;

        // --- 2. Собираем ключи для блоков ---
        // Блок А: Главный портрет
        const keyA = `${lifePath}-${matrix.c[1]}-${matrix.c[8]}`;
        // Блок Б: Слепые зоны и Сильные стороны
        const blindKeys = [];
        for (let i = 1; i <= 9; i++) if (matrix.c[i] === 0) blindKeys.push(`blind-${i}`);
        const growthKeys = [];
        for (let i = 1; i <= 9; i++) if (matrix.c[i] >= 3) growthKeys.push(`growth-${i}`);

        // Блок В: Интегральный портрет
        const pairsV = [
            { pair: 'pair1', a: matrix.c[1], b: matrix.c[2], name: 'Характер + Энергия' },
            { pair: 'pair2', a: matrix.c[8], b: matrix.c[6], name: 'Долг + Труд' },
            { pair: 'pair3', a: matrix.c[5], b: matrix.c[7], name: 'Логика + Удача' },
            { pair: 'pair4', a: matrix.goal, b: matrix.self, name: 'Цель + Самооценка' }
        ];

        // Блок Г: Архетип
        const keyG = `${getLevel(matrix.c[2])}-${getLevel(matrix.habits)}`;
        // Блок Д: Темп роста
        const keyD = `${lifePath}-${getLevel(matrix.c[7])}`;
        // Блок Е: Куда вложить
        const keyE = `${getLevel(matrix.goal)}-${getLevel(matrix.c[5])}`;
        // Блок Ж: Аффирмации
        const keyZh = keyG;

        // --- 3. Извлекаем готовые тексты из баз данных ---
        const textA = (typeof moneyPath !== 'undefined' && moneyPath[keyA]) || 'Описание готовится...';
        const textG = (typeof moneyArchetype !== 'undefined' && moneyArchetype[keyG]) || '';
        const textD = (typeof moneyTempo !== 'undefined' && moneyTempo[keyD]) || '';
        const textE = (typeof moneyInvest !== 'undefined' && moneyInvest[keyE]) || '';

        // --- Добавляем таблицу Пифагора (сразу после setTimeout) ---
const matrixHTML = renderMatrixHTML(matrix, 'Ваша финансовая матрица', name);
document.getElementById('money-matrix-container').innerHTML = matrixHTML;
        // --- 4. Собираем HTML с раскрывающимися карточками ---
        document.getElementById('money-user-title').innerText = `Денежный код: ${name || 'Гость'}`;

        
        
                // --- Зеркало души (moneyMirror) ---
      const mirrorKey = `${lifePath}-${getMirrorLevel(matrix.c[1])}-${getMirrorLevel(matrix.c[8])}`;
const mirrorText = (typeof moneyMirror !== 'undefined' && moneyMirror[mirrorKey])
    ? moneyMirror[mirrorKey]
    : 'Денежная суть этой души уникальна и раскрывается постепенно.';
        document.getElementById('money-mirror-text').innerText = mirrorText;
        
        
        
        const dangerText = (typeof moneyDanger !== 'undefined' && moneyDanger[keyA])
    ? moneyDanger[keyA]
    : '⚠️ Помни: главная опасность — забыть о балансе между заработком и жизнью.';

        
        // Блок Б
        let textB = '';
        if (blindKeys.length > 0) {
            textB += '<h5 style="color: var(--gold);">Слепые зоны (чего не хватает)</h5>';
            blindKeys.forEach(k => { if (typeof moneyBlindGrowth !== 'undefined' && moneyBlindGrowth[k]) textB += `<p><strong>${k.replace('blind-','Ячейка ')}:</strong> ${moneyBlindGrowth[k]}</p>`; });
        }
        if (growthKeys.length > 0) {
            textB += '<h5 style="color: var(--gold);">Сильные стороны (гипертрофия)</h5>';
            growthKeys.forEach(k => { if (typeof moneyBlindGrowth !== 'undefined' && moneyBlindGrowth[k]) textB += `<p><strong>${k.replace('growth-','Ячейка ')}:</strong> ${moneyBlindGrowth[k]}</p>`; });
        }
        if (!textB) textB = '<p>Явных слепых зон и гипертрофий нет.</p>';

        // Блок В
        let textV = '';
        pairsV.forEach(p => {
            const levelA = getLevel(p.a), levelB = getLevel(p.b), key = `${p.pair}-${levelA}-${levelB}`;
            if (typeof moneySynthesisPairs !== 'undefined' && moneySynthesisPairs[key]) textV += `<p><strong>${p.name}:</strong> ${moneySynthesisPairs[key]}</p>`;
        });

       

        // Блок Ж
        let textZh = '';
        if (typeof moneyAffirmations !== 'undefined' && moneyAffirmations[keyZh]) moneyAffirmations[keyZh].forEach(aff => textZh += `<p style="font-style:italic;">«${aff}»</p>`);
        else textZh = '<p>Я позволяю себе богатство. Я достоин изобилия. Деньги приходят ко мне легко и свободно.</p>';
        // --- ПЛАТНАЯ ЧАСТЬ ---
        let premiumHTML = '';
        premiumHTML += `<details class="money-details"><summary>🧬 Ваш финансовый портрет</summary><div class="money-content">${textA}</div></details>`;
        premiumHTML += `<details class="money-details"><summary>⚠️ Финансовый стоп-кран</summary><div class="money-content">${dangerText}</div></details>`;
        premiumHTML += `<details class="money-details"><summary>🌀 Слепые зоны и Сильные стороны</summary><div class="money-content">${textB}</div></details>`;
        premiumHTML += `<details class="money-details"><summary>🔗 Интегральный портрет</summary><div class="money-content">${textV}</div></details>`;
        premiumHTML += `<details class="money-details"><summary>🎭 Ваш денежный архетип</summary><div class="money-content">${textG}</div></details>`;
        premiumHTML += `<details class="money-details"><summary>⏳ Ваш темп роста и удача</summary><div class="money-content">${textD}</div></details>`;
        premiumHTML += `<details class="money-details"><summary>💼 Куда вложить капитал</summary><div class="money-content">${textE}</div></details>`;
        premiumHTML += `<details class="money-details"><summary>✨ Ваши персональные аффирмации</summary><div class="money-content">${textZh}</div></details>`;

        document.getElementById('premium-money-content').innerHTML = premiumHTML;
        document.getElementById('premium-money-container').style.display = 'block';

        if (premiumAccess) {
            document.getElementById('premium-lock-overlay').style.display = 'none';
            document.getElementById('premium-money-content').classList.remove('premium-blur');
        } else {
            document.getElementById('premium-lock-overlay').style.display = 'flex';
            document.getElementById('premium-money-content').classList.add('premium-blur');
        }
        // Показываем результат
        document.getElementById('loader-money').style.display = 'none';
        document.getElementById('result-money').style.display = 'block';
        window.revealNewElements(document.getElementById('result-money'));
    }, 1000);
}

async function calculateMoneyPair() {
    
    const auditPair = document.getElementById('audit-pair');
if (auditPair) auditPair.style.display = 'none';
    
    const name1 = document.getElementById('moneyName1').value.trim() || 'Партнёр 1';
    const date1 = document.getElementById('moneyDate1').value;
    const name2 = document.getElementById('moneyName2').value.trim() || 'Партнёр 2';
    const date2 = document.getElementById('moneyDate2').value;

    if (!date1 || !date2) return alert("Введите даты обоих партнёров!");

    document.getElementById('result-money-pair').style.display = 'none';
    document.getElementById('loader-money-pair').style.display = 'flex';

    setTimeout(() => {
        const matrix1 = calculateMatrixData(date1);
        const matrix2 = calculateMatrixData(date2);
        const lp1 = calculateLifePath(date1).master || calculateLifePath(date1).base;
        const lp2 = calculateLifePath(date2).master || calculateLifePath(date2).base;

        const getLevel = (val) => {
            if (val <= 2) return 'low';
            if (val >= 5) return 'high';
            return 'medium';
        };

        const sortedLPs = [lp1, lp2].sort((a,b) => a - b);
        const lpKey = sortedLPs[0] + '-' + sortedLPs[1];

        const char1 = getLevel(matrix1.c[1]), char2 = getLevel(matrix2.c[1]);
        const duty1 = getLevel(matrix1.c[8]), duty2 = getLevel(matrix2.c[8]);
        const pairChar = getLevel(Math.max(matrix1.c[1], matrix2.c[1]));
        const pairDuty = getLevel(Math.max(matrix1.c[8], matrix2.c[8]));
        const keyDuty = pairDuty;

        // --- РЕНДЕР МАТРИЦ ---
        const matrixHTML1 = renderMatrixHTML(matrix1, 'Партнёр 1', name1);
        const matrixHTML2 = renderMatrixHTML(matrix2, 'Партнёр 2', name2);
        document.getElementById('pair-matrices-container').innerHTML = `
            <div class="pair-matrices">
                <div class="pair-matrix-wrapper">${matrixHTML1}</div>
                <div class="pair-matrix-wrapper">${matrixHTML2}</div>
            </div>
        `;

       
               // ===== БЕСПЛАТНАЯ ЧАСТЬ =====
        let html = '';
        html += `<h3 class="section-title">🧬 Ваша денежная ДНК</h3>`;
        html += buildPairBlock('Зеркало союза', moneyPairMirror[lpKey] || 'Уникальный союз.', true );

        // ===== ПЛАТНАЯ ЧАСТЬ =====
        let pairPremiumHTML = '';
        pairPremiumHTML += `<h3 class="section-title">💞 Динамика финансовых отношений</h3>`;

        // Финансовые роли
        const role1 = moneyPairCore?.roles?.[char1 + '-' + duty1] || 'Роль не определена';
        const role2 = moneyPairCore?.roles?.[char2 + '-' + duty2] || 'Роль не определена';
        pairPremiumHTML += buildPairBlock(`👤 ${name1} <span style="font-size:0.8rem;color:#aaa;">(Воля: ${matrix1.c[1]}, Долг: ${matrix1.c[8]})</span>`, role1, false);
        pairPremiumHTML += buildPairBlock(`👤 ${name2} <span style="font-size:0.8rem;color:#aaa;">(Воля: ${matrix2.c[1]}, Долг: ${matrix2.c[8]})</span>`, role2, false);

        // Интегральный портрет пары
        pairPremiumHTML += buildPairBlock('📊 Интегральный портрет пары', moneyPairCore?.portrait?.[pairChar + '-' + pairDuty] || 'Портрет готовится.', false);

        // Денежная совместимость
        pairPremiumHTML += buildPairBlock('💔 Денежная совместимость', `
            <p><strong>${name1}:</strong> ${moneyPairCore?.compatibility?.[lp1] || '—'}</p>
            <p><strong>${name2}:</strong> ${moneyPairCore?.compatibility?.[lp2] || '—'}</p>
        `, false);

        // Секция 3
        pairPremiumHTML += `<h3 class="section-title">🚀 Ваш план действий</h3>`;
        pairPremiumHTML += buildPairBlock('🎭 Совместный архетип', moneyPairCore?.archetype?.[pairChar + '-' + pairDuty] || 'Архетип готовится.', false);
        pairPremiumHTML += buildPairBlock('⚠️ Главная опасность', moneyPairCore?.danger?.[pairChar + '-' + pairDuty] || 'Берегите баланс.', false);
        pairPremiumHTML += buildPairBlock('💰 Рекомендации по бюджету', moneyPairCore?.budget?.[pairChar + '-' + pairDuty] || 'Рекомендации готовятся.', false);
        pairPremiumHTML += buildPairBlock('📋 Идеальная стратегия', moneyPairCore?.strategy?.[keyDuty] || 'Стратегия готовится.', false);

        // Вставляем в контейнеры
        document.getElementById('pair-blocks-container').innerHTML = html;
        document.getElementById('pair-premium-content').innerHTML = pairPremiumHTML;
        document.getElementById('pair-premium-container').style.display = 'block';

        if (premiumAccess) {
            document.getElementById('pair-lock-overlay').style.display = 'none';
            document.getElementById('pair-premium-content').classList.remove('premium-blur');
        } else {
            document.getElementById('pair-lock-overlay').style.display = 'flex';
            document.getElementById('pair-premium-content').classList.add('premium-blur');
        }
        document.getElementById('pair-blocks-container').innerHTML = html;

        document.getElementById('loader-money-pair').style.display = 'none';
        document.getElementById('result-money-pair').style.display = 'block';
        if (premiumAccess) {
    const pdfBtn = document.getElementById('download-money-pair-pdf');
    if (pdfBtn) pdfBtn.style.display = 'inline-block';
}
        window.revealNewElements(document.getElementById('result-money-pair'));
    }, 1000);
}

function buildPairBlock(title, content, open = false) {
    const openAttr = open ? 'open' : '';
    return `
        <details class="money-details" ${openAttr}>
            <summary>${title}</summary>
            <div class="money-content">${content}</div>
        </details>
    `;
}

function buildPairBlock(title, content, open = false) {
    const openAttr = open ? 'open' : '';
    return `
        <details class="money-details" ${openAttr}>
            <summary>${title}</summary>
            <div class="money-content">${content}</div>
        </details>
    `;
}