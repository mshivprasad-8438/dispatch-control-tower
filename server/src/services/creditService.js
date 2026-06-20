const { CREDIT_STATUS } = require("../constants/statuses");
const MESSAGES = require("../constants/messages");

function getCreditStatus(customer) {
  const reasons = [];

  if (customer.outstandingBalance > customer.creditLimit) {
    reasons.push(MESSAGES.CREDIT_LIMIT_EXCEEDED(customer.outstandingBalance, customer.creditLimit));
  }

  if (customer.oldestOverdueInvoiceDays > customer.creditDays) {
    reasons.push(MESSAGES.OVERDUE_EXCEEDED(customer.oldestOverdueInvoiceDays, customer.creditDays));
  }

  if (reasons.length > 0) {
    return {
      creditStatus: CREDIT_STATUS.BLOCKED,
      creditReason: reasons.join(" and "),
    };
  }

  return {
    creditStatus: CREDIT_STATUS.OK,
    creditReason: null,
  };
}

module.exports = {
  getCreditStatus,
};
