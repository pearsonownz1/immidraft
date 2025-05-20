import SwiftUI
import UniformTypeIdentifiers // Required for UTType

struct DocumentPickerView: UIViewControllerRepresentable {
    @Binding var selectedFileURLs: [URL] // Binding to pass selected file URLs back
    @Environment(\.presentationMode) var presentationMode

    // Allowed content types: common image types and PDF
    let allowedContentTypes: [UTType] = [
        .jpeg, 
        .png,
        .pdf,
        UTType("com.apple.quicktime-movie"), // For .mov files, if needed
        UTType("public.heic") // For HEIC images from iPhone camera
    ]

    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        // allowMultipleSelection is true by default for .init(forOpeningContentTypes:)
        let controller = UIDocumentPickerViewController(forOpeningContentTypes: allowedContentTypes, asCopy: true)
        controller.delegate = context.coordinator
        controller.allowsMultipleSelection = true // Explicitly set if needed
        return controller
    }

    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {
        // No update logic needed here for this simple case
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIDocumentPickerDelegate {
        var parent: DocumentPickerView

        init(_ parent: DocumentPickerView) {
            self.parent = parent
        }

        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            // The urls provided are temporary security-scoped URLs.
            // We need to ensure we can access them outside the picker's lifecycle.
            // For long-term access or background uploads, it's crucial to either:
            // 1. Copy the file to your app's container immediately.
            // 2. Use `url.startAccessingSecurityScopedResource()` and `url.stopAccessingSecurityScopedResource()`.
            // For this example, we'll assume immediate processing or copying by the ViewModel.
            
            var accessibleURLs: [URL] = []
            for url in urls {
                if url.startAccessingSecurityScopedResource() {
                    accessibleURLs.append(url)
                    // Note: You must call stopAccessingSecurityScopedResource() when done.
                    // This will be the responsibility of the code that consumes these URLs.
                } else {
                    print("Failed to access security scoped resource for URL: \(url.lastPathComponent)")
                }
            }
            
            self.parent.selectedFileURLs.append(contentsOf: accessibleURLs)
            print("Selected files: \(accessibleURLs.map { $0.lastPathComponent })")
            self.parent.presentationMode.wrappedValue.dismiss()
        }

        func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
            print("Document picker was cancelled.")
            self.parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

// Preview (Optional)
struct DocumentPickerView_Previews: PreviewProvider {
    static var previews: some View {
        // This preview won't fully function without a way to present it.
        // You'd typically present DocumentPickerView using .sheet()
        Text("Preview: Present DocumentPickerView using .sheet()")
            .sheet(isPresented: .constant(true)) { // Example of how it might be presented
                DocumentPickerView(selectedFileURLs: .constant([]))
            }
    }
}
