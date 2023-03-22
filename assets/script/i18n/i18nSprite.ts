import { _decorator, Component, Sprite, CCString } from "cc";
const { ccclass, property, disallowMultiple, requireComponent, menu } = _decorator;

import { i18n, I18nComponent, i18nSpriteRes } from "./i18n";

@ccclass("I18nSprite")
@requireComponent(Sprite)
@disallowMultiple
@menu("多语言/i18nSprite")
export class I18nSprite extends Component implements I18nComponent {
    private sprite: Sprite | null = null;

    @property
    private i18nKey: string = "";

    onLoad() {
        this.sprite = this.getComponent(Sprite);
    }

    start() {
        i18n.register(this);
        this.refresh();
    }

    onDestroy() {
        i18n.unregister(this);
    }

    async refresh(): Promise<void> {
        if (!this.sprite) {
            return;
        }

        const spriteFrame = await i18nSpriteRes.spriteAsync(this.i18nKey);
        this.sprite.spriteFrame = spriteFrame;
    }
}
