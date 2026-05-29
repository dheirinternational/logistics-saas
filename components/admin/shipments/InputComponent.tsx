"use client"

import { DheirSelect } from "@/components/ui/DheirSelect"
import type { ChangeEvent, Dispatch, HTMLInputTypeAttribute, SetStateAction } from "react"

type InputSafe = string | number | readonly string[] | undefined | null
type SelectButton = {name: string, value: InputSafe}

type InputProps<T extends Record<string, InputSafe>> = {
    title?: string
    name: string
    type: HTMLInputTypeAttribute
    state: T
    setState: Dispatch<SetStateAction<T>>
    readonly?: boolean
    select?: boolean
    selectValues?: SelectButton[]
    unit?: string
    placeHolder?: string
    textarea?: boolean
    required?: boolean
    overshadow?: boolean
    nullable?: boolean
    defaultValue?: {name: string, value: string} | null
}



const InputComponent = <T extends Record<string, InputSafe>,> ({title, name, type, state, setState, readonly, select, selectValues=[], unit, placeHolder, textarea, required, overshadow, nullable=false, defaultValue}: InputProps<T>) => {
    const key = name as keyof T

    const handleChange= (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement > ) => {

        const rawValue = e.currentTarget.value
        let finalValue: InputSafe

        if(nullable && rawValue === ""){
            finalValue = null
        } else if (type === "number"){
            finalValue = rawValue === "" ? (nullable ? null : "") : Number(rawValue)
        } else {
            finalValue = rawValue
        }

        setState(prev => ({...prev, [key]: finalValue as T[keyof T]})) 
    }
    
  return (
    <label className="portal-packages__field">
      {title ? <span className="portal-packages__field-label">{title}</span> : null}

      {textarea ? (
        <textarea
          name={name}
          placeholder={placeHolder}
          className="portal-packages__textarea"
          value={state[key] ?? ""}
          onChange={handleChange}
          required={required}
          disabled={readonly}
        />
      ) : select ? (
        <DheirSelect
          name={name}
          value={(state[key] ?? "") as any} // eslint-disable-line @typescript-eslint/no-explicit-any
          onChange={(e) =>
            setState((prev) => ({ ...prev, [key]: e.target.value as any }))
          }
        >
          {selectValues.map((opt, i) => (
            <option key={i} value={String(opt.value ?? "")}>
              {opt.name}
            </option>
          ))}
        </DheirSelect>
      ) : (
        <input
          type={type}
          name={name}
          className="dheir-input"
          value={state[key] ?? ""}
          onChange={handleChange}
          readOnly={readonly}
          placeholder={placeHolder}
          required={required}
          min={type === "number" ? 0 : undefined}
        />
      )}
    </label>
  )
}

export default InputComponent