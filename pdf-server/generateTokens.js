const fs = require('fs');
const crypto = require('crypto');

const tokens = [];
for (let i = 0; i < 1000; i++) {
    tokens.push({
        token: crypto.randomBytes(8).toString('hex'), // 16 символов
        used: 0,                // сколько раз уже использован (0-4)
        lastUsed: null,         // дата последнего использования
        lockedUntil: null       // дата окончания карантина
    });
}

fs.writeFileSync('tokens.json', JSON.stringify({ tokens }, null, 2));
console.log('✅ tokens.json создан с 1000 токенами');