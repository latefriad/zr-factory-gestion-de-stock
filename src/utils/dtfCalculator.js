/**
 * DTF Calculator for ZR Factory
 * Supports Multiple Logos per Piece (e.g. Chest + Back + Sleeves)
 * Standard Roll: 58cm width x 100cm length (1 linear meter)
 * Default Rate: 1500 DA / linear meter
 */

export const calculateDtfPrint = ({
  logos = [{ id: 1, position: 'صدر (Poitrine)', widthCm: 25, heightCm: 15 }],
  meterPriceDA = 1500,
  rollWidthCm = 58,
  quantity = 1,
  blankCostDA = 0,
  emballageCostDA = 50,
  pressLaborDA = 50,
  sellingPriceDA = 0
}) => {
  const qty = parseInt(quantity) || 1;
  const meterPrice = parseFloat(meterPriceDA) || 1500;
  const rollWidth = parseFloat(rollWidthCm) || 58;
  const blankCost = parseFloat(blankCostDA) || 0;
  const emballageCost = parseFloat(emballageCostDA) || 0;
  const pressCost = parseFloat(pressLaborDA) || 0;

  // Meter area: 58cm * 100cm = 5800 cm²
  const meterAreaCm2 = rollWidth * 100;
  const costPerCm2 = meterPrice / meterAreaCm2;

  // Calculate each logo
  let totalAreaPerPieceCm2 = 0;
  let totalDtfCostPerPiece = 0;

  const processedLogos = logos.map((l, index) => {
    const w = parseFloat(l.widthCm) || 0;
    const h = parseFloat(l.heightCm) || 0;
    const area = w * h;
    const cost = area * costPerCm2;

    totalAreaPerPieceCm2 += area;
    totalDtfCostPerPiece += cost;

    return {
      id: l.id || index + 1,
      position: l.position || `لوجو ${index + 1}`,
      widthCm: w,
      heightCm: h,
      areaCm2: Math.round(area),
      costDA: Math.round(cost)
    };
  });

  const dtfUnitCost = Math.round(totalDtfCostPerPiece);
  const totalUnitCost = Math.round(dtfUnitCost + blankCost + emballageCost + pressCost);
  const totalOrderCost = totalUnitCost * qty;

  // Linear roll meters consumed for the total order
  const totalOrderAreaCm2 = totalAreaPerPieceCm2 * qty;
  const totalLinearMeters = parseFloat((totalOrderAreaCm2 / (rollWidth * 100)).toFixed(2));

  // Suggested selling price
  const suggestedSellingPrice = Math.round(totalUnitCost * 1.5 / 50) * 50;
  const actualSellingPrice = sellingPriceDA ? parseFloat(sellingPriceDA) : suggestedSellingPrice;
  const totalRevenue = actualSellingPrice * qty;
  const estimatedProfit = totalRevenue - totalOrderCost;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((estimatedProfit / totalRevenue) * 100) : 0;

  return {
    logos: processedLogos,
    logosCount: processedLogos.length,
    totalAreaPerPieceCm2: Math.round(totalAreaPerPieceCm2),
    dtfUnitCost,
    totalLinearMeters,
    blankCost,
    emballageCost,
    pressCost,
    totalUnitCost,
    totalOrderCost,
    suggestedSellingPrice,
    actualSellingPrice,
    totalRevenue,
    estimatedProfit,
    profitMarginPercent
  };
};
