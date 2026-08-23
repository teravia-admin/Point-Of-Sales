import Decimal from 'decimal.js';

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export function calculateTransaction(
  items: { price: number; quantity: number }[],
  discountType: 'NOMINAL' | 'PERCENTAGE',
  discountValue: number,
  taxEnabled: boolean,
  taxRatePercent: number
): CalculationResult {
  // Subtotal = Σ(Price × Quantity)
  const subtotalDecimal = items.reduce((sum, item) => {
    return sum.plus(new Decimal(item.price).times(item.quantity));
  }, new Decimal(0));

  // Discount Calculation
  let discountDecimal = new Decimal(0);
  if (discountType === 'PERCENTAGE') {
    discountDecimal = subtotalDecimal.times(discountValue).dividedBy(100);
  } else {
    discountDecimal = new Decimal(discountValue);
  }

  // Ensure discount does not exceed subtotal
  if (discountDecimal.greaterThan(subtotalDecimal)) {
    discountDecimal = subtotalDecimal;
  }

  // Taxable Amount = Subtotal - Discount
  const taxableDecimal = subtotalDecimal.minus(discountDecimal);

  // Tax (PPN) Calculation
  let taxDecimal = new Decimal(0);
  if (taxEnabled && taxRatePercent > 0) {
    taxDecimal = taxableDecimal.times(taxRatePercent).dividedBy(100);
  }

  // Grand Total = Taxable Amount + Tax
  const grandTotalDecimal = taxableDecimal.plus(taxDecimal);

  return {
    subtotal: subtotalDecimal.toNumber(),
    discountAmount: discountDecimal.toNumber(),
    taxableAmount: taxableDecimal.toNumber(),
    taxAmount: taxDecimal.toNumber(),
    grandTotal: Math.round(grandTotalDecimal.toNumber()),
  };
}
