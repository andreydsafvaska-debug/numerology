function analyzeTriple(dayArc, monthArc, yearArc) {
    const meta = [dayArc.meta, monthArc.meta, yearArc.meta];
    const names = [dayArc.title, monthArc.title, yearArc.title];
    
    // --- БАЗОВЫЕ ПОДСЧЁТЫ ---
    const yangCount = meta.filter(m => m.polarity === 'yang').length;
    const yinCount = meta.filter(m => m.polarity === 'yin').length;
    const elements = meta.map(m => m.element);
    const hasElementalConflict = checkElementalConflict(elements);
    
    // --- ОСОБЫЕ КОМБИНАЦИИ ---
    
    // 1. Три одинаковых аркана
    const allSame = (dayArc.title === monthArc.title && monthArc.title === yearArc.title);
    
    // 2. Два одинаковых аркана (указываем, какие именно)
    let doubleType = null;
    if (dayArc.title === monthArc.title) doubleType = 'day_month';
    else if (dayArc.title === yearArc.title) doubleType = 'day_year';
    else if (monthArc.title === yearArc.title) doubleType = 'month_year';
    
    // 3. Наличие определённых арканов (например, 13 или 16)
    const hasCrisisArcana = meta.some(m => m.conflictGroup === 'transformation' || m.conflictGroup === 'destruction');
    
    // 4. Все три аркана из одной стихии
    const allSameElement = elements.every(el => el === elements[0]);
    
    // --- ОПРЕДЕЛЕНИЕ СЦЕНАРИЯ С ПРИОРИТЕТОМ ---
    let scenario = 'balanced';
    let templateVariant = 'default';
    
    if (allSame) {
        scenario = 'triple';
        templateVariant = dayArc.title; // например "Маг"
    } else if (doubleType) {
        scenario = 'double';
        templateVariant = doubleType;
    } else if (hasCrisisArcana && hasElementalConflict) {
        scenario = 'crisis';
        templateVariant = 'hard';
    } else if (hasElementalConflict) {
        scenario = 'crisis';
        templateVariant = 'soft';
    } else if (allSameElement) {
        scenario = 'elemental';
        templateVariant = elements[0]; // 'fire', 'water' и т.д.
    } else if (yangCount >= 2) {
        scenario = 'yang_overload';
    } else if (yinCount >= 2) {
        scenario = 'yin_overload';
    }
    
    return {
        scenario,
        templateVariant,
        yangCount,
        yinCount,
        yearTheme: yearArc.meta.globalTheme,
        dayName: dayArc.title,
        monthName: monthArc.title,
        yearName: yearArc.title,
        elements: elements,
        allSameElement
    };
}