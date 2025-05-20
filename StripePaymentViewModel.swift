import Foundation
import StripePaymentSheet
import Supabase
import Combine // For ObservableObject, @Published

@MainActor
class StripePaymentViewModel: ObservableObject {
    @Published var paymentSheet: PaymentSheet?
    @Published var paymentResult: PaymentSheetResult?
    @Published var isPaymentSheetPresented: Bool = false
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    // Stripe Publishable Key from the README
    // IMPORTANT: In a real app, consider fetching this from a configuration file or environment variable
    // rather than hardcoding, though for client-side SDKs, hardcoding is common.
    let stripePublishableKey = "pk_live_5vKOii6RstRUd7bpww7zaSof" // As per README for testing.

    struct PaymentIntentResponse: Decodable {
        let clientSecret: String
        // Add paymentIntentId if your Edge Function returns it directly at the top level
        // let paymentIntentId: String?
    }

    func preparePaymentSheet(totalAmount: Double, currency: String, customerEmail: String) async -> String? {
        isLoading = true
        errorMessage = nil
        
        // 1. Set Stripe Publishable Key (if not already set in App Delegate or main App struct)
        // StripeAPI.defaultPublishableKey = stripePublishableKey // Can also be set once at app launch

        // 2. Create PaymentIntent by calling the Supabase Edge Function
        do {
            print("Invoking Supabase function 'create-payment-intent' with amount: \(totalAmount), currency: \(currency)")
            let response: PaymentIntentResponse = try await SupabaseManager.shared.client.functions
                .invoke("create-payment-intent", options: .init(body: ["amount": totalAmount, "currency": currency]))
            
            let clientSecret = response.clientSecret
            // Extract paymentIntentId from clientSecret (format: pi_xxx_secret_yyy)
            let paymentIntentId = clientSecret.components(separatedBy: "_secret_").first
            
            print("Successfully fetched clientSecret: \(clientSecret), paymentIntentId: \(paymentIntentId ?? "N/A")")

            // 3. Create PaymentSheet configuration
            var configuration = PaymentSheet.Configuration()
            configuration.merchantDisplayName = "Your Company Name, Inc." // Replace with your actual merchant name
            configuration.customer = .init(email: customerEmail) // Pre-fill customer email
            // configuration.applePay = .init(merchantId: "your_apple_merchant_id", merchantCountryCode: "US") // Example for Apple Pay

            // 4. Initialize PaymentSheet
            self.paymentSheet = PaymentSheet(paymentIntentClientSecret: clientSecret, configuration: configuration)
            self.isLoading = false
            self.isPaymentSheetPresented = true // Trigger presentation in the View
            return paymentIntentId // Return the paymentIntentId to be used later for saving the order

        } catch {
            print("Error preparing payment sheet: \(error.localizedDescription)")
            self.errorMessage = "Error setting up payment: \(error.localizedDescription)"
            self.isLoading = false
            return nil
        }
    }

    func onPaymentCompletion(result: PaymentSheetResult) {
        self.paymentResult = result
        self.isPaymentSheetPresented = false // Dismiss the sheet

        // Handle the result (this will be expanded in CreateOrderView or by observing paymentResult)
        switch result {
        case .completed:
            print("Payment completed!")
            // Further actions (like saving order) will be triggered by the view observing this state.
        case .canceled:
            print("Payment canceled.")
            self.errorMessage = "Payment was cancelled."
        case .failed(let error):
            print("Payment failed: \(error.localizedDescription)")
            self.errorMessage = "Payment failed: \(error.localizedDescription)"
        }
    }
}
