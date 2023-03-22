import { _decorator, Component, Node, Label, Color, Toggle, view, sys, macro, tween } from 'cc';
import { api } from '../../api/api';
import { Throttle } from '../../components/throttle';
import { config } from '../../config/config';
import { eventKey } from '../../config/define';
import { globalData } from '../../global/globalData';
import { globalFunc } from '../../global/globalFunc';
import { snEvent } from '../../manager/snEvent';
import { creator } from '../../utils/creator';
import { currency } from '../../utils/currency';
import { Transactions } from './Transactions';
const { ccclass, property } = _decorator;

@ccclass('Withdrawal')
export class Withdrawal extends Component {
    // private channelID: number = 0;          // 提现通道ID
    private listWithdrawal: number[] = [];  // 提现金额列表
    @property(Node)         // 提现金额列表父节点
    nodeWithdrawList: Node = null!;
    private nSelectWithdraw: number = 0;    // 选择的提现金额
    @property(Label)        // 余额
    labelBalance: Label = null!;
    @property(Label)        // 提现金额
    labelWithdraw: Label = null!;
    private listBankCards: Array<any> = []; // 银行卡列表
    @property([Node])       // 银行卡列表节点
    listBankCardNode: Array<Node> = [];
    @property(Node)         // 银行卡列表开关节点
    nodeBankCardSwitch: Node = null!;
    private bShowBankCardList: boolean = true;
    @property(Node)         // 银行卡列表父节点
    nodeBankCardList: Node = null!;
    @property(Node)         // 银行卡选择列表
    nodeToggleGroup: Node = null!;
    private nSelectCardIndex: number = 0;   // 选择银行卡下标
    @property(Node)         // 提现帮助
    nodeWithdrawHelp: Node = null!;

    init(channelList: any) {
        globalFunc.change2OrientationLandscape(false);
        // this.channelID = channelList[0].channel_id;
        this.listWithdrawal = JSON.parse(channelList.fixedAmount);
        for (let i = 0; i < this.listWithdrawal.length; i++) {
            if (i < 6) {
                const withdrawItem = this.nodeWithdrawList.children[1 + i];
                withdrawItem.active = true;
                withdrawItem.children[1].getComponent(Label).string = "R$ " + currency.itoBMFontStr(this.listWithdrawal[i]);
            }
        }
        this.onBtnSelectWithdraw(null, '0');
        this.labelBalance.string = "R$ " + currency.itoBMFontStr(globalData.user.balance);
        this.labelWithdraw.string = "R$ " + currency.itoBMFontStr(this.nSelectWithdraw);
        // 获取银行卡列表
        this.fetchBankCardListAPI();
        // 监听银行卡列表变更，刷新信息
        snEvent.on(eventKey.refreshBankCardList, this.fetchBankCardListAPI.bind(this));
    }

    private async fetchBankCardListAPI(): Promise<void> {
        const cardListData = await api.fetchBankCardList();
        this.listBankCards = cardListData.data.List;
        // [{"id":3,"name":"wang","aliasAccount":"******[ount]"},{"id":4,"name":"wang","aliasAccount":"******[ount]"}]
        for (let i = 0; i < this.listBankCards.length; i++) {
            if (i < 3) {
                this.nodeToggleGroup.children[i].active = true;
                const nodeBankCard = this.listBankCardNode[i];
                nodeBankCard.active = true;
                nodeBankCard.children[1].getComponent(Label).string = this.listBankCards[i].name;
                nodeBankCard.children[2].getComponent(Label).string = this.listBankCards[i].aliasAccount;
            }
        }
    }
    // 选择提现金额
    private onBtnSelectWithdraw(event: Event, customData: string): void {
        const index = Number(customData);
        if (index >= this.listWithdrawal.length) {
            return;
        }
        this.nSelectWithdraw = this.listWithdrawal[index];
        for (let i = 0; i < this.listWithdrawal.length; i++) {
            if (i < 6) {
                const withdrawItem = this.nodeWithdrawList.children[1 + i];
                const labelName = withdrawItem.children[1].getComponent(Label);
                labelName.color = new Color("#4F616A");
                withdrawItem.children[0].active = false;
            }
        }
        const selectItem = this.nodeWithdrawList.children[1 + index];
        selectItem.children[1].getComponent(Label).color = new Color("#FFFFFF");
        selectItem.children[0].active = true;
        this.labelWithdraw.string = "R$ " + currency.itoBMFontStr(this.nSelectWithdraw);
    }

    // 添加银行卡跳转到银行卡管理界面
    private async onBtnAddBankCard(): Promise<void> {
        await globalFunc.loadPrefabFromBundle("addCashWithdraw", "manageBankCard", this.node);
    }
    // 客服
    @Throttle(1000)
    private onBtnCustomService(): void {
        sys.openURL(globalData.applicaion.customerServiceWebUrl);
    }
    // 交易记录
    @Throttle(1000)
    private async onBtnTransactions(): Promise<void> {
        await globalFunc.loadPrefabFromBundle("addCashWithdraw", "transactionsRecord", this.node).then((node) => {
            const transactionComp = node.getComponent(Transactions);
            transactionComp.init(1);
        })
    }
    // 打开与折叠银行卡列表
    private onBtnClickBankCardList(): void {
        this.bShowBankCardList = !this.bShowBankCardList;
        if (this.bShowBankCardList) {
            this.nodeBankCardSwitch.children[0].active = false;
            this.nodeBankCardSwitch.children[1].active = true;
            this.nodeBankCardList.active = true;
        } else {
            this.nodeBankCardSwitch.children[0].active = true;
            this.nodeBankCardSwitch.children[1].active = false;
            this.nodeBankCardList.active = false;
        }
    }
    // 选择银行卡
    private onBtnSelectBankCard(event: Event, customData: string): void {
        const index = Number(customData);
        this.nodeToggleGroup.children[index].getComponent(Toggle).isChecked = true;
    }
    private onToggleGroup(toggle: Toggle): void {
        toggle.name = toggle.name.split("<")[0];
        if (toggle.name == "Toggle0") {
            this.nSelectCardIndex = 0;
        } else if (toggle.name == "Toggle1") {
            this.nSelectCardIndex = 1;
        } else if (toggle.name == "Toggle2") {
            this.nSelectCardIndex = 2;
        }
    }
    // 确认提现
    private async onBtnConfirm(): Promise<void> {
        if (this.nSelectWithdraw > globalData.user.balance) {
            return;
        }
        const withdrawData = {
            amount: this.nSelectWithdraw,
            bankId: this.listBankCards[this.nSelectCardIndex].id,
            // channelId: this.channelID
        };
        const withdrawRes = await api.fetchCreateWithdrawOrder(withdrawData);
    }
    // 查看提现帮助
    @Throttle(2100)
    private onBtnWithdrawHelp(): void {
        this.nodeWithdrawHelp.active = true;
        tween(this.nodeWithdrawHelp)
            .delay(2)
            .call(() => {
                this.nodeWithdrawHelp.active = false;
            })
            .start();
    }
    // 返回上层
    private onBtnBack(): void {
        globalFunc.change2OrientationLandscape(true);
        this.node.removeFromParent();
    }
}

