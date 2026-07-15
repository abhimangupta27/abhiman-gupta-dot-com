(function () {
  var loader = document.getElementById('loader');

  if (loader) {
    document.documentElement.classList.add('loading');

    window.setTimeout(function () {
      loader.classList.add('is-fading');
      document.documentElement.classList.remove('loading');

      window.setTimeout(function () {
        loader.classList.add('hidden');
      }, 450);
    }, 3200);
  }

  var emailButton = document.querySelector('[data-email-reveal]');
  if (!emailButton) return;

  emailButton.addEventListener('click', function () {
    var address = window.atob('aGVsbG9AYWJoaW1hbmd1cHRhLmNvbQ==');
    var link = document.createElement('a');
    link.href = 'mailto:' + address;
    link.className = 'email-button';
    link.textContent = address;
    emailButton.replaceWith(link);
  });
})();
