import { Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, sys, Toggle, WebView, _decorator } from "cc";
import { api } from "../api/api";
import { remindBar } from "../components/remindBar";
import { Throttle } from "../components/throttle";
import { config } from "../config/config";
import { audioDef, eventKey, storageKey } from "../config/define";
import { dailyDialog } from "../daily/daily";
import { globalData } from "../global/globalData";
import { globalFunc } from "../global/globalFunc";
import { i18nHttpCode } from "../i18n/i18n";
import { loginSender } from "../login/loginSender";
import { snAudio } from "../manager/snAudio";
import { snEvent } from "../manager/snEvent";
import { snRes } from "../manager/snRes";
import { MessageHandle } from "../message/message-box";
import { Heartbeat } from "../net/heartbeat";
import { lobbyServices } from "../net/lobbyServices";
import { Net } from "../net/net";
import { playerInfoHandle } from "../profleinfo/player-info";
import { storeDialog } from "../store/store";
import { currency } from "../utils/currency";
import { moLog } from "../utils/logger";
import { time } from "../utils/time";
import { AddCash } from "./addCashWithdraw/AddCash";
import { Withdrawal } from "./addCashWithdraw/Withdrawal";
import { lobbySender } from "./lobbySender";
import { url } from "../utils/url";
import { GameKind } from "./game-kind/gameKind";
import { sdk } from "../native-helper/sdk";
import { nativeEventDef } from "../native-helper/native-event-def";
import { alertDialog } from "../components/alertDialog";
const { ccclass, property } = _decorator;

@ccclass("LobbyHome")
export class LobbyHome extends Component {
    @property(Label) // 个人信息
    labelNickname: Label = null!;
    @property(Label)
    labelUserID: Label = null!;
    @property(Label)
    labelBalance: Label = null!;
    @property(Sprite)
    spAvatar: Sprite = null!;
    @property(Label)
    vipLabel: Label = null!;

    @property(Node)
    dailyBtn: Node = null!;

    @property(Node)
    nodeGamesCenter: Node = null
    @property(Prefab)
    gameKind: Prefab = null
    @property(Node)         // store按钮
    nodeBtnStore: Node = null!;
    @property(Node)         // addCash按钮
    nodeBtnAddCash: Node = null!;
    @property(Node)         // 提现按钮
    nodeBtnWithdraw: Node = null!;
    @property(Node)
    nodeToggleRoot: Node = null

    private allGameList = []
    private isMove: boolean = false

    start() {

        globalData.applicaion.curLocaton = 1;
        this.loadAudio();
        this.bindEvent();
        this.readyToLobby()
        globalFunc.hideLoading();
        this.queryGameList()
        this.getCarousels()
        this.getShareInfo()

        if (globalData.applicaion.lobbySocketIns == null) {
            globalData.applicaion.lobbySocketIns || new lobbyServices()
            this.fetchGateway()
        }
        snEvent.on(eventKey.editUserHead, this.loadAvatar.bind(this))
        snEvent.on(eventKey.editUserName, this.refreshNickname.bind(this))
        snEvent.on(eventKey.addCashEvent, this.btnAddCashCallBack.bind(this))
        snEvent.on(eventKey.withdrawEvent, this.btnWithdrawCallBack.bind(this))
        snEvent.on(eventKey.updateBalance, this.onBalanceChanged.bind(this))
        snEvent.on(eventKey.refreshUserBalance, this.refreshUserBalance.bind(this))
        snEvent.on(nativeEventDef.closeWebview, this.onCloseWebview.bind(this))

        this.fetchShowAddCash();
        this.fetchShowWithdraw();
        this.refreshUserBalance()
        this.refreshBalanceTimer()
    }
    // 请求是否显示充值按钮
    private async fetchShowAddCash(): Promise<void> {
        const resData = await api.fetchShowAddCash();
        if (resData.code == 1) {
            this.nodeBtnStore.active = resData.data.storeIconEnable;
            this.nodeBtnAddCash.active = resData.data.rechargeIconEnable;
        }
    }
    // 请求是否显示提现按钮
    private async fetchShowWithdraw(): Promise<void> {
        const resData = await api.fetchShowWithdraw();
        if (resData.code == 1) {
            this.nodeBtnWithdraw.active = resData.data.show;
            config.appliction.isShowAddCash = resData.data.show
        }
    }

    // 请求网关
    private fetchGateway(): void {

        Net.getInstance().addOpenEvent(this.connectSuccess.bind(this));
        Net.getInstance().addCloseEvent(this.connectClosed.bind(this));
        config.runtime.gateway = config.env.gateways[globalData.user.userId % config.env.gateways.length];
        Net.getInstance().connect(config.runtime.gateway);

    }
    // 连接成功
    private connectSuccess(): void {
        moLog.info("connect success");
        loginSender.login(globalData.user.userId, globalData.user.authorization);
        Heartbeat.getInstance().start()
        globalFunc.hideLoading();

    }
    // 连接关闭
    private connectClosed(): void {
        moLog.warn("connect close");
        // TODO 打开webview时会断开连接
        // globalFunc.showLoading();
    }

    private async loadAudio(): Promise<void> {
        await snAudio.loadAudio(audioDef.lobbyMusic, "audio/bgm_lobby");
        snAudio.playMusic(audioDef.lobbyMusic);
    }


    private initPlayerInfo(): void {
        this.labelNickname.string = globalData.user.nickname;
        this.labelUserID.string = "ID: " + globalData.user.userId;
        this.loadAvatar();
        lobbySender.requestBalance();
    }

    private refreshNickname() {
        this.labelNickname.string = globalData.user.nickname;
    }

    private async loadAvatar(): Promise<void> {
        const avatarFrame = await globalFunc.getAvatarImage(globalData.user.avatarId);
        this.spAvatar.spriteFrame = avatarFrame;
    }

    private bindEvent(): void {
        snEvent.on(eventKey.updateBalance, () => {
            this.setBalance(globalData.user.balance);
        });
        snEvent.on(eventKey.logout, this.logout, this);
        snEvent.on(eventKey.lobbyReconnect, this.reconnect, this);
    }

    private onBalanceChanged() {
        this.setBalance(globalData.user.balance)
    }
    private setBalance(balance: number) {
        if (!this.labelBalance) {
            return;
        }

        this.labelBalance.string = currency.itoa(balance);
    }


    private async readyToLobby(): Promise<boolean> {
        // 获取玩家信息
        try {
            const userInfo = await api.fetchUserInfo();
            const { data } = userInfo;
            console.log("获取个人信息", data);

            globalData.user.areaCode = data.areaCode ?? "";
            globalData.user.phone = data.telNumber ?? "";
            globalData.user.nickname = data.nickname ?? "";
            globalData.user.vipLevel = data.vip ?? "";
            globalData.user.avatarId = data.avatarId ?? "";
            this.setBalance(globalData.user.balance);
        } catch (err: any) {
            moLog.error(`fetch user info: ${JSON.stringify(err)}`);
            globalFunc.hideLoading();
            remindBar.show(i18nHttpCode(err.code));
            return false;
        }
        this.loadPlayerInfo();
        this.initPlayerInfo()
        return true;
    }

    private async loadPlayerInfo(): Promise<void> {
        // 加载头像到缓存
        for (let i = 0; i <= 12; i++) {
            const spriteFrame = await snRes.loadAsync<SpriteFrame>("resources", `avatar/avatar_${i}/spriteFrame`);
            if (!spriteFrame) {
                continue;
            }

            globalData.avatarMap.set(`${i}`, spriteFrame);
        }
    }


    public updateVIPIcon(vip: number) { }

    private async logout(): Promise<void> {
        localStorage.setItem(storageKey.authorization, ""); // 移除token
        api.addAuthorization("");
        globalFunc.showLoading();
        globalFunc.closeConnect();
        snEvent.off(eventKey.lobbyReconnect, this.reconnect, this);
        await time.sleep(300);
        const node = await globalFunc.loadPrefabFromBundle("login", "loginHome", config.uiNode.sceneNode!);
        if (node) {
            globalFunc.changeSceneNode(node);
        }
    }
    private reconnect() {
        Object.keys(globalData.gamesConfig).forEach((key) => {
            const type = key as globalData.GameType;
            globalData.gamesConfig[type].bDownloading = false;
        });
    }

    @Throttle(1000)
    private btnRefreshBalanceCall(): void {
        this.refreshUserBalance()
    }
    @Throttle(1000)
    private async btnCustomerServiceCall(): Promise<void> {
        snAudio.playAudio(audioDef.clickBtn);
        await globalFunc.loadPrefabFromBundle("lobby-model", "customerService", config.uiNode.windowNode!);
    }
    @Throttle(1000)
    private async btnSettingCall(): Promise<void> {
        await globalFunc.loadPrefabFromBundle("setting", "setting", config.uiNode.windowNode!);
    }
    @Throttle(1000)
    private async btnActivityCall(): Promise<void> {
        await globalFunc.loadPrefabFromBundle("lobby-model", "activity", config.uiNode.windowNode!);
    }
    @Throttle(1000)
    private btnMessageCall(): void {
        MessageHandle.show();
    }

    private btnShareCall(): void { 
        if(sys.os !== sys.OS.ANDROID) {
            return remindBar.show(`failed, only availabel on android!`)
        }
        sdk.osShareText(globalData.applicaion.shareUrl)
    }

    @Throttle(1000)
    private btnDailyCall(): void {
        snAudio.playAudio(audioDef.clickBtn);
        dailyDialog.open();
    }
    @Throttle(1000)
    private btnPage1Call(): void {
        snAudio.playAudio(audioDef.clickBtn);
    }
    @Throttle(1000)
    private btnPage2Call(): void {
        snAudio.playAudio(audioDef.clickBtn);
    }

    @Throttle(1000)
    private btnStoreCallBack() {
        storeDialog.show();
    }

    @Throttle(1000)
    private async btnAddCashCallBack(): Promise<void> {
        const nodeAddCash = await globalFunc.loadPrefabFromBundle("addCashWithdraw", "addCash", config.uiNode.topWindowNode!);
        const compAddCash = nodeAddCash.getComponent(AddCash);
        const channelList = await api.fetAddCashChannels();
        compAddCash.init(channelList.data.List);
    }

    @Throttle(1000)
    private async btnWithdrawCallBack(): Promise<void> {
        const nodeWithdraw = await globalFunc.loadPrefabFromBundle("addCashWithdraw", "withdrawal", config.uiNode.topWindowNode!);
        const compWithdraw = nodeWithdraw.getComponent(Withdrawal);
        const channelList = await api.featWithdrawInfo();
        compWithdraw.init(channelList.data);

    }
    @Throttle(1000)
    private avatarCallBack() {
        playerInfoHandle.show();
    }


    public onGameKindClick(gameid: number) {
        console.warn("点击:", gameid)

        const data = {
            buyAmount: 0,
            gameId: gameid
        }

        api.getGameAddr(data)
            .then(resp => {
                console.warn("获取游戏地址", JSON.stringify(resp))
                if (resp.code == 1) {
                    this.showWebviewContent(resp.data.addr)
                }
            }).catch(error => {
                console.warn("获取游戏地址失败", JSON.stringify(error))
            })
    }


    public getEncode(website: string): string {

        const href = website
        const match = new url.match(href);
        let encode = match.get("encode");
        return encode
    }

    private queryGameList() {
        api.getGameList()
            .then(resp => {
                console.warn("游戏列表:", JSON.stringify(resp))
                if (resp.code == 1) {
                    this.showGames(resp.data.List)
                    this.allGameList = resp.data.List
                }
            })
    }


    private showGames(data: any) {
        const list = data
        if(!list) {
            return
        }
        this.nodeGamesCenter.removeAllChildren()
        const sortlist = list.sort((first, second) => {
            return first.sort - second.sort
        })


        sortlist.forEach(gameinfo => {

            const kind = instantiate(this.gameKind)
            this.nodeGamesCenter.addChild(kind)
            const sc = kind.getComponent(GameKind)
            sc.setKindInfo(gameinfo.gameId, this)
        });

    }


    private async showWebviewContent(url: string) {

        const webview = await snRes.loadAsync<Prefab>("lobby-model", "webviewContent")
        const node = instantiate(webview)
        node.name = "webviewContent"
        node.setParent(this.node)
        const scWebview = this.node.getChildByName("webviewContent")?.getComponent(WebView);
        scWebview.url = url
        this.showBtnBack()
        this.unscheduleAllCallbacks()
    }

    private onCloseWebview(): void {

        const webviewContent = this.node.getChildByName("webviewContent")
        webviewContent?.getComponent(WebView)?.destroy();
        webviewContent.destroy()
        this.refreshUserBalance()
        this.refreshBalanceTimer()
    }

    private showBtnBack() {
        /**
         * !!TODO: 需要分平台写，各种浏览器，android ios...
         */
        if (sys.isBrowser) {

            this.isMove = false
            const body = document.getElementById("GameDiv")
            const buttonDiv = document.createElement("div")
            const button = document.createElement("img")
            button.style.position = "absolute"
            button.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGkAAABoBAMAAAAA8MOsAAAAIVBMVEVHcEz////////+/v6wsLBlZWUDAwOxsbHu7u7////T09Pd6lFrAAAAC3RSTlMAChYoKTEpS2p4Wk+sS8IAAAMoSURBVHicnZhfctowEIdNuACtL9CmFwi2ywVIuQCUGfqKLRgO0BkO0HQ4QFLMezPjW8b6hyXtT5ZG++aEbz7tSpalzTIYnx/LPorHT1l0TASi4msklJd2xHAT8cvnn4zH5pk/zKOg6gcbgnPFLAyZTB/NMoRxaMXc2PR/nY1DW0ajHsuthyoEjWM5NinsC4YeUE461p7U+vEtmD+WeIx5WY1ArIFjnPiTkrEvC6RasPFYUlmvCkB9HQuqWoUoKotQAVk4KyQDqsPlL5XN7WVBVee2faeymTVAMleHtm1vjMzZk1mLCqmAzKzHlJadq4BsbQwxL7GKympjiOV3rGrbf2SI86GCK4+qbX+TIforqFVUtr9PNK2gUF2hTCc2IVMsVe8dki0LX1pnWfUTkunEpiVWMYZktUrsW4VVDMoalZg7W4dhfpFMzhgpxk6pDlgmy+EWo9GqM85sX6JiCNWVD/QGZbVYwM7SlaoX/VZSmSyiU8JB1Xpkooh2CU2VRyapBVKd9FtJZcs5L/wKqbrWWiCvxm/WhUuZWVmyrU09mC+XnZVHxifMolyVkB0dGafMSaYqIbvYMj7NJkVVSOZQUvVmqYCML468GlUBWWNTHc3KlL1gCqrEcjqqofsoqhLL6eKn+L+o6p6ZZ4Q7USii4rLm4q1G0922QKVW43+GKRFA5XyQOOVsG0jlfP1qSnWQsmTuOtSLisarQ1lvShRF3q9oCu0bAapIofi+Ye9sMRTf2exdNIYSu6i1Y0dT1tchgpJfhymkbmI+fkFq5n71GmcJnSklv3rWF1ZTV/V8pJQ6cFhF1ANUjydKqfOXWcQmSOmTA92zxyh9SjHLEab0icgsR5jSpy/zpBekmvsRNi/jqfp+qjQSC1LDCdYYYpAy7hzDEEOUeTI3bgEXTL3dBzhDN44dpvQpxbqBDWfzpkPUH6bX+1PgJoXCvkllMRdEcmtLvCFOxi/mejW5V9+km2/iLTvtRp/YPUjrVCR2RdI6MIndHr6uEjpLY12sIsvGsIrmFuiYiYq43bm+egEIdAI3EZ3AxK5jltbhzBK7qTxk57b0dW4/AEiiGXUxx5Y6AAAAAElFTkSuQmCC`
            button.style.left = `0px`
            button.style.top = `0px`
            button.onclick = () => {

                if (confirm("是否返回大厅？")) {
                    buttonDiv?.remove()
                    const webview = this.node.getChildByName("webviewContent")
                    webview?.destroy()
                    this.refreshUserBalance()
                    this.refreshBalanceTimer()
                }
            }

            buttonDiv.appendChild(button)
            body.insertBefore(buttonDiv, body.lastChild);

        }
    }


    private getCarousels() {
        api.getCarousels()
            .then(resp => {
                console.warn(`获取轮播图:${JSON.stringify(resp)}`)
            })
    }

    private getShareInfo() {
        api.getShareInfo()
            .then(resp => {
                console.warn(`获取分享信息:${JSON.stringify(resp)}`)
                if (resp.code == 1) {
                    globalData.applicaion.shareUrl = resp.data.url
                }
            })
    }


    /**
     * @emthod 切换游戏类型
     * @param event 
     * @param customdata 
     */
    private onToggleChangeView(event: any, customdata: string) {

        this.setToggleGroup()

        const list = this.allGameList.filter(gameInfo => {
            return gameInfo.classification == customdata
        })

        this.showGames(customdata == "0" ? this.allGameList : list)
    }

    private setToggleGroup() {

        this.scheduleOnce(() => {
            this.nodeToggleRoot.children.forEach((toggle) => {
                const scToogle = toggle.getComponent(Toggle)
                toggle.getChildByName("selected").active = scToogle.isChecked
            })
        }, 0)

    }

    /**
     * @merhod 轮训拉取金币
     */
    private refreshBalanceTimer() {
        this.schedule(this.refreshUserBalance.bind(this), 5)
    }

    private refreshUserBalance() {
        api.refreshUserBalance().then(resp => {
            if (resp.code == 1) {

                globalData.user.balance = resp.data.balance
                snEvent.emit(eventKey.updateBalance)
            }
        })
            .catch(error => {
                moLog.info(`刷新金币error`)
            })
    }
}
