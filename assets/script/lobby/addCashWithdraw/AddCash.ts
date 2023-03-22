import { _decorator, Component, Node, UITransform, Size, Label, Color, sys, tween } from 'cc';
import { api } from '../../api/api';
import { Throttle } from '../../components/throttle';
import { config } from '../../config/config';
import { globalData } from '../../global/globalData';
import { globalFunc } from '../../global/globalFunc';
import { currency } from '../../utils/currency';
import { Transactions } from './Transactions';
const { ccclass, property } = _decorator;

@ccclass('AddCash')
export class AddCash extends Component {
    @property(Node)     // 充值通道列表
    nodeChannelList: Node = null!;
    listChannel: Array<any> = [];
    @property(Node)     // 选择某条充值通道的标识图
    nodeChannelSelectBg: Node = null!;
    nSelectChannelIndex: number = 0;    // 当前选择的支付通道数组下标
    @property(Node)     // 充值活动列表
    nodeActivityList: Node = null!;
    listActivity: Array<any> = [];
    nSelectActivityIndex: number = -1;   // 当前选择的活动列表下标
    @property(Node)     // 充值金额列表
    nodeRechargeItemList: Node = null!;
    nSelectRecharge: number = 0;        // 当前选择的充值金额
    @property(Label)    // 充值加活动奖励总得金额
    labelTotal: Label = null!;
    @property(Label)    // 充值所得额
    labelCash: Label = null!;
    @property(Label)    // 奖励金额
    labelBonus: Label = null!;
    @property(Node)     // 奖励说明
    nodeBonusHelp: Node = null!;

    init(channelList: any[]): void {
        globalFunc.change2OrientationLandscape(false);
        // channelList: [{"channel_id":1006,"name":"demo","type":1,"min":100,"max":1000000,"ratio":100,"fixed_fee":100,"fixed_amount":"[1000,2000,3000,4000]","sort":0}]
        // 充值通道
        this.listChannel = channelList;
        this.nSelectChannelIndex = 0;
        let channelCount = channelList.length;
        if (channelCount > 4) {
            channelCount = 4;
        }
        const transform = this.nodeChannelList.getComponent(UITransform);
        transform.setContentSize(new Size(245 * channelCount, 110));
        for (let i = 1; i <= channelCount; i++) {
            const channelItem = this.nodeChannelList.children[i];
            channelItem.active = true;
            channelItem.children[0].getComponent(Label).string = channelList[i - 1].name;
        }
        // 显示充值金额列表 "fixed_amount":"[1000,2000,3000,4000]"
        this.onBtnSelectChannel(null, '0');
        this.onBtnSelectCash(null, '0');
        // 充值活动
        this.fetchActivityAPI();
    }
    private async fetchActivityAPI(): Promise<void> {
        const activityData = await api.fetchAddCashActivity();
        const activityList = activityData.data.list;
        if (activityList.length) {
            this.listActivity = activityList;
            this.nodeActivityList.active = true;
            for (let i = 0; i < activityList.length; i++) {
                if (i < 2) {
                    const activityItem = this.nodeActivityList.children[i];
                    activityItem.active = true;
                    activityItem.children[1].getComponent(Label).string = activityList[i].content;
                }
            }
            this.onBtnSelectActivity(null, '0');
        }
    }
    // 选择支付通道
    private onBtnSelectChannel(event: Event, customData: string): void {
        const index = Number(customData);
        if (index >= this.listChannel.length) {
            return;
        }
        this.nSelectChannelIndex = index;
        const rechargeList = JSON.parse(this.listChannel[index].fixed_amount);
        for (let i = 0; i < rechargeList.length; i++) {
            if (i < 6) {
                const rechargeItem = this.nodeRechargeItemList.children[i];
                rechargeItem.active = true;
                rechargeItem.children[2].active = false;
                const labelName = rechargeItem.children[1].getComponent(Label);
                labelName.string = "R$ " + currency.itoBMFontStr(rechargeList[i]);
            }
        }
    }

    // 选择支付金额
    private onBtnSelectCash(event: Event, customData: string): void {
        const index = Number(customData);
        const rechargeList = JSON.parse(this.listChannel[this.nSelectChannelIndex].fixed_amount);
        if (index >= rechargeList.length) {
            return;
        }
        this.nSelectRecharge = rechargeList[index];
        for (let i = 0; i < rechargeList.length; i++) {
            if (i < 6) {
                const rechargeItem = this.nodeRechargeItemList.children[i];
                const labelName = rechargeItem.children[1].getComponent(Label);
                labelName.color = new Color("#4F616A");
                rechargeItem.children[0].active = false;
            }
        }
        const selectItem = this.nodeRechargeItemList.children[index];
        selectItem.children[1].getComponent(Label).color = new Color("#FFFFFF");
        selectItem.children[0].active = true;
        this.setRechargeTotalDetail(this.nSelectRecharge, this.calActivityBonus());
    }
    // 设置充值所得金额详情
    private setRechargeTotalDetail(cash: number, bonus: number): void {
        this.labelCash.string = "R$ " + currency.itoBMFontStr(cash);
        this.labelBonus.string = "R$ " + currency.itoBMFontStr(bonus);
        this.labelTotal.string = "R$ " + currency.itoBMFontStr(cash + bonus);
    }
    // 选择支付活动
    private onBtnSelectActivity(event: Event, customData: string): void {
        const index = Number(customData);
        if (index >= this.nodeActivityList.children.length) {
            return;
        }
        for (let i = 0; i < this.listActivity.length; i++) {
            if (i < 2) {
                const activityItem = this.nodeActivityList.children[i];
                activityItem.children[0].active = false;
            }
        }
        const rechargeList = JSON.parse(this.listChannel[this.nSelectChannelIndex].fixed_amount);
        for (let i = 0; i < rechargeList.length; i++) {
            const rechargeItem = this.nodeRechargeItemList.children[i];
            rechargeItem.children[2].active = false;
        }
        this.setRechargeTotalDetail(this.nSelectRecharge, 0);
        // 根据活动显示对应的活动充值奖励
        if (index == this.nSelectActivityIndex) {
            this.nSelectActivityIndex = -1;
            return;
        }
        this.nSelectActivityIndex = index;
        this.nodeActivityList.children[index].children[0].active = true;
        this.setRechargeTotalDetail(this.nSelectRecharge, this.calActivityBonus());
    }
    // 计算活动奖励
    private calActivityBonus(): number {
        if (this.nSelectActivityIndex < 0) {
            return 0;
        }
        let nSelectBonus = 0;
        const selectActivity = this.listActivity[this.nSelectActivityIndex];
        const rechargeList = JSON.parse(this.listChannel[this.nSelectChannelIndex].fixed_amount);
        for (let i = 0; i < rechargeList.length; i++) {
            if (rechargeList[i] >= selectActivity.minRecharge) {
                const rechargeItem = this.nodeRechargeItemList.children[i];
                const nodeBonus = rechargeItem.children[2];
                nodeBonus.active = true;
                let nBonus = rechargeList[i] * selectActivity.bonusRatio / 10000;
                if (nBonus > selectActivity.maxBonus) {
                    nBonus = selectActivity.maxBonus;
                }
                nodeBonus.children[0].getComponent(Label).string = "R$ " + currency.itoBMFontStr(nBonus);
                if (rechargeList[i] == this.nSelectRecharge) {
                    nSelectBonus = nBonus;
                }
            }
        }
        return nSelectBonus;
    }
    // 充值
    @Throttle(1000)
    private async onBtnAddCash(): Promise<void> {
        const orderData = {
            amount: this.nSelectRecharge, channelId: this.listChannel[this.nSelectChannelIndex].channel_id
        }
        await api.fetchCreateOrder(orderData).then((res) => {
            // res: {"code":1,"msg":"Successful","data":{"PayAddr":"https://www.baidu.com"}}
            if (res.code == 1) {
                sys.openURL(res.data.PayAddr);
            }
        })
        if (this.nSelectActivityIndex != -1) {
            const activityData = {
                activityId: this.listActivity[this.nSelectActivityIndex].activityId,
                type: 1,
                userId: globalData.user.userId
            }
            await api.fetchJoinRechargeActivity(activityData);
        }
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
            transactionComp.init(0);
        })
    }
    // 查看奖励帮助
    @Throttle(2100)
    private onBtnBonusHelp(): void {
        this.nodeBonusHelp.active = true;
        tween(this.nodeBonusHelp)
            .delay(2)
            .call(() => {
                this.nodeBonusHelp.active = false;
            })
            .start();
    }
    // 返回大厅
    private onBtnBackToLobby(): void {
        globalFunc.change2OrientationLandscape(true);
        this.node.removeFromParent();
    }
}

