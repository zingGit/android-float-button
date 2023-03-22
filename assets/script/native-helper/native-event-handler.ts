import { snEvent } from "../manager/snEvent"
import { moLog } from "../utils/logger"

window["onNativeEvent"] = function(eventName: string, data: string) {
    moLog.info(`onNativeEvent-event:${eventName}, data:${data}`)
    snEvent.emit(eventName, data)
}

window["onNativeEventInBase64"] = function(eventName: string, base64: string) {

    moLog.info(`onNativeEventInBase64-event:${eventName}, data:${base64}`)
    let data = null
    try {
        data = JSON.parse(window.atob(base64))
    } 
    catch (error) {
        moLog.info(`json parse failed!`)
        return
    }

   for (const key in data) {
        moLog.info(`from native--key:${key}, value:${data[key]}`)
   }

   snEvent.emit(eventName, data)
}


export {}