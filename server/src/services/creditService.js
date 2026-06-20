function formatCurrency(amount) {
  return `₹${amount}`;
}

function getCreditStatus(customer) {
  const reasons = [];

  if (customer.outstandingBalance > customer.creditLimit) {
    reasons.push(
      `Outstanding ${formatCurrency(customer.outstandingBalance)} exceeds credit limit ${formatCurrency(customer.creditLimit)}`
    );
  }

  if (customer.oldestOverdueInvoiceDays > customer.creditDays) {
    reasons.push(
      `Oldest overdue invoice ${customer.oldestOverdueInvoiceDays} days exceeds credit days ${customer.creditDays}`
    );
  }

  if (reasons.length > 0) {
    return {
      creditStatus: "BLOCKED",
      creditReason: reasons.join(" and "),
    };
  }

  return {
    creditStatus: "OK",
    creditReason: null,
  };
}

module.exports = {
  getCreditStatus,
};
