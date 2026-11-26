// The params for the govukPagination macro
export interface GovukPagination {
  items: ({ number: number; href: string; current: boolean } | { ellipsis: true })[]
  previous?: { href: string }
  next?: { href: string }
}

/**
 * Builds GOV.UK pagination: the first and last pages, the current page and its neighbours, and an ellipsis for each gap,
 * e.g. 1 … 6 [7] 8 … 14. Returns undefined when there is only one page, so no pagination is shown
 * @param hrefFor the link to a page, from its 1-based page number
 */
export default function buildPagination(
  currentPage: number,
  totalPages: number,
  hrefFor: (page: number) => string,
): GovukPagination | undefined {
  if (totalPages <= 1) return undefined

  const pageItem = (page: number) => ({ number: page, href: hrefFor(page), current: page === currentPage })

  const pagesShown = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter(page => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)

  const items: GovukPagination['items'] = []
  pagesShown.forEach((page, index) => {
    const previousPageShown = pagesShown[index - 1]
    if (previousPageShown && page - previousPageShown > 1) {
      // Show the page itself, rather than an ellipsis, when it is the only one missing
      items.push(page - previousPageShown === 2 ? pageItem(previousPageShown + 1) : { ellipsis: true })
    }
    items.push(pageItem(page))
  })

  return {
    items,
    previous: currentPage > 1 ? { href: hrefFor(currentPage - 1) } : undefined,
    next: currentPage < totalPages ? { href: hrefFor(currentPage + 1) } : undefined,
  }
}
