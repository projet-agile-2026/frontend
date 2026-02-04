import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Cette page affichera prochainement des widgets et indicateurs
            (statistiques, campagnes en cours, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Contenu à venir : tableaux de bord, graphiques et résumés.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
