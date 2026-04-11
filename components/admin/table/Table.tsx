"use client"

import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo, useState } from "react"

type TableProps<T> = {
    importedData: T[],
    columnDef: ColumnDef<T, any>[],  // eslint-disable-line @typescript-eslint/no-explicit-any
    globalFilter: string
}   

export function Table <T,>({importedData, columnDef, globalFilter }: TableProps<T>){
    const data = useMemo(() => importedData, [importedData]) 
    const columns = useMemo(() => {
        return ([...columnDef])
    }, [columnDef])


    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString"
    })

    

    return(
        <div className="w-full max-w-full h-full max-h-full">
            <div className="w-full max-w-full overflow-auto max-h-80 h-200 bg-yellow-50 ">
                <table className="table-auto min-w-80 w-full text-[10px] whitespace-nowrap">
                    <thead>
                        {table.getHeaderGroups().map( headerGroup => 
                            <tr 
                            key={headerGroup.id}
                            className="bg-gray-100"
                            >
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