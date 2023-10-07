// role_deprive.js
const { SlashCommandBuilder } = require('discord.js');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ロール剥奪') // コマンド名
        .setDescription('指定したロールをメンバーから剥奪します。')
        .addRoleOption(option =>
            option
                .setName('role') // ロールを指定するオプション
                .setDescription('剥奪するロールを選択してください。')
                .setRequired(true)
        ),
    async execute(interaction) {
        // コマンド実行時の処理
        const roleToDeprive = interaction.options.getRole('role');

        // Botの権限を確認
        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);
        if (!botMember.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
            return interaction.reply('Botにロールの剥奪権限がありません。');
        }

        // 対象メンバーから指定したロールを剥奪
        const membersWithRole = roleToDeprive.members;
        if (membersWithRole.size === 0) {
            return interaction.reply(`このロールを持っているメンバーはいません。`);
        }

        membersWithRole.each(async (member) => {
            try {
                await member.roles.remove(roleToDeprive);
            } catch (error) {
                console.error(`ロール剥奪エラー: ${error.message}`);
                await interaction.reply(`ロールをメンバーから剥奪できませんでした: ${error.message}`);
            }
        });

        await interaction.reply(`指定したロールを持っているメンバーからロールを剥奪しました。`);
    },
};