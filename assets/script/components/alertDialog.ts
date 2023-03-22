import { Component, find, Label, Node, Vec3, _decorator } from "cc";
import { config } from "../config/config";
import { audioDef } from "../config/define";
import { globalFunc } from "../global/globalFunc";
import { snAudio } from "../manager/snAudio";
const { ccclass, property } = _decorator;

@ccclass("AlertDialogLogic")
export class AlertDialogLogic extends Component {
    @property(Label)
    labelContent: Label = null!;
    @property(Node)
    nodeConfirm: Node = null!;
    @property(Node)
    nodeCancel: Node = null!;
    private callbackConfirm: Function = () => { };
    private callbackCancel: Function = () => { };

    private btnCloseCall(): void {
        snAudio.playAudio(audioDef.clickBtn);
        this.node.destroy();
    }

    private btnConfirmCall(): void {
        snAudio.playAudio(audioDef.clickBtn);
        this.callbackConfirm();
        this.node.destroy();
    }

    private btnCancelCall(): void {
        snAudio.playAudio(audioDef.clickBtn);
        this.callbackCancel();
        this.node.destroy();
    }

    bindConfirmEvent(callback: Function) {
        this.callbackConfirm = callback;
    }

    bindCancelEvent(callback: Function) {
        this.callbackCancel = callback;
    }

    setContent(text: string) {
        if (!this.labelContent) {
            return;
        }

        this.labelContent.string = text;
    }

    setOnlyConfirm() {
        this.nodeConfirm.active = true;
        const oldPos = this.nodeConfirm.getPosition();
        this.nodeConfirm.setPosition(new Vec3(0, oldPos?.y, oldPos?.z));
    }
}

export namespace alertDialog {
    const nodeName = "alertDialog";
    export function show(opt: { content: string; onConfirm: Function; onCancel?: Function; }): void {
        const callback = async () => {
            let bExist = false;
            let alertChildren = config.uiNode.tipsNode!.children;
            let nodeAlert = null;
            let alertComp = null;
            for (let i = 0; i < alertChildren.length; i++) {
                if (alertChildren[i].name == nodeName) {
                    bExist = true;
                    nodeAlert = alertChildren[i];
                    alertComp = nodeAlert!.getComponent(AlertDialogLogic);
                    break;
                }
            }
            if (!bExist) {
                nodeAlert = await globalFunc.loadPrefabFromBundle("remind", nodeName, config.uiNode.tipsNode!);
            }

            if (nodeAlert) {
                alertComp = nodeAlert.getComponent(AlertDialogLogic);
                if (alertComp) {
                    alertComp.setContent(opt.content);
                    alertComp.bindConfirmEvent(opt.onConfirm);
                    if (opt.onCancel) {
                        alertComp.bindCancelEvent(opt.onCancel);
                    } else {
                        alertComp.setOnlyConfirm(); alertComp
                    }
                }
            }
        };

        callback();
    }

    export function close(): void {
        const node = find(nodeName, config.uiNode.tipsNode ?? undefined);
        if (!node) {
            return;
        }

        snAudio.playAudio(audioDef.clickBtn);
        node.destroy();
    }
}
