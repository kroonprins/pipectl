import { Definition } from "pipectl-core/dist/model"

interface MultipleReportingTransformationResult {
  apiVersion: string,
  items: Definition[]
}

type ReportingTransformationResult = MultipleReportingTransformationResult | Definition

export { ReportingTransformationResult }

