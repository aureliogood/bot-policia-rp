require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const enServicio = new Set();

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.content === '!panel' && message.member.permissions.has("Administrator")) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('entrar').setLabel('✅ Entrar en servicio').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('salir').setLabel('❌ Salir de servicio').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('estado').setLabel('📋 Estado actual').setStyle(ButtonStyle.Primary),
            );

        await message.channel.send({
            content: '**Panel de Policía - Estado de Servicio**',
            components: [row]
        });
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;

    if (interaction.customId === 'entrar') {
        enServicio.add(userId);
        await interaction.reply({ content: `🟢 <@${userId}> ha **entrado en servicio**.`, ephemeral: false });
    }

    if (interaction.customId === 'salir') {
        enServicio.delete(userId);
        await interaction.reply({ content: `🔴 <@${userId}> ha **salido de servicio**.`, ephemeral: false });
    }

    if (interaction.customId === 'estado') {
        if (enServicio.size === 0) {
            await interaction.reply({ content: '⚠️ No hay oficiales en servicio.', ephemeral: true });
        } else {
            const lista = [...enServicio].map(id => `<@${id}>`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle('🚓 Oficiales en servicio')
                .setColor(0x00AE86)
                .setDescription(lista);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
