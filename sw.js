var CACHE_NAME = "my-site-cache-v1";
var urlsToCache = ["/", "/style.css", "/script.js"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Opened Cache!!");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function (ev) {
  ev.respondWith(
    caches.match(ev.request).then(function (response) {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(ev.request).then(function (response) {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.

        if (String(ev.request.url).search("chrome-extension://") > -1) {
          return response;
        }
        var responseToCache = response.clone();

        caches
          .open(CACHE_NAME)
          .then(function (cache) {
            cache.put(ev.request, responseToCache);
          })
          .catch(function (err) {
            console.log(err.message);
          });
        return response;
      });
    })
  );
});

self.addEventListener("notificationclose", (ev) => {
  console.log("Notification Closed!");
});

self.addEventListener("notificationclick", (ev) => {
  ev.notification.close();

  switch (ev.action) {
    case "Add":
      console.log("Add clicked");
      break;
    case "Complete":
      console.log("Complete clicked");
      break;
    case "Delete":
      console.log("Delete clicked");
      break;
    default:
      console.log("Notification clicked");
      break;
  }
});

self.addEventListener("push", ev => {
  console.log("Received push message");

  ev.waitUntil(
    self.registration.showNotification("Yo Todo", {
        body: "Manage your daily task using Yo Todo",
        icon: "/images/android-icon-192x192.png",
        badge: "/images/android-icon-192x192.png",
        actions: [
          { action: "Add", title: "Add new task" },
          { action: "Complete", title: "Complete task" }
        ]
      })
  );
});
