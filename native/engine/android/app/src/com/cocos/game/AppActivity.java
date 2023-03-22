/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.cocos.game;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.IntentFilter;
import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Handler;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.cocos.service.SDKWrapper;
import com.cocos.lib.CocosActivity;
import com.starstar.game.R;
import com.tbruyelle.rxpermissions2.RxPermissions;

import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;
import jni.JniHelper;
import jni.SeEventDef;
import jni.view.ConfirmDialog;

public class AppActivity extends CocosActivity {
    public static JniHelper jniHelper = null;
    public static String TAG = "CocosActivity";
    private WebviewReceiver webviewReceiver = null;
    public Button floatButton = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // DO OTHER INITIALIZATION BELOW
        SDKWrapper.shared().init(this);
        jniHelper = new JniHelper(this);
        initFloatButton();

    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.shared().onResume();
        jniHelper.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.shared().onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            return;
        }
        SDKWrapper.shared().onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.shared().onActivityResult(requestCode, resultCode, data);

        jniHelper.getFacebookHelper().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.shared().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.shared().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.shared().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.shared().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.shared().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.shared().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.shared().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.shared().onStart();
        super.onStart();
    }

    @Override
    public void onLowMemory() {
        SDKWrapper.shared().onLowMemory();
        super.onLowMemory();
    }


    class WebviewReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            showFloatButton(true);
        }
    }


    public void showDialog() {
        AlertDialog alert = null;
        AlertDialog.Builder builder = null;

        builder = new AlertDialog.Builder(this);
        alert = builder.setTitle("Notification")
                .setMessage("Are you sure you want to quit？")
                .setNegativeButton("cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                    }
                })

                .setPositiveButton("confirm", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        /**
                         * 隐藏按钮
                         * 通知se层关闭Webview
                         */
                        showFloatButton(false);
                        JniHelper.sendToSe(SeEventDef.closeWebview, "close webview");
                    }
                })
                .create();
        alert.show();

    }
    @SuppressLint("ClickableViewAccessibility")
    private void initFloatButton() {
        RelativeLayout.LayoutParams lp = new RelativeLayout.LayoutParams(dip2px(50f), dip2px(50f));
        lp.addRule(RelativeLayout.CENTER_HORIZONTAL);
        floatButton = new Button(this);
        floatButton.setLayoutParams(lp);
        mFrameLayout.addView(floatButton);
        floatButton.setBackgroundResource(R.mipmap.back);
        floatButton.setVisibility(View.GONE);
//        floatButton.bringToFront();
        floatButton.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction())
                {
                    case MotionEvent.ACTION_DOWN://收缩到0.8(正常值是1)，速度500
                        floatButton.animate().scaleX(0.95f).scaleY(0.95f).setDuration(100).start();
                        break;
                    case MotionEvent.ACTION_UP:
                        floatButton.animate().scaleX(1).scaleY(1).setDuration(100).start();
                        Log.d("touch end", "xixi");
//                        showDialog();
                        showConfirmDialog();
                        break;
                }
                return true;
            }
        });


        IntentFilter filter = new IntentFilter();
        webviewReceiver = new WebviewReceiver();
        filter.addAction("webview");
        registerReceiver(webviewReceiver, filter);

    }

    public int dip2px(float dpValue) {
        final float scale = getResources().getDisplayMetrics().density;
        return (int) (dpValue * scale + 0.5f);
    }

    public void showFloatButton(boolean isShow) {

        if (floatButton == null) {
            return;
        }
        Log.d(TAG, "show float button");
        floatButton.setVisibility(isShow ? View.VISIBLE : View.GONE);
        floatButton.bringToFront();

    }

    private void showConfirmDialog() {

        ConfirmDialog confirmDialog = new ConfirmDialog(this);
        confirmDialog.setOnConfirmListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showFloatButton(false);
                JniHelper.sendToSe(SeEventDef.closeWebview, "close webview");
            }
        });
        confirmDialog.show();

    }
}
