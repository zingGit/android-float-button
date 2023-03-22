import { _decorator, Button, Component, easing, find, instantiate, Label, Node, Prefab, Sprite, tween, Vec3 } from "cc";
import { currency } from "../utils/currency";
import { creator } from "../utils/creator";
import { IMessageInfo } from "./message-box";
import { snRes } from "../manager/snRes";
import { config } from "../config/config";
import { globalData } from "../global/globalData";
import { api } from "../api/api";
import { rewardDialog } from "../reward/reward";
import { remindBar } from "../components/remindBar";
const { ccclass, property } = _decorator;

@ccclass("MessageContentView")
class MessageContentView extends Component {
    private bodyNode: Node | undefined;
    private contentTitle: Label | undefined;
    private playerName: Label | undefined;
    private contenLabel: Label | undefined;
    private collectBtn: Button | undefined;
    private collectSprite: Sprite | undefined;
    private removeBtn: Button | undefined;
    private closeBtn: Button | undefined;
    private collectGold: Node | undefined;
    private coinLabel: Label | undefined;
    public msgId: number = 0

    onLoad() {
        this.bodyNode = find("body", this.node) ?? undefined;
        this.contentTitle = find("bodyNode/contentTitle", this.node)?.getComponent(Label) ?? undefined;
        this.playerName = find("bodyNode/plaerName", this.node)?.getComponent(Label) ?? undefined;
        this.contenLabel = find("bodyNode/content", this.node)?.getComponent(Label) ?? undefined;
        this.collectBtn = find("bodyNode/collect_btn", this.node)?.getComponent(Button) ?? undefined;
        this.removeBtn = find("bodyNode/remove_btn", this.node)?.getComponent(Button) ?? undefined;
        this.closeBtn = find("bodyNode/close_btn", this.node)?.getComponent(Button) ?? undefined;
        this.collectGold = find("bodyNode/collect_glod", this.node) ?? undefined;
        this.coinLabel = find("bodyNode/collect_glod/amount", this.node)?.getComponent(Label) ?? undefined;
        this.collectSprite = this.collectBtn?.node.getComponent(Sprite) ?? undefined;
    }

    setMsgId(id: number) {
        this.msgId = id
    }
    start() {
        this.closeBtn?.node.on(
            "click",
            () => {
                this.node.destroy();
            },
            this
        );

        this.removeBtn?.node.on(
            "click",
            () => {
                api.deleteEmail({msgId: this.msgId})
                .then( resp => {
                    if(resp.code == 1) {
                        console.warn("删除成功！")
                        this.node.destroy();

                    }
                })
                .catch( error => {
                    remindBar.show(error.msg)
                })
            },
            this
        );
    }

    public moveIn() {
        tween(this.bodyNode).to(0.3, { scale: Vec3.ONE }, { easing: easing.cubicOut }).start();
    }

    public bindCollectBtnEvent(callback: Function) {
        this.collectBtn?.node.on("click", callback, this);
    }

    public bindRemoveBtn(callback: Function) {
        this.removeBtn?.node.on("click", callback, this);
    }

    public setContentTitleLabel(titleStr: string) {
        if (!this.contentTitle) {
            return;
        }

        this.contentTitle.string = titleStr;
    }

    public setNickName(nameStr: string) {
        if (!this.playerName) {
            return;
        }
        this.playerName.string = nameStr;
    }

    public setCotentTex(contentTex: string) {
        if (!this.contenLabel) {
            return;
        }
        this.contenLabel.string = contentTex;
    }

    public setCoinNode(msgType: number, amount: number) {
        this.setCoinState(msgType == 1);
        if (msgType == 1) {
            if (this.coinLabel) {
                this.coinLabel.string = `R$ ${currency.itoa(amount)}`;
            }
        }
    }

    public setReceiveBtnState(receive: boolean) {
        if (!this.collectBtn) {
            return;
        }

        this.collectBtn.interactable = receive;

        if (!this.collectSprite) {
            return;
        }
        this.collectSprite.grayscale = !receive;
    }

    private setCoinState(active: boolean) {
        creator.setActive(this.collectGold, active);
        creator.setActive(this.collectBtn?.node, active);
    }
}

export namespace msgContent {
    const nodeName = "message-content";
    let nodeCache: Prefab | undefined;

    export function show(info: IMessageInfo) {
        const callback = async () => {
            if (!nodeCache) {
                const prefab = await snRes.loadAsync<Prefab>("lobby-model", "message-content");
                if (!prefab) {
                    return;
                }

                nodeCache = prefab;
            }

            const node = instantiate(nodeCache);
            node.name = nodeName;
            node.setParent(config.uiNode.windowNode);
            node.setPosition(Vec3.ZERO);
            const sc = node.addComponent(MessageContentView);
            sc.setContentTitleLabel(info.title);
            sc.setNickName(globalData.user.nickname);
            sc.setCotentTex(info.content);
            sc.setMsgId(info.msgId)
            // sc.setCoinNode(info.msgType, info.amount);
            // sc.setReceiveBtnState(info.receive);
            sc.bindCollectBtnEvent(() => {
                api.takeCoins({msgId: info.msgId }).then((resp) => {
                    const { data } = resp;
                    rewardDialog.show({ amount: data.balance });
                    sc.setReceiveBtnState(false);
                });
            });

            sc.moveIn();
        };

        callback();
    }
}
