import { _decorator, Component, Node, sp, v3 } from 'cc';
import { snRes } from '../../manager/snRes';
import { LobbyHome } from '../lobbyHome';
import { SpineUrl } from './spineUrl';
const { ccclass, property } = _decorator;

@ccclass('GameKind')
export class GameKind extends Component {

    
    private gameid: number = 0
    private scLobbyHome: LobbyHome = null


    onLoad() {
        this.node.on("click", this.onGameClick, this)
    }

    public setKindInfo(gameid: number, lobbyHome: LobbyHome) {
        this.gameid = gameid
        this.scLobbyHome = lobbyHome
        this.loadSpine()
    }   

    public onGameClick() {
        this.scLobbyHome?.onGameKindClick(this.gameid)
    }


    private async loadSpine() {

        const data = await snRes.loadSkeletonAsync("resources", SpineUrl[this.gameid])
        const nodeSpine = this.node.getChildByName("spine")
        const spine = nodeSpine.getComponent(sp.Skeleton)!
        spine.skeletonData = data
        spine.setSkin("default")
        spine.setAnimation(0, "animation", true)

        if(this.gameid == 7) {
            nodeSpine.setPosition(v3(-200, -333))
        }


    }
}

