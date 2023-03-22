import { Component, EditBox, Label, Node, sys, _decorator } from "cc";
import { api } from "../api/api";
import { alertDialog } from "../components/alertDialog";
import { remindBar } from "../components/remindBar";
import { config } from "../config/config";
import { eventKey, storageKey } from "../config/define";
import { globalData } from "../global/globalData";
import { globalFunc } from "../global/globalFunc";
import { i18nHttpCode, i18nLabelRes } from "../i18n/i18n";
import { snEvent } from "../manager/snEvent";
import { Net } from "../net/net";
import { moLog } from "../utils/logger";
import { validator } from "../utils/validator";
import { loginSender } from "./loginSender";
import { RegisterOrForgotPswd } from "./registerOrForgotPswd";
const { ccclass, property } = _decorator;

@ccclass("LoginFrame")
export class LoginFrame extends Component {
    @property(Node) // 区号列表
    nodeAreaCodeList: Node = null!;
    @property(Label) // 当前区号
    labelAreaCode: Label = null!;
    // 当前区号，不带+，纯数字的字符串
    private areaCodeStr: string = "";
    @property(Node) // 当前显示密码
    nodeEyeOpened: Node = null!;
    @property(Node) // 当前隐藏密码
    nodeEyeClosed: Node = null!;
    @property(EditBox) // 手机号输入框
    editBoxAccount: EditBox = null!;
    @property(EditBox) // 密码输入框
    editBoxPassword: EditBox = null!;
    // 是否连接成功
    private bConnectSucess: boolean = false;

    start() {

        this.areaCodeStr = this.labelAreaCode.string?.substring(1) ?? "";
        this.editBoxAccount.string = sys.localStorage.getItem(storageKey.phone) ?? "";
        this.editBoxPassword.string = sys.localStorage.getItem(storageKey.password) ?? "";

    }

    private btnCloseSelfCall(): void {
        this.node.destroy();
    }

    private btnShowAreaCodeList(): void {
        this.nodeAreaCodeList.active = !this.nodeAreaCodeList.active;
    }

    private btnHideAreaCodeList(): void {
        if (this.nodeAreaCodeList.active) {
            this.nodeAreaCodeList.active = false;
        }
    }

    // customData: 1.+55 2.+86
    private btnSelectAreaCode(event: Event, customData: string): void {
        this.nodeAreaCodeList.active = false;
        if (customData == "1") {
            this.labelAreaCode.string = "+55";
            remindBar.show("选择区号+55成功");
        } else if (customData == "2") {
            this.labelAreaCode.string = "+86";
            remindBar.show("选择区号+86成功");
        }

        this.areaCodeStr = this.labelAreaCode.string?.substring(1) ?? "";
    }

    private btnEyeOpenedCall(): void {
        this.nodeEyeOpened.active = false;
        this.nodeEyeClosed.active = true;
        this.editBoxPassword.inputFlag = EditBox.InputFlag.PASSWORD;
    }

    private btnEyeClosedCall(): void {
        this.nodeEyeOpened.active = true;
        this.nodeEyeClosed.active = false;
        this.editBoxPassword.inputFlag = EditBox.InputFlag.DEFAULT;
    }
    private async btnRegistToOpenCall(): Promise<void> {
        const node = await globalFunc.loadPrefabFromBundle("login", "registerOrForgotPswd", this.node);
        const comp = node?.getComponent(RegisterOrForgotPswd);
        if (comp) {
            comp.initRegister(this.node);
        }
    }

    private async btnForgetPswdCall(): Promise<void> {
        const node = await globalFunc.loadPrefabFromBundle("login", "registerOrForgotPswd", this.node);
        const comp = node?.getComponent(RegisterOrForgotPswd);
        if (comp) {
            comp.initForgotPswd(this.node);
        }
    }

    private btnLoginCall(): void {
        this.loginFunc();
    }
    // 验证手机号和密码
    private verifyPhoneAndPswd(): boolean {
        const phoneStr = this.editBoxAccount.string;
        if (!validator.phone(phoneStr)) {
            remindBar.show(i18nLabelRes.labelAsync("remind_phone_invailed"));
            return false;
        }

        const pswdStr = this.editBoxPassword.string;
        if (!validator.password(pswdStr)) {
            remindBar.show(i18nLabelRes.labelAsync("remind_password_invailed"));
            return false;
        }

        return true;
    }
    public setAccountAndPswd(accountStr: string, passwordStr: string): void {
        this.editBoxAccount.string = accountStr;
        this.editBoxPassword.string = passwordStr;
    }
    public loginFunc(): void {

        globalFunc.showLoading();
        const phone = this.editBoxAccount.string;
        const password = this.editBoxPassword.string;

        const payload = {
            areaCode: this.areaCodeStr,
            telNumber: phone,
            password: password,
        };

        api.login(payload)
            .then((response) => {
                const { data } = response;
                console.log("登录成功", data);
                sys.localStorage.setItem(storageKey.phone, phone);
                sys.localStorage.setItem(storageKey.password, password);
                sys.localStorage.setItem(storageKey.authorization, data.token);
                globalData.user.userId = data.userId;
                globalData.user.authorization = data.token;
                api.addAuthorization(globalData.user.authorization);
                this.gotoLobbyView()
            })
            .catch((err) => {
                moLog.error(`error: ${JSON.stringify(err)}`);
                remindBar.show(i18nHttpCode(err.code));
                globalFunc.hideLoading();
            });


    }

    private async gotoLobbyView() {
        const node = await globalFunc.loadPrefabFromBundle("lobby", "lobbyHome", config.uiNode.sceneNode!);
        if (node) {
            globalFunc.changeSceneNode(node);
        }
        globalData.applicaion.bFirstLogin = false;
    }
}
