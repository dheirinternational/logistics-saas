import CreateShipments from '@/components/admin/shipments/CreateShipments'

export default async function Page(){

  // const shipmentRequestDetails = fetch(`/api/shipment-requests/`)

  return <div className='space-y-body -mt-16'>
    <div className='p-4 bg-accent-red rounded-l text-white'>
        <span className='text-xs opacity-80'>
            Admin/Operations
        </span>
        <h1 className='font-bold mt-4 mb-2 text-xl'>
            Create Shipments
        </h1>
    </div>

    <hr className='border border-dark/20 my-8'/>


    {/* FORM */}
    <CreateShipments/>
  </div>
}

