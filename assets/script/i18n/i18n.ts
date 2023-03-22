import { _decorator, resources, JsonAsset, SpriteFrame, assetManager, sys } from "cc";
import { eventKey, storageKey } from "../config/define";
import { snEvent } from "../manager/snEvent";
import { moLog } from "../utils/logger";

/**多语言组件 */
/**
 * 刷新当前组件
 */

export interface I18nComponent {
    refresh(): void;
}

/**
 * 语言类型
 * @enum {string} en-us 美国 - 英语
 * @enum {string} hi-in 印度 - 印地语
 * @enum {string} br-ze 巴西 - 葡萄牙语
 * @link https://hoohoo.top/blog/national-language-code-table-zh-tw-zh-cn-en-us-json-format/
 */
export type LanguageType = "en-us" | "hi-in" | "br-ze";

export namespace i18n {
    let language: LanguageType = "en-us";
    const components: I18nComponent[] = [];

    /**
     * 当前语言类型
     * @returns 语言类型
     */
    export function curLanguage(): LanguageType {
        return language;
    }

    /**
     * 注册多语言组件
     * @param c 多语言组件
     */
    export function register(c: I18nComponent) {
        components.push(c);
    }

    /**
     * 反注册多语言组件
     * @param c 多语言组件
     */
    export function unregister(c: I18nComponent) {
        const index = components.indexOf(c);
        if (index !== -1) {
            components.splice(index, 1);
        }
    }

    /**
     * 切换多语言
     * @param locate 多语言类型
     */
    export function switchLanguage(locate: LanguageType) {
        if (language === locate) {
            return;
        }
        language = locate;
        components.forEach((cp) => cp.refresh());
        sys.localStorage.setItem(storageKey.language, locate);
        snEvent.emit(eventKey.changeSysLanguage);
    }
}

export namespace i18nLabelRes {
    let labelAssets: { [key: string]: string };

    /**
     * 异步加载 Json 资源
     * @param url Json文件加载地址
     * @returns async boolean
     */
    export async function reloadJsonResAsync(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resources.load(url, JsonAsset, (err: Error | null, assets: JsonAsset) => {
                if (err) {
                    moLog.error(err);
                    reject(false);
                } else {
                    if (!assets.json) {
                        reject(false);
                    }

                    labelAssets = (assets.json as {}) ?? {};
                    resolve(true);
                }
            });
        });
    }

    /**
     * 获取对应键值的数据
     * @param key 资源键
     * @param params 资源参数
     * @returns string
     */
    export function labelAsync(key: string, params: string[] = []): string {
        if (params.length === 0) {
            return labelAssets[key] ?? "";
        }
        let str = labelAssets[key] || "";
        if (str === "") {
            return "";
        }
        for (let i = 0; i < params.length; i++) {
            const reg = new RegExp(`#${i}`, "g");
            str = str.replace(reg, params[i]);
        }
        return str;
    }
}

export namespace i18nSpriteRes {
    let assetsUrl = "";

    export function reloadResUrl(url: string) {
        assetsUrl = url;
    }

    /**
     * 异步获取图片资源
     * @param key 资源键值
     * @returns async cc.SpriteFrame
     */
    export async function spriteAsync(key: string): Promise<SpriteFrame | null> {
        return new Promise<SpriteFrame | null>((resolve, reject) => {
            assetManager.resources?.load(`${assetsUrl}/${key}/spriteFrame`, SpriteFrame, (err: Error | null, assets: SpriteFrame) => {
                if (err) {
                    moLog.error(err);
                    reject(null);
                } else {
                    resolve(assets);
                }
            });
        });
    }
}

/**
 * 切换语言
 * @param language 要切换的语言
 */
export async function i18nSwitchLanguage(language: LanguageType) {
    await i18nLabelRes.reloadJsonResAsync(`i18n/${language}/label`);
    i18nSpriteRes.reloadResUrl(`i18n/${language}/sprites`);
    i18n.switchLanguage(language);
}

/**
 * Http返回结果多语言处理
 * @param code http code
 * @returns 翻译好的结果
 */
export function i18nHttpCode(code?: number): string {
    if (!code) {
        return "i18n key error";
    }

    if (code === 0) {
        return "";
    }

    const str = i18nLabelRes.labelAsync(`http_code_${code}`, []);
    return str === "" ? "unknown error" : str;
}
