/* Shared lead-form submit handler. Ported from design/jz-data.js JZSendLead.
   Auto-wires any <form data-lead-form> with a [data-lead-status] element inside it. */
(function () {
  // No bot/webhook yet — form opens a direct chat with the manager on
  // Telegram, with the request text pre-filled via the `text` deep-link
  // param (t.me/JapZabCar is a channel and can't receive DMs, so this has
  // to point at a real person/bot). When a bot exists: set JZ_LEAD_ENDPOINT
  // to its URL, it will receive a POST of {name, contact, message, text}.
  window.JZ_LEAD_ENDPOINT = '';
  var LEAD_TELEGRAM_USERNAME = 'AlexeyGolobokov';

  window.JZSendLead = function (lead) {
    var text = 'Заявка с сайта\nИмя: ' + lead.name + '\nКонтакт: ' + lead.contact + '\nЗапрос: ' + (lead.message || '');
    if (window.JZ_LEAD_ENDPOINT) {
      return fetch(window.JZ_LEAD_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lead.name, contact: lead.contact, message: lead.message, text: text })
      }).then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return 'Заявка отправлена — скоро напишем вам.';
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
