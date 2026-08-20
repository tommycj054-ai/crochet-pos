/* Crochet POS feature upgrades: cash/change, bundles, undo sale, delete confirmation. */
(function () {
  const money = n => Number(n || 0).toFixed(2);
  const bundleTotal = (product, qty) => {
    const base = Number(product.price || 0);
    const deals = Array.isArray(product.bundles) ? product.bundles : [];
    let best = base * qty;
    deals.forEach(d => {
      const q = Math.max(2, Number(d.qty || 0));
      const p = Math.max(0, Number(d.price || 0));
      const value = Math.floor(qty / q) * p + (qty % q) * base;
      if (value < best) best = value;
    });
    return best;
  };

  function refresh() {
    if (typeof displayCheckoutProducts === 'function') displayCheckoutProducts();
    if (typeof displayCart === 'function') displayCart();
    if (typeof displayInventory === 'function') displayInventory();
    if (typeof displaySales === 'function') displaySales();
    if (typeof updateDashboard === 'function') updateDashboard();
  }

  // Add optional bundle controls to the existing product modal.
  const modalBox = document.querySelector('#productModal .modal-box');
  if (modalBox && !document.getElementById('bundleQty')) {
    const wrap = document.createElement('div');
    wrap.id = 'bundleControls';
    wrap.innerHTML = '<label>Optional Bundle Deal</label><p style="font-size:.9em">Example: 2 items for $3. Leave blank for no bundle.</p><div style="display:flex;gap:8px"><input id="bundleQty" type="number" min="2" placeholder="2"><input id="bundlePrice" type="number" min="0" step="0.01" placeholder="3.00"></div>';
    const buttons = modalBox.querySelector('.modal-buttons');
    modalBox.insertBefore(wrap, buttons);
  }

  // Capture bundle settings after the existing product save/edit flow.
  const saveBtn = document.getElementById('saveProduct');
  if (saveBtn) {
    const clone = saveBtn.cloneNode(true);
    saveBtn.replaceWith(clone);
    clone.addEventListener('click', () => {
      setTimeout(() => {
        const q = Number(document.getElementById('bundleQty')?.value || 0);
        const p = Number(document.getElementById('bundlePrice')?.value || 0);
        if (typeof editingProductId !== 'undefined' && editingProductId) {
          const product = products.find(x => x.id === editingProductId);
          if (product) product.bundles = q >= 2 ? [{ qty: q, price: p }] : [];
        } else if (products.length) {
          const product = products[products.length - 1];
          product.bundles = q >= 2 ? [{ qty: q, price: p }] : [];
        }
        if (typeof saveData === 'function') saveData();
        refresh();
      }, 50);
    });
  }

  // Use bundle pricing in the visible cart.
  const originalDisplayCart = window.displayCart;
  window.displayCart = function () {
    if (!Array.isArray(cart)) return;
    const list = document.getElementById('cartItems');
    let subtotal = 0, itemCount = 0;
    if (!cart.length) {
      list.innerHTML = '<div class="empty-cart"><div>🛒</div><p>Your cart is empty.</p><small>Scan or tap a product.</small></div>';
    } else {
      list.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';
        const total = bundleTotal(product, item.quantity);
        subtotal += total; itemCount += item.quantity;
        const deal = Array.isArray(product.bundles) && product.bundles.length ? `<small>🏷 Bundle: ${product.bundles.map(b => `${b.qty} for $${money(b.price)}`).join(' · ')}</small>` : '';
        return `<div class="cart-item"><div><div class="cart-item-name">${escapeHTML(product.name)}</div>${deal}<div class="quantity-controls"><button onclick="changeCartQuantity(${product.id},-1)">−</button><strong>${item.quantity}</strong><button onclick="changeCartQuantity(${product.id},1)">+</button></div></div><div class="cart-item-price">$${money(total)}</div></div>`;
      }).join('');
    }
    document.getElementById('cartItemCount').textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
    document.getElementById('cartSubtotal').textContent = `$${money(subtotal)}`;
    document.getElementById('cartTotal').textContent = `$${money(subtotal)}`;
  };

  // Replace checkout payment buttons so Cash opens a change calculator.
  function replaceButton(id) {
    const old = document.getElementById(id);
    if (!old) return null;
    const fresh = old.cloneNode(true);
    old.replaceWith(fresh);
    return fresh;
  }
  const cash = replaceButton('cashCheckout');
  const card = replaceButton('cardCheckout');
  if (cash) cash.addEventListener('click', openCashPayment);
  if (card) card.addEventListener('click', () => window.completeSale('Card'));

  function openCashPayment() {
    if (!cart.length) return alert('Your cart is empty.');
    if (!activeEventId) { alert('Please select a craft fair first.'); showPage('events'); return; }
    const total = cart.reduce((sum, item) => sum + bundleTotal(products.find(p => p.id === item.productId), item.quantity), 0);
    const modal = document.createElement('div');
    modal.id = 'cashPaymentModal';
    modal.style = 'position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px';
    modal.innerHTML = `<div style="background:#fff;color:#000;border-radius:18px;padding:24px;width:min(430px,100%)"><h2>💵 Cash Payment</h2><h3>Total: $${money(total)}</h3><input id="cashReceived" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Cash received" style="width:100%;font-size:25px;padding:12px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">${[5,10,20,50,100].map(n => `<button type="button" class="cash-quick" data-amount="${n}">$${n}</button>`).join('')}<button type="button" class="cash-quick" data-amount="${Math.ceil(total)}">Exact</button></div><div id="cashChange" style="font-size:28px;font-weight:bold;margin:15px 0">Change: $0.00</div><button id="finishCash" class="primary-btn" style="width:100%">Complete Cash Sale</button><button id="cancelCash" class="secondary-btn" style="width:100%;margin-top:8px">Cancel</button></div>`;
    document.body.appendChild(modal);
    const input = document.getElementById('cashReceived');
    const change = document.getElementById('cashChange');
    const update = () => { const r = Number(input.value || 0); change.textContent = r >= total ? `Change: $${money(r-total)}` : `Still needed: $${money(total-r)}`; };
    input.addEventListener('input', update);
    modal.querySelectorAll('.cash-quick').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.amount; update(); }));
    document.getElementById('cancelCash').onclick = () => modal.remove();
    document.getElementById('finishCash').onclick = () => { const r = Number(input.value || 0); if (r < total) return alert(`Customer still owes $${money(total-r)}.`); window.completeSale('Cash', r, r-total); modal.remove(); };
    input.focus();
  }

  // Replace sale completion to record cash received/change and apply bundle totals.
  window.completeSale = function (paymentMethod, cashReceived, change) {
    if (!cart.length) return alert('Your cart is empty.');
    if (!activeEventId) { alert('Please select a craft fair first.'); showPage('events'); return; }
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) return alert('There is not enough stock.');
    }
    let total = 0, itemCount = 0;
    const saleItems = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      const line = bundleTotal(product, item.quantity);
      total += line; itemCount += item.quantity; product.stock -= item.quantity;
      return { productId: product.id, name: product.name, sku: product.sku, quantity: item.quantity, price: product.price, total: line };
    });
    sales.push({ id: Date.now(), date: new Date().toISOString(), eventId: activeEventId, paymentMethod, total, itemCount, cashReceived: paymentMethod === 'Cash' ? Number(cashReceived || 0) : 0, change: paymentMethod === 'Cash' ? Number(change || 0) : 0, items: saleItems });
    cart = [];
    saveData(); refresh();
    alert(`Sale Complete!\n\n${paymentMethod}\n$${money(total)}${paymentMethod === 'Cash' ? `\nCash: $${money(cashReceived)}\nChange: $${money(change)}` : ''}`);
  };

  // Add an Undo Last Sale control to Sales.
  const salesPage = document.getElementById('sales');
  if (salesPage && !document.getElementById('undoLastSale')) {
    const button = document.createElement('button');
    button.id = 'undoLastSale'; button.className = 'secondary-btn'; button.textContent = '↩️ Undo Last Sale';
    button.onclick = () => {
      if (!sales.length) return alert('No sales to undo.');
      const sale = sales[sales.length - 1];
      if (!confirm(`Undo the last sale for $${money(sale.total)}? Inventory will be restored.`)) return;
      (sale.items || []).forEach(item => { const p = products.find(x => x.id === item.productId); if (p) p.stock += Number(item.quantity || 0); });
      sales.pop(); saveData(); refresh(); alert('Last sale undone and inventory restored.');
    };
    const heading = salesPage.querySelector('.page-heading');
    (heading || salesPage).appendChild(button);
  }

  // Add delete confirmation even if the original function changes later.
  const originalDelete = window.deleteProduct;
  if (typeof originalDelete === 'function') {
    window.deleteProduct = function (id) {
      const p = products.find(x => x.id === id);
      if (!p) return;
      if (!confirm(`Delete "${p.name}" from inventory?`)) return;
      originalDelete(id);
    };
  }

  // Show bundle information on product cards when possible.
  const oldCheckoutProducts = window.displayCheckoutProducts;
  window.displayCheckoutProducts = function () {
    oldCheckoutProducts();
    document.querySelectorAll('.checkout-product').forEach(card => {
      const id = Number(card.dataset.productId);
      const p = products.find(x => x.id === id);
      if (p && p.bundles?.length && !card.querySelector('.bundle-deal')) {
        const d = document.createElement('div'); d.className = 'bundle-deal'; d.textContent = '🏷 ' + p.bundles.map(b => `${b.qty} for $${money(b.price)}`).join(' · '); card.appendChild(d);
      }
    });
  };
})();
