import { convertToTitleCase, initialiseName, stringToPence, toPounds } from './utils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string | null, a: string | null, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string | null, a: string | null, expected: string | null) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('toPounds', () => {
  it.each([
    ['zero', 0, '0.00'],
    ['whole pounds', 500, '5.00'],
    ['with pence', 1050, '10.50'],
    ['single penny', 1, '0.01'],
    ['large amount', 100000, '1000.00'],
  ])('%s toPounds(%s) = %s', (_: string, pence: number, expected: string) => {
    expect(toPounds(pence)).toEqual(expected)
  })
})

describe('stringToPence', () => {
  it.each([
    ['whole pounds', '5', 500],
    ['with pence', '10.50', 1050],
    ['single penny', '0.01', 1],
    ['two decimal places', '14.87', 1487],
    ['no decimal', '100', 10000],
    ['zero', '0', 0],
  ])('%s stringToPence(%s) = %s', (_: string, pounds: string, expected: number) => {
    expect(stringToPence(pounds)).toEqual(expected)
  })
})
