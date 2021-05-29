"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var koishi_1 = require("koishi");
var config_1 = __importDefault(require("../utils/config"));
var CustomFunc_1 = require("../utils/CustomFunc");
require("../utils/MysqlExtends/Moderator");
module.exports.name = 'MessageHandler';
module.exports.apply = function (ctx) {
    var testCtx = config_1.default.getTestCtx(ctx);
    var motCtx = config_1.default.getMotCtx(ctx);
    testCtx.middleware(function (session, next) {
        if (session.content === 'hh') {
            session.send('surprise');
        }
        return next();
    });
    ctx.middleware(function (session, next) {
        if (session.content === 'hlep') {
            return next(function () { return session.send('你想说的是 help 吗？'); });
        }
        else {
            return next();
        }
    });
    motCtx.middleware(function (session, next) { return __awaiter(void 0, void 0, void 0, function () {
        var quote, replyMessageId, gmr, regExp, modReply, reason, botReply, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    quote = session.quote;
                    if (!quote)
                        return [2, next()];
                    replyMessageId = quote.messageId;
                    return [4, ctx.database.getGMR('replyMessageId', replyMessageId)];
                case 1:
                    gmr = _b.sent();
                    if (!gmr)
                        return [2, next()];
                    regExp = /] (y|(?:n|n (?<reason>.*))|i)$/g.exec(session.content);
                    modReply = regExp === null || regExp === void 0 ? void 0 : regExp[1];
                    reason = (_a = regExp === null || regExp === void 0 ? void 0 : regExp.groups) === null || _a === void 0 ? void 0 : _a.reason;
                    if (!modReply) return [3, 3];
                    if (modReply === 'y') {
                        botReply = '同意了该用户的入群申请';
                        session.bot.handleGroupMemberRequest(gmr.messageId, true);
                    }
                    else if (modReply === 'i') {
                        botReply = '忽略了该用户的入群申请';
                    }
                    else {
                        botReply =
                            '拒绝了该用户的入群申请\n拒绝理由：\n' + (reason !== null && reason !== void 0 ? reason : '无');
                        session.bot.handleGroupMemberRequest(gmr.messageId, false, reason !== null && reason !== void 0 ? reason : '');
                    }
                    return [4, ctx.database.removeGMR('replyMessageId', replyMessageId)];
                case 2:
                    _b.sent();
                    return [3, 4];
                case 3:
                    botReply = '回复的消息格式似乎不正确，请重新回复';
                    _b.label = 4;
                case 4: return [4, session.send(koishi_1.s.join([
                        CustomFunc_1.sf('quote', { id: replyMessageId }),
                        CustomFunc_1.sf('at', { id: session.userId }),
                        CustomFunc_1.sf('at', { id: session.userId }),
                    ]) + ("\n" + botReply))];
                case 5:
                    _b.sent();
                    return [4, session.bot.deleteMessage(session.groupId, replyMessageId)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 9, , 10]);
                    return [4, session.bot.deleteMessage(session.groupId, session.messageId)];
                case 8:
                    _b.sent();
                    return [3, 10];
                case 9:
                    error_1 = _b.sent();
                    return [3, 10];
                case 10: return [2, next()];
            }
        });
    }); });
    testCtx.middleware(function (session, next) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (session.content === 'mt') {
            }
            return [2, next()];
        });
    }); });
};
