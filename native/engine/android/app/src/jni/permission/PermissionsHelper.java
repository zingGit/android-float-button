package jni.permission;

import android.util.Log;

import com.cocos.game.AppActivity;
import com.tbruyelle.rxpermissions2.RxPermissions;

import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;
import jni.ifs.PermissionsRespones;
//
// PermissionsRespones permissionsRespones = new PermissionsRespones() {
//@Override
//public void accept() {
//        Log.d(TAG, "accept");
//        }
//
//@Override
//public void reject() {
//        Log.d(TAG, "reject");
//        }
//        };
//
//        Log.d(TAG, "on se event");
////        requestPermission(Manifest.permission.ACCESS_FINE_LOCATION);
//        PermissionsHelper.requestPermissions(mMainActivity, permissionsRespones, Manifest.permission.READ_CALENDAR,Manifest.permission.ACCESS_FINE_LOCATION);
//
public class PermissionsHelper {
    public static String TAG = "PermissionsHelper";

    /**
     * @method 权限申请
     * @param activity
     * @param permissions 权限组单项或多项
     * @param permissionsRespones
     */
    public static void requestPermissions(AppActivity activity
            , PermissionsRespones permissionsRespones,String... permissions) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                RxPermissions rxPermissions = new RxPermissions(activity);
                // 添加所需权限
                rxPermissions.request(permissions)
                        .subscribe(new Observer<Boolean>() {
                            //监听某些权限是否进行了授权
                            @Override
                            public void onSubscribe(Disposable d) {
                                Log.d(TAG, "on subscribe");
                            }
                            @Override
                            public void onError(Throwable e) { Log.d(TAG, "on error"); }
                            @Override
                            public void onComplete() { Log.d(TAG, "on complete"); }

                            @Override
                            public void onNext(Boolean result) {
                                //同意授权
                                if(result) {
                                    permissionsRespones.accept();
                                    return;
                                }
                                permissionsRespones.reject();
                            }

                        });
            }
        });

    }
}


