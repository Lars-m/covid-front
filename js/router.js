//Your index.html must include an empty div with id= "content"
const content = document.getElementById('content');

//The top-level of your navigation structure must include an id="topnav"
const topnav = document.getElementById("topnav");
top.onclick = onNavClick

const loadTemplate = async (page) => {
  const resHtml = await fetch(page).then(r => {
    if (!r.ok) {
      return console.error(`Failed to load the page: ${page}`)
    }
    return r.text()
  });
  const body = document.getElementsByTagName("BODY")[0];
  const div = document.createElement("div");
  div.innerHTML = resHtml;
  body.appendChild(div)
};

async function initRoutes() {
  //This is how you set up your routes. Name of fields ('#/') MUST match the url given inside your topnav
  routes = {
    '#/': {
      templateFile: "templates/homeTemplate.html",
      templateId: "home-template",
    },
    '#/sogne': {
      templateFile: "templates/parishTemplate.html",
      templateId: "parish-content",
      afterRender: [setUpParishHandlers, fetchParishesAndMakeRows]
    },
    '#/kommuner': {
      templateFile: "templates/municipalityTemplate.html",
      templateId: "municipality-content",
      afterRender: [fetchMunicipalityAndMakeRows]
    },
    '#/404': {
      templateFile: "templates/404.html",
      templateId: "error-template"
    },
    '#/api-doc': {
      templateFile: "templates/apiDoc.html",
      templateId: "api-doc-template",
      afterRender: [setSwaggerLink]
    }
  };

  for (const field in routes) {
    const route = routes[field]
    if (!route.templateFile) {
      return console.error(`No template available for the route [${field}]`)
    }
    await loadTemplate(route.templateFile)
    const template = document.getElementById(route.templateId);
    if (template == null) {
      return console.error(`Could not find a template with the id [${route.templateId}]`)
    }
    route.template = template
  }

  //Set initial page
  const pathname = window.location.hash
  setTemplate(pathname)
}

document.addEventListener("DOMContentLoaded", () => initRoutes());

function onNavClick(evt) {
  const target = evt.target;
  if (target.nodeName !== "A") { //If not an Achor-tag go away
    return
  }
  const pathname = target.getAttribute("href")

  window.history.pushState({}, pathname, window.location.origin + pathname);
  setTemplate(pathname)
};

window.onpopstate = () => {
  const pathname = window.location.hash
  setTemplate(pathname)
};

function setTemplate(path) {
  //const route = routes[pathname] ? routes[pathname] : routes["#/"] // Add a 404 template if you prefer
  let pathname = path;
  if (path == "") {
    pathname = "#/"
    window.history.pushState({}, pathname, window.location.origin + pathname);
  }
  const route = routes[pathname] || routes["#/404"] // Add a 404 template if you prefer
  const clone = route.template.content.cloneNode(true)
  content.innerHTML = ""
  content.appendChild(clone)
  if (route.afterRender) {
    route.afterRender.forEach((method) => method())
  }

  //Set the active Selection
  const links = topnav.querySelectorAll("a");
  links.forEach(child => {
    child.classList.remove("active")
    if (child.getAttribute("href") === pathname) {
      child.classList.add("active")
    }
  })

}