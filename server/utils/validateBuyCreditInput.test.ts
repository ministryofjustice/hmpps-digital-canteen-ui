import validateBuyCreditInput from './validateBuyCreditInput'
import ERROR_MESSAGE from '../constants/errorMessages'

describe('validateBuyCreditInput', () => {
  it('should return an error when no amount is selected', () => {
    const result = validateBuyCreditInput('', 300, 5000, 900)

    expect(result.errorList).toHaveLength(1)
    expect(result.amountError).toEqual({
      text: ERROR_MESSAGE.RADIO_OPTION_NOT_SELECTED_ERROR,
    })
  })

  it('should return an error when other is selected and amount is empty', () => {
    const result = validateBuyCreditInput('', 300, 5000, 900)

    expect(result.errorList).toHaveLength(1)
    expect(result.amountError).toEqual({
      text: ERROR_MESSAGE.RADIO_OPTION_NOT_SELECTED_ERROR,
    })
  })

  it('should return an error for non numeric input', () => {
    const result = validateBuyCreditInput('abc', 300, 5000, 900)

    expect(result.errorList).toHaveLength(1)
    expect(result.amountError).toEqual({
      text: ERROR_MESSAGE.INVALID_AMOUNT_ERROR,
    })
  })

  it('should return an error for more than 2 decimal places', () => {
    const result = validateBuyCreditInput('1.999', 300, 5000, 900)

    expect(result.errorList).toHaveLength(1)
    expect(result.amountError).toEqual({
      text: ERROR_MESSAGE.INVALID_AMOUNT_ERROR,
    })
  })

  it('should return an error when credit limit is exceeded', () => {
    const result = validateBuyCreditInput('20', 200, 2000, 1900)

    expect(result.errorList).toHaveLength(1)
    expect(result.amountError).toEqual({
      text: ERROR_MESSAGE.CREDIT_LIMIT_EXCEEDED_ERROR,
    })
  })

  it('should return an error when spend balance is exceeded', () => {
    const result = validateBuyCreditInput('10', 300, 15, 900)
    expect(result.errorList).toHaveLength(1)
    expect(result.amountError).toEqual({
      text: ERROR_MESSAGE.NOT_ENOUGH_SPEND_BALANCE_ERROR,
    })
  })

  it('should return no errors for a valid custom amount', () => {
    const result = validateBuyCreditInput('5', 300, 500, 900)

    expect(result.errorList).toHaveLength(0)
    expect(result.amountError).toBeUndefined()
  })

  it('should return no errors for a predefined amount', () => {
    const result = validateBuyCreditInput('5', 300, 5000, 900)

    expect(result.errorList).toHaveLength(0)
  })
})
