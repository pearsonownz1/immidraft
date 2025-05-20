import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    
    var body: some View {
        NavigationView { // Optional: if you want a navigation bar
            VStack(spacing: 20) {
                Text("Login")
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

                if let errorMessage = authViewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.vertical)
                }

                Button(action: {
                    guard !email.isEmpty, !password.isEmpty else {
                        authViewModel.errorMessage = "Email and password cannot be empty."
                        return
                    }
                    Task {
                        await authViewModel.signIn(email: email, password: password)
                        // If sign in is successful and isAuthenticated becomes true,
                        // the main app's view routing will handle navigation.
                    }
                }) {
                    Text("Login")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .foregroundColor(.white)
                        .background(authViewModel.isLoading ? Color.gray : Color.blue)
                        .cornerRadius(8)
                }
                .disabled(authViewModel.isLoading)

                Spacer()
                
                NavigationLink {
                    SignUpView().navigationBarBackButtonHidden(true) // Hide back button for a clean switch
                } label: {
                    Text("Don't have an account? Sign Up")
                        .padding()
                }

            }
            .padding()
            //.navigationTitle("Login") // Set title if NavigationView is used
            //.navigationBarHidden(true) // Hide if you want a full screen feel
        }
        .onAppear {
            authViewModel.errorMessage = nil // Clear previous errors
        }
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
            .environmentObject(AuthViewModel()) // Provide a mock for preview
    }
}
