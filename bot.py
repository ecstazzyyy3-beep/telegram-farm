import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

TOKEN = "8524546614:AAESj81mlE-gSR3rWZhRhPmp8JcmOd9AFHM"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляем кнопку с Web App"""
    user = update.effective_user
    
    # Создаем кнопку Web App
    keyboard = [
        [InlineKeyboardButton(
            text="🎮 Открыть ферму", 
            web_app=WebAppInfo(url="https://raw.githack.com/yourusername/farm/main/index.html")
        )],
        [InlineKeyboardButton("ℹ️ Помощь", callback_data="help")]
    ]
    
    await update.message.reply_text(
        f"👋 Привет, {user.first_name}!\n"
        f"Нажми кнопку ниже чтобы открыть ферму прямо в Telegram!",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Помощь"""
    await update.message.reply_text(
        "🌾 Фермерский Web App\n\n"
        "• Нажми 'Открыть ферму' для игры\n"
        "• Всё работает в браузере Telegram\n"
        "• Прогресс сохраняется автоматически\n"
        "• NFT подарки: @shhappex"
    )

def main():
    """Запуск бота"""
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(help_command, pattern="help"))
    
    print("🤖 Web App бот запущен!")
    print("📱 Напиши /start в боте")
    
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()