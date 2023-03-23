import { _decorator, Component, Node, sys, Prefab, instantiate, setDisplayStats } from 'cc';
import { define } from './define';
import { frame } from './frame';
const { ccclass, property } = _decorator;

@ccclass('launch')
export class launch extends Component {

    @property(Prefab)
    webview: Prefab | null = null

    nodeWebview: Node = null
    buttonDiv: HTMLDivElement = null
    dialogDiv: HTMLDivElement = null

    start() {
        setDisplayStats(false); // 隐藏debug信息
        frame.setFrameSize()?.onresize()
    }


    onButtonClick() {
        const webview = this.nodeWebview = instantiate(this.webview)
        this.node.addChild(webview)
        this.showBtnBack()
    }

  

    private showConfirmDialog() {
        if(this.dialogDiv) {
            console.warn("已存在")
            return
        }
        const body = document.getElementById("GameDiv")
        const dialogDiv = this.dialogDiv = document.createElement("div")
        const background = document.createElement("img")
        const buttonDiv = document.createElement("div")
        const btnConfirm = document.createElement("img")
        const btnCancel = document.createElement("img")

        dialogDiv.style.width =  "50%";
        dialogDiv.style.height =  "50%";
        dialogDiv.style.position = "absolute"
        
        background.src = define.background
        background.style.position = "absolute"
        background.style.width =  "100%";
        background.style.height =  "100%";

        buttonDiv.style.position = "absolute"
        buttonDiv.style.bottom = `0px`
        buttonDiv.style.width =  "100%";
        buttonDiv.style.height =  "100%";

        btnConfirm.style.position = "absolute"
        btnConfirm.src = define.confirm
        btnConfirm.style.left = `10%`
        btnConfirm.style.bottom = `5%`
        btnConfirm.style.width =  "30%";
        btnConfirm.style.height =  "20%";

        btnCancel.style.position = "absolute"
        btnCancel.src = define.cancel
        btnCancel.style.right = `10%`
        btnCancel.style.bottom = `5%`
        btnCancel.style.width =  "30%";
        btnCancel.style.height =  "20%";

        btnConfirm.onclick = ()=> {
            this.buttonDiv?.remove()
            this.nodeWebview?.destroy()
            this.dialogDiv?.remove()
            this.dialogDiv = null
        }

        btnCancel.onclick = ()=> {
            this.dialogDiv?.remove()
            this.dialogDiv = null
        }
        buttonDiv.appendChild(btnConfirm)
        buttonDiv.appendChild(btnCancel)
        dialogDiv.appendChild(background)
        dialogDiv.appendChild(buttonDiv)

        body.appendChild(dialogDiv);


    }


    private showBtnBack() {
        /**
         * !!TODO: 需要分平台写，各种浏览器，android ios...
         */
        if (sys.isBrowser) {

            const body = document.getElementById("GameDiv")
            const buttonDiv = this.buttonDiv = document.createElement("div")
            const button = document.createElement("img")
            button.style.position = "absolute"
            button.src = define.floatButton
            button.style.left = `0px`
            button.style.top = `0px`
            button.style.width =  "10%";
            button.style.height =  "15%";
            button.onclick = this.showConfirmDialog.bind(this)
            buttonDiv.appendChild(button)
            body.insertBefore(buttonDiv, body.lastChild);

        }
    }

}

