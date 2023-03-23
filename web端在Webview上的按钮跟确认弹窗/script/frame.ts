import { sys, view } from "cc"

export namespace frame {


    export function onresize() {

        if(!sys.isBrowser) {
            return
        }

        (window.onresize = () => {
            setFrameSize()
          })

    }

    export function setFrameSize() {
        const [width, height] = getFrameSize()
        view.setFrameSize(width, height)
        return frame
    }


    function getFrameSize() {

        const visibleWidth = document.documentElement.clientWidth
        const visibleHeight = document.documentElement.clientHeight -80
        const resoluSizeWidth = view.getDesignResolutionSize().width
        const resoluSizeHeight = view.getDesignResolutionSize().height
        const scale1 = visibleWidth / resoluSizeWidth
        const scale2 = visibleHeight / resoluSizeHeight
        const scale3 = scale1 < scale2 ? scale1 : scale2
        return [resoluSizeWidth * scale3, resoluSizeHeight * scale3]
    }

}