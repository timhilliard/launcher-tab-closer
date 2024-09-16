const filter = {
  url: [
    {hostEquals: 'teams.microsoft.com', pathPrefix: '/dl/launcher/'},
    {hostSuffix: '.zoom.us', pathPrefix: '/j/'},
    {pathEquals: '/SAML20/SP/ACS'},
    {pathSuffix: '/auto-close'},
  ],
};

const configs = {
  teams: {
    enabled: true,
    delay: 2,
  },
  zoom: {
    enabled: true,
    delay: 2,
    user_domains: [],
    user_domains_loaded: false,
    managed_domains: [],
    managed_domains_loaded: false,
    domains: new Set(),
  },
  globalprotect: {
    enabled: true,
    delay: 2,
    user_domains: [],
    user_domains_loaded: false,
    managed_domains: [],
    managed_domains_loaded: false,
    domains: new Set(),
  },
  autoclose: {
    enabled: true,
    delay: 2,
  },
};

/**
 * Validate if a domain matches any of the set of rules
 * @param {string} domain - The domain to match against
 * @param {set} rules - The rules to match the domain against
 * @return {bool}
 */
function validateDomain(domain, rules) {
  for (const rule of rules) {
    if (rule.startsWith('*')) {
      if (domain.endsWith(rule.substring(1))) {
        console.debug(`Domain ${domain} matches rule ${rule}`);
        return true;
      }
    } else {
      if (domain == rule) {
        console.debug(`Domain ${domain} matches rule ${rule}`);
        return true;
      }
    }
  }
  console.debug(`Domain ${domain} does not match any of the rules: ${Array.from(rules)}`);
  return false;
}

/**
 * Joins user defined and managed domains
 */
function calculateDomains() {
  configs.zoom.domains = calculateDomain(
      configs.zoom.user_domains,
      configs.zoom.managed_domains,
  );
  console.debug('Zoom configs loaded');

  configs.globalprotect.domains = calculateDomain(
      configs.globalprotect.user_domains,
      configs.globalprotect.managed_domains,
  );
  console.debug('Global Protect configs loaded');
}

/**
 * Helper function to union a set of domain rules
 * @param {set} userDomains - domain rules
 * @param {set} managedDomains - domain rules
 * @return {set} domain rules
 */
function calculateDomain(userDomains, managedDomains) {
  const _union = new Set(userDomains);
  for (const domain of managedDomains) {
    _union.add(domain);
  }
  return _union;
}

/** Regenerate the config */
async function reloadConfig() {
  const localLoaded = chrome.storage.local.get({
    teams: true,
    teamsdelay: 2,
    zoom: true,
    zoomdelay: 2,
    zoomdomains: [],
    globalprotect: true,
    globalprotectdelay: 2,
    globalprotectdomains: [],
    autoclose: true,
    autoclosedelay: 2,
  }).then((items) => {
    configs.teams.enabled = items.teams;
    configs.teams.delay = items.teamsdelay;
    configs.zoom.enabled = items.zoom;
    configs.zoom.delay = items.zoomdelay;
    configs.zoom.user_domains = items.zoomdomains;
    configs.globalprotect.enabled = items.globalprotect;
    configs.globalprotect.delay = items.globalprotectdelay;
    configs.globalprotect.user_domains = items.globalprotectdomains;
    configs.autoclose.enabled = items.autoclose;
    configs.autoclose.delay = items.autoclosedelay;
    console.debug('Local config loaded');
  });

  const managedLoaded = chrome.storage.managed.get({
    zoomdomains: [],
    globalprotectdomains: [],
  }).then((items) => {
    configs.zoom.managed_domains = items.zoomdomains;
    configs.globalprotect.managed_domains = items.globalprotectdomains;
    console.debug('Managed config loaded');
  });
  await localLoaded;
  await managedLoaded;
  calculateDomains();
  console.debug('Reloaded config');
  console.debug(configs);
}

/**
 * Set a tab to close with a certain delay
 * @param {int} delay - in seconds to wait before closing
 * @param {string} tabType - helper string to identify where close came from
 * @param {object} tab - tab object to close
 * @return {Promise}
 */
async function closeTab(delay, tabType, tab) {
  console.debug(`Auto closing ${tabType} tab ${tab.url} in ${delay} seconds`);
  return new Promise((resolve) => setTimeout(resolve, delay * 1000)).then(() => {
    console.log(`Auto closing ${tabType} tab ${tab.url}`);
    chrome.tabs.remove([tab.tabId]);
  });
}

/** Regenerate the config when extension is installed */
chrome.runtime.onInstalled.addListener(function() {
  console.debug('chrome.runtime.onInstalled fired, reloading config');
  // Initialize configs
  reloadConfig();
});

/** Regenerate the config when the user defined or managed config changes */
chrome.storage.onChanged.addListener(function() {
  console.debug('chrome.storage.onChanged fired, reloading config');
  reloadConfig();
});

/** Main listener for new tabs to take action on */
chrome.webNavigation.onCompleted.addListener(async (tab) => {
  if (tab.frameId === 0) {
    // Make sure configs are loaded before running
    try {
      console.debug('Waiting for config to load');
      await initConfig;
      console.debug('Config loaded');
    } catch (e) {
      // Error loading configs. Skipping execution
      console.error(`Unable to load configs: ${e}`);
    }

    console.debug(tab);
    console.debug(configs);

    const url = new URL(tab.url);

    if (configs.teams.enabled && url.hostname == 'teams.microsoft.com') {
      await closeTab(configs.teams.delay, 'teams', tab);
    } else if (configs.zoom.enabled && url.hostname.endsWith('.zoom.us')) {
      console.debug(`Processing zoom url ${tab.url}`);
      if (configs.zoom.domains.size > 0) {
        if (!validateDomain(url.hostname, configs.zoom.domains)) {
          console.debug('Domain does not match config, skipping...');
        } else {
          await closeTab(configs.zoom.delay, 'zoom', tab);
        }
      } else {
        console.debug('No config detected for zoom, skipping...');
      }
    } else if (configs.globalprotect.enabled && url.pathname == '/SAML20/SP/ACS') {
      if (configs.globalprotect.domains.size > 0) {
        if (!validateDomain(url.hostname, configs.globalprotect.domains)) {
          console.debug('Domain does not match config, skipping...');
        } else {
          await closeTab(configs.globalprotect.delay, 'global protect', tab);
        }
      } else {
        console.debug('No config detected for global protect, skipping...');
      }
    } else if (configs.autoclose.enabled && url.pathname.endsWith('/auto-close')) {
      await closeTab(configs.autoclose.delay, 'autoclose', tab);
    }
  }
}, filter);

// Initialize configs
console.debug('Initializing config');
const initConfig = reloadConfig();

/** Open the options page if the icon is clicked */
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
