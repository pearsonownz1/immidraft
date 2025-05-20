# Setting up Supabase in an Xcode Project

This guide provides instructions on how to create a new Xcode project, add the Supabase Swift SDK, and initialize the Supabase client.

## 1. Creating a New Xcode Project

1.  Open Xcode.
2.  Choose **Create a new Xcode project**.
3.  Select the **iOS** tab.
4.  Choose **App** and click **Next**.
5.  Enter your **Product Name** (e.g., `MySupabaseApp`).
6.  Select your **Team** (if applicable).
7.  For **Interface**, choose **SwiftUI**.
8.  For **Language**, choose **Swift**.
9.  For **Storage**, you can choose **None** for now, or Core Data/Swift Data if you plan to use local storage alongside Supabase.
10. Uncheck **Include Tests** if you don't need them for this example.
11. Click **Next**.
12. Choose a location to save your project and click **Create**.

## 2. Adding the Supabase Swift SDK

We'll use Swift Package Manager (SPM) to add the Supabase SDK to your project.

1.  In Xcode, with your project open, navigate to **File > Add Packages...**.
2.  A dialog will appear. In the search bar in the top right corner, paste the Supabase Swift SDK package URL:
    ```
    https://github.com/supabase-community/supabase-swift.git
    ```
3.  Xcode will search for the package. Once it appears in the list, select it.
4.  For **Dependency Rule**, you can choose **Up to Next Major Version**. This is a common choice to get updates while maintaining compatibility.
5.  Click **Add Package**.
6.  Xcode will resolve the package dependencies. You might be asked which package products to add to your target. Ensure `Supabase` is checked.
7.  Click **Add Package** again.

The Supabase SDK is now added to your project.

## 3. Creating a `SupabaseManager` Class

This class will be responsible for initializing and holding the Supabase client instance. It will read credentials from a `Supabase.plist` file.

**a. Create `Supabase.plist`**

1.  In Xcode's Project Navigator (left sidebar), right-click on your main project folder (the one with your app's name).
2.  Choose **New File...**.
3.  Under the **iOS** tab, scroll down to the **Resource** section and select **Property List**.
4.  Click **Next**.
5.  Name the file `Supabase.plist`.
6.  Ensure it's added to your app's target.
7.  Click **Create**.

**b. Add Credentials to `Supabase.plist`**

Open the newly created `Supabase.plist` file. By default, it opens in a property list editor. You can also open it as source code by right-clicking the file and choosing **Open As > Source Code**.

Add two new rows:

*   **Key:** `SUPABASE_URL`
    *   **Type:** `String`
    *   **Value:** `YOUR_SUPABASE_URL` (Replace with your actual Supabase project URL)
*   **Key:** `SUPABASE_ANON_KEY`
    *   **Type:** `String`
    *   **Value:** `YOUR_SUPABASE_ANON_KEY` (Replace with your actual Supabase project Anon Key)

The raw XML structure of your `Supabase.plist` should look like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>SUPABASE_URL</key>
    <string>https://your-project-ref.supabase.co</string>
    <key>SUPABASE_ANON_KEY</key>
    <string>your-anon-key</string>
</dict>
</plist>
```
**Important:** Remember to replace `https://your-project-ref.supabase.co` and `your-anon-key` with your actual Supabase project URL and public anonymous key.

**c. Create `SupabaseManager.swift`**

1.  In Xcode's Project Navigator, right-click on your main project folder.
2.  Choose **New File...**.
3.  Select the **iOS** tab.
4.  Choose **Swift File**.
5.  Click **Next**.
6.  Name the file `SupabaseManager.swift`.
7.  Click **Create**.

**d. Add Code to `SupabaseManager.swift`**

Paste the following code into `SupabaseManager.swift`:

```swift
import Foundation
import Supabase

class SupabaseManager {
    static let shared = SupabaseManager() // Singleton instance

    let client: SupabaseClient

    private init() {
        guard let plistPath = Bundle.main.path(forResource: "Supabase", ofType: "plist"),
              let plist = NSDictionary(contentsOfFile: plistPath) else {
            fatalError("Supabase.plist not found or is invalid.")
        }

        guard let supabaseURLString = plist["SUPABASE_URL"] as? String,
              let supabaseAnonKey = plist["SUPABASE_ANON_KEY"] as? String else {
            fatalError("SUPABASE_URL or SUPABASE_ANON_KEY not found in Supabase.plist.")
        }

        guard let supabaseURL = URL(string: supabaseURLString) else {
            fatalError("Invalid SUPABASE_URL in Supabase.plist.")
        }

        // Initialize the Supabase client
        self.client = SupabaseClient(
            supabaseURL: supabaseURL,
            supabaseKey: supabaseAnonKey
        )
        print("Supabase client initialized.")
    }

    // Example function to demonstrate usage (optional)
    func checkUserSession() async {
        do {
            let session = try await client.auth.session
            print("Current session: \(session)")
        } catch {
            print("Error getting session: \(error)")
        }
    }
}
```

This `SupabaseManager` does the following:
*   It's a **singleton** (`shared`), meaning there will be only one instance of this manager throughout your app.
*   In its `init()` method (which is `private` to enforce the singleton pattern):
    *   It locates the `Supabase.plist` file in your app's bundle.
    *   It reads the `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the plist.
    *   It handles potential errors if the file or keys are missing/invalid by calling `fatalError()`. In a production app, you might want more graceful error handling.
    *   It initializes the `SupabaseClient` with the retrieved URL and key.

## 4. Initializing Supabase in the Main App Struct

Now, you'll use the `SupabaseManager` in your app's entry point to ensure the client is configured when the app launches.

Open your main app file (usually named something like `YourAppNameApp.swift`, e.g., `MySupabaseAppApp.swift`).

Modify it as follows:

```swift
import SwiftUI
import Supabase // Import Supabase

@main
struct MySupabaseAppApp: App { // Replace MySupabaseAppApp with your actual app name

    init() {
        // Initialize the Supabase client when the app starts.
        // This will access the singleton and trigger its init() method.
        let _ = SupabaseManager.shared
        
        // You can also perform an initial check or task if needed:
        // Task {
        //     await SupabaseManager.shared.checkUserSession()
        // }
        print("App initialized and SupabaseManager accessed.")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

**Explanation:**

*   `import Supabase`: Make sure to import the Supabase SDK.
*   `init()`: The `App` struct's initializer is a good place for one-time setup tasks.
*   `let _ = SupabaseManager.shared`: This line accesses the `shared` instance of `SupabaseManager`. The first time it's accessed, the `SupabaseManager`'s `init()` method will be called, which in turn initializes the `SupabaseClient`. We assign it to `_` because we don't need to use the instance directly here, just ensure it's created.
*   The commented-out `Task` block shows how you could perform an asynchronous operation (like checking the initial user session) right after initialization if needed.

Now, when your app launches, the `SupabaseManager` will be initialized, and your `SupabaseClient` will be ready to use via `SupabaseManager.shared.client`.

---

With these steps, your iOS SwiftUI application is configured to use Supabase. You can now start using `SupabaseManager.shared.client` in your views or services to interact with your Supabase backend (e.g., authentication, database operations, storage).
