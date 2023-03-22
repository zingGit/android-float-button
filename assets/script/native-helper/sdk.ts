import { sys } from "cc";
import { moLog } from "../utils/logger";

export namespace sdk {

    export function copy(text: string) {
        switch (sys.os) {
            case sys.OS.ANDROID:
                moLog.info(`copy text: ${text}`);
                jsb.reflection.callStaticMethod("jni/JniHelper", "setClipText", "(Ljava/lang/String;)V", text);
                break;
            case sys.OS.IOS:
                break;
        }
    }

    export function paste(): string {
        switch (sys.os) {
            case sys.OS.ANDROID: 
                const text = jsb.reflection.callStaticMethod("jni/JniHelper", "getClipText", "()Ljava/lang/String;");
                return text;
            case sys.OS.IOS:
                break;
        }
        return "";
    }

    export function facebookLogin() {
        switch (sys.os) {
            case sys.OS.ANDROID:
                jsb.reflection.callStaticMethod("jni/JniHelper", "facebookLogin", "()V");
                break;
            case sys.OS.IOS:
                break;
        }
    }

    export function getDeviceInfo(): string {
        if (sys.os === sys.OS.ANDROID) {
            const deviceInfo = jsb.reflection.callStaticMethod("jni/JniHelper", "getDeviceInfo", "()Ljava/lang/String;");
            return deviceInfo
        }

        if (sys.os === sys.OS.IOS) {
            return "";
        }

        return "";
    }

    export function setScreenOrientationLandscape() {
        if (sys.os === sys.OS.ANDROID) {
            return jsb.reflection.callStaticMethod("jni/JniHelper", "setHorizontalScreen", "()V");
        }
    }

    export function setScreenOrientationPortrait() {
        if (sys.os === sys.OS.ANDROID) {
            return jsb.reflection.callStaticMethod("jni/JniHelper", "setVerticalScreen", "()V");
        }
    }

    export function removeSplashView() {
        if (sys.os === sys.OS.ANDROID) {
            return jsb.reflection.callStaticMethod("jni/JniHelper", "removeSplashView", "()V");
        }
    }

    export function isDebug(): boolean {
        if (sys.os === sys.OS.ANDROID) {
            return jsb.reflection.callStaticMethod("jni/JniHelper", "isDebug", "()Z");
        }

        return false;
    }

    export function osShareText(text: string) {
        if (sys.os === sys.OS.ANDROID) {
            return jsb.reflection.callStaticMethod("jni/JniHelper", "osShareText", "(Ljava/lang/String;)V", text);
        }

    }
}