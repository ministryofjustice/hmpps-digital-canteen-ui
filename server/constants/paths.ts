// eslint-disable-next-line import/prefer-default-export
export const PATHS = {
  LANDING_PAGE: '/canteen',
  ORDER_SUMMARY: '/canteen/order-summary',
  STAFF_LANDING_PAGE: '/staff-canteen',
  SHUTTER_PAGE: 'pages/shutter-page.njk',

  // BACKEND API
  CREATE_MEDUSA_USER: '/api/create-medusa-user',
  CREATE_CART: '/api/carts',
  RETRIEVE_CURRENT_BASKET: '/api/get-basket',
  ADD_LINE_ITEM: '/api/add-line-item',
  REMOVE_LINE_ITEM: '/api/remove-line-item',
  REMOVE_BASKET: '/api/remove-basket',
  CANCEL_DRAFT_ORDER: '/api/cancel-draft-order',
  RETRIEVE_CONTACTS: '/api/prisoner-contacts/:prisonerNumber',
}
