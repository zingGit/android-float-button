import { _decorator, Component, Node, find, Toggle, Label, Sprite, instantiate, Prefab, Event, sys, Color } from 'cc';
import { api } from '../../api/api';
import { config } from '../../config/config';
import { eventKey } from '../../config/define';
import { globalData } from '../../global/globalData';
import { globalFunc } from '../../global/globalFunc';
import { snEvent } from '../../manager/snEvent';
import { snRes } from '../../manager/snRes';
import { currency } from '../../utils/currency';
import { time } from '../../utils/time';
import { BankItem } from './bankItem';
import { sdk } from "../../native-helper/sdk";
import { ChangePasswordHelper } from './change-password';
const { ccclass, property } = _decorator;

@ccclass('Information')
export class Information extends Component {

    private nodeMask: Node | null = null
    private nodeViewRoot: Node | null = null
    private nodeCashItem: Node | null = null
    private nodeRecordItem: Node | null = null
    private btnExiting: Node | null = null
    private btnGroupRoot: Node | null = null
    private pagesView: Node | null = null
    private btnEditHead: Node | null = null

    private nodeCashContent: Node | null = null
    private nodeRecordContent: Node | null = null
    /** -----personal info----- */
    private labelVipLevel: Label | null = null
    private labelNickname: Label | null = null
    private labelGameid: Label | null = null
    private labelPhoneNum: Label | null = null
    private spHead: Sprite | null = null
    private btnEditName: Node | null = null
    private btnCopyID: Node | null = null
    private btnBindPhone: Node | null = null
    private nodeBindInfo: Node | null = null
    private btnChangePw: Node | null = null

    /** ------wallet------ */
    private labelBlance: Label | null = null
    private labelNeedWater: Label | null = null
    private labelCanTakeout: Label | null = null
    private nodeWithdraw: Node | null = null
    private nodeAddCash: Node | null = null
    private nodeBankContent: Node | null = null
    private btnProgDesc: Node | null = null
    private nodeProgDesc: Node | null = null



    start() {
        this.initNode()
        this.initBind()
        this.setUserInfo()

        snEvent.on(eventKey.bindingBancard, this.getBankList, this)
    }

    private initNode() {
        this.nodeMask = find("mask", this.node)
        this.nodeViewRoot = find("body/center/pagesview", this.node)
        this.nodeCashItem = find("body/center/cash-item", this.node)
        this.nodeRecordItem = find("body/center/record-item", this.node)
        this.btnExiting = find("body/header/close_btn/back", this.node)
        this.btnGroupRoot = find("body/left/toggleGroup", this.node)
        this.pagesView = find("body/center/pagesview", this.node)
        this.btnEditName = find("body/center/pagesview/prsonalinfo_view/nickName", this.node)
        this.btnCopyID = find("body/center/pagesview/prsonalinfo_view/playerId", this.node)
        this.btnEditHead = find("body/center/pagesview/prsonalinfo_view/avatar/info_edit", this.node)
        this.nodeCashContent = find("body/center/pagesview/cash_turnover_view/ScrollView/view/content", this.node)
        this.nodeRecordContent = find("body/center/pagesview/game_record_view/ScrollView/view/content", this.node)
        /** personal info */
        this.labelNickname = find("body/center/pagesview/prsonalinfo_view/nickName/Label", this.node)?.getComponent(Label)
        this.labelGameid = find("body/center/pagesview/prsonalinfo_view/playerId/Label", this.node)?.getComponent(Label)
        this.labelPhoneNum = find("body/center/pagesview/prsonalinfo_view/phone/changephone/Label", this.node)?.getComponent(Label)
        this.spHead = find("body/center/pagesview/prsonalinfo_view/avatar/avatarSprite", this.node)?.getComponent(Sprite)
        this.labelVipLevel = find("body/center/pagesview/prsonalinfo_view/avatar/vipLabel", this.node)?.getComponent(Label)
        this.nodeBindInfo = find("body/center/pagesview/prsonalinfo_view/phone/changephone", this.node)
        this.btnBindPhone = find("body/center/pagesview/prsonalinfo_view/phone/bindphone", this.node)
        this.btnChangePw = find("body/center/pagesview/prsonalinfo_view/phone/btn_change", this.node)
        /** Wallet */
        this.labelBlance = find("body/center/pagesview/my_wallet_view/LabelAmount/balance", this.node)?.getComponent(Label)
        this.labelNeedWater = find("body/center/pagesview/my_wallet_view/LabelAmount/cur_money/value", this.node)?.getComponent(Label)
        this.labelCanTakeout = find("body/center/pagesview/my_wallet_view/LabelAmount/withdrawable", this.node)?.getComponent(Label)
        this.nodeWithdraw = find("body/center/pagesview/my_wallet_view/fix/withdraw_btn", this.node)
        this.nodeAddCash = find("body/center/pagesview/my_wallet_view/fix/addcash_btn", this.node)
        this.nodeBankContent = find("body/center/pagesview/my_wallet_view/svBankCard/view/content", this.node)
        this.btnProgDesc = find("body/center/pagesview/my_wallet_view/fix/wallet_tip1", this.node)
        this.nodeProgDesc = find("body/center/pagesview/my_wallet_view/desc", this.node)


    }

    private setUserInfo(): void {

        this.labelNickname.string = globalData.user.nickname
        this.labelGameid.string = "ID: " + globalData.user.userId
        this.labelPhoneNum.string = "+" + globalData.user.areaCode + " " + globalData.user.phone
        this.labelVipLevel.string = globalData.user.vipLevel + ""
        globalFunc.getAvatarImage(globalData.user.avatarId)
            .then(spriteframe => {
                this.spHead.spriteFrame = spriteframe
            })

        if (globalData.user.phone !== "") {
            this.btnBindPhone.active = false
            this.nodeBindInfo.active = true
            this.btnChangePw.active = true
        }
      
    }

    private refreshBindInfo() {

        this.btnBindPhone.active = false
        this.nodeBindInfo.active = true
        this.labelPhoneNum.string = "+" + globalData.user.areaCode + " " + globalData.user.phone
    }

    private initBind() {

        this.btnExiting.on("click", this.onCloseView, this)
        this.btnEditHead.on("click", this.onEditHead, this)
        this.btnEditName.on("click", this.onEditName, this)
        this.btnCopyID.on("click", this.onCopyID, this)
        this.btnBindPhone.on("click", this.onBindPhone, this)

        this.btnGroupRoot.children.forEach((toggle, index) => {
            toggle.__mark__ = index
            toggle.on("click", this.onToggleClick, this)
        })

        this.nodeAddCash.on("click", () => {
            snEvent.emit(eventKey.addCashEvent)
        })
        this.nodeWithdraw.on("click", () => {
            snEvent.emit(eventKey.withdrawEvent)
        })
        this.btnProgDesc.on("click", ()=> {
            this.nodeProgDesc.active = !this.nodeProgDesc.active
        })
        this.btnChangePw.on("click", ()=> {
            ChangePasswordHelper.show()
        })

    }

    private async onBindPhone() {

        const node = await snRes.loadAsync<Prefab>("lobby-model", `bind-mobile`);
        const avatar = instantiate(node)
        avatar.setParent(config.uiNode.windowNode)
        snEvent.on(eventKey.refreshBindInfo, this.refreshBindInfo.bind(this))

    }

    private async onEditName() {

        snEvent.on(eventKey.editUserName, this.refreshNickName.bind(this))
        const node = await snRes.loadAsync<Prefab>("lobby-model", `nick-name`);
        const avatar = instantiate(node)
        avatar.setParent(config.uiNode.windowNode)
    }

    private onCopyID(): void {
        const copyStr = globalData.user.userId + "";
        //拷贝文本
        if (sys.os == "Android") {
            sdk.copy(copyStr);
        } else {
            const el = document.createElement('textarea');
            el.value = copyStr;

            // Prevent keyboard from showing on mobile
            el.setAttribute('readonly', '');
            //el.style.contain = 'strict';
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            el.style.fontSize = '12pt'; // Prevent zooming on iOS

            const selection = getSelection()!;
            let originalRange;
            if (selection.rangeCount > 0) {
                originalRange = selection.getRangeAt(0);
            }

            document.body.appendChild(el);
            el.select();

            // Explicit selection workaround for iOS
            el.selectionStart = 0;
            el.selectionEnd = copyStr.length;

            let success = false;
            try {
                success = document.execCommand('copy');
            } catch (err) { }

            document.body.removeChild(el);

            if (originalRange) {
                selection.removeAllRanges();
                selection.addRange(originalRange);
            }
        }
    }

    private async onEditHead() {

        snEvent.on(eventKey.editUserHead, this.refreshHead.bind(this))
        const node = await snRes.loadAsync<Prefab>("lobby-model", `avatar`);
        const avatar = instantiate(node)
        avatar.setParent(config.uiNode.windowNode)
    }

    private refreshNickName(): void {
        this.labelNickname.string = globalData.user.nickname
    }

    private refreshHead(): void {
        globalFunc.getAvatarImage(globalData.user.avatarId)
            .then(spriteframe => {
                this.spHead.spriteFrame = spriteframe
            })
    }

    private onToggleClick(sender: Toggle) {
        const index = sender.target.__mark__
        this.changeView(index)

        const funcs = [
            this.queryWithdrawInfo,
            this.queryBalanceRecords,
            this.queryGameRecords
        ]

        funcs[index - 1]?.call(this)
    }

    private changeView(pageIndex: number) {
        this.pagesView.children.forEach((view, index) => {
            view.active = (index == pageIndex)
        })

    }

    private queryGameRecords(): void {
        const data = {
            pageIndex: 1,
            pageSize: 20
        }
        api.featGameRecords(data)
            .then(resp => {
                this.showGameRecordList(resp.data)

            })
            .catch(error => { })
    }

    private queryBalanceRecords(): void {
        const data = {
            pageIndex: 1,
            pageSize: 20
        }
        api.featBalanceRecords(data)
            .then(resp => {
                this.showCashTurnoverList(resp.data)

            })
            .catch(error => { })
    }

    private queryWithdrawInfo(): void {
        api.featWithdrawInfo()
            .then(resp => {
                if (resp.code == 1) {
                    this.labelBlance.string = currency.itoa(globalData.user.balance)
                    this.labelNeedWater.string = currency.itoa(resp.data.NeedWager)
                    this.labelCanTakeout.string = currency.itoa(resp.data.Withdrawable)
                }
            })

        this.getBankList()

    }

    private getBankList() {
        api.fetchBankCardList()
            .then(resp => {
                if (resp.code == 1) {
                    this.showBankList(resp.data.List)
                }
            })
            .catch(err => {
            })
    }

    private async showBankList(list: any) {

        if(!config.appliction.isShowAddCash) {
            return
        }

        this.nodeBankContent.removeAllChildren()
        list.forEach(async info => {
            const item = await snRes.loadAsync<Prefab>("lobby-model", "bankItem")
            const node = instantiate(item)
            this.nodeBankContent.addChild(node)
            const sc = node.getComponent(BankItem)
            sc.setItemInfo(info)

        })

        const item = await snRes.loadAsync<Prefab>("lobby-model", "bankItem")
        const node = instantiate(item)
        this.nodeBankContent.addChild(node)
        const sc = node.getComponent(BankItem)
        sc.setItemInfo(null)
    }

    private showCashTurnoverList(data: any) {
        const list = data.logs
        this.nodeCashContent.removeAllChildren()
        list.forEach(info => {
            const item = instantiate(this.nodeCashItem)
            this.nodeCashContent.addChild(item)
            item.getChildByName("Label").getComponent(Label).string = time.changeDateStyle(info.date)
            item.getChildByName("Label2").getComponent(Label).string = (info.id)
            item.getChildByName("Label3").getComponent(Label).string = (info.type)
            item.getChildByName("Label4").getComponent(Label).string = (info.type)
            item.getChildByName("Label5").getComponent(Label).string = `R$${currency.itoa(info.amount)}`
            item.getChildByName("Label6").getComponent(Label).string = `R$${currency.itoa(info.balance)}`

            const cashout = [2, 4, 6, 8]
            const found = cashout.findIndex( item => item == info.type)
            if(found !== -1) {
                item.getChildByName("Label5").getComponent(Label).color = Color.RED
            }
        })

    }

    private showGameRecordList(data: any) {
        this.nodeRecordContent.removeAllChildren()
        const list = data.logs
     
        list.forEach(info => {
            const item = instantiate(this.nodeRecordItem)
            this.nodeRecordContent.addChild(item)
            item.getChildByName("Label").getComponent(Label).string = time.changeDateStyle(info.date)
            item.getChildByName("Label2").getComponent(Label).string = (info.providerName)
            item.getChildByName("Label3").getComponent(Label).string = (info.gameName)
            item.getChildByName("Label4").getComponent(Label).string = (info.roundId)
            item.getChildByName("Label5").getComponent(Label).string = `R$${currency.itoa(info.betAmount)}`

            const str = info.settleAmount < 0 ? `R$ -${currency.itoa(info.settleAmount)}` : `R$ +${currency.itoa(info.settleAmount)}`
            item.getChildByName("Label6").getComponent(Label).string = str
            if(info.settleAmount < 0 ) {
                item.getChildByName("Label6").getComponent(Label).color = Color.RED
            }
        })

    }



    private onCloseView() {
        this.node.destroy()
    }

    onDestroy() {
        snEvent.off(eventKey.editUserHead, this.refreshHead.bind(this))
        snEvent.off(eventKey.refreshBindInfo, this.refreshBindInfo.bind(this))
    }

}

