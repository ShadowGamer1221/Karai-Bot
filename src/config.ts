import { ActivityType } from 'discord.js';
import { BotConfig } from './structures/types'; 

export const config: BotConfig = {
    groupId: 14113482,
    slashCommands: true,
    legacyCommands: {
        enabled: true,
        prefixes: ['!!'],
    },
    permissions: {
        all: ['872399559823863878', '872825598697955379', '925837240586891306', '1135647597168697465', '1118866318259671170'],
        ranking: ['872620489334456350', '872620422552748123'],
        users: [''],
        verified: ['872405718936993852'],
        shout: ['945388997260243003'],
        join: ['945404307753304185'],
        signal: ['872620521508974622', '872399559823863878'],
        admin: ['872620521508974622', '872620489334456350', '1168632726052679690'],
        helper: ['', '', '', ''],
        recruiter: ['1109445519052390400'],
        ticketsupport: ['1168638261200171078'],
        moderators: ['872620422552748123', '872396254104141864', '872400335954640956']
    },
    logChannels: {
        actions: '',
        shout: '',
    },
 
    api: true,
    maximumRank: 102,
    verificationChecks: true,
    firedRank: 1,
    suspendedRank: 2,
    recordManualActions: false,
    memberCount: {
        enabled: false,
        channelId: '',
        milestone: 200,
        onlyMilestones: false,
    },
     xpSystem: {
        enabled: true,
        autoRankup: false,
        roles: [
            
            {
                rank: 18,
                xp: 10000,
            },
            {
                rank: 17,
                xp: 9000,
            },
            {
                rank: 16,
                xp: 8000,
            },
            {
                rank: 15,
                xp: 7000,
            },
            {
                rank: 14,
                xp: 6000,
            },
            {
                rank: 13,
                xp: 5000,
            },
            {
                rank: 12,
                xp: 3000,
            },
            {
                rank: 11,
                xp: 2000,
            },
            {
                rank: 10,
                xp: 1500,
            },
            {
                rank: 9,
                xp: 900,
            },
            {
                rank: 8,
                xp: 500,
            },
            {
                rank: 7,
                xp: 200,
            },
            {
                rank: 6,
                xp: 100,
            },
            
        ],
    },
    antiAbuse: {
        enabled: false,
        clearDuration: 1 * 60,
        threshold: 5,
        demotionRank: 3,
        bypassRoleId: '862434154033315881',
    },

    activity: {
        enabled: true,
        type: ActivityType.Watching,
        value: '/help',
    },
    status: 'online',
    deleteWallURLs: false,
}