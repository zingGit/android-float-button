import { SpriteFrame } from "cc";
import { createMap } from "../utils/map";

/**
 * 游戏配置
 */
export interface Game {
    type: globalData.GameType; // 游戏名称+下标索引
    gameId: number; // 游戏ID
    version: string; // 版本号
    remoteVersion: ""; // 远程版本号
    needUpdate: boolean; // 是否需要更新
    bundleName: string; // bundle名称
    downloadUrl: string; // 下载地址
    fixed: boolean; // 如果为 true 则表示Bundle已在包内，不更新
    bDownloading: boolean; // 是否正在下载中
}

/**
 * 全局属性
 */
export namespace globalData {
    // 游戏类型 | 名称
    export type GameType = "trucoPaulista" | "trucoMineiro" | "crash" | "halloween" | "dragonTiger" | "crown" | "carRacing" | "sevenUpDown" | "pokerMatka";
    // 游戏列表
    export const GameList: string[] = [];
    // 游戏配置
    export const gamesConfig: { [key in GameType]: Game } = createMap();
    // 用户信息
    export const user = {
        userId: 0, // 用户ID
        authorization: "", // Token
        balance: 0, // 余额
        nickname: "", // 昵称
        avatarId: "", // 头像
        areaCode: "91", // 手机区号
        phone: "", // 手机号
        vipLevel: 0, // VIP等级
    };

    // 应用信息
    export const applicaion = {
        bFirstLogin: true, // 是否第一次进入登录界面
        curLocaton: 0, // 0.登录界面 1.大厅
        deviceId: "", // 设备ID
        bundleId: "", // 包名
        bundleVersion: "", // 包的版本
        musicVolume: 1, // 音乐音量
        soundVolume: 1, // 音效音量
        sourceCode: "", // 来源，用户邀请码
        resVersion: "", // 资源版本
        buildVersion: "", // 编译版本
        localAssetsPath: "", // 本地资源目录
        designWidth: 0, // 设计分辨率宽度
        designHeight: 0, // 设计分辨率高度
        isOpenNotice: true, // 是否启用广播
        customerServiceWebUrl: "", // 客服web地址
        lobbySocketIns: null,
        shareUrl: ""
    };

    // 客服列表
    interface CustomerService {
        type: string; // "whatsapp" | "telegram" | "web"
        nickname: string;
        link: string;
    }
    export const customerServices: Array<CustomerService> = [];

    export const outExtitTime = {
        outTime: 0, //切出去的时间
        enterTime: 0, //切回来的时间
    };
    // 玩家头像信息
    export const avatarMap: Map<string, SpriteFrame> = new Map();
    // 玩家VIP
    export const vipMap: Map<string, SpriteFrame> = new Map();


}
