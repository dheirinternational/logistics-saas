import NavBar from "@/components/base/NavBar";
import { ReactNode } from "react";

export default function HomeLayout ({children} :{children: ReactNode}){
    return(
        <div className="min-h-dvh h-dvh ">
            {children}
            <NavBar/>
        </div>
    )
}