import tripDaysCsv from '../project-assets/trip_days.csv?raw'
import itineraryCsv from '../project-assets/itinerary.csv?raw'
import expensesCsv from '../project-assets/expenses.csv?raw'
import { buildTripData, CATEGORY_META } from './tripData.js'

const { days, categoryTotals, grandTotal, countryCount } = buildTripData({
  tripDaysCsv,
  itineraryCsv,
  expensesCsv,
})

export { CATEGORY_META, days, categoryTotals, grandTotal, countryCount }
export { formatDateShort, formatDateLong, formatDateDayMonth, formatMoney } from './tripData.js'
