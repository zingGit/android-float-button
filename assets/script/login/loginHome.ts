import { Component, Node, sys, Toggle, _decorator } from "cc";
import { api } from "../api/api";
import { remindBar } from "../components/remindBar";
import { config } from "../config/config";
import { audioDef, eventKey, storageKey } from "../config/define";
import { globalData } from "../global/globalData";
import { globalFunc } from "../global/globalFunc";
import { i18nSwitchLanguage } from "../i18n/i18n";
import { snAudio } from "../manager/snAudio";
import { snEvent } from "../manager/snEvent";
import { nativeEventDef } from "../native-helper/native-event-def";
import { sdk } from "../native-helper/sdk";
import { moLog } from "../utils/logger";
import { url } from "../utils/url";
const { ccclass, property } = _decorator;

@ccclass("LoginHome")
export class LoginHome extends Component {
    @property(Node)
    nodeLanguageList: Node = null!;

    start() {
        globalData.applicaion.curLocaton = 0;
        if (globalData.applicaion.bFirstLogin) {
            this.loadCache();
            this.fetchCustomServices();
        }
        
        this.checkTokenLogin()
    }

    private async loadCache(): Promise<void> {
        await snAudio.loadAudio(audioDef.clickBtn, "audio/clickbtn");
    }

    private fetchCustomServices(): void {
        api.fetchCustomService()
            .then((resp) => {
                const { data } = resp;
                console.log("客服系统", data);
                data.customServices.forEach((item: any) => {
                    let typeName = "";
                    switch (item.type) {
                        case 1: // whatsapp
                            typeName = "whatsapp";
                            break;
                        case 2: // telegram
                            typeName = "telegram";
                            break;
                        case 3: // web
                            {
                                typeName = "web";
                                globalData.applicaion.customerServiceWebUrl = item.link;
                            }
                            break;
                    }
                    globalData.customerServices.push({
                        type: typeName,
                        nickname: item.nickname,
                        link: item.link,
                    });
                });
            })
            .catch((err) => {
                moLog.error(`fetch custom service: ${JSON.stringify(err)}`);
            });
    }

    private btnCustomerServiceCall(): void {
        sys.openURL(globalData.applicaion.customerServiceWebUrl);
    }

    private btnShowLanguageList(): void {
        this.nodeLanguageList.active = !this.nodeLanguageList.active;
    }

    private btnHideLanguageList(): void {
        if (this.nodeLanguageList.active) {
            this.nodeLanguageList.active = false;
        }
    }

    // customData: 1.葡萄牙 2.英语
    private btnSelectLanguage(event: Event, customData: string): void {
        this.nodeLanguageList.active = false;
        if (customData == "1") {
            i18nSwitchLanguage("br-ze");
            remindBar.show("设置葡语成功");
        } else if (customData == "2") {
            i18nSwitchLanguage("en-us");
            remindBar.show("设置英语成功");
        }
    }

    private btnFacebookLoginCall(): void {
        snEvent.on(nativeEventDef.facebookLogin, this.onFacebookLoginCallback, this)
        sdk.facebookLogin()
        // this.onFacebookLoginCallback("")
    }

    private async btnPhoneLoginCall(): Promise<void> {
        await globalFunc.loadPrefabFromBundle("login", "loginFrame", this.node);
    }

    private toggleAgreeCall(toggle: Toggle): void {}

    private btnAgreeDetailCall(): void {}

    private async gotoLobbyView() {
        const node = await globalFunc.loadPrefabFromBundle("lobby", "lobbyHome", config.uiNode.sceneNode!);
        if (node) {
            globalFunc.changeSceneNode(node);
        }
        globalData.applicaion.bFirstLogin = false;
    }

    public onFacebookLoginCallback(token: string) {
        console.warn(`facebook listenner:${token}`)
        api.facebookLogin({token}).then( resp => {
            if(resp.code == 1) {
                const {data} = resp
                localStorage.setItem(storageKey.authorization, data.token);
                globalData.user.userId = data.userId;
                globalData.user.authorization = data.token;
                api.addAuthorization(globalData.user.authorization);
                this.gotoLobbyView()
            }

        })
        .catch( error => {
            console.warn("facebook login error:"+ JSON.stringify(error))
        })
    }

    /**
     * @method token 登录
     */
    private checkTokenLogin(): void {

        const authorization = localStorage.getItem("authorization")
        if(globalData.applicaion.bFirstLogin && authorization) {
            globalFunc.showLoading();
            api.tokenLogin()
            .then( resp => {
                if(resp.code !== 1) {
                    return console.warn("token auth failed!")
                }
                const {data} = resp
                localStorage.setItem(storageKey.authorization, data.token);
                globalData.user.userId = data.userId;
                globalData.user.authorization = data.token;
                api.addAuthorization(globalData.user.authorization);
                this.gotoLobbyView()
            })
            .catch( err => {
                console.warn("token login failed")
                globalFunc.hideLoading();
            })
        }
        else {
            this.checkFacebookRedirect()
        }
    }


    private checkFacebookRedirect() {

        const href = window.location.search.substring(1)
        
        console.warn(" location href:", decodeURIComponent(href))

        const match = new url.match(href)
        const code = match.get("code")
        if(!code) {
            return console.warn("is not facebook redirect")
        }

    }

}
