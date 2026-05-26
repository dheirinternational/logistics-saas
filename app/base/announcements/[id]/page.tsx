"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { FaUser } from "react-icons/fa"
import { BeatLoader } from "react-spinners"
import { toast } from "react-toastify"



export default function Page() { 
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Announcements />        
        </Suspense>
    )
}

const Announcements = () => {

    const params = useParams()
    const router = useRouter()

    const [announcement, setAnnouncement] = useState<{id: string, title: string, message: string, created_at: string} | null>(null)
    const [isDataFeching, setIsDataFetching] = useState(true)
    
    useEffect(() => {
        const fetchAnnouncement = async () => {
            setIsDataFetching(true)
            try {
                const res = await fetch(`/api/announcements/${params.id}`);
                const result = await res.json();

                if(!res.ok) {
                    toast.error("Failed to fetch announcement");
                    return
                }

                setAnnouncement(result.data);
                // toast.success("Announcement fetched successfully");
            } catch (error) {
                toast.error("Error fetching announcement");
                console.error("Error fetching announcement:", error);
            } finally {
                setIsDataFetching(false);
            }
        };

        fetchAnnouncement();
    }, []);


    return (
        <div className=' bg-white shadow shadow-dark/10  h-dvh space-y-4'>
            <div className='p-body h-14 bg-accent-blue flex text-white items-center justify-between'>
                <button 
                className='flex gap-2 flex-1 justify-start'
                onClick={() => {router.back()}}
                >
                    <span className='text-xs font-semibold'>
                        Go Back
                    </span>
                </button>
                <h1 className='font-semibold'>
                    Announcement
                </h1>
                <Link href={"/base/profile"} className='flex-1 flex justify-end'>
                    <FaUser/>
                </Link>
            </div>
            {
                isDataFeching ? 
                <div className="p-body">
                    <BeatLoader color="orange" size={10}/>
                </div>  :
                announcement ? (
                <div className='w-full h-full flex flex-col gap-3 p-8'>
                    <h2 className='text-lg font-semibold'>             
                         {announcement.title}
                    </h2>
                    <p className="text-xs">
                       {new Date(announcement?.created_at || "").toLocaleDateString()} 
                    </p>
                    <p className='text-gray-600 text-[10px] whitespace-pre-wrap'>
                        {announcement.message}
                    </p>
                </div>
                ) : (
                    <p className='text-sm text-gray-500'>No announcement found.</p>
                )
            }
        </div>
    )

}