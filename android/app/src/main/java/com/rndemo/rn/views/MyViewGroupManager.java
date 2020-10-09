package com.rndemo.rn.views;

import android.util.Log;
import android.view.View;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

import java.util.List;

import javax.annotation.Nonnull;

public class MyViewGroupManager extends ViewGroupManager<MyViewGroup> {

    @Nonnull
    @Override
    public String getName() {
        return "MyViewGroup";
    }

    @Nonnull
    @Override
    protected MyViewGroup createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new MyViewGroup(reactContext);
    }

    @Override
    public void addView(MyViewGroup parent, View child, int index) {
        super.addView(parent, child, index);
        Log.d("--==--child", "l: " + child.getLeft() + ", t: " + child.getTop() +
                ", r: " + child.getRight() + ", b: " + child.getBottom());
    }

    @Override
    public void addViews(MyViewGroup parent, List<View> views) {
        super.addViews(parent, views);
        for (View child: views) {
            Log.d("--==--child", "l: " + child.getLeft() + ", t: " + child.getTop() +
                    ", r: " + child.getRight() + ", b: " + child.getBottom());
        }
    }
}
