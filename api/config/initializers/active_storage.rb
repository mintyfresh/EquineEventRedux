# frozen_string_literal: true

ActiveSupport.on_load(:active_storage_attachment) { extend(WhereAny) }
ActiveSupport.on_load(:active_storage_blob) { extend(WhereAny) }
