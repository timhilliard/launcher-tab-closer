const url_matcher = /(https?:\/\/)?/;

// Saves options to chrome.storage
function save_options() {
  var globalprotect = document.getElementById('globalprotect').checked;
  var globalprotectdelay = Number(document.getElementById('globalprotect-delay').value);
  var globalprotectdomains = document.getElementById('globalprotect-domains').value.trim();
  var zoom = document.getElementById('zoom').checked;
  var zoomdelay = Number(document.getElementById('zoom-delay').value);
  var zoomdomains = document.getElementById('zoom-domains').value.trim();
  var teams = document.getElementById('teams').checked;
  var teamsdelay = Number(document.getElementById('teams-delay').value);
  var statuscontainer = document.getElementById('status');
  chrome.storage.local.set({
    globalprotect: globalprotect,
    globalprotectdelay: globalprotectdelay,
    zoom: zoom,
    zoomdelay: zoomdelay,
    teams: teams,
    teamsdelay: teamsdelay
  }, function () {
    // Update status to let user know options were saved.
    var status = document.createElement('div');
    status.innerText = 'Options saved.';
    statuscontainer.appendChild(status);
    setTimeout(function () {
      status.remove();
    }, 750);
  });
  globalprotecterrors = []
  if (globalprotectdomains == "") {
    globalprotectdomains = [];
  } else {
    globalprotectdomains = globalprotectdomains.split("\n")
    globalprotectdomains.forEach(function (domain) {
      if (!url_matcher.test(domain)) {
        globalprotecterrors.append("Invalid domain: " + domain);
      }
    });
  }
  if (globalprotecterrors.length > 0) {
    // print errors, don't save
    var status = document.createElement('div');
    status.innerText = globalprotecterrors.join("<br/>");
    statuscontainer.appendChild(status);
    setTimeout(function () {
      status.remove();
    }, 750);
  } else {
    // save entries
    chrome.storage.local.set({
      globalprotectdomains: globalprotectdomains
    }, function () {
      // Update status to let user know options were saved.
      var status = document.createElement('div');
      status.innerText = 'Global Protect domains saved.';
      statuscontainer.appendChild(status);
      setTimeout(function () {
        status.remove();
      }, 750);
    });
  }

  zoomerrors = []
  if (zoomdomains == "") {
    zoomdomains = [];
  } else {
    zoomdomains = zoomdomains.split("\n")
    zoomdomains.forEach(function (domain) {
      if (!url_matcher.test(domain)) {
        zoomerrors.append("Invalid domain: " + domain);
      }
    });
  }
  if (zoomerrors.length > 0) {
    // print errors, don't save
    var status = document.createElement('div');
    status.innerText = zoomerrors.join("<br/>");
    statuscontainer.appendChild(status);
    setTimeout(function () {
      status.remove();
    }, 750);
  } else {
    // save entries
    chrome.storage.local.set({
      zoomdomains: zoomdomains
    }, function () {
      // Update status to let user know options were saved.
      var status = document.createElement('div');
      status.innerText = 'Zoom domains saved.';
      statuscontainer.appendChild(status);
      setTimeout(function () {
        status.remove();
      }, 750);
    });
  }
}

// Restores current state from chrome.storage
function restore_options() {
  chrome.storage.local.get({
    globalprotect: true,
    globalprotectdelay: 2,
    globalprotectdomains: [],
    zoom: true,
    zoomdelay: 2,
    zoomdomains: [],
    teams: true,
    teamsdelay: 2
  }, function (items) {
    console.debug(items)
    document.getElementById('globalprotect').checked = items.globalprotect;
    document.getElementById('globalprotect-delay').value = items.globalprotectdelay;
    document.getElementById('globalprotect-domains').value = items.globalprotectdomains.join("\n");
    document.getElementById('zoom').checked = items.zoom;
    document.getElementById('zoom-delay').value = items.zoomdelay;
    document.getElementById('zoom-domains').value = items.zoomdomains.join("\n");
    document.getElementById('teams').checked = items.teams;
    document.getElementById('teams-delay').value = items.teamsdelay;
  });

  chrome.storage.managed.get({
    globalprotectdomains: [],
    zoomdomains: []
  }, function (items) {
    console.debug(items);
    document.getElementById('globalprotect-managed-domains').value = items.globalprotectdomains.join("\n");
    document.getElementById('zoom-managed-domains').value = items.zoomdomains.join("\n");
  });

  chrome.storage.managed.get(null, function (items) {
    console.debug(items);
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelectorAll("input,textarea").forEach(function (checkbox) {
  checkbox.addEventListener('change', save_options);
});