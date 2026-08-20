/* Crochet POS — clean feature add-ons: cash/change, bundles, undo sale, delete confirmation. */
(() => {
  const money = n => Number(n || 0).toFixed(2);
  const bundleTotal = (product, qty) => {
    const base = Number(product?.price || 0);
    const deals = Array.isArray(product?.bundles) ? product.bundles : [];
    let best = base * qty;
    for (const d of deals) {
      const q = Number(d.qty || 0), p = Number(d.price || 0);
      if (q >= 2 && p >= 0) best = Math.min(best, Math.floor(qty / q) * p + (qty % q) * base);
    }
    return best;
  };
  const total = () => (Array.isArray(cart) ? cart : []).reduce((s, i) => {
    const p = products.find(x => x.id === i.productId);
    return s + (p ? bundleTotal(p, Number(i.quantity || 0)) : 0);
  }, 0);
  const refresh = () => {
    if (typeof displayCheckoutProducts === 'function') displayCheckoutProducts();
    if (typeof displayCart === 'function') displayCart();
    if (typeof displayInventory === 'function') displayInventory();
    if (typeof displaySales === 'function') displaySales();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof saveData === 'function') saveData();
  };

  const modal = document.getElementById('productModal');
  if (modal && !document.getElementById('bundleQty')) {
    const box = modal.querySelector('.modal-box'), buttons = box?.querySelector('.modal-buttons');
    if (box && buttons) {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<label>Optional Bundle Deal</label><p style="margin:4px 0 8px;font-size:.9em">Example: 2 items for $3.</p><div style="display:flex;gap:8px"><input id="bundleQty" type="number" min="2" step="1" placeholder="2"><input id="bundlePrice" type="number" min="0" step="0.01" placeholder="3.00"></div>';
      box.insertBefore(wrap, buttons);
    }
  }

  const save = document.getElementById('saveProduct');
  if (save && !save.dataset.bundleHook) {
    save.dataset.bundleHook = '1';
    save.addEventListener('click', () => setTimeout(() => {
      const q = Number(document.getElementById('bundleQty')?.value || 0), p = Number(document.getElementById('bundlePrice')?.value || 0);
      if (Array.isArray(products) && products.length) products[products.length - 1].bundles = q >= 2 ? [{ qty:q, price:p }] : [];
      if (typeof saveData === 'function') saveData();
    }, 100));
  }

  const oldCart = window.displayCart;
  if (typeof oldCart === 'function' && !window.__crochetPOSCartHook) {
    window.__crochetPOSCartHook = true;
    window.displayCart = function () {
      oldCart();
      const t = `$${money(total())}`;
      const a = document.getElementById('cartSubtotal'), b = document.getElementById('cartTotal');
      if (a) a.textContent = t;
      if (b) b.textContent = t;
    };
  }

  const cashButton = document.getElementById('cashCheckout');
  if (cashButton && !cashButton.dataset.featureHook) {
    cashButton.dataset.featureHook = '1';
    cashButton.addEventListener('click', () => {
      if (!cart.length) return alert('Your cart is empty.');
      const amount = total();
      const old = document.getElementById('cashPaymentModal'); if (old) old.remove();
      const m = document.createElement('div'); m.id = 'cashPaymentModal';
      m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';
      m.innerHTML = `<div style="background:#fff;color:#000;border-radius:18px;padding:24px;width:min(430px,100%)"><h2>💵 Cash Payment</h2><h3>Total: $${money(amount)}</h3><input id="cashReceived" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Cash received" style="width:100%;box-sizing:border-box;font-size:25px;padding:12px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">${[5,10,20,50,100].map(v=>`<button type="button" class="cash-quick" data-amount="${v}">$${v}</button>`).join('')}<button type="button" class="cash-quick" data-amount="${amount}">Exact</button></div><div id="cashChange" style="font-size:26px;font-weight:700;margin:15px 0">Change: $0.00</div><button id="finishCash" class="primary-btn" style="width:100%">Complete Cash Sale</button><button id="cancelCash" class="secondary-btn" style="width:100%;margin-top:8px">Cancel</button></div>`;
      document.body.appendChild(m);
      const input = document.getElementById('cashReceived'), change = document.getElementById('cashChange');
      const update = () => { const r = Number(input.value || 0); change.textContent = r >= amount ? `Change: $${money(r-amount)}` : `Still needed: $${money(amount-r)}`; };
      input.addEventListener('input', update);
      m.querySelectorAll('.cash-quick').forEach(x => x.onclick = () => { input.value = x.dataset.amount; update(); });
      document.getElementById('cancelCash').onclick = () => m.remove();
      document.getElementById('finishCash').onclick = () => {
        const r = Number(input.value || 0); if (r < amount) return alert(`Customer still owes $${money(amount-r)}.`);
        if (typeof completeSale === 'function') completeSale('Cash', r, r-amount);
        else alert('Cash payment handler is unavailable.');
        m.remove();
      };
      input.focus();
    });
  }

  const salesPage = document.getElementById('sales');
  if (salesPage && !document.getElementById('undoLastSale')) {
    const b = document.createElement('button'); b.id='undoLastSale'; b.className='secondary-btn'; b.textContent='↩️ Undo Last Sale';
    b.onclick = () => {
      if (!sales.length) return alert('There are no sales to undo.');
      const sale = sales[sales.length-1];
      if (!confirm(`Undo the last sale for $${money(sale.total)}? Inventory will be restored.`)) return;
      (sale.items || []).forEach(i => { const p=products.find(x=>x.id===i.productId); if(p) p.stock=Number(p.stock||0)+Number(i.quantity||0); });
      sales.pop(); refresh(); alert('Last sale undone and inventory restored.');
    };
    salesPage.querySelector('.page-heading')?.appendChild(b);
  }

  const originalDelete = window.deleteProduct;
  if (typeof originalDelete === 'function' && !window.__crochetPOSDeleteHook) {
    window.__crochetPOSDeleteHook = true;
    window.deleteProduct = id => { const p=products.find(x=>x.id===id); if(p && confirm(`Delete "${p.name}" from inventory?`)) originalDelete(id); };
  }
})();
