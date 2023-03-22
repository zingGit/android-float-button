export namespace facebook {
    /**
     * 获取facebook头像地址
     * @param facebookId facebook open id
     * @returns facebook头像地址
     */
    export async function getAvatar(facebookId: string) {
        return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let timeout = false;
            const timer = setTimeout(() => {
                timeout = true;
                xhr.abort();
            }, 8000);
            xhr.onreadystatechange = () => {
                if (timeout) {
                    clearTimeout(timer);
                    reject();
                    return;
                }

                if (xhr.readyState !== 4) {
                    return;
                }

                clearTimeout(timer);
                if (xhr.status < 200 && xhr.status >= 300) {
                    reject();
                    return;
                }

                const resp = JSON.parse(xhr.responseText);
                const { data } = resp;
                resolve(data.url);
            };
            xhr.onerror = () => {
                clearTimeout(timer);
                reject();
            };
            xhr.open("GET", `https://graph.facebook.com//v11.0/${facebookId}/picture?redirect=false&type=large&width=1024&height=1024`, true);
            xhr.send();
        });
    }
}
