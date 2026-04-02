import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

type TableProps<T> = {
    importedData: T[],
    columnDef: ColumnDef<T>[]
}   

export function Table <T,>({importedData, columnDef}: TableProps<T>){
    const data = useMemo(() => importedData, [importedData]) 
    const columns = useMemo(() => {
        return ([...columnDef])
    }, [columnDef])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    })

    return(
        <div className="w-full max-w-full h-full max-h-full">
            <div className="w-full max-w-full">
                <table className="table-auto min-w-125">
                    <thead>
                        {table.getHeaderGroups().map( headerGroup => 
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map( header => 
                                    <th key={header.id} className="p-2 text-left">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                )}
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => 
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => 
                                    <td key={cell.id} className="p-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}