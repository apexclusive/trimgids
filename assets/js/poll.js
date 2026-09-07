(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function token() {
    var key = 'tg-poll-voter';
    var value = localStorage.getItem(key);
    if (!value) {
      value = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
      localStorage.setItem(key, value);
    }
    return value;
  }

  function optionData(option, index) {
    if (typeof option === 'string') return { id: option, label: option, votes: 0 };
    return { id: option.id || 'option-' + index, label: option.label || option.title || option.id, votes: Number(option.votes) || 0 };
  }

  function renderPoll(container, poll, results) {
    var options = (poll.options || []).map(optionData);
    var total = options.reduce(function (sum, option) { return sum + option.votes; }, 0);
    if (results) {
      container.innerHTML = '<h3>' + escapeHtml(poll.question) + '</h3><div class="tg-poll-results">' + options.map(function (option) {
        var percent = total ? Math.round(option.votes / total * 100) : 0;
        return '<div class="tg-poll-result"><div class="tg-poll-result-head"><span>' + escapeHtml(option.label) + '</span><strong>' + percent + '%</strong></div><div class="tg-poll-track"><div class="tg-poll-fill" style="width:' + percent + '%"></div></div></div>';
      }).join('') + '</div><p class="opinion-note" style="margin:16px 0 0">Bedankt voor je stem. De uitslag is anoniem en wordt alleen als totaal weergegeven.</p>';
      return;
    }
    container.innerHTML = '<h3>' + escapeHtml(poll.question) + '</h3><div class="tg-poll-options">' + options.map(function (option) {
      return '<button class="tg-poll-option" type="button" data-option-id="' + escapeHtml(option.id) + '"><span>' + escapeHtml(option.label) + '</span><small>' + option.votes + ' stemmen</small></button>';
    }).join('') + '</div><button class="tg-poll-submit" type="button" disabled>Stem uitbrengen</button>';
    var selected = null;
    container.querySelectorAll('.tg-poll-option').forEach(function (button) {
      button.addEventListener('click', function () {
        selected = button.getAttribute('data-option-id');
        container.querySelectorAll('.tg-poll-option').forEach(function (item) { item.classList.toggle('selected', item === button); });
        container.querySelector('.tg-poll-submit').disabled = false;
      });
    });
    container.querySelector('.tg-poll-submit').addEventListener('click', function () {
      if (!selected) return;
      var submit = this;
      submit.disabled = true;
      fetch('/api/polls/' + encodeURIComponent(poll.id) + '/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selected, voterToken: token() })
      }).then(function (response) {
        if (!response.ok) throw new Error('vote_failed');
        return response.json();
      }).then(function (updated) {
        renderPoll(container, updated, true);
      }).catch(function () {
        submit.disabled = false;
        submit.textContent = 'Probeer opnieuw';
      });
    });
  }

  document.querySelectorAll('[data-poll-id]').forEach(function (container) {
    fetch('/api/polls?breed=' + encodeURIComponent(container.getAttribute('data-poll-id')))
      .then(function (response) { return response.json(); })
      .then(function (poll) { renderPoll(container, poll, false); })
      .catch(function () { container.innerHTML = '<p class="tg-poll-loading">De poll is tijdelijk niet beschikbaar.</p>'; });
  });
})();
