import SwiftUI

struct ConfirmationView: View {
    let orderId: UUID? // The ID of the successfully saved order

    @Environment(\.presentationMode) var presentationMode // To dismiss or navigate

    // A way to programmatically switch to the Dashboard (which is typically a root view)
    // This might involve changing a @State or @AppStorage variable that ContentView observes,
    // or using a more sophisticated navigation stack manager if you have one.
    // For simplicity, we'll provide a button that suggests going back to Dashboard.
    // In a more complex app, you might have a TabView and can switch tabs.
    
    // If your Dashboard is the root of a NavigationView, you might need to pop to root.
    // This example assumes a simple dismissal or a button to guide the user.

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 100, height: 100)
                .foregroundColor(.green)

            Text("Thank You!")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Your order has been placed successfully.")
                .font(.title2)
                .multilineTextAlignment(.center)

            if let orderId = orderId {
                Text("Order ID: \(orderId.uuidString)")
                    .font(.headline)
                    .padding()
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(8)
            } else {
                Text("Your order is being processed.")
                    .font(.headline)
            }

            Spacer()

            // Option 1: Button to go "Back to Dashboard"
            // This assumes CreateOrderView was presented in a way that allows going back
            // to a view that can then lead to Dashboard, or Dashboard is a clear root.
            // If CreateOrderView is part of the Dashboard's NavigationView stack,
            // you might want to pop to the root view.
            Button {
                // This action depends on your navigation setup.
                // If ConfirmationView is pushed onto CreateOrderView's NavigationView,
                // and CreateOrderView is itself part of Dashboard's NavigationView:
                // 1. You might want to pop to root. This requires access to the NavigationView.
                //    (Often done by passing a binding or using a custom NavigationController wrapper).
                // 2. Or, if Dashboard is a separate tab, switch to that tab.
                // 3. Simplest: dismiss this view. The user is then back on CreateOrderView or Dashboard.
                
                // For this example, let's assume we want to dismiss this view.
                // If CreateOrderView was pushed, this goes back to it.
                // If presented modally, it dismisses the modal.
                // The user should then be able to navigate to Dashboard or it's already visible.
                
                // A more robust solution for "go to dashboard" might involve setting a global state
                // that your ContentView or main navigation router observes.
                // For example, setting an @AppStorage value or an @EnvironmentObject property.
                
                // For now, let's just dismiss.
                presentationMode.wrappedValue.dismiss()

                // To truly navigate to a "Dashboard" tab or root view, you'd need a more
                // centralized navigation control mechanism.
                // e.g., if using a TabView as root:
                // appState.selectedTab = .dashboard (where appState is an EnvironmentObject)

            } label: {
                Text("Return to Dashboard")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .foregroundColor(.white)
                    .background(Color.blue)
                    .cornerRadius(10)
            }
            .padding(.horizontal)
            
            // Option 2: If presented modally, a "Done" button might be more appropriate.
            // Button("Done") {
            // presentationMode.wrappedValue.dismiss()
            // }
            // .padding()

        }
        .padding()
        .navigationBarHidden(true) // Often, confirmation screens are full-screen without nav bar
        .navigationBarBackButtonHidden(true) // Hide back button to prevent going back to payment flow
    }
}

struct ConfirmationView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView { // Wrap in NavigationView for preview context
            ConfirmationView(orderId: UUID())
        }
        ConfirmationView(orderId: nil)
            .previewDisplayName("Order ID Missing")
    }
}
