const refreshSign = document.querySelector("#refresh-sign");
const loadingFeed = document.querySelector("#loading-feed");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("button");

usernameInput.value = localStorage.getItem("labLoginUsername") ?? "";
passwordInput.value = localStorage.getItem("labLoginPassword") ?? "";

console.log("hi");

async function handleSubmit() {
  if (submitButton.disabled) {
    return;
  }

  usernameInput.value = usernameInput.value.trim();

  const username = usernameInput.value;
  const password = passwordInput.value;

  localStorage.setItem("labLoginUsername", username);
  localStorage.setItem("labLoginPassword", password);

  if (!username || !password) {
    alert("Please fill in both fields");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Logging in...";

  loadingFeed.style.display = "block";
  const response = await fetch("https://maemoon-lablogin.web.val.run", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const json = await response.json();

  if (json.error) {
    submitButton.disabled = false;
    submitButton.textContent = "Login";
    alert(json.error);
  } else {
    const header = document.querySelector("header");
    const h1 = document.querySelector("h1");
    h1.textContent = `Welcome back, `;
    const namey = document.createElement("span");
    // <span class="name-${username}">${username}</span>!`;
    namey.textContent = username;
    namey.className = `name-${username}`;
    h1.appendChild(namey);
    h1.append("!");
    let html = `
      <label>Status</label>
      <input type="text" id="status" name="status" autocomplete="off" />
      <button id="update-status" class="primary">Update status</button>
      <button id="update-gif">Update status with GIF</button>
      <dialog id="gif-dialog">
        <form method="dialog">
          <header>
            Pick a GIF
            <button type="submit" value="" class="close-button" autofocus>Close</button>
          </header>
          <button class="gif" value="tode" title="Tode"><img src="https://github.com/TodePond/TodePondDotCom/blob/main/image/tode.gif" alt="Tode" /></button>
          <button class="gif" value="berd" title="Berd"><img src="https://github.com/TodePond/TodePondDotCom/blob/main/image/berd.gif" alt="Berd" /></button>
          <button class="gif" value="bot" title="Bot"><img src="https://github.com/TodePond/TodePondDotCom/blob/main/image/bot.gif" alt="Bot" /></button>
        </form>
      </dialog>
      <br /><br />
      <span class="account-dashboard">
        <span class="account-actions">
          <button onclick="location.href = '/lab/login/?logout';" class="">Switch account</button>
          <button id="delete-account" class="danger">Delete account</button>
        </span>
    `;

    const loginAutomatically =
      localStorage.getItem("labLoginAutoLogin") !== "false";
    // if (username === "TodePond") {
    html += `
      <span class="account-settings">
          <label for="logged-in-toggle">
            Login automatically
            <input type="checkbox" id="logged-in-toggle" name="logged-in-toggle" ${
              loginAutomatically ? "checked" : ""
            } />
          </label>
        ${
          username === "Mae"
            ? `
              <label for="admin-toggle">
                Admin controls
                <input type="checkbox" id="admin-toggle" name="admin-toggle" />
              </label>
            `
            : ""
        }
      </span>
    </span>
    `;
    header.innerHTML = html;
    const loggedInToggle = document.querySelector("#logged-in-toggle");
    loggedInToggle.addEventListener("change", () => {
      localStorage.setItem("labLoginAutoLogin", loggedInToggle.checked);
    });
    const adminToggleEnabled =
      localStorage.getItem("labLoginAdmin") === "true";
    const adminToggle = document.querySelector("#admin-toggle");
    if (adminToggle) {
      adminToggle.checked = adminToggleEnabled;
      adminToggle.addEventListener("change", () => {
        localStorage.setItem("labLoginAdmin", adminToggle.checked);
        const actionses = document.querySelectorAll(".actions");
        actionses.forEach(
          (v) =>
            (v.style.display = adminToggle.checked ? "inline-block" : "none")
        );
      });
    }
    // }
    const deleteAccountButton = document.querySelector("#delete-account");
    deleteAccountButton.addEventListener("click", async () => {
      const confirmDelete = confirm(
        "Are you sure you want to delete your account?"
      );
      if (!confirmDelete) {
        return;
      }
      loadingFeed.style.display = "block";
      const response = await fetch(
        "https://maemoon-lablogindeleteaccount.web.val.run",
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
        }
      );
      const json = await response.json();
      loadingFeed.style.display = "none";
      if (json.error) {
        alert(json.error);
      } else {
        localStorage.removeItem("labLoginUsername");
        localStorage.removeItem("labLoginPassword");
        location.href = "/lab/login/?delete";
      }
    });
    const statusInput = document.querySelector("#status");
    statusInput.value = json[3];
    const updateStatusButton = document.querySelector("#update-status");
    updateStatusButton.addEventListener("click", () =>
      handleUpdateStatus({ username, password })
    );
    statusInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleUpdateStatus({ username, password });
      }
    });
    const gifDialog = document.querySelector("#gif-dialog");
    document.querySelector("#update-gif").addEventListener("click", () => {
      gifDialog.show();
    });
    gifDialog.addEventListener("close", () => {
      const gif = gifDialog.returnValue;
      if (!gif) return; // close button clicked
      handleUpdateStatus({ username, password, gif });
    });
  }

  await pullUserStatuses();
  loadingFeed.style.display = "none";
}

async function handleUpdateStatus({ username, password, gif = null }) {
  const button = document.querySelector("#update-status");
  if (button.disabled) {
    return;
  }
  button.disabled = true;
  loadingFeed.style.display = "block";
  // button.textContent = "Updating status...";
  const statusInput = document.querySelector("#status");
  const status = statusInput.value;
  if (!status) {
    alert("Please fill in the status field");
    return;
  }

  const response = await fetch(
    "https://maemoon-labloginupdatestatus.web.val.run",
    {
      method: "POST",
      body: JSON.stringify({ status, username, password, gif }),
    }
  );

  if (response.error) {
    button.disabled = false;
    button.textContent = "Update status";
    alert(response.error);
    return;
  }

  button.disabled = false;
  button.textContent = "Update status";
  loadingFeed.style.display = "block";
  await pullUserStatuses();
  loadingFeed.style.display = "none";
}

function handleInputKeyDown(event) {
  if (event.key === "Enter") {
    handleSubmit();
  }
}

submitButton.addEventListener("click", handleSubmit);
usernameInput.addEventListener("keydown", handleInputKeyDown);
passwordInput.addEventListener("keydown", handleInputKeyDown);
refreshSign.addEventListener("click", toggleRefresh);

let nameSet = new Set();

let refreshTimeout;
let secondsLeft = 9;
async function pullUserStatuses() {
  refreshSign.textContent = "Refreshing...";
  secondsLeft = 9;
  if (refreshTimeout !== undefined) {
    clearTimeout(refreshTimeout);
  }
  // https://todepond-lablogingetusers.web.val.run
  const response = await fetch(
    "https://maemoon-lablogingetusers.web.val.run"
  );

  const entries = [];

  const json = await response.json();
  for (const user of json) {
    const [status, username, timestamp, gif] = user;
    const isGifValid = /^(tode|berd|bot)$/.test(gif);
    entries.push({
      status,
      username,
      timestamp: new Date(timestamp),
      gif: isGifValid ? gif : undefined,
    });
  }

  const sortedEntries = entries.sort((a, b) => b.timestamp - a.timestamp);

  renderUserStatuses(sortedEntries);

  localStorage.setItem("labLoginUserStatuses", JSON.stringify(sortedEntries));

  const rawUsers = localStorage.getItem("labLoginUserStatuses") ?? "[]";
  let users = [];
  try {
    users = JSON.parse(rawUsers);
  } catch (e) {
    users = [];
  }
  const usernames = users.map((v) => v.username);
  nameSet = new Set(usernames);

  const localRefreshStatus = getLocalRefreshStatus();
  if (localRefreshStatus) {
    refreshSign.textContent = "Auto-refreshing in " + secondsLeft;
    refreshTimeout = setTimeout(handleTimer, 1000);
  } else {
    refreshSign.textContent = "Auto-refresh paused";
  }
}

async function handleTimer() {
  secondsLeft--;
  if (secondsLeft === 0) {
    secondsLeft = 9;
    await pullUserStatuses();
    return;
  }

  refreshSign.textContent = "Auto-refreshing in " + secondsLeft;
  if (refreshTimeout !== undefined) {
    clearTimeout(refreshTimeout);
  }

  refreshTimeout = setTimeout(handleTimer, 1000);
}

function setRefreshStatus(on) {
  if (on) {
    setLocalRefreshStatus(true);
    refreshSign.textContent = "Auto-refreshing in " + secondsLeft;
    if (!getRefreshStatus()) {
      refreshTimeout = setTimeout(handleTimer, 1000);
    }
  } else {
    setLocalRefreshStatus(false);
    refreshSign.textContent = "Auto-refresh paused";
    if (getRefreshStatus()) {
      clearTimeout(refreshTimeout);
      refreshTimeout = undefined;
    }
  }
}

function getRefreshStatus() {
  return refreshTimeout !== undefined;
}

function getLocalRefreshStatus() {
  return localStorage.getItem("labLoginAutoRefresh") !== "false";
}

function setLocalRefreshStatus(on) {
  if (on) {
    localStorage.setItem("labLoginAutoRefresh", "true");
  } else {
    localStorage.setItem("labLoginAutoRefresh", "false");
  }
}

function toggleRefresh() {
  const status = getRefreshStatus();
  setRefreshStatus(!status);
}

if (!getLocalRefreshStatus()) {
  setRefreshStatus(false);
}

function renderUserStatuses(entries) {
  const currentHash = window.location.hash;
  const main = document.querySelector("main");
  const statuses = document.querySelectorAll(".status");
  let s = 0;
  let e = 0;

  const actionses = document.querySelectorAll(".actions");
  actionses.forEach((v) => (v.innerHTML = ""));
  const userActionses = document.querySelectorAll(".user-actions");
  userActionses.forEach((v) => (v.innerHTML = ""));

  while (e < entries.length) {
    const entry = entries[e];
    const status = statuses[s];
    if (!status) {
      break;
    }
    status.className = "post-" + entry.username;
    status.classList.add("status");
    const strong = status.querySelector("strong");
    status.id = "post-" + entry.username;
    strong.className = "name-" + entry.username;
    strong.textContent = entry.username;
    const h3 = status.querySelector("h3");
    h3.className = "title-" + entry.username;
    h3.classList.add("post-title");

    const span = status.querySelector("span");
    span.innerHTML = getHtmlFromMarkdown(entry.status);
    if (entry.username === "TodePond") {
      // protip: log from individual user
      // console.log(entry.status);
    }
    span.className = "status-" + entry.username;

    const img = status.querySelector("img.gif");
    img.src = entry.gif ? `https://raw.githubusercontent.com/TodePond/TodePondDotCom/refs/heads/main/image/${entry.gif}.gif` : "";
    img.style.display = entry.gif ? "block" : "none";

    addUserActions({
      userActionsElement: status.querySelector(".user-actions"),
      username: entry.username,
      loggedInUsername: usernameInput.value,
      loggedInPassword: passwordInput.value,
    });
    maybeAddActions({
      actionsElement: status.querySelector(".actions"),
      password: passwordInput.value,
      admin: usernameInput.value,
      entry,
    });
    const actions = status.querySelector(".actions");
    actions.style.display =
      localStorage.getItem("labLoginAdmin") === "true"
        ? "inline-block"
        : "none";
    s++;
    e++;
  }

  while (s < statuses.length) {
    statuses[s].remove();
    s++;
  }

  // main.innerHTML = "";

  while (e < entries.length) {
    const entry = entries[e];
    const p = document.createElement("p");
    p.className = "post-" + entry.username;
    p.classList.add("status");
    const strong = document.createElement("strong");
    strong.textContent = entry.username;
    strong.className = "name-" + entry.username;
    p.id = "post-" + entry.username;
    const h3 = document.createElement("h3");
    h3.className = "title-" + entry.username;
    h3.classList.add("post-title");
    p.appendChild(h3);
    h3.appendChild(strong);
    const br = document.createElement("br");
    p.appendChild(br);
    const span = document.createElement("span");
    span.className = "status-" + entry.username;
    span.innerHTML = getHtmlFromMarkdown(entry.status);
    span.style.maxHeight = "90px";
    span.style.overflowY = "auto";
    // should wrap long words
    span.style.wordWrap = "break-word";
    span.style.display = "block";
    p.appendChild(span);
    const img = document.createElement("img");
    img.className = "gif";
    img.src = entry.gif ? `https://raw.githubusercontent.com/TodePond/TodePondDotCom/refs/heads/main/image/${entry.gif}.gif` : "";
    img.style.display = entry.gif ? "block" : "none";
    p.appendChild(img);
    const div = document.createElement("div");
    div.classList.add("actions");
    maybeAddActions({
      actionsElement: div,
      password: passwordInput.value,
      admin: usernameInput.value,
      entry,
    });
    const userActions = document.createElement("div");
    userActions.classList.add("user-actions");
    p.appendChild(userActions);

    addUserActions({
      userActionsElement: userActions,
      username: entry.username,
      loggedInUsername: usernameInput.value,
      loggedInPassword: passwordInput.value,
    });

    div.style.display =
      localStorage.getItem("labLoginAdmin") === "true"
        ? "inline-block"
        : "none";
    p.appendChild(div);
    main.appendChild(p);
    e++;
  }

  // return to hash
  if (currentHash) {
    window.location.hash = currentHash;
  }
}

function maybeAddActions({ actionsElement, password, admin, entry }) {
  const enabled = localStorage.getItem("labLoginAdmin") === "true";
  if (admin === "TodePond") {
    const kickNameButton = document.createElement("button");
    kickNameButton.classList.add("action-button");
    // banButton.className = "danger";
    kickNameButton.textContent = "Kick name";
    kickNameButton.addEventListener("click", () =>
      handleModeration({
        username: entry.username,
        password,
        admin,
        type: "kick",
        target: "name",
      })
    );
    const kickStatusButton = document.createElement("button");
    // banButton.className = "danger";
    kickStatusButton.textContent = "Kick status";
    kickStatusButton.classList.add("action-button");
    kickStatusButton.addEventListener("click", () =>
      handleModeration({
        username: entry.username,
        password,
        admin,
        type: "kick",
        target: "status",
      })
    );
    const banNameButton = document.createElement("button");
    banNameButton.className = "danger";
    banNameButton.classList.add("action-button");
    banNameButton.textContent = "Ban name";
    banNameButton.addEventListener("click", () =>
      handleModeration({
        username: entry.username,
        password,
        admin,
        type: "ban",
        target: "name",
      })
    );
    actionsElement.appendChild(kickNameButton);
    actionsElement.appendChild(kickStatusButton);
    actionsElement.appendChild(banNameButton);
  }
}

function handleModeration({ username, password, admin, type, target }) {
  const confirmBan = confirm(
    `Are you sure you want to ${type} ${username}'s ${target}? This action is irreversible.`
  );
  if (!confirmBan) {
    return;
  }

  loadingFeed.style.display = "block";
  fetch("https://maemoon-labloginbanuser.web.val.run", {
    method: "POST",
    body: JSON.stringify({ username, password, admin, type, target }),
  })
    .then((response) => response.json())
    .then((json) => {
      loadingFeed.style.display = "none";
      if (json.error) {
        alert(json.error);
      } else {
        pullUserStatuses();
      }
    });
}

function getHtmlFromMarkdown(markdown) {
  let html = "";
  let i = 0;

  let blockquote = markdown.startsWith('>')
  if (blockquote) html += "<blockquote>"

  if (markdown === "please add gifs") {
    return '<img class="nogif" src="gif.gif">';
  }

  markdown = markdown
    .replaceAll("<", "")
    .replaceAll(">", "")
    .replaceAll("&", "");

  let emphasisingAsterisk = false;
  let emphasisingUnderscore = false;
  let bolding = false;
  let linking = false;
  let linkTitling = false;
  let linkTitle = "";
  let linkPathing = false;
  let linkPath = "";
  let coding = false;

  while (i < markdown.length) {
    const character = markdown[i];
    const nextCharacter = markdown[i + 1];
    const nextTwoCharacters = markdown.slice(i, i + 2);

    if (coding) {
      if (character === "`") {
        coding = false;
        html += "</code>";
        i++;
        continue;
      }
      html += character;
      i++;
      continue;
    }

    if (character === "@") {
      let found = false;
      const snippet = markdown.slice(i + 1).split(/\s|\*|_|'|"|!|\.|,|\?/)[0];
      // first test out all the non-space names
      let result = "";
      let foundName = "";
      for (const name of nameSet) {
        if (snippet === name) {
          result = `<a onclick="window.targetyo()" href="#post-${name}" class="at-${name} name-${name} at">@${name}</a>`;
          // i += name.length + 1;
          foundName = name;
          found = true;
          break;
        }
      }

      // but we should also test out the space names
      for (const name of nameSet) {
        const greedySnippet = markdown.slice(i + 1);
        if (
          greedySnippet.startsWith(name + " ") ||
          greedySnippet === name ||
          greedySnippet.startsWith(name + "*") ||
          greedySnippet.startsWith(name + "_") ||
          greedySnippet.startsWith(name + "'") ||
          greedySnippet.startsWith(name + '"') ||
          greedySnippet.startsWith(name + "!") ||
          greedySnippet.startsWith(name + ".") ||
          greedySnippet.startsWith(name + ",") ||
          greedySnippet.startsWith(name + "?")
        ) {
          result = `<a onclick="window.targetyo()" href="#post-${name}" class="at-${name} name-${name} at">@${name}</a>`;
          // i += name.length + 1;
          found = true;
          foundName = name;
          break;
        }
      }
      if (found) {
        html += result;
        i += foundName.length + 1;
        continue;
      }
    }

    if (character === "`") {
      coding = true;
      html += "<code>";
      i++;
      continue;
    }

    if (character === "\\") {
      if (nextCharacter !== undefined) {
        html += nextCharacter;
      }
      i += 2;
      continue;
    }

    if (nextTwoCharacters === "**") {
      if (bolding) {
        html += "</strong>";
      } else {
        html += "<strong>";
      }
      bolding = !bolding;
      i += 2;
      continue;
    }

    if (character === "*") {
      if (emphasisingAsterisk) {
        html += "</em>";
      } else {
        html += "<em>";
      }
      emphasisingAsterisk = !emphasisingAsterisk;
      i++;
      continue;
    }

    if (character === "_") {
      if (emphasisingUnderscore) {
        html += "</em>";
      } else {
        html += "<em>";
      }
      emphasisingUnderscore = !emphasisingUnderscore;
      i++;
      continue;
    }

    html += character;
    i++;
  }

  // cleanup
  if (bolding) {
    html += "</strong>";
  }
  if (emphasisingAsterisk) {
    html += "</em>";
  }
  if (emphasisingUnderscore) {
    html += "</em>";
  }
  if (coding) {
    html += "</code>";
  }
  if (blockquote) {
    html += "</blockquote>";
  }

  return html;
}

const localStatuses = localStorage.getItem("labLoginUserStatuses") ?? "[]";
let parsedLocalStatuses = [];
try {
  parsedLocalStatuses = JSON.parse(localStatuses);
} catch (e) {
  parsedLocalStatuses = [];
}
nameSet = new Set(parsedLocalStatuses.map((v) => v.username));
renderUserStatuses(parsedLocalStatuses);

const urlQuery = new URLSearchParams(window.location.search);
if (urlQuery.has("logout")) {
  // remove the query from the url
  window.history.replaceState({}, "", "/login/");
} else if (urlQuery.has("delete")) {
  // remove the query from the url
  window.history.replaceState({}, "", "/login/");
  passwordInput.value = "";
  usernameInput.value = "";
} else if (
  usernameInput.value &&
  passwordInput.value &&
  localStorage.getItem("labLoginAutoLogin") !== "false"
) {
  // loadingFeed.style.display = "block";
  refreshSign.textContent = "Logging in...";
  handleSubmit();
} else {
  pullUserStatuses().then(() => {
    loadingFeed.style.display = "none";
  });
}
// loadingFeed.style.display = "none";

const header = document.querySelector("header");
// if (usernameInput.value === "TodePond") {
// const spannn = document.createElement("span");
// spannn.innerHTML = `
//         <span style="float: right">
//           <label for="admin-toggle">Admin controls</label>
//           <input type="checkbox" id="admin-toggle" name="admin-toggle" />
//         </span>
//       `;
// header.appendChild(spannn);
// const adminToggleEnabled = localStorage.getItem("labLoginAdmin") === "true";
// const adminToggle = document.querySelector("#admin-toggle");
// adminToggle.checked = adminToggleEnabled;
// adminToggle.addEventListener("change", () => {
//   localStorage.setItem("labLoginAdmin", adminToggle.checked);
//   const actionses = document.querySelectorAll(".actions");
//   actionses.forEach(
//     (v) => (v.style.display = adminToggle.checked ? "inline-block" : "none")
//   );
// });
// }

function addUserActions({
  userActionsElement,
  username,
  loggedInUsername,
  loggedInPassword,
}) {
  const replyButton = document.createElement("button");
  replyButton.textContent = "Reply";
  replyButton.classList.add("secondary");
  replyButton.classList.add("action-button");
  replyButton.addEventListener("click", () => {
    const statusInput = document.querySelector("#status");
    statusInput.value = `@${username} `;
    statusInput.focus();
  });
  userActionsElement.appendChild(replyButton);

  const likeButton = document.createElement("button");
  likeButton.textContent = "Like";
  likeButton.classList.add("primary");
  likeButton.classList.add("action-button");
  likeButton.addEventListener("click", () =>
    handleLike({ username, loggedInUsername, loggedInPassword })
  );
  userActionsElement.appendChild(likeButton);
}

async function handleLike({ username, loggedInUsername, loggedInPassword }) {
  alert("glad you like it babe");
}

addEventListener("pointerdown", (event) => {
  // clear anchor from url, eg: #post-TodePond
  // but don't navigate or anything.
  window.history.replaceState({}, "", "/login/");

  document.body.classList.add("untarget");
});

window.targetyo = () => {
  document.body.classList.remove("untarget");
};