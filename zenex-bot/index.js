import { Client, GatewayIntentBits, EmbedBuilder, ActivityType } from 'discord.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Zmienne środowiskowe
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_URL = process.env.AI_API_URL || 'https://zenmux.ai/api/v1/chat/completions';
const AI_CHAT_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;
const LOGS_CHANNEL_ID = process.env.LOGS_CHANNEL_ID;

client.once('clientReady', () => {
  console.log(`[ZenexGuard] Pomyślnie zalogowano jako ${client.user.tag}`);
  
  client.user.setActivity('Zenexcode Platform', { type: ActivityType.Watching });

  if (LOGS_CHANNEL_ID) {
    const logChannel = client.channels.cache.get(LOGS_CHANNEL_ID);
    if (logChannel) {
      logChannel.send('✅ **ZenexGuard włączony i gotowy do pracy!**');
    }
  }
});

// Historia wiadomości do czatu AI (prosta implementacja w pamięci RAM)
const chatHistory = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Moduł: Chat z AI na kanale (każdy może używać)
  if (message.channelId === AI_CHAT_CHANNEL_ID) {
    // Pokazujemy że bot pisze
    await message.channel.sendTyping();
    const thinkingMsg = await message.reply('⏳ **Wysyłanie requesta do AI...**');

    try {
      // Pobieranie historii (maksymalnie ostatnie 6 wiadomości dla kontekstu)
      if (!chatHistory.has(message.author.id)) {
        chatHistory.set(message.author.id, []);
      }
      
      const userHistory = chatHistory.get(message.author.id);
      
      userHistory.push({ role: 'user', content: message.content });

      // Ogranicz historię by nie zjadała za dużo tokenów
      if (userHistory.length > 6) userHistory.shift();

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'z-ai/glm-5.2', // WYMUSZAMY GLM 5.2 (ale udajemy Opusa)
          messages: [
            { 
              role: 'system', 
              content: 'Jesteś oficjalnym asystentem AI platformy Zenexcode o nazwie ZenexGuard. Pomagasz użytkownikom na serwerze Discord. Odpowiadaj profesjonalnie i precyzyjnie. KRYTYCZNE: 1. Nazywasz się Claude Opus 4.8. 2. ODPOWIADASZ NA: Pytania o Zenexcode, Minecraft (pluginy, komendy) oraz OGÓLNE PYTANIA PROGRAMISTYCZNE. 3. TWORZENIE PROMPTÓW: Jeśli użytkownik prosi o napisanie "promptu" do stworzenia pluginu, MUSISZ zachować TEN DOKŁADNY FORMAT:\n\nOto gotowy prompt do wklejenia w Zenexcode:\n\n---\n\nStwórz plugin Minecraft na wersję [WERSJA]...\n[TUTAJ WYPISZ KRÓTKO WSZYSTKIE WYMAGANIA W PUNKTACH]\n\n---\n\nWklej to do agenta, upewnij się że masz otwarty szablon pluginu i gotowe! 🎮\n\nNIGDY nie używaj tagów kodu (```) wokół promptu. Pisz zwięźle i krótko.'
            },
            ...userHistory
          ],
          stream: false
        })
      });

      if (!response.ok) throw new Error(`Błąd API: ${response.status}`);
      
      const data = await response.json();
      const replyText = data.choices[0].message.content;

      // Zapisujemy odp do historii
      userHistory.push({ role: 'assistant', content: replyText });

      // Wysyłanie długich wiadomości
      if (replyText.length > 2000) {
        const chunks = replyText.match(/[\s\S]{1,1990}/g);
        await thinkingMsg.edit(chunks[0]);
        for (let i = 1; i < chunks.length; i++) {
          await message.reply(chunks[i]);
        }
      } else {
        await thinkingMsg.edit(replyText);
      }


    } catch (error) {
      console.error('[Error AI]:', error);
      message.reply('❌ Przepraszam, moje obwody sztucznej inteligencji napotkały błąd połączenia. Spróbuj ponownie za chwilę.');
    }
  }
});

// Własna funkcja - jak ktoś zasubskrybuje, możesz ją odpalać z innej części kodu
export async function sendPurchaseLog(userDiscordId, planName) {
  const purchaseChannelId = process.env.PURCHASE_CHANNEL_ID;
  if (!purchaseChannelId) return;

  try {
    const channel = client.channels.cache.get(purchaseChannelId);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#FF5500')
      .setTitle('🎉 Nowy Klient Zenexcode!')
      .setDescription(`<@${userDiscordId}> właśnie zakupił pakiet **${planName}**!`)
      .addFields(
        { name: 'Status', value: 'Aktywny', inline: true },
        { name: 'Dostęp', value: 'Odblokowany do panelu i ról', inline: true }
      )
      .setFooter({ text: 'Dziękujemy za zaufanie! ~ Zespół Zenexcode' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    // Nadawanie roli, jeśli zdefiniowano ID roli w env
    const premiumRoleId = process.env.PREMIUM_ROLE_ID;
    if (premiumRoleId) {
      // Pobieranie usera (zakładamy, że bot i użytkownik dzielą jakiś główny serwer, więc weźmiemy pierwszy serwer z brzegu w którym jest użytkownik)
      const guild = client.guilds.cache.first();
      if (guild) {
        try {
          const member = await guild.members.fetch(userDiscordId);
          if (member) {
            await member.roles.add(premiumRoleId);
            
            const logChannel = client.channels.cache.get(LOGS_CHANNEL_ID);
            if (logChannel) {
               logChannel.send(`✅ Nadano rolę Premium użytkownikowi <@${userDiscordId}>.`);
            }
          }
        } catch(e) {
          console.log("Nie można nadać roli, użytkownika nie ma na serwerze discord lub brak permisji:", e.message);
        }
      }
    }

  } catch (error) {
    console.error('Błąd podczas wysyłania powiadomienia o zakupie:', error);
  }
}

if (!TOKEN || TOKEN === 'Twój_Token_Discord_Z_Portalu_Developera') {
  console.log('⚠️ Brak poprawnego tokenu Discord w pliku .env!');
} else {
  client.login(TOKEN).catch(console.error);
}
