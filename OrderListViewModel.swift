import Foundation
import Combine
import Supabase

@MainActor
class OrderListViewModel: ObservableObject {
    @Published var orders: [OrderResponse] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let supabaseClient = SupabaseManager.shared.client

    func fetchOrders(userId: UUID) async {
        isLoading = true
        errorMessage = nil
        orders.removeAll() // Clear previous orders

        do {
            let fetchedOrders: [OrderResponse] = try await supabaseClient.database
                .from("ios_orders")
                .select() // Select all columns by default, or specify like .select("id, service_type, ...")
                .eq("user_id", value: userId.uuidString) // Filter by user_id
                .order("created_at", ascending: false) // Order by creation date
                .execute()
                .value
            
            self.orders = fetchedOrders
            if fetchedOrders.isEmpty {
                print("No orders found for user \(userId.uuidString)")
            } else {
                print("Fetched \(fetchedOrders.count) orders for user \(userId.uuidString)")
            }
        } catch {
            print("Error fetching orders: \(error.localizedDescription)")
            self.errorMessage = "Failed to fetch orders: \(error.localizedDescription)"
        }
        isLoading = false
    }
}
