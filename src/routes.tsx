import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { RubriquesPage } from "@/pages/RubriquesPage"
import { QuestionsPage } from "@/pages/QuestionsPage"
import { PageCouples } from "@/pages/PageCouples"
import { EvaluationsPage } from "@/pages/evaluations/EvaluationsPage"
import { PromotionsPage } from "@/pages/promotions/PromotionsPage"
import { PromotionDetailPage } from "@/pages/promotions/PromotionDetailPage"
import UnauthorizedPage from "@/pages/UnauthorizedPage"
import { EvaluationCreatePage } from "@/pages/evaluations/EvaluationCreatePage"
import { EvaluationEditPage } from "@/pages/evaluations/EvaluationEditPage"
import { EvaluationDetailPage } from "@/pages/evaluations/EvaluationDetailPage"
import { StatistiquesPage } from "@/pages/evaluations/StatistiquesPage"



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
      // dans le tableau children, après evaluations/:id :
      {
        path: "evaluations/:id/statistiques",
        element: <StatistiquesPage />,
      },
      
    ],
  },
])