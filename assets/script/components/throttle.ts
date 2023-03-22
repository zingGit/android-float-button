/**
 * 用于操作函数节流，节流就间隔时间段 时间内执行一次，
 * 也就是降低频率，将高频操作优化成低频操作。
 * @param wait 间隔ms 期间内再次触发无效
 * @constructor
 */
 export const Throttle = (wait: number) => {
    return function (target: any, key: string, descriptor: any) {
        let timer: any;
        let fn = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            console.log("Throttle timer", timer);
            if (!timer) {
                fn.apply(this, args);
                timer = setTimeout(() => {
                    timer = undefined;
                }, wait);
            }
        };
    };
};