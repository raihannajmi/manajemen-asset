/**
 * Pricing Engine
 * Calculates rental cost based on pricing scheme and duration
 */

const calculatePrice = (startDatetime, endDatetime, pricingScheme) => {
  if (!pricingScheme) {
    return null; // Fallback to old behavior
  }

  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  const diffMs = end - start;

  if (diffMs <= 0) {
    throw new Error('End datetime must be after start datetime');
  }

  let units = 1;
  const unitType = pricingScheme.unit || 'day';

  switch (unitType) {
    case 'hour':
      units = Math.ceil(diffMs / (1000 * 60 * 60));
      break;
    case 'day':
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      break;
    case 'week':
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
      break;
    case 'month':
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)); // Rough estimate
      break;
    case 'year':
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 365)); // Rough estimate
      break;
    default:
      units = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  let subtotal = pricingScheme.base_price || 0;
  
  if (pricingScheme.tiers && pricingScheme.tiers.length > 0) {
     // Find the appropriate tier based on units
     // Tiers should be sorted by min_units ascending
     const sortedTiers = [...pricingScheme.tiers].sort((a, b) => a.min_units - b.min_units);
     
     let appliedTier = sortedTiers[0];
     for (const tier of sortedTiers) {
       if (units >= tier.min_units) {
         if (!tier.max_units || units <= tier.max_units) {
           appliedTier = tier;
         }
       }
     }

     if (appliedTier && appliedTier.price_per_unit) {
       subtotal += (units * appliedTier.price_per_unit);
     }
  }

  const taxPercent = pricingScheme.tax_percent || 0;
  const tax = Math.round(subtotal * (taxPercent / 100));
  const deposit = pricingScheme.deposit || 0;

  const total = subtotal + tax + deposit;

  return {
    units,
    unitType,
    subtotal,
    tax,
    deposit,
    total,
    breakdown: {
      basePrice: pricingScheme.base_price || 0,
      tierPricePerUnit: pricingScheme.tiers ? subtotal - (pricingScheme.base_price || 0) : 0,
      taxPercent
    }
  };
};

module.exports = {
  calculatePrice
};
