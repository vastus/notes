class NotesController < ApplicationController
  def index
    @notes = Note.all
    respond_to do |fmt|
      fmt.html
      fmt.json { render(json: @notes) }
    end
  end

  def create
    note = Note.new(note_params)
    if note.save
      respond_to do |fmt|
        fmt.json { render(json: note) }
      end
    end
  end

  def update
    note = Note.find(params[:id])
    respond_to do |fmt|
      if note.update_attributes(note_params)
        fmt.json { head(:no_content) }
      else
        fmt.json { render(json: note.errors, status: :unprocessable_entity) }
      end
    end
  end

private

  def note_params
    params.require(:note).permit(:text, position: [])
  end

end

