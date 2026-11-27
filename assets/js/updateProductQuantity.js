function updateQuantity(change) {
  const quantityElement = document.getElementById('quantity')
  if (!quantityElement) return

  let quantity = parseInt(quantityElement.textContent, 10) || 1
  quantity = Math.max(1, quantity + change)
  quantityElement.textContent = quantity
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.js-quantity-btn').forEach(button => {
    button.addEventListener('click', () => {
      updateQuantity(Number(button.dataset.change))
    })
  })

  const addToBasketBtn = document.getElementById('add-to-basket-btn')
  const quantitySelector = document.getElementById('quantity-selector')

  if (addToBasketBtn && quantitySelector) {
    addToBasketBtn.addEventListener('click', () => {
      addToBasketBtn.style.display = 'none'
      quantitySelector.style.display = 'inline-flex'
    })
  }
})
