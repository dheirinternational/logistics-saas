import { ReactNode } from "react";

export default function MarketPlaceLayout({children} : {children: ReactNode}){
    return(
        <div className='h-full w-full space-y-1'>
            {children}
        </div>
    )
}