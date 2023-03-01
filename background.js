const filter = {
    url: [
        {hostEquals: 'teams.microsoft.com', pathPrefix: '/dl/launcher/'},
        {hostSuffix: '.zoom.us', pathPrefix: '/j/'},
        {pathEquals: '/SAML20/SP/ACS'},
    ],
};

// sleep time expects seconds
function sleep (time) {
    // Convert sleep time in seconds to milliseconds for use in setTimeout
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}

chrome.webNavigation.onCompleted.addListener((tab) => {
    if (tab.frameId === 0) {
        // Handle a browser navigation event
        console.debug(tab)

        url = new URL(tab.url)

        if (url.hostname == "teams.microsoft.com") {
            chrome.storage.local.get({
                teams: true,
                teamsdelay: 2
            }, function(items) {
                console.debug(items)
                if (items.teams) {
                    console.debug(`Auto closing teams tab ${tab.url} in ${items.teamsdelay} seconds`)
                    sleep(items.teamsdelay).then(() => {
                        console.log(`Auto closing teams tab ${tab.url}`)
                        chrome.tabs.remove([tab.tabId])
                    })
                } else {
                    console.debug(`Not closing teams tab ${tab.url}`)
                }
            });
        } else if (url.hostname.endsWith(".zoom.us")) {
            chrome.storage.local.get({
                zoom: true,
                zoomdelay: 2
            }, function(items) {
                console.debug(items)
                if (items.zoom) {
                    console.debug(`Auto closing zoom tab ${tab.url} in ${items.zoomdelay} seconds`)
                    sleep(items.zoomdelay).then(() => {
                        console.log(`Auto closing zoom tab ${tab.url}`)
                        chrome.tabs.remove([tab.tabId])
                    })
                } else {
                    console.debug(`Not closing zoom tab ${tab.url}`)
                }
            });
        } else if (url.pathname == "/SAML20/SP/ACS") {
            chrome.storage.local.get({
                globalprotect: true,
                globalprotectdelay: 2
            }, function(items) {
                console.debug(items)
                if (items.globalprotect) {
                    console.debug(`Auto closing global protect tab ${tab.url} in ${items.globalprotectdelay} seconds`)
                    sleep(items.globalprotectdelay).then(() => {
                        console.log(`Auto closing global protect tab ${tab.url}`)
                        chrome.tabs.remove([tab.tabId])
                    })
                } else {
                    console.debug(`Not closing global protect tab ${tab.url}`)
                }
            });
        }
    }
}, filter);
