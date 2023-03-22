import { _decorator, Component, Node, RichText, find, Vec3, Mask, UITransform, tween, Prefab, instantiate, isValid } from "cc";
import { config } from "../config/config";
import { globalFunc } from "../global/globalFunc";
import { snRes } from "../manager/snRes";
const { ccclass, property } = _decorator;

@ccclass("BroadcastLogic")
export class BroadcastLogic extends Component {
    @property(RichText)
    labelContent: RichText = null!;

    public showText(text: string) {
        if (!this.labelContent) {
            return;
        }

        this.labelContent.string = text;
        const startX = 475;
        this.labelContent.node.setPosition(new Vec3(500, 0, 0));
        const uiTrans = this.labelContent.getComponent(UITransform);
        if (!uiTrans) {
            return;
        }

        const endX = startX - uiTrans.contentSize.width - 1000; // 起始位置 - label 长度 - mask 长度
        const speed = 150;
        const duration = (uiTrans.contentSize.width + 1000) / speed;
        tween(this.labelContent.node)
            .to(duration, { position: new Vec3(endX, 0, 0) })
            .call(() => {
                this.node.destroy();
            })
            .start();

        this.scheduleOnce(() => {
            this.node.destroy();
        }, duration + 1);
    }
}

export namespace broadcast {
    const nodeName = "broadcast";
    export function show(text: string) {
        const callback = async () => {
            const oldNode = find(nodeName, config.uiNode.fixedNode ?? undefined);
            if (oldNode && isValid(oldNode)) {
                oldNode.destroy();
            }

            const node = await globalFunc.loadPrefabFromBundle("remind", nodeName, config.uiNode.fixedNode!);
            if (node) {
                node.setPosition(new Vec3(0, 345, 0));
                const compBroadcast = node.getComponent(BroadcastLogic);
                compBroadcast!.showText(text);
            }
        };

        callback();
    }
}
