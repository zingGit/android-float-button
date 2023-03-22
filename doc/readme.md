### cocosWebviewHelper.java 需要修改的地方
添加一天sendBroadcast loadUrl 的时候显示按钮，（简单做法） 有时间的话 最好在打开webview是添加一个过渡界面 加载完成后再关闭遮罩显示按钮
```
 public static void loadUrl(final int index, final String url) {
        sCocos2Activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                CocosWebView webView = webViews.get(index);
                if (webView != null) {
                    webView.loadUrl(url);
                }
            }
        });
        sendBroadcast();
    }

    private static void sendBroadcast() {
        Intent intent = new Intent();
        intent.setAction("webview");
        sCocos2Activity.sendBroadcast(intent);
    }
```

### CocosActivity.java 修改mFrameLayout 修饰符
private 修改成 protected  
```
protected FrameLayout mFrameLayout;
```