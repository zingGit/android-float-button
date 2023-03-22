import { _decorator, Component, Node, Label, find, Prefab, instantiate, Vec3, Button, tween } from "cc";
import { config } from "../config/config";
import { creator } from "../utils/creator";
import { currency } from "../utils/currency";
import { AutoDestroy } from "../components/autoDestroy";
import { snRes } from "../manager/snRes";
import { audioDef } from "../config/define";
import { snAudio } from "../manager/snAudio";
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Reward
 * DateTime = Mon Mar 28 2022 10:26:31 GMT+0800 (中国标准时间)
 * Author = o7ezxnerb
 * FileBasename = reward.ts
 * FileBasenameNoExtension = reward
 * URL = db://assets/script/reward/reward.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass("RewardLogic")
export class RewardLogic extends Component {
    private amountLabel: Label | undefined;
    private btnOK: Button | undefined;

    onLoad() {
        this.amountLabel = find("body/label", this.node)?.getComponent(Label) ?? undefined;
        this.btnOK = find("body/OK", this.node)?.getComponent(Button) ?? undefined;
    }

    start() {
        this.btnOK?.node.on(
            "click",
            () => {
                this.node.destroy();
            },
            this
        );
        this.setCompleteEvent();
    }

    private setCompleteEvent() {
        if (!this.btnOK) {
            return;
        }

        tween(this.btnOK)
            .delay(0.5)
            .call(() => {
                console.log("logBtn");
                creator.setActive(this.btnOK?.node, true);
            })
            .start();
    }

    public setAmount(amount: number) {
        if (!this.amountLabel) {
            return;
        }

        this.amountLabel.string = `R$ ${currency.itoa(amount)}`;
    }

    public setDuration(duration: number) {
        const auto = this.getComponent(AutoDestroy);
        if (!auto) {
            return;
        }

        auto.setDuration(duration);
    }
}

export namespace rewardDialog {
    const nodeName = "reward";
    let nodeCache: Prefab | undefined;

    export function show(opt: { amount: number; duration?: number }) {
        // snAudio.playAudio(audioDef.rewardMusic);
        const callback = async () => {
            if (!nodeCache) {
                const prefab = await snRes.loadAsync<Prefab>("lobby-model", "reward-animation");
                if (!prefab) {
                    return;
                }

                nodeCache = prefab;
            }

            const node = instantiate(nodeCache);
            node.name = nodeName;
            node.setParent(config.uiNode.tipsNode);
            node.setPosition(Vec3.ZERO);

            const sc = node.addComponent(RewardLogic);
            sc.setAmount(opt.amount);
        };

        callback();
    }
}
