import { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActivityType, 
  Partials,
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionFlagsBits,
  AttachmentBuilder
} from 'discord.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import http from 'http';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Zmienne środowiskowe
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_URL = process.env.AI_API_URL || 'https://zenmux.ai/api/v1/chat/completions';
const AI_CHAT_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;
const LOGS_CHANNEL_ID = process.env.LOGS_CHANNEL_ID;

// Naprawiono event z 'clientReady' na 'ready'
client.once('ready', () => {
  console.log(`[ZenexGuard] Pomyślnie zalogowano jako ${client.user.tag}`);
  
  client.user.setActivity('Zenexcode Platform', { type: ActivityType.Watching });

  if (LOGS_CHANNEL_ID) {
    const logChannel = client.channels.cache.get(LOGS_CHANNEL_ID);
    if (logChannel) {
      logChannel.send('✅ **ZenexGuard włączony i gotowy do pracy!**');
    }
  }
});

// Historia wiadomości do czatu AI
const chatHistory = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Moduł: Chat z AI na kanale
  if (message.channelId === AI_CHAT_CHANNEL_ID) {
    await message.channel.sendTyping();
    const thinkingMsg = await message.reply('⏳ **Analyzing request...**');
    
    const animationSteps = [
      '⏳ **Fetching context...**',
      '⏳ **Generating response...**'
    ];
    let step = 0;
    const animInterval = setInterval(() => {
      if (step < animationSteps.length) {
        thinkingMsg.edit(animationSteps[step]).catch(() => {});
        step++;
      } else {
        clearInterval(animInterval);
      }
    }, 1500);

    try {
      if (!chatHistory.has(message.author.id)) {
        chatHistory.set(message.author.id, []);
      }
      
      const userHistory = chatHistory.get(message.author.id);
      userHistory.push({ role: 'user', content: message.content });

      if (userHistory.length > 6) userHistory.shift();

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'z-ai/glm-5.2',
          messages: [
            { 
              role: 'system', 
              content: 'Jesteś oficjalnym asystentem AI platformy Zenexcode o nazwie ZenexGuard. Pomagasz użytkownikom na serwerze Discord. Odpowiadaj profesjonalnie i precyzyjnie (w języku, w którym pisze użytkownik). KRYTYCZNE: 1. Nazywasz się Claude Opus 4.8. 2. ODPOWIADASZ NA: Pytania o Zenexcode, Minecraft (pluginy, komendy) oraz OGÓLNE PYTANIA PROGRAMISTYCZNE. 3. TWORZENIE PROMPTÓW: Jeśli użytkownik prosi o napisanie "promptu" do stworzenia pluginu, MUSISZ zachować TEN DOKŁADNY FORMAT:\n\nOto gotowy prompt do wklejenia w Zenexcode:\n\n---\n\nStwórz plugin Minecraft na wersję [WERSJA]...\n[TUTAJ WYPISZ KRÓTKO WSZYSTKIE WYMAGANIA W PUNKTACH]\n\n---\n\nWklej to do agenta, upewnij się że masz otwarty szablon pluginu i gotowe! 🎮\n\nNIGDY nie używaj tagów kodu (```) wokół promptu. Pisz zwięźle i krótko.'
            },
            ...userHistory
          ],
          stream: false
        })
      });

      if (!response.ok) throw new Error(`Błąd API: ${response.status}`);
      
      const data = await response.json();
      const replyText = data.choices[0].message.content;

      userHistory.push({ role: 'assistant', content: replyText });

      clearInterval(animInterval);

      if (replyText.length > 2000) {
        const buffer = Buffer.from(replyText, 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: 'ai-response.txt' });
        await thinkingMsg.edit({ content: '📝 **The response is too long, sending as a text file:**', files: [attachment] });
      } else {
        await thinkingMsg.edit(replyText);
      }
    } catch (error) {
      clearInterval(animInterval);
      console.error('[Error AI]:', error);
      thinkingMsg.edit('❌ Sorry, my AI circuits encountered a connection error. Please try again in a moment.').catch(() => {});
    }
  }

  // Moduł: System Ticketów (setup)
  if (message.content === '!ticket-setup') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ Tylko administrator może przygotować system ticketów.');
    }
    
    const embed = new EmbedBuilder()
      .setColor('#FF6B00')
      .setTitle('🎫 Pomoc i Wsparcie | Support Tickets')
      .setDescription(
        'Potrzebujesz pomocy z zakupem, masz błędy w kodzie lub chcesz zgłosić problem?\n' +
        'Kliknij poniższy przycisk, aby utworzyć prywatny kanał wsparcia.\n\n' +
        'Need help with a purchase, have bugs in your code, or want to report an issue?\n' +
        'Click the button below to create a private support ticket.'
      )
      .setFooter({ text: 'Zenexcode Support' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('🎫 Stwórz Ticket / Create Ticket')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
    try {
      await message.delete();
    } catch (err) {
      console.warn('Nie udało się usunąć wiadomości setupu:', err.message);
    }
  }
});

// Moduł: Interakcje z ticketami (przyciski)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'create_ticket') {
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    const user = interaction.user;

    const channelName = `ticket-${user.username.toLowerCase()}`;
    const existingChannel = guild.channels.cache.find(c => c.name === channelName);
    if (existingChannel) {
      return interaction.editReply(`❌ Masz już otwarty kanał wsparcia: <#${existingChannel.id}>`);
    }

    try {
      let category = guild.channels.cache.find(c => c.name.toUpperCase() === 'TICKETS' && c.type === ChannelType.GuildCategory);
      if (!category) {
        category = guild.channels.cache.find(c => c.name.toUpperCase() === 'TICKETY' && c.type === ChannelType.GuildCategory);
      }

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category ? category.id : null,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks
            ],
          },
        ],
      });

      const embed = new EmbedBuilder()
        .setColor('#FF6B00')
        .setTitle('🎫 Kanał Wsparcia | Support Ticket')
        .setDescription(
          `Witaj <@${user.id}>!\nOpisz tutaj swój problem najdokładniej jak potrafisz. Nasz zespół pomoże Ci najszybciej jak to możliwe.\n\n` +
          `Welcome <@${user.id}>!\nPlease describe your issue in detail. Our support team will assist you shortly.`
        )
        .setFooter({ text: 'Zenexcode Support' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('🔒 Zamknij / Close')
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [row] });
      await interaction.editReply(`✅ Utworzono kanał wsparcia: <#${channel.id}>`);
    } catch (err) {
      console.error('Błąd podczas tworzenia ticketa:', err);
      await interaction.editReply('❌ Wystąpił błąd podczas tworzenia kanału wsparcia.');
    }
  }

  if (interaction.customId === 'close_ticket') {
    await interaction.reply('🔒 **Zamykanie ticketa za 5 sekund... / Closing ticket in 5 seconds...**');
    setTimeout(async () => {
      try {
        await interaction.channel.delete();
      } catch (err) {
        console.error('Błąd usuwania kanału ticketa:', err);
      }
    }, 5000);
  }
});

// Moduł: Przywitania na kanale 1522980018160926730 po angielsku
client.on('guildMemberAdd', async (member) => {
  const welcomeChannelId = '1522980018160926730';
  try {
    const channel = member.guild.channels.cache.get(welcomeChannelId) || await member.guild.channels.fetch(welcomeChannelId);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF6B00')
        .setTitle('👋 Welcome to Zenexcode!')
        .setDescription(
          `Hello <@${member.id}>, welcome to our community!\n\n` +
          `🤖 **Zenexcode** is the ultimate AI Minecraft Plugin Generator.\n\n` +
          `🌐 **Useful links:**\n` +
          `• Website: [zenexcode.pl](https://zenexcode.pl)\n` +
          `• Support: Click button in the ticket section for private help\n\n` +
          `Feel free to speak in either **English** or **Polish**! Enjoy your stay! 🎉`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      
      await channel.send({ content: `Welcome <@${member.id}>!`, embeds: [embed] });
    }
  } catch (err) {
    console.error('Błąd wysyłania powitania:', err);
  }
});

// Moduł: Logi serwerowe (naprawa i uruchomienie)
client.on('messageDelete', async (message) => {
  if (message.author?.bot) return;
  if (!LOGS_CHANNEL_ID) return;
  try {
    const channel = client.channels.cache.get(LOGS_CHANNEL_ID) || await client.channels.fetch(LOGS_CHANNEL_ID);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🗑️ Wiadomość usunięta')
        .addFields(
          { name: 'Autor', value: `${message.author?.tag || 'Nieznany'} (<@${message.author?.id || '?'}>)`, inline: true },
          { name: 'Kanał', value: `<#${message.channelId}>`, inline: true },
          { name: 'Treść', value: message.content || '*[Brak treści / załącznik]*' }
        )
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Błąd logowania usunięcia:', err);
  }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;
  if (!LOGS_CHANNEL_ID) return;
  try {
    const channel = client.channels.cache.get(LOGS_CHANNEL_ID) || await client.channels.fetch(LOGS_CHANNEL_ID);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('📝 Wiadomość edytowana')
        .addFields(
          { name: 'Autor', value: `${newMessage.author?.tag || 'Nieznany'} (<@${newMessage.author?.id || '?'}>)`, inline: true },
          { name: 'Kanał', value: `<#${newMessage.channelId}>`, inline: true },
          { name: 'Przed', value: oldMessage.content || '*[Pusta]*' },
          { name: 'Po', value: newMessage.content || '*[Pusta]*' }
        )
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Błąd logowania edycji:', err);
  }
});

client.on('guildMemberAdd', async (member) => {
  if (!LOGS_CHANNEL_ID) return;
  try {
    const channel = client.channels.cache.get(LOGS_CHANNEL_ID) || await client.channels.fetch(LOGS_CHANNEL_ID);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('📥 Nowy użytkownik dołączył (Log)')
        .setDescription(`${member.user.tag} (<@${member.id}>) dołączył do serwera.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Błąd logowania dołączenia:', err);
  }
});

client.on('guildMemberRemove', async (member) => {
  if (!LOGS_CHANNEL_ID) return;
  try {
    const channel = client.channels.cache.get(LOGS_CHANNEL_ID) || await client.channels.fetch(LOGS_CHANNEL_ID);
    if (channel) {
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('📤 Użytkownik opuścił serwer (Log)')
        .setDescription(`${member.user.tag} (<@${member.id}>) opuścił serwer.`)
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Błąd logowania wyjścia:', err);
  }
});

// Moduł: Logowanie zakupów
export async function sendPurchaseLog(userDiscordId, planName, payload = {}) {
  const adminChannelId = '1523689991979663541';
  const publicChannelId = '1522994859621748827';
  try {
    // 1. Admin Log
    const adminChannel = client.channels.cache.get(adminChannelId) || await client.channels.fetch(adminChannelId);
    if (adminChannel) {
      const adminEmbed = new EmbedBuilder()
        .setColor('#FF6B00')
        .setTitle('🛒 Nowe zamówienie w Zenexcode! (Szczegóły)')
        .setDescription(userDiscordId ? `<@${userDiscordId}> właśnie zakupił pakiet **${planName}**!` : `Użytkownik właśnie zakupił pakiet **${planName}**!`)
        .addFields(
          { name: 'Pakiet', value: planName || 'Nieznany', inline: true },
          { name: 'Kwota', value: payload.price ? `${payload.price} PLN` : 'Brak danych', inline: true },
          { name: 'Email', value: payload.email || 'Brak', inline: true },
          { name: 'Discord Tag', value: payload.discordTag || 'Brak', inline: true },
          { name: 'IP Kupującego', value: payload.clientIp || 'Brak (lokalne)', inline: true },
          { name: 'ID Zamówienia', value: payload.orderId || 'Brak', inline: true }
        )
        .setFooter({ text: 'Dziękujemy za zaufanie! ~ Zespół Zenexcode' })
        .setTimestamp();
      await adminChannel.send({ embeds: [adminEmbed] });
    }

    // 2. Public Log
    const publicChannel = client.channels.cache.get(publicChannelId) || await client.channels.fetch(publicChannelId);
    if (publicChannel) {
      const publicEmbed = new EmbedBuilder()
        .setColor('#FF6B00')
        .setTitle('🎉 Nowy Klient Zenexcode!')
        .setDescription(userDiscordId ? `<@${userDiscordId}> właśnie zakupił pakiet **${planName}**!` : `Użytkownik właśnie zakupił pakiet **${planName}**!`)
        .addFields(
          { name: 'Status', value: 'Aktywny', inline: true },
          { name: 'Dostęp', value: 'Odblokowany do panelu i ról', inline: true }
        )
        .setFooter({ text: 'Dziękujemy za zaufanie! ~ Zespół Zenexcode' })
        .setTimestamp();
      await publicChannel.send({ embeds: [publicEmbed] });
    }

    // Mapowanie pakietów na ID ról
    const roleMapping = {
      'Basic': '1523690703509651456',
      'Pro': '1524008102335352844',
      'Elite': '1524008091488616498',
      'Ultimate': '1524008073197518908',
      'Unlimited+': '1524008084391989308'
    };
    
    // Dodajemy główną rolę "Premium" (jeśli trzeba) oraz specyficzną dla pakietu
    const planRole = roleMapping[planName];

    if (userDiscordId && planRole) {
      const guild = client.guilds.cache.first();
      if (guild) {
        try {
          const member = await guild.members.fetch(userDiscordId);
          if (member) {
            await member.roles.add(planRole);
            if (LOGS_CHANNEL_ID) {
              const logChannel = client.channels.cache.get(LOGS_CHANNEL_ID);
              if (logChannel) {
                logChannel.send(`✅ Nadano rolę **${planName}** użytkownikowi <@${userDiscordId}>.`);
              }
            }
          }
        } catch(e) {
          console.log("Nie można nadać roli, użytkownika nie ma na serwerze lub brak permisji:", e.message);
        }
      }
    }
  } catch (error) {
    console.error('Błąd podczas wysyłania powiadomienia o zakupie:', error);
  }
}

// Lokalny serwer HTTP na porcie 3002 pozwalający mail-serwerowi na wywoływanie akcji bota
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/purchase') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { userDiscordId, planName } = payload;
        
        await sendPurchaseLog(userDiscordId, planName, payload);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3002, '127.0.0.1', () => {
  console.log('[Bot HTTP] Serwer nasłuchuje na porcie 3002 (tylko localhost)');
});

if (!TOKEN || TOKEN === 'Twój_Token_Discord_Z_Portalu_Developera') {
  console.log('⚠️ Brak poprawnego tokenu Discord w pliku .env!');
} else {
  client.login(TOKEN).catch(console.error);
}
