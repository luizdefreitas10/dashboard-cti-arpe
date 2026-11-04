export interface ChartTooltipPayloadItem {
  value?: number | string
  name?: string
  payload?: Record<string, unknown>
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string
}
