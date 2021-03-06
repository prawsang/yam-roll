const convertedVapidKey = urlBase64ToUint8Array(process.env.REACT_APP_PUBLIC_VAPID_KEY)

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4)
  // eslint-disable-next-line
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function sendSubscription(subscription, title, body) {
  return fetch(`${process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : process.env.REACT_APP_LOCALHOST_API_URL}/notifications/subscribe`, {
    method: 'POST',
    body: JSON.stringify({
      subscription,
      title,
      body
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function subscribeUser(title, body) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(registration) {
      if (!registration.pushManager) {
        console.log('Push manager unavailable.')
        return
      }

      registration.pushManager.getSubscription().then(function(existedSubscription) {
        if (existedSubscription === null) {
          console.log('No subscription detected, make a request.')
          registration.pushManager.subscribe({
            applicationServerKey: convertedVapidKey,
            userVisibleOnly: true,
          })
          .then(function(newSubscription) {
            // console.log('New subscription added.')
            sendSubscription(newSubscription, "Yam Roll", "Thank You for Allowing Notifications.")
          })
          // .catch(function(e) {
          //   if (Notification.permission !== 'granted') {
          //     console.log('Permission was not granted.')
          //   } else {
          //     console.error('An error ocurred during the subscription process.', e)
          //   }
          // })
        } 
        else {
          // console.log('Existed subscription detected.')
          if (title && body) {
            sendSubscription(existedSubscription, title, body)
          }
        }
      })
    })
      // .catch(function(e) {
      //   console.error('An error ocurred during Service Worker registration.', e)
      // })
  }
}