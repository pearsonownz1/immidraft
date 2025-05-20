import Foundation
import Supabase
import Combine // Required for @Published and ObservableObject

@MainActor // Ensure UI updates are on the main thread
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated: Bool = false
    @Published var errorMessage: String?
    @Published var isLoading: Bool = false

    private var authCancellable: AnyCancellable? // To monitor auth state changes

    init() {
        // Listen for Supabase auth state changes
        authCancellable = SupabaseManager.shared.client.auth.authStateChanges
            .receive(on: DispatchQueue.main) // Ensure updates are on the main thread
            .map { $0.session?.user }
            .assign(to: \.currentUser, on: self)
        
        // Update isAuthenticated based on currentUser
        // Using .sink to also manually update isAuthenticated
        authCancellable = SupabaseManager.shared.client.auth.authStateChanges
            .receive(on: DispatchQueue.main)
            .sink { [weak self] authChangeEvent in
                self?.currentUser = authChangeEvent.session?.user
                self?.isAuthenticated = (authChangeEvent.session?.user != nil)
                print("Auth state changed. User: \(String(describing: self?.currentUser?.email)), IsAuthenticated: \(self?.isAuthenticated ?? false)")
            }
    }

    func signUp(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let session = try await SupabaseManager.shared.client.auth.signUp(
                email: email,
                password: password
            )
            // Supabase handles email confirmation, user might not be immediately "authenticated"
            // until they confirm. For this example, we'll consider them signed up.
            // The authStateChanges listener will update currentUser and isAuthenticated.
            print("Sign up successful for \(email). Session: \(String(describing: session))")
            // You might want to set isAuthenticated to false here if email confirmation is required
            // and only set it to true once the user is confirmed.
            // For simplicity, the authStateChanges listener will handle this.
        } catch {
            print("Error signing up: \(error.localizedDescription)")
            errorMessage = "Sign up failed: \(error.localizedDescription)"
        }
        isLoading = false
    }

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let session = try await SupabaseManager.shared.client.auth.signIn(
                email: email,
                password: password
            )
            // The authStateChanges listener will update currentUser and isAuthenticated.
            print("Sign in successful for \(email). Session: \(session)")
        } catch {
            print("Error signing in: \(error.localizedDescription)")
            errorMessage = "Sign in failed: \(error.localizedDescription)"
        }
        isLoading = false
    }

    func signOut() async {
        isLoading = true
        errorMessage = nil
        do {
            try await SupabaseManager.shared.client.auth.signOut()
            // The authStateChanges listener will update currentUser and isAuthenticated to nil/false.
            print("Sign out successful.")
        } catch {
            print("Error signing out: \(error.localizedDescription)")
            errorMessage = "Sign out failed: \(error.localizedDescription)"
        }
        isLoading = false
    }
    
    // Call this on app launch to check the initial session
    func checkInitialSession() async {
        isLoading = true
        do {
            let session = try await SupabaseManager.shared.client.auth.session
            self.currentUser = session.user
            self.isAuthenticated = (session.user != nil)
            print("Initial session check. User: \(String(describing: self.currentUser?.email)), IsAuthenticated: \(self.isAuthenticated)")
        } catch {
            // No active session or error fetching it.
            // This is normal if the user is not logged in.
            self.currentUser = nil
            self.isAuthenticated = false
            print("Initial session check: No active session or error: \(error.localizedDescription)")
        }
        isLoading = false
    }
}
