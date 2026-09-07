import ERROR_MESSAGE from '../constants/errorMessages'
import { stringToPence } from './utils'

type ValidationError = {
  href: string
  text: string
}

type ValidationResult = {
  errorList: ValidationError[]
  amountError?: {
    text: string
  }
}

const validateBuyCreditInput = (
  requestedCreditAmountPounds: string,
  currentPinPhoneCreditPence: number,
  currentSpendsBalancePence: number,
  pinPhoneCreditLimitPence: number,
): ValidationResult => {
  // No radio button selected
  if (!requestedCreditAmountPounds) {
    return {
      errorList: [
        {
          href: '#amount',
          text: ERROR_MESSAGE.RADIO_OPTION_NOT_SELECTED_ERROR,
        },
      ],
      amountError: {
        text: ERROR_MESSAGE.RADIO_OPTION_NOT_SELECTED_ERROR,
      },
    }
  }

  // Other selected, but the amount is not numeric or decimal place is more than 2
  if (Number.isNaN(requestedCreditAmountPounds) || !/^\d+(\.\d{1,2})?$/.test(requestedCreditAmountPounds)) {
    return {
      errorList: [
        {
          href: '#amount',
          text: ERROR_MESSAGE.INVALID_AMOUNT_ERROR,
        },
      ],
      amountError: {
        text: ERROR_MESSAGE.INVALID_AMOUNT_ERROR,
      },
    }
  }

  // the selected amount is greater than spendBalance
  if (stringToPence(requestedCreditAmountPounds) > currentSpendsBalancePence) {
    return {
      errorList: [
        {
          href: '#amount',
          text: ERROR_MESSAGE.NOT_ENOUGH_SPEND_BALANCE_ERROR,
        },
      ],
      amountError: {
        text: ERROR_MESSAGE.NOT_ENOUGH_SPEND_BALANCE_ERROR,
      },
    }
  }

  // the amount is greater than allowed pinPhoneCreditLimit
  if (currentPinPhoneCreditPence + stringToPence(requestedCreditAmountPounds) > pinPhoneCreditLimitPence) {
    return {
      errorList: [
        {
          href: '#amount',
          text: ERROR_MESSAGE.CREDIT_LIMIT_EXCEEDED_ERROR,
        },
      ],
      amountError: {
        text: ERROR_MESSAGE.CREDIT_LIMIT_EXCEEDED_ERROR,
      },
    }
  }

  return {
    errorList: [],
    amountError: undefined,
  }
}
export default validateBuyCreditInput
