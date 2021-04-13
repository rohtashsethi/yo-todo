var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/style.css',
  '/script.js'
];

self.addEventListener('install', function(ev) {
    ev.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened Cache!!');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(ev) {
    ev.respondWith(
        caches.match(ev.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(ev.request).then(function(response) {
                // Check if we received a valid response
                if(!response || response.status !== 200 || response.type !== 'basic') {
                  return response;
                }
    
                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.
                var responseToCache = response.clone();
    
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                        cache.put(ev.request, responseToCache);
                  }).catch(function(err) {
                      console.log(err.message)
                  });
                return response;
              });

            
        })
    );
});