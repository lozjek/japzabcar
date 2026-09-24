/* Shared lead-form submit handler. Ported from design/jz-data.js JZSendLead.
   Auto-wires any <form data-lead-form> with a [data-lead-status] element inside it. */
(function () {
  // Cloudflare Worker relays the request to the manager's Telegram via
  // Bot API (bot token lives server-side as a Worker secret, never here).
  // If the endpoint is ever unreachable, fall back to opening a pre-filled
  // DM so the lead isn't lost.
  window.JZ_LEAD_ENDPOINT = 'https://japzabcar-leads.lozjek.workers.dev';
  var LEAD_TELEGRAM_USERNAME = 'AlexeyGolobokov';

  window.JZSendLead = function (lead) {
    var text = 'Заявка с сайта\nИмя: ' + lead.name + '\nКонтакт: ' + lead.contact + '\nЗапрос: ' + (lead.message || '');
    if (window.JZ_LEAD_ENDPOINT) {
      return fetch(window.JZ_LEAD_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lead.name, contact: lead.contact, message: lead.message, text: text })
      }).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return 'Спасибо за обращение — мы скоро с вами свяжемся.';
      }).catch(function () {
        try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) {}
        window.open('https://t.me/' + LEAD_TELEGRAM_USERNAME + '?text=' + encodeURIComponent(text), '_blank');
        return 'Не удалось отправить автоматически — открылся чат с менеджером, отправьте сообщение вручную.';
      });
    }
    try { navigator.clipboard && navigator.clipboard.writeText(text); } catch (e) {}
    window.open('https://t.me/' + LEAD_TELEGRAM_USERNAME + '?text=' + encodeURIComponent(text), '_blank');
    return Promise.resolve('Открылся чат с менеджером — сообщение уже готово, останется нажать «Отправить».');
  };

  document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    var status = form.querySelector('[data-lead-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target.elements;
      if (status) { status.textContent = 'Отправляем…'; if (window.JZAnim) window.JZAnim.rise(status); }
      window.JZSendLead({ name: f.name.value, contact: f.phone.value, message: f.msg.value })
        .then(function (msg) {
          if (status) { status.textContent = msg; if (window.JZAnim) window.JZAnim.rise(status); }
          e.target.reset();
        })
        .catch(function () {
          if (status) { status.textContent = 'Не удалось отправить — позвоните +7 996 313-39-96.'; if (window.JZAnim) window.JZAnim.rise(status); }
        });
    });
  });
})();
