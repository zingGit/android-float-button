import { Component, EditBox, Label, Node, sys, _decorator } from "cc";
import { api } from "../api/api";
import { Countdown } from "../components/countdown";
import { remindBar } from "../components/remindBar";
import { config } from "../config/config";
import { storageKey } from "../config/define";
import { globalData } from "../global/globalData";
import { globalFunc } from "../global/globalFunc";
import { i18nHttpCode, i18nLabelRes } from "../i18n/i18n";
import { moLog } from "../utils/logger";
import { validator } from "../utils/validator";
import { LoginFrame } from "./loginFrame";
const { ccclass, property } = _decorator;

@ccclass("RegisterOrForgotPswd")
export class RegisterOrForgotPswd extends Component {
    @property(Node)         // 注册界面
    nodeRegist: Node = null!;
    @property(Node)         // 忘记密码界面
    nodeForgetPswd: Node = null!;
    @property(Node)         // 区号列表
    nodeAreaCodeList: Node = null!;
    @property(Label)        // 当前区号
    labelAreaCode: Label = null!;
    // 当前区号，不带+，纯数字的字符串
    private areaCodeStr: string = "";
    @property(Node)         // 当前显示密码
    nodeEyeOpened: Node = null!;
    @property(Node)         // 当前隐藏密码
    nodeEyeClosed: Node = null!;
    @property(EditBox)      // 手机号输入框
    editBoxAccount: EditBox = null!;
    @property(EditBox)      // 密码输入框
    editBoxPassword: EditBox = null!;
    @property(Node)         // 发送验证码按钮
    nodeSendCode: Node = null!;
    @property(EditBox)      // 验证码输入框
    editBoxCode: EditBox = null!;

    private loginComp: LoginFrame = null!;

    start() {
        this.areaCodeStr = this.labelAreaCode.string?.substring(1) ?? "";
    }

    initRegister(node: Node): void {
        this.nodeRegist.active = true;
        this.loginComp = node.getComponent(LoginFrame)!;
    }

    initForgotPswd(node: Node): void {
        this.nodeForgetPswd.active = true;
        this.loginComp = node.getComponent(LoginFrame)!;
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
    // 发送验证码
    private btnSendCodeCall(): void {
        if (!this.verifyPhoneAndPswd()) {
            return;
        }

        let nowTime = new Date().getTime();
        if (nowTime - Number(storageKey.lastSmsRequestTime) < config.smsRequestInterval) {
            remindBar.show(i18nLabelRes.labelAsync("remind_verify_code"));
            return;
        }
        sys.localStorage.setItem(storageKey.lastSmsRequestTime, `${nowTime}`);
        const sendCodeComp = this.nodeSendCode.getComponent(Countdown);
        if (sendCodeComp) {
            sendCodeComp.countdown(config.smsRequestInterval / 1000);
            let type = 0;   // 无效类型
            if (this.nodeRegist.active && !this.nodeForgetPswd.active) {
                type = 3;   // 注册
            } else if (!this.nodeRegist.active && this.nodeForgetPswd.active) {
                type = 4;   // 忘记密码
            }
            api.fetchSmsCode({ type: type, countryNumber: this.areaCodeStr, telNumber: this.editBoxAccount.string })
                .then(() => {
                    remindBar.show(i18nLabelRes.labelAsync("remind_send_code"));
                })
                .catch((err) => {
                    moLog.error(`error: ${JSON.stringify(err)}`);
                    remindBar.show(i18nHttpCode(err.code));
                });
        }
    }
    // 注册提交
    private btnRegistCommitCall(): void {
        if (!this.verifyPhoneAndPswd()) {
            return;
        }

        const smsCode = this.editBoxCode.string;
        if (!validator.smsCode(smsCode)) {
            remindBar.show(i18nLabelRes.labelAsync("remind_verifycode_wrong"));
            return;
        }

        globalFunc.showLoading();
        const payload = {
            areaCode: this.areaCodeStr,
            otp: smsCode,
            password: this.editBoxPassword.string,
            telNumber: this.editBoxAccount.string,
        };

        api.register(payload)
            .then((response) => {
                remindBar.show(i18nLabelRes.labelAsync("remind_regist_success"));
                this.loginComp.setAccountAndPswd(this.editBoxAccount.string, this.editBoxPassword.string);
                this.loginComp.loginFunc();
            })
            .catch((err) => {
                moLog.error(`register: ${JSON.stringify(err)}`);
                remindBar.show(i18nHttpCode(err.code));
                globalFunc.hideLoading();
            });
    }
    // 忘记密码提交
    private btnForgetPswdCommitCall(): void {
        if (!this.verifyPhoneAndPswd()) {
            return;
        }

        const smsCode = this.editBoxCode.string;
        if (!validator.smsCode(smsCode)) {
            remindBar.show(i18nLabelRes.labelAsync("remind_verifycode_wrong"));
            return;
        }

        globalFunc.showLoading();
        const payload = {
            areaCode: this.areaCodeStr,
            password: this.editBoxPassword.string,
            otp: smsCode,
            telNumber: this.editBoxAccount.string,
        };

        api.forgetPassword(payload)
            .then((response) => {
                remindBar.show(i18nLabelRes.labelAsync("remind_reset_password"));
                this.loginComp.setAccountAndPswd(this.editBoxAccount.string, this.editBoxPassword.string);
                this.loginComp.loginFunc();
            })
            .catch((err) => {
                moLog.error(`forget password: ${JSON.stringify(err)}`);
                remindBar.show(i18nHttpCode(err.code));
                globalFunc.hideLoading();
            });
    }

}
