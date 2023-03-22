
(function () {
    if (typeof window.jsb === 'object') {
        // //内网测试服
        // window.ConfigUrl = {
        //     "apiUrl": "http://192.168.0.235:29104",
        //     "gateways": [
        //       "ws://192.168.0.235:6901"
        //     ],
        //     "updateUrl": "http://192.168.0.235:29108/master/",
        //     "configUrl": "http://192.168.0.235:29108/config.json?v=20221019"
        // }

        //   //本机
        // window.ConfigUrl = {
        //     "apiUrl": "http://192.168.0.234:20088",
        //     "gateways": [
        //       "ws://192.168.0.234:15080"
        //     ],
        //     "updateUrl": "http://192.168.50.65:8000/",
        //     "configUrl": "http://192.168.0.235:29108/config.json?v=20221019"
        //  }

        //  //外网测试服
        // window.ConfigUrl = {
        //      "apiUrl": "https://api.fbdln.info",
        //       "gateways": [
        //          "wss://gateway.fbdln.info",
        //       ],
        //        "updateUrl": "https://api.fbdln.info/master/",
        //        "configUrl": "http://192.168.0.30:29108/config.json?v=20221019"
        // }

        //外网正式服
         window.ConfigUrl = {
          "apiUrl": "https://com-api.bbev.site",
           "gateways": [
             "wss://com-gateway.bbev.site",
           ],
          "updateUrl": "https://drexvh8lepy2x.cloudfront.net/",
          "configUrl": "http://192.168.0.30:29108/config.json?v=20221019"
        }

        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            var paths = JSON.parse(hotUpdateSearchPaths);
            jsb.fileUtils.setSearchPaths(paths);

            var fileList = [];
            var storagePath = paths[0] || '';
            var tempPath = storagePath + '_temp/';
            var baseOffset = tempPath.length;

            if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp')) {
                jsb.fileUtils.listFilesRecursively(tempPath, fileList);
                fileList.forEach(srcPath => {
                    var relativePath = srcPath.substr(baseOffset);
                    var dstPath = storagePath + relativePath;

                    if (srcPath[srcPath.length] == '/') {
                        jsb.fileUtils.createDirectory(dstPath)
                    }
                    else {
                        if (jsb.fileUtils.isFileExist(dstPath)) {
                            jsb.fileUtils.removeFile(dstPath)
                        }
                        jsb.fileUtils.renameFile(srcPath, dstPath);
                    }
                })
                jsb.fileUtils.removeDirectory(tempPath);
            }
        }
    }
})();


// SystemJS support.
window.self = window;
require("src/system.bundle.js");

const importMapJson = jsb.fileUtils.getStringFromFile("src/import-map.json");
const importMap = JSON.parse(importMapJson);
System.warmup({
    importMap,
    importMapUrl: 'src/import-map.json',
    defaultHandler: (urlNoSchema) => {
        require(urlNoSchema.startsWith('/') ? urlNoSchema.substr(1) : urlNoSchema);
    },
});

System.import('./src/application.js').then(({ createApplication }) => {
    return createApplication({
        loadJsListFile: (url) => require(url),
        fetchWasm: (url) => url,
    });
}).then((application) => {
    return application.import('cc').then((cc) => {
        require('jsb-adapter/jsb-engine.js');
        cc.macro.CLEANUP_IMAGE_CACHE = false;

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

    }).then(() => {
        return application.start({
            settings: window._CCSettings,
            findCanvas: () => {
                var container = document.createElement('div');
                var frame = document.documentElement;
                var canvas = window.__canvas;
                return { frame, canvas, container };
            },
        });
    });
}).catch((err) => {
    console.error(err.toString());
});
