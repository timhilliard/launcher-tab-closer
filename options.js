const urlMatcher = /(https?:\/\/)?/;

/** Saves options to chrome.storage */
function saveOptions() {
  const globalprotect = document.getElementById('globalprotect').checked;
  const globalprotectdelay = Number(document.getElementById('globalprotect-delay').value);
  let globalprotectdomains = document.getElementById('globalprotect-domains').value.trim();
  const zoom = document.getElementById('zoom').checked;
  const zoomdelay = Number(document.getElementById('zoom-delay').value);
  let zoomdomains = document.getElementById('zoom-domains').value.trim();
  const teams = document.getElementById('teams').checked;
  const teamsdelay = Number(document.getElementById('teams-delay').value);
  const autoclose = document.getElementById('autoclose').checked;
  const autoclosedelay = Number(document.getElementById('autoclose-delay').value);
  const statuscontainer = document.getElementById('status');
  chrome.storage.local.set({
    globalprotect: globalprotect,
    globalprotectdelay: globalprotectdelay,
    zoom: zoom,
    zoomdelay: zoomdelay,
    teams: teams,
    teamsdelay: teamsdelay,
    autoclose: autoclose,
    autoclosedelay: autoclosedelay,
  }, function() {
    // Update status to let user know options were saved.
    const status = document.createElement('div');
    status.innerText = 'Options saved.';
    statuscontainer.appendChild(status);
    setTimeout(function() {
      status.remove();
    }, 750);
  });
  const globalprotecterrors = [];
  if (globalprotectdomains == '') {
    globalprotectdomains = [];
  } else {
    globalprotectdomains = globalprotectdomains.split('\n');
    globalprotectdomains.forEach(function(domain) {
      if (!urlMatcher.test(domain)) {
        globalprotecterrors.append('Invalid domain: ' + domain);
      }
    });
  }
  if (globalprotecterrors.length > 0) {
    // print errors, don't save
    const gpstatus = document.createElement('div');
    gpstatus.innerText = globalprotecterrors.join('<br/>');
    statuscontainer.appendChild(gpstatus);
    setTimeout(function() {
      gpstatus.remove();
    }, 750);
  } else {
    // save entries
    chrome.storage.local.set({
      globalprotectdomains: globalprotectdomains,
    }, function() {
      // Update status to let user know options were saved.
      const gpstatus = document.createElement('div');
      gpstatus.innerText = 'Global Protect domains saved.';
      statuscontainer.appendChild(gpstatus);
      setTimeout(function() {
        gpstatus.remove();
      }, 750);
    });
  }

  const zoomerrors = [];
  if (zoomdomains == '') {
    zoomdomains = [];
  } else {
    zoomdomains = zoomdomains.split('\n');
    zoomdomains.forEach(function(domain) {
      if (!urlMatcher.test(domain)) {
        zoomerrors.append('Invalid domain: ' + domain);
      }
    });
  }
  if (zoomerrors.length > 0) {
    // print errors, don't save
    const zoomstatus = document.createElement('div');
    zoomstatus.innerText = zoomerrors.join('<br/>');
    statuscontainer.appendChild(zoomstatus);
    setTimeout(function() {
      zoomstatus.remove();
    }, 750);
  } else {
    // save entries
    chrome.storage.local.set({
      zoomdomains: zoomdomains,
    }, function() {
      // Update status to let user know options were saved.
      const zoomstatus = document.createElement('div');
      zoomstatus.innerText = 'Zoom domains saved.';
      statuscontainer.appendChild(zoomstatus);
      setTimeout(function() {
        zoomstatus.remove();
      }, 750);
    });
  }
}

/** Restores current state from chrome.storage */
function restoreOptions() {
  chrome.storage.local.get({
    globalprotect: true,
    globalprotectdelay: 2,
    globalprotectdomains: [],
    zoom: true,
    zoomdelay: 2,
    zoomdomains: [],
    teams: true,
    teamsdelay: 2,
    autoclose: true,
    autoclosedelay: 2,
  }, function(items) {
    console.debug(items);
    document.getElementById('globalprotect').checked = items.globalprotect;
    document.getElementById('globalprotect-delay').value = items.globalprotectdelay;
    document.getElementById('globalprotect-domains').value = items.globalprotectdomains.join('\n');
    document.getElementById('zoom').checked = items.zoom;
    document.getElementById('zoom-delay').value = items.zoomdelay;
    document.getElementById('zoom-domains').value = items.zoomdomains.join('\n');
    document.getElementById('teams').checked = items.teams;
    document.getElementById('teams-delay').value = items.teamsdelay;
    document.getElementById('autoclose').checked = items.autoclose;
    document.getElementById('autoclose-delay').value = items.autoclosedelay;
  });

  chrome.storage.managed.get({
    globalprotectdomains: [],
    zoomdomains: [],
  }, function(items) {
    console.debug(items);
    document.getElementById('globalprotect-managed-domains').value = items.globalprotectdomains.join('\n');
    document.getElementById('zoom-managed-domains').value = items.zoomdomains.join('\n');
  });

  chrome.storage.managed.get(null, function(items) {
    console.debug(items);
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelectorAll('input,textarea').forEach(function(checkbox) {
  checkbox.addEventListener('change', saveOptions);
});
