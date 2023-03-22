import { bezier, Component, instantiate, Label, Prefab, Tween, tween, UIOpacity, v3, Vec3, _decorator } from "cc";
import { config } from "../config/config";
import { globalFunc } from "../global/globalFunc";
import { snRes } from "../manager/snRes";

const { ccclass, property } = _decorator;
@ccclass("remindLogic")
export class remindLogic extends Component {
    @property(Label)
    labelContent: Label = null!;

    setText(content: string): void {
        if (!this.labelContent) {
            return;
        }

        Tween.stopAllByTarget(this.node);
        this.node.setPosition(Vec3.ZERO);
        this.labelContent.string = content;
        tween(this.node)
            .delay(1)
            .to(1, { position: v3(0, 400) })
            .start();
        const nodeOpacity = this.node.getComponent(UIOpacity);
        if (nodeOpacity) {
            Tween.stopAllByTarget(nodeOpacity);
            nodeOpacity.opacity = 255;
            tween(nodeOpacity)
                .delay(1)
                .to(1, { opacity: 0 })
                .start();
        }
    }
}
export namespace remindBar {
    export function show(text: string) {
        const callback = async () => {
            let bExist = false;
            let tipsChildren = config.uiNode.tipsNode!.children;
            let nodeRemind = null;
            let remindComp = null;
            for (let i = 0; i < tipsChildren.length; i++) {
                if (tipsChildren[i].name == "remindBar") {
                    bExist = true;
                    nodeRemind = tipsChildren[i];
                    remindComp = nodeRemind!.getComponent(remindLogic);
                    break;
                }
            }
            if (!bExist) {
                nodeRemind = await globalFunc.loadPrefabFromBundle("remind", "remindBar", config.uiNode.tipsNode!);
                if (nodeRemind) {
                    remindComp = nodeRemind.getComponent(remindLogic);
                }
            }
            if (remindComp) {
                remindComp.setText(text);
            }
        };

        callback();
    }
}
