import buildPagination from './pagination'

const hrefFor = (page: number) => `/canteen?page=${page}`

// Shows each item as its page number, [current page] or …
const summarise = (currentPage: number, totalPages: number) =>
  buildPagination(currentPage, totalPages, hrefFor)
    .items.map(item => {
      if ('ellipsis' in item) return '…'
      return item.current ? `[${item.number}]` : `${item.number}`
    })
    .join(' ')

describe('buildPagination', () => {
  it.each([0, 1])('returns nothing when there are %s pages', totalPages => {
    expect(buildPagination(1, totalPages, hrefFor)).toBeUndefined()
  })

  it.each([
    [1, 2, '[1] 2'],
    [1, 5, '[1] 2 … 5'],
    [1, 14, '[1] 2 … 14'],
    [3, 14, '1 2 [3] 4 … 14'],
    [4, 14, '1 2 3 [4] 5 … 14'],
    [7, 14, '1 … 6 [7] 8 … 14'],
    [12, 14, '1 … 11 [12] 13 14'],
    [14, 14, '1 … 13 [14]'],
  ])('shows page %s of %s as %s', (currentPage, totalPages, expected) => {
    expect(summarise(currentPage, totalPages)).toEqual(expected)
  })

  it('links each page', () => {
    expect(buildPagination(1, 2, hrefFor).items).toEqual([
      { number: 1, href: '/canteen?page=1', current: true },
      { number: 2, href: '/canteen?page=2', current: false },
    ])
  })

  it('links to the next page, but not the previous, from the first page', () => {
    const pagination = buildPagination(1, 3, hrefFor)

    expect(pagination.previous).toBeUndefined()
    expect(pagination.next).toEqual({ href: '/canteen?page=2' })
  })

  it('links to the previous page, but not the next, from the last page', () => {
    const pagination = buildPagination(3, 3, hrefFor)

    expect(pagination.previous).toEqual({ href: '/canteen?page=2' })
    expect(pagination.next).toBeUndefined()
  })
})
