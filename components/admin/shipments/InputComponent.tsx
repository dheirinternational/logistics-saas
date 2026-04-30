"use client"

import { ChangeEvent, Dispatch, HTMLInputTypeAttribute, SetStateAction, useRef, useState } from "react"
import { FaChevronDown } from "react-icons/fa"

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

    const [isDropDownActive, setIsDropDownActive] = useState(false)
    const [overshadowText, setOvershadowText] = useState("")
    const inputRef = useRef(null) 

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

    const handleClick = ( buttonValue: InputSafe ) => {
        setState( prev => ({
            ...prev, 
            [name]: buttonValue as T[keyof T]
        }) )     
        setIsDropDownActive(false)   
    }
    


  return (
    <div className="w-full relative ">
        <label className="text-xs relative h-fit">
            {!textarea && <>
                <p className="font-semibold">{title}</p>
                <input 
                ref={inputRef}
                type={type}
                name={name}
                className={`w-full ${title && "mt-2" } outline-0 border border-dark/40 rounded px-3 py-2 focus:border-dark 
                ${!readonly ? "bg-light/60" : "bg-dark/10 outline-0 focus:outline-0"}    
                `}
                value={state[key] ?? ""}
                onChange={handleChange}
                readOnly={readonly}
                placeholder={placeHolder}
                required={required}
                min={0}
                />
            </>}

            {overshadow && state[key] && 
                <div className={`whitespace-nowrap w-[70%] h-7.5 left-3 absolute flex items-center pointer-events-none bg-[#e5e5e5] outline-0  ${title ? "top-6.5" : "top-px"}`}>
                    {defaultValue?.name ??  overshadowText}
                </div>
            }

            {/* Customized select element */}
            {select && (
                <button 
                type={"button"}
                className={`absolute right-0 p-2 
                ${!title ? "top-1" : "top-6.5"}    
                `}
                onClick={( ) => {
                    setIsDropDownActive(!isDropDownActive)
                }}
                >
                    <FaChevronDown className={` ${isDropDownActive && "rotate-180"} transition-set`} />
                </button>)
            }
            
            <span className="absolute right-2 top-8 opacity-70">
                {unit}
            </span>

        </label>
        {select && 
        <div className={`bg-light shadow shadow-dark/20 rounded-b transition-set absolute w-full z-60
        ${isDropDownActive ? "h-16 max-h-16 overflow-auto" : "max-h-0 h-0 pointer-events-none overflow-hidden"}
        `}>
            {selectValues.length > 0 && selectValues.map( (btn, i) => 
                <button
                type={"button"}
                key={i}
                className="text-xs block w-full text-left border-b border-b-dark/20 py-2 px-3"
                onClick={() => {
                    handleClick(btn.value)
                    setOvershadowText(btn.name)
                }}            
                >
                    {btn?.name?.toString().toWellFormed()}
                </button>
            )}
        </div>}

        {
            textarea && (
            <>
                <p>{title}</p>
                <textarea
                    name={name}
                    placeholder={placeHolder}
                    className="w-full h-26 mt-2 outline-0 border border-dark/40 rounded px-3 py-2 bg-light/60 focus:border-dark text-sm resize-none"
                    value={state[key] ?? ""}
                    onChange={handleChange}
                />
                
            </>)
        }
    </div>
  )
}

export default InputComponent