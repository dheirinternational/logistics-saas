"use client"

// import PendingAlerts from '@/components/admin/PendingAlerts'
import QuickActionsBtn from '@/components/admin/QuickActionsBtn'
// import RecentActivity from '@/components/admin/RecentActivity'
// import RecentShipmentCard from '@/components/admin/RecentShipmentCard'
// import RevenueSnapshot from '@/components/admin/RevenueSnapshot'
import StatusStatCard from '@/components/admin/StatusStatCard'
import { buttonsProps } from '@/components_map_definitions/quickActionsBtns'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { BiExport } from 'react-icons/bi'
import { FaCheckCircle, FaTruck } from 'react-icons/fa'
import { FcProcess } from 'react-icons/fc'
import { MdDelete } from 'react-icons/md'
import { BeatLoader } from 'react-spinners'
// import { GrDeliver } from 'react-icons/gr'
import { toast } from 'react-toastify'


type ShipmentCount = {
    total_active_count: number,
    processing: number,
    shipped: number,
    in_transit: number,
    delivered: number 
}


const Page: NextPage = () => {


    // Arrays
    const [announcements, setAnnouncements] = useState<{id: number, title: string, message: string}[]>([])

    
    // Selected Objects
    const [currentAnnouncementPage, setCurrentAnnouncementPage] = useState<"view" | "add" >("add")
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<{id: number, title: string, message: string} | null>()
    const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false)

    // Counts
    const [shipmentCounts, setShipmentCounts] = useState<ShipmentCount | null>(null)

    

    // DELETE Announcement
    const deleteAnnouncement = async (id) => {
        setIsDeletingAnnouncement(true)
        try{
            const res = await fetch("/api/announcements", {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({id})
            })

            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
            }

            toast.success(result.message)
            fetchAnnouncements()

        }
        catch(err){
            toast.error("ERR:: Deleting announcement")
            console.error("ERR:: Deleting announcement", err)
        }
        finally{
            setIsDeletingAnnouncement(false)
        }
    }

    // FETCH Announcements 
    const fetchAnnouncements = async () => {
        try{
            const res = await fetch('/api/announcements')
            const result = await res.json()

            setAnnouncements(result.data)
            console.log(result.data)
        }
        catch(err){
            console.error("ERR:: Fetching Announcement Data", err)
            toast.error("ERR:: Fetching Announcement Data")
        }
    }
    


    // Fetch Active shipments records and existing announcements
    useEffect(() => {
        const fetchActiveShipmentRecords = async () => {
            try{
                const shipmentCountRes = await fetch(`/api/shipments/count`)
                const shipmentCountResult = await shipmentCountRes.json()
                
                console.log(shipmentCountResult)
                setShipmentCounts(shipmentCountResult.data)
    
            }
            catch(err){
                console.error("ERR:: Fetching shipment result count", err)
                toast.error("ERR:: Fetching shipment result count")
            }
        }

   
        fetchActiveShipmentRecords()
        fetchAnnouncements()

    }, [])
    
    


  return (
    <div className='max-h-[calc(100dvh-56px)] h-[calc(100dvh-56px)] overflow-y-auto p-body space-y-4'>
        <h2 className="text-2xl font-semibold">
            Dashboards
        </h2>
        <p className="text-xs text-dark/50 mt-2">
            View Shipments summary and add announcements 
        </p>

        {/* System Snapshot & Stats */}
        <div className='flex gap-4 max-sm:flex-col'>
            {/* Snapshots */}
            <div className='flex-1 bg-accent-blue p-4 rounded-lg text-white relative '>
                <span className=' text-xs'>
                    System Snapshot
                </span>
                <h3 className='font-bold text-4xl mt-4'>
                    {shipmentCounts?.total_active_count}
                </h3>
                <p className='text-sm opacity-80 mt-1'>
                    Total active shipment record
                </p>
                <div className='flex items-center gap-x-2 text-xs bg-black/70 w-fit px-3 rounded-full py-1 absolute right-4 bottom-4'>
                    <div className='w-2 h-2 bg-white rounded-full'/>
                    <span>live</span>
                </div>
            </div>


            {/* STATS */}
            <div className='flex-1'>
                <div className='flex justify-between items-center'>
                    <h2 className='font-bold text-sm'>
                        STATS <span className='text-[10px]'>(today)</span>
                    </h2>
                </div>
                
                {/* STATS Components Ctn */}
                <div className='flex my-body space-x-2 overflow-x-auto'>
                    <StatusStatCard count={shipmentCounts?.processing || 0} status='processing' icon={FcProcess} />
                    <StatusStatCard count={shipmentCounts?.shipped || 0} status="shipped" icon={BiExport} />
                    <StatusStatCard count={shipmentCounts?.in_transit || 0} status='in_transit' icon={FaTruck} />
                    <StatusStatCard count={shipmentCounts?.delivered || 0} status='delivered' icon={FaCheckCircle} />
                </div>
            </div>

        </div>
        


        {/* Add announcements & Quick Actions */}
        <div className='flex gap-4 max-sm:flex-col-reverse'>

            {/* Announcements */}
            <div className=' flex-1 p-body bg-light rounded-lg space-y-body'>
                <div className='flex justify-between'>
                    
                    <h2 className='text-xs font-bold'>
                        Announcements
                    </h2>

                    <button 
                    className='text-xs'
                    onClick={() => setCurrentAnnouncementPage( prev => prev === "add" ? "view" : "add" )}
                    >
                        {currentAnnouncementPage}
                    </button>

                </div>
                <div className='border border-dark/20 p-2 h-60 min-h-60 rounded overflow-y-auto space-y-2 relative'>
                    {
                        currentAnnouncementPage === "add" ?
                        <>
                            <span className='text-[10px] opacity-70 mb-3 block'>
                            Click on an announcement to edit or delete. 
                            </span>
                            {announcements.map( x => 
                                <div
                                key={x.id}
                                className='flex gap-1'
                                >
                                    <button
                                    className='border border-dark/10 text-xs w-full text-left p-2 rounded active:bg-accent-red flex items-center justify-between'
                                    onClick={() => setSelectedAnnouncement(x)}
                                    >
                                        <span>
                                            {x.title}
                                        </span>
                                    </button>

                                    <button
                                    onClick={(e) => {
                                        deleteAnnouncement(x.id)
                                    }}
                                    disabled={isDeletingAnnouncement}
                                    >
                                        {
                                            isDeletingAnnouncement ?
                                            <BeatLoader color='red' size={6}/> :
                                            <MdDelete
                                            className='cursor-pointer hover:text-red-500'
                                            />
                                        }

                                    </button>
                                    
                                    
                                </div>
                                
                            )}
                            
                        </> :
                        <>
                            <span className='text-[10px] opacity-70 mb-3 block'>
                                Create new announcements to keep your customers informed about important updates, promotions, or news related to your logistics services.
                            </span> 
                            <AddAnnouncement fetchAnnouncements={fetchAnnouncements} />
                        </>
                        
                    }
                    {
                        selectedAnnouncement && 
                        <UpdateAnnouncement announcement={selectedAnnouncement} setSelectedAnnouncement={setSelectedAnnouncement} fetchAnnouncements={fetchAnnouncements} />
                    }
                    
                </div>
            </div>

            {/* Quick Actions */}
            <div className='flex-1 p-body bg-light rounded-lg space-y-body'>
                <div className='flex justify-between'>
                    <h2 className='text-sm font-bold'>
                        Quick Actions
                    </h2>
                    {/* ? <button className='text-xs'>See all</button> */}
                </div>

                {/* Actions button container */}
                <div className='flex justify-center gap-3'>
                    {buttonsProps.map( (button, i) => 
                        <QuickActionsBtn key={i} {...button} />
                    )}
                </div>
            </div>  

        </div>        

    </div>
  )
}


const UpdateAnnouncement = ({announcement, setSelectedAnnouncement, fetchAnnouncements} : {announcement: {id: number, title: string, message: string}, setSelectedAnnouncement: (announcement: {id: number, title: string, message: string} | null) => void, fetchAnnouncements: () => void}) => {
    
    const [title, setTitle] = useState(announcement.title)
    const [message, setMessage] = useState(announcement.message)

    const [isEditing, setIsEditing] = useState(false)

    const editAnnouncement = async () => {  
        setIsEditing(true)
        try{
            const res = await fetch("/api/announcements", {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({id: announcement.id, title, message})
            })
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }   
            toast.success(result.message)
            setSelectedAnnouncement(null)
            fetchAnnouncements()
        } catch (error) {
            toast.error("ERR:: An error occurred while updating the announcement.")
            console.error("ERR:: An error occurred while updating the announcement.", error)    
        } finally {
            setIsEditing(false)
        }

    }
    
    return <div className='absolute w-full h-full bg-light top-0 left-0 p-2 text-xs'>
        <div>
            <button 
            className='text-xs border border-dark/10 p-2 rounded py-1 bg-accent-blue text-white'
            onClick={() => {setSelectedAnnouncement(null)}}
            >
                Go back
            </button>
        </div>
        <div className='mt-4'>
            <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            // onBlur={() => setTimeout(() => {setTitle(announcement.title)} , 1000)}
            className='border border-dark/10 p-2 text-sm rounded  outline-0'
            />
        </div>
        <div className='mt-4'>
            <textarea  
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            // onBlur={() => setTimeout(() => {setMessage(announcement.message)} , 1000)}
            className='border border-dark/10 p-2 text-sm rounded  outline-0 w-full h-30 resize-none'
            />
        </div>
        <button 
        disabled={title === announcement.title && message === announcement.message ? true : isEditing}
        className='mt-3 py-3 w-full bg-accent-red text-white rounded disabled:opacity-30'
        onClick={() => editAnnouncement()}
        >
            {
                isEditing ? 
                <BeatLoader size={10} color='white'/> : 
                "Update Announcement"   
            }
        </button>
    </div>
} 


const AddAnnouncement = ({fetchAnnouncements} : {fetchAnnouncements: () => void}) => {

    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")

    const [isCreating, setIsCreating] = useState(false)

    const createAnnouncement = async () => {
        setIsCreating(true)
        try{   
            const res = await fetch(`/api/announcements`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include",
                body: JSON.stringify({title, message})
            })
            const result = await res.json()

            if(!res.ok){
                toast.error(result.message)
                return
            }
            toast.success(result.message)
            setTitle("")
            setMessage("")
            fetchAnnouncements()
        }
        catch(err){
            toast.error("ERR:: Creating Announcement")
            console.error("ERR:: Creating Announcement", err)
        } finally { 
            setIsCreating(false)
        }
    }


    return <div className='text-xs p-4'>
         
        <div className='mt-4'>
            <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            // onBlur={() => setTimeout(() => {setTitle(announcement.title)} , 1000)}
            className='border border-dark/10 p-2 text-[10px] rounded outline-0 '
            placeholder='Input Title'
            />
        </div>
        <div className='mt-4'>
            <textarea  
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            placeholder='Input Message'
            // onBlur={() => setTimeout(() => {setMessage(announcement.message)} , 1000)}
            className='border border-dark/10 p-2 rounded outline-0 w-full h-20 resize-none text-[10px]'
            />
        </div>
        <button 
        disabled={!title.trim() && !message.trim() ? true : isCreating}
        className='mt-3 py-3 w-full bg-accent-red text-white rounded disabled:opacity-30 text-[10px]'
        onClick={() => createAnnouncement()}
        >
            {
                isCreating ? 
                <BeatLoader size={10} color='white'/> : 
                "Create Announcement"   
            }
        </button>
    </div>
}



export default Page