import SwiftUI

struct OrderRowView: View {
    let order: OrderResponse

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(order.service_type)
                    .font(.headline)
                    .foregroundColor(.blue)
                Spacer()
                Text("$\(order.total_amount, specifier: "%.2f")")
                    .font(.headline)
            }
            
            Text("Order ID: \(order.id.uuidString.prefix(8))...") // Show partial ID
                .font(.caption)
                .foregroundColor(.gray)
            
            HStack {
                Text("Status:")
                    .font(.caption)
                    .foregroundColor(.gray)
                Text(order.order_status)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(EdgeInsets(top: 2, leading: 6, bottom: 2, trailing: 6))
                    .background(statusColor(order.order_status))
                    .foregroundColor(.white)
                    .cornerRadius(5)
            }

            Text("Date: \(order.formattedCreatedAt)")
                .font(.caption)
                .foregroundColor(.gray)
            
            // Optionally, display more info like languages or document count
            // if let langFrom = order.language_from, let langTo = order.language_to {
            //     Text("Translation: \(langFrom) to \(langTo)")
            //         .font(.caption2)
            // }
            // if let docCount = order.documents?.count {
            //     Text("Documents: \(docCount)")
            //         .font(.caption2)
            // }
        }
        .padding(.vertical, 8) // Add some padding to each row
    }

    // Helper function to determine status color
    private func statusColor(_ status: String) -> Color {
        switch status.lowercased() {
        case "completed":
            return .green
        case "pending", "processing":
            return .orange
        case "cancelled", "failed":
            return .red
        default:
            return .gray
        }
    }
}

// Preview for OrderRowView
struct OrderRowView_Previews: PreviewProvider {
    static var previews: some View {
        // Create a sample OrderResponse for previewing
        let sampleOrder = OrderResponse(
            id: UUID(),
            user_id: UUID(),
            user_email: "test@example.com",
            documents: ["doc1.pdf"],
            language_from: "English",
            language_to: "Spanish",
            service_type: "Certified Translation",
            page_count: 2,
            price_per_page: 25.0,
            total_amount: 50.0,
            stripe_payment_intent_id: "pi_sample",
            order_status: "Processing",
            created_at: Date()
        )
        
        List { // Embed in List for realistic preview
            OrderRowView(order: sampleOrder)
            OrderRowView(order: OrderResponse(id: UUID(), service_type: "Diploma Evaluation", total_amount: 150.0, order_status: "Completed", created_at: Date().addingTimeInterval(-86400))) // Another sample
        }
    }
}
