import { Definition } from '@kroonprins/pipectl/dist/model'

interface MultipleReportingTransformationResult {
  apiVersion: string
  items: Definition[]
}

type ReportingTransformationResult =
  | MultipleReportingTransformationResult
  | Definition

export { ReportingTransformationResult }
