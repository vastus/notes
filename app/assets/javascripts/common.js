var DEBUG = true;

function xhrFail(xhr, textStatus, errorMsg) {
  if (debug) {
    alert(
      xhr.status + " - " + xhr.statusText + "\n\n" +
      xhr.responseText
    );
  }
}

function debug(msg, obi) {
  return DEBUG ? console.log(msg, obi) : null;
}

function template(obi, selector) {
  var src = $(selector).html();
  var tmpl = Handlebars.compile(src);
  return tmpl(obi);
}

