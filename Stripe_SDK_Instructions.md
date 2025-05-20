## 1. Adding the Stripe iOS SDK

We'll use Swift Package Manager (SPM) to add the Stripe iOS SDK to your project. The primary package we need for Payment Sheet is `StripePaymentSheet`.

1.  In Xcode, with your project open, navigate to **File > Add Packages...**.
2.  A dialog will appear. In the search bar in the top right corner, paste the Stripe iOS SDK package URL:
    ```
    https://github.com/stripe/stripe-ios.git
    ```
3.  Xcode will search for the package. Once it appears in the list, select it.
4.  For **Dependency Rule**, you can choose **Up to Next Major Version**.
5.  Click **Add Package**.
6.  Xcode will resolve the package dependencies. You will be asked which package products to add to your target. **Crucially, select `StripePaymentSheet`**. You may also select other packages like `StripeCore` if you need them, but `StripePaymentSheet` is essential for this integration. `StripePaymentsUI` is also often useful for UI elements. For this task, ensure `StripePaymentSheet` is checked.
7.  Click **Add Package** again.

The Stripe SDK, specifically `StripePaymentSheet`, is now added to your project.

## 2. Updating Your Main App File (e.g., `MySupabaseAppApp.swift`)

You need to set the Stripe publishable key when your app starts.

Open your main app file (e.g., `MySupabaseAppApp.swift`).

Modify it as follows:

```swift
import SwiftUI
import Supabase
import Stripe // Import the main Stripe SDK module

@main
struct MySupabaseAppApp: App { // Replace MySupabaseAppApp with your actual app name

    // Shared instance of AuthViewModel for the entire app
    @StateObject var authViewModel = AuthViewModel()

    init() {
        // Initialize Supabase client
        let _ = SupabaseManager.shared
        print("App initialized and SupabaseManager accessed.")

        // Set Stripe Publishable Key
        // Replace with your actual key if different, but using the one from README for now.
        StripeAPI.defaultPublishableKey = "pk_live_5vKOii6RstRUd7bpww7zaSof"
        print("Stripe Publishable Key Set.")
        
        // Perform an initial session check for auth state
        // Task {
        //    await authViewModel.checkInitialSession()
        // }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authViewModel) // Provide AuthViewModel to the environment
        }
    }
}
```

**Key changes:**

*   `import Stripe`: Imports the necessary Stripe module.
*   `StripeAPI.defaultPublishableKey = "pk_live_5vKOii6RstRUd7bpww7zaSof"`: This line in the `init()` method sets your Stripe publishable key globally for the app.
*   `@StateObject var authViewModel = AuthViewModel()`: Initializes `AuthViewModel` here as a `@StateObject` to ensure it's managed correctly by the app's lifecycle and can be passed as an `@EnvironmentObject`.
*   `.environmentObject(authViewModel)`: Passes the `authViewModel` to the `ContentView` and its children.

**Note on `AuthViewModel` Initialization:**
Previously, `AuthViewModel` might have been initialized in `ContentView` or passed down differently. It's good practice to initialize it in the `App` struct if it's globally used, then pass it via `.environmentObject`. Ensure your `ContentView` and other views that need it are updated to receive it via `@EnvironmentObject`.

(Ensure your `ContentView.swift` and any other relevant views use `@EnvironmentObject var authViewModel: AuthViewModel` and that `SupabaseManager.swift` is correctly set up as shown in previous steps).
```
