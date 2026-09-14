import tripDaysCsv from '../../project-assets/trip_days.csv?raw'
import itineraryCsv from '../../project-assets/itinerary.csv?raw'
import expensesCsv from '../../project-assets/expenses.csv?raw'
import { buildTripData } from './trip-data-core.js'

export * from './trip-data-core.js'

export const { days, itineraryByDayId, categoryTotals, spendMatrix, grandTotal, stats, dateRangeLabel } =
  buildTripData(tripDaysCsv, itineraryCsv, expensesCsv)
