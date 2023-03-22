import { Asset, assetManager, AssetManager, Node, sp, SpriteFrame } from "cc";
import { moLog } from "../utils/logger";

export namespace snRes {
    /**
     * 加载 bundle
     * @param bundleName bundle 名称
     * @returns bundle 资源
     */
    export async function loadBundleAsync(bundleName: string): Promise<AssetManager.Bundle | null> {
        return new Promise<AssetManager.Bundle | null>((resolve, reject) => {
            const bundle = assetManager.getBundle(bundleName);
            if (bundle) {
                resolve(bundle);
                return;
            }

            assetManager.loadBundle(bundleName, (err: Error, bundle: AssetManager.Bundle) => {
                if (err) {
                    moLog.error(`load bundle: ${bundleName}, err: ${err.message}`);
                    reject(null);
                    return;
                }

                resolve(bundle);
            });
        });
    }

    /**
     * 异步加载资源
     * @param bundleName bundle 名称
     * @param url 资源路径
     * @returns 资源实体
     */
    export async function loadAsync<T extends Asset>(bundleName: string, url: string): Promise<T | null> {
        const bundle = await loadBundleAsync(bundleName);
        if (!bundle) {
            return null;
        }
        return new Promise<T | null>((resolve, reject) => {
            bundle.load(url, (err: Error | null, assets: T) => {
                if (err) {
                    moLog.error(`load assets: ${bundleName}/${url}, err: ${err.message}`);
                    resolve(null);
                    return;
                }
                resolve(assets);
            });
        });
    }

    /**
     * 异步加载 spriteFrame
     * @param bundleName bundle 名称
     * @param url 资源路径
     * @returns 资源实体
     */
    export async function loadSpriteFrameAsync(bundleName: string, url: string): Promise<SpriteFrame | null> {
        const bundle = await loadBundleAsync(bundleName);
        if (!bundle) {
            return null;
        }

        return new Promise<SpriteFrame | null>((resolve, reject) => {
            bundle.load(`${url}/spriteFrame`, SpriteFrame, (err: Error | null, assets: SpriteFrame) => {
                if (err) {
                    moLog.error(`load assets: ${bundleName}/${url}, err: ${err.message}`);
                    reject(null);
                    return;
                }

                resolve(assets);
            });
        });
    }
    /**
     * 异步加载 SkeletonData
     * @param bundleName bundle 名称
     * @param url 资源路径
     * @returns 资源实体
     */
    export async function loadSkeletonAsync(bundleName: string, url: string): Promise<sp.SkeletonData | null> {
        const bundle = await loadBundleAsync(bundleName);
        if (!bundle) {
            return null;
        }

        return new Promise<sp.SkeletonData | null>((resolve, reject) => {
            bundle.load(url, sp.SkeletonData, (err: Error | null, assets: sp.SkeletonData) => {
                if (err) {
                    moLog.error(`load assets: ${bundleName}/${url}, err: ${err.message}`);
                    reject(null);
                    return;
                }

                resolve(assets);
            });
        });
    }

    /**
     * 异步加载 spine
     * @param url 资源路径，必须放在resources
     * @returns 资源实体
     */
    export async function loadSpineAsync(url: string): Promise<sp.Skeleton> {
        return new Promise<any>(resolve => {
            assetManager.resources?.load(url, sp.SkeletonData, (err, data) => {
                if (err) {
                    moLog.warn(`loadSpineAsync url: ${url}, err: ${err.message}`);
                    return resolve(null);
                }
                const node = new Node();
                node.addComponent(sp.Skeleton);
                const spine = node.getComponent(sp.Skeleton)!;
                spine.skeletonData = data;
                spine.setSkin("default");
                resolve(spine);
            })
        })
    }
}
