import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { RubriquesPage } from "@/pages/RubriquesPage"
import { QuestionsPage } from "@/pages/QuestionsPage"
import { PageCouples } from "@/pages/PageCouples"
import { EvaluationsPage } from "@/pages/evaluations/EvaluationsPage"
import { EvaluationForm } from "@/pages/evaluations/EvaluationForm"
import { EtudiantEvaluationsPage } from "@/pages/evaluations/EtudiantEvaluationsPage"
import { RepondreEvaluationPage } from "@/pages/evaluations/RepondreEvaluationPage"
import VoirResultatPage from "@/pages/evaluations/VoirResultatPage"
import { PromotionsPage } from "@/pages/promotions/PromotionsPage"
import { PromotionDetailPage } from "@/pages/promotions/PromotionDetailPage"
import UnauthorizedPage from "@/pages/UnauthorizedPage"
import { EvaluationCreatePage } from "@/pages/evaluations/EvaluationCreatePage"
import { EvaluationEditPage } from "@/pages/evaluations/EvaluationEditPage"
import { EvaluationDetailPage } from "@/pages/evaluations/EvaluationDetailPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "rubriques",
        element: <RubriquesPage />,
      },
      {
        path: "questions",
        element: <QuestionsPage />,
      },
      {
        path: "couples",
        element: <PageCouples />,
      },
      {
        path: "evaluations",
        element: <EvaluationsPage />,
      },
      {
        path: "evaluations/new",
        element: <EvaluationCreatePage />,
      },
      {
        path: "evaluations/:id/edit",
        element: <EvaluationEditPage />,
      },
      {
        path: "evaluations/:id",
        element: <EvaluationDetailPage />,
      },
      {
        path: "promotions",
        element: <PromotionsPage />,
      },
      {
        path: "promotions/:codeFormation/:anneeUniversitaire",
        element: <PromotionDetailPage />,
      },
      {
        path: "mes-evaluations",
        element: (
          <ProtectedRoute allowedRoles={["ETU"]}>
            <EtudiantEvaluationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "mes-evaluations/:idEvaluation/repondre",
        element: (
          <ProtectedRoute allowedRoles={["ETU"]}>
            <RepondreEvaluationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "mes-evaluations/:idEvaluation/resultat",
        element: (
          <ProtectedRoute allowedRoles={["ETU"]}>
            <VoirResultatPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])