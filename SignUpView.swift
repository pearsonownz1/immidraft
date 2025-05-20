import SwiftUI

struct SignUpView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = "" // Optional: for password confirmation

    @Environment(\.dismiss) var dismiss // To dismiss the view if presented modally

    var body: some View {
        NavigationView { // Optional: if you want a navigation bar
            VStack(spacing: 20) {
                Text("Create Account")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding(.bottom, 30)

                TextField("Email", text: $email)
                    .padding()
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(8)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)

                SecureField("Password", text: $password)
                    .padding()
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(8)
                
                // Optional: Confirm Password Field
                // SecureField("Confirm Password", text: $confirmPassword)
                //     .padding()
                //     .background(Color(UIColor.secondarySystemBackground))
                //     .cornerRadius(8)


                if let errorMessage = authViewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.vertical)
                }

                Button(action: {
                    // Basic client-side validation (can be expanded)
                    guard !email.isEmpty, !password.isEmpty else {
                        authViewModel.errorMessage = "Email and password cannot be empty."
                        return
                    }
                    // guard password == confirmPassword else {
                    //     authViewModel.errorMessage = "Passwords do not match."
                    //     return
                    // }
                    // Add more validation like password strength if needed

                    Task {
                        await authViewModel.signUp(email: email, password: password)
                        // If sign up is successful and isAuthenticated becomes true,
                        // the main app's view routing will handle navigation.
                        // If presented modally, you might want to dismiss it here
                        // if authViewModel.isAuthenticated {
                        // dismiss()
                        // }
                    }
                }) {
                    Text("Sign Up")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .foregroundColor(.white)
                        .background(authViewModel.isLoading ? Color.gray : Color.blue)
                        .cornerRadius(8)
                }
                .disabled(authViewModel.isLoading)

                Spacer()
                
                // NavigationLink to LoginView
                NavigationLink {
                    LoginView().navigationBarBackButtonHidden(true) // Hide back button if you want a clean switch
                } label: {
                    Text("Already have an account? Login")
                        .padding()
                }


            }
            .padding()
            //.navigationTitle("Sign Up") // Set title if NavigationView is used
            //.navigationBarHidden(true) // Hide if you want a full screen feel
        }
        .onAppear {
            authViewModel.errorMessage = nil // Clear previous errors
        }
    }
}

struct SignUpView_Previews: PreviewProvider {
    static var previews: some View {
        SignUpView()
            .environmentObject(AuthViewModel()) // Provide a mock for preview
    }
}
