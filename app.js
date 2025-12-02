// Telegram Web App
const tg = window.Telegram.WebApp;

// Игровые данные
let gameData = {
    money: 100,
    level: 1,
    premium: false,
    lastCollect: null,
    totalEarned: 0
};

// Элементы DOM
const elements = {
    username: document.getElementById('username'),
    money: document.getElementById('money'),
    level: document.getElementById('level'),
    income: document.getElementById('income'),
    collectBtn: document.getElementById('collect-btn'),
    timer: document.getElementById('timer'),
    timerText: document.getElementById('timer-text'),
    upgradeBtn: document.getElementById('upgrade-btn'),
    upgradeCost: document.getElementById('upgrade-cost'),
    premiumBtn: document.getElementById('premium-btn'),
    premiumStatus: document.querySelector('.status-text'),
    premiumBadge: document.getElementById('premium-badge'),
    userId: document.getElementById('user-id'),
    userTelegramId: document.getElementById('user-telegram-id'),
    farmVisual: document.getElementById('farm-visual')
};

// Инициализация
function init() {
    console.log('🚀 Инициализация Web App');
    
    // Инициализируем Telegram Web App
    tg.ready();
    tg.expand();
    tg.MainButton.hide();
    
    // Загружаем сохраненные данные
    loadGame();
    
    // Устанавливаем данные пользователя
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        const name = user.first_name || 'Игрок';
        const username = user.username ? `(@${user.username})` : '';
        elements.username.innerHTML = `<i class="fas fa-user"></i> ${name} ${username}`;
        elements.userId.textContent = user.id || '-';
        elements.userTelegramId.textContent = user.id || '-';
    }
    
    // Обновляем интерфейс
    updateUI();
    checkCooldown();
    
    // Добавляем обработчики
    setupEventListeners();
}

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('farmWebAppData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameData = { ...gameData, ...data };
            console.log('💾 Игра загружена:', gameData);
        } catch (e) {
            console.error('Ошибка загрузки:', e);
        }
    }
}

// Сохранение игры
function saveGame() {
    localStorage.setItem('farmWebAppData', JSON.stringify(gameData));
    console.log('💾 Игра сохранена');
}

// Обновление интерфейса
function updateUI() {
    // Обновляем значения
    elements.money.textContent = gameData.money;
    elements.level.textContent = gameData.level;
    
    const income = calculateIncome();
    elements.income.textContent = income;
    
    // Стоимость улучшения
    const upgradeCost = gameData.level * 50;
    elements.upgradeCost.textContent = upgradeCost;
    
    // Премиум статус
    if (gameData.premium) {
        elements.premiumStatus.textContent = 'АКТИВЕН';
        elements.premiumStatus.className = 'status-text is-premium';
        elements.premiumBtn.innerHTML = '<i class="fas fa-crown"></i> Премиум активен';
        elements.premiumBtn.disabled = true;
        elements.premiumBadge.classList.remove('hidden');
        elements.premiumBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #0984e3 100%)';
    } else {
        elements.premiumStatus.textContent = 'Не активирован';
        elements.premiumStatus.className = 'status-text not-premium';
        elements.premiumBtn.innerHTML = '<i class="fas fa-gem"></i> Получить премиум';
        elements.premiumBtn.disabled = false;
        elements.premiumBadge.classList.add('hidden');
        elements.premiumBtn.style.background = '';
    }
    
    // Визуализация фермы
    updateFarmVisual();
    
    // Сохраняем
    saveGame();
}

// Визуализация фермы
function updateFarmVisual() {
    const visual = elements.farmVisual;
    visual.innerHTML = '';
    
    // Добавляем элементы в зависимости от уровня
    for (let i = 0; i < gameData.level; i++) {
        const icon = document.createElement('i');
        icon.className = gameData.premium ? 'fas fa-tree' : 'fas fa-wheat-awn';
        icon.style.color = gameData.premium ? '#FFD700' : '#4CAF50';
        icon.style.fontSize = `${30 + i * 5}px`;
        visual.appendChild(icon);
    }
    
    if (gameData.level === 1) {
        const tractor = document.createElement('i');
        tractor.className = 'fas fa-tractor';
        tractor.style.color = '#2196F3';
        visual.appendChild(tractor);
    }
}

// Расчет дохода
function calculateIncome() {
    const base = gameData.level * 2;
    return gameData.premium ? Math.floor(base * 1.5) : base;
}

// Проверка перезарядки
function checkCooldown() {
    if (!gameData.lastCollect) {
        elements.collectBtn.disabled = false;
        elements.collectBtn.innerHTML = '<i class="fas fa-harvest"></i> Собрать урожай';
        elements.timer.classList.add('hidden');
        return;
    }
    
    const now = Date.now();
    const last = new Date(gameData.lastCollect).getTime();
    const cooldown = gameData.premium ? 15000 : 30000; // 15 или 30 секунд
    const timePassed = now - last;
    
    if (timePassed >= cooldown) {
        elements.collectBtn.disabled = false;
        elements.collectBtn.innerHTML = '<i class="fas fa-harvest"></i> Собрать урожай';
        elements.timer.classList.add('hidden');
    } else {
        elements.collectBtn.disabled = true;
        const remaining = Math.ceil((cooldown - timePassed) / 1000);
        elements.timerText.textContent = remaining;
        elements.timer.classList.remove('hidden');
        
        // Обновляем каждую секунду
        setTimeout(checkCooldown, 1000);
    }
}

// Сбор урожая
function collectHarvest() {
    if (elements.collectBtn.disabled) return;
    
    const income = calculateIncome();
    gameData.money += income;
    gameData.totalEarned += income;
    gameData.lastCollect = new Date().toISOString();
    
    // Анимация
    elements.collectBtn.innerHTML = `<i class="fas fa-coins"></i> +${income} монет!`;
    elements.collectBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #96c93d 100%)';
    
    // Вибрация если поддерживается
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    setTimeout(() => {
        updateUI();
        checkCooldown();
        elements.collectBtn.style.background = '';
    }, 800);
}

// Улучшение фермы
function upgradeFarm() {
    const cost = gameData.level * 50;
    
    if (gameData.money >= cost) {
        gameData.money -= cost;
        gameData.level++;
        
        // Анимация
        elements.upgradeBtn.innerHTML = '<i class="fas fa-check"></i> Улучшено!';
        elements.upgradeBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #0984e3 100%)';
        
        // Вибрация
        if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }
        
        setTimeout(() => {
            updateUI();
            elements.upgradeBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Улучшить';
            elements.upgradeBtn.style.background = '';
        }, 1000);
    } else {
        showMessage('❌ Недостаточно монет!', 'error');
    }
}

// Активация премиума - ТОЛЬКО ЧЕРЕЗ NFT
function activatePremium() {
    if (gameData.premium) return;
    
    const userId = tg.initDataUnsafe?.user?.id;
    
    if (userId) {
        // Показываем инструкцию по NFT вместо автоматической активации
        showNFTInstruction(userId);
    } else {
        showMessage('⚠️ Войдите через Telegram для получения премиума', 'warning');
    }
}

// Показать инструкцию по NFT
function showNFTInstruction(userId) {
    const message = `
🎮 <strong>КАК ПОЛУЧИТЬ ПРЕМИУМ:</strong>

1. <strong>Отправь NFT подарок @shhappex</strong>
2. <strong>Сообщи свой ID:</strong> <code>${userId}</code>
3. <strong>Жди активации</strong> (после проверки)

📋 <strong>После отправки NFT:</strong>
• Напиши @shhappex в Telegram
• Отправь скриншот перевода
• Укажи свой ID: ${userId}

✅ <strong>Премиум активируется владельцем вручную</strong>
• После проверки NFT
• Получишь уведомление
• Перезапусти игру

💰 <strong>Премиум преимущества:</strong>
• ⏱ Перезарядка 15 сек (вместо 30)
• 💰 +50% к доходу
• 👑 Золотой значок
    `;
    
    // Показываем как HTML
    const instructionDiv = document.createElement('div');
    instructionDiv.className = 'nft-modal';
    instructionDiv.innerHTML = `
        <div class="modal-content">
            <h3><i class="fas fa-gem"></i> Инструкция по премиуму</h3>
            <div class="modal-body">${message}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary">
                <i class="fas fa-check"></i> Понятно
            </button>
        </div>
    `;
    instructionDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    `;
    
    document.body.appendChild(instructionDiv);
    
    // Добавляем стили для модального окна
    const style = document.createElement('style');
    style.textContent = `
        .modal-content {
            background: white;
            padding: 25px;
            border-radius: 15px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-content h3 {
            color: #2C3E50;
            margin-bottom: 15px;
            text-align: center;
        }
        .modal-body {
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .modal-body strong {
            color: #2C3E50;
        }
        .modal-body code {
            background: #f1f1f1;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
    `;
    document.head.appendChild(style);
}

// Показать сообщение
function showMessage(text, type = 'info') {
    // Создаем элемент сообщения
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = text;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#E74C3C' : type === 'warning' ? '#F39C12' : '#2ECC71'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideDown 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    
    document.body.appendChild(messageEl);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        messageEl.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// Настройка обработчиков событий
function setupEventListeners() {
    elements.collectBtn.addEventListener('click', collectHarvest);
    elements.upgradeBtn.addEventListener('click', upgradeFarm);
    elements.premiumBtn.addEventListener('click', activatePremium);
    
    // Автосохранение при закрытии
    window.addEventListener('beforeunload', saveGame);
    
    // Сохранение каждые 30 секунд
    setInterval(saveGame, 30000);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
