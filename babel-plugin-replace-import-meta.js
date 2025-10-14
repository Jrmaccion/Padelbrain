/**
 * Plugin Babel local: reemplaza usos de `import.meta` para que no rompan en Metro/Web.
 * - `import.meta.env.MODE`  → `process.env.NODE_ENV`
 * - `import.meta.env`       → `process.env`
 * - `import.meta`           → `{}`
 */
module.exports = function ({ types: t }) {
  return {
    name: 'replace-import-meta',
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name !== 'import' || path.node.property.name !== 'meta') {
          return;
        }

        const parent = path.parentPath;

        // import.meta.env.*
        if (parent.isMemberExpression() && parent.node.property && parent.node.property.name === 'env') {
          const envParent = parent.parentPath;

          // import.meta.env.MODE → process.env.NODE_ENV
          if (
            envParent &&
            envParent.isMemberExpression() &&
            envParent.node.property &&
            envParent.node.property.name === 'MODE'
          ) {
            envParent.replaceWith(
              t.memberExpression(
                t.memberExpression(t.identifier('process'), t.identifier('env')),
                t.identifier('NODE_ENV')
              )
            );
            return;
          }

          // import.meta.env → process.env
          parent.replaceWith(
            t.memberExpression(t.identifier('process'), t.identifier('env'))
          );
          return;
        }

        // import.meta → {}
        path.replaceWith(t.objectExpression([]));
      },
    },
  };
};
