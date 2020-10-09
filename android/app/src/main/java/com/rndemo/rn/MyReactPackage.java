package com.rndemo.rn;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.rndemo.rn.modules.MyJavaModule;
import com.rndemo.rn.views.MyViewGroupManager;

import java.util.Arrays;
import java.util.List;

import javax.annotation.Nonnull;

public class MyReactPackage implements ReactPackage {

    @Nonnull
    @Override
    public List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
        return Arrays.asList(new MyJavaModule(reactContext));
    }

    @Nonnull
    @Override
    public List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
        return Arrays.asList(new MyViewGroupManager());
    }


}
