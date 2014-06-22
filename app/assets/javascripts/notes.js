$(document).ready(function () {

    var DEBUG = true;

    // Setup
    Handlebars.registerHelper('x', function getPosX(note) {
        return note[0]
    });

    Handlebars.registerHelper('y', function getPosY(note) {
        return note[1]
    });

    // Note
    var Notes = {
        defaults: {
            text: null,
            position: [150, 150]
        },
        all: function () {
            return $.ajax('/notes.json', {
                type: 'GET',
            });
        },
        create: function (data) {
            attrs = $.extend({}, this.defaults, data);
            return $.ajax('/notes.json', {
                type: 'POST',
                data: { note: attrs },
                dataType: 'json'
            });
        },
        update: function (id, noteAttrs) {
                    console.log(noteAttrs);
            return $.ajax('/notes/' + id, {
                type: 'PATCH',
                data: { note: noteAttrs },
                dataType: 'json'
            });
        }
    };

    // Init
    var allNotes = Notes.all();
    allNotes.done(addNotes);
    allNotes.fail(xhrFail);

    // Elems
    var container = $('#notes');
    var noteElems = $('.note');
    var controls = {
        add: $('#add'),
        remove: $('#remove')
    };

    function addNote(note) {
        var html = template(note, '#note-tmpl');
        container.append(html);
        console.log($(html));
        debug("Note added.", note);
    }

    function addNotes(notes) {
        for (var i in notes) {
            addNote(notes[i]);
        }
    }

    function newNote(e) {
        var createNote = Notes.create();
        createNote.done(addNote);
        createNote.fail(xhFail);
    }

    function editNote(e) {
        $(this).removeAttr('disabled');
        console.log(this);
    }

    function moveNote(e) {
        var noteElem = $(this);
        var doc = $(document);
        var offset = [parseInt(noteElem.css('left')), parseInt(noteElem.css('top'))];
        var startPos = [e.pageX, e.pageY];
        doc.on('mousemove', function (e) {
            noteElem.css({
                'left': (e.pageX - startPos[0] + offset[0]),
                'top': (e.pageY - startPos[1] + offset[1])
            });
        });
        doc.one('mouseup', function () {
            doc.off('mousemove');
            updateNote(noteElem);
        });
    }

    function updateNote(elem) {
        console.log(elem.value);
        var note = {
            text: elem.text(),
            position: [parseInt(elem.css('left')), parseInt(elem.css('top'))]
        }
        var id = elem.data('noteid');
        var update = Notes.update(id, note);
        update.done(function (data) {
            console.log("Note updated.", data);
        });
        update.fail(xhrFail);
    }

    // Helpers
    function xhrFail(xhr, textStatus, errorMsg) {
        if (debug) {
            alert(
                xhr.status + " - " + xhr.statusText + "\n\n" +
                xhr.responseText
            );
        }
    }

    function debug(msg, obi) {
        DEBUG ? console.log(msg, obi) : null;
    }

    function template(obi, selector) {
        var src = $(selector).html();
        var tmpl = Handlebars.compile(src);
        return tmpl(obi);
    }

    // Listeners
    controls.add.on('click', newNote);
    $('#notes').on('mousedown', '.note', moveNote);
});

