$(document).ready(function () {

  var DEBUG = true;

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
    },
    destroy: function (id) {
      return $.ajax('/notes/' + id, {
        type: 'DELETE',
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
  }

  function addNotes(notes) {
    for (var i in notes) {
      addNote(notes[i]);
    }
  }

  function newNote(e) {
    var createNote = Notes.create();
    createNote.done(addNote);
    createNote.fail(xhrFail);
  }

  function moveNote(e) {
    var noteElem = $(this);
    var $removeArea = $('#remove-area');
    var remAreaPos = $removeArea.position();
    var doc = $(document);
    var offset = [parseInt(noteElem.css('left')), parseInt(noteElem.css('top'))];
    var startPos = [e.pageX, e.pageY];
    var bg = noteElem.css('background');
    doc.on('mousemove', function (e) {
      noteElem.css({
        'left': (e.pageX - startPos[0] + offset[0]),
        'top': (e.pageY - startPos[1] + offset[1])
      });

      var width = noteElem.width();
      var right = parseInt(noteElem.css('left')) + width;

      if (remAreaPos.left - right <= 0) {
        noteElem.css({ 'background': 'red' });
        noteElem.data('remove', true);
      } else if (noteElem.data('remove') && remAreaPos.left - right > 0) {
        console.log('hiihaaa');
        noteElem.css({ 'background': bg });
        noteElem.data('remove', false);
      }
    });
    doc.one('mouseup', function () {
      doc.off('mousemove');
      noteElem.data('remove') ? removeNote(noteElem) : updateNote(noteElem);
    });
  }

  function buildNote(elem) {
    var note = {
      id: elem.data('noteid'),
      text: elem.val(),
      position: [
        parseInt(elem.css('left')),
      parseInt(elem.css('top'))]
    };
    return note;
  }

  function editNote() {
    var IDLE = 42;
    var TYPE = 69;
    var TRESHOLD = 700;

    var mode = IDLE;
    var startTime = 0;

    return function (e) {
      var ts = Date.now();
      var elem = $(this);

      if (mode === IDLE) {
        mode = TYPE;
        startTime = ts;
        console.log('started...');
      }

      // Typing -- keep goin'
      if ((mode == TYPE) && (ts - startTime) < TRESHOLD) {
        console.log('typing...');
        startTime = ts;
      }

      // Timed action
      setTimeout(function () {
        var delta = Date.now() - startTime;
        if (delta > TRESHOLD) {
          mode = IDLE;
          updateNote(elem);
        }
      }, TRESHOLD);
    };
  }

  function updateNote(elem) {
    var note = buildNote(elem);
    Notes.update(note.id, note).fail(xhrFail);
  }

  function removeNote(elem) {
    Notes.destroy(elem.data('noteid'))
      .done(elem.remove())
      .fail(xhrFail);
  }

  // Listeners
  controls.add.on('click', newNote);
  $('#notes').on('mousedown', '.note', moveNote);
  $('#notes').on('keypress', '.note', editNote());

});

