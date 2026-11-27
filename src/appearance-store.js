const legacyKey = 'pylab.appearance.v1'

function legacySettings() {
  try {return JSON.parse(localStorage.getItem(legacyKey))} catch {return null}
}

export async function openAppearanceStore() {
  let db
  try {
    db = await new Promise((resolve,reject) => {
      const request = indexedDB.open('pylab.appearance',1)
      request.onupgradeneeded = () => request.result.createObjectStore('preferences')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return {
      read: legacySettings,
      async write(settings) {
        if (settings.video) throw Error('Trình duyệt đang chặn bộ nhớ lưu video. Hãy cho phép dữ liệu trang rồi thử lại.')
        localStorage.setItem(legacyKey,JSON.stringify(settings))
      }
    }
  }
  db.onversionchange = () => db.close()
  return {
    read() {
      return new Promise((resolve,reject) => {
        const request = db.transaction('preferences').objectStore('preferences').get('appearance')
        request.onsuccess = () => resolve(request.result ?? legacySettings())
        request.onerror = () => reject(request.error)
      })
    },
    async write(settings) {
      // One transaction keeps the selected media and its controls consistent on quota errors.
      await new Promise((resolve,reject) => {
        const tx = db.transaction('preferences','readwrite')
        tx.oncomplete = resolve
        tx.onabort = () => reject(tx.error || Error('Không lưu được giao diện.'))
        tx.objectStore('preferences').put(settings,'appearance')
      })
      try {localStorage.removeItem(legacyKey)} catch {}
    }
  }
}
