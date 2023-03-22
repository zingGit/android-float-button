import { director, Game, game, screen, sys, view, Node } from "cc";

export namespace url {

    export function gethref() {
        const href = window.location.search.substring(1)
        return decodeURIComponent(href)
    }

    export class match {
        constructor(public url: string) {}
        get(name: string) {
            const Reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)")
            const match = this.url.match(Reg)
            return match && unescape(match[2])
        }
    }

   
}