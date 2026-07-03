document.addEventListener("DOMContentLoaded", () => {
  const radios = document.querySelectorAll('input[name="amount"]');
  const customInput = document.getElementById("pin_amount_custom");

  const newBalanceDisplay = document.getElementById("newBalanceDisplay");
  const spendBalanceDisplay = document.getElementById("spendBalanceDisplay");

  if (!newBalanceDisplay || !spendBalanceDisplay) return;

  const startingCredit = parseFloat(newBalanceDisplay.dataset.startingBalance) || 0;
  const startingSpend = parseFloat(spendBalanceDisplay.dataset.startingSpend) || 0;

  function getSelectedAmount() {
    const selected = document.querySelector('input[name="amount"]:checked');
    if (!selected) return 0;

    if (selected.value === "custom") {
      return parseFloat(customInput?.value || "0") || 0;
    }
    return parseFloat(selected.value) || 0;
  }

  function updateBalances() {
    const amount = getSelectedAmount();
    const newCredit = startingCredit + amount;
    const newSpend = startingSpend - amount;

    newBalanceDisplay.textContent = `£${newCredit.toFixed(2)}`;
    spendBalanceDisplay.textContent = `£${newSpend.toFixed(2)}`;

    const newCreditInput = document.getElementById('newCredit');
    const newSpendInput = document.getElementById('newSpend');
    if (newCreditInput) newCreditInput.value = newCredit.toFixed(2);
    if (newSpendInput) newSpendInput.value = newSpend.toFixed(2);
  }

  radios.forEach(radio => radio.addEventListener("change", updateBalances));

  if (customInput) {
    customInput.addEventListener("input", () => {
      const customRadio = document.querySelector('input[value="custom"]');
      if (customRadio) customRadio.checked = true;
      updateBalances();
    });
  }
});
