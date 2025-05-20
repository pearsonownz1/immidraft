import Foundation

// This struct will be used to decode the order data from Supabase.
// It needs to be Decodable and Identifiable for use in SwiftUI Lists.
struct OrderResponse: Decodable, Identifiable {
    let id: UUID
    let user_id: UUID? // Make optional if it's not always returned or needed for display
    let user_email: String? // Make optional
    var documents: [String]? // Array of Supabase storage paths
    let language_from: String?
    let language_to: String?
    let service_type: String
    let page_count: Int?
    let price_per_page: Double?
    let total_amount: Double
    let stripe_payment_intent_id: String?
    let order_status: String
    let created_at: Date // Supabase typically returns ISO 8601 string, which needs decoding

    // CodingKeys to map Swift struct properties to snake_case database columns
    enum CodingKeys: String, CodingKey {
        case id
        case user_id
        case user_email
        case documents
        case language_from
        case language_to
        case service_type
        case page_count
        case price_per_page
        case total_amount
        case stripe_payment_intent_id
        case order_status
        case created_at
    }
    
    // Custom Date Formatter for display
    var formattedCreatedAt: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: created_at)
    }
}

// It seems OrderViewModel.swift already defines an OrderResponse.
// To avoid conflict and ensure consistency, it's better to have one definition.
// If OrderViewModel.swift's OrderResponse is sufficient and correctly defined
// (Decodable, Identifiable, has all necessary fields), we can use that one.
// For this task, I'll assume the one defined above is the canonical one we'll use.
// If OrderViewModel.swift has one, it should be removed or made to conform to this.
// For now, I'm creating this in OrderModels.swift.

// The Order struct for ENCODING (creating orders) can remain in OrderViewModel.swift
// or also be moved here if preferred, but it has different requirements (Encodable).
// struct Order: Encodable { ... }
// For clarity, I'll keep them separate for now. Order (Encodable) in OrderViewModel,
// OrderResponse (Decodable, Identifiable) here in OrderModels.swift.
