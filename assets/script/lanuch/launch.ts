import { Component, game, Game, Label, Node, ProgressBar, screen, setDisplayStats, sys, view, _decorator } from "cc";
import { api } from "../api/api";
import { alertDialog } from "../components/alertDialog";
import { frame } from "../components/frame";
import { HotUpdate } from "../components/hotUpdate";
import { config } from "../config/config";
import { eventKey, storageKey } from "../config/define";
import { globalData } from "../global/globalData";
import { globalFunc } from "../global/globalFunc";
import { i18nLabelRes, i18nSwitchLanguage, LanguageType } from "../i18n/i18n";
import { snAudio } from "../manager/snAudio";
import { snEvent } from "../manager/snEvent";
import { nativeEventDef } from "../native-helper/native-event-def";
import { sdk } from "../native-helper/sdk";
import { Heartbeat } from "../net/heartbeat";
import { Net } from "../net/net";
import { workerThread } from "../net/workerThread";
import { moLog } from "../utils/logger";
import { validator } from "../utils/validator";
import {url} from "../utils/url"
import { remindBar } from "../components/remindBar";

const { ccclass, property } = _decorator;

@ccclass("Launch")
export class Launch extends Component {
    private hotUpdateLogic: HotUpdate | undefined;
    @property(Label)
    labelRemind: Label = null!;
    @property(ProgressBar)
    progressBar: ProgressBar = null!;
    @property(Node)
    nodeUI: Node = null!;
    @property(Node)
    nodeAudio: Node = null!;


    setTips(str: string) {
    }

    onLoad() {
        globalFunc.initGlobal(); // 初始化游戏
        frame.setFrameSize()?.onresize(); // 自适应宽高
        setDisplayStats(false); // 隐藏debug信息
        game.frameRate = 36; // 设置游戏帧率
        // 记录日志
        moLog.setLevel(config.env.logLevel);
        // 监听前后台运行
        game.on(Game.EVENT_HIDE, this.runInBackground, this);
        game.on(Game.EVENT_SHOW, this.runInForeground, this);
        // 监听心跳事件
        globalThis.addEventListener(Heartbeat.CONN_TIMEOUT, this.heartbeatTimeOut.bind(this));
        // 初始化UI节点
        this.initUINode();
        // 初始化audio
        this.initAudio();
        console.log("启动游戏");

        // 移除 splash slogan
        sdk.removeSplashView();
        this.setTips("remove splansh view")

    }

    onDestroy() {
        game.off(Game.EVENT_HIDE, this.runInBackground, this);
        game.off(Game.EVENT_SHOW, this.runInForeground, this);
    }

    start() {
        this.checkHotUpdate();
        this.updateAPIConfig();

        if(sys.isBrowser) {
            document.title = "BetMania"
        }
    }


    private initUINode(): void {
        config.uiNode.sceneNode = this.nodeUI.getChildByName("nodeScene") ?? null;
        config.uiNode.fixedNode = this.nodeUI.getChildByName("nodeFixed") ?? null;
        config.uiNode.windowNode = this.nodeUI.getChildByName("nodeWindow") ?? null;
        config.uiNode.topWindowNode = this.nodeUI.getChildByName("nodeTopWindow") ?? null;
        config.uiNode.tipsNode = this.nodeUI.getChildByName("nodeTips") ?? null;
        config.uiNode.loadingNode = this.nodeUI.getChildByName("nodeLoading") ?? null;
    }

    private initAudio(): void {
        const musicVolume = localStorage.getItem(storageKey.musicVolume);
        const soundVolume = localStorage.getItem(storageKey.soundVolume);
        globalData.applicaion.musicVolume = musicVolume ? Number(musicVolume) : 1;
        globalData.applicaion.soundVolume = soundVolume ? Number(soundVolume) : 1;
        snAudio.initView(this.nodeAudio);
        snAudio.setMusicVolume(globalData.applicaion.musicVolume);
        snAudio.setSoundVolume(globalData.applicaion.soundVolume);
    }

    private checkHotUpdate(): void {
        // 如果是原生平台，则需要重置 log level
        if (sys.os === sys.OS.ANDROID) {
            // try {
            //     // debug 模式下，可以看到所有的日志
            //     config.env.logLevel = sdk.isDebug() ? 3 : 0;
            //     moLog.setLevel(config.env.logLevel);
            //     moLog.error(`fetch android debug model: ${error}`);
            // }
        }
       

        // 设置热更新回调
        this.hotUpdateLogic = this.getComponent(HotUpdate) ?? undefined;
        this.hotUpdateLogic?.setProgressCallback(this.onProgress.bind(this));
        this.hotUpdateLogic?.setUpdateFinishCallback(this.updateFinish.bind(this));
        this.hotUpdateLogic?.setUpdateFailCallback(this.updateFailed.bind(this));

        if (sys.isNative) {
            try {
                const info = JSON.parse(sdk.getDeviceInfo());
                globalData.applicaion.bundleId = info.bundleId;
                globalData.applicaion.bundleVersion = info.bundleVersion;
                api.addHeader("BundleId", globalData.applicaion.bundleId);
            } catch (error) {
                moLog.info(`fetch device info: ${error}`);
            }
        } else {
            // web预设
            globalData.applicaion.deviceId = "99f94a27-b8c8-4375-9c7d-843472f3f0e9";
            globalData.applicaion.bundleId = "com.xon.nvaqi.cbhu";
            globalData.applicaion.bundleVersion = "1.0.0";
            api.addHeader("DeviceId", globalData.applicaion.deviceId);
            api.addHeader("BundleId", globalData.applicaion.bundleId);
        }

       
        const size = view.getDesignResolutionSize();
        globalData.applicaion.designWidth = size.width;
        globalData.applicaion.designHeight = size.height;

        // 初始化 API
        api.addAuthorization(sys.localStorage.getItem(storageKey.authorization) ?? "");
        api.addHeader("Content-Type", "application/json");
    }

    private onProgress(percent: number): void {
        if (this.progressBar) {
            this.progressBar.node.active = true;
            this.progressBar.progress = percent;
        }
        if (this.labelRemind) {
            this.labelRemind.string = `Updating... ${Math.floor(percent * 100)}%`;
        }
    }

    private updateFinish(result: boolean): void {
        if (!result) {
            moLog.info("Download failed click to download again");
            // this.updateFailed();
            moLog.info("to login")
            this.toLogin();
            return;
        }

        this.progressBar.node.active = false;
        if (this.labelRemind) {
            this.labelRemind.string = `Updating... 100%`;
        }
        console.warn(`@@@@@@@version:${globalData.applicaion.resVersion}`)
        localStorage.setItem("client-version", globalData.applicaion.resVersion)
        this.toLogin();
    }

    private updateFailed(): void {
        alertDialog.show({
            content: i18nLabelRes.labelAsync("alert_update"),
            onConfirm: () => {
                this.hotUpdateLogic?.checkUpdate();
            },
        });
    }

    private updateAPIConfig(): void {

        /**
         * 以main.js 中定义的为准 方便打不同环境的包
         * this.hotUpdateLogic?.fixUr 可二次修正 后台配置
         */
        const serverInfo = window.ConfigUrl || {
            apiUrl: config.env.apiUrl,
            gateways: config.env.gateways,
            updateUrl: config.env.updateUrl,
            configUrl: config.env.configUrl,
        };

        config.env.apiUrl = serverInfo.apiUrl ?? "";
        config.env.gateways = serverInfo.gateways ?? [];
        config.env.updateUrl = serverInfo.updateUrl ?? "";

        if (sys.os == sys.OS.ANDROID) {
            if (config.env.updateUrl.length > 0) {
                moLog.info("launch config.env.updateUrl: ", config.env.updateUrl);
                this.hotUpdateLogic?.fixUrl(config.env.updateUrl);
            }
        }

        this.delayInit();
    }

    private async delayInit(): Promise<void> {
        // 初始化多语言
        this.initI18n();

        if (!sys.isNative) {
            // web 平台不获取设备id
            this.checkAppMode();
            return 
        }

        this.getDeviceId();
    }

    private async initI18n(): Promise<void> {
        //"en-us"/"br-ze"
        let language = sys.localStorage.getItem(storageKey.language) ?? "br-ze";
        i18nSwitchLanguage(language as LanguageType);
    }

    private checkAppMode(): void {
        // const payload = {
        //     bundleId: globalData.applicaion.bundleId,

        // };

        api.fetchAppMode()
            .then((resp) => {
                const { data } = resp;
                console.log("进入了", JSON.stringify(data));
                this.setTips("fetchAppMode:" + data.needUpdate)
                if(data.needUpdate) {
                    this.checkUpdate(data.url ?? "");
                }
                else {
                    this.toLogin();
                }
            })
            .catch((err) => {
                moLog.error(`fetch app mode: ${JSON.stringify(err)}`);

                alertDialog.show({
                    content: "Network error!",
                    onConfirm: () => {
                        this.getDeviceId();
                    },
                });
            });
    }

    private getDeviceId(): void {

        this.setTips("get device id")
        let osType = 3;
        switch (sys.os) {
            case sys.OS.ANDROID:
                osType = 1;
                break;
            case sys.OS.IOS:
                osType = 2;
                break;
        }
        this.setTips("getDeviceInfo")
        const info = JSON.parse(sdk.getDeviceInfo());
        this.setTips("getDeviceInfo1")
        const payload = {
            androidInfo: {
                gaid: info.googleAdId,
                id: info.androidId,
                imei: info.customIMEI,
                sdk: info.sdk,
            },
            appsFlyerId: info.appsFlyerId,
            brand: info.brand,
            deviceId: globalData.applicaion.deviceId,
            height: screen.windowSize.height,
            iosInfo: {
                idfa: "",
                idfv: "",
            },
            manufacturer: info.manufacturer,
            model: info.model,
            os: osType,
            version: info.bundleVersion,
            width: screen.windowSize.width,
            organic: 2,
        };
        this.setTips("get device id2")
        globalData.applicaion.bundleId = info.bundleId;
        globalData.applicaion.bundleVersion = info.bundleVersion;

        moLog.info("launch payload: ", JSON.stringify(payload));
        api.fetchDeviceId(payload)
            .then((response) => {
                const { data } = response;
                this.setTips("fetchDeviceId")
                globalData.applicaion.deviceId = data.deviceId;
                api.addHeader("DeviceId", data.deviceId ?? "");
                this.checkAppMode();
            })
            .catch((err) => {
                moLog.error(`fetch device id: ${JSON.stringify(err)}`);
                alertDialog.show({
                    content: i18nLabelRes.labelAsync("alert_net_err"),
                    onConfirm: () => {
                        this.getDeviceId();
                    },
                });
            });
    }

    private checkUpdate(url: string): void {
       
        if (!sys.isNative) {
            this.toLogin();
            return;
        }

        this.hotUpdateLogic?.fixUrl(url);
        this.hotUpdateLogic?.checkUpdate();
    }

    private async toLogin(): Promise<void> {
        this.setTips("load to login")
        await globalFunc.loadPrefabFromBundle("login", "loginHome", config.uiNode.sceneNode!);
    }

    private runInBackground(): void {
        moLog.info("run in background");
        //浏览器环境由心跳决定是否重连
        if (sys.isBrowser) {
            return workerThread.create();
        }

        if (globalData.applicaion.curLocaton == 0) {
            return;
        }
        globalData.outExtitTime.outTime = Date.now(); //切出去的时候的时间
        config.runtime.isBackground = true;
        globalFunc.closeConnect();
    }

    private runInForeground(): void {
        if (sys.isBrowser) {
            return workerThread.terminate();
        }

        if (globalData.applicaion.curLocaton == 0) {
            return;
        }

        alertDialog.close();
        globalData.outExtitTime.enterTime = Date.now(); //进来时候的时间
        moLog.info("run in foreground");
        config.runtime.isBackground = false;
        snEvent.emit(eventKey.backgroundState);

        this.refreGateway();
    }

    private async refreGateway(): Promise<void> {
        globalFunc.closeConnect();
        Net.getInstance().reconnect();
    }

    private heartbeatTimeOut(): void {
        globalData.outExtitTime.enterTime = Date.now(); //进来时候的时间
        snEvent.emit(eventKey.backgroundState);
        this.refreGateway()
      
    }
}
