// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран
tg.MainButton.hide(); // Скрываем основную кнопку

// Игровые данные
let gameData = {
    money: 100,
    level: 1,
    premium: false,
    lastCollect: null,
    totalEarned: 0
};

// DOM элементы
const elements = {
    username: document.getElementById('username'),
    money: document.getElementById('money'),
    level: document.getElementById('level'),
    income: document.getElementById('income'),
    cooldown: document.getElementById('cooldown'),
    collectBtn: document.getElementById('collect-btn'),
    timer: document.getElementById('timer'),
    upgradeBtn: document.getElementById('upgrade-btn'),
    upgradeCost: document.getElementById('upgrade-cost'),
    premiumBtn: document.getElementById('premium-btn'),
    premiumStatus: document.getElementById('premium-status'),
    premiumBadge: document.getElementById('premium-badge')
};

// Инициализация
function init() {
    // Получаем данные из LocalStorage
    const saved = localStorage.getItem('farmGameData');
    if (saved) {
        gameData = JSON.parse(saved);
    }
    
    // Устанавливаем имя из Telegram
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        elements.username.textContent = user.first_name || 'Игрок';
        if (user.username) {
            elements.username.textContent += ` (@${user.username})`;
        }
    }
    
    // Обновляем интерфейс
    updateUI();
    checkCooldown();
}

// Обновление интерфейса
function updateUI() {
    elements.money.textContent = gameData.money;
    elements.level.textContent = gameData.level;
    
    const income = calculateIncome();
    elements.income.textContent = income;
    
    const cooldown = gameData.premium ? 15 : 30;
    elements.cooldown.textContent = `${cooldown} сек`;
    
    // Стоимость улучшения
    const upgradeCost = gameData.level * 50;
    elements.upgradeCost.textContent = upgradeCost;
    
    // Премиум статус
    if (gameData.premium) {
        elements.premiumStatus.innerHTML = 'Статус: <span class="is-premium">👑 АКТИВЕН</span>';
        elements.premiumBtn.textContent = 'Премиум активен';
        elements.premiumBtn.disabled = true;
        elements.premiumBadge.classList.remove('hidden');
        elements.premiumBtn.style.background = '#00b894';
    } else {
        elements.premiumStatus.innerHTML = 'Статус: <span class="not-premium">Не активирован</span>';
        elements.premiumBtn.textContent = 'Получить премиум (NFT)';
        elements.premiumBtn.disabled = false;
        elements.premiumBadge.classList.add('hidden');
    }
    
    // Сохраняем данные
    saveGame();
}

// Рассчитать доход
function calculateIncome() {
    const base = gameData.level * 2;
    return gameData.premium ? Math.floor(base * 1.5) : base;
}

// Проверить перезарядку
function checkCooldown() {
    if (!gameData.lastCollect) {
        elements.collectBtn.disabled = false;
        elements.collectBtn.textContent = '🌱 Собрать урожай';
        elements.timer.classList.add('hidden');
        return;
    }
    
    const now = Date.now();
    const last = new Date(gameData.lastCollect).getTime();
    const cooldown = gameData.premium ? 15000 : 30000; // 15 или 30 секунд
    const timePassed = now - last;
    
    if (timePassed >= cooldown) {
        elements.collectBtn.disabled = false;
        elements.collectBtn.textContent = '🌱 Собрать урожай';
        elements.timer.classList.add('hidden');
    } else {
        elements.collectBtn.disabled = true;
        const remaining = Math.ceil((cooldown - timePassed) / 1000);
        elements.timer.textContent = `⏳ ${remaining} сек`;
        elements.timer.classList.remove('hidden');
        
        // Обновляем таймер каждую секунду
        setTimeout(checkCooldown, 1000);
    }
}

// Собрать урожай
function collect() {
    if (elements.collectBtn.disabled) return;
    
    const income = calculateIncome();
    gameData.money += income;
    gameData.totalEarned += income;
    gameData.lastCollect = new Date().toISOString();
    
    // Анимация
    elements.collectBtn.textContent = `+${income} 💰`;
    elements.collectBtn.style.background = '#00b894';
    
    setTimeout(() => {
        updateUI();
        checkCooldown();
        elements.collectBtn.style.background = '';
    }, 500);
}

// Улучшить ферму
function upgrade() {
    const cost = gameData.level * 50;
    
    if (gameData.money >= cost) {
        gameData.money -= cost;
        gameData.level++;
        
        // Анимация
        elements.upgradeBtn.textContent = 'Улучшено!';
        elements.upgradeBtn.style.background = '#00b894';
        
        setTimeout(() => {
            updateUI();
            elements.upgradeBtn.textContent = 'Улучшить';
            elements.upgradeBtn.style.background = '';
        }, 1000);
    } else {
        alert('❌ Недостаточно монет!');
    }
}

// Активировать премиум
function activatePremium() {
    if (gameData.premium) return;
    
    // В реальном приложении здесь была бы проверка NFT
    // Для демо просто активируем
    const userId = tg.initDataUnsafe?.user?.id;
    if (userId) {
        // Можно добавить проверку с сервером
        // Но для демо просто активируем
        gameData.premium = true;
        updateUI();
        
        // Показать инструкцию
        alert(
            '🎉 Премиум активирован!\n\n' +
            'В реальной версии:\n' +
            '1. Отправь NFT подарок @shhappex\n' +
            '2. Сообщи свой ID: ' + userId + '\n' +
            '3. Получишь премиум статус!'
        );
    } else {
        alert('⚠️ Войдите через Telegram для получения премиума');
    }
}

// Сохранить игру
function saveGame() {
    localStorage.setItem('farmGameData', JSON.stringify(gameData));
}

// Назначение обработчиков
elements.collectBtn.addEventListener('click', collect);
elements.upgradeBtn.addEventListener('click', upgrade);
elements.premiumBtn.addEventListener('click', activatePremium);

// Запуск игры
tg.ready();
init();