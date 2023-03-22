import { IBuildTaskOption } from "../@types";
import { IBuildResult } from "../@types";
import * as fs from "fs";
import * as path from "path";
import * as shelljs from "shelljs";

interface IOptions {
    commonTest1: number;
    commonTest2: "opt1" | "opt2";
    webTestOption: boolean;
}

const PACKAGE_NAME = "cocos-build-template";

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        "cocos-plugin-template": IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError = true;

export async function load() {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request("asset-db", "query-assets");
}

export async function onBeforeBuild(options: ITaskOptions) {
    // Todo some thing
    log(`${PACKAGE_NAME}.webTestOption`, "onBeforeBuild");
}

export async function onBeforeCompressSettings(options: ITaskOptions, result: IBuildResult) {
    // const pkgOptions = options.packages[PACKAGE_NAME];
    // if (pkgOptions.webTestOption) {
    //     console.debug("webTestOption", true);
    // }
    // Todo some thing
    console.debug("get settings test", result.settings);
}

export async function onAfterCompressSettings(options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    console.log("webTestOption", "onAfterCompressSettings");
}

export async function onAfterBuild(options: ITaskOptions, result: IBuildResult) {
    // change the uuid to test
    // const uuidTestMap = {
    //     image: "57520716-48c8-4a19-8acf-41c9f8777fb0",
    // };
    // for (const name of Object.keys(uuidTestMap)) {
    //     const uuid = uuidTestMap[name];
    //     console.debug(`containsAsset of ${name}`, result.containsAsset(uuid));
    //     console.debug(`getAssetPathInfo of ${name}`, result.getAssetPathInfo(uuid));
    //     console.debug(`getRawAssetPaths of ${name}`, result.getRawAssetPaths(uuid));
    //     console.debug(`getJsonPathInfo of ${name}`, result.getJsonPathInfo(uuid));
    // }

    // 资源加密
    const imgs: ImageObject[] = [];
    collectImageFilePaths(result.paths.assets, imgs);
    console.debug(`图片处理：找到 ${imgs.length} 张原始图片`);

    encryptImage(imgs);
    console.debug(`图片处理：${imgs.length} 张原始图片已加密完成`);

    // 解密脚本注入;
    injectionLoader(result.paths.dir);
    console.debug("decode script injection success");

    console.log(result);
    // 注入版本信息
    // await injectionBuildInfo(result.paths.dir);

    // 注入配置项
    injectionConfigVar(result.paths.dir);
}

export function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}

// ----------------------- 资源加密 -----------------------

enum ImageType {
    PNG,
    JPG,
    JPEG,
    GIF,
    WEBP,
}

type ImageObject = {
    /**
     * 图片类型
     */
    type: ImageType;

    /**
     * 图片路径
     */
    filePath: string;
};

function collectImageFilePaths(dirName: string, imgs: ImageObject[]) {
    if (!fs.existsSync(dirName)) {
        throw new Error(`${dirName} 目录不存在`);
    }

    let files = fs.readdirSync(dirName);
    files.forEach((fileName: fs.PathLike) => {
        let filePath = path.join(dirName, fileName.toString());
        let stat: fs.Stats = fs.statSync(filePath);
        if (stat.isDirectory()) {
            collectImageFilePaths(filePath, imgs);
        } else {
            let fileExtName = path.extname(filePath);
            switch (fileExtName) {
                case ".png":
                    imgs.push({
                        type: ImageType.PNG,
                        filePath: filePath,
                    });
                    break;
                case ".jpg":
                    imgs.push({
                        type: ImageType.JPG,
                        filePath: filePath,
                    });
                    break;
                case ".jpeg":
                    imgs.push({
                        type: ImageType.JPEG,
                        filePath: filePath,
                    });
                case ".gif":
                    imgs.push({
                        type: ImageType.GIF,
                        filePath: filePath,
                    });
                case ".webp":
                    imgs.push({
                        type: ImageType.WEBP,
                        filePath: filePath,
                    });
                    break;
            }
        }
    });
}

function encryptImage(imgs: ImageObject[]) {
    imgs.forEach((imgObj: ImageObject) => {
        let imgBuffer: Buffer = fs.readFileSync(imgObj.filePath);
        if (imgBuffer.toString().startsWith("data")) {
            return;
        }

        let imgBase64String: string = "";
        switch (imgObj.type) {
            case ImageType.PNG:
                imgBase64String += "data:image/png;base64,";
                break;
            case ImageType.JPG:
                imgBase64String += "data:image/jpg;base64,";
                break;
            case ImageType.JPEG:
                imgBase64String += "data:image/jpeg;base64,";
                break;
            case ImageType.GIF:
                imgBase64String += "data:image/gif;base64,";
                break;
            case ImageType.WEBP:
                imgBase64String += "data:image/webp;base64,";
                break;
        }
        imgBase64String += imgBuffer.toString("base64");
        // 最后加上10位随机数
        imgBase64String += randomString(10);
        fs.writeFileSync(imgObj.filePath, imgBase64String);
    });
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function randomString(length: number) {
    let str = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        str += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return str;
}

const imgDecode = `
        (function () {
            const parseParameters = function (options, onProgress, onComplete) {
                if (onComplete === undefined) {
                    var isCallback = typeof options === "function";
                    if (onProgress) {
                        onComplete = onProgress;
                        if (!isCallback) {
                            onProgress = null;
                        }
                    } else if (onProgress === undefined && isCallback) {
                        onComplete = options;
                        options = null;
                        onProgress = null;
                    }
                    if (onProgress !== undefined && isCallback) {
                        onProgress = options;
                        options = null;
                    }
                }
                options = options || Object.create(null);
                return { options, onProgress, onComplete };
            };

            const downloadDomImage = function (url, options, onComplete) {
                var { options, onComplete } = parseParameters(options, undefined, onComplete);

                var img = new Image();

                if (window.location.protocol !== "file:") {
                    img.crossOrigin = "anonymous";
                }

                function loadCallback() {
                    img.removeEventListener("load", loadCallback);
                    img.removeEventListener("error", errorCallback);
                    onComplete && onComplete(null, img);
                }

                function errorCallback() {
                    img.removeEventListener("load", loadCallback);
                    img.removeEventListener("error", errorCallback);
                    onComplete && onComplete(new Error(getError(4970, url)));
                }

                img.addEventListener("load", loadCallback);
                img.addEventListener("error", errorCallback);
                img.src = url;
                return img;
            };

            const downloadEncryptText = function (url, options, onComplete) {
                var result = jsb.fileUtils.getStringFromFile(url);
                if (result) {
                    result.substring(0, result.length - 10);
                }
                if (typeof result === "string" && result) {
                    return result;
                } else {
                    return new Error("Download text failed: " + url);
                }
            };

            const downloadEncryptImage = function (url, options, onComplete) {
                if (url.startsWith("assets")) {
                    // 内置 assets 图片, 先读取Base64, 然后将Base64给Image加载出原图
                    let text = downloadEncryptText(url, options, onComplete);
                    if (text instanceof Error) {
                        onComplete && onComplete(new Error(getError(4970, url)));
                    } else {
                        downloadDomImage(text, options, onComplete);
                    }
                } else {
                    // 非内置 assets 图片直接加载
                    downloadDomImage(url, options, onComplete);
                }
            };

            cc.assetManager.parser.register({
                // Images
                ".png": downloadEncryptImage,
                ".jpg": downloadEncryptImage,
                // ".bmp": downloadEncryptImage,
                ".jpeg": downloadEncryptImage,
                ".gif": downloadEncryptImage,
                // ".ico": downloadEncryptImage,
                // ".tiff": downloadEncryptImage,
                ".webp": downloadEncryptImage,
                // ".image": downloadEncryptImage,
                // // compressed texture
                // ".pvr": downloadEncryptImage,
                // ".pkm": downloadEncryptImage,
            });
        })();
`;

function injectionLoader(dirName: string) {
    const { EOL } = require("os");
    const url = path.join(dirName, "main.js");
    const source = fs.readFileSync(url, "utf-8");
    const data = source.split(/\r?\n/gm);
    data.splice(data.findIndex((c) => c.trim() === "cc.macro.CLEANUP_IMAGE_CACHE = false;") + 1, null, imgDecode);
    fs.writeFileSync(url, data.join(EOL));
}

const configVar = `
// 配置 B包 地址
window.ConfigUrl = {
    "apiUrl": "http://192.168.0.235:29104",
    "gateways": [
      "ws://192.168.0.235:6901"
    ],
    "updateUrl": "http://192.168.0.235:29108/master/",
    "configUrl": "http://192.168.0.235:29108/config.json?v=20221019"
}

// 配置 AB包 地址
window.ABModelConfigUrl = undefined;

// 配置 Native 函数
window.NativeConfig = {
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
`;

function injectionConfigVar(dirName: string) {
    const { EOL } = require("os");
    const url = path.join(dirName, "main.js");
    const source = fs.readFileSync(url, "utf-8");
    const data = source.split(/\r?\n/gm);
    data.splice(data.findIndex((c) => c.trim() === 'require("src/system.bundle.js");') + 1, null, configVar);
    fs.writeFileSync(url, data.join(EOL));
}
