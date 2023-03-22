import { Button, Color, Component, easing, find, instantiate, Label, LabelOutline, Node, Prefab, Sprite, tween, Vec3, _decorator } from "cc";
import { api } from "../api/api";
import { remindBar } from "../components/remindBar";
import { config } from "../config/config";
import { snRes } from "../manager/snRes";
import { MessageItem } from "./message-item";
const { ccclass, property } = _decorator;

@ccclass("MessageLogic")
export class MessageLogic extends Component {
    private closeBtn: Node | undefined;
    private bodyNode: Node | undefined;
    private clearupBtn: Node | undefined;
    private clearallBtn: Node | undefined;
    private itemNode: Node | undefined;
    private contentView: Node | undefined;
    private messageInfoMap: Map<string | number, IMessageInfo> = new Map();

    onLoad() {
        this.closeBtn = find("body/close_btn", this.node)
        this.bodyNode = find("body", this.node) ?? undefined;
        this.clearupBtn = find("body/clearup_btn", this.node)
        this.clearallBtn = find("body/clearall_btn", this.node)
        this.itemNode = find("body/itemNode", this.node) ?? undefined;
        this.contentView = find("body/ScrollView/view/content", this.node) ?? undefined;
        // this.bodyNode?.setScale(Vec3.ZERO);
        this.initBind()
    }

    private initBind() {
        this.clearallBtn.on("click", this.takeAllCoins, this)
        this.clearupBtn.on("click", this.deleteAll, this)
        this.closeBtn?.on("click", this.moveOut, this);
    }

    public moveIn() {
        tween(this.bodyNode).to(0.3, { scale: Vec3.ONE }, { easing: easing.cubicOut }).start();
    }


    public moveOut() {
        this.node.destroy();
        // tween(this.bodyNode)
        //     .to(0.3, { scale: Vec3.ZERO }, { easing: easing.cubicOut })
        //     .call(() => {
        //     })
        //     .start();
    }

    public setitemView(id: number) {
        if (!this.itemNode) {
            return;
        }

        const info = this.messageInfoMap.get(id);
        if (!info) {
            return;
        }

        const item = instantiate(this.itemNode);
        this.contentView?.addChild(item);
        const sc = item.getComponent(MessageItem)
        sc.setItemInfo(info)

    }

    public addMessageInfo(info: IMessageInfo) {
        this.messageInfoMap.set(info.msgId, info);
    }

    public deleteAll() {

        api.deleteEmail({})
            .then(resp => {
                if (resp.code == 1) {
                    console.warn("删除成功！")
                    this.contentView.removeAllChildren()
                    this.forbiddenButton();
                }
            })
            .catch(error => {
                remindBar.show(error.msg)
            })

    }

    public forbiddenButton(): void {
        this.clearupBtn.getComponent(Button).interactable = false;
        this.clearupBtn.getComponent(Sprite).grayscale = true;
        this.clearupBtn.children[0].getComponent(LabelOutline).width = 0;
        this.forbiddenCollectAllBtn();
    }
    private forbiddenCollectAllBtn(): void {
        this.clearallBtn.getComponent(Button).interactable = false;
        this.clearallBtn.getComponent(Sprite).grayscale = true;
        this.clearallBtn.children[0].getComponent(LabelOutline).width = 0;
    }

    private takeAllCoins() {
        api.takeAllCoins()
            .then(resp => {
                if (resp.code == 1) {
                    console.warn(`takeAllCoins:${JSON.stringify(resp)}`)
                    remindBar.show("Successful!")
                    this.forbiddenCollectAllBtn();
                }
            })
            .catch(err => { })
    }
}

export interface IMessageInfo {
    balance: number;
    msgId: number;
    effectiveTime: number;
    endTime: number;
    status: number;
    title: string;
    content: string
}


export namespace MessageHandle {
    let messagePrefab: Prefab | undefined;
    const prefabName = "message-box";

    export function show() {
        const callback = async () => {
            if (!messagePrefab) {
                const prefab = await snRes.loadAsync<Prefab>("lobby-model", "message-box");
                if (!prefab) {
                    return;
                }
                messagePrefab = prefab;
            }

            const itemNode = instantiate(messagePrefab);
            itemNode.name = prefabName;
            itemNode.setParent(config.uiNode.windowNode);
            // itemNode.setPosition(Vec3.ZERO);
            const sc = itemNode.addComponent(MessageLogic);
            // sc.moveIn();

            api.fetsystemmsg({ pageIndex: 1, pageSize: 20 }).then((resp) => {
                const { data } = resp;
                const messages = data.messages;

                if (messages.length) {
                    messages.forEach((info: IMessageInfo) => {
                        sc.addMessageInfo(info);
                        sc.setitemView(info.msgId);
                    });
                } else {
                    sc.forbiddenButton();
                }
            });
        };

        callback();
    }
}
