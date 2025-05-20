import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        // Group is used here to switch between views without NavigationView
        // interfering with the sub-views' own NavigationViews if they have them.
        Group {
            if authViewModel.isLoading && authViewModel.currentUser == nil {
                // Show a loading indicator only during the initial session check
                // and if there's no user yet (to avoid flashing on quick auth changes)
                ProgressView("Checking session...")
            } else if authViewModel.isAuthenticated && authViewModel.currentUser != nil {
                DashboardView() // Or your main authenticated content
            } else {
                // If not authenticated, show LoginView.
                // LoginView itself can navigate to SignUpView.
                LoginView()
            }
        }
        .onAppear {
            // Perform an initial session check when ContentView appears.
            // This is crucial for restoring a session when the app launches.
            if authViewModel.currentUser == nil { // Check only if user is not already set
                Task {
                    await authViewModel.checkInitialSession()
                }
            }
        }
    }
}

// Placeholder for the main content view after authentication
struct DashboardView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        NavigationView { // Give Dashboard its own NavigationView
            VStack {
                Text("Welcome!")
                    .font(.largeTitle)
                if let email = authViewModel.currentUser?.email {
                    Text("Logged in as: \(email)")
                        .font(.headline)
                        .padding(.top)
                }

                // Example: Order Creation Button (Placeholder)
                NavigationLink("Create New Order", destination: CreateOrderView())
                    .padding()
                    .buttonStyle(.borderedProminent)
                    .padding(.top, 20)


                Spacer()

                Button(action: {
                    Task {
                        await authViewModel.signOut()
                    }
                }) {
                    Text("Sign Out")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .foregroundColor(.white)
                        .background(Color.red)
                        .cornerRadius(8)
                }
                .padding()
            }
            .navigationTitle("Dashboard")
        }
    }
}

// Placeholder for Create Order View
struct CreateOrderView: View {
    var body: some View {
        Text("Order Creation Screen")
            .navigationTitle("New Order")
    }
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        // Preview with an unauthenticated state
        ContentView()
            .environmentObject(AuthViewModel()) // Mock unauthenticated

        // Preview with an authenticated state (requires mocking user in AuthViewModel)
        // let authenticatedAuthModel = AuthViewModel()
        // authenticatedAuthModel.isAuthenticated = true
        // authenticatedAuthModel.currentUser = User(id: UUID(), aud: "authenticated", role: "authenticated", email: "test@example.com", phone: nil, appMetadata: [:], userMetadata: [:], identities: [], createdAt: Date(), updatedAt: Date())
        // ContentView()
        //     .environmentObject(authenticatedAuthModel)
        //     .previewDisplayName("Authenticated User")
    }
}
