"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

type TableProps<T> = {
    importedData: T[],
    columnDef: ColumnDef<T, any>[],  // eslint-disable-line @typescript-eslint/no-explicit-any
    globalFilter: string
    pageSize?: number
}   

export function Table <T,>({
  importedData,
  columnDef,
  globalFilter,
  pageSize = 15,
}: TableProps<T>){
    const data = useMemo(() => importedData, [importedData]) 
    const columns = useMemo(() => {
        return ([...columnDef])
    }, [columnDef])

    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize,
    })

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: "includesString"
    })

    

    return(
        <div>
          <div className="portal-home__table-wrap">
            <table className="portal-home__table">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} scope="col">
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>

          <div className="portal-home__table-pagination" aria-label="Pagination">
            <span className="portal-home__table-pagination-text">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <div className="portal-home__table-pagination-actions">
              <button
                type="button"
                className="portal-home__btn portal-home__btn--secondary"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <button
                type="button"
                className="portal-home__btn portal-home__btn--secondary"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
    )
}