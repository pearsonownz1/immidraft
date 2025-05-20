import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject var orderListViewModel = OrderListViewModel() // ViewModel for fetching orders

    var body: some View {
        NavigationView {
            VStack {
                // Header Section
                VStack {
                    Text("Welcome!")
                        .font(.largeTitle)
                        .fontWeight(.semibold) // Added for emphasis
                    if let email = authViewModel.currentUser?.email {
                        Text("Logged in as: \(email)")
                            .font(.subheadline)
                            .foregroundColor(.gray) // Subtle color for email
                            .padding(.bottom, 10)
                    }
                }
                .padding(.top) // Add padding at the top of the header

                // Create New Order Button
                NavigationLink(destination: CreateOrderView(userEmail: authViewModel.currentUser?.email, userId: authViewModel.currentUser?.id)) {
                    Label("Create New Order", systemImage: "plus.circle.fill")
                        .font(.headline)
                        .padding() // Standard padding
                        .foregroundColor(.white)
                        .background(Color.blue)
                        .cornerRadius(10) // Consistent corner radius
                }
                .padding(.bottom) // Space below the button
                
                // Orders List Section Title
                Text("Your Orders")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .padding(.top)
                    .frame(maxWidth: .infinity, alignment: .leading) // Align title to the left
                    .padding(.horizontal)


                // Orders List Section
                if orderListViewModel.isLoading {
                    ProgressView("Loading orders...")
                        .padding()
                } else if let errorMessage = orderListViewModel.errorMessage {
                    VStack(spacing: 10) { // Added spacing
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange) // Changed to orange for warning
                            .font(.largeTitle)
                        Text("Error: \(errorMessage)")
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        Button("Retry") {
                            if let userId = authViewModel.currentUser?.id {
                                Task {
                                    await orderListViewModel.fetchOrders(userId: userId)
                                }
                            }
                        }
                        .buttonStyle(.bordered) // Added button style
                        .padding(.top)
                    }
                    .padding()
                } else if orderListViewModel.orders.isEmpty {
                    VStack(spacing: 10) { // Added spacing
                        Image(systemName: "doc.text.magnifyingglass")
                            .font(.system(size: 50)) // Made icon larger
                            .foregroundColor(.gray)
                        Text("No orders found.")
                            .font(.headline)
                            .foregroundColor(.gray)
                        Text("Create your first order to see it here.")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                    }
                    .padding() // Padding around the empty state message
                    .frame(maxHeight: .infinity) // Center empty state message vertically
                } else {
                    List {
                        ForEach(orderListViewModel.orders) { order in
                            OrderRowView(order: order)
                                // Add context menu or swipe actions later if needed
                        }
                    }
                    .listStyle(PlainListStyle()) // Using PlainListStyle for a cleaner look
                }
                
                Spacer(minLength: 0) // Flexible spacer

                // Sign Out Button
                Button(action: {
                    Task {
                        await authViewModel.signOut()
                    }
                }) {
                    Label("Sign Out", systemImage: "arrow.backward.circle.fill")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .foregroundColor(.white)
                        .background(Color.red)
                        .cornerRadius(10)
                }
                .padding() // Padding around the sign out button
            }
            .navigationTitle("Dashboard") // This title might be hidden by navigationBarHidden
            .navigationBarHidden(true) // Hiding default nav bar for a custom header feel
            .onAppear {
                if let userId = authViewModel.currentUser?.id {
                    Task {
                        await orderListViewModel.fetchOrders(userId: userId)
                    }
                } else {
                    orderListViewModel.errorMessage = "User not authenticated. Cannot fetch orders."
                }
            }
        }
        // Ensure AuthViewModel is correctly passed from the App's main struct
        // via .environmentObject(authViewModel)
    }
}

// Preview for DashboardView
struct DashboardView_Previews: PreviewProvider {
    static var previews: some View {
        let mockAuthViewModel = AuthViewModel()
        // For preview, simulate a logged-in user
        // mockAuthViewModel.currentUser = User(id: UUID(), aud: "auth", role: "auth", email: "user@example.com", ...)
        // mockAuthViewModel.isAuthenticated = true
        
        let mockOrderListViewModel = OrderListViewModel()
        // Example: Preview with loaded orders
//        mockOrderListViewModel.orders = [
//            OrderResponse(id: UUID(), user_id: UUID(), user_email: "test@example.com", documents: nil, language_from: "EN", language_to: "ES", service_type: "Certified Translation", page_count: 1, price_per_page: 25, total_amount: 25.00, stripe_payment_intent_id: "pi_test", order_status: "Completed", created_at: Date()),
//            OrderResponse(id: UUID(), user_id: UUID(), user_email: "test@example.com", documents: nil, language_from: "EN", language_to: "DE", service_type: "Diploma Evaluation", page_count: nil, price_per_page: nil, total_amount: 150.00, stripe_payment_intent_id: "pi_test2", order_status: "Processing", created_at: Date().addingTimeInterval(-86400))
//        ]
        // Example: Preview with no orders (default state)
        // Example: Preview with loading state
        // mockOrderListViewModel.isLoading = true
        // Example: Preview with error state
        // mockOrderListViewModel.errorMessage = "Failed to load orders. Please try again."

        return DashboardView()
            .environmentObject(mockAuthViewModel)
            // .environmentObject(mockOrderListViewModel) // Not needed as it's a @StateObject in DashboardView
    }
}
