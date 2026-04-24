const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');          // <-- ДОБАВЛЕНО
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'https://andreydsafvaska-debug.github.io' }));
app.use(express.json({ limit: '10mb' }));

// --- ЗАГРУЗКА ТОКЕНОВ (ДОБАВЛЕНО) ---
const tokensPath = path.join(__dirname, 'tokens.json');
let tokensData = { tokens: [] };
if (fs.existsSync(tokensPath)) {
    tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
}
function saveTokens() {
    fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2));
}

// --- HTML ШАБЛОН (БЕЗ ИЗМЕНЕНИЙ) ---
function buildReportHTML(data) {
    const { userName, birthDate, matrix, lifePath, nameNum, lucky, moon, radar, syntheses, forecasts } = data;
    const escape = (str) => String(str).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Нумерологический отчёт — ${escape(userName)}</title>
    <style>
        body {
            background: #1a1a2e;
            color: #eee;
            font-family: 'Cormorant Garamond', 'Times New Roman', serif;
            margin: 0;
            padding: 40px;
        }
        h1, h2, h3 { color: #D4AF37; }
        .matrix-grid { display: grid; grid-template-columns: repeat(4,1fr); gap:6px; max-width:500px; margin:20px auto; }
        .matrix-cell { background: #1e1e3a; border:1px solid #D4AF37; border-radius:8px; padding:12px; text-align:center; }
        .summary { background: #7E69AB; }
        .temp-cell { grid-column:span 4; background:#9b87f5; }
        .section { margin:30px 0; page-break-inside:avoid; }
        .synthesis-card { border:1px solid #D4AF37; border-radius:10px; padding:15px; margin-bottom:20px; background:rgba(0,0,0,0.2); }
        ul { padding-left:20px; }
        li { margin:5px 0; }
        .footer { margin-top:40px; text-align:center; color:#aaa; font-size:0.9rem; border-top:1px solid #333; padding-top:20px; }
        .page-break { page-break-before:always; }
    </style>
</head>
<body>
    <div style="text-align:center; margin-bottom:30px;">
        <h1 style="font-size:2.5rem; margin:0;">АРХИТЕКТУРА ДУШИ</h1>
        <p style="color:#9b87f5; letter-spacing:2px;">Персональный нумерологический отчёт</p>
        <div style="width:100px; height:2px; background:#D4AF37; margin:20px auto;"></div>
        <h2 style="color:#fff;">${escape(userName)}</h2>
        <p>Дата рождения: ${escape(birthDate)} | Число судьбы: ${escape(lifePath)} | Число имени: ${escape(nameNum)}</p>
        <p>Отчёт сгенерирован: ${new Date().toLocaleDateString('ru-RU')}</p>
    </div>

    <div class="section">
        <h2 style="text-align:center;">Квадрат Пифагора</h2>
        <div class="matrix-grid">
            ${matrix.map(cell => `
                <div class="matrix-cell ${cell.isSummary ? 'summary' : ''} ${cell.name === 'Темперамент' ? 'temp-cell' : ''}">
                    <div style="font-size:0.7rem; color:#aaa;">${cell.title}</div>
                    <div style="font-size:1.8rem; color:${cell.isSummary ? '#fff' : '#D4AF37'}; font-weight:bold;">${cell.value}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Детальная расшифровка</h2>
        ${matrix.map(cell => cell.description ? `
            <div style="margin-bottom:15px;">
                <strong style="color:#D4AF37;">${cell.title} (${cell.value}):</strong>
                <div>${cell.description}</div>
            </div>
        ` : '').join('')}
        ${matrix.filter(c => c.rowDesc).map(row => `
            <div style="margin-bottom:15px;">
                <strong style="color:#D4AF37;">${row.rowName} (${row.rowValue}):</strong>
                <div>${row.rowDesc}</div>
            </div>
        `).join('')}
    </div>

    ${syntheses && syntheses.length ? `
    <div class="section page-break">
        <h2>Интегральные синтезы</h2>
        ${syntheses.map(s => `
            <div class="synthesis-card">
                <h3 style="color:#D4AF37; margin-top:0;">${s.name}: ${s.title}</h3>
                <p><em>${s.portrait}</em></p>
                <p><strong>💪 Сильные стороны:</strong></p>
                <ul>${s.strengths.map(x => `<li>${x}</li>`).join('')}</ul>
                <p><strong>⚠️ Зоны роста:</strong></p>
                <ul>${s.weaknesses.map(x => `<li>${x}</li>`).join('')}</ul>
                <p><strong>💡 Совет:</strong> ${s.advice}</p>
                <p><strong>🚫 Опасность:</strong> ${s.danger}</p>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section page-break">
        <h2>Персональный прогноз</h2>
        <h3>📅 Динамика личного года</h3>
        <div>${forecasts.yearly}</div>
        <h3>⏰ Идеальное расписание дня</h3>
        <div>${forecasts.routine}</div>
        <h3>💰 Денежный профиль</h3>
        <div>${forecasts.money}</div>
    </div>

    ${data.moon ? `
    <div class="section">
        <h2>🌙 Лунный день рождения</h2>
        <div class="moon-block" style="background:rgba(155,135,245,0.1); border-radius:10px; padding:15px; text-align:center;">
            <div style="font-size:1.8rem; margin-bottom:10px;">${escape(data.moon.phaseName)}</div>
            <div>${data.moon.description}</div>
        </div>
    </div>
    ` : ''}

    ${data.lucky ? `
    <div class="section">
        <h2>🍀 Ваши талисманы</h2>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:15px; text-align:center;">
            <div><strong>Счастливое число</strong><br><span style="font-size:2rem; color:#D4AF37;">${escape(data.lucky.number)}</span></div>
            <div><strong>Лучший день</strong><br><span style="font-size:1.5rem; color:#D4AF37;">${escape(data.lucky.day)}</span></div>
            <div><strong>Цвет силы</strong><br><span style="font-size:1.5rem; color:#D4AF37;">${escape(data.lucky.color)}</span></div>
            <div><strong>Камень</strong><br><span style="font-size:1.5rem; color:#D4AF37;">${escape(data.lucky.stone)}</span></div>
            <div><strong>Стихия</strong><br><span style="font-size:1.5rem; color:#D4AF37;">${escape(data.lucky.element)}</span></div>
            <div><strong>Планета</strong><br><span style="font-size:1.5rem; color:#D4AF37;">${escape(data.lucky.planet)}</span></div>
        </div>
    </div>
    ` : ''}
    
    <div class="footer">© Astra Numerology | Отчёт создан автоматически на основе квадрата Пифагора</div>
</body>
</html>`;
}

// --- ГЕНЕРАЦИЯ PDF (БЕЗ ИЗМЕНЕНИЙ) ---
app.post('/generate-pdf', async (req, res) => {
    try {
        const payload = req.body;
        console.log(`[${new Date().toISOString()}] Генерация PDF для ${payload.userName || 'неизвестного'}`);

        const html = buildReportHTML(payload);

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
            displayHeaderFooter: false
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        const rawFileName = `Матрица_${payload.userName.replace(/\s+/g, '_')}.pdf`;
        const encodedFileName = encodeURIComponent(rawFileName);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Ошибка при генерации PDF:', error);
        res.status(500).json({ error: 'Не удалось создать PDF' });
    }
});

// --- НОВЫЕ ЭНДПОИНТЫ ДЛЯ ТОКЕНОВ ---

// Проверка токена и получение оставшихся использований
app.post('/check-token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const now = new Date();
    const tokenEntry = tokensData.tokens.find(t => t.token === token);
    if (!tokenEntry) return res.status(403).json({ success: false, error: 'Invalid token' });

    if (tokenEntry.lockedUntil && new Date(tokenEntry.lockedUntil) > now) {
        return res.status(403).json({ success: false, error: 'Token in quarantine' });
    }

    if (tokenEntry.used >= 4) {
        // если карантин истёк — сбрасываем
        tokenEntry.used = 0;
        tokenEntry.lastUsed = null;
        tokenEntry.lockedUntil = null;
        saveTokens();
    }

    res.json({
        success: true,
        remaining: 4 - tokenEntry.used
    });
});

// Списание одной попытки
app.post('/use-calculation', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const now = new Date();
    const tokenEntry = tokensData.tokens.find(t => t.token === token);
    if (!tokenEntry) return res.status(403).json({ success: false, error: 'Invalid token' });

    if (tokenEntry.lockedUntil && new Date(tokenEntry.lockedUntil) > now) {
        return res.status(403).json({ success: false, error: 'Token in quarantine' });
    }

    if (tokenEntry.used >= 4) {
        return res.status(403).json({ success: false, error: 'No calculations left' });
    }

    tokenEntry.used += 1;
    tokenEntry.lastUsed = now.toISOString();

    if (tokenEntry.used >= 4) {
        const quarantineDate = new Date(now);
        quarantineDate.setDate(quarantineDate.getDate() + 30);
        tokenEntry.lockedUntil = quarantineDate.toISOString();
    }

    saveTokens();
    res.json({
        success: true,
        remaining: 4 - tokenEntry.used,
        locked: tokenEntry.used >= 4
    });
});

// Маршрут для генерации PDF из готового HTML (для всех разделов)
app.post('/generate-pdf-from-html', async (req, res) => {
    try {
        const { html } = req.body;
        if (!html) {
            return res.status(400).json({ error: 'HTML обязателен' });
        }

        console.log(`[${new Date().toISOString()}] Генерация PDF из HTML`);

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
            displayHeaderFooter: false
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        const encodedFileName = encodeURIComponent('report.pdf');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Ошибка при генерации PDF из HTML:', error);
        res.status(500).json({ error: 'Не удалось создать PDF' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`✅ PDF-сервер запущен на http://localhost:${PORT}`);
    console.log(`   Ожидает POST-запросы на /generate-pdf`);
});