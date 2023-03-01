// Saves options to chrome.storage
function save_options() {
    var globalprotect = document.getElementById('globalprotect').checked;
    var globalprotectdelay = Number(document.getElementById('globalprotect-delay').value);
    var zoom = document.getElementById('zoom').checked;
    var zoomdelay = Number(document.getElementById('zoom-delay').value);
    var teams = document.getElementById('teams').checked;
    var teamsdelay = Number(document.getElementById('teams-delay').value);
    chrome.storage.local.set({
      globalprotect: globalprotect,
      globalprotectdelay: globalprotectdelay,
      zoom: zoom,
      zoomdelay: zoomdelay,
      teams: teams,
      teamsdelay: teamsdelay
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores current state from chrome.storage
  function restore_options() {
    chrome.storage.local.get({
      globalprotect: true,
      globalprotectdelay: 2,
      zoom: true,
      zoomdelay: 2,
      teams: true,
      teamsdelay: 2
    }, function(items) {
      console.debug(items)
      document.getElementById('globalprotect').checked = items.globalprotect;
      document.getElementById('globalprotect-delay').value = items.globalprotectdelay;
      document.getElementById('zoom').checked = items.zoom;
      document.getElementById('zoom-delay').value = items.zoomdelay;
      document.getElementById('teams').checked = items.teams;
      document.getElementById('teams-delay').value = items.teamsdelay;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.querySelectorAll("input").forEach(function(checkbox) {
    checkbox.addEventListener('change', save_options);
  });