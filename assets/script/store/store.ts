import { _decorator, Button, Component, easing, find, instantiate, Label, Node, Prefab, tween, Vec3, director, sys } from "cc";
import { snRes } from "../manager/snRes";
import { globalData } from "../global/globalData";
import { globalFunc } from "../global/globalFunc";
import { config } from "../config/config";
import { api } from "../api/api";
import { moLog } from "../utils/logger";
import { currency } from "../utils/currency";
import { creator } from "../utils/creator";
import { remindBar } from "../components/remindBar";
import { sdk } from "../native-helper/sdk";
import { snEvent } from "../manager/snEvent";
import { eventKey } from "../config/define";
const { ccclass, property } = _decorator;

@ccclass("StorView")
export class StorView extends Component {
    private bodyNode: Node | undefined;
    private closeBtn: Button | undefined;
    private amountLabel: Label | undefined;
    private item: Node | undefined;
    private productInfoMap: Map<number, IProduct> = new Map();
    private protectedItems: productItem[] = [];
    private content: Node | undefined;
    onLoad() {
        this.bodyNode = find("bodyNode", this.node) ?? undefined;
        this.closeBtn = find("bodyNode/closebtn", this.node)?.getComponent(Button) ?? undefined;
        this.amountLabel = find("bodyNode/amount/amountLabel", this.node)?.getComponent(Label) ?? undefined;
        this.item = find("bodyNode/item", this.node) ?? undefined;
        this.content = find("bodyNode/ScrollView/view/content", this.node) ?? undefined;
        this.queryStoreInfo()
        this.setAmount(globalData.user.balance)
    }

    private queryStoreInfo() {

           api.fetproducts()
                .then((resp) => {
                    const { data } = resp;
                    const infos = data.products;
                    infos.forEach((productInfo: IProduct) => {
                        this.addMapInfo(productInfo);
                        this.setItemView(productInfo.chips, productInfo.price, productInfo.productId);
                    });
                });
    }
    start() {
        this.closeBtn?.node.on("click", this.moveOut, this);
        snEvent.on(eventKey.googleOrderSuccessful, this.onOrderSuccessful, this)
    }

    public moveIn() {
        tween(this.bodyNode).to(0.2, { scale: Vec3.ONE }, { easing: easing.cubicInOut }).start();
    }

    public moveOut() {
        this.node.destroy();
      
    }

    public addMapInfo(info: IProduct) {
        this.productInfoMap.set(info.productId, info);
    }

    public setAmount(amount: number) {
        if (!this.amountLabel) {
            return;
        }
        this.amountLabel.string = currency.itoa(amount);
    }

    public setItemView(chips: number, price: number, productId: number) {

        if (!this.item || !this.content) {
            return;
        }

        const itemNode = instantiate(this.item);
        const sc = new productItem(itemNode, productId);
        sc.setChips(chips);
        sc.setPrice(price);
        this.protectedItems.push(sc);
        itemNode.setParent(this.content);
        sc.bindClickEvent(() => {
            this.protectedItems.forEach((item) => {
                item.setSelect(item.getId() == productId);
            });
        });

        sc.bindBuyBtn((productId) => {

            api.featGoogleLaunch({productId}).then(resp => {
                if(resp.code == 1) {
                    const orderid = resp.data.orderId
                    console.warn(`订单号:${orderid}`)
                    if(sys.os !== sys.OS.ANDROID) {
                        return remindBar.show(`failed, only availabel on android!`)
                    }
                    //调用 sdk 拉起支付
                }
              
            })
            .catch( error=> {
                console.warn(`获取订单号:${error}`)
            })
        });
    }

    /**
     * @method 订单成功且已成功消费，通知服务端发放商品
     * @param purchaseToken 
     */
    private onOrderSuccessful(purchaseToken: string) {

        const data = {
            purchaseInfo: "",
            purchaseSign: purchaseToken
        }
        api.featGoogleSubmit(data).then(resp => {
            if(resp.code == 1) {

            }
          
        })
        .catch( error=> {
        })
    }

    onDestroy() {
        snEvent.off(eventKey.googleOrderSuccessful, this.onOrderSuccessful, this)
    }
}

class productItem {
    private node: Node;
    private buyBtn: Button | undefined;
    private priceLabel: Label | undefined;
    private chipsLabel: Label | undefined;
    private selectBg: Node | undefined;
    private protectedid: number = 0;
    private bestIcon: Node | undefined;
    constructor(itemNode: Node, productid: number) {
        this.node = itemNode;
        this.protectedid = productid;
        this.buyBtn = find("btn", this.node)?.getComponent(Button) ?? undefined;
        this.chipsLabel = find("Label", this.node)?.getComponent(Label) ?? undefined;
        this.selectBg = find("select", this.node) ?? undefined;
        this.priceLabel = find("btn/button_02/priceLabel", this.node)?.getComponent(Label) ?? undefined;
        this.bestIcon = find("best", this.node) ?? undefined;
    }

    public getId() {
        return this.protectedid;
    }

    public setChips(chip: number) {
        if (!this.chipsLabel) {
            return;
        }
        this.chipsLabel.string = `${currency.itoa(chip)}`;
    }

    public showBestIcon() {
        creator.setActive(this.bestIcon, true);
    }

    public setPrice(price: number) {
        if (!this.priceLabel) {
            return;
        }
        this.priceLabel.string = `R$ ${currency.itoa(price)}`;
    }

    public setSelect(show: boolean) {
        creator.setActive(this.selectBg, show);
    }

    public bindBuyBtn(callback: Function) {
        this.buyBtn?.node.on("click", ()=> {
            callback?.(this.protectedid)
        });
    }

    public bindClickEvent(callBack: Function) {
        this.node.on("click", callBack);
    }
}

interface IProduct {
    chips: number;
    price: number;
    productId: number;
}

export namespace storeDialog {
    let storePrefable: Prefab | undefined;

    export function show() {
        async function callback() {
            if (!storePrefable) {
                let prefab = await snRes.loadAsync<Prefab>("lobby-model", "store");
                if (!prefab) {
                    return;
                }

                storePrefable = prefab;
            }

            const node = instantiate(storePrefable);
            node.name = "store_node";
            node.setParent(config.uiNode.windowNode);

            // node.setPosition(Vec3.ZERO);
            // const sc = node.addComponent(StorView);
            // sc.moveIn();

         
        }

        callback();
    }
}
