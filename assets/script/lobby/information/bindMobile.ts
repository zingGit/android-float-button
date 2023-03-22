import { _decorator, Component, Node, find, EditBox } from 'cc';
import { api } from '../../api/api';
import { Countdown } from '../../components/countdown';
import { remindBar } from '../../components/remindBar';
import { config } from '../../config/config';
import { eventKey } from '../../config/define';
import { globalData } from '../../global/globalData';
import { i18nHttpCode, i18nLabelRes } from '../../i18n/i18n';
import { snEvent } from '../../manager/snEvent';
const { ccclass, property } = _decorator;

@ccclass('BindMobile')
export class BindMobile extends Component {

    private btnExit: Node | null = null
    private btnConfirm: Node | null = null
    private btnSendSms: Node | null = null

    private editboxPhone: EditBox | null = null
    private editboxPw: EditBox | null = null
    private editboxOtp: EditBox | null = null


    start() {
        this.initNode()
        this.initBind()
    }


    private initNode() {

        this.btnExit = find("body/close_btn", this.node)
        this.btnConfirm = find("body/info_confirm", this.node)
        this.btnSendSms = find("body/otp/send", this.node)

        this.editboxPhone = find("body/phone/EditBox", this.node)?.getComponent(EditBox)
        this.editboxPw = find("body/password/EditBox", this.node)?.getComponent(EditBox)
        this.editboxOtp = find("body/otp/EditBox", this.node)?.getComponent(EditBox)
    }

    private initBind() {
        this.btnConfirm.on("click", this.onConfirm, this)
        this.btnExit.on("click", this.onCloseView, this)
        this.btnSendSms.on("click", this.onSendSms, this)
    }

    private onSendSms() {

        const data = {
            type: 2,
            countryNumber: "55",
            telNumber: this.editboxPhone.string

        }
        api.fetchSmsCode(data)
        .then(() => {
            remindBar.show(i18nLabelRes.labelAsync("remind_send_code"));
        })
        .catch((err) => {
            remindBar.show(i18nHttpCode(err.code));
        });

        const sendCodeComp = this.btnSendSms.getComponent(Countdown);
        sendCodeComp?.countdown(config.smsRequestInterval / 1000);
    }

    private onConfirm() {

        const data = {
            areaCode: "55",
            otp: this.editboxOtp.string,
            password: this.editboxPw.string,
            telNumber: this.editboxPhone.string,
        }

        api.verifyPhone(data)
        .then( resp => {
            if(resp.code == 1) {
                globalData.user.phone = resp.data.telNumber
                snEvent.emit(eventKey.refreshBindInfo)
                this.node.destroy()
            }
        })


    }

    private onCloseView() {
        this.node.destroy()
    }


}

