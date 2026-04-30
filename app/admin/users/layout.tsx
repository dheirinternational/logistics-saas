import { ReactNode } from "react";

export default function UsersLayout({children}: {children: ReactNode}){
    return(
        <div className='max-h-full h-full space-y-4 flex'>
            <div className="max-h-full h-full overflow-y-auto p-body flex-1">
                {children}
            </div>
            <div className="w-70 bg-light h-full max-h-full">

            </div>
        </div>
    )
}