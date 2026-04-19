# Backend Scaffold (PHP)

This directory is a modular + layered backend scaffold:

- `app/Modules/*`: domain modules (controller, service, repository, model, routes)
- `app/Core/*`: cross-cutting infrastructure (db, cache, queue, logging)
- `app/Middleware`: request pipeline middleware
- `config/*`: environment-aware configuration
- `database/*`: migrations and seeders
- `storage/*`: logs and cache files

Recommended next step: initialize Composer autoloading and choose a lightweight HTTP kernel/router.
