import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../services/auditService'
import { PATHS } from '../constants/paths'
import TelemetryService from '../services/telemetryService'

export default function productDetailsPage(
  router: Router,
  auditService: AuditService,
  telemetryService: TelemetryService,
): Router {
  router.get(PATHS.PRODUCT_DETAILS_PAGE, async (req, res, _next) => {
    await auditService.logPageView(Page.PRODUCT_DETAILS_PAGE, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const user = req.user as LaunchpadUser
    const userName = user.idToken.name
    telemetryService.trackEvent('PRODUCT_DETAILS_PAGE', user, {
      prisonCode: user.establishment.agency_id,
    })
    const basket = {
      total: '0.70',
      itemCount: 1,
    }

    const nutritionDetails = {
      description: 'per 250ml serving (diluted) Typical Values',
      nutritionData: [
        {
          title: 'Energy',
          value1: '16kJ',
          value2: '4kcal',
          percentage: '<1%',
          isEnergy: true,
        },
        {
          title: 'Fat',
          value1: '<0.5g',
          value2: 'Low',
          percentage: '<1%',
        },
        {
          title: 'Saturates',
          value1: '<0.1g',
          value2: 'Low',
          percentage: '<1%',
        },
        {
          title: 'Sugars',
          value1: '<0.5g',
          value2: 'Low',
          percentage: '1%',
        },
        {
          title: 'Salt',
          value1: '<0.05g',
          value2: 'Low',
          percentage: '1%',
        },
      ],
    }

    const productDetails = {
      productName: 'Eco Orange Squash 1L (V)',
      productDescription: 'Concentrate orange squash with 30% fruit from concentrate and puree with sweeteners',
      productPrice: '0.70',
      ingredients:
        'Water, Orange Fruit from Concentrate (20%), Acid (Citric Acid), Acidity Regulator (Sodium Citrate),' +
        ' Natural Orange Flavouring with other Natural Flavourings, Sweeteners (Acesulfame K, Sucralose), ' +
        'Stabilisers (Cellulose Gum, Sucrose Acetate Isobutyrate), Preservatives (Potassium Sorbate, ' +
        'Sodium Metabisulphite), Emulsifier (Glycerol Esters of Wood Rosins), Natural Colour (Carotenes)',
      allergens: 'No allergens',
      nutritionDetails,
    }
    return res.render('pages/product-details-page', {
      userName,
      productDetails,
      basket,
    })
  })

  return router
}
