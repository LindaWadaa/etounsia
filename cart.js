(function(){
  const CART_KEY = 'etounsia_cart';
  const WHATSAPP_PHONE = '21622155054';
  const EMAILJS_PUBLIC_KEY = 'NAJ4Veir8G-lfdliB';
  const EMAILJS_SERVICE_IDS = ['service_tcnc70p'];
  const EMAILJS_TEMPLATE_ID = 'template_4w7t2b6';
  const ORDER_RECEIVER_EMAIL = 'wdaalinda424@gmail.com';

  let cart = [];
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) cart = JSON.parse(saved);
  } catch(e) { cart = []; }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e) {}
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const cartWhatsappBtn = document.getElementById('cartWhatsappBtn');
  const cartOrderBtn = document.getElementById('cartOrderBtn');

  function formatCurrency(amount) { return amount.toFixed(2) + ' TND'; }

  function cartSummaryText() {
    if (!cart.length) return 'Panier vide';
    return cart.map(item => item.name + ' (' + item.format + ') x' + item.qty).join(', ');
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    cartDrawer.setAttribute('aria-hidden','false');
    cartOverlay.setAttribute('aria-hidden','false');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden','true');
    cartOverlay.setAttribute('aria-hidden','true');
  }

  function updateWhatsappLink() {
    const totalAmount = cart.reduce((s,i) => s + i.price * i.qty, 0);
    let msg = 'Bonjour, je souhaite commander:\n\n';
    cart.forEach(item => {
      const lineTotal = item.price * item.qty;
      msg += '- ' + item.name + ' (' + item.format + ') x' + item.qty;
      if (lineTotal > 0) msg += ' = ' + formatCurrency(lineTotal);
      msg += '\n';
    });
    if (totalAmount > 0) msg += '\nTotal: ' + formatCurrency(totalAmount);
    else msg += '\nTotal: A definir';
    cartWhatsappBtn.href = 'https://wa.me/' + WHATSAPP_PHONE + '?text=' + encodeURIComponent(msg);
  }

  function renderCart() {
    const totalCount = cart.reduce((s,i) => s + i.qty, 0);
    const totalAmount = cart.reduce((s,i) => s + i.price * i.qty, 0);
    cartCountBadge.textContent = String(totalCount);
    cartTotalEl.textContent = formatCurrency(totalAmount);

    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Votre panier est vide. Ajoutez un produit pour commencer.</p>';
      updateWhatsappLink();
      return;
    }

    cartItemsEl.innerHTML = cart.map(item => {
      const lineTotal = item.price * item.qty;
      return '<article class="cart-item" data-id="' + item.id + '">' +
        '<p class="cart-item-title">' + item.name + '</p>' +
        '<p class="cart-item-sub">' + item.format + ' &bull; ' + (item.price > 0 ? formatCurrency(item.price) : 'Prix a venir') + (lineTotal > 0 ? ' &bull; Sous-total: ' + formatCurrency(lineTotal) : '') + '</p>' +
        '<div class="cart-item-row">' +
        '<div class="cart-qty">' +
        '<button type="button" data-action="dec" data-id="' + item.id + '">-</button>' +
        '<span>' + item.qty + '</span>' +
        '<button type="button" data-action="inc" data-id="' + item.id + '">+</button>' +
        '</div>' +
        '<button class="cart-remove" type="button" data-action="remove" data-id="' + item.id + '">Supprimer</button>' +
        '</div></article>';
    }).join('');

    updateWhatsappLink();
  }

  function addToCart(product) {
    const found = cart.find(i => i.id === product.id);
    if (found) found.qty += product.qty;
    else cart.push({...product});
    saveCart();
    renderCart();
    openCart();
  }

  function mutateItem(itemId, action) {
    const idx = cart.findIndex(i => i.id === itemId);
    if (idx === -1) return;
    if (action === 'inc') cart[idx].qty += 1;
    if (action === 'dec') { cart[idx].qty -= 1; if (cart[idx].qty <= 0) cart.splice(idx,1); }
    if (action === 'remove') cart.splice(idx,1);
    saveCart();
    renderCart();
  }

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const activeFormatBtn = card.querySelector('.format-option.active');
      const qtyInput = card.querySelector('.product-qty-input');
      const product = {
        id: (card.dataset.productId || 'prod') + '-' + (activeFormatBtn ? activeFormatBtn.dataset.format : ''),
        name: card.dataset.productName || 'Produit',
        format: activeFormatBtn ? activeFormatBtn.dataset.format : '',
        price: Number(card.dataset.productPrice || 0),
        qty: Math.max(1, Number(qtyInput ? qtyInput.value : 1) || 1)
      };
      addToCart(product);
      if (qtyInput) qtyInput.value = '1';
    });
  });

  document.querySelectorAll('.format-options').forEach(group => {
    group.addEventListener('click', e => {
      if (!e.target.classList.contains('format-option')) return;
      group.querySelectorAll('.format-option').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  cartItemsEl.addEventListener('click', e => {
    const t = e.target;
    if (t.dataset.action && t.dataset.id) mutateItem(t.dataset.id, t.dataset.action);
  });

  openCartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  cartWhatsappBtn.addEventListener('click', () => {
    setTimeout(clearCart, 500);
  });

  // Order Modal
  const orderModal = document.getElementById('orderModal');
  const orderModalOverlay = document.getElementById('orderModalOverlay');
  const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');

  function openOrderModal() {
    orderModal.classList.add('open');
    orderModalOverlay.classList.add('open');
    orderModal.setAttribute('aria-hidden','false');
    orderModalOverlay.setAttribute('aria-hidden','false');
  }

  function closeOrderModal() {
    orderModal.classList.remove('open');
    orderModalOverlay.classList.remove('open');
    orderModal.setAttribute('aria-hidden','true');
    orderModalOverlay.setAttribute('aria-hidden','true');
  }

  closeOrderModalBtn.addEventListener('click', closeOrderModal);
  orderModalOverlay.addEventListener('click', closeOrderModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && orderModal.classList.contains('open')) closeOrderModal();
  });

  cartOrderBtn.addEventListener('click', () => {
    closeCart();
    openOrderModal();
  });

  // EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const formatPrices = {
    '1 Litre': 35, '10 Litres': 320, '20 Litres': 620,
    '250g': 0, '350g': 0, '500g': 0, '700g': 0,
    '1kg': 0, '2kg': 0, '5kg': 0,
    '250ml': 0, '500ml': 0, '1L': 0
  };

  function buildOrderId() {
    const now = new Date();
    const d = now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0');
    return 'ETO-' + d + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  async function sendOrderWithFallback(templateParams) {
    let lastError = null;
    for (const serviceId of EMAILJS_SERVICE_IDS) {
      try {
        const response = await emailjs.send(serviceId, EMAILJS_TEMPLATE_ID, templateParams, { publicKey: EMAILJS_PUBLIC_KEY });
        return { response, serviceId };
      } catch (error) { lastError = error; }
    }
    throw lastError;
  }

  const orderForm = document.getElementById('orderForm');
  const orderStatus = document.getElementById('orderStatus');
  const orderSubmitBtn = document.getElementById('orderSubmitBtn');

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    orderStatus.textContent = '';
    orderStatus.className = 'order-status';
    orderSubmitBtn.disabled = true;
    orderSubmitBtn.textContent = 'Envoi en cours...';

    const customerName = document.getElementById('nom').value.trim();
    const customerPhone = document.getElementById('tel').value.trim();
    const customerAddress = document.getElementById('lieu').value.trim();
    const orderId = buildOrderId();

    // Build items list from ALL cart products
    let totalAmount = 0;
    const itemsLines = cart.map(item => {
      const lineTotal = item.price * item.qty;
      totalAmount += lineTotal;
      return item.name + ' (' + item.format + ') x' + item.qty + (lineTotal > 0 ? ' = ' + formatCurrency(lineTotal) : ' = A definir');
    });
    const items = itemsLines.length > 0 ? itemsLines.join(' | ') : 'Panier vide';

    const templateParams = {
      subject: 'Nouvelle commande #' + orderId,
      order_id: orderId,
      to_email: ORDER_RECEIVER_EMAIL,
      from_name: customerName,
      reply_to: '',
      customer_name: customerName,
      customer_email: '',
      customer_phone: customerPhone,
      customer_address: customerAddress,
      items: items,
      total: totalAmount > 0 ? totalAmount.toFixed(2) + ' TND' : 'A definir'
    };

    try {
      await sendOrderWithFallback(templateParams);
      orderStatus.textContent = 'Commande envoyee avec succes !';
      orderStatus.classList.add('ok');
      orderForm.reset();
      clearCart();
      setTimeout(() => { closeOrderModal(); orderStatus.textContent = ''; orderStatus.className = 'order-status'; }, 2500);
    } catch (error) {
      const code = error && error.status ? 'Code ' + error.status : 'Code inconnu';
      const txt = error && error.text ? error.text : '';
      orderStatus.textContent = 'Echec de l envoi (' + code + '). ' + txt;
      orderStatus.classList.add('err');
    } finally {
      orderSubmitBtn.disabled = false;
      orderSubmitBtn.textContent = 'Valider la commande';
    }
  });

  renderCart();
})();
