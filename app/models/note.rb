class Note
  include MongoMapper::Document

  key :text, String
  key :position, Array
end

