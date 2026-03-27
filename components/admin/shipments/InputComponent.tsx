import { ChangeEvent, Dispatch, HTMLInputTypeAttribute, SetStateAction, useRef, useState } from "react"
import { FaChevronDown } from "react-icons/fa"

type InputSafe = string | number | readonly string[] | undefined

type InputProps<T extends Record<string, InputSafe>> = {
    title?: string
    name: string
    type: HTMLInputTypeAttribute
    state: T
    setState: Dispatch<SetStateAction<T>>
    readonly?: boolean
    select?: boolean
    selectValues?: InputSafe[]
    unit?: string
    placeHolder?: string
    textarea?: boolean
}

const InputComponent = <T extends Record<string, InputSafe>,> ({title, name, type, state, setState, readonly, select, selectValues=[], unit, placeHolder, textarea}: InputProps<T>) => {

    const [isDropDownActive, setIsDropDownActive] = useState(false)
    const inputRef = useRef(null) 

    const key = name as keyof T
    const handleChange= (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement > ) => {
        const { value } = e.currentTarget
        setState(prev => ({...prev, [key]: value})) 
    }

    const handleClick = (e: MouseEvent, buttonValue: InputSafe ) => {
        setState( prev => ({...prev, [name]: buttonValue}) )     
        setIsDropDownActive(false)   
    }
    


  return (
    <div className="w-full relative">
        <label className="text-xs relative">
            {!textarea && <>
                <p>{title}</p>
                <input 
                ref={inputRef}
                type={type}
                name={name}
                className="w-full mt-2 outline-0 border border-dark/40 rounded px-3 py-2 bg-light/60 focus:border-dark"
                value={state[key]}
                onChange={handleChange}
                readOnly={readonly}
                placeholder={placeHolder}
                />
            </>}

            {/* Customized select element */}
            {select && <button 
            className="absolute right-2 p-2 top-2.75"
            onClick={(e) => {
                setIsDropDownActive(!isDropDownActive)
            }}
            >
                <FaChevronDown className={` ${isDropDownActive && "rotate-180"} transition-set`} />
            </button>}
            
            <span className="absolute right-2 top-8 opacity-70">
                {unit}
            </span>

        </label>
        {select && 
        <div className={`bg-light shadow shadow-dark/20 rounded-b overflow-hidden transition-set absolute w-full z-60
        ${isDropDownActive ? "h-16 max-h-16" : "max-h-0 h-0 pointer-events-none"}
        `}>
            {selectValues.length > 0 && selectValues.map( (btn, i) => 
                <button
                key={i}
                className="text-xs block w-full text-left border-b border-b-dark/20 py-2 px-3"
                onClick={(e) => {
                    handleClick(e, btn)
                }}            
                >
                    {btn?.toString().toWellFormed()}
                </button>
            )}
        </div>}

        {
            textarea && 
            <>
                <p>{title}</p>
                <textarea
                name={name}
                placeholder={placeHolder}
                className="w-full h-26 mt-2 outline-0 border border-dark/40 rounded px-3 py-2 bg-light/60 focus:border-dark text-sm resize-none"
                value={state[key]}
                onChange={handleChange}
                >
                </textarea>
            </>
        }
    </div>
  )
}

export default InputComponent