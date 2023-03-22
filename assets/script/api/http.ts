import { moLog } from "../utils/logger";

enum Code {
    Success = 1,
    ErrorUnknown = 2, // 未知错误
    ErrorInernal = 3, // 内部错误
    ErrorServer = 4, //    服务器错误
    ErrorRequestMany = 5, // 请求次数过多
    ErrorAuthentication = 6, // 认证错误
    ErrorNet = 7, // 网络无法连接
    ErrorTimeout = 8, // 请求超时
}

interface Response {
    code: Code;
    msg?: string;
    data?: any;
}

export type HttpCallback = (data: Response) => void;

export namespace http {
    export async function post(url: string, data?: any, header?: Map<string, string>): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            send(
                "POST",
                url,
                data,
                (resp) => {
                    if (resp.code === Code.Success) {
                        resolve(resp.data);
                        return;
                    }
                    reject(resp);
                },
                header
            );
        });
    }

    export async function get(url: string, data?: any, header?: Map<string, string>): Promise<any> {
        let params = "";
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                params += `${key}=${value}&`;
            });
            params = params.slice(0, -1);
        }
        return new Promise<any>((resolve, reject) => {
            send(
                "GET",
                `${url}?${params}`,
                null,
                (resp) => {
                    if (resp.code === Code.Success) {
                        console.log("resp:成功", resp);
                        resolve(resp.data);
                        return;
                    }

                    reject(resp);
                },
                header
            );
        });
    }

    function send(method: string, url: string, data?: any, callback?: HttpCallback, header?: Map<string, string>): void {
        const payload = data ? JSON.stringify(data) : null;
        const xhr = new XMLHttpRequest();
        let timeout = false;
        let timer = setTimeout(() => {
            timeout = true;
            xhr.abort();
        }, 20 * 1000);
        xhr.onreadystatechange = () => {
            if (xhr.readyState != 4) {
                return;
            }
            if (timeout) {
                callback?.({
                    code: Code.ErrorTimeout,
                });
                clearTimeout(timer);
                return;
            }
            clearTimeout(timer);
            moLog.info(`request url: ${url}, payload: ${payload}, resp: ${xhr.response}`);
            if (xhr.status < 200) {
                callback?.({
                    code: Code.ErrorUnknown,
                });
                return;
            }
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    const resp = JSON.parse(xhr.responseText);

                    if (resp.code === 1) {
                        callback?.({
                            code: Code.Success,
                            data: resp,
                        });
                    } else {
                        callback?.({
                            code: resp.code,
                            msg: resp.msg,
                        });
                    }
                } catch (err) {
                    callback?.({
                        code: Code.ErrorUnknown,
                        msg: `${err}`,
                    });
                }
                return;
            }
            if (xhr.status === 401) {
                callback?.({
                    code: Code.ErrorAuthentication,
                });
                return;
            }
            if (xhr.status === 429) {
                callback?.({
                    code: Code.ErrorRequestMany,
                });
                return;
            }
            if (xhr.status < 500) {
                callback?.({
                    code: Code.ErrorInernal,
                });
            } else {
                callback?.({
                    code: Code.ErrorServer,
                });
            }
        };
        xhr.onerror = () => {
            clearTimeout(timer);
            callback?.({
                code: Code.ErrorNet,
            });
        };
        xhr.open(method, url, true);
        header?.forEach((value, key) => {
            xhr.setRequestHeader(key, value);
        });
        xhr.withCredentials = true;
        xhr.send(payload);
    }
}
