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

// Экспорт настоящих реализаций в глобальную область
window._realCalculateMoneyMatrix = calculateMoneyMatrix;
window._realCalculateMoneyCompat = calculateMoneyCompat;
window._moneyLoaded = true;