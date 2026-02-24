/**
 * Service Worker - 离线缓存支持
 */

const CACHE_NAME = 'md2rich-v1';
const ASSETS_TO_CACHE = [
    './',
    './markdown2html.html',
    './index.css',
    './index.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css',
    'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js'
];

// 安装事件 - 缓存资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('正在缓存资源...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('资源缓存完成');
                return self.skipWaiting();
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('清理旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// 请求拦截 - 优先使用缓存
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then((response) => {
                        // 不缓存非成功响应
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        // 克隆响应用于缓存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
    );
});
