import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../services/auditService'
import { PATHS } from '../constants/paths'
import TelemetryService from '../services/telemetryService'
import ProductCatalogueService, {
  canteenHref,
  ProductCatalogue,
  ProductCatalogueRequest,
} from '../services/productCatalogueService'
import buildPagination, { GovukPagination } from '../utils/pagination'
import logger from '../../logger'

export default function canteenRoutes(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
  productCatalogueService: ProductCatalogueService,
): Router {
  router.get(PATHS.LANDING_PAGE, async (req, res, _next) => {
    await auditService.logPageView(Page.CANTEEN_HOME_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const user = req.user as LaunchpadUser
    const userName = user.idToken.name
    telemetryService.trackEvent('CANTEEN_HOME_PAGE', user, {
      prisonCode: user.establishment.agency_id,
    })

    const basket = {
      total: '10.00',
      itemCount: 10,
    }

    const catalogue = await loadProductCatalogue(productCatalogueService, {
      prisonId: user.establishment.agency_id,
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      page: Number.parseInt(req.query.page as string, 10) || 1,
    })

    // A page past the last, e.g. from an old link: show the last page
    const { productCatalogue } = catalogue
    if (productCatalogue && productCatalogue.totalPages > 0 && productCatalogue.page > productCatalogue.totalPages) {
      return res.redirect(canteenHref({ category: productCatalogue.category, page: productCatalogue.totalPages }))
    }

    return res.render('pages/canteen-home-page', {
      userName,
      basket,
      hoursRemaining: 24,
      spendBalance: '30.00',
      ...catalogue,
    })
  })

  return router
}

/**
 * The product catalogue and its page links. If the catalogue can't be loaded, e.g. as the API doesn't have the product
 * endpoints yet, the rest of the page is still shown, with a message in place of the products
 */
async function loadProductCatalogue(
  productCatalogueService: ProductCatalogueService,
  request: ProductCatalogueRequest,
): Promise<{ productCatalogue?: ProductCatalogue; pagination?: GovukPagination; productCatalogueUnavailable?: true }> {
  try {
    const productCatalogue = await productCatalogueService.getProductCatalogue(request)
    const pagination = buildPagination(productCatalogue.page, productCatalogue.totalPages, page =>
      canteenHref({ category: productCatalogue.category, page }),
    )
    return { productCatalogue, pagination }
  } catch (error) {
    const message = `Product catalogue unavailable for prison ${request.prisonId}`
    // An API error, e.g. a 404 while the endpoints aren't built, is expected, so its status is enough. Anything else
    // is unexpected, so it's logged with its stack trace
    if (error.responseStatus) {
      logger.warn(`${message}: ${error.message} (HTTP ${error.responseStatus})`)
    } else {
      logger.warn(message, error)
    }
    return { productCatalogueUnavailable: true }
  }
}
