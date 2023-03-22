import { _decorator, Component, Node, Label, Vec3 } from 'cc';
import { config } from '../../config/config';
import { audioDef } from '../../config/define';
import { globalFunc } from '../../global/globalFunc';
import { snAudio } from '../../manager/snAudio';
const { ccclass, property } = _decorator;

@ccclass('RemindLogic')
export class RemindLogic extends Component {
    @property(Label)
    labelContent: Label = null!;
    private callbackConfirm: Function = () => { };
    private callbackCancel: Function = () => { };

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
}

export namespace RemindDialog {
    const nodeName = "remindDialog";
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
                    alertComp = nodeAlert!.getComponent(RemindLogic);
                    break;
                }
            }
            if (!bExist) {
                nodeAlert = await globalFunc.loadPrefabFromBundle("addCashWithdraw", nodeName, config.uiNode.tipsNode!);
            }

            if (nodeAlert) {
                alertComp = nodeAlert.getComponent(RemindLogic);
                if (alertComp) {
                    alertComp.setContent(opt.content);
                    alertComp.bindConfirmEvent(opt.onConfirm);
                    if (opt.onCancel) {
                        alertComp.bindCancelEvent(opt.onCancel);
                    }
                }
            }
        };

        callback();
    }
}
