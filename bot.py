import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

TOKEN = "8524546614:AAESj81mlE-gSR3rWZhRhPmp8JcmOd9AFHM"

# === ПРАВИЛЬНЫЙ URL ТВОЕГО WEB APP ===
GITHUB_PAGES_URL = "https://ecstazzyyy3-beep.github.io/telegram-farm"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /start с кнопкой Web App"""
    user = update.effective_user
    
    # Создаем кнопку Web App
    keyboard = [
        [InlineKeyboardButton(
            text="🎮 Открыть ферму", 
            web_app=WebAppInfo(url=GITHUB_PAGES_URL)
        )],
        [InlineKeyboardButton("ℹ️ Помощь", callback_data="help")]
    ]
    
    text = f"""
👋 Привет, {user.first_name}!

🌾 Добро пожаловать в фермерский Web App!

🎮 *Как играть:*
1. Нажми кнопку "Открыть ферму"
2. Игра откроется прямо в Telegram
3. Собирай урожай и улучшай ферму
4. Все данные сохраняются автоматически

👑 *Премиум статус:*
Отправь NFT подарок @shhappex
"""
    
    await update.message.reply_text(
        text,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode='Markdown'
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Помощь"""
    query = update.callback_query
    await query.answer()
    
    text = """
🌾 *Фермерский Web App - Помощь*

🎮 *Основные функции:*
• Сбор урожая каждые 30 сек (15 сек для премиум)
• Улучшение фермы за монеты
• Премиум статус с бонусами

👑 *Как получить премиум:*
1. Отправь NFT подарок @shhappex
2. Сообщи свой Telegram ID
3. Получишь премиум статус!

💾 *Особенности:*
• Работает в браузере Telegram
• Сохраняется автоматически
• Не требует сервера

🆘 *Проблемы:*
• Если приложение не грузится - проверь интернет
• При сбоях - перезапусти Telegram
• Для сброса прогресса - очисти кэш браузера
    """
    
    await query.edit_message_text(text, parse_mode='Markdown')

async def myid_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать ID пользователя для NFT"""
    user = update.effective_user
    text = f"""
👤 *Ваш профиль*

📛 Имя: {user.first_name}
🆔 Telegram ID: `{user.id}`
{'🔗 Username: @' + user.username if user.username else '⚠️ Username не установлен'}

📋 *Для получения премиума:*
1. Отправь NFT подарок @shhappex
2. Сообщи этот ID: `{user.id}`
3. Жди активации премиума
    """
    
    await update.message.reply_text(text, parse_mode='Markdown')

def main():
    """Запуск бота"""
    print("="*50)
    print("🤖 FARM WEB APP BOT")
    print("="*50)
    print(f"🌐 Web App URL: {GITHUB_PAGES_URL}")
    print("📱 Команды:")
    print("  /start - начать игру")
    print("  /myid - показать ID для NFT")
    print("="*50)
    
    app = Application.builder().token(TOKEN).build()
    
    # Команды
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("myid", myid_command))
    
    # Обработчики
    app.add_handler(CallbackQueryHandler(help_command, pattern="help"))
    
    print("✅ Bot ready!")
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
