"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiSpeakerWave } from "react-icons/hi2";
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast";




export const Announcements = () => {

    const [announcements, setAnnouncements] = useState<{id: string, title: string, message: string}[]>([])
    const [isDataFeching, setIsDataFetching] = useState(true)


    useEffect(() => {
        // Fetch announcements from the server
        const fetchAnnouncements = async () => {
            setIsDataFetching(true)
            try {
                const res = await fetch('/api/announcements');
                const result = await res.json();

                if(!res.ok) {
                    toast.error('Failed to fetch announcements');
                    return
                }

                setAnnouncements(result.data);
            } catch (error) {
                toast.error('Failed to fetch announcements');
                console.error('Error fetching announcements:', error);
            } finally{
                setIsDataFetching(false)
            }
        };
        fetchAnnouncements();

    }, [])



    return (
        <div className='p-body px-2 bg-white shadow shadow-dark/10 flex md:max-w-125 md:mx-auto items-center '>
            <div className=' h-full flex items-center justify-center w-fit p-2 text-xs gap-1'>
                <HiSpeakerWave className='' />
                <span>Announcement:</span>
            </div>

            <div className={`w-[calc(100%-46px)] max-w-[calc(100%-46px)] bg-amber-500 h-full rounded flex overflow-hidden items-center  px-2 py-1 $`}>
                <div className={`flex gap-2 whitespace-nowrap ${!isDataFeching && "announcements-scrollbar"}`}>
                    {
                        isDataFeching &&
                        <DheirLoader size={10} color="white"/>
                    }
                    {
                        announcements.map((announcement) => 
                            <Link 
                            key={announcement.id}
                            href={`/base/announcements/${announcement.id}`} 
                            className='text-xs bg-white px-1 rounded w-fit whitespace-nowrap '>
                                {announcement.title}
                            </Link>
                        )
                    }
                </div>
            </div>
        </div>
    )
}   