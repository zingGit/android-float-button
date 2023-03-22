import { assetManager, ImageAsset, instantiate, macro, Node, Prefab, ResolutionPolicy, SpriteFrame, sys, view } from "cc";
import { config } from "../config/config";
import { snRes } from "../manager/snRes";
import { sdk } from "../native-helper/sdk";
import { Heartbeat } from "../net/heartbeat";
import { Net } from "../net/net";
import { facebook } from "../utils/facebook";
import { moLog } from "../utils/logger";
import { Game, globalData } from "./globalData";

/**
 * 全局函数
 */
export namespace globalFunc {

    export function initGlobal() {
        let assetsPath = "";
        if (sys.isNative) {
            assetsPath = `${jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/"}remote-assets/assets`;
        }
        globalData.applicaion.localAssetsPath = assetsPath;

        const init = (type: globalData.GameType, gameId: number, fixed?: boolean) => {
            const cfg: Game = {
                type: type,
                gameId: gameId,
                version: sys.localStorage.getItem(`${type.toString()}-version`) ?? "",
                remoteVersion: "",
                needUpdate: false,
                bundleName: !!fixed ? type.toString() : `${assetsPath.length === 0 ? "" : assetsPath + "/"}${type.toString()}`,
                downloadUrl: "",
                fixed: !!fixed,
                bDownloading: false,
            };

            globalData.gamesConfig[type] = cfg;
            globalData.GameList.push(type);
        };

        init("trucoPaulista", 15000);
        init("trucoMineiro", 16000);
        init("crash", 14000);
        init("halloween", 17000);
        init("dragonTiger", 6000);
        init("crown", 10000);
        init("carRacing", 8000);
        init("sevenUpDown", 7000);
        init("pokerMatka", 12000);
    }

    // 显示loading
    export function showLoading(): void {
        if (config.uiNode.loadingNode) {
            config.uiNode.loadingNode.active = true;
        }
    }
    // 隐藏loading
    export function hideLoading(): void {
        if (config.uiNode.loadingNode) {
            config.uiNode.loadingNode.active = false;
        }
    }
    // 动态加载预制体
    export async function loadPrefabFromBundle(bundleName: string, nodeName: string, nodeParent: Node): Promise<Node | null> {
        const prefab = await snRes.loadAsync<Prefab>(bundleName, nodeName);
        if (!prefab) {
            console.error("loadPrefabFromBundle failed: ", bundleName, nodeName);
            return null;
        }
        const node = instantiate(prefab);
        node.name = nodeName;
        node.setParent(nodeParent);
        return node;
    }
    // 切换场景到当前节点
    export function changeSceneNode(curNode: Node): void {
        if (config.uiNode.sceneNode) {
            let children = config.uiNode.sceneNode.children;
            for (let i = 0; i < children.length; i++) {
                children[i].active = false;
            }
            curNode.setParent(config.uiNode.sceneNode);
            curNode.active = true;
            hideLoading();
        }
    }
    // 获取玩家头像
    export async function getAvatarImage(avatarId: string): Promise<SpriteFrame | null> {
        if (avatarId.length < 3) {
            // 返回本地头像
            const local = globalData.avatarMap.get(avatarId);
            if (local) {
                return local;
            }

            const image = await snRes.loadSpriteFrameAsync("resources", `avatar/avatar_${avatarId}`);
            if (!image) {
                return null;
            }
            return image;
        }

        try {
            const url = await facebook.getAvatar(avatarId);
            // facebook 头像
            return new Promise<SpriteFrame | null>((resolve, reject) => {
                assetManager.loadRemote<ImageAsset>(url, { ext: ".jpg" }, (err: Error | null, image: ImageAsset) => {
                    if (err) {
                        reject(null);
                        return;
                    }

                    resolve(SpriteFrame.createWithImage(image));
                });
            });
        } catch (err) {
            moLog.error(`get avatarId: ${JSON.stringify(err)}`);
            return Promise.reject(null);
        }
    }
    // 关闭连接
    export function closeConnect(): void {
        Net.getInstance().close();
        Heartbeat.getInstance().stop();
    }

    //设置横竖屏 （val：true 设置为横屏, false 设置为竖屏）
    export function change2OrientationLandscape(val: boolean): void {

        let w = view.getFrameSize().width;
        let h = view.getFrameSize().height;

        if (val && w > h) {
            return;
        } else if (!val && w < h) {
            return;
        }

        view.setFrameSize(h, w);

        if (sys.isNative && sys.os === sys.OS.ANDROID) {
            // jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "cocosChangeOrientation", "(Z)V", val);
            val?sdk.setScreenOrientationLandscape():sdk.setScreenOrientationPortrait()
        } else if (sys.isNative && sys.os === sys.OS.IOS) {
            jsb.reflection.callStaticMethod("AppController", "cocosChangeOrientation:", "" + val);
        }

        if (val) {
            view.setOrientation(macro.ORIENTATION_LANDSCAPE);
            view.setDesignResolutionSize(globalData.applicaion.designWidth, globalData.applicaion.designHeight, ResolutionPolicy.FIXED_HEIGHT);
        } else {
            view.setOrientation(macro.ORIENTATION_PORTRAIT);
            view.setDesignResolutionSize(globalData.applicaion.designHeight, globalData.applicaion.designWidth, ResolutionPolicy.FIXED_WIDTH);
        }
    }
}
