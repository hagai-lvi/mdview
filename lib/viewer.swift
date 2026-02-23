import AppKit
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    var webView: WKWebView!

    let urlString: String
    let windowTitle: String

    init(url: String, title: String) {
        self.urlString = url
        self.windowTitle = title
        super.init()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create the window
        let windowRect = NSRect(x: 0, y: 0, width: 900, height: 700)
        window = NSWindow(
            contentRect: windowRect,
            styleMask: [.titled, .closable, .resizable, .miniaturizable],
            backing: .buffered,
            defer: false
        )

        window.title = windowTitle
        window.center()

        // Create WebView configuration
        let config = WKWebViewConfiguration()

        // Create WebView
        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]

        // Add WebView to window
        window.contentView?.addSubview(webView)

        // Load the URL
        if let url = URL(string: urlString) {
            let request = URLRequest(url: url)
            webView.load(request)
        }

        // Show window and bring to front
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        window.orderFrontRegardless()

        // Set window delegate to handle close
        window.delegate = self
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}

extension AppDelegate: NSWindowDelegate {
    func windowWillClose(_ notification: Notification) {
        NSApplication.shared.terminate(nil)
    }
}

// Main entry point
let arguments = CommandLine.arguments

guard arguments.count >= 3 else {
    fputs("Usage: mdview-window <url> <title>\n", stderr)
    exit(1)
}

let url = arguments[1]
let title = arguments[2]

let app = NSApplication.shared
let delegate = AppDelegate(url: url, title: title)
app.delegate = delegate
app.setActivationPolicy(.regular)
app.activate(ignoringOtherApps: true)
app.run()
