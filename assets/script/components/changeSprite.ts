import { Component, Sprite, SpriteFrame, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ChangeSprite')
export class ChangeSprite extends Component {
    @property([SpriteFrame])    // 渲染组
    listSpriteFrame: Array<SpriteFrame> = [];

    
    init(index: number): void {
        const sprite = this.node.getComponent(Sprite);
        sprite.spriteFrame = this.listSpriteFrame[index];
    }
}

