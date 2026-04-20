// ============================================
// ДВИЖОК АНАЛИЗА ТРОЙКИ АРКАНОВ
// ============================================

/**
 * Проверяет конфликт стихий в тройке арканов
 */
function checkElementalConflict(elements) {
    // Огонь (fire) + Вода (water) = конфликт
    if (elements.includes('fire') && elements.includes('water')) return true;
    // Воздух (air) + Земля (earth) = застой, конфликт развития
    if (elements.includes('air') && elements.includes('earth')) return true;
    // Дополнительно: большое количество огня (3) = перегрев
    const fireCount = elements.filter(e => e === 'fire').length;
    if (fireCount >= 2) return true;
    return false;
}

/**
 * Проверяет наличие "кризисных" арканов (13, 16, 15, 18 и т.д.)
 */
function hasCrisisArcanas(arcanaNumbers) {
    const crisisSet = [13, 16, 15, 18, 12];
    return arcanaNumbers.some(num => crisisSet.includes(num));
}

/**
 * Главная функция анализа тройки арканов
 * @param {object} dayArc   - объект аркана дня
 * @param {object} monthArc - объект аркана месяца
 * @param {object} yearArc  - объект аркана года
 * @returns {object}        - результат анализа
 */
function analyzeTriple(dayArc, monthArc, yearArc) {
    const meta = [dayArc.meta, monthArc.meta, yearArc.meta];
    const arcanaNumbers = [dayArc, monthArc, yearArc].map(a => 
        Object.keys(childMatrixData).find(key => childMatrixData[key] === a)
    ).map(Number);
    
    // 1. Баланс Ян / Инь
    const yangCount = meta.filter(m => m.polarity === 'yang').length;
    const yinCount = meta.filter(m => m.polarity === 'yin').length;
    
    // 2. Стихии
    const elements = meta.map(m => m.element);
    const hasConflict = checkElementalConflict(elements);
    const hasCrisis = hasCrisisArcanas(arcanaNumbers);
    
    // 3. Определение сценария
    let scenario = 'balanced';
    
    if (hasConflict || hasCrisis) {
        scenario = 'crisis';
    } else if (yangCount >= 2) {
        scenario = 'yang_overload';
    } else if (yinCount >= 2) {
        scenario = 'yin_overload';
    }
    
    return {
        scenario,
        yangCount,
        yinCount,
        elements,
        hasConflict,
        hasCrisis,
        yearTheme: yearArc.meta.globalTheme,
        dayName: dayArc.title,
        monthName: monthArc.title,
        yearName: yearArc.title,
        dayNumber: arcanaNumbers[0],
        monthNumber: arcanaNumbers[1],
        yearNumber: arcanaNumbers[2]
    };
}