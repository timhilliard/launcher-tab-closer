const filter = {
    url: [
        { hostEquals: 'teams.microsoft.com', pathPrefix: '/dl/launcher/' },
        { hostSuffix: '.zoom.us', pathPrefix: '/j/' },
        { pathEquals: '/SAML20/SP/ACS' },
    ],
};

var configs = {
    teams: {
        enabled: true,
        delay: 2
    },
    zoom: {
        enabled: true,
        delay: 2,
        user_domains: [],
        managed_domains: [],
        domains: new Set()
    },
    globalprotect: {
        enabled: true,
        delay: 2,
        user_domains: [],
        managed_domains: [],
        domains: new Set()
    }
};

// sleep time expects seconds
function sleep(time) {
    // Convert sleep time in seconds to milliseconds for use in setTimeout
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
}

function validate_domain(domain, rules) {
    for (const rule of rules) {
        if (rule.startsWith("*")) {
            if (domain.endsWith(rule.substring(1))) {
                console.debug("Domain " + domain + " matches rule " + rule);
                return true;
            }
        } else {
            if (domain == rule) {
                console.debug("Domain " + domain + " matches rule " + rule);
                return true;
            }
        }
    }
    console.debug("Domain " + domain + " does not match any of the rules: " + rules);
    return false;
};

function calculate_domains() {
    configs.zoom.domains = calculate_domain(configs.zoom.user_domains, configs.zoom.managed_domains);
    configs.globalprotect.domains = calculate_domain(configs.globalprotect.user_domains, configs.globalprotect.managed_domains);
}

function calculate_domain(user_domains, managed_domains) {
    const _union = new Set(user_domains);
    for (const domain of managed_domains) {
        _union.add(domain);
    }
    return _union;
}

function reload_config() {
    chrome.storage.local.get({
        teams: true,
        teamsdelay: 2,
        zoom: true,
        zoomdelay: 2,
        zoomdomains: [],
        globalprotect: true,
        globalprotectdelay: 2,
        globalprotectdomains: []
    }, function (items) {
        configs.teams.enabled = items.teams
        configs.teams.delay = items.teamsdelay
        configs.zoom.enabled = items.zoom
        configs.zoom.delay = items.zoomdelay
        configs.zoom.user_domains = items.zoomdomains
        configs.globalprotect.enabled = items.globalprotect
        configs.globalprotect.delay = items.globalprotectdelay
        configs.globalprotect.user_domains = items.globalprotectdomains
        calculate_domains();
    });

    chrome.storage.managed.get({
        zoomdomains: [],
        globalprotectdomains: []
    }, function (items) {
        configs.zoom.managed_domains = items.zoomdomains
        configs.globalprotect.managed_domains = items.globalprotectdomains
        calculate_domains();
    });
    console.debug("Reloaded config");
    console.debug(configs);
}

chrome.runtime.onInstalled.addListener(function () {
    console.debug("chrome.runtime.onInstalled fired, reloading config");
    // Initialize configs
    reload_config();
});

// Start observing policy changes.
chrome.storage.onChanged.addListener(function () {
    console.debug("chrome.storage.onChanged fired, reloading config");
    reload_config();
});

chrome.webNavigation.onCompleted.addListener((tab) => {
    if (tab.frameId === 0) {
        // Handle a browser navigation event
        console.debug(tab)
        console.debug(configs)

        url = new URL(tab.url)

        if (configs.teams.enabled && url.hostname == "teams.microsoft.com") {
            console.debug(`Auto closing teams tab ${tab.url} in ${configs.teams.delay} seconds`)
            sleep(configs.teams.delay).then(() => {
                console.log(`Auto closing teams tab ${tab.url}`)
                chrome.tabs.remove([tab.tabId])
            })
        } else if (configs.zoom.enabled && url.hostname.endsWith(".zoom.us")) {
            if (configs.zoom.domains.length > 0) {
                if (!validate_domain(url.hostname, configs.zoom.domains)) {
                    console.debug("Domain does not match config, skipping...")
                    return;
                }
            }
            console.debug(`Auto closing zoom tab ${tab.url} in ${configs.zoom.delay} seconds`)
            sleep(configs.zoom.delay).then(() => {
                console.log(`Auto closing zoom tab ${tab.url}`)
                chrome.tabs.remove([tab.tabId])
            })
        } else if (configs.globalprotect.enabled && url.pathname == "/SAML20/SP/ACS") {
            if (configs.globalprotect.domains.length > 0) {
                if (!validate_domain(url.hostname, configs.globalprotect.domains)) {
                    console.debug("Domain does not match config, skipping...")
                    return;
                }
            }
            console.debug(`Auto closing global protect tab ${tab.url} in ${configs.globalprotect.delay} seconds`)
            sleep(configs.globalprotect.delay).then(() => {
                console.log(`Auto closing global protect tab ${tab.url}`)
                chrome.tabs.remove([tab.tabId])
            })
        }
    }
}, filter);

// Initialize configs
reload_config();
