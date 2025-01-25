import { ApplicationCommandOptionType, CommandInteraction, GuildMember, Role } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';

@Discord()
export class RemoveRoleCommand {
    @Slash({ name: 'removerole', description: 'Remove a role to a user.', defaultMemberPermissions: ['ManageRoles'] })
    async removeRole(
        @SlashOption({
            name: 'user',
            description: 'The user to remove the role from',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        @SlashOption({
            name: 'role',
            description: 'The role to remove',
            type: ApplicationCommandOptionType.Role,
            required: true
        })
        role: Role,
        interaction: CommandInteraction
    ) {
        const botMember = interaction.guild?.members.me;
        if (!botMember?.permissions.has('ManageRoles')) {
            return interaction.reply({ content: 'I do not have the `Manage Roles` permission', ephemeral: true });
        }

        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: 'I cannt remove roles higher than my own', ephemeral: true });
        }

        user.roles.remove(role);
        interaction.reply({ content: `Removed the role ${role.name} from ${user}`, ephemeral: true });
    }
}