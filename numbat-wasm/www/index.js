import { setup_panic_hook, Numbat } from "numbat-wasm";

async function fetch_exchange_rates() {
  try {
      const response = await fetch("https://numbat.dev/ecb-exchange-rates.php");

      if (!response.ok) {
          return;
      }

      const xml_content = await response.text();
      numbat.set_exchange_rates(xml_content);
  } catch (error) {
      return;
  }
}

setup_panic_hook();

var numbat = Numbat.new();

fetch_exchange_rates();

// Load KeyboardEvent polyfill for old browsers
keyboardeventKeyPolyfill.polyfill();
  
function updateUrlQuery(query) {
  let url = new URL(window.location);
  if (query == null) {
    url.searchParams.delete('q');
  } else {
    url.searchParams.set('q', query);
  }

  history.replaceState(null, null, url);
}

function interpret(input) {
  // Skip empty lines or comments
  var input_trimmed = input.trim();
  if (input_trimmed === "" || (input_trimmed[0] === "#" && input_trimmed.indexOf("\n") == -1)) {
    return;
  }

  if (input_trimmed == "clear") {
    this.clear();
    var output = "";
  } else if (input_trimmed == "reset") {
    numbat = Numbat.new();
    this.clear();
  } else if (input_trimmed == "list" || input_trimmed == "ll" || input_trimmed == "ls") {
    output = numbat.print_environment();
  } else {
    var output = numbat.interpret(input);
    updateUrlQuery(input);
  }

  return output;
}

$(document).ready(function() {
  var term = $('#terminal').terminal(interpret, {
    greetings: false,
    name: "terminal",
    height: 550,
    prompt: "[[;;;prompt]>>> ]",
    checkArity: false,
    historySize: 200,
    historyFilter(line) {
      return line.trim() !== "";
    },
    completion(inp, cb) {
      cb(numbat.get_completions_for(inp));
    },
    onClear() {
      updateUrlQuery(null);
    }
  });

  // evaluate expression in query string if supplied (via opensearch)
  if (location.search) {
    var queryParams = new URLSearchParams(location.search);
    if (queryParams.has("q")) {
      term.exec(queryParams.get("q"));
    }
  }
});
