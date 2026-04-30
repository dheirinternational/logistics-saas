import { ReactNode } from "react";

export default function ProfileLayout({children}: {children: ReactNode}) {
    return <div className='h-full max-h-full w-full p-body'>
        {children}
    </div>
}