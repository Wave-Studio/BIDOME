# @studios/lang

A simple and extensible string localization library with support for variables

## Loaders

We support the following loaders out of the box:

- YAML
- JSON[C]

## Plugins

If you'd like a loader or variable formatter that isn't already supported you
can create/use an external one thanks to our Plugin API. We offer 2 types of
plugins: `Loader Plugins`, and `Formatter Plugins`. Loader plugins allow you to
import files for your language
