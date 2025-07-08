import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./components/home";
import CaseWorkspace from "./components/CaseWorkspace";
import ExpertLetterDraftingView from "./components/ExpertLetterDraftingView";
import TestDocumentAI from "./pages/TestDocumentAI";
import TestDocumentAIBrowser from "./pages/TestDocumentAIBrowser";
import EvaluateAI from "./pages/EvaluateAI";
import LetterAI from "./pages/LetterAI";
import TranslateAI from "./pages/TranslateAI";
import EvalLetterAI from "./pages/EvalLetterAI";
import VerifyAI from "./pages/VerifyAI";
import DocumentSortingDemo from "./pages/DocumentSortingDemo";
import ExpertSelectorTest from "./pages/ExpertSelectorTest";
import ExpertLetterTest from "./pages/ExpertLetterTest";
import StudentDetailView from "./pages/StudentDetailView";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Home activeTab="dashboard" />} />
          {/* Cases route removed */}
          {/* Clients and Settings routes removed */}
          <Route path="/case/:caseId" element={<CaseWorkspace />} />
          <Route path="/cases/:caseId" element={<CaseWorkspace />} />
          <Route path="/case/:caseId/letter" element={<ExpertLetterDraftingView />} />
          <Route path="/cases/:caseId/letter" element={<ExpertLetterDraftingView />} />
          <Route path="/test-document-ai" element={<TestDocumentAI />} />
          <Route path="/test-document-ai-browser" element={<TestDocumentAIBrowser />} />
          <Route path="/evaluateai" element={<EvaluateAI />} />
          <Route path="/evaluate-ai" element={<EvaluateAI />} />
          <Route path="/evaluate-ai/student/:studentId" element={<StudentDetailView />} />
          <Route path="/letter-ai" element={<LetterAI />} />
          <Route path="/translate-ai" element={<TranslateAI />} />
          <Route path="/eval-letter-ai" element={<EvalLetterAI />} />
          <Route path="/verify-ai" element={<VerifyAI />} />
          <Route path="/document-sorting-demo" element={<DocumentSortingDemo />} />
          <Route path="/expert-selector-test" element={<ExpertSelectorTest />} />
          <Route path="/expert-letter-test" element={<ExpertLetterTest />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
