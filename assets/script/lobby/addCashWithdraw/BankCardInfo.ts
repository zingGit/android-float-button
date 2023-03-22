import { Component, EditBox, sys, _decorator } from 'cc';
import { api } from '../../api/api';
import { Throttle } from '../../components/throttle';
import { eventKey } from '../../config/define';
import { globalData } from '../../global/globalData';
import { globalFunc } from '../../global/globalFunc';
import { snEvent } from '../../manager/snEvent';
import { RemindDialog } from './RemindDialog';
const { ccclass, property } = _decorator;

@ccclass('BankCardInfo')
export class BankCardInfo extends Component {
    @property(EditBox)      // 姓名
    editBoxName: EditBox = null!;
    @property(EditBox)      // 邮件
    editBoxEmail: EditBox = null!;
    @property(EditBox)      // 手机号
    editBoxMobile: EditBox = null!;
    @property(EditBox)      // CFP
    editBoxCFP: EditBox = null!;
    @property(EditBox)      // Pix账号
    editBoxPixAccount: EditBox = null!;
    @property(EditBox)      // Pix类型
    editBoxPixType: EditBox = null!;
    private nCardID: number = 0;        // 银行卡ID，编辑银行卡时才会赋值

    start() {
        globalFunc.change2OrientationLandscape(false);
    }
    // 给银行卡ID赋值
    async setBankCardID(id: number): Promise<void> {
        this.nCardID = id;
        const findData = await api.fetchFindBankCardInfo(id);
        if (findData.code == 1) {
            this.editBoxName.string = findData.data.name;
            this.editBoxEmail.string = findData.data.email;
            this.editBoxMobile.string = findData.data.payee_phone;
            this.editBoxCFP.string = findData.data.payee_cpf;
            this.editBoxPixAccount.string = findData.data.pix_account;
            this.editBoxPixType.string = findData.data.pix_type;
        }
    }

    @Throttle(1000)
    private async onBtnConfirm(): Promise<void> {
        if (this.editBoxName.string == "" || this.editBoxEmail.string == "" || this.editBoxMobile.string == ""
            || this.editBoxCFP.string == "" || this.editBoxPixAccount.string == "" || this.editBoxPixType.string == "") {
            RemindDialog.show({
                content: "请完善您的信息",
                onConfirm: () => {

                },
            });
            return;
        }
        let resultData = { code: 0 };
        let cardData: any = {
            name: this.editBoxName.string,
            email: this.editBoxEmail.string,
            payee_phone: this.editBoxMobile.string,
            payee_cpf: this.editBoxCFP.string,
            pix_account: this.editBoxPixAccount.string,
            pix_type: this.editBoxPixType.string
        }
        if (this.nCardID) {
            cardData.id = this.nCardID;
            resultData = await api.fetchUpdateBankCard(cardData);
        } else {
            resultData = await api.fetchAddBankCard(cardData);
            if (resultData.code == 1) {
                snEvent.emit(eventKey.bindingBancard);
            }
        }
        if (resultData.code == 1) {
            snEvent.emit(eventKey.refreshManageBankCard);
            this.onBtnBack();
        } else {
            RemindDialog.show({
                content: "信息有误，请核对无误后再提交",
                onConfirm: () => {

                },
            });
        }
    }
    // 客服
    @Throttle(1000)
    private onBtnCustomService(): void {
        sys.openURL(globalData.applicaion.customerServiceWebUrl);
    }
    // 返回上层
    private onBtnBack(): void {
        if (this.node.parent.name == "nodeWindow") {
            globalFunc.change2OrientationLandscape(true);
        }
        this.node.removeFromParent();
    }
}

