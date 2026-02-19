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
import { PromotionsPage } from "@/pages/promotions/PromotionsPage"
import { PromotionDetailPage } from "@/pages/promotions/PromotionDetailPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
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
        element: <EvaluationForm />,
      },
      {
        path: "evaluations/:id",
        element: <EvaluationForm />,
      },
      {
        path: "evaluations/:id/view",
        element: <EvaluationForm {...({ readOnly: true } as any)} />,
      },
      {
        path: "promotions",
        element: <PromotionsPage />,
      },
      {
        path: "promotions/:codeFormation/:anneeUniversitaire",
        element: <PromotionDetailPage />,
      },
    ],
  },
])