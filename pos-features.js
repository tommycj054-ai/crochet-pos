/* Crochet POS — cash checkout only in checkout; no checkout alerts. */
(() => {
  const money = n => Number(n || 0).toFixed(2);
  const cartTotal = () => (Array.isArray(cart) ? cart : []).reduce((sum, item) => {
    const p = (Array.isArray(products) ? products : []).find(x => x.id === item.productId);
    return sum + (p ? Number(p.price || 0) * Number(item.quantity || 0) : 0);
  }, 0);

  const cashButton = document.getElementById('cashCheckout');
  if (!cashButton || cashButton.dataset.cashOnlyHook) return;
  cashButton.dataset.cashOnlyHook = '1';

  cashButton.addEventListener('click', () => {
    if (!Array.isArray(cart) || !cart.length) return;

    const amount = cartTotal();
    const old = document.getElementById('cashPaymentModal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'cashPaymentModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;';
    modal.innerHTML = `
      <div style="background:#fff;color:#000;border-radius:18px;padding:24px;width:min(430px,100%);box-sizing:border-box">
        <h2 style="margin-top:0">Cash Payment</h2>
        <div style="font-size:22px;font-weight:700;margin-bottom:14px">Total: $${money(amount)}</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">
          <button type="button" class="cash-quick" data-amount="5">$5</button>
          <button type="button" class="cash-quick" data-amount="10">$10</button>
          <button type="button" class="cash-quick" data-amount="15">$15</button>
          <button type="button" class="cash-quick" data-amount="20">$20</button>
          <button type="button" class="cash-quick" data-amount="50">$50</button>
          <button type="button" class="cash-quick" data-amount="100">$100</button>
          <button type="button" id="cashExact">Exact</button>
          <button type="button" id="cashCustom">Custom</button>
        </div>
        <div id="customCashWrap" style="display:none;margin-top:12px">
          <input id="cashReceived" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Enter cash received" style="width:100%;box-sizing:border-box;font-size:24px;padding:12px">
        </div>
        <div id="cashResult" style="font-size:25px;font-weight:800;margin:18px 0">Select the cash received.</div>
        <button type="button" id="finishCash" style="width:100%;font-size:18px;padding:13px" disabled>Complete Cash Sale</button>
        <button type="button" id="cancelCash" style="width:100%;font-size:16px;padding:11px;margin-top:8px">Cancel</button>
      </div>`;

    document.body.appendChild(modal);

    const result = document.getElementById('cashResult');
    const finish = document.getElementById('finishCash');
    const input = document.getElementById('cashReceived');
    const customWrap = document.getElementById('customCashWrap');

    const showAmount = received => {
      const r = Number(received || 0);
      if (r < amount) {
        result.textContent = `Need $${money(amount - r)} more`;
        finish.disabled = true;
        return;
      }
      const change = r - amount;
      result.textContent = change === 0 ? 'Exact amount — no change' : `Give $${money(change)} change`;
      finish.disabled = false;
      finish.dataset.received = String(r);
    };

    modal.querySelectorAll('.cash-quick').forEach(button => {
      button.addEventListener('click', () => showAmount(button.dataset.amount));
    });

    document.getElementById('cashExact').addEventListener('click', () => showAmount(amount));
    document.getElementById('cashCustom').addEventListener('click', () => {
      customWrap.style.display = 'block';
      input.focus();
    });
    input.addEventListener('input', () => showAmount(input.value));
    document.getElementById('cancelCash').addEventListener('click', () => modal.remove());

    finish.addEventListener('click', () => {
      const received = Number(finish.dataset.received || 0);
      if (received < amount) return;
      if (typeof completeSale === 'function') {
        completeSale('Cash', received, received - amount);
        modal.remove();
      }
    });
  });
})();
