import { DheirSelect } from "@/components/ui/DheirSelect"
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"

type PortalFormFieldProps = {
  label: string
  children: ReactNode
  hint?: string
}

export function PortalFormField({ label, children, hint }: PortalFormFieldProps) {
  return (
    <label className="portal-packages__field">
      <span className="portal-packages__field-label">{label}</span>
      {children}
      {hint ? <span className="portal-packages__field-hint">{hint}</span> : null}
    </label>
  )
}

export function PortalFormInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="dheir-input" {...props} />
}

export function PortalFormSelect(
  props: SelectHTMLAttributes<HTMLSelectElement>,
) {
  return <DheirSelect {...props} />
}

export function PortalFormTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      className="portal-packages__textarea"
      rows={props.rows ?? 3}
      {...props}
    />
  )
}
