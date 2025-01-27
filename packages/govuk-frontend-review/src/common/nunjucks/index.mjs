import { join } from 'path'

import { paths } from '@govuk-frontend/config'
import { nunjucksEnv } from '@govuk-frontend/lib/components'

import * as filters from './filters/index.mjs'
import * as globals from './globals/index.mjs'

/**
 * Initialise renderer with Nunjucks environment
 *
 * @param {import('express').Application} app - Express.js review app
 * @returns {import('nunjucks').Environment} Nunjucks Environment
 */
export function renderer(app) {
  const flags = /** @type {import('../../app.mjs').FeatureFlags} */ (
    app.get('flags')
  )

  const env = nunjucksEnv(
    [join(paths.app, 'src/views')],
    {
      dev: true, // log stack traces
      express: app, // the Express.js review app that nunjucks should install to
      noCache: !flags.isDeployedToHeroku, // use cache when deployed only
      watch: flags.isDevelopment // reload templates in development only
    },
    {
      moduleRoot: paths.app
    }
  )

  // Set view engine
  app.set('view engine', 'njk')

  // Share feature flags with middleware
  env.addGlobal('flags', flags)

  // Custom filters
  for (const key in filters) {
    env.addFilter(key, filters[key])
  }

  // Custom globals
  for (const key in globals) {
    env.addGlobal(key, globals[key])
  }

  return env
}

export { filters }
export { globals }
