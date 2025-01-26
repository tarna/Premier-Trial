import { ApplicationCommandOptionType, CommandInteraction, GuildMember, Role } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { log } from '../../utils/logs';

@Discord()
export class AssignRoleCommand {
    @Slash({ name: 'assignrole', description: 'Assign a role to a user.', defaultMemberPermissions: ['ManageRoles'] })
    async assignRole(
        @SlashOption({
            name: 'user',
            description: 'The user to assign the role to',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        @SlashOption({
            name: 'role',
            description: 'The role to assign',
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
            return interaction.reply({ content: 'I cannot assign roles higher than my own', ephemeral: true });
        }

        user.roles.add(role);
        interaction.reply({ content: `Assigned the role ${role} to ${user}`, ephemeral: true });

        log('Role Assigned', `${interaction.user.tag} assigned the role ${role} to ${user}`);
    }
}