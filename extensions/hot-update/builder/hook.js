"use strict";

const Fs = require("fs");
const Path = require("path");

const inject_script = `
(function () {
    if (typeof window.jsb === 'object') {
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
`;

exports.onAfterBuild = function (options, result) {
    // const root = Path.join(Editor.Project.path, "build/", options.outputName, "assets");
    const url = Path.join(result.paths.dir, "main.js");
    Fs.readFile(url, "utf8", function (err, data) {
        if (err) {
            throw err;
        }

        const newStr = inject_script + data;
        Fs.writeFile(url, newStr, function (error) {
            if (err) {
                throw err;
            }
            console.debug("SearchPath updated in built main.js for hot update");
        });
    });
};
