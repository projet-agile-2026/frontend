import { type EvaluationStatus } from "@/services/EvaluationService"

export function getRubriqueTypeLabel(type?: string) {
  switch (type) {
    case "RBS":
      return "Rubrique standard"
    case "RBP":
      return "Rubrique personnalisée"
      case "SPECIFIQUE":
          return "Spécifique"
      default:
      return type ?? ""
  }
}

export function getRubriqueTypeStyle(type?: string) {
  switch (type) {
    case "RBS":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "RBP":
      return "bg-purple-50 text-purple-700 border-purple-200"

      case "SPECIFIQUE":
          return "bg-orange-50 text-orange-700 border-orange-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

export function getStatusLabel(status: EvaluationStatus) {
  switch (status) {
    case "ELA":
      return "En cours d’élaboration"
    case "DIS":
      return "Mise à disposition"
    case "CLO":
      return "clôturée"
    default:
      return status
  }
}