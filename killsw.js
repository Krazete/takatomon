if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    //returns installed service workers
    if (registrations.length) {
      for(let registration of registrations) {
        registration.unregister();
      }
    }
  });
}
