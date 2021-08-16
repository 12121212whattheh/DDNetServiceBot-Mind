import { Session } from 'koishi-core';
import { CQBot } from 'koishi-adapter-onebot';
import axios, { AxiosError } from 'axios';
import _ from 'lodash';

import Config from './config';
import { byteLenth } from './CustomFunc';
import { PromiseResult, PlayerData } from '../lib';
import { GroupMemberRequest } from '../MysqlExtends';

export function testPlayerName(name: string): boolean {
    const bytes = byteLenth(name);
    return 0 < bytes && bytes <= 15;
}

export async function getPlayerData(
    name: string
): Promise<PromiseResult<PlayerData>> {
    try {
        if (testPlayerName(name)) {
            const { data } = await axios(
                // `https://${
                //     process.env.DDNET_API ?? 'api.teeworlds.cn'
                // }/ddnet/players/${encodeURIComponent(name)}.json`,
                // {
                //     headers: {
                //         'accept-encoding': 'gzip, deflate',
                //         decompress: true,
                //     },
                // }
                `${process.env.DDNET_API}/ddnet/players/${encodeURIComponent(
                    name
                )}`
            );

            return [data, null];
        } else {
            throw new Error(Config.PlayerNameErrorMsg);
        }
    } catch (e) {
        let message: string;

        if ((e as AxiosError).isAxiosError) {
            message =
                (e as AxiosError).response?.status === 404
                    ? Config.PlayerNotFoundMsg
                    : Config.UnknownErrorMsg;
        } else {
            message = (e as Error).message;
        }

        return [null, message];
    }
}

export async function wrapGetPlayerPointsMsg(name: string): Promise<string> {
    const [data, error] = await getPlayerData(name);

    let msg = `${name}\n\n`;

    if (error) return msg + error;

    // 排除error后data就一定存在
    // pity type control
    if (data === null) throw new Error();

    const favServer = _.maxBy(
        _.toPairs(_.groupBy(data.last_finishes, 'country')),
        '1.length'
    )?.[0];

    msg += `${favServer}\n${data.points.rank}. with ${data.points.points} points`;

    return msg;
}

// async function _sendGMRReminder(groupId: string): Promise<PromiseResult<string>>{

// }
// export async function sendGMRReminder(
//     session: Session.Payload<'group-member-request'>,
//     answer: string
// ): Promise<PromiseResult<string>> {
//     try {
//         const targetGroup = await session.bot.getGroup(session.groupId!);
//         const seperate = '-'.repeat(30) + '/n';
//         const pointsMessage = await wrapGetPlayerPointsMsg(answer);

//         const replyMessageId = await session.bot
//             .sendMessage(
//                 Config.Onebot.motGroup,
//                 '$收到入群申请$\n\n' +
//                     `申请人：${session.userId}\n\n` +
//                     `目标群：${targetGroup.groupId}\n` +
//                     `${targetGroup.groupName}\n\n` +
//                     seperate +
//                     (answer === session.userId
//                         ? '$用户未提供答案，使用QQ号查询分数$\n'
//                         : '') +
//                     `${pointsMessage}\n` +
//                     seperate +
//                     '\n回复此消息以处理入群申请\n（y/n/n [reason...]/i=忽略）'
//             )
//             .catch(e => [null, e] as PromiseResult<string>);
//         /* 发现账号风控，此时不能发送消息 */

//         return Array.isArray(replyMessageId)
//             ? replyMessageId
//             : [replyMessageId, null];
//     } catch (e) {
//         // 风控错误不会出现在这里，可以发送消息
//         await session.bot.sendMessage(
//             Config.Onebot.motGroup,
//             '$收到入群申请$\n\n出现非风控错误，入群申请已归档'
//         );
//         return [null, e];
//     }
// }

// export async function resendGMRReminder(
//     session:Session,
//     gmr: GroupMemberRequest
// ): Promise<PromiseResult<string>> {
//     try {
//         const targetGroup = await session.bot.getGroup(gmr.groupId);
//         const seperate = '-'.repeat(30) + '/n';
//         const pointsMessage = await wrapGetPlayerPointsMsg(gmr.answer);

//         const replyMessageId = await session.bot
//             .sendMessage(
//                 Config.Onebot.motGroup,
//                 '$收到入群申请$\n\n' +
//                     `申请人：${gmr.userId}\n\n` +
//                     `目标群：${targetGroup.groupId}\n` +
//                     `${targetGroup.groupName}\n\n` +
//                     seperate +
//                     (gmr.answer === gmr.userId
//                         ? '$用户未提供答案，使用QQ号查询分数$\n'
//                         : '') +
//                     `${pointsMessage}\n` +
//                     seperate +
//                     '\n回复此消息以处理入群申请\n（y/n/n [reason...]/i=忽略）'
//             )
//             .catch(e => [null, e] as PromiseResult<string>);
//         /* 发现账号风控，此时不能发送消息 */

//         return Array.isArray(replyMessageId)
//             ? replyMessageId
//             : [replyMessageId, null];
//     } catch (e) {
//         // 风控错误不会出现在这里，可以发送消息
//         await session.bot.sendMessage(
//             Config.Onebot.motGroup,
//             '$收到入群申请$\n\n出现非风控错误，入群申请已归档'
//         );
//         return [null, e];
//     }
// }

export function parseGMRSession(
    session: Session.Payload<'group-member-request'>,
    answer: string
): GroupMemberRequest {
    const gmr = {};
    _.map(session, (value, key) => {
        GroupMemberRequest.excludeKeys.indexOf(key) === -1 &&
            Object.assign(gmr, { [key]: value });
    });
    // parse的时候还没有发送消息，因此replyMessageId不存在
    Object.assign(gmr, {
        replyMessageId: Config.GMRReserveReplyMessageId,
        answer,
    });
    return gmr as GroupMemberRequest;
}

export async function sendGMRReminder(
    bot: CQBot,
    gmr: GroupMemberRequest
): Promise<PromiseResult<string>> {
    try {
        const targetGroup = await bot.getGroup(gmr.groupId);
        const seperate = '-'.repeat(30) + '\n';
        const pointsMessage = await wrapGetPlayerPointsMsg(gmr.answer);

        const replyMessageId = await bot
            .sendMessage(
                Config.Onebot.motGroup,
                '$收到入群申请$\n\n' +
                    `申请人：${gmr.userId}\n\n` +
                    `目标群：${targetGroup.groupId}\n` +
                    `${targetGroup.groupName}\n\n` +
                    seperate +
                    (gmr.answer === gmr.userId
                        ? '$用户未提供答案，使用QQ号查询分数$\n'
                        : '') +
                    `${pointsMessage}\n` +
                    seperate +
                    '\n回复此消息以处理入群申请\n（y/n/n [reason...]/i=忽略）'
            )
            .catch(e => [null, e.message] as PromiseResult<string>);
        /* 发现账号风控，此时不能发送消息 */
        return Array.isArray(replyMessageId)
            ? replyMessageId
            : [replyMessageId, null];
    } catch (e) {
        // 风控错误不会出现在这里，可以发送消息
        await bot.sendMessage(
            Config.Onebot.motGroup,
            '$收到入群申请$\n\n出现非风控错误，入群申请已归档'
        );
        return [null, e.message];
    }
}
