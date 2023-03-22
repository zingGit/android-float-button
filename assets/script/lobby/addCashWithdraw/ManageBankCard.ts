import { Component, Label, Node, sys, _decorator } from 'cc';
import { api } from '../../api/api';
import { Throttle } from '../../components/throttle';
import { eventKey } from '../../config/define';
import { globalData } from '../../global/globalData';
import { globalFunc } from '../../global/globalFunc';
import { snEvent } from '../../manager/snEvent';
import { BankCardInfo } from './BankCardInfo';
import { RemindDialog } from './RemindDialog';
const { ccclass, property } = _decorator;

@ccclass('ManageBankCard')
export class ManageBankCard extends Component {
    private listBankCards: Array<any> = []; // 银行卡列表
    @property(Node)         // 增加银行卡按钮
    nodeAddBankCard: Node = null!;
    @property([Node])       // 银行卡列表节点
    listBankCardNode: Array<Node> = [];

    start() {
        globalFunc.change2OrientationLandscape(false);
        // 获取银行卡列表
        this.fetchBankCardListAPI();
        // 监听银行卡信息变更，刷新信息
        snEvent.on(eventKey.refreshManageBankCard, this.fetchBankCardListAPI.bind(this));
    }

    private async fetchBankCardListAPI(): Promise<void> {
        // [{"id":3,"name":"wang","aliasAccount":"******[ount]"},{"id":4,"name":"wang","aliasAccount":"******[ount]"}]
        const cardListData = await api.fetchBankCardList();
        this.listBankCards = cardListData.data.List;
        if (this.listBankCards.length >= 3) {
            this.nodeAddBankCard.active = false;
        }
        for (let i = 0; i < this.listBankCards.length; i++) {
            if (i < 3) {
                const nodeBankCard = this.listBankCardNode[i];
                nodeBankCard.active = true;
                nodeBankCard.children[2].getComponent(Label).string = this.listBankCards[i].name;
                nodeBankCard.children[3].getComponent(Label).string = this.listBankCards[i].aliasAccount;
            }
        }
    }

    // 添加银行卡
    @Throttle(1000)
    private async onBtnAddBankCard(): Promise<void> {
        await globalFunc.loadPrefabFromBundle("addCashWithdraw", "bankCardInfo", this.node);
    }
    // 移除银行卡
    private onBtnRemoveCard(event: Event, customData: string): void {
        const index = Number(customData);
        RemindDialog.show({
            content: "确定要移除该银行卡吗？",
            onConfirm: () => {
                this.fetchRemoveBankCardAPI(this.listBankCards[index].id).then((res) => {
                    if (res.code == 1) {
                        this.listBankCardNode[index].active = false;
                    }
                })
            },
        });
    }
    private async fetchRemoveBankCardAPI(id: number): Promise<any> {
        return await api.fetchRemoveBankCard(id);
    }
    // 编辑银行卡
    @Throttle(1000)
    private async onBtnEditCard(event: Event, customData: string): Promise<void> {
        const index = Number(customData);
        await globalFunc.loadPrefabFromBundle("addCashWithdraw", "bankCardInfo", this.node).then((node) => {
            const bankCardInfoComp = node.getComponent(BankCardInfo);
            bankCardInfoComp.setBankCardID(this.listBankCards[index].id);
        })
    }
    // 客服
    @Throttle(1000)
    private onBtnCustomService(): void {
        sys.openURL(globalData.applicaion.customerServiceWebUrl);
    }
    // 返回上层
    private onBtnBack(): void {
        this.node.removeFromParent();
        snEvent.emit(eventKey.refreshBankCardList);
    }
}

