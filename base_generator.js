const fs = require("fs");
const JSZip = require("jszip");
const path = require("path");
const crypto = require("crypto");

let src = "./remote";

let i = 2;
while (i < process.argv.length) {
    const arg = process.argv[i];

    switch (arg) {
        case "--src":
        case "-s":
            src = process.argv[i + 1];
            i += 2;
            break;
        default:
            i++;
            break;
    }
}

class CreateZipService {
    #rootDirectory = "";

    constructor(src) {
        this.#rootDirectory = src;
    }

    async createZipFile(dir, includeRoot) {
        // we know what directory we want
        const sourceDir = path.join(this.#rootDirectory, dir);

        console.log(sourceDir);
        let zip = new JSZip();
        this.buildZipFromDirectory(sourceDir, includeRoot ? zip.folder(dir) : zip, sourceDir);

        // fix all date
        zip.forEach((relativePath, file) => {
            file.date = new Date("2019-07-24 06:00:00Z");
        });

        /** generate zip file content */
        const zipContent = await zip.generateAsync({
            type: "uint8array",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9,
            },
        });

        const md5 = crypto.createHash("md5");
        let result = md5.update(zipContent).digest("hex");
        console.log(result);

        fs.rmSync(sourceDir, { recursive: true, force: true });

        const zipName = `${dir}.zip`;
        /** create zip file */
        const outDir = path.join(this.#rootDirectory, `${includeRoot ? "" : dir}`);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir);
        }
        fs.writeFileSync(path.join(outDir, zipName), zipContent, "utf8");

        console.log(`compress ${zipName} complete`);
    }

    buildZipFromDirectory(dir, zip, root) {
        const list = fs.readdirSync(dir);

        let relative = "";
        for (let file of list) {
            file = path.join(dir, file);

            relative = path.relative(dir, file);
            relative = relative.replace(/\\/g, "/");
            relative = encodeURI(relative);

            let stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                this.buildZipFromDirectory(file, zip.folder(relative), root);
            } else {
                const filedata = fs.readFileSync(file);
                zip.file(relative, filedata);
            }
        }
    }
}

async function run() {
    const srv = new CreateZipService(src);
    await srv.createZipFile("src", false);
    await srv.createZipFile("jsb-adapter", false);

    const assetsSrv = new CreateZipService(path.join(src, "assets"));
    await assetsSrv.createZipFile("addCashWithdraw", true);
    await assetsSrv.createZipFile("lobby", true);
    await assetsSrv.createZipFile("lobby-model", true);
    await assetsSrv.createZipFile("login", true);
    await assetsSrv.createZipFile("remind", true);
    await assetsSrv.createZipFile("main", true);
    await assetsSrv.createZipFile("setting", true);
    await assetsSrv.createZipFile("resources", true);
}

run();
