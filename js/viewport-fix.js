if (window.self !== window.top) {
  const metaViewport = document.createElement('meta');
  metaViewport.name = 'viewport';
  metaViewport.content = 'width=device-width, initial-scale=1.0';
  document.head.appendChild(metaViewport);
}