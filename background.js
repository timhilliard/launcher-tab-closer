let autoCloseDomainFilters = [
    {hostEquals: 'teams.microsoft.com', pathPrefix: '/dl/launcher/'},
    {hostEquals: 'linkedin.zoom.us', pathPrefix: '/j/'},
    {pathEquals: '/SAML20/SP/ACS'},
]

// sleep time expects milliseconds
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function onError(e) {
    console.error("e", e)
}

function autoCloseHandler(navEvent) {
    // Handle a browser navagiation event
    let newUrl = new URL(navEvent.url)
    console.debug(navEvent)
    console.debug(newUrl)

    // We sleep for a second before closing the tab to let any meta content
    // execute like opening zoom or teams
    sleep(2000).then(() => {
        console.log(`Auto closing tab ${navEvent.url}`)
        let removing = browser.tabs.remove([navEvent.tabId])
        removing.then(undefined, onError)
    })
}

function main() {
    browser.webNavigation.onCompleted.addListener(autoCloseHandler, {url: autoCloseDomainFilters})
}

main()
