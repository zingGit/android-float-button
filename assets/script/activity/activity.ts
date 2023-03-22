import { assetManager, Button, Component, easing, ImageAsset, instantiate, Node, Sprite, SpriteFrame, Texture2D, tween, Vec3, _decorator } from 'cc';
import { api } from '../api/api';
import { config } from '../config/config';
import { moLog } from '../utils/logger';
const { ccclass, property } = _decorator;

@ccclass('Activity')
export class Activity extends Component {
    @property(Node)
    private nodeBody: Node = null!;
    @property(Node)
    private nodeBanner: Node = null!;
    @property(Node)
    private nodeBigBanner: Node = null!;
    @property(Node)
    private nodeContent: Node = null!;

    private curLinkToUrl: string = "";      // 当前大图点击要跳转的地址

    start() {
        this.viewIn()
        this.fetchActivity();
    }

    public viewIn() {
        this.nodeBody?.setScale(Vec3.ZERO);
        tween(this.nodeBody)
            .to(0.3, { scale: Vec3.ONE }, { easing: easing.cubicOut })
            .start();
    }
    private async fetchActivity(): Promise<void> {
        await api.fetchShowActivityList().then((res) => {
            if (res.code == 1) {
                this.initData(res.data.list)
            }
        });
    }

    private async initData(list: Array<any>) {
        // "list":[{"id":1,"sort":10,"title":"但是F","banner":"","bigBanner":"","linkTo":"1"}]
        if (!list || !list.length) {
            return
        }
        const sortList = list.sort((first, second) => {
            return first.sort - second.sort
        })

        let childIndex = 0; // 容器内有个隐藏的nodeBanner
        for (let i = 0; i < sortList.length; i++) {
            const info = sortList[i];
            if (info.banner == "" || info.bigBanner == "") {
                continue;
            }
            const nodeBanner = instantiate(this.nodeBanner)
            nodeBanner.active = true;
            this.nodeContent.addChild(nodeBanner);
            childIndex++;
            info.childIndex = childIndex;
            nodeBanner.on("click", this.onBtnSelectActivity.bind(this, info), this);
            if (i == 0) {
                nodeBanner.children[0].active = true;
            }
            const sprite = nodeBanner.getComponent(Sprite)
            const joinUrl = config.env.apiUrl + info.banner
            const texture = await this.loadRemoteImg(joinUrl) as any
            sprite.spriteFrame = texture
            if (!this.nodeBigBanner.active) {
                this.setBigBannerSprite(info);
            }
        }
    }

    private async setBigBannerSprite(info: any) {
        this.nodeBigBanner.active = true;
        const spriteBig = this.nodeBigBanner.getComponent(Sprite);
        const joinUrlBig = config.env.apiUrl + info.bigBanner;
        const texture = await this.loadRemoteImg(joinUrlBig) as any;
        spriteBig.spriteFrame = texture
        this.curLinkToUrl = info.linkTo;
    }

    private loadRemoteImg(remoteUrl: string) {
        return new Promise( resolve => {

            assetManager.loadRemote<ImageAsset>(remoteUrl, function (err, imageAsset) {
                if (err) {
                    moLog.error("activity loadRemoteImg error: ", err);
                    return;
                }
                const sp = new SpriteFrame()
                const tex = new Texture2D()
                tex.image = imageAsset
                sp.texture = tex

                resolve(sp)
            })
        })
    }



    private onBtnLinkTo(): void {
        // 点击大图跳转对应的界面   this.curLinkToUrl
    }

    // 点击左侧选择活动
    private onBtnSelectActivity(info: any): void {
        const activityList = this.nodeContent.children;
        for (let i = 0; i < activityList.length; i++) {
            activityList[i].children[0].active = false;
        }
        activityList[info.childIndex].children[0].active = true;
        this.setBigBannerSprite(info);
    }

    private onCloseView() {
        this.node.destroy()
    }

}
