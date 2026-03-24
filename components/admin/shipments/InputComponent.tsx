import { ChangeEvent, Dispatch, HTMLInputTypeAttribute, SetStateAction } from "react"

type InputSafe = string | number | readonly string[] | undefined

type InputProps<T extends Record<string, InputSafe>> = {
    title: string
    name: string
    type: HTMLInputTypeAttribute
    state: T
    setState: Dispatch<SetStateAction<T>>
}

const InputComponent = <T extends Record<string, InputSafe>,> ({title, name, type, state, setState}: InputProps<T>) => {

    const key = name as keyof T
    const handleChange= (e: ChangeEvent<HTMLInputElement> ) => {
        const { value } = e.currentTarget
        setState(prev => ({...prev, [key]: value})) 
    }

  return (
    <label className="text-xs">
        <p>{title}</p>
        <input 
        type={type}
        name={name}
        className="w-full mt-2 outline-0 border border-dark/40 rounded px-3 py-2 bg-light/60 focus:border-dark"
        value={state[key]}
        onChange={handleChange}
        />
    </label>
  )
}

export default InputComponent