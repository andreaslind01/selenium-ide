import { app } from 'electron'
import store from './store'
import createSession from './session'

// Enable local debugging
app.commandLine.appendSwitch('remote-debugging-port', '8315')

app.on('ready', () => createSession(app, store))

let allWindowsClosed = false
// Respect the OSX convention of having the application in memory even
// after all windows have been closed
app.on('window-all-closed', () => {
  allWindowsClosed = true
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Getting things in a row so that re-activating an app with no windows
// on Darwin recreates the main window again
app.on('activate', async () => {
  if (allWindowsClosed) {
    allWindowsClosed = false
    await createSession(app, store)
  }
})