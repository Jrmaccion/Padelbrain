// Custom Babel plugin to replace import.meta with safe alternatives
module.exports = function ({ types: t }) {
  return {
    name: 'replace-import-meta',
    visitor: {
      MetaProperty(path) {
        // Replace import.meta.env with process.env
        if (
          path.node.meta.name === 'import' &&
          path.node.property.name === 'meta'
        ) {
          const parent = path.parentPath;

          // Handle import.meta.env.MODE or import.meta.env
          if (parent.isMemberExpression() && parent.node.property.name === 'env') {
            const envParent = parent.parentPath;

            if (envParent.isMemberExpression() && envParent.node.property.name === 'MODE') {
              // Replace import.meta.env.MODE with process.env.NODE_ENV
              envParent.replaceWith(
                t.memberExpression(
                  t.memberExpression(
                    t.identifier('process'),
                    t.identifier('env')
                  ),
                  t.identifier('NODE_ENV')
                )
              );
            } else {
              // Replace import.meta.env with process.env
              parent.replaceWith(
                t.memberExpression(
                  t.identifier('process'),
                  t.identifier('env')
                )
              );
            }
          } else {
            // Replace plain import.meta with an empty object
            path.replaceWith(t.objectExpression([]));
          }
        }
      },
    },
  };
};
