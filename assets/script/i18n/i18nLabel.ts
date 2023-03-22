import { _decorator, Component, Label, CCString } from "cc";
const { ccclass, property, disallowMultiple, requireComponent, menu } = _decorator;

import { i18n, I18nComponent, i18nLabelRes } from "./i18n";

@ccclass("I18nLabel")
@requireComponent(Label)
@disallowMultiple
@menu("多语言/i18nLabel")
export class I18nLabel extends Component implements I18nComponent {
    private label: Label | null = null;

    @property
    private i18nKey: string = "";
    private i18nParams: string[] = [];

    onLoad() {
        this.label = this.getComponent(Label);

        i18n.register(this);
    }

    start() {
        this.refresh();
    }

    onDestroy() {
        i18n.unregister(this);
    }

    updateParams(params: string[]): void {
        this.i18nParams = params;
        this.refresh();
    }

    refresh() {
        if (this.i18nKey === "") {
            return;
        }

        if (!this.label) {
            return;
        }

        const str = i18nLabelRes.labelAsync(this.i18nKey, this.i18nParams);
        this.label.string = str;
    }
}
