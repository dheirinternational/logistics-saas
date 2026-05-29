export type DeleteRowResult = {
  ok: boolean
  id: string
  message?: string
}

export async function deleteSelectedRows(
  ids: string[],
  deleteOne: (id: string) => Promise<Response>
): Promise<DeleteRowResult[]> {
  return Promise.all(
    ids.map(async (id) => {
      const res = await deleteOne(id)
      const result = await res.json().catch(() => ({ message: "Delete failed" }))
      return {
        ok: res.ok,
        id,
        message: typeof result.message === "string" ? result.message : "Delete failed",
      }
    })
  )
}

export function formatDeleteFailures(results: DeleteRowResult[]): string | null {
  const failed = results.filter((r) => !r.ok)
  if (failed.length === 0) return null
  const first = failed[0]?.message ?? "Delete failed"
  if (failed.length === 1) return first
  return `Failed to delete ${failed.length} item(s). ${first}`
}
