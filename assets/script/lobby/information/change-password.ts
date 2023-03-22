import { _decorator, Component, Node, Label, EditBox, find, Vec3, tween, easing, Prefab, instantiate, sys, input } from 'cc';
import { api } from '../../api/api';
import { Countdown } from '../../components/countdown';
import { remindBar } from '../../components/remindBar';
import { config } from '../../config/config';
import { storageKey } from '../../config/define';
import { i18nHttpCode, i18nLabelRes } from '../../i18n/i18n';
import { snRes } from '../../manager/snRes';
import {validator} from "../../utils/validator"
const { ccclass, property } = _decorator;

@ccclass('ChangePassword')
export class ChangePassword extends Component {

    private nodeMask: Node | null = null
    private nodeBody: Node | null = null
    private nodeSendVerif: Node | null = null
    private nodeSubmit: Node | null = null
    private btnExit: Node | null = null
    
    private btnShowpw: Node | null = null
    private btnHidepw: Node | null = null
    
    private labelAreaCode: Label | null = null
    private editboxPhoneNum: EditBox | null = null
    private editboxPassword: EditBox | null = null
    private editboxVerifCode: EditBox | null = null


    onLoad() {
        
        this.initNode()
        this.initBind()

    }

    start() {
        this.viewIn()
    }

    public viewIn() {

        this.nodeBody?.setScale(Vec3.ZERO);
        tween(this.nodeBody).to(0.3, { scale: Vec3.ONE }, { easing: easing.cubicOut })
        .call( ()=> {
            this.nodeMask.active = true
        }).start();
    }


    private initNode() {

        this.nodeMask = find("mask", this.node)
        this.nodeBody = find("body", this.node)
        this.nodeSendVerif = find("body/node_smscode/btn_sendsms", this.node)
        this.nodeSubmit = find("body/btn_submit", this.node)
        this.btnExit = find("body/btn_exit", this.node)
        this.btnShowpw = find("body/node_password/btn_showpw", this.node)
        this.btnHidepw = find("body/node_password/btn_hidepw", this.node)

        this.labelAreaCode = find("body/node_phonenum/node_area/label_area_code", this.node)?.getComponent(Label)
        this.editboxPhoneNum = find("body/node_phonenum/node_phone/editbox_phone", this.node)?.getComponent(EditBox)
        this.editboxPassword = find("body/node_password/editbox_password", this.node)?.getComponent(EditBox)
        this.editboxVerifCode = find("body/node_smscode/node_verif_code/editbox_verif_code", this.node)?.getComponent(EditBox)
    }

    private initBind() {
        this.nodeSendVerif.on("click", this.onSendVerifCode, this)
        this.nodeSubmit.on("click", this.onSubmit, this)
        this.btnExit.on("click", this.onBtnExit, this)
        this.btnShowpw.on("click", this.onShowPassword, this)
        this.btnHidepw.on("click", this.onHidePassword, this)
    }

    private onShowPassword() {
        this.editboxPassword.inputFlag = EditBox.InputFlag.PASSWORD
        this.btnShowpw.active = false
        this.btnHidepw.active = true
    }

    private onHidePassword() {
        this.editboxPassword.inputFlag = EditBox.InputFlag.DEFAULT
        this.btnShowpw.active = true
        this.btnHidepw.active = false
    }

    private onSubmit() {

        const password = this.editboxPassword.string
        const telNumber = this.editboxPhoneNum.string
        const data = {
            password,
            telNumber,
            otp: this.editboxVerifCode.string,
            areaCode: this.labelAreaCode.string?.substring(1) ?? "",
        }
        
        api.forgetPassword(data).then( resp => {
            if(resp.code !== 1) {
                return
            }
            remindBar.show(i18nLabelRes.labelAsync("remind_reset_password"))
            sys.localStorage.setItem(storageKey.phone, data.telNumber)
            sys.localStorage.setItem(storageKey.password, data.password)
            this.node.destroy()
        })
        .catch( error => {
            remindBar.show(i18nHttpCode(error.code))
        })
    }

    private onSendVerifCode() {

        const password = this.editboxPassword.string
        const telNumber = this.editboxPhoneNum.string
        if (!validator.phone(telNumber)) {
            return remindBar.show(i18nLabelRes.labelAsync("remind_phone_invailed"))
        }
        if (!validator.password(password)) {
            return remindBar.show(i18nLabelRes.labelAsync("remind_password_invailed"))
            
        }

        const sendCodeComp = this.nodeSendVerif.getComponent(Countdown)
        sendCodeComp?.countdown(config.smsRequestInterval / 1000)

        const data = { 
            type: 4, 
            countryNumber: this.labelAreaCode.string?.substring(1) ?? "", 
            telNumber: this.editboxPhoneNum.string 
        }
        api.fetchSmsCode(data).then(() => {

            remindBar.show(i18nLabelRes.labelAsync("remind_send_code"))
        })
        .catch((err) => {
            remindBar.show(i18nHttpCode(err.code))
        });
    }

    private onBtnExit() {
        this.node.destroy()
    }

}


export namespace ChangePasswordHelper {
    let nodeCache: Prefab | undefined
    export function clear() { nodeCache = undefined }
    export function show() {
        const nodeName = "ChangePasswordHelper";
        const callback = async () => {
            if (!nodeCache) {
                const prefab = await snRes.loadAsync<Prefab>("lobby-model", "change-password")
                if (!prefab) {
                    return
                }
                
                nodeCache = prefab
            }
            
            const node = instantiate(nodeCache)
            node.name = nodeName
            node.setParent(config.uiNode.windowNode)
            node.setPosition(Vec3.ZERO)
        }

        callback()
    }
}
