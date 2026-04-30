import { ReactNode } from "react";

export default function MarktePlaceLayout({children}: {children: ReactNode}) {
    return(
        <div className="h-full max-h-full w-full flex">
            <div className="h-full max-h-full overflow-y-auto flex-1 p-body">
                {children}
            </div>
            <div className="h-full max-h-full bg-light w-70">
                
            </div>
        </div>
        
    )
}