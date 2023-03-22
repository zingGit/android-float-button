import { Button, Component, easing, find, instantiate, Label, Node, sys, tween, Vec3, _decorator } from "cc";
import { audioDef } from "../config/define";
import { globalData } from "../global/globalData";
import { snAudio } from "../manager/snAudio";
import { creator } from "../utils/creator";
const { ccclass, property } = _decorator;

@ccclass("CustomerService")
export class CustomerService extends Component {
    @property(Node)
    nodeBody: Node = null!;
    @property(Node)
    leftNode: Node = null!;
    @property(Node)
    nodeRightScrollViews: Node = null!;
    @property(Node)
    nodeContactParent: Node = null!;
    @property(Node)
    nodeContactItem: Node = null!;

    private leftCotent: Node[] = [];
    private rightCotent: Node[] = [];
    private clickIndex = 0;
    onLoad() {
        this.initNodes();
        this.nodeBody.setScale(Vec3.ZERO);
        this.open();
    }

    start() {
        this.bindLeftBtnEvent();
    }

    private open() {
        this.nodeBody.setScale(Vec3.ZERO);
        tween(this.nodeBody).to(0.3, { scale: Vec3.ONE }, { easing: easing.cubicInOut }).start();
        creator.setActive(this.rightCotent[this.clickIndex], true);
        this.setSeversView();
    }

    private initNodes() {
        this.leftCotent = this.leftNode.children;
        this.rightCotent = this.nodeRightScrollViews.children;

        this.rightCotent.forEach((item) => {
            item.active = false;
        });
    }

    private bindLeftBtnEvent() {
        this.leftCotent.forEach((item, index) => {
            item.on(
                "click",
                () => {
                    this.clickIndex = index;
                    this.setBtnClickState();
                },
                this
            );
        });
    }

    private setBtnClickState() {
        this.leftCotent.forEach((item, index) => {
            if (index == this.clickIndex) {
                creator.setActive(item.getChildByName("nodeSelect"), true);
                creator.setActive(this.rightCotent[index], true);
            } else {
                creator.setActive(item.getChildByName("nodeSelect"), false);
                creator.setActive(this.rightCotent[index], false);
            }
        });
    }

    private openContact(): void {
        if (this.nodeContactParent.children.length > 1) {
            return;
        }

        globalData.customerServices.forEach((item, index) => {
            this.setViewItem(index, item.type, item.nickname, () => {
                snAudio.playAudio(audioDef.clickBtn);
                sys.openURL(this.getUrlStr(item.link));
            });
        });
    }

    private setSeversView() {
        console.log("打印客服数据", globalData.customerServices);
        globalData.customerServices.forEach((info) => {
            if (info.type == "telegram" || info.type == "whatsapp")
                this.setItemView(info.type, info.nickname, () => {
                    snAudio.playAudio(audioDef.clickBtn);
                    sys.openURL(this.getUrlStr(info.link));
                });
        });
    }
    private setItemView(type: string, name: string, callback: Function) {
        const item = instantiate(this.nodeContactItem);
        if (!item) {
            return;
        }
        const sc = new CustomerItem(item);
        sc.setCustomerName(name);
        sc.showInfoSprite(type);
        sc.bindContactBtn(callback);
        item.active = true;
        item.setParent(this.nodeContactParent);
    }

    private getUrlStr(url: string): string {
        url = url.replace("visiter_id=", `visiter_id=${globalData.user.userId}`);
        url = url.replace("visiter_name=", `visiter_name=${globalData.user.nickname ? globalData.user.nickname : "guest"}`);
        return url;
    }

    private setViewItem(index: number, type: string, nickname: string, callback: Function): void {
        const item = instantiate(this.nodeContactItem);
        if (!item) {
            return;
        }

        item.name = `custom_service_${index}`;
        item.setParent(this.nodeContactParent);
        item.active = true;
        let logoName = "nodeLogo/logoEmail";
        if (type == "whatsapp") {
            logoName = "nodeLogo/logoWhatsapp";
        } else if (type == "telegram") {
            logoName = "nodeLogo/logoTelegram";
        }
        const logo = find(logoName, item);
        if (logo) {
            logo.active = true;
        }
        const label = find("labelName", item)?.getComponent(Label);
        if (label) {
            label.string = nickname;
        }
        const btnContact = find("btnContact", item)?.getComponent(Button);
        if (btnContact) {
            btnContact.node.on("click", callback, this);
        }
    }

    private btnCloseCall(): void {
        snAudio.playAudio(audioDef.clickBtn);
        this.node.destroy();
    }

    private btnContactCall(): void {
        snAudio.playAudio(audioDef.clickBtn);
        sys.openURL(this.getUrlStr(globalData.applicaion.customerServiceWebUrl));
    }
}

class CustomerItem {
    private node: Node | undefined;
    private Logos: Node | undefined;
    private nameLabel: Label | undefined;
    private btn: Button | undefined;

    constructor(item: Node) {
        this.node = item;
        this.Logos = this.node.getChildByName("nodeLogo") ?? undefined;
        this.nameLabel = this.node.getChildByName("labelName")?.getComponent(Label) ?? undefined;
        this.btn = this.node.getChildByName("btnContact")?.getComponent(Button) ?? undefined;
    }

    public setCustomerName(namestr: string) {
        if (!this.nameLabel) {
            return;
        }

        this.nameLabel.string = namestr;
    }

    public showInfoSprite(types: string) {
        switch (types) {
            case "whatsapp":
                creator.setActive(this.Logos?.getChildByName("logoWhatsapp"), true);
                break;
            case "telegram":
                creator.setActive(this.Logos?.getChildByName("telegram"), true);
                break;
        }
    }

    public bindContactBtn(callback: Function) {
        this.btn?.node.on("click", callback, this);
    }
}
