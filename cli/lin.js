#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    nightmare = require('nightmare');

program
    .version('0.1.0')
    .command('search [profile]', 'search for a linkedin profile and get available data');

program.parse(process.argv);
