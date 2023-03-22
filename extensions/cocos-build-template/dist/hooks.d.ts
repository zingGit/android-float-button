import { IBuildTaskOption } from "../@types";
import { IBuildResult } from "../@types";
interface IOptions {
    commonTest1: number;
    commonTest2: "opt1" | "opt2";
    webTestOption: boolean;
}
interface ITaskOptions extends IBuildTaskOption {
    packages: {
        "cocos-plugin-template": IOptions;
    };
}
export declare const throwError = true;
export declare function load(): Promise<void>;
export declare function onBeforeBuild(options: ITaskOptions): Promise<void>;
export declare function onBeforeCompressSettings(options: ITaskOptions, result: IBuildResult): Promise<void>;
export declare function onAfterCompressSettings(options: ITaskOptions, result: IBuildResult): Promise<void>;
export declare function onAfterBuild(options: ITaskOptions, result: IBuildResult): Promise<void>;
export declare function unload(): void;
export {};
