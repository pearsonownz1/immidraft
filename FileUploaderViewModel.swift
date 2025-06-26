import Foundation
import Supabase
import SwiftUI // For @Published, ObservableObject
import Combine // For AnyCancellable

@MainActor // Ensure UI updates are on the main thread
class FileUploaderViewModel: ObservableObject {
    @Published var selectedLocalFileURLs: [URL] = [] {
        didSet {
            // When local file URLs are updated, you might want to trigger uploads
            // or further processing. For now, we just print.
            print("Selected local files updated: \(selectedLocalFileURLs.map { $0.lastPathComponent })")
        }
    }
    @Published var uploadedSupabasePaths: [String] = [] // Stores Supabase storage paths
    @Published var isUploading: Bool = false
    @Published var uploadProgress: Double = 0.0 // For a single file or overall progress
    @Published var errorMessage: String?
    @Published var successfullyUploadedCount: Int = 0

    private var uploadTasks = Set<AnyCancellable>() // To manage multiple upload subscriptions if needed

    // Function to upload a single document
    func uploadDocument(fileURL: URL, userId: String, fileNamePrefix: String = UUID().uuidString) async -> String? {
        self.isUploading = true
        self.errorMessage = nil
        
        // Ensure we can access the file if it's a security-scoped URL
        let shouldStopAccessing = fileURL.startAccessingSecurityScopedResource()
        defer {
            if shouldStopAccessing {
                fileURL.stopAccessingSecurityScopedResource()
            }
        }

        do {
            guard let fileData = try? Data(contentsOf: fileURL) else {
                self.errorMessage = "Could not read data from file: \(fileURL.lastPathComponent)"
                self.isUploading = false
                return nil
            }
            
            let fileExtension = fileURL.pathExtension
            let uniqueFileName = "\(fileNamePrefix)_\(fileURL.lastPathComponent)"
            let supabasePath = "\(userId)/\(uniqueFileName)" // e.g., "user_id_string/randomUUID_document.pdf"

            print("Attempting to upload to Supabase path: \(supabasePath)")

            // Determine MIME type (basic implementation)
            let mimeType: String
            switch fileExtension.lowercased() {
                case "pdf": mimeType = "application/pdf"
                case "png": mimeType = "image/png"
                case "jpg", "jpeg": mimeType = "image/jpeg"
                case "mov": mimeType = "video/quicktime"
                case "heic": mimeType = "image/heic"
                default: mimeType = "application/octet-stream" // Generic binary
            }

            let fileOptions = FileOptions(contentType: mimeType, cacheControl: "3600", upsert: false)

            // Perform the upload
            let uploadedPath = try await SupabaseManager.shared.client.storage
                .from("documents") // Your bucket name
                .upload(
                    path: supabasePath,
                    file: fileData,
                    options: fileOptions
                )
            
            // Note: 'uploadedPath' from Supabase is typically the 'key' or path within the bucket.
            // It's not a full public URL unless you construct it or use .getPublicURL().
            // For simplicity, we're storing the path and assuming it implies success.
            
            print("Successfully uploaded \(fileURL.lastPathComponent) to Supabase. Returned path: \(uploadedPath)")
            self.uploadedSupabasePaths.append(supabasePath) // Store the Supabase internal path
            self.successfullyUploadedCount += 1
            self.isUploading = false // Set to false after one file for now
            return supabasePath // Return the Supabase path

        } catch {
            print("Error uploading document \(fileURL.lastPathComponent): \(error)")
            self.errorMessage = "Upload failed for \(fileURL.lastPathComponent): \(error.localizedDescription)"
            self.isUploading = false
            return nil
        }
    }

    // Function to upload all selected documents
    // just to recompile when doing git push
    func uploadAllSelectedDocuments(userId: String) async {
        guard !selectedLocalFileURLs.isEmpty else {
            print("No files selected to upload.")
            return
        }
        
        isUploading = true
        errorMessage = nil
        successfullyUploadedCount = 0
        let totalFiles = selectedLocalFileURLs.count
        
        // Create a temporary copy of selected URLs to iterate over,
        // as selectedLocalFileURLs might be cleared by the UI picker logic.
        let filesToUpload = Array(selectedLocalFileURLs)
        
        // Clear the local file URLs after copying them for upload,
        // so the user can pick more files if needed without them re-appearing.
        // Or, you might want to clear them only upon successful upload of all.
        // self.selectedLocalFileURLs.removeAll()


        for (index, fileURL) in filesToUpload.enumerated() {
            print("Starting upload for file \(index + 1) of \(totalFiles): \(fileURL.lastPathComponent)")
            _ = await uploadDocument(fileURL: fileURL, userId: userId)
            // Update overall progress if needed
            self.uploadProgress = Double(index + 1) / Double(totalFiles)
            
            // If any error occurred, it's stored in self.errorMessage.
            // You might want to decide if you stop on first error or try all.
            if let _ = self.errorMessage {
                // Optionally break or collect all errors
            }
        }
        
        isUploading = false
        if successfullyUploadedCount == totalFiles {
            print("All \(totalFiles) files uploaded successfully.")
            // Clear selected files only after all are successfully uploaded
            self.selectedLocalFileURLs.removeAll()
            // And stop accessing them
            filesToUpload.forEach { if $0.isFileURL { $0.stopAccessingSecurityScopedResource() } }

        } else {
            print("\(successfullyUploadedCount) of \(totalFiles) files uploaded. Some errors occurred.")
            // Decide how to handle partial success. Maybe keep the successfully uploaded ones
            // and remove only those that failed from selectedLocalFileURLs, or let user retry.
        }
        uploadProgress = 0.0 // Reset progress
    }
    
    func clearSelectedFiles() {
        for url in selectedLocalFileURLs {
            if url.isFileURL { // Check if it's a file URL before trying to stop access
                 url.stopAccessingSecurityScopedResource()
            }
        }
        selectedLocalFileURLs.removeAll()
        uploadedSupabasePaths.removeAll() // Also clear uploaded paths if clearing selection
        errorMessage = nil
        successfullyUploadedCount = 0
    }
}
