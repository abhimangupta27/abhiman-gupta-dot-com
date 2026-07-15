(function () {
  var manifestUrl = '/photography/collections.json';

  function text(tag, className, value) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    return element;
  }

  function metaLine(collection) {
    return [collection.location, collection.year].filter(Boolean).join(' · ');
  }

  function createPolaroid(collection, index) {
    var link = document.createElement('a');
    link.className = 'polaroid-deck deck-' + ((index % 4) + 1);
    link.href = '/photography/collection/?id=' + encodeURIComponent(collection.slug);
    link.setAttribute('aria-label', 'View ' + collection.title + ' photography collection');

    link.appendChild(text('span', 'polaroid-back polaroid-back-two', ''));
    link.appendChild(text('span', 'polaroid-back polaroid-back-one', ''));

    var card = document.createElement('figure');
    card.className = 'polaroid-card';
    var imageArea = document.createElement('div');
    imageArea.className = 'polaroid-image';

    if (collection.cover) {
      var image = document.createElement('img');
      image.src = collection.cover;
      image.alt = collection.coverAlt || '';
      image.loading = 'lazy';
      imageArea.appendChild(image);
    } else {
      imageArea.classList.add('is-empty');
      imageArea.appendChild(text('span', '', 'Add cover.jpg'));
    }

    var caption = document.createElement('figcaption');
    caption.appendChild(text('strong', '', collection.title));
    caption.appendChild(text('span', '', metaLine(collection)));
    card.appendChild(imageArea);
    card.appendChild(caption);
    link.appendChild(card);
    return link;
  }

  function renderIndex(collections) {
    document.querySelectorAll('[data-collection-group]').forEach(function (group) {
      var category = group.getAttribute('data-collection-group');
      var matching = collections.filter(function (collection) {
        return collection.category === category;
      });
      matching.forEach(function (collection, index) {
        group.appendChild(createPolaroid(collection, index));
      });
    });
  }

  function renderCollection(collections) {
    var root = document.querySelector('[data-gallery-root]');
    if (!root) return;

    var id = new URLSearchParams(window.location.search).get('id');
    var collection = collections.find(function (item) { return item.slug === id; });
    if (!collection) {
      root.appendChild(text('p', 'gallery-empty', 'Collection not found.'));
      return;
    }

    document.title = collection.title + ' — Photography by Abhiman Gupta';
    document.querySelector('[data-gallery-title]').textContent = collection.title;
    document.querySelector('[data-gallery-meta]').textContent = metaLine(collection);
    document.querySelector('[data-gallery-description]').textContent = collection.description;

    if (!collection.photos.length) {
      root.appendChild(text('p', 'gallery-empty', 'No collection photographs have been added yet.'));
      return;
    }

    collection.photos.forEach(function (photo) {
      var figure = document.createElement('figure');
      figure.className = 'gallery-frame';
      var image = document.createElement('img');
      image.src = photo.src;
      image.alt = photo.alt || '';
      image.loading = 'lazy';
      figure.appendChild(image);
      if (photo.alt) figure.appendChild(text('figcaption', '', photo.alt));
      root.appendChild(figure);
    });
  }

  window.fetch(manifestUrl)
    .then(function (response) {
      if (!response.ok) throw new Error('Could not load photography manifest.');
      return response.json();
    })
    .then(function (manifest) {
      renderIndex(manifest.collections || []);
      renderCollection(manifest.collections || []);
    })
    .catch(function (error) {
      var status = document.querySelector('[data-photography-status]');
      if (status) status.textContent = error.message;
    });
})();
