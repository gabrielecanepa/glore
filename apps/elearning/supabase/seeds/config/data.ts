import app from 'config/app.json'
import { seeder } from 'config/development.json'

export const { countries, course, organization, user } = seeder
export const languages = [...new Set(countries.flatMap(country => country.languages))]
export const locales = Object.keys(app.locales)
