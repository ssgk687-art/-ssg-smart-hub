
'use strict';

/*
 * SSG SMART HUB
 * Production Service Worker
 * Cache version: v3
 */

const CACHE_PREFIX = 'ssg-smart-hub-';
const CACHE_NAME = `${CACHE_PREFIX}shell-v3`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/assets/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: cache the essential application files.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove only outdated SSG SMART HUB caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith(CACHE_PREFIX) &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for pages, cache-first for app resources.
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept requests to other origins.
  if (url.origin !== self.location.origin) return;

  // Navigation requests: prefer the latest online page.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);

        if (response.ok && response.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('/index.html', response.clone());
        }

        return response;
      } catch (error) {
        const cachedPage = await caches.match('/index.html');

        if (cachedPage) return cachedPage;

        return new Response(
          'SSG SMART HUB is currently offline. Please reconnect and try again.',
          {
            status: 503,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-store'
            }
          }
        );
      }
    })());

    return;
  }

  // Other same-origin GET requests: use cache when available.
  event.respondWith((async () => {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) return cachedResponse;

    try {
      const response = await fetch(request);

      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      return new Response(
        'This resource is unavailable offline.',
        {
          status: 503,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store'
          }
        }
      );
    }
  })());
});
