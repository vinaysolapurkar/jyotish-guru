# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }

# Keep Capacitor config
-keep class com.getcapacitor.Config { *; }

# Keep JavaScript interfaces
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView clients
-keep public class * extends android.webkit.WebViewClient
-keep public class * extends android.webkit.WebChromeClient

# Keep annotations
-keepattributes *Annotation*

# Preserve line numbers for stack traces
-keepattributes SourceFile,LineNumberTable

# App-specific
-keep class vincom.jyotishguru.app.** { *; }
