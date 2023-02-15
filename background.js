const filter = {
    url: [
        {hostEquals: 'teams.microsoft.com', pathPrefix: '/dl/launcher/'},
        {hostSuffix: '.zoom.us', pathPrefix: '/j/'},
        {pathEquals: '/SAML20/SP/ACS'},
    ],
};

chrome.webNavigation.onCompleted.addListener((tab) => {
    // Handle a browser navagiation event
    let newUrl = new URL(tab.url)
    console.debug(tab)
    console.debug(newUrl)

    // sleep time expects milliseconds
    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    // We sleep for a second before closing the tab to let any meta content
    // execute like opening zoom or teams
    sleep(2000).then(() => {
        console.log(`Auto closing tab ${tab.url}`)
        chrome.tabs.remove([tab.tabId])
    })
}, filter);
