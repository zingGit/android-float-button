import { _decorator, Component, Node, Label } from 'cc';
import { ChangeSprite } from '../../components/changeSprite';
import { currency } from '../../utils/currency';
import { time } from '../../utils/time';
const { ccclass, property } = _decorator;

@ccclass('TransactionsItem')
export class TransactionsItem extends Component {
    @property(Label)        // 订单
    labelOrder: Label = null!;
    @property(Label)        // 交易金额
    labelAmount: Label = null!;
    @property(Node)         // 交易状态
    nodeStatus: Node = null!;
    @property(Label)        // 交易时间
    labelDate: Label = null!;

    // status: 1.待付款 2.失败  3.成功
    init(orderId: number, amount: number, status: number, date: number): void {
        this.labelOrder.string = currency.itoBMFontStr(orderId, false);
        this.labelAmount.string = "R$ " + currency.itoBMFontStr(amount);
        const changeSpriteComp = this.nodeStatus.getComponent(ChangeSprite);
        changeSpriteComp.init(status - 1);
        this.labelDate.string = currency.itoBMFontStr(time.changeDateStyle(date), false);
    }

    private onBtnCopy(): void {

    }
}

