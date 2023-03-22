import { Pool } from "cc";
import { fastRemoveAt } from "../utils/array";
import { createMap } from "../utils/map";

export namespace snEvent {
    function empty() {}

    class CallbackInfo {
        public callback: Function = empty;
        public target: unknown | undefined = undefined;
        public once = false;

        public set(callback: Function, target?: unknown, once?: boolean) {
            this.callback = callback || empty;
            this.target = target;
            this.once = !!once;
        }

        public reset() {
            this.target = undefined;
            this.callback = empty;
            this.once = false;
        }
    }

    const callbackInfoPool = new Pool(() => new CallbackInfo(), 32);
    /**
     * @zh 事件监听器列表的简单封装。
     * @en A simple list of event callbacks
     */
    class CallbackList {
        public callbackInfos: Array<CallbackInfo | null> = [];
        public isInvoking = false;
        public containCanceled = false;

        /**
         * @zh 从列表中移除与指定目标相同回调函数的事件。
         * @en Remove the event listeners with the given callback from the list
         *
         * @param cb - The callback to be removed
         */
        public removeByCallback(cb: Function) {
            for (let i = 0; i < this.callbackInfos.length; ++i) {
                const info = this.callbackInfos[i];
                if (info && info.callback === cb) {
                    info.reset();
                    callbackInfoPool.free(info);
                    fastRemoveAt(this.callbackInfos, i);
                    --i;
                }
            }
        }

        /**
         * @zh 从列表中移除与指定目标相同调用者的事件。
         * @en Remove the event listeners with the given target from the list
         * @param target
         */
        public removeByTarget(target: unknown) {
            for (let i = 0; i < this.callbackInfos.length; ++i) {
                const info = this.callbackInfos[i];
                if (info && info.target === target) {
                    info.reset();
                    callbackInfoPool.free(info);
                    fastRemoveAt(this.callbackInfos, i);
                    --i;
                }
            }
        }

        /**
         * @zh 移除指定编号事件。
         * @en Remove the event listener at the given index
         * @param index
         */
        public cancel(index: number) {
            const info = this.callbackInfos[index];
            if (info) {
                info.reset();
                if (this.isInvoking) {
                    this.callbackInfos[index] = null;
                } else {
                    fastRemoveAt(this.callbackInfos, index);
                }
                callbackInfoPool.free(info);
            }
            this.containCanceled = true;
        }

        /**
         * @zh 注销所有事件。
         * @en Cancel all event listeners
         */
        public cancelAll() {
            for (let i = 0; i < this.callbackInfos.length; i++) {
                const info = this.callbackInfos[i];
                if (info) {
                    info.reset();
                    callbackInfoPool.free(info);
                    this.callbackInfos[i] = null;
                }
            }
            this.containCanceled = true;
        }

        /**
         * @zh 立即删除所有取消的回调。（在移除过程中会更加紧凑的排列数组）
         * @en Delete all canceled callbacks and compact array
         */
        public purgeCanceled() {
            for (let i = this.callbackInfos.length - 1; i >= 0; --i) {
                const info = this.callbackInfos[i];
                if (!info) {
                    fastRemoveAt(this.callbackInfos, i);
                }
            }
            this.containCanceled = false;
        }

        /**
         * @zh 清除并重置所有数据。
         * @en Clear all data
         */
        public clear() {
            this.cancelAll();
            this.callbackInfos.length = 0;
            this.isInvoking = false;
            this.containCanceled = false;
        }
    }

    const MAX_SIZE = 16;
    const callbackListPool = new Pool<CallbackList>(() => new CallbackList(), MAX_SIZE);

    interface ICallbackTable {
        [x: string]: CallbackList | undefined;
    }

    const _callbackTable: ICallbackTable = createMap(true);

    /**
     * @zh 向一个事件名注册一个新的事件监听器，包含回调函数和调用者
     * @en Register an event listener to a given event key with callback and target.
     *
     * @param key - Event type
     * @param callback - Callback function when event triggered
     * @param target - Callback callee
     * @param once - Whether invoke the callback only once (and remove it)
     */
    export function on(key: string | number, callback: Function, target?: unknown, once?: boolean) {
        if (!hasEventListener(key, callback, target)) {
            let list = _callbackTable[key];
            if (!list) {
                list = _callbackTable[key] = callbackListPool.alloc();
            }
            const info = callbackInfoPool.alloc();
            info.set(callback, target, once);
            list.callbackInfos.push(info);
        }
        return callback;
    }

    /**
     * @zh 检查指定事件是否已注册回调。
     * @en Checks whether there is correspond event listener registered on the given event
     * @param key - Event type
     * @param callback - Callback function when event triggered
     * @param target - Callback callee
     */
    function hasEventListener(key: string | number, callback?: Function, target?: unknown) {
        const list = _callbackTable && _callbackTable[key];
        if (!list) {
            return false;
        }

        // check any valid callback
        const infos = list.callbackInfos;
        if (!callback) {
            // Make sure no cancelled callbacks
            if (list.isInvoking) {
                for (let i = 0; i < infos.length; ++i) {
                    if (infos[i]) {
                        return true;
                    }
                }
                return false;
            } else {
                return infos.length > 0;
            }
        }

        for (let i = 0; i < infos.length; ++i) {
            const info = infos[i];
            if (info && info.callback === callback && info.target === target) {
                return true;
            }
        }
        return false;
    }

    /**
     * @zh 移除在特定事件类型中注册的所有回调或在某个目标中注册的所有回调。
     * @en Removes all callbacks registered in a certain event type or all callbacks registered with a certain target
     * @param keyOrTarget - The event type or target with which the listeners will be removed
     */
    function removeAll(keyOrTarget: string | number | unknown) {
        const type = typeof keyOrTarget;
        if (type === "string" || type === "number") {
            // remove by key
            const list = _callbackTable && _callbackTable[keyOrTarget as string | number];
            if (list) {
                if (list.isInvoking) {
                    list.cancelAll();
                } else {
                    list.clear();
                    callbackListPool.free(list);
                    delete _callbackTable[keyOrTarget as string | number];
                }
            }
        } else if (keyOrTarget) {
            // remove by target
            for (const key in _callbackTable) {
                const list = _callbackTable[key]!;
                if (list.isInvoking) {
                    const infos = list.callbackInfos;
                    for (let i = 0; i < infos.length; ++i) {
                        const info = infos[i];
                        if (info && info.target === keyOrTarget) {
                            list.cancel(i);
                        }
                    }
                } else {
                    list.removeByTarget(keyOrTarget);
                }
            }
        }
    }

    /**
     * @zh 删除以指定事件，回调函数，目标注册的回调。
     * @en Remove event listeners registered with the given event key, callback and target
     * @param key - Event type
     * @param callback - The callback function of the event listener, if absent all event listeners for the given type will be removed
     * @param target - The callback callee of the event listener
     */
    export function off(key: string | number, callback?: Function, target?: unknown) {
        const list = _callbackTable && _callbackTable[key];
        if (list) {
            const infos = list.callbackInfos;
            if (callback) {
                for (let i = 0; i < infos.length; ++i) {
                    const info = infos[i];
                    if (info && info.callback === callback && info.target === target) {
                        list.cancel(i);
                        break;
                    }
                }
            } else {
                removeAll(key);
            }
        }
    }

    /**
     * @zh 派发一个指定事件，并传递需要的参数
     * @en Trigger an event directly with the event name and necessary arguments.
     * @param key - event type
     */
    export function emit(key: string | number, ...args: any) {
        const list: CallbackList = _callbackTable && _callbackTable[key]!;
        if (list) {
            const rootInvoker = !list.isInvoking;
            list.isInvoking = true;

            const infos = list.callbackInfos;
            for (let i = 0, len = infos.length; i < len; ++i) {
                const info = infos[i];
                if (info) {
                    const callback = info.callback;
                    const target = info.target;
                    // Pre off once callbacks to avoid influence on logic in callback
                    if (info.once) {
                        off(key, callback, target);
                    }

                    if (target) {
                        callback.call(target, ...args);
                    } else {
                        callback(...args);
                    }
                }
            }

            if (rootInvoker) {
                list.isInvoking = false;
                if (list.containCanceled) {
                    list.purgeCanceled();
                }
            }
        }
    }

    /**
     * 移除所有回调。
     */
    export function clear(key?: string) {
        if (!key) {
            for (const key in _callbackTable) {
                const list = _callbackTable[key];
                if (list) {
                    list.clear();
                    callbackListPool.free(list);
                    delete _callbackTable[key];
                }
            }
        } else {
            const list = _callbackTable[key];
            if (list) {
                list.clear();
                callbackListPool.free(list);
                delete _callbackTable[key];
            }
        }
    }
}