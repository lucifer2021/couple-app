import { Application } from '@nativescript/core';

// Request vibration permission for Android
if (Application.android) {
    const VIBRATE_PERMISSION = android.Manifest.permission.VIBRATE;
    const context = Application.android.context;
    
    if (android.content.pm.PackageManager.PERMISSION_GRANTED !==
        context.checkCallingOrSelfPermission(VIBRATE_PERMISSION)) {
        android.support.v4.app.ActivityCompat.requestPermissions(
            Application.android.foregroundActivity,
            [VIBRATE_PERMISSION],
            1
        );
    }
}

Application.run({ moduleName: 'app-root' });