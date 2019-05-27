const CACHE = "pwabuilder-offline";

self.addEventListener("install", function (e) {
    e.waitUntil(caches.open(CACHE).then(function (cache) {
        return cache.add("/"); /* cache index page*/
    }));
});

self.addEventListener("fetch", function (e) {
    if (e.request.method == "GET") {
        e.respondWith(fetch(e.request).then(function (response) {
            e.waitUntil(updateCache(e.request, response.clone())); /* cache requested page */
            return response;
        }).catch(function (error) { /* if network fails */
            return cache.match(e.request);
        }));
    }
});

function updateCache(request, response) {
    return caches.open(CACHE).then(function (cache) {
        return cache.put(request, response);
    });
}
