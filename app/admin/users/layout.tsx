import { ReactNode } from "react";

export default function UsersLayout({children}: {children: ReactNode}){
    return(
        <div className='max-h-[calc(100dvh-56px)] h-[calc(100dvh-56px)] overflow-y-auto p-body space-y-4'>
            {children}
        </div>
    )
}