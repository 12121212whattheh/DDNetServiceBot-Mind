import { Context } from 'koishi-core';
import { Logger } from 'koishi-utils';

export function test(ctx: Context, logger: Logger) {
    ctx.on('connect', async () => {
        // await test1(ctx);
        await test2(ctx);
    });

    ctx.middleware((session, next) => {
        if (session.content === 'mt') {
            // console.dir(await ctx.database.getGMR())
        }
        return next();
    });
}

async function test2(ctx: Context) {}

async function test1(ctx: Context) {
    const messageId = 'me';
    const replyMessageId = 're';
    const userId = 'us';
    const groupId = 'gr';
    const channelId = 'ch';

    console.dir(await ctx.database.getGMR('messageId', { messageId }));
    console.dir(await ctx.database.getGMR('messageId', { messageId }, []));
    console.dir(
        await ctx.database.getGMR('messageId', { messageId }, ['groupId'])
    );

    console.dir(
        await ctx.database.getGMR('replyMessageId', { replyMessageId })
    );
    console.dir(
        await ctx.database.getGMR('replyMessageId', { replyMessageId }, [])
    );
    console.dir(
        await ctx.database.getGMR('replyMessageId', { replyMessageId }, [
            'replyMessageId',
        ])
    );

    console.dir(
        await ctx.database.getGMR('union', { userId, groupId, channelId })
    );
    console.dir(
        await ctx.database.getGMR('union', { userId, groupId, channelId }, [])
    );
    console.dir(
        await ctx.database.getGMR('union', { userId, groupId, channelId }, [
            'messageId',
            'answer',
        ])
    );

    console.dir(await ctx.database.getGMR('messageId', { messageId: '1' }));
    console.dir(await ctx.database.getUser('onebot', '1'));
}
