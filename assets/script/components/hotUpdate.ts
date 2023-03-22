import { Asset, Component, game, sys, _decorator } from "cc";
import { globalData } from "../global/globalData";
import { i18nLabelRes } from "../i18n/i18n";
import { moLog } from "../utils/logger";
import { remindBar } from "./remindBar";

const { ccclass, property } = _decorator;
@ccclass("HotUpdate")
export class HotUpdate extends Component {
    private _storagePath = "";

    @property(Asset)
    public manifestFile: Asset | null = null; //需要挂载的文件路径
    private _am: jsb.AssetsManager | null = null;
    private _updating: boolean = false;
    private _failCount = 0;
    private _canRetry = false;
    private _updateListener = null;
    private manifestUrl: string | undefined;
    private onProgressCallback: Function | undefined;
    private updateFinishCallback: Function | undefined;
    private updateFailCallback: Function | undefined;

    onLoad(): void {
        if (!sys.isNative) {
            return;
        }

        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote-asset";

        this.initManifestUrl();
        this.initBuildInfo();
    }

    public setProgressCallback(callback: Function) {
        this.onProgressCallback = callback;
    }

    public setUpdateFinishCallback(callback: Function) {
        this.updateFinishCallback = callback;
    }

    public setUpdateFailCallback(callback: Function) {
        this.updateFailCallback = callback;
    }

    private initManifestUrl() {
        this._am = new jsb.AssetsManager("", this._storagePath, this.versionCompareHandle);
        if (!this._am) {
            return;
        }

        // const md5 = crypto.createHash("md5");
        this._am.setVerifyCallback(function (path: string, asset: any) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // const fileData = jsb.fileUtils.getDataFromFile(path);
            // const fileMd5 = md5.update(fileData).digest("hex");
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                return true;
            } else {
                return true;
            }
        });
    }

    private versionCompareHandle(versionA: string, versionB: string) {
        moLog.info(`local version: ${versionA}, remote version: ${versionB}`);
        var vA = versionA.split(".");
        var vB = versionB.split(".");
        for (var i = 0; i < vA.length; ++i) {
            var a = Number(vA[i]);
            var b = Number(vB[i]) ?? 0;
            if (a === b) {
                continue;
            } else {
                return a - b;
            }
        }
        if (vB.length > vA.length) {
            return -1;
        } else {
            return 0;
        }
    }

    private initBuildInfo() {
        const versionPath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote-asset/assets/version.txt";
        try {
            if (jsb.fileUtils.isFileExist(versionPath)) {
                const fileContent = jsb.fileUtils.getStringFromFile(versionPath);
                moLog.info(`content: ${fileContent}`);
                const info = JSON.parse(fileContent);
                globalData.applicaion.buildVersion = info.buildVersion;
                return;
            }

            moLog.info(`not found ${versionPath}`);
        } catch (error) {
            moLog.error(`get build info: ${error}`);
        }
    }

    /**
     * 获取游戏配置信息
     * @example
     * {
     *   type: "paulista",
     *   version: "5aspmjwd",
     *   url: "https://download.url",
     * }
     *
     * @returns 游戏配置项
     */
    public getGameConfigs() {
        const filePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote-asset/assets/games.txt";
        try {
            if (jsb.fileUtils.isFileExist(filePath)) {
                const fileContent = jsb.fileUtils.getStringFromFile(filePath);
                moLog.info(`content: ${fileContent}`);
                const info = JSON.parse(fileContent);
                return info;
            }

            moLog.info(`not found ${filePath}`);
        } catch (error) {
            moLog.error(`get games config: ${error}`);
        }
    }

    public fixUrl(url: string) {
        if (url.length === 0) {
            return;
        }

        if (url.endsWith("/")) {
            // 如果 url 是以 / 结尾，则移除最后一个字符
            url = url.slice(0, url.length - 1);
        }

        const assetsPath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote-asset";
        try {
            let ok = false;
            // 判断是否含有特定文件。如果存在，则代表已经热更过
            if (jsb.fileUtils.isFileExist(`${assetsPath}/project.manifest`)) {
                const fileContent = jsb.fileUtils.getStringFromFile(`${assetsPath}/project.manifest`);
                const localManifest = JSON.parse(fileContent);
                localManifest.packageUrl = `${url}/`;
                localManifest.remoteManifestUrl = `${url}/project.manifest`;
                localManifest.remoteVersionUrl = `${url}/version.manifest`;
                ok = jsb.fileUtils.writeStringToFile(JSON.stringify(localManifest), `${assetsPath}/project.manifest`);
            } else {
                // 没有热更过
                if (!jsb.fileUtils.isDirectoryExist(assetsPath)) {
                    jsb.fileUtils.createDirectory(assetsPath);
                }

                const fileContent = jsb.fileUtils.getStringFromFile(this.manifestFile?.nativeUrl ?? "");
                const localManifest = JSON.parse(fileContent);
                localManifest.packageUrl = `${url}/`;
                localManifest.remoteManifestUrl = `${url}/project.manifest`;
                localManifest.remoteVersionUrl = `${url}/version.manifest`;
                ok = jsb.fileUtils.writeStringToFile(JSON.stringify(localManifest), `${assetsPath}/project.manifest`);
            }

            if (ok) {
                this.manifestUrl = `${assetsPath}/project.manifest`;
            }
        } catch (err) {
            moLog.info(`fix hot update url: ${err}`);
        }
    }

    public checkUpdate() {
        if (!this._am) {
            return;
        }

        if (this._updating) {
            //正在检测热更
            return;
        }

        if (this._am?.getState() === jsb.AssetsManager.State.UNINITED) {
        }

        var url = this.manifestUrl ?? this.manifestFile?.nativeUrl;
        if (url) {
            this._am.loadLocalManifest(url);
        }

        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            remindBar.show(i18nLabelRes.labelAsync("remind_mainfest_fail"));
            return;
        }
        this._am.setEventCallback(this.checkCallback.bind(this));
        this._am.checkUpdate();
        this._updating = true;
    }

    private hotUpdate() {
        if (!this.manifestFile || !this._am) {
            return;
        }

        if (!this._updating) {
            this._am.setEventCallback(this.updateCallback.bind(this));
            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                var url = this.manifestFile.nativeUrl;
                this._am.loadLocalManifest(url);
            }
            this._failCount = 0;
            this._am.update();
            this._updating = true;
        }
    }

    updateCallback(event: any) {
        var needRestart = false;
        var failed = false;
        if (!this._am) {
            return;
        }

        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                // this.panel.info.string = "No local manifest file found, hot update skipped.";
                moLog.info("没有发现本地manifest文件, 跳过了热更新.");
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                var precent = event.getPercent();
                if (isNaN(precent)) return;
                this.disPatchRateEvent(precent);
                moLog.info(`update progress: ${event.getPercent()}`);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                // this.panel.info.string = "Fail to download manifest file, hot update skipped.";
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                // this.panel.info.string = "Already up to date with the latest remote version.";
                moLog.info("已是最新版本");
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                // this.panel.info.string = "Update finished. " + event.getMessage();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                // this.panel.info.string = "Update failed. " + event.getMessage();
                // this.panel.retryBtn.active = true;
                this._updating = false;
                this._canRetry = true;
                this.autoRetry();
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                // this.panel.info.string = "Asset update error: " + event.getAssetId() + ", " + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                // this.panel.info.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            this._am.setEventCallback(null!);
            this._updateListener = null;
            this._updating = false;
        }

        if (needRestart) {
            this._am.setEventCallback(null!);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            moLog.info(`new paths: ${JSON.stringify(newPaths)}`);
            Array.prototype.unshift.apply(searchPaths, newPaths);
            localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);
            setTimeout(() => {
                game.restart();
            }, 100);
        }
    }

    public retry() {
        if (!this._am) {
            return;
        }

        if (!this._updating && this._canRetry) {
            this._canRetry = false;
            this._am.downloadFailedAssets();
        }

        this._failCount = 0;
    }

    private autoRetry() {
        if (this._failCount > 3) {
            this.updateFailCallback?.();
            return;
        }

        this._failCount++;
        this.retry();
    }

    private disPatchRateEvent(percent: number) {
        this.onProgressCallback?.(percent);
    }

    //检测更新状态
    private checkCallback(event: jsb.EventAssetsManager) {
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                moLog.info("没有发现本地manifest文件，跳过了热更新.");
                this.hotUpdateFinish(true);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                moLog.info("下载manifest文件失败，跳过热更新.");

                this.hotUpdateFinish(false);
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                moLog.info("already up to date.");
                this.hotUpdateFinish(true);
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND: {
                //有新版本
                moLog.info("found new version");
                this._updating = false;
                this.hotUpdate();
                return;
            }
            case jsb.EventAssetsManager.UPDATE_PROGRESSION: {
                //有新版本
                let percent = event.getPercent();
                if (isNaN(percent)) return;
                var msg = event.getMessage();
                moLog.info("checkCallback更新进度：" + percent + ", msg: " + msg);
                return;
            }
            default:
                moLog.info("event.getEventCode():" + event.getEventCode());
                return;
        }
        if (this._am) {
            this._am.setEventCallback(null!);
            this._updating = false;
        }
    }

    //热更完成
    private hotUpdateFinish(result: boolean) {
        globalData.applicaion.resVersion = this._am?.getLocalManifest().getVersion() ?? "";
        this.updateFinishCallback?.(result);
    }

    onDestroy() {
        if (this._updateListener) {
            this._am?.setEventCallback(null!);
            this._updateListener = null;
        }
    }
}
