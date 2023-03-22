"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const shelljs = __importStar(require("shelljs"));
const PACKAGE_NAME = "cocos-build-template";
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
function load() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
        allAssets = yield Editor.Message.request("asset-db", "query-assets");
    });
}
exports.load = load;
function onBeforeBuild(options) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        log(`${PACKAGE_NAME}.webTestOption`, "onBeforeBuild");
    });
}
exports.onBeforeBuild = onBeforeBuild;
function onBeforeCompressSettings(options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // const pkgOptions = options.packages[PACKAGE_NAME];
        // if (pkgOptions.webTestOption) {
        //     console.debug("webTestOption", true);
        // }
        // Todo some thing
        console.debug("get settings test", result.settings);
    });
}
exports.onBeforeCompressSettings = onBeforeCompressSettings;
function onAfterCompressSettings(options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        console.log("webTestOption", "onAfterCompressSettings");
    });
}
exports.onAfterCompressSettings = onAfterCompressSettings;
function onAfterBuild(options, result) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const imgs = [];
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
    });
}
exports.onAfterBuild = onAfterBuild;
function unload() {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
exports.unload = unload;
// ----------------------- 资源加密 -----------------------
var ImageType;
(function (ImageType) {
    ImageType[ImageType["PNG"] = 0] = "PNG";
    ImageType[ImageType["JPG"] = 1] = "JPG";
    ImageType[ImageType["JPEG"] = 2] = "JPEG";
    ImageType[ImageType["GIF"] = 3] = "GIF";
    ImageType[ImageType["WEBP"] = 4] = "WEBP";
})(ImageType || (ImageType = {}));
function collectImageFilePaths(dirName, imgs) {
    if (!fs.existsSync(dirName)) {
        throw new Error(`${dirName} 目录不存在`);
    }
    let files = fs.readdirSync(dirName);
    files.forEach((fileName) => {
        let filePath = path.join(dirName, fileName.toString());
        let stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            collectImageFilePaths(filePath, imgs);
        }
        else {
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
function encryptImage(imgs) {
    imgs.forEach((imgObj) => {
        let imgBuffer = fs.readFileSync(imgObj.filePath);
        if (imgBuffer.toString().startsWith("data")) {
            return;
        }
        let imgBase64String = "";
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
function randomString(length) {
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
function injectionLoader(dirName) {
    const { EOL } = require("os");
    const url = path.join(dirName, "main.js");
    const source = fs.readFileSync(url, "utf-8");
    const data = source.split(/\r?\n/gm);
    data.splice(data.findIndex((c) => c.trim() === "cc.macro.CLEANUP_IMAGE_CACHE = false;") + 1, null, imgDecode);
    fs.writeFileSync(url, data.join(EOL));
}
function injectionBuildInfo(dirName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hash = yield getBuildHash(dirName);
            // const content = `
            // (function () {
            //     const info = {
            //         buildId: "${hash.trim()}",
            //     };
            //     cc.sys.localStorage.setItem("buildInfo", JSON.stringify(info));
            // })();
            // `;
            // const { EOL } = require("os");
            // const url = path.join(dirName, "main.js");
            // const source = fs.readFileSync(url, "utf-8");
            // const data = source.split(/\r?\n/gm);
            // data.splice(data.findIndex((c) => c.trim() === "cc.macro.CLEANUP_IMAGE_CACHE = false;") + 1, null, content);
            // fs.writeFileSync(url, data.join(EOL));
            const info = {
                buildVersion: hash.trim(),
            };
            const url = path.join(dirName, "version.txt");
            fs.writeFileSync(url, JSON.stringify(info));
        }
        catch (err) {
            console.error(`get build hash: ${err}`, err);
        }
    });
}
function getBuildHash(dirName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resovle, reject) => {
            const workDir = path.normalize(`${dirName}/../../../`);
            console.log(`work dir`, workDir);
            shelljs.cd(workDir);
            shelljs.exec("git rev-parse --short HEAD", { encoding: "utf-8" }, (code, stdout, stderr) => {
                if (code !== 0) {
                    reject(stderr);
                }
                else {
                    resovle(stdout);
                }
            });
        });
    });
}
