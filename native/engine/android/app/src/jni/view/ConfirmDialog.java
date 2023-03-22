package jni.view;

import android.app.Dialog;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;

import androidx.annotation.NonNull;

import com.starstar.game.R;

public class ConfirmDialog extends Dialog {
    public ConfirmDialog(@NonNull Context context) {
        this(context, R.style.Dialog_Fullscreen);
    }

    public ConfirmDialog(@NonNull Context context, int themeResId) {
        super(context, themeResId);
        init();
    }

    private void init() {
        Window window = getWindow();
        window.setBackgroundDrawableResource(R.color.half_transparent);
        View view = LayoutInflater.from(getContext()).inflate(R.layout.view_dialog_comfirm, null);
        setContentView(view);
        findViewById(R.id.btn_cancel).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                cancel();
            }
        });
    }

    public void setOnConfirmListener(final View.OnClickListener onClickListener) {
        findViewById(R.id.btn_confirm).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                cancel();
                onClickListener.onClick(view);
            }
        });
    }
}
