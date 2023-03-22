import { _decorator, Button, Component, find, Label, Node, Sprite } from "cc";
import { strings } from "../utils/strings";
import { globalData } from "../global/globalData";
import { creator } from "../utils/creator";
import { globalFunc } from "../global/globalFunc";
const { ccclass, property } = _decorator;

@ccclass("PersonalinfoView")
export class PersonalinfoView extends Component {
    private avatarBtn: Button | undefined;
    private avatarSprite: Sprite | undefined;
    private nickNameBtn: Button | undefined;
    private nickNameLabel: Label | undefined;
    private vipLabel: Label | undefined;
    private userIdLabel: Label | undefined;
    private changePhone: Node | undefined;
    private bindPhone: Node | undefined;
    private btnChangePassword: Button | undefined;

    private phoneNumber: Label | undefined;

    onLoad() {
        this.avatarBtn = find("avatar", this.node)?.getComponent(Button) ?? undefined;
        this.nickNameBtn = find("nickName", this.node)?.getComponent(Button) ?? undefined;
        this.btnChangePassword = find("phone/changephone/btn", this.node)?.getComponent(Button) ?? undefined;

        this.avatarSprite = find("avatar/avatarSprite", this.node)?.getComponent(Sprite) ?? undefined;

        this.nickNameLabel = find("nickName/Label", this.node)?.getComponent(Label) ?? undefined;
        this.vipLabel = find("avatar/vipLabel", this.node)?.getComponent(Label) ?? undefined;
        this.userIdLabel = find("playerId/Label", this.node)?.getComponent(Label) ?? undefined;
        this.phoneNumber = find("phone/changephone/Label", this.node)?.getComponent(Label) ?? undefined;

        this.changePhone = find("phone/changephone", this.node) ?? undefined;
        this.bindPhone = find("phone/bindphone", this.node) ?? undefined;
    }

    public bindChangePhoneEvent(callback: Function) {
        this.btnChangePassword?.node.on("click", callback);
    }

    public bindPhoneEvent(callback: Function) {
        this.bindPhone?.on("click", callback);
    }

    public bindAvatarBtn(callback: Function) {
        this.avatarBtn?.node.on("click", callback);
    }

    public bindNickNameBtn(callback: Function) {
        this.nickNameBtn?.node.on("click", callback);
    }

    public setView() {
        this.setBindPhoneState();
        this.setNameLabel();
        this.setUserid();
        this.setPhoneNumber();
        this.setVipLabel();
        this.setAvatarSprite();
    }

    private setBindPhoneState() {
        if (globalData.user.phone.length >= 1) {
            creator.setActive(this.changePhone, true);
            creator.setActive(this.bindPhone, false);
        } else {
            creator.setActive(this.changePhone, false);
            creator.setActive(this.bindPhone, true);
        }
    }

    private setNameLabel() {
        if (!this.nickNameLabel) {
            return;
        }

        this.nickNameLabel.string = strings.ellipsis(globalData.user.nickname, 20);
    }

    private setUserid() {
        if (!this.userIdLabel) {
            return;
        }

        this.userIdLabel.string = `${globalData.user.userId}`;
    }

    private setPhoneNumber() {
        if (!this.phoneNumber) {
            return;
        }
        this.phoneNumber.string = globalData.user.phone;
    }

    private setVipLabel() {
        if (!this.vipLabel) {
            return;
        }
        this.vipLabel.string = `${globalData.user.vipLevel}`;
    }

    private async setAvatarSprite(): Promise<void> {
        if (!this.avatarSprite) {
            return;
        }

        const avatarFrame = await globalFunc.getAvatarImage(globalData.user.avatarId);
        if (!avatarFrame) {
            return;
        }
        this.avatarSprite.spriteFrame = avatarFrame;
    }
}
