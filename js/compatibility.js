/* ============================================
   ГЛУБИННЫЙ АНАЛИЗ СОВМЕСТИМОСТИ
   ============================================ */
function deepMatrixCompatibility(dataP1, dataP2, name1, name2) {
    let html = '';
    const c1 = dataP1.c;
    const c2 = dataP2.c;

    // Функция для получения ключа типа различия
    function getDiffKey(name, v1, v2) {
        const diff = Math.abs(v1 - v2);
        if (v1 === v2) {
            if (v1 <= 1) return `${name}_общаяСлабость`;
            if (v1 >= 4) return `${name}_общаяЧрезмерность`;
            return `${name}_общаяСередина`;
        }
        if (diff === 1) return `${name}_лёгкоеДополнение`;
        if (diff === 2) return `${name}_заметноеРасхождение`;
        return `${name}_сильныйДисбаланс`;
    }

    // Вспомогательная функция для получения текста
    function getText(key) {
        if (typeof deepCompatTexts !== 'undefined' && deepCompatTexts[key]) {
            return deepCompatTexts[key];
        }
        return null;
    }

    html += `<div style="margin-top:30px; text-align:left;">`;
    html += `<h4 style="color:var(--gold); margin-bottom:15px;">🔍</h4>`;

    // Ячейки, которые будем сравнивать
    const cells = [
        { name: 'Характер', num: 1 },
        { name: 'Энергия', num: 2 },
        { name: 'Интерес', num: 3 },
        { name: 'Здоровье', num: 4 },
        { name: 'Логика', num: 5 },
        { name: 'Труд', num: 6 },
        { name: 'Удача', num: 7 },
        { name: 'Долг', num: 8 },
        { name: 'Память', num: 9 }
    ];

    cells.forEach(cell => {
        const v1 = c1[cell.num] || 0;
        const v2 = c2[cell.num] || 0;
        const key = getDiffKey(cell.name, v1, v2);
        const text = getText(key);
        if (text) {
            html += `<p><strong>${cell.name} (${v1} / ${v2}):</strong> <span style="color:var(--gold);">${text.title}</span><br>${text.description}</p>`;
        } else {
            html += `<p><strong>${cell.name}:</strong> ${v1} / ${v2} – подробное описание временно недоступно.</p>`;
        }
    });

    // Строки (аналогично)
    html += `<h5 style="color:var(--purple-light); margin-top:20px;">Сравнение жизненных линий</h5>`;
    const rows = [
        { name: 'Цель', v1: dataP1.goal, v2: dataP2.goal },
        { name: 'Семья', v1: dataP1.family, v2: dataP2.family },
        { name: 'Привычки', v1: dataP1.habits, v2: dataP2.habits },
        { name: 'Самооценка', v1: dataP1.self, v2: dataP2.self },
        { name: 'Быт', v1: dataP1.life, v2: dataP2.life },
        { name: 'Талант', v1: dataP1.talent, v2: dataP2.talent },
        { name: 'Дух', v1: dataP1.spirit, v2: dataP2.spirit },
        { name: 'Темперамент', v1: dataP1.temp, v2: dataP2.temp }
    ];
    rows.forEach(row => {
        const key = getDiffKey(row.name, row.v1, row.v2);
        const text = getText(key);
        if (text) {
            html += `<p><strong>${row.name} (${row.v1} / ${row.v2}):</strong> <span style="color:var(--gold);">${text.title}</span><br>${text.description}</p>`;
        } else {
            html += `<p><strong>${row.name}:</strong> ${row.v1} / ${row.v2} – подробное описание временно недоступно.</p>`;
        }
    });

    html += `</div>`;
    return html;
}

/* ============================================
   ГЕНЕРАЦИЯ HTML ДЛЯ МИНИ-МАТРИЦЫ
   ============================================ */
function renderMatrixHTML(data, title, name, genderClass) {
    const getS = (n) => {
        let s = "";
        for (let k = 0; k < (data.c[n] || 0); k++) s += n;
        return s || "—";
    };

    const cells = [
        { label: 'Характер', id: 'char', value: getS(1) },
        { label: 'Здоровье', id: 'health', value: getS(4) },
        { label: 'Удача', id: 'luck', value: getS(7) },
        { label: 'Цель', id: 'goal', value: data.goal, isSummary: true },
        { label: 'Энергия', id: 'energy', value: getS(2) },
        { label: 'Логика', id: 'logic', value: getS(5) },
        { label: 'Долг', id: 'duty', value: getS(8) },
        { label: 'Семья', id: 'family', value: data.family, isSummary: true },
        { label: 'Интерес', id: 'interest', value: getS(3) },
        { label: 'Труд', id: 'work', value: getS(6) },
        { label: 'Память', id: 'memory', value: getS(9) },
        { label: 'Привычки', id: 'habits', value: data.habits, isSummary: true },
        { label: 'Самооценка', id: 'self', value: data.self, isSummary: true },
        { label: 'Быт', id: 'life', value: data.life, isSummary: true },
        { label: 'Талант', id: 'talent', value: data.talent, isSummary: true },
        { label: 'Дух', id: 'spirit', value: data.spirit, isSummary: true },
        { label: 'Темперамент', id: 'temp', value: data.temp, isSummary: false }
    ];

    let html = `<div class="compat-matrix-single ${genderClass}">
        <h5>${title}${name ? ': ' + escapeHTML(name) : ''}</h5>
        <div class="matrix-grid matrix-compact" style="margin-top:0;">`;

    cells.forEach(cell => {
        html += `<div class="matrix-cell ${cell.isSummary ? 'summary' : ''} ${cell.id === 'temp' ? 'temp' : ''}"
                     data-cell="${cell.id}"
                     data-value="${cell.value}"
                     data-gender="${genderClass}">
            <span class="cell-title">${cell.label}</span>
            <span class="cell-value">${cell.value}</span>
        </div>`;
    });

    html += `</div></div>`;
    return html;
}

/* ============================================
   РАСЧЁТ СОВМЕСТИМОСТИ ПАРТНЁРОВ (PRO)
   ============================================ */
async function calculateCompatReal() {


    const d1 = document.getElementById('dateP1').value;
    const d2 = document.getElementById('dateP2').value;
    
    const n1 = document.getElementById('nameP1').value.trim();
    const n2 = document.getElementById('nameP2').value.trim();
    
    if (!d1 || !d2) return alert("Пожалуйста, введите обе даты!");
    
    document.getElementById('result-compat').style.opacity = '0';
    document.getElementById('loader-compat').style.display = 'flex';
    startMagicAnimation('magic-numbers-compat');
    
    const auditCompat = document.getElementById('audit-compat');
if (auditCompat) auditCompat.style.display = 'none';
    
    setTimeout(() => {
        const gsn = d => {
            let s = 0;
            let st = d.replace(/-/g, '');
            for (let c of st) s += parseInt(c);
            while (s > 9) s = s.toString().split('').reduce((a, b) => +a + (+b), 0);
            return s;
        };
        
        let t = gsn(d1) + gsn(d2);
        while (t > 9) t = t.toString().split('').reduce((a, b) => +a + (+b), 0);
        
        const dataP1 = calculateMatrixData(d1);
        const dataP2 = calculateMatrixData(d2);
        
        document.getElementById('matrices-compare-container').innerHTML = `
            <div class="compat-matrices-wrapper">
               ${renderMatrixHTML(dataP1, "Мужчина", n1, 'male')}
               ${renderMatrixHTML(dataP2, "Женщина", n2, 'female')}
            </div>`;
        
        // Активируем сравнение ячеек
setTimeout(() => {
    const matrixCells = document.querySelectorAll('.compat-matrix-single .matrix-cell');
    const legend = document.createElement('div');
    legend.className = 'legend-box';
    legend.innerHTML = `
    <span><span class="legend-color" style="background:#4caf50;"></span> Гармония (0–1) — схожие энергии, лёгкое взаимопонимание</span>
    <span><span class="legend-color" style="background:#ffc107;"></span> Нейтрально (2) — требует осознанного внимания</span>
    <span><span class="legend-color" style="background:#f44336;"></span> Зона роста (3+) — здесь скрыт потенциал для развития пары</span>
`;
    document.getElementById('matrices-compare-container').appendChild(legend);
    legend.style.display = 'block';
    
const instructions = document.createElement('p');
instructions.style.cssText = 'text-align:center; color:#aaa; font-size:0.85rem; margin:10px 0 0;';
instructions.textContent = 'Нажмите на любую ячейку матрицы, чтобы увидеть подробную расшифровку совместимости';
document.getElementById('matrices-compare-container').appendChild(instructions);
   
    matrixCells.forEach(cell => {
        cell.addEventListener('click', function() {
            const cellId = this.dataset.cell;
            const value = parseInt(this.dataset.value) || 0;
            const gender = this.dataset.gender;
            const oppositeGender = gender === 'male' ? 'female' : 'male';
            const otherCell = document.querySelector(`.compat-matrix-single.${oppositeGender} .matrix-cell[data-cell="${cellId}"]`);

            // Сброс подсветки
            matrixCells.forEach(c => c.classList.remove('match-high','match-medium','match-low','match-neutral'));

            if (!otherCell) return;

            const otherValue = parseInt(otherCell.dataset.value) || 0;
            const diff = Math.abs(value - otherValue);

            let cls = 'match-high';
            if (diff >= 3) cls = 'match-low';
            else if (diff === 2) cls = 'match-medium';
            // diff 0-1 остаётся match-high

            this.classList.add(cls);
            otherCell.classList.add(cls);

            // Показать всплывающую подсказку
            const title = this.querySelector('.cell-title').textContent;
            const tooltip = document.getElementById('compat-tooltip');
            if (tooltip) {
                tooltip.innerHTML = `<strong>${title}</strong>: ${value} / ${otherValue} — ${cls === 'match-high' ? 'совместимы' : cls === 'match-medium' ? 'умеренно' : 'конфликтно'}`;
                tooltip.style.display = 'block';
            }
        });
    });
}, 100);
        
        if (n1 || n2) {
            const safeName1 = escapeHTML(n1);
            const safeName2 = escapeHTML(n2);
            document.getElementById('compat-names').innerHTML = `${safeName1 || 'Мужчина'} & ${safeName2 || 'Женщина'}`;
        }
        
        const desc = compatibilityDescriptions[t] || compatibilityDescriptions[9];
document.getElementById('compat-number').innerText = t;

// --- БЕСПЛАТНО: Суть союза ---
const freeText = `
    <h4 style="color:var(--gold); font-size:1.8rem; text-align:center;">${desc.title} — Число ${t}</h4>
    <p style="text-align:center; font-style:italic;">${desc.essence}</p>
`;
document.getElementById('compat-free-text').innerHTML = freeText;

// --- ПЛАТНО: весь детальный разбор ---
const deepHtml = deepMatrixCompatibility(dataP1, dataP2, n1, n2);

let karmicHtml = '';
if (typeof karmicLessons !== 'undefined' && karmicLessons[t]) {
    karmicHtml = `
        <div class="insight-block" style="margin-top:30px;">
            <h4 style="color:var(--gold);">🌀</h4>
            <h5 style="color:var(--purple-light); margin-bottom:10px;">${karmicLessons[t].title}</h5>
            <p>${karmicLessons[t].description}</p>
        </div>
    `;
}

const premiumHTML = `
    <details class="money-details">
        <summary>⚡ Энергетика и Динамика</summary>
        <div class="money-content"><p>${desc.dynamics}</p></div>
    </details>
    
    <details class="money-details">
        <summary>🔥 Секс и Чувства</summary>
        <div class="money-content"><p>${desc.sex}</p></div>
    </details>
    
    <details class="money-details">
        <summary>💰 Финансовая Карма</summary>
        <div class="money-content"><p>${desc.money}</p></div>
    </details>
    
    <details class="money-details">
        <summary>⚠️ Зона Конфликта</summary>
        <div class="money-content"><p>${desc.conflict}</p></div>
    </details>
    
    <details class="money-details">
        <summary>🔑 Магический Ключ</summary>
        <div class="money-content"><p>${desc.advice}</p></div>
    </details>
    
   
    
    ${karmicHtml ? `
    <details class="money-details">
        <summary>🌀 Кармический Урок Вашей Пары</summary>
        <div class="money-content">${karmicHtml}</div>
    </details>
    ` : ''}
    
    ${deepHtml ? `
    <details class="money-details">
        <summary>🔍 Глубинный анализ психоматриц</summary>
        <div class="money-content">${deepHtml}</div>
    </details>
    ` : ''}
     ${desc.verdict ? `
    <details class="money-details">
        <summary>🌟 Итог</summary>
        <div class="money-content"><p>${desc.verdict}</p></div>
    </details>
    ` : ''}
    
`;

document.getElementById('compat-premium-content').innerHTML = premiumHTML;
document.getElementById('compat-premium-container').style.display = 'block';

if (premiumAccess) {
    document.getElementById('compat-lock-overlay').style.display = 'none';
    document.getElementById('compat-premium-content').classList.remove('premium-blur');
} else {
    document.getElementById('compat-lock-overlay').style.display = 'flex';
    document.getElementById('compat-premium-content').classList.add('premium-blur');
}
     
        
        document.getElementById('loader-compat').style.display = 'none';
        document.getElementById('result-compat').style.opacity = '1';
        window.revealNewElements(document.getElementById('result-compat'));
        const pdfBtn = document.getElementById('download-compat-pdf');
        if (pdfBtn) pdfBtn.style.display = 'inline-block';
        stopMagicAnimation('magic-numbers-compat');
    }, 3000); // один таймер, всё выполняется последовательно
}

// Экспорт для ленивого загрузчика
window.calculateCompatReal = calculateCompatReal;
window._compatLoaded = true;