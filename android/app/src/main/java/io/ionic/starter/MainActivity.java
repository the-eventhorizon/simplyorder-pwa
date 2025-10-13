package io.ionic.starter;

import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = new WebView(this);
        WebSettings webSettings = webView.getSettings();
        webSettings.setMediaPlaybackRequiresUserGesture(false);
    }
}
