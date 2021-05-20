function initJSONPCallback() {
  const cbStore = {}
  return {
    run: function (callbackId, data, errMsg) {
      if (errMsg != null && errMsg !== '') {
        cbStore[callbackId].reject(new Error(errMsg))
      }
      try {
        cbStore[callbackId].resolve(data)
      } finally {
        delete cbStore[callbackId]
      }
    },
    set: function (callbackId, resolve, reject) {
      cbStore[callbackId] = {
        resolve,
        reject
      }
    }
  }
}

// Set callback function
const JSONPCallback = initJSONPCallback()
window.JSONPCb = JSONPCallback.run

// eslint-disable-next-line no-unused-vars
function request(method = 'GET', url, data = null) {
  return new Promise((resolve, reject) => {
    const callbackId = (Math.floor(Math.random() * 10000) + 1).toString()
    if (method === 'GET' && data != null) {
      url +=
        '?' +
        // eslint-disable-next-line no-undef
        serializedParams(
          Object.assign({}, data, {
            callbackFn: 'JSONPCb',
            callbackId
          })
        )
    }
    // Create script tag
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url
    script.onerror = function (error) {
      reject(error)
    }
    // Set callback function
    JSONPCallback.set(callbackId, resolve, reject)
    // In actual use, the script tag needs to be removed after the request.
    document.body.appendChild(script)
  })
}