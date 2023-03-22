import { alertDialog } from "../components/alertDialog";
import { broadcast } from "../components/broadcast";
import { config } from "../config/config";
import { eventKey } from "../config/define";
import { globalData } from "../global/globalData";
import { globalFunc } from "../global/globalFunc";
import { i18nLabelRes } from "../i18n/i18n";
import { snEvent } from "../manager/snEvent";
import { Net, NetHandler } from "../net/net";
import { Packet } from "../net/packet";
import { default as proto } from "../protocol/protocol.js";
import { currency } from "../utils/currency";
import { moLog } from "../utils/logger";
import { LobbyHome } from "./lobbyHome";

export class LobbyReceiver implements NetHandler {
    private lobbyComp: LobbyHome;

    constructor(comp: LobbyHome) {
        this.lobbyComp = comp;
        Net.getInstance().bind(5000, this);
    }

    handler(pkg: Packet): void {
        if (config.runtime.isBackground) {
            return;
        }
        if (pkg.pkgType != 5000) {
            return;
        }

        switch (pkg.cmdId) {
            default:
                break;
        }
    }

    // handler(pkg: Packet): void {
    //     if (config.runtime.isBackground) {
    //         return;
    //     }
    //     if (pkg.pkgType != 5000) {
    //         return;
    //     }

    //     switch (pkg.cmdId) {
    //         case proto.lobby.LobbyCmd.CMD_FREEZE_NOTIFY: // 帐号被冻结
    //             {
    //                 globalFunc.closeConnect();
    //                 alertDialog.show({
    //                     content: i18nLabelRes.labelAsync("alert_account_lock"),
    //                     onConfirm: () => {
    //                         snEvent.emit(eventKey.logout);
    //                     },
    //                 });
    //             }
    //             break;
    //         case proto.lobby.LobbyCmd.CMD_GET_BALANCE_RESP:
    //             {
    //                 const resp = proto.lobby.GetBalanceResp.decode(pkg.msg);
    //                 moLog.info(`get balance: ${JSON.stringify(resp.toJSON())}`);
    //                 if (resp.result !== 1) {
    //                     moLog.warn(`get balance result: ${resp.result}`);
    //                     return;
    //                 }

    //                 const balance = resp.balance;
    //                 globalData.user.balance = balance;
    //                 snEvent.emit(eventKey.updateBalance, balance);
    //             }
    //             break;
    //         case proto.lobby.LobbyCmd.CMD_SYSTEM_BROADCAST_NOTIFY:
    //             {
    //                 const resp = proto.lobby.BroadCastMessageResp.decode(pkg.msg);
    //                 moLog.info(`recive broadcast msg: ${JSON.stringify(resp.toJSON())}`);
    //                 //屏蔽广播
    //                 if (!globalData.applicaion.isOpenNotice) {
    //                     break;
    //                 }

    //                 if (resp.type === 1) {
    //                     broadcast.show(resp.content);
    //                 } else {
    //                     const text = `Parabéns! <color=#09F31C>${resp.nickname}</color> ganhar  <color=#F2EC3B>R$${currency.itoa(resp.amount)}</color> em ${resp.gameName}`;
    //                     broadcast.show(text);
    //                 }
    //             }
    //             break;
    //         case proto.lobby.LobbyCmd.CMD_UPDATE_USER_INFO_RESP:
    //             {
    //                 const resp = proto.lobby.UpdateUserInfo.decode(pkg.msg);
    //                 moLog.info(`receive update user info notice: ${JSON.stringify(resp.toJSON())}`);

    //                 switch (resp.field) {
    //                     case 1:
    //                         // 更新用户昵称
    //                         break;
    //                     case 2:
    //                         // 更新用户手机号
    //                         break;
    //                     case 3:
    //                         // 更新 VIP 等级
    //                         const level = Number(resp.value);
    //                         if (Number.isNaN(level)) {
    //                             return;
    //                         }

    //                         globalData.user.vipLevel = level;
    //                         this.lobbyComp.updateVIPIcon(level);
    //                         break;
    //                     case 4:
    //                         // 更新首冲标记
    //                         break;
    //                     case 5:
    //                         // 更新是否有未读邮件
    //                         break;
    //                     default:
    //                         break;
    //                 }
    //             }
    //             break;
    //         case proto.lobby.LobbyCmd.CMD_UPDATE_USER_INFO_RESP:
    //             {
    //                 // const resp = proto.lobby.LobbySendUserReward.decode(pkg.msg);
    //                 // moLog.info(`receive update user bonus notice: ${JSON.stringify(resp.toJSON())}`);
    //                 // this.view?.setBonusAmount(resp.balance);
    //             }
    //             break;
    //         default:
    //             break;
    //     }
    // }
}
