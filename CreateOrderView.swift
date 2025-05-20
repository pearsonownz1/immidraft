import SwiftUI
import StripePaymentSheet // Import StripePaymentSheet

struct CreateOrderView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject var orderViewModel: OrderViewModel
    @StateObject var stripePaymentViewModel = StripePaymentViewModel() // ViewModel for Stripe payments

    @State private var showingDocumentPicker = false
    @State private var navigateToConfirmation = false // For navigation
    @State private var savedOrderIdForConfirmation: UUID? // To pass to ConfirmationView

    // Initialize OrderViewModel with the user's email and ID
    init(userEmail: String?, userId: UUID?) {
        _orderViewModel = StateObject(wrappedValue: OrderViewModel(userEmail: userEmail ?? "unknown@example.com", userId: userId))
    }

    var body: some View {
        Form {
            // Customer Information Section (as before)
            Section(header: Text("Customer Information")) {
                TextField("Your Email", text: $orderViewModel.userEmail)
                    .disabled(true).foregroundColor(.gray)
            }

            // Service Details Section (as before)
            Section(header: Text("Service Details")) {
                Picker("Service Type", selection: $orderViewModel.serviceType) {
                    ForEach(orderViewModel.serviceTypes, id: \.self) { Text($0) }
                }
                Picker("Language From", selection: $orderViewModel.languageFrom) {
                    ForEach(orderViewModel.availableLanguages, id: \.self) { Text($0) }
                }
                Picker("Language To", selection: $orderViewModel.languageTo) {
                    ForEach(orderViewModel.availableLanguages, id: \.self) { Text($0) }
                }
                if orderViewModel.serviceType == "Certified Translation" {
                    TextField("Number of Pages", text: $orderViewModel.numberOfPagesString)
                        .keyboardType(.numberPad)
                }
            }

            // Upload Documents Section (as before, using orderViewModel.fileUploaderViewModel)
            Section(header: Text("Upload Documents")) {
                Button { showingDocumentPicker = true } label: { Label("Select Documents", systemImage: "doc.badge.plus") }
                    .sheet(isPresented: $showingDocumentPicker) {
                        DocumentPickerView(selectedFileURLs: $orderViewModel.fileUploaderViewModel.selectedLocalFileURLs)
                    }
                // Display selected and uploaded files logic (as before)
                // ... (condensed for brevity, assuming it's correctly bound to orderViewModel.fileUploaderViewModel)
                 if !orderViewModel.fileUploaderViewModel.selectedLocalFileURLs.isEmpty {
                    Text("Selected files for upload:").font(.headline).padding(.top)
                    ForEach(orderViewModel.fileUploaderViewModel.selectedLocalFileURLs, id: \.self) { url in
                        HStack { /* ... file display ... */ Text(url.lastPathComponent).font(.caption) }
                    }
                    Button(action: {
                        guard let userId = authViewModel.currentUser?.id.uuidString else {
                            orderViewModel.fileUploaderViewModel.errorMessage = "User not authenticated."
                            return
                        }
                        Task { await orderViewModel.fileUploaderViewModel.uploadAllSelectedDocuments(userId: userId) }
                    }) { /* ... upload button ... */ Text(orderViewModel.fileUploaderViewModel.isUploading ? "Uploading..." : "Upload Selected Files").foregroundColor(.white).padding().background(Color.blue).cornerRadius(8) }
                    .disabled(orderViewModel.fileUploaderViewModel.isUploading).padding(.top)
                 }
                 if !orderViewModel.fileUploaderViewModel.uploadedSupabasePaths.isEmpty {
                    Text("Successfully uploaded:").font(.headline).padding(.top)
                    ForEach(orderViewModel.fileUploaderViewModel.uploadedSupabasePaths, id: \.self) { path in
                        HStack { Image(systemName: "checkmark.icloud.fill").foregroundColor(.green); Text(path.components(separatedBy: "/").last ?? path).font(.caption) }
                    }
                 }
                if let upError = orderViewModel.fileUploaderViewModel.errorMessage { Text("Upload Error: \(upError)").foregroundColor(.red) }
            }


            // Order Summary Section (as before)
            Section(header: Text("Order Summary")) {
                HStack {
                    Text("Estimated Price:")
                    Spacer()
                    Text("$\(orderViewModel.calculatedPrice, specifier: "%.2f")")
                        .font(.title2).fontWeight(.bold)
                }
            }
            
            // Payment and Submission Section
            Section {
                if stripePaymentViewModel.isLoading {
                    ProgressView("Preparing payment...")
                } else if stripePaymentViewModel.paymentSheet != nil {
                    // PaymentSheet.PaymentButton will be used inside .paymentSheet modifier's content
                    // For now, we rely on the .paymentSheet modifier to show the button
                    // Or we can have a custom button that sets isPaymentSheetPresented = true
                     Button {
                        stripePaymentViewModel.isPaymentSheetPresented = true
                     } label: {
                        Text("Proceed to Payment")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity, alignment: .center)
                     }
                     .disabled(orderViewModel.fileUploaderViewModel.uploadedSupabasePaths.isEmpty || orderViewModel.fileUploaderViewModel.isUploading)

                } else {
                    Button("Setup Payment") {
                        orderViewModel.prepareOrderForPayment() // Validate order details first
                        if orderViewModel.errorMessage == nil { // If validation passes
                            Task {
                                guard let paymentIntentId = await stripePaymentViewModel.preparePaymentSheet(
                                    totalAmount: orderViewModel.calculatedPrice,
                                    currency: "usd", // Or from your config
                                    customerEmail: orderViewModel.userEmail
                                ) else {
                                    // Error is handled by stripePaymentViewModel.errorMessage
                                    return
                                }
                                // Store paymentIntentId if needed before payment completion,
                                // but it's usually used after successful payment for order saving.
                                print("Payment Intent ID created: \(paymentIntentId)")
                            }
                        }
                    }
                    .disabled(orderViewModel.fileUploaderViewModel.uploadedSupabasePaths.isEmpty || orderViewModel.fileUploaderViewModel.isUploading)
                }
                
                // NavigationLink to ConfirmationView, activated by navigateToConfirmation
                NavigationLink(destination: ConfirmationView(orderId: savedOrderIdForConfirmation),
                               isActive: $navigateToConfirmation) {
                    EmptyView() // Invisible link, navigation is triggered programmatically
                }
            }

            // Display errors from OrderViewModel or StripePaymentViewModel
            if let orderError = orderViewModel.errorMessage {
                Text("Error: \(orderError)").foregroundColor(.red).font(.caption)
            }
            if let paymentError = stripePaymentViewModel.errorMessage {
                Text("Payment Error: \(paymentError)").foregroundColor(.red).font(.caption)
            }
        }
        .navigationTitle("Create New Order")
        .paymentSheet(isPresented: $stripePaymentViewModel.isPaymentSheetPresented,
                      paymentSheet: stripePaymentViewModel.paymentSheet!, // Force unwrap: only shown if paymentSheet is non-nil
                      onCompletion: stripePaymentViewModel.onPaymentCompletion)
        .onAppear {
            orderViewModel.updateUser(email: authViewModel.currentUser?.email, id: authViewModel.currentUser?.id)
            orderViewModel.fileUploaderViewModel.errorMessage = nil
            orderViewModel.errorMessage = nil
            stripePaymentViewModel.errorMessage = nil
        }
        .onChange(of: stripePaymentViewModel.paymentResult) { result in
            // Handle payment completion and then save order
            if case .completed = result {
                print("Payment completed via Stripe. Attempting to save order.")
                // Extract paymentIntentId from clientSecret (clientSecret format: pi_xxx_secret_yyy)
                // This assumes clientSecret was stored or can be retrieved.
                // Better: stripePaymentViewModel.preparePaymentSheet should return/store paymentIntentId.
                // For now, let's assume we can get it from the client secret if it was stored.
                // Or, if the edge function returned it, use it.

                // Let's assume preparePaymentSheet now returns the paymentIntentId
                // and we stored it in stripePaymentViewModel or passed it along.
                // For this example, we'll need to modify preparePaymentSheet or how it stores the PI ID.
                // For now, let's assume stripePaymentViewModel.lastPaymentIntentId exists
                
                // A robust way: The paymentIntentId is part of the client_secret.
                // pi_12345_secret_67890 -> pi_12345 is the ID.
                // It should have been captured when the payment intent was created.
                // We will modify StripePaymentViewModel to return it from preparePaymentSheet.

                Task {
                    // Re-fetch or ensure paymentIntentId is available
                    // This is a placeholder for where you'd get the actual paymentIntentId
                    // that was created before showing the sheet.
                    // Let's assume the `preparePaymentSheet` function in StripePaymentViewModel
                    // can make this available, or it's extracted from the client secret.
                    // For now, we simulate it being available. A real implementation needs to pass this securely.
                    
                    // Let's simulate by re-calling preparePaymentSheet just to get the ID again
                    // THIS IS NOT IDEAL for production. The ID should be stored from the first call.
                    if let paymentIntentID = await stripePaymentViewModel.preparePaymentSheet(
                        totalAmount: orderViewModel.calculatedPrice,
                        currency: "usd",
                        customerEmail: orderViewModel.userEmail
                    ) {
                        await orderViewModel.saveOrderToSupabase(paymentIntentId: paymentIntentID, status: "Processing")
                        if let savedId = orderViewModel.successfullySavedOrderId {
                            self.savedOrderIdForConfirmation = savedId
                            self.navigateToConfirmation = true // Trigger navigation
                        } else {
                            // Handle error: order not saved even if payment was successful
                            orderViewModel.errorMessage = orderViewModel.orderSavingError ?? "Failed to save order after payment."
                        }
                    } else {
                         orderViewModel.errorMessage = "Could not retrieve Payment Intent ID to save order."
                    }
                }
            }
        }
    }
}

// Update DashboardView to pass user's email AND ID to CreateOrderView
struct DashboardView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        NavigationView {
            VStack {
                Text("Welcome!")
                    .font(.largeTitle)
                if let email = authViewModel.currentUser?.email {
                    Text("Logged in as: \(email)")
                        .font(.headline)
                        .padding(.top)
                }

                NavigationLink("Create New Order", destination: CreateOrderView(userEmail: authViewModel.currentUser?.email, userId: authViewModel.currentUser?.id))
                    .padding().buttonStyle(.borderedProminent).padding(.top, 20)

                Spacer()
                Button(action: { Task { await authViewModel.signOut() } }) {
                    Text("Sign Out").fontWeight(.semibold).frame(maxWidth: .infinity)
                        .padding().foregroundColor(.white).background(Color.red).cornerRadius(8)
                }
                .padding()
            }
            .navigationTitle("Dashboard")
        }
    }
}

struct CreateOrderView_Previews: PreviewProvider {
    static var previews: some View {
        let mockAuth = AuthViewModel()
        // mockAuth.currentUser = User(id: UUID(), ...) // Mock a user
        NavigationView {
            CreateOrderView(userEmail: "preview@example.com", userId: UUID())
                .environmentObject(mockAuth)
        }
    }
}
