// eslint-disable-next-line import/prefer-default-export
export const PATHS = {
  LANDING_PAGE: '/pin-phone',
  BUY_CREDIT: '/pin-phone/buy-credit',
  CHECK_ORDER_DETAILS: '/pin-phone/check-order-details',
  VIEW_CONTACTS: '/pin-phone/view-contacts',
  OFFICIAL_CONTACTS: '/pin-phone/view-contacts/official-contact/:contactId',
  SOCIAL_CONTACTS: '/pin-phone/view-contacts/social-contact/:contactId',
  PIN_PHONE_CONFIRMATION: '/pin-phone/buy-credit-confirmation',

  // BACKEND API
  CREATE_CART: '/api/carts',
  RETRIEVE_CONTACTS: '/api/prisoner-contacts/:prisonerNumber',
}
