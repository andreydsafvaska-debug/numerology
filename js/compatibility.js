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
    html += `<h4 style="color:var(--gold); margin-bottom:15px;">🔍 Глубинный анализ психоматриц</h4>`;

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
   РАСЧЁТ СОВМЕСТИМОСТИ ПАРТНЁРОВ (PRO)
   ============================================ */
async function calculateCompatReal() {
    if (!premiumAccess) {
        openUnlockPaymentModal();
        return;
    }
    const canProceed = await useCalculation();
    if (!canProceed) return;

    const d1 = document.getElementById('dateP1').value;
    const d2 = document.getElementById('dateP2').value;
    
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
            document.getElementById('compat-names').innerHTML = `${safeName1 || 'Мужчина'} & ${safeName2 || 'Женщина'}`;
        }
        
        const desc = compatibilityDescriptions[t] || compatibilityDescriptions[9];
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
        
        const deepHtml = deepMatrixCompatibility(dataP1, dataP2, n1, n2);
        document.getElementById('compat-text').innerHTML += deepHtml;
        
        document.getElementById('loader-compat').style.display = 'none';
        document.getElementById('result-compat').style.opacity = '1';
        const pdfBtn = document.getElementById('download-compat-pdf');
if (pdfBtn) pdfBtn.style.display = 'inline-block';
        stopMagicAnimation('magic-numbers-compat');
    }, 1500);
}

// Экспорт для ленивого загрузчика
window.calculateCompatReal = calculateCompatReal;
window._compatLoaded = true;