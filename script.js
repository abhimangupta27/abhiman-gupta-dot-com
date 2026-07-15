(function () {
  var loader = document.getElementById('loader');
  var skipLoader = document.documentElement.classList.contains('skip-loader');

  if (loader && !skipLoader) {
    document.documentElement.classList.add('loading');
    try {
      window.sessionStorage.setItem('abhiman-intro-seen', 'true');
    } catch (error) {
      // The animation still works when browser storage is unavailable.
    }

    window.setTimeout(function () {
      loader.classList.add('is-fading');
      document.documentElement.classList.remove('loading');

      window.setTimeout(function () {
        loader.classList.add('hidden');
      }, 450);
    }, 3200);
  } else if (loader) {
    loader.classList.add('hidden');
  }
})();
