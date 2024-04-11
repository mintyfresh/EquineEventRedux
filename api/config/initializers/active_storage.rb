# frozen_string_literal: true

# Allow the GraphQL dataloaders (e.g. `Source::Record`) to batch-load ActiveStorage objects
ActiveSupport.on_load(:active_storage_attachment) { extend(WhereAny) }
ActiveSupport.on_load(:active_storage_blob) { extend(WhereAny) }
