import { _decorator, Component, Node, ScrollView, v3, Toggle, ToggleContainer, Label, Color, sys } from 'cc';
import { api } from '../../api/api';
import { Throttle } from '../../components/throttle';
import { config } from '../../config/config';
import { globalData } from '../../global/globalData';
import { globalFunc } from '../../global/globalFunc';
import { TransactionsItem } from './TransactionsItem';
const { ccclass, property } = _decorator;

@ccclass('Transactions')
export class Transactions extends Component {
    private nCurRechargePageIndex: number = 0;  // 当前记录页数索引
    private canFetchRecharge: boolean = true;   // 能否请求充值记录
    @property(Node)         // 没有记录
    nodeNoRecord: Node = null!;
    @property(Node)         // 充值记录容器
    nodeContentRecharge: Node = null!;
    @property(Node)         // 充值记录滚动视图
    scrollViewRecharge: Node = null!;
    @property(Node)         // 充值提现记录按钮
    toggleGroup: Node = null!;
    private nCurWithdrawPageIndex: number = 0;  // 当前记录页数索引
    private canFetchWithdraw: boolean = true;   // 能否请求充值记录
    @property(Node)         // 充值记录容器
    nodeContentWithdraw: Node = null!;
    @property(Node)         // 充值记录滚动视图
    scrollViewWithdraw: Node = null!;

    init(index: number): void {
        globalFunc.change2OrientationLandscape(false);
        this.scrollViewRecharge.on("bounce-bottom", this.onScrollRechargeEvent, this);
        this.scrollViewWithdraw.on("bounce-bottom", this.onScrollWithdrawEvent, this);
        if (index == 0) {
            this.toggleGroup.children[0].getComponent(Toggle).isChecked = true;
            this.fetchRechargeRecordAPI();
        } else if (index == 1) {
            this.toggleGroup.children[1].getComponent(Toggle).isChecked = true;
            this.fetchWithdrawRecordAPI();
        }
    }

    private onScrollRechargeEvent(): void {
        this.fetchRechargeRecordAPI();
    }

    private async fetchRechargeRecordAPI(): Promise<void> {
        if (!this.canFetchRecharge) {
            this.nodeNoRecord.active = false;
            return;
        }
        const recordData = {
            index: ++this.nCurRechargePageIndex,
            size: 10
        }
        let listRecord = [];
        await api.fetchRechargeRecord(recordData).then((res) => {
            if (res.code != 1 || res.data.Count == 0) {
                this.nodeNoRecord.active = true;
                this.nCurRechargePageIndex = 0;
            } else if (res.code == 1) {
                this.nodeNoRecord.active = false;
                if (res.data.Count <= res.data.Size * res.data.Index) {
                    this.canFetchRecharge = false;
                }
                listRecord = res.data.List;
            }
        })

        for (let i = 0; i < listRecord.length; i++) {
            globalFunc.loadPrefabFromBundle("addCashWithdraw", "transactionsRecordItem", this.nodeContentRecharge)
                .then((node) => {
                    node.setPosition(v3(0, -160 - 300 * i));
                    const comp = node.getComponent(TransactionsItem);
                    comp.init(listRecord[i].order_id, listRecord[i].pay_amount, listRecord[i].status, listRecord[i].created_at);
                });
        }
    }
    private onScrollWithdrawEvent(): void {
        this.fetchWithdrawRecordAPI();
    }
    private async fetchWithdrawRecordAPI(): Promise<void> {
        if (!this.canFetchWithdraw) {
            this.nodeNoRecord.active = false;
            return;
        }
        const recordData = {
            index: ++this.nCurWithdrawPageIndex,
            size: 10
        }
        let listRecord = [];
        await api.fetchWithdrawalRecord(recordData).then((res) => {
            if (res.code != 1 || res.data.Count == 0) {
                this.nodeNoRecord.active = true;
                this.nCurWithdrawPageIndex = 0;
            } else if (res.code == 1) {
                this.nodeNoRecord.active = false;
                if (res.data.Count <= res.data.Size * res.data.Index) {
                    this.canFetchWithdraw = false;
                }
                listRecord = res.data.List;
            }
        })

        for (let i = 0; i < listRecord.length; i++) {
            globalFunc.loadPrefabFromBundle("addCashWithdraw", "transactionsRecordItem", this.nodeContentWithdraw)
                .then((node) => {
                    node.setPosition(v3(0, -160 - 300 * i));
                    const comp = node.getComponent(TransactionsItem);
                    comp.init(listRecord[i].order_id, listRecord[i].pay_amount, listRecord[i].status, listRecord[i].created_at);
                });
        }
    }

    // 选择充值或者提现记录
    private onToggleChange(toggle: Toggle): void {
        toggle.name = toggle.name.split("<")[0];
        const togglrChildren = this.toggleGroup.children;
        if (toggle.name == togglrChildren[0].name) {
            this.scrollViewRecharge.active = true;
            this.scrollViewWithdraw.active = false;
            togglrChildren[0].children[1].getComponent(Label).color = new Color("#FFFFFF");
            togglrChildren[1].children[1].getComponent(Label).color = new Color("#25a268");
            this.fetchRechargeRecordAPI();
        } else {
            this.scrollViewRecharge.active = false;
            this.scrollViewWithdraw.active = true;
            togglrChildren[0].children[1].getComponent(Label).color = new Color("#25a268");
            togglrChildren[1].children[1].getComponent(Label).color = new Color("#FFFFFF");
            this.fetchWithdrawRecordAPI();
        }
    }
    // 客服
    @Throttle(1000)
    private onBtnCustomService(): void {
        sys.openURL(globalData.applicaion.customerServiceWebUrl);
    }
    // 返回上层
    private onBtnBack(): void {
        this.node.removeFromParent();
    }

}

