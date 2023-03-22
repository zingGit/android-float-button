import { _decorator, Component, PageView, macro } from "cc";
const { ccclass, property, requireComponent } = _decorator;

@ccclass("AutoTurnPage")
@requireComponent(PageView)
export class AutoTurnPage extends Component {
    @property({ displayName: "翻页间隔（秒）" })
    private timeSpace: number = 10;
    private view: PageView | undefined = undefined;

    onLoad() {
        this.view = this.getComponent(PageView) ?? undefined;
    }

    start() {
        this.schedule(this.turnPage.bind(this), this.timeSpace, macro.REPEAT_FOREVER);
    }

    turnPage(): void {
        const maxPage = this.view?.getPages().length ?? 0;
        let curPage = this.view?.getCurrentPageIndex() ?? 0;
        curPage++;
        if (curPage >= maxPage) {
            curPage = 0;
        }

        this.view?.setCurrentPageIndex(curPage);
    }
}
