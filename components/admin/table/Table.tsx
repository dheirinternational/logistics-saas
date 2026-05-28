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
import { DheirConfirmDialog } from "@/components/ui/DheirConfirmDialog"

type TableProps<T> = {
    importedData: T[],
    columnDef: ColumnDef<T, any>[],  // eslint-disable-line @typescript-eslint/no-explicit-any
    globalFilter: string
    pageSize?: number
    getRowId?: (row: T) => string
    enableRowSelection?: boolean
    onDeleteSelected?: (rows: T[]) => Promise<void> | void
}   

export function Table <T,>({
  importedData,
  columnDef,
  globalFilter,
  pageSize = 15,
  getRowId,
  enableRowSelection = false,
  onDeleteSelected,
}: TableProps<T>){
    const data = useMemo(() => importedData, [importedData]) 
    const columns = useMemo(() => {
        if (!enableRowSelection) return ([...columnDef])

        const selectCol: ColumnDef<T, any> = {
          id: "__select",
          header: ({ table }) => (
            <label className="dheir-checkbox">
              <input
                type="checkbox"
                checked={table.getIsAllPageRowsSelected()}
                ref={(el) => {
                  if (!el) return
                  el.indeterminate = table.getIsSomePageRowsSelected()
                }}
                onChange={table.getToggleAllPageRowsSelectedHandler()}
                aria-label="Select all rows on page"
              />
              <span className="dheir-checkbox__box" aria-hidden />
            </label>
          ),
          cell: ({ row }) => (
            <label className="dheir-checkbox">
              <input
                type="checkbox"
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                aria-label="Select row"
              />
              <span className="dheir-checkbox__box" aria-hidden />
            </label>
          ),
          enableSorting: false,
          enableColumnFilter: false,
          size: 44,
        }

        return ([selectCol, ...columnDef])
    }, [columnDef, enableRowSelection])

    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize,
    })

    const [rowSelection, setRowSelection] = useState({})
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isDeletingSelected, setIsDeletingSelected] = useState(false)

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            pagination,
            rowSelection,
        },
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: "includesString",
        enableRowSelection,
        getRowId: getRowId as any,
        autoResetPageIndex: false,
    })

    const selectedRows = table.getSelectedRowModel().rows
    const selectedCount = selectedRows.length

    const filteredCount = table.getFilteredRowModel().rows.length
    const totalCount = data.length
    const pageIndex = table.getState().pagination.pageIndex
    const pageSizeState = table.getState().pagination.pageSize
    const pageCount = Math.max(table.getPageCount(), 1)
    const rangeStart = filteredCount === 0 ? 0 : pageIndex * pageSizeState + 1
    const rangeEnd = Math.min((pageIndex + 1) * pageSizeState, filteredCount)

    const totalLabel =
      globalFilter.trim() && filteredCount !== totalCount
        ? `${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} records`
        : `${filteredCount.toLocaleString()} ${filteredCount === 1 ? "record" : "records"} total`

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
              <strong className="portal-home__table-pagination-total">{totalLabel}</strong>
              {filteredCount > 0 ? (
                <>
                  {" "}
                  · Showing {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()}
                </>
              ) : null}
              {" "}
              · Page {pageIndex + 1} of {pageCount}
            </span>
            <div className="portal-home__table-pagination-actions">
              {enableRowSelection && onDeleteSelected && selectedCount > 0 ? (
                <button
                  type="button"
                  className="portal-home__btn portal-home__btn--secondary"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  Delete selected ({selectedCount})
                </button>
              ) : null}
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

          <DheirConfirmDialog
            open={isDeleteConfirmOpen}
            onClose={() => {
              if (!isDeletingSelected) setIsDeleteConfirmOpen(false)
            }}
            onConfirm={async () => {
              setIsDeletingSelected(true)
              try {
                const originals = selectedRows.map((r) => r.original)
                await onDeleteSelected?.(originals)
                table.resetRowSelection()
                setIsDeleteConfirmOpen(false)
              } finally {
                setIsDeletingSelected(false)
              }
            }}
            title="Delete selected records?"
            description={`This will delete ${selectedCount} selected record${selectedCount === 1 ? "" : "s"}.`}
            cancelLabel="Cancel"
            confirmLabel="Delete selected"
            variant="danger"
            loading={isDeletingSelected}
          />
        </div>
    )
}