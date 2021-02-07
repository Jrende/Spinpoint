import { register } from 'svelte-i18n';
import { addMessages, locale, locales, init, getLocaleFromNavigator } from 'svelte-i18n'
import queryString from "query-string";


import en from '../public/messages/en.json';

addMessages('en', en);

register('sv', () => {
  return window.fetch('/messages/sv.json')
    .then(data => data.json())
    .catch(error => console.log('i18n fetch error', error))
});


init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});

let availableLocales;
locales.subscribe(l => {
  console.log("set locale");
  availableLocales = l
  let desiredLocale = navigator.language;
  let parsed = queryString.parse(window.location.search);
  if(parsed.lang !== undefined) {
    locale.set(parsed.lang);
  } else {
    if(availableLocales.includes(desiredLocale)) {
      locale.set(desiredLocale);
    } else {
      locale.set('en');
    }
  }
});
