/* Shared lead-form submit handler. Ported from design/jz-data.js JZSendLead.
   Auto-wires any <form data-lead-form> with a [data-lead-status] element inside it. */
(function () {
  // No bot/webhook yet — form copies the request text and opens Telegram.
  // When a bot exists: set this to its endpoint URL, it will receive a
  // POST of {name, contact, message, text}.
  window.JZ_LEAD_ENDPOINT = '';

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
    window.open('https://t.me/JapZabCar', '_blank');
    return Promise.resolve('Текст заявки скопирован — вставьте его в чат Telegram.');
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
