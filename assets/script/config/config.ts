import { Node } from "cc";

interface UINode {
    sceneNode: Node | null;
    fixedNode: Node | null;
    windowNode: Node | null;
    topWindowNode: Node | null;
    tipsNode: Node | null;
    loadingNode: Node | null;
}

const bTest: boolean = false;

export namespace config {
    /**
     * UI 节点
     */
    export const uiNode: UINode = {} as UINode;

    /**
     * 环境
     */
    export const env = {
        // apiUrl: "http://192.168.0.2:20088",
        // apiUrl: "http://192.168.0.234:20088",
        apiUrl: "https://com-api.bbev.site", //外网正式服
        gateways: ["wss://com-gateway.bbev.site"],
        lobbyGateUrl: "ws://192.168.0.235:1008",
        apiVersion: "v1",
        logLevel: 3,
        tcUrl: "http://google.com",
        policyUrl: "http://google.com",
        updateUrl: "http://192.168.0.235:29108/master/",
        configUrl: "http://192.168.0.235:29108/config.json?v=20221019",
    };

    if (bTest) {
        env.lobbyGateUrl = "ws://192.168.0.30:1008";
    }

    /**
     * 运行时
     */
    export const runtime = {
        /**是否是后台运行 */
        isBackground: false,

        // 网关
        gateway: "",

        // 本地环境
        nativeClassName: "com/cocos/game/AppActivity",
        nativeFuncAlias: {
            setClipBoardString: "setClipBoardString",
            getClipBoardString: "getClipBoardString",
            facebookLogin: "facebookLogin",
            getDeviceInfo: "getDeviceInfo",
            changeOrientation: "changeOrientation",
            showGameView: "showGameView",
            isDebug: "isDebug",
        },
    };

    export const appliction = {
        isShowAddCash: false
    }

    /**
     * 短信请求间隔
     */
    export const smsRequestInterval = 2 * 60 * 1000;

    /**
     * 转盘领取时间间隔
     */
    export const spinRequestInterval = 24 * 60 * 60 * 1000;
}
